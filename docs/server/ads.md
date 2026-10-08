# Ads

## SSAI

Server-side ad insertion: ad segments are stitched into the media playlist the player is already polling.

- Observed: a logged-out viewer opening a channel got a preroll (B-007). Across 30 s of polls, 232 `#EXTINF` lines were ads and 37 were live.
- The break comes with `#EXT-X-DISCONTINUITY` and `DATERANGE` entries (below).
- Frequency for logged-out and logged-in viewers: unknown (Q-001); it changed within one evening on one channel (B-024).
- The preroll playlist starts with 3 segments and grows by one per poll; ad segments come from the same CDN host as live ones; no `EXT-X-TWITCH-PREFETCH` during the break (B-026).
- A preroll playlist can go on into a `MIDROLL` ad and then live segments, still at `MEDIA-SEQUENCE` 0, up to 42 segments (B-039).
- Midroll stitched into the live playlist (2026-10-07, 1 break): announced 2 polls ahead at the end of the playlist (ad `DATERANGE` with a future `START-DATE`, `DISCONTINUITY`, the ad's `EXT-X-MAP`, a third prefetch line); ad segments are then appended while live ones leave; with no live segment left, `MEDIA-SEQUENCE` stops and the playlist grows until the pod is over; the live playlist then comes back further on (B-034).

## Markers

Observed in the preroll (B-008, B-009):

- `#EXTINF` title: `Amazon|<id>` for ad segments, `live` for live segments.
- `DATERANGE` `CLASS="twitch-stitched-ad"` with `ID="stitched-ad-..."`, `CLASS="twitch-trigger"`, `CLASS="twitch-ad-quartile"`.
- `X-TV-TWITCH-AD-*` attributes: `AD-FORMAT`, `AD-SESSION-ID`, `ADVERIFICATIONS`, `AF-ICR-AD-ID`, `AF-ICR-CREATIVE-ID`, `AF-ICR-MEDIA-DURATION`, `CLICK-BEACON-ID`, `CLICK-TRACKING-URL`, `CREATIVE-ID`, `DSA-SS-CONTEXT`, `DSA-SS-LOCATION`, `DSA-VERSION`, `LINE-ITEM-ID`, `LOUDNESS`, `POD-FILLED-DURATION`, `POD-LENGTH`, `POD-POSITION`, `QUARTILE`, `RADS-TOKEN`, `ROLL-TYPE`, `TRACKING-START`, `URL`.

Reported by Brave's script: `EXT-X-CUE-OUT`, `DATERANGE` `CLASS="twitch-maf-ad"`, ad URI patterns `/adsquared/`, `/_404/`, `/processing`.

Observed on 2026-10-07 and 08 ([midroll soak](../findings/2026-10-07-midroll-soak.md)):

- Ad segment titles `FT|<n>-<n>-<n>` and a 10-digit number, besides `Amazon|<id>`; the `twitch-stream-source` `DATERANGE` value (`X-TV-TWITCH-STREAM-SOURCE`) equals the title of the segments it covers, `live` on live ones (B-035). Purple's title markers (`stitched`, `Amazon`, `DCM,`) do not match the first two.
- `DATERANGE` `CLASS="twitch-maf-ad"` over live segments, with `PLANNED-DURATION`, `END-ON-NEXT` and `X-TTV-MAF-AD-` `AD-SESSION-ID`, `COMMERCIAL-ID`, `DECISION`, `FALLBACK-FORMATS`, `PRIMARY-POD`, `RADS-TOKEN`, `SDA-SEQUENCE-LENGTH`; values seen in every break: `PLANNED-DURATION=60.000`, `PRIMARY-POD` `6`, `FALLBACK-FORMATS` `5,3,4`, `SDA-SEQUENCE-LENGTH` `4`, and one `DECISION` value (Inferred: a base64 protobuf holding the same 6 and 5, 3, 4) (B-032).
- `DATERANGE` `CLASS="twitch-assignment"` (`X-TV-TWITCH-CLUSTER`, `X-TV-TWITCH-NODE`, `X-TV-TWITCH-SERVING-ID`) is not an ad marker (B-038).

The player's `.wasm` contains `stitched-ad`, `stitched-ad-break-start`, `stitched-ad-break-cont`, `stitched-ad-break-end` ([IVS SDK finding](../findings/2026-10-03-ivs-player-sdk.md)): the player itself reacts to these markers.

## CSAI

Client-side ad insertion (B-011, Reported):

- the playlist carries ad markers while every segment is live;
- the ad is requested from `edge.ads.twitch.tv` (`bp=preroll` or `bp=midroll`);
- upstream changelog, May 2026: every channel they observed ended every break this way.

Observed on 2026-10-07 and 08, logged out ([midroll soak](../findings/2026-10-07-midroll-soak.md)): on a channel page the main playlist gets a `twitch-maf-ad` `DATERANGE` over live segments 2 to 3 min after the channel loads and then every 4 to 5 min (B-032); without Purple, the page then asks `edge.ads.twitch.tv/ads` with `bp=midroll` 4 times and plays a video ad when one comes back (VAST), or receives an HTML display creative (JSON) (B-033). The page's player also requests a `picture-by-picture` master on its own and briefly plays it in a second `<video>` (B-037).

Observed on 2026-10-07 (B-025): the `/directory/all` page, logged out, requested `edge.ads.twitch.tv/ads/format` and `/ads` with `bp=midroll` right after loading, before any channel was opened; channel pages loaded directly made no such request. What the page does with the answer, and how it relates to a playlist break, is still open (Q-008).

## Backup player types

Reported (B-012): since March 2026, requesting a token with another `playerType` during a break often returns a playlist with ads too. Observed on 2026-10-07: during prerolls, `frontpage` and `picture-by-picture` backups often had ad segments (B-012); during one midroll, none of 12 backup polls did, while some carried the break's `DATERANGE` over live segments (B-028). Poll by poll during a preroll, each new backup token came back either inside its own preroll (`MEDIA-SEQUENCE` 0) or live (B-029). Brave's script tries `site`, `popout`, `mobile_web`, `embed`, then `autoplay` (360p). Purple 2.6.7 tries `frontpage`, `picture-by-picture`. During one stitched midroll on 2026-10-07, each backup token got its own pod (`POD-LENGTH` 2 to 4) and its playlist had ad segments (22 of 94 polls), its own break announced at the end over live segments (20) or live segments only (52) (B-036). Measured behavior per type: still incomplete (Q-004).

## `parent_domains`

Reported (B-013): Brave's script removes `parent_domains` from the usher URL ("stripping it gets rid of fake ads"). What changes in the response: unknown (Q-006).
