<div align="center">

<img src="https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/platform/src/images/logov2-128.png">

# Purple Adblock

An adblocker for Twitch live streams

![GitHub Repo stars](https://img.shields.io/github/stars/arthurbolsoni/Purple-adblock?label=Stars)
[![Discord](https://img.shields.io/discord/829993555820019773?label=Discord)](https://discord.gg/A6CHvgtGmq)
![License](https://img.shields.io/badge/license-GPLv3-blue.svg?label=License)
[![Mozilla Add-on](https://img.shields.io/amo/dw/%7Ba7399979-5203-4489-9861-b168187b52e1%7D?label=Firefox%20Users)](https://addons.mozilla.org/firefox/addon/purpleadblock/)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/lkgcfobnmghhbhgekffaadadhmeoindg?label=Chrome%20Users)](https://chrome.google.com/webstore/detail/purple-adblock/lkgcfobnmghhbhgekffaadadhmeoindg)

</div>

## About

Purple Adblock blocks the ads Twitch puts in live streams. It runs inside the Twitch player's worker and edits the HLS playlists the player receives: a playlist without ads goes to the player untouched, and one with ads is replaced or edited before the player loads any ad segment.

It ships as a Firefox add-on (Manifest V2), a Chromium extension (Manifest V3: Chrome, Edge, Brave, Opera) and a userscript.

## Install

| Platform | Where |
| --- | --- |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/purpleadblock/) |
| Chrome and other Chromium browsers | [Chrome Web Store](https://chrome.google.com/webstore/detail/purple-adblock/lkgcfobnmghhbhgekffaadadhmeoindg) |
| Userscript | [purpleadblocker.user.js](https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/platform/tampermonkey/dist/purpleadblocker.user.js), in a userscript manager that runs scripts at `document-start` (Tampermonkey, Violentmonkey) |

The extension's popup turns Purple off and on for the channel in the current tab (a per-channel allow list). The userscript has no popup and uses the default settings.

### Manual installation

The [releases page](https://github.com/arthurbolsoni/Purple-adblock/releases) has `purple-adblock-<version>-firefox.zip` and `purple-adblock-<version>-chromium.zip`.

Firefox:

1. Unzip the Firefox release.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click `Load Temporary Add-on...` and select `manifest.json` in the unzipped folder.

Firefox removes a temporary add-on when it closes; the [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/purpleadblock/) version stays installed.

Chrome, Edge and other Chromium browsers:

1. Unzip the Chromium release.
2. Open `chrome://extensions/` (`edge://extensions/` in Edge).
3. Turn on `Developer mode`.
4. Click `Load unpacked` and select the unzipped folder.

To build from source, see [CONTRIBUTING.md](CONTRIBUTING.md).

## How it works

1. A script in the page replaces `window.Worker` before Twitch creates its player workers, so Purple's code runs in each worker ahead of Twitch's own script.
2. In the worker, Purple intercepts the requests for the stream's master and media playlists and reads each media playlist for ad markers and ad segments.
3. With ad segments, Purple asks Twitch for the same stream under other player types (`site`, `popout`, `frontpage`, `mobile_web`, `embed`, `picture-by-picture`, `autoplay`) and gives the player the first one without ads, in the quality the player is on.
4. When no backup is free of ads, each ad segment is swapped for a backup's live segment of the same moment, and the ad segments left are answered with an empty segment inside the worker: their media is never downloaded.
5. In the page, requests to Twitch's client-side ad server (`edge.ads.twitch.tv`) get an empty answer.

Details: [docs/architecture.md](docs/architecture.md). Every strategy and setting, with its default: [docs/feat.md](docs/feat.md).

## Blocking use cases

The IDs point to [docs/feat.md](docs/feat.md); B-xxx are Twitch server behaviors in [docs/server/behaviors.md](docs/server/behaviors.md).

| Case | What Twitch sends | What Purple does | IDs |
| --- | --- | --- | --- |
| Midroll | Ad segments stitched into the live playlist (`MIDROLL`) | Replaces the playlist with a backup without ads, in the player's quality and codec, the types that give 720p first. The backup's segments get the numbers the page's playlist gives the same moment, so the player goes on without waiting. The type that worked is tried first at the next break | E3, E4, F-09, F-10, F-11, F-23 |
| Preroll | The channel opens with ad segments (`PREROLL`); backup tokens asked during it get a preroll of their own, except `autoplay` (B-052) | Asks the first backup type, then all the others at once, and plays the first one without ads (usually `autoplay`, 360p) until the preroll ends. The page's playlist then numbers from 0: the player is restarted once, about 1 s | E3, E4, F-09, F-24, F-26 |
| Break already running when the channel opens | Ad segments from the first playlist, as in a preroll | As in a preroll | F-22, F-26 |
| Midroll in the first seconds after the channel opens | A break before any backup was asked | Backup tokens are requested when the channel loads, and again at each `picture-by-picture` request of the page, 3 to 14 s before most midrolls (B-044) | F-19, F-22 |
| Break announced before its ad segments | A `twitch-stitched-ad` marker after the last live segment, with prefetch lines to the first ad segments (B-034) | Removes those prefetch lines and answers their URIs with an empty segment | F-03, F-14 |
| Backup with a break of its own | A backup playlist with ad segments, or announcing its own break | Skips that type for 5 s, asks a new token for it and takes the next type | F-10 |
| Backup behind the player | A backup token asked a moment ago lists nothing newer than what the player has | Takes a later type that is ahead; uses the one behind only when none is | F-25 |
| Ad segments without an ad title | Segments titled with a number or `FT\|…` inside an ad range (B-035) | Detects them by the `twitch-stitched-ad` range and the stream source, not only by the title | F-02, F-03 |
| No backup without ads | Every backup type has ads at that moment | Swaps each ad segment for a backup's live segment of the same `PROGRAM-DATE-TIME`; the ad segments left are answered with an empty segment in the worker, so no ad media is downloaded or shown | E5, F-13, F-14 |
| Client-side ad (CSAI) | A `twitch-maf-ad` marker over live segments; the ad itself comes from `edge.ads.twitch.tv` | Leaves the playlist untouched and answers the page's `fetch` and XHR requests to `edge.ads.twitch.tv` with an empty response; on Chromium a network rule blocks the rest | F-03, F-04 |
| Ad overlay | The ad's `DATERANGE` lines start the page's ad UI (countdown, "Ad 1 of 2") | Removes those lines from every playlist Purple edits | F-20 |
| The page's own access token | The page asks its token as `site`, with `parent_domains` in the usher request | Asks it as `popout` and drops `parent_domains` | F-12 |
| Picture-by-picture stream | Every 8 to 14 minutes, and 3 to 14 s before most midrolls, the page asks a `picture-by-picture` master and plays it in a second `<video>` (B-037, B-044) | Keeps it as one more backup and answers the page with an empty response | E10 |
| HEVC and fMP4 streams | Segments with `EXT-X-MAP` | Backups in the same codec family; a swapped segment brings its own `EXT-X-MAP` | F-11, F-13 |
| Channel on the allow list | Any of the above | Leaves the playlists untouched: the ads play | E7 |

### Not covered

- VODs and clips.
- Banner and display ads on the page: a general blocker such as [uBlock Origin](https://github.com/gorhill/uBlock) covers them.
- Ad-watched reporting to Twitch.

## Recommendations

1. Do not run another Twitch ad blocker or script with the same purpose next to Purple: both replace the player's worker.
2. Use a general blocker, such as [uBlock Origin](https://github.com/gorhill/uBlock), for the rest of the page.
3. Other approaches to Twitch ads: [ryanbr/TwitchAdSolutions](https://github.com/ryanbr/TwitchAdSolutions).

## Documentation

| File | Content |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | flow and messages between page, worker and content script |
| [docs/feat.md](docs/feat.md) | strategies, fixes, features, settings and defaults |
| [docs/tests.md](docs/tests.md) | test levels, fixtures, harness and test matrix |
| [docs/task.md](docs/task.md) | backlog, acceptance criteria and tests per task |
| [docs/server/](docs/server/README.md) | Twitch's server behaviors, endpoints, playlists and tokens |
| [docs/findings/](docs/findings/README.md) | dated findings and the probes behind them |
| [docs/research.md](docs/research.md) | Brave's Twitch scriptlet, used as reference |

## Contributing and support

[CONTRIBUTING.md](CONTRIBUTING.md) has the setup, the commands, the tests and the rules for changes. Bugs and feature requests go to the [issues](https://github.com/arthurbolsoni/Purple-adblock/issues/new/choose); help on the [Discord server](https://discord.gg/A6CHvgtGmq).

## License

GNU General Public License v3.0 ([LICENSE](LICENSE)).

Parts of the code are adapted from [ryanbr/TwitchAdSolutions](https://github.com/ryanbr/TwitchAdSolutions) (MIT), as shipped by Brave in [brave/adblock-resources](https://github.com/brave/adblock-resources) (MPL-2.0); the files that carry it keep the source URL and the license notices ([docs/research.md](docs/research.md#licenses)).
