// content-script.js with the Chromium (MV3) manifest, on happy-dom with a chrome.storage mock. Chromium runs
// app/bundle.js as a MAIN world content script (T-111), so the isolated content script only answers getSettings.
import { beforeAll, describe, expect, test } from "bun:test";
import { join } from "path";
import { usePageEnv } from "../../serviceWorker/test/harness/page-env";

const STORED = { whitelist: ["somechannel"], toggleProxy: false, proxyUrl: "" };
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

  test("a getSettings sent before storage answers gets the settings once it does", async () => {
    window.postMessage({ type: "getSettings", value: null }, "*");
    await Bun.sleep(10);
    expect(replies).toEqual([]);

    env.chrome.flushStorage();
    await Bun.sleep(10);
    expect(replies).toEqual([{ type: "setSettings", value: STORED }]);
    expect(env.chrome.getCalls).toEqual([["whitelist", "toggleProxy", "proxyUrl"]]);
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });
});
