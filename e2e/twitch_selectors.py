"""CSS selectors for twitch.tv used by level 3. Named twitch_selectors (not selectors) so it does not
shadow the standard library module asyncio imports."""

# directory page: link of a live channel card
DIRECTORY_CARD = 'a[data-a-target="preview-card-image-link"]'

# player overlays (docs/findings/2026-10-07-e2e-harness.md)
AD_OVERLAY = '[data-a-target="video-ad-label"], [data-a-target="video-ad-countdown"]'
# network error text, e.g. "There was a network error. Please try again. (Error #2000)"
PLAYER_ERROR = '[data-a-target="player-overlay-content-gate"]'
# mature-rated channel; a logged-out viewer only gets "log in" and "create an account"
CONTENT_GATE = '[data-a-target="content-classification-gate-overlay"]'


def as_dict():
    return {k: v for k, v in globals().items() if k.isupper()}
