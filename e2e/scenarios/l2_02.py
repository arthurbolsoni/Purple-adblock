"""L2-02: SSAI preroll (B-007, B-008, B-026; F-02 to F-14).

sim/ scenario l2-02-preroll: the page's token (popout, T-408) and new site and popout tokens get an 8-segment preroll
from their first poll; frontpage and the rest play live. No ad segment may reach sim/ (the player got none from the
network); Purple handles the break with a backup or blank segments; the video plays once the break is over.
"""
from scenarios import Check
from scenarios import level2

ID = 'L2-02'
TITLE = 'SSAI preroll on the isolated page'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 40


async def run(session):
    w = await level2.watch(session, 'l2-02-preroll', WATCH)
    handled = [e['type'] for e in w.events() if e['type'] in ('backupUsed', 'blankInserted', 'segmentsReplaced')]
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('Purple saw the break (adDetected)', bool(w.events('adDetected')), {'events': len(w.events())}),
        Check('the break handled with a backup, a merge or blank segments', bool(handled),
              {'handled': sorted(set(handled)), 'backups': [e.get('playerType') for e in w.events('backupUsed')][:10]}),
        Check('backup tokens requested besides the page token', len(w.token_requests()) > 1, {'tokens': w.token_requests()}),
    ]
