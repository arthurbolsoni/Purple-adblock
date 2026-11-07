# Old audio played after the player restarts, Firefox, fMP4 channels (T-829, #112)

Date: 2026-11-07. Firefox 157.0.1 on Linux, in a window with the sound on, logged out, on `/channel-ap` (fMP4: IVS appends `avc1.4D401F,mp4a.40.2` to one SourceBuffer). Firefox's media log with `MediaFormatReader:4,MediaSource:4`. Probes: [`firefox_audio_islands_probe.py`](probes/firefox_audio_islands_probe.py), [`firefox_media_log_probe.py`](probes/firefox_media_log_probe.py). Recordings: `~/purple-recordings/2026-11-07-t829` (outside the repo).

| Session | Purple | Run |
| --- | --- | --- |
| `ff-fake` | build of 9e6ef4c (2.7.1), `debug` | 18:12 to 18:36: a fake break of 25 s every 60 s (`soak.py --fake-breaks 60:25`: the player's own playlists reach Purple titled as ads, so Purple plays a backup), and in 3 of each 4 breaks a pause of 3 s with the player's button (`--pauses`): in the middle, at the change to the backup, across the change back |
| `ff-ctrl` | none (record mode) | 18:39 to 18:51: the pauses only, one a minute (`--fake-breaks 60:0 --pauses`) |
| `ff-fix` | the same build with F-29 | 18:52 to 19:04: as `ff-fake` |

## How the player frees its buffer

IVS frees the buffer behind the playhead every 2 s with a short removal from the start of the buffered range: `remove(2, 2.518)`, `remove(4, 4.138)`, `remove(6, 6.104)`. In the one SourceBuffer, Firefox removes the video up to its next key frame, the start of the next 2 s segment, and the audio only over the range asked (Media Source coded frame removal: a video frame goes with the frames that depend on it, every audio frame stands alone). What is left is audio with no video beside it, behind the playhead. Firefox's audio ranges at 18:12:36:

```
(0.125, 2.002) (2.536, 4.008) (4.157, 6.013) ...
```

`buffered`, where both tracks have data, does not show it, and the next removals start at its start, so that audio stays.

## Restart

At a pause and play the player starts over at the live edge in the same SourceBuffer: `remove(18, 49.616)` (the range it was playing), `abort()`, `timestampOffset` from -8632.665 to -8684.665, so the new timeline starts at 0 again, and appends from 0. The audio left behind is now ahead of the playhead on the new timeline (9 ranges between 0.55 and 18 s after the restart of 18:13:33).

Firefox reads audio ahead of the playhead. When the read position goes past the newest append it decodes that old audio, 52 s and more before the present, under its own init segment (the audio stream id goes 5 to 3 and back 3 ms later, and the AAC decoder is built again each time); the next append lands on it (`Next sample to be played got overwritten`) and the audio comes back to the present. That is #112's report, "the audio starts skipping between present and past". The changes of decoder also leave gaps of 75 to 380 ms in the decoded audio.

Each restart leaves more old audio: the ranges come from every timeline the player has run since the load. `firefox_audio_islands_probe.py` for each change of `timestampOffset` of the main stream after the load, with the 55 s after it:

| Session | Restarts | Old audio on the new timeline | Audio gaps in the 55 s after |
| --- | --- | --- | --- |
| `ff-fake` (Purple 2.7.1) | 18 | 4 to 37 ranges, 5.3 to 56.1 s | 4 to 27, 0.7 to 5.9 s; 72.7 s in all |
| `ff-ctrl` (no Purple) | 9 | 3 to 47 ranges, 4.8 to 74.0 s | 5 to 28, 0.9 to 6.1 s; 24.9 s in all |
| `ff-fix` (Purple with F-29) | 9 | 1 range, 0.2 to 0.4 s | 0 or 1, at most 16 ms; 0.05 s in all |

Without Purple, a viewer's pause and play does the same. With Purple, F-28 restarts the player with a pause and play at the end of each stitched midroll (T-826), and F-24 when the numbers go back at a switch: with 2.7.1, on an fMP4 channel in Firefox, each midroll ended this way. Chromium was not measured; the Brave soaks of 2026-11-06 on `/channel-ao` had their F-28 restarts but no measure of the audio's content.

## TS channels

On a TS channel IVS gives each track its own SourceBuffer, and a removal on the audio one takes what was asked. `/channel-aq`, a stitched midroll at 18:08:45 in the hop soak `ff-hop2` (Firefox, Purple 2.7.1): at F-28's restart at 18:10:03 IVS removed `(49.877, 87.531)` from the audio buffer, which was left empty; no old audio was on the new timeline.

## Errors at the changes of source

The maintainer had seen the player log errors on Firefox while Purple changed sources. With the page's and the worker's console kept (`2829716`), the player worker logged `AVC finishFrame called without active frame` 5 times in `/channel-aq`'s midroll, each at the fetch of a segment next to one from the 360p `autoplay` backup (`popout` 720p to `autoplay`, `autoplay` to `site`, `autoplay` to `autoplay`, `embed` to `autoplay`); 12 times on 3 TS channels in the hour of `ff-hop2`. The same line is in the Brave soaks of T-825 and T-826 (71 in `ext-mid`, 45 in `t826-f28`, 39 in `t826-mid`) and once without Purple (`rec-hop`), and in none of the fMP4 sessions. The decoded audio and video had no step with them (in that midroll one audio step back of 16 ms and 3 video gaps of 146 ms in all). The page's player also logged `Playhead stalling at 6.031645` and `jumping 0.1s gap` when the break began.

## Fix

F-29 (`widenBufferRemovals`, default on): in the page, a removal from a SourceBuffer whose type names an audio and a video codec starts at 0 when it starts at the buffered start, and goes to the end when it ends at the buffered end. What it removes on top is media of one track, which cannot play.

In `ff-fix` the player's removals reached the SourceBuffer as `remove(0, 2.79)`, `remove(0, 4.486)`, and `remove(0, Infinity)` at each restart. What was left on the new timeline was one range of 0.2 to 0.4 s at its far end (38.9 and 49.3 s after the restart), audio appended after the restart's removal, which the new appends covered before the playhead came to it (see the table). Purple played its backups as in `ff-fake` (141 changes of source over 12 fake breaks, 302 over 25), and neither session logged a player, `<video>` or Media Source error.
