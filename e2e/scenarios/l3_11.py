"""L3-11: reload of the player at the end of a break (F-15, T-601), fresh profile and logged out as L3-02.

extension, `debug` on, `reloadAfterAd` set in chrome.storage.local before the channel opens. When Purple handled a
break (`adDetected`) that ended inside the run, the end asks the page for a reload (`reloadRequested`), the page finds
Twitch's player state and runs setSrc (`playerReloaded` with `ok`), and the video plays afterwards with no player
error. A load without a break, or with the break still on at the end, skips those checks. The seconds the video
stood still around the reload go in the details (docs/findings).
"""
import lib
from scenarios import Check
from scenarios import common

ID = 'L3-11'
TITLE = 'reload of the player at the end of a break (reloadAfterAd), fresh profile'
MODES = ('extension',)
FRESH_PROFILE = True
DEBUG = True
WATCH = 60    # seconds watched after the player settles
ENDED = 6000  # ms: a break whose last adDetected came this long before the end of the run is over


async def run(session):
    tab = session.tab
    await lib.set_storage(session, reloadAfterAd=True)
    channels = await common.directory_channels(session)
    channel, outcome, gated = await common.open_channel(session, channels, shuffle=True)
    if not channel:
        return [Check('a directory channel plays without the content gate', False, {'gated': gated})]

    samples = []
    for _ in range(WATCH):
        state = await lib.page_state(tab)
        video = state['video'] or {}
        samples.append({'at': await lib.read(tab, 'Date.now()'), 'adOverlay': state['adOverlay'], 'playerError': state['playerError'],
                        'readyState': video.get('readyState'), 'currentTime': video.get('currentTime'), 'paused': video.get('paused')})
        await tab.sleep(1)
    state = await lib.page_state(tab)
    common.observe_server(session, 'direct load', channel, state)
    end = samples[-1]['at']
    last = samples[-1]

    events = state['events'] or []
    ads = [e['at'] for e in events if e['type'] == 'adDetected']
    requested = [e['at'] for e in events if e['type'] == 'reloadRequested']
    results = [{'at': e['at'], 'ok': e.get('ok')} for e in events if e['type'] == 'playerReloaded']
    detail = {'channel': channel, 'outcome': outcome, 'adDetected': len(ads), 'firstAd': ads[0] if ads else None, 'lastAd': ads[-1] if ads else None,
              'reloadRequested': requested, 'playerReloaded': results, 'end': end,
              'stillSeconds': still_seconds(samples), 'samplesAroundReload': around(samples, requested)}

    checks = [
        common.worker_check('direct load', state),
        Check('video playing at the end', (last['readyState'] or 0) >= 3 and not last['paused'] and (last['currentTime'] or 0) > (samples[-4]['currentTime'] or 0),
              {'settled': outcome, 'last': last}),
        Check('no player error during the run', not any(s['playerError'] for s in samples), [s['playerError'] for s in samples if s['playerError']][:3]),
    ]
    if not ads or end - ads[-1] < ENDED:
        checks.append(Check('a break handled by Purple ended during the run', True, detail, skipped=True))
        return checks
    checks += [
        Check('break end: the worker asked for a reload', len(requested) >= 1 and requested[0] > ads[0], detail),
        Check('break end: the page found the player and reloaded it', bool(results) and all(r['ok'] for r in results), detail),
        Check('break end: no ad overlay', not any(s['adOverlay'] for s in samples), detail),
    ]
    return checks


def still_seconds(samples):
    # seconds sampled while the video's currentTime did not move forward
    return sum(1 for a, b in zip(samples, samples[1:]) if a['currentTime'] is not None and b['currentTime'] is not None and b['currentTime'] - a['currentTime'] < 0.5 and b['currentTime'] >= a['currentTime'])


def around(samples, requested):
    if not requested:
        return []
    at = requested[0]
    return [{k: s[k] for k in ('at', 'readyState', 'currentTime', 'paused')} for s in samples if at - 3000 <= s['at'] <= at + 8000]
