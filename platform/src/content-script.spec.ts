// content-script.js runs as a classic script in the extension's isolated world; here it runs on happy-dom
// with a chrome.storage mock. Characterizes Purple 2.6.7: bundle injection and the settings reply (E7).
import { beforeAll, describe, expect, test } from "bun:test";
import { join } from "path";
import { silenceConsole } from "../../serviceWorker/test/harness/console";
import { usePageEnv } from "../../serviceWorker/test/harness/page-env";

const STORED = { whitelist: ["somechannel"], toggleProxy: true, proxyUrl: "" };

const env = usePageEnv({ chrome: STORED });
// happy-dom reports the disabled <script src> load as an error
silenceConsole(["error"]);
const appended: HTMLScriptElement[] = [];

beforeAll(async () => {
  const source = await Bun.file(join(import.meta.dir, "content-script.js")).text();
  const appendChild = document.head.appendChild.bind(document.head);
  document.head.appendChild = ((node: any) => {
    appended.push(node);
    return appendChild(node);
  }) as any;
  new Function(source)();
});

describe("content script", () => {
  test("reads the settings from storage", () => {
    expect(env.chrome.getCalls).toEqual([["whitelist", "toggleProxy", "proxyUrl"]]);
  });

  test("injects app/bundle.js into the page and removes the tag once loaded", () => {
    expect(appended).toHaveLength(1);
    const [script] = appended;
    expect(script.src).toBe("chrome-extension://purple-test/app/bundle.js");
    expect(script.isConnected).toBe(true);

    // happy-dom calls on* handlers without `this`; browsers bind it to the element.
    script.onload!.call(script, new Event("load"));
    expect(script.isConnected).toBe(false);
  });

  test("answers getSettings with the stored settings", async () => {
    const reply = new Promise<any>((resolve) => {
      window.addEventListener("message", (event: any) => {
        if (event.data?.type === "setSettings") resolve(event.data);
      });
    });
    window.postMessage({ type: "getSettings", value: null }, "*");
    expect(await reply).toEqual({ type: "setSettings", value: STORED });
  });
});
