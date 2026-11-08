// T-010: the real PageGql (worker) and runGqlRequest (page) against the Quint model (test/model/gql-bridge.qnt). Each
// trace in test/model/traces/gql-bridge.json (`bun run model:traces gql-bridge`) is replayed step by step: the page
// offers the bridge, the worker asks, the page's fetch answers or throws in the model's order, and time passes (fake
// timers, for the 5 s timeout); after each step the id each request was posted under, what each request got (the
// page's answer, or the worker's own request) and how many times the worker sent it itself must be what the model says.
import { afterEach, describe, expect, jest, test } from "bun:test";
import { PageGql } from "../../src/modules/twitch/page-gql";
import { runGqlRequest } from "../../src/page/gql-bridge";
import traces from "../model/traces/gql-bridge.json";

// one state of a trace, as quint.ts writes it
type Request = [state: string, id: number, source: string, answerId: number, directs: number];
type State = [action: string, request: number, id: number, outcome: string, gap: number, requests: Request[]];

const flush = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve();
};

afterEach(() => {
  jest.useRealTimers();
});

describe("PageGql and runGqlRequest against the Quint model (T-010)", () => {
  for (const trace of traces as { name: string; states: State[] }[]) {
    test(trace.name, async () => {
      jest.useFakeTimers();
      const posted: any[] = []; // the worker's gqlRequest messages to the page
      const directs = new Map<string, number>(); // body -> the worker's own requests with it
      const gql = new PageGql({
        logger: () => {},
        postMessage: (message: any) => posted.push(message),
        // the worker's own request
        request: (async (_url: string, init: any) => {
          directs.set(init.body, (directs.get(init.body) ?? 0) + 1);
          return new Response(`direct:${init.body}`);
        }) as any,
      });
      const got = new Map<number, string>(); // request -> the body it got
      const sentAs = new Map<number, number>(); // request -> the id it was posted under (0: sent directly)

      for (const [index, [action, request, id, outcome, gap, requests]] of trace.states.entries()) {
        if (action === "enable") gql.enable();
        else if (action === "request") {
          const before = posted.length;
          gql.request(`body-${request}`, {}).then(async (response) => got.set(request, await response.text()));
          sentAs.set(request, posted.length > before ? posted.at(-1).id : 0);
        } else if (action === "answer") {
          // the page runs the worker's request with its own fetch, which answers or throws (status 0)
          const message = posted.find((m) => m.id === id);
          const fetch = (async () => {
            if (outcome === "fail") throw new TypeError("Failed to fetch");
            return new Response(`page:${message.body}`);
          }) as any;
          gql.answer(await runGqlRequest(fetch, message));
        } else if (action === "advance") jest.advanceTimersByTime(gap);
        await flush();

        // what each request got, as the model says: the page's answer to its own request, or its own request
        const expected = requests.map(([state, , source], i) => (state === "done" ? `${source === "page" ? "page:" : "direct:"}body-${i + 1}` : undefined));
        const ids = requests.map(([state, sent]) => (state === "unsent" ? undefined : sent));
        const own = requests.map((request) => request[4]);
        expect({
          index,
          action,
          got: [1, 2, 3].map((r) => got.get(r)),
          ids: [1, 2, 3].map((r) => sentAs.get(r)),
          directs: [1, 2, 3].map((r) => directs.get(`body-${r}`) ?? 0),
        }).toEqual({ index, action, got: expected, ids, directs: own });
      }
    });
  }
});
