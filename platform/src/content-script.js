const storage = () => (typeof browser === "undefined" ? chrome.storage.local : browser.storage.local);

function init(items) {
  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("app/bundle.js");
  s.onload = function () {
    this.remove();
  };

  (document.head || document.documentElement).appendChild(s);

  window.addEventListener("message", (event) => {
    if (event.data.type == "getSettings") {
      window.postMessage(
        {
          type: "setSettings",
          value: items,
        },
        "*",
      );
    }
  });
}

storage().get(["whitelist", "toggleProxy", "proxyUrl"], (items) => init(items));
