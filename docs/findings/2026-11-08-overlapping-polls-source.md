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

## Fix (2026-11-08)

Tests: [`polls.spec.ts`](../../serviceWorker/test/unit/modules/player/polls.spec.ts), TS-831, written before the fix and failing on `main` (`1c2d610`):

- two overlapping polls, the first one's backup answered first and clean, the second's with ads; the next poll's clean backup, numbered below the page's playlist the second gave, did not restart the player (F-24 saw the backup as the source of the last playlist);
- a poll whose backup answers last gave its playlist after the later poll's: the numbers given went 111, then 107.

`Player.onFetch` takes turns: a poll starts after the one before it has given its playlist, or after `POLL_TURN_MS` (5 s, past the 2 segments a backup takes) if that one has not, so a backup that never answers does not hold the polls after it. `playlistFor` returns the source with the playlist (no `Player.source` field), and `followSequence` records that one. `player.qnt` has a poll start when none waits; `recordedIsDelivered` and `noWait` hold in all 1,161,842 states of `exhaustivePolls` (`docs/tests.md`). With the turns taken out the TS-831 tests fail again; the replays of the model, which has no overlapping polls now, do not.

## On twitch.tv (2026-11-08)

Two soaks of 90 minutes on Brave, logged out (the same as in [the T-832 finding](2026-11-08-repeat-after-blanked-playlist.md#on-twitchtv-2026-11-08)), with `e2e/worker-logger.js` posting the start of each playlist request of the player (`fetchStart`, with a `call` that pairs it with the request's end). [`poll_overlap_probe.py`](probes/poll_overlap_probe.py) reads them: 5,487 media playlist requests in 44 workers, the longest 1,729 ms (a preroll's poll with its backups), the median 31 to 37 ms; no two requests of one worker in flight together. The polls come about every 2 s (Q-002).

## Open

- Whether two media playlist requests are ever in flight in one worker: none in 5,487 requests (above); a preroll with every type's backup can take longer than the 2 s between polls. The player polls about every 2 s (Q-002), and a poll with ads can take longer: one backup type after another took 0.44 s each (B-056), and F-26 asks the other types together. Two cases to check: a quality switch, and the picture-by-picture players the page creates in the main player's worker (B-051, C-13), if they poll media playlists while the main player does.
- The worker log (`e2e/worker-logger.js`) would answer it with the start and the end of each media playlist request.
