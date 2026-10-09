# Tasks

Status: `[ ]` open, `[~]` in progress, `[x]` done. Each task lists the tests that close it (`docs/tests.md`): TS-xxx (level 1, `bun test`), L2-xx (player + server), L3-xx (live site), `cargo test` for `sim/`. A task is not ticked until those tests pass.

Phases run in order. Inside a phase, the "Depends on" column says what must come first.

## Overview

| Phase | Tasks | Depends on |
| --- | --- | --- |
| 0. Test base (level 1) | T-001 to T-003 | - |
| 0b. Levels 2 and 3 | T-004 to T-009 | - (parallel with phases 1 to 7) |
| 1. Fixes to existing code | T-101 to T-111 | Phase 0 |
| 2. Detection | T-201 to T-204 | T-101 |
| 3. CSAI blocking | T-301, T-302 | T-106 |
| 4. Backup streams | T-401 to T-410 | T-104, T-105, T-106, T-107 |
| 5. Playlist assembly | T-501, T-502 | T-101, T-201 |
| 6. Player control and settings | T-601 to T-604 | T-107, T-201 |
| 7. Build and release | T-701, T-702 | Phase 0 |
| 8. Investigations | T-801 to T-813 | - |

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
- [x] Status · done 2026-10-07: harness in `e2e/` (hidden desktop, both modes, recorder with a worker log, warm-up that turns on developer mode); L3-01 passed in both modes after T-103, T-107 and T-111, also on fresh profiles ([finding](findings/2026-10-07-e2e-harness.md))
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
- [x] Status · done 2026-10-08: `e2e/record.py` (record or extension mode, dedicated or fresh profile, `--technique` kept in the manifest; `-` takes a directory channel). Fetch at the response stage on usher, media playlists, segments, GQL and `edge.ads`, each paused request continued in its own task; twitch.tv loads once before Fetch is on (a navigation from `about:blank` with Fetch on never returned). The manifest marks segment, map and prefetch URIs as ads with the worker logger's rule and gives the usher query without `token`, `sig`, `play_session_id` and `p`. L3-10 run (120 s, fresh profile, Purple off): Q-005 values and Q-002 poll interval recorded; B-046 (prefetch URIs on fMP4) and B-047 (`rufio` `POST`s) are new ([finding](findings/2026-10-08-l3-recorder.md))
- Depends on: T-004
- Files: `e2e/record.py` (new)
- Done when:
  - `python e2e/record.py <channel> --seconds N [--with-purple] [--technique TR-xxx]` intercepts usher, media playlists, segments, GQL `PlaybackAccessToken` and `edge.ads.twitch.tv` with `Fetch` and keeps every request flowing;
  - each response is saved with its offset from session start in `~/purple-recordings/<date>-<channel>/` (`manifest.json` + bodies), outside the repo;
  - the manifest marks which segment URIs are ads (F-02 markers) and logs the full usher URL and master (sanitized copies feed Q-005 and Q-011);
  - one L3-10 run produces a finding in `docs/findings/` and updates `docs/server/behaviors.md`, `docs/server/techniques.md` and `docs/server/open-questions.md`.
- Tests: L3-10

### T-006 `sim/` server (Rust)
- [x] Status · done 2026-10-08: axum server (`sim/src/server.rs`) for usher v1 and v2 (a session per token, with its playerType), media playlists on one stream clock with breaks on each token's timeline (SSAI with the stitched-ad and stream-source markers, or a `twitch-maf-ad` slot), segments from `sim/media/`, GQL `PlaybackAccessToken` (batches, `PersistedQueryNotFound`, per-playerType errors), `/integrity`, `edge.ads`, the player's `/probe` and `*.live-video.net` reports; `/_sim/scenario`, `/_sim/log` (each request with its URL, headers, time, ad flag, session, GQL body). Scenarios `sim/scenarios/l2-01` to `l2-07`. `cargo test`: 18 unit and 6 server tests, in `bun run check`. L2-01 passed twice
- Files: `sim/` (new Cargo project)
- Done when:
  - a scenario file (`sim/scenarios/*.json`) describes the stream timeline (live and ad periods, SSAI or CSAI), the variants and codecs, the response per `playerType`, and GQL errors;
  - endpoints follow `docs/server/endpoints.md`: usher v1 and v2 (master), media playlists generated on a live clock with the tags in `docs/server/playlists.md` and the ad markers in `docs/server/ads.md`, segments from `sim/media/`, GQL `PlaybackAccessToken` per `playerType`, `/integrity`, `edge.ads.twitch.tv`;
  - `/_sim/scenario` loads a scenario and `/_sim/log` returns every request received (URL, headers, time, whether the URI is an ad);
  - every behavior it reproduces has its scenario ID written in the "sim" column of `docs/server/behaviors.md`;
  - `cargo test` covers playlist generation, the timeline, token responses and the request log.
- Tests: `cargo test`, L2-01

### T-007 Synthetic media
- [x] Status · done 2026-10-08: `cargo run --release --manifest-path sim/Cargo.toml --bin media` (`sim::media`) writes `sim/media/` with ffmpeg: `live-720p`, `live-360p` (60 s, `testsrc2` and 440 Hz) and `ad-720p`, `ad-360p` (16 s, SMPTE bars and 880 Hz) in H.264 main/AAC MPEG-TS, and `live-720p-hevc`, `ad-720p-hevc` in HEVC (`hvc1`)/AAC fMP4 with `init.mp4`; 2 s segments, one keyframe each; ffmpeg runs in each folder (given a Windows path it wrote `init.mp4` to its working directory). `tests/media.rs` encodes 2 s of each and checks container and codecs with ffprobe, and that live and ad differ (about 2 s per run, in `bun run check`)
- Files: `sim/media.sh` or `sim/src/bin/media.rs` (new), `.gitignore`
- Done when:
  - ffmpeg generates into `sim/media/` (gitignored): live and ad renditions in H.264/AAC MPEG-TS at the variant sizes used by the scenarios, and an HEVC rendition in fMP4 with an init segment for `EXT-X-MAP`;
  - live and ad segments differ in content so a frame can be told apart if ever needed;
  - a `cargo test` checks the generated files exist with the expected container and codec (ffprobe).
- Tests: `cargo test`

### T-008 Isolated player page
- [x] Status · done 2026-10-08: `sim/page/index.html`, served by `sim/` at `/page/`: Purple's bundle (`/page/purple.js`, from `serviceWorker/dist/bundle.js`) unless `purple=0`, then `/integrity`, a `PlaybackAccessToken` request as `site` (Purple's page hook sends it as `popout`, T-408), the v2 usher URL with that token, and the IVS player SDK (`amazon-ivs-player` 1.57.0 installed with bun in `sim/page`, bundled into `ivs.js`, both gitignored). L2-01: the SDK's worker created through Purple's injector with Purple booted, the video playing, no request to Twitch
- Depends on: T-006, T-007
- Files: `sim/page/` (new)
- Done when:
  - `sim/` serves a page that runs Purple's bundle first, then the Amazon IVS player SDK (`amazon-ivs-player`, installed with bun, not committed), and loads `https://usher.ttvnw.net/api/channel/hls/<scenario channel>.m3u8`;
  - the page never contacts twitch.tv;
  - L2-01 passes: Purple's hook attached to the SDK worker, video playing.
- Tests: L2-01

### T-009 Level 2 routing to `sim/`
- [x] Status · done 2026-10-08: the CDP `Fetch` bridge (`e2e/sim.py`), not host mapping (no request reached a local server that way on 2026-10-03): every request to `*.twitch.tv`, `*.ttvnw.net` and `*.live-video.net` from the page and the SDK's worker, preflights included, is answered from `sim/`; the `sim` mode of `e2e/lib.py` leaves only `127.0.0.1` resolvable, and level 2 runs on fresh profiles. L2-01 to L2-08 passed (2026-10-08, one run each; L2-01 twice before), after two fixes to `sim/` they showed: a finished break leaves the whole window live, and the live loop is 6 minutes (the IVS player paused where the 60 s loop wrapped) ([finding](findings/2026-10-08-level2-player-page.md))
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
- [x] Status · C-01, F-01 · E5 · done 2026-10-07: L3-01 passed in 8 of 8 runs (16 loads, 2 of them with ad markers) after the change, against 1 of 8 loads with ads before ([finding](findings/2026-10-07-backups-and-rewritten-playlists.md)); `generateM3u8` and `printViewAds` removed
- Context: on fresh profiles the player often does not start on playlists rewritten by `generateM3u8`, with or without ads ([finding](findings/2026-10-07-backups-and-rewritten-playlists.md)).
- Files: `serviceWorker/src/modules/player/m3u8.ts`, `serviceWorker/src/modules/player/player.ts`
- Done when:
  - with no ads, `Player.onFetch` returns exactly the text it received;
  - with ads, the output keeps `EXT-X-VERSION`, `EXT-X-MAP`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-TWITCH-PREFETCH`, `EXT-X-PRELOAD-HINT`, `EXT-X-PART`, `EXT-X-DATERANGE`, `EXT-X-DISCONTINUITY` and unknown tags;
  - output is produced by editing the lines of the original text, not by `generateM3u8`;
  - `#EXTINF` is written as `#EXTINF:<duration>,<title>`.
- Tests: TS-101, L3-01

### T-102 Worker router
- [x] Status · C-02 · E2 · done 2026-10-07: routes without `ignore` no longer drop URLs containing "null" (an opaque playlist path can); `URL` and `Request` inputs are routed and reach the network as the same object; L3-01 passed in both modes
- Files: `serviceWorker/src/bootstrap.ts`, `serviceWorker/src/decorator/handler.decorator.ts`, `serviceWorker/src/app.controller.ts`, `serviceWorker/src/url.ts` (new)
- Done when:
  - a route without `ignore` is not compared against the string `"null"` (channel `nullbyte` goes through the usher hook);
  - `fetch(Request)` and `fetch(URL)` are routed by their URL;
  - an unrouted URL goes to `global.request` with the same arguments.
- Tests: TS-102

### T-103 Channel from the usher; missing stream
- [x] Status · C-03 · E2, E3 · done 2026-10-07: both usher paths routed; on twitch.tv the player no longer stops on ad playlists (L3-01 run D in the [finding](findings/2026-10-07-e2e-harness.md); the extension's direct load still fails the injection check, T-111)
- Files: `serviceWorker/src/app.controller.ts`, `serviceWorker/src/modules/player/player.ts`
- Context: the Twitch page requests usher v2. With Purple in the player worker, an ad playlist throws in `fetchm3u8ByStreamType` and the player stops with Error #2000 ([finding](findings/2026-10-07-e2e-harness.md)).
- Done when:
  - the usher route matches `/api/channel/hls/` and `/api/v2/channel/hls/`;
  - the channel name comes from `new URL(url).pathname`, not from a regex over the full URL;
  - a media playlist that arrives before the usher (no stream stored) returns the original text without throwing;
  - an error while handling a media playlist returns Twitch's playlist (CLAUDE.md rule 5).
- Tests: TS-103, L3-01

### T-104 Master variants through the parser
- [x] Status · C-04 · E3, E8 · done 2026-10-07: the backups load on twitch.tv (they mostly carry ads, B-012); L3-01 passes together with T-101, which fixed the stall the backups exposed ([finding](findings/2026-10-07-backups-and-rewritten-playlists.md))
- Files: `serviceWorker/src/modules/stream/stream.ts`, `serviceWorker/src/modules/stream/master.ts` (new), `serviceWorker/src/modules/stream/interface/stream.types.ts`, `serviceWorker/src/modules/player/player.ts`, `serviceWorker/src/app.controller.ts`, `serviceWorker/src/decorator/handler.decorator.ts`
- Done when:
  - `setStreamAccess` reads `EXT-X-STREAM-INF` and `EXT-X-MEDIA` with `m3u8-parser` and stores quality (`NAME`/`VIDEO`), resolution, codecs and URL;
  - the current regex becomes a fallback, used only when the parser finds no variants;
  - a `variant URL → stream` map identifies media playlists by URL (the current `v1/playlist` route stays as fallback);
  - a master without variants creates no `Server`; `request(undefined)` never happens;
  - variant URLs on `<edge>.playlist.ttvnw.net` (B-003) are read, not only `https://video…` (Q-013);
  - a network error on one backup drops only that backup;
  - `bestQuality()` is the variant with the highest bandwidth (masters are not sorted by quality).
- Tests: TS-104, L3-01

### T-105 Token requests without duplicates
- [x] Status · C-05 · E3 · done 2026-10-07: a token request in flight for a playerType is shared; a new token replaces the playerType's server; L3-01 passed on 2 fresh profiles ([finding](findings/2026-10-07-backups-and-rewritten-playlists.md))
- Files: `serviceWorker/src/modules/stream/stream.ts`, `serviceWorker/src/modules/player/player.ts`
- Done when:
  - at most one `createStreamAccess` is in flight per channel and playerType;
  - a playerType does not pile up duplicate `Server` entries;
  - a GQL failure is logged and does not throw.
- Tests: TS-105, L3-01

### T-106 Page fetch hook limited to target URLs
- [x] Status · C-06 · E9 · done 2026-10-07: only `/integrity` is a target for now (GQL with T-401, `edge.ads.twitch.tv` with T-301); the hook is installed when the bundle loads, so the token from the directory page reaches the player after client-side navigation; L3-01 passed 6 of 6 runs ([finding](findings/2026-10-07-page-hook-and-early-messages.md))
- Files: `serviceWorker/src/index.ts`, `serviceWorker/src/page/fetch-hook.ts` (new)
- Done when:
  - only target URLs (`gql.twitch.tv/integrity`, GQL, `edge.ads.twitch.tv`) reach the hook logic; every other call returns the original `Response` unread;
  - integrity capture reads `response.clone()`;
  - 204/304 and binary responses reach the page untouched;
  - URLs inside `Request` or `URL` objects are recognized.
- Tests: TS-106, L3-01

### T-107 Worker registry
- [x] Status · C-07 · E1 · done 2026-10-07: on a direct load with a preroll, the second player worker's pause/play went unanswered and the player stalled at `readyState 0` once T-111 put Purple in both workers; fixed ([finding](findings/2026-10-07-e2e-harness.md))
- Files: `serviceWorker/src/index.ts` (extract into `serviceWorker/src/page/worker-registry.ts`)
- Done when:
  - every created worker is registered and removed on `terminate()`;
  - `setSettings`, headers, integrity and quality reach every live worker, including ones created later;
  - a message from a worker is answered to that worker, not to the first one;
  - if the XHR for the worker script fails, the worker is created with the original URL;
  - nothing from Purple reaches a worker before the page's first message to it (the player's init): a `setIntegrity` sent first killed the player worker ([finding](findings/2026-10-07-page-hook-and-early-messages.md)).
- Tests: TS-107, L3-01

### T-108 Segment title without a raw-URI regex
- [x] Status · C-08 · E5 · done 2026-10-07 with T-101: `readSegments` takes titles from the `#EXTINF` lines; TS-108 added
- Files: `serviceWorker/src/modules/player/m3u8.ts`
- Done when the title comes from the parser's `segment.title` or from line reading; URIs containing `?`, `+`, `(` or `[` do not change the result.
- Tests: TS-108

### T-109 Logger behind `debug`
- [x] Status · C-09 · done 2026-10-07: worker and page loggers print only with `debug` on; with it off, the worker printed nothing in L3-01 (2 loads); the content script reads `debug` from storage
- Files: `serviceWorker/src/bootstrap.ts`, `serviceWorker/src/index.ts`, `serviceWorker/src/app.controller.ts`, `serviceWorker/src/modules/**`, `platform/src/content-script.js`
- Done when:
  - no direct `console.log` remains in `serviceWorker/src` outside the logger;
  - with `debug` off, nothing is printed per segment or per request.
- Tests: TS-109

### T-110 Debug event log in the page
- [x] Status · F-17 · done 2026-10-07: `adDetected`, `backupUsed`, `segmentsReplaced` and `whitelisted` are emitted (`blankInserted` and `csaiBlocked` come with T-502 and T-301); L3-02 reads them with `debug` on and caught a midroll blocked by backups ([finding](findings/2026-10-07-l3-server-observations.md#a-midroll-on-a-fresh-profile))
- Files: `serviceWorker/src/modules/player/player.ts`, `serviceWorker/src/index.ts`
- Done when:
  - with `debug` on, the worker posts events to the page: `adDetected`, `backupUsed`, `segmentsReplaced`, `blankInserted`, `csaiBlocked`, `whitelisted`, each with channel, playerType (when relevant) and timestamp;
  - the page keeps them in `window.__purple.events`, last 500 only;
  - with `debug` off, no events are posted and `window.__purple` is not created.
- Tests: TS-110

### T-111 Inject before the player creates its workers
- [~] Status · C-11 · E1 · 2026-10-07: Chromium and userscript done and checked (L3-01, 8 of 8 and 5 of 5 direct loads in time); on Firefox the content script adds the bundle without waiting for `storage`, live check open (the harness drives Edge only) ([finding](findings/2026-10-07-e2e-harness.md))
- Files: `platform/chromium/manifest.json`, `platform/src/content-script.js`, `platform/firefox/manifest.json`, `platform/tampermonkey/build.js`, `cli/chrome_builder.js`
- Context: on a direct channel load the player workers start at 0.45 to 0.8 s and Purple's hook at about 0.77 s, so Purple never runs in them ([finding](findings/2026-10-04-worker-injection-race.md)).
- Done when:
  - Chromium: `app/bundle.js` is a content script with `"world": "MAIN"` and `"run_at": "document_start"`; the isolated content script keeps answering `getSettings` from storage;
  - Firefox and the userscript: the earliest injection each one allows, with the result of the same check recorded in a finding;
  - L3-01 on a direct load: every player worker is created through the injector and runs Purple's code (checks of `docs/findings/probes/worker_boot_probe.py`).
- Tests: TS-111, L3-01

## Phase 2: detection

### T-201 Marker-based and per-segment detector
- [x] Status · F-02, F-03 · done 2026-10-07: `ad-detector.ts`; playlist markers read from `DATERANGE` attributes; `twitch-trigger` alone is not a marker (B-021); a `MARKED_LIVE` backup is usable; L3-01 passed in both modes
- Files: `serviceWorker/src/modules/player/ad-detector.ts` (new), `player.ts`, `m3u8.ts`
- Done when:
  - one module holds the markers from `docs/feat.md` (F-02), replacing both copies of `hasAds`;
  - it returns the class (`NONE`, `MARKED_LIVE`, `SSAI`) and the indexes of ad segments;
  - Purple's current markers (`stitched`, `Amazon`, `DCM,` in the title) still detect.
- Tests: TS-201

### T-202 `MARKED_LIVE` path
- [x] Status · F-03 · done 2026-10-07
- Files: `serviceWorker/src/modules/player/player.ts`
- Done when a `MARKED_LIVE` playlist comes back untouched, with no backup lookup and no pause/play.
- Tests: TS-202, L3-01

### T-203 Ad segments by `DATERANGE` range and non-live titles
- [x] Status · F-02, F-03 · B-035 · done 2026-10-08: in the soak recordings the three signals agree on every segment of 814 playlists; a range covers a segment when more than half of it lies inside (B-040); L3-01, L3-02 (3 runs) and L3-08 passed on the build, with no break in them ([finding](findings/2026-10-08-ad-segment-coverage.md))
- Files: `serviceWorker/src/modules/player/ad-detector.ts`, `m3u8.ts`
- Done when:
  - in a playlist with a stitched-ad marker, a segment is an ad when its title is not `live`, when a `twitch-stitched-ad` `START-DATE` + `DURATION` covers it, or when it sits under a `twitch-stream-source` value other than `live`;
  - a `twitch-maf-ad` marker over live segments stays `MARKED_LIVE`;
  - the merge takes the ad segments of the main playlist and of each backup from the detector;
  - a preroll titled `FT|…` and a midroll titled with a number go through the backup chain.
- Tests: TS-203, L3-03 (soak)

### T-204 Backups that announce their own break
- [x] Status · F-03 · B-034, B-036 · done 2026-10-08: such a backup is skipped like one with ads; the choice and the reasons are in `docs/feat.md` (F-03) and the [finding](findings/2026-10-08-ad-segment-coverage.md#decisions); same live runs as T-203
- Files: `serviceWorker/src/modules/player/ad-detector.ts`, `player.ts`
- Done when:
  - a backup with live segments under a stitched-ad marker is not delivered as clean: either the next type is tried, or the announcement is stripped and every other line kept (the choice is decided with a test and recorded in `docs/feat.md`);
  - nothing from that announcement reaches the player through the merge.
- Tests: TS-204, L3-03 (soak)

## Phase 3: CSAI blocking

### T-301 Block `edge.ads.twitch.tv` in the page
- [x] Status · F-04 · done 2026-10-07: `fetch` and XHR answered in the page while `blockCsai` (default on) holds; the content script now sends the settings as soon as storage answers, so pages without a player (the directory, B-025) get `blockCsai` and `debug` too; L3-08 passed in both modes, with the Purple-off control showing the requests
- Files: `serviceWorker/src/page/fetch-hook.ts`, `serviceWorker/src/page/xhr-hook.ts` (new)
- Done when:
  - with `blockCsai`, `fetch` and XHR to `edge.ads.twitch.tv` never leave the page and get an empty 200 response;
  - with `blockCsai` off, they pass through;
  - blocked requests are counted per type (`preroll`, `midroll`) in the logger.
- Tests: TS-301, L3-08

### T-302 DNR rule on Chromium
- [x] Status · F-04 · done 2026-10-07: permission `declarativeNetRequestWithHostAccess` (no new install warning; the rule applies to `*.twitch.tv`, already granted); Edge reports the `csai` ruleset enabled. The static rule does not follow `blockCsai`: a future toggle has to call `updateEnabledRulesets` from an extension page
- Files: `platform/chromium/manifest.json`, `platform/chromium/rules.json` (new)
- Done when the manifest declares `declarative_net_request` with a block rule for `||edge.ads.twitch.tv^` and the JSON is valid.
- Tests: TS-302

## Phase 4: backup streams

### T-401 Page GQL headers
- [x] Status · F-05 · E9 · done 2026-10-08: the page hook reads the request headers of `gql.twitch.tv/gql` calls (never their responses) and sends the known set to every worker when one changes; a `Client-Integrity` among them becomes the worker's integrity token, as does the `/integrity` answer, the newest winning. In a midroll on L3-02, Purple's 15 token requests carried `authorization`, `client-integrity`, `client-session-id`, `client-version` and `x-device-id` (names recorded, not values); L3-01 (5 runs), L3-07 and L3-08 passed. The same L3-02 run failed the T-502 check: the break's announcement passed untouched (T-202), and the player fetched the 2 ad segments its prefetch lines pointed at ([finding](findings/2026-10-08-page-gql-headers.md))
- Files: `serviceWorker/src/page/fetch-hook.ts`, `serviceWorker/src/app.controller.ts`
- Done when:
  - `X-Device-Id` (or `Device-ID`), `Client-Integrity`, `Authorization`, `Client-Version` and `Client-Session-Id` from page GQL requests reach the worker whenever they change;
  - capture through `/integrity` (E9) keeps working;
  - backup token requests send these headers.
- Tests: TS-401, L3-02 (header names on the token requests of a break)

### T-402 GQL executed in the page
- [x] Status · F-06 · done 2026-10-08: messages follow the existing convention (worker → page `{ type: "gqlRequest", id, body, headers }`, page → worker `{ funcName: "gqlResponse", value: { id, status, body } }`); the worker uses the bridge only after the page offers it (`setGqlBridge`), so a worker without Purple's page side keeps sending its own requests; the page runs them with its fetch from before Purple's hook, so the popout rewrite (F-12) does not touch backup tokens. In a midroll on L3-07 (`/channel-c`), all 13 backup token requests ran in the page (recorded from the bridge messages, header names only), each came back with a token of its own playerType, and every ad poll outside the whitelist window got a backup; L3-01 (5 runs), L3-02 (4 runs) and L3-08 passed ([server observations](findings/2026-10-08-l3-server-observations.md#gql-through-the-page))
- Files: `serviceWorker/src/page/gql-bridge.ts` (new), `serviceWorker/src/modules/twitch/twitch.service.ts`
- Done when:
  - the worker sends `{ funcName: "gqlRequest", id, body }` and gets `{ id, status, body }` back;
  - responses are matched by `id`; with no response within 5 s, the worker sends the request itself (current path).
- Tests: TS-402

### T-403 Updated hash and full-query fallback
- [x] Status · F-07 · E3 · done 2026-10-07: `platform` sent with the current hash; on twitch.tv both hashes and the full query answer every F-09 type, and only the current hash honors `platform` (B-030, `probes/token_probe.py`)
- Files: `serviceWorker/src/modules/twitch/twitch.service.ts`
- Done when:
  - default hash is `ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9`;
  - `PersistedQueryNotFound` or a missing `streamPlaybackAccessToken` triggers a retry with `playbackAccessToken_Template`;
  - the flat response shape (`{ streamPlaybackAccessToken }`) is accepted.
- Tests: TS-403

### T-404 Usher parameters
- [x] Status · F-08 · done 2026-10-08: the stream keeps the page's usher request; without one (a playlist before the usher), Purple's own parameters on the v1 path, token and sig encoded too. In a midroll on L3-02 (`/channel-j`) the 17 backup masters came from `/api/v2/` with the page's parameters, all with status 200, for every F-09 type (B-041); L3-01 (4 runs), L3-07 and L3-08 passed ([server observations](findings/2026-10-08-l3-server-observations.md#backup-masters-on-the-v2-path))
- Files: `serviceWorker/src/modules/twitch/twitch.service.ts`, `serviceWorker/src/modules/stream/stream.ts`
- Done when:
  - backups use the parameters of the original usher request (including `supported_codecs`), replacing only `token`, `sig` and `p`;
  - `token` and `sig` go through `encodeURIComponent`;
  - the API version (v1 or v2) follows the original request.
- Tests: TS-404

### T-405 PlayerType list
- [x] Status · F-09 · E3, E4 · done 2026-10-07: the chain walks F-09's list (the setting's list once C-10 is fixed, T-602); L3-01 passed in both modes; no break came up in the 3 L3-02 runs after it, so the new chain is not seen live yet
- Files: `serviceWorker/src/modules/player/player.ts`, `serviceWorker/src/modules/stream/interface/stream.enum.ts`, `setting.interface.ts`
- Done when:
  - the chain walks `backupPlayerTypes` (default in `docs/feat.md`) instead of the fixed `frontpage` → `picture-by-picture` sequence;
  - the first clean backup replaces the playlist (E4);
  - `autoplay` is only tried with `lowQualityFallback` and is requested with `platform: "android"`.
- Tests: TS-405

### T-406 Pinned type and contaminated type
- [x] Status · F-10 · done 2026-10-08: a type is contaminated when none of its servers gave a clean backup (ads or its own break announced, T-204); while skipped it gets no fetch and no token request; L3-01, L3-02 (3 runs), L3-07 and L3-08 passed, with no break in them, so pinning is not seen live yet ([finding](findings/2026-10-08-backup-type-pinning.md))
- Files: `serviceWorker/src/modules/player/player.ts`
- Done when:
  - with `pinBackupPlayerType`, the last clean type is tried first on the next break (`autoplay` is never pinned);
  - a type that returned ads is skipped for 5 s.
- Tests: TS-406

### T-407 Backup with the same codec and quality
- [x] Status · F-11 · E8 · done 2026-10-08: the target is the variant of the player's master the polled playlist belongs to (quality, resolution, codecs), or the quality the player reported when the URL is not in it; after same resolution comes the best variant of the same family, then `bestQuality()`; `backupUsed` names the backup variant's quality. L3-01 (both modes), L3-02 (3 runs), L3-07 and L3-08 passed on the build; they had prerolls on 5 loads and a midroll, handled with backups, and in each preroll the ad segments the player requested were answered blank. Which variant the backups used is not recorded in those runs (L3-01 runs without `debug`); the soak reads it from `backupUsed` ([server observations](findings/2026-10-08-l3-server-observations.md))
- Files: `serviceWorker/src/modules/stream/interface/stream.types.ts`
- Done when variant selection goes: same quality and same codec family (`avc`, `hevc`, `av1`) → same resolution with another codec → `bestQuality()`.
- Tests: TS-407

### T-408 Page token as `popout`
- [x] Status · F-12 · E10 · done 2026-10-08: only `PlaybackAccessToken` operations change (Brave's script changes any `playerType` in such a body); on twitch.tv all 13 page masters of the runs came from popout tokens and played; prerolls still came on 3 of them (B-042), and the ad segments the player requested were answered blank; L3-01 (4 runs), L3-02 (4 runs), L3-07 and L3-08 passed ([server observations](findings/2026-10-08-l3-server-observations.md#the-page-token-as-popout))
- Files: `serviceWorker/src/page/fetch-hook.ts`, `serviceWorker/src/app.controller.ts`
- Done when:
  - with `forcePopoutToken`, the `playerType` of the page's `PlaybackAccessToken` becomes `popout` (single and batched bodies);
  - requests with `picture-by-picture` are left alone, to keep E10;
  - `parent_domains` is removed from the usher URL in the worker.
- Tests: TS-408

### T-409 Backup tokens at the page's picture-by-picture request
- [x] Status · F-19 · done 2026-10-08: soak e, on and off on one channel, on alone on another; the default stays off. The blank segments, the time to the first backup and the token requests during the break matched; every stitched break in soaks d and e started with 1 to 3 polls that only announce it, answered blank whatever the tokens. The prewarmed tokens got their own pod. At a channel's first midroll the first backup was `site` 720p60 with F-19 (1 break) and the `picture-by-picture` 360p master without it (3 breaks in soak d); 4 of the 14 prewarms had a midroll after them ([finding](findings/2026-10-08-prewarm-backups.md))
- Origin: every stitched midroll in the soaks came 3 to 11 s after the page asked for a `picture-by-picture` master (B-044); Purple asks for backup tokens only at the first poll with ads, so that poll gets blank segments.
- Files: `serviceWorker/src/modules/player/player.ts`, `app.controller.ts`, `setting.interface.ts`, `platform/src/content-script.js`
- Done when:
  - with `prewarmBackups` (default off), the picture-by-picture route asks a new token and master for every backup type, at most once a minute;
  - a soak with it on and off on the same channel compares, at each midroll start: whether a clean backup was there at the first poll with ads, blank segments, token requests during the break, and whether tokens asked before the break got their own pod;
  - the default changes only on that evidence, recorded in `docs/feat.md`.
- Tests: TS-409, soak

### T-410 Prewarm only the types without a master
- [x] Status · F-19 · done 2026-10-08: the picture-by-picture route asks tokens only for the backup types with no stored master (TS-409). Soak f moved to another channel after each stitched midroll: at a channel's first midroll the first backup was `site` 720p with `prewarmBackups` (7 of 7 in soaks e and f) and the 360p `picture-by-picture` master without it (6 of 6 in soaks d and f), with the same blank segments; `prewarmBackups` is on by default ([finding](findings/2026-10-08-prewarm-backups.md#soak-f))
- Origin: F-19 only changed the start of a channel's first midroll, when no backup type but `picture-by-picture` has a master (T-409); at every later page request it asks 7 tokens for types that already have one.
- Files: `serviceWorker/src/modules/player/player.ts`
- Done when:
  - with `prewarmBackups`, the picture-by-picture route asks tokens only for the backup types with no stored master;
  - soaks on several channels compare the first backup at each channel's first midroll with it on and off;
  - the default changes only on that evidence, recorded in `docs/feat.md`.
- Tests: TS-409, soak

## Phase 5: playlist assembly

### T-501 Merge with time tolerance
- [x] Status · F-13 · E5 · done 2026-10-08: the nearest backup segment within half the ad segment's duration (2 s when the duration is unknown), backups tried in order; the backup's `EXT-X-MAP` line goes before the segment's `#EXTINF` and the main one comes back before the next main segment or the prefetch lines after the last one; a backup with `EXT-X-MAP` is not used in a playlist without one, nor the other way round. L3-01 (5 runs), L3-02 (4 runs), L3-07 and L3-08 passed; a preroll in L3-02 was handled with backups (`autoplay` on 21 polls, `site` on 7) and blank segments, with no merge, so the tolerance and the `EXT-X-MAP` switch are not seen live yet ([server observations](findings/2026-10-08-l3-server-observations.md#a-preroll-on-the-t-501-build))
- Files: `serviceWorker/src/modules/player/m3u8.ts`
- Done when:
  - a backup segment matches an ad segment when their `PROGRAM-DATE-TIME` differ by less than half the segment duration;
  - when a segment from another fMP4 source is inserted, that source's `EXT-X-MAP` goes before it and the main one is restored after;
  - `EXT-X-MEDIA-SEQUENCE` and the main playlist's segment count do not change.
- Tests: TS-501

### T-502 Blank segment as last resort
- [x] Status · F-14 · done 2026-10-08: as in Brave's script, the ad segments keep their lines and the worker answers their URIs with `BLANK_MP4`, an fMP4 init segment without samples; the first poll of a break, before any backup is ready, is blanked too. L3-01, L3-02 (3 runs), L3-07 and L3-08 passed; in a preroll on L3-01 (userscript) the first poll's ad segment the player requested was answered in the worker, none reached the network, and clean backups followed. A midroll on L3-02 then showed the announced break's prefetch lines reaching the network; they now go and are answered blank too ([finding](findings/2026-10-08-blank-segments.md))
- Files: `serviceWorker/src/modules/player/m3u8.ts`, `serviceWorker/src/modules/player/blank-segment.ts` (new), `player.ts`, `app.controller.ts`
- Done when:
  - with `stripFallback`, every ad segment left after the merge gets the blank segment when the player requests it, and the request does not reach Twitch; the playlist keeps the segment's lines, so numbering and durations stay. The wording before 2026-10-08 asked for "a blank segment with the same duration" and "no ad URI in the output"; Brave's script, the reference, keeps the URIs and answers them in the worker with a blank file that has no duration ([finding](findings/2026-10-08-blank-segments.md));
  - `EXT-X-PART`, `EXT-X-TWITCH-PREFETCH` and `EXT-X-PRELOAD-HINT` lines pointing to ads are removed, and their URIs answered blank too;
  - no ad media is fetched from Twitch for the segments left;
  - `blankInserted` (F-17) counts the ad segments blanked for the first time.
- Tests: TS-502

## Phase 6: player control and settings

### T-601 Ad break state machine
- [x] Status · F-15 · E6 · done 2026-10-08: `ad-break.ts` holds the state (`idle`, `ad`, `recovering`, 10 s of clean polls back to `idle`) and gives the same pause/play as before; with `reloadAfterAd` (default off) the end of a break posts `reload`, once per break and at most once every 30 s. The page runs a soft `setSrc` on Twitch's player state, found in the React tree as Brave's script does (`page/player-reload.ts`), and answers `reloadResult`; without a player state the worker pauses and plays. L3-11 (new, `reloadAfterAd` on): 6 of 6 passed, 2 prerolls ended with a reload the page did, one of which brought a new preroll (B-045, [finding](findings/2026-10-08-ad-break-reload.md)). With the defaults: L3-01 (both modes), L3-02 (3 runs; 2 joined a running midroll, handled with backups, no ad overlay, no backup poll with ad segments; a first attempt stopped at launch when the fresh profile had not enabled the unpacked build within 20 s), L3-07 and L3-08 (both modes) passed
- Files: `serviceWorker/src/modules/player/ad-break.ts` (new), `player.ts`, `index.ts`, `page/player-reload.ts` (new), `app.controller.ts`, `platform/src/content-script.js`, `e2e/scenarios/l3_11.py` (new)
- Done when:
  - states `idle` → `ad` → `recovering` → `idle`, with pause/play (E6) on transitions as today;
  - with `reloadAfterAd`, one reload at the end of the break, at most one every 30 s;
  - the reload mechanism is chosen in this task and written down in `docs/architecture.md`.
- Tests: TS-601, L3-11

### T-602 Settings without reload
- [x] Status · F-16 · E7 · C-10 · done 2026-10-08: the controller passes `value` to the player; the content script listens to `storage.onChanged` and also sends `backupPlayerTypes` and `lowQualityFallback`; L3-07 passed on the T-602 build and failed on the build before it (the control); L3-01, L3-02 (3 runs) and L3-08 passed ([finding](findings/2026-10-08-settings-without-reload.md))
- Files: `platform/src/content-script.js`, `serviceWorker/src/index.ts`, `serviceWorker/src/app.controller.ts`
- Done when:
  - `Player.setting` holds the `value` of the `setSettings` message, so `isWhitelist()` sees the list (C-10; starts with a failing test, see `docs/findings/2026-10-03-worker-unit-tests.md`);
  - a `storage` change (`onChanged`) reaches every live worker and the whitelist applies on the next playlist.
- Tests: TS-602, L3-07

### T-603 Channel in the popup
- [x] Status · E7 · done 2026-10-08: `channelFromUrl` in `popup.js` reads the channel from `www.twitch.tv/<channel>`, `m.twitch.tv/<channel>` and `www.twitch.tv/popout/<channel>/...`, query strings and later path parts left out, in lower case as the worker reads it from the usher path (a channel opened as `/SomeChannel` was stored as `SomeChannel` and never matched); any other URL leaves the button off ("Waiting for channel"). TS-603 covers it (the popup has no level 3 scenario of its own); L3-07, which runs `popup.js` in the popup page it opens to change the storage (no channel there), and L3-01 (both modes) passed on the build
- Files: `platform/src/common/js/popup.js`
- Done when the channel is read from `www.twitch.tv/<channel>`, `m.twitch.tv/<channel>` and `www.twitch.tv/popout/<channel>/...`.
- Tests: TS-603

### T-604 Pause length at the break edges
- [x] Status · F-18 · E6 · done 2026-10-08: `pausePlayDelayMs` sets the wait (a number from 0 up, else 1500); with 0, `pause` and both `play` go in the same turn. L3-12 (new): 15 of 16 runs passed (the other stopped at launch, before Purple ran); at 0 ms two break ends during playback took 188 and 756 ms from the `<video>` `pause` to `playing`, at 1500 ms two midroll starts took 1687 and 2066 ms. Soak d (two hours, three sessions, 0 and 1500 ms on the same channel): at 0 ms the 12 edges of six midrolls took 0.67 to 1.05 s, at 1500 ms the two of the same midroll 2.62 and 1.74 s, no ad overlay or ad media in any; the default is 0 since then ([finding](findings/2026-10-08-pause-length.md))
- Origin: in the soaks the video stopped 3 to 4 s per break, the two pause/play pairs of E6 at its edges, 1.6 to 1.7 s each, of which 1.5 s is the wait between `pause` and `play` ([midroll soak](findings/2026-10-08-midroll-soak.md#video-at-the-break-edges)). The wait went from 500 ms to 1500 ms in 2024 (`10128a5`) with no reason recorded; Brave's script calls `play` right after `pause`.
- Files: `serviceWorker/src/modules/player/player.ts`, `setting.interface.ts`, `platform/src/content-script.js`, `e2e/scenarios/l3_12.py` (new)
- Done when:
  - the wait between `pause` and `play` comes from `pausePlayDelayMs` (default 1500, E6 as before); with 0, `play` is posted right after `pause`;
  - L3-12 measures each break edge (the worker's `pause`, the `<video>` `pause` and `playing`, `currentTime` after it) for the value set in storage;
  - a finding compares 0 and 1500 on live breaks; the default changes only on that evidence, recorded in `docs/feat.md`.
- Tests: TS-604, L3-12

## Phase 7: build and release

### T-701 Single Bun build
- [x] Status · E11 · done 2026-10-08: `build` runs `bun serviceWorker/build.ts`, `bun cli/build.ts` and the userscript build; `dev` passes `dev` to the worker build (sourcemaps) and writes the unpacked builds; `ts-node`, the `bun` package and the `preinstall` hook (with `cli/preinstall.js`) are gone, and `bun run test` runs Bun 1.4.1. Zips are `dist/purple-adblock-<version>-<platform>.zip`; the unpacked builds moved to `dist/purple-adblock-<platform>` (e2e, `docs/tests.md` and two probes follow). The builders take the output folder and the worker bundle and resolve once the zip is written; the userscript takes its `@version` from `package.json` (a direct `bun platform/tampermonkey/build.js` wrote `undefined`). `lint` lints `serviceWorker/src`, `platform/src` and `cli`. `bun run build` checked by hand: worker bundle, both zips (17 entries each, no spec file, manifest 2.6.7) and the userscript. L3-01 (both modes) and L3-07 passed on the unpacked build at the new path; a first L3-01 attempt froze on the channel page (the renderer idle and answering no CDP call for 7 min) and was stopped
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
- [x] Status · E11 · done 2026-10-08: `release.yml` runs on a push to `main` and publishes the `package.json` version (tag and title) with `LICENSE`, both zips and the userscript; `pre-release.yml` runs on a pushed tag with a hyphen (`2.7.0-beta.1`) and publishes a pre-release of that tag (it ran on pushes to `develop` before). Both: `actions/checkout@v4`, `oven-sh/setup-bun@v2` (Bun 1.4.1), `bun install --frozen-lockfile`, `bun run build`, `softprops/action-gh-release@v2` in place of the archived `marvinpinto/action-automatic-releases`, `permissions: contents: write`; no `pull_request`, no `workflow_dispatch`, no test step. Not run on GitHub: nothing was pushed
- Files: `.github/workflows/release.yml`, `.github/workflows/pre-release.yml`
- Done when:
  - workflows use `oven-sh/setup-bun` and Bun commands only;
  - no workflow runs on `pull_request` and none runs tests: tests run locally (T-003), Actions minutes are limited;
  - releases only on push to `main` or on a tag;
  - `actions/checkout` v4; `marvinpinto/action-automatic-releases` (archived) is replaced by a maintained action.
- Tests: TS-702

## Phase 8: investigations

Odd behaviors seen in the runs. Each task ends with its cause in a finding (and in `docs/server/` when it is the server's), and a fix task when Purple causes it.

### T-801 Second picture-by-picture request at each midroll
- [x] Status · C-13 · done 2026-10-08: since C-12, E6 pause/play went to the picture-by-picture player the page creates in the main player's worker (B-051); that player asked for a new master 0.2 to 0.4 s later (13 of 13 in soaks e and f). Now the first player the page creates in a worker keeps pause/play until the page deletes it. Soak g on the fix: at the `/channel-h` midroll pause/play went to player 1, no picture-by-picture request followed, and the page deleted player 2 41 s after creating it ([finding](findings/2026-10-08-pbyp-player-pause.md))
- Origin: in soaks e and f a second picture-by-picture request came 8 to 11 s after each request a midroll followed; soak d had none ([prewarm backups](findings/2026-10-08-prewarm-backups.md#picture-by-picture-requests)).
- Files: `serviceWorker/src/index.ts`, `e2e/recorder.js`
- Done when:
  - a player created later in the same worker does not take pause/play; after the first player's `delete`, the next one created does;
  - a soak with midrolls shows pause/play to player 1 at the edges and no picture-by-picture request right after them.
- Tests: TS-801, soak

### T-802 A midroll starts on the 360p picture-by-picture master
- [x] Status · F-10 · done 2026-10-08: on 8 pairs of breaks on one load the next break started on the type the previous one ended on (8 of 8); 2 ended on `picture-by-picture` and the next midroll stayed 24 s and 5 s on its 360p master. F-10 now pins neither `autoplay` nor `picture-by-picture` ([finding](findings/2026-10-08-backup-quality-at-break-start.md))
- Origin: the 17:27 break on `/channel-d` ended on `picture-by-picture`, pinned (F-10), and the 17:37:52 midroll started on its 360p master, then moved to `site` 720p60 after 5 s; soak d's 10:49:00 break also started on it ([prewarm backups](findings/2026-10-08-prewarm-backups.md#first-backup)).
- Check: how often a break ends pinned to `picture-by-picture` in soaks d to f, and whether the 720p types were clean again when the next break started.
- Done when: the count and a decision are in a finding; a fix task (for example, not pinning `picture-by-picture` while another type gave a clean backup in the same break) if the behavior changes.
- Tests: probe over the soak recordings; TS for any change

### T-803 First backup at 160p in a midroll right after the page opened
- [x] Status · F-11 · done 2026-10-08: no change. T-407 follows the variant the player polls; 5 and 12 s after the page opened the player was still on its 160p variant, and the backups moved to 720p60 with it 6 to 7 s later. Two other breaks that early started on 720p ([finding](findings/2026-10-08-backup-quality-at-break-start.md))
- Origin: soak e 15:15:45 on `/channel-a` (`site` 160p30, 6 blank segments) and soak f 18:30:38 on `/channel-k` (`site` 160p, 6 blank segments), taken at first for breaks running at the load; the other early breaks started on 720p ([prewarm backups](findings/2026-10-08-prewarm-backups.md#soak-f)).
- Check: the variant target (T-407) before the player reports a quality, the `setQuality` messages at the load, and the main variant then.
- Done when: the cause is in a finding; a fix task if Purple picks the lowest variant without a reason.
- Tests: probe over the soak recordings; TS for any change

### T-804 The video waits 8 s inside a break after a backup behind the main playlist
- [x] Status · B-048 · done 2026-10-08: not reproduced. At level 2 (L2-09, `sim/` with backups 3 and 5 segments behind, 6 runs) the video never stood still; in soaks d to g it was the only stall of 7 s or more among 21 midrolls later in a load. The other long stalls came in breaks in the first 12 s after the page opened (T-810) ([finding](findings/2026-10-08-backup-behind.md))
- Origin: soak d 09:44:54, 9 s into the break the `<video>` waited 8.1 s; just before, the first backup playlist had a `MEDIA-SEQUENCE` one below the main playlist's last poll ([pause length](findings/2026-10-08-pause-length.md#soak-d)).
- Check: a level 2 scenario on `sim/` with a backup 1 to 5 segments behind at the break start.
- Done when: reproduced or ruled out at level 2, with the cause in a finding; a fix task if Purple causes it.
- Tests: L2 scenario

### T-805 Player at readyState 0 with Purple in the worker
- [x] Status · Q-014 · done 2026-10-08: not reproduced. The 58 soak loads of 2026-10-07 and 08 (54 with Purple) all reached `readyState` 4 ([`readystate_probe.py`](findings/probes/readystate_probe.py)); the cause found on 2026-10-07, an ad playlist throwing because usher v2 was not routed, was fixed by T-103
- Origin: 1 of 3 loads on 2.6.7 and on the T-001 build stayed at `readyState` 0 ([worker injection race](findings/2026-10-04-worker-injection-race.md)).
- Check: the level 3 and soak runs since 2026-10-07 for a load whose `<video>` never left `readyState` 0, with the worker console and the playlists of such a run.
- Done when: seen again with a cause, or not seen in the runs since and Q-014 closed as not reproduced.
- Tests: probe over the recordings

### T-806 Player stall on rewritten playlists on fresh profiles only
- [x] Status · C-01 · done 2026-10-08: the channel, not the profile. The build before T-101 regenerated playlists without `EXT-X-MAP`; on the fMP4 channel the fresh profiles opened, 18 of 18 loads without ads stalled (plain, Strict, device config unreachable), and on the MPEG-TS channel the dedicated profile opened, 6 of 6 played. Since T-101 `EXT-X-MAP` stays ([finding](findings/2026-10-08-rewritten-playlist-stall.md))
- Origin: on 2026-10-07, loads on fresh profiles stalled on rewritten playlists without ad markers, and the same loads played on the dedicated profile; the difference was not found ([backups and rewritten playlists](findings/2026-10-07-backups-and-rewritten-playlists.md#player-stall)). Since then, playlists without ads pass untouched (C-01), and the dedicated profile was found on Strict tracking prevention (Balanced since 2026-10-08).
- Check: the 2026-10-07 case (rewritten playlists without ads) on a fresh profile and on the dedicated profile, at level 2 on `sim/`.
- Done when: the difference is explained, or the stall does not reproduce.
- Tests: L2 scenario

### T-807 Backups with ad segments in a break running at the channel load
- [x] Status · B-036 · done 2026-10-08: a backup token asked during a preroll, or when the page joins a running break, gets a preroll of its own (B-052): in the level 3 runs since T-401, backups had ad segments in 17 of 17 preroll loads (326 of 603 backup polls) and in 2 of 7 midroll loads (11 of 175). Purple drops those backups and blanks the ad segments left; no ad media reached the player. Per-type data is not recorded ([finding](findings/2026-10-08-backups-in-prerolls.md))
- Origin: soak f 17:47:52 on `/channel-f`: the 5 backup playlists with a break had ad segments, while in midrolls no backup playlist had any since T-401 (B-036) ([prewarm backups](findings/2026-10-08-prewarm-backups.md#soak-f)).
- Check: backup playlists with ad segments in every break at a load across the soaks, by backup type and token age.
- Done when: the rule is in `docs/server/`; a fix task if a backup type or a token timing avoids it.
- Tests: probe over the soak recordings

### T-809 Still video at midroll edges with E6 on the main player
- [ ] Status · E6 · F-18
- Origin: midrolls later in a load stood still 0 s in soak f, where E6's pause/play went to the picture-by-picture player (C-13), and about 1 s in soaks d and g, where they reached the main player; soak e, with the same C-13 bug, had 2 to 3 s ([backup behind](findings/2026-10-08-backup-behind.md#soaks)).
- Check: midrolls with E6 on the main player (the C-13 build) and with E6 sent nowhere, on the same channels: still seconds, ad overlay, ad media reaching the player, and the player's position after each edge.
- Done when: whether E6 is needed at midroll edges is in a finding; E6 stays (rule 2), and a change of when it runs goes behind a setting with its default recorded.
- 2026-10-08: `pausePlayOnBreaks` (F-21, default on) turns E6 at the break edges off, for a soak pair on one channel (B-049: both sessions get the same midrolls).
- Tests: TS-809, soak, L3-12

### T-810 The video stands still 7 to 8 s in a break that starts right after the page opens
- [x] Status · F-14 · done 2026-10-09: the blank segments. A break whose first polls with ad segments come before any backup is ready gets 3 to 4 of them answered blank (6 to 8 s with no frames), and the player then restarts from position 0; with E6 off a joined break stood still 7 s too, and at level 2 eight blank segments stood the video still 12 s. A backup ready earlier can avoid it for midrolls announced right after the load (T-812); in a break running at the load a backup token can get a preroll of its own (B-052) ([finding](findings/2026-10-08-early-break-stall.md))
- Origin: the four breaks that started 5 to 12 s after the page opened (soaks e and f) stood still 7 to 8 s; midrolls later in a load 0 to 3 s ([backup behind](findings/2026-10-08-backup-behind.md#soaks)).
- Check: the same in record mode (no Purple) and with Purple, at the page load; what the player does in those seconds (first variant, E6 at the load, the break's first polls).
- Done when: the cause is in a finding; a fix task if Purple causes it.
- Tests: L3-02, soak

### T-811 The page's ad UI on a break whose ad segments reached the player
- [x] Status · F-14 · F-20 · done 2026-10-09: the ad's `DATERANGE` lines. In six joins into a running midroll on `/channel-d`, with blanked ad segments reaching the player each time, the ad UI showed for 47 to 49 s with those lines (3 of 3) and not at all without them (3 of 3); `stripAdMarkers` is on by default ([finding](findings/2026-10-08-ad-ui-on-early-breaks.md))
- Origin: in soaks e and f the ad UI (`video-ad-label`, `video-ad-countdown`) showed in 4 of the 5 breaks whose ad segments reached the player (blanked, no ad media from the network): 18 s, 49 s, and on both soak e sessions for the whole 2 hours; it never showed in the 23 breaks whose polls all got a backup. Those 5 breaks came 5 to 12 s after the page opened, before any backup was ready; the exception was a preroll.
- Check: the same kind of break with the ad's `DATERANGE` lines removed (`stripAdMarkers`, F-20) and kept, for instance by opening a channel while another session sees its midroll start (B-049).
- Done when: whether removing those lines keeps the ad UI off is in a finding, with `stripAdMarkers`' default decided on it.
- Tests: TS-811, a join-on-break run

### T-812 Backup tokens at the channel load
- [~] Status · F-19 · F-22 · 2026-10-09: `prewarmAtLoad` (default off) runs F-19's prewarm at the page's usher request (TS-409); the live comparison is open
- Origin: two of the four breaks in the first seconds after the page opened were midrolls announced 5 and 12 s after it, before any backup token was asked; their first ad segments were answered blank and the video stood still 7 s (T-810).
- Files: `serviceWorker/src/modules/player/player.ts`, `serviceWorker/src/app.controller.ts`
- Done when:
  - with `prewarmBackups`, the page's usher request for a channel also brings tokens for the backup types with no stored master;
  - soaks or joins compare, at midrolls in the first minute of a load, the blank segments and the still video with it and without it;
  - the default is recorded in `docs/feat.md`.
- Tests: TS-409, soak

### T-813 A fresh profile enables the unpacked build too late
- [x] Status · harness · done 2026-10-09: handled in the harness. 3 of 37 L3-13 runs and 1 joiner launch stopped with "the unpacked Purple build is not enabled" after `lib.EXTENSION_WAIT` (45 s); `e2e/run.py` now gives a fresh-profile run one more launch on a new fresh profile (`launches` in the report), and `e2e/join_break.py` three. Why Edge sometimes takes longer on a fresh profile was not looked into.
- Origin: the T-808 runs (`~/purple-recordings/2026-10-08-t808`) and the join runs of 2026-10-08.
- Files: `e2e/run.py`, `e2e/join_break.py`
- Tests: L2-01 after the change

### T-808 New preroll after a player reload
- [x] Status · B-045 · Q-018 · done 2026-10-09: no reload kind avoided it. L3-13 reloaded the player at 6 break ends: a soft reload right away brought no new break (0 of 2; 1 of 4 with B-045's), a soft reload 15 s later a preroll (1 of 1), a new token a midroll (1 of 2), a new player and token a break (1 of 1). `reloadAfterAd` stays off ([finding](findings/2026-10-09-reload-kinds.md))
- Origin: a soft reload with the same token at the first live poll after a preroll brought a new preroll in 1 of 2 reloads ([player reload](findings/2026-10-08-ad-break-reload.md)); `reloadAfterAd` stays off.
- Check: L3-11 with the reload delayed, with a new token, and after midrolls.
- Done when: the condition is in `docs/server/` (B-045, Q-018), and `reloadAfterAd`'s default is decided on it.
- Tests: L3-11

## Open decisions

- E12 (proxy): the servers went offline in 2023 (#79) and the worker does not read `toggleProxy` or `proxyUrl`. Either bring back the proxy path with a user-provided URL or keep only the UI.
- `purpleadblockserver` submodule: declared in `.gitmodules`, no gitlink in the repo.
- README: recommends `pixeltris/TwitchAdSolutions`, which is archived; replace with Brave's setup (Shields Aggressive + Brave Twitch/Experimental lists) or drop the recommendation.
- `background.js`: not referenced by any manifest.
