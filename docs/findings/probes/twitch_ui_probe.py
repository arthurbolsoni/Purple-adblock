# Probe, 2026-10-07. Lists what level 3 reads on a twitch.tv channel page: data-a-target values in and
# around the player, and the scripts of the workers the page creates (to tell player workers apart).
# Finding: docs/findings/2026-10-07-e2e-harness.md
# Runs through e2e/lib.py (dedicated profile, hidden desktop).
# Run: python -u docs/findings/probes/twitch_ui_probe.py [extension|userscript|record] [<channel path>|<directory path>] [--block-video]
#   <directory path> (/directory/...): pick the first card there (a mature-rated category shows the content gate)
#   --block-video: every worker fetch to *.ttvnw.net fails, to get the player error overlay (Network.setBlockedURLs
#   on the page session does not reach the player worker's requests)
import json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import nodriver as uc
import lib
import twitch_selectors as sel

ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
MODE = ARGS[0] if ARGS else 'record'
TARGET = ARGS[1] if len(ARGS) > 1 else '/directory/all'
BLOCK_VIDEO = '--block-video' in sys.argv

# wraps the Worker after the recorder: the worker script starts with a fetch that rejects ttvnw.net URLs
BLOCK_VIDEO_JS = r"""
window.Worker = class extends Worker {
  constructor(url, options) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', String(url), false);
    xhr.send();
    const block = "const __f = self.fetch; self.fetch = (u, o) => /ttvnw\.net/.test(String(u && u.url || u)) ? Promise.reject(new TypeError('blocked by probe')) : __f(u, o);\n";
    super(URL.createObjectURL(new Blob([block + xhr.responseText], { type: 'text/javascript' })), options);
  }
};
"""

DUMP = """(() => {
  const targets = {};
  for (const el of document.querySelectorAll('[data-a-target]')) {
    const k = el.getAttribute('data-a-target');
    if (/player|video|ad-|overlay|gate|error|mature|classification|content/i.test(k))
      targets[k] = (targets[k] || 0) + 1;
  }
  const overlay = document.querySelector('.video-player__overlay, [data-a-target="player-overlay-click-handler"]');
  return {
    url: location.href,
    targets,
    gateButtons: [...document.querySelectorAll('[data-a-target="content-classification-gate-overlay"] button')].map(b => [b.getAttribute('data-a-target'), b.innerText.trim()]),
    gateText: [...document.querySelectorAll('[class*="content-overlay-gate"], [class*="content-classification-gate"]')].map(e => e.innerText.trim().slice(0, 200)),
    workers: (window.__e2e || {}).workers,
  };
})()"""


async def main():
    session = await lib.launch(MODE)
    try:
        tab = session.tab
        channel = TARGET
        if channel.startswith('/directory'):
            await session.navigate('https://www.twitch.tv' + channel)
            channel = await lib.wait_for(tab, f"document.querySelector({json.dumps(sel.DIRECTORY_CARD)})?.getAttribute('href')")
        print('channel:', channel)
        if BLOCK_VIDEO:
            await tab.send(uc.cdp.page.add_script_to_evaluate_on_new_document(source=BLOCK_VIDEO_JS))
        await session.navigate('https://www.twitch.tv' + channel)
        for second in (8, 16, 24):
            await tab.sleep(8)
            dump = await lib.read(tab, DUMP)
            state = await lib.page_state(tab)
            for w in dump.pop('workers') or []:
                print('  worker:', {k: w[k] for k in ('at', 'viaInjector', 'purpleCode', 'size', 'purpleBoot', 'errors')}, w['tail'][-110:])
            print(second, 's:', json.dumps(dump))
            print('  state:', json.dumps({k: v for k, v in state.items() if k not in ('workers',)}))
            if second == 8 and dump['gateButtons']:
                # accept the content classification gate the way a viewer does
                print('  click:', await lib.read(tab, """(() => { const b = [...document.querySelectorAll('[data-a-target="content-classification-gate-overlay"] button')].find(b => /start watching/i.test(b.innerText)); if (b) b.click(); return !!b; })()"""))
    finally:
        await session.close()


uc.loop().run_until_complete(main())
