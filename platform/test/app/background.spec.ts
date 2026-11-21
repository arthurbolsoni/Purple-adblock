// F-30 (T-605): app/background.js, the extension's background script, runs here as a classic script against a fake
// chrome API: Chromium's (chrome.action) and Firefox's MV2 one (chrome.browserAction). A tab's content script says when
// Purple starts and stops blocking an ad; the badge goes on that tab's icon.
import { describe, expect, test } from "bun:test";
import { join } from "path";

const SOURCE = await Bun.file(join(import.meta.dir, "..", "..", "src", "app", "background.js")).text();

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
