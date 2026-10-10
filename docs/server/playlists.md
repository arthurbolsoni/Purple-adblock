# Playlists

## Master

Observed on 2026-10-03, one channel, logged out ([finding](../findings/2026-10-03-twitch-live-traffic.md)).

| Tag | Count | Notes |
| --- | --- | --- |
| `#EXTM3U` | 1 | |
| `#EXT-X-SESSION-DATA` | 23 | keys not recorded yet (Q-011) |
| `#EXT-X-STREAM-INF` | 5 | one per variant; URL on the next line, host `*.playlist.ttvnw.net` |

`EXT-X-MEDIA` lines and the `STREAM-INF` attributes (`BANDWIDTH`, `RESOLUTION`, `CODECS`, `VIDEO`, `FRAME-RATE`) were not recorded in this session. Purple 2.6.7's variant regex expects `NAME="<quality>",AUTO...` followed by a `https://video...m3u8` URL.

The page's master on 2026-10-08 had the same 24 `EXT-X-SESSION-DATA` keys as on 2026-10-07 ([L3 recorder](../findings/2026-10-08-l3-recorder.md)).

The order of the variants changes from one master to the next, for the page's request and for backup tokens; the first `STREAM-INF` can be any quality (B-043, 2026-10-08).

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

`DATERANGE` classes seen: `twitch-stitched-ad`, `twitch-ad-quartile` (ad), `twitch-trigger` (during ads and, since 2026-10-07, also without them, B-021), `twitch-session`, `twitch-stream-source`, `timestamp` (not ad).

Not seen in that session: `#EXT-X-TWITCH-PREFETCH`, `#EXT-X-PART`, `#EXT-X-PRELOAD-HINT`, `#EXT-X-MAP` (B-005, Q-003, Q-007). The player's parser knows `EXT-X-TWITCH-PREFETCH`, `EXT-X-TWITCH-INFO` and `EXT-X-PREFETCH` ([IVS SDK finding](../findings/2026-10-03-ivs-player-sdk.md)).

2026-10-07, 7 logged-out loads on 3 channels, no ads ([finding](../findings/2026-10-07-l3-server-observations.md)):

| Item | Value |
| --- | --- |
| Segments per poll | 14, each `#EXTINF:2.000,live` |
| `EXT-X-TARGETDURATION` | 6 |
| Tags in every load | `EXT-X-VERSION`, `EXT-X-TARGETDURATION`, `EXT-X-MEDIA-SEQUENCE`, `EXT-X-TWITCH-ELAPSED-SECS`, `EXT-X-TWITCH-TOTAL-SECS`, `EXT-X-TWITCH-LIVE-SEQUENCE`, `EXT-X-DATERANGE`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-TWITCH-PREFETCH` (2 per poll) (B-022) |
| `EXT-X-MAP` | on the enhanced-broadcast channel only, AVC in fMP4 (B-023) |
| `DATERANGE` attributes | `timestamp`: `X-SERVER-TIME`; `twitch-session`: `X-TV-TWITCH-SESSIONID`; `twitch-stream-source`: `X-TV-TWITCH-STREAM-SOURCE`; `twitch-trigger`: `X-TV-TWITCH-TRIGGER-URL` (B-021); all with `ID`, `START-DATE`, `END-ON-NEXT` |

2026-10-07 and 08, soak sessions ([finding](../findings/2026-10-07-midroll-soak.md)): two more `DATERANGE` classes on live playlists, `twitch-maf-ad` (client-side ad slot, B-032) and `twitch-assignment` (`X-TV-TWITCH-CLUSTER`, `X-TV-TWITCH-NODE`, `X-TV-TWITCH-SERVING-ID`, no ad, B-038); `X-TV-TWITCH-STREAM-SOURCE` is `live` on live segments and the ad's title on ad segments (B-035); a playlist inside a break can hold up to 50 segments at a fixed `MEDIA-SEQUENCE` (B-034, B-039).

`EXT-X-TWITCH-PREFETCH` lines list the next segments before their `#EXTINF` lines; the player fetches the prefetch URI. On fMP4 streams the same position gets another URI when it becomes a segment line (B-046, 2026-10-08).

A backup token's media playlist came about 0.44 s after the worker asked for it (0.40 to 0.72 s, B-056); `sim/` answers media playlists after the scenario's `playlistDelayMs`.

### Sequence numbers and date-time

Each token's playlist numbers the stream from its own base, a segment's `PROGRAM-DATE-TIME` minus its sequence number x 2 s. Tokens asked at the same time share it. The page token's base moves at each stitched midroll it gets; backup tokens asked before keep theirs, so they give the same moment a lower number (B-054, 2026-10-09, [finding](../findings/2026-10-09-sequence-numbering.md)). Segment boundaries of two tokens can be about 1 s apart (`.910` and `.875` past the second on `/channel-d`).

## Segment URIs

- Absolute URLs on `*.j.cloudfront.hls.ttvnw.net`, `.ts`.
- Ad URI patterns reported by Brave's script: `/adsquared/`, `/_404/`, `/processing`. Not checked against the observed preroll yet (Q-012).
