# Backups behind the main playlist and stalls inside breaks (T-804)

Date: 2026-10-08. Level 2: `sim/` scenario `l2-09-backup-behind` (L2-03's midroll; every token but the page's `popout` plays `lag` segments behind the stream clock, the new per-type `lag` of `sim/`), Purple on, fresh profiles, reports in `~/purple-recordings/2026-10-08-t804` (outside the repo). Level 3: the soak d to g recordings, read with [`break_stall_probe.py`](probes/break_stall_probe.py) (the longest time the main `<video>` stood still inside each break, from the page monitor's `progressing` transitions).

## Level 2

| Backup behind the main playlist | Runs | Longest still | `waiting` at the break start |
| --- | --- | --- | --- |
| 0 segments (`l2-03-midroll`) | 3 | 0 s | 375 to 555 ms (2 runs; none in the third) |
| 3 segments | 3 | 0 s | 476 to 904 ms |
| 5 segments | 3 | 0 s | 498 to 778 ms |

Every run played the break on `site`, played after it, and requested no ad segment from `sim/`. One 3-segment run first failed on a bridge error: the page cancelled a segment request while `sim/` answered it (`Invalid InterceptionId`); `e2e/sim.py` now records such requests as cancelled instead of as errors.

Correction, 2026-10-09 (T-815): `e2e/sim.py` started `sim/target/release/sim.exe` without building it, and that binary was from before `lag` existed: in these runs no backup was behind. `e2e/sim.py` now builds `sim/` before every run, and L2-09 checks that the first backup playlist ends behind the last main one. With the rebuilt `sim/`, the 3-segment scenario stood the video still 3 s with E6 off (3 of 3) and 0 s with E6 on (3 of 3) ([E6 at midrolls](2026-10-08-e6-at-midrolls.md#level-2)).

## Soaks

Breaks with the video still for 7 s or more, in soaks d to g:

| Soak | Channel | Break | Seconds after the page opened | Longest still |
| --- | --- | --- | --- | --- |
| d | `/channel-b` | 09:45:01 | 2295 | 7 s from 09:45:12 (backup before it: `popout` 720p60) |
| e | `/channel-a` | 15:15:45 | 12 | 7 s from 15:15:47 |
| e | `/channel-a` | 15:15:58 | 5 | 7 s from 15:16:01 |
| f | `/channel-f` | 17:47:52 | 6 | 8 s from 17:47:53 |
| f | `/channel-k` | 18:30:38 | 5 | 7 s from 18:30:40 |

The other 21 breaks had 0 to 3 s. The soak d break at 09:45 is the only one later in a load; the four others started in the first 12 s after the page opened (T-810).

The stall in soak d came after the first backup playlist had a `MEDIA-SEQUENCE` one below the main playlist's last poll (B-048). At level 2, backups 3 and 5 segments behind did not stall the player, and the three other soak d breaks with that drop stood still 1 s at most. The lower `MEDIA-SEQUENCE` does not explain the 7 s stall; it was seen once in 21 breaks later in a load. Corrected 2026-10-09: the level 2 runs above had no backup behind (T-815); the 7 s came at a switch between two backups, to a playlist whose newest segment the player already had, where E6 does not run ([E6 at midrolls](2026-10-08-e6-at-midrolls.md#the-4-s-still-with-e6-off-234758)).

Midrolls later in a load stood still 0 s in soak f, where E6's pause and play went to the picture-by-picture player (C-13), and about 1 s in soaks d and g, where they reached the main player (T-809).
