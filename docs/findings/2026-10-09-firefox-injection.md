# Purple's page hook on Firefox before the player workers (T-111)

Date: 2026-10-09 · Firefox 157.0.1 · logged out, a new temporary profile per run · build: branch `melhorias-bloqueio` after d7ca73f. Probe: [`firefox_injection_probe.py`](probes/firefox_injection_probe.py); results in `~/purple-recordings/2026-10-09-t111` (outside the repo).

## Method

`e2e/firefox.py` drives Firefox through WebDriver BiDi on the browser's own remote port (`--remote-debugging-port`), with no driver binary, on a hidden desktop: `webExtension.install` loads the Firefox build as a temporary add-on, as `about:debugging` does; `script.addPreloadScript` adds `e2e/recorder.js` before any page script, as `Page.addScriptToEvaluateOnNewDocument` does on Edge. The probe takes the live channels of `/directory/all` and opens 8 of them by direct load, each in a new document, skipping channels behind the content classification gate. 20 s after each load it runs L3-01's worker check: every player worker (script ending in `amazon-ivs-wasmworker`) created through Purple's injector, running Purple's code, its boot message seen.

## Results

| Build | Direct loads with every player worker through the injector | Page hook set at | First player worker at |
| --- | --- | --- | --- |
| Extension, the content script adds `app/bundle.js` as a `<script src>` without waiting for `storage` | 8 of 8 | 140 to 464 ms | 565 to 891 ms |
| Extension, `app/bundle.js` a `MAIN` world content script at `document_start` in the MV2 manifest | 8 of 8 | 74 to 145 ms | 569 to 752 ms |
| Userscript as a preload script, as a manager running it at `document-start` | 8 of 8 | 49 to 133 ms | 536 to 768 ms |

Times are `performance.now()` in the page. Each load had two player workers. The video played in every extension load 20 s after it (`readyState` 3 or 4, `currentTime` 15 to 18.5 s).

Firefox 157 runs a `"world": "MAIN"` content script in an MV2 extension: with it, the content script did not add the `<script>` (it reads the manifest) and the hook came from the content script in the page's world. Firefox versions before 128 ignore `world` and would run the bundle in the extension's isolated world, where its hook does not reach the page.

`pageHook` (whether `Worker.toString()` holds `[Purple]`), true on Edge, read false on Firefox in every load; the worker checks above are the ones L3-01 uses.

## Build

The Firefox manifest declares `app/bundle.js` as a `MAIN` world content script at `document_start`, as the Chromium one does. The content script adds the bundle to the page as before only on Firefox before 128 (version from `navigator.userAgent`). No Firefox before 128 was run here.
