# Midroll soak on the 2026-10-08 builds

Date: 2026-10-08, 03:20 to 05:16 (soaks a and b); soak c from 05:17. Tasks checked: T-203, T-204, T-406, T-502, T-401 (soak b); every task of the night (soak c). Logged out, fresh temporary profiles, `e2e/soak.py` as on [2026-10-07](2026-10-07-midroll-soak.md).

## Sessions

| Soak | Build | Session | Mode | Channel | Watched |
| --- | --- | --- | --- | --- | --- |
| a | T-203 + T-204 (`1385175`) | `ext-a` | extension, `debug` | `/channel-a`, then `/channel-j` | 54 min |
| a | | `ext-b` | extension, `debug` | `/channel-c`, then `/channel-b` | 54 min |
| a | | `rec-c` | record (Purple off) | `/channel-a` | 54 min |
| b | up to the announced-prefetch fix (`2105539`) | `ext-a` | extension, `debug` | `/channel-a` | 56 min |
| b | | `ext-b` | extension, `debug` | `/channel-b` | 55 min |
| b | | `rec-c` | record | `/channel-a` | 55 min |

Soak a was stopped after 55 minutes to start soak b on a newer build, and soak b after 56 minutes for soak c. Recordings: `~/purple-recordings/2026-10-08-soak-a`, `-soak-b` (outside the repo). Report: `python e2e/soak_report.py <folder>`.

## Stitched midrolls with Purple on

| Soak | Channel | Start | Length | Ad segments (max), titles | Backup polls: with ads / announcing / clean | To the player | Ad overlay | Video not progressing |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a | `/channel-a` | 04:02:35 | 216 s | 35, `Amazon\|` | 22 / 24 / 74 | 80 clean, 35 MAF, 1 announcement, 1 with ad segments; one merge (15 segments replaced) | 0 s | 7 s |
| b | `/channel-b` | 04:32:59 | 95 s | 11, a 10-digit number | 0 / 12 / 27 | 32 clean, 20 MAF, 2 announcement; 2 prefetch URIs answered blank | 0 s | 3 s |
| b | `/channel-a` | 04:44:59 | 136 s | 35, `Amazon\|` | 0 / 24 / 59 | 65 clean, 11 MAF, 2 announcement; 2 prefetch URIs answered blank | 0 s | 4 s |
| b | `/channel-b` | 04:56:55 | 54 s | 11, a 10-digit number | 0 / 12 / 26 | 31 clean, 3 announcement; 1 prefetch URI answered blank | 0 s | 4 s |
| b | `/channel-b` | 05:12:59 | 110 s | 40, `Amazon\|` and `InnovidAds\|` | 0 / 25 / 54 | 59 clean, 3 announcement; 1 prefetch URI answered blank | 0 s | 3 s |

After each of the five breaks the video was playing and the ad overlay was off. "Announcing" counts the backups skipped by T-204; "announcement" counts the main playlist's own announced polls, which go to the player as `MARKED_LIVE` without the prefetch lines to ad segments (T-502).

- On 2026-10-07, with the build of that day, the 7 handled stitched breaks left the ad overlay on for 91 to 164 s and the video not progressing for 34 to 161 s; the overlay stayed on after all 7, and the video was paused after 4.
- The two numeric-title midrolls on `/channel-b` were not detected on 2026-10-07 and played whole; here T-203 detected them and backups replaced every poll.
- The one poll with ad segments that reached the player in soak a was the first poll of the break, before any backup token was ready; T-502 (blank segments) was not in that build.
- Backups used, from the `backupUsed` events of the extension sessions: soak a `site` 48, `popout` 15, `frontpage` 6, `picture-by-picture` 5; soak b `site` 59, `popout` 44, `frontpage` 41, `picture-by-picture` 22.

## The same midroll with Purple off

The record session watched `/channel-a` with Purple off. Two midrolls were on screen in both soaks:

| Soak | Midroll | Purple off (`rec-c`) | Purple on (`ext-a`) |
| --- | --- | --- | --- |
| a | 04:02 to 04:06 | ad overlay 9 s in the report's window (the record session's break detection saw one poll) | 0 s |
| b | 04:44 to 04:47 | ad overlay 81 s, the ad countdown on screen | 0 s |

## Server behavior

- A fourth ad title format: `InnovidAds|…`, in a 40-segment midroll on `/channel-b` together with `Amazon|` segments (B-035).
- `twitch-maf-ad` slots every 4 to 5 minutes on every channel: 21 (soak a) and 22 (soak b) on the extension sessions, with 22 and 16 `edge.ads.twitch.tv` requests answered in the page (`csaiBlocked`); the record session's page asked `edge.ads.twitch.tv` about 4 times per slot (B-032, B-033).
- `twitch-assignment` in 2627 (soak a) and 3574 (soak b) main polls (B-038).

## Open

- Soak c: the build with every task of the night (pinning, page GQL, usher reuse, page token as popout, backup variant, merge with tolerance) on the same channels.
- The video stopped progressing for 3 to 7 s in each handled break; whether that is the pause/play at the edges (E6) or the switch of playlists is not isolated (T-601).
