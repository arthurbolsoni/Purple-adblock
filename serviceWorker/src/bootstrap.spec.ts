import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import { bootstrapWorker } from "./bootstrap";
import { AppController } from "./app.controller";

const makeScope = (respond: (url: any, init?: any) => Response = () => new Response("original")) => {
  const target = new EventTarget();
  const calls: { url: any; init: any; self: any }[] = [];
  const posted: any[] = [];
  const scope: any = Object.assign(target, {
    calls,
    posted,
    postMessage: (message: any) => posted.push(message),
    fetch: async function (this: any, url: any, init?: any) {
      calls.push({ url, init, self: this });
      return respond(url, init);
    },
    send: (data: any) => target.dispatchEvent(new MessageEvent("message", { data })),
  });
  return scope;
};

const MASTER = `#EXTM3U
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="chunked",NAME="1080p60 (source)",AUTOSELECT=YES,DEFAULT=YES
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,VIDEO="chunked"
https://video-weaver.example.hls.ttvnw.net/v1/playlist/chunked.m3u8
`;

beforeEach(() => {
  spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("bootstrapWorker", () => {
  test("importing the module has no side effects", () => {
    expect((globalThis as any).appController).toBeUndefined();
    expect((globalThis as any).routerList).toBeUndefined();
    expect((globalThis as any).request).toBeUndefined();
  });

  test("keeps the original fetch as request, asks the page for settings and hooks fetch", () => {
    const scope = makeScope();
    const original = scope.fetch;

    const { controller, router } = bootstrapWorker(scope);

    expect(scope.request).toBe(original);
    expect(scope.fetch).not.toBe(original);
    expect(scope.appController).toBe(controller);
    expect(controller).toBeInstanceOf(AppController);
    expect(router.routes.map((r) => r.propertyKey)).toEqual(["onChannel", "onChannel", "onFetch", "onChannelPicture"]);
    expect(scope.posted).toEqual([{ type: "getSettings" }]);
  });

  test("an unrouted request reaches the original fetch with the same arguments", async () => {
    const scope = makeScope();
    bootstrapWorker(scope);
    const init = { method: "GET" };

    const response = await scope.fetch("https://example.com/other", init);

    expect(await response.text()).toBe("original");
    expect(scope.calls).toEqual([{ url: "https://example.com/other", init, self: scope }]);
  });

  test("a non-string input is not routed", async () => {
    const scope = makeScope();
    bootstrapWorker(scope);
    const url = new URL("https://usher.ttvnw.net/api/channel/hls/channel.m3u8");

    await scope.fetch(url);

    expect(scope.calls[0].url).toBe(url);
    expect(scope.appController.appService.actualChannel).toBe("");
  });

  test("the usher route stores the channel and returns the master body", async () => {
    const scope = makeScope(() => new Response(MASTER));
    const { controller } = bootstrapWorker(scope);

    const response = await scope.fetch("https://usher.ttvnw.net/api/channel/hls/somechannel.m3u8?token=x");

    expect(await response.text()).toBe(MASTER);
    expect((controller as any).appService.actualChannel).toBe("somechannel");
  });

  test("two scopes do not share state", async () => {
    const a = makeScope(() => new Response(MASTER));
    const b = makeScope(() => new Response(MASTER));
    const workerA = bootstrapWorker(a);
    const workerB = bootstrapWorker(b);
    const playerA = (workerA.controller as any).appService;
    const playerB = (workerB.controller as any).appService;

    expect(playerA).not.toBe(playerB);

    await a.fetch("https://usher.ttvnw.net/api/channel/hls/channel_a.m3u8");
    a.send({ funcName: "setQuality", value: "720p60" });
    a.send({ funcName: "setIntegrity", value: JSON.stringify({ token: "TOKEN_A" }) });

    expect(playerA.actualChannel).toBe("channel_a");
    expect(playerA.quality).toBe("720p60");
    expect(playerA.integrityToken).toBe("TOKEN_A");

    expect(playerB.actualChannel).toBe("");
    expect(playerB.quality).toBe("");
    expect(playerB.integrityToken).toBe("");
    expect(b.calls).toEqual([]);
  });
});
