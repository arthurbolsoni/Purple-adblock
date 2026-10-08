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
| [2026-10-08-midroll-soak.md](2026-10-08-midroll-soak.md) | Soaks a, b and c on the 2026-10-08 builds: stitched midrolls with Purple on and off, ad overlay and backups per break, pause/play at the break edges, the page's picture-by-picture request before each midroll | open |
| [../research.md](../research.md) | Brave's Twitch scriptlet | closed |
