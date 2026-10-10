# Probe, 2026-10-03. Answer every media playlist with Fetch.fulfillRequest and check the real player keeps playing.
# Finding: docs/findings/2026-10-03-twitch-live-traffic.md
# Edge 154 + nodriver 0.50.3, dedicated profile ~/nodriver/profile-edge-purple.
import os, base64, collections
import nodriver as uc
from nodriver import cdp
PROFILE = os.path.expanduser('~/nodriver/profile-edge-purple')
BROWSER = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
ARGS = ['--lang=en-US', '--window-size=1400,950', '--disable-extensions', '--disable-component-extensions-with-background-pages']
stats = collections.Counter(); errors = []
async def main():
    b = await uc.start(user_data_dir=PROFILE, browser_executable_path=BROWSER, headless=False, browser_args=ARGS)
    try:
        tab = await b.get('https://www.twitch.tv/directory/all')
        ch = ''
        for _ in range(20):
            await tab.sleep(1)
            ch = await tab.evaluate("(() => { const a = document.querySelector('a[data-a-target=\"preview-card-image-link\"]'); return a ? a.getAttribute('href') : '' })()", return_by_value=True)
            if isinstance(ch, str) and ch: break
        async def on_paused(e):
            try:
                body, b64 = await tab.send(cdp.fetch.get_response_body(e.request_id))
                raw = base64.b64decode(body) if b64 else body.encode()
                headers = [cdp.fetch.HeaderEntry(name='Content-Type', value='application/vnd.apple.mpegurl'),
                           cdp.fetch.HeaderEntry(name='Access-Control-Allow-Origin', value='*'),
                           cdp.fetch.HeaderEntry(name='X-Purple-Replay', value='1')]
                await tab.send(cdp.fetch.fulfill_request(e.request_id, response_code=e.response_status_code or 200,
                                                         response_headers=headers, body=base64.b64encode(raw).decode()))
                stats['fulfilled'] += 1
            except Exception as ex:
                errors.append(str(ex)[:120])
                try: await tab.send(cdp.fetch.continue_request(e.request_id))
                except Exception: pass
        tab.add_handler(cdp.fetch.RequestPaused, on_paused)
        await tab.send(cdp.fetch.enable(patterns=[cdp.fetch.RequestPattern(url_pattern='*.m3u8*', request_stage=cdp.fetch.RequestStage.RESPONSE)]))
        await tab.send(cdp.page.navigate(url='https://www.twitch.tv' + ch))
        reads = []
        for _ in range(3):
            await tab.sleep(10)
            reads.append(await tab.evaluate("JSON.stringify((() => { const v = document.querySelector('video'); return v ? {rs: v.readyState, t: Math.round(v.currentTime*10)/10, paused: v.paused} : null })())", return_by_value=True))
        print('channel:', ch, 'fulfilled:', dict(stats), 'errors:', errors[:2])
        print('video reads (10s apart):', reads)
    finally:
        b.stop()
uc.loop().run_until_complete(main())
