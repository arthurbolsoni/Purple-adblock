# Behaviors

Evidence levels are defined in [README.md](README.md). "sim" is the `sim/` scenario that reproduces the behavior, or `-`.

| ID | Behavior | Evidence | Source | Details | sim |
| --- | --- | --- | --- | --- | --- |
| B-001 | The master playlist is served by `usher.ttvnw.net` under `/api/channel/hls/<channel>.m3u8` (2026-10-07: the page requested the v2 path, B-002; the 2026-10-03 session recorded the host only) | Observed | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [endpoints](endpoints.md#usher) | - |
| B-002 | The Twitch page requests the master from `usher.ttvnw.net/api/v2/channel/hls/<channel>.m3u8` | Observed (8 loads) | [e2e harness](../findings/2026-10-07-e2e-harness.md), Brave script | [endpoints](endpoints.md#usher) | - |
| B-003 | The master lists 5 variants and 23 `EXT-X-SESSION-DATA` lines; variant URLs are on `*.playlist.ttvnw.net` | Observed (1 channel) | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [playlists](playlists.md#master) | - |
| B-004 | Media playlists carry `EXT-X-TWITCH-ELAPSED-SECS`, `EXT-X-TWITCH-TOTAL-SECS`, `EXT-X-START`, `EXT-X-DATERANGE`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-DISCONTINUITY` | Observed | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [playlists](playlists.md#media) | - |
| B-005 | `EXT-X-TWITCH-PREFETCH` did not appear in a 30 s logged-out session | Observed (1 session) | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [playlists](playlists.md#media) | - |
| B-006 | Segments are MPEG-TS on `*.j.cloudfront.hls.ttvnw.net` | Observed | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [endpoints](endpoints.md#segments) | - |
| B-007 | A logged-out viewer opening a channel got a preroll stitched into the main playlist (SSAI) | Observed (1 session) | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [ads](ads.md#ssai) | - |
| B-008 | Ad segments have `#EXTINF` title `Amazon\|<id>`; live segments have `live` | Observed | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [ads](ads.md#markers) | - |
| B-009 | During an ad, the playlist has `DATERANGE` classes `twitch-stitched-ad`, `twitch-trigger`, `twitch-ad-quartile` and 22 `X-TV-TWITCH-AD-*` attributes | Observed | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [ads](ads.md#markers) | - |
| B-010 | Non-ad `DATERANGE` classes: `twitch-session`, `twitch-stream-source`, `timestamp` | Observed | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [playlists](playlists.md#media) | - |
| B-011 | Some breaks mark the playlist as an ad while segments stay live; the ad is fetched from `edge.ads.twitch.tv` (CSAI) | Reported (May 2026) | upstream changelog | [ads](ads.md#csai) | - |
| B-012 | Backup player types also return ads during a break | Reported (since March 2026) | upstream changelog, Brave script | [ads](ads.md#backup-player-types) | - |
| B-013 | The `parent_domains` usher parameter leads to "fake ads" | Reported | Brave script comment | [ads](ads.md#parent_domains) | - |
| B-014 | `PlaybackAccessToken` persisted query hash `ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9` | Reported | Brave script | [tokens](tokens.md#request) | - |
| B-015 | For `embed`, the token response comes as `{ streamPlaybackAccessToken }` without `data`, and GQL may answer "server error" from the twitch.tv origin | Reported | Brave script | [tokens](tokens.md#responses) | - |
| B-016 | The player binary is `assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.wasm`, fetched from the worker | Observed | [live traffic](../findings/2026-10-03-twitch-live-traffic.md) | [endpoints](endpoints.md#player-assets) | - |
| B-017 | On a direct load of a channel page, the player creates two workers 0.45 to 0.8 s after navigation start, each from a 98-byte blob script that runs `importScripts('https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.js')` | Observed (4 runs; script content on 2026-10-07) | [worker injection race](../findings/2026-10-04-worker-injection-race.md), [e2e harness](../findings/2026-10-07-e2e-harness.md) | [endpoints](endpoints.md#player-assets) | - |
