"""L2-13: midroll with a page playlist that dates its segments earlier than the backups' (B-057, T-826).

sim/ scenario l2-13-page-dated-earlier: L2-10's midroll, with the page's token (popout, F-12) numbering the stream 2
segments ahead of the live sequence (B-054) and dating each segment 1 s earlier than the backup tokens (B-057). With
alignByLiveSequence (F-27, the default) F-23 numbers the backup by EXT-X-TWITCH-LIVE-SEQUENCE: at the switch the player
gets the live segment after the last it fetched. With it off (L2_SETTINGS {"alignByLiveSequence": false}) F-23 numbers
it by date-time, the backup's copy of the page's newest segment takes the next number and the player fetches that
segment again; the player writes its audio over itself and appends its video again, and the audio and video buffers
end apart by a segment (docs/findings/2026-10-31-same-segment-twice.md). The live segments the player requested from
sim/ and the audio and video SourceBuffer ends (e2e/mse-hook.js) go in the details.
"""
import json
import os
import re

from scenarios import Check
from scenarios import level2
from scenarios.l2_09 import longest_still

ID = 'L2-13'
TITLE = 'midroll with a page playlist dated earlier than the backups'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 65  # the break runs from 30 to 46 s after the first poll
SCENARIO = 'l2-13-page-dated-earlier'
LIVE = re.compile(r'^/v1/segment/(\d+)/([^/]+)/live/(\d+)\.(?:ts|m4s|mp4)$')


def live_requests(log):
    """(ms, session, variant, global segment) of each live segment the player requested from sim/, in order."""
    out = []
    for e in log['log']:
        m = LIVE.match(e['path'])
        if m:
            out.append((e['at'], int(m.group(1)), m.group(2), int(m.group(3))))
    return out


def again(requests):
    """Requests of a segment at or below the newest one requested before (the player got it again), after the first 10."""
    out, newest = [], None
    for i, (at, session, variant, segment) in enumerate(requests):
        if newest is not None and segment <= newest and i >= 10:
            out.append({'at': at, 'session': session, 'variant': variant, 'segment': segment, 'newest': newest})
        newest = segment if newest is None else max(newest, segment)
    return out


def lags(mse):
    """Audio end minus video end after each append, from the SourceBuffers e2e/mse-hook.js saw in the page's player."""
    kinds, ends, out = {}, {}, []
    for r in mse:
        key = (r.get('scope'), r['sb'])
        if r['op'] == 'add':
            kinds[key] = 'audio' if 'mp4a' in r.get('type', '') and 'avc1' not in r.get('type', '') else 'video' if 'avc1' in r.get('type', '') and 'mp4a' not in r.get('type', '') else 'both'
            continue
        if r['op'] != 'append' or not r.get('ranges') or kinds.get(key) not in ('audio', 'video'):
            continue
        ends[kinds[key]] = r['ranges'][-1][1]
        if len(ends) == 2:
            out.append(round(ends['audio'] - ends['video'], 3))
    return out


async def run(session):
    w = await level2.watch(session, SCENARIO, WATCH)
    by_live = json.loads(os.environ.get('L2_SETTINGS') or '{}').get('alignByLiveSequence') is not False
    requests = live_requests(w.log)
    repeated = again(requests)
    lag = lags(w.state.get('mse') or [])
    detail = {'byLive': by_live, 'again': repeated, 'lagFirst': lag[:3], 'lagLast': lag[-3:], 'lagMin': min(lag) if lag else None,
              'shifts': [e.get('count') for e in w.events('sequenceShifted')], 'backups': [e.get('playerType') for e in w.events('backupUsed')][:10],
              'longestStill': longest_still(w.samples[5:]), 'requests': [r[1:] for r in requests][-40:]}
    apart = bool(lag) and min(lag) < -1.0
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('the break handled with a backup', bool(w.events('backupUsed')), detail),
        Check('audio and video SourceBuffers recorded', len(lag) > 10, {'lags': len(lag)}),
        Check('alignByLiveSequence (default on): no live segment requested again, audio and video ends within 1 s', not by_live or (not repeated and not apart),
              detail, skipped=not by_live),
        Check('alignByLiveSequence off: by date-time, a live segment requested again and audio and video ends a segment apart (observation)', True,
              detail, skipped=by_live),
    ]
