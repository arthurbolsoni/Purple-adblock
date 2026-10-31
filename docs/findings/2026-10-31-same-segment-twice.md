# The same segment twice at a midroll start (T-825, #112)

Date: 2026-10-31. Recordings: `~/purple-recordings/2026-10-30-t825` (outside the repo), three soaks from 2026-10-30 23:50 to 2026-10-31 01:50 on Brave 156 (`PURPLE_BROWSER`, headless on Linux, logged out). Each soak recorded the text of every media playlist the player got (`--all-playlists`), the Media Source appends (`e2e/mse-hook.js`) and the browser's media log (CDP `Media`). Probes: [`time_order_probe.py`](probes/time_order_probe.py), [`av_buffer_probe.py`](probes/av_buffer_probe.py).

| Session | Purple | Channels | Breaks |
| --- | --- | --- | --- |
| `ext-mid` | 2.7.0 build, default settings, `debug` | `/channel-c` for 5 min, then `/channel-d` for 114 min on one load (TS) | 2 prerolls, 10 stitched midrolls, 23 page-side breaks (`twitch-maf-ad`) |
| `ext-hop` | the same | one channel for 4 min, then `/channel-aj` for 116 min on one load (fMP4) | 6 midrolls, 25 page-side breaks |
| `rec-hop` | none (record mode) | 7 channels, 4 to 24 min each (TS) | 8 prerolls, 6 midrolls, 15 page-side breaks |

## Audio and video apart

On a TS stream the player (IVS) feeds two SourceBuffers, `mp4a.40.2` and `avc1`, on its own timeline from 0. After each append, `lag` is the end of the audio's newest buffered range minus the video's. The audio and the video of the newest segment end together, so a lag below 0 means the same moment sits that much later on the video's timeline than on the audio's.

- `rec-hop`, no Purple: the lag stayed within ±0.15 s on all 7 loads, through the prerolls and midrolls the player played itself.
- `ext-mid`, `/channel-d`: the lag was 0 until the first midroll. It then grew by 1.93 to 1.98 s at each of 12 switches and by 3.98 and 5.95 s at two more, ending at −35.7 s. Nothing brought it back during the load.

The playhead stayed 1.1 s behind the audio's end (the player's low-latency target; the media element's buffered range is where both tracks have data). The video's end ran ahead of the playhead by 11.0 s at 00:11, 25.0 s at 00:41 and 36.8 s at 01:41. At each moment the picture showed the part of the stream whose sound had played that many seconds before, less the 1.1 s.

## Where the lag grows

`time_order_probe.py` gives each segment the player fetched its live number (`EXT-X-TWITCH-LIVE-SEQUENCE` + index, which numbers the stream alike on every token, B-054). It also gives the step by date-time from the end of the segment fetched before it. Every change of the lag came at a fetch whose live number was not one past the previous fetch's:

| Time | Lag change | Switch | Step by date-time | Live step |
| --- | --- | --- | --- | --- |
| 00:01:07 | −1.98 | page → `site`, midroll start | −0.40 | 0 |
| 00:03:21 | −5.95 | `autoplay` → `site` | −6.00 | −2 |
| 00:11:05 | −1.98 | page → `popout`, midroll start | −1.68 | 0 |
| 00:13:00 | −1.97 | `frontpage` → another `frontpage` playlist, same number | −2.00 | 0 |
| 00:21:05 | −1.96 | page → `frontpage`, midroll start | −0.71 | 0 |
| 00:23:14 | −3.98 | `site` → page | −4.00 | −1 |
| 00:31:07 | −1.93 | page → `site`, midroll start | −0.71 | 0 |
| 00:32:29 | −1.96 | page (merged) → `popout`, same number | −2.00 | 0 |
| 00:41:05 | −1.97 | page → `popout`, midroll start | −1.40 | 0 |
| 00:51:09 | −1.97 | page → `site`, midroll start | −1.67 | 0 |
| 01:12:43 | −1.96 | `popout` → another `popout` playlist, same number | −2.00 | 0 |
| 01:21:05 | −1.96 | page → `popout`, midroll start | −0.63 | 0 |
| 01:22:39 | −1.97 | `popout` → another `popout` playlist, same number | −2.00 | 0 |
| 01:31:09 | −1.97 | page → `site`, midroll start | −1.19 | 0 |
| 01:41:07 | −1.99 | page → `popout`, midroll start | −1.46 | 0 |

Each segment the player got again moved the lag by one segment, 2 s: one at a live step of 0, two at −1, three at −2. The step by date-time did not set it (−0.40 and −1.68 both gave −1.98).

The other switches of the load were one past the previous fetch and left the lag where it was: 49 page → backup, 57 backup → page (date-time steps down to −0.81), 241 between backups. The 10th midroll start (01:11:07) also continued normally: a step of +0.07 s, live step 1. The two restarts of F-24 after the prerolls (live step 0, −3.60 s) left no lag. IVS logged `AVC finishFrame called without active frame` (T-819) at each of the 15 fetches in the table and at 56 other fetches in the session; `rec-hop` logged it once.

## Why the player gets the segment again

The 9 midroll starts with a live step of 0 follow from F-23. It numbers a backup by date-time: each backup segment gets the number the page's playlist gives the moment where it ends, rounded up past 0.05 segment. For the same live number, the page's playlist gave an earlier `PROGRAM-DATE-TIME` than the backups':

- at those 9 midroll starts, by 0.32 to 1.60 s (the step by date-time + 2 s);
- at 01:11:07, by 0.07 s;
- at the ends of the breaks, where the page's playlist followed the backup's segment with the next live number, by 0.07 to 0.81 s (the step by date-time, negated).

The backup's copy of the page's newest segment then starts 0.32 to 1.60 s inside that segment by date-time and gets the next number. The player asks for the number after its last segment and fetches the same segment again. The backups agree with each other (241 switches between them, step 0, live step 1). B-054's page base moving by fractions of a segment at each stitched midroll is this shift of the page's date-time. Level 2 (L2-10, `sim/` `ahead`) moved the page's numbers by whole segments with the same date-time on every token, so F-23's runs did not show it.

The four fetches of the same number from another playlist are another path, and so are the two switches with the live number going back (−1, −2). In those four, the player fetched a number it had just fetched, from another playlist that lists the same segment under another URI, and the step by date-time was −2.00 s. Each segment appeared in the recorded texts first as a prefetch URI and then as a full segment, so the recording does not show why the player asked for it again.

## What the player does with a segment it already has

At 00:11:05, the first `popout` segment (live 59549, the same as the page's last) came to the two SourceBuffers in bulk:

- audio: 50.9 KB, about 2.16 s at the session's 23.5 KB per second, appended without moving the audio's end (832.02);
- video: its end grew by 2.6 s.

IVS wrote the segment's audio over the same 2 s of audio and appended its video after the video it had. Over the 15 fetches in the table, the audio appended without moving its end came to 1.25 to 2.17 s per segment fetched again, for date-time steps from −0.40 to −1.68 s.

For the viewer, the picture shows a segment it has shown (2 s) and from then on runs 2 s further behind the sound, 2 s more at each midroll, until the player builds a new MediaSource (a reload or another channel). The media log's `Large timestamp gap detected; may cause AV sync to drift` warnings (8 in `ext-mid`, 8 in `rec-hop`) came from the players of page-side ads (`FFmpegDemuxer`), not from the stream.

## fMP4 channel

`/channel-aj` serves fMP4 (`.mp4` with `EXT-X-MAP`, B-023). IVS appends its fragments to one SourceBuffer for both tracks (`avc1.4D401F,mp4a.40.2`) with `timestampOffset` −15800 s (the stream's own time), so the lag cannot be read there.

Every page → backup switch was one past the previous fetch (39 of 39, 6 midrolls). Three switches back to the page had a live step of 0, −2 and −3, and three fetches from another playlist of the same backup type 0, 0 and −2.

Its video stood still 2 to 3 s about every 88 s through the whole load (68 times), at about 15 s of latency; at a still, the SourceBuffer ended 0.1 s past the playhead while the player counted 15 s of buffer. The TS loads of the same night had 0 to 2 such stills each. No session without Purple ran on that channel (T-827).

## Firefox

Issue #112 came from Firefox 157; these runs are on Brave 156. The segment the player gets again comes from the playlists Purple gives it, which do not depend on the browser. How Firefox's player places a segment it already has was not measured.

## With F-27: the ends of the breaks

Soak `t826-mid`, 2026-10-31 14:35 to 15:10 (`~/purple-recordings/2026-10-31-t826`), the build with `alignByLiveSequence` (F-27, T-826), `/channel-d` on one load, 4 stitched midrolls (14:35:37, 14:45:33, 14:55:37, 15:05:37) and 5 page-side breaks:

- Midroll starts: each backup got the page's offset of the time (`MEDIA-SEQUENCE` minus the live sequence: 0, 4, 8, 12); every page → backup switch was one past the previous fetch (39 of 39), with no lag change.
- Midroll ends: the page's playlist came back numbering the stream further ahead, by 4 at the first three (0 → 4, 4 → 8, 8 → 12) and by 5 at the fourth (12 → 17). It listed the last 4 (5) segments the player had from the backup under the numbers after its last, and the player fetched them again (14:38:09, 14:48:08, 14:59:00, 15:09:04; live steps −3, −3, −3, −4). The lag moved by −7.97, −7.98, −7.94 and −9.93 s.
- At 14:49:45, with the lag at −15.94 s, the audio's buffer ran out 16 s before the video's; the player stood still 3 s and jumped 16.7 s forward, and the lag came back to 0.

In `ext-mid` (date-time numbering) the page's offset moved by 2 per midroll, in two steps: 1 a few seconds into the break and 1 near its end. The backup's off-by-one number at the start matched the first step, so the switches back to the page were one past the previous fetch; the second step is where the player fetched a number again from another playlist (00:13:00, 01:12:43, 01:22:39). With every number exact at the start, each move of the page's numbers inside the break comes back as segments fetched again at its end. The page's playlist without ads goes back to the player untouched (rule 3), so F-28 restarts the player there instead: E6's pause and play, after which the player starts over on that playlist with a new timeline (the restarts of F-24 after the prerolls in `ext-mid` left no lag).

## With F-28

L2-14 (`sim/` `aheadAfterBreak` 4: the page's token numbers the stream 4 further ahead once the break is over), Brave, 3 runs each: with `restartOnRepeat` one restart (`segmentRepeat` 4) at the page's playlist after the break, and the audio and video ends within 0.06 s over the last 20 appends; without it the player requested those 4 segments again and the ends stayed 8.05 s apart.

Soak `t826-f28`, 2026-10-31 15:15 to 16:00 (`~/purple-recordings/2026-10-31-t826`), the build with F-27 and F-28:

- `/channel-al`, 31 min on one load after a preroll, 3 midrolls (15:33:47, 15:43:51, 15:53:48): the page's offset moved by 6, 5 and 5 at their ends; F-28 restarted the player each time (`segmentRepeat` 6, 5, 5). The lag ended at +0.04 s, and the video had no still of 2 s or more.
- `/channel-d`, the first 13 min: after the preroll at the load F-28 restarted the player twice (15:16:13, 15:17:03) with a count of 2427. The page's playlist numbered from 0 after the preroll (B-029), a backup delivered without a shift numbered the stream 2427 higher, and the number after the player's was not in it at all. The check now counts a number only when the new playlist lists it (TS-826).
- At 15:25:40 on `/channel-d`, and at 15:21:37 in a session on `/channel-ak`, Twitch's page paused the player and did not play it again (T-828).

