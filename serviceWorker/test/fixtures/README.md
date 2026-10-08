# Fixtures

Hand-written on 2026-10-03 from `docs/server/` (tags and markers observed in the [live traffic finding](../../../docs/findings/2026-10-03-twitch-live-traffic.md), plus what Brave's script reports), except the files whose source says "captured": those come from twitch.tv through a probe and `harness/sanitize.ts`. When the recorder (T-005) produces sanitized captures, they replace or join these files and this table says which ones are captured.

Every file is already in sanitized form: `sanitize(file) === file` is checked by `fixtures.spec.ts`. Load them with `fixture("m3u8/<name>")` or `fixtureJson("gql/<name>")` from `../harness/fixtures.ts`.

All media playlists start at `2026-10-03T12:00:00.000Z` (preroll, live, fMP4, LL-HLS) or `12:10:00.000Z` (midroll and its backups), with 2 s segments.

## `m3u8/`

| File | Content | Source |
| --- | --- | --- |
| `master-site-v2.m3u8` | the page's own master from `/api/v2/channel/hls/` (`site`): 24 `SESSION-DATA` lines, no `EXT-X-MEDIA`; `STREAM-INF` with `IVS-NAME`, `STABLE-VARIANT-ID`, `SCORE`, `IVS-VARIANT-SOURCE`; 5 AVC variants on `sae12.playlist.ttvnw.net`, not sorted by quality | captured 2026-10-07 (`docs/findings/probes/master_capture_probe.py`), sanitized |
| `master-frontpage-v1.m3u8` | backup master Purple requested from `/api/channel/hls/` (`frontpage`): `#EXT-X-TWITCH-INFO`, `EXT-X-MEDIA` with `NAME`, 5 AVC variants on `sae12.playlist.ttvnw.net`, first one 360p30 | captured 2026-10-07, sanitized |
| `master-avc.m3u8` | 5 AVC variants (`chunked` 1080p60 source, 720p60, 480p30, 360p30, 160p30), `EXT-X-MEDIA` with `NAME`, variant URLs on `edge.playlist.ttvnw.net` | host observed (B-003); `EXT-X-MEDIA` and `STREAM-INF` attributes not recorded yet, written in the layout Purple 2.6.7 parses |
| `master-video-weaver.m3u8` | same variants on `video-weaver.example.hls.ttvnw.net`, the host the 2.6.7 variant regex reads | Purple 2.6.7 code |
| `master-hevc.m3u8` | HEVC source, AV1 and AVC variants | synthetic (Q-007) |
| `master-empty.m3u8` | session data only, no variant | synthetic |
| `media-live-ts.m3u8` | live MPEG-TS, `PROGRAM-DATE-TIME`, Twitch tags, `EXT-X-TWITCH-PREFETCH` | tags observed; `TWITCH-PREFETCH` from the player's parser (B-005) |
| `media-live-fmp4.m3u8` | live fMP4 with `EXT-X-MAP` (`init-main.mp4`) | synthetic (Q-007) |
| `media-ll-hls.m3u8` | `EXT-X-PART`, `EXT-X-PRELOAD-HINT`, `EXT-X-SERVER-CONTROL` | synthetic (Q-003) |
| `media-ssai-preroll.m3u8` | 6 ad segments: `twitch-stitched-ad`, `twitch-trigger` and `twitch-ad-quartile` `DATERANGE`s with `X-TV-TWITCH-AD-*`, `Amazon\|AD_ID` titles, `/adsquared/` URIs, `DISCONTINUITY` | markers and titles observed; `/adsquared/` reported by Brave (Q-012) |
| `media-ssai-midroll.m3u8` | 3 live, 3 ad (12:10:06 to 12:10:10), 2 live | markers observed; layout synthetic |
| `media-marked-live.m3u8` | ad `DATERANGE`s, every segment `live` | Brave-reported case (F-03 `MARKED_LIVE`) |
| `media-false-positive.m3u8` | `stitched` only inside a `twitch-stream-source` attribute | synthetic |
| `backup-clean.m3u8` | 8 live segments aligned by `PROGRAM-DATE-TIME` with `media-ssai-midroll.m3u8`, other `MEDIA-SEQUENCE` and URIs | synthetic |
| `backup-ads.m3u8` | the same window with the same ad break | synthetic |
| `backup-fmp4-other-map.m3u8` | fMP4 backup with `init-backup.mp4`, aligned with `media-live-fmp4.m3u8` | synthetic |

## `gql/`

| File | Content | Source |
| --- | --- | --- |
| `token-ok.json` | `PlaybackAccessToken` response | Purple 2.6.7 code, Brave script |
| `token-flat.json` | token without the `data` wrapper (shape Brave handles for `embed`) | Brave script |
| `persisted-not-found.json` | `PersistedQueryNotFound` error | Brave script (F-07) |
| `token-integrity-error.json` | integrity error with a `null` token | synthetic |
| `page-gql-init.json` | `init` of a page GQL request with the headers F-05 captures | Brave script |
| `page-token-batch.json` | batched body: `ChannelShell`, `PlaybackAccessToken` (`site`), `UseLive` | synthetic |
