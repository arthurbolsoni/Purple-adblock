// F-31 (T-607): app/diagnostics.js, the diagnostic log's store, runs here as the classic script it is, on a fresh
// fake-indexeddb per test (the same IndexedDB API the extension's background script, popup and export page use).
import { describe, expect, test } from "bun:test";
import { join } from "path";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";

const SOURCE = await Bun.file(join(import.meta.dir, "..", "..", "src", "app", "diagnostics.js")).text();
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 21, 20, 0, 0);

// the script on its own global object; `indexedDB: null` stands for a browser without IndexedDB
const load = (indexedDB: any = new IDBFactory()) => {
  const scope: any = { indexedDB, IDBKeyRange };
  new Function("globalThis", SOURCE)(scope);
  return { diag: scope.PurpleDiagnostics, indexedDB };
};

const entry = (at: number, extra: Record<string, unknown> = {}) => ({ at, channel: "somechannel", level: "info", type: "breakStart", data: { kind: "stitched" }, ...extra });

// the records of the `channels` store, read straight from IndexedDB
const channelRecords = (indexedDB: any) =>
  new Promise<any[]>((resolve, reject) => {
    const request = indexedDB.open("purple-diagnostics");
    request.onsuccess = () => {
      const db = request.result;
      const all = db.transaction("channels").objectStore("channels").getAll();
      all.onsuccess = () => {
        db.close();
        resolve(all.result);
      };
      all.onerror = () => reject(all.error);
    };
    request.onerror = () => reject(request.error);
  });

describe("PurpleDiagnostics", () => {
  test("exports its constants and API", () => {
    const { diag } = load();
    expect(diag.RETENTION_MS).toBe(7 * DAY);
    expect(diag.CHANNEL_CAP).toBe(4000);
    for (const name of ["add", "prune", "channels", "entries", "summary", "sanitize"]) expect(typeof diag[name]).toBe("function");
  });

  test("stores the valid entries and reads them back oldest first", async () => {
    const { diag, indexedDB } = load();
    const stored = await diag.add(
      [
        entry(NOW - 1000, { type: "breakEnd", data: { result: "blocked", seconds: 90.8, backup: "site", quality: "720p60", blanked: 2, restarts: 1 } }),
        entry(NOW - 5000),
        { ...entry(NOW - 3000), level: "debug" },
        { ...entry(NOW - 2000), channel: "Some Channel" },
      ],
      { now: NOW },
    );
    expect(stored).toBe(2);
    expect(await diag.entries("somechannel", NOW)).toEqual([
      { at: NOW - 5000, channel: "somechannel", level: "info", type: "breakStart", data: { kind: "stitched" } },
      { at: NOW - 1000, channel: "somechannel", level: "info", type: "breakEnd", data: { result: "blocked", seconds: 90.8, backup: "site", quality: "720p60", blanked: 2, restarts: 1 } },
    ]);
    expect(await channelRecords(indexedDB)).toEqual([{ channel: "somechannel", first: NOW - 5000, last: NOW - 1000, count: 2 }]);
  });

  test("entries from an incognito tab are dropped", async () => {
    const { diag } = load();
    expect(await diag.add([entry(NOW)], { incognito: true, now: NOW })).toBe(0);
    expect(await diag.entries("somechannel", NOW)).toEqual([]);
    expect(await diag.channels(NOW)).toEqual([]);
  });

  test("no array, no valid entry or an invalid channel asked: nothing stored, nothing read", async () => {
    const { diag } = load();
    for (const bad of [undefined, null, "x", {}, [null, 1, "x", { at: NOW }]]) expect(await diag.add(bad, { now: NOW })).toBe(0);
    expect(await diag.add([entry(NOW)], { now: NOW })).toBe(1);
    expect(await diag.entries("SomeChannel", NOW)).toEqual([]);
    expect(await diag.entries(undefined, NOW)).toEqual([]);
    expect(await diag.summary("../x", 0, NOW)).toEqual({ breaks: 0, blocked: 0, passed: 0, stalls: 0 });
  });

  test("entries older than 7 days are not read, and prune() deletes them and updates the channel's record", async () => {
    const { diag, indexedDB } = load();
    // stored a day ago, when none of them was 7 days old (the add's own prune ran with that clock)
    await diag.add([entry(NOW - 7.5 * DAY), entry(NOW - 6 * DAY), entry(NOW - 1.5 * DAY)], { now: NOW - DAY });
    expect(await diag.entries("somechannel", NOW - DAY)).toHaveLength(3);
    expect((await diag.entries("somechannel", NOW)).map((e: any) => e.at)).toEqual([NOW - 6 * DAY, NOW - 1.5 * DAY]);
    expect(await diag.channels(NOW)).toEqual([{ channel: "somechannel", first: NOW - 6 * DAY, last: NOW - 1.5 * DAY, count: 2 }]);

    expect(await diag.prune(NOW + 2 * DAY)).toBe(2);
    expect(await channelRecords(indexedDB)).toEqual([{ channel: "somechannel", first: NOW - 1.5 * DAY, last: NOW - 1.5 * DAY, count: 1 }]);

    expect(await diag.prune(NOW + 8 * DAY)).toBe(1);
    expect(await channelRecords(indexedDB)).toEqual([]);
    expect(await diag.channels(NOW + 8 * DAY)).toEqual([]);
  });

  test("add() prunes at most once an hour", async () => {
    const { diag, indexedDB } = load();
    const MINUTE = 60 * 1000;
    // the first add prunes, when the entry is 6 days 23:50 old; 20 minutes later it is past 7 days, but no prune
    // runs before the hour is over
    await diag.add([entry(NOW - 7 * DAY - 10 * MINUTE, { channel: "old" })], { now: NOW - 20 * MINUTE });
    await diag.add([entry(NOW)], { now: NOW });
    expect((await channelRecords(indexedDB)).map((r) => r.channel).sort()).toEqual(["old", "somechannel"]);
    await diag.add([entry(NOW)], { now: NOW + 40 * MINUTE });
    expect((await channelRecords(indexedDB)).map((r) => r.channel)).toEqual(["somechannel"]);
  });

  test("each channel keeps its newest CHANNEL_CAP entries", async () => {
    const { diag, indexedDB } = load();
    const many = (channel: string, from: number, n: number) => Array.from({ length: n }, (_, i) => entry(NOW - DAY + (from + i) * 10, { channel }));
    for (let from = 0; from < 4200; from += 500) await diag.add(many("busy", from, Math.min(500, 4200 - from)), { now: NOW });
    await diag.add(many("quiet", 0, 3), { now: NOW });
    const busy = await diag.entries("busy", NOW);
    expect(busy).toHaveLength(4000);
    expect(busy[0].at).toBe(NOW - DAY + 200 * 10);
    expect(busy.at(-1).at).toBe(NOW - DAY + 4199 * 10);
    expect(await diag.entries("quiet", NOW)).toHaveLength(3);
    expect((await channelRecords(indexedDB)).find((r) => r.channel === "busy")).toEqual({ channel: "busy", first: NOW - DAY + 2000, last: NOW - DAY + 41990, count: 4000 });
  });

  test("one add() takes the last 500 entries it is given", async () => {
    const { diag } = load();
    expect(await diag.add(Array.from({ length: 600 }, (_, i) => entry(NOW - 600 + i)), { now: NOW })).toBe(500);
    expect((await diag.entries("somechannel", NOW))[0].at).toBe(NOW - 500);
  });

  test("channels(): the channels with entries in the last 7 days, the most recent first", async () => {
    const { diag } = load();
    await diag.add([entry(NOW - 3 * DAY, { channel: "alpha" }), entry(NOW - 1000, { channel: "alpha" })], { now: NOW });
    await diag.add([entry(NOW - 500, { channel: "beta" })], { now: NOW });
    await diag.add([entry(NOW - 7.5 * DAY, { channel: "gone" })], { now: NOW });
    await diag.add([entry(NOW - 7.5 * DAY, { channel: "gamma" }), entry(NOW - 2 * DAY, { channel: "gamma" })], { now: NOW });
    expect(await diag.channels(NOW)).toEqual([
      { channel: "beta", first: NOW - 500, last: NOW - 500, count: 1 },
      { channel: "alpha", first: NOW - 3 * DAY, last: NOW - 1000, count: 2 },
      { channel: "gamma", first: NOW - 2 * DAY, last: NOW - 2 * DAY, count: 1 },
    ]);
  });

  test("summary(): breaks, blocked, passed and stalls since a time", async () => {
    const { diag } = load();
    const at = NOW - 60 * 60 * 1000;
    await diag.add(
      [
        entry(NOW - 2 * DAY),
        entry(NOW - 2 * DAY + 1, { type: "breakEnd", data: { result: "passed" } }),
        entry(at),
        entry(at + 1, { type: "breakEnd", data: { result: "blocked", seconds: 30 } }),
        entry(at + 2),
        entry(at + 3, { type: "breakEnd", level: "warn", data: { result: "passed" } }),
        entry(at + 4, { type: "adPassed", level: "warn", data: { via: "ui" } }),
        entry(at + 5, { type: "stall", level: "warn", data: { track: "video", seconds: 2.3 } }),
        entry(at + 6, { type: "stall", level: "warn", data: { track: "audio", seconds: 1 } }),
        entry(at + 7, { type: "breakEnd", data: {} }),
        entry(at + 8, { type: "restart", data: { why: "sequenceBack", count: 1 } }),
        entry(at + 9, { channel: "other" }),
      ],
      { now: NOW },
    );
    expect(await diag.summary("somechannel", at, NOW)).toEqual({ breaks: 2, blocked: 1, passed: 2, stalls: 2 });
    expect(await diag.summary("somechannel", 0, NOW)).toEqual({ breaks: 3, blocked: 1, passed: 3, stalls: 2 });
    expect(await diag.summary("somechannel", undefined, NOW)).toEqual({ breaks: 3, blocked: 1, passed: 3, stalls: 2 });
    expect(await diag.summary("nobody", 0, NOW)).toEqual({ breaks: 0, blocked: 0, passed: 0, stalls: 0 });
  });

  test("the default clock is Date.now()", async () => {
    const { diag } = load();
    const now = Date.now();
    expect(await diag.add([entry(now - 1000), entry(now - 9 * DAY)])).toBe(1);
    expect(await diag.entries("somechannel")).toHaveLength(1);
    expect((await diag.channels())[0].channel).toBe("somechannel");
    expect(await diag.summary("somechannel", now - DAY)).toEqual({ breaks: 1, blocked: 0, passed: 0, stalls: 0 });
    expect(await diag.prune()).toBe(0);
  });

  test("the popup's script sees what the background script stored (the same database)", async () => {
    const indexedDB = new IDBFactory();
    const background = load(indexedDB).diag;
    const popup = load(indexedDB).diag;
    await background.add([entry(NOW - 1000)], { now: NOW });
    expect(await popup.entries("somechannel", NOW)).toHaveLength(1);
  });
});

describe("PurpleDiagnostics without a working IndexedDB", () => {
  const ZERO = { breaks: 0, blocked: 0, passed: 0, stalls: 0 };
  const expectEmpty = async (diag: any) => {
    expect(await diag.add([entry(NOW)], { now: NOW })).toBe(0);
    expect(await diag.prune(NOW)).toBe(0);
    expect(await diag.channels(NOW)).toEqual([]);
    expect(await diag.entries("somechannel", NOW)).toEqual([]);
    expect(await diag.summary("somechannel", 0, NOW)).toEqual(ZERO);
  };

  test("no indexedDB at all", async () => {
    await expectEmpty(load(null).diag);
  });

  test("open() throws", async () => {
    await expectEmpty(
      load({
        open: () => {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      }).diag,
    );
  });

  test("open() fails", async () => {
    const failing = {
      open: () => {
        const request: any = { error: new DOMException("blocked", "UnknownError") };
        setTimeout(() => request.onerror?.());
        return request;
      },
    };
    await expectEmpty(load(failing).diag);
  });

  test("the connection fails when a transaction starts, and the next call opens a new one", async () => {
    const real = new IDBFactory();
    let opens = 0;
    let broken = true;
    const flaky = {
      open: (...args: any[]) => {
        opens++;
        const request: any = real.open(...(args as [string, number]));
        request.addEventListener("success", () => {
          if (!broken) return;
          const db = request.result;
          db.transaction = () => {
            throw new DOMException("The database connection is closing.", "InvalidStateError");
          };
        });
        return request;
      },
    };
    const { diag } = load(flaky);
    expect(await diag.add([entry(NOW)], { now: NOW })).toBe(0);
    broken = false;
    expect(await diag.add([entry(NOW)], { now: NOW })).toBe(1);
    expect(opens).toBe(2);
  });

  test("a transaction that aborts resolves empty", async () => {
    const real = new IDBFactory();
    const aborting = {
      open: (...args: any[]) => {
        const request: any = real.open(...(args as [string, number]));
        request.addEventListener("success", () => {
          const db = request.result;
          const transaction = db.transaction.bind(db);
          // aborted once its first requests are made, before IndexedDB runs them
          db.transaction = (...a: any[]) => {
            const tx = transaction(...a);
            queueMicrotask(() => tx.abort());
            return tx;
          };
        });
        return request;
      },
    };
    const { diag } = load(aborting);
    await expectEmpty(diag);
  });
});

describe("PurpleDiagnostics.sanitize", () => {
  const { diag } = load(null);
  const HOUR = 60 * 60 * 1000;
  const clean = (extra: Record<string, unknown>) => diag.sanitize({ ...entry(NOW), ...extra }, NOW);
  const text = (value: string) => clean({ type: "error", level: "error", data: { name: value } })?.data?.name;

  test("an entry of the contract comes back as it was", () => {
    const decode = { at: NOW - 5, channel: "some_channel_2", level: "warn", type: "decode", data: { codec: "avc1.64001F", width: 1280, height: 720, dropped: 3, corrupted: 0, total: 5400 } };
    expect(diag.sanitize(decode, NOW)).toEqual(decode);
    expect(diag.sanitize({ at: NOW, channel: "a", level: "info", type: "load" }, NOW)).toEqual({ at: NOW, channel: "a", level: "info", type: "load" });
  });

  test("`at` from 8 days back to 1 hour ahead, a finite number", () => {
    expect(clean({ at: NOW - 8 * DAY })).not.toBeNull();
    expect(clean({ at: NOW + HOUR })).not.toBeNull();
    for (const at of [NOW - 8 * DAY - 1, NOW + HOUR + 1, NaN, Infinity, String(NOW), null, undefined]) expect(clean({ at })).toBeNull();
  });

  test("a lower-case Twitch login as channel", () => {
    expect(clean({ channel: "a".repeat(25) })).not.toBeNull();
    for (const channel of ["", "SomeChannel", "a".repeat(26), "some-channel", "some channel", "../x", 12, null]) expect(clean({ channel })).toBeNull();
  });

  test("an unknown level or type drops the entry; anything but an object is no entry", () => {
    for (const extra of [{ level: "debug" }, { level: "INFO" }, { type: "other" }, { type: "toString" }, { type: "__proto__" }]) expect(clean(extra)).toBeNull();
    for (const bad of [null, undefined, 1, "x", [entry(NOW)], () => entry(NOW)]) expect(diag.sanitize(bad, NOW)).toBeNull();
  });

  test("unknown data keys and values that are not a string, a finite number or a boolean are dropped", () => {
    expect(
      clean({
        type: "breakEnd",
        data: { result: "blocked", kind: "stitched", seconds: Infinity, backup: null, quality: ["720p"], replaced: { n: 1 }, blanked: NaN, restarts: true, Result: "x", channel: "x" },
      }),
    ).toEqual({ ...entry(NOW), type: "breakEnd", data: { result: "blocked", restarts: true } });
    // no key left, or no object: no data
    expect(clean({ data: { other: 1 } })).toEqual({ at: NOW, channel: "somechannel", level: "info", type: "breakStart" });
    expect(clean({ data: "kind=stitched" })).toEqual({ at: NOW, channel: "somechannel", level: "info", type: "breakStart" });
    expect(clean({ data: ["stitched"] })).toEqual({ at: NOW, channel: "somechannel", level: "info", type: "breakStart" });
  });

  test("strings lose URLs, hosts, ids, tokens and IP addresses", () => {
    expect(text("fetch https://usher.ttvnw.net/api/channel/hls/somechannel.m3u8?sig=abc&token=%7B%22a%22 failed")).toBe("fetch <url> failed");
    expect(text("segment video-weaver.fra05.hls.ttvnw.net/v1/segment/x.ts stalled")).toBe("segment <url> stalled");
    expect(text("edge d2nvs31859zcd8.cloudfront.net:443")).toBe("edge <url>");
    expect(text("blob:https://www.twitch.tv/7c9e6679-7425-40de-944b-e07fc1f90ae7")).toBe("blob:<url>");
    expect(text("device 7c9e6679-7425-40de-944b-e07fc1f90ae7")).toBe("device <id>");
    // a long word of letters only, such as an error name, is not a token
    expect(text("TransactionInactiveError")).toBe("TransactionInactiveError");
    expect(text("oauth k3n9x0a8b7c6d5e4f3g2h1i0j9k8l7")).toBe("oauth <id>");
    expect(text("auth eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U")).toBe("auth <id>.<id>.<id>");
    expect(text("from 192.168.10.200 and 2001:db8:85a3::8a2e:370:7334 and fe80::1")).toBe("from <ip> and <ip> and <ip>");
    expect(text("line1\nline2 x\u0000")).toBe("line1 line2 x ");
  });

  // F-31 (T-606): the types and keys added after the Firefox review; a key of another type, or none of the contract, goes
  test("the backup attempts, failed requests, A/V offset, quality, token flags and conflicts, with their keys only", () => {
    const entries: [string, Record<string, unknown>][] = [
      ["breakStart", { kind: "csai", roll: "midroll", declared: 60, quality: "720p60" }],
      ["breakEnd", { result: "blocked", seconds: 31.3, backup: "site", quality: "720p60", replaced: 3, blanked: 0, restarts: 1, firstCleanMs: 2500, tried: 3 }],
      ["stall", { track: "video", seconds: 2.3, purple: false, hidden: true }],
      ["backupTry", { backup: "popout", outcome: "status", status: 404, ms: 800 }],
      ["request", { what: "token", status: 0, backup: "site" }],
      ["avsync", { offset: -0.25, moment: "restart" }],
      ["quality", { name: "auto" }],
      ["token", { hideAds: false, showAds: true, serverAds: true, adblock: false }],
      ["conflict", { what: "fetch", when: "before" }],
    ];
    for (const [type, data] of entries) {
      expect(clean({ type, data: { ...data, kind2: "x", turbo: true, userId: 5 } })).toEqual({ ...entry(NOW), type, data });
    }
    expect(clean({ type: "token", data: { subscriber: true, user_id: 1 } })).toEqual({ at: NOW, channel: "somechannel", level: "info", type: "token" });
    expect(clean({ type: "conflict", data: { what: "worker", outcome: "clean" } })).toEqual({ at: NOW, channel: "somechannel", level: "info", type: "conflict", data: { what: "worker" } });
  });

  test("ordinary values are kept", () => {
    for (const value of ["stitched", "720p60", "avc1.64001F", "mp4a.40.2", "17:15:00", "TypeError", "m3u8.ts", "QuotaExceededError", "sequenceBack", "2.7.3"]) expect(text(value)).toBe(value);
  });

  test("strings are cut to 120 characters, a very long one first to its first 1000 without its last word", () => {
    expect(text("x".repeat(19) + " ".repeat(200))).toHaveLength(120);
    expect(text("ab ".repeat(100))).toBe("ab ".repeat(40));
    // a token that the first cut splits does not leave its first characters behind
    const long = "<url> ".repeat(165) + "a".repeat(30);
    expect(long.slice(0, 1000).endsWith("aaaaaaaaaa")).toBe(true);
    expect(text(long)).toBe("<url> ".repeat(20));
  });
});
