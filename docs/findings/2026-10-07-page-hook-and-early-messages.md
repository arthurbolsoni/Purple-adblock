# Page fetch hook at load, and Purple's messages before the player's first one

Date: 2026-10-07 · Edge 154.0.4258.62 · dedicated profile, logged out · extension and userscript modes · Used by: T-106, T-107, L3-01

## Method

L3-01 with the recorder logging, per player worker, the messages the page sends to it (`setSettings`, `setIntegrity`, `setQuality`, `pause`, `play`) and the worker's uncaught errors.

## Results

### `/integrity` after client-side navigation

With T-106's first version (hook installed with the first worker, as in 2.6.7), both direct loads sent `setIntegrity` to their two player workers, and neither client-side navigation did: the directory page made its `/integrity` request before the player created a worker. With the hook installed when the bundle loads, the worker after client-side navigation got the token in every run (4 of 4).

### A message from Purple before the player's own

In 1 of 2 client-side navigations after that change (userscript mode), the player worker died at start with `Uncaught TypeError: Cannot read properties of undefined (reading 'startsWith')`: no fetch, `readyState 0`. The registry had replayed the stored `setIntegrity` 2 ms after the worker was created, so it was the first message the worker got, before the player's own first message. In the loads that played, Purple's first message to a worker came 0.3 s or more after the worker was created.

Since then a worker joins the registry, and gets the stored settings, integrity and quality, only after the page's first `postMessage` to it (the player's init), and Purple's pause/play answers wait for the same point. L3-01 passed in 6 of 6 runs (both modes).

## Open

- Which message Twitch's worker code expects first, and whether other unknown `funcName` messages can hurt it later.
