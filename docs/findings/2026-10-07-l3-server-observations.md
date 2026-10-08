# Server behavior seen during the level 3 runs of 2026-10-07

Date: 2026-10-07, 20:47 to 22:04 (local time) · logged out · Edge 154.0.4258.62 · extension mode · Used by: `docs/server/`, Q-001, Q-003, Q-007, Q-008, T-201, L3-02

## Method

- Preroll presence per load, from the L3-01 runs on fresh profiles (TR-001, TR-005) between 20:47 and 21:58: Purple's backup step ran on that load (it runs only when the main playlist has ad markers). The run time is when its report was written.
- From 21:58 on, the recorder also logs what Twitch answered, before Purple sees it (`e2e/worker-logger.js`, `e2e/server.py`): a digest of every master and media playlist (tags, `DATERANGE` classes and attribute names, segment titles, hosts, counts; no values that identify the viewer), the flags of the page's own token (read from the usher URL), Purple's token answers, and the page's requests to `edge.ads.twitch.tv`. L3-02 runs (`python e2e/run.py L3-02`), one fresh profile per run, 40 s watched per load.

## Results

### Prerolls over time

| Time | Channel | Fresh-profile direct loads | With a preroll |
| --- | --- | --- | --- |
| 20:47 to 21:22 | the directory's first card, the same channel in every run | 14 | 13 |
| 21:24 to 21:58 | same channel | 15 | 2 |
| 21:59 to 22:04 | random among the first 8 cards: 3 channels | 4 | 0 |

When a direct load had a preroll, the second load in the same session (client-side navigation, L3-01) had ad markers too, in all 15 such runs; in one more run only the second load had them. What changed at about 21:24 was not found (the channel's own ad schedule, ad inventory and limits per address are all possible).

### Page token, logged out

The `token` parameter of the page's usher request carried, in all 7 loads recorded: `player_type: "site"`, `platform: "web"`, `version: 3`, `server_ads: true`, `show_ads: true`, `hide_ads: false`, `adblock: false`, `turbo: false`, `subscriber: false`, `partner: false`, `privileged: false`, `mature: false`, `https_required: true`, `blackout_enabled: false`, `ci_gb: false`, `extended_history_allowed: false`. None of these 7 loads had a preroll; the flags on a load with one are not recorded yet.

### Media playlists without ads

7 loads, 3 channels, 23 to 30 polls each:

- 14 segments per poll, every `#EXTINF` 2.000 with title `live`, `TARGETDURATION` 6;
- tags in every load: `EXT-X-VERSION`, `EXT-X-TARGETDURATION`, `EXT-X-MEDIA-SEQUENCE`, `EXT-X-TWITCH-ELAPSED-SECS`, `EXT-X-TWITCH-TOTAL-SECS`, `EXT-X-TWITCH-LIVE-SEQUENCE` (not in our docs before), `EXT-X-DATERANGE`, `EXT-X-PROGRAM-DATE-TIME`, `EXT-X-TWITCH-PREFETCH` (2 per poll);
- `EXT-X-MAP` (fMP4) on 1 of the 3 channels, the one whose master says `CHANNEL-METADATA="multitrack_video,multigroup_video"` and whose backup masters say `enhanced_broadcast`; its variants are AVC. The other 2 channels served `.ts`;
- `DATERANGE` classes in every poll, with these attribute names: `timestamp` (`X-SERVER-TIME`), `twitch-session` (`X-TV-TWITCH-SESSIONID`), `twitch-stream-source` (`X-TV-TWITCH-STREAM-SOURCE`), and `twitch-trigger` (`X-TV-TWITCH-TRIGGER-URL`), all with `ID`, `START-DATE`, `END-ON-NEXT`. `twitch-trigger` was there with no ad segment and no `X-TV-TWITCH-AD-*` attribute.

### Client-side ads

No request to `edge.ads.twitch.tv` from the page in the 7 recorded loads.

## Consequences

- `twitch-trigger` alone is not an ad marker; the detector (T-201) must not treat it as one.
- `EXT-X-TWITCH-PREFETCH` comes to logged-out viewers; T-101's line edits keep it, and T-502 must drop prefetch lines that point to ads.
- fMP4 with `EXT-X-MAP` is not limited to HEVC/AV1: an enhanced-broadcast channel served its AVC variants that way.

## Open

- What makes prerolls frequent or rare for a logged-out viewer (Q-001): more runs at other times, more channels.
- What `X-TV-TWITCH-TRIGGER-URL` points to (the value is not recorded).
