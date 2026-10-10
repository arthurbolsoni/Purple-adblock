# Midroll soak on the 2026-10-08 builds

Date: 2026-10-08, 03:20 to 07:17 (soaks a and b to 05:16, soak c from 05:17 to 07:17). Tasks checked: T-203, T-204, T-406, T-502, T-401 (soak b); every task of the night up to T-501 (soak c). Logged out, fresh temporary profiles, `e2e/soak.py` as on [2026-10-07](2026-10-07-midroll-soak.md).

## Sessions

| Soak | Build | Session | Mode | Channel | Watched |
| --- | --- | --- | --- | --- | --- |
| a | T-203 + T-204 (`1385175`) | `ext-a` | extension, `debug` | `/channel-a`, then `/channel-j` | 54 min |
| a | | `ext-b` | extension, `debug` | `/channel-c`, then `/channel-b` | 54 min |
| a | | `rec-c` | record (Purple off) | `/channel-a` | 54 min |
| b | up to the announced-prefetch fix (`2105539`) | `ext-a` | extension, `debug` | `/channel-a` | 56 min |
| b | | `ext-b` | extension, `debug` | `/channel-b` | 55 min |
| b | | `rec-c` | record | `/channel-a` | 55 min |
| c | up to T-501 (`912728c`) | `ext-a` | extension, `debug` | `/channel-a` | 120 min |
| c | | `ext-b` | extension, `debug` | `/channel-b` | 120 min |
| c | | `rec-c` | record | `/channel-a` | 120 min |

Soak a was stopped after 55 minutes to start soak b on a newer build, and soak b after 56 minutes for soak c, which ran its 120 minutes. Recordings: `~/purple-recordings/2026-10-08-soak-a`, `-soak-b`, `-soak-c` (outside the repo). Report: `python e2e/soak_report.py <folder>`; event totals, masters, page GQL, pause/play at the break edges and prefetch requests: `python docs/findings/probes/soak_details_probe.py <folder>...` ([probe](probes/soak_details_probe.py)).

## Stitched midrolls with Purple on

| Soak | Channel | Start | Length | Ad segments (max), titles | Backup polls: with ads / announcing / clean | To the player | Ad overlay | Video not progressing |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a | `/channel-a` | 04:02:35 | 216 s | 35, `Amazon\|` | 22 / 24 / 74 | 80 clean, 35 MAF, 1 announcement, 1 with ad segments; one merge (15 segments replaced) | 0 s | 7 s |
| b | `/channel-b` | 04:32:59 | 95 s | 11, a 10-digit number | 0 / 12 / 27 | 32 clean, 20 MAF, 2 announcement; 2 announced prefetch URIs removed | 0 s | 3 s |
| b | `/channel-a` | 04:44:59 | 136 s | 35, `Amazon\|` | 0 / 24 / 59 | 65 clean, 11 MAF, 2 announcement; 2 announced prefetch URIs removed | 0 s | 4 s |
| b | `/channel-b` | 04:56:55 | 54 s | 11, a 10-digit number | 0 / 12 / 26 | 31 clean, 3 announcement; 1 announced prefetch URI removed | 0 s | 4 s |
| b | `/channel-b` | 05:12:59 | 110 s | 40, `Amazon\|` and `InnovidAds\|` | 0 / 25 / 54 | 59 clean, 3 announcement; 1 announced prefetch URI removed | 0 s | 3 s |
| c | `/channel-a` | 05:26:15 | 65 s | 16, a 10-digit number | 0 / 12 / 32 | 37 clean, 2 announcement; 2 announced prefetch URIs removed | 0 s | 3 s |
| c | `/channel-b` | 05:52:57 | 85 s | 27, `Amazon\|` | 0 / 19 / 42 | 47 clean, 2 announcement; 2 announced prefetch URIs removed | 0 s | 3 s |
| c | `/channel-b` | 06:32:58 | 81 s | 24, `Amazon\|` and `InnovidAds\|` | 0 / 17 / 40 | 45 clean, 2 announcement; 1 announced prefetch URI removed | 0 s | 3 s |

After each of the eight breaks the video was playing and the ad overlay was off. "Announcing" counts the backups skipped by T-204; "announcement" counts the main playlist's own announced polls, which go to the player as `MARKED_LIVE` without the prefetch lines after the announcement (T-502). The player requested none of the removed URIs.

- On 2026-10-07, with the build of that day, the 7 handled stitched breaks left the ad overlay on for 91 to 164 s and the video not progressing for 34 to 161 s; the overlay stayed on after all 7, and the video was paused after 4.
- The two numeric-title midrolls on `/channel-b` were not detected on 2026-10-07 and played whole; here T-203 detected them and backups replaced every poll.
- The one poll with ad segments that reached the player in soak a was the first poll of the break, before any backup token was ready; T-502 (blank segments) was not in that build.
- Soak a's build still passed the announced prefetch lines to the player (32 URIs on `ext-a`); the player requested none of them. In the L3-02 run on the T-401 build it fetched 2 ([blank segments](2026-10-08-blank-segments.md#the-announced-breaks-prefetch-lines)).
- Backups used, from the `backupUsed` events of the extension sessions: soak a `site` 48, `popout` 15, `frontpage` 6, `picture-by-picture` 5; soak b `site` 59, `popout` 44, `frontpage` 41, `picture-by-picture` 22; soak c `site` 31, `popout` 30, `frontpage` 17, `picture-by-picture` 36.
- Soak c had no `segmentsReplaced` event: every poll inside a break got a whole clean backup, so the merge (T-501) did not run.
- Soak c backups of the five-variant types came at 720p60 on all 78 polls; `picture-by-picture` came at 360p30 or 360p on 36 (its master lists 360p and 160p only, B-041). The soak logs do not record the main player's variant.
- Soak c: the 45 backup tokens went through the page (T-402) with the page's 7 GQL header names, all answered 200 without GQL errors. The 45 backup usher requests carried the page's 22 query keys (T-404; 9 keys in soaks a and b). No usher request had `parent_domains`, and the page's own token was `popout` (T-408).

## Video at the break edges

Each break with Purple on has a pause at its start and one at its end:

| Soak | Session | Break | Pause at the start | Pause at the end |
| --- | --- | --- | --- | --- |
| c | `ext-a` | 05:26:15 | 1.65 s | 1.73 s |
| c | `ext-b` | 05:52:57 | 1.62 s | 1.67 s |
| c | `ext-b` | 06:32:58 | 1.62 s | 1.69 s |

Each pause is Purple's pause/play (E6, `pauseAndPlay`): the worker posts `pause`, then `play` 1.5 s later. The `<video>` fires `pause` 4 to 40 ms after the message and `playing` 1.62 to 1.73 s after its `pause`, at `currentTime` 0: the player restarts its timeline at each edge. The two pauses add up to 3.3 to 3.4 s per break, against the 3.0 to 3.1 s the report counts as not progressing. Soaks a and b show the same pause/play at their break edges (1.62 to 2.62 s each).

With Purple off, the same midroll on `rec-c` had no pause: the `<video>` waited 3.0 s (`waiting` at 539.9 s, `playing` at 540.2 s) and kept its timeline.

Outside breaks, `ext-a` paused twice without a message from the worker (05:56:42 for 1.2 s, 06:12:56 for 2.4 s); `rec-c`, on the same channel with Purple off, paused at 06:12:56 for 1.1 s.

## The same midroll with Purple off

The record session watched `/channel-a` with Purple off. One midroll per soak was on screen in both sessions:

| Soak | Midroll | Purple off (`rec-c`) | Purple on (`ext-a`) |
| --- | --- | --- | --- |
| a | 04:02 to 04:06 | ad overlay 9 s in the report's window (the record session's break detection saw one poll) | 0 s |
| b | 04:44 to 04:47 | ad overlay 81 s, the ad countdown on screen | 0 s |
| c | 05:26 to 05:27 | ad overlay 31 s, the ad countdown on screen | 0 s |

## The picture-by-picture player

The page requested a `picture-by-picture` master every 13.7 to 13.8 minutes on `/channel-a` and every 8.0 minutes on `/channel-b` (B-037). Purple keeps it for the backups and answers the page's request with an empty body (E10, `onChannelPicture`). The picture-by-picture player then logs `Player stopping playback - error MasterPlaylist:4 (ErrorInvalidData code 0 - Response body is not a valid M3U8.)` once per request: 9 and 15 times in soak c, 4 and 6 in soak a, 4 and 7 in soak b. The main `<video>` did not pause at those times.

Each stitched midroll came a few seconds after one of those requests. The probe takes the page's requests (17 query keys; Purple's own `picture-by-picture` backups send 22, or 9 before T-404) and the first poll of each stitched break on the main playlist, leaving out prerolls in the first 30 s of a load:

| Soaks | Breaks | Seconds from the request to the break | Requests | Followed by a break |
| --- | --- | --- | --- | --- |
| 2026-10-08 a, b, c (Purple on) | 8 | 4.6 to 9.0 | 45 | 8 |
| 2026-10-08 a, b, c (Purple off) | 3 | 3.1 to 8.6 | 17 | 3 |
| [2026-10-07](2026-10-07-midroll-soak.md) (Purple on and off) | 8 | 3.6 to 10.8 | 46 | 8 |

Every break the probe found had a request before it; 89 of the 108 requests had no break after them.

## Server behavior

- A fourth ad title format: `InnovidAds|…`, in a 40-segment midroll on `/channel-b` together with `Amazon|` segments (soak b), and again in a 24-segment one on the same channel (soak c) (B-035).
- `twitch-maf-ad` slots every 4 to 5 minutes on every channel: 21 (soak a), 22 (soak b) and 27 per session (soak c) on the extension sessions, with 22, 16 and 54 `edge.ads.twitch.tv` requests answered in the page (`csaiBlocked`); the record session's page asked `edge.ads.twitch.tv` about 4 times per slot (B-032, B-033).
- `twitch-assignment` in 2627 (soak a) and 3574 (soak b) main polls; in soak c in 3464 of 3737 (`ext-a`), 3375 of 3799 (`ext-b`) and 3514 of 3740 (`rec-c`) media playlist responses (B-038).
- Backup polls during stitched midrolls: with the page's GQL headers on the backup tokens (T-401, soaks b and c), 0 of 401 polls in 7 breaks had ad segments, 121 announced their own break and 280 were clean; without them (soak a), 22 of 120 in one break had ad segments (B-036).
- The five-variant master lists its variants in an order that changes from one response to the next: 14 orders in 15 masters on `ext-a` and 5 in 28 on `ext-b` (soak c), 26 in 49 on `ext-a` (soak a). The first variant was 1080p60, 720p60, 480p, 360p or 160p; the page's own master started with 720p60 in one record session and 1080p60 in two. `picture-by-picture` masters list 360p and 160p in either order (B-043).
- The page's `picture-by-picture` master request comes every 13.7 to 13.8 minutes on `/channel-a` and every 8.0 minutes on `/channel-b`, with Purple on as with Purple off (B-037).
- A stitched midroll starts 3 to 11 s after one of those requests: 19 breaks in the soaks of 2026-10-07 and 2026-10-08, each with a request before it; 89 of the 108 requests had no break after them (B-044).

## Open

- The video stops for 3 to 4 s in each handled break, the length of the two E6 pauses at its edges; how the edges are handled is T-601's subject (state machine, optional reload).
- The merge with tolerance and the `EXT-X-MAP` switch (T-501) did not run in soak c: every poll in a break had a clean backup.
- The main player's variant is not in the soak logs; T-407's choice is checked only through the backups' quality.
- Getting backup tokens when the page requests a `picture-by-picture` master, a few seconds before a possible midroll (B-044), is not tried.
