# Backups with ad segments in prerolls (T-807)

Date: 2026-10-08. Data: the level 3 run reports since T-401 (the page's GQL headers on Purple's token requests): `~/purple-recordings/2026-10-08-t401` to `-t604` and `-e6-id` (outside the repo), logged out, fresh and dedicated profiles. Probe: [`report_backups_probe.py`](probes/report_backups_probe.py), which reads the per-load `server` summary of each report (main and backup media playlists, polls with ad segments, roll types).

## Prerolls and midrolls

| Roll type of the main playlist's break | Loads | Loads whose backups had ad segments | Backup polls with ad segments |
| --- | --- | --- | --- |
| `PREROLL` | 17 | 17 | 326 of 603 (33 to 67 % per load) |
| `MIDROLL` | 7 | 2 (1 and 10 polls) | 11 of 175 |

In the soaks since T-401 no backup playlist had ad segments during a midroll the viewer watched from its start ([prewarm backups](2026-10-08-prewarm-backups.md#soak-f)). The one soak break with backup ad segments, soak f on `/channel-f` (5 of 5 backup playlists), was a midroll already running when the page opened 6 s before.

A backup token asked while the viewer is in a preroll, or joins a running break, gets a preroll of its own: its playlist starts with ad segments, as the main playlist did when the page opened (B-007, B-036). The T-401 headers removed the ad segments from midroll backups (22 of 120 backup polls before, none after; B-036), not from preroll backups. Purple drops a backup with ad segments (F-09) and answers the ad segments left with the blank segment (F-14); the level 3 runs passed with no ad media reaching the player.

The reports do not split the backup polls by player type, so whether one type avoids its own preroll is not known.

## Open

- Backup polls with ad segments by player type and token age in a preroll (needs a recorder field per backup type).
