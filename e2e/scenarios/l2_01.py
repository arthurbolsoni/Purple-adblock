"""L2-01: clean live stream on the isolated page (B-001, B-003, B-004, B-006; E1, T-101).

sim/ scenario l2-01-live: no break. Purple's bundle runs first on the page; the SDK's worker runs Purple; the page's
token comes back as `popout` (T-408); the video plays; no ad handling and no backup playlist polled, since the main
playlist never has ads; the only backup tokens are those of the prewarm at the page's usher request (F-22, T-812).
"""
from scenarios import Check
from scenarios import level2

ID = 'L2-01'
TITLE = 'clean live stream on the isolated page'
MODES = ('sim',)
FRESH_PROFILE = True  # the dedicated profile's Strict tracking prevention blocks usher.ttvnw.net for the 127.0.0.1 page
WATCH = 25


async def run(session):
    w = await level2.watch(session, 'l2-01-live', WATCH)
    sessions = w.log['sessions']
    return level2.base_checks(w) + [
        Check("the page's token request went as popout (T-408)", w.page.get('tokenPlayerType') == 'popout', {'tokenPlayerType': w.page.get('tokenPlayerType')}),
        Check("only the page's playlist polled; backup tokens only from the prewarm at the load (F-22)",
              len(w.polled_sessions()) == 1 and len(w.token_requests()) == 1 + w.prewarmed(),
              {'sessions': sessions, 'tokens': w.token_requests(), 'prewarmed': w.prewarmed()}),
        Check('no ad handling (no adDetected, backupUsed or blankInserted)', not [e for e in w.events() if e['type'] in ('adDetected', 'backupUsed', 'blankInserted')],
              {'events': w.events()[:10]}),
        Check('media playlists polled through the bridge', len(w.requests(path='/v1/playlist/')) >= 5, {'playlists': len(w.requests(path='/v1/playlist/'))}),
    ]
