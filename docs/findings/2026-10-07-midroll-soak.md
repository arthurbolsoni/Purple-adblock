# Midroll soak, 2026-10-07 to 2026-10-08

Date: 2026-10-07 23:28 to 2026-10-08 02:30 (local time) · logged out · fresh profile per session · Edge 154 · extension mode with `debug` on, and record mode (Purple off) as the control · Used by: `docs/server/`, TR-002, Q-001, Q-004, Q-008, L3-03, T-201, T-301

## Method

- Tool: `e2e/soak.py` (probe and harness in one; see [tests.md](../tests.md), level 3). One Edge per session on a hidden desktop, each on a new temporary profile, one live channel from the first cards of `/directory/all` (the directory lists channels of the viewer's region: Brazilian Portuguese channels here). Every 30 s the session empties the recorder's arrays into JSONL files under `~/purple-recordings/2026-10-07-soak/<session>/`.
- Recorded per session: the worker logger's digest of every master, media playlist and token answer from Twitch before Purple sees it; the full text of every server media playlist with ad markers (`serverText`, new tonight, cut at 30 000 characters in the 23:28 test and at 100 000 after 23:36); the digest of each playlist Purple delivered to the player; Purple's debug events and console lines; the page's requests to `edge.ads.twitch.tv` with HTTP status (resource timing) and, from 23:56 in the record session, a digest of their answers (VAST tag counts, durations, ad system; key structure of JSON answers); a page monitor sampled every second: ad overlay, player error and progress of the first `<video>` (from 23:31), number of `<video>` elements and of playing ones, page elements whose `data-a-target`/`data-test-selector` names an ad, elements with a `pbyp` class (from 23:42); the pause and play messages between the page and the player worker (from 23:51).
- Analysis: `python e2e/soak_report.py ~/purple-recordings/2026-10-07-soak` (breaks poll by poll, watch time, totals). A break is a run of main-stream polls with ad markers, polls at most 12 s apart; a `twitch-maf-ad` slot is counted on its own, from the first main poll with the class to the first one without it (a slot can overlap a stitched break). Main stream: the playlists Purple delivered to the player (extension mode), or the playlists of the load's first master (record mode; a later `picture-by-picture` master requested by the page owns the playlists first polled after it).
- Restarts (each one a new profile and a new load): all three sessions at 23:36, 23:42 and 23:51 to add recorder fields (runs 1 to 3); the record session at 23:56 for the answer digests; at 00:20 and 00:23 the record session and one extension session moved to `/channel-a`, the channel with stitched midrolls, to watch the same breaks with and without Purple; at 01:10 the other extension session moved on to channels not watched yet. A session also reloaded its channel by itself after 3 minutes without video progress.
- Techniques: TR-002 (stay on one channel), TR-009 (same channel with and without Purple).

| Session | Mode | Channel | Loads | Watched | Stitched breaks | `twitch-maf-ad` slots |
| --- | --- | --- | --- | --- | --- | --- |
| `ext-a` | extension, `debug` | `/channel-c` | 1 | 80 min | 3 | 16 |
| `ext-b` | extension, `debug` | `/channel-a` | 3 | 127 min | 2 | 28 |
| `rec-c` | record (Purple off) | `/channel-a` | 1 | 129 min | 2 | 29 |
| `run7-ext-a` | extension, `debug` | `/channel-a`, then `/channel-g` | 2 | 28 + 50 min | 1 + 1 | 6 + 12 |
| `run5-ext-b` | extension, `debug` | `/channel-b` | 1 | 29 min | 1 | 6 |
| `run5-rec-c` | record | `/channel-n` | 1 | 23 min | 0 | 5 |
| `run3-ext-a` | extension, `debug` | `/channel-a` | 1 | 8.5 min | 1 | 2 |
| runs 1 to 4 and 6, the other sessions | both | `/channel-a`, `/channel-b`, `/channel-n` | 10 | 47.5 min (0.5 to 8 min each) | 0 | 11 |

Total: 8.69 h in 20 loads on 5 channels (extension 5.80 h in 14 loads, record 2.88 h in 6). Report: `python e2e/soak_report.py ~/purple-recordings/2026-10-07-soak` (the `rec-c` session started after midnight wrote to `2026-10-08-soak/` and was moved next to the others).

## Results

| Break | Count | Loads |
| --- | --- | --- |
| `twitch-maf-ad` slot (markers over live segments, client-side ad) | 115 | every one of the 19 loads watched for more than 3 minutes |
| Stitched midroll (ad segments in the main playlist) | 10 | `/channel-c` 3, `/channel-a` 5 (2 of them seen by two sessions), `/channel-b` 1, `/channel-g` 1 |
| Stitched preroll going on into a midroll | 1 (plus the 23:28 test run) | `/channel-a` |

What happened on the player after each stitched break (ad overlay and video progress in the window of the break plus about 1 minute; page monitor):

| Purple | Breaks | Ad titles | What Purple did | Ad overlay | Video not progressing | After the break |
| --- | --- | --- | --- | --- | --- | --- |
| off (`rec-c`) | 2 | `Amazon\|`, a 10-digit number | - | 15 and 20 s | 2 and 3 s | playing, no overlay |
| on, not detected | 2 | a 10-digit number only | nothing (no `adDetected`; 38 and 40 polls with ad segments reached the player) | 20 s each | 0 s | playing, no overlay |
| on, detected | 7 | `Amazon\|` (one also `FT\|`) | backups on most polls (`site` mostly); 8 to 25 delivered polls were backups announcing their own break | 91 to 164 s | 34 to 161 s | overlay on in all 7; paused in 4 |

- On `/channel-a` the same two midrolls (00:23 and 00:37) were watched without Purple (`rec-c`) and with it (`ext-b`): overlay 15 and 20 s without, 108 and 163 s with; video not progressing 3 and 2 s without, 121 and 161 s with.
- On `/channel-c` (`ext-a`) the ad overlay stayed on from the first handled midroll (01:35) to the end of the session, 55 minutes, while the video kept progressing; it covered the next two midrolls too.
- `ext-b`'s third load on `/channel-a` (00:46 to 02:30, 104 min) had no stitched break and no ad overlay: 24 `twitch-maf-ad` slots, each answered in the page (`csaiBlocked`).

### `twitch-maf-ad` breaks

Every load watched for more than 3 minutes got them, on every channel and in both modes (115 slots in 19 loads on 5 channels).

- The main playlist keeps its live segments (14 × `live`, 2 prefetch lines, no `DISCONTINUITY`, no `twitch-stitched-ad`) and gets one `DATERANGE` `CLASS="twitch-maf-ad"`: `PLANNED-DURATION=60.000`, `END-ON-NEXT=YES`, `X-TTV-MAF-AD-PRIMARY-POD="6"`, `X-TTV-MAF-AD-FALLBACK-FORMATS="5,3,4"`, `X-TTV-MAF-AD-SDA-SEQUENCE-LENGTH="4"`, `X-TTV-MAF-AD-DECISION` (one base64 value in every break; Inferred: a protobuf holding 5, 3, 4 and 6), plus `X-TTV-MAF-AD-AD-SESSION-ID`, `-COMMERCIAL-ID`, `-RADS-TOKEN` (values not recorded). No `ROLL-TYPE`.
- It is first written between the two `EXT-X-TWITCH-PREFETCH` lines with a `START-DATE` about 1.5 s ahead of the poll, moves up the playlist with its segment, then stays above the first segment; it is in the playlist for 92 s (Inferred: until `START-DATE` + 60 s leaves the 28 s the playlist spans).
- Timing: the first one 2.1 to 2.9 min after the channel loaded; then one every 4 or 5 min (94 gaps of 3.9 to 5.0 min; 2 gaps of 9.1 and 10.0 min on `/channel-c`). Channels and sessions got them at different wall-clock times, each counted from its own load.
- Without Purple, the page requested `edge.ads.twitch.tv/ads` with `bp=midroll` after each one: up to 4 requests, at about 3 to 5 s and 19 to 21 s after the first marked poll; the requests stopped after an answer with an ad. Answers: 204 (no ad) 33 times, 200 8 times, and 16 requests without a recorded status (resource timing before 23:51). After a VAST answer (2 inline ads, ad system `Amazon`, 20 s and 15 s, 90 `video/mp4` media files), a third `<video>` appeared 1 s later and two videos played for 35 s; the first video kept progressing and no ad overlay, `data-a-target` ad element or player error appeared. After a JSON answer (an HTML display creative), nothing changed in what the monitor reads.
- With Purple: the `twitch-maf-ad` polls reached the player untouched (Purple's detector classes them `MARKED_LIVE`); no request to `edge.ads.twitch.tv` left the page; Purple counted one `csaiBlocked` event per slot; no extra `<video>` played.

### A midroll stitched into the main playlist, with Purple on

23:42:29, `/channel-a`, extension mode (`run3-ext-a`), 10 s after the channel loaded. `ROLL-TYPE` `MIDROLL`, `POD-LENGTH` 3, `POD-FILLED-DURATION` 65; ads of 15.217 s, 30.239 s and 20.255 s (`POD-POSITION` 0, 1, 2).

Main playlist, poll by poll (polls about 1 to 2 s apart):

| Time from the first marked poll | `MEDIA-SEQUENCE` | Segments | Ad segments (titles, in order) | `DISCONTINUITY` | `EXT-X-MAP` | `EXT-X-TWITCH-PREFETCH` |
| --- | --- | --- | --- | --- | --- | --- |
| -5 to -2 s | 57136 to 57138 | 14 | 0 | 0 | not recorded | 2 |
| 0 to 1.4 s | 57138, 57139 | 14 | 0. After the 14 live segments and the 2 prefetch lines: `twitch-stitched-ad`, `twitch-stream-source` (`Amazon\|…`) and `twitch-ad-quartile` `DATERANGE` with a `START-DATE` 1.3 s ahead, `EXT-X-DISCONTINUITY`, the ad's `EXT-X-MAP`, a third `EXT-X-TWITCH-PREFETCH` | 1 | 1 + 1 at the end | 3 |
| 3.4 s | 57140 | 17 | 3 (`Amazon\|`) appended after 14 live | 1 | 2 | 0 |
| 3.4 to 29.8 s | 57140 to 57154, +1 per new segment | 16 to 17 | 3 to 17: live segments leave from the top, ad segments are appended (`Amazon\|` ×8, then `FT\|`) | 1 to 2 | 2 to 3 | 0 |
| 29.8 to 65.8 s | 57154 (frozen) | 17 to 35 | 17 to 35: the playlist grows by one ad segment per new segment, nothing leaves | 2 to 3 | 2 to 3 | 0 |
| 65.8 to 97.7 s | 57154 (frozen) | 35 to 50 | 35 (`Amazon\|` ×8, `FT\|` ×16, `Amazon\|` ×11), then live segments appended | 4 | 4 | 2 |
| 98.7 s | 57190 | 15 | 0 | 0 | 1 | 2 |

- `twitch-stream-source` `DATERANGE` values follow the segments: `live`, `Amazon|<id>`, `FT|<id>`.
- The break lasted 98.7 s in the main playlist; the pod was 65.7 s of ads; `MEDIA-SEQUENCE` jumped from 57154 to 57190 (36) when the break left the playlist.

Backup playlists requested by Purple during the break (94 polls): 22 had ad segments, 20 were live segments with the announcement of their own break at the end (as in the 0 to 1.4 s row above), 52 were live without markers. Each backup token got its own pod: `POD-LENGTH` 4 with `POD-FILLED-DURATION` 120, 3 with 90, 2 with 60. Token requests: `site` 14, `popout` 7, `frontpage` 4, `picture-by-picture`, `embed`, `mobile_web`, `autoplay` 1 each.

What Purple did, from its debug events, console lines and the playlists it delivered (83 polls between 5 s before the break and 5 s after it):

- The 2 announcement polls (0 and 1.4 s) went to the player untouched (T-202: markers over live segments).
- The first poll with ad segments (3.4 s, 3 `Amazon|` segments) went to the player as Twitch sent it; from the next poll on, Purple delivered a backup on every poll: 60 polls live without markers, 22 polls live with a backup's own break announcement (`twitch-stitched-ad` `DATERANGE`, `DISCONTINUITY`, ad `EXT-X-MAP`, third prefetch line).
- Events: `adDetected` 73, `backupUsed` 72 (`site` 59, `popout` 7, `frontpage` 3, `picture-by-picture` 3). Console: `site` "Free Stream" 59 and "Ads found" 13, `popout` 7 and 6, `frontpage` 3 and 3, `picture-by-picture` 3 and 0 ("Free Stream" includes playlists with the announcement only).
- Page: the video paused 3.6 s after the first marked poll, restarted from `currentTime` 0 and played about 6 s (the 3 leaked ad segments); the ad overlay (`video-ad-label`, `video-ad-countdown`, `ad-banner-default-text`) appeared at 10 s; at 17.7 s the video moved to the live position and paused. It stayed paused, with the ad overlay on, until the session was restarted 8 min later; the player kept polling the playlist the whole time.
- Inferred, not checked: the stall comes from the announcements Purple delivered (a prefetch line and an `EXT-X-MAP` for an ad segment that never arrives, a new one in some polls and none in the next). Who sent the final pause (the player, or Purple's pause/play messages) was not recorded in that run; the worker messages are drained from 23:51 on.

### Prerolls

23:28, `/channel-a`, extension mode, the tool's first test run (`soak-test`): the load opened inside a preroll.

- Its own playlist: `MEDIA-SEQUENCE` 0 in every poll, 3 segments growing by one per poll up to 42 (nothing left the playlist), `TARGETDURATION` 5. First a `PREROLL` ad (`POD-LENGTH` 1, `DURATION` 30.239, 15 segments of 2.002 s) whose segments were titled `FT|<n>-<n>-<n>`, with the same value in `X-TV-TWITCH-STREAM-SOURCE`, in fMP4 (`EXT-X-MAP`) behind one `DISCONTINUITY`; from about 26 s a `MIDROLL` ad appended to it, segments titled with a 10-digit number; from about 50 s live segments appended, with 2 `EXT-X-TWITCH-PREFETCH` back. At 78.8 s the player's playlist was the live one (`MEDIA-SEQUENCE` 28, 15 segments).
- Purple: none of these titles holds `stitched`, `Amazon` or `DCM,`, so the detector classed the playlist `MARKED_LIVE` (the `twitch-stitched-ad` `DATERANGE`) and returned it untouched (T-202). No backup was requested, no `adDetected` event; all 51 marked polls reached the player with their ad segments; the ad overlay was on for 50 s.

Record mode: the page's own player requested a `picture-by-picture` master, outside any break of the main playlist, 15 times: 10 on `/channel-a`, every 13.7 to 13.8 min from 00:23:37 to 02:27:23 (the stitched midrolls of 00:23:44 and 00:37:30 came 7 s after the first two), and 5 on `/channel-n` (8.6 to 8.7 min apart within one load). Each time it polled 2 media playlists once, both inside a preroll (`MEDIA-SEQUENCE` 0, 4 segments titled `Amazon|…`), and stopped; a second `<video>` with a `pbyp` class appeared and played for about 1 s.

### Edge reassignment marker

`DATERANGE` `CLASS="twitch-assignment"` with `X-TV-TWITCH-CLUSTER`, `X-TV-TWITCH-NODE`, `X-TV-TWITCH-SERVING-ID` (plus `ID`, `START-DATE`, `END-ON-NEXT`) appeared on live playlists with no ad segment and no ad attribute. It was in 12 409 main-playlist polls of 11 of the 20 loads. Purple's detector does not treat it as an ad marker.

## Still open

- Why the player keeps the ad overlay on and pauses after Purple handles a stitched midroll: the backups it delivers announce their own break (B-034, B-036), the media sequence went back in some polls, and Purple's pause/play (E6) runs at the edges; which of these does it is not isolated (T-204, T-601).
- Ad segments titled only with a number or `FT|…` are not detected (B-035): 2 midrolls and the 23:28 preroll reached the player whole (T-203).
- The meaning of the `twitch-maf-ad` values (Q-015); how a channel's stitched midrolls are scheduled, and the page's `picture-by-picture` requests before them (Q-016, Q-017).
- What the page does with a VAST answer from `edge.ads.twitch.tv` beyond the second `<video>` (record mode).
- Logged-in viewers: everything here is logged out.
