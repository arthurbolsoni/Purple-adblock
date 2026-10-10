// T-402 (F-06): the page runs a worker's GQL request with the page's original fetch and answers id, status and body
import { describe, expect, mock, test } from "bun:test";
import { runGqlRequest } from "./gql-bridge";

describe("runGqlRequest", () => {
  test("sends the body and headers to gql.twitch.tv with the given fetch, and answers id, status and body", async () => {
    const fetch = mock(async (_url: any, _init?: any) => new Response('{"data":{}}', { status: 200 }));
    const answer = await runGqlRequest(fetch as any, { id: 7, body: '{"q":1}', headers: { "Client-ID": "CLIENT_ID" } });
    expect(fetch).toHaveBeenCalledWith("https://gql.twitch.tv/gql#origin=twilight", { method: "POST", headers: { "Client-ID": "CLIENT_ID" }, body: '{"q":1}' });
    expect(answer).toEqual({ id: 7, status: 200, body: '{"data":{}}' });
  });

  test("an error status is answered as it is", async () => {
    const fetch = mock(async () => new Response("server error", { status: 500 }));
    expect(await runGqlRequest(fetch as any, { id: 1, body: "{}", headers: {} })).toEqual({ id: 1, status: 500, body: "server error" });
  });

  test("a failed request answers status 0 with the error", async () => {
    const fetch = mock(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(await runGqlRequest(fetch as any, { id: 3, body: "{}", headers: {} })).toEqual({ id: 3, status: 0, error: "TypeError: Failed to fetch" });
  });
});
