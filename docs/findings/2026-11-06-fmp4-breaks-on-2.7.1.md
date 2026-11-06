# Breaks on an fMP4 channel with 2.7.1 (T-829, #112)

Date: 2026-11-06. Recordings: `~/purple-recordings/2026-11-06-t829` (outside the repo). Two soaks ran at the same time on `/channel-ao`, 16:33 to 18:23: 109.6 min on one load each, until the channel raided another. Brave 156.1.98, headless on Linux, logged out, `--all-playlists`. Probes: [`time_order_probe.py`](probes/time_order_probe.py), [`stills_probe.py`](probes/stills_probe.py), [`fmp4_track_times_probe.py`](probes/fmp4_track_times_probe.py).

| Session | Purple | Breaks on `/channel-ao` |
| --- | --- | --- |
| `t829-ext` | build of `main` at 9e6ef4c (2.7.1 plus the T-828 harness flag), default settings, `debug` | 23 `twitch-maf-ad` slots, 2 stitched midrolls |
| `t829-rec` | none (record mode) | 22 `twitch-maf-ad` slots, the same 2 stitched midrolls |

`/channel-ao` serves fMP4 (`.mp4` with `EXT-X-MAP`, B-023). The player took the 720p60 variant (`avc1.4D401F,mp4a.40.2`) and appended both tracks to one SourceBuffer, as on the fMP4 channels of T-827. The stitched midrolls came at 17:04:59 and 18:04:58 and lasted 80 s each; the `twitch-maf-ad` slots came every 4 to 5 min between them (B-032).

## The midrolls with Purple

The two midrolls went the same way:

- Purple answered 44 and 46 polls with a backup. The backup type changed at almost every poll: the backup tokens' own playlists announced breaks or listed ad segments, one type after another (B-036), and F-10 left each such type out for 5 s. Over the two midrolls `time_order_probe.py` counted 59 changes of source: 10 from the page's playlist to a backup, 39 between backups and 10 back to the page's.
- At every change of source the player fetched the segment after its last one (live step +1). Inside the breaks it fetched no segment twice.
- Three times per midroll the picture went to 640x360 for 2 to 4 s and back to 1280x720. At those polls every 720p type had announced its own break, had ads, or listed nothing past the player's last segment (F-25), so the 360p `picture-by-picture` or `autoplay` backup came first. The browser logged a change of video decoder configuration at each switch (6 per midroll), and the video dropped 1 to 3 frames each time.
- At the end the page's playlist came back numbering the stream further ahead, by 2 at the first midroll and by 1 at the second (B-054). F-28 restarted the player (`segmentRepeat` 2 and 1): `currentTime` went back to 0, the video stood still about 1 s, and it went on 1.46 s further ahead in the stream. At each restart the player fetched the segment it was on once more (the session's only 2 fetches with a live step of 0).

No ad overlay at any time. Over the 109.6 min there was no still of 1 s or more. Latency had a median of 1.69 s (90th percentile 2.36 s), the playback rate stayed at 1, and 15 of 392,248 frames were dropped.

## Without Purple

At both midrolls the page showed the ad overlay for 45 s (17:05:09 to 17:05:54, 18:05:03 to 18:05:48). At 17:05:03 the video stood still 4 s when the first ad started. Over the 109.6 min that was the only still of 1 s or more. Latency had a median of 2.85 s (90th percentile 3.06 s), the playback rate was 1.03 for 166 s, and 596 of 389,501 frames were dropped.

## The same segment from every source

`fmp4_track_times_probe.py` read the decode times (`tfdt`) of the audio track (48 kHz) and the video track (1 MHz) of each copy:

- At 17:08, outside a break, the same live number from new `site`, `popout`, `autoplay` and `picture-by-picture` tokens, each at 720p60 and 360p30: the same audio start and the same video start in all six playlists, for 2 live numbers.
- The first midroll's copies (live numbers 9183 to 9233), downloaded again 20 minutes later: the page's own playlist before and after the break, and every backup Purple delivered. All copies of a live number had the same audio and video starts. The second midroll's copies, asked 35 minutes after it, answered with an HTTP error.

After the first midroll the page's playlist dated a live number 1.455 s later than the backups' playlists; after the second, 0.911 s later (B-057; on `/channel-d` the page's playlist dated it earlier). The media under those tags kept the same decode times. IVS sets one `timestampOffset` per load, changed only at F-28's restarts, and places the fMP4 fragments by their decode times, so no change of source moved either track.

## Firefox

The report on #112 came from the Firefox add-on. These runs are on Brave; Firefox was not run (it is not installed on this machine, and `e2e/firefox.py` starts the Windows install). Three things happen at every midroll and were not measured on Firefox:

- 6 changes of video configuration in one SourceBuffer (720p60 to 360p30 and back);
- a new init segment at each change of source, from another token's `EXT-X-MAP` URI;
- F-28's restart at the end.

## Open

- T-829: whether Firefox 157 plays these midrolls with the audio and the video apart, and which of the three causes it.
