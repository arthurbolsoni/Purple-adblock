# Sequence numbers at a switch between playlists (T-816)

Date: 2026-10-09. Recordings: soaks d to h of 2026-10-08 (`~/purple-recordings`, outside the repo), extension sessions with `debug`. Probes: [`switch_gap_probe.py`](probes/switch_gap_probe.py), [`sequence_offset_probe.py`](probes/sequence_offset_probe.py), [`sequence_base_probe.py`](probes/sequence_base_probe.py), [`switch_timeline_probe.py`](probes/switch_timeline_probe.py), [`page_player_probe.py`](probes/page_player_probe.py).

## The player follows sequence numbers

When Purple gives the player another token's playlist, the player asks for the number after the last segment it fetched, whatever the date-time of the segments under that number. Soak h, 23:47:55 (E6 off): the player had the main playlist's 27613 (02:46:28.910 to 30.910); the first `popout` playlist listed up to 27613, whose segment started at 02:46:31.875, newer than anything the player had. The player waited 2.9 s for 27614 and the video stood still 4 s ([E6 at midrolls](2026-10-08-e6-at-midrolls.md#the-4-s-still-with-e6-off-234758)).

## Numbering against date-time

`base`: a live segment's `PROGRAM-DATE-TIME` minus its sequence number x 2 s. Two playlists with the same base give the same number to the same moment of the stream; a lower base gives it a higher number.

Soak h, `/channel-d`, one load:

| From | Page's playlist | Backups' playlists |
| --- | --- | --- |
| 22:29:59 | 765.9 | 765.9 (from 23:08:00, the first recorded) |
| 23:08:29, after the first stitched midroll | 764.6 | 765.9 |
| 23:38:27, after the second | 762.9 | 765.9 |
| 23:48:13, after the third | 762.2 | 765.9 |

The gap at the switch to the first backup (its newest number minus the newest number the player could have) was +2, +1 and 0 at the three midrolls.

Soak d, `/channel-b` (ext-b), one load: the page's base went 804.9, 799.8 (09:40:54, no ad text recorded around it), 794.8 (09:48:53), 793.5, 791.9 and 790.1 at the three midrolls after 10:30. At 09:45 the `site` token in use had the page's base then, 799.8, while the `popout` token had 804.9 and numbered the same moment 2.5 segments lower: the switch from `site` to `popout` at 09:45:08 had a gap of -2, the player waited 6.1 s and stood still 7 s ([E6 at midrolls](2026-10-08-e6-at-midrolls.md#the-4-s-still-with-e6-off-234758)).

Over soaks d to h, in the 21 loads with recorded texts of both, the page's most frequent base differed from the backups' in 7, by 0.25 to 5.05 segments ([`sequence_base_probe.py`](probes/sequence_base_probe.py)).

## Switches and still video

[`switch_gap_probe.py`](probes/switch_gap_probe.py) over the 17 extension sessions of soaks d to h: 350 changes of the source of the player's playlist (main to backup, backup to backup, backup to main). Purple changes backup type every few seconds inside a break, when the backup's own playlist announces a break; switches between backups asked at the same time had a gap of +1.

Switches with no E6 restart around them:

| Gap | Time until the new source listed a number past the player's | Switches | Still 2 s or more |
| --- | --- | --- | --- |
| 0 or less | 0.1 to 1.7 s | 15 | 1 (2 s, inside the still stretch of a switch 4 s before) |
| 0 or less | 2.1 s | 1 | 3 s |
| 0 or less | 2.9 s | 2 | 4 s; 7 s (a break 12 s after the page opened, T-810) |
| 0 or less | 6.1 s | 1 | 7 s |
| +1 or more | - | 307 | 3 not inside another switch's still stretch: 2 s, 3 s (an fMP4 stream: one new segment, and the next listed 1.6 s later) and 2 s, all on soak e |

The page player kept 1.1 to 2.3 s of buffer at the live edge (low latency on; `getBufferDuration()` in [`page_player_probe.py`](probes/page_player_probe.py) and soak i). The video stood still when the new playlist took longer than that to list a number past the player's: about the wait plus 1 s.

## E6

E6's pause and play restart the player (currentTime 0), which then starts over on the playlist it gets from its newest segments, whatever their numbers: at the same 23:47:55 switch with E6 on, 1 s still. Each restart costs about 1 s of still video and leaves the player with a smaller buffer (T-814).

## Open

- Purple numbering a backup playlist as the page's playlist numbers the same date-time (a `MEDIA-SEQUENCE` shift while a backup replaces the main playlist), so the switch brings the numbers the player expects (T-817).
