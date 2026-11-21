// F-30 (T-605): app/background.js, the extension's background script, runs here as a classic script against a fake
// chrome API: Chromium's (chrome.action) and Firefox's MV2 one (chrome.browserAction). A tab's content script says when
// Purple starts and stops blocking an ad; the badge goes on that tab's icon.
import { describe, expect, test } from "bun:test";
import { join } from "path";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";

const SOURCE = await Bun.file(join(import.meta.dir, "..", "..", "src", "app", "background.js")).text();
const DIAGNOSTICS = await Bun.file(join(import.meta.dir, "..", "..", "src", "app", "diagnostics.js")).text();

type Call = [method: string, details: Record<string, unknown>];

// the background script on a fake API; `api`: "action" (Chromium MV3) or "browserAction" (Firefox MV2)
const start = (api: "action" | "browserAction", stored: Record<string, unknown> = {}, textColor = true) => {
  const calls: Call[] = [];
  const data = { ...stored };
  const listeners = { message: [] as ((message: any, sender: any) => void)[], storage: [] as ((changes: any, area: string) => void)[] };
  const badge = {
    setBadgeText: (details: any) => calls.push(["text", details]),
    setBadgeBackgroundColor: (details: any) => calls.push(["background", details]),
    ...(textColor ? { setBadgeTextColor: (details: any) => calls.push(["color", details]) } : {}),
  };
  const chrome = {
    [api]: badge,
    runtime: { onMessage: { addListener: (listener: any) => listeners.message.push(listener) } },
    storage: {
      local: { get: (keys: string[], callback: (items: any) => void) => callback(Object.fromEntries(keys.filter((k) => k in data).map((k) => [k, data[k]]))) },
      onChanged: { addListener: (listener: any) => listeners.storage.push(listener) },
    },
    tabs: { query: (_query: any, callback: (tabs: any[]) => void) => callback([{ id: 3 }, { id: 7 }, {}]) },
  };
  new Function("chrome", SOURCE)(chrome);
  return {
    calls,
    message: (message: any, sender: any = { tab: { id: 7 } }) => listeners.message.forEach((listener) => listener(message, sender)),
    store: (key: string, value: unknown, area = "local") => {
      const changes = { [key]: { oldValue: data[key], newValue: value } };
      data[key] = value;
      listeners.storage.forEach((listener) => listener(changes, area));
    },
  };
};

describe.each(["action", "browserAction"] as const)("background script with chrome.%s", (api) => {
  test("an ad being blocked: AD on that tab's icon, in Purple's colour", () => {
    const background = start(api);
    background.message({ type: "adState", blocking: true });
    expect(background.calls).toEqual([
      ["text", { tabId: 7, text: "AD" }],
      ["background", { tabId: 7, color: "#9147ff" }],
      ["color", { tabId: 7, color: "#ffffff" }],
    ]);
  });

  test("the break over: the badge goes", () => {
    const background = start(api);
    background.message({ type: "adState", blocking: false });
    expect(background.calls).toEqual([["text", { tabId: 7, text: "" }]]);
  });

  test("only a tab's adState with a boolean counts", () => {
    const background = start(api);
    background.message({ type: "adState", blocking: true }, {});
    background.message({ type: "adState", blocking: true }, { tab: {} });
    background.message({ type: "other", blocking: true });
    background.message(null);
    expect(background.calls).toEqual([]);
    background.message({ type: "adState", blocking: "yes" });
    expect(background.calls).toEqual([["text", { tabId: 7, text: "" }]]);
  });

  test("with adBadge stored as false no badge is shown, and turning it off clears every tab", () => {
    const off = start(api, { adBadge: false });
    off.message({ type: "adState", blocking: true });
    expect(off.calls).toEqual([["text", { tabId: 7, text: "" }]]);

    const on = start(api, { adBadge: true });
    on.message({ type: "adState", blocking: true });
    on.calls.length = 0;
    on.store("adBadge", false);
    expect(on.calls).toEqual([
      ["text", { tabId: 3, text: "" }],
      ["text", { tabId: 7, text: "" }],
    ]);
    on.calls.length = 0;
    on.store("adBadge", true);
    on.store("whitelist", ["x"]);
    on.store("adBadge", false, "sync");
    expect(on.calls).toEqual([]);
  });

  test("a browser without setBadgeTextColor still gets the badge", () => {
    const background = start(api, {}, false);
    background.message({ type: "adState", blocking: true });
    expect(background.calls).toEqual([
      ["text", { tabId: 7, text: "AD" }],
      ["background", { tabId: 7, color: "#9147ff" }],
    ]);
  });
});

// F-31 (T-607): the diagnostic log's entries from a tab's content script go to PurpleDiagnostics (app/diagnostics.js),
// given here in place of the global the browser defines; `importScripts` stands for the MV3 service worker's
type Diag = { add?: (...args: any[]) => any; prune?: (...args: any[]) => any };
const startDiag = (diagnostics: Diag | undefined, importScripts?: (path: string) => void) => {
  const listeners = { message: [] as ((message: any, sender: any) => void)[], startup: [] as (() => void)[], installed: [] as ((details: any) => void)[] };
  const badge = { setBadgeText: () => {}, setBadgeBackgroundColor: () => {}, setBadgeTextColor: () => {} };
  const calls: any[] = [];
  const chrome = {
    action: { ...badge, setBadgeText: (details: any) => calls.push(details) },
    runtime: {
      onMessage: { addListener: (listener: any) => listeners.message.push(listener) },
      onStartup: { addListener: (listener: any) => listeners.startup.push(listener) },
      onInstalled: { addListener: (listener: any) => listeners.installed.push(listener) },
    },
    storage: { local: { get: (_keys: string[], callback: (items: any) => void) => callback({}) }, onChanged: { addListener: () => {} } },
    tabs: { query: () => {} },
  };
  new Function("chrome", "PurpleDiagnostics", "importScripts", SOURCE)(chrome, diagnostics, importScripts);
  return { listeners, calls, message: (message: any, sender: any) => listeners.message.forEach((listener) => listener(message, sender)) };
};

describe("background script and the diagnostic log (F-31)", () => {
  const recorder = () => {
    const added: any[] = [];
    const pruned: any[] = [];
    return { added, pruned, diagnostics: { add: (...args: any[]) => added.push(args), prune: (...args: any[]) => pruned.push(args) } };
  };
  const ENTRIES = [{ at: 1, channel: "somechannel", level: "info", type: "breakStart" }];

  test("a tab's entries are added, incognito when the tab is", () => {
    const { added, diagnostics } = recorder();
    const background = startDiag(diagnostics);
    background.message({ type: "diag", entries: ENTRIES }, { tab: { id: 7, incognito: false } });
    background.message({ type: "diag", entries: ENTRIES }, { tab: { id: 8, incognito: true } });
    background.message({ type: "diag", entries: ENTRIES }, { tab: { id: 9 } });
    expect(added).toEqual([
      [ENTRIES, { incognito: false }],
      [ENTRIES, { incognito: true }],
      [ENTRIES, { incognito: false }],
    ]);
  });

  test("messages from no tab (the popup, another extension page) and other messages are ignored", () => {
    const { added, diagnostics } = recorder();
    const background = startDiag(diagnostics);
    background.message({ type: "diag", entries: ENTRIES }, {});
    background.message({ type: "diag", entries: ENTRIES }, { id: "purple", url: "chrome-extension://purple/common/html/popup.html" });
    background.message({ type: "diag", entries: ENTRIES }, undefined);
    background.message({ type: "adState", blocking: true }, { tab: { id: 7 } });
    background.message(null, { tab: { id: 7 } });
    expect(added).toEqual([]);
  });

  test("the log is pruned when the browser starts and when Purple is installed or updated", () => {
    const { pruned, diagnostics } = recorder();
    const background = startDiag(diagnostics);
    background.listeners.startup.forEach((listener) => listener());
    background.listeners.installed.forEach((listener) => listener({ reason: "update", previousVersion: "2.7.2" }));
    // prune() gets no argument: the install details are not a time
    expect(pruned).toEqual([[], []]);
  });

  test("without PurpleDiagnostics (its import failed) the badge works and nothing breaks", () => {
    const imported: string[] = [];
    const background = startDiag(undefined, (path) => {
      imported.push(path);
      throw new Error("NetworkError: failed to load diagnostics.js");
    });
    // the MV3 service worker imports it next to itself: app/diagnostics.js
    expect(imported).toEqual(["diagnostics.js"]);
    background.message({ type: "diag", entries: ENTRIES }, { tab: { id: 7 } });
    background.listeners.startup.forEach((listener) => listener());
    background.message({ type: "adState", blocking: false }, { tab: { id: 7 } });
    expect(background.calls).toEqual([{ tabId: 7, text: "" }]);
  });

  test("with PurpleDiagnostics already defined (Firefox's event page) nothing is imported", () => {
    const imported: string[] = [];
    startDiag(recorder().diagnostics, (path) => imported.push(path));
    expect(imported).toEqual([]);
  });

  test("a PurpleDiagnostics that throws breaks neither the message nor the badge", () => {
    const background = startDiag({
      add: () => {
        throw new Error("x");
      },
      prune: () => {
        throw new Error("x");
      },
    });
    expect(() => background.message({ type: "diag", entries: ENTRIES }, { tab: { id: 7 } })).not.toThrow();
    expect(() => background.listeners.startup.forEach((listener) => listener())).not.toThrow();
    background.message({ type: "adState", blocking: false }, { tab: { id: 7 } });
    expect(background.calls).toEqual([{ tabId: 7, text: "" }]);
  });

  test("with the real store: a tab's entries are stored, an incognito tab's are not", async () => {
    const scope: any = { indexedDB: new IDBFactory(), IDBKeyRange };
    new Function("globalThis", DIAGNOSTICS)(scope);
    const background = startDiag(scope.PurpleDiagnostics);
    const now = Date.now();
    background.message({ type: "diag", entries: [{ at: now - 1000, channel: "somechannel", level: "info", type: "breakStart", data: { kind: "csai" } }] }, { tab: { id: 7 } });
    background.message({ type: "diag", entries: [{ at: now - 500, channel: "privatechannel", level: "info", type: "breakStart" }] }, { tab: { id: 8, incognito: true } });
    let channels: any[] = [];
    for (let i = 0; i < 50 && !channels.length; i++) {
      await Bun.sleep(5);
      channels = await scope.PurpleDiagnostics.channels();
    }
    expect(channels).toEqual([{ channel: "somechannel", first: now - 1000, last: now - 1000, count: 1 }]);
    expect(await scope.PurpleDiagnostics.entries("privatechannel")).toEqual([]);
  });
});
