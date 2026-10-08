// content-script.js runs as a classic script in the extension's isolated world; here it runs on happy-dom
// with a chrome.storage mock. Firefox (MV2) manifest: there is no MAIN world content script, so the content
// script adds app/bundle.js to the page itself, without waiting for storage (T-111), and answers getSettings (E7).
import { beforeAll, describe, expect, test } from "bun:test";
import { join } from "path";
import { silenceConsole } from "../../serviceWorker/test/harness/console";
import { usePageEnv } from "../../serviceWorker/test/harness/page-env";

const STORED = { whitelist: ["somechannel"], toggleProxy: true, proxyUrl: "" };
const MANIFEST = await Bun.file(join(import.meta.dir, "..", "firefox", "manifest.json")).json();

// storage answers only when the test calls flushStorage()
const env = usePageEnv({ chrome: STORED, manifest: MANIFEST, deferStorage: true });
// happy-dom reports the disabled <script src> load as an error
silenceConsole(["error"]);
const appended: HTMLScriptElement[] = [];
const replies: any[] = [];

beforeAll(async () => {
  const source = await Bun.file(join(import.meta.dir, "content-script.js")).text();
  const appendChild = document.head.appendChild.bind(document.head);
  document.head.appendChild = ((node: any) => {
    appended.push(node);
    return appendChild(node);
  }) as any;
  window.addEventListener("message", (event: any) => {
    if (event.data?.type === "setSettings") replies.push(event.data);
  });
  new Function(source)();
});

const getSettings = () => window.postMessage({ type: "getSettings", value: null }, "*");

describe("content script on Firefox (MV2)", () => {
  test("reads the settings from storage", () => {
    expect(env.chrome.getCalls).toEqual([["whitelist", "toggleProxy", "proxyUrl", "debug", "blockCsai", "backupPlayerTypes", "lowQualityFallback", "pinBackupPlayerType", "stripFallback", "forcePopoutToken", "reloadAfterAd"]]);
  });

  test("injects app/bundle.js before storage answers, and removes the tag once loaded", () => {
    expect(appended).toHaveLength(1);
    const [script] = appended;
    expect(script.src).toBe("chrome-extension://purple-test/app/bundle.js");
    expect(script.isConnected).toBe(true);

    // happy-dom calls on* handlers without `this`; browsers bind it to the element.
    script.onload!.call(script, new Event("load"));
    expect(script.isConnected).toBe(false);
  });

  // the page gets the settings once storage answers (pages without a player: blockCsai, debug, T-301), and a
  // getSettings sent before then is answered too
  test("once storage answers, the settings go to the page, and a getSettings sent before is answered", async () => {
    getSettings();
    await Bun.sleep(10);
    expect(replies).toEqual([]);

    env.chrome.flushStorage();
    await Bun.sleep(10);
    expect(replies).toEqual([{ type: "setSettings", value: STORED }, { type: "setSettings", value: STORED }]);
  });

  test("answers later getSettings messages with the stored settings", async () => {
    getSettings();
    await Bun.sleep(10);
    expect(replies).toEqual([{ type: "setSettings", value: STORED }, { type: "setSettings", value: STORED }, { type: "setSettings", value: STORED }]);
  });
});
