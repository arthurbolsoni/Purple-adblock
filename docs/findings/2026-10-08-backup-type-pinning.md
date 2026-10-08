# Pinned and contaminated backup types

Date: 2026-10-08. Task: T-406 (F-10).

## What changed

Brave's script pins the backup type that worked and skips a contaminated type for 5 s ([research](../research.md#backups)). Purple now does the same in `Player.onFetch`:

- the type of the last clean backup delivered goes first in the chain on later polls and breaks, unless `pinBackupPlayerType` is off; `autoplay` is never pinned;
- a type none of whose servers gave a clean backup (ad segments, or its own break announced, T-204) is skipped for 5 s: no playlist fetch and no token request. The token requested when it failed is usually ready when the 5 s are over.

## Tests

TS-406, level 1:

- with pinning on, the next break fetches the pinned `frontpage` first; with it off, `popout` comes first again;
- `autoplay` stays last after giving the clean backup;
- `popout` with ads and `frontpage` announcing its own break are both skipped at +3 s, with no new token request, and fetched again at +5.001 s;
- a type whose other server gave a clean backup is not skipped.

## Live runs on the T-406 build (worktree build, 03:36 to 03:46)

| Scenario | Runs | Result | Breaks |
| --- | --- | --- | --- |
| L3-01 | extension, userscript | passed | none (`/channel-c`) |
| L3-07 | extension | passed | none (`/channel-c`) |
| L3-08 | extension, userscript | passed | - |
| L3-02 | 3, fresh profiles | passed | none: 0 of 3 loads with a preroll (`/channel-g`, `/channel-c` twice) |

Pinning and skipping act only during a break with backups; no break came up in these runs. The soak recordings show them across breaks, through the `backupUsed` events and the order of backup fetches in the worker log.

## Server observations

Prerolls on fresh profiles stayed absent: 0 of 3 loads here, after 0 of 6 from 03:10 to 03:35 ([settings finding](2026-10-08-settings-without-reload.md#server-observations-during-these-runs), B-024).
