# The bundle added twice to the page on Firefox (T-830)

Date: 2026-11-07. Firefox 157.0.1 on Linux, headless, logged out, the 2.7.1 build (`dist/purple-adblock-firefox`). Probe: [`firefox_bundle_twice_probe.py`](probes/firefox_bundle_twice_probe.py).

## Console error

The Firefox soaks of T-829 now keep the page's console (`soak.py --browser firefox`, `console.jsonl`). Every Twitch page they opened, the directory and each channel, logged one error at load:

```
SyntaxError: redeclaration of let b    moz-extension://<id>/app/bundle.js
```

## Two runs of the bundle

The Firefox manifest runs `app/bundle.js` as a `MAIN` world content script at `document_start` (Firefox 128 and later, also in MV2, T-111). `content-script.js` adds the bundle to the page itself, as a `<script>` element, when it finds no such content script in `runtime.getManifest()`: the path for Firefox before 128, which runs the bundle in the isolated world.

On Firefox 157 `getManifest()` lists each content script file as a full URL:

```json
{"js": ["moz-extension://<id>/app/bundle.js"], "run_at": "document_start", "world": "MAIN", ...}
```

`content-script.js` looked for the bare path `app/bundle.js`, found none, and added the `<script>` element as well. The probe, on a channel page:

| Build | `<script>` elements added | `window.Worker` replaced by | Console |
| --- | --- | --- | --- |
| 2.7.1 | `moz-extension://<id>/app/bundle.js` at 166 ms | the content script (`document.currentScript` null) at 167 ms | `redeclaration of let b` in `bundle.js` |
| 2.7.1 with the fixed `content-script.js` | none | the content script at 144 ms | none |

The content script runs first and hooks the page. The `<script>` element's copy loads later; the bundle declares `let` bindings at the top level, so that second run fails on the first one already in the page before it runs any code. Purple ran once in each page, as on Chromium; the extra copy cost a request and the console error.

## Fix

`content-script.js` takes a content script file as the bundle when its path is `app/bundle.js` or ends with `/app/bundle.js`. `content-script.firefox.spec.ts` gives the content script the manifest as Firefox returns it.
