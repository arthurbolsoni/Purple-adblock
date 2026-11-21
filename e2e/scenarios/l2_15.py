"""L2-15: a midroll merged from backups while the page's playlist dates its segments apart from theirs (B-057, T-836).

sim/ scenario l2-15-merge-page-dated-earlier: a midroll of 12 segments on every token. The page's token gets it 15
segments after its first poll, a backup token at its own first poll (sim/ `breaksSooner`), so each backup Purple asks
during the page's break lists live segments up to the moment it was asked and ad segments from there: none is clean,
and Purple gives the page's playlist with its ad segments replaced by the backups' (E5). The backup types are `site`
and `embed` (SETTINGS; a `popout` backup would be the page's own type in sim/). The
page's token (popout, F-12) dates each segment 1.5 s earlier than the backup tokens (B-057). The merge matches an ad
segment with the backup's segment of its live number (F-27's alignByLiveSequence, the default): no live segment comes
twice. By date-time (before T-836's fix) the nearest backup segment was the one before, the one the player had just
fetched: it fetched it again, wrote its audio over itself and appended its video again, and the audio and video buffers
ended apart by a segment (docs/findings/2026-11-21-merge-by-live-number.md). The live segments the player requested from
sim/, the merges and the audio and video SourceBuffer ends (e2e/mse-hook.js) go in the details.
"""
import json
import os
import re

from scenarios import Check
from scenarios import level2
from scenarios.l2_09 import longest_still
from scenarios.l2_13 import again, lags, live_requests

ID = 'L2-15'
TITLE = 'midroll merged from backups with the page playlist dated earlier'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 75  # the page's break runs from 30 to 54 s after its first poll
# the backup types of this run, under whatever L2_SETTINGS adds
SETTINGS = {'backupPlayerTypes': ['site', 'embed'], 'lowQualityFallback': False}
SCENARIO = 'l2-15-merge-page-dated-earlier'


async def run(session):
    os.environ['L2_SETTINGS'] = json.dumps({**SETTINGS, **json.loads(os.environ.get('L2_SETTINGS') or '{}')})
    w = await level2.watch(session, SCENARIO, WATCH)
    requests = live_requests(w.log)
    repeated = again(requests)
    lag = lags(w.state.get('mse') or [])
    merged = [e.get('count') for e in w.events('segmentsReplaced')]
    detail = {'again': repeated, 'merged': merged, 'blank': len(w.events('blankInserted')), 'lagFirst': lag[:3], 'lagLast': lag[-3:], 'lagMin': min(lag) if lag else None, 'lagEnd': min(lag[-8:]) if lag else None,
              'backups': [e.get('playerType') for e in w.events('backupUsed')][:12], 'restarts': [e.get('count') for e in w.events('segmentRepeat')],
              'back': [e.get('count') for e in w.events('sequenceRestart')], 'longestStill': longest_still(w.samples[5:]), 'requests': [r[1:] for r in requests][-40:]}
    # at the end of the run: a blank segment (F-14) leaves the two ends apart for a moment, a segment fetched again for good
    apart = bool(lag) and min(lag[-8:]) < -1.0
    # the playlists given with segments of more than one token (the page's own and a backup's): number -> session/segment
    mixed = []
    for p in w.state.get('playlists') or []:
        text = p.get('text') or ''
        first = re.search(r'#EXT-X-MEDIA-SEQUENCE:(\d+)', text)
        uris = re.findall(r'^(?!#)(\S+)$', text, re.M)
        tails = ['/'.join(u.split('/')[-4:]).replace('/720p30', '').replace('/360p30', '') for u in uris]
        if first and len({t.split('/')[0] for t in tails if '/live/' in t or '/ad/' in t}) > 1:
            mixed.append({'at': p.get('at'), 'first': int(first.group(1)), 'segments': tails})
    detail['mixed'] = mixed[:3] + mixed[-2:]
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check("the page's playlist given merged with a backup's segments", bool(merged), detail),
        Check('audio and video SourceBuffers recorded', len(lag) > 10, {'lags': len(lag)}),
        Check('no live segment requested again', not repeated, detail),
        Check('audio and video ends within 1 s at the end', not apart, detail),
    ]
