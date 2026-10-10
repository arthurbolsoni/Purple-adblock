# Captured masters, backups during a preroll, and the player stall on rewritten playlists

Date: 2026-10-07 · Edge 154.0.4258.62, nodriver 0.50.3 · logged out · extension mode · build: branch `melhorias-bloqueio` after T-107/T-111, with and without T-104 (uncommitted at the time) · Used by: T-101, T-104, T-105, T-405, T-501, T-502, L3-01

## Method

- `probes/master_capture_probe.py`: on a fresh profile (which got a preroll on every load measured), intercepts every usher response with CDP `Fetch` and saves the bodies to `~/purple-recordings/` (outside the repo). Sanitized copies are the fixtures `master-site-v2.m3u8` and `master-frontpage-v1.m3u8`.
- L3-01 on fresh profiles, with the recorder also logging `<video>` events, the outcome of every `play()` call and the media playlists the player got from Purple's hook.
- Four local builds, not committed, each changing one thing in the T-104 build (table below).

## Results

### Masters

| Master | Request | Layout | Variants |
| --- | --- | --- | --- |
| page (`site`) | `/api/v2/channel/hls/<channel>.m3u8` with 22 query keys: `acmb`, `allow_source`, `browser_family`, `browser_version`, `cdm`, `enable_score`, `fast_bread`, `include_unavailable`, `lang`, `os_name`, `os_version`, `p`, `platform`, `play_session_id`, `player_backend`, `player_version`, `playlist_include_framerate`, `reassignments_supported`, `sig`, `supported_codecs`, `token`, `transcode_mode` | 24 `EXT-X-SESSION-DATA` lines; no `EXT-X-MEDIA`; `STREAM-INF` with `IVS-NAME`, `STABLE-VARIANT-ID`, `SCORE`, `IVS-VARIANT-SOURCE` | 5 AVC, on `sae12.playlist.ttvnw.net/v1/playlist/<opaque>.m3u8`, first line 480p30 |
| Purple's `frontpage` backup | `/api/channel/hls/<channel>.m3u8` with Purple's 9 keys | one `#EXT-X-TWITCH-INFO` line with the same keys as the session data; `EXT-X-MEDIA` with `NAME` per `VIDEO` group | 5 AVC on `sae12.playlist.ttvnw.net`, first line 360p30 |
| Purple's `picture-by-picture` backup | same | same | 2 (360p30, 160p30) on `sae11.playlist.ttvnw.net` |

- Session data keys: `com.amazon.ivs.unavailable-media` (base64 JSON of variants left out, with reasons such as `AUTHZ_NOT_LOGGED_IN` for 1440p60 HEVC), `NODE`, `MANIFEST-NODE-TYPE`, `MANIFEST-NODE`, `SUPPRESS`, `SERVER-TIME`, `TRANSCODESTACK`, `TRANSCODEMODE`, `USER-IP`, `SERVING-ID`, `CLUSTER`, `ABS`, `VIDEO-SESSION-ID`, `BROADCAST-ID`, `STREAM-TIME`, `FUTURE`, `B`, `D`, `USER-COUNTRY`, `MANIFEST-CLUSTER`, `ORIGIN`, `C`, `E`, `CHANNEL-METADATA`. `C` and `E` hold a base64 URL of a segment on `<n>.rufio.hls.live-video.net`; the player fetched 5 segments from that host on every load, including loads without ad markers.
- Purple 2.6.7's variant regex reads 0 variants from all three masters: every variant is on `*.playlist.ttvnw.net`, and the regex expects `https://video…`. With 2.6.7 the backup list is always empty.
- Variants are not sorted by quality, so `bestQuality()` (first line in 2.6.7) picked 360p30 from the `frontpage` master.
- The sanitizer did not cover `SERVING-ID`, `VIDEO-SESSION-ID`, `BROADCAST-ID`, `USER-COUNTRY`, `C` and `E`; it does now, in both the session data and `#EXT-X-TWITCH-INFO` forms.

### Backups during a preroll (T-104 build)

With T-104 the backups load. Purple saw ad markers in 7 of 8 fresh-profile loads. Over those polls, the `frontpage` backup had ad markers on 112 of 121 and was clean on 9 (all in one load); `picture-by-picture` had them on 61 of 95 and was clean on 34 (in 5 loads). On every poll where `frontpage` has ads, the code starts a new `frontpage` token and usher request (T-105).

### Player stall

L3-01 on fresh profiles. "Rewritten" is the output of `generateM3u8`: `#EXTM3U`, `TARGETDURATION`, `MEDIA-SEQUENCE`, `#EXTINF:<duration>` without title, and the URIs; `PROGRAM-DATE-TIME`, `DATERANGE`, `DISCONTINUITY`, `EXT-X-TWITCH-*` and the titles are gone.

| Build | Playlist with ads gets | Playlist without ads gets | Loads that played |
| --- | --- | --- | --- |
| before T-104 | original text (the backup step throws on `fetch(undefined)` and the T-103 safety net returns Twitch's playlist) | rewritten | 3 of 4 (one rebuffered at 1.9 s) |
| T-104 | rewritten, ad segments replaced where a backup has a live segment at the same second; a clean backup's whole playlist (E4) | rewritten | 1 of 8 |
| T-104 without the second pause/play (`freeStreamChanged`) | as T-104 | rewritten | 0 of 4 |
| T-104, merge without backups | rewritten | rewritten | 1 of 4 |
| T-104, original text on the ad path | original | rewritten | 2 of 4 (the 2 stalled loads had no ad markers) |
| T-104, original text on both paths | original | original | 6 of 6 |

- In the stalled loads the `<video>` element got no `loadstart` in 25 s and no `play()` call; the worker logged no player error. In the loads that played, `loadstart` came 0.3 to 0.4 s after Purple's `play` command at the end of its pause/play cycle (E6).
- On the dedicated profile, loads without ad markers played on rewritten playlists (runs E, F, H and I in [e2e harness](2026-10-07-e2e-harness.md)). The difference with fresh profiles was not found.
- Inferred: the player often does not start on playlists rewritten by `generateM3u8` (C-01). T-104 made it show on ad playlists, because before T-104 the exception returned Twitch's text.

### After T-101

T-101 returns a playlist without ads as received and edits only the `#EXTINF` and URI lines of replaced ad segments. L3-01 after the change:

| Profile | Runs | Loads | Loads with ad markers | Loads that played |
| --- | --- | --- | --- | --- |
| fresh | 6 | 12 | 2 (run 2: `picture-by-picture` clean on 9 polls, its playlist replaced the main one) | 12 |
| dedicated, extension and userscript | 2 | 4 | 0 | 4 |

Whether run 2 showed the ad overlay was not recorded (the overlay joined the L3-01 details from run 4 on). Fresh profiles had ad markers in 15 of 16 loads earlier in the evening and in 2 of these 12, so the ad path after T-101 has 2 loads.

### After T-105

Two more fresh-profile runs passed L3-01. In one of them both loads had ad markers: `frontpage` had ads on 6 polls, `picture-by-picture` was clean on 8 polls and its playlist replaced the main one (E4). In both loads the video played and the ad overlay was not showing at the check (25 s plus 3 s after navigation). Inferred: the replacement played at 360p30, the best variant of the `picture-by-picture` master (B-019). Token requests per load with ad markers: 5 GQL and 4 to 5 backup usher requests over 6 to 8 backup polls.

## Open

- What the dedicated profile has that lets the player start on rewritten playlists (T-806). 2026-10-08: the channel, not the profile: the regenerated playlists lack `EXT-X-MAP`, fatal on fMP4 channels only ([rewritten playlist stall](2026-10-08-rewritten-playlist-stall.md)).
- How often a clean backup exists during a break, over more sessions and channels (L3-02, Q-004).
- Whether a segment from a backup rendition can be spliced into the main playlist without `EXT-X-DISCONTINUITY` (T-501): the stall above happened with and without splicing.
