"""L3-02: preroll on a live channel (TR-001, TR-005: logged out, a fresh profile for every run).

Always: every player worker runs Purple, no player error, video playing at the end. For a break recorded in the
main stream (ad segments in the playlists Twitch served): no ad overlay during the run and no ad segment in the
playlists the player got from Purple (docs/tests.md, level 3).
"""
from collections import Counter

import lib
import server
from scenarios import Check
from scenarios import common

ID = 'L3-02'
TITLE = 'preroll on a live channel, fresh profile (TR-001, TR-005)'
MODES = ('extension',)
FRESH_PROFILE = True
DEBUG = True  # Purple's events (window.__purple.events) go in the details of the break checks
WATCH = 40  # seconds watched after the player settles


async def run(session):
    tab = session.tab
    channels = await common.directory_channels(session)
    # a random card: prerolls depend on the channel (one channel went from prerolls on 13 of 14 loads to 2 of 15)
    channel, outcome, gated = await common.open_channel(session, channels, shuffle=True)
    if not channel:
        return [Check('a directory channel plays without the content gate', False, {'gated': gated})]

    samples = []
    for _ in range(WATCH):
        state = await lib.page_state(tab)
        video = state['video'] or {}
        samples.append({'adOverlay': state['adOverlay'], 'playerError': state['playerError'], 'readyState': video.get('readyState'),
                        'currentTime': video.get('currentTime'), 'paused': video.get('paused')})
        await tab.sleep(1)
    state = await lib.page_state(tab)
    summary = common.observe_server(session, 'direct load', channel, state)
    last, first = samples[-1], samples[0]
    overlay_seconds = sum(1 for s in samples if s['adOverlay'])

    checks = [
        common.worker_check('direct load', state),
        Check('video playing at the end', (last['readyState'] or 0) >= 3 and not last['paused'] and (last['currentTime'] or 0) > (samples[-4]['currentTime'] or 0),
              {'settled': outcome, 'first': first, 'last': last}),
        Check('no player error during the run', not any(s['playerError'] for s in samples), [s['playerError'] for s in samples if s['playerError']][:3]),
    ]
    events = Counter((e.get('type'), e.get('playerType')) for e in state['events'] or [])
    purple = {'events': {f'{t}{":" + p if p else ""}': n for (t, p), n in events.items()}, 'debug': state['events'] is not None}
    if server.break_recorded(summary):
        checks += [
            Check('break: no ad overlay', overlay_seconds == 0, {'secondsWithOverlay': overlay_seconds, 'of': len(samples), 'purple': purple}),
            # an ad segment Purple answers with the blank segment (T-502) stays listed but never leaves the worker
            Check('break: no ad media reached the player (no ad segment delivered, or none fetched from the network)',
                  summary['delivered']['pollsWithAds'] == 0 or summary['adMedia']['fromNetwork'] == 0,
                  {'main': summary['main'], 'delivered': summary['delivered'], 'adMedia': summary['adMedia'], 'backups': summary['backups'], 'purple': purple}),
        ]
    else:
        checks.append(Check('break recorded in the main stream', True, {'main': summary['main'], 'secondsWithOverlay': overlay_seconds}, skipped=True))
    return checks
