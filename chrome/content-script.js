function init(whiteList) {
  var app = document.createElement("script");
  app.src = chrome.runtime.getURL("app/bundle.js");
  app.remove();

  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("app/inject-script.js");
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
    if (event.data.type && event.data.type == "getWhitelist") {
      window.postMessage(
        {
          type: "setWhitelist",
          value: whiteList,
        },
        "*",
      );
    }
  });
}

chrome.storage.local.get(["whiteList", "settings"], function (items) {
  var whitelist = [];
  if (items.whiteList !== undefined) {
    whiteList = items.whiteList;
  }
  init(whitelist);
});
