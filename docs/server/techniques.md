# Techniques

Ways to make twitch.tv show a behavior during a level 3 run. Each entry records what it targets and every attempt with its outcome, so a technique's hit rate is visible.

| ID | Technique | Targets | Attempts |
| --- | --- | --- | --- |
| TR-001 | Logged-out profile, open a live channel picked from the directory, `--disable-extensions` | preroll SSAI (B-007), Q-001 | 2026-10-03: 1 attempt, 1 preroll ([finding](../findings/2026-10-03-twitch-live-traffic.md)). 2026-10-07, with Purple on and TR-005: see TR-005 |
| TR-002 | Stay on one channel for 20 minutes or more | midroll, CSAI (B-011), Q-008 | 2026-10-07 23:28 to 2026-10-08 02:30, `e2e/soak.py`, logged out, fresh profiles, 3 parallel sessions (2 with Purple, 1 without): 8.69 h in 20 loads on 5 channels: 115 `twitch-maf-ad` slots (every load watched more than 3 minutes), 11 stitched breaks (10 midrolls, 1 preroll going on into a midroll) ([finding](../findings/2026-10-07-midroll-soak.md)). 2026-10-07 23:35, L3-03 (20 min, 1 channel): 2 `twitch-maf-ad` slots, no stitched break |
| TR-003 | Open the popout player URL instead of the channel page | `popout` token behavior, Q-004 | none yet |
| TR-004 | Switch channels by clicking (no reload) versus opening each channel in a new tab | preroll frequency, worker re-creation | none yet |
| TR-005 | Fresh profile copy for every channel open | preroll frequency without ad-frequency memory, Q-001 | 2026-10-07, logged out, direct load: 13 of 14 prerolls (20:47 to 21:22, one channel), 2 of 15 (21:24 to 21:58, same channel), 0 of 4 (21:59 to 22:04, 3 channels), 0 of 2 at 22:12, 1 midroll in 2 at 22:30 ([finding](../findings/2026-10-07-l3-server-observations.md)) · 2026-10-08: `e2e/record.py --fresh-profile`, one channel for 120 s with every usher, playlist, segment, token and `edge.ads` request recorded (L3-10, no break; [finding](../findings/2026-10-08-l3-recorder.md)) |
| TR-006 | Channel with enhanced broadcasting (HEVC/AV1) | fMP4, `EXT-X-MAP`, codecs in the master, Q-007 | none yet; needs a list of such channels |
| TR-007 | Logged in (one-time manual login in the dedicated profile) | headers, `EXT-X-TWITCH-PREFETCH`, Q-003, Q-009 | none yet |
| TR-008 | With Purple on, record every backup token and playlist during a break | backup types with ads (B-012), Q-004 | 2026-10-07: 8 loads with a preroll; `frontpage` had ads on 112 of 121 polls, `picture-by-picture` on 61 of 95 ([finding](../findings/2026-10-07-backups-and-rewritten-playlists.md)) |
| TR-009 | Two sessions on the same channel at the same time, one with Purple and one without | what Purple changes during the same break; the channel's midroll schedule | 2026-10-08 00:20 to 02:30: `/channel-a`, 2 stitched midrolls (00:23, 00:37) seen by both sessions: without Purple, ad overlay 15 and 20 s and playback went on; with Purple, overlay 108 and 163 s and the video stalled 121 and 161 s ([finding](../findings/2026-10-07-midroll-soak.md)) |

A new technique gets the next TR number. A failed attempt is recorded like a successful one.
