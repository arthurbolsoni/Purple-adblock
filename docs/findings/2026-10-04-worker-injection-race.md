# Worker injection race on twitch.tv

Date: 2026-10-04 · Edge 154, nodriver 0.50.3, dedicated profile, logged out, only the Purple build loaded · one live channel picked from the directory · builds: branch `melhorias-bloqueio` after T-001 to T-003, and `main` (2.6.7, commit 7746558) · Used by: T-111, L3-01, T-001 (live check of `bootstrapWorker`)

## Method

`probes/worker_boot_probe.py`. A script added with `Page.addScriptToEvaluateOnNewDocument` runs before any page script and:

- wraps the native `Worker` in a `Proxy`; for each worker it records the creation time, whether the construction came through Purple's injector (`newTarget` is not the proxy), the length of the script the worker runs and whether it contains Purple's worker code (blob read back with a synchronous XHR), `error` events, and whether the worker posted Purple's boot message `{ type: "getSettings" }`;
- records when `window.Worker` is replaced (Purple's page hook installed);
- records `getSettings` / `setSettings` window messages (page ↔ content script).

Two ways to reach the channel:

- direct load: `Page.navigate` to `https://www.twitch.tv/<channel>`;
- `--spa`: load `/directory/all`, then click the channel card (client-side navigation).

Page state (video `readyState`, `currentTime`, `paused`) read as JSON at 10, 20 and 30 s.

## Results

### Direct load of the channel page

| Build | Runs | Workers created at | Purple hook installed at | Workers through the injector | Purple code in the worker |
| --- | --- | --- | --- | --- | --- |
| branch | 3 | 445 to 801 ms (2 workers, 98-byte blob scripts) | 773 ms (measured in 1 run) | 0 | no |
| main (2.6.7) | 1 | 779 and 793 ms | not measured | 0 | no |

- Twitch's player workers start from 98-byte blob scripts and are created before Purple replaces `window.Worker`.
- Purple's worker code never runs on a direct load: no playlist handling, no backup, no ad blocking. The page hook (`window.Worker` replaced) is installed, which is what the 2026-10-03 smoke check measured as "workerPatched".
- Video played in these runs (`readyState 4`); in one branch run the player went back to `readyState 1` before 30 s, without Purple in the worker.

### Client-side navigation into the channel (`--spa`)

| Build | Runs | Hook installed on the directory page at | Player workers through the injector, with Purple code | Boot message and settings reply | Video at 30 s |
| --- | --- | --- | --- | --- | --- |
| branch | 3 | 151 to 205 ms | yes (1 or 2 workers, 32.6 KB scripts) | yes | playing in 2 runs; `readyState 0` for 30 s in 1 run |
| main (2.6.7) | 3 | 128 to 224 ms | yes (32.1 KB scripts) | yes | playing in 2 runs; `readyState 0` for 30 s in 1 run |

- The worker code built from this branch (`bootstrapWorker(self)`, T-001) boots inside the real player worker: the boot message reaches the page and the content script answers with the settings.
- With Purple in the worker, 1 of 3 runs stayed at `readyState 0` on both builds. The cause was not captured (Q-014).

## Cause of the late hook

`content-script.js` appends `<script src="app/bundle.js">` only inside the `chrome.storage.local.get` callback, and the script then loads asynchronously. Twitch's page scripts create the player workers before that.

## Open

- Q-014: why the player stays at `readyState 0` in some runs with Purple in the worker (needs the worker's console and the playlists it returned; recorder T-005 and debug events T-110).
- Whether a `"world": "MAIN"` content script at `document_start` (Chromium) runs before the player creates its workers on a direct load (T-111). Firefox MV2 and the userscript need their own check.
