import { describe, expect, test } from "bun:test";
import { AppController } from "../app.controller";
import { bindMessages, createRouter, Fetch, getFetchRoutes, getMessageRoutes, Message } from "./handler.decorator";

class Sample {
  calls: string[] = [];

  @Fetch("/first/")
  async first(url: string) {
    this.calls.push("first " + url);
    return new Response("first");
  }

  @Fetch("/second/", "skip")
  async second(url: string) {
    this.calls.push("second " + url);
    return new Response("second");
  }

  @Fetch("/")
  async third() {
    return new Response("third");
  }

  @Message("hello")
  hello(data: any) {
    this.calls.push("hello " + data.value);
  }
}

class Child extends Sample {
  @Fetch("/child/")
  async child() {
    return new Response("child");
  }
}

const scope = () => {
  const target = new EventTarget();
  return Object.assign(target, {
    send: (data: any) => target.dispatchEvent(new MessageEvent("message", { data })),
  });
};

describe("@Fetch / createRouter", () => {
  test("stores routes on the class in declaration order", () => {
    expect(getFetchRoutes(new Sample())).toEqual([
      { propertyKey: "first", match: "/first/", ignore: null },
      { propertyKey: "second", match: "/second/", ignore: "skip" },
      { propertyKey: "third", match: "/", ignore: null },
    ]);
    expect(createRouter(new Sample()).routes.map((r) => r.propertyKey)).toEqual(["first", "second", "third"]);
  });

  test("does not register anything on the global object", () => {
    expect((globalThis as any).routerList).toBeUndefined();
    expect((globalThis as any).appController).toBeUndefined();
  });

  test("a subclass adds its routes without changing the parent", () => {
    expect(getFetchRoutes(new Child()).map((r) => r.propertyKey)).toEqual(["first", "second", "third", "child"]);
    expect(getFetchRoutes(new Sample()).map((r) => r.propertyKey)).toEqual(["first", "second", "third"]);
  });

  test("resolve returns the first matching route, bound to the instance", async () => {
    const sample = new Sample();
    const router = createRouter(sample);

    const handler = router.resolve("https://x/first/a")!;
    expect(await (await handler("https://x/first/a", {})).text()).toBe("first");
    expect(sample.calls).toEqual(["first https://x/first/a"]);

    expect(await (await router.resolve("https://x/second/b")!("https://x/second/b", {})).text()).toBe("second");
  });

  test("ignore skips the route and falls through to the next match", async () => {
    const router = createRouter(new Sample());
    expect(await (await router.resolve("https://x/second/skip")!("", {})).text()).toBe("third");
  });

  test("resolve returns undefined when nothing matches", () => {
    expect(createRouter(new Sample()).resolve("no-slash-here")).toBeUndefined();
  });

  test("AppController routes: usher v1 and v2, media playlist by URL or path, picture-by-picture", () => {
    // the player's master listed one variant outside the v1/playlist path (T-104)
    // and one ad segment URI is answered with the blank segment (T-502)
    const appService = {
      isPlayerPlaylist: (url: string) => url === "https://edge.playlist.ttvnw.net/v2/hls/a.m3u8",
      isBlankSegment: (url: string) => url === "https://example.j.cloudfront.hls.ttvnw.net/ad.ts",
    };
    const controller = new AppController(appService as any, { postMessage() {}, request: fetch, logger() {} });
    const router = createRouter(controller);

    expect(router.routes.map((r) => r.propertyKey)).toEqual(["onBlankSegment", "onChannel", "onChannel", "onFetch", "onFetch", "onChannelPicture"]);

    const routeOf = (url: string) => router.routeFor(url)?.propertyKey;
    expect(routeOf("https://edge.playlist.ttvnw.net/v2/hls/a.m3u8")).toBe("onFetch");
    expect(routeOf("https://edge.playlist.ttvnw.net/v2/hls/b.m3u8")).toBeUndefined();
    expect(routeOf("https://usher.ttvnw.net/api/channel/hls/somechannel.m3u8?token=x")).toBe("onChannel");
    expect(routeOf("https://usher.ttvnw.net/api/v2/channel/hls/somechannel.m3u8?token=x")).toBe("onChannel");
    expect(routeOf("https://usher.ttvnw.net/api/channel/hls/somechannel.m3u8?player_type=picture-by-picture")).toBe("onChannelPicture");
    expect(routeOf("https://usher.ttvnw.net/api/v2/channel/hls/somechannel.m3u8?player_type=picture-by-picture")).toBe("onChannelPicture");
    expect(routeOf("https://video-weaver.example.hls.ttvnw.net/v1/playlist/abc.m3u8")).toBe("onFetch");
    expect(routeOf("https://example.j.cloudfront.hls.ttvnw.net/segment.ts")).toBeUndefined();
    expect(routeOf("https://example.j.cloudfront.hls.ttvnw.net/ad.ts")).toBe("onBlankSegment");
  });
});

describe("@Message / bindMessages", () => {
  test("stores message routes on the class", () => {
    expect(getMessageRoutes(new Sample())).toEqual([{ propertyKey: "hello", match: "hello" }]);
  });

  test("dispatches by funcName to the bound instance only", () => {
    const a = new Sample();
    const b = new Sample();
    const scopeA = scope();
    const scopeB = scope();
    bindMessages(scopeA, a);
    bindMessages(scopeB, b);

    scopeA.send({ funcName: "hello", value: 1 });
    scopeA.send({ funcName: "other", value: 2 });
    scopeA.send({ type: "hello" });
    scopeA.send(null);

    expect(a.calls).toEqual(["hello 1"]);
    expect(b.calls).toEqual([]);
  });

  test("AppController messages set integrity, settings and quality on the player", () => {
    const player: any = { setIntegrityToken: (t: string) => (player.token = t), setSettings: (s: any) => (player.settings = s) };
    const controller = new AppController(player, { postMessage() {}, request: fetch, logger() {} });
    const s = scope();
    bindMessages(s, controller);

    s.send({ funcName: "setIntegrity", value: JSON.stringify({ token: "INTEGRITY" }) });
    s.send({ funcName: "setQuality", value: "720p60" });
    s.send({ funcName: "setSettings", value: { whitelist: [] } });

    expect(player.token).toBe("INTEGRITY");
    expect(player.quality).toBe("720p60");
    // T-602: the player gets the message's value (2.6.7 passed the whole message, so `setting.whitelist` was undefined, C-10)
    expect(player.settings).toEqual({ whitelist: [] });
  });
});
