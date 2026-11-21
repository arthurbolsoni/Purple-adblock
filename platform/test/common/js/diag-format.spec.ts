// F-31 (T-607): common/js/diag-format.js, the .txt of the diagnostic log the viewer saves from the popup, runs here
// as the classic script it is. Time zones are given, so the times are the same on every machine.
import { describe, expect, test } from "bun:test";
import { join } from "path";

const ROOT = join(import.meta.dir, "..", "..", "..", "..");
const SOURCE = await Bun.file(join(ROOT, "platform", "src", "common", "js", "diag-format.js")).text();
const STORE = await Bun.file(join(ROOT, "platform", "src", "app", "diagnostics.js")).text();

// the script on its own global object (with `scope.PurpleDiagnostics` when given)
const load = (scope: any = {}) => {
  new Function("globalThis", SOURCE)(scope);
  return scope.PurpleDiagFormat;
};
const format = load();

const at = (iso: string) => Date.parse(iso);
const NOW = at("2026-11-21T21:00:00Z");
const META = {
  purple: "2.7.3",
  install: "Chrome Web Store",
  browser: "Firefox 157.0",
  os: "Linux x86_64",
  timeZone: "America/Sao_Paulo",
  settingsChanged: format.changedSettings({ pausePlayOnBreaks: true, whitelist: ["a", "b"], toggleProxy: true }),
  now: NOW,
};
const e = (iso: string, level: string, type: string, data?: Record<string, unknown>, channel = "somechannel") => ({ at: at(iso), channel, level, type, ...(data ? { data } : {}) });

describe("PurpleDiagFormat.format", () => {
  test("the whole file (golden)", () => {
    const entries = [
      e("2026-11-21T20:16:30.800Z", "info", "breakEnd", { result: "blocked", seconds: 90.8, backup: "site", quality: "720p60", blanked: 2, restarts: 1 }),
      e("2026-11-21T20:15:00.010Z", "info", "breakStart", { kind: "stitched" }),
      e("2026-11-15T23:01:03.250Z", "info", "load", { player: "1.39.0", worker: true }),
      e("2026-11-21T20:20:03.400Z", "warn", "stall", { track: "video", seconds: 2.3 }),
      e("2026-11-21T20:30:00Z", "error", "playerError", { code: 4000, source: "media" }),
      e("2026-11-21T20:59:40Z", "error", "error", { name: "TypeError", where: "fetch https://usher.ttvnw.net/api/channel/hls/somechannel.m3u8?sig=abc" }),
      // another channel's entry and an entry outside the contract are left out
      e("2026-11-21T20:40:00Z", "info", "breakStart", { kind: "csai" }, "otherchannel"),
      e("2026-11-21T20:41:00Z", "debug", "breakStart"),
    ];
    expect(format.format("somechannel", entries, META)).toBe(
      [
        "# Purple Adblock diagnostic log",
        "# Purple: 2.7.3 (Chrome Web Store)",
        "# Browser: Firefox 157.0 · Linux x86_64",
        "# Twitch player: 1.39.0",
        "# Channel: somechannel",
        "# Range: 2026-11-15T20:01:03-03:00 to 2026-11-21T17:59:40-03:00 (America/Sao_Paulo), 6 lines",
        "# Settings changed from defaults: whitelist=2, pausePlayOnBreaks=true",
        "# This file stays on this computer until you attach it somewhere. It holds no account, token, cookie, IP or video address.",
        "2026-11-15T20:01:03.250-03:00 INFO  load       player=1.39.0 worker=true",
        "2026-11-21T17:15:00.010-03:00 INFO  breakStart kind=stitched",
        "2026-11-21T17:16:30.800-03:00 INFO  breakEnd   result=blocked seconds=90.8 backup=site quality=720p60 blanked=2 restarts=1",
        "2026-11-21T17:20:03.400-03:00 WARN  stall      track=video seconds=2.3",
        "2026-11-21T17:30:00.000-03:00 ERROR playerError code=4000 source=media",
        '2026-11-21T17:59:40.000-03:00 ERROR error      name=TypeError where="fetch <url>"',
        "",
      ].join("\n"),
    );
  });

  // F-31 (T-606): the types added after the Firefox review print like the others, key=value in the page's order
  test("the backup attempts, failed requests, A/V offset, quality, token flags and conflicts (golden)", () => {
    const entries = [
      e("2026-11-21T20:00:00Z", "info", "load", { player: "3c5ad1e0a7d4", worker: "injected" }),
      e("2026-11-21T20:00:00.001Z", "warn", "conflict", { what: "fetch", when: "before" }),
      e("2026-11-21T20:00:00.002Z", "info", "token", { hideAds: false, showAds: true, serverAds: true, adblock: false }),
      e("2026-11-21T20:00:03Z", "info", "quality", { name: "1080p60" }),
      e("2026-11-21T20:15:00Z", "info", "breakStart", { kind: "stitched", roll: "midroll", declared: 90, quality: "1080p60" }),
      e("2026-11-21T20:15:00.400Z", "warn", "backupTry", { backup: "site", outcome: "noMaster", ms: 400 }),
      e("2026-11-21T20:15:00.900Z", "error", "request", { what: "token", status: 0, backup: "popout" }),
      e("2026-11-21T20:15:01.300Z", "info", "backupTry", { backup: "site", outcome: "clean", ms: 1300 }),
      e("2026-11-21T20:15:02Z", "warn", "avsync", { offset: 0.8, moment: "breakStart" }),
      e("2026-11-21T20:16:30.800Z", "info", "breakEnd", { result: "blocked", seconds: 90.8, backup: "site", quality: "1080p60", replaced: 3, blanked: 0, restarts: 1, tried: 2, firstCleanMs: 1300 }),
      e("2026-11-21T20:20:03.400Z", "warn", "stall", { track: "audio", seconds: 1.5, purple: true, hidden: false }),
    ];
    const lines = format.format("somechannel", entries, { ...META, timeZone: "UTC" }).trimEnd().split("\n").slice(3);
    expect(lines).toEqual([
      "# Twitch player: 3c5ad1e0a7d4",
      "# Channel: somechannel",
      "# Range: 2026-11-21T20:00:00+00:00 to 2026-11-21T20:20:03+00:00 (UTC), 11 lines",
      "# Settings changed from defaults: whitelist=2, pausePlayOnBreaks=true",
      "# This file stays on this computer until you attach it somewhere. It holds no account, token, cookie, IP or video address.",
      "2026-11-21T20:00:00.000+00:00 INFO  load       player=3c5ad1e0a7d4 worker=injected",
      "2026-11-21T20:00:00.001+00:00 WARN  conflict   what=fetch when=before",
      "2026-11-21T20:00:00.002+00:00 INFO  token      hideAds=false showAds=true serverAds=true adblock=false",
      "2026-11-21T20:00:03.000+00:00 INFO  quality    name=1080p60",
      "2026-11-21T20:15:00.000+00:00 INFO  breakStart kind=stitched roll=midroll declared=90 quality=1080p60",
      "2026-11-21T20:15:00.400+00:00 WARN  backupTry  backup=site outcome=noMaster ms=400",
      "2026-11-21T20:15:00.900+00:00 ERROR request    what=token status=0 backup=popout",
      "2026-11-21T20:15:01.300+00:00 INFO  backupTry  backup=site outcome=clean ms=1300",
      "2026-11-21T20:15:02.000+00:00 WARN  avsync     offset=0.8 moment=breakStart",
      "2026-11-21T20:16:30.800+00:00 INFO  breakEnd   result=blocked seconds=90.8 backup=site quality=1080p60 replaced=3 blanked=0 restarts=1 tried=2 firstCleanMs=1300",
      "2026-11-21T20:20:03.400+00:00 WARN  stall      track=audio seconds=1.5 purple=true hidden=false",
    ]);
  });

  test("no entries: the header only, player unknown, no settings changed", () => {
    expect(format.format("somechannel", [], { ...META, settingsChanged: [], timeZone: "UTC" })).toBe(
      [
        "# Purple Adblock diagnostic log",
        "# Purple: 2.7.3 (Chrome Web Store)",
        "# Browser: Firefox 157.0 · Linux x86_64",
        "# Twitch player: unknown",
        "# Channel: somechannel",
        "# Range: no entries (UTC), 0 lines",
        "# Settings changed from defaults: none",
        "# This file stays on this computer until you attach it somewhere. It holds no account, token, cookie, IP or video address.",
        "",
      ].join("\n"),
    );
  });

  test("the player of the last load entry; one line", () => {
    const text = format.format("somechannel", [e("2026-11-21T20:00:00Z", "info", "load", { player: "1.38.0" }), e("2026-11-21T20:00:01Z", "info", "load", { worker: true })], META);
    expect(text).toContain("\n# Twitch player: 1.38.0\n");
    expect(text).toContain(", 2 lines\n");
    expect(format.format("somechannel", [e("2026-11-21T20:00:00Z", "info", "load", { player: "1.39.0" })], META)).toContain(", 1 line\n");
  });

  test("times in the time zone, with its offset", () => {
    const line = (iso: string, timeZone: string) => format.format("somechannel", [e(iso, "info", "breakStart")], { ...META, timeZone, now: at(iso) }).trimEnd().split("\n").at(-1);
    expect(line("2026-11-21T20:15:00.010Z", "UTC")).toBe("2026-11-21T20:15:00.010+00:00 INFO  breakStart");
    expect(line("2026-11-21T20:15:00Z", "Asia/Kathmandu")).toBe("2026-11-22T02:00:00.000+05:45 INFO  breakStart");
    expect(line("2026-07-01T12:00:00Z", "Europe/Berlin")).toBe("2026-07-01T14:00:00.000+02:00 INFO  breakStart");
    expect(line("2026-12-01T12:00:00Z", "Europe/Berlin")).toBe("2026-12-01T13:00:00.000+01:00 INFO  breakStart");
    expect(line("2026-12-01T12:00:00.999Z", "America/St_Johns")).toBe("2026-12-01T08:30:00.999-03:30 INFO  breakStart");
    // the first second of a day: hour 00, not 24
    expect(line("2026-11-21T03:00:00Z", "America/Sao_Paulo")).toBe("2026-11-21T00:00:00.000-03:00 INFO  breakStart");
  });

  test("an unknown time zone falls back to the browser's", () => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const entries = [e("2026-11-21T20:15:00Z", "info", "breakStart")];
    expect(format.format("somechannel", entries, { ...META, timeZone: "Mars/Olympus_Mons" })).toBe(format.format("somechannel", entries, { ...META, timeZone: local }));
    expect(format.format("somechannel", entries, { ...META, timeZone: undefined })).toBe(format.format("somechannel", entries, { ...META, timeZone: local }));
  });

  test("values with spaces, quotes, backslashes or equals signs are quoted; text is plain ASCII on one line", () => {
    const text = format.format(
      "somechannel",
      [
        e("2026-11-21T20:00:00Z", "error", "error", { name: 'say "hi"', where: "a\\b" }),
        e("2026-11-21T20:00:01Z", "error", "error", { name: "", where: "k=v" }),
        e("2026-11-21T20:00:02Z", "error", "error", { name: "café ‮", where: "x\n2026-11-21T17:00:00.000-03:00 INFO  breakStart kind=forged" }),
      ],
      META,
    );
    const lines = text.trimEnd().split("\n");
    expect(lines).toHaveLength(8 + 3);
    expect(lines.slice(8).map((line) => line.slice(30))).toEqual([
      'ERROR error      name="say \\"hi\\"" where="a\\\\b"',
      'ERROR error      name="" where="k=v"',
      'ERROR error      name="caf? ?" where="x 2026-11-21T17:00:00.000-03:00 INFO  breakStart kind=forged"',
    ]);
    expect(text.replace("·", "")).toMatch(/^[\x20-\x7e\n]*$/);
  });

  test("header values from the popup are made plain, missing ones are unknown", () => {
    const text = format.format("somechannel", [], { browser: "Firefox\n# Channel: forged", now: NOW, timeZone: "UTC" });
    expect(text).toContain("\n# Purple: unknown (unknown)\n# Browser: Firefox # Channel: forged · unknown\n");
    expect(text.split("\n").filter((line) => line.startsWith("# Channel:"))).toEqual(["# Channel: somechannel"]);
    expect(format.format("Not A Channel", [e("2026-11-21T20:00:00Z", "info", "breakStart")], META)).toContain("\n# Channel: unknown\n# Range: no entries");
  });

  test("the settings given are printed with their values scrubbed", () => {
    const text = format.format("somechannel", [], { ...META, settingsChanged: ["restartOnSequenceBack=false", "proxyUrl=https://user:pw@proxy.example.org/", "token abc123defghijklmnopqrstuvwxyz", ""] });
    expect(text).toContain("\n# Settings changed from defaults: restartOnSequenceBack=false, proxyUrl=<url>, token <id>\n");
  });

  test("without meta: the current time and the browser's time zone", () => {
    const now = Date.now();
    const text = format.format("somechannel", [{ at: now - 1000, channel: "somechannel", level: "info", type: "breakStart" }]);
    expect(text).toContain(`(${Intl.DateTimeFormat().resolvedOptions().timeZone}), 1 line\n`);
    expect(format.format("somechannel", null, null)).toContain("0 lines");
  });

  test("entries outside 8 days back to 1 hour ahead of meta.now are left out", () => {
    const text = format.format("somechannel", [e("2026-11-13T20:59:59Z", "info", "breakStart"), e("2026-11-21T22:00:01Z", "info", "breakStart"), e("2026-11-21T22:00:00Z", "info", "breakStart")], META);
    expect(text).toContain(", 1 line\n");
  });

  test("with app/diagnostics.js loaded, its sanitize() is the one used", () => {
    const calls: any[] = [];
    const formatWithStore = load({ PurpleDiagnostics: { sanitize: (entry: any, now: number) => (calls.push([entry.type, now]), null) } });
    expect(formatWithStore.format("somechannel", [e("2026-11-21T20:00:00Z", "info", "breakStart")], META)).toContain("0 lines");
    expect(calls).toEqual([["breakStart", NOW]]);

    const scope: any = {};
    new Function("globalThis", STORE)(scope);
    expect(load(scope).format("somechannel", [e("2026-11-21T20:00:00Z", "info", "breakStart")], META)).toBe(format.format("somechannel", [e("2026-11-21T20:00:00Z", "info", "breakStart")], META));
  });
});

describe("PurpleDiagFormat.fileName", () => {
  test("purple-log-<channel>-<date in the time zone>.txt", () => {
    expect(format.fileName("somechannel", NOW, "America/Sao_Paulo")).toBe("purple-log-somechannel-2026-11-21.txt");
    expect(format.fileName("somechannel", at("2026-11-22T01:00:00Z"), "America/Sao_Paulo")).toBe("purple-log-somechannel-2026-11-21.txt");
    expect(format.fileName("somechannel", at("2026-11-22T01:00:00Z"), "UTC")).toBe("purple-log-somechannel-2026-11-22.txt");
    expect(format.fileName("../etc/passwd", NOW, "UTC")).toBe("purple-log-unknown-2026-11-21.txt");
  });
});

describe("PurpleDiagFormat.changedSettings", () => {
  test("nothing stored, or the defaults stored: none", () => {
    expect(format.changedSettings({})).toEqual([]);
    expect(format.changedSettings({ ...format.DEFAULTS })).toEqual([]);
    expect(format.changedSettings(null)).toEqual([]);
    expect(format.changedSettings(["debug"])).toEqual([]);
  });

  test("the settings that differ, in the table's order; the whitelist as its size, the proxy URL as set", () => {
    expect(
      format.changedSettings({
        widenBufferRemovals: false,
        whitelist: ["somechannel", "otherchannel", "third"],
        proxyUrl: "https://user:secret@proxy.example.org:8080",
        pausePlayDelayMs: 500,
        backupPlayerTypes: ["embed", "site"],
        diagnostics: false,
        restartOnSequenceBack: false,
        adBadge: false,
        unrelated: "x",
        toggleProxy: true,
      }),
    ).toEqual(["whitelist=3", "proxyUrl=set", "backupPlayerTypes=embed,site", "pausePlayDelayMs=500", "restartOnSequenceBack=false", "widenBufferRemovals=false", "adBadge=false", "diagnostics=false"]);
  });

  test("an empty whitelist or proxy URL is the default; their contents are never printed", () => {
    expect(format.changedSettings({ whitelist: [], proxyUrl: "" })).toEqual([]);
    expect(format.changedSettings({ whitelist: "somechannel", proxyUrl: 5 })).toEqual([]);
    expect(format.changedSettings({ whitelist: ["somechannel"], proxyUrl: "x" }).join(" ")).not.toContain("somechannel");
  });

  test("odd stored values are printed scrubbed", () => {
    expect(format.changedSettings({ debug: "yes", blockCsai: null, backupPlayerTypes: "https://example.com/x" })).toEqual(["debug=yes", "blockCsai=null", "backupPlayerTypes=<url>"]);
  });
});

// the defaults here are docs/feat.md's "Settings (`Setting`)" table, row for row
describe("PurpleDiagFormat.DEFAULTS", () => {
  test("match docs/feat.md", async () => {
    const feat = await Bun.file(join(ROOT, "docs", "feat.md")).text();
    const table = feat.split("## Settings (`Setting`)")[1].split("\n\n")[1];
    const rows = table
      .split("\n")
      .slice(2)
      .map((row) => row.split("|").map((cell) => cell.trim()))
      .map(([, field, , value]) => [field.replace(/`/g, ""), value] as const);
    // F-09's order: the first sentence of its section, its names in backticks
    const order = feat.split("### F-09: default `backupPlayerTypes` order")[1].trim().split(". ")[0];
    const f09 = [...order.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    expect(f09).toEqual(["site", "popout", "frontpage", "mobile_web", "embed", "picture-by-picture"]);

    expect(rows.length).toBeGreaterThan(20);
    for (const [field, value] of rows) {
      const expected = value === "see F-09" ? f09 : JSON.parse(value.replace(/`/g, ""));
      expect([field, format.DEFAULTS[field]]).toEqual([field, expected]);
    }
    expect(Object.keys(format.DEFAULTS).sort()).toEqual(rows.map(([field]) => field).sort());
  });
});
