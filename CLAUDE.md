# Purple Adblock

Browser extension (Chromium MV3, Firefox MV2) and userscript that block ads on Twitch live streams by rewriting HLS playlists inside the Twitch player's worker.

## Goal

Block ads on live streams. Improvements are added on top of the existing strategies (E-xx in `docs/feat.md`); none of them is removed.

## Language

English only: code, comments, docs, commit messages, PR text and chat replies.

## Tooling

Bun for everything: install, scripts, build and tests (`bun test` with `bun:test`). Do not use npm, Node or ts-node.

Jest is the fallback when `bun test` cannot cover a case (missing API or a runtime difference that matters for the test). The reason goes at the top of that test file and in the "Jest exceptions" table in `docs/tests.md`.

Browser tests against twitch.tv use nodriver (Python) with Microsoft Edge and the dedicated profile `~/nodriver/profile-edge-purple`, used only for these tests. No other extension runs under nodriver (`--disable-extensions` or `--disable-extensions-except=<our build>`, plus `--disable-component-extensions-with-background-pages`). Recorded Twitch sessions live in `~/purple-recordings/`, never in the repo. See "Browser tests" in `docs/tests.md`.

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

## Commands

```bash
bun install
bun test                                    # all tests
bun test serviceWorker/src/modules/player   # one directory
bun test --coverage
bun serviceWorker/build.ts                  # builds serviceWorker/dist/bundle.js
bun platform/tampermonkey/build.js          # userscript from serviceWorker/dist/bundle.js
bun cli/build.ts dev                        # unpacked extensions in dist/ (used by browser tests)
python e2e/run.py <scenario>                # browser tests (after T-004)
```

The `package.json` scripts still call `ts-node` and Jest; T-001 and T-701 move them to Bun. Until then, run the commands above directly.

## Code map

- `serviceWorker/src/index.ts`: runs in the page (main world, `document_start`). Replaces `window.Worker`, injects the worker code, bridges messages and hooks the page `fetch`.
- `serviceWorker/src/app.worker.ts`: runs inside the Twitch player worker. Hooks `fetch` and dispatches to the `@Fetch` routes of `AppController`.
- `serviceWorker/src/app.controller.ts`: routes (usher, media playlist, picture-by-picture) and messages (`@Message`).
- `serviceWorker/src/modules/player/`: ad decision, backup selection, playlist assembly (`m3u8.ts`).
- `serviceWorker/src/modules/stream/`: backup streams per playerType.
- `serviceWorker/src/modules/twitch/twitch.service.ts`: GQL `PlaybackAccessToken` and usher.
- `platform/src/`: content script and popup. Manifests in `platform/chromium` and `platform/firefox`.
- `platform/tampermonkey/`: userscript build.

## Rules

1. Every implemented part ships with a unit or integration test (`bun:test`, Jest only as the documented fallback) in the same commit. A bug fix starts with a failing test that reproduces the bug. Browser tests add to these; they never replace them.
2. No existing strategy (E-xx in `docs/feat.md`) is removed. A new strategy is an extra step in the chain or sits behind a `Setting` flag, with its default recorded in `docs/feat.md`.
3. HLS playlists: with no ads, return the original text untouched. With ads, edit line by line and keep every tag that is not part of the ad (`EXT-X-MAP`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-TWITCH-PREFETCH`, `EXT-X-PRELOAD-HINT`, `EXT-X-PART`, `EXT-X-DATERANGE`, `EXT-X-DISCONTINUITY`, `EXT-X-VERSION`). `m3u8-parser` is for reading only; output is never regenerated from scratch.
4. Page `fetch`/XHR hooks only touch target URLs. Never read the body of a response we do not own; when a body is needed, read `response.clone()`.
5. A failure in the blocking logic must not break the player: catch it and return Twitch's original response.
6. No bare `console.log`. Use the `logger`, which only prints with `debug` on.
7. Fixtures captured from Twitch are sanitized (token, sig, user id, device id) before commit. See `docs/tests.md`.
8. Code taken from Brave's scriptlet keeps a comment with the source URL and its license notice. See `docs/research.md`.
9. When a task is done, tick it in `docs/task.md` and update `docs/feat.md` if behavior changed.
10. Browser tests read page state as JSON (DOM, `window.__purple`, network events). No screenshots unless the problem is visual.

## Environment notes

- Vite replaces `global` with `self` (`serviceWorker/build.ts`). Under `bun test`, `global` is Bun's global object.
- `@Fetch` and `@Message` currently register routes and listeners on `global` when the class loads. `bun test` has no `isolateModules`/`resetModules` and runs every test file in one process, so T-001 changes the decorators to store metadata on the class and adds explicit `createRouter(controller)` / `bindMessages(scope, controller)`.
- `index.ts` imports `../dist/app.worker.js?raw` (a Vite feature). In tests, a Bun plugin in the test preload resolves `?raw`.
- Bun's `Response` accepts a body with status 204; browsers throw. Page-hook tests assert that the original response is returned unread instead of relying on constructor errors.
- The worker code is concatenated in front of Twitch's original worker script inside a blob: it cannot depend on the DOM or on runtime `import`.
- `global.request` keeps the original `fetch`. The extension's own requests go through `global.request` so they skip its own hook.
