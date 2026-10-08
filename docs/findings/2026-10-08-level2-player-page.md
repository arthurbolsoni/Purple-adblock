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

## With `sim/` and the page (T-006 to T-009)

- CORS preflights (`OPTIONS`) of the page's GQL calls are paused by `Fetch` and answered from `sim/` like the requests.
- On the dedicated level 3 profile, the SDK worker's request to `usher.ttvnw.net` from the `127.0.0.1` page never reached `Fetch` and failed ("Failed to fetch"), with Purple on or off and with or without `--host-resolver-rules`; a master on `https://master.sim.invalid/` was paused. On a fresh profile the same page got usher, playlists and segments through the bridge and played. The cause is Edge's tracking prevention at Strict (`enhanced_tracking_prevention.user_pref` 3 in that profile's `Preferences`; fresh profiles have none set): with the net log on ([`profile_block_probe.py`](probes/profile_block_probe.py)), the request to `usher.ttvnw.net` never reached the network stack on that profile (no net log entry), nor on a fresh profile with only that preference set to 3, while on a plain fresh profile it was a CORS request answered through the bridge and the video played. To the `127.0.0.1` page `usher.ttvnw.net` is a third-party tracker host; on twitch.tv it is Twitch's own. Level 2 runs on fresh profiles. The level 3 runs on the dedicated profile (L3-01, L3-07, L3-08) ran with Strict tracking prevention, the fresh-profile ones (L3-02, L3-11, L3-12, soaks) with Edge's default.
- Besides usher, playlists and segments, the SDK fetches `prod.ivs-device-config.live-video.net/player-web-v1.json` (a 404 from `sim/` leaves it on its defaults), `/probe` on the segment host (a 404 made the player report "Segment download http error"; `sim/` answers 16 kB) and posts to `global.poe.live-video.net` (204).
- L2-01 (`python e2e/run.py L2-01`): 2 of 2 runs passed, the page's token answered as `popout`, one usher session, media playlists and segments from `sim/`, the video playing after 25 s.

## L2-01 to L2-08

`python e2e/run.py L2-0x`, one run each on a fresh profile, Purple's bundle from the build with `pausePlayDelayMs` 0. Reports: `~/purple-recordings/2026-10-08-level2/` (outside the repo).

| Scenario | Result | What sim/ and the page recorded |
| --- | --- | --- |
| L2-01 clean live | passed | one usher session, the page's token answered as `popout`, no ad handling |
| L2-02 preroll | passed | tokens for every playerType asked at the first ad poll, by persisted hash; `frontpage` (live) used, blank segments for the first poll; no ad segment requested from `sim/` |
| L2-03 midroll | passed | the `site` backup (a new token, still live) used; a worker `pause` at the start and at the end of the break; no ad segment requested |
| L2-04 every type with ads | passed | blank segments, and `segmentsReplaced`: the backups' own prerolls start later, so their live segments covered some of the main playlist's ad positions and the merge by time (T-501) replaced them; no backup used, no ad segment requested |
| L2-05 CSAI | passed | the page's `edge.ads.twitch.tv` request answered in the page (`csaiBlocked`), none reached `sim/`; no backup token, no ad handling |
| L2-06 HEVC fMP4 | passed | `init.mp4` and `.m4s` segments played in Edge |
| L2-07 GQL errors | passed | each backup token asked by hash got `PersistedQueryNotFound` and was asked again with the full query; `embed` got the error; `autoplay` used |
| L2-08 control, no Purple | passed | 8 ad segments requested from `sim/` in L2-02, L2-03 and L2-04; the `edge.ads` request reached `sim/` in L2-05; the page's token stayed `site` |

What the first runs showed about `sim/`, fixed before the set above:

- After a break `sim/` kept listing the ad segments until they left the 14-segment window, so Purple never saw the end of a midroll within L2-03 and the player sat on blank segments in L2-04. It now lists the whole window as live once the newest segment is past the break (B-034: the broadcast goes on under the break).
- With a 60 s live loop the player paused at `currentTime` 57.4, Purple on or off: the first segment after the wrap restarts its timestamps behind an `EXT-X-DISCONTINUITY`. The live renditions are now 6 minutes; `sim/`'s stream clock starts at each scenario load.

At the L2-03 end edge the worker posted `pause` and `play` and the SDK's `<video>` fired no event. The SDK's worker dispatches each command by player id (`activePlayers[id]`) and drops one for an id it has no player for; the page created its player as 0 (`create` with `id: 0`) and Purple sent pause and play as 1. On twitch.tv the page creates player 0 in its first worker and player 1, the main one, in the second, which is why id 1 worked there. Since C-12 the page uses the id of the last `create` it sent that worker: on the L2-03 rerun the `<video>` paused 1 ms after the end edge's `pause` and played again 67 ms later from `currentTime` 0, as on twitch.tv; L2-03 now checks that the `<video>` reacts within 1 s of each worker `pause`. Probe: the recorder's page-to-worker log (`e2e/recorder.js`) now keeps `create` and the `id` of each message.

## For T-006 to T-009

- Player: the SDK plays a local MPEG-TS stream on a page that never contacts twitch.tv, and Purple attaches to its worker when the page loads Purple's bundle first (T-008).
- Routing: the CDP `Fetch` bridge, answering `*.ttvnw.net`, `gql.twitch.tv` and `edge.ads.twitch.tv` with what `sim/` serves, no TLS certificate involved. Host mapping with `--host-resolver-rules` got no request to a local server on 2026-10-03 (T-009).
