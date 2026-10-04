# Probe, 2026-10-04. Checks that Purple's worker code boots inside the Twitch player worker after the T-001 refactor
# (bootstrapWorker(self)) and that playback keeps going through the hooked fetch.
# Evidence of the boot: the worker posts {type: "getSettings"}; index.ts forwards it to the window, where a listener
# installed before any page script records it.
# Finding: docs/findings/2026-10-03-worker-unit-tests.md
# Edge + nodriver, dedicated profile ~/nodriver/profile-edge-purple, only the Purple build loaded.
# Run: bun serviceWorker/build.ts && bun cli/build.ts dev && python -u docs/findings/probes/worker_boot_probe.py [<unpacked build>] [--spa]
import json, os, sys

SPA = '--spa' in sys.argv
POSITIONAL = [a for a in sys.argv[1:] if not a.startswith('--')]
import nodriver as uc

PROFILE = os.path.expanduser('~/nodriver/profile-edge-purple')
BROWSER = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
# optional argument: path of another unpacked build (e.g. one made from main)
EXT = os.path.abspath(POSITIONAL[0] if POSITIONAL else os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dist', 'purple-adblock-purple-adblock-chromium'))
ARGS = ['--window-size=1400,950', '--lang=en-US', f'--load-extension={EXT}', f'--disable-extensions-except={EXT}',
        '--disable-component-extensions-with-background-pages']

RECORDER = """
window.__probe = { messages: [], workers: [], hookAt: null };
window.addEventListener('message', (e) => {
  const t = e.data && e.data.type;
  if (t === 'getSettings' || t === 'setSettings') window.__probe.messages.push({ type: t, at: Math.round(performance.now()) });
});
// Wraps the native Worker before any page script. For each worker: its URL, whether the script it runs contains
// Purple's worker code (blob text read back with a synchronous XHR), errors, and whether it posted Purple's boot message.
const NativeWorker = window.Worker;
const proxy = new Proxy(NativeWorker, {
  construct(target, args, newTarget) {
    const url = String(args[0]);
    const entry = { url: url.slice(0, 60), at: Math.round(performance.now()), viaInjector: newTarget !== proxy, purpleCode: null, size: null, errors: [], purpleBoot: false };
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send();
      entry.size = xhr.responseText.length;
      entry.purpleCode = xhr.responseText.includes('Script running');
    } catch (e) { entry.purpleCode = 'xhr failed: ' + e.message; }
    const worker = Reflect.construct(target, args, newTarget);
    window.__probe.workers.push(entry);
    worker.addEventListener('message', (e) => { if (e.data && e.data.type === 'getSettings') entry.purpleBoot = true; });
    worker.addEventListener('error', (e) => entry.errors.push(String(e.message || e.type).slice(0, 200)));
    return worker;
  },
});
let current = proxy;
Object.defineProperty(window, 'Worker', {
  configurable: true,
  get: () => current,
  set: (value) => { current = value; window.__probe.hookAt = Math.round(performance.now()); },
});
"""

STATE = """JSON.stringify((() => {
  const v = document.querySelector('video');
  return {
    url: location.href,
    pageHook: Worker.toString().includes('Purple'),
    messages: (window.__probe || {}).messages || [],
    workers: (window.__probe || {}).workers || [],
    hookAt: (window.__probe || {}).hookAt,
    video: v ? { readyState: v.readyState, currentTime: Math.round(v.currentTime * 10) / 10, paused: v.paused } : null,
  };
})())"""


async def ev(tab, code):
    return await tab.evaluate(code, await_promise=True, return_by_value=True)


async def main():
    browser = await uc.start(user_data_dir=PROFILE, browser_executable_path=BROWSER, headless=False, browser_args=ARGS)
    try:
        tab = browser.main_tab
        await tab.send(uc.cdp.page.enable())
        await tab.send(uc.cdp.page.add_script_to_evaluate_on_new_document(source=RECORDER))
        await tab.send(uc.cdp.page.navigate('https://www.twitch.tv/directory/all'))
        channel = None
        for _ in range(25):
            await tab.sleep(1)
            channel = await ev(tab, "(() => { const a = document.querySelector('a[data-a-target=\"preview-card-image-link\"]'); return a ? a.getAttribute('href') : null })()")
            if isinstance(channel, str) and channel:
                break
            channel = None
        print('channel:', channel)
        if not channel:
            return
        if SPA:
            print('directory state:', json.loads(await ev(tab, STATE)))
            await ev(tab, """document.querySelector('a[data-a-target="preview-card-image-link"]').click()""")
        else:
            await tab.send(uc.cdp.page.navigate('https://www.twitch.tv' + channel))
        for second in (10, 20, 30):
            await tab.sleep(10)
            print(second, 's:', json.loads(await ev(tab, STATE)))
    finally:
        browser.stop()


uc.loop().run_until_complete(main())
