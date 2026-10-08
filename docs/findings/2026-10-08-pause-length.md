# Pause length at the break edges (T-604)

Date: 2026-10-08, 08:27 to 09:00. Build: T-604 (`pausePlayDelayMs`). Logged out, extension with `debug`, a fresh profile and a random directory channel per run, `pausePlayDelayMs` set in `chrome.storage.local` before the channel opened: L3-12, 8 runs at 0 ms and 8 at 1500 ms (the default), alternating. Reports: `~/purple-recordings/2026-10-08-t604/` (outside the repo). Probe: [`pause_edges_probe.py`](probes/pause_edges_probe.py).

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

## Default

`pausePlayDelayMs` stays at 1500 (E6 as before): at 0 ms there are two break ends and no break start during playback, the edge where the main playlist gives way to a backup.

## Open

- Break starts during playback at 0 ms, and both edges of midrolls in a soak at 0 ms.
- Whether a value between 0 and 1500 (500 before `10128a5`) changes anything at the start of a break.
