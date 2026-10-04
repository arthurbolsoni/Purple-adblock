# Techniques

Ways to make twitch.tv show a behavior during a level 3 run. Each entry records what it targets and every attempt with its outcome, so a technique's hit rate is visible.

| ID | Technique | Targets | Attempts |
| --- | --- | --- | --- |
| TR-001 | Logged-out profile, open a live channel picked from the directory, `--disable-extensions` | preroll SSAI (B-007), Q-001 | 2026-10-03: 1 attempt, 1 preroll ([finding](../findings/2026-10-03-twitch-live-traffic.md)) |
| TR-002 | Stay on one channel for 20 minutes or more | midroll, CSAI (B-011), Q-008 | none yet |
| TR-003 | Open the popout player URL instead of the channel page | `popout` token behavior, Q-004 | none yet |
| TR-004 | Switch channels by clicking (no reload) versus opening each channel in a new tab | preroll frequency, worker re-creation | none yet |
| TR-005 | Fresh profile copy for every channel open | preroll frequency without ad-frequency memory, Q-001 | none yet |
| TR-006 | Channel with enhanced broadcasting (HEVC/AV1) | fMP4, `EXT-X-MAP`, codecs in the master, Q-007 | none yet; needs a list of such channels |
| TR-007 | Logged in (one-time manual login in the dedicated profile) | headers, `EXT-X-TWITCH-PREFETCH`, Q-003, Q-009 | none yet |
| TR-008 | With Purple on, record every backup token and playlist during a break | backup types with ads (B-012), Q-004 | none yet |

A new technique gets the next TR number. A failed attempt is recorded like a successful one.
