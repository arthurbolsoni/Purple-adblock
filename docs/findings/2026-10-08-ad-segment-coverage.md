# Ad segments by title, `DATERANGE` range and stream source

Date: 2026-10-08. Tasks: T-203, T-204. Behaviors: B-034, B-035, B-036, B-040.

## Question

The [midroll soak](2026-10-07-midroll-soak.md) found ad segments that carry none of the F-02 segment markers: titles `FT|<n>-<n>-<n>` and a 10-digit number, on plain segment URIs (B-035). Two midrolls and a preroll reached the player whole. T-203 needs a rule that finds these segments without marking live ones. Three signals are candidates, in a playlist with a `twitch-stitched-ad` marker:

1. the segment title is not `live`;
2. the segment falls inside a `twitch-stitched-ad` `START-DATE` + `DURATION`;
3. the `twitch-stream-source` value in force at the segment's time is not `live`.

## Probe

[`probes/stitched_coverage_probe.ts`](probes/stitched_coverage_probe.ts) reads the `serverText` entries of the soak recordings (`~/purple-recordings/2026-10-07-soak`, `2026-10-07-soak-test`, `2026-10-07-l3-03`; outside the repo). These entries are the full text of every media playlist the worker fetched with an ad marker: the main playlist and Purple's backups. For each playlist with a `twitch-stitched-ad` range, the probe classifies every segment by title kind, by range coverage (more than half of the segment inside a range) and by the stream source at its `PROGRAM-DATE-TIME`. It prints counts only.

```
bun docs/findings/probes/stitched_coverage_probe.ts ~/purple-recordings/2026-10-07-soak ~/purple-recordings/2026-10-07-soak-test ~/purple-recordings/2026-10-07-l3-03
```

## Result

5 714 playlists with ad markers; 814 of them with a `twitch-stitched-ad` range; 147 distinct ranges (one per ad of a pod, main playlist and backups) on 5 channels.

| Title | Range | Stream source | Segments |
| --- | --- | --- | --- |
| `Amazon\|…` | inside | `Amazon\|…` | 6 056 |
| `FT\|…` | inside | `FT\|…` | 1 436 |
| 10-digit number | inside | the same number | 1 597 |
| `live` | outside | `live` | 6 224 |

No other combination occurred: no `live` segment inside a range or under another source, and no ad title outside a range or under a `live` source.

- 110 of the 814 playlists had only `live` segments. In all 110 every range started at or after the end of the last segment: the break was announced, not yet stitched (B-034).
- 49 `live` segments started inside a range but were covered for less than half of their length. A range runs a little past the segments of its ad, for example `DURATION=20.234` over ten 2.000 s segments, so the first live segment after the ad starts 0.234 s before the range ends (B-040). A rule on the segment's start alone would take these 49 live segments as ads.

## Decisions

- T-203: in a playlist with a stitched-ad marker (`CLASS` starting `twitch-stitched` or `ID` starting `stitched-ad`), a segment is an ad when any of the three signals holds. A range covers a segment when more than half of the segment lies inside it. `twitch-maf-ad` is not a stitched-ad marker; its playlists stay `MARKED_LIVE`.
- The hand-written `media-marked-live.m3u8` fixture had a `twitch-stitched-ad` range over live segments, a shape the recordings never showed. It now holds the observed `MARKED_LIVE` shape, a `twitch-maf-ad` slot over live segments (B-032). Under T-203, a range over live segments makes those segments ads.
- T-204: a backup with a stitched-ad marker and no ad segment is not clean. It is dropped like a backup with ads: its server is removed and its type gets a new token. Its live segments still serve the merge, which copies only segment lines from a backup. The other choice was to strip the announcement and deliver the rest of the backup. It was not taken for three reasons:
  - The announcement ends with prefetch lines that point at the backup's first ad segments, and those lines would have to be identified and dropped too.
  - The same backup has ad segments two polls later (B-034).
  - During a midroll another type is often clean: of 94 backup polls in one break, 52 had live segments only (B-036).

## Live runs on the T-203 + T-204 build

- L3-01: passed in both modes (extension, userscript), 2 of 2 runs; no ad break came up.
- L3-02: 3 of 3 runs passed; no preroll in any of them (23 to 27 polls each, all without ads).
- L3-08: passed in both modes.

Midrolls only come up over hours of watching. A soak on this build is recorded in its own finding.

## Open

- The main playlist's own announcement (B-034) passes as `MARKED_LIVE` (T-202). Since 2026-10-08 its prefetch lines to the first ad segments go ([blank segments](2026-10-08-blank-segments.md#the-announced-breaks-prefetch-lines)). Whether the player starts the ad overlay from the announcement itself is not isolated (T-601).
