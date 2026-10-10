# Probe, 2026-10-03. Map *.ttvnw.net to a local TLS server with --host-resolver-rules (did not work yet).
# Finding: docs/findings/2026-10-03-host-resolver-mapping.md
# Edge 154 + nodriver 0.50.3, dedicated profile ~/nodriver/profile-edge-purple.
import os, nodriver as uc
PROFILE = os.path.expanduser('~/nodriver/profile-edge-purple')
BROWSER = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
ARGS = ['--lang=en-US', '--window-size=1400,950', '--disable-extensions', '--disable-component-extensions-with-background-pages',
        '--host-resolver-rules=MAP *.ttvnw.net 127.0.0.1', '--ignore-certificate-errors', '--disable-quic']
async def main():
    b = await uc.start(user_data_dir=PROFILE, browser_executable_path=BROWSER, headless=False, browser_args=ARGS)
    try:
        tab = await b.get('https://www.twitch.tv/directory/all')
        ch = ''
        for _ in range(20):
            await tab.sleep(1)
            ch = await tab.evaluate("(() => { const a = document.querySelector('a[data-a-target=\"preview-card-image-link\"]'); return a ? a.getAttribute('href') : '' })()", return_by_value=True)
            if isinstance(ch, str) and ch: break
        await tab.get('https://www.twitch.tv' + ch)
        reads = []
        for _ in range(3):
            await tab.sleep(8)
            reads.append(await tab.evaluate("JSON.stringify((() => { const v = document.querySelector('video'); return v ? {rs: v.readyState, t: Math.round(v.currentTime*10)/10, paused: v.paused} : null })())", return_by_value=True))
        print('channel:', ch, 'video:', reads, flush=True)
        v = await b.get('edge://version', new_tab=True)
        await v.sleep(1)
        print('cmdline has rules:', await v.evaluate("document.body.innerText.includes('host-resolver-rules')", return_by_value=True), flush=True)
    finally:
        b.stop()
uc.loop().run_until_complete(main())
