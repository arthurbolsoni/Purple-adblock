# Worker behavior seen while writing the T-001 unit tests

Date: 2026-10-03 · Purple 2.6.7 worker code on branch `melhorias-bloqueio` · `bun test` 1.4.1 · Used by: T-104, T-602, T-101

## Method

Unit tests for `Player`, `Stream`, the decorators and `bootstrapWorker` (T-001), written against the 2.6.7 code without changing its logic. A built worker bundle (Vite, terser) was also booted on a fake scope (`EventTarget` with `fetch` and `postMessage`) to check the new entry: no `export`/`import` in the output, usher routed to `onChannel`, `setQuality` dispatched, `getSettings` posted once.

## Results

### Whitelist never applies (C-10)

- The content script sends `{ type: "setSettings", value: items }`; `index.ts` forwards `{ funcName: "setSettings", value }` to the worker.
- `AppController.setSettings(data)` passes the whole message to `Player.setSettings`, so `Player.setting` is `{ funcName, value }`.
- `Player.isWhitelist()` reads `this.setting.whitelist`, which is `undefined`: a whitelisted channel still goes through ad handling, with or without a page reload.
- Test: `decorator/handler.decorator.spec.ts`, "AppController messages set integrity, settings and quality on the player", asserts the 2.6.7 behavior with a pointer to the fix (T-602).

### Variant regex and current playlist hosts (Inferred)

- `Stream.setStreamAccess` reads variants with `NAME="<quality>",AUTO…` followed by a URL matching `https:\/\/video(\S+).m3u8`.
- The 2026-10-03 session saw variant URLs on `<edge>.playlist.ttvnw.net` (B-003), which do not start with `https://video`.
- If the master still has that layout, backups (`frontpage`, `picture-by-picture`) get a `Server` with no URLs and `fetchm3u8ByStreamType` calls `request(undefined)`. Not checked against a real backup master yet (Q-013).
- The unit tests use the legacy `video-weaver.*.hls.ttvnw.net` host, which the regex reads. T-104 adds a case with the current host.

### `generateM3u8` default target duration

- The old Jest spec expected `#EXT-X-TARGETDURATION:0` when the manifest has none; the code writes `5`. The spec now expects `5`; T-101 replaces regeneration with line edits.

## Open

- Q-013: full URLs of the master variants and media playlists (host and path), to check the variant regex and the `ttvnw.net/v1/playlist/` route.
