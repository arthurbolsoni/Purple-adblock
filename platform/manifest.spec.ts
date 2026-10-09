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

// T-111: Firefox 128 and later run a MAIN world content script in MV2 too; earlier versions ignore `world` and the
// content script adds the bundle itself (docs/findings/2026-10-09-firefox-injection.md)
describe("Firefox manifest", () => {
  const manifest = read("firefox/manifest.json");

  test("MV2: app/bundle.js is a MAIN world content script at document_start, next to the isolated content script", () => {
    expect(manifest.manifest_version).toBe(2);
    expect(manifest.content_scripts).toEqual([
      { matches: TWITCH, run_at: "document_start", js: ["content-script.js"] },
      { matches: TWITCH, run_at: "document_start", world: "MAIN", js: ["app/bundle.js"] },
    ]);
  });
});

// T-302: a static rule blocks edge.ads.twitch.tv for requests the page hooks do not see (iframes, beacons)
describe("Chromium client-side ads rule", () => {
  const manifest = read("chromium/manifest.json");

  test("the manifest declares the ruleset, with host access only (no new permission warning)", () => {
    expect(manifest.permissions).toContain("declarativeNetRequestWithHostAccess");
    expect(manifest.permissions).not.toContain("declarativeNetRequest");
    expect(manifest.declarative_net_request).toEqual({ rule_resources: [{ id: "csai", enabled: true, path: "rules.json" }] });
  });

  test("rules.json blocks ||edge.ads.twitch.tv^", () => {
    const rules = read("chromium/rules.json");
    expect(rules).toEqual([{ id: 1, priority: 1, action: { type: "block" }, condition: { urlFilter: "||edge.ads.twitch.tv^" } }]);
  });
});
