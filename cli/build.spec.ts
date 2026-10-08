// TS-701: one Bun build. The builders write into a temp folder from a stub worker bundle; the full `bun run build`
// (vite, both zips, the userscript) is checked by hand when the scripts change (docs/task.md, T-701). The userscript
// header is covered in platform/tampermonkey/build.spec.ts.
import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { buildChrome } from "./chrome_builder.js";
import { buildFirefox } from "./firefox_builder.js";
import { unpackedName, zipName } from "./files.js";
import { silenceConsole } from "../serviceWorker/test/harness/console";

silenceConsole();

const ROOT = join(import.meta.dir, "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const tmp = mkdtempSync(join(tmpdir(), "purple-build-"));
const bundle = join(tmp, "bundle.js");
writeFileSync(bundle, "/* worker bundle stub */");

afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("package.json scripts (T-701)", () => {
  test("no ts-node, jest, bun package or preinstall hook", () => {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps["ts-node"]).toBeUndefined();
    expect(deps["jest"]).toBeUndefined();
    expect(deps["bun"]).toBeUndefined();
    expect(pkg.scripts.preinstall).toBeUndefined();
    expect(existsSync(join(ROOT, "cli", "preinstall.js"))).toBe(false);
    expect(JSON.stringify(pkg.scripts)).not.toContain("ts-node");
  });

  test("build runs the worker build, both extensions and the userscript, on Bun", () => {
    expect(pkg.scripts.build).toBe("bun serviceWorker/build.ts && bun cli/build.ts && bun platform/tampermonkey/build.js");
  });

  test("dev builds the worker with sourcemaps, then the unpacked extensions", () => {
    expect(pkg.scripts.dev).toBe("bun serviceWorker/build.ts dev && bun cli/build.ts dev");
    expect(readFileSync(join(ROOT, "serviceWorker", "build.ts"), "utf8")).toContain('buildServiceWorker(process.argv[2] === "dev")');
  });

  test("lint has paths", () => {
    expect(pkg.scripts.lint).toMatch(/^eslint --ext \.js,\.ts serviceWorker\/src platform\/src cli /);
  });
});

describe("extension builds (T-701)", () => {
  test("zip names carry the version once, not the package name twice", () => {
    expect(zipName("chromium", "2.6.7")).toBe("purple-adblock-2.6.7-chromium.zip");
    expect(unpackedName("firefox")).toBe("purple-adblock-firefox");
  });

  test.each([
    ["chromium", buildChrome],
    ["firefox", buildFirefox],
  ])("%s: the zip is written with the package version in its name", async (platform, build: any) => {
    await build(false, { out: tmp, bundle });
    const zip = readFileSync(join(tmp, `purple-adblock-${pkg.version}-${platform}.zip`));
    expect(zip.subarray(0, 2).toString()).toBe("PK");
  });

  test.each([
    ["chromium", buildChrome],
    ["firefox", buildFirefox],
  ])("%s: the unpacked build has the manifest with the package version and the bundle", async (platform, build: any) => {
    await build(true, { out: tmp, bundle });
    const folder = join(tmp, `purple-adblock-${platform}`);
    expect(JSON.parse(readFileSync(join(folder, "manifest.json"), "utf8")).version).toBe(pkg.version);
    expect(readFileSync(join(folder, "app", "bundle.js"), "utf8")).toBe("/* worker bundle stub */");
    expect(existsSync(join(folder, "content-script.spec.ts"))).toBe(false);
  });
});
