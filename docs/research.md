# Research: Brave's Twitch ad blocking

Snapshot taken on 2026-10-03.

## Sources used

Only what Brave ships today:

- `brave/adblock-resources`: `resources/vaft-ublock-origin.js` (last synced on 2026-08-28).
- `brave/adblock-lists`: `brave-lists/experimental.txt` and `brave-lists/brave-twitch.txt`.
- `ryanbr/TwitchAdSolutions`: upstream that Brave syncs the script from (v68.5.7, 2026-08-27). Its changelog explains field behavior behind several defaults.

`pixeltris/TwitchAdSolutions` is archived and is not used.

## Brave Shields

Shields runs `adblock-rust`, which reads uBlock Origin–style filters. Active Twitch rules, in the "Brave Experimental Adblock Rules" list (`brave-lists/experimental.txt`):

```
twitch.tv##+js(vaft-ublock-origin)
twitch.tv##+js(no-fetch-if, edge.ads.twitch.tv)
```

The "Brave Twitch Adblock Rules" list (`brave-lists/brave-twitch.txt`) has the same rules commented out. To turn it on: Shields set to Aggressive and both lists enabled.

`brave/adblock-resources` also ships `video-swap-new-ublock-origin.js`; neither of the two lists above references it.

## `vaft-ublock-origin.js`

### Injection

- Replaces `Worker` (as Purple does) and hooks the window `fetch`.
- Runs only in the top frame or in embed contexts (`player.twitch.tv`, `embed.twitch.tv`, `/embed/`).

### Headers and token

- Copies from the page GQL requests: `X-Device-Id` (or `Device-ID`), `Client-Integrity`, `Authorization`, `Client-Version`, `Client-Session-Id`.
- The backup token request is sent from the main window on behalf of the worker (comment in the code: "workers can't make credentialed requests").
- Persisted `PlaybackAccessToken` with hash `ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9`, `platform: "web"` (`"android"` for `autoplay`).
- Accepts two response shapes: `data.streamPlaybackAccessToken` and `streamPlaybackAccessToken` (seen for `embed`).

### The page's own request

- Changes the `playerType` of the page's `PlaybackAccessToken` to `popout` (single and batched bodies).
- Removes `parent_domains` from the usher URL (comment in the code: "stripping it gets rid of fake ads").
- Empties the body of the `picture-by-picture` token request so the mini player above the chat does not open.

### Usher and playlists

- Usher at `/api/channel/hls/` and `/api/v2/channel/hls/`.
- Reads the master line by line (`EXT-X-STREAM-INF` + URL) and maps `variant URL → stream`; media playlists are recognized through that map.
- Keeps the parameters of the original usher request to build backup URLs.

### Detection

- Playlist markers (`AdSignifiers`): `stitched-ad`, `EXT-X-CUE-OUT`, `twitch-stitched`, `EXT-X-DATERANGE:CLASS="twitch-maf-ad"`, `EXT-X-DATERANGE:CLASS="twitch-trigger"`.
- Not ads (`KnownNonAdSignifiers`): `twitch-session`, `twitch-stream-source`, `twitch-ad-quartile`, `twitch-assignment`.
- Ad URIs (`AdSegmentURLPatterns`): `/adsquared/`, `/_404/`, `/processing`.
- Confirmation: `X-TV-TWITCH-AD-AD-SESSION-ID`, `X-TV-TWITCH-AD-RADS-TOKEN`.
- Bare `stitched` is not a playlist marker; the comment above `AdSignifiers` says it caused false positives.

### Backups

- Order (`BackupPlayerTypes`): `site`, `popout`, `mobile_web`, `embed`; `autoplay` (360p) as last resort.
- Pins the type that worked; a contaminated type is skipped for 5 s.
- Variant chosen by codec family (`avc`, `hevc`, `av1`).
- `frontpage` and `picture-by-picture` are not in the list.

### No clean backup

- Removes ad segments, including ad `EXT-X-PART`, `EXT-X-TWITCH-PREFETCH` and `EXT-X-PRELOAD-HINT` lines, and injects a blank MP4 (`BLANK_MP4`). The viewer sees a black screen instead of the ad.
- Checked on 2026-10-08 (commit `60346357` of `brave/adblock-resources`): `stripAdSegments` keeps the `#EXTINF` and URI lines of ad segments and caches the URIs (120 s); the worker's `fetch` hook answers a cached URI with `BLANK_MP4`, an fMP4 init segment (`ftyp`, `moov` with an `mp4a` and an `avc1` track) with no samples, 1137 bytes. During ads every `EXT-X-TWITCH-PREFETCH` and `EXT-X-PRELOAD-HINT` line is removed, and `EXT-X-PART` lines with an ad URI.
- Reloads the player at the end of the break, at most one reload every 30 s (`ReloadCooldownSeconds`).

### CSAI

- The `no-fetch-if, edge.ads.twitch.tv` rule blocks client-side ad requests.
- Upstream changelog (May 2026): on every channel they observed, breaks end with the playlist marked as an ad while the segments are live; the ad itself arrives through `edge.ads.twitch.tv`.

### Spoofing

- "Ad watched" reporting is off by default (`DisableAdSpoofing = true`) because it may fingerprint the user.

## Purple 2.6.7 vs Brave's script

| Point | Purple 2.6.7 | Brave's script |
| --- | --- | --- |
| Token hash | `0828119d…` | `ed230aa1…` |
| Token request headers | `Client-ID`, `Client-Integrity` | the five F-05 headers plus `Client-ID` |
| Where the token request runs | worker | main window |
| Backup types | `frontpage`, `picture-by-picture` | `site`, `popout`, `mobile_web`, `embed`, `autoplay` |
| Page token request | unchanged | `popout`, no `parent_domains` |
| Detection | `stitched`, `Amazon`, `DCM,` anywhere in the text | specific markers, per segment |
| No ads | playlist regenerated | original text |
| No clean backup | ad segments stay | blank segment |
| CSAI | not blocked | `edge.ads.twitch.tv` blocked |
| Usher v2 | no | yes |

## Licenses

- Purple Adblock: Apache-2.0 from 2.7.0 (GPL-3.0 before).
- `brave/adblock-resources`: MPL-2.0 (repository license; the script file has no header of its own).
- `ryanbr/TwitchAdSolutions` (upstream of the script, the maintained fork of `pixeltris/TwitchAdSolutions`, archived): MIT, Copyright (c) 2020-present TwitchAdSolutions Contributors, the same license in both repositories. Brave's `vaft-ublock-origin.js` is ryanbr's file without its first line (the uBO resource header), checked 2026-10-10 against ryanbr's commit `74f1248`.
- Purple reimplements the behavior described here. Code copied verbatim from the script goes in its own file with the source URL and the MIT and MPL-2.0 notices, and is listed in `THIRD-PARTY-NOTICES.md`, which goes into every extension package; the userscript carries the MIT notice after its header (T-704).

## Links

- https://github.com/brave/adblock-resources/blob/master/resources/vaft-ublock-origin.js
- https://github.com/brave/adblock-lists/blob/master/brave-lists/experimental.txt
- https://github.com/brave/adblock-lists/blob/master/brave-lists/brave-twitch.txt
- https://github.com/ryanbr/TwitchAdSolutions
- https://github.com/ryanbr/TwitchAdSolutions/blob/master/CHANGELOG.md
