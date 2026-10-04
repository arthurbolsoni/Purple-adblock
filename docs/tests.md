# Tests

## Rules

1. Every task in `docs/task.md` closes with its TS-xxx tests passing under `bun test`.
2. Bug fix: first the failing test that reproduces the bug, then the fix.
3. Logic that crosses page and worker, or spans more than one module, gets an integration test on top of unit tests.
4. Tests never hit the network. Every Twitch response comes from the `FakeTwitch` harness and the fixtures.
5. Browser tests on twitch.tv (end of this file) add to unit and integration tests; they do not replace them.

## Tooling

- Runner: `bun test`, APIs from `bun:test` (`describe`, `test`, `expect`, `mock`, `spyOn`, `beforeAll`, `afterEach`, `setSystemTime`, `jest.useFakeTimers`, `jest.advanceTimersByTime`). Checked on Bun 1.4.1: legacy decorators (`experimentalDecorators` in `tsconfig.json`), fake timers, the `?raw` plugin, and global `fetch`, `Response`, `addEventListener` and `Bun.YAML`.
- Worker code runs on Bun's globals (`fetch`, `Response`, `Blob`, `URL.createObjectURL`, `EventTarget`).
- Page and platform code (`index.ts`, `content-script.js`, `popup.js`) runs on happy-dom through `@happy-dom/global-registrator`, registered per file with `useDom()` from `harness/dom.ts` (register in `beforeAll`, unregister in `afterAll`).
- `bun test` runs every file in one process. A test that changes a global restores it in `afterEach`; the harness helpers do this themselves.
- There is no `isolateModules`/`resetModules`. Tests build fresh instances through `createRouter(controller)`, `bindMessages(scope, controller)` and `bootstrapWorker(scope)` (T-001) instead of re-importing modules.
- `Date.now`-based logic (cooldowns) uses `setSystemTime`; `setTimeout`-based logic uses `jest.useFakeTimers()`.
- Bun's `Response` accepts a body with status 204, while browsers throw. Page-hook tests assert that the original response object is returned with `bodyUsed === false`.

### Jest fallback

`bun test` is the default. A test file may use Jest when `bun test` cannot cover the case (missing API, or a runtime difference that changes the result). In that case:

- the file is named `*.jest.spec.ts` and starts with a comment giving the reason;
- `jest` and `@swc/jest` are added to `devDependencies` with a `test:jest` script, and `bun test` ignores `*.jest.spec.ts`;
- CI runs both `bun test` and `bun run test:jest`;
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

Resolves Vite's `?raw` imports (used by `index.ts`) to a fixed string:

```ts
import { plugin } from "bun";

plugin({
  name: "raw-suffix",
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, (args) => ({ path: args.path, namespace: "raw" }));
    build.onLoad({ filter: /.*/, namespace: "raw" }, () => ({
      contents: "export default '/* worker bundle stub */';",
      loader: "js",
    }));
  },
});
```

## Layout

```
serviceWorker/
  src/**/x.spec.ts                 # unit tests next to the code
  test/
    preload.ts
    integration/*.int.spec.ts      # integration tests
    fixtures/m3u8/*.m3u8
    fixtures/gql/*.json
    harness/
      fake-twitch.ts
      worker-scope.ts
      page-env.ts
      dom.ts
      sanitize.ts
platform/src/**/x.spec.ts          # platform scripts (happy-dom)
e2e/                               # browser tests (Python + nodriver + Edge)
  run.py                           # entry: python e2e/run.py <scenario|all> [--mode extension|userscript]
  lib.py                           # Edge launch, dedicated profile, extension/userscript modes, JSON reads
  selectors.py
  scenarios/
  requirements.txt
```

Scripts under `platform/src` load as classic scripts in the browser. To test them, pure functions are exported with `if (typeof module !== "undefined") module.exports = { ... }`, which does not change browser behavior.

## Fixtures

### `fixtures/m3u8`

| File | Content |
| --- | --- |
| `master-avc.m3u8` | master with `EXT-X-MEDIA` (`NAME`) and chunked, 720p60, 480p30, 360p30, 160p30 variants, `avc1` codecs |
| `master-hevc.m3u8` | master with HEVC and AV1 variants besides AVC |
| `master-empty.m3u8` | master with no variants |
| `media-live-ts.m3u8` | live TS media playlist with `PROGRAM-DATE-TIME` and `EXT-X-TWITCH-PREFETCH` |
| `media-live-fmp4.m3u8` | live fMP4 media playlist with `EXT-X-MAP` |
| `media-ll-hls.m3u8` | media playlist with `EXT-X-PART` and `EXT-X-PRELOAD-HINT` |
| `media-ssai-preroll.m3u8` | every segment is an ad: `DATERANGE` `stitched-ad` with `X-TV-TWITCH-AD-*`, `stitched` titles, `/adsquared/` URIs |
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

### Sanitizing

Fixtures captured from Twitch go through `harness/sanitize.ts` before commit: `token`, `sig`, `X-TV-TWITCH-AD-*` ids, `user_id`, `device_id` and `video-edge-*` hosts become fixed values (`TOKEN`, `SIG`, `video-edge.example`). `sanitize.ts` has its own test (TS-002).

To capture: turn `debug` on and copy the playlist printed by the logger.

## Harness

### `fake-twitch.ts`

In-memory Twitch exposed as a `fetch(url, init)` function:

- usher (`/api/channel/hls/` and `/api/v2/channel/hls/`) → master per channel;
- media playlist → queue of responses per variant and per playerType (one per poll);
- `gql.twitch.tv/gql` → response per `playerType` in the body;
- `edge.ads.twitch.tv` → records the call;
- `calls`: every call with URL, headers and body, for assertions.

### `worker-scope.ts`

Builds a fake worker scope and boots the worker code on it, the way it runs inside Twitch:

- the scope is an `EventTarget` with `postMessage` (records worker → page messages) and `fetch` set to `FakeTwitch.fetch`;
- calls `bootstrapWorker(scope)` (T-001), which creates the controller, the router and the message bindings for that scope only;
- exposes `send(funcName, value)` (page → worker), `posted` (worker → page) and `fetch(url)` (the hooked `fetch`).

### `page-env.ts`

- `FakeWorker`: records `postMessage`, can emit messages as the worker, counts `terminate`;
- fake synchronous XHR for the worker script;
- fake page `fetch`;
- `chrome.storage.local` mock with `get`, `set` and `onChanged`.

### `dom.ts`

`useDom()` registers happy-dom in `beforeAll` and unregisters it in `afterAll`.

## Matrix

| Test | Task | Type | Cases |
| --- | --- | --- | --- |
| TS-001 | T-001 | unit | `Player.setChannel` creates and reuses a stream; `isWhitelist`; `Stream.removeServer`; `getStreamByStreamType`; decorators store metadata and `createRouter` returns routes in declaration order; two `bootstrapWorker` calls on two scopes do not share state |
| TS-002 | T-002 | unit | every fixture loads in `m3u8-parser` without errors; `FakeTwitch` serves usher, media and GQL; `worker-scope` registers the routes; `sanitize` removes token, sig, ids and hosts |
| TS-003 | T-003 | unit | the test workflow runs on `push` and `pull_request`, uses `oven-sh/setup-bun` and runs `bun test` (read with `Bun.YAML.parse`) |
| TS-101 | T-101 | unit + int | `media-live-ts`, `media-live-fmp4` and `media-ll-hls` without ads come out byte-identical through the worker; with ads, output keeps `EXT-X-VERSION`, `EXT-X-MAP`, `PROGRAM-DATE-TIME`, `TWITCH-PREFETCH`, `PRELOAD-HINT`, `PART`, `DATERANGE`, `DISCONTINUITY` and an unknown tag; `#EXTINF` has the comma |
| TS-102 | T-102 | unit | channel `nullbyte` goes through the usher hook; `fetch(new Request(url))` and `fetch(new URL(url))` are routed; an unrouted URL calls `global.request` with the same arguments |
| TS-103 | T-103 | unit + int | usher v1 and v2 store the channel; channel with a query string; a media playlist before the usher comes back unchanged and does not throw |
| TS-104 | T-104 | unit + int | `master-avc` yields variants with quality, resolution, codecs and URL; `master-hevc` with codecs; `master-empty` creates no `Server`; regex used only when the parser finds no variants; a network failure on one backup moves on to the next; media playlist recognized by its master URL without the `v1/playlist` pattern |
| TS-105 | T-105 | int | two concurrent polls make one GQL request per playerType; no duplicate `Server`; a rejected GQL request does not throw and reaches the logger |
| TS-106 | T-106 | unit (happy-dom) | a non-target URL returns the same `Response` with `bodyUsed === false`; 204 passes through; binary body intact; integrity captured and the page can still read the body; URL inside a `Request` recognized |
| TS-107 | T-107 | unit (happy-dom) | two workers get `setSettings`; `terminate` removes from the registry; a worker created later gets the current settings; a message from worker B is answered to B; XHR failure creates the worker with the original URL |
| TS-108 | T-108 | unit | URIs with `?`, `+`, `(` and `[` keep the right title |
| TS-109 | T-109 | unit + int | with `debug` off, a full poll does not call `console.log`; with it on, it does; no `console.log` outside the logger in `serviceWorker/src` (file scan) |
| TS-110 | T-110 | unit (happy-dom) + int | with `debug` off the worker posts no events; with it on, each event type reaches `window.__purple.events` with channel and timestamp; buffer keeps the last 500 |
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
| TS-602 | T-602 | unit (happy-dom) + int | `storage.onChanged` sends `setSettings` to every worker; a channel added to the whitelist mid-session gets the original playlist on the next poll |
| TS-603 | T-603 | unit (happy-dom) | channel parsed from `www.twitch.tv/<channel>`, `m.twitch.tv/<channel>`, `www.twitch.tv/popout/<channel>/chat` and URLs with a query string |
| TS-701 | T-701 | int | `bun run build` produces both zips with the version in the name and the userscript with `@version` equal to `package.json`; `package.json` has no `ts-node`, `jest` or `preinstall` |
| TS-702 | T-702 | unit | `pull_request` has no release step; releases only on push to `main` or a tag; `oven-sh/setup-bun` used; no `marvinpinto/action-automatic-releases` (read with `Bun.YAML.parse`) |

## Browser tests (nodriver + Edge)

Tests against the real twitch.tv run in Python with nodriver driving Microsoft Edge.

### Setup

| Item | Value |
| --- | --- |
| Browser | `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` (Edge 154 on 2026-10-03) |
| Profile | `~/nodriver/profile-edge-purple`, used only by these tests; never the general `~/nodriver/profile-edge` |
| Library | nodriver 0.50.3 on Python 3.14 (its `cdp/network.py` ships in cp1252 and must be re-saved as UTF-8 after install or upgrade) |
| Code | `e2e/` (T-004) |

Two modes:

- **Extension:** `bun serviceWorker/build.ts && bun cli/build.ts dev`, then Edge starts with `--load-extension=<repo>/dist/purple-adblock-purple-adblock-chromium`. Checked on 2026-10-03: Edge 154 accepts the switch and lists the extension as `UNPACKED`/`ENABLED` (read through `chrome.developerPrivate.getExtensionsInfo` on `edge://extensions`).
- **Userscript:** Edge starts with `--disable-extensions` and the built userscript is injected with `Page.addScriptToEvaluateOnNewDocument`, which runs it in the main world at document start, as Tampermonkey does with `@run-at document-start` and `@grant none`.

A new profile is launched once before any assertion. On 2026-10-03 the first launch of a fresh profile did not patch the worker; every later launch did.

### Reading state

- Page state is read as JSON through `tab.evaluate(..., return_by_value=True)`, wrapping the value in `JSON.stringify` (nodriver returns `RemoteObject` for `null` and for some objects).
- `Worker.toString().includes("Purple")` tells whether the worker hook is installed.
- `document.querySelector("video")`: `readyState`, `currentTime` advancing between two reads, `paused`.
- `window.__purple.events` (T-110): what the worker did during the session.
- Twitch's ad overlay and player error overlay: selectors kept in `e2e/selectors.py`, checked against the live page when T-004 is written.
- No screenshots unless the problem is visual.

Ads are not deterministic. Every scenario asserts the invariants that always hold (hook installed, playback, no player error); ad-specific assertions apply to the ad breaks recorded in `window.__purple.events` during the run.

### Scenarios

| ID | Scenario | Mode | Asserts | Covers |
| --- | --- | --- | --- | --- |
| E2E-01 | Open a live channel picked from the directory | extension, userscript | hook installed; video playing; no player error | E1, T-101, T-107 |
| E2E-02 | Preroll: open a channel in a new tab, logged out | extension | for each recorded ad break: no ad overlay, playback resumes, events show a backup, a merge or blank segments | F-02 to F-14 |
| E2E-03 | Soak: watch one channel for 20 minutes | extension | every recorded ad break ends with a backup, a merge or blank segments; no player error; no ad overlay | midrolls, T-601 |
| E2E-04 | HEVC/AV1 channel (`PURPLE_E2E_HEVC_CHANNEL`) | extension | master has an HEVC or AV1 variant; video playing; no player error | T-101, T-407 |
| E2E-05 | Popout player | extension | E2E-01 checks on the popout URL | F-12 |
| E2E-06 | Switch channel by clicking, without reload | extension | second channel playing; events tagged with the new channel | T-107 |
| E2E-07 | Whitelist: channel added through `chrome.storage.local` from the extension popup page | extension | `whitelisted` events; no playlist rewrites for that channel | E7, T-602 |
| E2E-08 | CSAI | extension | requests to `edge.ads.twitch.tv` recorded as blocked | F-04 |
| E2E-09 | Logged in (after a one-time manual login in the dedicated profile) | extension | E2E-01 and E2E-02 checks | F-05 |

Before ticking a task that changes behavior on twitch.tv (phases 1 to 6), run the scenarios listed for it in the Covers column. Before a release, run all of them. Results go in the PR description.
