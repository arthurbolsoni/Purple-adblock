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

// TS-703: signed releases. The stores get a version once (the first push of it to main), each store only when its
// secrets are set; secrets reach only the steps that use them, through env, never inside a command
describe("store publishing (T-703)", () => {
  const doc = (name: string) => workflows.find((w) => w.name === name)!.doc;
  const named = (name: string, step: string) => steps(doc(name)).find((s) => s.name === step);
  const index = (name: string, predicate: (s: any) => boolean) => steps(doc(name)).findIndex(predicate);

  test("release.yml: Firefox listed and the Chrome Web Store, after the GitHub release, for a new version with secrets", () => {
    const firefox = named("release.yml", "Firefox, addons.mozilla.org (listed)");
    const chrome = named("release.yml", "Chrome Web Store");
    expect(firefox.run).toBe("bun cli/publish.ts firefox --channel listed");
    expect(firefox.if).toBe("steps.version.outputs.new == 'true' && steps.stores.outputs.amo == 'true'");
    expect(chrome.run).toBe("bun cli/publish.ts chrome");
    expect(chrome.if).toBe("steps.version.outputs.new == 'true' && steps.stores.outputs.cws == 'true'");
    const release = index("release.yml", (s) => String(s.uses).startsWith("softprops/"));
    expect(index("release.yml", (s) => s === firefox)).toBeGreaterThan(release);
    expect(index("release.yml", (s) => s === chrome)).toBeGreaterThan(release);
    // the version check runs before the GitHub release creates the tag
    expect(index("release.yml", (s) => s.id === "version")).toBeLessThan(release);
  });

  test("pre-release.yml: Firefox unlisted for the pushed tag, its .xpi attached", () => {
    const firefox = named("pre-release.yml", "Firefox, signed (unlisted)");
    expect(firefox.run).toBe('bun cli/publish.ts firefox --channel unlisted --tag "$TAG"');
    expect(firefox.env.TAG).toBe("${{ github.ref_name }}");
    expect(firefox.if).toBe("steps.stores.outputs.amo == 'true'");
    const release = steps(doc("pre-release.yml")).find((s) => String(s.uses).startsWith("softprops/"));
    expect(release.with.files).toContain("dist/*.xpi");
    expect(index("pre-release.yml", (s) => s === firefox)).toBeLessThan(index("pre-release.yml", (s) => s === release));
  });

  test.each(workflows)("$name: secrets only in the env of a step, no expression inside a command", ({ doc }) => {
    expect(doc.env).toBeUndefined();
    for (const job of Object.values(doc.jobs) as any[]) expect(job.env).toBeUndefined();
    for (const step of steps(doc)) {
      expect(step.run ?? "").not.toContain("${{");
      for (const value of Object.values(step.with ?? {})) expect(String(value)).not.toContain("secrets.");
    }
  });
});
