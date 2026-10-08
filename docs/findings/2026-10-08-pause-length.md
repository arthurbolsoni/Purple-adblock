# Pause length at the break edges (T-604)

Date: 2026-10-08, 08:27 to 09:00 (L3-12) and 09:06 to 11:07 (soak d). Build: T-604 (`pausePlayDelayMs`). Logged out, extension with `debug`, a fresh profile and a random directory channel per run, `pausePlayDelayMs` set in `chrome.storage.local` before the channel opened: L3-12, 8 runs at 0 ms and 8 at 1500 ms (the default then), alternating. Reports: `~/purple-recordings/2026-10-08-t604/` (outside the repo). Probe: [`pause_edges_probe.py`](probes/pause_edges_probe.py).

## Runs

15 of 16 runs passed: every player worker ran Purple, no player error, the video playing at the end, and no ad overlay in the four runs with a break. The other run (1500 ms) stopped at launch: the fresh profile had not enabled the unpacked build within 20 s, before Purple ran.

| Wait | Channel | Break | Edge | `<video>` `pause` after the worker's | `pause` to `playing` | `currentTime` at `playing` |
| --- | --- | --- | --- | --- | --- | --- |
| 0 ms | `/channel-a` | preroll, 33 of 40 polls | start, before playback began | - | - | 0 |
| 0 ms | `/channel-a` | | end, during playback | 6 ms | 756 ms | 0 |
| 0 ms | `/channel-h` | preroll, 41 of 47 polls | start, before playback began | - | - | 0 |
| 0 ms | `/channel-h` | | end, during playback | 5 ms | 188 ms | 0 (from 57.1) |
| 1500 ms | `/channel-g` | midroll from the 5th poll, announced 2 polls ahead | start, during playback | 9 ms | 2066 ms | 0 |
| 1500 ms | `/channel-h` | midroll from the 26th poll, announced 2 polls ahead | start, during playback | 6 ms | 1687 ms | 0 |

The ends of both midrolls fell after the run. In the soaks with the default, the six edges of three midrolls took 1620 to 1730 ms each ([midroll soak](2026-10-08-midroll-soak.md#video-at-the-break-edges)).

With either wait, the player restarts its timeline at 0 after the pause/play. With 0 ms, `play` reaches the player in the same turn as `pause`; the `<video>` still fired `pause`, then `playing` 188 and 756 ms later.

## Soak d

`e2e/soak.py` with `--setting pausePlayDelayMs=<ms>`, logged out, fresh profiles, `debug` on, 120 minutes each: `ext-a` on `/channel-a` at 0 ms, `ext-c` on the same channel at 1500 ms, `ext-b` on `/channel-b` at 0 ms. Recordings: `~/purple-recordings/2026-10-08-soak-d` (outside the repo). Report: `python e2e/soak_report.py`; edges: [`soak_details_probe.py`](probes/soak_details_probe.py).

| Session | Wait | Midroll | Length, ad segments, titles | `pause` to `playing`, start / end | Video not progressing |
| --- | --- | --- | --- | --- | --- |
| `ext-a` | 0 ms | 10:56:15 | 94 s, 32, `Amazon\|` and `FT\|` | 0.67 / 0.71 s | 3 s |
| `ext-c` | 1500 ms | the same midroll, 10:56:13 | 93 s, 32 | 2.62 / 1.74 s | 5 s |
| `ext-b` | 0 ms | 09:36:54 | 118 s, 42, `Amazon\|` and `InnovidAds\|` | 1.02 / 0.86 s | 2 s |
| `ext-b` | 0 ms | 09:44:54 | 120 s, 41, `Amazon\|` and `InnovidAds\|` | 0.80 / 1.05 s | 9 s |
| `ext-b` | 0 ms | 10:32:54 | 72 s, 16, a 10-digit number | 0.93 / 0.98 s | 2 s |
| `ext-b` | 0 ms | 10:48:54 | 70 s, 16, `Amazon\|` | 0.95 / 0.97 s | 2 s |
| `ext-b` | 0 ms | 11:05:00 | 54 s, 11, a 10-digit number | 0.88 / 0.98 s | 2 s |

In all seven breaks the ad overlay stayed off, no ad media reached the player, no backup poll had ad segments, and the video played after the break. Each edge restarted the timeline at 0, at either wait.

In the 09:44:54 break, 9 s after the start edge the `<video>` waited at `currentTime` 8.0 (`waiting`, then `pause` with no message from the worker) and played again 8.1 s later at 14.1. Just before, the first backup playlist the player got had a `MEDIA-SEQUENCE` one below the main playlist's last poll. The same drop (1 to 5) came at the start of the other three later breaks on `/channel-b`, which stopped for 2 s each, and not on `/channel-a` (B-048).

## Default

`pausePlayDelayMs` is 0 since soak d: 14 edges during playback at 0 ms (12 in soak d, 2 in L3-12), 6 of them break starts, took 0.19 to 1.05 s from `pause` to `playing`; at 1500 ms, 10 edges took 1.62 to 2.62 s. The 1500 ms value (since `10128a5`, 500 before it) stays one setting away.

## Open

- The 8 s wait inside the 09:44:54 break: whether the backup's lower `MEDIA-SEQUENCE` causes it.
- Edges on other channels and logged in, at 0 ms.
