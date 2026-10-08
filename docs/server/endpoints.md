# Endpoints

All video endpoints are requested from the player worker. In Edge they are visible to CDP `Fetch` and not to the page `Network` domain ([finding](../findings/2026-10-03-twitch-live-traffic.md)).

## Usher

| Item | Value | Evidence |
| --- | --- | --- |
| Host | `usher.ttvnw.net` | Observed |
| Path | `/api/channel/hls/<channel>.m3u8` | Purple code (backup requests); the 2026-10-03 session recorded the host only (B-001) |
| Path, v2 | `/api/v2/channel/hls/<channel>.m3u8`, requested by the Twitch page | Observed (B-002) |
| Query built by Purple 2.6.7 | `allow_source`, `fast_bread`, `p`, `player_backend=mediaplayer`, `playlist_include_framerate`, `reassignments_supported`, `sig`, `supported_codecs=avc1`, `token` | Purple code |
| Query sent by the Twitch page | not recorded yet | Q-005 |
| `parent_domains` | present when embedded; Brave's script removes it | Reported (B-013) |
| Response | master playlist, see [playlists](playlists.md#master) | Observed |

## Media playlists

| Item | Value | Evidence |
| --- | --- | --- |
| Host | `<edge>.playlist.ttvnw.net` (seen: `sae11` to `sae13`) | Observed |
| Path | `/v1/playlist/<opaque>.m3u8` | Observed ([e2e harness](../findings/2026-10-07-e2e-harness.md)) |
| Path matched by Purple 2.6.7 | `ttvnw.net/v1/playlist/` | Purple code |
| Requests | 27 in a 30 s session, all variants together | Observed |
| Poll interval per variant | not measured | Q-002 |

## Segments

| Item | Value | Evidence |
| --- | --- | --- |
| Host | `<id>.j.cloudfront.hls.ttvnw.net` | Observed (B-006) |
| Container | MPEG-TS (`.ts`) | Observed |
| Requests | 18 in 30 s | Observed |
| fMP4 / `EXT-X-MAP` | not seen yet; expected on HEVC/AV1 channels | Q-007 |

## GQL

| Item | Value | Evidence |
| --- | --- | --- |
| URL | `https://gql.twitch.tv/gql` | Purple code, Brave script |
| `PlaybackAccessToken` | see [tokens](tokens.md) | Reported |
| Integrity | `https://gql.twitch.tv/integrity` | Purple code |

## Ads

| Item | Value | Evidence |
| --- | --- | --- |
| CSAI requests | `edge.ads.twitch.tv`, query `bp=preroll` or `bp=midroll` | Reported (B-011) |
| From the directory page | `GET /ads/format`, then `GET /ads`, `bp=midroll`; query keys `afmt`, `aid`, `bp`, `cb`, `did`, `dt`, `dur`, `gdprl`, `geoc`, `pbid`, `pid`, `pj`, `plat`, `sid`, `tcor`, `u`, `ulang`, `ws` (`/ads` adds `vtype`) | Observed (B-025) |

## Player assets

| Item | Value | Evidence |
| --- | --- | --- |
| Player binary | `assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.wasm` | Observed (B-016) |
| Worker script | blob of 98 bytes: `importScripts('https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.js')` | Observed (B-017) |
