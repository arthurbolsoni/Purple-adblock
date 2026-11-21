# F-28 restarts the player with no repeat after a playlist behind (T-833)

Date: 2026-11-20. Level 1, `main` at `6f36897` (2.7.3) against `c7e89c5` (2.7.2). Probe: [`t833_differential_probe.ts`](probes/t833_differential_probe.ts). Origin: the maintainer's hypothesis for issue #112 after 2.7.3 (T-833): the changes of T-831 and T-832.

## The code

2.7.3 (T-832) keeps the newest live segment the player has across playlists, the larger of the one kept and the new one, until a restart:

```ts
const carried = !previous || restart || previous.newestLive == null ? own : own == null ? previous.newestLive : Math.max(previous.newestLive, own);
this.delivered = { source: given.source, newest, newestLive: carried };
```

F-28 still takes the player's last number to be the newest number of the playlist given before:

```ts
const next = liveNumberAt(given.text, previous.newest + 1);
if (next == null || next > previous.newestLive) return null;
```

In 2.7.2 both numbers came from the same playlist. In 2.7.3 `newestLive` can come from an earlier playlist while `newest` comes from the last one. Two cases make F-28 restart the player when it would fetch nothing again:

| Case | Polls | 2.7.2 | 2.7.3 |
| --- | --- | --- | --- |
| A playlist behind (B-048), then one up to date, the same source | a backup up to 105 (the player fetches 105), the same backup up to 104, then up to 107: the player asks for 106 | no restart | `newest` 104, `newestLive` 105: the number after 104 is live 105, "again", restart |
| Numbers the player got blank, listed live later | the page's 104 and 105 blanked (F-14), a backup up to 105 when the player is past 105, the page's playlist merged, then the page's playlist 3 further ahead (B-054) | no restart | `newestLive` 105 kept from the backup, whose 104 and 105 the player never had live: restart at the end of the break |

A restart is E6's pause and play: the player stops for about a second and starts its timeline again at 0. On Firefox with an fMP4 channel a restart is what left old audio on the new timeline (T-829, reduced by F-29).

## Random polls through both versions

The probe runs both versions' `Player` on the same random polls: 30 to 60 polls 2 s apart with one or two midrolls; inside a break the page's playlist ends with ad segments and the backup answers up to date, 1 or 2 segments behind, with ads, or nothing; at each break's end the page numbers the stream 0 to 4 further ahead (B-054) and dates its segments up to 1.6 s apart (B-057). A player that asks for the number after the last one it fetched, and waits when a playlist ends below it, runs on each output.

`bun docs/findings/probes/t833_differential_probe.ts --old dist/v272 --runs 5000` (seed 20261120):

| | Restarts | Live segments fetched again |
| --- | --- | --- |
| 2.7.2 | 6,707 | 1,421 |
| 2.7.3 | 9,733 | 212 |

- 713 runs: 2.7.3 restarts where 2.7.2 lets the player fetch live segments again (T-832's fix).
- 1,532 runs: 2.7.3 restarts more, with the same repeats as 2.7.2 (none in most): restarts with nothing to prevent. The shortest are the first case above, inside a break with clean backups only.
- No run where 2.7.3 lets the player fetch more live segments again than 2.7.2.

The 212 left in 2.7.3 were not looked at in this probe.

## Firefox 157 with fake breaks and backups behind, 2026-11-20

`soak.py --browser firefox --fake-breaks 60:25 --fake-behind 0.3` (headless, muted, logged out): a fake break of 25 s every 60 s, and inside it 30 % of the answers to Purple's backup playlists replaced by the text that URL got two answers before, which ends below the newest segment the player got from it (B-048). The 2.7.2 build (`c7e89c5`, `--build`) and the 2.7.3 build at the same time on the same channels. Windows before the desktop paused every test Firefox (T-834): `/channel-ar` (TS) 22:21:55 to 22:26:30, `/channel-aj` (fMP4) 22:22:00 to 22:35:20.

| Session | Minutes | F-28 restarts | F-24 restarts | Stale answers | Video still | Video still, sound on |
| --- | --- | --- | --- | --- | --- | --- |
| 2.7.3, `/channel-ar` | 4.6 | 17 | 0 | 21 | 5.0 s | 0 |
| 2.7.2, `/channel-ar` | 4.6 | 0 | 0 | 14 | 5.0 s | 0 |
| 2.7.3, `/channel-aj` | 13.3 | 35 | 1 | 47 | 14.0 s | 0 |
| 2.7.2, `/channel-aj` | 13.3 | 1 | 1 | 43 | 5.0 s | 0 |

"Video still" counts the 1 s samples where `currentTime` moved less than half the time, not the restarts themselves (`currentTime` goes back to 0). "Sound on" counts the samples where `currentTime` moved and the `<video>` decoded fewer than 10 frames a second. On `/channel-aj` (fMP4, one SourceBuffer) the old audio left on the new timeline stayed at 0.3 s at most after each of the 37 timeline restarts of 2.7.3 (F-29); 2.7.2's 3 had the same.

The first report's case (T-829: the sound going between the present and up to a minute before, at restarts on fMP4) was run again with 2.7.3 on `/channel-aj` (`--fake-breaks 60:25 --pauses`, 20 fake breaks): 17 timeline restarts, old audio 0.1 to 0.5 s after each; three audio gaps of 395 ms (T-835).

## On Twitch, 2026-11-20

Firefox 157 soaks on `/channel-ar` (TS), 2.7.3 and without Purple, 21:56 to 22:44: the F-28 restarts seen were each before a real repeat (the page's playlist back 2 or 3 further ahead, its next numbers listing live segments the player had). One playlist ended below the one before it, from another backup type, and F-24 restarted the player as in 2.7.2; none from the same source. No video still with the sound on in either session.

## The fix, 2026-11-21

`delivered.newest` is the newest number given since the last restart (`Math.max` with the one before): the player waits past the last number it had, so a playlist that ends below it does not move F-28's comparison back, and F-25 compares a new source with it. A playlist adds to the live segments held only the ones it lists past that number: `liveNumberAt(text, newest)` when its newest number is past it, `newestLiveContent(text, ads, blank, after)` for the page's playlist merged or blanked. After a restart the player starts over at the end of the playlist given, which counts whole.

| Random polls, 5,000 runs (seed 20261120) | Restarts | Live segments fetched again |
| --- | --- | --- |
| 2.7.2 | 6,707 | 1,421 |
| 2.7.3 | 9,733 | 212 |
| the fix | 7,243 | 212 |

Against 2.7.3 the fix restarts less in 1,919 runs and never more, with the same segments fetched again. Against 2.7.2 it restarts more in 706 runs, each with fewer segments fetched again (T-832), less in 202, and more with the same repeats in 9: in those the page's playlist is dated 1.4 to 1.6 s apart from the backups' (B-057) and the merge gave one backup segment under two numbers, so the player had already fetched that live segment twice (T-836).

`player.qnt` got an answer from a node behind (`behind`: clean, 2 segments below the token's usual end) and `noNeedlessRestart`. With 2.7.3's logic the random runs broke it in 42 ms; with the fix it holds with the other invariants.

## Open

- How often a playlist from the same source ends below the one before it on Twitch (CDN nodes answering with an older playlist), and how often the player gets numbers blank that a backup lists live later.
- The simulations set the stale answers at 30 % inside breaks; the soaks of this day saw none from the same source in about 50 minutes.
- The reporter's video still with the sound on was not seen in any run of this day.
