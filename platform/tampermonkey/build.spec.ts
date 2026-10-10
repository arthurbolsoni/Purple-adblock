// T-004: the userscript build takes an optional output path, so the e2e build (dist/) leaves the
// committed release userscript untouched.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const SCRIPT = join(import.meta.dir, "build.js");
const VERSION = JSON.parse(readFileSync(join(import.meta.dir, "..", "..", "package.json"), "utf8")).version;
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
    // T-701: from package.json, not from the npm_package_version that only `bun run` sets
    expect(text).toContain(`// @version      ${VERSION}\n`);
    expect(text).toEndWith(BUNDLE);
    expect(existsSync(join(cwd, "platform"))).toBe(false);
    // T-706: the license in the header and Purple's own notice
    expect(text).toContain("// @license      Apache-2.0\n");
    expect(text).toContain("// Copyright 2021-present Arthur Bolsoni. Licensed under the Apache License, Version 2.0:\n");
    // T-704: the third-party notices, after the header and before the bundle: TwitchAdSolutions and the npm packages
    // in the bundle, with the MIT permission notice
    const notice = text.slice(text.indexOf("// ==/UserScript==\n"), text.indexOf(BUNDLE));
    expect(notice).toContain("https://github.com/pixeltris/TwitchAdSolutions");
    expect(notice).toContain("https://github.com/ryanbr/TwitchAdSolutions");
    expect(notice).toContain("//   Copyright (c) 2020-present TwitchAdSolutions Contributors\n");
    expect(notice).toContain("// Includes m3u8-parser (https://github.com/videojs/m3u8-parser), Copyright Brightcove, Inc, under the Apache\n");
    for (const name of ["@videojs/vhs-utils", "global", "@babel/runtime"]) expect(notice).toContain(`// - ${name} (`);
    expect(notice).toContain("// The above copyright notice and this permission notice shall be included in all\n");
  });

  test("defaults to platform/tampermonkey/dist/purpleadblocker.user.js", () => {
    expect(build().exitCode).toBe(0);
    expect(readFileSync(join(cwd, "platform", "tampermonkey", "dist", "purpleadblocker.user.js"), "utf8")).toEndWith(BUNDLE);
  });

  // installed userscripts update from the committed copy on main (@updateURL), so it carries the package version
  test("the committed userscript has the package version", () => {
    const committed = readFileSync(join(import.meta.dir, "dist", "purpleadblocker.user.js"), "utf8");
    expect(committed.match(/^\/\/ @version\s+(\S+)/m)?.[1]).toBe(VERSION);
  });
});
