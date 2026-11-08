# Overlapping polls record the wrong source (T-831)

Date: 2026-11-08. Level 1 only, on `main` at `632e988`. Probe: [`overlapping_polls_probe.ts`](probes/overlapping_polls_probe.ts). Found while reviewing `player.ts` for model checking of the poll logic; a model of the polls as interleaved steps showed the same thing.

## The code

`Player.onFetch` sets `this.source` to the page's (`MAIN_SOURCE`), awaits `playlistFor`, which awaits the backup playlists, and then `followSequence` records `this.source` as the source of the playlist it gave (`this.delivered`). `useBackup` sets `this.source` to the backup's variant URL. `this.source` is one field for every poll of the worker, set before an await and read after it.

## Two polls that overlap

Poll A has ads and waits for its backup. Poll B, also with ads, starts during that wait and sets `this.source` back to the page's. A's backup answers clean: A gives the backup and sets `this.source` to it. B's backup answers with ads: B gives the page's playlist, blanked, and its `followSequence` records the backup as its source.

| Order | A gives | B gives | Recorded for B |
| --- | --- | --- | --- |
| one after the other | the backup | the page's, blanked | `page` |
| overlapping | the backup | the page's, blanked | `…/frontpage-chunked.m3u8` |

The model found a second order: B starts between A's `useBackup` and A's `followSequence`, and A is recorded as `page` while it gave the backup. That needs B's call to come in the microtasks between the end of `playlistFor` and the rest of `onFetch`.

## What it changes

`delivered.source` decides F-24 and F-25 at the next poll:

- F-24 (`followSequence`) restarts the player when the source changes and the newest number goes back.
- F-25 (`listsNothingNew`) passes over a backup from another source that lists nothing past the newest number.

After B, the next poll from that backup counts as the same source, so neither runs: the player can be left waiting for numbers that do not come (T-818) or switched to a backup behind it (T-820).

## The Quint model (T-010)

`bun run model:check` breaks two invariants of `test/model/player.qnt` with two polls in flight:

- `recordedIsDelivered`: the case above.
- `noWait`: a poll that started earlier and waited longer for its backup gives its playlist after the playlists of later polls. The player, already past that playlist's newest number, waits for numbers past it, and F-24 does not run because both playlists are the page's.

With one poll at a time both held in 30,000 runs. `bun run model:verify` (TLC over every state) found the shortest sequences: 10 steps for `recordedIsDelivered`, 11 for `noWait`, with each backup answering within 2 segments. The real `Player` replays the traces that break them (`player-model.int.spec.ts`).

## Open

- Whether two media playlist requests are ever in flight in one worker. The player polls about every 2 s (Q-002), and a poll with ads can take longer: one backup type after another took 0.44 s each (B-056), and F-26 asks the other types together. Two cases to check: a quality switch, and the picture-by-picture players the page creates in the main player's worker (B-051, C-13), if they poll media playlists while the main player does.
- The worker log (`e2e/worker-logger.js`) would answer it with the start and the end of each media playlist request.
