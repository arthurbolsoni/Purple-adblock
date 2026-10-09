# E6 at the edges of a midroll (T-809)

Date: 2026-10-08, 22:26 to 23:50 (soak h). Build: `6159af3` (C-13, F-21). Logged out, extension with `debug`, fresh profiles, `e2e/soak.py --channel /channel-d --rotate 0 --stop-after-breaks 3` with `--setting pausePlayOnBreaks=true` (`e6-on`) and `false` (`e6-off`), both sessions on the same channel. Recordings: `~/purple-recordings/2026-10-08-soak-h` (outside the repo). Probes: [`break_stall_probe.py`](probes/break_stall_probe.py) and `e2e/soak_report.py`.

## The same midrolls with E6 on and off

Both sessions got the same three stitched midrolls, starting within 2 s of each other.

| Midroll | Longest still, E6 off | Not progressing in all, E6 off | Longest still, E6 on | Not progressing in all, E6 on |
| --- | --- | --- | --- | --- |
| 23:07:55 | 0 s | 0 s | 1 s | 3 s |
| 23:37:53 | 0 s | 0 s | 1 s | 2 s |
| 23:47:53 | 4 s (from 23:47:58, on `popout` 720p60) | 4 s | 1 s | 2 s |

In all six breaks the ad overlay stayed off, no ad media reached the player, and the playlists the player got had at most the two or three polls that only announce the break (B-034).

Soak f, where E6's pause and play went to the picture-by-picture player instead of the main one (C-13), had 12 midrolls later in a load, each with 0 s still and no ad media reaching the player ([backup behind](2026-10-08-backup-behind.md#soaks)).

## Open

- E6 in a break that starts in the first seconds after the page opened (T-810): `e2e/join_break.py` runs with E6 off and with a 1.5 s wait between pause and play.
