# Tasks

Status: `[ ]` open, `[~]` in progress, `[x]` done. Each task lists the tests that close it (`docs/tests.md`): TS-xxx (level 1, `bun test`), L2-xx (player + server), L3-xx (live site), `cargo test` for `sim/`. A task is not ticked until those tests pass.

Phases run in order. Inside a phase, the "Depends on" column says what must come first.

## Overview

| Phase | Tasks | Depends on |
| --- | --- | --- |
| 0. Test base (level 1) | T-001 to T-003 | - |
| 0b. Levels 2 and 3 | T-004 to T-009 | - (parallel with phases 1 to 7) |
| 1. Fixes to existing code | T-101 to T-111 | Phase 0 |
| 2. Detection | T-201, T-202 | T-101 |
| 3. CSAI blocking | T-301, T-302 | T-106 |
| 4. Backup streams | T-401 to T-408 | T-104, T-105, T-106, T-107 |
| 5. Playlist assembly | T-501, T-502 | T-101, T-201 |
| 6. Player control and settings | T-601 to T-603 | T-107, T-201 |
| 7. Build and release | T-701, T-702 | Phase 0 |

## Phase 0: test base

### T-001 Move the suite to `bun test`
- [x] Status · done 2026-10-03: `bootstrapWorker` lives in `serviceWorker/src/bootstrap.ts`; modules receive the scope (`WorkerContext` in `serviceWorker/src/scope.ts`) instead of reading globals; the `TARGETDURATION` spec expects `5`, the current default; findings in `docs/findings/2026-10-03-worker-unit-tests.md`
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
- [x] Status · done 2026-10-04: fixtures hand-written from `docs/server/` (provenance in `serviceWorker/test/fixtures/README.md`), plus `master-video-weaver.m3u8` for the 2.6.7 variant regex; harness adds `fixtures.ts` and `console.ts`; integration specs characterize the 2.6.7 worker pipeline, `index.ts` and `content-script.js`
- Files: `serviceWorker/test/fixtures/`, `serviceWorker/test/harness/`
- Done when the fixtures and harness pieces listed in `docs/tests.md` exist and each one is used by at least one test.
- Tests: TS-002

### T-003 Local checks before every commit
- [x] Status · done 2026-10-04: a commit with a failing test was blocked by the hook (exit 1, HEAD unchanged)
- Files: `.githooks/pre-commit` (new), `package.json`, `.gitattributes`
- Tests run on this machine, not on GitHub Actions (the account's Actions minutes are limited). No workflow runs tests.
- Done when:
  - `bun run check` runs every local check (`bun test` now; `cargo test` for `sim/` joins it with T-006);
  - `.githooks/pre-commit` runs `bun run check`; `bun run hooks:install` sets `core.hooksPath` to `.githooks` (once per clone);
  - a failing test blocks the commit;
  - no workflow in `.github/workflows` runs tests.
- Tests: TS-003

## Phase 0b: levels 2 and 3

Runs in parallel with phases 1 to 7. Phase 1 to 6 tasks list L2/L3 scenarios that become required once these tasks are done.

### T-004 Browser harness (nodriver + Edge)
- [~] Status · 2026-10-07: harness in `e2e/` (hidden desktop, both modes, recorder with a worker log). L3-01 runs and fails on Purple bugs: the page requests usher v2, so Purple's worker throws on ad playlists and the player stops (T-103), and the extension's hook is sometimes late on a direct load (T-111) ([finding](findings/2026-10-07-e2e-harness.md))
- Files: `e2e/` (new), `package.json` (`e2e` script calling `python e2e/run.py`, `e2e:build`), `platform/tampermonkey/build.js` (optional output path, so the e2e build goes to `dist/`)
- Done when:
  - nodriver starts Edge with `user_data_dir=~/nodriver/profile-edge-purple`, a profile used only by these tests;
  - no other extension runs: every launch passes `--disable-component-extensions-with-background-pages`; extension mode adds `--load-extension=<build> --disable-extensions-except=<build>`; userscript mode adds `--disable-extensions` and injects the built userscript with `Page.addScriptToEvaluateOnNewDocument`;
  - before launching, leftover `msedge.exe` processes whose command line contains `profile-edge-purple` are stopped (only those);
  - on Windows, Edge starts on a separate hidden Win32 desktop (`CreateDesktopW` + `STARTUPINFO.lpDesktop`; not headless), so runs never show a window or take the user's input; pages get focus emulation (`Emulation.setFocusEmulationEnabled`);
  - a fresh profile gets one warm-up launch before assertions;
  - state is read as JSON (hook installed, video state, overlays, `window.__purple.events` once T-110 exists); no screenshots;
  - L3-01 passes in extension and userscript modes.
- Tests: L3-01

### T-005 Level 3 recorder
- [ ] Status
- Depends on: T-004
- Files: `e2e/record.py` (new)
- Done when:
  - `python e2e/record.py <channel> --seconds N [--with-purple] [--technique TR-xxx]` intercepts usher, media playlists, segments, GQL `PlaybackAccessToken` and `edge.ads.twitch.tv` with `Fetch` and keeps every request flowing;
  - each response is saved with its offset from session start in `~/purple-recordings/<date>-<channel>/` (`manifest.json` + bodies), outside the repo;
  - the manifest marks which segment URIs are ads (F-02 markers) and logs the full usher URL and master (sanitized copies feed Q-005 and Q-011);
  - one L3-10 run produces a finding in `docs/findings/` and updates `docs/server/behaviors.md`, `docs/server/techniques.md` and `docs/server/open-questions.md`.
- Tests: L3-10

### T-006 `sim/` server (Rust)
- [ ] Status
- Files: `sim/` (new Cargo project)
- Done when:
  - a scenario file (`sim/scenarios/*.json`) describes the stream timeline (live and ad periods, SSAI or CSAI), the variants and codecs, the response per `playerType`, and GQL errors;
  - endpoints follow `docs/server/endpoints.md`: usher v1 and v2 (master), media playlists generated on a live clock with the tags in `docs/server/playlists.md` and the ad markers in `docs/server/ads.md`, segments from `sim/media/`, GQL `PlaybackAccessToken` per `playerType`, `/integrity`, `edge.ads.twitch.tv`;
  - `/_sim/scenario` loads a scenario and `/_sim/log` returns every request received (URL, headers, time, whether the URI is an ad);
  - every behavior it reproduces has its scenario ID written in the "sim" column of `docs/server/behaviors.md`;
  - `cargo test` covers playlist generation, the timeline, token responses and the request log.
- Tests: `cargo test`, L2-01

### T-007 Synthetic media
- [ ] Status
- Files: `sim/media.sh` or `sim/src/bin/media.rs` (new), `.gitignore`
- Done when:
  - ffmpeg generates into `sim/media/` (gitignored): live and ad renditions in H.264/AAC MPEG-TS at the variant sizes used by the scenarios, and an HEVC rendition in fMP4 with an init segment for `EXT-X-MAP`;
  - live and ad segments differ in content so a frame can be told apart if ever needed;
  - a `cargo test` checks the generated files exist with the expected container and codec (ffprobe).
- Tests: `cargo test`

### T-008 Isolated player page
- [ ] Status
- Depends on: T-006, T-007
- Files: `sim/page/` (new)
- Done when:
  - `sim/` serves a page that runs Purple's bundle first, then the Amazon IVS player SDK (`amazon-ivs-player`, installed with bun, not committed), and loads `https://usher.ttvnw.net/api/channel/hls/<scenario channel>.m3u8`;
  - the page never contacts twitch.tv;
  - L2-01 passes: Purple's hook attached to the SDK worker, video playing.
- Tests: L2-01

### T-009 Level 2 routing to `sim/`
- [ ] Status
- Depends on: T-006
- Files: `e2e/lib.py`, `sim/src/`
- Done when:
  - requests to `*.ttvnw.net`, `gql.twitch.tv` and `edge.ads.twitch.tv` from the isolated page reach `sim/` under their real hostnames, so Purple's URL matching runs unchanged;
  - first option: Edge host mapping with the `sim/` certificate accepted (see `docs/findings/2026-10-03-host-resolver-mapping.md`); otherwise a CDP `Fetch` bridge answering those requests from `sim/`;
  - the choice and the reason are written to a finding;
  - L2-02 to L2-08 run.
- Tests: L2-01 to L2-08

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
- Context: the Twitch page requests usher v2. With Purple in the player worker, an ad playlist throws in `fetchm3u8ByStreamType` and the player stops with Error #2000 ([finding](findings/2026-10-07-e2e-harness.md)).
- Done when:
  - the usher route matches `/api/channel/hls/` and `/api/v2/channel/hls/`;
  - the channel name comes from `new URL(url).pathname`, not from a regex over the full URL;
  - a media playlist that arrives before the usher (no stream stored) returns the original text without throwing.
- Tests: TS-103, L3-01

### T-104 Master variants through the parser
- [ ] Status · C-04 · E3, E8
- Files: `serviceWorker/src/modules/stream/stream.ts`, `serviceWorker/src/modules/stream/interface/stream.types.ts`
- Done when:
  - `setStreamAccess` reads `EXT-X-STREAM-INF` and `EXT-X-MEDIA` with `m3u8-parser` and stores quality (`NAME`/`VIDEO`), resolution, codecs and URL;
  - the current regex becomes a fallback, used only when the parser finds no variants;
  - a `variant URL → stream` map identifies media playlists by URL (the current `v1/playlist` route stays as fallback);
  - a master without variants creates no `Server`; `request(undefined)` never happens;
  - variant URLs on `<edge>.playlist.ttvnw.net` (B-003) are read, not only `https://video…` (Q-013);
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

### T-111 Inject before the player creates its workers
- [ ] Status · C-11 · E1
- Files: `platform/chromium/manifest.json`, `platform/src/content-script.js`, `platform/firefox/manifest.json`, `platform/tampermonkey/build.js`, `cli/chrome_builder.js`
- Context: on a direct channel load the player workers start at 0.45 to 0.8 s and Purple's hook at about 0.77 s, so Purple never runs in them ([finding](findings/2026-10-04-worker-injection-race.md)).
- Done when:
  - Chromium: `app/bundle.js` is a content script with `"world": "MAIN"` and `"run_at": "document_start"`; the isolated content script keeps answering `getSettings` from storage;
  - Firefox and the userscript: the earliest injection each one allows, with the result of the same check recorded in a finding;
  - L3-01 on a direct load: every player worker is created through the injector and runs Purple's code (checks of `docs/findings/probes/worker_boot_probe.py`).
- Tests: TS-111, L3-01

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
- [ ] Status · F-16 · E7 · C-10
- Files: `platform/src/content-script.js`, `serviceWorker/src/index.ts`, `serviceWorker/src/app.controller.ts`
- Done when:
  - `Player.setting` holds the `value` of the `setSettings` message, so `isWhitelist()` sees the list (C-10; starts with a failing test, see `docs/findings/2026-10-03-worker-unit-tests.md`);
  - a `storage` change (`onChanged`) reaches every live worker and the whitelist applies on the next playlist.
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
  - every script runs on Bun: `build` calls `bun serviceWorker/build.ts`; `ts-node` and the `bun` npm package leave `package.json` (the package pins `^1.4.1` until then, so `bun run` scripts do not fall back to Bun 1.1.20; see `docs/findings/2026-10-03-bun-test.md`);
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
  - no workflow runs on `pull_request` and none runs tests: tests run locally (T-003), Actions minutes are limited;
  - releases only on push to `main` or on a tag;
  - `actions/checkout` v4; `marvinpinto/action-automatic-releases` (archived) is replaced by a maintained action.
- Tests: TS-702

## Open decisions

- E12 (proxy): the servers went offline in 2023 (#79) and the worker does not read `toggleProxy` or `proxyUrl`. Either bring back the proxy path with a user-provided URL or keep only the UI.
- `purpleadblockserver` submodule: declared in `.gitmodules`, no gitlink in the repo.
- README: recommends `pixeltris/TwitchAdSolutions`, which is archived; replace with Brave's setup (Shields Aggressive + Brave Twitch/Experimental lists) or drop the recommendation.
- `background.js`: not referenced by any manifest.
