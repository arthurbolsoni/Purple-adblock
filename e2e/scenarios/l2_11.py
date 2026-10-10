"""L2-11: preroll whose page playlist numbers from 0 while the backups number the live sequence (B-029, B-039, T-818).

sim/ scenario l2-11-preroll-from-zero: L2-02's preroll, with the page's token (popout, F-12) numbering its playlist
from 0 at its first poll, as Twitch's preroll playlists do, and the backup tokens the live sequence. Purple plays the
preroll on a backup; after it the page's playlist lists numbers far below the backup's. With restartOnSequenceBack
(F-24, default on; L2_SETTINGS can turn it off) Purple restarts the player then (sequenceRestart) and the video plays
at the end; without it the player waits for numbers that do not come (2026-10-09, soak k: 17 minutes still).
"""
import json
import os

from scenarios import Check
from scenarios import level2
from scenarios.l2_09 import longest_still, waits

ID = 'L2-11'
TITLE = 'preroll whose page playlist numbers from 0, backups from the live sequence'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 65  # the preroll runs for the first 16 s of the page token's timeline


async def run(session):
    w = await level2.watch(session, 'l2-11-preroll-from-zero', WATCH)
    restart = json.loads(os.environ.get('L2_SETTINGS') or '{}').get('restartOnSequenceBack') is not False
    detail = {'restarts': [e.get('count') for e in w.events('sequenceRestart')], 'longestStill': longest_still(w.samples[5:]),
              'waiting': waits(w.state['media'] or []), 'backups': [e.get('playerType') for e in w.events('backupUsed')][:10],
              'samples': [s.get('currentTime') for s in w.samples]}
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('the preroll handled with a backup', bool(w.events('backupUsed')), detail),
        Check('restartOnSequenceBack (default on): the player restarted when the numbers went back', not restart or bool(w.events('sequenceRestart')),
              detail, skipped=not restart),
        Check('stalls during the run (observation)', True, detail),
    ]
