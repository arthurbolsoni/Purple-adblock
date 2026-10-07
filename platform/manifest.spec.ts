// T-111: Chromium runs the page bundle as a MAIN world content script at document_start, so Purple's hook is in
// place before Twitch creates the player workers (docs/findings/2026-10-04-worker-injection-race.md).
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const read = (path: string) => JSON.parse(readFileSync(join(import.meta.dir, path), "utf8"));
const TWITCH = ["https://*.twitch.tv/*"];

describe("Chromium manifest", () => {
  const manifest = read("chromium/manifest.json");

  test("app/bundle.js is a MAIN world content script at document_start on twitch.tv", () => {
    expect(manifest.content_scripts).toContainEqual({ matches: TWITCH, run_at: "document_start", world: "MAIN", js: ["app/bundle.js"] });
  });

  test("the isolated content script still runs at document_start", () => {
    const isolated = manifest.content_scripts.filter((s: any) => (s.world ?? "ISOLATED") === "ISOLATED");
    expect(isolated).toEqual([{ matches: TWITCH, run_at: "document_start", js: ["content-script.js"] }]);
  });

  test("app/bundle.js is not exposed to web pages", () => {
    expect(JSON.stringify(manifest.web_accessible_resources ?? [])).not.toContain("app/bundle.js");
  });
});

describe("Firefox manifest", () => {
  const manifest = read("firefox/manifest.json");

  test("MV2: the content script adds the bundle, at document_start", () => {
    expect(manifest.manifest_version).toBe(2);
    expect(manifest.content_scripts).toEqual([{ matches: TWITCH, run_at: "document_start", js: ["content-script.js"] }]);
  });
});
