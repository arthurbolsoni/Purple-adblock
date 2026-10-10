"""L2-12: preroll with a preroll on every web backup and slow playlists (B-052, B-056, T-823).

sim/ scenario l2-12-preroll-backups-slow: every web token gets the 8-segment preroll from its first poll, backups
included, as Twitch gives backup tokens asked during a preroll (B-052); only `autoplay` plays live. Each media playlist
is answered 440 ms after it was asked, the median of the backup loop's on twitch.tv (B-056). With parallelBackupFetch
(F-26, default on; L2_SETTINGS can turn it off) the types after the first are asked together and `autoplay` comes after
two playlists' time; without it, after one per type in F-09's order (2026-10-10, soaks m to o: 2.5 to 3.6 s).
"""
import json
import os

from scenarios import Check
from scenarios import level2

ID = 'L2-12'
TITLE = 'preroll on every web backup, slow playlists: time to the first backup'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 40


def first_requests(w, page_session):
    """The first media playlist request of each backup session, in ms from sim/'s start: (playerType, at)."""
    seen = {}
    for e in w.requests(path='/v1/playlist/'):
        if e.get('session') != page_session and e.get('session') not in seen:
            seen[e.get('session')] = (e.get('playerType'), e['at'])
    return sorted(seen.values(), key=lambda r: r[1])


async def run(session):
    w = await level2.watch(session, 'l2-12-preroll-backups-slow', WATCH)
    together = json.loads(os.environ.get('L2_SETTINGS') or '{}').get('parallelBackupFetch') is not False
    detected = next((e['at'] for e in w.events('adDetected')), None)
    used = next((e for e in w.events('backupUsed')), None)
    seconds = round((used['at'] - detected) / 1000, 2) if used and detected else None
    page_session = next((e.get('session') for e in w.requests(path='/v1/playlist/')), None)
    asked = first_requests(w, page_session)
    moving = next((i for i, s in enumerate(w.samples) if (s.get('currentTime') or 0) > 0 and not s.get('paused', True)), None)
    detail = {'firstBackupSeconds': seconds, 'firstBackup': used and used.get('playerType'), 'asked': asked,
              'firstSecondPlaying': moving, 'together': together}
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('the preroll handled with autoplay, the only type without it', bool(used) and used.get('playerType') == 'autoplay', detail),
        Check('parallelBackupFetch (default on): the first backup within 1.5 s of the first playlist with ads',
              not together or (seconds is not None and seconds < 1.5), detail, skipped=not together),
        Check('parallelBackupFetch off: one type after another, the first backup 2.5 s or more after it',
              together or (seconds is not None and seconds >= 2.5), detail, skipped=together),
    ]
