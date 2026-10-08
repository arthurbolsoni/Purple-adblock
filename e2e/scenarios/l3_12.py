"""L3-12: the break edges with a given wait between pause and play (E6, F-18, T-604), fresh profile, logged out.

extension, `debug` on, `pausePlayDelayMs` from the environment variable PURPLE_PAUSE_DELAY_MS (default 0) set in
chrome.storage.local before the channel opens. For each `pause` the worker posts (a break edge): when the <video>
fired `pause` and `playing`, the time between them and `currentTime` at `playing`. The video must play again after
every edge, with no player error and, for a break recorded in the main stream, no ad overlay. The edges go in the
details for the finding.
"""
import os

import lib
import server
from scenarios import Check
from scenarios import common

ID = 'L3-12'
TITLE = 'break edges with the pause/play wait set in storage (PURPLE_PAUSE_DELAY_MS), fresh profile'
MODES = ('extension',)
FRESH_PROFILE = True
DEBUG = True
WATCH = 60          # seconds watched after the player settles
RECOVERED = 5000    # ms from the <video> pause to playing for an edge to count as recovered


async def run(session):
    tab = session.tab
    delay = int(os.environ.get('PURPLE_PAUSE_DELAY_MS', '0'))
    await lib.set_storage(session, pausePlayDelayMs=delay)
    channels = await common.directory_channels(session)
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
    last = samples[-1]
    found = edges(state)
    detail = {'channel': channel, 'pausePlayDelayMs': delay, 'edges': found,
              'events': sorted({e['type'] for e in state['events'] or []})}

    checks = [
        common.worker_check('direct load', state),
        Check('video playing at the end', (last['readyState'] or 0) >= 3 and not last['paused'] and (last['currentTime'] or 0) > (samples[-4]['currentTime'] or 0),
              {'settled': outcome, 'last': last}),
        Check('no player error during the run', not any(s['playerError'] for s in samples), [s['playerError'] for s in samples if s['playerError']][:3]),
    ]
    if found:
        checks.append(Check('every break edge: the video plays again within 5 s', all(e['stoppedMs'] is not None and e['stoppedMs'] <= RECOVERED for e in found), detail))
    else:
        checks.append(Check('a break edge during the run', True, detail, skipped=True))
    if server.break_recorded(summary):
        checks.append(Check('break: no ad overlay', not any(s['adOverlay'] for s in samples), detail))
    return checks


def edges(state):
    """Each `pause` the worker posted, with the <video> `pause` after it and the next `playing`."""
    posted = sorted({m['at'] for w in state['workers'] or [] for m in w.get('messages') or []
                     if m.get('from') == 'worker' and m.get('type') == 'pause'})
    media = state['media'] or []
    found = []
    for at in posted:
        pause = next((m for m in media if m.get('event') == 'pause' and 0 <= m['at'] - at < 1000), None)
        playing = next((m for m in media if m.get('event') == 'playing' and m['at'] > at), None)
        found.append({
            'workerPauseAt': at,
            'videoPauseAfterMs': round(pause['at'] - at) if pause else None,
            'stoppedMs': round(playing['at'] - (pause['at'] if pause else at)) if playing else None,
            'currentTimeAtPause': pause['currentTime'] if pause else None,
            'currentTimeAtPlaying': playing['currentTime'] if playing else None,
            'waiting': sum(1 for m in media if m.get('event') == 'waiting' and at <= m['at'] <= (playing['at'] if playing else at + 10000)),
        })
    return found
