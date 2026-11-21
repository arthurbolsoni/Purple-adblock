# An audio gap after a pause and play on Firefox, fMP4 (T-835)

Date: 2026-11-21. Probes: [`stale_append_probe.py`](probes/stale_append_probe.py), [`firefox_audio_islands_probe.py`](probes/firefox_audio_islands_probe.py), [`firefox_media_log_probe.py`](probes/firefox_media_log_probe.py). Recordings: Firefox 157 soaks of 2026-11-20 and 2026-11-21 (`~/purple-recordings/2026-11-20-t833`, `~/purple-recordings/2026-11-21-2k`, outside the repo), headless and muted, `--moz-log "timestamp,MediaFormatReader:4,MediaSource:4"`.

## The gap

On `/channel-aj` (fMP4, both tracks in one SourceBuffer) with 2.7.3, fake breaks and the test's pauses, Firefox's decoded audio had a gap of 394.667 ms three times in 20 minutes (22:14:45, 22:18:45, 22:26:45), each 47 to 48 s after a pause and play. The media log at the first one:

- 22:09:57.143: the test clicks play, 3 s after its pause.
- 22:09:57.209 and .256: the page's player appends 138,378 and 1,124 bytes with the timestampOffset of the timeline before the pause. The SourceBuffer, emptied at the pause, has 50.010 to 50.116 s buffered.
- 22:09:57.313: the player calls `abort()` and moves timestampOffset by 52 s, so the new timeline starts at 0. What the two appends left stays: 0.1 s of audio and video of the old timeline, 50 s ahead on the new one.
- 22:10:45: the new timeline's appends reach 50 s. The audio frame before the old one ends at 50.020 and the old one starts at 50.031: a gap of 10.667 ms.
- 22:14:45, after the same pause four breaks later: Firefox's reader gets to the old frame at 50.010 while the new audio ends at 49.615 (the next chunk of the segment is appended 0.3 s later): it decodes the old frame and leaves out 49.615 to 50.010, 394.667 ms.

The gap is the distance between the end of the new audio appended so far and the old media, at the moment Firefox reads ahead to it: about 11 ms when the new audio is appended first, about 395 ms when the reader comes first.

## Which restarts leave old media

`stale_append_probe.py` lists, at each change of timestampOffset, what the SourceBuffer had buffered at the `abort()`:

| Session | Timeline restarts | Left old media | Which |
| --- | --- | --- | --- |
| 2.7.3, fake breaks and pauses, `/channel-aj` | 17 | 4 | the test's pause 0.5 s into a break (the moment Purple changes to the backup), 4 of its 5; none of the pauses in the middle or at the end of a break, none of Purple's own restart |
| 2.7.3, fake breaks and backups behind, `/channel-aj` | 51 | 0 | Purple's restarts only (F-28, F-24) |
| 2.7.2, the same | 4 | 2 | the two pauses that came from the desktop's media controls (T-834) |
| 2.7.3, logged in at 1440p, `/channel-as` | 14 and 4 | 0 | Purple's restarts only |

Purple's restarts (E6's pause and play from the worker: 69 in these sessions) left nothing. The pauses that did are a viewer's: the page's button, or the desktop's media controls. After such a pause the player appends media it already had in hand with the old offset before it starts the timeline over.

Where the old media sits on the new timeline is where the playhead was on the old one: 50 s after a restart in these runs, as long as the player had played since its last restart. A later restart before that leaves it behind for good.

F-29 does not see it: it widens removals, and this is an append.

## Open

- A session without Purple with the same pauses: logged out, the page answers a pause with a pause ad that covers the play button, so the test's play did not run (2026-11-21, one pause and play in 12 minutes, which kept its position and its buffer). The pauses of 2026-11-07 without Purple left old audio at each restart (T-829), before this append was told apart from the removals.
- Whether Chromium plays the old media: not measured.
- Removing what is buffered at an `abort()` followed by a change of timestampOffset would take it away; a removal makes the SourceBuffer `updating`, and the player's next append comes 14 ms later, so the append has to wait for it without the player seeing the removal's events.
