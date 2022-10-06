chrome.runtime.onInstalled.addListener(function (details) {
  switch (details.reason) {
    case "install":
      // First run after an update
      break;
  }
});
