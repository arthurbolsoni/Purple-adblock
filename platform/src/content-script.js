const storageArea = () => (typeof browser === "undefined" ? chrome.storage : browser.storage);
const storage = () => storageArea().local;

// Chromium runs app/bundle.js as a MAIN world content script at document_start, before Twitch creates the
// player workers. Firefox MV2 has no MAIN world: the bundle is added here, without waiting for storage.
const bundleInMainWorld = () =>
  (chrome.runtime.getManifest().content_scripts || []).some((s) => s.world === "MAIN" && (s.js || []).includes("app/bundle.js"));

function injectBundle() {
  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("app/bundle.js");
  s.onload = function () {
    this.remove();
  };

  (document.head || document.documentElement).appendChild(s);
}

// stored settings the page and the worker read (docs/feat.md, "Settings")
const SETTINGS_KEYS = ["whitelist", "toggleProxy", "proxyUrl", "debug", "blockCsai", "backupPlayerTypes", "lowQualityFallback", "pinBackupPlayerType", "stripFallback"];
const readSettings = () => new Promise((resolve) => storage().get(SETTINGS_KEYS, resolve));
let settings = readSettings();
const sendSettings = () => settings.then((items) => window.postMessage({ type: "setSettings", value: items }, "*"));

// The page gets the settings as soon as storage answers, also on pages without a player (blockCsai, debug), and
// again whenever a worker asks for them (its boot can come before storage answers).
sendSettings();
window.addEventListener("message", (event) => {
  if (event.data && event.data.type == "getSettings") sendSettings();
});

// T-602: a change to a stored setting (the popup's whitelist) goes to the page, which sends it to every live worker
storageArea().onChanged.addListener((changes, area) => {
  if (area !== "local" || !SETTINGS_KEYS.some((key) => key in changes)) return;
  settings = readSettings();
  sendSettings();
});

if (!bundleInMainWorld()) injectBundle();
