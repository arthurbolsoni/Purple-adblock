# Backup tokens at the channel load (T-812)

Date: 2026-10-09, 00:17 to 01:48. Build: `f1bc37d` (F-22 `prewarmAtLoad`, off then) with `stripAdMarkers` on. Logged out, fresh profiles, `e2e/join_break.py --schedule`: no watcher; a session with Purple (`debug` on) opens `/channel-d` at a fixed point of every 10 minutes, a few seconds before the channel's midrolls, which started at about :07:50, :17:50 and so on through the night (B-044), and watches 60 s. `prewarmAtLoad` on and off in turn. Results: `~/purple-recordings/2026-10-08-join/j8.jsonl` and `j9.jsonl` (outside the repo).

## Joins 18 s before a midroll (`j8`, :x7:40)

Both joins with a midroll (one with `prewarmAtLoad`, one without) had a picture-by-picture request before it, and F-19 prewarmed the backups then: no poll with ad segments reached the player in either, the video stood still 1 s.

## Joins 5 to 7 s before a midroll (`j9`, :x7:48)

8 joins; 5 got a midroll, with no picture-by-picture request before it.

| Join | `prewarmAtLoad` | Midroll after the page opened | First backup after the first poll with ads | Blank segments | Polls with ad segments to the player | Longest still |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | on | 4.7 s | 3.3 s | 2 | 0 | 0 s |
| 4 | off | 7.2 s | 5.3 s | 3 | 2 | 6 s |
| 5 | on | 6.9 s | 3.4 s | 2 | 0 | 0 s |
| 7 | on | 4.6 s | 3.4 s | 2 | 0 | 0 s |
| 8 | off | 4.9 s | 4.2 s | 6 | 3 | 6 s |

Each midroll began with two polls that only announced it (B-034). With the tokens asked at the load, a backup replaced the first poll with ad segments: the only blank segments were the two prefetch URIs of the announcement. Without them, the first two or three polls with ad segments reached the player, blanked, and the video stood still 6 s (T-810). The ad UI stayed off in all of them (`stripAdMarkers`). No ad media came from the network.

## Default

`prewarmAtLoad` is on by default since these joins (F-22). It asks one token per backup type at the channel load, the same tokens F-19 asks at the page's first picture-by-picture request; the masters it stores serve every later break of the load (T-410).
