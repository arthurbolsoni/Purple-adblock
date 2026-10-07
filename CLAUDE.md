# Purple Adblock

Browser extension (Chromium MV3, Firefox MV2) and userscript that block ads on Twitch live streams by rewriting HLS playlists inside the Twitch player's worker.

## Goal

Block ads on live streams. Improvements are added on top of the existing strategies (E-xx in `docs/feat.md`); none of them is removed.

## Language

English only: code, comments, docs, commit messages, PR text and chat replies.

## Tooling

Bun for everything: install, scripts, build and tests (`bun test` with `bun:test`). Do not use npm, Node or ts-node.

Jest is the fallback when `bun test` cannot cover a case (missing API or a runtime difference that matters for the test). The reason goes at the top of that test file and in the "Jest exceptions" table in `docs/tests.md`.

Exceptions to Bun:

- `sim/`, the level 2 server that reproduces Twitch's server behavior, is Rust (`cargo build`, `cargo test`).
- Levels 2 and 3 drive Microsoft Edge with nodriver (Python) and the dedicated profile `~/nodriver/profile-edge-purple`, used only for these tests. No other extension runs under nodriver (`--disable-extensions` or `--disable-extensions-except=<our build>`, plus `--disable-component-extensions-with-background-pages`).

Recorded Twitch sessions live in `~/purple-recordings/`, never in the repo.

## Test levels

| Level | What | Where |
| --- | --- | --- |
| 1. Unit | Purple's logic against fixtures and the in-process `FakeTwitch` | `bun test`, `cargo test` for `sim/` |
| 2. Player + server | real player (Amazon IVS SDK) + Purple on an isolated local page, against `sim/` | Edge via nodriver; never opens twitch.tv |
| 3. Live site | Purple on twitch.tv, using known techniques to trigger behaviors, recorder on | Edge via nodriver |

Level 3 discovers, level 2 reproduces deterministically, level 1 covers the logic. Details in `docs/tests.md`.

## Reference implementation

The Twitch scriptlets Brave ships and the Brave filter lists that load them:

- `brave/adblock-resources`: `resources/vaft-ublock-origin.js`
- `brave/adblock-lists`: `brave-lists/experimental.txt`, `brave-lists/brave-twitch.txt`

Brave syncs that script from `ryanbr/TwitchAdSolutions`. `pixeltris/TwitchAdSolutions` is archived and is not used as a reference. Details in `docs/research.md`.

## Docs

| File | Content |
| --- | --- |
| `docs/architecture.md` | current and target flow, messages between page, worker and content script |
| `docs/feat.md` | existing strategies, fixes, new features, settings and defaults |
| `docs/task.md` | backlog by phase, acceptance criteria and tests for each task |
| `docs/tests.md` | test tooling, fixtures, integration harness, task → test matrix |
| `docs/research.md` | Brave's Twitch scriptlet: technique, markers, headers, licenses |
| `docs/findings/` | dated discoveries (one file per topic) and the probes that produced them |
| `docs/server/` | reverse engineering of Twitch's server: behaviors (B-xxx), endpoints, playlists, ads, tokens, techniques (TR-xxx), open questions (Q-xxx); what `sim/` implements |

## Commands

```bash
bun install
bun run hooks:install                       # once per clone: pre-commit hook runs `bun run check`
bun run check                               # every local check (bun test; cargo test after T-006)
bun test                                    # all tests
bun test serviceWorker/src/modules/player   # one directory
bun test --coverage
bun serviceWorker/build.ts                  # builds serviceWorker/dist/bundle.js
bun platform/tampermonkey/build.js          # userscript from serviceWorker/dist/bundle.js
bun cli/build.ts dev                        # unpacked extensions in dist/ (used by levels 2 and 3)
cargo test --manifest-path sim/Cargo.toml   # sim/ unit tests (after T-006)
bun run e2e:build                           # extension build + dist/purpleadblocker.user.js for levels 2 and 3
python e2e/run.py <L2-xx|L3-xx|all>         # levels 2 and 3; --mode extension|userscript, --repeat N, --report FILE
```

The `dev` and `build` scripts in `package.json` still call `ts-node`; T-701 moves them to Bun. Until then, run the build commands above directly.

## Code map

- `serviceWorker/src/index.ts`: runs in the page (main world, `document_start`; a `MAIN` world content script on Chromium). Replaces `window.Worker`, injects the worker code, bridges messages and hooks the page `fetch`.
- `serviceWorker/src/page/worker-registry.ts`: every injected worker; settings, integrity and quality go to all of them, pause/play back to the worker that asked.
- `serviceWorker/src/app.worker.ts`: entry of the worker bundle, runs inside the Twitch player worker and calls `bootstrapWorker(self)`.
- `serviceWorker/src/bootstrap.ts`: `bootstrapWorker(scope)` keeps the original `fetch` as `scope.request`, creates `AppController`, binds `@Message` handlers and hooks `fetch` with the `@Fetch` routes.
- `serviceWorker/src/scope.ts`: `WorkerContext` (`request`, `postMessage`, `logger`), passed to the controller and modules.
- `serviceWorker/src/app.controller.ts`: routes (usher, media playlist, picture-by-picture) and messages (`@Message`).
- `serviceWorker/src/modules/player/`: ad decision, backup selection, playlist assembly (`m3u8.ts`).
- `serviceWorker/src/modules/stream/`: backup streams per playerType.
- `serviceWorker/src/modules/twitch/twitch.service.ts`: GQL `PlaybackAccessToken` and usher.
- `platform/src/`: content script and popup. Manifests in `platform/chromium` and `platform/firefox`. The builders copy it without `*.spec.ts` (`cli/files.js`).
- `platform/tampermonkey/`: userscript build.
- `sim/` (planned, T-006 to T-009): Rust server reproducing Twitch's server, scenarios, synthetic media, isolated player page.
- `e2e/`: nodriver drivers for levels 2 and 3. `lib.py` starts Edge on a hidden desktop in extension, userscript or record mode; `recorder.js` records workers and a log from inside them (`window.__e2e`); `scenarios/` holds one module per scenario. The level 3 recorder is planned (T-005).

## Rules

1. Every implemented part ships with a unit or integration test (`bun:test`, Jest only as the documented fallback; `cargo test` in `sim/`) in the same commit. A bug fix starts with a failing test that reproduces the bug. Levels 2 and 3 add to these; they never replace them.
2. No existing strategy (E-xx in `docs/feat.md`) is removed. A new strategy is an extra step in the chain or sits behind a `Setting` flag, with its default recorded in `docs/feat.md`.
3. HLS playlists: with no ads, return the original text untouched. With ads, edit line by line and keep every tag that is not part of the ad (`EXT-X-MAP`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-TWITCH-PREFETCH`, `EXT-X-PRELOAD-HINT`, `EXT-X-PART`, `EXT-X-DATERANGE`, `EXT-X-DISCONTINUITY`, `EXT-X-VERSION`). `m3u8-parser` is for reading only; output is never regenerated from scratch.
4. Page `fetch`/XHR hooks only touch target URLs. Never read the body of a response we do not own; when a body is needed, read `response.clone()`.
5. A failure in the blocking logic must not break the player: catch it and return Twitch's original response.
6. No bare `console.log`. Use the `logger`, which only prints with `debug` on.
7. Fixtures captured from Twitch are sanitized (token, sig, user id, device id) before commit. See `docs/tests.md`.
8. Code taken from Brave's scriptlet keeps a comment with the source URL and its license notice. See `docs/research.md`.
9. When a task is done, tick it in `docs/task.md` and update `docs/feat.md` if behavior changed.
10. Browser tests read page state as JSON (DOM, `window.__purple`, the `sim/` request log). No screenshots unless the problem is visual.
11. Every discovery goes to a dated file in `docs/findings/`, with the probe that produced it in `docs/findings/probes/`. Server behavior also goes to `docs/server/` (behavior, evidence level, source) before `sim/` reproduces it.
12. Level 2 never opens twitch.tv.
13. Tests run locally (`bun run check`, pre-commit hook). Never add a GitHub Actions workflow that runs tests, and never skip the hook with `--no-verify`.

## Environment notes

- Vite replaces `global` with `self` (`serviceWorker/build.ts`). Under `bun test`, `global` is Bun's global object.
- `@Fetch` and `@Message` store routes on the class; `createRouter(controller)` and `bindMessages(scope, controller)` register them for one instance. Worker modules get the scope through their constructors and never read globals, so tests boot several workers in one process (`bun test` has no `isolateModules`/`resetModules`).
- `index.ts` imports `../dist/app.worker.js?raw` (a Vite feature). In tests, a Bun plugin in the test preload resolves `?raw`.
- Bun's `Response` accepts a body with status 204; browsers throw. Page-hook tests assert that the original response is returned unread instead of relying on constructor errors.
- The worker code is concatenated in front of Twitch's original worker script inside a blob: it cannot depend on the DOM or on runtime `import`.
- In the worker, `scope.request` (`self.request` in the browser) keeps the original `fetch`. The extension's own requests go through it so they skip its own hook. In the page, `index.ts` keeps its own `global.request`.
