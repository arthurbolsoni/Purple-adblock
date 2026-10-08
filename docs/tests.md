# Tests

## Test levels

| Level | What runs | Where | Tooling | Test IDs |
| --- | --- | --- | --- | --- |
| 1. Unit | Purple modules and the worker pipeline against the in-process `FakeTwitch` | Bun process | `bun test` (Jest fallback); `cargo test` for `sim/` | TS-xxx |
| 2. Player + server | real player (Amazon IVS SDK) with Purple on an isolated local page, against `sim/`, our Rust server reproducing Twitch's server | Edge via nodriver, localhost only | `sim/`, nodriver | L2-xx |
| 3. Live site | Purple on twitch.tv, using known techniques to trigger behaviors, with the recorder on | Edge via nodriver, twitch.tv | nodriver, recorder | L3-xx |

Level 3 discovers behaviors and writes them to `docs/findings/` and `docs/server/`. Level 2 reproduces them deterministically in `sim/`. Level 1 covers the logic with fixtures taken from both.

## Rules

1. Every task in `docs/task.md` closes with its listed tests passing: TS-xxx under `bun test`, plus any L2-xx or L3-xx it lists.
2. Tests run on this machine: `bun run check`, also run by the pre-commit hook (`.githooks/pre-commit`, installed with `bun run hooks:install`). No GitHub Actions workflow runs tests.
3. Bug fix: first the failing test that reproduces the bug, then the fix.
4. Logic that crosses page and worker, or spans more than one module, gets an integration test on top of unit tests.
5. Level 1 never hits the network. Every Twitch response comes from the `FakeTwitch` harness and the fixtures.
6. Level 2 never opens twitch.tv.
7. Levels 2 and 3 add to level 1; they never replace it.
8. Every discovery made while testing goes to `docs/findings/`; server behavior goes to `docs/server/`.

## Tooling

- Runner: `bun test`, APIs from `bun:test` (`describe`, `test`, `expect`, `mock`, `spyOn`, `beforeAll`, `afterEach`, `setSystemTime`, `jest.useFakeTimers`, `jest.advanceTimersByTime`). Checked on Bun 1.4.1: legacy decorators (`experimentalDecorators` in `tsconfig.json`), fake timers, the `?raw` plugin, and global `fetch`, `Response`, `addEventListener` and `Bun.YAML`.
- Worker code runs on Bun's globals (`fetch`, `Response`, `Blob`, `URL.createObjectURL`, `EventTarget`).
- Page and platform code (`index.ts`, `content-script.js`, `popup.js`) runs on happy-dom through `@happy-dom/global-registrator`, registered per file with `useDom()` from `harness/dom.ts` or `usePageEnv()` from `harness/page-env.ts` (register in `beforeAll`, unregister in `afterAll`). File loading is off, so nothing reaches the network. happy-dom calls `on*` handler properties without binding `this`; tests that depend on it call the handler with the element as `this`.
- Package scripts (`bun run test`) use the `bun` binary from `node_modules/.bin` while the `bun` npm package is a dependency; it pins the same version as the local runtime until T-701 removes it.
- `bunfig.toml` ignores `dist/**`, and the builders leave `*.spec.ts` out of the extension (`cli/files.js`): tests next to the platform scripts are neither run from the build output nor shipped.
- `bun test` runs every file in one process. A test that changes a global restores it in `afterEach`; the harness helpers do this themselves.
- There is no `isolateModules`/`resetModules`. Tests build fresh instances through `createRouter(controller)`, `bindMessages(scope, controller)` and `bootstrapWorker(scope)` (T-001) instead of re-importing modules.
- `Date.now`-based logic (cooldowns) uses `setSystemTime`; `setTimeout`-based logic uses `jest.useFakeTimers()`.
- Bun's `Response` accepts a body with status 204, while browsers throw. Page-hook tests assert that the original response object is returned with `bodyUsed === false`.

### Jest fallback

`bun test` is the default. A test file may use Jest when `bun test` cannot cover the case (missing API, or a runtime difference that changes the result). In that case:

- the file is named `*.jest.spec.ts` and starts with a comment giving the reason;
- `jest` and `@swc/jest` are added to `devDependencies` with a `test:jest` script, and `bun test` ignores `*.jest.spec.ts`;
- `bun run check` runs both `bun test` and `bun run test:jest`;
- the file is listed below.

| File | Reason |
| --- | --- |
| (none yet) | |

### `bunfig.toml`

```toml
[test]
preload = ["./serviceWorker/test/preload.ts"]
```

### `serviceWorker/test/preload.ts`

Resolves Vite's `?raw` imports (used by `index.ts`) to `test/stubs/worker-bundle.ts`, which exports a fixed string; tests import the same stub to compare against it.

```ts
import { plugin } from "bun";
import { join } from "path";

const STUB = join(import.meta.dir, "stubs", "worker-bundle.ts");

plugin({
  name: "raw-suffix",
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, () => ({ path: STUB }));
  },
});
```

## Layout

```
serviceWorker/
  src/**/x.spec.ts                 # unit tests next to the code
  test/
    preload.ts
    stubs/worker-bundle.ts         # stands in for the built worker (`?raw`)
    integration/*.int.spec.ts      # integration tests (worker pipeline, page)
    fixtures/README.md             # provenance of every fixture
    fixtures/m3u8/*.m3u8
    fixtures/gql/*.json
    repo/local-checks.spec.ts      # scripts, pre-commit hook, workflows without tests (TS-003)
    harness/                       # each piece is covered by a spec here or in integration/
      fake-twitch.ts
      worker-scope.ts
      page-env.ts
      dom.ts
      sanitize.ts
      fixtures.ts                  # fixture(), fixtureJson(), listFixtures()
      console.ts                   # silenceConsole() for the whole file
platform/src/**/x.spec.ts          # platform scripts (happy-dom)
sim/                               # level 2 server (Rust)
  Cargo.toml
  src/                             # cargo test
  scenarios/*.json                 # one scenario per reproduced behavior set
  media/                           # generated with ffmpeg, gitignored
  page/                            # isolated player page (Purple bundle + IVS SDK)
e2e/                               # levels 2 and 3 drivers (Python + nodriver + Edge)
  run.py                           # entry: python e2e/run.py <scenario|all> [--mode extension|userscript|record]
  lib.py                           # Edge on a hidden desktop, dedicated profile, modes, JSON reads
  recorder.js                      # page and worker state recorder (window.__e2e)
  worker-logger.js                 # runs first in every worker: fetches, what Twitch answered, what the player got
  server.py                        # summary of what Twitch's server did during a load (run report, docs/server/)
  twitch_selectors.py              # not selectors.py: that name shadows the standard library module asyncio imports
  scenarios/                       # one module per scenario (l3_01.py, l3_02.py) and common.py
  requirements.txt
```

Scripts under `platform/src` load as classic scripts in the browser. To test them, pure functions are exported with `if (typeof module !== "undefined") module.exports = { ... }`, which does not change browser behavior.

## Fixtures

### `fixtures/m3u8`

| File | Content |
| --- | --- |
| `master-site-v2.m3u8` | captured: the page's v2 master, no `EXT-X-MEDIA`, `IVS-NAME` and `STABLE-VARIANT-ID` per variant, 24 `SESSION-DATA` lines |
| `master-frontpage-v1.m3u8` | captured: a v1 backup master with `#EXT-X-TWITCH-INFO` and `EXT-X-MEDIA` |
| `master-avc.m3u8` | master with `EXT-X-MEDIA` (`NAME`) and chunked, 720p60, 480p30, 360p30, 160p30 variants, `avc1` codecs, URLs on `edge.playlist.ttvnw.net` (B-003) |
| `master-video-weaver.m3u8` | same variants on `video-weaver.example.hls.ttvnw.net`, the host Purple 2.6.7's variant regex reads |
| `master-hevc.m3u8` | master with HEVC and AV1 variants besides AVC |
| `master-empty.m3u8` | master with no variants |
| `media-live-ts.m3u8` | live TS media playlist with `PROGRAM-DATE-TIME` and `EXT-X-TWITCH-PREFETCH` |
| `media-live-fmp4.m3u8` | live fMP4 media playlist with `EXT-X-MAP` |
| `media-ll-hls.m3u8` | media playlist with `EXT-X-PART` and `EXT-X-PRELOAD-HINT` |
| `media-ssai-preroll.m3u8` | every segment is an ad: `DATERANGE` `twitch-stitched-ad`, `twitch-trigger`, `twitch-ad-quartile` with `X-TV-TWITCH-AD-*`, `Amazon\|AD_ID` titles, `/adsquared/` URIs |
| `media-ssai-midroll.m3u8` | live and ad segments mixed |
| `media-marked-live.m3u8` | `DATERANGE` `twitch-stitched-ad` with no ad segment |
| `media-false-positive.m3u8` | `stitched` outside the segment title, `twitch-session`, `twitch-stream-source` |
| `backup-clean.m3u8` | backup without ads, aligned by `PROGRAM-DATE-TIME` with `media-ssai-midroll.m3u8` |
| `backup-ads.m3u8` | backup with ads |
| `backup-fmp4-other-map.m3u8` | fMP4 backup with a different `EXT-X-MAP` than the main playlist |

### `fixtures/gql`

| File | Content |
| --- | --- |
| `token-ok.json` | `{ data: { streamPlaybackAccessToken: { value, signature } } }` |
| `token-flat.json` | `{ streamPlaybackAccessToken: { value, signature } }` (shape seen for `embed`) |
| `persisted-not-found.json` | `PersistedQueryNotFound` error |
| `token-integrity-error.json` | integrity error |
| `page-gql-init.json` | `init` of a page GQL request carrying the F-05 headers |
| `page-token-batch.json` | batched body with `PlaybackAccessToken` and other operations |

Provenance (observed, reported by Brave, or synthetic) is in `serviceWorker/test/fixtures/README.md`. The current files are hand-written from `docs/server/`; captures from the recorder (T-005) replace them once they exist.

### Sanitizing

Fixtures captured from Twitch go through `harness/sanitize.ts` before commit (`sanitizeFile(name, text)`):

- query `token`, `sig`, `user_id`, `device_id`, `play_session_id` → `TOKEN`, `SIG`, `USER_ID`, `DEVICE_ID`, `PLAY_SESSION_ID`;
- `X-TV-TWITCH-AD-*` attributes that identify the ad or the viewer → the attribute name (`AD_SESSION_ID`, `CREATIVE_ID`, ...); break descriptors (`ROLL-TYPE`, `POD-*`, `QUARTILE`, ...) stay;
- other `X-TV-TWITCH-*ID` attributes → the attribute name; `Amazon|<id>` titles → `Amazon|AD_ID`;
- master session data (`SESSION-DATA` and `#EXT-X-TWITCH-INFO`): `SERVING-ID`, `VIDEO-SESSION-ID`, `BROADCAST-ID` → the key name, `USER-COUNTRY` → `XX`, `C` and `E` (base64 URLs) → `C`, `E`;
- `video-edge-*` hosts → `video-edge.example`; IPv4 → `203.0.113.1`; `OAuth <token>` → `OAuth OAUTH`; path components of 32 or more opaque characters → `opaque-<n>`;
- JSON by key: token `value`, `signature`, ids and the F-05 headers (`Client-Integrity`, `X-Device-Id`, `Authorization`, `Client-Version`, `Client-Session-Id`); the public `Client-ID` stays.

Every committed fixture satisfies `sanitizeFile(name, text) === text` (checked by `harness/fixtures.spec.ts`).

To capture: turn `debug` on and copy the playlist printed by the logger.

## Harness

### `fake-twitch.ts`

In-memory Twitch exposed as a `fetch(input, init)` function (string, `URL` or `Request` input):

- usher (`/api/channel/hls/` and `/api/v2/channel/hls/`) → master per channel and playerType (`master(channel, text, playerType = "site")`); the playerType comes from the token FakeTwitch issued (`TOKEN-<playerType>`), so a backup usher request gets the backup master;
- media playlist → queue of responses per URL, query ignored (`mediaPlaylist(url, ...responses)`); one per poll, the last one repeats;
- `gql.twitch.tv/gql` → `PlaybackAccessToken` per `playerType` in the body, single or batched; `token(playerType, body, status)` overrides the reply (errors, other shapes);
- `gql.twitch.tv/integrity` → integrity token; `edge.ads.twitch.tv` → empty 200;
- any other URL → 404;
- `calls` / `callsOf(kind)`: every call with kind, URL, method, lower-case headers, body, channel and playerType.

### `worker-scope.ts`

Builds a fake worker scope and boots the worker code on it, the way it runs inside Twitch:

- `createWorkerScope(twitch = new FakeTwitch())`: the scope is an `EventTarget` with `postMessage` (records worker → page messages) and `fetch` set to `FakeTwitch.fetch`;
- calls `bootstrapWorker(scope)` (T-001), which creates the controller, the router and the message bindings for that scope only;
- exposes `send(funcName, value)` (page → worker), `posted` (worker → page), `fetch(url)` and `text(url)` (the hooked `fetch`), `player`, `controller`, `router`, `twitch`.

### `page-env.ts`

- `usePageEnv({ url, chrome, fetchRoutes })`: registers happy-dom and installs the fakes below in `beforeAll`; restores them and unregisters happy-dom in `afterAll`;
- `FakeWorker`: records `postMessage`, `emit(data)` sends a message as the worker, counts `terminate`; installed as `Worker` before `index.ts` is imported;
- `FakeXMLHttpRequest`: synchronous XHR for the worker script (`scripts` map, `requests` log);
- fake page `fetch` (`pageFetch.calls`, responses by URL prefix);
- `URL.createObjectURL` recording blobs (`blobText(url)`);
- `chrome.storage.local` mock with `get`, `set` and `onChanged`; `chrome.runtime.getURL`.

`index.ts` keeps module state (the first worker is the main worker), so only `integration/page.int.spec.ts` imports it.

### `dom.ts`

`useDom()` registers happy-dom in `beforeAll` and unregisters it in `afterAll`, with JavaScript, CSS and iframe file loading disabled.

## Matrix

| Test | Task | Type | Cases |
| --- | --- | --- | --- |
| TS-001 | T-001 | unit | `Player.setChannel` creates and reuses a stream; `isWhitelist`; `Stream.removeServer`; `getStreamByStreamType`; decorators store metadata and `createRouter` returns routes in declaration order; two `bootstrapWorker` calls on two scopes do not share state |
| TS-002 | T-002 | unit + int | every fixture loads in `m3u8-parser` without warnings, is sanitized and is listed in the fixtures README; `FakeTwitch` serves usher, media, GQL (single and batch), integrity and ads; `sanitize` removes token, sig, ids and hosts and is idempotent; worker pipeline on `worker-scope` + `FakeTwitch` (routes, usher, no-ad poll, backup by playerType, merge by `PROGRAM-DATE-TIME`, picture-by-picture); `index.ts` on `page-env` (injection, settings, quality, pause/play, integrity); `content-script.js` on `page-env` |
| TS-003 | T-003 | unit | `test`, `test:coverage`, `check` and `hooks:install` scripts; `.githooks/pre-commit` runs `bun run check` with LF endings; the `bun` npm package is not older than the runtime; no workflow in `.github/workflows` runs tests (read with `Bun.YAML.parse`) |
| TS-101 | T-101 | unit + int | `media-live-ts`, `media-live-fmp4` and `media-ll-hls` without ads come out byte-identical through the worker; with ads, output keeps `EXT-X-VERSION`, `EXT-X-MAP`, `PROGRAM-DATE-TIME`, `TWITCH-PREFETCH`, `PRELOAD-HINT`, `PART`, `DATERANGE`, `DISCONTINUITY` and an unknown tag; `#EXTINF` has the comma |
| TS-102 | T-102 | unit | channel `nullbyte` goes through the usher hook; a media playlist URL containing "null" is handled; `fetch(new Request(url))` and `fetch(new URL(url))` are routed and reach the network as the same object; an unrouted call reaches `global.request` with every argument |
| TS-103 | T-103 | unit + int | usher v1 and v2 store the channel; channel with a query string; a media playlist before the usher comes back unchanged and does not throw; an error while handling a media playlist returns the original playlist |
| TS-104 | T-104 | unit + int | `master-avc` yields variants with quality, resolution, codecs and URL; `master-hevc` with codecs; `master-empty` creates no `Server`; the captured `master-frontpage-v1` and `master-site-v2` (quality from `NAME` and from `IVS-NAME`) on `*.playlist.ttvnw.net` are read; regex used only when the parser finds no variants; `bestQuality()` is the highest bandwidth; a network failure or an error status on one backup moves on to the next; media playlist recognized by its master URL without the `v1/playlist` pattern |
| TS-105 | T-105 | int | two concurrent polls make one GQL request per playerType; no duplicate `Server`; a rejected GQL request does not throw and reaches the logger |
| TS-106 | T-106 | unit + int | a non-target URL returns the same `Response` with `bodyUsed === false`; 204 and 304 pass through; binary body intact; integrity captured from a clone and the page gets the original response; URL inside a `Request` or a `URL` recognized; a failure in the hook logic and a network error reach the page as they would without it; an `/integrity` response from before the first worker reaches it |
| TS-107 | T-107 | unit (happy-dom) | nothing from Purple reaches a worker before the page's first message to it; two workers get `setSettings`; `terminate` removes from the registry; a worker created later gets the current settings, integrity and quality; pause, play and state from worker B are answered to B; quality reaches every worker; worker options reach the native `Worker`; an XHR that fails or answers 404 creates the worker with the original URL, unregistered |
| TS-108 | T-108 | unit | URIs with `?`, `+`, `(` and `[` keep the right title |
| TS-109 | T-109 | unit + int | with `debug` off, a full poll does not call `console.log`; with it on, it does; no `console.log` outside the logger in `serviceWorker/src` (file scan) |
| TS-110 | T-110 | unit (happy-dom) + int | with `debug` off the worker posts no events; with it on, each event type reaches `window.__purple.events` with channel and timestamp; buffer keeps the last 500 |
| TS-111 | T-111 | unit | the Chromium manifest declares `app/bundle.js` as a `MAIN` world content script at `document_start` and no longer exposes it to web pages; on Chromium the isolated content script no longer appends a `<script src>`; on Firefox it appends it before `storage` answers; on both, a `getSettings` sent before `storage` answers gets the settings once it does |
| TS-201 | T-201 | unit | each F-02 marker detected; non-ad markers give `NONE`; `stitched` outside the title gives `NONE`; `stitched`, `Amazon` and `DCM,` in the title give `SSAI`; URI patterns give `SSAI`; correct indexes on `media-ssai-midroll`; `media-marked-live` gives `MARKED_LIVE` |
| TS-202 | T-202 | int | `media-marked-live` comes out identical, zero GQL calls, no pause/play messages |
| TS-301 | T-301 | unit (happy-dom) | `fetch` to `edge.ads.twitch.tv` never reaches the real `fetch` and gets an empty 200; XHR ends with `readyState 4`, status 200 and `onload` without network; with `blockCsai` off it passes; counters for `preroll` and `midroll` |
| TS-302 | T-302 | unit | `rules.json` is valid, with a `block` action and `urlFilter` `\|\|edge.ads.twitch.tv^`; the manifest declares the permission and the file |
| TS-401 | T-401 | unit (happy-dom) + int | a page GQL request with headers sends update messages to the worker; `Device-ID` as alternate name; `/integrity` capture still works; the worker's token request carries the headers (checked in `FakeTwitch.calls`) |
| TS-402 | T-402 | int | request and response matched by `id`; two responses out of order; no response within 5 s (fake timers) falls back to the direct request |
| TS-403 | T-403 | unit | default body carries the new hash; `PersistedQueryNotFound` triggers a second call with the full query; `token-flat.json` accepted |
| TS-404 | T-404 | unit | original usher parameters kept (including `supported_codecs`); `token` with `&`, `#` and `+` encoded; v2 path kept |
| TS-405 | T-405 | int | `site` with ads and `popout` clean returns the `popout` playlist; order follows `backupPlayerTypes`; `frontpage` and `picture-by-picture` stay in the chain; all with ads plus `lowQualityFallback` requests `autoplay` with `platform: "android"`; without the flag it does not |
| TS-406 | T-406 | int | the pinned type is first on the next break; `autoplay` is never pinned; a contaminated type is skipped before 5 s and retried after (`setSystemTime`) |
| TS-407 | T-407 | unit | picks same quality and codec; then same resolution with another codec; then `bestQuality()` |
| TS-408 | T-408 | unit (happy-dom) + int | single and batched bodies switch to `popout`; a `picture-by-picture` body is unchanged; flag off changes nothing; usher URL without `parent_domains` in the worker |
| TS-501 | T-501 | unit | a 400 ms difference on a 2 s segment matches; 1.5 s does not; backup `EXT-X-MAP` inserted and the main one restored; `MEDIA-SEQUENCE` and segment count unchanged |
| TS-502 | T-502 | unit + int | `media-ssai-preroll` with no backup: no ad URI in the output, same segment count and durations, ad `PART`/`PREFETCH` removed, `segmentRemoved` counted; with `stripFallback` off the ad segments stay |
| TS-601 | T-601 | unit | transitions `idle` → `ad` → `recovering` → `idle`; pause/play on transitions; with `reloadAfterAd`, one reload per break and at most one every 30 s (fake timers); without the flag, no reload |
| TS-602 | T-602 | unit (happy-dom) + int | a `setSettings` message with `value.whitelist` makes `isWhitelist()` true; `storage.onChanged` sends `setSettings` to every worker; a channel added to the whitelist mid-session gets the original playlist on the next poll |
| TS-603 | T-603 | unit (happy-dom) | channel parsed from `www.twitch.tv/<channel>`, `m.twitch.tv/<channel>`, `www.twitch.tv/popout/<channel>/chat` and URLs with a query string |
| TS-701 | T-701 | int | `bun run build` produces both zips with the version in the name and the userscript with `@version` equal to `package.json`; `package.json` has no `ts-node`, `jest` or `preinstall` |
| TS-702 | T-702 | unit | no workflow triggers on `pull_request`; no step runs tests; releases only on push to `main` or a tag; `oven-sh/setup-bun` used; no `marvinpinto/action-automatic-releases` (read with `Bun.YAML.parse`) |

## Browser setup (levels 2 and 3)

Both levels run in Python with nodriver driving Microsoft Edge.

| Item | Value |
| --- | --- |
| Browser | `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (Edge 154 on 2026-10-03) |
| Profile | `~/nodriver/profile-edge-purple`, used only by these tests; never the general `~/nodriver/profile-edge` |
| Library | nodriver 0.50.3 on Python 3.14 (its `cdp/network.py` ships in cp1252 and must be re-saved as UTF-8 after install or upgrade) |
| Code | `e2e/` (T-004) |
| Desktop | on Windows, a separate hidden Win32 desktop (`CreateDesktopW`, not headless): no window on the user's screen, no physical input; pages get focus emulation. `--visible` runs on the user's desktop for debugging |

No other extension runs under nodriver. Every launch passes `--disable-component-extensions-with-background-pages` and `--disable-sync` (the profile picked up the Microsoft account's extensions through sync, see [findings/2026-10-07-e2e-harness.md](findings/2026-10-07-e2e-harness.md)), plus:

| Mode | Extra flags | Used by |
| --- | --- | --- |
| Extension | `--load-extension=<build> --disable-extensions-except=<build>` (`<build>` = `<repo>/dist/purple-adblock-purple-adblock-chromium`) | level 3 |
| Userscript | `--disable-extensions`; the built userscript (`<repo>/dist/purpleadblocker.user.js`) is injected with `Page.addScriptToEvaluateOnNewDocument` (main world, document start, like Tampermonkey with `@run-at document-start` and `@grant none`), only on URLs its `@match` covers | levels 2 and 3 |
| Record | `--disable-extensions` (Purple off) | level 3 recorder |

Edge facts these modes rely on are in [findings/2026-10-03-edge-nodriver.md](findings/2026-10-03-edge-nodriver.md): only Purple enabled in extension mode, warm-up launch for a fresh profile, stopping leftover `msedge.exe` processes on this profile (and only those), `RemoteObject` handling. The warm-up launch turns on developer mode, without which Edge disables the unpacked build after a profile's first launch, and leaves `purple-e2e-warm-up` in the profile ([findings/2026-10-07-e2e-harness.md](findings/2026-10-07-e2e-harness.md)).

### Running

```bash
bun run e2e:build                 # extension build, and the userscript in dist/ (the committed release userscript stays as is)
python e2e/run.py L3-01           # every mode the scenario lists
python e2e/run.py all --mode extension --repeat 3 --report report.json
```

Each run prints one line per check (`skip` for an ad check on a load without a break) and one `server` line per load, and exits with 0 when every check passed. A scenario with `FRESH_PROFILE` (L3-02) gets a new profile under `%TEMP%` for every run, unless `--profile` is given. In extension mode the harness sets the build's `debug` setting before the run (from its popup page): on for scenarios with `DEBUG` (L3-02, which reads `window.__purple.events`), off otherwise, so L3-01 runs with the defaults users get. Every level 3 run also records what Twitch's server did: the report's `server` field (masters, media playlists of the main stream and of the backups, what reached the player, token answers and flags, requests to `edge.ads.twitch.tv`); new or confirmed behaviors go to `docs/server/`. `--report` writes every check with its details (worker log included) as JSON. In Git Bash, set `MSYS_NO_PATHCONV=1` before passing a `/directory/...` path to a probe: Git Bash rewrites it into a Windows path.

### Reading state

- Page state is read as JSON through `tab.evaluate(..., return_by_value=True)` around `JSON.stringify(...)`.
- `Worker.toString().includes("[Purple]")`: page hook installed.
- `window.__e2e.media`: `<video>` events and the outcome of every `play()` call; `window.__e2e.playlists`: the last 60 media playlists the player got from Purple's hook (the only bodies the recorder reads, from a clone).
- `window.__e2e` (`e2e/recorder.js`, added before any page script): per worker, creation time, whether it came through Purple's injector, whether its script holds Purple's code, the end of its script (a player worker imports `amazon-ivs-wasmworker`) and Purple's boot message; `workerLog`: from inside each worker, the fetches it made on the network, what the player got from Purple's hook, Purple's console lines, errors and rejections (URLs without the query string).
- `document.querySelector("video")`: `readyState`, `currentTime` advancing between two reads, `paused`.
- `window.__purple.events` (T-110): what the worker did.
- Level 2: the `sim/` request log (`/_sim/log`) says exactly which URLs the player and Purple requested.
- Level 3: Twitch's ad overlay, player error overlay and content classification gate, with selectors kept in `e2e/twitch_selectors.py`.
- No screenshots unless the problem is visual.

## Level 2: player + server

An isolated local page runs the real player with Purple against `sim/`, our Rust server that reproduces Twitch's server behavior. twitch.tv is never opened.

### Components

| Component | Content |
| --- | --- |
| `sim/` (Rust) | Implements the behaviors in [server/behaviors.md](server/behaviors.md) as scenarios (`sim/scenarios/*.json`). Endpoints follow [server/endpoints.md](server/endpoints.md): usher v1 and v2, media playlists on a live clock, segments, GQL `PlaybackAccessToken` per `playerType`, `/integrity`, `edge.ads.twitch.tv`. Control and log API under `/_sim/` (load a scenario, read the request log). Serves the isolated page and the player SDK files. Covered by `cargo test`. |
| Media | Synthetic, generated with ffmpeg into `sim/media/` (gitignored): live and ad renditions in H.264/AAC MPEG-TS; an HEVC rendition in fMP4 with `EXT-X-MAP`. No Twitch media. |
| Player | Public Amazon IVS player SDK (`amazon-ivs-player`, installed with bun, never committed). Its `.wasm` contains Twitch's HLS parser (`twitch::hls`, `EXT-X-TWITCH-PREFETCH`, `stitched-ad-break-*`); see [findings/2026-10-03-ivs-player-sdk.md](findings/2026-10-03-ivs-player-sdk.md). |
| Page | `sim/page/`: Purple's bundle runs first (userscript mode), then the SDK loads `https://usher.ttvnw.net/api/channel/hls/<scenario channel>.m3u8`. |
| Routing | Requests to `*.ttvnw.net`, `gql.twitch.tv` and `edge.ads.twitch.tv` must reach `sim/` under their real hostnames, so Purple's URL matching runs unchanged. Preferred: Edge host mapping (open, see [findings/2026-10-03-host-resolver-mapping.md](findings/2026-10-03-host-resolver-mapping.md)). Fallback: CDP `Fetch` bridge that answers those requests from `sim/` with `Fetch.fulfillRequest` (mechanism checked on live Twitch). |

### Scenarios

"Ad URI requested" is read from the `sim/` request log: the scenario knows which segment URIs are ads.

| ID | Scenario | Behaviors | Asserts | Covers |
| --- | --- | --- | --- | --- |
| L2-01 | Clean live stream | B-001, B-003, B-004, B-006 | hook attached to the SDK worker; video playing; playlists reach the player unchanged | E1, T-101 |
| L2-02 | SSAI preroll | B-007 to B-010 | no ad URI requested; playback continues; events show a backup, a merge or blank segments | F-02 to F-14 |
| L2-03 | SSAI midroll inside a clean stream | B-007 to B-010 | as L2-02, plus pause/play or reload once at the break edges | T-601 |
| L2-04 | Every backup `playerType` returns ads | B-012 | blank segments replace the ads; no ad URI requested | F-14 |
| L2-05 | CSAI: markers with live segments | B-011 | playlist untouched; no backup lookup; no request reaches `edge.ads.twitch.tv` | T-202, F-04 |
| L2-06 | HEVC in fMP4 with `EXT-X-MAP` | Q-007 (until observed) | video playing; no player error (issue #105) | T-101, T-407 |
| L2-07 | GQL errors: `PersistedQueryNotFound`, `embed` server error | B-014, B-015 | fallback query used; next `playerType` tried | T-403 |
| L2-08 | L2-02 to L2-05 without Purple | - | ad URIs requested (control case) | - |

## Level 3: live site

Purple on twitch.tv, using known techniques to make Twitch show a behavior, with the recorder on. Each run states the techniques used ([server/techniques.md](server/techniques.md)) and the behaviors or questions it targets ([server/behaviors.md](server/behaviors.md), [server/open-questions.md](server/open-questions.md)). Results go to `docs/findings/` and `docs/server/`.

Recorder (T-005):

- intercepts usher, media playlists, segments, GQL `PlaybackAccessToken` and `edge.ads.twitch.tv` with CDP `Fetch` and keeps every request flowing;
- writes to `~/purple-recordings/<date>-<channel>/` (`manifest.json` + bodies), outside the repo; recordings carry tokens, ad ids and Twitch media and are never committed;
- sanitized excerpts (no tokens, ids or media) go to `docs/server/` and, as playlists, to level 1 fixtures through `harness/sanitize.ts`.

Ads are not deterministic. Every scenario asserts what always holds (hook installed, playback, no player error); ad-specific checks apply to the breaks recorded during the run.

| ID | Scenario | Mode | Asserts | Covers |
| --- | --- | --- | --- | --- |
| L3-01 | Open a live channel picked from the directory, by direct load and by client-side navigation; channels behind the content classification gate are skipped | extension, userscript | every player worker created through the injector and running Purple's code (boot message seen); video playing; no player error | E1, T-101, T-103, T-107, T-111 |
| L3-02 | Preroll (TR-001, TR-005: fresh profile per run, a random channel among the first directory cards, 40 s watched) | extension | every player worker runs Purple; no player error; video playing at the end; for a break recorded in the main stream: no ad overlay in any second and no ad segment in the playlists the player got | F-02 to F-14 |
| L3-03 | Soak: one channel for 20 minutes (TR-002) | extension | every recorded break ends with a backup, a merge or blank segments; no player error | midrolls, T-601 |
| L3-04 | HEVC/AV1 channel (TR-006) | extension | master has an HEVC or AV1 variant; video playing; no player error | T-101, T-407 |
| L3-05 | Popout player (TR-003) | extension | L3-01 checks on the popout URL | F-12 |
| L3-06 | Switch channel by clicking, without reload (TR-004) | extension | second channel playing; events tagged with the new channel | T-107 |
| L3-07 | Whitelist through `chrome.storage.local` from the extension popup page | extension | `whitelisted` events; no rewrites for that channel | E7, T-602 |
| L3-08 | CSAI | extension | requests to `edge.ads.twitch.tv` blocked | F-04 |
| L3-09 | Logged in (TR-007) | extension | L3-01 and L3-02 checks | F-05 |
| L3-10 | Behavior hunt: recorder with Purple off, techniques chosen for open questions | record | new finding written; behaviors and questions updated | `docs/server/` |

Before ticking a task that changes behavior on twitch.tv (phases 1 to 6), run its level 2 scenarios and the level 3 scenarios in its Covers column. Before a release, run all of them. Results go in the PR description.

Not planned: decompiling the `.wasm`. The file name changes with each player release; level 2 answers behavior questions (discontinuities, `EXT-X-MAP` changes, missing segments) by observation.
