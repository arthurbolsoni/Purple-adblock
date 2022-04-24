function init(whiteList) {
  var app = document.createElement("script");
  app.src = chrome.runtime.getURL("app/bundle.js");
  app.remove();

  var s = document.createElement("script");
  s.src = chrome.runtime.getURL("app/Worker.js");
  s.onload = function () {
    this.remove();
  };

  (document.head || document.documentElement).appendChild(s);

  window.addEventListener("message", (event) => {
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
  if (items.whiteList !== undefined) {
    whiteList = items.whiteList;
  }
  init(items.whiteList);
});
