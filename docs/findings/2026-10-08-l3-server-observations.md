# Server behavior in the level 3 runs of 2026-10-08

Date: 2026-10-08, 03:10 to 04:30. Logged out. Builds: one per task (T-203 to T-407), each checked with L3-01, L3-02 (3 runs), L3-07 and L3-08.

## Probe

[`probes/l3_loads_probe.py`](probes/l3_loads_probe.py) prints one line per page load from the run reports in `~/purple-recordings/2026-10-08-t*` (outside the repo): scenario, mode, profile, channel, main polls with `Amazon|`-style ad segments, roll types, token requests.

```
python docs/findings/probes/l3_loads_probe.py ~/purple-recordings/2026-10-08-t203 ~/purple-recordings/2026-10-08-t602 ...
```

## Breaks per profile

The dedicated profile (`~/nodriver/profile-edge-purple`) opened `/channel-c`, the first directory card, in every L3-01 and L3-07 load. L3-02 opened a random card on a new profile each run.

| Time | Profile | Loads | Prerolls | Midrolls |
| --- | --- | --- | --- | --- |
| 03:10 to 03:46 | dedicated (`/channel-c`) | 15 | 0 | 0 |
| 03:52 to 04:20 | dedicated (`/channel-c`) | 20 | 1, a client-side navigation at about 03:58 | 0 |
| 04:23 to 04:30 | dedicated (`/channel-c`) | 5 | 5: every L3-01 load and the L3-07 load | 0 |
| 03:10 to 04:30 | fresh, 6 channels | 21 | 0 | 2: `/channel-b` about 04:10 (`Amazon\|` titles), `/channel-c` about 04:29 (numeric titles) |

- The prerolls of 04:23 to 04:30 ran 7 or 8 polls in L3-01 (up to 7 ad segments) and 28 polls in L3-07 (up to 8), at `MEDIA-SEQUENCE` 0.
- At the start of the night, the record-mode soak session (fresh profile, `/channel-a`) got a preroll at 03:21 and `picture-by-picture` prerolls at 03:36 and 03:50 (B-037).
- No fresh-profile load had a preroll all night, against 13 of 14 on 2026-10-07 from 20:47 (B-024).

## Midrolls

- `/channel-b`, about 04:10: announced two polls ahead (B-034), then up to 20 `Amazon|` segments with `MEDIA-SEQUENCE` stopped ([page GQL headers](2026-10-08-page-gql-headers.md#server-observations)).
- `/channel-c`, about 04:29: a `MIDROLL` roll type whose ad segments had no `Amazon|` title. The logger's ad count (2.6.7 title markers) stayed at 0, while Purple requested 15 tokens and the playlists it delivered listed 3 ad segments under a stitched-ad marker (T-203). The L3-02 break check counted only `Amazon|`-style titles, so it skipped this break.
