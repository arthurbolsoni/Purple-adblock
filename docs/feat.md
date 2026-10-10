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
| E6 | Pause and play when entering and leaving an ad (player's internal RPC) | `player.ts`, `index.ts` | kept; at the break edges behind `pausePlayOnBreaks`, off by default since T-809 (F-21) | T-601 |
| E7 | Per-channel whitelist (popup + storage) | `popup.js`, `content-script.js` | never applied: the worker stored the whole `setSettings` message (C-10) and it would apply only after a page reload (both fixed by T-602); the popup read the channel from `www.twitch.tv/<channel>` only, with its case (fixed by T-603) | T-602, T-603 |
| E8 | Backup in the quality selected in the player | `stream.types.ts`, `index.ts` | kept | T-407 |
| E9 | Integrity token capture from the `/integrity` call | `index.ts`, `page/fetch-hook.ts` | the hook reads every page response and rebuilds it (a 204/304 body throws in browsers); installed with the first worker, so a token from before it is lost | T-106, T-401 |
| E10 | Capture of the mini player's picture-by-picture stream | `app.controller.ts` (`onChannelPicture`) | kept | T-408 |
| E11 | Distribution: Chromium MV3, Firefox MV2, userscript | `cli/`, `platform/` | `bun run build` builds the worker, both zips and the userscript (T-701); a push to `main` publishes them as a release, a tag with a hyphen as a pre-release (T-702) | T-701, T-702 |
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
| C-12 | Pause and play (E6) go to the player the page created in that worker (the id of its `create` message), not always to id 1: the worker drops commands for an id it has no player for. On twitch.tv the main player is id 1 in the second worker, the first worker has player 0; the public IVS SDK's only player is 0 | - |
| C-13 | Pause and play go to the first player the page created in the worker, until the page deletes it: the picture-by-picture player the page creates later in the main player's worker (B-051) took them after C-12 ([finding](findings/2026-10-08-pbyp-player-pause.md)) | T-801 |

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
| F-09 | Configurable playerType list, the types that give 720p first, then `picture-by-picture` (360p), with `autoplay` (360p) as last resort | Brave + Purple | `backupPlayerTypes`, `lowQualityFallback = true` | T-405, T-819 |
| F-10 | The type that worked is tried first on the next break, except `autoplay` and `picture-by-picture` (360p, T-802); a type that returned ads is skipped for 5 s | Brave | `pinBackupPlayerType = true` | T-406, T-802 |
| F-11 | Backup with the same codec and quality as the main stream | Brave | - | T-407 |
| F-12 | Page token requested as `popout` and usher without `parent_domains` (PbP excluded to keep E10) | Brave | `forcePopoutToken = true` | T-408 |
| F-13 | Merge with time tolerance and the `EXT-X-MAP` of each segment's source | Purple + fix | - | T-501 |
| F-14 | Last resort: ad segments replaced by a blank segment, numbering kept | Brave | `stripFallback = true` | T-502 |
| F-15 | Ad break state machine: pause/play (E6) and reload at most once every 30 s | Brave | `reloadAfterAd = false` | T-601 |
| F-16 | Settings applied without reloading the page | Purple | - | T-602 |
| F-17 | Debug event log in the page (`window.__purple.events`), read by the browser tests | Purple | `debug = false` | T-110 |
| F-18 | Wait between `pause` and `play` at the break edges (E6) from a setting | Purple | `pausePlayDelayMs = 0` | T-604 |
| F-19 | Backup tokens requested when the page asks for a `picture-by-picture` master, a few seconds before a possible midroll (B-044), only for the backup types with no stored master (T-410). Soak e: the same blank segments, time to the first backup and token requests as without it at later midrolls. Soaks e and f, a channel's first midroll: `site` 720p as the first backup with it (7 of 7), the 360p `picture-by-picture` master without it (6 of 6) ([finding](findings/2026-10-08-prewarm-backups.md)) | Purple | `prewarmBackups = true` (since T-410; `false` before) | T-409, T-410 |
| F-20 | The ad's own `DATERANGE` lines (`twitch-stitched-ad`, `twitch-ad-quartile`) leave a playlist Purple delivers with blanked ad segments or an announced break: the page's ad UI started in 4 of the 5 soak breaks whose ad segments reached the player; in joins into a running midroll it showed 3 of 3 times with them and 0 of 3 without (T-811, [finding](findings/2026-10-08-ad-ui-on-early-breaks.md)) | Purple | `stripAdMarkers = true` (since T-811; `false` before) | T-811 |
| F-21 | E6 at the break edges behind a setting; the pause/play after a failed reload (F-15) stays. E6's restart avoided the wait at a switch to a backup numbered lower (T-816), which F-23 removes, and left the player about 1 s of buffer (T-814): soak j, 13 s still with E6 on against 3 s with F-23 and E6 off ([finding](findings/2026-10-09-sequence-numbering.md#soaks-i-and-j-twitchtv)) | Purple | `pausePlayOnBreaks = false` (since T-809; `true` before) | T-809 |
| F-22 | The page's usher request for a channel also brings F-19's prewarm (tokens for the backup types with no stored master), for midrolls announced in the first seconds of a load (T-810): no ad segment reached the player in 3 of 3 such midrolls with it, 2 to 3 polls and 6 s of still video in 2 of 2 without ([finding](findings/2026-10-09-prewarm-at-load.md)) | Purple | `prewarmAtLoad = true` (since T-812; `false` before) | T-812 |
| F-23 | A backup replacing the page's playlist gets the sequence numbers the page's playlist gives the same date-time: the page's playlist numbers the stream ahead of backups asked before it after its stitched midrolls (B-054), and the player, which asks for the number after its last segment, waited at the switch until the backup's numbers caught up, 3 to 7 s still when that took 2 s or more (T-816, [finding](findings/2026-10-09-sequence-numbering.md)) | Purple | `alignBackupSequence = true` (since T-817) | T-817 |
| F-24 | When the playlist given to the player comes from another source than the last one (the page's own or a backup variant) and its newest number is below the last one's, the player is restarted (E6's pause and play) once: after a preroll Purple played on backups, the page's playlist numbers from 0 (B-029, B-039) and the player waited for good with E6 off (soak k, 17 minutes; T-818, [finding](findings/2026-10-09-preroll-numbering.md)) | Purple | `restartOnSequenceBack = true` | T-818 |
| F-25 | At a switch of the playlist source, a clean backup that lists nothing past the player's newest number (after F-23) leaves the next types to be tried first, and is used only when none of them is ahead: a backup token asked a moment before was behind in time and the video stood still 2 s (soak j 16:08, T-820) | Purple | `skipBackupBehind = true` | T-820 |
| F-26 | When the first type in F-09's order gives no backup to use (ads, its own break announced, no master, or behind with F-25), the other types' playlists are asked at once and their answers taken in F-09's order; each type that gave none gets its new token and F-10's 5 s skip, as in the chain. At a preroll each web type's backup had ads of its own (B-052) and the chain waited for one type's playlist (0.44 s, B-056) before asking the next: 2.46 to 3.59 s to the player's first playlist in 31 prerolls (soaks m to o, T-823). L2-12: 0.92 to 0.93 s with it, 3.19 s without. Soak p: 0.95 to 1.37 s in 7 prerolls, the video moving 4.4 s after the master (median) against 6.5 s before | Purple | `parallelBackupFetch = true` | T-823 |

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
| `MARKED_LIVE` | playlist marker, no ad segment | original text; the ad arrives through CSAI and is handled by F-04. When the marker is a stitched break announced past the last segment (B-034), its prefetch, preload and part lines go and are answered blank (F-14) |
| `SSAI` | at least one ad segment | backup chain (E3, E4), merge (E5), blank segment (F-14) |

A backup is usable when it has no ad segment and no stitched-ad marker (T-204). A backup with live segments under a stitched-ad marker announces its own break (B-034, B-036); it is skipped like one with ads (its server dropped, a new token for its type), and only its live segments serve the merge. Skipping was chosen over stripping the announcement:

- the announcement ends with prefetch lines that point at the backup's first ad segments;
- the same backup has ad segments two polls later;
- another type is often clean at the same time.

A backup with a `twitch-maf-ad` marker over live segments replaces the playlist like a clean one.

### F-09: default `backupPlayerTypes` order

`site`, `popout`, `frontpage`, `mobile_web`, `embed`, `picture-by-picture`. With `lowQualityFallback`, `autoplay` (requested with `platform: "android"`) is appended. `picture-by-picture` came fourth until T-819: its masters have 360p only, and in a break whose backups announced breaks of their own Purple went from 720p to 360p and back every few seconds (25 switches in soaks h to l, one followed by 6 s of still video), while `mobile_web` gave 720p ([soak l](findings/2026-10-09-soak-l.md#the-decoder-log-and-the-frames-t-819)).

### F-05: page GQL headers

The page `fetch` hook reads the request headers of the page's `gql.twitch.tv/gql` calls: `Client-Integrity`, `X-Device-Id` (or `Device-ID`), `Authorization`, `Client-Version`, `Client-Session-Id`. It never reads their responses. When one of them changes, the page sends the known set to every worker (`setGqlHeaders`, replayed to workers created later). The worker's `PlaybackAccessToken` requests send them with `Client-ID`. A `Client-Integrity` from them and the `/integrity` answer (E9) both set the worker's integrity token; the newest wins.

### F-06: GQL executed in the page

Once the page offers its bridge (`setGqlBridge`, sent to every worker after the player's first message), the worker's `PlaybackAccessToken` requests go to the page as `{ type: "gqlRequest", id, body, headers }`. The page runs them with its own `fetch` from before Purple's hook, so the popout rewrite (F-12) leaves them alone, and answers `{ funcName: "gqlResponse", value: { id, status, body } }` to that worker. Answers are matched by `id`. With no answer within 5 s, or an answer with status 0 (the request failed in the page), the worker sends the request itself.

### F-08: backup usher request

A backup master comes from the page's own usher request for the channel: its path (`/api/channel/hls/` or `/api/v2/channel/hls/`) and its parameters, in their order and as written (`supported_codecs`, `play_session_id`, `acmb` and the rest), with `token`, `sig` and `p` replaced; `token` and `sig` go through `encodeURIComponent`. Before the page's usher request is seen, Purple's own parameters on the v1 path are used.

### F-11: backup variant

The target is the variant of the player's master that the polled media playlist belongs to: its quality name (without `(source)`), resolution and codecs. When the URL is not in the player's master, it is the quality the player reported (`setQuality`). In each backup master, the variant is:

1. the same quality in the same codec family (`avc`, `hevc`, `av1`);
2. else the same resolution, same family first, highest bandwidth first;
3. else the best variant of the same family;
4. else `bestQuality()`.

With a quality name only, the variant with that name comes first, then `bestQuality()`. `backupUsed` (F-17) names the quality of the variant used.

### F-12: page token as `popout`

With `forcePopoutToken`, the page `fetch` hook rewrites the `playerType` of the `PlaybackAccessToken` operations in the page's GQL bodies (single or batched) to `popout`; `picture-by-picture` operations stay (E10), and so does every other operation. In the worker, `parent_domains` leaves the page's usher request before it is sent, and so the backups' usher requests (F-08). Before the settings arrive, the page and the worker use the default (on).

### F-13: merge by time

Each ad segment the backups did not replace whole (E4) gets the nearest live segment of a backup whose `PROGRAM-DATE-TIME` is less than half the ad segment's duration away; backups are tried in order. Only the `#EXTINF` and URI lines change. A backup segment with another `EXT-X-MAP` brings that `EXT-X-MAP` line before its `#EXTINF`, and the main one comes back before the next main segment or the prefetch lines after the last one; a backup that uses `EXT-X-MAP` is not used in a playlist without one, nor the other way round. `MEDIA-SEQUENCE` and the segment count do not change.

### F-14: blank segment

As in Brave's script: the ad segments the merge left keep their lines in the playlist, and the worker answers their URIs with `BLANK_MP4`, an fMP4 init segment without samples (1137 bytes, copied with its source and notices in `blank-segment.ts`). Their requests never reach Twitch. The `EXT-X-MAP` only ad segments use is answered the same way. `EXT-X-PART` lines of an ad segment, and `EXT-X-PART`, `EXT-X-PRELOAD-HINT` and `EXT-X-TWITCH-PREFETCH` lines after an ad tail or a break announced after the last segment, are removed, and their URIs answered blank. A break announced past the last segment of a `MARKED_LIVE` playlist (B-034) gets the same treatment for the prefetch, preload and part lines after the announcement, the rest of the playlist untouched. A URI stays answered blank for 120 s after the last poll that listed it. `blankInserted` counts the segments blanked for the first time. With `stripFallback` off, the merged playlist goes to the player as it is.

### F-15: ad break state machine

`ad-break.ts` follows the main media playlist poll by poll: `idle` → `ad` on the first poll with ad segments, `ad` → `recovering` on the first poll without, `recovering` → `idle` after 10 s of polls without ad segments, `recovering` → `ad` when they come back first. With `pausePlayOnBreaks` (F-21, off by default since T-809), the player gets pause/play (E6) on each change to `ad` and at the end of the break: the worker posts `pause`, then `play` twice (right after it by default, `pausePlayDelayMs`, F-18). `MARKED_LIVE` polls are not part of it (T-202).

With `reloadAfterAd`, the end of the break asks the page to reload the player instead of pause/play, once per break and at most once every 30 s; a later end in the same break, or one inside the 30 s, gets pause/play. The page looks for Twitch's player state in the React tree under `#root` (the lookup copied from Brave's script, with its notices, in `page/player-reload.ts`), keeps the current quality in `video-quality` and runs a soft `setSrc` (same player instance, same access token), then `play`. When it finds no player state it answers so, and the worker pauses and plays instead. Brave's script also does a hard reload with a new token after breaks it blanked, and skips the reload when the player is healthy; Purple does neither.

### F-18: pause length

The wait between `pause` and `play` at each break edge (F-15) comes from `pausePlayDelayMs`: a number of ms from 0 up, else the default, 0. With 0, `play` is posted in the same turn as `pause`. The wait was 1500 ms from `10128a5` (500 before it) until soak d measured both on live midrolls: 0.19 to 1.05 s from `pause` to `playing` at 0 ms against 1.62 to 2.62 s at 1500 ms. The player restarts its timeline at 0 after the pause/play with any wait. Measured in [pause length](findings/2026-10-08-pause-length.md).

### F-23: backup sequence numbers

`sequence.ts`. Each page playlist without ad segments (and each one that only announces a break) sets the reference: its newest live segment's sequence number, `PROGRAM-DATE-TIME` and duration; a new page master clears it. A poll with ad segments does not move it: inside a break the page's own numbers move (B-054). When a backup replaces the page's playlist (E4), its `MEDIA-SEQUENCE` moves by the shift that gives each of its segments the number the page's playlist gives the moment where that segment ends, rounded up past 0.05 segment of date-time jitter: a backup segment starting inside a page segment gets the next number, so the player, at the end of what it fetched, gets the backup segment covering what follows. With no reference yet, the newest live segment before the ads of the current page playlist is used. The shift is computed once per backup variant and break, so the backup's numbers do not move between polls; the page's playlist after the break comes back untouched. Only the `MEDIA-SEQUENCE` line changes: `EXT-X-TWITCH-LIVE-SEQUENCE` numbers the live stream alike on every token, and the page's playlist runs ahead of it by the same shift (0 to 2 on `/channel-d`, 0 to 8 on `/channel-b`). `sequenceShifted` (F-17) carries the shift.

### F-24: restart when the numbers go back

`player.ts` keeps the source and the newest number (`MEDIA-SEQUENCE` + segments + prefetch URIs - 1, `newestNumber` in `sequence.ts`) of the last playlist it gave the player; a new page master clears them. The source is the page's for a playlist built from the page's own (as Twitch sent it, with an announced break edited, merged or blanked) and the backup variant URL for a backup that replaced it (E4). When the source changes and the newest number goes down, `sequenceRestart` (F-17, with the drop) and `pauseAndPlay` (E6's pause and play, with `pausePlayDelayMs`). The same source going down (prefetch lines removed at a break announcement) and a switch to equal or higher numbers do nothing; F-23 keeps the switches of a midroll at +1 or more.

### F-10: pinned and contaminated types

- With `pinBackupPlayerType`, the type of the last clean backup delivered moves to the front of the list; `autoplay` is never pinned and stays last. `picture-by-picture` (360p only) is not pinned either: a break that ended on it started the next midroll on its 360p master for 5 and 24 s (T-802).
- A type none of whose servers gave a clean backup (ad segments, or its own break announced, F-03) is skipped for 5 s: no playlist fetch and no token request. The token requested when it failed is used once the 5 s are over.

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
| `pausePlayDelayMs` | `number` | `0` | F-18 |
| `prewarmBackups` | `boolean` | `true` | F-19 |
| `stripAdMarkers` | `boolean` | `true` | F-20 |
| `pausePlayOnBreaks` | `boolean` | `false` | F-21 |
| `prewarmAtLoad` | `boolean` | `true` | F-22 |
| `alignBackupSequence` | `boolean` | `true` | F-23 |
| `restartOnSequenceBack` | `boolean` | `true` | F-24 |
| `skipBackupBehind` | `boolean` | `true` | F-25 |
| `parallelBackupFetch` | `boolean` | `true` | F-26 |

The content script sends the stored `whitelist`, `toggleProxy`, `proxyUrl`, `debug`, `blockCsai`, `backupPlayerTypes`, `lowQualityFallback`, `pinBackupPlayerType`, `stripFallback`, `forcePopoutToken`, `reloadAfterAd`, `pausePlayDelayMs`, `prewarmBackups`, `stripAdMarkers`, `pausePlayOnBreaks`, `prewarmAtLoad`, `alignBackupSequence`, `restartOnSequenceBack`, `skipBackupBehind` and `parallelBackupFetch` when storage first answers, when a worker asks, and whenever one of them changes (T-602). The worker replaces its settings with each message it gets. The userscript uses the defaults.

## Out of scope

- VODs (Brave's script does not handle them either).
- "Ad watched" spoofing: off by default in Brave's script because it may fingerprint the user.
- Banner and display ads: left to the general-purpose blocker (uBlock Origin, Brave Shields).
