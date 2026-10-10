# The page's playlist after a preroll Purple played on a backup (T-818)

Date: 2026-10-09. Soak k (`e2e/soak.py`, extension mode with `debug`, the defaults of d7ca73f: E6 at the break edges off, `alignBackupSequence` on), session ext-b, `/channel-i`, load 2; recordings in `~/purple-recordings/2026-10-09-soak-k` (outside the repo). Probes: [`switch_timeline_probe.py`](probes/switch_timeline_probe.py), [`switch_gap_probe.py`](probes/switch_gap_probe.py), [`soak_health_probe.py`](probes/soak_health_probe.py).

## The player stood still for 17 minutes

| Time | What happened |
| --- | --- |
| 17:32:05 | the page opened the channel; its playlist was a preroll at `MEDIA-SEQUENCE` 0 (B-029) |
| 17:32:07.9 | the player's first playlist was the `autoplay` backup at `MEDIA-SEQUENCE` 34636; the other backup types had a preroll of their own (B-052) |
| 17:32:36.5 | `popout`, 34651 |
| 17:32:47.9 | the preroll over, Purple gave the player the page's playlist as Twitch sent it: `MEDIA-SEQUENCE` 9, 15 segments and 2 prefetch URIs (B-039: the page's playlist keeps the preroll's numbering) |
| 17:32:52.0 | `waiting` at `currentTime` 43.9, then `pause`; no segment fetched from the page's playlist after it |
| 17:50:40 | the session left the channel, the video still at 43.9 s |

The newest number of the page's playlist was 34646 below the backup's: the player asks for the number after its last segment, and that number never came. E6's restart at the end of the break, on by default before d7ca73f, started the player over on the page's playlist. `alignBackupSequence` (F-23) had no page segment to number the backups by: the preroll's playlist held ad segments only.

## Restart when the numbers go back (F-24)

With `restartOnSequenceBack` (default on), when the playlist Purple gives the player comes from another source than the last one (the page's own, or a backup variant) and its newest number is below the last one's, Purple posts E6's pause and play once.

| Level | Run | Result |
| --- | --- | --- |
| 1 | `worker.int.spec.ts`, a preroll at 0, backups at 34636, the page's playlist at 9 after it | pause and play once; none with the setting off; none at a midroll whose backup F-23 numbered |
| 2 | L2-11 (`sim/` `fromZero`: the page's token numbers its playlist from 0 and starts it at its first segment, B-029), defaults | the video plays at the end 3 of 3, one restart each (numbers 999 lower), longest still 0 s; with the setting off, the video stood still at the end 2 of 2 |
| 2 | L2-11 with `alignBackupSequence` off | with the setting off, still at the end 1 of 1; with it on, playing 2 of 2 |

## soak.py

The session took 18 minutes to give up the channel: every `twitch-maf-ad` slot (one every 4 minutes on it) reset its failure clock, which only counts 180 s outside breaks. A slot does not stop the video; only a stitched break holds the clock now.
