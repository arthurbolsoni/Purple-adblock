# Tasks

Status: `[ ]` open, `[~]` in progress, `[x]` done. Each task lists the tests that close it (TS-xxx in `docs/tests.md`); a task is not ticked until those tests pass under `bun test`.

Phases run in order. Inside a phase, the "Depends on" column says what must come first.

## Overview

| Phase | Tasks | Depends on |
| --- | --- | --- |
| 0. Test base | T-001 to T-006 | - |
| 1. Fixes to existing code | T-101 to T-110 | Phase 0 |
| 2. Detection | T-201, T-202 | T-101 |
| 3. CSAI blocking | T-301, T-302 | T-106 |
| 4. Backup streams | T-401 to T-408 | T-104, T-105, T-106, T-107 |
| 5. Playlist assembly | T-501, T-502 | T-101, T-201 |
| 6. Player control and settings | T-601 to T-603 | T-107, T-201 |
| 7. Build and release | T-701, T-702 | Phase 0 |

## Phase 0: test base

### T-001 Move the suite to `bun test`
- [ ] Status
- Files: `package.json`, `bunfig.toml` (new), `serviceWorker/test/preload.ts` (new), `jest.config.js` (removed), `serviceWorker/src/decorator/*.ts`, `serviceWorker/src/app.worker.ts`, `serviceWorker/src/modules/player/player.spec.ts`, `serviceWorker/src/modules/stream/stream.spec.ts`, `serviceWorker/src/modules/player/m3u8.spec.ts`
- Done when:
  - `bunfig.toml` sets `[test] preload` to `serviceWorker/test/preload.ts`, which registers the `?raw` plugin;
  - `jest`, `@swc/jest`, `@types/jest`, `@types/mocha` and `jest.config.js` are gone (Jest comes back only under the fallback rule in `docs/tests.md`); `@happy-dom/global-registrator` is added for page tests;
  - specs import from `bun:test`;
  - `@Fetch` and `@Message` store metadata on the class; `createRouter(controller)` and `bindMessages(scope, controller)` do the registration, so tests build fresh instances without re-importing modules;
  - `app.worker.ts` is split into `bootstrapWorker(scope)` (exported, no side effects on import) and an entry that calls `bootstrapWorker(self)`;
  - `player.spec.ts` (today a copy of `m3u8.ts` with no tests) and `stream.spec.ts` (empty) hold real tests for `Player` and `Stream`;
  - the `generateM3u8` test expecting `TARGETDURATION:0` is revisited together with T-101;
  - `package.json` has `test` (`bun test`) and `test:coverage` (`bun test --coverage`);
  - `bun test` exits with code 0.
- Tests: TS-001

### T-002 Fixtures and harness
- [ ] Status
- Files: `serviceWorker/test/fixtures/`, `serviceWorker/test/harness/`
- Done when the fixtures and harness pieces listed in `docs/tests.md` exist and each one is used by at least one test.
- Tests: TS-002

### T-003 Tests in CI
- [ ] Status
- Files: `.github/workflows/test.yml`
- Done when push and pull request run `oven-sh/setup-bun`, `bun install --frozen-lockfile` and `bun test`, and a failing test turns the check red.
- Tests: TS-003

### T-004 Browser test harness (nodriver + Edge)
- [ ] Status
- Files: `e2e/` (new), `package.json` (`e2e` script calling `python e2e/run.py`)
- Done when:
  - nodriver starts Edge with `user_data_dir=~/nodriver/profile-edge-purple`, a profile used only by these tests;
  - no other extension runs: every launch passes `--disable-component-extensions-with-background-pages`; extension mode adds `--load-extension=<build> --disable-extensions-except=<build>`; userscript mode adds `--disable-extensions` and injects the built userscript with `Page.addScriptToEvaluateOnNewDocument`;
  - before launching, leftover `msedge.exe` processes whose command line contains `profile-edge-purple` are stopped (only those);
  - a fresh profile gets one warm-up launch before assertions;
  - state is read as JSON (hook installed, video state, overlays, `window.__purple.events` once T-110 exists); no screenshots;
  - E2E-01 passes in both modes.
- Tests: E2E-01

### T-005 Traffic recorder
- [ ] Status
- Depends on: T-004
- Files: `e2e/record.py` (new)
- Done when:
  - `python e2e/record.py <channel> --seconds N [--with-purple]` intercepts usher, media playlists, segments, GQL `PlaybackAccessToken` and `edge.ads.twitch.tv` with `Fetch` and keeps every request flowing;
  - each response is saved with its offset from session start in `~/purple-recordings/<date>-<channel>/` (`manifest.json` + bodies), outside the repo;
  - the manifest marks which segment URIs are ads (by the F-02 markers) so replay assertions can use it;
  - a recording containing an ad break exists and E2E-R5 runs on it.
- Tests: E2E-R5

### T-006 Replay against the real player
- [ ] Status
- Depends on: T-005, T-110
- Files: `e2e/replay.py` (new), `e2e/scenarios/`
- Done when:
  - `Fetch.fulfillRequest` answers usher, media playlists, segments and GQL token requests from a recording, matching host and path and ignoring query tokens;
  - media playlists follow elapsed time and `PROGRAM-DATE-TIME` is shifted to the current clock;
  - edited recordings can be served (midroll inside a clean stream, all backups with ads, CSAI-marked-live, GQL errors);
  - E2E-R1 to E2E-R4 pass with Purple on, and E2E-R5 shows the ads reaching the player with Purple off.
- Tests: E2E-R1 to E2E-R5

## Phase 1: fixes to existing code

### T-101 Untouched playlist without ads; merge keeps tags
- [ ] Status · C-01, F-01 · E5
- Files: `serviceWorker/src/modules/player/m3u8.ts`, `serviceWorker/src/modules/player/player.ts`
- Done when:
  - with no ads, `Player.onFetch` returns exactly the text it received;
  - with ads, the output keeps `EXT-X-VERSION`, `EXT-X-MAP`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-TWITCH-PREFETCH`, `EXT-X-PRELOAD-HINT`, `EXT-X-PART`, `EXT-X-DATERANGE`, `EXT-X-DISCONTINUITY` and unknown tags;
  - output is produced by editing the lines of the original text, not by `generateM3u8`;
  - `#EXTINF` is written as `#EXTINF:<duration>,<title>`.
- Tests: TS-101

### T-102 Worker router
- [ ] Status · C-02 · E2
- Files: `serviceWorker/src/app.worker.ts`, `serviceWorker/src/decorator/handler.decorator.ts`
- Done when:
  - a route without `ignore` is not compared against the string `"null"` (channel `nullbyte` goes through the usher hook);
  - `fetch(Request)` and `fetch(URL)` are routed by their URL;
  - an unrouted URL goes to `global.request` with the same arguments.
- Tests: TS-102

### T-103 Channel from the usher; missing stream
- [ ] Status · C-03 · E2, E3
- Files: `serviceWorker/src/app.controller.ts`, `serviceWorker/src/modules/player/player.ts`
- Done when:
  - the usher route matches `/api/channel/hls/` and `/api/v2/channel/hls/`;
  - the channel name comes from `new URL(url).pathname`, not from a regex over the full URL;
  - a media playlist that arrives before the usher (no stream stored) returns the original text without throwing.
- Tests: TS-103

### T-104 Master variants through the parser
- [ ] Status · C-04 · E3, E8
- Files: `serviceWorker/src/modules/stream/stream.ts`, `serviceWorker/src/modules/stream/interface/stream.types.ts`
- Done when:
  - `setStreamAccess` reads `EXT-X-STREAM-INF` and `EXT-X-MEDIA` with `m3u8-parser` and stores quality (`NAME`/`VIDEO`), resolution, codecs and URL;
  - the current regex becomes a fallback, used only when the parser finds no variants;
  - a `variant URL → stream` map identifies media playlists by URL (the current `v1/playlist` route stays as fallback);
  - a master without variants creates no `Server`; `request(undefined)` never happens;
  - a network error on one backup drops only that backup.
- Tests: TS-104

### T-105 Token requests without duplicates
- [ ] Status · C-05 · E3
- Files: `serviceWorker/src/modules/stream/stream.ts`, `serviceWorker/src/modules/player/player.ts`
- Done when:
  - at most one `createStreamAccess` is in flight per channel and playerType;
  - a playerType does not pile up duplicate `Server` entries;
  - a GQL failure is logged and does not throw.
- Tests: TS-105

### T-106 Page fetch hook limited to target URLs
- [ ] Status · C-06 · E9
- Files: `serviceWorker/src/index.ts` (extract into `serviceWorker/src/page/fetch-hook.ts`)
- Done when:
  - only target URLs (`gql.twitch.tv/integrity`, GQL, `edge.ads.twitch.tv`) reach the hook logic; every other call returns the original `Response` unread;
  - integrity capture reads `response.clone()`;
  - 204/304 and binary responses reach the page untouched;
  - URLs inside `Request` or `URL` objects are recognized.
- Tests: TS-106

### T-107 Worker registry
- [ ] Status · C-07 · E1
- Files: `serviceWorker/src/index.ts` (extract into `serviceWorker/src/page/worker-registry.ts`)
- Done when:
  - every created worker is registered and removed on `terminate()`;
  - `setSettings`, headers, integrity and quality reach every live worker, including ones created later;
  - a message from a worker is answered to that worker, not to the first one;
  - if the XHR for the worker script fails, the worker is created with the original URL.
- Tests: TS-107

### T-108 Segment title without a raw-URI regex
- [ ] Status · C-08 · E5
- Files: `serviceWorker/src/modules/player/m3u8.ts`
- Done when the title comes from the parser's `segment.title` or from line reading; URIs containing `?`, `+`, `(` or `[` do not change the result.
- Tests: TS-108

### T-109 Logger behind `debug`
- [ ] Status · C-09
- Files: `serviceWorker/src/app.worker.ts`, `serviceWorker/src/modules/**`
- Done when:
  - no direct `console.log` remains in `serviceWorker/src` outside the logger;
  - with `debug` off, nothing is printed per segment or per request.
- Tests: TS-109

### T-110 Debug event log in the page
- [ ] Status · F-17
- Files: `serviceWorker/src/modules/player/player.ts`, `serviceWorker/src/index.ts`
- Done when:
  - with `debug` on, the worker posts events to the page: `adDetected`, `backupUsed`, `segmentsReplaced`, `blankInserted`, `csaiBlocked`, `whitelisted`, each with channel, playerType (when relevant) and timestamp;
  - the page keeps them in `window.__purple.events`, last 500 only;
  - with `debug` off, no events are posted and `window.__purple` is not created.
- Tests: TS-110

## Phase 2: detection

### T-201 Marker-based and per-segment detector
- [ ] Status · F-02, F-03
- Files: `serviceWorker/src/modules/player/ad-detector.ts` (new), `player.ts`, `m3u8.ts`
- Done when:
  - one module holds the markers from `docs/feat.md` (F-02), replacing both copies of `hasAds`;
  - it returns the class (`NONE`, `MARKED_LIVE`, `SSAI`) and the indexes of ad segments;
  - Purple's current markers (`stitched`, `Amazon`, `DCM,` in the title) still detect.
- Tests: TS-201

### T-202 `MARKED_LIVE` path
- [ ] Status · F-03
- Files: `serviceWorker/src/modules/player/player.ts`
- Done when a `MARKED_LIVE` playlist comes back untouched, with no backup lookup and no pause/play.
- Tests: TS-202

## Phase 3: CSAI blocking

### T-301 Block `edge.ads.twitch.tv` in the page
- [ ] Status · F-04
- Files: `serviceWorker/src/page/fetch-hook.ts`, `serviceWorker/src/page/xhr-hook.ts` (new)
- Done when:
  - with `blockCsai`, `fetch` and XHR to `edge.ads.twitch.tv` never leave the page and get an empty 200 response;
  - with `blockCsai` off, they pass through;
  - blocked requests are counted per type (`preroll`, `midroll`) in the logger.
- Tests: TS-301

### T-302 DNR rule on Chromium
- [ ] Status · F-04
- Files: `platform/chromium/manifest.json`, `platform/chromium/rules.json` (new)
- Done when the manifest declares `declarative_net_request` with a block rule for `||edge.ads.twitch.tv^` and the JSON is valid.
- Tests: TS-302

## Phase 4: backup streams

### T-401 Page GQL headers
- [ ] Status · F-05 · E9
- Files: `serviceWorker/src/page/fetch-hook.ts`, `serviceWorker/src/app.controller.ts`
- Done when:
  - `X-Device-Id` (or `Device-ID`), `Client-Integrity`, `Authorization`, `Client-Version` and `Client-Session-Id` from page GQL requests reach the worker whenever they change;
  - capture through `/integrity` (E9) keeps working;
  - backup token requests send these headers.
- Tests: TS-401

### T-402 GQL executed in the page
- [ ] Status · F-06
- Files: `serviceWorker/src/page/gql-bridge.ts` (new), `serviceWorker/src/modules/twitch/twitch.service.ts`
- Done when:
  - the worker sends `{ funcName: "gqlRequest", id, body }` and gets `{ id, status, body }` back;
  - responses are matched by `id`; with no response within 5 s, the worker sends the request itself (current path).
- Tests: TS-402

### T-403 Updated hash and full-query fallback
- [ ] Status · F-07 · E3
- Files: `serviceWorker/src/modules/twitch/twitch.service.ts`
- Done when:
  - default hash is `ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9`;
  - `PersistedQueryNotFound` or a missing `streamPlaybackAccessToken` triggers a retry with `playbackAccessToken_Template`;
  - the flat response shape (`{ streamPlaybackAccessToken }`) is accepted.
- Tests: TS-403

### T-404 Usher parameters
- [ ] Status · F-08
- Files: `serviceWorker/src/modules/twitch/twitch.service.ts`, `serviceWorker/src/modules/stream/stream.ts`
- Done when:
  - backups use the parameters of the original usher request (including `supported_codecs`), replacing only `token`, `sig` and `p`;
  - `token` and `sig` go through `encodeURIComponent`;
  - the API version (v1 or v2) follows the original request.
- Tests: TS-404

### T-405 PlayerType list
- [ ] Status · F-09 · E3, E4
- Files: `serviceWorker/src/modules/player/player.ts`, `serviceWorker/src/modules/stream/interface/stream.enum.ts`, `setting.interface.ts`
- Done when:
  - the chain walks `backupPlayerTypes` (default in `docs/feat.md`) instead of the fixed `frontpage` → `picture-by-picture` sequence;
  - the first clean backup replaces the playlist (E4);
  - `autoplay` is only tried with `lowQualityFallback` and is requested with `platform: "android"`.
- Tests: TS-405

### T-406 Pinned type and contaminated type
- [ ] Status · F-10
- Files: `serviceWorker/src/modules/player/player.ts`
- Done when:
  - with `pinBackupPlayerType`, the last clean type is tried first on the next break (`autoplay` is never pinned);
  - a type that returned ads is skipped for 5 s.
- Tests: TS-406

### T-407 Backup with the same codec and quality
- [ ] Status · F-11 · E8
- Files: `serviceWorker/src/modules/stream/interface/stream.types.ts`
- Done when variant selection goes: same quality and same codec family (`avc`, `hevc`, `av1`) → same resolution with another codec → `bestQuality()`.
- Tests: TS-407

### T-408 Page token as `popout`
- [ ] Status · F-12 · E10
- Files: `serviceWorker/src/page/fetch-hook.ts`, `serviceWorker/src/app.controller.ts`
- Done when:
  - with `forcePopoutToken`, the `playerType` of the page's `PlaybackAccessToken` becomes `popout` (single and batched bodies);
  - requests with `picture-by-picture` are left alone, to keep E10;
  - `parent_domains` is removed from the usher URL in the worker.
- Tests: TS-408

## Phase 5: playlist assembly

### T-501 Merge with time tolerance
- [ ] Status · F-13 · E5
- Files: `serviceWorker/src/modules/player/m3u8.ts`
- Done when:
  - a backup segment matches an ad segment when their `PROGRAM-DATE-TIME` differ by less than half the segment duration;
  - when a segment from another fMP4 source is inserted, that source's `EXT-X-MAP` goes before it and the main one is restored after;
  - `EXT-X-MEDIA-SEQUENCE` and the main playlist's segment count do not change.
- Tests: TS-501

### T-502 Blank segment as last resort
- [ ] Status · F-14
- Files: `serviceWorker/src/modules/player/m3u8.ts`, `serviceWorker/src/modules/player/blank-segment.ts` (new)
- Done when:
  - with `stripFallback`, every ad segment left after the merge is replaced by a blank segment with the same duration;
  - `EXT-X-PART`, `EXT-X-TWITCH-PREFETCH` and `EXT-X-PRELOAD-HINT` lines pointing to ads are removed;
  - no ad URI remains in the output;
  - `segmentRemoved` counts the replaced segments.
- Tests: TS-502

## Phase 6: player control and settings

### T-601 Ad break state machine
- [ ] Status · F-15 · E6
- Files: `serviceWorker/src/modules/player/ad-break.ts` (new), `player.ts`, `index.ts`
- Done when:
  - states `idle` → `ad` → `recovering` → `idle`, with pause/play (E6) on transitions as today;
  - with `reloadAfterAd`, one reload at the end of the break, at most one every 30 s;
  - the reload mechanism is chosen in this task and written down in `docs/architecture.md`.
- Tests: TS-601

### T-602 Settings without reload
- [ ] Status · F-16 · E7
- Files: `platform/src/content-script.js`, `serviceWorker/src/index.ts`
- Done when a `storage` change (`onChanged`) reaches every live worker and the whitelist applies on the next playlist.
- Tests: TS-602

### T-603 Channel in the popup
- [ ] Status · E7
- Files: `platform/src/common/js/popup.js`
- Done when the channel is read from `www.twitch.tv/<channel>`, `m.twitch.tv/<channel>` and `www.twitch.tv/popout/<channel>/...`.
- Tests: TS-603

## Phase 7: build and release

### T-701 Single Bun build
- [ ] Status · E11
- Files: `package.json`, `serviceWorker/build.ts`, `cli/*.js`, `cli/preinstall.js`, `platform/tampermonkey/build.js`
- Done when:
  - every script runs on Bun: `build` calls `bun serviceWorker/build.ts`; `ts-node` and the `bun` npm package leave `package.json`;
  - the `preinstall` hook (recursive `npm install`) is removed;
  - `bun run build` produces the worker, both zips and the userscript;
  - `dev` reaches the worker build (sourcemaps);
  - zip names carry the version (`purple-adblock-<version>-chromium.zip`) instead of the repeated package name;
  - the `lint` script has a path.
- Tests: TS-701

### T-702 Release workflows
- [ ] Status · E11
- Files: `.github/workflows/release.yml`, `.github/workflows/pre-release.yml`
- Done when:
  - workflows use `oven-sh/setup-bun` and Bun commands only;
  - pull requests run tests and build, without publishing a release;
  - releases only on push to `main` or on a tag;
  - `actions/checkout` v4; `marvinpinto/action-automatic-releases` (archived) is replaced by a maintained action.
- Tests: TS-702

## Open decisions

- E12 (proxy): the servers went offline in 2023 (#79) and the worker does not read `toggleProxy` or `proxyUrl`. Either bring back the proxy path with a user-provided URL or keep only the UI.
- `purpleadblockserver` submodule: declared in `.gitmodules`, no gitlink in the repo.
- README: recommends `pixeltris/TwitchAdSolutions`, which is archived; replace with Brave's setup (Shields Aggressive + Brave Twitch/Experimental lists) or drop the recommendation.
- `background.js`: not referenced by any manifest.
