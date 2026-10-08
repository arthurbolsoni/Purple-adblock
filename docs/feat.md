# Features

Three groups: strategies that already exist (E-xx, none is removed), fixes to existing code (C-xx) and new features (F-xx). The Tasks column points to `docs/task.md`. "Brave" in the Origin column means the Twitch scriptlet Brave ships (`vaft-ublock-origin.js`, see `docs/research.md`).

## Existing strategies

| ID | Strategy | Where | State in 2.6.7 | Tasks |
| --- | --- | --- | --- | --- |
| E1 | Player worker injection (replaces `window.Worker`, prepends our code to the original script) | `index.ts`, `content-script.js` | on a direct channel load the hook often arrives after the player created its workers, so Purple does not run in them (late in 5 of 6 measured loads, C-11); synchronous XHR; only the first worker gets messages | T-107, T-111 |
| E2 | Worker `fetch` interception with `@Fetch` routes | `app.worker.ts`, `app.controller.ts` | `includes(null)`; usher `/api/channel/hls/` only, while the page requests `/api/v2/channel/hls/`: the channel is never stored and an ad playlist throws, which stops the player (Error #2000, [finding](findings/2026-10-07-e2e-harness.md)) | T-102, T-103 |
| E3 | Backup stream by requesting `PlaybackAccessToken` with another playerType (`frontpage`, `picture-by-picture`) | `player.ts`, `stream.ts`, `twitch.service.ts` | fixed hash, no page headers, duplicate requests; the variant regex expects `https://video…` URLs, current masters may use `*.playlist.ttvnw.net` (Q-013) | T-104, T-105, T-401 to T-407 |
| E4 | Replace the whole playlist with the first backup without ads | `player.ts` | kept | T-405 |
| E5 | Replace ad segments with backup segments that have the same `PROGRAM-DATE-TIME` | `m3u8.ts` | drops tags; compares at whole-second precision | T-101, T-501 |
| E6 | Pause and play when entering and leaving an ad (player's internal RPC) | `player.ts`, `index.ts` | kept | T-601 |
| E7 | Per-channel whitelist (popup + storage) | `popup.js`, `content-script.js` | never applies: the worker stores the whole `setSettings` message (C-10); would apply only after a page reload (both fixed by T-602) | T-602, T-603 |
| E8 | Backup in the quality selected in the player | `stream.types.ts`, `index.ts` | kept | T-407 |
| E9 | Integrity token capture from the `/integrity` call | `index.ts`, `page/fetch-hook.ts` | the hook reads every page response and rebuilds it (a 204/304 body throws in browsers); installed with the first worker, so a token from before it is lost | T-106, T-401 |
| E10 | Capture of the mini player's picture-by-picture stream | `app.controller.ts` (`onChannelPicture`) | kept | T-408 |
| E11 | Distribution: Chromium MV3, Firefox MV2, userscript | `cli/`, `platform/` | userscript build is manual | T-701, T-702 |
| E12 | Configurable proxy (`toggleProxy`, `proxyUrl`) | `popup.js` | UI not read by the worker since 2023 (#79) | Open decisions in `docs/task.md` |

## Fixes

| ID | Fix | Tasks |
| --- | --- | --- |
| C-01 | Playlist without ads passes through untouched; merge keeps non-ad tags | T-101 |
| C-02 | Router: no `includes(null)`; accepts `Request` and `URL` | T-102 |
| C-03 | Channel name from the usher URL (v1 and v2); a missing stream does not throw; an error while handling a media playlist returns Twitch's playlist | T-103 |
| C-04 | Master variants read with `m3u8-parser`; missing URL or network failure does not throw | T-104 |
| C-05 | One in-flight token request per playerType; no duplicate servers | T-105 |
| C-06 | Page hook limited to target URLs; 204/304 and binary responses untouched | T-106 |
| C-07 | Registry of every worker; messages reach every live worker | T-107 |
| C-08 | Segment title regex with escaped URI (or read from the parser) | T-108 |
| C-09 | Logs behind the `debug` flag | T-109 |
| C-10 | The worker stores the `setSettings` value, not the whole message, so the whitelist applies | T-602 |
| C-11 | Page hook installed before the player creates its workers, also on a direct channel load | T-111 |

## New features

| ID | Feature | Origin | Flag and default | Tasks |
| --- | --- | --- | --- | --- |
| F-01 | Playlist preserved (see C-01) | fix | - | T-101 |
| F-02 | Marker-based and per-segment detection | Brave | - | T-201 |
| F-03 | Ad break classification: `NONE`, `MARKED_LIVE`, `SSAI` | Brave | - | T-201, T-202 |
| F-04 | CSAI ad blocking (`edge.ads.twitch.tv`) in page `fetch` and XHR; DNR rule on Chromium | Brave | `blockCsai = true` | T-301, T-302 |
| F-05 | Capture of the page GQL headers | Brave | - | T-401 |
| F-06 | Backup GQL request executed in the page, worker request as fallback | Brave | - | T-402 |
| F-07 | Updated `PlaybackAccessToken` hash, falling back to the full query (`playbackAccessToken_Template`, already in the code) | Brave + Purple | - | T-403 |
| F-08 | Usher parameters from the original request reused for backups; `token` and `sig` encoded | Brave | - | T-404 |
| F-09 | Configurable playerType list, with `autoplay` (360p) as last resort | Brave + Purple | `backupPlayerTypes`, `lowQualityFallback = true` | T-405 |
| F-10 | The type that worked is tried first on the next break; a type that returned ads is skipped for 5 s | Brave | `pinBackupPlayerType = true` | T-406 |
| F-11 | Backup with the same codec and quality as the main stream | Brave | - | T-407 |
| F-12 | Page token requested as `popout` and usher without `parent_domains` (PbP excluded to keep E10) | Brave | `forcePopoutToken = true` | T-408 |
| F-13 | Merge with time tolerance and the `EXT-X-MAP` of each segment's source | Purple + fix | - | T-501 |
| F-14 | Last resort: ad segments replaced by a blank segment, numbering kept | Brave | `stripFallback = true` | T-502 |
| F-15 | Ad break state machine: pause/play (E6) and reload at most once every 30 s | Brave | `reloadAfterAd = false` | T-601 |
| F-16 | Settings applied without reloading the page | Purple | - | T-602 |
| F-17 | Debug event log in the page (`window.__purple.events`), read by the browser tests | Purple | `debug = false` | T-110 |

### F-02: markers

- Playlist level, read from `DATERANGE` attributes and tag names, not from the whole text: `ID` starting with `stitched-ad`, `CLASS` starting with `twitch-stitched`, `EXT-X-CUE-OUT`, `CLASS="twitch-maf-ad"`.
- Ad confirmation: `X-TV-TWITCH-AD-AD-SESSION-ID`, `X-TV-TWITCH-AD-RADS-TOKEN` on any `DATERANGE`.
- `CLASS="twitch-trigger"` counts only with an ad attribute: alone (with `X-TV-TWITCH-TRIGGER-URL`) it is in every playlist, with or without ads (B-021).
- Segment level: `#EXTINF` title containing `stitched`, `Amazon` or `DCM,` (Purple's current markers), and URIs containing `/adsquared/`, `/_404/` or `/processing`.
- Segment level, in a playlist with a stitched-ad marker (`CLASS` starting `twitch-stitched` or `ID` starting `stitched-ad`; T-203): a title other than `live` (ads titled `FT|…` or with a number, B-035), a segment more than half inside a `twitch-stitched-ad` `START-DATE` + `DURATION` (B-040), or a segment under a `twitch-stream-source` value other than `live`. `twitch-maf-ad` is not a stitched-ad marker.
- Not ads: `twitch-session`, `twitch-stream-source`, `twitch-ad-quartile`, `twitch-assignment`.
- Bare `stitched` keeps counting in the segment title and no longer counts across the whole playlist text. Brave's script dropped it from its playlist-level list because it matched non-ad content (comment above `AdSignifiers`).

### F-03: classification

| Class | Condition | Action |
| --- | --- | --- |
| `NONE` | no marker | original text |
| `MARKED_LIVE` | playlist marker, no ad segment | original text; the ad arrives through CSAI and is handled by F-04 |
| `SSAI` | at least one ad segment | backup chain (E3, E4), merge (E5), blank segment (F-14) |

A backup is usable when it has no ad segment and no stitched-ad marker (T-204). A backup with live segments under a stitched-ad marker announces its own break (B-034, B-036); it is skipped like one with ads (its server dropped, a new token for its type), and only its live segments serve the merge. Skipping was chosen over stripping the announcement:

- the announcement ends with prefetch lines that point at the backup's first ad segments;
- the same backup has ad segments two polls later;
- another type is often clean at the same time.

A backup with a `twitch-maf-ad` marker over live segments replaces the playlist like a clean one.

### F-09: default `backupPlayerTypes` order

`site`, `popout`, `frontpage`, `picture-by-picture`, `mobile_web`, `embed`. With `lowQualityFallback`, `autoplay` (requested with `platform: "android"`) is appended.

## Settings (`Setting`)

| Field | Type | Default | Used by |
| --- | --- | --- | --- |
| `whitelist` | `string[]` | `[]` | E7 |
| `toggleProxy` | `boolean` | `true` | E12 |
| `proxyUrl` | `string` | `""` | E12 |
| `debug` | `boolean` | `false` | C-09, F-17 |
| `blockCsai` | `boolean` | `true` | F-04 |
| `forcePopoutToken` | `boolean` | `true` | F-12 |
| `backupPlayerTypes` | `string[]` | see F-09 | F-09 |
| `lowQualityFallback` | `boolean` | `true` | F-09 |
| `pinBackupPlayerType` | `boolean` | `true` | F-10 |
| `stripFallback` | `boolean` | `true` | F-14 |
| `reloadAfterAd` | `boolean` | `false` | F-15 |

The content script sends the stored `whitelist`, `toggleProxy`, `proxyUrl`, `debug`, `blockCsai`, `backupPlayerTypes` and `lowQualityFallback` when storage first answers, when a worker asks, and whenever one of them changes (T-602). The worker replaces its settings with each message it gets. The userscript uses the defaults.

## Out of scope

- VODs (Brave's script does not handle them either).
- "Ad watched" spoofing: off by default in Brave's script because it may fingerprint the user.
- Banner and display ads: left to the general-purpose blocker (uBlock Origin, Brave Shields).
