const storageArea = () => (typeof browser === "undefined" ? chrome.storage : browser.storage);
const storage = () => storageArea().local;

// Chromium, and Firefox from 128 (also in MV2), run app/bundle.js as a MAIN world content script at document_start,
// before Twitch creates the player workers. Firefox before 128 ignores `world` and runs it in this isolated world,
// where it hooks nothing: the bundle is added to the page here, without waiting for storage (T-111).
const firefoxVersion = () => Number((/Firefox\/(\d+)/.exec(navigator.userAgent) || [])[1]) || null;
const bundleInMainWorld = () =>
  (chrome.runtime.getManifest().content_scripts || []).some((s) => s.world === "MAIN" && (s.js || []).includes("app/bundle.js")) &&
  !(firefoxVersion() && firefoxVersion() < 128);

function injectBundle() {
  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("app/bundle.js");
  s.onload = function () {
    this.remove();
  };

  (document.head || document.documentElement).appendChild(s);
}

// stored settings the page and the worker read (docs/feat.md, "Settings")
const SETTINGS_KEYS = ["whitelist", "toggleProxy", "proxyUrl", "debug", "blockCsai", "backupPlayerTypes", "lowQualityFallback", "pinBackupPlayerType", "stripFallback", "forcePopoutToken", "reloadAfterAd", "pausePlayDelayMs", "prewarmBackups", "stripAdMarkers", "pausePlayOnBreaks", "prewarmAtLoad", "alignBackupSequence", "restartOnSequenceBack", "skipBackupBehind", "parallelBackupFetch"];
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
