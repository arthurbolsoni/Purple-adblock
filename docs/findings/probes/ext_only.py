# Probe, 2026-10-03. List extensions in extension mode to confirm only Purple is enabled.
# Finding: docs/findings/2026-10-03-edge-nodriver.md
# Edge 154 + nodriver 0.50.3, dedicated profile ~/nodriver/profile-edge-purple.
import os, nodriver as uc
PROFILE = os.path.expanduser('~/nodriver/profile-edge-purple')
BROWSER = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
EXT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dist', 'purple-adblock-purple-adblock-chromium'))
ARGS = ['--lang=en-US', f'--load-extension={EXT}', f'--disable-extensions-except={EXT}', '--disable-component-extensions-with-background-pages']
async def main():
    b = await uc.start(user_data_dir=PROFILE, browser_executable_path=BROWSER, headless=False, browser_args=ARGS)
    try:
        tab = await b.get('edge://extensions')
        await tab.sleep(3)
        print(await tab.evaluate("""new Promise(r => chrome.developerPrivate.getExtensionsInfo({includeDisabled: true}, l => r(JSON.stringify(l.map(e => [e.name, e.location, e.state])))))""", await_promise=True, return_by_value=True))
        targets = await tab.send(uc.cdp.target.get_targets())
        print([ (t.type_, t.url[:60]) for t in targets if t.type_ not in ('page', 'browser', 'tab') ])
    finally:
        b.stop()
uc.loop().run_until_complete(main())
