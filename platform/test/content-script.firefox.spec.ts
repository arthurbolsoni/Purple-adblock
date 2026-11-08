// content-script.js with the Firefox (MV2) manifest on Firefox 157, on happy-dom with a chrome.storage mock. Firefox 128
// and later run app/bundle.js as a MAIN world content script also in MV2 (T-111), so the isolated content script only
// answers getSettings.
import { beforeAll, describe, expect, test } from "bun:test";
import { join } from "path";
import { usePageEnv } from "../../serviceWorker/test/harness/page-env";
const SRC = join(import.meta.dir, "..", "src");

const STORED = { whitelist: ["somechannel"], toggleProxy: false, proxyUrl: "" };
const RAW = await Bun.file(join(SRC, "..", "firefox", "manifest.json")).json();
// the manifest as Firefox's runtime.getManifest() returns it: each content script's `js` as a full moz-extension://
// URL (Firefox 157, 2026-11-07, T-830; the content script added the bundle a second time when it looked for the
// bare path)
const MANIFEST = {
  ...RAW,
  content_scripts: RAW.content_scripts.map((script: any) => ({
    ...script,
    js: script.js.map((path: string) => `moz-extension://4b5c8a2e-1f3d-4c6b-9a7e-2d8f0c1b3e5a/${path}`),
  })),
};

const env = usePageEnv({ chrome: STORED, manifest: MANIFEST, deferStorage: true });
const replies: any[] = [];

beforeAll(async () => {
  Object.defineProperty(navigator, "userAgent", { value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0", configurable: true });
  const source = await Bun.file(join(SRC, "content-script.js")).text();
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
