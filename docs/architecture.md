# Architecture

## Execution contexts

| Context | File | Runs in |
| --- | --- | --- |
| Content script | `platform/src/content-script.js` | extension isolated world; reads `storage` and injects `app/bundle.js` |
| Page | `serviceWorker/src/index.ts` (built into `bundle.js`) | twitch.tv main world, `document_start` |
| Worker | `serviceWorker/src/app.worker.ts` + modules (built into `app.worker.js`) | inside the Twitch player worker, ahead of the original script |
| Popup | `platform/src/common/js/popup.js` | extension popup |

The userscript has no content script or popup: `bundle.js` is the whole script and settings use their defaults.

## Current flow

1. The content script injects `app/bundle.js` into the page.
2. `index.ts` replaces `window.Worker`. When a worker is created, it downloads the script with a synchronous XHR and builds a blob with `app.worker.js` followed by the original script.
3. The first worker becomes `mainWorker`: it gets the message listeners and triggers the page `fetch` hook that captures `https://gql.twitch.tv/integrity`.
4. In the worker, `app.worker.ts` replaces `fetch` and dispatches through `routerList`:
   - `usher.ttvnw.net/api/channel/hls/` (except `picture-by-picture`) → `onChannel` → `Player.setChannel`;
   - `ttvnw.net/v1/playlist/` → `onFetch` → `Player.onFetch`;
   - `picture-by-picture` → `onChannelPicture` → stores the PbP stream and returns an empty response.
5. `Player.onFetch`:
   - channel on the whitelist → original text;
   - no ads → `mergeM3u8Contents([text])` (rewrites the playlist);
   - ads → tries a `frontpage` backup, then `picture-by-picture`; the first one without ads replaces the whole playlist;
   - none clean → merges the main playlist with the backups by `PROGRAM-DATE-TIME`.
6. When the ad state changes → pause and play on the player.

## Current messages

| From → to | Message | Effect |
| --- | --- | --- |
| worker → page | `{ type: "getSettings" }` | page forwards `window.postMessage({ type: "getSettings" })` |
| content script → page | `{ type: "setSettings", value }` | page sends `{ funcName: "setSettings", value }` to `mainWorker` |
| page → worker | `{ funcName: "setIntegrity", value }` | worker stores the integrity token |
| worker → page | `{ type: "pause" }`, `{ type: "play" }` | page sends `{ funcName: "pause" \| "play", id: 1 }` to the worker (player's internal RPC) |
| player worker → page | `PlayerQualityChanged`, `arg.key === "quality"` | page sends `{ funcName: "setQuality", value }` |

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
