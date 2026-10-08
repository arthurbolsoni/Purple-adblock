# Server behavior seen during the level 3 runs of 2026-10-07

Date: 2026-10-07, 20:47 to 22:04 (local time) · logged out · Edge 154.0.4258.62 · extension mode · Used by: `docs/server/`, Q-001, Q-003, Q-007, Q-008, T-201, L3-02

## Method

- Preroll presence per load, from the L3-01 runs on fresh profiles (TR-001, TR-005) between 20:47 and 21:58: Purple's backup step ran on that load (it runs only when the main playlist has ad markers). The run time is when its report was written.
- From 21:58 on, the recorder also logs what Twitch answered, before Purple sees it (`e2e/worker-logger.js`, `e2e/server.py`): a digest of every master and media playlist (tags, `DATERANGE` classes and attribute names, segment titles, hosts, counts; no values that identify the viewer), the flags of the page's own token (read from the usher URL), Purple's token answers, and the page's requests to `edge.ads.twitch.tv`. L3-02 runs (`python e2e/run.py L3-02`), one fresh profile per run, 40 s watched per load.

## Results

### Prerolls over time

| Time | Channel | Fresh-profile direct loads | With a preroll |
| --- | --- | --- | --- |
| 20:47 to 21:22 | the directory's first card, the same channel in every run | 14 | 13 |
| 21:24 to 21:58 | same channel | 15 | 2 |
| 21:59 to 22:04 | random among the first 8 cards: 3 channels | 4 | 0 |

When a direct load had a preroll, the second load in the same session (client-side navigation, L3-01) had ad markers too, in all 15 such runs; in one more run only the second load had them. What changed at about 21:24 was not found (the channel's own ad schedule, ad inventory and limits per address are all possible).

### Page token, logged out

The `token` parameter of the page's usher request carried, in all 7 loads recorded: `player_type: "site"`, `platform: "web"`, `version: 3`, `server_ads: true`, `show_ads: true`, `hide_ads: false`, `adblock: false`, `turbo: false`, `subscriber: false`, `partner: false`, `privileged: false`, `mature: false`, `https_required: true`, `blackout_enabled: false`, `ci_gb: false`, `extended_history_allowed: false`. None of these 7 loads had a preroll; the flags on a load with one are not recorded yet.

### Media playlists without ads

7 loads, 3 channels, 23 to 30 polls each:

- 14 segments per poll, every `#EXTINF` 2.000 with title `live`, `TARGETDURATION` 6;
- tags in every load: `EXT-X-VERSION`, `EXT-X-TARGETDURATION`, `EXT-X-MEDIA-SEQUENCE`, `EXT-X-TWITCH-ELAPSED-SECS`, `EXT-X-TWITCH-TOTAL-SECS`, `EXT-X-TWITCH-LIVE-SEQUENCE` (not in our docs before), `EXT-X-DATERANGE`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-TWITCH-PREFETCH` (2 per poll);
- `EXT-X-MAP` (fMP4) on 1 of the 3 channels, the one whose master says `CHANNEL-METADATA="multitrack_video,multigroup_video"` and whose backup masters say `enhanced_broadcast`; its variants are AVC. The other 2 channels served `.ts`;
- `DATERANGE` classes in every poll, with these attribute names: `timestamp` (`X-SERVER-TIME`), `twitch-session` (`X-TV-TWITCH-SESSIONID`), `twitch-stream-source` (`X-TV-TWITCH-STREAM-SOURCE`), and `twitch-trigger` (`X-TV-TWITCH-TRIGGER-URL`), all with `ID`, `START-DATE`, `END-ON-NEXT`. `twitch-trigger` was there with no ad segment and no `X-TV-TWITCH-AD-*` attribute.

### Client-side ads

No request to `edge.ads.twitch.tv` from the 7 channel pages loaded directly in L3-02. In 10 later L3-01 runs (dedicated profile, 5 per mode), the `/directory/all` page requested `edge.ads.twitch.tv/ads/format` and then `/ads`, both with `bp=midroll`, 0.5 to 1.5 s after it loaded, before the channel card was clicked: 2 requests per directory load, 20 in total. The 10 direct channel loads of those runs made none, nor did 2 more L3-02 loads. Query keys: `afmt`, `aid`, `bp`, `cb`, `did`, `dt`, `dur`, `gdprl`, `geoc`, `pbid`, `pid`, `pj`, `plat`, `sid`, `tcor`, `u`, `ulang`, `ws`, plus `vtype` on `/ads` (values not recorded).

### A preroll with the server digests on

L3-01 at 22:22, dedicated profile, extension mode, one channel: both loads (direct and client-side navigation) had a preroll.

| | Direct load | Client-side navigation |
| --- | --- | --- |
| Main playlist polls with ad segments | 6 of 6 | 6 of 6 |
| Segments per poll | 3, growing by one per poll to 8 | 3 to 5 |
| Backup playlist polls with ad segments | 5 of 8 | 3 of 7 |
| Polls that reached the player with ad segments | 2 of 5 | 2 of 6 |
| Backup token requests | `frontpage` 4, `picture-by-picture` 2 | `frontpage` 4, `picture-by-picture` 1 |

- Main playlist during the preroll: every title `Amazon|…`, `ROLL-TYPE` `PREROLL`, one `EXT-X-DISCONTINUITY`, no `EXT-X-TWITCH-PREFETCH`; ad segments came from the same `*.j.cloudfront.hls.ttvnw.net` host as the live segments.
- `DATERANGE` attribute names: `twitch-stitched-ad` with `DURATION` and the same 22 `X-TV-TWITCH-AD-*` attributes as on 2026-10-03; `twitch-ad-quartile` with `DURATION` and `X-TV-TWITCH-AD-QUARTILE`; `twitch-trigger` as without ads (`X-TV-TWITCH-TRIGGER-URL`).
- The backup tokens Purple got (`frontpage`, `picture-by-picture`) carried the same flags as the page token: `server_ads: true`, `show_ads: true`, `hide_ads: false`, `version: 3`. Their playlists were either live (14 segments, 2 `EXT-X-TWITCH-PREFETCH`) or inside the same kind of preroll (3 to 4 segments).
- The `picture-by-picture` master had 2 variants (360p, 160p); variant order in the `frontpage` masters changed between requests.
- Purple's result: in the polls where a backup was live, its playlist went to the player; in the others the ad segments stayed (no live backup segment for the same second).

### A midroll on a fresh profile

L3-02 at 22:30, fresh profile, logged out, extension mode with `debug` on: the channel opened inside a midroll.

| | Polls | With ad segments | Notes |
| --- | --- | --- | --- |
| Main playlist | 12 | 8 | `ROLL-TYPE` `MIDROLL`; 7 to 16 segments per poll, up to 16 ad segments; up to 3 `EXT-X-DISCONTINUITY`; `EXT-X-TWITCH-PREFETCH` present (up to 3) |
| Backup playlists (`frontpage` 4 tokens, `picture-by-picture` 1) | 12 | 0 | 7 live segments each; at least one poll carried a `twitch-stitched-ad` `DATERANGE` with `MIDROLL` while every segment was live |
| Playlists the player got | 12 | 0 | |

- No ad overlay in any of the 40 seconds sampled; the video played.
- Purple's events: `adDetected` 10, `backupUsed` with `frontpage` 6 and with `picture-by-picture` 3.
- The backup tokens had the same flags as the page token (`server_ads: true`, `show_ads: true`, `hide_ads: false`).
- Unlike the preroll at 22:22, where 5 of 8 backup polls had ad segments, no backup poll had any during this midroll.
- The summary kept only the union of `DATERANGE` classes over the polls; per-poll timelines of the main stream and the backups are recorded from this run on.

### Backups during a preroll, poll by poll

L3-01 at 22:36, dedicated profile, userscript mode, client-side navigation into a channel with a preroll; the first run with per-poll timelines.

| Time (ms) | Main playlist | Backup playlist |
| --- | --- | --- |
| 1305 to 10177 | 6 polls, `MEDIA-SEQUENCE` 0, 3 then 4, 5, 6, 7, 8 segments, every one an ad (`PREROLL`) | |
| 3517, 4339, 6491, 8303 | | `MEDIA-SEQUENCE` 0, 3 segments, all ads (`PREROLL`) |
| 8334 | | `MEDIA-SEQUENCE` 0, 4 segments, all ads |
| 6998, 8333, 8365 | | `MEDIA-SEQUENCE` 1713 to 1714, 14 live segments, no ad marker besides `twitch-trigger` |

- The main stream's preroll is a playlist of its own: `MEDIA-SEQUENCE` stays at 0 and it grows by one ad segment per poll.
- Each backup token Purple requested got either its own preroll from the start (`MEDIA-SEQUENCE` 0, 3 ad segments) or the live playlist with no preroll; 3 of 8 backup polls were live, and those went to the player (2 of 5 polls that reached the player still had ad segments).
- Inferred: a backup token is a new viewer session for the server, with its own preroll decision.

## Consequences

- `twitch-trigger` alone is not an ad marker; the detector (T-201) must not treat it as one.
- `EXT-X-TWITCH-PREFETCH` comes to logged-out viewers; T-101's line edits keep it, and T-502 must drop prefetch lines that point to ads.
- fMP4 with `EXT-X-MAP` is not limited to HEVC/AV1: an enhanced-broadcast channel served its AVC variants that way.
- Backups get their own prerolls: a backup token that came back live is worth keeping for the rest of the break (T-406), and a new token is a new chance of a preroll.

## Open

- What makes prerolls frequent or rare for a logged-out viewer (Q-001): more runs at other times, more channels.
- What `X-TV-TWITCH-TRIGGER-URL` points to (the value is not recorded).
