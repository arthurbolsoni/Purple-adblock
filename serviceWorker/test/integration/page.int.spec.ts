// index.ts in a page (happy-dom) with fake Worker, XHR and fetch. Characterizes Purple 2.6.7: worker injection (E1),
// settings and quality bridge, pause/play relay (E6) and integrity capture (E9).
// index.ts keeps module state (first worker = main worker), so this is the only file that imports it.
import { beforeAll, describe, expect, test } from "bun:test";
import { silenceConsole } from "../harness/console";
import { FakeWorker, FakeXMLHttpRequest, usePageEnv } from "../harness/page-env";
import WORKER_BUNDLE_STUB from "../stubs/worker-bundle";

const WORKER_URL = "https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-0000.js";
const WORKER_SCRIPT = "/* original twitch worker */";
const INTEGRITY_BODY = JSON.stringify({ token: "INTEGRITY", expiration: 0, request_id: "REQUEST_ID" });

const env = usePageEnv({
  fetchRoutes: { "https://gql.twitch.tv/integrity": () => new Response(INTEGRITY_BODY, { headers: { "x-test": "1" } }) },
});
silenceConsole();

let main: FakeWorker;

const nextWindowMessage = (type: string) =>
  new Promise<any>((resolve) => {
    const listener = (event: any) => {
      if (event.data?.type !== type) return;
      window.removeEventListener("message", listener);
      resolve(event.data);
    };
    window.addEventListener("message", listener);
  });

beforeAll(async () => {
  FakeXMLHttpRequest.scripts.set(WORKER_URL, WORKER_SCRIPT);
  await import("../../src/index");
  main = new (window as any).Worker(WORKER_URL);
});

describe("worker injection", () => {
  test("downloads the original script with a synchronous XHR", () => {
    expect(FakeXMLHttpRequest.requests).toEqual([{ method: "GET", url: WORKER_URL, async: false }]);
  });

  test("starts the worker from a blob with the worker bundle in front of the original script", async () => {
    expect(main).toBeInstanceOf(FakeWorker);
    expect(main.url).toStartWith("blob:");
    const text = await env.blobText(main.url);
    expect(text.indexOf(WORKER_BUNDLE_STUB)).toBe(0);
    expect(text.trimEnd()).toEndWith(WORKER_SCRIPT);
  });
});

describe("messages", () => {
  test("worker getSettings is forwarded to the window", async () => {
    const message = nextWindowMessage("getSettings");
    main.emit({ type: "getSettings" });
    expect(await message).toEqual({ type: "getSettings", value: null });
  });

  test("window setSettings is sent to the worker", async () => {
    const settings = { whitelist: ["channel"], toggleProxy: false, proxyUrl: "" };
    window.postMessage({ type: "setSettings", value: settings }, "*");
    await Bun.sleep(5);
    expect(main.posted).toContainEqual({ funcName: "setSettings", value: settings });
  });

  test("quality changes reach the worker", () => {
    main.emit({ type: "PlayerQualityChanged", arg: { name: "720p60" } });
    main.emit({ type: "other", arg: { key: "quality", value: { name: "480p" } } });
    expect(main.posted).toContainEqual({ funcName: "setQuality", value: "720p60" });
    expect(main.posted).toContainEqual({ funcName: "setQuality", value: "480p" });
  });

  test("pause and play from the worker are relayed back as player commands", () => {
    main.emit({ type: "pause" });
    main.emit({ type: "play" });
    expect(main.posted).toContainEqual({ funcName: "pause", args: undefined, id: 1 });
    expect(main.posted).toContainEqual({ funcName: "play", args: undefined, id: 1 });
  });
});

describe("integrity capture", () => {
  test("the /integrity response is sent to the worker and still readable by the page", async () => {
    const response = await fetch("https://gql.twitch.tv/integrity", { method: "POST" });

    expect(await response.text()).toBe(INTEGRITY_BODY);
    expect(response.headers.get("x-test")).toBe("1");
    expect(main.posted).toContainEqual({ funcName: "setIntegrity", value: INTEGRITY_BODY });
  });

  test("other requests go to the original fetch", async () => {
    const before = main.posted.length;
    const response = await fetch("https://gql.twitch.tv/gql", { method: "POST", body: "{}" });
    expect(response.status).toBe(200);
    expect(env.pageFetch.calls.map((c) => c.url)).toContain("https://gql.twitch.tv/gql");
    expect(main.posted).toHaveLength(before);
  });
});
