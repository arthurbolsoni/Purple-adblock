"""Firefox for level 3 checks (T-111): WebDriver BiDi over the browser's own remote port, no driver binary.

Firefox runs on a new temporary profile (user.js: no first-run pages, telemetry or updates, media muted) on a hidden
desktop (lib.HiddenDesktop), with --remote-debugging-port. The session installs a Firefox build as a temporary add-on
(webExtension.install, as about:debugging does: no signature needed), adds e2e/recorder.js as a preload script
(script.addPreloadScript: before any page script of every document, as Page.addScriptToEvaluateOnNewDocument does on
Edge) and reads page state with script.evaluate. Nothing here touches the dedicated Edge profiles.
"""
import asyncio
import itertools
import json
import os
import shutil
import subprocess
import tempfile

import psutil
import websockets

import lib

FIREFOX = r'C:\Program Files\Mozilla Firefox\firefox.exe'
BUILD = os.path.join(lib.REPO, 'dist', 'purple-adblock-firefox')
PREFS = {
    'browser.shell.checkDefaultBrowser': False,
    'browser.startup.homepage_override.mstone': 'ignore',
    'startup.homepage_welcome_url': 'about:blank',
    'startup.homepage_welcome_url.additional': '',
    'browser.aboutwelcome.enabled': False,
    'datareporting.policy.dataSubmissionEnabled': False,
    'datareporting.healthreport.uploadEnabled': False,
    'toolkit.telemetry.reportingpolicy.firstRun': False,
    'app.update.disabledForTesting': True,
    'browser.tabs.warnOnClose': False,
    'media.volume_scale': '0.0',  # muted, as the Edge runs
    'media.autoplay.default': 0,
}


class Firefox:
    def __init__(self, process_id, profile, desktop, connection):
        self.pid, self.profile, self.desktop, self.ws = process_id, profile, desktop, connection
        self.ids = itertools.count(1)
        self.context = None
        self.extension = None

    @classmethod
    async def launch(cls, build=BUILD, visible=False):
        profile = tempfile.mkdtemp(prefix='purple-e2e-firefox-')
        with open(os.path.join(profile, 'user.js'), 'w', encoding='utf-8') as f:
            for key, value in PREFS.items():
                f.write(f'user_pref({json.dumps(key)}, {json.dumps(value)});\n')
        port = lib._free_port()
        cmdline = subprocess.list2cmdline([FIREFOX, '-no-remote', '-profile', profile, '--remote-debugging-port', str(port), 'about:blank'])
        desktop = None
        if visible:
            pid = subprocess.Popen(cmdline).pid
        else:
            desktop = lib.HiddenDesktop()
            pid = desktop.spawn(cmdline)
        lib._wait_port(port, lambda: psutil.pid_exists(pid))
        connection = await websockets.connect(f'ws://127.0.0.1:{port}/session', max_size=None)
        self = cls(pid, profile, desktop, connection)
        await self.send('session.new', {'capabilities': {}})
        if build:
            self.extension = (await self.send('webExtension.install', {'extensionData': {'type': 'path', 'path': os.path.abspath(build)}}))['extension']
        tree = await self.send('browsingContext.getTree', {})
        self.context = tree['contexts'][0]['context']
        await self.send('script.addPreloadScript', {'functionDeclaration': '() => {' + lib.RECORDER + '\n}'})
        return self

    async def send(self, method, params):
        """One BiDi command; events in between are dropped."""
        command_id = next(self.ids)
        await self.ws.send(json.dumps({'id': command_id, 'method': method, 'params': params}))
        while True:
            message = json.loads(await self.ws.recv())
            if message.get('id') != command_id:
                continue
            if message.get('type') == 'error':
                raise RuntimeError(f"{method}: {message.get('error')}: {message.get('message')}")
            return message.get('result')

    async def navigate(self, url, wait='none'):
        await self.send('browsingContext.navigate', {'context': self.context, 'url': url, 'wait': wait})

    async def read(self, expression):
        """The value of a JSON-serializable expression in the page (None on a page error)."""
        result = await self.send('script.evaluate', {'expression': f'JSON.stringify({expression})', 'target': {'context': self.context},
                                                     'awaitPromise': True, 'resultOwnership': 'none'})
        if result.get('type') != 'success' or result['result'].get('type') != 'string':
            return None
        return json.loads(result['result']['value'])

    async def close(self):
        try:
            await asyncio.wait_for(self.send('browser.close', {}), 5)
        except Exception:
            pass  # the connection drops while the browser closes
        try:
            await self.ws.close()
        except Exception:
            pass
        procs = [p for p in psutil.process_iter(['name', 'cmdline'])
                 if (p.info['name'] or '').lower() == 'firefox.exe' and any(self.profile in arg for arg in p.info['cmdline'] or [])]
        await asyncio.to_thread(psutil.wait_procs, procs, 10)
        for p in procs:
            try:
                p.kill()
            except psutil.Error:
                pass
        if self.desktop:
            self.desktop.close()
        shutil.rmtree(self.profile, ignore_errors=True)
