"""Level 2 glue (T-009): the sim/ server process and the CDP Fetch bridge that answers Twitch's hostnames from it.

The isolated page (sim/page/index.html) is served by sim/ on 127.0.0.1. Every request from the page or its workers to
`*.twitch.tv`, `*.ttvnw.net` or `*.live-video.net` is paused by Fetch at the request stage and forwarded to sim/ with
the original URL in `X-Sim-Url`; sim/'s answer goes back with Fetch.fulfillRequest. Purple sees Twitch's real URLs
and nothing reaches Twitch: the browser runs with every other host unresolvable (lib.SIM_HOST_RULES).
docs/findings/2026-10-08-level2-player-page.md has the probe this comes from.
"""
import asyncio
import base64
import json
import os
import socket
import subprocess
import time
import urllib.error
import urllib.request
from contextlib import asynccontextmanager
from urllib.parse import urlsplit

import lib

cdp = lib.uc.cdp
SIM = os.path.join(lib.REPO, 'sim')
BINARY = os.path.join(SIM, 'target', 'release', 'sim.exe' if os.name == 'nt' else 'sim')
TWITCH_HOSTS = ('twitch.tv', 'ttvnw.net', 'live-video.net')
PATTERNS = ['*twitch.tv*', '*ttvnw.net*', '*live-video.net*']
# request headers not passed on to sim/ (connection-level, or set again by urllib)
DROPPED = {'host', 'content-length', 'connection', 'accept-encoding'}


def build():
    """cargo build --release for sim/, and the page's SDK bundle when it is missing."""
    subprocess.run(['cargo', 'build', '--release', '--quiet', '--manifest-path', os.path.join(SIM, 'Cargo.toml')], check=True)
    page = os.path.join(SIM, 'page')
    if not os.path.exists(os.path.join(page, 'ivs.js')):
        subprocess.run(['bun', 'install'], cwd=page, check=True)
        subprocess.run(['bun', 'run', 'build'], cwd=page, check=True)
    if not os.path.exists(os.path.join(SIM, 'media', 'live-720p')):
        subprocess.run(['cargo', 'run', '--release', '--quiet', '--manifest-path', os.path.join(SIM, 'Cargo.toml'), '--bin', 'media'], check=True)


def _free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


class Sim:
    def __init__(self, port, process):
        self.port, self.process = port, process
        self.base = f'http://127.0.0.1:{port}'
        self.bridged = []  # (method, url, status) of every request answered through the bridge
        self.errors = []
        self.cancelled = []  # URLs the page cancelled before the answer reached it (not an error)

    def call(self, method, path, body=None):
        request = urllib.request.Request(self.base + path, data=body, method=method)
        with urllib.request.urlopen(request, timeout=10) as response:
            return response.status, response.read()

    def load(self, name):
        status, body = self.call('POST', f'/_sim/scenario?name={name}', b'')
        if status != 200:
            raise RuntimeError(f'sim: {name}: {body!r}')

    def log(self):
        return json.loads(self.call('GET', '/_sim/log')[1])

    def page(self, channel='simchannel', purple=True, debug=True, extra=''):
        return f'{self.base}/page/index.html?channel={channel}&purple={1 if purple else 0}&debug={1 if debug else 0}{extra}'

    def forward(self, method, url, headers, body):
        """sim/'s answer to a request for a Twitch URL: (status, headers, body bytes)."""
        sent = {k: v for k, v in headers.items() if k.lower() not in DROPPED}
        sent['X-Sim-Url'] = url
        request = urllib.request.Request(self.base + '/', data=body, method=method, headers=sent)
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                return response.status, dict(response.headers), response.read()
        except urllib.error.HTTPError as error:
            return error.code, dict(error.headers), error.read()

    async def bridge(self, tab):
        """Fetch on the tab (its workers included): Twitch's hosts answered from sim/, every other request continued."""
        loop = asyncio.get_running_loop()
        tasks = set()

        async def answer(event):
            url = event.request.url
            host = urlsplit(url).hostname or ''
            try:
                if not any(host == h or host.endswith('.' + h) for h in TWITCH_HOSTS):
                    await tab.send(cdp.fetch.continue_request(event.request_id))
                    return
                body = event.request.post_data.encode('utf-8') if event.request.post_data else None
                status, headers, data = await loop.run_in_executor(None, self.forward, event.request.method, url, dict(event.request.headers or {}), body)
                self.bridged.append((event.request.method, url, status))
                entries = [cdp.fetch.HeaderEntry(name=k, value=v) for k, v in headers.items() if k.lower() not in ('content-length', 'connection', 'transfer-encoding', 'date')]
                await tab.send(cdp.fetch.fulfill_request(event.request_id, response_code=status, response_headers=entries, body=base64.b64encode(data).decode()))
            except Exception as error:
                # the page cancelled the request while sim/ answered it (the player restarting at a pause/play):
                # nothing is waiting for the answer
                if 'Invalid InterceptionId' in str(error):
                    self.cancelled.append(url)
                    return
                self.errors.append(f'{url[:120]}: {error}'[:300])
                try:
                    await tab.send(cdp.fetch.fail_request(event.request_id, cdp.network.ErrorReason.FAILED))
                except Exception:
                    pass

        def on_paused(event):
            task = asyncio.ensure_future(answer(event))
            tasks.add(task)
            task.add_done_callback(tasks.discard)

        tab.add_handler(cdp.fetch.RequestPaused, on_paused)
        await tab.send(cdp.fetch.enable(patterns=[cdp.fetch.RequestPattern(url_pattern=p, request_stage=cdp.fetch.RequestStage.REQUEST) for p in PATTERNS]))


@asynccontextmanager
async def running(scenario):
    """sim/ on a free port with `scenario` (a file name in sim/scenarios without .json) loaded; stopped at the end."""
    if not os.path.exists(BINARY):
        build()
    port = _free_port()
    process = subprocess.Popen([BINARY, '--port', str(port)], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
    sim = Sim(port, process)
    try:
        deadline = time.time() + 15
        while True:
            try:
                sim.call('GET', '/_sim/health')
                break
            except OSError:
                if time.time() > deadline or process.poll() is not None:
                    raise RuntimeError('sim did not start')
                await asyncio.sleep(0.2)
        sim.load(scenario)
        yield sim
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
