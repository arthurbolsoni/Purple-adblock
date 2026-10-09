"""L2-10: midroll handled with backups that number the stream lower than the page's playlist (B-054, T-817).

sim/ scenario l2-10-page-numbered-ahead: L2-03's midroll, with the page's token (popout, F-12) numbering the stream 2
segments ahead of the backups, as the page's playlist does after a few stitched midrolls in a load. No ad segment
reaches the player, Purple plays the break on a backup, and the video plays after it. With alignBackupSequence on
(L2_SETTINGS, F-23), the first backup playlist the player gets lists a number past the newest of the last page
playlist; without it, that is only recorded. The longest still stretch, the <video> waiting events, E6's pauses and
the player's buffer each second go in the details.
"""
import json
import os
import re

from scenarios import Check
from scenarios import level2
from scenarios.l2_09 import longest_still, waits

ID = 'L2-10'
TITLE = 'midroll handled with backups numbered lower than the page playlist'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 65  # the break runs from 30 to 46 s after the first poll
SCENARIO = 'l2-10-page-numbered-ahead'
SESSION = re.compile(r'/v1/segment/(\d+)/')


def newest(playlists):
    """(session of its segments, MEDIA-SEQUENCE + segments + prefetch URIs - 1) of each playlist the player got."""
    out = []
    for p in playlists:
        text = p.get('text') or ''
        sequence = re.search(r'#EXT-X-MEDIA-SEQUENCE:(\d+)', text)
        session = SESSION.search(text)
        if sequence and session:
            count = len(re.findall(r'^#EXTINF:', text, re.M)) + len(re.findall(r'^#EXT-X-TWITCH-PREFETCH:', text, re.M))
            out.append((int(session.group(1)), int(sequence.group(1)) + count - 1))
    return out


def switch(playlists):
    """The newest number of the last page playlist before the first backup one, and of that backup playlist."""
    numbers = newest(playlists)
    for before, after in zip(numbers, numbers[1:]):
        if before[0] != after[0]:
            return {'main': before, 'backup': after}
    return None


async def run(session):
    w = await level2.watch(session, SCENARIO, WATCH)
    aligned = json.loads(os.environ.get('L2_SETTINGS') or '{}').get('alignBackupSequence') is True
    at_switch = switch(w.state.get('playlists') or [])
    detail = {'switch': at_switch, 'aligned': aligned, 'longestStill': longest_still(w.samples[5:]), 'waiting': waits(w.state['media'] or []),
              'backups': [e.get('playerType') for e in w.events('backupUsed')][:10], 'shifts': [e.get('count') for e in w.events('sequenceShifted')],
              'e6Pauses': len(w.worker_pauses()), 'samples': [s.get('currentTime') for s in w.samples], 'buffer': [s.get('buffer') for s in w.samples]}
    past = bool(at_switch) and at_switch['backup'][1] > at_switch['main'][1]
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('the break handled with a backup', bool(w.events('backupUsed')), detail),
        Check('alignBackupSequence: the first backup playlist lists a number past the last page playlist', not aligned or past,
              {'switch': at_switch, 'shifts': detail['shifts']}, skipped=not aligned),
        Check('stalls during the run (observation)', True, detail),
    ]
