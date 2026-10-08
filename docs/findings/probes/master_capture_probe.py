# Probe, 2026-10-07. Captures every usher master on a channel load: the page's own request and the backup
# masters Purple requests during an ad. Raw bodies and URLs go to ~/purple-recordings/<date>-masters-<n>/
# (outside the repo; they carry tokens). Prints the usher path, query keys, player_type from the token,
# the variant hosts and whether Purple 2.6.7's variant regex reads them (Q-005, Q-011, Q-013).
# Finding: docs/findings/2026-10-07-e2e-harness.md
# Runs through e2e/lib.py (hidden desktop). A fresh profile under %TEMP% (default) usually gets a preroll.
# Run: python -u docs/findings/probes/master_capture_probe.py [extension|record] [--dedicated-profile]
import base64, datetime, json, os, re, shutil, sys, tempfile
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import nodriver as uc
from nodriver import cdp
import lib
import twitch_selectors as sel

ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
MODE = ARGS[0] if ARGS else 'extension'
DEDICATED = '--dedicated-profile' in sys.argv
OUT = os.path.expanduser(f'~/purple-recordings/{datetime.date.today()}-masters-{os.getpid()}')

# Purple 2.6.7 (stream.ts)
REGEX_267 = re.compile(r'NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)')


def summarize(url, text):
    u = urlparse(url)
    query = parse_qs(u.query)
    token = query.get('token', ['{}'])[0]
    try:
        player_type = json.loads(token).get('player_type')
    except ValueError:
        player_type = None
    variants = [l for l in text.splitlines() if l and not l.startswith('#')]
    return {
        'path': re.sub(r'[^/]+\.m3u8$', '<channel>.m3u8', u.path),
        'query_keys': sorted(query),
        'player_type': player_type,
        'session_data_ids': re.findall(r'#EXT-X-SESSION-DATA:DATA-ID="([^"]+)"', text),
        'media_attrs': sorted({k for l in text.splitlines() if l.startswith('#EXT-X-MEDIA:') for k in re.findall(r'([A-Z-]+)=', l)}),
        'stream_inf_attrs': sorted({k for l in text.splitlines() if l.startswith('#EXT-X-STREAM-INF:') for k in re.findall(r'([A-Z-]+)=', l)}),
        'variants': len(variants),
        'variant_hosts': sorted({urlparse(v).netloc for v in variants}),
        'variant_paths': sorted({re.sub(r'/[^/]{32,}', '/<opaque>', urlparse(v).path) for v in variants}),
        'regex_2_6_7_matches': len(REGEX_267.findall(text)),
    }


async def main():
    os.makedirs(OUT, exist_ok=True)
    profile = lib.PROFILE if DEDICATED else tempfile.mkdtemp(prefix='purple-e2e-fresh-')
    captured = []
    session = await lib.launch(MODE, profile=profile)
    tab = session.tab
    try:
        async def on_paused(e):
            try:
                if e.response_status_code == 200:
                    body, b64 = await tab.send(cdp.fetch.get_response_body(e.request_id))
                    text = base64.b64decode(body).decode('utf-8', 'replace') if b64 else body
                    name = f'{len(captured) + 1:02d}-usher.m3u8'
                    with open(os.path.join(OUT, name), 'w', encoding='utf-8', newline='') as f:
                        f.write(text)
                    captured.append({'file': name, 'url': e.request.url, 'status': e.response_status_code})
                else:
                    captured.append({'file': None, 'url': e.request.url, 'status': e.response_status_code})
            finally:
                await tab.send(cdp.fetch.continue_request(e.request_id))

        tab.add_handler(cdp.fetch.RequestPaused, on_paused)
        await tab.send(cdp.fetch.enable(patterns=[
            cdp.fetch.RequestPattern(url_pattern='*usher.ttvnw.net*', request_stage=cdp.fetch.RequestStage.RESPONSE),
        ]))
        await session.navigate('https://www.twitch.tv/directory/all')
        await lib.wait_for(tab, f'!!document.querySelector({json.dumps(sel.DIRECTORY_CARD)})')
        channels = await lib.read(tab, f"[...document.querySelectorAll({json.dumps(sel.DIRECTORY_CARD)})].map(a => a.getAttribute('href'))")
        for channel in list(dict.fromkeys(channels))[:8]:
            captured.clear()
            await session.navigate('https://www.twitch.tv' + channel)
            gated = await lib.wait_for(tab, f'!!document.querySelector({json.dumps(sel.CONTENT_GATE)})', timeout=8)
            if not gated:
                break
        await tab.sleep(30)
        state = await lib.page_state(tab)
        print('video:', state['video'], 'overlay:', state['playerError'], 'ad overlay:', state['adOverlay'])
    finally:
        await session.close()
        if not DEDICATED:
            shutil.rmtree(profile, ignore_errors=True)

    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(captured, f, indent=1)
    print('saved to', OUT)
    for c in captured:
        if c['file']:
            with open(os.path.join(OUT, c['file']), encoding='utf-8') as f:
                print(c['file'], json.dumps(summarize(c['url'], f.read())))
        else:
            print('status', c['status'], urlparse(c['url']).path)


uc.loop().run_until_complete(main())
