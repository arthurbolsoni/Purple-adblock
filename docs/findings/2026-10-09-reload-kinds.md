# Player reload kinds at the end of a break and new breaks (T-808)

Date: 2026-10-08 20:00 to 2026-10-09 01:10. Build: Purple with `reloadAfterAd` off. L3-13 (`e2e/scenarios/l3_13.py`): fresh profile, logged out, a random directory channel; when a break Purple handled has ended (no `adDetected` for 4 s), the scenario reloads Twitch's player from the page with the lookup of F-15 (`serviceWorker/src/page/player-reload.ts`) and the kind in `PURPLE_RELOAD_KIND`, then watches 40 s. Reports: `~/purple-recordings/2026-10-08-t808` (outside the repo).

## Runs

37 runs; in 6 a break ended within the 90 s wait and the reload ran (the page found the player each time). 3 runs stopped at launch: the fresh profile had not enabled the unpacked build within 45 s.

| Kind | `setSrc` | Reloads | Main playlist with ad segments again after the reload |
| --- | --- | --- | --- |
| `soft` | same player, same token, at the break's end | 2 | 0 of 2 (`/channel-a`, `/channel-m`) |
| `soft-late` | the same, 15 s after the break's end | 1 | 1 of 1: a preroll, 22 of 25 polls (`/channel-c`) |
| `token` | same player, new token | 2 | 1 of 2: a midroll, 22 of 26 polls (`/channel-d`) |
| `instance` | new player, new token | 1 | 1 of 1: 28 of 29 polls, `MIDROLL` and `PREROLL` roll types (`/channel-v`) |

With B-045's two soft reloads at the first live poll after a preroll (one new preroll), the soft reload at the break's end brought a new break in 1 of 4. Every kind brought a new break at least once.

## Default

`reloadAfterAd` stays off: no reload kind avoided a new break, and with it off E6's pause and play end the break without one.
