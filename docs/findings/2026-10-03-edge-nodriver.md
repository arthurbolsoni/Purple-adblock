# Edge 154 + nodriver: extension loading, isolation, cleanup

Date: 2026-10-03 · Edge 154.0.4258.53 · nodriver 0.50.3 · Python 3.14.2 · Profile `~/nodriver/profile-edge-purple` · Used by: T-004

## Method

`probes/ext_only.py` and earlier smoke scripts, launching Edge through `nodriver.start(user_data_dir=..., browser_executable_path=...)`.

## Results

- `--load-extension=<repo>/dist/purple-adblock-purple-adblock-chromium` works. `chrome.developerPrivate.getExtensionsInfo` on `edge://extensions` lists the extension as `UNPACKED` / `ENABLED`. `--disable-features=DisableLoadExtensionCommandLineSwitch` is not needed.
- With `--disable-extensions-except=<build>` and `--disable-component-extensions-with-background-pages`, the list contains only Purple Ads Blocker. Without them, the new profile also listed "Microsoft Power Automate" and "Google Docs Offline" (both disabled).
- The only non-page target left in that mode was the new tab page's service worker (`ntp.msn.com`), which is not an extension.
- First launch of the fresh profile: the Twitch worker was not patched. Every later launch: patched (`Worker.toString()` contains `Purple`, `[Purple]: init blob:...` logged for two workers).
- A run killed before `browser.stop()` left 11 `msedge.exe` processes on the profile. The next launch failed with nodriver's "running as root / no_sandbox" message. Stopping only processes whose command line contains `profile-edge-purple` fixed it.
- `tab.evaluate(..., return_by_value=True)` returns a `RemoteObject` for `null` and for some objects; wrapping in `JSON.stringify` gives plain strings.
- Running `msedge.exe --version` on Windows does not print a version; it opens the user's normal Edge. Use the file version instead.

## Flags in use

| Mode | Flags |
| --- | --- |
| All | `--disable-component-extensions-with-background-pages` |
| Extension | `--load-extension=<build> --disable-extensions-except=<build>` |
| No extension (record, userscript) | `--disable-extensions` |

Note 2026-10-07: the profile has since picked up six extensions from the Microsoft account through sync (still disabled in extension mode); launches now add `--disable-sync` ([e2e harness](2026-10-07-e2e-harness.md)).

Note 2026-10-04: "worker patched" in this file means the page hook (`window.Worker` replaced). Whether the player worker runs Purple's code is a separate check; on a direct channel load it does not ([worker injection race](2026-10-04-worker-injection-race.md)).
