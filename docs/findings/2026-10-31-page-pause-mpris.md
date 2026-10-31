# The page's pause that nothing resumed (T-828)

Date: 2026-10-31. Recordings: `~/purple-recordings/2026-10-30-t825`, `2026-10-31-t826` and `2026-10-31-t827` (outside the repo), Brave 156 headless on Linux (KDE Plasma), logged out. Probes: [`page_pause_probe.py`](probes/page_pause_probe.py), [`mpris_pause_probe.py`](probes/mpris_pause_probe.py).

## The pauses

In the nine soak sessions of 2026-10-30 and 2026-10-31, the page sent the main player six `pause` messages that neither answered a pause request from Purple's worker nor came within 3 s of the page creating the player:

| Time | Session | Purple | Channel | Break | `play` after |
| --- | --- | --- | --- | --- | --- |
| 2026-10-30 23:52:46.429 | `ext-hop` | 2.7.0 build | `/channel-am` | none | none |
| 2026-10-30 23:52:46.412 | `ext-mid` | 2.7.0 build | `/channel-c` | none (a preroll ended 75 s before) | none |
| 2026-10-30 23:52:46.412 | `rec-hop` | none (record mode) | `/channel-an` | none (a preroll ended 7 s before) | none |
| 2026-10-31 15:21:34.614 | `t827-f28` | F-27 and F-28 build | `/channel-ak` | midroll with only markers, 2.7 min in | none |
| 2026-10-31 15:22:13.760 | `t826-f28` | F-27 and F-28 build | `/channel-d` | none | 2.3 s |
| 2026-10-31 15:25:40.080 | `t826-f28` | F-27 and F-28 build | `/channel-d` | midroll with only markers, 4.5 s in | none |

Each had the same course: the browser's media log has `kPause`, then `kSeek` to 0 and both buffers at `BUFFERING_HAVE_NOTHING`; the `<video>` stayed at `currentTime` 0, `readyState` 1, `paused`; the worker made no request until a `play`. Without one, the soak left the channel 2 to 4 min later (no live media playlist for 180 s, the player failed for 180 s, or the end of the `--hop` time). The page's URL did not change, and no player error or ad overlay came up. Before the pause at 15:22:13 the player was playing `/channel-d` at 720p, with Purple returning the page's playlists untouched ("Stream is free").

## Desktop media controls

A Chromium browser on Linux puts a page's player with sound on the desktop's media controls: an MPRIS name on the D-Bus session bus, `org.mpris.MediaPlayer2.brave.instance<pid>` for Brave. `--headless=new` and `--mute-audio` do not change it: the page still sees an unmuted `<video>` (`muted: false` in the soaks' samples). An MPRIS `Pause` pauses the player, from any MPRIS client: media keys, Bluetooth earbuds (AVRCP), the desktop's media applet, or the desktop itself when an audio output goes away.

`mpris_pause_probe.py --media-keys` on the level 2 page (IVS player, `sim/` scenario `l2-01-live`, unmuted): the `Pause` gave the page's `pause` to the worker and nothing from Purple's worker, `currentTime` 0, and no `play` in the next 20 s. With `--play-after 3` the player went on 3 s later, as on `/channel-d` at 15:22:16. With `--no-purple`: the same pause, no `play`.

The system journal at the pauses:

- 2026-10-30 23:52:46: the Bluetooth earbuds' audio transport failed (`spa.bluez5 ... terminated unexpectedly`) and their AVRCP input device was removed, in the same second as the three pauses in three separate browsers, one of them without Purple (Inferred: the desktop paused every player on its media controls when the output went away).
- 2026-10-31: the earbuds' AVRCP input device came at 15:13:55, and a desktop media player had been playing since 15:13:12. The four messages from 15:21:34 to 15:25:40 went to one player at a time, which is how a play/pause key or an earbud tap reaches the player the desktop picks (Inferred: key presses are not in the journal).

## Fix

`e2e/lib.py` adds `HardwareMediaKeyHandling` to `--disable-features` in every mode, which keeps the browser off the desktop's media controls. `mpris_pause_probe.py` without `--media-keys` found no MPRIS name for the browser. L2-01 and L3-01 in extension mode passed with the flag on 2026-10-31.

## Earlier notes

- T-828 counted two such pauses and none in the other soaks of 2026-10-30 and 2026-10-31; the three at 2026-10-30 23:52:46 were in those soaks.
- [Still video every 88 s on fMP4 channels](2026-10-31-fmp4-stills.md#with-f-28) and [the same segment twice](2026-10-31-same-segment-twice.md#audio-and-video-apart): session `t827-f28` and the first load of `t826-f28` ended at these pauses, not because of the breaks they fell in.
- The first channels of `ext-mid` (`/channel-c`, 5 min) and `rec-hop` (`/channel-an`, 4.5 min) ended at the 23:52:46 pause.
