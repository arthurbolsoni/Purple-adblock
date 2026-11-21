// Tests next to the platform scripts (platform/src/*.spec.ts) stay out of the extension builds.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { isPackaged } from "../files.js";

describe("extension files", () => {
  test.each([
    "content-script.js",
    "common/js/popup.js",
    "common/html/popup.html",
    "common/css/popup.css",
    "common/js/i18n.js",
    "common/js/env.js",
    "common/html/export.html",
    "common/js/export.js",
    "common/css/export.css",
    "_locales/en/messages.json",
    "_locales/pt_BR/messages.json",
    "images/logov2-128.png",
  ])("%s is packaged", (path) => {
    expect(isPackaged(path)).toBe(true);
  });

  test.each(["content-script.spec.ts", "src/content-script.chromium.spec.ts"])("%s is not packaged", (path) => {
    expect(isPackaged(path)).toBe(false);
  });

  test.each(["chrome_builder.js", "firefox_builder.js"])("%s filters platform/src for the unpacked build and the zip", (file) => {
    const source = readFileSync(join(import.meta.dir, "..", file), "utf8");
    expect(source).toContain('fs_Extra.copySync("./platform/src/", dirname + "/" + name, { filter: isPackaged });');
    expect(source).toContain('zipFile.directory("./platform/src", false, (entry) => (isPackaged(entry.name) ? entry : false));');
  });
});
