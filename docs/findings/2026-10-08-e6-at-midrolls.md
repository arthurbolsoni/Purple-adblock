# E6 at the edges of a midroll (T-809)

Date: 2026-10-08, 22:26 to 23:50 (soak h). Build: `6159af3` (C-13, F-21). Logged out, extension with `debug`, fresh profiles, `e2e/soak.py --channel /channel-d --rotate 0 --stop-after-breaks 3` with `--setting pausePlayOnBreaks=true` (`e6-on`) and `false` (`e6-off`), both sessions on the same channel. Recordings: `~/purple-recordings/2026-10-08-soak-h` (outside the repo). Probes: [`break_stall_probe.py`](probes/break_stall_probe.py), `e2e/soak_report.py`, and from 2026-10-09 [`soak_stills_probe.py`](probes/soak_stills_probe.py) and [`switch_timeline_probe.py`](probes/switch_timeline_probe.py).

## The same midrolls with E6 on and off

Both sessions got the same three stitched midrolls, starting within 2 s of each other.

| Midroll | Longest still, E6 off | Not progressing in all, E6 off | Longest still, E6 on | Not progressing in all, E6 on |
| --- | --- | --- | --- | --- |
| 23:07:55 | 0 s | 0 s | 1 s | 3 s |
| 23:37:53 | 0 s | 0 s | 1 s | 2 s |
| 23:47:53 | 4 s (from 23:47:58, on `popout` 720p60) | 4 s | 1 s | 2 s |

In all six breaks the ad overlay stayed off, no ad media reached the player, and the playlists the player got had at most the two or three polls that only announce the break (B-034).

Soak f, where E6's pause and play went to the picture-by-picture player instead of the main one (C-13), had 12 midrolls later in a load, each with 0 s still and no ad media reaching the player ([backup behind](2026-10-08-backup-behind.md#soaks)).

## What E6 does to the player

At each `pause` and `play` pair E6 sends, the `<video>`'s `currentTime` went back to 0: the player started over on the playlist it got next, from one of its newest segments. With E6 on this happened at the start and at the end of each midroll (6 restarts), with 1 s still each time.

## The 4 s still with E6 off (23:47:58)

| Time | What happened |
| --- | --- |
| 23:47:53.19 | the player fetched sequence 27613, the main playlist's first prefetch URI (02:46:28.910 to 30.910); Purple had removed the second one, the ad's first segment |
| 23:47:55.18 | the main playlist had ad segments; its newest sequence was 27615 |
| 23:47:55.20 | Purple gave the player the `popout` backup: `MEDIA-SEQUENCE` 27598, 14 segments and 2 prefetch URIs, newest sequence 27613, the one the player already had |
| 23:47:56.12, 57.04 | the backup's polls were unchanged |
| 23:47:56.63 | `waiting`, `currentTime` 4859.9: the buffer ran out, 1.4 s after the switch |
| 23:47:58.07 | the backup listed sequence 27614; the player fetched it at 23:47:59.18 |
| 23:48:02.08 | `playing` at 4864.1: the video went on 4.2 s further on |

The player kept counting the main playlist's sequence numbers on the backup and waited for one past what it had. With E6 on, at the same midroll, E6's restart at 23:47:55.2 made the player start over on the same backup from sequence 27612 (02:46:29.875): 1 s still.

Soak d's 7 s at 09:45:12 (`/channel-b`, E6 on the main player) had the same sequence: E6 restarted the player at the switch to `site` at 09:45:02, then `site`'s playlist announced a break and Purple switched to `popout` at 09:45:08.76, whose newest sequence was 2 below `site`'s last one; E6 does not run at a switch between backups. The buffer ran out at 09:45:11.09 and the video played again at 09:45:19.17, 6 s further on, after two more switches.

## Every still stretch in the two sessions

[`soak_stills_probe.py`](probes/soak_stills_probe.py) over the whole 83 minutes, not only inside the breaks:

| Still | E6 off | E6 on |
| --- | --- | --- |
| at the page load | 1 s | 1 s |
| 22:36:24, no break (both sessions) | 2 s | 2 s |
| midroll starts | 4 s (23:47:58) | 1 s, 1 s, 1 s |
| midroll ends | - | 1 s, 1 s, 1 s |
| 52 and 64 s after the end of the 23:07:55 midroll | - | 1 s and 4 s (`waiting` from 23:10:42.09 to 23:10:44.64 and from 23:10:54.65 to 23:10:59.16) |
| in all | 7 s | 14 s |

After E6's restart at the end of the 23:07:55 midroll (23:09:52), the player fetched a segment every 2 s until two gaps of 2.8 s (23:10:39.10 to 41.95 and 23:10:49.28 to 52.07); the buffer ran out after each. The E6-off session, on the same channel, did not stand still then. The restarts at the ends of the two later midrolls had no still stretch after them (the session stopped 27 s after the last one).

## Delay behind the stream

Wall clock minus `currentTime`, every 30 s ([`soak_stills_probe.py`](probes/soak_stills_probe.py)):

| Session | Change |
| --- | --- |
| E6 off | 22:36 (no break, the 2 s still): +2.9 s, then -1.2 s within 90 s; midroll 23:07:55: 0 s; midroll 23:37:53: -1.7 s (a 2 s skip forward); midroll 23:47:53: +1.4 s (4 s still, 4.2 s skip) |
| E6 on | 22:36: +2.8 s, then -1.0 s within 90 s; after the two still stretches at 23:10: +6.9 s, then -3.3 s over the next 2 minutes |

With E6 off, the video played 1.3 s further behind the stream at the end than at the start: +1.7 s from the 22:36 still both sessions had, -0.3 s from the three midrolls together. Each E6 restart resets `currentTime`, so the recording does not give the E6-on session's delay across a restart, nor a comparison between the sessions.

## Level 2

L2-09 (a backup 3 or 5 segments behind the stream clock) on 2026-10-09 with `L2_SETTINGS={"pausePlayOnBreaks": false}`; reports in `~/purple-recordings/2026-10-09-t809`. `level2.watch` now samples the SDK player's buffer each second.

| Backup behind | E6 | Runs | Longest still | `waiting` at the switch |
| --- | --- | --- | --- | --- |
| 3 segments | off | 4 | 0 to 1 s | 598 and 715 ms (2 of 4 runs) |
| 5 segments | off | 2 | 1 s | none |
| 5 segments | on | 1 | 0 s | none; restarts at the start and the end |

Outside the break the isolated player kept 3.3 to 5.9 s of buffer, and 2.5 to 3.7 s after E6's restart at the break end (one run). In every run the buffer drained to 0.3 to 0.4 s around the break's start and filled again within a second: the wait of soak h and soak d (3 s and more) did not come.

## Open

- A restart only when Purple switches the player to a playlist whose newest sequence is not past the newest one it gave the player before (main to backup, backup to backup, backup to main), with E6 at the break edges off: the decision on `pausePlayOnBreaks`' default waits on it (T-809).
- Still stretches after E6's restart at a break end (T-814).
- Level 2 does not reproduce the wait at the switch (T-815).
