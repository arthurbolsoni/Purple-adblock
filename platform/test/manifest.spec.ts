// T-111: Chromium runs the page bundle as a MAIN world content script at document_start, so Purple's hook is in
// place before Twitch creates the player workers (docs/findings/2026-10-04-worker-injection-race.md).
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const read = (path: string) => JSON.parse(readFileSync(join(import.meta.dir, "..", path), "utf8"));
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
  // T-703: the add-on published on addons.mozilla.org, so a signed submission updates it; Purple collects no data
  // (AMO's data collection declaration, required for signing)
  test("the AMO add-on ID and no data collection", () => {
    expect(manifest.browser_specific_settings).toEqual({
      gecko: { id: "{a7399979-5203-4489-9861-b168187b52e1}", data_collection_permissions: { required: ["none"] } },
    });
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

// F-30 (T-605): the background script that draws the badge: the MV3 service worker on Chromium, an MV2 event page on
// Firefox; no permission is added for it
describe("background script (F-30)", () => {
  test("Chromium runs app/background.js as the service worker", () => {
    const manifest = read("chromium/manifest.json");
    expect(manifest.background).toEqual({ service_worker: "app/background.js" });
    expect(manifest.permissions).toEqual(["activeTab", "storage", "declarativeNetRequestWithHostAccess"]);
  });

  // F-31 (T-607): with the diagnostic log's store, app/diagnostics.js, loaded first
  test("Firefox runs it as an event page", () => {
    const manifest = read("firefox/manifest.json");
    expect(manifest.background).toEqual({ scripts: ["app/diagnostics.js", "app/background.js"], persistent: false });
    expect(manifest.permissions).toEqual(["https://*.twitch.tv/*", "activeTab", "storage"]);
  });

  // F-31 (T-607): the service worker imports the store next to itself; importScripts resolves the path against the
  // worker's own URL
  test("Chromium's service worker imports app/diagnostics.js", async () => {
    const source = await Bun.file(join(import.meta.dir, "..", "src", "app", "background.js")).text();
    const [, path] = /importScripts\("([^"]+)"\)/.exec(source) ?? [];
    expect(new URL(path, "chrome-extension://purple/app/background.js").href).toBe("chrome-extension://purple/app/diagnostics.js");
    expect(await Bun.file(join(import.meta.dir, "..", "src", "app", "diagnostics.js")).exists()).toBe(true);
  });

  test("the file is among the platform sources", async () => {
    expect(await Bun.file(join(import.meta.dir, "..", "src", "app", "background.js")).exists()).toBe(true);
  });
});

// TS-610: the popup's and the export page's text comes from _locales, which a browser reads only with default_locale
describe("locales (TS-610)", () => {
  test.each(["chromium", "firefox"])("%s: default_locale en, with its messages file", async (platform) => {
    const manifest = read(`${platform}/manifest.json`);
    expect(manifest.default_locale).toBe("en");
    expect(await Bun.file(join(import.meta.dir, "..", "src", "_locales", "en", "messages.json")).exists()).toBe(true);
    // the names stay literal: the stores list them as they are
    expect(manifest.name).toBe("Purple Ads Blocker");
  });
});
