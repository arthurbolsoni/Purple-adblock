"""L2-09: midroll handled with a backup that is behind the main playlist (B-048, T-804).

sim/ scenario l2-09-backup-behind: L2-03's midroll, with the backups that play live (frontpage and the rest) 3 segments
behind the stream clock. No ad segment reaches the player, Purple plays the break on a backup, and the video plays
after it. The longest stretch the video stood still and the <video> waiting events go in the details (T-804: in soak d
the video waited 8 s inside a break after the first backup playlist had a lower MEDIA-SEQUENCE than the main one).
The environment variable L2_09_SCENARIO runs the same checks on another sim/ scenario (`l2-03-midroll`: the same break
with no backup behind) for a baseline.
"""
import os

from scenarios import Check
from scenarios import level2

ID = 'L2-09'
TITLE = 'midroll handled with a backup 3 segments behind the main playlist'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 65  # the break runs from 30 to 46 s after the first poll


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


def waits(media):
    """Each <video> `waiting` event and the ms until the next `playing`."""
    out = []
    for i, m in enumerate(media):
        if m.get('event') == 'waiting':
            back = next((n for n in media[i + 1:] if n.get('event') == 'playing'), None)
            out.append({'at': m['at'], 'currentTime': m.get('currentTime'), 'ms': back['at'] - m['at'] if back else None})
    return out


async def run(session):
    w = await level2.watch(session, os.environ.get('L2_09_SCENARIO', 'l2-09-backup-behind'), WATCH)
    detail = {'longestStill': longest_still(w.samples[5:]), 'waiting': waits(w.state['media'] or []),
              'backups': [e.get('playerType') for e in w.events('backupUsed')][:10], 'samples': [s.get('currentTime') for s in w.samples]}
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('the break handled with a backup', bool(w.events('backupUsed')), detail),
        Check('stalls during the run (observation)', True, detail),
    ]
