// TS-702: the release workflows. Tests run locally (T-003, CLAUDE.md rule 13); Actions only build and publish releases.
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const DIR = join(import.meta.dir, "..", ".github", "workflows");
const workflows = readdirSync(DIR)
  .filter((name) => /\.ya?ml$/.test(name))
  .map((name) => ({ name, doc: Bun.YAML.parse(readFileSync(join(DIR, name), "utf8")) as any }));
const steps = (doc: any): any[] => Object.values(doc.jobs ?? {}).flatMap((job: any) => job.steps ?? []);

describe("release workflows (T-702)", () => {
  test("release.yml and pre-release.yml are there", () => {
    expect(workflows.map((w) => w.name).sort()).toEqual(["pre-release.yml", "release.yml"]);
  });

  test.each(workflows)("$name: only push to main or a tag, never a pull request", ({ doc }) => {
    expect(Object.keys(doc.on)).toEqual(["push"]);
    const push = doc.on.push;
    const branches = push.branches ?? [];
    expect(branches.every((branch: string) => branch === "main")).toBe(true);
    expect(branches.length > 0 || (push.tags ?? []).length > 0).toBe(true);
  });

  test.each(workflows)("$name: no step runs tests", ({ doc }) => {
    const runs = steps(doc).map((step) => step.run ?? "").join("\n");
    expect(runs).not.toMatch(/\bbun (run )?test\b|\bbun run check\b|\bjest\b|\bcargo test\b|e2e\/run\.py/);
  });

  test.each(workflows)("$name: Bun only, checkout v4, a maintained release action", ({ doc }) => {
    const uses = steps(doc).map((step) => step.uses).filter(Boolean);
    expect(uses).toContain("actions/checkout@v4");
    expect(uses.some((u: string) => u.startsWith("oven-sh/setup-bun@"))).toBe(true);
    expect(uses.some((u: string) => u.startsWith("actions/setup-node"))).toBe(false);
    expect(uses.some((u: string) => u.startsWith("marvinpinto/"))).toBe(false);
    expect(uses.some((u: string) => u.startsWith("softprops/action-gh-release@"))).toBe(true);
    const runs = steps(doc).map((step) => step.run ?? "").join("\n");
    expect(runs).not.toMatch(/\b(npm|npx|yarn|node|ts-node)\b/);
    expect(runs).toContain("bun install --frozen-lockfile");
    expect(runs).toContain("bun run build");
  });

  test.each(workflows)("$name: may write releases and nothing else", ({ doc }) => {
    expect(doc.permissions).toEqual({ contents: "write" });
  });
});
