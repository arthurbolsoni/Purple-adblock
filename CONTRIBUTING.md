# Contributing to Purple Adblock

## Contents

- [Setup](#setup)
- [Commands](#commands)
- [Loading a local build](#loading-a-local-build)
- [Tests](#tests)
- [Rules for changes](#rules-for-changes)
- [Commits and pull requests](#commits-and-pull-requests)
- [Releases](#releases)
- [Reporting a bug or requesting a feature](#reporting-a-bug-or-requesting-a-feature)

## Setup

Requirements:

| For | Tool |
| --- | --- |
| install, build, unit and integration tests | [Bun](https://bun.sh) (no npm, Node or ts-node) |
| `sim/`, the level 2 server | Rust (`cargo`), with `ffmpeg` and `ffprobe` on `PATH` |
| levels 2 and 3 | Python 3.14, Microsoft Edge, `pip install -r e2e/requirements.txt` (nodriver); setup notes in [docs/tests.md](docs/tests.md#browser-setup-levels-2-and-3) |

Fork the repository, then:

```bash
git clone https://github.com/<your-user>/Purple-adblock
cd Purple-adblock
bun install
bun run hooks:install   # once per clone: the pre-commit hook runs `bun run check`
```

## Commands

| Command | What it does |
| --- | --- |
| `bun run check` | every local check: `bun test` and `cargo test` for `sim/` (the pre-commit hook runs it) |
| `bun test` | unit and integration tests; `bun test <dir>` for one directory, `--coverage` for coverage |
| `bun run build` | the worker, `dist/purple-adblock-<version>-<platform>.zip` for Chromium and Firefox, and the userscript |
| `bun run dev` | the worker with sourcemaps and unpacked extensions in `dist/purple-adblock-<platform>/` |
| `bun run e2e:build` | the unpacked extensions and `dist/purpleadblocker.user.js`, used by levels 2 and 3 |
| `python e2e/run.py <L2-xx\|L3-xx>` | one level 2 or 3 scenario; `--mode extension\|userscript\|sim`, `--repeat N`, `--report FILE` |
| `python e2e/soak.py <session> --mode extension --debug --minutes N` | a long watch of live channels on twitch.tv, recorded under `~/purple-recordings/` |

## Loading a local build

After `bun run dev`, load `dist/purple-adblock-chromium/` with `Load unpacked` in `chrome://extensions/`, or `dist/purple-adblock-firefox/manifest.json` with `Load Temporary Add-on...` in `about:debugging#/runtime/this-firefox`.

With the `debug` setting on, the worker logs to the console and keeps its events in `window.__purple.events` on the page.

## Tests

| Level | What | Where |
| --- | --- | --- |
| 1. Unit and integration | Purple's logic against fixtures and the in-process `FakeTwitch` | `bun test`; `cargo test` for `sim/` |
| 2. Player and server | the real player (Amazon IVS SDK) with Purple on an isolated local page, against `sim/`, which reproduces Twitch's server | Edge through nodriver; never opens twitch.tv |
| 3. Live site | Purple on twitch.tv, with the recorder on | Edge through nodriver |

Level 3 finds behaviors, level 2 reproduces them, level 1 covers the logic. Fixtures, harness, scenarios and the task to test matrix: [docs/tests.md](docs/tests.md).

Levels 2 and 3 use the Edge profile `~/nodriver/profile-edge-purple`, kept for these tests, with no other extension. Recordings of Twitch sessions stay in `~/purple-recordings/`, outside the repository.

## Rules for changes

1. English everywhere: code, comments, docs, commit messages and pull requests.
2. Every change ships with a unit or integration test in the same commit (`bun:test`; `cargo test` in `sim/`). A bug fix starts with a failing test that reproduces the bug. Levels 2 and 3 add to these tests and never replace them. Jest is only a fallback when `bun test` cannot cover a case, with the reason at the top of the test file and in [docs/tests.md](docs/tests.md).
3. No existing strategy (E-xx in [docs/feat.md](docs/feat.md)) is removed. A new strategy is an extra step in the chain or sits behind a setting, with its default recorded in [docs/feat.md](docs/feat.md). A new setting goes in `setting.interface.ts`, in `SETTINGS_KEYS` of `platform/src/content-script.js` and in the settings table of [docs/feat.md](docs/feat.md).
4. HLS playlists: a playlist without ads is returned untouched. With ads, edits go line by line and keep every tag that is not part of the ad (`EXT-X-MAP`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-TWITCH-PREFETCH`, `EXT-X-PRELOAD-HINT`, `EXT-X-PART`, `EXT-X-DATERANGE`, `EXT-X-DISCONTINUITY`, `EXT-X-VERSION`). `m3u8-parser` is for reading only; output is never regenerated from scratch.
5. Page `fetch` and XHR hooks only touch target URLs and never read the body of a response they do not own; when a body is needed, they read `response.clone()`.
6. A failure in the blocking logic must not break the player: catch it and return Twitch's original response.
7. No bare `console.log`: use the `logger`, which prints only with `debug` on.
8. Fixtures captured from Twitch are sanitized (token, sig, user id, device id) before commit ([docs/tests.md](docs/tests.md#sanitizing)).
9. Code taken from Brave's scriptlet (TwitchAdSolutions' vaft script) keeps a comment with the source URLs and the MIT notice, and is listed in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) ([docs/research.md](docs/research.md#licenses)).
10. A finished task is ticked in [docs/task.md](docs/task.md), and [docs/feat.md](docs/feat.md) is updated when behavior changes.
11. A discovery goes to a dated file in [docs/findings/](docs/findings/README.md), with the probe that produced it in `docs/findings/probes/`. Twitch server behavior also goes to [docs/server/](docs/server/README.md) (behavior, evidence level, source) before `sim/` reproduces it.
12. Browser tests read page state as JSON (DOM, `window.__purple`, the `sim/` request log); screenshots only when the problem is visual.
13. Tests run locally (`bun run check` and the pre-commit hook). No GitHub Actions workflow runs tests, and commits never skip the hook with `--no-verify`.
14. Code reads like the code around it: its naming, indentation, comment density and idioms. There is no formatter; line endings follow `.gitattributes`.

## Commits and pull requests

Contributions are licensed under the Apache License 2.0, as section 5 of the license sets.


Commit subjects start with the kind of change, as in the history: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, with the task or feature ID when there is one (`feat: ... (F-26, T-823)`). The body says why.

Pull requests follow the [template](.github/PULL_REQUEST_TEMPLATE.md).

## Releases

Releases are made on this machine, with the store keys in a `.env` file (copied from `.env.sample`, ignored by git, loaded by Bun) and the GitHub CLI. `bun run build` rewrites `platform/tampermonkey/dist/purpleadblocker.user.js`, from which installed userscripts update: it goes into the release commit.

```bash
bun run build                                       # dist/purple-adblock-<version>-<platform>.zip and the userscript
bun cli/publish.ts firefox --channel listed --wait  # addons.mozilla.org review; once approved, dist/purple-adblock-<version>-firefox-signed.xpi
bun cli/publish.ts chrome                           # Chrome Web Store, submitted for review, published once approved
gh release create <version> --title <version> LICENSE dist/purple-adblock-<version>-*.zip \
  dist/purple-adblock-<version>-firefox-signed.xpi platform/tampermonkey/dist/purpleadblocker.user.js
```

A pre-release signs the Firefox build as unlisted, with no review, under `<version>.<n>` for a tag `<version>-<label>.<n>` (`2.7.0-beta.1` gives `2.7.0.1`):

```bash
bun cli/publish.ts firefox --channel unlisted --tag 2.7.0-beta.1  # dist/purple-adblock-2.7.0.1-firefox-signed.xpi
gh release create 2.7.0-beta.1 --prerelease --title 2.7.0-beta.1 LICENSE dist/purple-adblock-2.7.0-*.zip \
  dist/purple-adblock-2.7.0.1-firefox-signed.xpi platform/tampermonkey/dist/purpleadblocker.user.js
```

`--dry-run` shows what `cli/publish.ts` would send, with nothing sent.

| Variable | Where it comes from |
| --- | --- |
| `AMO_JWT_ISSUER`, `AMO_JWT_SECRET` | [addons.mozilla.org API keys](https://addons.mozilla.org/developers/addon/api/key/), on the account that owns the add-on |
| `CWS_PUBLISHER_ID` | Chrome Web Store Developer Dashboard, Publisher, Settings |
| `CWS_SERVICE_ACCOUNT_JSON` | JSON key of a Google Cloud service account, on one line, in a project with the Chrome Web Store API enabled, added under Account in the Developer Dashboard ([guide](https://developer.chrome.com/docs/webstore/service-accounts)) |
| or `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN` | an OAuth client and its refresh token, from the account that owns the item ([guide](https://developer.chrome.com/docs/webstore/using-api)) |

The stores refuse a version they already have: a release starts with a new `version` in `package.json`. A new permission in the Chromium manifest needs its justification in the Developer Dashboard (Privacy practices) before the API can submit the version.

The store texts (summary and description, en-US and pt-BR) are in [docs/store-listing.md](docs/store-listing.md), with where each one goes.

addons.mozilla.org gets the repository's source with each submission (`git archive` of `HEAD`), since `app/bundle.js` is minified; its reviewers rebuild it with `bun install --frozen-lockfile` and `bun run build` (Bun 1.4.1).

## Reporting a bug or requesting a feature

Open an issue with one of the [templates](https://github.com/arthurbolsoni/Purple-adblock/issues/new/choose). For an ad that got through or a player that stopped, include the browser and its version, the extension or userscript version, the channel, the time, what was seen (ad video, ad overlay, still video, error number) and any other extension running on twitch.tv.
