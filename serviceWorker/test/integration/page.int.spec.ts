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

// the player's own first message to its worker; Purple sends nothing before it (docs/findings/2026-10-07-l3-server-observations.md)
const PLAYER_INIT = { id: 0, funcName: "init", args: [] };

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
  // the page requests /integrity before the player creates its first worker (directory page, client-side navigation)
  await fetch("https://gql.twitch.tv/integrity", { method: "POST" });
  await Bun.sleep(5);
  main = new (window as any).Worker(WORKER_URL);
  main.postMessage(PLAYER_INIT);
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

  // T-401 (F-05): the headers of the page's GQL requests reach the workers
  test("page GQL request headers reach the worker", async () => {
    await fetch("https://gql.twitch.tv/gql", { method: "POST", headers: { "X-Device-Id": "DEVICE_ID", "Client-Version": "CLIENT_VERSION" }, body: "{}" });
    await Bun.sleep(5);
    expect(main.posted).toContainEqual({ funcName: "setGqlHeaders", value: { "X-Device-Id": "DEVICE_ID", "Client-Version": "CLIENT_VERSION" } });
  });

  // T-402 (F-06): a worker's GQL request runs in the page, with the page's fetch from before Purple's hook
  test("the page offers the GQL bridge to the worker", () => {
    expect(main.posted).toContainEqual({ funcName: "setGqlBridge", value: true });
  });

  test("a worker's gqlRequest runs with the page's original fetch, unchanged, and the answer goes back to that worker", async () => {
    const body = JSON.stringify({ operationName: "PlaybackAccessToken", variables: { login: "channel", playerType: "frontpage" } });
    main.emit({ type: "gqlRequest", id: 5, body, headers: { "Client-ID": "CLIENT_ID" } });
    await Bun.sleep(5);
    const call = env.pageFetch.calls.at(-1)!;
    expect(call.url).toBe("https://gql.twitch.tv/gql#origin=twilight");
    expect(call.init).toEqual({ method: "POST", headers: { "Client-ID": "CLIENT_ID" }, body });
    expect(main.posted).toContainEqual({ funcName: "gqlResponse", value: { id: 5, status: 200, body: "" } });
  });

  // T-408 (F-12): the page's token request asks for popout until a setSettings turns forcePopoutToken off
  test("the page's PlaybackAccessToken goes as popout, and as the page made it with forcePopoutToken off", async () => {
    const body = JSON.stringify({ operationName: "PlaybackAccessToken", variables: { login: "channel", playerType: "site" } });
    const sentType = () => JSON.parse(env.pageFetch.calls.at(-1)!.init.body).variables.playerType;

    await fetch("https://gql.twitch.tv/gql", { method: "POST", body });
    expect(sentType()).toBe("popout");

    window.postMessage({ type: "setSettings", value: { whitelist: [], toggleProxy: false, proxyUrl: "", forcePopoutToken: false } }, "*");
    await Bun.sleep(5);
    await fetch("https://gql.twitch.tv/gql", { method: "POST", body });
    expect(sentType()).toBe("site");

    window.postMessage({ type: "setSettings", value: { whitelist: [], toggleProxy: false, proxyUrl: "" } }, "*");
    await Bun.sleep(5);
    await fetch("https://gql.twitch.tv/gql", { method: "POST", body });
    expect(sentType()).toBe("popout");
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

// T-107: on a direct channel load the player creates two workers and Purple runs in both (T-111)
// (docs/findings/2026-10-07-e2e-harness.md)
describe("worker registry", () => {
  const settings = { whitelist: ["other"], toggleProxy: false, proxyUrl: "" };
  let second: FakeWorker;

  beforeAll(() => {
    second = new (window as any).Worker(WORKER_URL, { name: "second" });
    second.postMessage(PLAYER_INIT);
  });

  test("worker options reach the native Worker", () => {
    expect(second.options).toEqual({ name: "second" });
  });

  test("getSettings from any worker is forwarded to the window", async () => {
    const message = nextWindowMessage("getSettings");
    second.emit({ type: "getSettings" });
    expect(await message).toEqual({ type: "getSettings", value: null });
  });

  test("setSettings reaches every worker", async () => {
    window.postMessage({ type: "setSettings", value: settings }, "*");
    await Bun.sleep(5);
    expect(main.posted.at(-1)).toEqual({ funcName: "setSettings", value: settings });
    expect(second.posted.at(-1)).toEqual({ funcName: "setSettings", value: settings });
  });

  test("pause and play are answered to the worker that asked", () => {
    const before = main.posted.length;
    second.emit({ type: "pause" });
    second.emit({ type: "play" });
    expect(second.posted.slice(-2)).toEqual([
      { funcName: "pause", args: undefined, id: 1 },
      { funcName: "play", args: undefined, id: 1 },
    ]);
    expect(main.posted).toHaveLength(before);
  });

  test("a player state change is answered to the worker that sent it", () => {
    const before = main.posted.length;
    second.emit({ type: "other", arg: { key: "state", value: "Playing" } });
    expect(second.posted.at(-1)).toEqual({ funcName: "Playing" });
    expect(main.posted).toHaveLength(before);
  });

  test("a quality change reaches every worker", () => {
    second.emit({ type: "PlayerQualityChanged", arg: { name: "1080p60" } });
    expect(main.posted.at(-1)).toEqual({ funcName: "setQuality", value: "1080p60" });
    expect(second.posted.at(-1)).toEqual({ funcName: "setQuality", value: "1080p60" });
  });

  test("a worker created later gets the current settings, integrity, GQL headers and quality", async () => {
    await fetch("https://gql.twitch.tv/integrity", { method: "POST" });
    await Bun.sleep(5);
    const later = new (window as any).Worker(WORKER_URL);
    expect(later.posted).toEqual([]);

    later.postMessage(PLAYER_INIT);
    expect(later.posted).toEqual([
      PLAYER_INIT,
      // T-402: offered when the bundle loads
      { funcName: "setGqlBridge", value: true },
      { funcName: "setIntegrity", value: INTEGRITY_BODY },
      { funcName: "setSettings", value: settings },
      // T-401: sent by the "page GQL request headers reach the worker" test above
      { funcName: "setGqlHeaders", value: { "X-Device-Id": "DEVICE_ID", "Client-Version": "CLIENT_VERSION" } },
      { funcName: "setQuality", value: "1080p60" },
    ]);
  });

  // a setIntegrity sent before the player's init killed the player worker on twitch.tv
  test("nothing from Purple reaches a worker before the player's first message", async () => {
    const fresh = new (window as any).Worker(WORKER_URL);
    window.postMessage({ type: "setSettings", value: settings }, "*");
    await Bun.sleep(5);
    fresh.emit({ type: "pause" });
    expect(fresh.posted).toEqual([]);
  });

  test("a terminated worker gets nothing more", async () => {
    second.terminate();
    expect(second.terminated).toBe(1);
    const before = second.posted.length;
    window.postMessage({ type: "setSettings", value: settings }, "*");
    await Bun.sleep(5);
    expect(second.posted).toHaveLength(before);
    expect(main.posted.at(-1)).toEqual({ funcName: "setSettings", value: settings });
  });

  test.each([
    ["answers 404", "https://assets.twitch.tv/missing.js", false],
    ["throws", "https://cross-origin.example/worker.js", true],
  ])("when the script download %s, the worker starts from the original URL and is not registered", async (_, url, throws) => {
    if (throws) FakeXMLHttpRequest.throwing.add(url);
    const worker = new (window as any).Worker(url);
    expect(worker).toBeInstanceOf(FakeWorker);
    expect(worker.url).toBe(url);
    worker.postMessage(PLAYER_INIT);
    window.postMessage({ type: "setSettings", value: settings }, "*");
    await Bun.sleep(5);
    expect(worker.posted).toEqual([PLAYER_INIT]);
  });
});

describe("integrity capture", () => {
  test("an /integrity response from before the first worker reaches it right after the player's first message", () => {
    // the GQL bridge offer (T-402) is broadcast when the bundle loads, before the /integrity response
    expect(main.posted.slice(0, 3)).toEqual([PLAYER_INIT, { funcName: "setGqlBridge", value: true }, { funcName: "setIntegrity", value: INTEGRITY_BODY }]);
  });

  // T-106: the page gets the original response; the token is read from a clone
  test("the /integrity response is sent to the worker and the page gets the original response", async () => {
    const response = await fetch("https://gql.twitch.tv/integrity", { method: "POST" });
    await Bun.sleep(5);

    expect(response).toBe(env.pageFetch.calls.at(-1)!.response);
    expect(await response.text()).toBe(INTEGRITY_BODY);
    expect(response.headers.get("x-test")).toBe("1");
    expect(main.posted).toContainEqual({ funcName: "setIntegrity", value: INTEGRITY_BODY });
  });

  test("other requests go to the original fetch and the page gets the same response, unread", async () => {
    const before = main.posted.length;
    const response = await fetch("https://gql.twitch.tv/gql", { method: "POST", body: "{}" });
    expect(response).toBe(env.pageFetch.calls.at(-1)!.response);
    expect(response.bodyUsed).toBe(false);
    expect(env.pageFetch.calls.map((c) => c.url)).toContain("https://gql.twitch.tv/gql");
    expect(main.posted).toHaveLength(before);
  });
});

// T-110: the page keeps the worker's debug events in window.__purple.events, only with `debug` on
describe("debug events", () => {
  const event = (n: number) => ({ type: "purpleEvent", event: { type: "adDetected", channel: "channel", at: n } });

  test("with debug off, events are dropped and window.__purple is not created", () => {
    main.emit(event(1));
    expect((window as any).__purple).toBeUndefined();
  });

  test("with debug on, events reach window.__purple.events, the last 500 only", async () => {
    window.postMessage({ type: "setSettings", value: { whitelist: [], debug: true } }, "*");
    await Bun.sleep(5);
    expect((window as any).__purple).toEqual({ events: [] });

    for (let n = 0; n < 510; n++) main.emit(event(n));

    const events = (window as any).__purple.events;
    expect(events).toHaveLength(500);
    expect(events[0]).toEqual({ type: "adDetected", channel: "channel", at: 10 });
    expect(events.at(-1).at).toBe(509);
  });
});

// T-301: client-side ads (B-025) answered in the page; counted per break type
describe("client-side ads", () => {
  const ADS = (bp: string) => `https://edge.ads.twitch.tv/ads?bp=${bp}&u=x`;
  const csaiEvents = () => ((window as any).__purple?.events ?? []).filter((e: any) => e.type === "csaiBlocked");

  test("by default a fetch to edge.ads.twitch.tv gets an empty 200 and never reaches the network", async () => {
    const before = env.pageFetch.calls.length;
    const response = await fetch(ADS("preroll"));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
    expect(env.pageFetch.calls).toHaveLength(before);
  });

  test("blocked requests are counted per break type in the debug events", async () => {
    await fetch(ADS("midroll"));
    await fetch(ADS("midroll"));
    const events = csaiEvents();
    expect(events.at(-1)).toMatchObject({ type: "csaiBlocked", bp: "midroll", count: 2 });
    expect(events.some((e: any) => e.bp === "preroll" && e.count === 1)).toBe(true);
  });

  test("with blockCsai off, the request reaches the network", async () => {
    window.postMessage({ type: "setSettings", value: { whitelist: [], debug: true, blockCsai: false } }, "*");
    await Bun.sleep(5);
    await fetch(ADS("midroll"));
    expect(env.pageFetch.calls.at(-1)!.url).toBe(ADS("midroll"));
  });
});
