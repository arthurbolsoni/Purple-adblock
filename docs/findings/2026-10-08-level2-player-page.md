# Level 2: the IVS player SDK on a local page, Purple in its worker, Twitch hostnames through CDP Fetch

Date: 2026-10-08. Edge 154, `amazon-ivs-player` 1.57.0 (installed with bun into a temp folder, not committed). Probes: [`ivs_local_probe.py`](probes/ivs_local_probe.py) with [`ivs_local_server.ts`](probes/ivs_local_server.ts). Used by T-006 to T-009; follows [the SDK finding](2026-10-03-ivs-player-sdk.md) and [the host mapping attempt](2026-10-03-host-resolver-mapping.md).

## Setup

- The SDK's `dist/index.js` is a CommonJS bundle; `bun build entry.ts --target browser --format iife` with `window.IVSPlayer = require("amazon-ivs-player")` gives a script for a plain page. `IVSPlayer.create({ wasmWorker, wasmBinary })` takes the URLs of `amazon-ivs-wasmworker.min.js` and `.wasm` from the package's `dist/assets`.
- Stream: ffmpeg `testsrc2` 1280x720 30 fps and a 440 Hz sine, H.264 main and AAC, 2 s MPEG-TS segments (10 segments, about 800 kB each).
- Page and files on a Bun server at `127.0.0.1`; Edge through `e2e/lib.py` on a fresh profile, in record mode (no extension, no injected userscript).

## Runs

| Run | Purple | Stream URL | Video after 15 s | SDK worker |
| --- | --- | --- | --- | --- |
| 1 | userscript mode of `e2e/lib.py` | `http://127.0.0.1/hls/live.m3u8` | playing, 12.4 s | the SDK's own URL, no Purple code: `e2e/lib.py` injects the userscript only on pages its `@match` (`*.twitch.tv`) covers |
| 2 | Purple's bundle loaded by the page before the SDK | same | playing, 12.5 s | a `blob:` URL from Purple's injector, Purple's code and boot message in it |
| 3 | same as 2 | `https://usher.ttvnw.net/api/channel/hls/probe.m3u8` | playing, 12.4 and 13.5 s (two runs) | as 2 |

In run 3, CDP `Fetch` on the page target paused, at the request stage, the requests to `usher.ttvnw.net` and `*.hls.ttvnw.net` and answered them with `Fetch.fulfillRequest` (and CORS headers): a master with one variant on `video-weaver.probe.hls.ttvnw.net`, the media playlist with absolute segment URLs on `probe.j.cloudfront.hls.ttvnw.net`, and the segment files. The 12 requests (usher, playlist, 10 segments) came from the SDK's worker and none reached the network. The usher and media playlist requests show in the worker log twice: at the `player` level (through Purple's `fetch` hook) and at the `network` level (Purple's own request), so Purple's usher and playlist routes ran on Twitch's hostnames.

`Fetch` URL patterns match the whole URL: the page URL, whose query held the usher URL, matched `*usher.ttvnw.net*` and was answered 404 until the bridge passed requests to other hosts on with `Fetch.continueRequest`.

## For T-006 to T-009

- Player: the SDK plays a local MPEG-TS stream on a page that never contacts twitch.tv, and Purple attaches to its worker when the page loads Purple's bundle first (T-008).
- Routing: the CDP `Fetch` bridge, answering `*.ttvnw.net`, `gql.twitch.tv` and `edge.ads.twitch.tv` with what `sim/` serves, no TLS certificate involved. Host mapping with `--host-resolver-rules` got no request to a local server on 2026-10-03 (T-009).
