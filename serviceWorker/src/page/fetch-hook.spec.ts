// T-106: the page fetch hook only looks at target URLs; every other response reaches the page as is, unread.
import { describe, expect, mock, test } from "bun:test";
import { createFetchHook, urlOf } from "./fetch-hook";
import { fixtureJson } from "../../test/harness/fixtures";

const INTEGRITY = "https://gql.twitch.tv/integrity";
const tick = () => Bun.sleep(5);

const setup = (respond: (input: any, init?: any) => Response | Promise<Response>) => {
  const original = mock(async (input: any, init?: any) => respond(input, init));
  const onIntegrity = mock((_body: string) => {});
  return { original, onIntegrity, hooked: createFetchHook(original as any, { onIntegrity }) };
};

describe("urlOf", () => {
  test("reads strings, URL objects and Request objects", () => {
    expect(urlOf("https://a.example/x")).toBe("https://a.example/x");
    expect(urlOf(new URL("https://a.example/y"))).toBe("https://a.example/y");
    expect(urlOf(new Request("https://a.example/z"))).toBe("https://a.example/z");
  });
});

describe("page fetch hook", () => {
  test("a non-target response is the same object, unread", async () => {
    const response = new Response("page data");
    const { hooked, original } = setup(() => response);
    const init = { method: "POST", body: "{}" };

    const out = await hooked("https://gql.twitch.tv/gql", init);

    expect(out).toBe(response);
    expect(out.bodyUsed).toBe(false);
    expect(original).toHaveBeenCalledWith("https://gql.twitch.tv/gql", init);
  });

  test("204 and 304 responses pass through", async () => {
    for (const status of [204, 304]) {
      const response = new Response(null, { status });
      const { hooked } = setup(() => response);
      expect(await hooked("https://spade.twitch.tv/track")).toBe(response);
    }
  });

  test("a binary body reaches the page intact", async () => {
    const bytes = new Uint8Array([0, 255, 1, 254, 128]);
    const { hooked } = setup(() => new Response(bytes));
    const out = await hooked("https://static-cdn.jtvnw.net/x.png");
    expect(new Uint8Array(await out.arrayBuffer())).toEqual(bytes);
  });

  test.each([
    ["string", INTEGRITY],
    ["URL", new URL(INTEGRITY)],
    ["Request", new Request(INTEGRITY, { method: "POST" })],
  ])("integrity (%s): the token goes to the worker and the page still reads the original response", async (_, input) => {
    const response = new Response('{"token":"INTEGRITY"}', { headers: { "x-test": "1" } });
    const { hooked, onIntegrity } = setup(() => response);

    const out = await hooked(input as any, { method: "POST" });
    await tick();

    expect(out).toBe(response);
    expect(onIntegrity).toHaveBeenCalledWith('{"token":"INTEGRITY"}');
    expect(await out.text()).toBe('{"token":"INTEGRITY"}');
    expect(out.headers.get("x-test")).toBe("1");
  });

  test("a failure in the hook logic does not reach the page", async () => {
    const response = new Response("x");
    const original = async () => response;
    const hooked = createFetchHook(original as any, {
      onIntegrity: () => {
        throw new Error("boom");
      },
    });
    expect(await hooked(INTEGRITY)).toBe(response);
    await tick();
  });

  test("a network error from the original fetch reaches the page unchanged", async () => {
    const error = new TypeError("Failed to fetch");
    const { hooked } = setup(() => Promise.reject(error));
    await expect(hooked(INTEGRITY)).rejects.toBe(error);
  });
});

// T-301: edge.ads.twitch.tv (client-side ads, B-025) answered in the page with an empty 200
describe("page fetch hook, client-side ads", () => {
  const ADS = "https://edge.ads.twitch.tv/ads?bp=midroll&u=x";

  const csai = (block: boolean) => {
    const original = mock(async () => new Response("real ad"));
    const blocked: string[] = [];
    const hooked = createFetchHook(original as any, { onIntegrity: () => {}, blockCsai: () => block, onCsaiBlocked: (url) => blocked.push(url) });
    return { original, blocked, hooked };
  };

  test.each([
    ["string", ADS],
    ["Request", new Request(ADS)],
    ["URL", new URL(ADS)],
  ])("with blockCsai, a %s to edge.ads.twitch.tv never reaches the network and gets an empty 200", async (_, input) => {
    const { original, blocked, hooked } = csai(true);

    const response = await hooked(input as any);

    expect(original).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
    expect(blocked).toEqual([ADS]);
  });

  test("with blockCsai off, it reaches the network", async () => {
    const { original, blocked, hooked } = csai(false);
    expect(await (await hooked(ADS)).text()).toBe("real ad");
    expect(original).toHaveBeenCalledTimes(1);
    expect(blocked).toEqual([]);
  });

  test("other hosts are not blocked", async () => {
    const { original, hooked } = csai(true);
    await hooked("https://ads.example/edge.ads.twitch.tv/x");
    expect(original).toHaveBeenCalledTimes(1);
  });
});

// T-401 (F-05): the headers of the page's GQL requests go to the worker, for its backup token requests
describe("page GQL headers", () => {
  const GQL = "https://gql.twitch.tv/gql";
  const init = fixtureJson<{ method: string; headers: Record<string, string>; body: string }>("gql/page-gql-init.json");
  const CAPTURED = { "Client-Integrity": "INTEGRITY", "X-Device-Id": "DEVICE_ID", Authorization: "OAuth OAUTH", "Client-Version": "CLIENT_VERSION", "Client-Session-Id": "SESSION_ID" };

  const gql = () => {
    const response = new Response("{}");
    const original = mock(async () => response);
    const sent: Record<string, string>[] = [];
    const hooked = createFetchHook(original as any, { onIntegrity() {}, onGqlHeaders: (headers) => sent.push(headers) });
    return { response, original, sent, hooked };
  };

  test("a page GQL request sends its headers once; the page gets the original response, unread", async () => {
    const { response, sent, hooked } = gql();
    const out = await hooked(GQL, init);
    await hooked(GQL, init);
    expect(out).toBe(response);
    expect(out.bodyUsed).toBe(false);
    expect(sent).toEqual([CAPTURED]);
  });

  test("a changed header is sent again, merged with the ones already known", async () => {
    const { sent, hooked } = gql();
    await hooked(GQL, init);
    await hooked(GQL, { method: "POST", headers: { "Client-Integrity": "NEW_INTEGRITY", "Content-Type": "text/plain" } });
    expect(sent).toEqual([CAPTURED, { ...CAPTURED, "Client-Integrity": "NEW_INTEGRITY" }]);
  });

  test.each([
    ["a Headers object", () => [GQL, { method: "POST", headers: new Headers({ "Device-ID": "DEVICE_ID", "Client-Version": "V" }) }]],
    ["header pairs", () => [GQL, { method: "POST", headers: [["device-id", "DEVICE_ID"], ["client-version", "V"]] }]],
    ["a Request", () => [new Request(GQL, { method: "POST", headers: { "Device-ID": "DEVICE_ID", "Client-Version": "V" } })]],
  ])("%s, with Device-ID as the device id's other name", async (_, args) => {
    const { sent, hooked } = gql();
    await (hooked as any)(...args());
    expect(sent).toEqual([{ "X-Device-Id": "DEVICE_ID", "Client-Version": "V" }]);
  });

  test("other URLs and GQL requests without these headers send nothing", async () => {
    const { sent, hooked } = gql();
    await hooked("https://gql.twitch.tv/integrity", init);
    await hooked("https://gql.example/gql", init);
    await hooked(GQL, { method: "POST", headers: { "Content-Type": "text/plain" } });
    expect(sent).toEqual([]);
  });
});

// T-408 (F-12): with forcePopoutToken, the page's PlaybackAccessToken asks for a popout token; picture-by-picture
// requests stay as they are (E10)
describe("page token as popout", () => {
  const GQL = "https://gql.twitch.tv/gql";
  const single = fixtureJson<{ body: string }>("gql/page-gql-init.json").body;
  const batch = JSON.stringify(fixtureJson("gql/page-token-batch.json"));
  const playerTypes = (body: string) => [JSON.parse(body)].flat().map((op: any) => op.variables?.playerType ?? null);

  const hook = (force: boolean) => {
    const original = mock(async (_input: any, _init?: any) => new Response("{}"));
    return { original, hooked: createFetchHook(original as any, { onIntegrity() {}, forcePopoutToken: () => force }) };
  };
  const sentBody = (original: ReturnType<typeof hook>["original"]) => original.mock.calls[0][1].body as string;

  test("a single PlaybackAccessToken body gets playerType popout; everything else in it stays", async () => {
    const { original, hooked } = hook(true);
    await hooked(GQL, { method: "POST", body: single });
    const body = JSON.parse(sentBody(original));
    expect(body.variables.playerType).toBe("popout");
    expect({ ...body, variables: { ...body.variables, playerType: "site" } }).toEqual(JSON.parse(single));
  });

  test("a batched body: only the PlaybackAccessToken operation changes", async () => {
    const { original, hooked } = hook(true);
    await hooked(GQL, { method: "POST", body: batch });
    expect(playerTypes(sentBody(original))).toEqual([null, "popout", null]);
  });

  test("a picture-by-picture token request is left alone, alone or in a batch", async () => {
    const pbyp = single.replace('"playerType":"site"', '"playerType":"picture-by-picture"');
    const { original, hooked } = hook(true);
    await hooked(GQL, { method: "POST", body: pbyp });
    await hooked(GQL, { method: "POST", body: `[${pbyp},${single}]` });
    expect(original.mock.calls[0][1].body).toBe(pbyp);
    expect(playerTypes(original.mock.calls[1][1].body)).toEqual(["picture-by-picture", "popout"]);
  });

  test("with forcePopoutToken off, other URLs, other bodies and Request bodies: the request goes as the page made it", async () => {
    const off = hook(false);
    const init = { method: "POST", body: single };
    await off.hooked(GQL, init);
    expect(off.original.mock.calls[0][1]).toBe(init);

    const on = hook(true);
    const other = { method: "POST", body: single };
    await on.hooked("https://gql.example/gql", other);
    const notToken = { method: "POST", body: '{"operationName":"UseLive","variables":{"playerType":"site"}}' };
    await on.hooked(GQL, notToken);
    const request = new Request(GQL, { method: "POST", body: single });
    await on.hooked(request);
    expect(on.original.mock.calls.map((call) => call[1])).toEqual([other, notToken, undefined]);
    expect(on.original.mock.calls[2][0]).toBe(request);
  });

  test("a body that is not JSON goes as it is", async () => {
    const { original, hooked } = hook(true);
    const init = { method: "POST", body: "PlaybackAccessToken {" };
    await hooked(GQL, init);
    expect(original.mock.calls[0][1]).toBe(init);
  });
});
