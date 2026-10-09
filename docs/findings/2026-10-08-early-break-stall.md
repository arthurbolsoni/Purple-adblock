# The video standing still in a break right after the page opened (T-810)

Date: 2026-10-08. Data: soaks e, f and g (`~/purple-recordings/2026-10-08-soak-e` to `-soak-g`, outside the repo), logged out, extension with `debug`, `pausePlayDelayMs` 0 (F-18). Probe: [`early_break_probe.py`](probes/early_break_probe.py), which lines up, for each break that starts less than 15 s after the page opened, Purple's pause and play messages to the player worker, the `<video>` events and the page monitor's `progressing` flag.

## Breaks in the first seconds

| Soak | Channel | Break after the page opened | Purple's E6 | `<video>` | Played again |
| --- | --- | --- | --- | --- | --- |
| e | `/channel-a` | 11.9 s | pause, play, play at 15:15:47.19 | `pause` at 15:15:47.20 | 15:15:53.95, at position 0, 6.7 s later |
| e | `/channel-a` | 4.9 s | pause, play, play at 15:16:00.72 | `pause` at 15:16:00.73 | 15:16:07.70, at 0, 7.0 s later |
| f | `/channel-k` | 4.7 s | pause, play, play at 18:30:40.21 | `pause` at 18:30:40.21 | 18:30:47.40, at 0, 7.2 s later |
| f | `/channel-f` | 5.8 s | pause, play, play at 17:47:52.60 | `pause` at 17:47:52.61 | 17:48:00.72, at 0.1, 8.1 s later |
| g | `/channel-p` (preroll) | 1.8 s | pause, play, play at 20:07:57.23 | no `pause`: playback had not started | 20:08:02.32, the first `play` of the load |

In the four midrolls the pause took effect within 10 ms, both plays that followed it in the same turn were ignored, and the video played again 6.7 to 8.1 s later from position 0 with no message from Purple in the second before: the player restarted on its own. Later in a load the same pause and play brought the video back within 0.19 to 1.05 s ([pause length](2026-10-08-pause-length.md)). In L3-12, a midroll from the 5th poll of a load (about 10 s after the page opened) with `pausePlayDelayMs` 1500 went from `pause` to `playing` in 2.1 s.

On `/channel-f` the page's ad UI appeared at 17:48:01.26, as the video played again after the restart (T-811).

## Open

- The same breaks with E6 off at the break edges (`pausePlayOnBreaks`, F-21) and with a wait between pause and play (`pausePlayDelayMs`), on a channel joined during its midroll (`e2e/join_break.py`).
