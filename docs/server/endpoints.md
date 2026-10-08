# Endpoints

All video endpoints are requested from the player worker. In Edge they are visible to CDP `Fetch` and not to the page `Network` domain ([finding](../findings/2026-10-03-twitch-live-traffic.md)).

## Usher

| Item | Value | Evidence |
| --- | --- | --- |
| Host | `usher.ttvnw.net` | Observed |
| Path | `/api/channel/hls/<channel>.m3u8` | Purple code (backup requests); the 2026-10-03 session recorded the host only (B-001) |
| Path, v2 | `/api/v2/channel/hls/<channel>.m3u8`, requested by the Twitch page | Observed (B-002) |
| Query built by Purple 2.6.7 | `allow_source`, `fast_bread`, `p`, `player_backend=mediaplayer`, `playlist_include_framerate`, `reassignments_supported`, `sig`, `supported_codecs=avc1`, `token` | Purple code |
| Query sent by the Twitch page | 22 keys on 2026-10-08: `acmb`, `allow_source`, `browser_family`, `browser_version`, `cdm`, `enable_score`, `fast_bread`, `include_unavailable`, `lang`, `os_name`, `os_version`, `p`, `platform`, `play_session_id`, `player_backend`, `player_version`, `playlist_include_framerate`, `reassignments_supported`, `sig`, `supported_codecs`, `token`, `transcode_mode` (values not recorded) | Observed (soak worker log) |
| Values sent by the Twitch page | 2026-10-08, logged out, Edge 154: `acmb` (base64 JSON: `AppVersion`, `ClientApp` `twilight`, the page URL), `allow_source=true`, `browser_family=edge`, `browser_version=154.0`, `cdm=wv`, `enable_score=true`, `fast_bread=true`, `include_unavailable=true`, `lang=en`, `os_name=Windows`, `os_version=NT 10.0`, `platform=web`, `player_backend=mediaplayer`, `player_version=1.57.0-rc.2`, `playlist_include_framerate=true`, `reassignments_supported=true`, `supported_codecs=av1,h265,h264`, `transcode_mode=cbr_v1`; `token`, `sig`, `play_session_id` and `p` not recorded in the repo | Observed ([L3 recorder](../findings/2026-10-08-l3-recorder.md)) |
| Path, recorded video | `/vod/v2/<id>.m3u8`, requested by the page of an offline channel after the channel request got 404; its media playlists are `d1m7jfoe9zdc1j.cloudfront.net/<id>/<quality>/index-dvr.m3u8` | Observed (B-050) |
| Backup requests since T-404 | the page's request with `token`, `sig` and `p` replaced; the v2 path answers every playerType token | Observed (B-041) |
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
| fMP4 / `EXT-X-MAP` | 2026-10-08: on an H.264 channel too: init segments `video/mp4`, media segments `application/octet-stream`, no `content-length` | Observed ([L3 recorder](../findings/2026-10-08-l3-recorder.md)) |
| Which URI the player fetches | the `EXT-X-TWITCH-PREFETCH` one; on fMP4 it differs from the URI the same position gets later as a segment line | Observed (B-046) |
| `POST` `<id>.rufio.hls.live-video.net/v1/segment/<token>` | sent by the player, answered 204 | Observed (B-047) |

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
| From a channel page, after a `twitch-maf-ad` marker | `GET /ads`, `bp=midroll`, 4 per marker; answers 204 (empty), 200 VAST XML (inline video ads), or 200 JSON with an HTML display creative (keys `creativeHtml`, `imp`, `width`, `height`, `cat`, `adv`, `crid`, `returnedAdFormat`, `updatedMafsDecision`, `transparencyInfo`, `adId`, `programId`, `adFeedbackInfo`, `creativeCfId`, `radsToken`) | Observed (B-033) |

## Player assets

| Item | Value | Evidence |
| --- | --- | --- |
| Player binary | `assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.wasm` | Observed (B-016) |
| Worker script | blob of 98 bytes: `importScripts('https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.js')` | Observed (B-017) |
