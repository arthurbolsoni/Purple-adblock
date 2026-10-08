// content-script.js with the Chromium (MV3) manifest, on happy-dom with a chrome.storage mock. Chromium runs
// app/bundle.js as a MAIN world content script (T-111), so the isolated content script only answers getSettings.
import { beforeAll, describe, expect, test } from "bun:test";
import { join } from "path";
import { usePageEnv } from "../../serviceWorker/test/harness/page-env";

// `debug` (T-109, T-110) is read from storage with the other settings
const STORED = { whitelist: ["somechannel"], toggleProxy: false, proxyUrl: "", debug: true, blockCsai: false };
const MANIFEST = await Bun.file(join(import.meta.dir, "..", "chromium", "manifest.json")).json();

// storage answers only when the test calls flushStorage()
const env = usePageEnv({ chrome: STORED, manifest: MANIFEST, deferStorage: true });
const replies: any[] = [];

beforeAll(async () => {
  const source = await Bun.file(join(import.meta.dir, "content-script.js")).text();
  window.addEventListener("message", (event: any) => {
    if (event.data?.type === "setSettings") replies.push(event.data);
  });
  new Function(source)();
});

describe("content script on Chromium (MV3)", () => {
  test("adds no <script> to the page", () => {
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });

  test("once storage answers, the settings go to the page, and a getSettings sent before is answered", async () => {
    window.postMessage({ type: "getSettings", value: null }, "*");
    await Bun.sleep(10);
    expect(replies).toEqual([]);

    env.chrome.flushStorage();
    await Bun.sleep(10);
    expect(replies).toEqual([{ type: "setSettings", value: STORED }, { type: "setSettings", value: STORED }]);
    expect(env.chrome.getCalls).toEqual([["whitelist", "toggleProxy", "proxyUrl", "debug", "blockCsai", "backupPlayerTypes", "lowQualityFallback", "pinBackupPlayerType", "stripFallback"]]);
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });

  // T-602: a storage change reaches the page, which sends it to every live worker, without a reload
  test("a change to a stored setting sends the new settings to the page", async () => {
    replies.length = 0;
    env.chrome.storage.local.set({ whitelist: ["somechannel", "other"] });
    env.chrome.flushStorage();
    await Bun.sleep(10);
    expect(replies).toEqual([{ type: "setSettings", value: { ...STORED, whitelist: ["somechannel", "other"] } }]);
  });

  test("a change to a key that is not a setting sends nothing", async () => {
    replies.length = 0;
    env.chrome.storage.local.set({ unrelated: 1 });
    env.chrome.flushStorage();
    await Bun.sleep(10);
    expect(replies).toEqual([]);
  });
});
