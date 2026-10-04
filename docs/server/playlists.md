# Playlists

## Master

Observed on 2026-10-03, one channel, logged out ([finding](../findings/2026-10-03-twitch-live-traffic.md)).

| Tag | Count | Notes |
| --- | --- | --- |
| `#EXTM3U` | 1 | |
| `#EXT-X-SESSION-DATA` | 23 | keys not recorded yet (Q-011) |
| `#EXT-X-STREAM-INF` | 5 | one per variant; URL on the next line, host `*.playlist.ttvnw.net` |

`EXT-X-MEDIA` lines and the `STREAM-INF` attributes (`BANDWIDTH`, `RESOLUTION`, `CODECS`, `VIDEO`, `FRAME-RATE`) were not recorded in this session. Purple 2.6.7's variant regex expects `NAME="<quality>",AUTO...` followed by a `https://video...m3u8` URL.

## Media

Observed tags (same session):

| Tag | Notes |
| --- | --- |
| `#EXT-X-VERSION` | |
| `#EXT-X-TARGETDURATION` | |
| `#EXT-X-MEDIA-SEQUENCE` | |
| `#EXT-X-TWITCH-ELAPSED-SECS` | Twitch-specific |
| `#EXT-X-TWITCH-TOTAL-SECS` | Twitch-specific |
| `#EXT-X-START` | |
| `#EXT-X-DATERANGE` | classes listed below |
| `#EXT-X-DISCONTINUITY` | present during the preroll |
| `#EXT-X-PROGRAM-DATE-TIME` | |
| `#EXTINF` | title `live` or `Amazon\|<id>` ([ads](ads.md#markers)) |

`DATERANGE` classes seen: `twitch-stitched-ad`, `twitch-trigger`, `twitch-ad-quartile` (ad), `twitch-session`, `twitch-stream-source`, `timestamp` (not ad).

Not seen in that session: `#EXT-X-TWITCH-PREFETCH`, `#EXT-X-PART`, `#EXT-X-PRELOAD-HINT`, `#EXT-X-MAP` (B-005, Q-003, Q-007). The player's parser knows `EXT-X-TWITCH-PREFETCH`, `EXT-X-TWITCH-INFO` and `EXT-X-PREFETCH` ([IVS SDK finding](../findings/2026-10-03-ivs-player-sdk.md)).

## Segment URIs

- Absolute URLs on `*.j.cloudfront.hls.ttvnw.net`, `.ts`.
- Ad URI patterns reported by Brave's script: `/adsquared/`, `/_404/`, `/processing`. Not checked against the observed preroll yet (Q-012).
