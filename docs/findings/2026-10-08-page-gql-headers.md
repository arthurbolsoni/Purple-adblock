# Page GQL headers on the backup token requests

Date: 2026-10-08. Task: T-401 (F-05). Scenario: L3-02.

## What changed

The page `fetch` hook reads the request headers of the page's `gql.twitch.tv/gql` calls: `Client-Integrity`, `X-Device-Id` (or `Device-ID`), `Authorization`, `Client-Version` and `Client-Session-Id`. It does not read their responses. When one of them changes, the page sends the known set to every worker (`setGqlHeaders`). The worker's `PlaybackAccessToken` requests carry them, with `Client-ID`.

For the live check, the worker logger records the names of the headers on the worker's GQL requests, never their values (`tokenHeaders` in the run summary). L3-02 checks `x-device-id` and `client-version` when a break makes Purple request tokens.

## Live runs on the T-401 build (worktree build of T-502 + T-401, 04:02 to 04:11)

| Scenario | Runs | Result | Breaks |
| --- | --- | --- | --- |
| L3-01 | extension, userscript, then 3 more in extension mode | passed | none (`/channel-c`) |
| L3-07 | extension | passed | none |
| L3-08 | extension, userscript | passed | - |
| L3-02 | 3, fresh profiles | 2 passed, 1 failed | a `MIDROLL` on the third run (`/channel-b`) |

In that midroll, Purple requested 15 tokens (`site` 4, `popout` 4, `frontpage` 3, the other four types once). Their header names were `authorization`, `client-id`, `client-integrity`, `client-session-id`, `client-version`, `host` and `x-device-id`. The new check passed.

Logged out, the page's GQL requests therefore carried a non-empty `Authorization` header; its value was not recorded.

The run failed on the T-502 check: one of the 25 polls delivered to the player listed 3 ad segments, and the player fetched 2 of them from the network. The two polls before it only announced the break (B-034); as `MARKED_LIVE` they reached the player untouched, with prefetch lines pointing at the first ad segments. The first poll with ad segments was blanked (`blankInserted` once), then backups replaced every poll (`site` 8, `popout` 5, `frontpage` 5), with no ad overlay and the video playing at the end. The two segments fetched match the two prefetch lines of an announcement. The worker log of L3-02 runs is not kept in the report, so the order of the requests is not confirmed. The [blank segments finding](2026-10-08-blank-segments.md) follows this up.

## Server observations

The midroll on `/channel-b` (fresh profile, about 04:10): announced two polls ahead with `twitch-stitched-ad` and `twitch-ad-quartile` over 14 live segments (`ROLL-TYPE` `MIDROLL`); ad segments then grew from 3 to 20 while `MEDIA-SEQUENCE` advanced from 9774 and then stopped at 9788, as in B-034.
