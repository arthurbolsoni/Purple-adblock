# Backup tokens at the page's picture-by-picture request (T-409, T-410)

Date: 2026-10-08, 15:15 to 17:38 (soak e). Build: F-19 (`prewarmBackups`, `a23a025`), before T-410. Logged out, extension with `debug`, fresh profiles, `e2e/soak.py` with `--setting prewarmBackups=<true|false>`:

- `ext-a`: `/channel-a`, on, 120 min;
- `ext-c`: the same channel, off, 120 min;
- `ext-b`: on, 80 min on `/channel-b`, which was offline (below); stopped at 16:36;
- `ext-b2`: on, 16:37 to 17:38 (`--stop-after-breaks 3`, 60 min); it left `/channel-b` after 3.5 min with no live media playlist and watched `/channel-d`. The time limit came during its third midroll.

Soak f (T-410) is [below](#soak-f). Baseline without F-19: soak d of the same day ([pause length](2026-10-08-pause-length.md#soak-d)). Recordings: `~/purple-recordings/2026-10-08-soak-e` and `~/purple-recordings/2026-10-08-soak-d` (outside the repo). Probe: [`prewarm_probe.py`](probes/prewarm_probe.py).

## Picture-by-picture requests

| Session | Channel | Requests | Interval | Stitched midrolls after one |
| --- | --- | --- | --- | --- |
| `ext-a` | `/channel-a` | 9, from 15:29:22 to 17:05:37 | 13 min 45 s | 15:29:31, 8.7 s after the first |
| `ext-c` | `/channel-a` | 9, each 1 to 2 s before `ext-a`'s | the same | 15:29:29, 8.1 s after the first |
| `ext-b2` | `/channel-d` | 9, from 16:47:43 to 17:37:54 | 10 min | 17:17:48, 17:27:48 and 17:37:52, 5.2, 5.6 and 8.5 s after a request |

A second request came 8 to 11 s after each of the 5 requests a midroll followed, and after none of the others. In soak d no request had a second one. It came 0.2 to 0.4 s after Purple's pause/play reached the picture-by-picture player ([C-13](2026-10-08-pbyp-player-pause.md)).

F-19 ran at most once a minute: 8 times in `ext-a` and 6 in `ext-b2`, 7 token requests each (`site`, `popout`, `frontpage`, `picture-by-picture`, `mobile_web`, `embed`, `autoplay`). 4 of those 14 prewarms had a midroll after them.

## Midroll starts

Seconds are counted from the break's first poll. "Announced" counts the backup playlists with a break of their own announced at the end (B-034). "With ad segments" counts the backup playlists that had ad segments.

| Soak | Session | F-19 | Midroll | First backup | Blank segments | Tokens 30 s before / during | Backup playlists: announced / with ad segments |
| --- | --- | --- | --- | --- | --- | --- | --- |
| e | `ext-a` | 8.7 s before | 15:29:31, `/channel-a`, the session's second break | `site` 720p60, 2.3 s | 1 | 7 / 14 | 14 / 0 |
| e | `ext-c` | off | 15:29:29, the same midroll | `frontpage` 720p60, 1.8 s | 1 | 0 / 14 | 16 / 0 |
| e | `ext-b2` | 5.2 s before | 17:17:48, `/channel-d`, the first on the channel | `site` 720p60, 3.4 s | 2 | 7 / 11 | 12 / 0 |
| e | `ext-b2` | 5.6 s before | 17:27:48 | `site` 720p60, 2.4 s | 1 | 7 / 11 | 12 / 0 |
| e | `ext-b2` | 8.5 s before | 17:37:52, 10 s recorded | `picture-by-picture` 360p, 2.4 s | 1 | 7 / 1 | 2 / 0 |
| d | `ext-a` | - | 10:56:15, `/channel-a`, the first on the channel | `picture-by-picture` 360p30, 2.2 s | 2 | 0 / 16 | 20 / 0 |
| d | `ext-c` | - | 10:56:13, the same midroll | `picture-by-picture` 360p30, 2.1 s | 2 | 0 / 17 | 21 / 0 |
| d | `ext-b` | - | 09:36:58, `/channel-b`, the first on the channel | `picture-by-picture` 360p, 2.5 s | 2 | 0 / 24 | 24 / 0 |
| d | `ext-b` | - | 09:45:01 | `site` 720p60, 1.2 s | 1 | 0 / 25 | 25 / 0 |
| d | `ext-b` | - | 10:33:00 | `site` 480p, 2.3 s | 1 | 0 / 9 | 14 / 0 |
| d | `ext-b` | - | 10:49:00 | `picture-by-picture` 360p, 2.6 s | 1 | 0 / 10 | 14 / 0 |
| d | `ext-b` | - | 11:05:00 | `site` 480p, 2.3 s | 1 | 0 / 12 | 12 / 0 |

The midroll at 15:15:45 in soak e came 12 s after `ext-a`'s page opened, and `ext-c`, whose page opened at 15:15:53, got it at its first polls (15:15:58). It had no picture-by-picture request before it and no F-19. Their first backup was `site` 160p30 after 3.3 s with 6 blank segments, and `site` 720p60 after 4.3 s with 3 blank segments.

### First polls of a midroll

All 14 stitched breaks in soaks d and e began with 1 to 3 main polls that only announced the break (B-034): the `twitch-stitched-ad` ranges and prefetch lines to the ad's first segments, with no ad segment. Purple answers those prefetch URIs with the blank segment (F-14) and looks for no backup at those polls. The first backup comes at the first poll with ad segments. In the 12 midrolls with a picture-by-picture request before them, the blank segments were only the 1 or 2 announced prefetch URIs, with F-19 and without it.

### First backup

Purple tries the pinned type first (F-10), the last one that gave a clean backup.

At a channel's first midroll there is no pinned type. Without F-19, the only backup with a master is the page's `picture-by-picture` one, stored by E10, so Purple plays that 360p master and pins it. Both 10:56 breaks in soak d ran on `picture-by-picture` for their first 20 s; the 09:36:58 break moved to `site` within them. With F-19, the 17:17:48 break started on `site` 720p60.

At later midrolls every type still had a master from the previous break, and the first poll with ad segments got a backup, with F-19 and without it. Its type was the one pinned at the end of the previous break. The 17:27 break ended on `picture-by-picture` after `site`, `popout` and `frontpage` announced breaks of their own. The 17:37:52 break then started on the 360p `picture-by-picture` master, with tokens prewarmed 8.5 s before, and moved to `site` 720p60 after 5 s.

### Tokens asked before the break

The tokens F-19 asked 4.6 to 13.4 s before a midroll behaved like those asked during the break (B-036): the first backup from them gave way to another type 3.3 to 5.8 s after it started (soak e, 4 breaks; 2.7 to 5.6 s in the 6 of soak f). No backup playlist had ad segments. The recordings keep the hosts of a master's variants, not their URLs, so a backup playlist with a break announced cannot be traced to a token asked before or during the break.

### Soak e result

`prewarmBackups` stayed off after soak e.

With it on:
- the blank segments, the time to the first backup and the token requests during the break matched the same midroll with it off;
- the first backup differed only at a channel's first midroll: `site` 720p60 in 1 break, against the `picture-by-picture` 360p master in 3 breaks without F-19;
- F-19 asked 7 tokens at 14 page requests, and 4 of them had a midroll after them.

## Soak f

Date: 2026-10-08, 17:42 to 18:33. Build: T-410 (`3b47008`): F-19 asks tokens only for the backup types with no stored master. Logged out, extension with `debug`, fresh profiles, `e2e/soak.py --leave-after-breaks 1 --rotate 30`, so each session moved to another channel after each stitched break:

- `ext-a`, then `ext-a2`: on, 1 and 3 stitched breaks;
- `ext-c`, then `ext-c2`: on, 2 and 3 stitched breaks;
- `ext-b`, then `ext-b2`: off, 0 and 3 stitched breaks; `ext-b2` was stopped at 18:33.

The first sessions were restarted at 17:48: `soak.py` had not counted a stitched midroll that started inside a `twitch-maf-ad` slot (`ac51fff`).

### A channel's first midroll

Every midroll below is the first break of a channel load and came after a picture-by-picture request. "After the request" counts the seconds from that request to the break's first poll. The first backup's seconds count from the break's first poll, and every break had 2 blank segments, the two announced prefetch URIs. "Tokens" are the token requests in the 30 s before the break and during it.

| Soak | Session | F-19 | Channel | Midroll | After the request | First backup | Tokens before / during |
| --- | --- | --- | --- | --- | --- | --- | --- |
| e | `ext-b2` | on | `/channel-d` | 17:17:48 | 5.2 s | `site` 720p60, 3.4 s | 7 / 11 |
| f | `ext-a` | on | `/channel-ac` | 17:44:47 | 4.6 s | `site` 720p, 3.6 s | 6 / 16 |
| f | `ext-c` | on | `/channel-l` | 17:45:42 | 13.4 s | `site` 720p60, 4.4 s | 6 / 17 |
| f | `ext-c2` | on | `/channel-t` | 18:04:17 | 3.4 s | `site` 720p, 2.4 s | 0 / 12 |
| f | `ext-c2` | on | `/channel-g` | 18:14:50 | 7.8 s | `site` 720p60, 2.6 s | 6 / 12 |
| f | `ext-a2` | on | `/channel-p` | 18:19:05 | 4.7 s | `site` 720p60, 2.2 s | 6 / 10 |
| f | `ext-c2` | on | `/channel-o` | 18:19:07 | 9.6 s | `site` 720p, 2.3 s | 6 / 12 |
| f | `ext-a2` | on | `/channel-af` | 18:29:23 | 10.6 s | `site` 720p, 2.4 s | 6 / 13 |
| d | `ext-a` | off | `/channel-a` | 10:56:15 | 7.6 s | `picture-by-picture` 360p30, 2.2 s | 0 / 16 |
| d | `ext-c` | off | `/channel-a` | 10:56:13 | 4.6 s | `picture-by-picture` 360p30, 2.1 s | 0 / 17 |
| d | `ext-b` | off | `/channel-b` | 09:36:58 | 8.5 s | `picture-by-picture` 360p, 2.5 s | 0 / 24 |
| f | `ext-b2` | off | `/channel-d` | 17:57:48 | 5.9 s | `picture-by-picture` 360p, 2.4 s | 0 / 12 |
| f | `ext-b2` | off | `/channel-o` | 18:09:03 | 5.0 s | `picture-by-picture` 360p, 2.4 s | 0 / 27 |
| f | `ext-b2` | off | `/channel-h` | 18:12:48 | 5.3 s | `picture-by-picture` 360p, 2.3 s | 0 / 20 |

In soak f, F-19 asked 6 tokens once per channel load (every backup type but `picture-by-picture`, whose master E10 had stored), at the load's first picture-by-picture request. On `/channel-t` that request, at 17:56:14, had no midroll after it, and the next one, at 18:04:14, found every type stored and asked none. Without F-19, Purple asked the same types at the first poll with ad segments, and played the stored `picture-by-picture` master in the meantime. In the 20 s after the start, both moved on between `site`, `popout` and `frontpage` as those announced breaks of their own; no backup playlist had ad segments.

Two breaks came in the first seconds of a load and had no request before them: `/channel-f` 17:47:52, already running when the page opened 6 s before, and `/channel-k` 18:30:38, a midroll announced 5 s after the page opened. Their first backup was `site` 720p after 2.4 s with 3 blank segments, and `site` 160p after 3.4 s with 6. On `/channel-f` the 5 backup playlists with a break had ad segments, as in the prerolls of 2026-10-07 ([backups](2026-10-07-backups-and-rewritten-playlists.md)).

Soak f had 26 picture-by-picture requests, 10 with a midroll after them, 3.4 to 13.4 s later (B-044).

## Default

`prewarmBackups` is on since T-410. At a channel's first midroll after a picture-by-picture request, the first backup was `site` 720p with it (8 of 8, soaks e and f) and the 360p `picture-by-picture` master without it (6 of 6, soaks d and f). The blank segments were the same. The time to the first backup was 2.2 to 4.4 s with it and 2.1 to 2.5 s without. The token requests from 30 s before the break to its end were 12 to 23 with it and 12 to 27 without.

## Offline channel

`/channel-b` was offline when `ext-b` opened it at 15:16:

1. Usher answered the channel request with 404.
2. The page then requested `usher.ttvnw.net/vod/v2/<id>.m3u8`. Its media playlists are `d1m7jfoe9zdc1j.cloudfront.net/<id>/<quality>/index-dvr.m3u8`, with 5197 segments.
3. The player played that recorded video for 80 min.

The player's `edge.ads.twitch.tv` requests were a `preroll` at the load, then a `midroll` every 10 min (7 in 80 min). Purple answered them (F-04).

The worker made no media playlist request after 15:16:19, so the soak saw no break. `soak.py` now leaves such a channel after 3 min (`66114e4`); `ext-b2` left it at 16:41.

## Open

- The pinned type at a break's end could be the 360p `picture-by-picture` master, and the next midroll started on it: `picture-by-picture` is no longer pinned (T-802, [backup quality](2026-10-08-backup-quality-at-break-start.md)).
- Logged in, and on channels outside the Brazilian directory.
