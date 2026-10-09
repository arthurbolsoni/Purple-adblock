"""L2-09: midroll handled with a backup that is behind the main playlist (B-048, T-804).

sim/ scenario l2-09-backup-behind: L2-03's midroll, with the backups that play live (frontpage and the rest) 3 segments
behind the stream clock. No ad segment reaches the player, Purple plays the break on a backup, and the video plays
after it. The longest stretch the video stood still and the <video> waiting events go in the details (T-804: in soak d
the video waited 8 s inside a break after the first backup playlist had a lower MEDIA-SEQUENCE than the main one).
The environment variable L2_09_SCENARIO runs the same checks on another sim/ scenario (`l2-03-midroll`: the same break
with no backup behind) for a baseline.
"""
import os
import re

from scenarios import Check
from scenarios import level2

ID = 'L2-09'
TITLE = 'midroll handled with a backup 3 segments behind the main playlist'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 65  # the break runs from 30 to 46 s after the first poll
SCENARIO = 'l2-09-backup-behind'
# sim/'s live segment URIs: /v1/segment/<session>/<variant>/live/<global segment>.<ext>
LIVE = re.compile(r'/v1/segment/(\d+)/[^/]+/live/(\d+)\.')


def longest_still(samples):
    """Longest run of seconds the video's currentTime did not move forward (sampled once a second)."""
    longest = run = 0
    for a, b in zip(samples, samples[1:]):
        if a.get('currentTime') is not None and b.get('currentTime') is not None and 0 <= b['currentTime'] - a['currentTime'] < 0.5:
            run += 1
            longest = max(longest, run)
        else:
            run = 0
    return longest


def switch(playlists):
    """(session, newest live segment) of the last playlist the player got from the page's token before the first one
    from a backup token, and of that first backup playlist; None when the run has no switch."""
    newest = []
    for p in playlists:
        lines = (p.get('text') or '').splitlines()
        live = [LIVE.search(lines[i + 1]) for i, line in enumerate(lines) if line.startswith('#EXTINF') and i + 1 < len(lines)]
        live = [(int(m.group(1)), int(m.group(2))) for m in live if m]
        if live:
            newest.append(live[-1])
    for before, after in zip(newest, newest[1:]):
        if before[0] != after[0]:
            return {'main': before, 'backup': after}
    return None


def waits(media):
    """Each <video> `waiting` event and the ms until the next `playing`."""
    out = []
    for i, m in enumerate(media):
        if m.get('event') == 'waiting':
            back = next((n for n in media[i + 1:] if n.get('event') == 'playing'), None)
            out.append({'at': m['at'], 'currentTime': m.get('currentTime'), 'ms': back['at'] - m['at'] if back else None})
    return out


async def run(session):
    scenario = os.environ.get('L2_09_SCENARIO', SCENARIO)
    w = await level2.watch(session, scenario, WATCH)
    at_switch = switch(w.state.get('playlists') or [])
    detail = {'switch': at_switch, 'longestStill': longest_still(w.samples[5:]), 'waiting': waits(w.state['media'] or []),
              'backups': [e.get('playerType') for e in w.events('backupUsed')][:10], 'e6Pauses': len(w.worker_pauses()),
              'samples': [s.get('currentTime') for s in w.samples], 'buffer': [s.get('buffer') for s in w.samples],
              'latency': [s.get('latency') for s in w.samples], 'lowLatency': sorted({str(s.get('lowLatency')) for s in w.samples})}
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('the break handled with a backup', bool(w.events('backupUsed')), detail),
        # T-815: a sim/ build older than the scenario's `lag` serves the backups on the stream clock
        Check('the first backup playlist ends behind the last main one (sim/ applies the lag)',
              scenario != SCENARIO or (bool(at_switch) and at_switch['backup'][1] < at_switch['main'][1]), {'switch': at_switch},
              skipped=scenario != SCENARIO),
        Check('stalls during the run (observation)', True, detail),
    ]
