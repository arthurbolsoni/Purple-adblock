"""Edge + nodriver for the level 2 and 3 tests (docs/tests.md, "Browser setup").

- Profile: ~/nodriver/profile-edge-purple, used only by these tests.
- Modes: `extension` loads the unpacked Chromium build and nothing else; `userscript` runs with every
  extension off and injects the built userscript at document start in the main world; `record` runs
  with every extension off and without Purple.
- On Windows, Edge starts on a separate hidden Win32 desktop (not headless): no window on the user's
  screen, no physical input. nodriver drives it through CDP, and pages get focus emulation.
- Page state is read as JSON. No screenshots.
"""
import asyncio
import atexit
import ctypes
import json
import os
import socket
import subprocess
import time
import uuid

import nodriver as uc
import psutil

import twitch_selectors as sel

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
PROFILE = os.path.expanduser('~/nodriver/profile-edge-purple')
EXTENSION_BUILD = os.path.join(REPO, 'dist', 'purple-adblock-purple-adblock-chromium')
USERSCRIPT_BUILD = os.path.join(REPO, 'dist', 'purpleadblocker.user.js')
MODES = ('extension', 'userscript', 'record')
WARM_UP_MARKER = 'purple-e2e-warm-up'  # in the profile directory, written after the warm-up launch

# `bun run e2e:build` runs the same commands
BUILD_COMMANDS = [
    ['bun', 'serviceWorker/build.ts'],
    ['bun', 'cli/build.ts', 'dev'],
    ['bun', 'platform/tampermonkey/build.js', 'dist/purpleadblocker.user.js'],
]

# Userscript header: @match *://*.twitch.tv/*
USERSCRIPT_MATCH = r'^https?:\/\/([^/]+\.)?twitch\.tv\/'

with open(os.path.join(os.path.dirname(__file__), 'recorder.js'), encoding='utf-8') as f:
    RECORDER = f.read()


def browser_args(mode, extension=EXTENSION_BUILD):
    """Edge flags per mode. Every mode: no component extensions with background pages, no sync (a
    fresh profile signs in to the Windows Microsoft account on its own and syncs the account's
    extensions and history)."""
    if mode not in MODES:
        raise ValueError(f'unknown mode {mode!r}; expected one of {MODES}')
    args = ['--lang=en-US', '--accept-lang=en-US', '--window-size=1400,950',
            '--disable-component-extensions-with-background-pages', '--disable-sync']
    if mode == 'extension':
        args += [f'--load-extension={extension}', f'--disable-extensions-except={extension}']
    else:
        args.append('--disable-extensions')
    return args


def userscript_source(path=USERSCRIPT_BUILD):
    """The built userscript, run only on the pages its @match covers. `Page.addScriptToEvaluateOnNewDocument`
    runs it in the main world before any page script, like Tampermonkey with `@run-at document-start`
    and `@grant none`."""
    with open(path, encoding='utf-8') as f:
        script = f.read()
    return f'if (/{USERSCRIPT_MATCH}/.test(location.href)) (function () {{\n{script}\n}})();'


# --- processes ----------------------------------------------------------------------------

def profile_processes(profile=PROFILE):
    """msedge.exe processes whose command line contains the profile directory name."""
    marker = os.path.basename(os.path.normpath(profile)).lower()
    found = []
    for p in psutil.process_iter(['name', 'cmdline']):
        try:
            if (p.info['name'] or '').lower() != 'msedge.exe':
                continue
            if any(marker in arg.lower() for arg in p.info['cmdline'] or []):
                found.append(p)
        except psutil.Error:
            pass
    return found


def stop_leftovers(profile=PROFILE):
    """Stops Edge processes left on this profile by an earlier run (and only those). A leftover
    instance holds the profile, and the next launch fails or hands the URL to it."""
    procs = profile_processes(profile)
    for p in procs:
        try:
            p.kill()
        except psutil.Error:
            pass
    psutil.wait_procs(procs, timeout=10)
    return [p.pid for p in procs]


def _free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def _wait_port(port, alive, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        with socket.socket() as s:
            if s.connect_ex(('127.0.0.1', port)) == 0:
                return
        if not alive():
            raise RuntimeError('Edge exited before opening the CDP port (profile held by another process?)')
        time.sleep(0.25)
    raise TimeoutError(f'CDP port {port} did not open in {timeout}s')


class HiddenDesktop:
    """A second desktop in the user's window station (CreateDesktopW). It is never shown and gets
    no keyboard or mouse input. Processes started with STARTUPINFO.lpDesktop pointing to it, and
    their children, create their windows there."""

    def __init__(self):
        from ctypes import wintypes as wt
        self._wt = wt
        self._user32 = ctypes.WinDLL('user32', use_last_error=True)
        self._kernel32 = ctypes.WinDLL('kernel32', use_last_error=True)
        self._user32.CreateDesktopW.restype = wt.HANDLE
        self._user32.CreateDesktopW.argtypes = [wt.LPCWSTR, wt.LPCWSTR, ctypes.c_void_p, wt.DWORD, wt.DWORD, ctypes.c_void_p]
        self._user32.CloseDesktop.argtypes = [wt.HANDLE]
        self.name = f'purple-e2e-{uuid.uuid4().hex[:8]}'
        self.handle = self._user32.CreateDesktopW(self.name, None, None, 0, 0x10000000, None)  # GENERIC_ALL
        if not self.handle:
            raise ctypes.WinError(ctypes.get_last_error())

    def spawn(self, cmdline):
        wt = self._wt

        class STARTUPINFOW(ctypes.Structure):
            _fields_ = [
                ('cb', wt.DWORD), ('lpReserved', wt.LPWSTR), ('lpDesktop', wt.LPWSTR), ('lpTitle', wt.LPWSTR),
                ('dwX', wt.DWORD), ('dwY', wt.DWORD), ('dwXSize', wt.DWORD), ('dwYSize', wt.DWORD),
                ('dwXCountChars', wt.DWORD), ('dwYCountChars', wt.DWORD), ('dwFillAttribute', wt.DWORD),
                ('dwFlags', wt.DWORD), ('wShowWindow', wt.WORD), ('cbReserved2', wt.WORD),
                ('lpReserved2', ctypes.c_void_p), ('hStdInput', wt.HANDLE), ('hStdOutput', wt.HANDLE),
                ('hStdError', wt.HANDLE),
            ]

        class PROCESS_INFORMATION(ctypes.Structure):
            _fields_ = [('hProcess', wt.HANDLE), ('hThread', wt.HANDLE), ('dwProcessId', wt.DWORD), ('dwThreadId', wt.DWORD)]

        si = STARTUPINFOW()
        si.cb = ctypes.sizeof(si)
        si.lpDesktop = f'WinSta0\\{self.name}'
        pi = PROCESS_INFORMATION()
        if not self._kernel32.CreateProcessW(None, ctypes.create_unicode_buffer(cmdline), None, None, False, 0, None,
                                             None, ctypes.byref(si), ctypes.byref(pi)):
            raise ctypes.WinError(ctypes.get_last_error())
        self._kernel32.CloseHandle(pi.hThread)
        self._kernel32.CloseHandle(pi.hProcess)
        return pi.dwProcessId

    def close(self):
        if self.handle:
            self._user32.CloseDesktop(self.handle)
            self.handle = None


# --- session ------------------------------------------------------------------------------

class Session:
    """One Edge instance on the dedicated profile, in one mode, driven by nodriver."""

    def __init__(self, browser, mode, profile, pid, desktop):
        self.browser, self.mode, self.profile, self.pid, self.desktop = browser, mode, profile, pid, desktop
        self.tab = browser.main_tab
        self._closed = False
        atexit.register(self._kill)

    async def prepare(self, tab):
        """Focus emulation, the state recorder and, in userscript mode, the userscript; every later
        document in this tab gets the scripts before any page script."""
        await tab.send(uc.cdp.page.enable())
        await tab.send(uc.cdp.emulation.set_focus_emulation_enabled(enabled=True))
        await tab.send(uc.cdp.page.add_script_to_evaluate_on_new_document(source=RECORDER))
        if self.mode == 'userscript':
            await tab.send(uc.cdp.page.add_script_to_evaluate_on_new_document(source=userscript_source()))

    async def navigate(self, url, tab=None):
        await (tab or self.tab).send(uc.cdp.page.navigate(url))

    async def close(self):
        if self._closed:
            return
        try:
            await asyncio.wait_for(self.browser.connection.send(uc.cdp.browser.close()), 5)
        except Exception:
            pass  # the connection drops while the browser closes
        await asyncio.to_thread(psutil.wait_procs, [p for p in [_process(self.pid)] if p], 10)
        self._kill()
        atexit.unregister(self._kill)

    def _kill(self):
        if self._closed:
            return
        self._closed = True
        stop_leftovers(self.profile)
        if self.desktop:
            self.desktop.close()


def _process(pid):
    try:
        return psutil.Process(pid)
    except psutil.Error:
        return None


async def launch(mode, profile=PROFILE, visible=False, warm_up=True):
    """Starts Edge on the dedicated profile in `mode` and returns a prepared Session."""
    profile = os.path.abspath(profile)
    _check_build(mode)
    stop_leftovers(profile)
    marker = os.path.join(profile, WARM_UP_MARKER)
    if warm_up and not os.path.exists(marker):
        # Edge keeps an unpacked extension from the command line enabled after the profile's first launch
        # only in developer mode (docs/findings/2026-10-07-e2e-harness.md)
        warm = await launch(mode, profile, visible, warm_up=False)
        await warm.navigate('edge://extensions')
        await warm.tab.sleep(2)
        await warm.tab.evaluate('new Promise(r => chrome.developerPrivate.updateProfileConfiguration({inDeveloperMode: true}, () => r(true)))',
                                await_promise=True, return_by_value=True)
        await warm.close()
        with open(marker, 'w', encoding='utf-8') as f:
            f.write('developer mode on\n')

    config = uc.Config(user_data_dir=profile, browser_executable_path=EDGE, headless=False, browser_args=browser_args(mode))
    config.host, config.port = '127.0.0.1', _free_port()
    cmdline = subprocess.list2cmdline([EDGE, *config()])
    desktop = None
    if os.name == 'nt' and not visible:
        desktop = HiddenDesktop()
        pid = desktop.spawn(cmdline)
    else:
        pid = subprocess.Popen(cmdline).pid
    try:
        _wait_port(config.port, lambda: psutil.pid_exists(pid))
        browser = await uc.Browser.create(config=config)
    except BaseException:
        stop_leftovers(profile)
        if desktop:
            desktop.close()
        raise
    session = Session(browser, mode, profile, pid, desktop)
    await session.prepare(session.tab)
    return session


def _check_build(mode):
    needed = {'extension': os.path.join(EXTENSION_BUILD, 'manifest.json'), 'userscript': USERSCRIPT_BUILD}.get(mode)
    if needed and not os.path.exists(needed):
        raise FileNotFoundError(f'{needed} is missing; build first: bun run e2e:build')


def build():
    for cmd in BUILD_COMMANDS:
        subprocess.run(cmd, cwd=REPO, check=True, shell=os.name == 'nt')


# --- page state ---------------------------------------------------------------------------

async def read(tab, expression):
    """Evaluates `expression` in the page and returns its value through JSON.stringify."""
    result = await tab.evaluate(f'JSON.stringify((() => {{ return ({expression}); }})() ?? null)',
                                await_promise=True, return_by_value=True)
    if not isinstance(result, str):
        raise RuntimeError(f'evaluate failed: {result}')
    return json.loads(result)


STATE = """(() => {
  const S = %s;
  const e2e = window.__e2e || { workers: [], messages: [], hookAt: null, workerLog: [] };
  const v = document.querySelector('video');
  const text = (q) => { const el = document.querySelector(q); return el ? el.innerText.trim().slice(0, 200) : null; };
  return {
    url: location.href,
    pageHook: typeof Worker === 'function' && Worker.toString().includes('[Purple]'),
    hookAt: e2e.hookAt,
    workers: e2e.workers,
    messages: e2e.messages,
    workerLog: e2e.workerLog || [],
    video: v ? { readyState: v.readyState, currentTime: Math.round(v.currentTime * 10) / 10, paused: v.paused, error: v.error && v.error.code } : null,
    adOverlay: !!document.querySelector(S.AD_OVERLAY),
    playerError: text(S.PLAYER_ERROR),
    contentGate: !!document.querySelector(S.CONTENT_GATE),
  };
})()"""


async def page_state(tab):
    return await read(tab, STATE % json.dumps(sel.as_dict()))


async def wait_for(tab, expression, timeout=30, interval=0.5):
    """Polls `expression` (a JSON value) until it is truthy; returns it, or None after `timeout` seconds."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        value = await read(tab, expression)
        if value:
            return value
        await tab.sleep(interval)
    return None
