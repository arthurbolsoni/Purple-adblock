"""L2-03: SSAI midroll inside a clean stream (B-028, B-035; F-02 to F-15).

sim/ scenario l2-03-midroll: an 8-segment midroll titled with a 10-digit number, 30 s after the token's first poll;
site and popout tokens get it, frontpage and the rest play live. No ad segment reaches the player from sim/, Purple
pauses and plays at the break's edges (E6, F-15), the <video> reacting each time, and the video plays after it.
"""
from scenarios import Check
from scenarios import level2

ID = 'L2-03'
TITLE = 'SSAI midroll inside a clean stream'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 65  # the break runs from 30 to 46 s after the first poll


async def run(session):
    w = await level2.watch(session, 'l2-03-midroll', WATCH)
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('Purple saw the break (adDetected)', bool(w.events('adDetected')), {'events': len(w.events())}),
        Check('the break handled with a backup', bool(w.events('backupUsed')), {'backups': [e.get('playerType') for e in w.events('backupUsed')][:10]}),
        Check('pause/play at the start and at the end of the break', len(w.worker_pauses()) >= 2, {'pauses': w.worker_pauses()}),
        # E6 reaches the SDK's player: the page sends pause/play with the id of the player it created (0 here)
        Check('the <video> pauses or restarts within 1 s of each worker pause', all(reacted(w, p['at']) for p in w.worker_pauses()),
              {'pauses': [p['at'] for p in w.worker_pauses()], 'media': [(m['at'], m['event'], m['currentTime']) for m in w.state['media'] if m.get('event')][-12:]}),
    ]


def reacted(w, at):
    return any(m.get('event') in ('pause', 'canplay') and 0 <= m['at'] - at < 1000 for m in w.state['media'])
