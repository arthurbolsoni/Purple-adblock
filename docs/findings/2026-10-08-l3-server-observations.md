# Server behavior in the level 3 runs of 2026-10-08

Date: 2026-10-08, 03:10 to 04:52. Logged out. Builds: one per task (T-203 to T-408), each checked with L3-01, L3-02 (3 or 4 runs), L3-07 and L3-08.

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
| 04:31 to 04:40 | dedicated (`/channel-c`) | 9 | 0 | 0 |
| 03:10 to 04:40 | fresh, 6 channels | 24 | 0 | 3: `/channel-b` about 04:10 (`Amazon\|` titles), `/channel-c` about 04:29 (numeric titles), `/channel-j` about 04:37 |

- The prerolls of 04:23 to 04:30 ran 7 or 8 polls in L3-01 (up to 7 ad segments) and 28 polls in L3-07 (up to 8), at `MEDIA-SEQUENCE` 0.
- At the start of the night, the record-mode soak session (fresh profile, `/channel-a`) got a preroll at 03:21 and `picture-by-picture` prerolls at 03:36 and 03:50 (B-037).
- No fresh-profile load had a preroll all night, against 13 of 14 on 2026-10-07 from 20:47 (B-024).

## Backup masters on the v2 path

With T-404, backups reuse the page's usher request: the `/api/v2/` path and its 22 query keys, with `token`, `sig` and `p` replaced. In a midroll on `/channel-j` (L3-02, fresh profile, about 04:37), Purple got 17 masters this way, all with status 200 and none failed:

| playerType | Masters | Variants |
| --- | --- | --- |
| `site` | 5, plus the page's own | 5 |
| `popout` | 4 | 5 |
| `frontpage` | 4 | 5 |
| `mobile_web`, `embed` | 1 each | 5 |
| `autoplay`, `picture-by-picture` | 1 each | 2 (360p, 160p) |

The page's own master in that load came from the same path with a `site` token. In the same break, 10 of 30 backup polls had ad segments; the player got 1 poll with 2 ad segments listed, requested both, and both were answered in the worker (none from the network).

## The page token as popout

With T-408 (04:42 to 04:52), the page's own `PlaybackAccessToken` asked for `popout`. All 13 page masters of these runs came from tokens with `player_type` `popout` (flags `server_ads`, `show_ads`, `https_required` true), from the v2 usher path, and every load played.

| Profile | Loads | Prerolls |
| --- | --- | --- |
| dedicated (`/channel-c`) | 8 | 2, both loads of one L3-01 run (8 polls each) |
| fresh (`/channel-d`, `/channel-c`, `/channel-w`, `/channel-b`) | 4 | 1, `/channel-d`: 29 of 29 polls, the night's first fresh-profile preroll |
| directory | 2 | - |

In the two `/channel-c` prerolls, the player requested 2 ad segments each time and both were answered in the worker; in the `/channel-d` one it requested none of the 3 listed.

## Midrolls

- `/channel-b`, about 04:10: announced two polls ahead (B-034), then up to 20 `Amazon|` segments with `MEDIA-SEQUENCE` stopped ([page GQL headers](2026-10-08-page-gql-headers.md#server-observations)).
- `/channel-c`, about 04:29: a `MIDROLL` roll type whose ad segments had no `Amazon|` title. The logger's ad count (2.6.7 title markers) stayed at 0, while Purple requested 15 tokens and the playlists it delivered listed 3 ad segments under a stitched-ad marker (T-203). The L3-02 break check counted only `Amazon|`-style titles, so it skipped this break; the logger counts them since commit `2de15a4`.
- `/channel-j`, about 04:37: 21 of 25 main polls with ad segments, handled as above.
