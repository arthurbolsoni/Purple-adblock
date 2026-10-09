"""Whether Purple's page hook is in place before Twitch's player creates its workers on Firefox (T-111, 2026-10-09).

Usage: python docs/findings/probes/firefox_injection_probe.py [loads] [extension | userscript] [Firefox build folder]

Firefox through WebDriver BiDi (e2e/firefox.py), a new temporary profile, logged out, e2e/recorder.js before any page
script. Extension mode: the Firefox build (default dist/purple-adblock-firefox) as a temporary add-on. Userscript mode:
no add-on, the built userscript (dist/purpleadblocker.user.js) as a second preload script, as e2e/lib.py does on Edge
for a manager that runs it at document-start. Takes the live channels of /directory/all and opens [loads] of them
(default 6) by direct load, each in a new document; 20 s after each load, the same checks as L3-01 (worker_check in
e2e/scenarios/common.py): every player worker (script ending in amazon-ivs-wasmworker) created through Purple's
injector, running Purple's code, its boot message seen; and when the page hook was set (hookAt) against when the first
player worker was created.
"""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import firefox  # noqa: E402
import lib  # noqa: E402
import twitch_selectors as sel  # noqa: E402
from scenarios import common  # noqa: E402

WAIT = 20


async def main(loads, mode, build):
    browser = await firefox.Firefox.launch(build if mode == 'extension' else None)
    if mode == 'userscript':
        await browser.send('script.addPreloadScript', {'functionDeclaration': '() => {' + lib.userscript_source() + '\n}'})
    results = []
    try:
        await browser.navigate(common.TWITCH + common.DIRECTORY)
        channels = []
        for _ in range(30):
            channels = await browser.read(common.CARDS) or []
            if channels:
                break
            await asyncio.sleep(1)
        channels = list(dict.fromkeys(channels))
        print('directory channels:', len(channels), flush=True)
        for channel in channels:
            if len(results) >= loads:
                break
            await browser.navigate('about:blank')
            await browser.navigate(common.TWITCH + channel)
            await asyncio.sleep(WAIT)
            state = await browser.read(lib.STATE % json.dumps(sel.as_dict())) or {}
            if state.get('contentGate'):
                print(f'{channel}: content gate, skipped', flush=True)
                continue
            workers = common.player_workers(state) if state.get('workers') is not None else []
            ok = bool(workers) and all(w['viaInjector'] and w['purpleCode'] is True and w['purpleBoot'] for w in workers)
            row = {'channel': channel, 'ok': ok, 'pageHook': state.get('pageHook'), 'hookAt': state.get('hookAt'),
                   'workers': [{k: w.get(k) for k in ('at', 'viaInjector', 'purpleCode', 'purpleBoot', 'errors')} for w in workers],
                   'allWorkers': len(state.get('workers') or []), 'video': state.get('video'), 'playerError': state.get('playerError')}
            results.append(row)
            print(json.dumps(row), flush=True)
    finally:
        await browser.close()
    print(f"{mode}: {sum(r['ok'] for r in results)} of {len(results)} direct loads with every player worker through the injector")


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main(int(sys.argv[1]) if len(sys.argv) > 1 else 6, sys.argv[2] if len(sys.argv) > 2 else 'extension',
                     sys.argv[3] if len(sys.argv) > 3 else firefox.BUILD))
