# F-28 skipped after a blanked or merged playlist (T-832)

Date: 2026-11-08. Level 1 only, on `main` at `632e988`. Probe: [`repeat_after_blank_probe.ts`](probes/repeat_after_blank_probe.ts). Found with a model of the numbering across polls (the page's and the backups' numbers, B-048, B-054; Purple's F-23 to F-28; a player that asks for the number after the last one it fetched), checked with a model checker; reproduced on the code with the probe.

## The code

`followSequence` checks for a live segment the player already has (F-28) only when the playlist given before has a live number:

```ts
if (this.setting?.restartOnRepeat === false || previous.newestLive == null) return;
```

`newestLive` is `liveNumberAt(text, newest)`, null for a playlist with ad segments. Inside a break with no clean backup Purple gives the page's own playlist:

- blanked (F-14): its ad segments are still listed;
- merged (E5): the ad's `twitch-stitched-ad` `DATERANGE` stays, so the backup segments that replaced the ads still count as ad segments. A page playlist with all five of its ad segments replaced gave `newestLive` null.

## The end of a break

When the break is over the page's playlist comes back numbering the stream further ahead (B-054: 1 to 5 per midroll). If the playlist given before it was the page's, blanked or merged, F-28 does not run, and the number after the player's last one lists a live segment the player already has.

The probe, with the page 4 further ahead after the break:

| Break | Before the break's end | At the break's end (the player's numbers 108 or 109 on) | Restart |
| --- | --- | --- | --- |
| blanked: a clean backup gave live 106, then the page's playlist blanked | 107, 108 blank | live 105 and 106 again | none |
| merged: every poll's backup unclean, the page's ads replaced by its live segments | live 104 to 107 | live 104 to 107 again | none |

The player fetches those segments again: their audio goes over itself and their video is appended again, so the picture falls behind the sound by that many segments, as in T-826; on an fMP4 channel both go into one SourceBuffer (T-827).

With a clean backup on every poll of the break, the model found no live segment fetched again and no wait for numbers that do not come: with a 14-segment window, the page 4 further ahead after each break, backups 0 or 5 behind and two breaks, all 134,574 states.

## The Quint model (T-010)

`bun run model:check` breaks `noRepeat` of `test/model/player.qnt` the same way, also with one poll at a time. In the trace it keeps, the backup has an ad segment of its own, so it is unclean and the page's ads get its live segments (merged), then the type is left out for 5 s (F-10, blanked); the page comes back 4 further ahead and the player fetches live 23 and 24 again. The real `Player` replays that trace (`player-model.int.spec.ts`).

`bun run model:verify` (TLC over every state up to one break and the polls after it) found the shortest sequence, 19 steps with one poll at a time: a clean backup gives live 25; the next backup has ads at the page's ad positions, so the page's playlist is given blanked; the type is then left out (F-10) and the page's playlist blanked again; the break ends with the page 4 further ahead, and the player fetches live 24 and 25 again.

## Fix (2026-11-08)

Tests: [`polls.spec.ts`](../../serviceWorker/test/unit/modules/player/polls.spec.ts), TS-832, written before the fix and failing on `main` (`1c2d610`): the blanked break fetched live 105 and 106 again, the merged one live 104 to 107, with no restart.

`Player` keeps, in `delivered.newestLive`, the newest live segment the player has: for a playlist without ads the live number under its newest number, as before; for the page's playlist merged or blanked, the live number of its newest segment that is not blank (`newestLiveContent` in `sequence.ts`: `EXT-X-TWITCH-LIVE-SEQUENCE` + its index, leaving out the ad segments no backup replaced); the larger of that and the one kept before, until a restart. F-28 then runs at the end of the break: the page's playlist 4 further ahead lists live segments at or behind the one kept, and the player is restarted once. A break that ends with the page's playlist numbered as before gets no restart. `player.qnt` keeps the same value (`held`, `carried`); `noRepeat` holds in all 1,161,842 states of `exhaustivePolls` (`docs/tests.md`). With the kept value left out, or the live content of the merged and blanked playlists left out, the TS-832 tests and 19 replays fail.

## On twitch.tv (2026-11-08)

Two soaks of 90 minutes on Brave, logged out, with the build of the fix, Purple's debug events and every media playlist kept: one with the product defaults, one with no backups (`backupPlayerTypes=[]`, `lowQualityFallback=false`), so that every break is the page's playlists blanked. 44 channel loads, 24 and 20, each left 150 s after its load or its last break. The breaks the logs counted: 3 prerolls (`SSAI`), 4 midrolls announced by markers over live segments (`MARKED_LIVE`) and 17 client-side ad slots (`MAF`).

The soak with no backups logged 4 `segmentRepeat` events of the fix, at the end of 2 prerolls and 2 `MARKED_LIVE` midrolls (counts 22, 22, 14, 22), and the player fetched 4 segment files twice in the whole run, one at each restart. In those 4 breaks the page's playlist before the end listed 39 segments, 24 of them ad segments first and 15 live ones after (B-060), numbered from the break's start; the playlist after it numbers the same segment files under the same numbers with live numbers 24 lower. `EXT-X-TWITCH-LIVE-SEQUENCE` plus the index counts the ad segments, so it gave the live segments after the ads a live number 24 too high, and the fix read the page's next playlist as listing segments the player had. It listed none: past the last number given, the page's playlist listed 1 number in each of the 4, whose file the player had not fetched. [`replay_session_probe.ts`](probes/replay_session_probe.ts) replays the recorded playlists through `Player`: `main` (`1c2d610`) makes no restart in them and the first version of the fix made the 4.

`newestLiveContent` now counts the page's playlist only when its ad segments are the end of it (ad segments in place of live ones, the case of the tests above, in which the Quint model finds the repeat); with live segments after them, only the segments before the first ad count, none in these 4. TS-832 has this as a test (written failing, the fix then changed); the replay of the recorded session makes no restart. The case of this finding, a break whose last playlists were the page's and that ends with the page's playlist listing live segments the player has, was not seen on twitch.tv: the 4 breaks with only the page's playlists in these soaks did not have it. It is checked by the level 1 tests and the model.

## Open

- Whether it happens on Twitch: not in the 4 breaks with only the page's playlists above. The breaks to look at end with merged or blanked playlists (no clean backup), which T-829 already counts; `time_order_probe.py` gives the live step of each segment the player fetched.
- What the player does when the number after its last one is behind the start of the playlist (`liveNumberAt` returns null there too, so F-28 does not run). Not measured.
