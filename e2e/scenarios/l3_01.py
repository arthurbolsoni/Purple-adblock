"""L3-01: open a live channel picked from the directory, by direct load and by client-side navigation.

For each way in: every player worker was created through Purple's injector and runs Purple's code
(boot message seen); video playing; no player error (docs/tests.md, level 3).
"""
import json

import lib
import twitch_selectors as sel
from scenarios import Check
from scenarios import common

ID = 'L3-01'
TITLE = 'live channel from the directory, direct load and client-side navigation'
MODES = ('extension', 'userscript')

SAMPLE = 3  # seconds between the two reads that show currentTime advancing


async def run(session):
    tab = session.tab
    channels = await common.directory_channels(session)
    if not channels:
        return [Check('directory lists live channels', False, 'no channel card')]

    # direct load: Page.navigate to the channel; skip channels behind the gate (logged out, mature-rated)
    channel, _, gated = await common.open_channel(session, channels)
    if not channel:
        return [Check('a directory channel plays without the content gate', False, {'gated': gated})]
    checks = await player_checks(session, 'direct load', channel)

    # client-side navigation: load the directory, click the card of the same channel
    await session.navigate(common.TWITCH + common.DIRECTORY)
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
    if await lib.wait_for(tab, common.SETTLED, timeout=common.SETTLE) == 'gate':
        return checks + [Check('client-side navigation: channel without the content gate', False, clicked)]
    return checks + await player_checks(session, 'client-side navigation', clicked)


async def player_checks(session, way, channel):
    tab = session.tab
    first = await lib.page_state(tab)
    await tab.sleep(SAMPLE)
    state = await lib.page_state(tab)
    common.observe_server(session, way, channel, state)
    workers = common.player_workers(state)
    summary = [{k: w.get(k) for k in ('at', 'viaInjector', 'purpleCode', 'purpleBoot', 'size', 'errors', 'messages')} for w in workers]
    video, before = state['video'] or {}, first['video'] or {}
    advanced = round((video.get('currentTime') or 0) - (before.get('currentTime') or 0), 1)
    log = worker_log_summary(state['workerLog'])
    return [
        Check(f'{way}: player workers created', bool(workers), {'channel': channel, 'workers': summary, 'hookAt': state['hookAt']}),
        common.worker_check(way, state),
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
