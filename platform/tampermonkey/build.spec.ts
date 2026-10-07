// T-004: the userscript build takes an optional output path, so the e2e build (dist/) leaves the
// committed release userscript untouched.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const SCRIPT = join(import.meta.dir, "build.js");
const BUNDLE = "/* worker bundle */";
let cwd: string;

beforeAll(() => {
  cwd = mkdtempSync(join(tmpdir(), "purple-userscript-"));
  mkdirSync(join(cwd, "serviceWorker", "dist"), { recursive: true });
  writeFileSync(join(cwd, "serviceWorker", "dist", "bundle.js"), BUNDLE);
});

afterAll(() => rmSync(cwd, { recursive: true, force: true }));

const build = (...args: string[]) =>
  Bun.spawnSync([process.execPath, SCRIPT, ...args], { cwd, env: { ...process.env, npm_package_version: "9.9.9" } });

describe("userscript build", () => {
  test("writes the header and the bundle to the given path", () => {
    const out = join(cwd, "dist", "purpleadblocker.user.js");
    expect(build(out).exitCode).toBe(0);
    const text = readFileSync(out, "utf8");
    expect(text).toStartWith("// ==UserScript==\n");
    expect(text).toContain("// @match        *://*.twitch.tv/*\n");
    expect(text).toContain("// @run-at       document-start\n");
    expect(text).toContain("// @grant        none\n");
    expect(text).toContain("// @version      9.9.9\n");
    expect(text).toEndWith(BUNDLE);
    expect(existsSync(join(cwd, "platform"))).toBe(false);
  });

  test("defaults to platform/tampermonkey/dist/purpleadblocker.user.js", () => {
    expect(build().exitCode).toBe(0);
    expect(readFileSync(join(cwd, "platform", "tampermonkey", "dist", "purpleadblocker.user.js"), "utf8")).toEndWith(BUNDLE);
  });
});
