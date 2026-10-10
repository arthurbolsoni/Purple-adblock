// TS-701: one Bun build. The builders write into a temp folder from a stub worker bundle; the full `bun run build`
// (vite, both zips, the userscript) is checked by hand when the scripts change (docs/task.md, T-701). The userscript
// header is covered in platform/tampermonkey/build.spec.ts.
import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { buildChrome } from "./chrome_builder.js";
import { buildFirefox } from "./firefox_builder.js";
import { NOTICES, unpackedName, zipName } from "./files.js";
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

  // T-705: the ESLint config named plugins that were never installed, so `lint` failed, and Prettier ran nowhere (36
  // files did not follow it): both left; the style follows the surrounding code
  test("no ESLint or Prettier", () => {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect([deps.eslint, deps.prettier, deps["lint-staged"], pkg.prettier, pkg.scripts.lint, pkg.scripts.format]).toEqual([undefined, undefined, undefined, undefined, undefined, undefined]);
    expect([".eslintrc.js", ".prettierrc"].filter((name) => existsSync(join(ROOT, name)))).toEqual([]);
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
    // T-704: entry names are stored as plain text in the zip
    for (const notice of NOTICES) expect(zip.includes(Buffer.from(notice))).toBe(true);
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
    for (const notice of NOTICES) expect(readFileSync(join(folder, notice), "utf8")).toBe(readFileSync(join(ROOT, notice), "utf8"));
  });

  test("Apache License 2.0: the LICENSE text, NOTICE and package.json, as AMO names it (T-706)", () => {
    expect(readFileSync(join(ROOT, "LICENSE"), "utf8")).toMatch(/Apache License\s+Version 2\.0, January 2004/);
    expect(readFileSync(join(ROOT, "NOTICE"), "utf8").split("\n").slice(0, 2)).toEqual(["Purple Adblock", "Copyright 2021-present Arthur Bolsoni"]);
    expect(pkg.license).toBe("Apache-2.0");
  });

  test("THIRD-PARTY-NOTICES.md credits both TwitchAdSolutions repositories and carries their MIT notice (T-704)", () => {
    const notices = readFileSync(join(ROOT, "THIRD-PARTY-NOTICES.md"), "utf8");
    expect(notices).toContain("https://github.com/pixeltris/TwitchAdSolutions");
    expect(notices).toContain("https://github.com/ryanbr/TwitchAdSolutions");
    expect(notices).toContain("Copyright (c) 2020-present TwitchAdSolutions Contributors");
    expect(notices).toContain("The above copyright notice and this permission notice shall be included in all");
  });

  // the copied parts are the same bytes in ryanbr's file (MIT) and in Brave's copy: the files carry the MIT notice
  // with the source URLs, no MPL notice, and THIRD-PARTY-NOTICES.md names them
  test.each(["serviceWorker/src/modules/player/blank-segment.ts", "serviceWorker/src/page/player-reload.ts"])(
    "%s: TwitchAdSolutions' MIT notice and sources, no MPL notice (T-704)",
    (file) => {
      const text = readFileSync(join(ROOT, file), "utf8");
      expect(text).toContain("// Copyright (c) 2020-present TwitchAdSolutions Contributors\n");
      expect(text).toContain("https://github.com/ryanbr/TwitchAdSolutions/blob/74f1248f22a61fcbb559882f93cb60ca25b414e8/vaft/vaft-ublock-origin.js");
      expect(text).toContain("https://github.com/pixeltris/TwitchAdSolutions");
      expect(text).not.toContain("Mozilla Public License");
      expect(readFileSync(join(ROOT, "THIRD-PARTY-NOTICES.md"), "utf8")).toContain(`\`${file}\``);
    },
  );

  // the bundle carries m3u8-parser and the modules its ES build imports (Vite follows `module`): each package reached
  // that way has its row and its license file's text in THIRD-PARTY-NOTICES.md, so a new import fails here until added
  test("THIRD-PARTY-NOTICES.md lists every package bundled with m3u8-parser, with its license text (T-704)", () => {
    const notices = readFileSync(join(ROOT, "THIRD-PARTY-NOTICES.md"), "utf8").replace(/\r\n/g, "\n");
    const packageDir = (file: string) => {
      const parts = file.split(/[\\/]/);
      const at = parts.lastIndexOf("node_modules");
      return parts.slice(0, at + (parts[at + 1].startsWith("@") ? 3 : 2)).join("/");
    };
    const bundled = new Map<string, string>();
    const files = new Set<string>();
    const visit = (file: string) => {
      if (files.has(file)) return;
      files.add(file);
      const dir = packageDir(file);
      bundled.set(JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name, dir);
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\bfrom\s*['"]([^'"]+)['"]|\bimport\s*['"]([^'"]+)['"]/g)) {
        visit(Bun.resolveSync(match[1] ?? match[2], dirname(file)));
      }
    };
    const entry = join(ROOT, "node_modules", "m3u8-parser");
    visit(join(entry, JSON.parse(readFileSync(join(entry, "package.json"), "utf8")).module));
    expect([...bundled.keys()].sort()).toEqual(["@babel/runtime", "@videojs/vhs-utils", "global", "m3u8-parser"]);
    for (const [name, dir] of bundled) {
      const version = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version;
      expect(notices).toContain(`| ${version} |`);
      expect(notices).toContain(`### ${name}\n`);
      expect(notices).toContain(readFileSync(join(dir, "LICENSE"), "utf8").replace(/\r\n/g, "\n").trim());
    }
  });
});
