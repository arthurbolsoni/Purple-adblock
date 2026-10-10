"""L2-07: GQL errors (B-014, B-015; T-403, F-07, F-09).

sim/ scenario l2-07-gql-errors: a PlaybackAccessToken asked by persisted-query hash gets PersistedQueryNotFound, and
embed gets a server error. Every type up to embed has the preroll and autoplay plays live. Purple asks again with the
full query, goes past embed and plays the autoplay backup; no ad segment reaches the player from sim/.
"""
from scenarios import Check
from scenarios import level2

ID = 'L2-07'
TITLE = 'GQL errors: PersistedQueryNotFound and a playerType error'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 45


async def run(session):
    w = await level2.watch(session, 'l2-07-gql-errors', WATCH)
    tokens = w.token_requests()
    retried = {t for t, how in tokens if how == 'hash'} & {t for t, how in tokens if how == 'query'}
    return level2.base_checks(w) + [
        Check('a token asked by hash got PersistedQueryNotFound and was asked again with the full query', bool(retried), {'tokens': tokens}),
        Check('embed asked, then autoplay', 'embed' in {t for t, _ in tokens} and 'autoplay' in {t for t, _ in tokens}, {'tokens': tokens}),
        Check('the autoplay backup used', 'autoplay' in {e.get('playerType') for e in w.events('backupUsed')},
              {'backups': [e.get('playerType') for e in w.events('backupUsed')][:10]}),
        Check('no ad segment requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
    ]
