"""L2-14: the page's playlist numbering the stream further ahead after the break (B-054, T-826).

sim/ scenario l2-14-page-renumbered-after-break: L2-13's midroll, with the page's token (popout, F-12) numbering the
stream 4 further ahead once the break is over, as on /channel-d on 2026-10-31. Purple gives the page's playlist back
untouched after the break (rule 3), and it lists the last segments the player got from the backup under the numbers
after its last. With restartOnRepeat (F-28, the default) Purple restarts the player then (segmentRepeat) and the audio
and video SourceBuffers end together at the end of the run; with it off (L2_SETTINGS {"restartOnRepeat": false}) the
player fetches those segments again and the video ends that many segments after the audio. The live segments the player
requested, the restarts and the lags go in the details.
"""
import json
import os

from scenarios import Check
from scenarios import level2
from scenarios.l2_09 import longest_still
from scenarios.l2_13 import again, lags, live_requests

ID = 'L2-14'
TITLE = "page playlist numbered further ahead after the break"
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 70  # the break runs from 30 to 46 s after the first poll
SCENARIO = 'l2-14-page-renumbered-after-break'


async def run(session):
    w = await level2.watch(session, SCENARIO, WATCH)
    restart = json.loads(os.environ.get('L2_SETTINGS') or '{}').get('restartOnRepeat') is not False
    lag = lags(w.state.get('mse') or [])
    tail = lag[-20:]
    repeats = [e.get('count') for e in w.events('segmentRepeat')]
    detail = {'restartOnRepeat': restart, 'repeats': repeats, 'again': again(live_requests(w.log)), 'lagTailMin': min(tail) if tail else None,
              'lagMin': min(lag) if lag else None, 'shifts': [e.get('count') for e in w.events('sequenceShifted')],
              'restarts': [e.get('count') for e in w.events('sequenceRestart')], 'pauses': len(w.worker_pauses()),
              'longestStill': longest_still(w.samples[5:]), 'samples': [s.get('currentTime') for s in w.samples]}
    together = bool(tail) and min(tail) > -1.0
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('the break handled with a backup', bool(w.events('backupUsed')), detail),
        Check('audio and video SourceBuffers recorded', len(lag) > 10, {'lags': len(lag)}),
        Check('restartOnRepeat (default on): a restart at the page playlist after the break, audio and video ends within 1 s at the end',
              not restart or (bool(repeats) and together), detail, skipped=not restart),
        Check('restartOnRepeat off: the segments fetched again and the ends apart (observation)', True, detail, skipped=restart),
    ]
