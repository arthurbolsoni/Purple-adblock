const storage = () => (typeof browser === "undefined" ? chrome.storage.local : browser.storage.local);

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

const settings = new Promise((resolve) => storage().get(["whitelist", "toggleProxy", "proxyUrl"], resolve));

// The worker asks for the settings when it boots, which can happen before storage answers.
window.addEventListener("message", (event) => {
  if (event.data && event.data.type == "getSettings") {
    settings.then((items) =>
      window.postMessage(
        {
          type: "setSettings",
          value: items,
        },
        "*",
      ),
    );
  }
});

if (!bundleInMainWorld()) injectBundle();
