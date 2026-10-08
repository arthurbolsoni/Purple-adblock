// T-106: the page fetch hook only looks at target URLs; every other response reaches the page as is, unread.
import { describe, expect, mock, test } from "bun:test";
import { createFetchHook, urlOf } from "./fetch-hook";

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
