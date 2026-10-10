// T-109: logs go through the loggers, which print only with `debug` on. A console.log is allowed only on the line
// that defines a logger.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { Glob } from "bun";

const SRC = join(import.meta.dir, "..", "..", "src");

describe("logging", () => {
  test("no console.log in serviceWorker/src outside a logger definition", () => {
    const offending: string[] = [];
    for (const file of new Glob("**/*.ts").scanSync(SRC)) {
      if (file.endsWith(".spec.ts")) continue;
      readFileSync(join(SRC, file), "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (/console\.(log|info|debug)\(/.test(line) && !/logger\b[^=]*=/.test(line)) offending.push(`${file}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(offending).toEqual([]);
  });
});
