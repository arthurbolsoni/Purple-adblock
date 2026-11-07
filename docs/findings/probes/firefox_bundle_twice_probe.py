"""How many times app/bundle.js reaches a Twitch page in Firefox, and which run hooks the page (T-830, 2026-11-07).

Usage: python docs/findings/probes/firefox_bundle_twice_probe.py [channel] [--build DIR]

Opens https://www.twitch.tv/<channel> (default: the front page) in Firefox (e2e/firefox.py, PURPLE_FIREFOX) with the
build in --build (default dist/purple-adblock-firefox) and a preload that runs before any page script and records:

- every <script> element added to the page whose src is not https:// (the content script adds app/bundle.js as
  `moz-extension://.../app/bundle.js` when it finds no MAIN world content script for it);
- every assignment to window.Worker (index.ts replaces it), with document.currentScript: null for a content script,
  the <script> element's src for a run through that element.

Then prints those and the page's console errors and warnings (BiDi log.entryAdded) that name bundle.js or a
redeclaration: the build's bundle declares `let` bindings at the top level, so a second run in the same page fails
before it runs anything (`SyntaxError: redeclaration of let ...`).
"""
import argparse
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'e2e'))
import firefox  # noqa: E402

WATCH = """() => {
  window.__bundleRuns = { scripts: [], worker: [] };
  new MutationObserver((list) => {
    for (const m of list) for (const n of m.addedNodes)
      if (n.tagName === 'SCRIPT' && n.src && !n.src.startsWith('https://'))
        window.__bundleRuns.scripts.push({ src: n.src.replace(/^moz-extension:\\/\\/[^/]+/, 'moz-extension://<id>'), at: Math.round(performance.now()) });
  }).observe(document, { childList: true, subtree: true });
  let current = window.Worker;
  Object.defineProperty(window, 'Worker', { configurable: true, get: () => current, set: (value) => {
    window.__bundleRuns.worker.push({ at: Math.round(performance.now()), currentScript: document.currentScript ? document.currentScript.src.slice(-30) : null });
    current = value;
  } });
}"""


async def run(channel, build):
    browser = await firefox.Firefox.launch(build=build)
    try:
        await browser.send('script.addPreloadScript', {'functionDeclaration': WATCH})
        await browser.navigate('https://www.twitch.tv/' + channel, wait='complete')
        await asyncio.sleep(10)
        runs = await browser.read('window.__bundleRuns')
        console = [e for e in browser.take_console() if 'bundle.js' in (e['at'] or '') or 'redeclaration' in e['text']]
    finally:
        await browser.close()
    print('script elements added:', json.dumps(runs['scripts']))
    print('window.Worker set by:', json.dumps(runs['worker']))
    for entry in console:
        print(f"console {entry['level']}: {entry['text'][:160]} ({(entry['at'] or '').split('/')[-1]})")
    if not console:
        print('console: no error naming bundle.js')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('channel', nargs='?', default='')
    ap.add_argument('--build', default=firefox.BUILD)
    args = ap.parse_args()
    asyncio.run(run(args.channel, args.build))


if __name__ == '__main__':
    main()
