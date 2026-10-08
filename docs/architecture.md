# Architecture

## Execution contexts

| Context | File | Runs in |
| --- | --- | --- |
| Content script | `platform/src/content-script.js` | extension isolated world; reads `storage` and answers `getSettings`; on Firefox (MV2) also adds `app/bundle.js` to the page |
| Page | `serviceWorker/src/index.ts` (built into `bundle.js`) | twitch.tv main world, `document_start`: a `MAIN` world content script on Chromium, a `<script>` added by the content script on Firefox, `@run-at document-start` in the userscript |
| Worker | `serviceWorker/src/app.worker.ts` → `bootstrap.ts` + modules (built into `app.worker.js`) | inside the Twitch player worker, ahead of the original script |
| Popup | `platform/src/common/js/popup.js` | extension popup |

The userscript has no content script or popup: `bundle.js` is the whole script and settings use their defaults.

## Current flow

1. `app/bundle.js` runs in the page before Twitch's scripts create the player workers (T-111). On Firefox the content script adds it as a `<script>` without waiting for `storage`.
2. `index.ts` replaces `window.Worker`. When a worker is created, it downloads the script with a synchronous XHR and builds a blob with `app.worker.js` followed by the original script. If the download fails, the worker starts from the original URL.
3. The page answers `fetch` and XHR to `edge.ads.twitch.tv` with an empty 200 while `blockCsai` holds (`page/fetch-hook.ts`, `page/xhr-hook.ts`, T-301); on Chromium a static rule (`rules.json`, T-302) blocks what the hooks do not see. The content script sends the settings to the page as soon as storage answers, again when a worker asks, and whenever a stored setting changes (`storage.onChanged`, T-602).
4. Every worker built this way joins a `WorkerRegistry` (`page/worker-registry.ts`) after the page's first message to it (the player's init), and leaves it on `terminate()` (T-107). Nothing from Purple reaches a worker before that message. On a direct channel load the player creates two workers. The page `fetch` hook (`page/fetch-hook.ts`, T-106) is installed when the bundle loads; it reads only the `https://gql.twitch.tv/integrity` response, from a clone, and the request headers of `https://gql.twitch.tv/gql` calls (F-05, T-401), and gives every response to the page unchanged. With `forcePopoutToken`, it rewrites the `playerType` of the page's `PlaybackAccessToken` operations to `popout`, `picture-by-picture` excepted (F-12, T-408).
5. In the worker, `app.worker.ts` calls `bootstrapWorker(self)`, which keeps the original `fetch` as `self.request`, creates `AppController` and replaces `fetch` with a dispatcher over the `@Fetch` routes (first match in declaration order):
   - an ad URI Purple listed for the blank segment (F-14) → `onBlankSegment` → `BLANK_MP4`, with no request to Twitch (T-502);
   - `usher.ttvnw.net/api/channel/hls/` and `usher.ttvnw.net/api/v2/channel/hls/` (except `picture-by-picture`) → `onChannel` → `Player.setChannel` with the channel from the URL path (T-103); with `forcePopoutToken`, `parent_domains` leaves the request first (F-12, T-408); the request URL is kept for the backups' usher requests (F-08, T-404);
   - `ttvnw.net/v1/playlist/` → `onFetch` → `Player.onFetch`; an exception returns Twitch's playlist;
   - `picture-by-picture` → `onChannelPicture` → stores the PbP stream and returns an empty response.
6. `Player.onFetch` (classes from `ad-detector.ts`, T-201; with a stitched-ad marker, segments titled other than `live`, inside a `twitch-stitched-ad` range or under a non-live stream source are ads, T-203):
   - no stream stored for the channel (playlist before the usher) → original text;
   - `MARKED_LIVE` (markers over live segments) → original text, no backup lookup, no pause/play (T-202); a stitched break announced past the last segment (B-034) loses the prefetch, preload and part lines after the announcement, and their URIs are answered blank (F-14);
   - channel on the whitelist → original text (never reached in 2.6.7, C-10; the worker keeps the `setSettings` value since T-602);
   - no ads → original text (T-101);
   - ads → walks `backupPlayerTypes` (F-09: `site`, `popout`, `frontpage`, `picture-by-picture`, `mobile_web`, `embed`, then `autoplay` as `android` with `lowQualityFallback`; T-405), variants read with `m3u8-parser` (T-104) and picked in the quality and codec family of the variant the player polls (F-11, T-407); the first clean backup replaces the whole playlist: no ad segment and no stitched-ad marker, so a backup announcing its own break is skipped (T-204); a type without one gets a new token and is left out of the chain for 5 s; the type of the last clean backup goes first (F-10, T-406);
   - none clean → `mergeM3u8Contents` edits the main playlist's lines: each ad segment with a live backup segment less than half a segment away gets the nearest one's `#EXTINF` and URI lines, with that backup's `EXT-X-MAP` when it differs and the main one back after it (F-13, T-501); every other line stays (T-101); ad segments on both sides come from the detector (T-203);
   - ad segments left → with `stripFallback`, their lines stay and their URIs, with any `EXT-X-MAP` only they use, are answered with the blank segment; part, preload and prefetch lines that point at ad media go (F-14, T-502). This also covers the first poll of a break, before any backup token is ready.
7. When the ad state changes → pause and play on the player; with `reloadAfterAd`, a reload by the page at the end of a break (F-15, T-601).

## Current messages

| From → to | Message | Effect |
| --- | --- | --- |
| worker → page | `{ type: "getSettings" }` | page forwards `window.postMessage({ type: "getSettings" })`; the content script answers once `storage` has answered, with `whitelist`, `toggleProxy`, `proxyUrl`, `debug` (logs and events, C-09, F-17), `blockCsai`, `backupPlayerTypes`, `lowQualityFallback`, `pinBackupPlayerType`, `stripFallback`, `forcePopoutToken`, `reloadAfterAd` and `pausePlayDelayMs` |
| content script → page | `{ type: "setSettings", value }`, also on every change to a stored setting (T-602) | page sends `{ funcName: "setSettings", value }` to every registered worker; the worker's player keeps `value` |
| page → worker | `{ funcName: "setIntegrity", value }` | sent to every registered worker; the worker stores the integrity token |
| page → worker | `{ funcName: "setGqlHeaders", value }`, when a page GQL request changes one of the F-05 headers | sent to every registered worker; its token requests send them; a `Client-Integrity` among them becomes the integrity token (T-401) |
| page → worker | `{ funcName: "setGqlBridge", value: true }`, when the bundle loads | sent to every registered worker (replayed to later ones); its GQL requests go through the page from then on (T-402) |
| worker → page | `{ type: "gqlRequest", id, body, headers }` | the page runs it with its fetch from before Purple's hook and answers `{ funcName: "gqlResponse", value: { id, status, body } }` (or `status: 0, error`) to that worker; the worker sends the request itself after 5 s without an answer (T-402) |
| worker → page | `{ type: "pause" }`, `{ type: "play" }` | page sends `{ funcName: "pause" \| "play", id: 1 }` to the worker that asked (player's internal RPC) |
| worker → page | `{ type: "reload" }`, at the end of a break with `reloadAfterAd` | page runs a soft `setSrc` on Twitch's player state and answers `{ funcName: "reloadResult", value: { ok } }` to the worker that asked; with `ok: false` (no player state found) the worker pauses and plays (F-15, T-601) |
| player worker → page | `PlayerQualityChanged`, `arg.key === "quality"` | page sends `{ funcName: "setQuality", value }` to every registered worker |
| player worker → page | `arg.key === "state"` | page sends `{ funcName: <state> }` to the worker that sent it |
| worker → page | `{ type: "purpleEvent", event }`, only with `debug` on | page keeps the last 500 in `window.__purple.events`, created only with `debug` on (F-17) |

The last `setSettings`, `setIntegrity` and `setQuality` are replayed to a worker created later.

## Target flow

E-xx are existing strategies; F-xx and C-xx are features and fixes from `docs/feat.md`.

### Page (`index.ts`)

- Worker registry (C-07): every created worker is registered; settings, headers and quality messages go to every live worker.
- `fetch` and XHR hooks limited to target URLs (C-06):
  - Twitch GQL: captures headers (F-05) and rewrites the page token request to `popout` without `parent_domains` (F-12, PbP excluded);
  - `gql.twitch.tv/integrity`: captures the integrity token (E9);
  - `edge.ads.twitch.tv`: blocked (F-04).
- GQL executor for worker requests, using the page credentials (F-06).
- Ad break state machine (`ad-break.ts`, in the worker): pause/play (E6), optional reload (F-15).
- Player reload (F-15, T-601): the page finds Twitch's player state in the React tree under `#root` (a node with `setSrc` and `setInitialPlaybackSettings`, as Brave's script does) and calls `setSrc({ isNewMediaPlayerInstance: false, refreshAccessToken: false })`, then `play` on the media player instance. The worker cannot reach the player's React state, and a pause/play through the worker RPC does not reload the source, so the reload runs in the page. Chosen over a hard reload with a new token: a new token can bring a preroll.
- With `debug` on, worker events kept in `window.__purple.events` (F-17), read by the browser tests.

### Worker

```
intercepted fetch
 ├─ usher /channel/hls/ (v1 and v2) → stores channel, variants and usher params (C-03, C-04, F-08)
 ├─ picture-by-picture             → stores PbP stream (E10)
 └─ media playlist (URL from the master, or the v1/playlist pattern)
      └─ detector (F-02, F-03)
           ├─ NONE         → original text (F-01)
           ├─ MARKED_LIVE  → original text; the CSAI ad is handled by F-04
           └─ SSAI
                ├─ backups by playerType (E3, F-07..F-11) → first clean one replaces the playlist (E4)
                ├─ none clean → merge by time (E5, F-13)
                └─ ad segments left → their URIs answered with the blank segment in the worker (F-14)
```

Any exception on this path returns Twitch's original response (rule 5 in `CLAUDE.md`).
