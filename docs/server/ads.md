# Ads

## SSAI

Server-side ad insertion: ad segments are stitched into the media playlist the player is already polling.

- Observed: a logged-out viewer opening a channel got a preroll (B-007). Across 30 s of polls, 232 `#EXTINF` lines were ads and 37 were live.
- The break comes with `#EXT-X-DISCONTINUITY` and `DATERANGE` entries (below).
- Frequency for logged-out and logged-in viewers: unknown (Q-001).

## Markers

Observed in the preroll (B-008, B-009):

- `#EXTINF` title: `Amazon|<id>` for ad segments, `live` for live segments.
- `DATERANGE` `CLASS="twitch-stitched-ad"` with `ID="stitched-ad-..."`, `CLASS="twitch-trigger"`, `CLASS="twitch-ad-quartile"`.
- `X-TV-TWITCH-AD-*` attributes: `AD-FORMAT`, `AD-SESSION-ID`, `ADVERIFICATIONS`, `AF-ICR-AD-ID`, `AF-ICR-CREATIVE-ID`, `AF-ICR-MEDIA-DURATION`, `CLICK-BEACON-ID`, `CLICK-TRACKING-URL`, `CREATIVE-ID`, `DSA-SS-CONTEXT`, `DSA-SS-LOCATION`, `DSA-VERSION`, `LINE-ITEM-ID`, `LOUDNESS`, `POD-FILLED-DURATION`, `POD-LENGTH`, `POD-POSITION`, `QUARTILE`, `RADS-TOKEN`, `ROLL-TYPE`, `TRACKING-START`, `URL`.

Reported by Brave's script: `EXT-X-CUE-OUT`, `DATERANGE` `CLASS="twitch-maf-ad"`, ad URI patterns `/adsquared/`, `/_404/`, `/processing`.

The player's `.wasm` contains `stitched-ad`, `stitched-ad-break-start`, `stitched-ad-break-cont`, `stitched-ad-break-end` ([IVS SDK finding](../findings/2026-10-03-ivs-player-sdk.md)): the player itself reacts to these markers.

## CSAI

Client-side ad insertion (B-011, Reported):

- the playlist carries ad markers while every segment is live;
- the ad is requested from `edge.ads.twitch.tv` (`bp=preroll` or `bp=midroll`);
- upstream changelog, May 2026: every channel they observed ended every break this way.

Not observed by us yet (Q-008).

## Backup player types

Reported (B-012): since March 2026, requesting a token with another `playerType` during a break often returns a playlist with ads too. Brave's script tries `site`, `popout`, `mobile_web`, `embed`, then `autoplay` (360p). Purple 2.6.7 tries `frontpage`, `picture-by-picture`. Measured behavior per type: unknown (Q-004).

## `parent_domains`

Reported (B-013): Brave's script removes `parent_domains` from the usher URL ("stripping it gets rid of fake ads"). What changes in the response: unknown (Q-006).
