// export.js runs as a classic script in the export page the popup opens (export.html#<channel>); here on happy-dom with
// the page's markup, the page env's chrome mock, stand-ins for PurpleDiagnostics and PurpleDiagFormat, and recorded
// blob URLs and link clicks in place of the browser's download (TS-608).
import { afterEach, describe, expect, test } from "bun:test";
import { join } from "path";
import { silenceConsole } from "../../../../serviceWorker/test/harness/console";
import { usePageEnv } from "../../../../serviceWorker/test/harness/page-env";
const COMMON = join(import.meta.dir, "..", "..", "..", "src", "common");

const env = usePageEnv({ chrome: { whitelist: ["a", "b"], pausePlayOnBreaks: true } });
silenceConsole();

const HTML = await Bun.file(join(COMMON, "html", "export.html")).text();
const SOURCE = await Bun.file(join(COMMON, "js", "export.js")).text();
const I18N = await Bun.file(join(COMMON, "js", "i18n.js")).text();
const ENV = await Bun.file(join(COMMON, "js", "env.js")).text();
const g = globalThis as any;

type Saved = { name: string; text: string };
const ENTRY = { at: 1, channel: "somechannel", level: "info", type: "breakStart", data: { kind: "stitched" } };

const openPage = async (hash: string, { entries = [ENTRY] as any[], extension = "chrome-extension", installType = undefined as string | undefined, agent = "", search = "" } = {}) => {
  document.body.innerHTML = HTML.replace(/^[\s\S]*<body[^>]*>/, "").replace(/<script[\s\S]*$/, "");
  window.history.replaceState(null, "", "/common/html/export.html" + search + hash);
  const tabs: string[] = [];
  (env.chrome as any).tabs = { create: (details: { url: string }) => tabs.push(details.url) };
  const saved: Saved[] = [];
  const blobs = new Map<string, Blob>();
  const formatCalls: any[] = [];
  let next = 0;
  URL.createObjectURL = (blob: Blob) => {
    const url = `blob:test/${next++}`;
    blobs.set(url, blob);
    return url;
  };
  URL.revokeObjectURL = () => {};
  const pending: Promise<void>[] = [];
  HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
    const blob = blobs.get(this.href);
    if (blob) pending.push(blob.text().then((text) => void saved.push({ name: this.download, text })));
  };
  if (agent) Object.defineProperty(navigator, "userAgent", { value: agent, configurable: true });
  const chrome = env.chrome as any;
  chrome.runtime.getURL = (path: string) => `${extension}://purple-test/${path}`;
  chrome.runtime.getManifest = () => ({ version: "9.9.9" });
  if (installType) chrome.management = { getSelf: (callback: (self: any) => void) => callback({ installType }) };
  else delete chrome.management;
  g.PurpleDiagnostics = { entries: (channel: string) => Promise.resolve(channel === "somechannel" ? entries : []) };
  g.PurpleDiagFormat = {
    format: (channel: string, list: any[], meta: any) => {
      formatCalls.push({ channel, list, meta });
      return `# log of ${channel}\n${list.length} lines\n`;
    },
    fileName: (channel: string) => `purple-log-${channel}-2026-11-21.txt`,
    changedSettings: (stored: any) => Object.keys(stored).sort(),
  };
  delete g.PurpleI18n;
  delete g.PurpleEnv;
  delete g.PurpleExport;
  new Function(I18N)();
  new Function(ENV)();
  new Function(SOURCE)();
  await g.PurpleExport.ready;
  await Promise.all(pending);
  return { saved, formatCalls, tabs, settle: () => Promise.all(pending) };
};

afterEach(() => {
  delete g.PurpleDiagnostics;
  delete g.PurpleDiagFormat;
  delete (env.chrome as any).management;
});

const $ = (id: string) => document.getElementById(id)!;

describe("export page (TS-608)", () => {
  test("builds the channel's log, shows it and saves it once as a .txt", async () => {
    const page = await openPage("#somechannel");
    expect($("ready").hidden).toBe(false);
    expect($("missing").hidden).toBe(true);
    expect($("text").textContent).toBe("# log of somechannel\n1 lines\n");
    expect(page.saved).toEqual([{ name: "purple-log-somechannel-2026-11-21.txt", text: "# log of somechannel\n1 lines\n" }]);
    expect($("summary").textContent).toBe("1 lines from the last 7 days");
    expect($("title").textContent).toBe("Purple log · somechannel");
  });

  test("Download again saves the same file again", async () => {
    const page = await openPage("#somechannel");
    $("save").click();
    await page.settle();
    expect(page.saved.length).toBe(2);
    expect(page.saved[1]).toEqual(page.saved[0]);
  });

  test("the formatter gets the version, the store, the browser, the time zone and the changed settings", async () => {
    const page = await openPage("#somechannel", { agent: "Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0", extension: "moz-extension" });
    const { meta } = page.formatCalls[0];
    expect(meta.purple).toBe("9.9.9");
    expect(meta.install).toBe("Firefox Add-ons");
    expect(meta.browser).toBe("Firefox 157.0");
    expect(meta.timeZone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(meta.settingsChanged).toEqual(["pausePlayOnBreaks", "whitelist"]);
    expect(typeof meta.now).toBe("number");
  });

  test.each([
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0", "Edge 141"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0", "Opera 125"],
    ["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36", "Chrome 141"],
  ])("browser name from %s", async (agent, name) => {
    const page = await openPage("#somechannel", { agent });
    expect(page.formatCalls[0].meta.browser).toBe(name);
    expect(page.formatCalls[0].meta.install).toBe("Chrome Web Store");
  });

  test("an unpacked build says so", async () => {
    const page = await openPage("#somechannel", { installType: "development" });
    expect(page.formatCalls[0].meta.install).toBe("development");
  });

  test("the bug-report link fills in the channel, the version and the browser", async () => {
    await openPage("#somechannel", { agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" });
    const url = new URL(($("report") as HTMLAnchorElement).href);
    expect(url.origin + url.pathname).toBe("https://github.com/arthurbolsoni/Purple-adblock/issues/new");
    expect(Object.fromEntries(url.searchParams)).toEqual({ template: "bug-report.yml", channel: "twitch.tv/somechannel", version: "9.9.9", browser: "Chrome 141" });
  });

  test("a channel with no entries still gives a file with the header", async () => {
    const page = await openPage("#somechannel", { entries: [] });
    expect(page.saved[0].text).toBe("# log of somechannel\n0 lines\n");
  });

  test.each(["", "#", "#Bad%20Name", "#a/b", "#%E0%A4%A"])("no valid channel in %p: nothing saved", async (hash) => {
    const page = await openPage(hash);
    expect($("missing").hidden).toBe(false);
    expect($("ready").hidden).toBe(true);
    expect(page.saved).toEqual([]);
  });

  // the popup's "Report a bug" (export.html?report=1#<channel>): the file, then the bug-report form in a tab
  test("from Report a bug: the file is saved and the bug-report form opens with its fields", async () => {
    const page = await openPage("#somechannel", { search: "?report=1", agent: "Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0" });
    expect(page.saved.length).toBe(1);
    expect(page.tabs.length).toBe(1);
    const url = new URL(page.tabs[0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({ template: "bug-report.yml", channel: "twitch.tv/somechannel", version: "9.9.9", browser: "Firefox 157.0" });
    expect($("saved").textContent).toContain("Purple log");
  });

  test("the plain export opens no tab", async () => {
    const page = await openPage("#somechannel");
    expect(page.tabs).toEqual([]);
  });

  test("the channel is read in lower case", async () => {
    const page = await openPage("#SomeChannel");
    expect(page.formatCalls[0].channel).toBe("somechannel");
  });
});
