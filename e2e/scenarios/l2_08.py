"""L2-08: L2-02 to L2-05 without Purple (control).

The isolated page with `purple=0` on the same sim/ scenarios: the player gets the ad segments from sim/ (preroll,
midroll, every type with ads) and the client-side ad request reaches edge.ads.twitch.tv. The page's token stays `site`.
"""
from scenarios import Check
from scenarios import level2

ID = 'L2-08'
TITLE = 'L2-02 to L2-05 without Purple (control)'
MODES = ('sim',)
FRESH_PROFILE = True
RUNS = (('l2-02-preroll', 30, ''), ('l2-03-midroll', 50, ''), ('l2-04-all-backups-ads', 30, ''), ('l2-05-csai', 20, '&csai=1'))


async def run(session):
    checks = []
    for scenario, seconds, extra in RUNS:
        w = await level2.watch(session, scenario, seconds, purple=False, extra=extra)
        checks.append(Check(f'{scenario}: page token stays site, no Purple worker', w.page.get('tokenPlayerType') == 'site' and not any(x.get('purpleCode') is True for x in w.state['workers'] or []),
                            {'tokenPlayerType': w.page.get('tokenPlayerType'), 'workers': len(w.state['workers'] or [])}))
        if scenario == 'l2-05-csai':
            checks.append(Check(f'{scenario}: the client-side ad request reached edge.ads.twitch.tv', bool(w.requests(host='edge.ads.twitch.tv')),
                                {'pageAnswer': w.page.get('csai'), 'edgeAds': len(w.requests(host='edge.ads.twitch.tv'))}))
        else:
            checks.append(Check(f'{scenario}: ad segments requested from sim/', bool(w.ad_segments_requested()), {'ads': len(w.ad_segments_requested())}))
    return checks
