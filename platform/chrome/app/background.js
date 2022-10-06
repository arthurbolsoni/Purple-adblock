const runtime = () => (typeof browser === "undefined" ? chrome.runtime : browser.runtime);

chrome.runtime.onInstalled.addListener(function (details) {
  switch (details.reason) {
    case "install":
      // First run after an update
      break;
  }
});