# Backup tokens at the page's picture-by-picture request (T-409)

Date: 2026-10-08, 15:15 to 17:38 (soak e). Build: F-19 (`prewarmBackups`, `a23a025`), before T-410. Logged out, extension with `debug`, fresh profiles, `e2e/soak.py` with `--setting prewarmBackups=<true|false>`:

- `ext-a`: `/channel-a`, on, 120 min;
- `ext-c`: the same channel, off, 120 min;
- `ext-b`: on, 80 min on `/channel-b`, which was offline (below); stopped at 16:36;
- `ext-b2`: on, 16:37 to 17:38 (`--stop-after-breaks 3`, 60 min); it left `/channel-b` after 3.5 min with no live media playlist and watched `/channel-d`. The time limit came during its third midroll.

Baseline without F-19: soak d of the same day ([pause length](2026-10-08-pause-length.md#soak-d)). Recordings: `~/purple-recordings/2026-10-08-soak-e` and `~/purple-recordings/2026-10-08-soak-d` (outside the repo). Probe: [`prewarm_probe.py`](probes/prewarm_probe.py).

## Picture-by-picture requests

| Session | Channel | Requests | Interval | Stitched midrolls after one |
| --- | --- | --- | --- | --- |
| `ext-a` | `/channel-a` | 9, from 15:29:22 to 17:05:37 | 13 min 45 s | 15:29:31, 8.7 s after the first |
| `ext-c` | `/channel-a` | 9, each 1 to 2 s before `ext-a`'s | the same | 15:29:29, 8.1 s after the first |
| `ext-b2` | `/channel-d` | 9, from 16:47:43 to 17:37:54 | 10 min | 17:17:48, 17:27:48 and 17:37:52, 5.2, 5.6 and 8.5 s after a request |

A second request came 8 to 11 s after each of the 5 requests a midroll followed, and after none of the others. In soak d no request had a second one.

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

The two breaks at the channel load in soak e (15:15:45 and 15:15:58, the break already running when the page opened) had no picture-by-picture request before them and no F-19. Their first backup was `site` 160p30 after 3.3 s with 6 blank segments, and `site` 720p60 after 4.3 s with 3 blank segments.

### First polls of a midroll

All 14 stitched breaks in soaks d and e began with 1 to 3 main polls that only announced the break (B-034): the `twitch-stitched-ad` ranges and prefetch lines to the ad's first segments, with no ad segment. Purple answers those prefetch URIs with the blank segment (F-14) and looks for no backup at those polls. The first backup comes at the first poll with ad segments. In the 12 midrolls with a picture-by-picture request before them, the blank segments were only the 1 or 2 announced prefetch URIs, with F-19 and without it.

### First backup

Purple tries the pinned type first (F-10), the last one that gave a clean backup.

At a channel's first midroll there is no pinned type. Without F-19, the only backup with a master is the page's `picture-by-picture` one, stored by E10, so Purple plays that 360p master and pins it. Both 10:56 breaks in soak d ran on `picture-by-picture` for their first 20 s; the 09:36:58 break moved to `site` within them. With F-19, the 17:17:48 break started on `site` 720p60.

At later midrolls every type still had a master from the previous break, and the first poll with ad segments got a backup, with F-19 and without it. Its type was the one pinned at the end of the previous break. The 17:27 break ended on `picture-by-picture` after `site`, `popout` and `frontpage` announced breaks of their own. The 17:37:52 break then started on the 360p `picture-by-picture` master, with tokens prewarmed 8.5 s before, and moved to `site` 720p60 after 5 s.

### Tokens asked before the break

The tokens F-19 asked 5 to 9 s before a midroll got their own pod, like those asked during the break (B-036). In the three midrolls recorded in full, their playlists announced breaks of their own (12 to 14 per break), none had ad segments, and Purple moved between `site`, `popout` and `frontpage` within 20 s.

## Default

`prewarmBackups` stays off.

With it on:
- the blank segments, the time to the first backup and the token requests during the break matched the same midroll with it off;
- the first backup differed only at a channel's first midroll: `site` 720p60 in 1 break, against the `picture-by-picture` 360p master in 3 breaks without F-19;
- F-19 asked 7 tokens at 14 page requests, and 4 of them had a midroll after them.

Since T-410, F-19 asks tokens only for the types with no stored master.

## Offline channel

`/channel-b` was offline when `ext-b` opened it at 15:16:

1. Usher answered the channel request with 404.
2. The page then requested `usher.ttvnw.net/vod/v2/<id>.m3u8`. Its media playlists are `d1m7jfoe9zdc1j.cloudfront.net/<id>/<quality>/index-dvr.m3u8`, with 5197 segments.
3. The player played that recorded video for 80 min.

The player's `edge.ads.twitch.tv` requests were a `preroll` at the load, then a `midroll` every 10 min (7 in 80 min). Purple answered them (F-04).

The worker made no media playlist request after 15:16:19, so the soak saw no break. `soak.py` now leaves such a channel after 3 min (`66114e4`); `ext-b2` left it at 16:41.

## Open

- The first backup at a channel's first midroll with F-19, on more channels (1 break so far), with the T-410 build (T-410).
- The pinned type at a break's end can be the 360p `picture-by-picture` master, and the next midroll starts on it.
