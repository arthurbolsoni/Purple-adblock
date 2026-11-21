// F-30 (T-605): a badge on the toolbar icon of a tab while Purple is blocking an ad there. The content script of the
// tab sends { type: "adState", blocking } when the page's state changes; the badge is the tab's own, so it goes with
// the tab and when the tab loads another page. With the stored setting `adBadge` off (the popup's switch) no badge is
// shown. Chromium runs this as the MV3 service worker (chrome.action), Firefox as an MV2 event page
// (chrome.browserAction); both keep a tab's badge while this script is not running.
const action = chrome.action || chrome.browserAction;
const BADGE_TEXT = "AD";
const BADGE_COLOR = "#9147ff";

function showBadge(tabId, blocking) {
  action.setBadgeText({ tabId, text: blocking ? BADGE_TEXT : "" });
  if (!blocking) return;
  action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });
  // not in every browser (Chromium from 110, Firefox from 63)
  if (action.setBadgeTextColor) action.setBadgeTextColor({ tabId, color: "#ffffff" });
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || message.type !== "adState" || !sender || !sender.tab || sender.tab.id == null) return;
  const tabId = sender.tab.id;
  chrome.storage.local.get(["adBadge"], (items) => showBadge(tabId, message.blocking === true && (items || {}).adBadge !== false));
});

// the setting turned off: the badges already on the tabs go
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.adBadge || changes.adBadge.newValue !== false) return;
  chrome.tabs.query({}, (tabs) => (tabs || []).forEach((tab) => tab.id != null && showBadge(tab.id, false)));
});

// F-31 (T-607): the diagnostic log. A tab's content script sends { type: "diag", entries }; PurpleDiagnostics
// (app/diagnostics.js) checks and stores them, none from an incognito tab. Firefox's event page loads diagnostics.js
// before this script (manifest background.scripts); Chromium's service worker imports it here, relative to this
// script (app/diagnostics.js). Without it (a failed import) the badge works as before and nothing is recorded.
if (typeof importScripts === "function" && typeof PurpleDiagnostics === "undefined") {
  try {
    importScripts("diagnostics.js");
  } catch (e) {}
}
const diagnostics = () => (typeof PurpleDiagnostics === "undefined" ? null : PurpleDiagnostics);

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || message.type !== "diag" || !sender || !sender.tab || !diagnostics()) return;
  try {
    diagnostics().add(message.entries, { incognito: sender.tab.incognito === true });
  } catch (e) {}
});

// entries older than 7 days go when the browser starts and when Purple is installed or updated (add() also prunes,
// at most once an hour)
const pruneDiagnostics = () => {
  try {
    if (diagnostics()) diagnostics().prune();
  } catch (e) {}
};
for (const event of [chrome.runtime.onStartup, chrome.runtime.onInstalled]) if (event && event.addListener) event.addListener(pruneDiagnostics);
