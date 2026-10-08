# Player reload at the end of a break (T-601)

Date: 2026-10-08, 08:07 to 08:17. Build: T-601 (`ad-break.ts`, `page/player-reload.ts`). Logged out, extension with `debug`, `reloadAfterAd` set in `chrome.storage.local` before the channel opened, a fresh profile and a random directory channel per run: L3-11, 6 runs, 60 s watched each. Report: `~/purple-recordings/2026-10-08-t601/l3-11.json` (outside the repo). Probe: [`reload_timeline_probe.py`](probes/reload_timeline_probe.py).

## Runs

| Run | Channel | Break | Reload | Video after the reload | Next main poll |
| --- | --- | --- | --- | --- | --- |
| 1 | `/channel-j` | none | - | - | - |
| 2 | `/channel-a` | preroll, 16 ad segments (`InnovidAds\|`) | at the first poll without ad segments, 59.7 s into the load; `ok` | `readyState` 0 at +0.5 s, playing from `currentTime` 0 at +1.6 s | live, `MEDIA-SEQUENCE` 72390 |
| 3 | `/channel-g` | none | - | - | - |
| 4 | `/channel-d` | preroll, 16 ad segments (`Amazon\|`) | at the first poll without ad segments, 61.4 s into the load; `ok` | `readyState` 0 at +0.8 and +1.9 s, playing from `currentTime` 0 at +3.1 s | a new preroll: `MEDIA-SEQUENCE` 0, 3 ad segments, growing by one per poll to 7 when the run ended |
| 5 | `/channel-g` | none | - | - | - |
| 6 | `/channel-ah` | none | - | - | - |

All 6 runs passed: every player worker ran Purple, no player error, video playing at the end. In both reloads the page found Twitch's player state under `#root` (a node with `setSrc` and `setInitialPlaybackSettings`) and `setSrc` ran (`playerReloaded` with `ok: true`). In run 4 the new preroll took the state back to `ad` with pause/play; its end fell after the run, so the end-of-break checks were skipped there.

The video samples are one second apart. A reload left the video without a frame (`readyState` 0) for 1 to 2 samples; the pause/play at a break edge stops it for 1.6 to 1.7 s ([midroll soak](2026-10-08-midroll-soak.md#video-at-the-break-edges)). Both restart the timeline at 0.

## Server behavior

- Before the reload, both prerolls grew at `MEDIA-SEQUENCE` 0 to 31 segments (16 ad segments, then 15 live ones); the next poll had `MEDIA-SEQUENCE` 17 and the 15 live segments only (B-039).
- A reload with the same access token at that point (soft `setSrc`) got the live playlist once and a new preroll once (B-045). Brave's script spaces reloads 30 s apart because reloads can bring ads (its comment on `ReloadCooldownSeconds`: "breaks CSAI cascades triggered by reload").

## Defaults

`reloadAfterAd` stays off (F-15): with it off, the end of a break gets the pause/play it got before T-601.

## Open

- Whether a reload later after the break, a hard reload with a new token (Brave's `early` kind), or Brave's health check (no reload when the player plays within 7 s of the live edge) avoids the new preroll: not tried.
- A reload after a midroll: not seen in these runs.
