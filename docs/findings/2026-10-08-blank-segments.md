# Blank segments for the ad segments no backup replaced

Date: 2026-10-08. Task: T-502 (F-14).

## Brave's blank segment

The reference is `resources/vaft-ublock-origin.js` in `brave/adblock-resources`, commit `60346357addf85035833f3731cb025b058f9600d` (2026-08-28), downloaded on 2026-10-08 to a scratch folder outside the repo.

- `stripAdSegments` keeps the `#EXTINF` and URI lines of ad segments and puts each URI in `AdSegmentCache` with the time of the poll. Entries older than 120 s are pruned, and the cache holds at most 1000.
- The worker's `fetch` hook answers a cached URI with `new Response(BLANK_MP4)` and never requests it from Twitch.
- `BLANK_MP4` is 1137 bytes: `ftyp` (`mp42`, `isom`, `dash`, `avc1`, `iso6`, `hlsf`) and a `moov` with an `mp4a` and an `avc1` track, an `mvex`, and no `moof`/`mdat`. It is an fMP4 init segment without samples: it has no duration.
- While a poll has ad segments, every `EXT-X-TWITCH-PREFETCH` and `EXT-X-PRELOAD-HINT` line is removed ("No low latency during ads"), and so is any `EXT-X-PART` line with an ad URI.

## What Purple does

T-502's first wording asked for "a blank segment with the same duration" and "no ad URI in the output". Brave's blob has no duration, and the script keeps the ad URIs in the playlist. Purple follows the reference:

- `BLANK_MP4` is copied verbatim into `serviceWorker/src/modules/player/blank-segment.ts`, with the source URL, the MPL-2.0 notice of `brave/adblock-resources` and the MIT notice of `ryanbr/TwitchAdSolutions` (`docs/research.md`, licenses). A unit test checks its SHA-256 (`a49d65cb…`).
- `blankAds` (`m3u8.ts`) lists the URIs of the ad segments the merge left. The playlist keeps their lines, so `MEDIA-SEQUENCE`, segment count and durations do not change. An `EXT-X-MAP` used only by ad segments is listed too, so fMP4 ads (B-035, the `FT|` preroll) do not fetch their init segment from Twitch.
- Removed lines: rule 3 in `CLAUDE.md` keeps every tag that is not part of the ad, so Purple removes fewer lines than Brave. It removes the prefetch, preload and part lines that point at ad media: the parts of an ad segment, and those after the last segment when it is an ad or when they follow a break announced after it (B-034), and any with an ad URI pattern. Their URIs are answered blank too.
- `Player` keeps the URIs with the time of the last poll that listed them; the worker's first route answers them with `BLANK_MP4` for 120 s after that poll.
- It runs on every ad poll with no clean backup, including the first poll of a break, before any backup token is ready. In the 2026-10-07 soak, that first poll reached the player as Twitch sent it.
- `blankInserted` (F-17) counts the segments blanked for the first time; `stripFallback` (default on) turns it off.

## Tests

TS-502: `blank-segment.spec.ts`, `blankAds` in `m3u8.spec.ts`, "blank segments" in `worker.int.spec.ts`, and the debug event sequence in `debug.int.spec.ts` (first poll: `adDetected`, `blankInserted` with 3; second: `adDetected`, `backupUsed`).

## Live runs on the T-502 build

Worktree build of T-406 + T-502, 03:52 to 04:01.

| Scenario | Runs | Result | Breaks |
| --- | --- | --- | --- |
| L3-01 | extension, userscript | passed | a `PREROLL` on the userscript run's client-side navigation load (`/channel-c`) |
| L3-07 | extension | passed | none |
| L3-08 | extension, userscript | passed | - |
| L3-02 | 3, fresh profiles | passed | none (`/channel-c`, `/channel-b`, `/channel-d`) |

The preroll in L3-01 (userscript, dedicated profile, `/channel-c`; the direct load of the same session had none):

- Main playlist: 7 polls, all inside the preroll (`MEDIA-SEQUENCE` 0, 3 growing to 7 `Amazon|` segments, no prefetch).
- Backups: 10 token requests, one for each of the 7 F-09 types and a second one for `site`, `popout` and `frontpage`; of 9 backup polls, 3 were inside their own preroll (3 or 4 segments, `MEDIA-SEQUENCE` 0) and 6 were live (14 segments).
- To the player: the first poll, before any backup token was ready, went with its 3 ad segments listed; the other 6 were clean backups.
- Ad media: of the 3 ad segments listed, the player requested 1; it was answered in the worker and nothing was fetched from the network for it (`adMedia`: listed 3, requested 1, from network 0, answered by Purple 1).
- The video was playing at the end of the check, with no player error.

The level 3 summary now has `adMedia`: the ad segments listed in the playlists the player got, how many it requested, and how many of those were fetched from the network versus answered in the worker. It comes from the worker log, where a URL the player requested with no `network` fetch was answered by Purple. L3-02, L3-03 and the soak report accept a break whose listed ad segments never reached the network.

## The announced break's prefetch lines

On the T-401 build, a midroll in L3-02 (`/channel-b`) failed the check above: the player fetched 2 of the 3 ad segments of the first poll with ad segments from the network ([page GQL headers](2026-10-08-page-gql-headers.md)). The two polls before it announced the break (B-034) and went to the player untouched as `MARKED_LIVE` (T-202). An announcement ends with two prefetch lines that point at the first ad segments, and those two segments are the ones fetched.

Brave's script removes every prefetch line as soon as a playlist carries ad tags, announcement included ("LL-HLS prefetch/preload hints can point at upcoming ad segments before any EXTINF line or ad signifier has materialized in the playlist"). Purple now does the same for the prefetch, preload and part lines after a stitched-ad marker announced past the last segment: they go, and their URIs are answered blank. The rest of the announced playlist stays as Twitch sent it, with no backup lookup and no pause/play. A `MARKED_LIVE` playlist without such an announcement, such as a `twitch-maf-ad` slot, still comes back untouched. TS-502 covers it; the next soak checks it live.

## Open

- What the player shows and how it recovers when a whole break is blank: Brave's script pairs the blank segment with a player reload at the end of the break (F-15, T-601).
