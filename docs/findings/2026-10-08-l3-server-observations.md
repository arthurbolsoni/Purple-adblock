# Server behavior in the level 3 runs of 2026-10-08

Date: 2026-10-08, 03:10 to 05:16. Logged out. Builds: one per task (T-203 to T-501), each checked with L3-01, L3-02 (3 or 4 runs), L3-07 and L3-08.

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

## GQL through the page

With T-402 (04:55 to 05:04), the worker's token requests ran in the page. The recorder reads them from the bridge messages (`gqlRequest`, `gqlResponse`): player type, header names, status and token flags.

A midroll came during L3-07 on the dedicated profile (`/channel-c`, about 05:00): announced in two polls, then ad segments growing from 3 to 16. Purple sent 13 token requests through the page (`site` 3, `popout` 3, `frontpage` 2, `picture-by-picture` 2, `embed`, `mobile_web`, `autoplay` 1 each). Each came back with status 200, no error, and a token whose `player_type` was the one asked: the popout rewrite (F-12) did not touch them. Their header names were `authorization`, `client-id`, `client-integrity`, `client-session-id`, `client-version`, `host` and `x-device-id`.

The break overlapped the whitelist window of L3-07. Purple's events: `backupUsed` on every ad poll before the channel was added (`site`, `popout`), `whitelisted` on every poll while it was listed (1.8 to 10.3 s), and `backupUsed` on every ad poll after it was removed (`site`, `frontpage`, `popout`, `picture-by-picture`). The player fetched 7 ad segments from the network, all listed while the channel was whitelisted, as the whitelist means.

In the same window, both loads of one L3-01 run on `/channel-c` saw only the announcement of a `MIDROLL` (0 ad segments in 4 and 7 polls).

## A preroll on the T-501 build

L3-02 on `/channel-a` (fresh profile, about 05:12): 33 of 37 main polls inside a preroll. Purple sent 37 token requests through the page; 30 of the 58 backup polls had ad segments of their own. The player got `autoplay` (360p) backups on 21 polls and `site` on 7, and two polls with ad segments listed (`blankInserted` twice); it requested 4 of those ad segments and all 4 were answered in the worker. No ad overlay; no merge happened.

## Midrolls

- `/channel-b`, about 04:10: announced two polls ahead (B-034), then up to 20 `Amazon|` segments with `MEDIA-SEQUENCE` stopped ([page GQL headers](2026-10-08-page-gql-headers.md#server-observations)).
- `/channel-c`, about 04:29: a `MIDROLL` roll type whose ad segments had no `Amazon|` title. The logger's ad count (2.6.7 title markers) stayed at 0, while Purple requested 15 tokens and the playlists it delivered listed 3 ad segments under a stitched-ad marker (T-203). The L3-02 break check counted only `Amazon|`-style titles, so it skipped this break; the logger counts them since commit `2de15a4`.
- `/channel-j`, about 04:37: 21 of 25 main polls with ad segments, handled as above.
