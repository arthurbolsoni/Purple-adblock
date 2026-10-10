"""L2-06: HEVC in fMP4 with EXT-X-MAP (Q-007 until observed; issue #105; T-101, T-407).

sim/ scenario l2-06-hevc: one HEVC variant in fMP4 with init.mp4; a preroll on the page's token, frontpage live. The
video plays with no page error; no ad segment, no ad init segment, reaches sim/.
"""
from scenarios import Check
from scenarios import level2

ID = 'L2-06'
TITLE = 'HEVC in fMP4 with EXT-X-MAP'
MODES = ('sim',)
FRESH_PROFILE = True
WATCH = 40


async def run(session):
    w = await level2.watch(session, 'l2-06-hevc', WATCH)
    return level2.base_checks(w) + [
        Check('no ad segment or ad init requested from sim/', not w.ad_segments_requested(), {'ads': w.ad_segments_requested()[:5]}),
        Check('init segments requested (EXT-X-MAP)', any(e['path'].endswith('/init.mp4') for e in w.requests(path='/v1/segment/')),
              {'segments': [e['path'] for e in w.requests(path='/v1/segment/')][:6]}),
    ]
