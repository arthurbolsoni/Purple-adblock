# Player traffic on twitch.tv, preroll markers, CDP interception

Date: 2026-10-03 · Edge 154, logged out, `--disable-extensions` · 30 s on one live channel picked from the directory · Used by: T-004, T-005, T-201, level 2 scenarios

## Method

`probes/traffic_probe.py` and `probes/fulfill_probe.py`: CDP `Fetch.enable` on the page target with patterns for usher, `*.m3u8*`, `*.wasm*` and `*hls.ttvnw.net*`; bodies read with `Fetch.getResponseBody`; requests released with `Fetch.continueRequest` or answered with `Fetch.fulfillRequest`.

## Results

### What the player fetches

| Request | Count in 30 s | Host |
| --- | --- | --- |
| usher master | 1 | `usher.ttvnw.net` |
| media playlists | 27 | `*.playlist.ttvnw.net` |
| segments (MPEG-TS) | 18 | `*.j.cloudfront.hls.ttvnw.net` |
| player binary | 2 | `assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.wasm` |

- CDP reports all of them with resource type `XHR`.
- The page `Network` domain did not report any of them (they come from the player worker); `Fetch` intercepted all of them.
- Master tags: `#EXT-X-SESSION-DATA` ×23, `#EXT-X-STREAM-INF` ×5.
- Media playlist tags: `EXT-X-VERSION`, `TARGETDURATION`, `MEDIA-SEQUENCE`, `EXT-X-TWITCH-ELAPSED-SECS`, `EXT-X-TWITCH-TOTAL-SECS`, `EXT-X-START`, `EXT-X-DATERANGE`, `EXT-X-DISCONTINUITY`, `EXT-X-PROGRAM-DATE-TIME`, `EXTINF`.

### Preroll seen in that session

- `#EXTINF` titles: `Amazon|<id>` ×232, `live` ×37 (counted across all polls).
- `DATERANGE` classes and ID prefixes: `twitch-stitched-ad` / `stitched-ad`, `twitch-trigger` / `trigger`, `twitch-ad-quartile` / `quartile`, `twitch-session` / `playlist-session`, `twitch-stream-source` / `source`, `timestamp` / `playlist-creation`.
- `X-TV-TWITCH-AD-*` attributes (22): `AD-FORMAT`, `AD-SESSION-ID`, `ADVERIFICATIONS`, `AF-ICR-AD-ID`, `AF-ICR-CREATIVE-ID`, `AF-ICR-MEDIA-DURATION`, `CLICK-BEACON-ID`, `CLICK-TRACKING-URL`, `CREATIVE-ID`, `DSA-SS-CONTEXT`, `DSA-SS-LOCATION`, `DSA-VERSION`, `LINE-ITEM-ID`, `LOUDNESS`, `POD-FILLED-DURATION`, `POD-LENGTH`, `POD-POSITION`, `QUARTILE`, `RADS-TOKEN`, `ROLL-TYPE`, `TRACKING-START`, `URL`.

### Interception side effects

- First attempt: `Fetch.getResponseBody` failed with "Fetch domain is not enabled" after navigating with nodriver's `tab.get()`; the usher request was never released and the player stayed at `readyState 0`. Navigating with `cdp.page.navigate` and always calling `continueRequest` in a `finally`-style path fixed it.
- Answering all 22 media playlist requests with `Fetch.fulfillRequest` (same body, own headers) kept playback going: `currentTime` 8.2 → 18.3 → 28.3 s.

## Notes

- Purple's current title marker `Amazon` matches the preroll titles seen here.
- `twitch-trigger` appeared together with `twitch-stitched-ad`; Brave's script lists it as an ad marker.
