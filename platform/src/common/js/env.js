// What the popup and the export page say about where Purple runs: the browser and its name in a bug report, the system,
// and the bug-report form's address with the channel, the version and the browser filled in (F-31, T-608).
(function () {
  const ISSUE = "https://github.com/arthurbolsoni/Purple-adblock/issues/new";

  function isFirefox() {
    try {
      return chrome.runtime.getURL("").startsWith("moz-extension:");
    } catch (e) {
      return false;
    }
  }

  // "Firefox 157.0", "Edge 141", "Opera 125", "Brave 141", "Chrome 141"
  function browserName() {
    const agent = navigator.userAgent || "";
    const firefox = /Firefox\/([\d.]+)/.exec(agent);
    if (firefox) return "Firefox " + firefox[1];
    const edge = /Edg\/(\d+)/.exec(agent);
    if (edge) return "Edge " + edge[1];
    const opera = /OPR\/(\d+)/.exec(agent);
    if (opera) return "Opera " + opera[1];
    const chromium = /Chrome\/(\d+)/.exec(agent);
    if (chromium) return (navigator.brave ? "Brave " : "Chrome ") + chromium[1];
    return "unknown";
  }

  function systemName() {
    const data = navigator.userAgentData;
    return (data && data.platform) || navigator.platform || "unknown";
  }

  // the bug-report form (.github/ISSUE_TEMPLATE/bug-report.yml) with the fields GitHub fills from the address
  function reportUrl(channel, version, browser) {
    const query = new URLSearchParams({ template: "bug-report.yml" });
    if (channel) query.set("channel", "twitch.tv/" + channel);
    if (version) query.set("version", version);
    if (browser) query.set("browser", browser);
    return ISSUE + "?" + query.toString();
  }

  globalThis.PurpleEnv = { isFirefox, browserName, systemName, reportUrl };
})();
