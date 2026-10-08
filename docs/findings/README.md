# Findings

One file per topic, named `YYYY-MM-DD-<topic>.md`. Each file records what was checked, how, the result with numbers, what is still open, and which tasks use it. Scripts used to check something live in `probes/` next to these files.

New discoveries are added here as they happen. A later finding that contradicts an earlier one gets its own file and a note in the older one.

| File | Topic | Status |
| --- | --- | --- |
| [2026-10-03-purple-2.6.7-review.md](2026-10-03-purple-2.6.7-review.md) | Purple 2.6.7 code review and repo state | closed |
| [2026-10-03-bun-test.md](2026-10-03-bun-test.md) | What `bun test` supports for this repo; `bun run` and the `bun` npm package; happy-dom notes (2026-10-04) | closed |
| [2026-10-03-edge-nodriver.md](2026-10-03-edge-nodriver.md) | Edge 154 + nodriver: extension loading, isolation, cleanup | closed |
| [2026-10-03-twitch-live-traffic.md](2026-10-03-twitch-live-traffic.md) | Player traffic on twitch.tv, preroll markers, CDP interception | closed |
| [2026-10-03-host-resolver-mapping.md](2026-10-03-host-resolver-mapping.md) | Mapping `*.ttvnw.net` to a local server | open |
| [2026-10-03-ivs-player-sdk.md](2026-10-03-ivs-player-sdk.md) | Public Amazon IVS player SDK as the level 2 player | open |
| [2026-10-03-worker-unit-tests.md](2026-10-03-worker-unit-tests.md) | Worker behavior seen while writing the T-001 unit tests: whitelist, variant regex | open |
| [2026-10-04-worker-injection-race.md](2026-10-04-worker-injection-race.md) | On a direct channel load the player workers start before Purple's hook; live check of `bootstrapWorker` | open |
| [2026-10-07-page-hook-and-early-messages.md](2026-10-07-page-hook-and-early-messages.md) | Page fetch hook installed at load; a Purple message before the player's first one killed the player worker | open |
| [2026-10-07-l3-server-observations.md](2026-10-07-l3-server-observations.md) | Server behavior in the L3 runs: prerolls over time, token flags, media playlist tags, `twitch-trigger` without ads, prerolls and midrolls poll by poll, token requests per player type | open |
| [2026-10-07-backups-and-rewritten-playlists.md](2026-10-07-backups-and-rewritten-playlists.md) | Captured masters, backups with ads during a preroll, the player stall on playlists rewritten by `generateM3u8` | open |
| [2026-10-07-e2e-harness.md](2026-10-07-e2e-harness.md) | Level 3 harness: hidden desktop, page selectors, worker log; first L3-01 runs break on usher v2 | open |
| [2026-10-07-midroll-soak.md](2026-10-07-midroll-soak.md) | Soak sessions (`e2e/soak.py`) with and without Purple: `twitch-maf-ad` client-side slots, stitched midrolls poll by poll, new ad titles, the player paused after breaks Purple rewrote | open |
| [2026-10-08-ad-segment-coverage.md](2026-10-08-ad-segment-coverage.md) | Ad segments by title, `twitch-stitched-ad` range and stream source in the soak recordings; backups announcing their own break (T-203, T-204) | open |
| [2026-10-08-settings-without-reload.md](2026-10-08-settings-without-reload.md) | Whitelist changed in storage while a channel plays (L3-07, T-602); prerolls on fresh profiles that night | closed |
| [2026-10-08-backup-type-pinning.md](2026-10-08-backup-type-pinning.md) | Pinned and contaminated backup types (T-406): tests and live runs, no break in them | open |
| [2026-10-08-blank-segments.md](2026-10-08-blank-segments.md) | Brave's `BLANK_MP4` (an init segment without samples) and how Purple answers the ad segments no backup replaced (T-502); a preroll handled on the build | open |
| [2026-10-08-page-gql-headers.md](2026-10-08-page-gql-headers.md) | Page GQL headers on Purple's token requests (T-401); a midroll whose announced prefetch reached the network | open |
| [2026-10-08-l3-server-observations.md](2026-10-08-l3-server-observations.md) | Prerolls and midrolls in the level 3 runs of 2026-10-08, by profile | open |
| [2026-10-08-level2-player-page.md](2026-10-08-level2-player-page.md) | Level 2: the IVS SDK plays a local stream, Purple attaches to its worker, and a CDP Fetch bridge answers Twitch's hostnames | open |
| [2026-10-08-l3-recorder.md](2026-10-08-l3-recorder.md) | Level 3 recorder (`e2e/record.py`) and an L3-10 run: usher query values, poll interval, prefetch URIs on fMP4 streams, the player's `rufio` `POST`s | open |
| [2026-10-08-pause-length.md](2026-10-08-pause-length.md) | Pause/play wait at the break edges (`pausePlayDelayMs`, T-604): 0 ms against 1500 ms on live breaks | open |
| [2026-10-08-ad-break-reload.md](2026-10-08-ad-break-reload.md) | Player reload at the end of a break (`reloadAfterAd`, T-601): `setSrc` found on twitch.tv, the video back in 1 to 3 s, one reload of two brought a new preroll | open |
| [2026-10-08-midroll-soak.md](2026-10-08-midroll-soak.md) | Soaks a, b and c on the 2026-10-08 builds: stitched midrolls with Purple on and off, ad overlay and backups per break, pause/play at the break edges, the page's picture-by-picture request before each midroll | open |
| [2026-10-08-prewarm-backups.md](2026-10-08-prewarm-backups.md) | Backup tokens at the page's picture-by-picture request (`prewarmBackups`, T-409, T-410): midroll starts with and without it, a channel's first midroll (soak f), picture-by-picture requests per channel, an offline channel's recorded video | open |
| [2026-10-08-pbyp-player-pause.md](2026-10-08-pbyp-player-pause.md) | Pause and play sent to the picture-by-picture player the page creates in the main player's worker (C-13, T-801) | open |
| [2026-10-08-backup-quality-at-break-start.md](2026-10-08-backup-quality-at-break-start.md) | The first backup's quality at a break's start: a pinned 360p `picture-by-picture` type carried into the next midroll (T-802), 160p right after the page opened (T-803) | closed |
| [2026-10-08-backups-in-prerolls.md](2026-10-08-backups-in-prerolls.md) | Backup playlists with ad segments in prerolls and midrolls since T-401 (T-807, B-052) | open |
| [2026-10-08-backup-behind.md](2026-10-08-backup-behind.md) | Backups behind the main playlist at level 2 (L2-09) and the longest still video inside each soak break (T-804) | open |
| [2026-10-08-rewritten-playlist-stall.md](2026-10-08-rewritten-playlist-stall.md) | The 2026-10-07 stall on regenerated playlists: fMP4 channels lose `EXT-X-MAP`; fresh and dedicated profiles had opened different channels (T-806) | closed |
| [../research.md](../research.md) | Brave's Twitch scriptlet | closed |
