// F-31 (T-608): the bug-report form takes the Purple log the popup exports. GitHub takes file attachments only in a
// textarea without `render` (a rendered textarea is a code block); the export page fills `channel`, `version` and
// `browser` from its link, so those ids stay.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const form: any = Bun.YAML.parse(readFileSync(join(import.meta.dir, "..", "..", "..", ".github", "ISSUE_TEMPLATE", "bug-report.yml"), "utf8"));
const field = (id: string) => form.body.find((item: any) => item.id === id);

describe("bug-report form and the Purple log (TS-608)", () => {
  test("a textarea for the log that takes attachments", () => {
    const log = field("log");
    expect(log.type).toBe("textarea");
    expect(log.attributes.render).toBeUndefined();
    expect(log.attributes.description).toContain("Report a bug");
    expect(log.attributes.placeholder).toContain(".txt");
    expect(log.validations?.required).not.toBe(true);
  });

  test("the fields the export page fills in", () => {
    expect(field("channel").type).toBe("input");
    expect(field("version").type).toBe("input");
    expect(field("browser").type).toBe("input");
  });
});
