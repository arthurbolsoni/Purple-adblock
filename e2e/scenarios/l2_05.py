"""L2-05: CSAI slot, markers with live segments (B-011, B-032; T-202, F-04).

sim/ scenario l2-05-csai: a twitch-maf-ad marker over live segments, no ad segment. The page makes the client-side
ad request Twitch's page makes during such a slot (`csai=1`). Purple leaves the playlist alone (MARKED_LIVE: no
backup lookup, no ad handling) and answers the edge.ads.twitch.tv request in the page, so it never reaches sim/.
"""
from scenarios import Check
from scenarios import level2

ID = 'L2-05'
TITLE = 'CSAI slot: markers over live segments and the client-side ad request'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 25


async def run(session):
    w = await level2.watch(session, 'l2-05-csai', WATCH, extra='&csai=1')
    return level2.base_checks(w) + [
        Check("no backup playlist polled; backup tokens only from the prewarm at the load (F-22)",
              len(w.polled_sessions()) == 1 and len(w.token_requests()) == 1 + w.prewarmed(),
              {'tokens': w.token_requests(), 'prewarmed': w.prewarmed(), 'sessions': w.log['sessions']}),
        Check('no ad handling (no adDetected, backupUsed or blankInserted)', not [e for e in w.events() if e['type'] in ('adDetected', 'backupUsed', 'blankInserted')],
              {'events': sorted({e['type'] for e in w.events()})}),
        Check('the page asked edge.ads.twitch.tv and Purple answered it in the page (csaiBlocked)', w.page.get('csai') is not None and bool(w.events('csaiBlocked')),
              {'pageAnswer': w.page.get('csai'), 'csaiBlocked': w.events('csaiBlocked')}),
        Check('no request reached edge.ads.twitch.tv', not w.requests(host='edge.ads.twitch.tv'), {'edgeAds': w.requests(host='edge.ads.twitch.tv')[:3]}),
    ]
