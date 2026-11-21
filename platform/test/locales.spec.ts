// The popup's and the export page's text (TS-610): _locales/en and _locales/pt_BR carry the same messages with the same
// placeholders, and every key the markup and the scripts ask for exists.
import { describe, expect, test } from "bun:test";
import { join } from "path";
const SRC = join(import.meta.dir, "..", "src");

const EN = await Bun.file(join(SRC, "_locales", "en", "messages.json")).json();
const PT = await Bun.file(join(SRC, "_locales", "pt_BR", "messages.json")).json();
const MARKUP = await Promise.all(["popup.html", "export.html"].map((name) => Bun.file(join(SRC, "common", "html", name)).text()));
const SCRIPTS = await Promise.all(["popup.js", "export.js"].map((name) => Bun.file(join(SRC, "common", "js", name)).text()));

const placeholders = (entry: any) => Object.keys(entry.placeholders ?? {}).sort();
const used = (message: string) => [...message.matchAll(/\$([A-Z_]+)\$/g)].map((match) => match[1].toLowerCase()).sort();

describe("locales (TS-610)", () => {
  test("pt_BR has exactly the English keys", () => {
    expect(Object.keys(PT).sort()).toEqual(Object.keys(EN).sort());
  });

  test.each(Object.keys(EN))("%s: a message in both, with the same placeholders, each one used", (key) => {
    for (const messages of [EN, PT]) {
      expect(typeof messages[key].message).toBe("string");
      expect(messages[key].message.trim().length).toBeGreaterThan(0);
      expect(placeholders(messages[key])).toEqual(placeholders(EN[key]));
      expect([...new Set(used(messages[key].message))]).toEqual(placeholders(EN[key]));
    }
  });

  test("every key in the markup exists", () => {
    const keys = MARKUP.flatMap((html) => [...html.matchAll(/data-i18n(?:-aria|-title)?="([^"]+)"/g)].map((match) => match[1]));
    expect(keys.length).toBeGreaterThan(20);
    expect(keys.filter((key) => !EN[key])).toEqual([]);
  });

  test("every key the scripts ask for exists", () => {
    const keys = SCRIPTS.flatMap((source) => [...source.matchAll(/i18n\.t\("([^"]+)"/g)].map((match) => match[1]));
    expect(keys.length).toBeGreaterThan(5);
    expect(keys.filter((key) => !EN[key])).toEqual([]);
  });

  test("no message is left unused", () => {
    const all = [...MARKUP, ...SCRIPTS].join("\n");
    expect(Object.keys(EN).filter((key) => !all.includes(`"${key}"`))).toEqual([]);
  });
});
