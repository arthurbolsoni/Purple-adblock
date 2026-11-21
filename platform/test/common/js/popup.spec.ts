// popup.js runs as a classic script in the popup page; here it runs on happy-dom with the popup's markup, the page
// env's chrome mock plus chrome.tabs (the active tab's URL, tabs it opens), and PurpleDiagnostics/PurpleI18n stand-ins
// where a test needs them (TS-603, TS-605, TS-608, TS-609, TS-610).
import { afterEach, describe, expect, test } from "bun:test";
import { join } from "path";
import { silenceConsole } from "../../../../serviceWorker/test/harness/console";
import { usePageEnv } from "../../../../serviceWorker/test/harness/page-env";
const COMMON = join(import.meta.dir, "..", "..", "..", "src", "common");
const LOCALES = join(import.meta.dir, "..", "..", "..", "src", "_locales");

const env = usePageEnv({ chrome: { whitelist: ["listed"], toggleProxy: false, proxyUrl: "" } });
silenceConsole();

const HTML = await Bun.file(join(COMMON, "html", "popup.html")).text();
const SOURCE = await Bun.file(join(COMMON, "js", "popup.js")).text();
const I18N = await Bun.file(join(COMMON, "js", "i18n.js")).text();
const ENV = await Bun.file(join(COMMON, "js", "env.js")).text();
const EN = await Bun.file(join(LOCALES, "en", "messages.json")).json();
const PT = await Bun.file(join(LOCALES, "pt_BR", "messages.json")).json();

type Summary = { breaks: number; blocked: number; passed: number; stalls: number };
type Options = { extension?: string; diagnostics?: { summary?: (channel: string, since: number) => any; channels?: () => any } | null; messages?: Record<string, any> | null };

let opened: string[] = [];
let closed = 0;
const g = globalThis as any;

// chrome.i18n.getMessage over a messages.json, with $1 substitutions as the browser does
const getMessage = (messages: Record<string, any>) => (key: string, substitutions?: string[] | string | null) => {
  const entry = messages[key];
  if (!entry) return "";
  const list = substitutions == null ? [] : ([] as string[]).concat(substitutions);
  let text: string = entry.message;
  for (const [name, placeholder] of Object.entries<any>(entry.placeholders ?? {})) {
    text = text.split("$" + name.toUpperCase() + "$").join(list[Number(placeholder.content.slice(1)) - 1] ?? "");
  }
  return text;
};

// the popup opened on a tab with this URL
const openPopup = async (url: string, { extension = "chrome-extension", diagnostics = null, messages = null }: Options = {}) => {
  document.body.innerHTML = HTML.replace(/^[\s\S]*<body>/, "").replace(/<script[\s\S]*$/, "");
  opened = [];
  closed = 0;
  const chrome = env.chrome as any;
  chrome.tabs = {
    query: (_query: any, callback: (tabs: any[]) => void) => callback([{ url }]),
    create: (details: { url: string }) => opened.push(details.url),
  };
  chrome.runtime.getURL = (path: string) => `${extension}://purple-test/${path}`;
  chrome.runtime.getManifest = () => ({ version: "9.9.9" });
  if (messages) chrome.i18n = { getMessage: getMessage(messages), getUILanguage: () => "pt-BR" };
  else delete chrome.i18n;
  window.close = () => void closed++;
  if (diagnostics) g.PurpleDiagnostics = diagnostics;
  else delete g.PurpleDiagnostics;
  delete g.PurpleI18n;
  delete g.PurpleEnv;
  new Function(I18N)();
  new Function(ENV)();
  new Function(SOURCE)();
  await Bun.sleep(0);
};

afterEach(() => {
  delete g.PurpleDiagnostics;
  delete (env.chrome as any).i18n;
});

const $ = (id: string) => document.getElementById(id)!;
const visible = (id: string) => !$(id).hidden;
const summaryOf = (summary: Summary) => ({ summary: () => Promise.resolve(summary), channels: () => Promise.resolve([]) });

describe("popup channel (T-603)", () => {
  test.each([
    ["https://www.twitch.tv/somechannel", "somechannel"],
    ["https://m.twitch.tv/somechannel", "somechannel"],
    ["https://www.twitch.tv/popout/somechannel/chat", "somechannel"],
    ["https://www.twitch.tv/popout/somechannel/chat?popout=", "somechannel"],
    ["https://www.twitch.tv/moderator/somechannel", "somechannel"],
    ["https://www.twitch.tv/somechannel?sr=a", "somechannel"],
    ["https://www.twitch.tv/somechannel/videos", "somechannel"],
    ["https://www.twitch.tv/SomeChannel", "somechannel"],
  ])("%s → %s, Purple on", async (url, channel) => {
    await openPopup(url);
    expect(visible("home")).toBe(true);
    expect(visible("channelBlock")).toBe(true);
    expect($("channelName").textContent).toBe(channel);
    expect($("power").getAttribute("aria-pressed")).toBe("true");
    expect($("power").getAttribute("aria-label")).toBe("Turn Purple off on " + channel);
    expect($("channelStatus").textContent).toBe("Blocking ads on this channel");
  });

  test("a whitelisted channel shows Purple off, also from m.twitch.tv and the popout", async () => {
    for (const url of ["https://www.twitch.tv/listed", "https://m.twitch.tv/listed", "https://www.twitch.tv/popout/listed/chat"]) {
      await openPopup(url);
      expect($("power").getAttribute("aria-pressed")).toBe("false");
      expect($("power").getAttribute("aria-label")).toBe("Turn Purple on for listed");
      expect($("channelStatus").textContent).toBe("Off on this channel: ads play");
      expect($("home").classList.contains("is-off")).toBe(true);
    }
    await openPopup("https://www.twitch.tv/somechannel");
    expect($("home").classList.contains("is-off")).toBe(false);
  });

  test("the power button takes the channel out of the whitelist and puts it back", async () => {
    env.chrome.data.whitelist = ["listed", "other"];
    await openPopup("https://www.twitch.tv/listed");
    $("power").click();
    expect(env.chrome.data.whitelist).toEqual(["other"]);
    expect($("power").getAttribute("aria-pressed")).toBe("true");
    $("power").click();
    expect(env.chrome.data.whitelist).toEqual(["other", "listed"]);
    expect($("power").getAttribute("aria-pressed")).toBe("false");
    env.chrome.data.whitelist = ["listed"];
  });

  test("no stored whitelist: Purple on, and the first click stores the channel", async () => {
    delete env.chrome.data.whitelist;
    await openPopup("https://www.twitch.tv/somechannel");
    expect($("power").getAttribute("aria-pressed")).toBe("true");
    $("power").click();
    expect(env.chrome.data.whitelist).toEqual(["somechannel"]);
    env.chrome.data.whitelist = ["listed"];
  });
});

// TS-610: a twitch.tv page that is not a channel has everything but the channel's switch
describe("popup on a twitch.tv page without a channel (TS-610)", () => {
  test.each([
    "https://www.twitch.tv/",
    "https://www.twitch.tv/directory",
    "https://www.twitch.tv/directory/category/just-chatting",
    "https://www.twitch.tv/settings/profile",
    "https://www.twitch.tv/videos/123456",
    "https://www.twitch.tv/search?term=a",
    "https://m.twitch.tv/following",
    "https://www.twitch.tv/popout/",
    "https://www.twitch.tv/not-a-login",
  ])("%s", async (url) => {
    await openPopup(url);
    expect(visible("home")).toBe(true);
    expect(visible("away")).toBe(false);
    expect(visible("noChannel")).toBe(true);
    expect($("noChannel").textContent).toContain("Purple is on for Twitch");
    expect(visible("channelBlock")).toBe(false);
    expect(visible("today")).toBe(false);
    expect(visible("report")).toBe(true);
    expect(visible("rate")).toBe(true);
  });
});

// TS-610: outside twitch.tv the popup is one page with one action
describe("popup outside twitch.tv (TS-610)", () => {
  test.each(["https://example.com/somechannel", "chrome://extensions/", "http://www.twitch.tv/somechannel", "https://clips.twitch.tv/x", "not a url", ""])("%s", async (url) => {
    await openPopup(url);
    expect(visible("away")).toBe(true);
    expect(visible("home")).toBe(false);
    expect(visible("export")).toBe(false);
  });

  test("Go to Twitch opens twitch.tv in a tab and closes the popup", async () => {
    await openPopup("https://example.com/");
    $("goTwitch").click();
    expect(opened).toEqual(["https://www.twitch.tv/"]);
    expect(closed).toBe(1);
  });
});

// F-30 (T-605): the switch of the badge on the icon; on unless stored as false
describe("popup badge switch (F-30)", () => {
  const badge = () => $("adBadge") as HTMLInputElement;

  test("on by default, and off when stored as false", async () => {
    delete (env.chrome.data as any).adBadge;
    await openPopup("https://www.twitch.tv/somechannel");
    expect(badge().checked).toBe(true);
    env.chrome.data.adBadge = false;
    await openPopup("https://www.twitch.tv/somechannel");
    expect(badge().checked).toBe(false);
  });

  test("a change stores the new value, also on a page that is not a channel", async () => {
    env.chrome.data.adBadge = true;
    await openPopup("https://www.twitch.tv/directory");
    badge().checked = false;
    badge().dispatchEvent(new Event("change"));
    expect(env.chrome.data.adBadge).toBe(false);
    badge().checked = true;
    badge().dispatchEvent(new Event("change"));
    expect(env.chrome.data.adBadge).toBe(true);
  });
});

// F-32 (T-609): the store page of the browser Purple runs in
describe("popup rate button (TS-609)", () => {
  test("Chromium browsers rate on the Chrome Web Store", async () => {
    await openPopup("https://www.twitch.tv/somechannel");
    expect(($("rate") as HTMLAnchorElement).href).toBe("https://chromewebstore.google.com/detail/purple-ads-blocker/lkgcfobnmghhbhgekffaadadhmeoindg/reviews");
    expect($("rate").getAttribute("target")).toBe("_blank");
  });

  test("Firefox rates on Firefox Add-ons", async () => {
    await openPopup("https://www.twitch.tv/somechannel", { extension: "moz-extension" });
    expect(($("rate") as HTMLAnchorElement).href).toBe("https://addons.mozilla.org/firefox/addon/purpleadblock/");
  });

  // the maintainer, 2026-11-21: Report a bug in the place of Donate, and no motto
  test("no donation link and no motto", async () => {
    await openPopup("https://www.twitch.tv/somechannel");
    expect(document.querySelector('a[href*="donate"]')).toBeNull();
    expect(document.body.textContent).not.toContain("Per aspera");
  });

  test("the top bar shows the version", async () => {
    await openPopup("https://www.twitch.tv/somechannel");
    expect($("version").textContent).toBe("9.9.9");
  });
});

// F-31 (T-608): today's figures for the channel, from the channel's log
describe("popup today's figures (TS-608)", () => {
  test("the figures of the channel from local midnight", async () => {
    const calls: [string, number][] = [];
    await openPopup("https://www.twitch.tv/somechannel", {
      diagnostics: {
        summary: (channel, since) => {
          calls.push([channel, since]);
          return Promise.resolve({ breaks: 4, blocked: 3, passed: 1, stalls: 2 });
        },
      },
    });
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    expect(calls).toEqual([["somechannel", midnight.getTime()]]);
    expect(visible("today")).toBe(true);
    expect(["figBreaks", "figBlocked", "figPassed", "figStalls"].map((id) => $(id).textContent)).toEqual(["4", "3", "1", "2"]);
    expect($("figPassed").classList.contains("is-passed")).toBe(true);
    expect($("figStalls").classList.contains("is-stall")).toBe(true);
  });

  test("zeros are shown plainly", async () => {
    await openPopup("https://www.twitch.tv/somechannel", { diagnostics: summaryOf({ breaks: 0, blocked: 0, passed: 0, stalls: 0 }) });
    expect(visible("today")).toBe(true);
    expect($("figPassed").classList.contains("is-passed")).toBe(false);
    expect($("figStalls").classList.contains("is-stall")).toBe(false);
  });

  test("without the log store, or when it fails, the figures stay hidden", async () => {
    await openPopup("https://www.twitch.tv/somechannel");
    expect(visible("today")).toBe(false);
    await openPopup("https://www.twitch.tv/somechannel", { diagnostics: { summary: () => Promise.reject(new Error("idb")) } });
    expect(visible("today")).toBe(false);
  });
});

// F-31 (T-608): Report a bug asks for the warning, then a channel; only then the download button exists
describe("popup Report a bug with the log (TS-608)", () => {
  const channels = [
    { channel: "speedrun_daily", first: 1, last: Date.UTC(2026, 10, 21, 20), count: 96 },
    { channel: "somechannel", first: 1, last: Date.UTC(2026, 10, 20, 20), count: 412 },
    { channel: "Bad Name", first: 1, last: 1, count: 1 },
  ];
  const withChannels = (list: any[] = channels) => ({ summary: () => Promise.resolve(null), channels: () => Promise.resolve(list) });
  const consent = () => $("consent") as HTMLInputElement;
  const pick = () => $("channelPick") as HTMLSelectElement;
  const choose = (value: string) => {
    pick().value = value;
    pick().dispatchEvent(new Event("change"));
  };
  const accept = (checked = true) => {
    consent().checked = checked;
    consent().dispatchEvent(new Event("change"));
  };

  test("Report a bug opens the report view with the channels that have a log", async () => {
    await openPopup("https://www.twitch.tv/somechannel", { diagnostics: withChannels() });
    $("report").click();
    await Bun.sleep(0);
    expect(visible("export")).toBe(true);
    expect(visible("home")).toBe(false);
    expect(Array.from(pick().options).map((option) => option.value)).toEqual(["", "speedrun_daily", "somechannel"]);
    expect(pick().options[2].text).toStartWith("somechannel · this tab · ");
    expect(pick().options[1].text).toStartWith("speedrun_daily · ");
    expect(pick().options[1].text).not.toContain("this tab");
    expect(visible("download")).toBe(false);
    expect(visible("reportWithoutLog")).toBe(true);
  });

  test("the download button appears only with the warning accepted and a channel chosen", async () => {
    await openPopup("https://www.twitch.tv/somechannel", { diagnostics: withChannels() });
    $("report").click();
    await Bun.sleep(0);
    choose("speedrun_daily");
    expect(visible("download")).toBe(false);
    accept();
    expect(visible("download")).toBe(true);
    choose("");
    expect(visible("download")).toBe(false);
    choose("somechannel");
    accept(false);
    expect(visible("download")).toBe(false);
  });

  test("the download opens the export page for that channel, in its report form, and closes the popup", async () => {
    await openPopup("https://www.twitch.tv/directory", { diagnostics: withChannels() });
    $("report").click();
    await Bun.sleep(0);
    accept();
    choose("speedrun_daily");
    $("download").click();
    expect(opened).toEqual(["chrome-extension://purple-test/common/html/export.html?report=1#speedrun_daily"]);
    expect(closed).toBe(1);
  });

  test("no log yet: a line says so, there is no channel to choose, and Report without a log stays", async () => {
    await openPopup("https://www.twitch.tv/somechannel", { diagnostics: withChannels([]) });
    $("report").click();
    await Bun.sleep(0);
    expect(visible("pickEmpty")).toBe(true);
    expect(visible("pick")).toBe(false);
    accept();
    expect(visible("download")).toBe(false);
    expect(visible("reportWithoutLog")).toBe(true);
  });

  // the maintainer, 2026-11-21: only Report a bug; the plain "Export log" entry is gone
  test("no Export log entry in the popup", async () => {
    await openPopup("https://www.twitch.tv/somechannel");
    expect(document.getElementById("openExport")).toBeNull();
    expect(document.body.textContent).not.toContain("Export log");
  });

  test("Report without a log opens the bug-report form with the channel, the version and the browser", async () => {
    await openPopup("https://www.twitch.tv/somechannel", { diagnostics: withChannels([]) });
    $("report").click();
    await Bun.sleep(0);
    $("reportWithoutLog").click();
    const url = new URL(opened[0]);
    expect(url.origin + url.pathname).toBe("https://github.com/arthurbolsoni/Purple-adblock/issues/new");
    expect(url.searchParams.get("template")).toBe("bug-report.yml");
    expect(url.searchParams.get("channel")).toBe("twitch.tv/somechannel");
    expect(url.searchParams.get("version")).toBe("9.9.9");
    expect(url.searchParams.has("browser")).toBe(true);
    expect(closed).toBe(1);
  });

  test("Report without a log on a page without a channel leaves the channel out", async () => {
    await openPopup("https://www.twitch.tv/directory", { diagnostics: withChannels([]) });
    $("report").click();
    $("reportWithoutLog").click();
    expect(new URL(opened[0]).searchParams.has("channel")).toBe(false);
  });

  test("Back returns to the main view", async () => {
    await openPopup("https://www.twitch.tv/somechannel", { diagnostics: withChannels() });
    $("report").click();
    $("closeExport").click();
    expect(visible("home")).toBe(true);
    expect(visible("export")).toBe(false);
  });
});

describe("popup text (TS-610)", () => {
  test("Brazilian Portuguese from _locales/pt_BR", async () => {
    await openPopup("https://www.twitch.tv/somechannel", { messages: PT });
    expect($("channelStatus").textContent).toBe(PT.statusOn.message);
    expect($("power").getAttribute("aria-label")).toBe("Desligar o Purple em somechannel");
    expect(document.querySelector('[data-i18n="rate"]')!.textContent).toBe(PT.rate.message);
    expect($("closeExport").getAttribute("aria-label")).toBe(PT.back.message);
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  test("a message missing from the locale keeps the English text", async () => {
    const { reportIssue, ...partial } = PT;
    await openPopup("https://www.twitch.tv/somechannel", { messages: partial });
    expect(document.querySelector('[data-i18n="reportIssue"]')!.textContent).toBe("Report a bug");
  });

  test("the English messages match the text written in the markup", async () => {
    await openPopup("https://www.twitch.tv/somechannel");
    for (const element of Array.from(document.querySelectorAll("[data-i18n]"))) {
      expect(EN[element.getAttribute("data-i18n")!]?.message).toBe(element.textContent!);
    }
    for (const element of Array.from(document.querySelectorAll("[data-i18n-title]"))) {
      expect(EN[element.getAttribute("data-i18n-title")!]?.message).toBe(element.getAttribute("title")!);
    }
  });

  // the maintainer, 2026-11-21: a description of each figure on hover
  test("each of today's figures says what it counts on hover, in the browser's language", async () => {
    const hints = () => ["figBreaks", "figBlocked", "figPassed", "figStalls"].map((id) => $(id).parentElement!.getAttribute("title"));
    await openPopup("https://www.twitch.tv/somechannel");
    expect(hints()).toEqual([EN.figureBreaksHint.message, EN.figureBlockedHint.message, EN.figurePassedHint.message, EN.figureStallsHint.message]);
    await openPopup("https://www.twitch.tv/somechannel", { messages: PT });
    expect(hints()).toEqual([PT.figureBreaksHint.message, PT.figureBlockedHint.message, PT.figurePassedHint.message, PT.figureStallsHint.message]);
  });
});
