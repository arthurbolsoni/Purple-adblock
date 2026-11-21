// F-31 (T-607): content-script.js relays the page's diagnostic entries ({ type: "purpleDiag", entries }) to the
// background script. It runs on happy-dom with a chrome mock (Chromium manifest) and its timers given by the test, so
// the 30 s flush runs when the test says. happy-dom's postMessage does not give `window` as the event's source, so the
// page's messages are dispatched here with it, as the browser does.
import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { join } from "path";
import { usePageEnv } from "../../serviceWorker/test/harness/page-env";
const SRC = join(import.meta.dir, "..", "src");

const MANIFEST = await Bun.file(join(SRC, "..", "chromium", "manifest.json")).json();
const env = usePageEnv({ chrome: { whitelist: [] }, manifest: MANIFEST });

// the content script's setTimeout/clearTimeout
const timers = new Map<number, { run: () => void; ms: number }>();
let nextTimer = 1;
const fakeSetTimeout = (run: () => void, ms: number) => {
  timers.set(nextTimer, { run, ms });
  return nextTimer++;
};
const fakeClearTimeout = (id: number) => void timers.delete(id);
const runTimers = () => [...timers.entries()].forEach(([id, { run }]) => (timers.delete(id), run()));

beforeAll(async () => {
  const source = await Bun.file(join(SRC, "content-script.js")).text();
  new Function("setTimeout", "clearTimeout", source)(fakeSetTimeout, fakeClearTimeout);
});

beforeEach(() => {
  runTimers();
  env.chrome.sent.length = 0;
});

const post = (data: any, source: any = window) => window.dispatchEvent(new MessageEvent("message", { data, source }));
const diagSent = () => env.chrome.sent.filter((message) => message.type === "diag");
const entry = (n: number, level = "info") => ({ at: 1_700_000_000_000 + n, channel: "somechannel", level, type: "stall", data: { track: "video", seconds: n } });

describe("content script: the diagnostic log relay", () => {
  test("`diagnostics` is among the settings read and sent to the page", () => {
    expect(env.chrome.getCalls[0]).toContain("diagnostics");
  });

  test("entries wait for the 30 s flush, then go in one message", () => {
    post({ type: "purpleDiag", entries: [entry(1)] });
    post({ type: "purpleDiag", entries: [entry(2), entry(3)] });
    expect(diagSent()).toEqual([]);
    expect([...timers.values()].map((timer) => timer.ms)).toEqual([30000]);
    runTimers();
    expect(diagSent()).toEqual([{ type: "diag", entries: [entry(1), entry(2), entry(3)] }]);
    runTimers();
    expect(diagSent()).toHaveLength(1);
  });

  test("an error entry is sent at once, with what was waiting", () => {
    post({ type: "purpleDiag", entries: [entry(1)] });
    post({ type: "purpleDiag", entries: [entry(2, "error")] });
    expect(diagSent()).toEqual([{ type: "diag", entries: [entry(1), entry(2, "error")] }]);
    expect(timers.size).toBe(0);
  });

  test("the page going (pagehide) sends what was waiting", () => {
    window.dispatchEvent(new Event("pagehide"));
    expect(diagSent()).toEqual([]);
    post({ type: "purpleDiag", entries: [entry(1)] });
    window.dispatchEvent(new Event("pagehide"));
    expect(diagSent()).toEqual([{ type: "diag", entries: [entry(1)] }]);
  });

  test("only messages from the page window with an array of at most 200 objects count", () => {
    post({ type: "purpleDiag", entries: [entry(1, "error")] }, null);
    post({ type: "purpleDiag", entries: [entry(1, "error")] }, {});
    post({ type: "purpleDiag", entries: entry(1, "error") });
    post({ type: "purpleDiag", entries: "x" });
    post({ type: "purpleDiag" });
    post({ type: "purpleDiag", entries: Array.from({ length: 201 }, (_, i) => entry(i, "error")) });
    post({ type: "other", entries: [entry(1, "error")] });
    post(null);
    expect(diagSent()).toEqual([]);
    expect(timers.size).toBe(0);

    post({ type: "purpleDiag", entries: [null, 1, "x", [entry(9)], entry(2), ...Array.from({ length: 195 }, (_, i) => entry(10 + i))] });
    runTimers();
    expect(diagSent()[0].entries).toHaveLength(196);
    expect(diagSent()[0].entries[0]).toEqual(entry(2));
  });

  test("entries are copied with their plain fields only, strings cut to 500", () => {
    post({
      type: "purpleDiag",
      entries: [{ ...entry(1), extra: "x", data: { track: "video", long: "a".repeat(600), nested: { a: 1 }, list: [1], none: null, ok: true } }],
    });
    runTimers();
    expect(diagSent()).toEqual([{ type: "diag", entries: [{ ...entry(1), data: { track: "video", long: "a".repeat(500), ok: true } }] }]);
  });

  test("the buffer keeps the newest 500 entries", () => {
    for (let i = 0; i < 3; i++) post({ type: "purpleDiag", entries: Array.from({ length: 200 }, (_, j) => entry(i * 200 + j)) });
    runTimers();
    const [message] = diagSent();
    expect(message.entries).toHaveLength(500);
    expect(message.entries[0]).toEqual(entry(100));
    expect(message.entries.at(-1)).toEqual(entry(599));
  });

  test("an extension that cannot be reached (reloaded under the page) changes nothing in the page", () => {
    const send = env.chrome.runtime.sendMessage;
    env.chrome.runtime.sendMessage = () => {
      throw new Error("Extension context invalidated.");
    };
    expect(() => post({ type: "purpleDiag", entries: [entry(1, "error")] })).not.toThrow();
    env.chrome.runtime.sendMessage = send;
    // that entry is not sent again
    window.dispatchEvent(new Event("pagehide"));
    expect(diagSent()).toEqual([]);
  });

  test("with the stored `diagnostics` false nothing is sent, and what was waiting is dropped", async () => {
    post({ type: "purpleDiag", entries: [entry(1)] });
    env.chrome.storage.local.set({ diagnostics: false });
    await Bun.sleep(1);
    post({ type: "purpleDiag", entries: [entry(2, "error")] });
    runTimers();
    window.dispatchEvent(new Event("pagehide"));
    expect(diagSent()).toEqual([]);

    env.chrome.storage.local.set({ diagnostics: true });
    await Bun.sleep(1);
    post({ type: "purpleDiag", entries: [entry(3, "error")] });
    expect(diagSent()).toEqual([{ type: "diag", entries: [entry(3, "error")] }]);
  });
});
