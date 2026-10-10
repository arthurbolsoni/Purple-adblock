// content-script.js with the Firefox (MV2) manifest on Firefox 157, on happy-dom with a chrome.storage mock. Firefox 128
// and later run app/bundle.js as a MAIN world content script also in MV2 (T-111), so the isolated content script only
// answers getSettings.
import { beforeAll, describe, expect, test } from "bun:test";
import { join } from "path";
import { usePageEnv } from "../../serviceWorker/test/harness/page-env";

const STORED = { whitelist: ["somechannel"], toggleProxy: false, proxyUrl: "" };
const MANIFEST = await Bun.file(join(import.meta.dir, "..", "firefox", "manifest.json")).json();

const env = usePageEnv({ chrome: STORED, manifest: MANIFEST, deferStorage: true });
const replies: any[] = [];

beforeAll(async () => {
  Object.defineProperty(navigator, "userAgent", { value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0", configurable: true });
  const source = await Bun.file(join(import.meta.dir, "content-script.js")).text();
  window.addEventListener("message", (event: any) => {
    if (event.data?.type === "setSettings") replies.push(event.data);
  });
  new Function(source)();
});

describe("content script on Firefox 157 (MV2)", () => {
  test("adds no <script> to the page", () => {
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });

  test("once storage answers, the settings go to the page", async () => {
    window.postMessage({ type: "getSettings", value: null }, "*");
    env.chrome.flushStorage();
    // the two replies follow storage's answer; under load (the pre-commit run) they came after the fixed 10 ms wait
    for (let i = 0; i < 100 && replies.length < 2; i++) await Bun.sleep(10);
    expect(replies).toEqual([{ type: "setSettings", value: STORED }, { type: "setSettings", value: STORED }]);
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });
});
