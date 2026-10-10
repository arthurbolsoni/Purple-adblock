// T-003: tests run on this machine before every commit, never on GitHub Actions.
import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "fs";
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
    // checked out with LF on Windows too (the `lf` macro of .gitattributes since T-705), so /bin/sh can run it
    const attrs = Bun.spawnSync(["git", "check-attr", "text", "eol", "--", ".githooks/pre-commit"], { cwd: ROOT }).stdout.toString();
    expect(attrs).toBe(".githooks/pre-commit: text: set\n.githooks/pre-commit: eol: lf\n");
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

// no workflow since 2026-10-10 (T-702): releases are made locally; one added later still runs no tests
describe("GitHub Actions", () => {
  const dir = join(ROOT, ".github", "workflows");
  const RUNS_TESTS = /\b(?:bun|npm|yarn|pnpm)\s+(?:run\s+)?(?:test|check)\b|\bbun\s+test\b|\bcargo\s+test\b|\bjest\b|e2e\/run\.py/;

  test("no workflow runs tests", () => {
    const workflows = existsSync(dir) ? readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)) : [];
    const runs = workflows.flatMap((file) => {
      const workflow: any = Bun.YAML.parse(readFileSync(join(dir, file), "utf8"));
      return Object.values(workflow.jobs ?? {}).flatMap((job: any) => (job.steps ?? []).map((step: any) => step.run ?? ""));
    });
    expect(runs.filter((run: string) => RUNS_TESTS.test(run))).toEqual([]);
  });
});

// T-705: the issue templates are GitHub issue forms; a form GitHub cannot read falls back to a blank issue
describe("issue forms", () => {
  const dir = join(ROOT, ".github", "ISSUE_TEMPLATE");
  const files = readdirSync(dir);
  const TYPES = ["markdown", "textarea", "input", "dropdown", "checkboxes"];

  test("only forms, a bug report and an idea", () => {
    expect(files.sort()).toEqual(["bug-report.yml", "feature-request.yml"]);
  });

  test.each(files)("%s: name, description, labels and a body of known fields with unique ids", (file) => {
    const form: any = Bun.YAML.parse(readFileSync(join(dir, file), "utf8"));
    expect(typeof form.name).toBe("string");
    expect(typeof form.description).toBe("string");
    expect(Array.isArray(form.labels)).toBe(true);
    expect(form.body.length).toBeGreaterThan(0);
    for (const field of form.body) {
      expect(TYPES).toContain(field.type);
      expect(typeof field.attributes.label).toBe("string");
    }
    const ids = form.body.map((field: any) => field.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(form.body.some((field: any) => field.validations?.required)).toBe(true);
  });
});
