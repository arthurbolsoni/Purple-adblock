const storageArea = () => (typeof browser === "undefined" ? chrome.storage : browser.storage);
const storage = () => storageArea().local;

// Chromium, and Firefox from 128 (also in MV2), run app/bundle.js as a MAIN world content script at document_start,
// before Twitch creates the player workers. Firefox before 128 ignores `world` and runs it in this isolated world,
// where it hooks nothing: the bundle is added to the page here, without waiting for storage (T-111). Firefox's
// getManifest() lists each content script file as a full moz-extension:// URL, Chromium's as the manifest's path (T-830).
const firefoxVersion = () => Number((/Firefox\/(\d+)/.exec(navigator.userAgent) || [])[1]) || null;
const isBundle = (path) => path === "app/bundle.js" || String(path).endsWith("/app/bundle.js");
const bundleInMainWorld = () =>
  (chrome.runtime.getManifest().content_scripts || []).some((s) => s.world === "MAIN" && (s.js || []).some(isBundle)) &&
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
const SETTINGS_KEYS = ["whitelist", "toggleProxy", "proxyUrl", "debug", "blockCsai", "backupPlayerTypes", "lowQualityFallback", "pinBackupPlayerType", "stripFallback", "forcePopoutToken", "reloadAfterAd", "pausePlayDelayMs", "prewarmBackups", "stripAdMarkers", "pausePlayOnBreaks", "prewarmAtLoad", "alignBackupSequence", "alignByLiveSequence", "restartOnSequenceBack", "restartOnRepeat", "skipBackupBehind", "parallelBackupFetch", "widenBufferRemovals", "diagnostics"];

// F-31 (T-607): the page's diagnostic entries ({ type: "purpleDiag", entries }) go to the background script, which
// checks and stores them (app/diagnostics.js). Twitch's scripts share the page window and can post the same message,
// so only the shape is checked here: an array of at most DIAG_MESSAGE_MAX objects, copied with their plain fields.
// They are sent at most every DIAG_FLUSH_MS, at once when one is an error, and when the page goes; the buffer keeps
// the newest DIAG_BUFFER_MAX. With the stored `diagnostics` false nothing is sent.
const DIAG_FLUSH_MS = 30000;
const DIAG_MESSAGE_MAX = 200;
const DIAG_BUFFER_MAX = 500;
const DIAG_STRING_MAX = 500;
let diagnosticsOn = true;
let diagBuffer = [];
let diagTimer = null;

const plainEntry = (entry) => {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const copy = { at: entry.at, channel: entry.channel, level: entry.level, type: entry.type };
  if (entry.data && typeof entry.data === "object") {
    copy.data = {};
    for (const key of Object.keys(entry.data).slice(0, 24)) {
      const value = entry.data[key];
      if (typeof value === "string") copy.data[key] = value.slice(0, DIAG_STRING_MAX);
      else if (typeof value === "number" || typeof value === "boolean") copy.data[key] = value;
    }
  }
  return copy;
};

function flushDiag() {
  if (diagTimer !== null) clearTimeout(diagTimer);
  diagTimer = null;
  if (!diagBuffer.length) return;
  const entries = diagBuffer;
  diagBuffer = [];
  if (!diagnosticsOn) return;
  try {
    chrome.runtime.sendMessage({ type: "diag", entries }, () => void chrome.runtime.lastError);
  } catch (e) {}
}

function queueDiag(entries) {
  if (!diagnosticsOn || !Array.isArray(entries) || entries.length > DIAG_MESSAGE_MAX) return;
  let urgent = false;
  for (const entry of entries) {
    const copy = plainEntry(entry);
    if (!copy) continue;
    diagBuffer.push(copy);
    if (copy.level === "error") urgent = true;
  }
  if (diagBuffer.length > DIAG_BUFFER_MAX) diagBuffer.splice(0, diagBuffer.length - DIAG_BUFFER_MAX);
  if (urgent) flushDiag();
  else if (diagBuffer.length && diagTimer === null) diagTimer = setTimeout(flushDiag, DIAG_FLUSH_MS);
}

const readSettings = () => {
  const read = new Promise((resolve) => storage().get(SETTINGS_KEYS, resolve));
  read.then((items) => {
    diagnosticsOn = !items || items.diagnostics !== false;
    if (!diagnosticsOn) diagBuffer = [];
  });
  return read;
};
let settings = readSettings();
const sendSettings = () => settings.then((items) => window.postMessage({ type: "setSettings", value: items }, "*"));

// The page gets the settings as soon as storage answers, also on pages without a player (blockCsai, debug), and
// again whenever a worker asks for them (its boot can come before storage answers).
sendSettings();
window.addEventListener("message", (event) => {
  if (event.data && event.data.type == "getSettings") sendSettings();
  // F-30 (T-605): the page says when Purple starts and stops blocking an ad; the background script shows it on the
  // toolbar icon of this tab. A failure here (the extension reloaded under the page) changes nothing in the page
  if (event.data && event.data.type == "adState") {
    try {
      chrome.runtime.sendMessage({ type: "adState", blocking: event.data.value === true }, () => void chrome.runtime.lastError);
    } catch (e) {}
  }
});

window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data || event.data.type !== "purpleDiag") return;
  try {
    queueDiag(event.data.entries);
  } catch (e) {}
});
window.addEventListener("pagehide", () => {
  try {
    flushDiag();
  } catch (e) {}
});

// T-602: a change to a stored setting (the popup's whitelist) goes to the page, which sends it to every live worker
storageArea().onChanged.addListener((changes, area) => {
  if (area !== "local" || !SETTINGS_KEYS.some((key) => key in changes)) return;
  settings = readSettings();
  sendSettings();
});

if (!bundleInMainWorld()) injectBundle();
