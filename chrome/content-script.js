function init(items) {

  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("app/bundle.js");
  s.onload = function () {
    this.remove();
  };

  (document.head || document.documentElement).appendChild(s);

  window.addEventListener("message", (event) => {
    if (event.data.type && event.data.type == "init") {
      window.postMessage(
        {
          type: "setInit",
          value: chrome.runtime.getURL("app"),
        },
        "*",
      );
    }
    if (event.data.type && event.data.type == "getSetting") {
      window.postMessage(
        {
          type: "setSetting",
          value: items,
        },
        "*",
      );
    }
  });
}

chrome.storage.local.get(["whiteList", "toggleProxy", "proxyUrl"], function (items) {
  var whitelist = [];
  if (items.whiteList !== undefined) {
    whiteList = items.whiteList;
  }
  init(items);
});
