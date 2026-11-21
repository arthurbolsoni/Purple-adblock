// The toolbar popup. On a Twitch channel: Purple off or on for that channel (the whitelist, T-603), today's figures from
// the channel's log (F-31), the badge switch (F-30), the store link (F-32) and "Report a bug" (F-31): a warning, a
// channel, then the log's download, which the export page does in a tab (Firefox closes the popup when the save dialog
// opens) before it opens the bug-report form; "Report without a log" opens the form alone. On another twitch.tv page the
// same without the channel; outside twitch.tv one button to Twitch.
(function () {
  const storage = () => chrome.storage.local;
  const i18n = globalThis.PurpleI18n || { t: (_key, _substitutions, fallback) => fallback || "", language: () => "en", localize: () => {} };
  const env = globalThis.PurpleEnv;
  const $ = (id) => document.getElementById(id);

  const TWITCH = "https://www.twitch.tv/";
  const TWITCH_HOSTS = ["www.twitch.tv", "m.twitch.tv", "twitch.tv"];
  // first path parts of twitch.tv pages that are not a channel
  const RESERVED = new Set([
    "activate", "bits", "broadcast", "creatorcamp", "directory", "downloads", "drops", "event", "friends", "following",
    "inventory", "jobs", "legal", "login", "logout", "messages", "p", "partners", "payments", "prime", "privacy",
    "products", "recap", "redeem", "search", "settings", "signup", "store", "subscriptions", "team", "turbo", "u",
    "videos", "wallet",
  ]);
  const CHANNEL = /^[a-z0-9_]{1,25}$/;
  // F-32: where to rate Purple; Edge, Brave and Opera install it from the Chrome Web Store
  const STORE = {
    firefox: "https://addons.mozilla.org/firefox/addon/purpleadblock/",
    chromium: "https://chromewebstore.google.com/detail/purple-ads-blocker/lkgcfobnmghhbhgekffaadadhmeoindg/reviews",
  };

  // T-603: the channel of www.twitch.tv/<channel>, m.twitch.tv/<channel>, www.twitch.tv/popout/<channel>/... and
  // www.twitch.tv/moderator/<channel>, in lower case as the worker reads it from the usher path
  function pageOf(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return { kind: "away" };
    }
    if (parsed.protocol !== "https:" || !TWITCH_HOSTS.includes(parsed.hostname)) return { kind: "away" };
    const parts = parsed.pathname.split("/").filter(Boolean).map((part) => part.toLowerCase());
    const name = parts[0] === "popout" || parts[0] === "moderator" ? parts[1] : parts[0];
    if (!name || RESERVED.has(name) || !CHANNEL.test(name)) return { kind: "twitch" };
    return { kind: "channel", channel: name };
  }

  function show(view) {
    $("away").hidden = view !== "away";
    $("home").hidden = view !== "home";
    $("export").hidden = view !== "export";
  }

  function openTab(url) {
    chrome.tabs.create({ url });
    window.close();
  }

  // the channel's switch
  let whitelist = [];
  let channel = "";

  function renderChannel() {
    const on = !whitelist.includes(channel);
    const power = $("power");
    power.setAttribute("aria-pressed", String(on));
    power.setAttribute(
      "aria-label",
      on ? i18n.t("powerTurnOff", [channel], "Turn Purple off on " + channel) : i18n.t("powerTurnOn", [channel], "Turn Purple on for " + channel),
    );
    const status = $("channelStatus");
    status.textContent = on ? i18n.t("statusOn", null, "Blocking ads on this channel") : i18n.t("statusOff", null, "Off on this channel: ads play");
    status.classList.toggle("is-on", on);
    $("home").classList.toggle("is-off", !on);
  }

  function togglePower() {
    if (!channel) return;
    whitelist = whitelist.includes(channel) ? whitelist.filter((name) => name !== channel) : whitelist.concat(channel);
    storage().set({ whitelist });
    renderChannel();
  }

  // F-31: today's figures from the channel's log, from local midnight
  function loadToday(name) {
    const diagnostics = globalThis.PurpleDiagnostics;
    if (!diagnostics || !diagnostics.summary) return;
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    Promise.resolve(diagnostics.summary(name, midnight.getTime()))
      .then((summary) => {
        if (!summary) return;
        const figures = { figBreaks: summary.breaks, figBlocked: summary.blocked, figPassed: summary.passed, figStalls: summary.stalls };
        for (const [id, value] of Object.entries(figures)) $(id).textContent = String(Number(value) || 0);
        $("figPassed").classList.toggle("is-passed", Number(summary.passed) > 0);
        $("figStalls").classList.toggle("is-stall", Number(summary.stalls) > 0);
        $("today").hidden = false;
      })
      .catch(() => {});
  }

  // F-31: the report view; the download button comes only after the warning is accepted and a channel chosen
  function updateDownload() {
    $("download").hidden = !($("consent").checked && $("channelPick").value);
  }

  function loadChannels() {
    const pick = $("channelPick");
    while (pick.options.length > 1) pick.options[1].remove();
    const diagnostics = globalThis.PurpleDiagnostics;
    const listed = diagnostics && diagnostics.channels ? Promise.resolve(diagnostics.channels()) : Promise.resolve([]);
    return listed
      .catch(() => [])
      .then((channels) => {
        const list = Array.isArray(channels) ? channels.filter((item) => item && CHANNEL.test(item.channel)) : [];
        const date = (at) => {
          try {
            return new Date(at).toLocaleDateString(i18n.language(), { day: "numeric", month: "short" });
          } catch (e) {
            return "";
          }
        };
        for (const item of list) {
          // short enough for the select's width in both languages: name, this tab, last day
          const parts = [item.channel, item.channel === channel ? i18n.t("pickThisTab", null, "this tab") : "", date(item.last)];
          const option = document.createElement("option");
          option.value = item.channel;
          option.textContent = parts.filter(Boolean).join(" · ");
          pick.appendChild(option);
        }
        $("pick").hidden = !list.length;
        $("pickEmpty").hidden = !!list.length;
        updateDownload();
      });
  }

  // Report a bug: the warning, then a channel, then the download (F-31)
  function openReport() {
    show("export");
    loadChannels();
  }

  function download() {
    const name = $("channelPick").value;
    if (!$("consent").checked || !CHANNEL.test(name)) return;
    openTab(chrome.runtime.getURL("common/html/export.html?report=1#" + name));
  }

  function reportWithoutLog() {
    const version = (chrome.runtime.getManifest && chrome.runtime.getManifest().version) || "";
    openTab(env.reportUrl(channel, version, env.browserName()));
  }

  i18n.localize(document);
  $("version").textContent = (chrome.runtime.getManifest && chrome.runtime.getManifest().version) || "";
  $("rate").href = env.isFirefox() ? STORE.firefox : STORE.chromium;
  $("goTwitch").addEventListener("click", () => openTab(TWITCH));
  $("power").addEventListener("click", togglePower);
  $("report").addEventListener("click", openReport);
  $("reportWithoutLog").addEventListener("click", reportWithoutLog);
  $("closeExport").addEventListener("click", () => show("home"));
  $("consent").addEventListener("change", updateDownload);
  $("channelPick").addEventListener("change", updateDownload);
  $("download").addEventListener("click", download);

  // F-30 (T-605): the badge on the icon while an ad is blocked, on unless stored as false
  const adBadge = $("adBadge");
  storage().get(["adBadge"], (items) => {
    adBadge.checked = (items || {}).adBadge !== false;
  });
  adBadge.addEventListener("change", () => storage().set({ adBadge: adBadge.checked }));

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const page = pageOf(tabs && tabs[0] ? tabs[0].url : "");
    if (page.kind === "away") return show("away");
    show("home");
    if (page.kind === "twitch") {
      $("noChannel").hidden = false;
      return;
    }
    channel = page.channel;
    $("channelName").textContent = channel;
    $("channelBlock").hidden = false;
    renderChannel();
    storage().get(["whitelist"], (items) => {
      whitelist = Array.isArray((items || {}).whitelist) ? items.whitelist : [];
      renderChannel();
    });
    loadToday(channel);
  });
})();
