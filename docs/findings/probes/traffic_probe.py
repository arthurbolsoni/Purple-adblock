# Probe, 2026-10-03. Record which player requests Fetch can intercept on a live channel and summarize ad markers.
# Finding: docs/findings/2026-10-03-twitch-live-traffic.md
# Edge 154 + nodriver 0.50.3, dedicated profile ~/nodriver/profile-edge-purple.
import os, re, base64, collections
from urllib.parse import urlparse
import nodriver as uc
from nodriver import cdp

PROFILE = os.path.expanduser('~/nodriver/profile-edge-purple')
BROWSER = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
ARGS = ['--lang=en-US', '--window-size=1400,950',
        '--disable-extensions', '--disable-component-extensions-with-background-pages']

paused = collections.Counter()
errors = []
wasm = set()
seg_hosts = collections.Counter()
daterange = set()
titles = collections.Counter()
ad_attrs = set()
usher_tags = collections.Counter()


async def main():
    b = await uc.start(user_data_dir=PROFILE, browser_executable_path=BROWSER, headless=False, browser_args=ARGS)
    try:
        tab = await b.get('https://www.twitch.tv/directory/all')
        ch = ''
        for _ in range(20):
            await tab.sleep(1)
            ch = await tab.evaluate("(() => { const a = document.querySelector('a[data-a-target=\"preview-card-image-link\"]'); return a ? a.getAttribute('href') : '' })()", return_by_value=True)
            if isinstance(ch, str) and ch:
                break
        print('channel:', ch, flush=True)

        async def on_paused(e):
            u = e.request.url
            if 'usher.ttvnw.net' in u:
                kind = 'usher'
            elif '.m3u8' in u:
                kind = 'media'
            elif '.wasm' in u:
                kind = 'wasm'
            elif '.ts' in u:
                kind = 'segment'
            else:
                kind = 'other'
            paused[(kind, str(e.resource_type.value), 'response' if e.response_status_code else 'request')] += 1
            try:
                if kind == 'wasm':
                    wasm.add(u.split('?')[0])
                if kind == 'segment':
                    seg_hosts[urlparse(u).netloc.split('.', 1)[-1]] += 1
                if kind in ('usher', 'media') and e.response_status_code == 200:
                    body, b64 = await tab.send(cdp.fetch.get_response_body(e.request_id))
                    txt = base64.b64decode(body).decode('utf-8', 'replace') if b64 else body
                    if kind == 'usher':
                        usher_tags.update(l.split(':')[0] for l in txt.splitlines() if l.startswith('#'))
                    else:
                        for m in re.findall(r'#EXT-X-DATERANGE:(.*)', txt):
                            cls = re.search(r'CLASS="([^"]+)"', m)
                            idm = re.search(r'ID="([a-z]+(?:-[a-z]+)?)', m)
                            daterange.add((cls.group(1) if cls else '-', idm.group(1) if idm else '-'))
                        for t in re.findall(r'#EXTINF:[^,]*,(.*)', txt):
                            titles[t.strip()[:20]] += 1
                        ad_attrs.update(re.findall(r'(X-TV-TWITCH-AD-[A-Z-]+)=', txt))
            except Exception as ex:
                errors.append(str(ex)[:100])
            try:
                await tab.send(cdp.fetch.continue_request(e.request_id))
            except Exception as ex:
                errors.append('continue: ' + str(ex)[:100])

        tab.add_handler(cdp.fetch.RequestPaused, on_paused)
        await tab.send(cdp.fetch.enable(patterns=[
            cdp.fetch.RequestPattern(url_pattern='*usher.ttvnw.net*', request_stage=cdp.fetch.RequestStage.RESPONSE),
            cdp.fetch.RequestPattern(url_pattern='*.m3u8*', request_stage=cdp.fetch.RequestStage.RESPONSE),
            cdp.fetch.RequestPattern(url_pattern='*.wasm*', request_stage=cdp.fetch.RequestStage.REQUEST),
            cdp.fetch.RequestPattern(url_pattern='*hls.ttvnw.net*', request_stage=cdp.fetch.RequestStage.REQUEST),
        ]))
        await tab.send(cdp.page.navigate(url='https://www.twitch.tv' + ch))
        await tab.sleep(30)
        state = await tab.evaluate("JSON.stringify((() => { const v = document.querySelector('video'); return v ? {rs: v.readyState, t: v.currentTime, paused: v.paused} : null })())", return_by_value=True)
        print('video:', state, flush=True)
    finally:
        b.stop()

    print('paused (kind, resourceType, stage):', dict(paused))
    print('errors:', errors[:3])
    print('wasm:', sorted(wasm))
    print('segment host suffixes:', dict(seg_hosts))
    print('usher tags:', dict(usher_tags))
    print('DATERANGE (CLASS, ID prefix):', sorted(daterange))
    print('EXTINF titles:', dict(titles))
    print('ad attrs:', sorted(ad_attrs))


uc.loop().run_until_complete(main())
