# The page's ad UI on breaks whose ad segments reached the player (T-811)

Date: 2026-10-08 23:07 to 2026-10-09 00:29. Build: `6159af3` (F-20 `stripAdMarkers`, off then). Logged out, fresh profiles, `e2e/join_break.py j6 --channel /channel-d`: a watcher without Purple plays the channel; when its playlist has a midroll's ad segments, a second session with Purple (`debug` on) opens the channel and watches 60 s, with `stripAdMarkers` on and off in turn. Results: `~/purple-recordings/2026-10-08-join/j6.jsonl` (outside the repo).

## Soaks

In soaks e and f the ad UI (`video-ad-label`, `video-ad-countdown`) showed in 4 of the 5 breaks whose ad segments reached the player: 18 s, 49 s, and on both soak e sessions for the whole 2 hours. It never showed in the 23 breaks whose polls with ad segments all got a backup. The ad segments that reached the player were answered blank (F-14); no ad media came from the network.

## Joins

Every join opened the channel during a running midroll, before any backup was ready, so the break's first polls with ad segments reached the player.

| Join | `stripAdMarkers` | Polls with ad segments to the player | Polls with the ad's `DATERANGE` to the player | Ad UI | Longest still |
| --- | --- | --- | --- | --- | --- |
| 1 | on | 3 | 0 | 0 s | 7 s |
| 2 | off | 2 (and 2 announcing the break) | 4 | 48 s, from second 12 to the end | 6 s |
| 3 | on | 3 | 0 | 0 s | 7 s |
| 4 | off | 2 (and 3 announcing) | 5 | 49 s, from second 11 to the end | 6 s |
| 5 | on | 3 | 0 | 0 s | 6 s |
| 6 | off | 2 (and 2 announcing) | 4 | 47 s, from second 13 to the end | 6 s |

With the ad's `twitch-stitched-ad` and `twitch-ad-quartile` lines removed, the ad UI did not show (3 of 3); with them, it showed from the moment the video played again after the blank segments to the end of the watch (3 of 3). The still video is T-810's (the blank segments) and does not change with the setting. Ad media from the network: none in all six.

## Default

`stripAdMarkers` is on by default since these joins (F-20). It touches only playlists Purple already edits (blanked ad segments, an announced break's prefetch lines); the lines it removes belong to the ad (rule 3).

## Server

- A session that opened the channel at the watcher's break announcement (`j5`, 22:37:52) got no break; the two soak sessions on the same channel since 22:26 got only `twitch-maf-ad` slots then, while the watcher got the stitched midroll. A session opened while the midroll's ad segments were already in the watcher's playlist got the midroll at its first polls (6 of 6).
