// T-003: tests run on this machine before every commit, never on GitHub Actions.
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..", "..", "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const pkg = JSON.parse(read("package.json"));

describe("local checks", () => {
  test("package scripts run bun test", () => {
    expect(pkg.scripts.test).toBe("bun test");
    expect(pkg.scripts["test:coverage"]).toBe("bun test --coverage");
    expect(pkg.scripts.check).toStartWith("bun test");
    expect(pkg.scripts["hooks:install"]).toBe("git config core.hooksPath .githooks");
  });

  // T-006: the sim/ server's tests (Rust) run with the rest
  test("check runs bun test, then cargo test for sim/", () => {
    expect(pkg.scripts.check).toBe("bun test && cargo test --quiet --manifest-path sim/Cargo.toml");
  });

  test("the pre-commit hook runs the checks", () => {
    const hook = read(".githooks/pre-commit");
    expect(hook).toStartWith("#!/bin/sh\n");
    expect(hook).toContain("bun run check");
    expect(hook).not.toContain("\r");
    expect(read(".gitattributes")).toContain(".githooks/* text eol=lf");
  });

  test("the bun npm package, while present, is not older than the runtime", () => {
    // `bun run` puts node_modules/.bin first on PATH (docs/findings/2026-10-03-bun-test.md)
    const pinned = pkg.dependencies?.bun ?? pkg.devDependencies?.bun;
    if (!pinned) return;
    const [major, minor] = pinned.replace(/^[\^~]/, "").split(".").map(Number);
    const [runtimeMajor, runtimeMinor] = Bun.version.split(".").map(Number);
    expect(major * 1000 + minor).toBeGreaterThanOrEqual(runtimeMajor * 1000 + runtimeMinor);
  });
});

describe("GitHub Actions", () => {
  const dir = join(ROOT, ".github", "workflows");
  const workflows = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
  const RUNS_TESTS = /\b(?:bun|npm|yarn|pnpm)\s+(?:run\s+)?(?:test|check)\b|\bbun\s+test\b|\bcargo\s+test\b|\bjest\b|e2e\/run\.py/;

  test.each(workflows)("%s runs no tests", (file) => {
    const workflow: any = Bun.YAML.parse(readFileSync(join(dir, file), "utf8"));
    const runs = Object.values(workflow.jobs ?? {}).flatMap((job: any) => (job.steps ?? []).map((step: any) => step.run ?? ""));
    expect(runs.filter((run: string) => RUNS_TESTS.test(run))).toEqual([]);
  });
});
