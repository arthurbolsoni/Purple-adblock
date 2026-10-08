"""L3-01: open a live channel picked from the directory, by direct load and by client-side navigation.

For each way in: every player worker was created through Purple's injector and runs Purple's code
(boot message seen); video playing; no player error (docs/tests.md, level 3).
"""
import json

import lib
import twitch_selectors as sel
from scenarios import Check

ID = 'L3-01'
TITLE = 'live channel from the directory, direct load and client-side navigation'
MODES = ('extension', 'userscript')

TWITCH = 'https://www.twitch.tv'
DIRECTORY = '/directory/all'
CANDIDATES = 8  # channels tried until one plays without the content classification gate
SETTLE = 25     # seconds for the player to start, fail or show the gate
SAMPLE = 3      # seconds between the two reads that show currentTime advancing

# a Twitch player worker runs importScripts('https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.js')
PLAYER_WORKER = 'amazon-ivs-wasmworker'

SETTLED = f"""(() => {{
  const v = document.querySelector('video');
  if (document.querySelector({json.dumps(sel.CONTENT_GATE)})) return 'gate';
  if (document.querySelector({json.dumps(sel.PLAYER_ERROR)})) return 'error';
  if (v && v.readyState >= 3 && !v.paused) return 'playing';
  return null;
}})()"""


async def run(session):
    tab = session.tab
    await session.navigate(TWITCH + DIRECTORY)
    await lib.wait_for(tab, f'!!document.querySelector({json.dumps(sel.DIRECTORY_CARD)})')
    channels = await lib.read(tab, f"[...document.querySelectorAll({json.dumps(sel.DIRECTORY_CARD)})].map(a => a.getAttribute('href'))")
    channels = list(dict.fromkeys(channels))[:CANDIDATES]
    if not channels:
        return [Check('directory lists live channels', False, 'no channel card')]

    # direct load: Page.navigate to the channel; skip channels behind the gate (logged out, mature-rated)
    gated = []
    for channel in channels:
        await session.navigate(TWITCH + channel)
        outcome = await lib.wait_for(tab, SETTLED, timeout=SETTLE)
        if outcome == 'gate':
            gated.append(channel)
            continue
        checks = await player_checks(tab, 'direct load', channel)
        break
    else:
        return [Check('a directory channel plays without the content gate', False, {'gated': gated})]

    # client-side navigation: load the directory, click the card of the same channel
    await session.navigate(TWITCH + DIRECTORY)
    await lib.wait_for(tab, f'!!document.querySelector({json.dumps(sel.DIRECTORY_CARD)})')
    clicked = await lib.read(tab, f"""(() => {{
      const cards = [...document.querySelectorAll({json.dumps(sel.DIRECTORY_CARD)})];
      const card = cards.find(a => a.getAttribute('href') === {json.dumps(channel)})
        || cards.find(a => !{json.dumps(gated)}.includes(a.getAttribute('href')));
      if (!card) return null;
      card.click();
      return card.getAttribute('href');
    }})()""")
    if not clicked:
        return checks + [Check('client-side navigation: channel card on the directory', False, 'no card to click')]
    if await lib.wait_for(tab, SETTLED, timeout=SETTLE) == 'gate':
        return checks + [Check('client-side navigation: channel without the content gate', False, clicked)]
    return checks + await player_checks(tab, 'client-side navigation', clicked)


async def player_checks(tab, way, channel):
    first = await lib.page_state(tab)
    await tab.sleep(SAMPLE)
    state = await lib.page_state(tab)
    workers = [w for w in state['workers'] if PLAYER_WORKER in (w.get('tail') or '')]
    summary = [{k: w.get(k) for k in ('at', 'viaInjector', 'purpleCode', 'purpleBoot', 'size', 'errors', 'messages')} for w in workers]
    video, before = state['video'] or {}, first['video'] or {}
    advanced = round((video.get('currentTime') or 0) - (before.get('currentTime') or 0), 1)
    log = worker_log_summary(state['workerLog'])
    return [
        Check(f'{way}: player workers created', bool(workers), {'channel': channel, 'workers': summary, 'hookAt': state['hookAt']}),
        Check(f'{way}: every player worker through the injector, running Purple, boot message seen',
              bool(workers) and all(w['viaInjector'] and w['purpleCode'] is True and w['purpleBoot'] for w in workers),
              {'workers': summary, 'hookAt': state['hookAt'], 'pageHook': state['pageHook']}),
        Check(f'{way}: video playing',
              video.get('readyState', 0) >= 3 and not video.get('paused', True) and advanced >= SAMPLE / 2,
              {'video': video, 'advanced': advanced, 'adOverlay': state['adOverlay'], 'workerLog': log, 'media': state['media'], 'playlists': state['playlists']}),
        Check(f'{way}: no player error', not state['playerError'] and not video.get('error'),
              {'overlay': state['playerError'], 'mediaError': video.get('error'), 'workerLog': log}),
    ]


def worker_log_summary(log):
    """Failures from inside the workers and the URLs requested, for the details of a failed check."""
    failures = [e for e in log if e.get('error') or e['kind'] in ('error', 'rejection') or e.get('level') == 'error'
                or (e['kind'] == 'fetch' and (e.get('status') or 0) >= 400)]
    urls = {}
    for e in log:
        if e['kind'] == 'fetch':
            urls.setdefault(f"{e['level']} {e['url']}", 0)
            urls[f"{e['level']} {e['url']}"] += 1
    return {'failures': failures[:30], 'fetches': urls, 'purple': [e['text'] for e in log if e['kind'] == 'console'][:40]}
