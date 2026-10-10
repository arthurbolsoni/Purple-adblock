"""L2-04: every backup playerType returns ads (B-012; F-14).

sim/ scenario l2-04-all-backups-ads: every token, backups included, gets the 8-segment preroll. With no clean backup,
Purple answers the ad segments with the blank segment in the worker, so none reaches sim/; the video plays after the
break.
"""
from scenarios import Check
from scenarios import level2

ID = 'L2-04'
TITLE = 'every backup playerType returns ads'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 40


async def run(session):
    w = await level2.watch(session, 'l2-04-all-backups-ads', WATCH)
    return level2.base_checks(w) + [
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('blank segments listed for the ads (blankInserted)', bool(w.events('blankInserted')), {'events': sorted({e['type'] for e in w.events()})}),
        Check('no backup used (every one had ads)', not w.events('backupUsed'), {'backups': [e.get('playerType') for e in w.events('backupUsed')]}),
        Check('backup tokens tried', len(w.token_requests()) > 1, {'tokens': w.token_requests()}),
    ]
