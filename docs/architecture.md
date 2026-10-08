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
3. Every worker built this way joins a `WorkerRegistry` (`page/worker-registry.ts`) after the page's first message to it (the player's init), and leaves it on `terminate()` (T-107). Nothing from Purple reaches a worker before that message. On a direct channel load the player creates two workers. The page `fetch` hook (`page/fetch-hook.ts`, T-106) is installed when the bundle loads; it reads only `https://gql.twitch.tv/integrity`, from a clone, and gives every response to the page unchanged.
4. In the worker, `app.worker.ts` calls `bootstrapWorker(self)`, which keeps the original `fetch` as `self.request`, creates `AppController` and replaces `fetch` with a dispatcher over the `@Fetch` routes (first match in declaration order):
   - `usher.ttvnw.net/api/channel/hls/` and `usher.ttvnw.net/api/v2/channel/hls/` (except `picture-by-picture`) → `onChannel` → `Player.setChannel` with the channel from the URL path (T-103);
   - `ttvnw.net/v1/playlist/` → `onFetch` → `Player.onFetch`; an exception returns Twitch's playlist;
   - `picture-by-picture` → `onChannelPicture` → stores the PbP stream and returns an empty response.
5. `Player.onFetch` (classes from `ad-detector.ts`, T-201):
   - no stream stored for the channel (playlist before the usher) → original text;
   - `MARKED_LIVE` (markers over live segments) → original text, no backup lookup, no pause/play (T-202);
   - channel on the whitelist → original text (never reached in 2.6.7, C-10);
   - no ads → original text (T-101);
   - ads → tries the `frontpage` backups, then `picture-by-picture` (variants read with `m3u8-parser`, T-104); the first one without ads replaces the whole playlist;
   - none clean → `mergeM3u8Contents` edits the main playlist's lines: each ad segment with a live backup segment in the same second gets that segment's `#EXTINF` and URI lines; every other line stays (T-101).
6. When the ad state changes → pause and play on the player.

## Current messages

| From → to | Message | Effect |
| --- | --- | --- |
| worker → page | `{ type: "getSettings" }` | page forwards `window.postMessage({ type: "getSettings" })`; the content script answers once `storage` has answered, with `whitelist`, `toggleProxy`, `proxyUrl` and `debug` (logs and events, C-09, F-17) |
| content script → page | `{ type: "setSettings", value }` | page sends `{ funcName: "setSettings", value }` to every registered worker |
| page → worker | `{ funcName: "setIntegrity", value }` | sent to every registered worker; the worker stores the integrity token |
| worker → page | `{ type: "pause" }`, `{ type: "play" }` | page sends `{ funcName: "pause" \| "play", id: 1 }` to the worker that asked (player's internal RPC) |
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
- Ad break state machine: pause/play (E6), optional reload (F-15).
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
                └─ ad segments left → blank segment (F-14)
```

Any exception on this path returns Twitch's original response (rule 5 in `CLAUDE.md`).
