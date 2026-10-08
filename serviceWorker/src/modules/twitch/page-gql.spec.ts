// T-402 (F-06): GQL requests executed by the page, matched by id; the worker sends them itself without an answer in 5 s
import { afterEach, describe, expect, jest, mock, test } from "bun:test";
import { GQL_URL, PageGql } from "./page-gql";

const setup = () => {
  const posted: any[] = [];
  const request = mock(async (_url: any, _init?: any) => Response.json({ direct: true }));
  const gql = new PageGql({ postMessage: (message: any) => posted.push(message), request, logger() {} });
  return { posted, request, gql };
};
const HEADERS = { "Client-ID": "CLIENT_ID", "X-Device-Id": "DEVICE_ID" };

afterEach(() => jest.useRealTimers());

describe("PageGql", () => {
  test("before the page offers the bridge, the request goes to the network from the worker", async () => {
    const { posted, request, gql } = setup();
    const response = await gql.request("{}", HEADERS);
    expect(await response.json()).toEqual({ direct: true });
    expect(request).toHaveBeenCalledWith(GQL_URL, { method: "POST", headers: HEADERS, body: "{}" });
    expect(posted).toEqual([]);
  });

  test("with the bridge, the request goes to the page and the page's answer comes back as the response", async () => {
    const { posted, request, gql } = setup();
    gql.enable();
    const pending = gql.request('{"a":1}', HEADERS);
    expect(posted).toEqual([{ type: "gqlRequest", id: 1, body: '{"a":1}', headers: HEADERS }]);

    gql.answer({ id: 1, status: 200, body: '{"page":true}' });
    const response = await pending;
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ page: true });
    expect(request).not.toHaveBeenCalled();
  });

  test("two requests answered out of order each get their own answer", async () => {
    const { gql } = setup();
    gql.enable();
    const first = gql.request("first", HEADERS);
    const second = gql.request("second", HEADERS);
    gql.answer({ id: 2, status: 200, body: "for second" });
    gql.answer({ id: 1, status: 200, body: "for first" });
    expect(await (await first).text()).toBe("for first");
    expect(await (await second).text()).toBe("for second");
  });

  test("no answer within 5 s: the worker sends the request itself, and a late answer is ignored", async () => {
    jest.useFakeTimers();
    const { request, gql } = setup();
    gql.enable();
    const pending = gql.request("{}", HEADERS);
    jest.advanceTimersByTime(4999);
    expect(request).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(await (await pending).json()).toEqual({ direct: true });
    expect(request).toHaveBeenCalledTimes(1);
    gql.answer({ id: 1, status: 200, body: "late" });
  });

  test("an answer with an error, or without a status: the worker sends the request itself", async () => {
    const { request, gql } = setup();
    gql.enable();
    const failed = gql.request("{}", HEADERS);
    gql.answer({ id: 1, status: 0, error: "TypeError: Failed to fetch" });
    expect(await (await failed).json()).toEqual({ direct: true });
    expect(request).toHaveBeenCalledTimes(1);
  });

  test("answers that match no request are ignored", () => {
    const { gql } = setup();
    gql.enable();
    expect(() => gql.answer({ id: 99, status: 200, body: "" })).not.toThrow();
    expect(() => gql.answer(undefined as any)).not.toThrow();
  });
});
