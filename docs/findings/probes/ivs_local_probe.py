"""Probe, 2026-10-08: does the public IVS player SDK play a local HLS stream on an isolated page, and does Purple's
worker hook attach to its worker? (level 2, T-008; docs/findings/2026-10-03-ivs-player-sdk.md)

    python docs/findings/probes/ivs_local_probe.py <page folder> <hls folder> <playlist path under /hls/> [--mode userscript|record]

The page folder holds ivs.js (amazon-ivs-player bundled with `bun build --format iife`, exposing window.IVSPlayer) and
the SDK's amazon-ivs-wasmworker.min.js and .wasm, and with --purple Purple's bundle as purple.js. Edge runs through e2e/lib.py on a fresh profile; in userscript mode
Purple's userscript build (dist/purpleadblocker.user.js) runs before the page. Prints the video state, player errors,
the workers the e2e recorder saw and the requests the server got.

With --bridge the player loads https://usher.ttvnw.net/api/channel/hls/probe.m3u8 instead: CDP Fetch pauses requests
to usher.ttvnw.net and *.hls.ttvnw.net at the request stage and answers them from the HLS folder with
Fetch.fulfillRequest (a master with one variant on video-weaver.probe.hls.ttvnw.net, the media playlist with absolute
segment URLs on probe.j.cloudfront.hls.ttvnw.net), so nothing reaches Twitch and Purple sees Twitch's hostnames.
"""
import base64
import argparse
import asyncio
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import lib  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
cdp = lib.uc.cdp
PLAYLIST_HOST = 'https://video-weaver.probe.hls.ttvnw.net/v1/playlist/'
SEGMENT_HOST = 'https://probe.j.cloudfront.hls.ttvnw.net/v1/segment/'
MASTER = f"""#EXTM3U
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="720p30",NAME="720p30",AUTOSELECT=YES,DEFAULT=YES
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720,CODECS="avc1.4D401F,mp4a.40.2",VIDEO="720p30",FRAME-RATE=30.000
{PLAYLIST_HOST}probe-720p30.m3u8
"""
CORS = [cdp.fetch.HeaderEntry(name='Access-Control-Allow-Origin', value='*'),
        cdp.fetch.HeaderEntry(name='Access-Control-Allow-Headers', value='*'),
        cdp.fetch.HeaderEntry(name='Access-Control-Allow-Methods', value='GET, POST, OPTIONS')]


def bridge_answer(url, method, hls, playlist):
    """(status, content type, body bytes) for a request to Twitch's hosts, from the HLS folder."""
    if method == 'OPTIONS':
        return 204, 'text/plain', b''
    path = url.split('?')[0]
    if path.startswith('https://usher.ttvnw.net/'):
        return 200, 'application/vnd.apple.mpegurl', MASTER.encode()
    if path.startswith(PLAYLIST_HOST):
        with open(os.path.join(hls, playlist), encoding='utf-8') as f:
            lines = [SEGMENT_HOST + l if l and not l.startswith('#') else l for l in f.read().splitlines()]
        return 200, 'application/vnd.apple.mpegurl', ('\n'.join(lines) + '\n').encode()
    if path.startswith(SEGMENT_HOST):
        name = os.path.basename(path)
        if os.path.exists(os.path.join(hls, name)):
            with open(os.path.join(hls, name), 'rb') as f:
                return 200, 'video/mp2t', f.read()
    return 404, 'text/plain', b'not found'


async def bridge(tab, hls, playlist, log):
    tasks = set()

    async def answer(event):
        # patterns match the whole URL, query included: requests to other hosts (the page itself) go on untouched
        if not event.request.url.startswith(('https://usher.ttvnw.net/', PLAYLIST_HOST, SEGMENT_HOST)):
            await tab.send(cdp.fetch.continue_request(event.request_id))
            return
        status, kind, body = bridge_answer(event.request.url, event.request.method, hls, playlist)
        log.append({'url': event.request.url.split('?')[0][-60:], 'method': event.request.method, 'status': status})
        try:
            await tab.send(cdp.fetch.fulfill_request(event.request_id, response_code=status,
                                                     response_headers=[*CORS, cdp.fetch.HeaderEntry(name='Content-Type', value=kind)],
                                                     body=base64.b64encode(body).decode()))
        except Exception as error:
            log.append({'error': str(error)[:200]})

    def on_paused(event):
        task = asyncio.ensure_future(answer(event))
        tasks.add(task)
        task.add_done_callback(tasks.discard)

    tab.add_handler(cdp.fetch.RequestPaused, on_paused)
    await tab.send(cdp.fetch.enable(patterns=[cdp.fetch.RequestPattern(url_pattern=p, request_stage=cdp.fetch.RequestStage.REQUEST)
                                              for p in ('*usher.ttvnw.net*', '*.hls.ttvnw.net*')]))


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


async def main(args):
    port = free_port()
    server = subprocess.Popen(['bun', os.path.join(HERE, 'ivs_local_server.ts'), str(port), args.page, args.hls],
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8')
    time.sleep(1.5)
    profile = tempfile.mkdtemp(prefix='purple-l2-probe-')
    session = None
    try:
        session = await lib.launch(args.mode, profile=profile)
        bridged = []
        src = f'http://127.0.0.1:{port}/hls/{args.playlist}'
        if args.bridge:
            await bridge(session.tab, args.hls, args.playlist, bridged)
            src = 'https://usher.ttvnw.net/api/channel/hls/probe.m3u8?token=TOKEN&sig=SIG'
        url = f'http://127.0.0.1:{port}/page/?{"purple=1&" if args.purple else ""}src={src}'
        await session.navigate(url)
        await session.tab.sleep(args.seconds)
        state = await lib.page_state(session.tab)
        errors = await lib.read(session.tab, 'window.__playerErrors || null')
        print(json.dumps({'video': state['video'], 'pageHook': state['pageHook'], 'playerErrors': errors,
                          'workers': [{k: w.get(k) for k in ('url', 'viaInjector', 'purpleCode', 'purpleBoot', 'errors')} for w in state['workers'] or []],
                          'workerLog': [e for e in state['workerLog'] if e.get('kind') in ('console', 'error', 'rejection')][:10],
                          'media': [m.get('event') for m in state['media']][:20],
                          'bridged': bridged[:12], 'bridgedCount': len(bridged),
                          'purpleLog': [e.get('text') for e in state['workerLog'] if e.get('kind') == 'console'][:10],
                          'fetches': sorted({(e.get('level'), e.get('url', '')[-50:]) for e in state['workerLog'] if e.get('kind') == 'fetch' and ('usher' in e.get('url', '') or 'playlist' in e.get('url', ''))})},
                         indent=1, default=str))
    finally:
        if session:
            await session.close()
        shutil.rmtree(profile, ignore_errors=True)
        server.terminate()
        lines = server.stdout.read().splitlines() if server.stdout else []
        paths = [json.loads(l).get('path') for l in lines if l.startswith('{') and '"path"' in l]
        print('server requests:', len(paths), sorted(set(p.rsplit('/', 1)[0] + '/' + (p.rsplit('/', 1)[1][:12]) for p in paths))[:30])


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('page')
    ap.add_argument('hls')
    ap.add_argument('playlist')
    ap.add_argument('--mode', default='userscript', choices=('userscript', 'record'))
    ap.add_argument('--seconds', type=int, default=15)
    ap.add_argument('--purple', action='store_true', help="the page loads purple.js (Purple's bundle) from the page folder first")
    ap.add_argument('--bridge', action='store_true', help="the player loads Twitch's usher URL, answered by CDP Fetch from the HLS folder")
    asyncio.run(main(ap.parse_args()))
