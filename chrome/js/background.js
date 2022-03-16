let whiteList = [];
let settings = [];

const logger = {
  logs: [],
  log: function (message) {
    const logstring = `[${new Date().toLocaleString()}]: ${message}`;
    logger.logs.push(logstring);
    console.log(logstring);
  },
};

logger.log("Initializing..");

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key == "whiteList") {
      whiteList = newValue;
      logger.log(whiteList);
    }

    if (key == "settings") {
      version1 = newValue[0];
      logger.log(newValue);
    }
  }
});

chrome.storage.local.get(["whiteList", "settings"], function (items) {
  if (items.whiteList !== undefined) {
    whiteList = items.whiteList;
    logger.log(whiteList);
  }
  if (items.settings !== undefined) {
    settings = items.settings;
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "getWhitelist") {
    sendResponse(whiteList);
  } else {
    sendResponse(logger);
  }
});

chrome.runtime.onInstalled.addListener(function (details) {
  switch (details.reason) {
    case "install":
      // First run after an update
      break;
  }
});
