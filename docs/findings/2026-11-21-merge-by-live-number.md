# A merged playlist listed one live segment twice (T-836, #112)

Date: 2026-11-21. Level 1 on `main` at `2c0e0fb`, then Firefox 157 on `/channel-ar` (TS). Probes: [`t833_differential_probe.ts`](probes/t833_differential_probe.ts), [`av_buffer_probe.py`](probes/av_buffer_probe.py), [`time_order_probe.py`](probes/time_order_probe.py), [`merge_identity_probe.py`](probes/merge_identity_probe.py). Recordings: `~/purple-recordings/2026-11-21-t836` and `~/purple-recordings/2026-11-21-t836-live` (outside the repo).

## The merge

When no backup is clean, Purple gives the page's playlist with its ad segments replaced by the backups' live segments (E5, F-13). Each ad segment got the backup segment nearest in `PROGRAM-DATE-TIME`, within half its duration.

After stitched breaks the page's playlist dates a segment 0.07 to 1.60 s apart from the backups' (B-057). With the page 1.5 s early and 2 s segments, the backup segment nearest to the ad segment in the place of live segment N is N - 1, 0.5 s away; N itself is 1.5 s away, outside the tolerance. So:

- the first ad segment got the live segment the page lists just before it as its own: that segment was in the playlist twice;
- every replacement after it came one segment late.

The player fetched the repeated segment again. On a TS channel its audio goes over itself and its video is appended again, so the picture falls behind the sound by one segment each time (T-825's case, through the merge instead of F-23's numbering).

## Level 1

`t833_differential_probe.ts`, 5,000 runs of random polls (seed 20261120): the 212 live segments still fetched again after T-833's fix were all this. `newestLiveContent` also counted a replaced ad segment as the live segment of its position, one past the one it held, and F-28 restarted the player at the next playlist with nothing to fetch again (9 runs).

| | Restarts | Live segments fetched again |
| --- | --- | --- |
| 2.7.2 | 6,707 | 1,421 |
| 2.7.3 | 9,733 | 212 |
| T-833's fix | 7,243 | 212 |
| with the merge by live number | 7,230 | 0 |

## The fix

`mergeWithBackups(contents, byLiveSequence)`: with `alignByLiveSequence` (default on, F-27's setting), when the page's playlist and a backup both number their segments by `EXT-X-TWITCH-LIVE-SEQUENCE` (`liveBase`: the tag is there and the playlist has no ad segments, or has them at its end), an ad segment gets that backup's segment of its live number, whatever their dates, and none when the backup does not list it. By date-time as before without the tag in either, with the setting off, and when ad segments come before live ones (a preroll's playlist, B-060: the tag counts the ads too).

## Firefox 157, `/channel-ar` (TS)

`soak.py --browser firefox --fake-breaks 60:25 --fake-merge -1500`: a fake break of 25 s every 60 s, inside it every backup playlist with its last segment titled as an ad (no backup clean, so Purple merges) and the page's dates moved 1.5 s earlier. The 2.7.3 build (`--build`) and the build with the fix at the same time, 9 minutes, 9 fake breaks each, headless and muted.

| | 2.7.3 | With the fix |
| --- | --- | --- |
| Video buffered past the audio (`av_buffer_probe.py`) | 0.8, 1.7, 3.0, 4.0, 5.1, 5.9, 6.8, 7.9 s, about 2 s more at each break; back to 0 at a restart of the player | 0.00 s throughout |
| Live segments fetched again (`time_order_probe.py`) | 21 | 2, at the restarts |
| Seconds with the playhead moving and under 10 frames decoded | 135 (41 stretches) | 3 |
| Frames dropped | 3,487 | 12 |
| Playlists merged (`segmentsReplaced`) | 52 | 45 |

With 2.7.3 the picture stood still while the sound played on, and ran behind it until the player was restarted: what the reporter of #112 described on this channel on 2026-11-15 ("the video randomly freezes, the audio keeps going", apart "until a stop and play").

Both sessions had 234 s with the playhead still: with every backup unclean for the whole window, most polls give the page's playlist blanked (F-14), which is the simulation's doing.

## Level 2

L2-15 (`sim/scenarios/l2-15-merge-page-dated-earlier.json`, `e2e/scenarios/l2_15.py`): a midroll on every token, the page's 15 segments after its first poll and each backup token's at its own first poll (`sim/` `breaksSooner`), the page's token dating each segment 1.5 s earlier (`earlierMs`). Every backup Purple asks during the page's break lists live segments up to the moment it was asked and ad segments from there, so Purple merges at each poll. The real player (IVS SDK) on the isolated page, Brave 156:

| Purple's bundle | Merged playlist at the start of the break (the page's token is session 1) | Live segments requested again |
| --- | --- | --- |
| `2c0e0fb`, before the fix (`PURPLE_BUNDLE`) | `1/live/13`, `1/live/14`, `2/live/14`; the next one `1/live/14`, `4/live/14`, `4/live/15`, `4/live/16` | 14, from the backup's token |
| with the fix | `1/live/13`, `1/live/14`, `4/live/15`, `4/live/16`, then the page's ad segment (blank, F-14) | none |

## On twitch.tv, 2026-11-21

Five Firefox 157 sessions going from channel to channel (`soak.py --hop 40`, logged out, 14:11 to 14:37, three with the 2.7.3 build and two with the fix): 33 loads, 19 of them with a preroll, and midrolls on the channels they stayed on. Purple gave a backup's playlist 1,324 times and the page's playlist blanked 17 times; it merged none (`merge_identity_probe.py`: no `segmentsReplaced`). Every break had a clean backup among the seven types. The case of this finding was not seen on twitch.tv.

## Open

- How often the merge runs on Twitch: it needs every backup type to carry ads in the same poll. None in the 33 loads above, nor in the stitched midroll recorded on `/channel-ar` on 2026-11-20. Whether this is what the reporter sees is not known.
- The reporter's confirmation with the release that carries the fix.
