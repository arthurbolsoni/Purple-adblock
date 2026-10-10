# Settings applied without a reload

Date: 2026-10-08. Tasks: T-602 (C-10, E7, F-16). Scenario: L3-07.

## Question

The 2.6.7 worker stored the whole `setSettings` message instead of its `value`, so `setting.whitelist` was undefined and the whitelist never applied (C-10, [worker unit tests](2026-10-03-worker-unit-tests.md)). The content script read storage once per page, so a change in the popup could reach the workers only after a reload. T-602 fixes both: the controller passes `value` to the player, and the content script listens to `storage.onChanged`.

## Probe

L3-07 (`e2e/scenarios/l3_07.py`), extension mode with `debug` on:

1. Open a directory channel on the dedicated profile and let it play for 12 s.
2. From the popup page in a second tab, set `whitelist` to that channel in `chrome.storage.local` (`lib.set_storage`, which leaves the channel's tab alone) and wait 12 s.
3. Set the list back to empty and wait 12 s.
4. Read `window.__purple.events`: the worker emits `whitelisted` on every poll of a whitelisted channel.

```
python e2e/run.py L3-07
```

## Result

| Build | Channel | `whitelisted` events before / while listed / after | Ad events while listed | Result |
| --- | --- | --- | --- | --- |
| T-602 (worktree build) | `/channel-c` | 0 / at least 2 / 0 | 0 | passed |
| before T-602 (`1385175`, the control) | `/channel-c` | 0 / 0 / 0 | 0 | failed on "whitelisted events after it is added" |

In both runs the page stayed on the channel and the video was playing at the end. Neither run had an ad break (0 of 27 and 0 of 22 main polls with ads), so "no ad handling while listed" holds trivially here; TS-602 covers a break with the channel listed.

Other scenarios on the T-602 build: L3-01 passed in both modes, L3-02 passed 3 of 3, L3-08 passed in both modes.

## Server observations during these runs

From 03:10 to 03:35, none of the 6 fresh-profile direct loads (L3-02, on `/channel-g`, `/channel-j` and `/channel-c`) had a preroll. Neither did the 6 dedicated-profile loads on `/channel-c` (L3-01, L3-07). In the same window, a record-mode soak load on a fresh profile got a 3-segment `Amazon|` `PREROLL` on `/channel-a` at 03:21 (B-024).

## Open

- The popup writes `whitelist`, `toggleProxy` and `proxyUrl`; `backupPlayerTypes` and `lowQualityFallback` are now sent to the worker when stored, but the popup has no control for them.
- The userscript has no storage: it keeps the defaults (`docs/feat.md`, "Settings").
