# Pause and play sent to the picture-by-picture player (C-13)

Date: 2026-10-08. Data: the soak e and f recordings (`~/purple-recordings/2026-10-08-soak-e`, `-soak-f`, outside the repo), logged out, extension with `debug`. Probe: [`player_ids_probe.py`](probes/player_ids_probe.py), which reads the page's messages to each player worker (`create`, `pause`, `play`, recorded by `e2e/recorder.js` since C-12) and the picture-by-picture masters the worker stored. Task: T-801.

## Players in the main player's worker

On twitch.tv the page creates player 0 in the first player worker and player 1, the main one, in the second (C-12). At each picture-by-picture request the page creates one more player in the second worker, with the next id: 2, 3, and up to 7 on one channel load in soak e (B-051). Soak e had 24 of those creates and soak f 16.

## Where E6 went

Since C-12 (`735d769`), `index.ts` sent E6 pause and play to the last player the page created in the worker. At the channel loads, before any picture-by-picture player existed, they went to player 1. At every midroll after a picture-by-picture request, they went to the picture-by-picture player (ids 2, 3, 5, 6 and 7), and the main player got none.

0.2 to 0.4 s after each of those pause/play pairs, the picture-by-picture player asked for a new picture-by-picture master: 4 times in soak e and 9 in soak f. That second request is the one the [prewarm finding](2026-10-08-prewarm-backups.md#picture-by-picture-requests) saw after every midroll. Soak d, run before C-12 with player 1 fixed, had none.

The first backup, the blank segments and the token requests compared in the prewarm finding are decided in the worker and do not depend on E6.

## Fix

C-13: `index.ts` keeps the first player the page creates in a worker. A later `create` in the same worker does not change it, and a `delete` of that player (the message the IVS SDK sends when a player is destroyed) lets the next `create` take over. Tests in `serviceWorker/test/integration/page.int.spec.ts`: a picture-by-picture player created after player 1 does not take pause and play, also after its own `delete`; after the first player's `delete`, the next player created does. The recorder also logs `delete` now.

## Live check

Soak g (2026-10-08 from 19:42, the C-13 build, 2 sessions): on `/channel-h` the page created the picture-by-picture player (id 2) at 20:12:42, the midroll started at 20:12:52, Purple's pause and play at its edges went to player 1, no picture-by-picture request followed, and the page deleted player 2 at 20:13:23. On `/channel-l` the page created players 2, 3 and 4 at three picture-by-picture requests with no midroll after them, and deleted each 41 s later.

## Open

- Whether E6 is needed at midroll edges: in soak f, without it on the main player, midrolls stood still 0 s, against about 1 s with it (T-809).
