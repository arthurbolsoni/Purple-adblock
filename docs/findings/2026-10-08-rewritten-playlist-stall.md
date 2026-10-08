# Player stall on regenerated playlists: fMP4 streams lose EXT-X-MAP (T-806)

Date: 2026-10-08. Build: `32208a4`, the commit before T-101, whose playlists without ads still went through `generateM3u8` ([backups and rewritten playlists](2026-10-07-backups-and-rewritten-playlists.md#player-stall)). L3-01 with that build (`PURPLE_EXTENSION_BUILD`), logged out, extension. Reports: `~/purple-recordings/2026-10-08-t806` (outside the repo). Probe: [`stall_profile_probe.py`](probes/stall_profile_probe.py).

## Runs

| Profile | Runs | Channel (container) | Playlists | Loads that played |
| --- | --- | --- | --- | --- |
| fresh | 3 | `/channel-a` (fMP4, `EXT-X-MAP`) | no ads: regenerated | 0 of 6 |
| fresh | 1 | `/channel-a` | ads: Twitch's text (the ad path of that build) | 2 of 2 |
| fresh, Strict tracking prevention | 4 | `/channel-a` | no ads: regenerated | 0 of 8 |
| fresh, device config host unreachable | 2 | `/channel-a` | no ads: regenerated | 0 of 4 |
| fresh, device config host unreachable | 1 | `/channel-a` | ads: Twitch's text | 2 of 2 |
| dedicated (Balanced) | 3 | `/channel-c` (MPEG-TS) | no ads: regenerated | 6 of 6 |
| copy of the dedicated profile, nothing cleared | 1 | `/channel-c`, then `/channel-s` | no ads: regenerated | `/channel-c` played, `/channel-s` stalled at `readyState` 2 |

The rest of the probe (clearing the profile's local storage, IndexedDB, cache storage and cookies one at a time) did not run: the session ran low on memory and the background jobs were stopped.

## Cause

`generateM3u8` in that build writes `#EXTM3U`, `TARGETDURATION`, `MEDIA-SEQUENCE`, `#EXTINF` and the URIs, nothing else. On an fMP4 stream the init segment comes only from `EXT-X-MAP`, so the player gets media segments it cannot start; on an MPEG-TS stream every segment starts on its own. Each profile's directory listed a different channel first (L3-01 opens the first card): the fresh profiles got `/channel-a`, whose playlists carry `EXT-X-MAP` (fMP4), and the dedicated profile `/channel-c`, an MPEG-TS stream. The 2026-10-07 difference between fresh profiles and the dedicated one was the channel, not the profile: Strict tracking prevention and the cached IVS device config changed nothing on the fMP4 channel.

Since T-101 a playlist without ads passes untouched and the merge edits lines in place, `EXT-X-MAP` included (rule 3), so the stall cannot happen with the current code. It is also the likely cause of Purple 2.6.7's reports #105 and #108 (a dropped `EXT-X-MAP`, [2.6.7 review](2026-10-03-purple-2.6.7-review.md)).
