// F-31 (T-607), T-010: properties of the diagnostic log's sanitizer (PurpleDiagnostics.sanitize, app/diagnostics.js)
// over generated entries and strings: no URL, token-like run, UUID or IP address survives, the result keeps the
// contract, sanitizing twice changes nothing, and the formatter's own copy (common/js/diag-format.js) gives the same.
import { describe, expect, test } from "bun:test";
import { join } from "path";
import { fc } from "../../../serviceWorker/test/harness/property";

const read = (path: string) => Bun.file(join(import.meta.dir, "..", "..", "src", path)).text();
const load = (source: string) => {
  const scope: any = {};
  new Function("globalThis", source)(scope);
  return scope;
};
const { PurpleDiagnostics: diag } = load(await read("app/diagnostics.js"));
const { PurpleDiagFormat: format } = load(await read("common/js/diag-format.js"));

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 21, 20, 0, 0);
const DATA_KEYS: Record<string, string[]> = {
  load: ["player", "worker"],
  breakStart: ["kind", "roll", "declared", "quality"],
  breakEnd: ["result", "seconds", "backup", "quality", "replaced", "blanked", "restarts", "firstCleanMs", "tried"],
  adPassed: ["via", "segments"],
  stall: ["track", "seconds", "purple", "hidden"],
  restart: ["why", "count"],
  decode: ["codec", "width", "height", "dropped", "corrupted", "total"],
  playerError: ["code", "source"],
  error: ["name", "where"],
  backupTry: ["backup", "outcome", "status", "ms"],
  request: ["what", "status", "backup"],
  avsync: ["offset", "moment"],
  quality: ["name"],
  token: ["hideAds", "showAds", "serverAds", "adblock"],
  conflict: ["what", "when"],
};
const TYPES = Object.keys(DATA_KEYS);
const KEYS = [...new Set(Object.values(DATA_KEYS).flat())];

const TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=_-".split("");
const hex = fc.string({ unit: fc.constantFrom(..."0123456789abcdefABCDEF".split("")), minLength: 1, maxLength: 4 });
const octet = fc.integer({ min: 0, max: 255 });
const ipv4 = fc.tuple(octet, octet, octet, octet).map((parts) => parts.join("."));
const ipv6 = fc.oneof(
  fc.array(hex, { minLength: 8, maxLength: 8 }).map((groups) => groups.join(":")),
  fc.tuple(fc.array(hex, { minLength: 1, maxLength: 3 }), fc.array(hex, { minLength: 1, maxLength: 3 })).map(([a, b]) => `${a.join(":")}::${b.join(":")}`),
);
// a token-like run: 20 or more token characters with a digit or one of + / = (a run of letters only is a word, such as
// an error name, and stays)
const token = fc
  .tuple(fc.string({ unit: fc.constantFrom(...TOKEN_CHARS), minLength: 19, maxLength: 79 }), fc.constantFrom(..."0123456789+/=".split("")), fc.nat())
  .map(([run, mark, at]) => run.slice(0, at % (run.length + 1)) + mark + run.slice(at % (run.length + 1)));
const label = fc.string({ unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789-".split("")), minLength: 1, maxLength: 12 });
// video and API hosts without a scheme (the edges, usher, the CDN)
const host = fc
  .tuple(fc.array(label, { minLength: 1, maxLength: 3 }), fc.constantFrom("ttvnw.net", "twitch.tv", "jtvnw.net", "live-video.net", "cloudfront.net", "amazonaws.com"), fc.option(fc.webPath(), { nil: "" }))
  .map(([labels, domain, path]) => `${labels.join(".")}.${domain}${path}`);
const sensitive = fc.oneof(
  fc.webUrl({ withQueryParameters: true, withFragments: true }).map((piece) => ({ kind: "url", piece })),
  host.map((piece) => ({ kind: "host", piece })),
  token.map((piece) => ({ kind: "token", piece })),
  fc.uuid().map((piece) => ({ kind: "uuid", piece })),
  ipv4.map((piece) => ({ kind: "ipv4", piece })),
  ipv6.map((piece) => ({ kind: "ipv6", piece })),
);
const filler = fc.oneof(fc.string({ maxLength: 30 }), fc.string({ unit: "binary", maxLength: 30 }), fc.constantFrom(" ", "", "sig=", "token ", "\n", "/", ":"));
// text with sensitive pieces between arbitrary text
const mixed = fc
  .tuple(filler, fc.array(fc.tuple(sensitive, filler), { minLength: 1, maxLength: 4 }))
  .map(([head, rest]) => ({ text: head + rest.map(([s, f]) => s.piece + f).join(""), pieces: rest.map(([s]) => s) }));

const value = fc.oneof(fc.string(), fc.string({ unit: "binary" }), mixed.map((m) => m.text), fc.double(), fc.integer(), fc.boolean(), fc.constant(null), fc.array(fc.integer(), { maxLength: 2 }), fc.object({ maxDepth: 1 }));
const entryArb = fc.record(
  {
    at: fc.oneof(fc.integer({ min: NOW - 9 * DAY, max: NOW + 2 * 60 * 60 * 1000 }), fc.double(), fc.string()),
    channel: fc.oneof(fc.stringMatching(/^[a-z0-9_]{1,25}$/), fc.string({ maxLength: 30 }), fc.constant("")),
    level: fc.oneof(fc.constantFrom("info", "warn", "error"), fc.string({ maxLength: 6 })),
    type: fc.oneof(fc.constantFrom(...TYPES), fc.string({ maxLength: 12 })),
    data: fc.oneof(fc.dictionary(fc.oneof(fc.constantFrom(...KEYS), fc.string({ maxLength: 30 })), value, { maxKeys: 16 }), value),
  },
  { requiredKeys: ["at", "channel", "level", "type"] },
);
const anyEntry = fc.oneof(entryArb, entryArb, fc.anything());

const sanitizeText = (text: string) => diag.sanitize({ at: NOW, channel: "somechannel", level: "error", type: "error", data: { name: text } }, NOW)?.data?.name ?? "";

describe("PurpleDiagnostics.sanitize (properties)", () => {
  test("no URL, host, token-like run, UUID or IP address survives in a string", () => {
    fc.assert(
      fc.property(mixed, ({ text, pieces }) => {
        const out = sanitizeText(text);
        expect(out.length).toBeLessThanOrEqual(120);
        expect(out).not.toMatch(/[a-z][a-z0-9+.-]*:\/\//i);
        for (const run of out.match(/[A-Za-z0-9+/=_-]{20,}/g) ?? []) expect(run).not.toMatch(/[0-9+/=]/);
        expect(out).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        expect(out).not.toMatch(/\d{1,3}(\.\d{1,3}){3}/);
        expect(out).not.toMatch(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/);
        for (const { kind, piece } of pieces) if (kind !== "ipv4") expect(out).not.toContain(piece);
      }),
    );
  });

  test("a clean entry keeps the contract, and sanitizing it again changes nothing", () => {
    fc.assert(
      fc.property(anyEntry, (entry) => {
        const clean = diag.sanitize(entry, NOW);
        if (clean === null) return;
        expect(Object.keys(clean).filter((k) => k !== "data")).toEqual(["at", "channel", "level", "type"]);
        expect(Number.isFinite(clean.at) && clean.at >= NOW - 8 * DAY && clean.at <= NOW + 60 * 60 * 1000).toBe(true);
        expect(clean.channel).toMatch(/^[a-z0-9_]{1,25}$/);
        expect(["info", "warn", "error"]).toContain(clean.level);
        expect(TYPES).toContain(clean.type);
        if ("data" in clean) {
          const keys = Object.keys(clean.data);
          expect(keys.length).toBeGreaterThan(0);
          expect(keys.length).toBeLessThanOrEqual(12);
          for (const key of keys) {
            expect(DATA_KEYS[clean.type]).toContain(key);
            const v = clean.data[key];
            if (typeof v === "string") expect(v.length).toBeLessThanOrEqual(120);
            else if (typeof v === "number") expect(Number.isFinite(v)).toBe(true);
            else expect(typeof v).toBe("boolean");
          }
        }
        expect(diag.sanitize(clean, NOW)).toEqual(clean);
      }),
    );
  });

  test("the formatted file has one ASCII line per clean entry, after its 8 header lines", () => {
    fc.assert(
      fc.property(fc.array(anyEntry, { maxLength: 8 }), (entries) => {
        const kept = entries.map((entry) => diag.sanitize(entry, NOW)).filter((entry) => entry && entry.channel === "somechannel");
        const text = format.format("somechannel", entries, { now: NOW, timeZone: "UTC", browser: "Firefox 157.0", os: "Linux x86_64" });
        expect(text.endsWith("\n")).toBe(true);
        const lines = text.slice(0, -1).split("\n");
        expect(lines).toHaveLength(8 + kept.length);
        expect(lines.slice(0, 8).every((line) => line.startsWith("# "))).toBe(true);
        expect(lines.slice(8).every((line) => /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}\+00:00 (INFO |WARN |ERROR) \S/.test(line))).toBe(true);
        expect(text.replace("\u00b7", "")).toMatch(/^[\x20-\x7e\n]*$/);
      }),
    );
  });

  test("the formatter's sanitizer gives the same result", () => {
    fc.assert(
      fc.property(anyEntry, (entry) => {
        expect(format.sanitize(entry, NOW)).toEqual(diag.sanitize(entry, NOW));
      }),
    );
  });
});
