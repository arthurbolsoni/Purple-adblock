// F-31: the export page the popup opens in a tab for one channel (export.html#<channel>). It builds that channel's log
// as text (PurpleDiagFormat over PurpleDiagnostics), shows it, saves it once as a .txt and links to the bug-report form
// with the channel, the version and the browser filled in (PurpleEnv). Opened from the popup's "Report a bug"
// (export.html?report=1#<channel>) it also opens that form in a tab. Nothing is sent anywhere by this page.
(function () {
  const i18n = globalThis.PurpleI18n || { t: (_key, _substitutions, fallback) => fallback || "", language: () => "en", localize: () => {} };
  const $ = (id) => document.getElementById(id);
  const CHANNEL = /^[a-z0-9_]{1,25}$/;

  const env = globalThis.PurpleEnv;

  // how Purple was installed: the store of this browser, or an unpacked build
  function installType() {
    const store = env.isFirefox() ? "Firefox Add-ons" : "Chrome Web Store";
    return new Promise((resolve) => {
      try {
        if (!chrome.management || !chrome.management.getSelf) return resolve(store);
        chrome.management.getSelf((self) => {
          const type = self && self.installType;
          resolve(!type || type === "normal" ? store : type);
        });
      } catch (e) {
        resolve(store);
      }
    });
  }

  const storedSettings = () =>
    new Promise((resolve) => {
      try {
        chrome.storage.local.get(null, (items) => resolve(items || {}));
      } catch (e) {
        resolve({});
      }
    });

  function save(text, fileName) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function build() {
    i18n.localize(document);
    const version = (chrome.runtime.getManifest && chrome.runtime.getManifest().version) || "";
    $("version").textContent = version;

    let channel = "";
    try {
      channel = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    } catch (e) {
      channel = "";
    }
    const diagnostics = globalThis.PurpleDiagnostics;
    const format = globalThis.PurpleDiagFormat;
    if (!CHANNEL.test(channel) || !diagnostics || !format) {
      $("missing").hidden = false;
      return;
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const now = Date.now();
    const [entries, install, stored] = await Promise.all([Promise.resolve(diagnostics.entries(channel)).catch(() => []), installType(), storedSettings()]);
    const browser = env.browserName();
    const meta = { purple: version, install, browser, os: env.systemName(), timeZone, settingsChanged: format.changedSettings(stored), now };
    const text = format.format(channel, entries || [], meta);
    const fileName = format.fileName(channel, now, timeZone);

    document.title = i18n.t("exportPageTitle", null, "Purple log") + " · " + channel;
    $("title").textContent = i18n.t("exportPageTitle", null, "Purple log") + " · " + channel;
    $("summary").textContent = i18n.t("exportSummary", [String((entries || []).length)], (entries || []).length + " lines from the last 7 days");
    $("text").textContent = text;
    const report = env.reportUrl(channel, version, browser);
    $("report").href = report;
    $("save").addEventListener("click", () => save(text, fileName));
    $("ready").hidden = false;
    save(text, fileName);
    // "Report a bug" in the popup: the bug-report form opens next to the file, which goes into its "Purple log" field
    if (new URLSearchParams(location.search).get("report") === "1") {
      $("saved").textContent = i18n.t(
        "exportSavedReport",
        null,
        'The file is in your downloads, and the bug report opened in a new tab: open the file, check it, then drag it into the report\'s "Purple log" field.',
      );
      chrome.tabs.create({ url: report });
    }
  }

  globalThis.PurpleExport = { ready: build().catch(() => ($("missing").hidden = false)) };
})();
