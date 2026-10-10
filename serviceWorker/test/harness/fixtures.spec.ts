import { describe, expect, test } from "bun:test";
import { Parser } from "m3u8-parser";
import { FIXTURES_DIR, fixture, fixtureJson, listFixtures } from "./fixtures";
import { sanitizeFile } from "./sanitize";
import { join } from "path";

const parse = (text: string) => {
  const parser = new Parser();
  const warnings: any[] = [];
  (parser as any).on("warn", (warning: any) => warnings.push(warning));
  parser.push(text);
  parser.end();
  return { manifest: parser.manifest, warnings };
};

const readme = fixture("README.md");

describe("m3u8 fixtures", () => {
  const files = listFixtures("m3u8");

  test("the set is complete", () => {
    expect(files).toEqual([
      "backup-ads.m3u8",
      "backup-announced-break.m3u8",
      "backup-clean.m3u8",
      "backup-fmp4-other-map.m3u8",
      "master-avc.m3u8",
      "master-empty.m3u8",
      "master-frontpage-v1.m3u8",
      "master-hevc.m3u8",
      "master-site-v2.m3u8",
      "master-video-weaver.m3u8",
      "media-false-positive.m3u8",
      "media-live-fmp4.m3u8",
      "media-live-ts.m3u8",
      "media-ll-hls.m3u8",
      "media-marked-live.m3u8",
      "media-midroll-numeric.m3u8",
      "media-preroll-ft.m3u8",
      "media-ssai-midroll.m3u8",
      "media-ssai-preroll.m3u8",
    ]);
  });

  test.each(files)("%s loads in m3u8-parser without warnings", (name) => {
    const { manifest, warnings } = parse(fixture(`m3u8/${name}`));
    expect(warnings).toEqual([]);
    if (name.startsWith("master-")) {
      expect(manifest.playlists?.length ?? 0).toBe(name === "master-empty.m3u8" ? 0 : name === "master-hevc.m3u8" ? 4 : 5);
    } else {
      expect(manifest.segments.length).toBeGreaterThan(0);
      expect(manifest.segments.every((s: any) => s.programDateTime > 0)).toBe(true);
    }
  });

  test.each(files)("%s is sanitized and listed in the README", (name) => {
    const text = fixture(`m3u8/${name}`);
    expect(sanitizeFile(name, text)).toBe(text);
    expect(text).not.toContain("\r");
    expect(readme).toContain("`" + name + "`");
  });

  test("midroll and clean backup are aligned by PROGRAM-DATE-TIME", () => {
    const main = parse(fixture("m3u8/media-ssai-midroll.m3u8")).manifest.segments;
    const backup = parse(fixture("m3u8/backup-clean.m3u8")).manifest.segments;
    expect(main.map((s: any) => s.programDateTime)).toEqual(backup.map((s: any) => s.programDateTime));
    expect(main.filter((s: any) => s.title.startsWith("Amazon|")).map((s: any) => s.uri.split("/").pop())).toEqual(["ad-2003.ts", "ad-2004.ts", "ad-2005.ts"]);
    expect(backup.some((s: any) => s.title !== "live")).toBe(false);
  });

  test("the numeric-title midroll, the announced break and the MAF slot are aligned with backup-clean", () => {
    const times = (name: string) => parse(fixture(`m3u8/${name}`)).manifest.segments.map((s: any) => s.programDateTime);
    const clean = times("backup-clean.m3u8");
    expect(times("media-midroll-numeric.m3u8")).toEqual(clean);
    expect(times("backup-announced-break.m3u8")).toEqual(clean);
    expect(times("media-marked-live.m3u8")).toEqual(clean);
  });

  test("fMP4 fixtures carry their own EXT-X-MAP", () => {
    const main = parse(fixture("m3u8/media-live-fmp4.m3u8")).manifest.segments[0].map.uri;
    const backup = parse(fixture("m3u8/backup-fmp4-other-map.m3u8")).manifest.segments[0].map.uri;
    expect(main).toEndWith("init-main.mp4");
    expect(backup).toEndWith("init-backup.mp4");
  });
});

describe("gql fixtures", () => {
  const files = listFixtures("gql");

  test("the set is complete", () => {
    expect(files).toEqual([
      "page-gql-init.json",
      "page-token-batch.json",
      "persisted-not-found.json",
      "token-flat.json",
      "token-integrity-error.json",
      "token-ok.json",
    ]);
  });

  test.each(files)("%s is valid JSON, sanitized and listed in the README", (name) => {
    const text = fixture(`gql/${name}`);
    expect(() => JSON.parse(text)).not.toThrow();
    expect(sanitizeFile(name, text)).toBe(text);
    expect(readme).toContain("`" + name + "`");
  });

  test("token shapes", () => {
    expect(fixtureJson("gql/token-ok.json").data.streamPlaybackAccessToken).toMatchObject({ value: "TOKEN", signature: "SIG" });
    expect(fixtureJson("gql/token-flat.json").streamPlaybackAccessToken).toMatchObject({ value: "TOKEN", signature: "SIG" });
    expect(fixtureJson("gql/persisted-not-found.json").errors[0].message).toBe("PersistedQueryNotFound");
    expect(fixtureJson("gql/token-integrity-error.json").data.streamPlaybackAccessToken).toBeNull();
  });

  test("page request fixtures", () => {
    const init = fixtureJson("gql/page-gql-init.json");
    expect(Object.keys(init.headers)).toEqual(expect.arrayContaining(["Client-ID", "Client-Integrity", "X-Device-Id", "Authorization", "Client-Version", "Client-Session-Id"]));
    expect(JSON.parse(init.body).variables.playerType).toBe("site");

    const batch = fixtureJson<any[]>("gql/page-token-batch.json");
    expect(batch.map((op) => op.operationName)).toEqual(["ChannelShell", "PlaybackAccessToken", "UseLive"]);
  });

  test("FIXTURES_DIR points at the fixtures folder", () => {
    expect(join(FIXTURES_DIR, "README.md")).toEndWith(join("test", "fixtures", "README.md"));
  });
});
