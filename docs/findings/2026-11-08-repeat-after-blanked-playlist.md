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

## Open

- Whether it happens on Twitch. Soaks with `--all-playlists` record what the player got; `time_order_probe.py` gives the live step of each segment it fetched. The breaks to look at end with merged or blanked playlists (no clean backup), which T-829 already counts.
- What the player does when the number after its last one is behind the start of the playlist (`liveNumberAt` returns null there too, so F-28 does not run). Not measured.
