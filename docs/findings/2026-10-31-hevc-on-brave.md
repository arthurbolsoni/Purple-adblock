# HEVC on Brave (T-824, #105)

Date: 2026-10-31. Probe: [`hevc_support_probe.py`](probes/hevc_support_probe.py). Recording: soak `ext-hop` of 2026-10-30 (`~/purple-recordings/2026-10-30-t825`, outside the repo; [same segment twice](2026-10-31-same-segment-twice.md)).

## Decoding

Brave 156.1.98.60 on Linux, headless, a new temporary profile (`hevc_support_probe.py codecs`):

| Codec | `MediaSource.isTypeSupported` | `canPlayType` |
| --- | --- | --- |
| HEVC Main (`hvc1.1.6.L93.B0`, `hev1.1.6.L150.90`) | false | "" |
| HEVC Main 10 (`hvc1.2.4.L153.B0`) | false | "" |
| AV1 (`av01.0.08M.08`) | true | probably |
| AVC (`avc1.4D401F`) | true | probably |

`mediaCapabilities.decodingInfo` for HEVC 1080p60: not supported. The same with Chromium's VA-API decoding flags (`--vaapi`), on a machine whose VA-API driver (NVDEC) lists HEVC Main, Main 10 and Main 12.

## What Twitch lists

`/channel-aj` broadcasts a 1440p60 HEVC source. The page's master (v2) in the logged-out Brave session left it out in `com.amazon.ivs.unavailable-media`, with the filter reason `FR_CODEC_NOT_REQUESTED` and the authorization reason `AUTHZ_NOT_LOGGED_IN`. It listed AVC variants only (`avc1.64002A`, `avc1.4D401F`), served as fMP4 (B-023). The 2026-10-07 session on Edge, logged out, had the same 1440p60 HEVC variant left out with `AUTHZ_NOT_LOGGED_IN` ([backups](2026-10-07-backups-and-rewritten-playlists.md)).

## T-824

On this machine Brave neither decodes HEVC nor gets an HEVC variant from Twitch, logged out, so issue #105's black video on HEVC streams cannot be reproduced with it. That needs a logged-in session in a browser that plays HEVC. The Purple paths that broke HEVC before 2.7.0 are covered: T-101 (a playlist without ads reaches the player untouched) and T-407 (a backup in the codec family of the player's variant).
