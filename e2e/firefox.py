"""Firefox for level 3 checks (T-111) and soaks (T-829): WebDriver BiDi over the browser's own remote port, no driver
binary.

Firefox runs on a new temporary profile (user.js: no first-run pages, telemetry or updates, media muted) with
--remote-debugging-port: on Windows on a hidden desktop (lib.HiddenDesktop), elsewhere headless. The executable is
PURPLE_FIREFOX, else the default install of the platform (on Linux the Mozilla build unpacked in ~/firefox/<version>/).
The session installs a Firefox build as a temporary add-on (webExtension.install, as about:debugging does: no signature
needed), adds e2e/recorder.js as a preload script (script.addPreloadScript: before any page script of every document,
as Page.addScriptToEvaluateOnNewDocument does on Edge) and reads page state with script.evaluate. A run's settings reach
the page through SETTINGS_PRELOAD. `tab` has the two
methods lib.read and lib.wait_for use (evaluate, sleep), so e2e/soak.py drives Firefox with the same page scripts.
Nothing here touches the dedicated Edge profiles.
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

FIREFOX = os.environ.get('PURPLE_FIREFOX') or (r'C:\Program Files\Mozilla Firefox\firefox.exe' if os.name == 'nt' else
                                                os.path.expanduser('~/firefox/157.0.1/firefox/firefox'))
BUILD = os.path.join(lib.REPO, 'dist', 'purple-adblock-firefox')
PROCESS_NAMES = ('firefox.exe', 'firefox', 'firefox-bin')
# Settings for a run: BiDi does not open moz-extension:// pages, so the build's popup cannot store them. The content
# script sends the stored settings to the page as window.postMessage({type: "setSettings", value}); this preload adds
# the run's values to that message in a capture listener, which runs before the page's own listener.
SETTINGS_PRELOAD = """() => {
  const forced = %s;
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'setSettings' && event.data.value) Object.assign(event.data.value, forced);
  }, true);
}"""
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


class Tab:
    """What lib.read and lib.wait_for need from a tab, on the session's browsing context."""

    def __init__(self, browser):
        self.browser = browser

    async def evaluate(self, expression, await_promise=True, return_by_value=True):
        result = await self.browser.send('script.evaluate', {'expression': expression, 'target': {'context': self.browser.context},
                                                              'awaitPromise': await_promise, 'resultOwnership': 'none'})
        if result.get('type') != 'success':
            return result
        value = result['result']
        return value.get('value') if value.get('type') == 'string' else value

    async def sleep(self, seconds):
        await asyncio.sleep(seconds)


class Firefox:
    def __init__(self, process_id, profile, desktop, connection):
        self.pid, self.profile, self.desktop, self.ws = process_id, profile, desktop, connection
        self.ids = itertools.count(1)
        self.context = None
        self.extension = None
        self.tab = Tab(self)
        self.console = []  # the page's console warnings and errors and its uncaught errors (log.entryAdded), until taken
        self.pending = {}  # command id -> future of its answer
        # every message is read as it comes, also between commands: unread events would stop the connection from
        # reading the browser's keepalive answers (2026-11-07: closed after a 60 s wait with console events queued)
        self.reader = asyncio.ensure_future(self._read())

    @classmethod
    async def launch(cls, build=BUILD, visible=False, settings=None, env=None, audio=False, preloads=()):
        """`settings`: values the page gets as if they were stored (SETTINGS_PRELOAD), e.g. {'debug': True}. `env`:
        extra environment variables for the browser, e.g. MOZ_LOG and MOZ_LOG_FILE (outside Windows). `audio`: sound on
        (muted otherwise). `preloads`: more function declarations run before any page script, ahead of the recorder."""
        profile = tempfile.mkdtemp(prefix='purple-e2e-firefox-')
        with open(os.path.join(profile, 'user.js'), 'w', encoding='utf-8') as f:
            for key, value in PREFS.items():
                if audio and key == 'media.volume_scale':
                    continue
                f.write(f'user_pref({json.dumps(key)}, {json.dumps(value)});\n')
        port = lib._free_port()
        command = [FIREFOX, '-no-remote', '-profile', profile, '--remote-debugging-port', str(port), 'about:blank']
        desktop = None
        if os.name != 'nt':
            command += [] if visible else ['--headless']
            pid = subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env={**os.environ, **(env or {})}).pid
        elif visible:
            pid = subprocess.Popen(subprocess.list2cmdline(command)).pid
        else:
            desktop = lib.HiddenDesktop()
            pid = desktop.spawn(subprocess.list2cmdline(command))
        lib._wait_port(port, lambda: psutil.pid_exists(pid))
        connection = await websockets.connect(f'ws://127.0.0.1:{port}/session', max_size=None)
        self = cls(pid, profile, desktop, connection)
        await self.send('session.new', {'capabilities': {}})
        if build:
            self.extension = (await self.send('webExtension.install', {'extensionData': {'type': 'path', 'path': os.path.abspath(build)}}))['extension']
        tree = await self.send('browsingContext.getTree', {})
        self.context = tree['contexts'][0]['context']
        if settings:
            await self.send('script.addPreloadScript', {'functionDeclaration': SETTINGS_PRELOAD % json.dumps(settings)})
        for source in preloads:
            await self.send('script.addPreloadScript', {'functionDeclaration': source})
        await self.send('script.addPreloadScript', {'functionDeclaration': '() => {' + lib.RECORDER + '\n}'})
        await self.send('session.subscribe', {'events': ['log.entryAdded']})
        return self

    async def _read(self):
        """Answers go to their command; events are dropped, but for the console's warnings and errors (`console`)."""
        try:
            async for raw in self.ws:
                message = json.loads(raw)
                if message.get('method') == 'log.entryAdded':
                    self._console(message['params'])
                    continue
                future = self.pending.pop(message.get('id'), None)
                if future and not future.done():
                    future.set_result(message)
        except Exception as err:
            closed = err
        else:
            closed = ConnectionError('BiDi connection closed')
        for future in self.pending.values():
            if not future.done():
                future.set_exception(closed)
        self.pending.clear()

    async def send(self, method, params):
        """One BiDi command and its result."""
        if self.reader.done():
            raise ConnectionError('BiDi connection closed')
        command_id = next(self.ids)
        future = asyncio.get_running_loop().create_future()
        self.pending[command_id] = future
        await self.ws.send(json.dumps({'id': command_id, 'method': method, 'params': params}))
        message = await future
        if message.get('type') == 'error':
            raise RuntimeError(f"{method}: {message.get('error')}: {message.get('message')}")
        return message.get('result')

    def _console(self, entry):
        level = entry.get('level')
        if level not in ('warn', 'error') or len(self.console) >= 5000:
            return
        frames = ((entry.get('stackTrace') or {}).get('callFrames') or [])[:1]
        self.console.append({'wall': entry.get('timestamp'), 'level': level, 'type': entry.get('type'),
                             'realm': (entry.get('source') or {}).get('realm'), 'text': str(entry.get('text'))[:500],
                             'at': f"{frames[0].get('url', '')[-80:]}:{frames[0].get('lineNumber')}" if frames else None})

    def take_console(self):
        entries, self.console = self.console, []
        return entries

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
        self.reader.cancel()
        procs = [p for p in psutil.process_iter(['name', 'cmdline'])
                 if (p.info['name'] or '').lower() in PROCESS_NAMES and any(self.profile in arg for arg in p.info['cmdline'] or [])]
        await asyncio.to_thread(psutil.wait_procs, procs, 10)
        for p in procs:
            try:
                p.kill()
            except psutil.Error:
                pass
        if self.desktop:
            self.desktop.close()
        shutil.rmtree(self.profile, ignore_errors=True)
