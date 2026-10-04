# Public Amazon IVS player SDK as the level 2 player

Date: 2026-10-03 · Status: open · Used by: level 2 isolated page

## Goal

Run a real Twitch-family player on an isolated local page, without opening twitch.tv.

## Method

`bun add amazon-ivs-player@1.57.0` in a temp directory; file listing; string search in the worker script and the `.wasm`.

## Results

- Package: `amazon-ivs-player` 1.57.0, "Amazon IVS Player Web SDK", license "SEE LICENSE IN https://player.live-video.net/LICENSE.txt".
- Files: `dist/index.js` (386 kB, webpack bundle), `dist/assets/amazon-ivs-wasmworker.min.js` (209 kB), `dist/assets/amazon-ivs-wasmworker.min.wasm` (1.49 MB), `dist/assets/amazon-ivs-worker.min.js` (3.6 MB).
- Same layout as Twitch's player: a `wasmworker` script plus `.wasm`, run in a Worker.
- `amazon-ivs-wasmworker.min.js` contains `fetch(` 3 times and `XMLHttpRequest` 3 times.
- Strings in the `.wasm`: C++ namespace `twitch::hls` (`twitch::hls::Segment::DateRange`), tags `EXT-X-TWITCH-PREFETCH`, `EXT-X-TWITCH-INFO`, `EXT-X-PREFETCH`, `EXT-X-DATERANGE`, and `stitched-ad`, `stitched-ad-break-start`, `stitched-ad-break-cont`, `stitched-ad-break-end`.

## Open

- Whether the SDK plays a local HLS stream served by our server (generated with ffmpeg).
- Whether Purple's `Worker` hook attaches to the SDK's worker the same way it does on twitch.tv.
- License terms for using the SDK in local tests (the package is installed from npm, its files are not committed).
