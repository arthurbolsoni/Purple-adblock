// T-101: the merge edits the lines of the main playlist; every line that is not a replaced segment stays as it was.
import { describe, expect, test } from "bun:test";
import { fixture } from "../../../test/harness/fixtures";
import { blankAds, mergeM3u8Contents, mergeWithBackups, readSegments } from "./m3u8";
import { detectAds } from "./ad-detector";

const sampleM3U8_withDates_1 = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:00.000Z
#EXTINF:10,
segment1.ts
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:10.000Z
#EXTINF:10,
segment2.ts
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:20.000Z
#EXTINF:10,stitched
segment-stitched.ts
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:30.000Z
#EXTINF:10,
segment3.ts`;

// PROGRAM-DATE-TIME after #EXTINF: still the tag of the segment whose URI follows
const sampleM3U8_withDates_2 = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10,
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:00.000Z
segmentA.ts
#EXTINF:10,
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:10.000Z
segmentB.ts
#EXTINF:10,
#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:20.000Z
segmentC.ts`;

// Marks the segment whose URI ends with `name` as an ad (2.6.7 marker in the title).
const asAd = (text: string, name: string) => {
  const lines = text.split("\n");
  const uri = lines.findIndex((l) => l.endsWith(name));
  const extinf = lines.slice(0, uri).findLastIndex((l) => l.startsWith("#EXTINF"));
  lines[extinf] = lines[extinf].replace(/,.*$/, ",Amazon|AD_ID");
  return lines.join("\n");
};

// Lines of `a` that differ from `b`, as [index, line of b].
const changed = (a: string, b: string) =>
  b.split("\n").flatMap((line, i) => (line === a.split("\n")[i] ? [] : [[i, line]]));

describe("readSegments", () => {
  test("indexes #EXTINF and URI lines, title and PROGRAM-DATE-TIME of each segment", () => {
    const segments = readSegments(sampleM3U8_withDates_2.split("\n"));
    expect(segments.map((s) => [s.extinf, s.uri, s.title, s.duration])).toEqual([
      [4, 6, "", 10],
      [7, 9, "", 10],
      [10, 12, "", 10],
    ]);
    expect(segments.map((s) => s.time)).toEqual([Date.parse("2023-01-01T00:00:00Z"), Date.parse("2023-01-01T00:00:10Z"), Date.parse("2023-01-01T00:00:20Z")]);
  });

  test("a segment without PROGRAM-DATE-TIME follows the previous one; trailing tags are not segments", () => {
    const text = "#EXTM3U\n#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z\n#EXTINF:2.000,live\na.ts\n#EXTINF:2.000,Amazon|AD_ID\nb.ts\n#EXT-X-PRELOAD-HINT:TYPE=PART,URI=\"c.ts\"";
    const segments = readSegments(text.split("\n"));
    expect(segments.map((s) => [s.title, s.time])).toEqual([
      ["live", Date.parse("2026-10-03T12:00:00Z")],
      ["Amazon|AD_ID", Date.parse("2026-10-03T12:00:02Z")],
    ]);
  });
});

describe("mergeM3u8Contents", () => {
  test("replaces an ad segment with the backup segment of the same second and keeps every other line", () => {
    const merged = mergeM3u8Contents([sampleM3U8_withDates_1, sampleM3U8_withDates_2]);
    expect(merged).toBe(sampleM3U8_withDates_1.replace("#EXTINF:10,stitched\nsegment-stitched.ts", "#EXTINF:10,\nsegmentC.ts"));
  });

  test("empty input gives an empty string", () => {
    expect(mergeM3u8Contents([])).toBe("");
  });

  test("an ad segment without a matching backup segment stays, and the text comes back unchanged", () => {
    expect(mergeM3u8Contents([sampleM3U8_withDates_1])).toBe(sampleM3U8_withDates_1);
    expect(mergeM3u8Contents([fixture("m3u8/media-ssai-preroll.m3u8"), fixture("m3u8/backup-ads.m3u8")])).toBe(fixture("m3u8/media-ssai-preroll.m3u8"));
  });

  test("midroll: the three ad segments get the backup's live segments; tags, DATERANGE, DISCONTINUITY and Twitch tags stay", () => {
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    const merged = mergeM3u8Contents([midroll, fixture("m3u8/backup-clean.m3u8")]);

    expect(changed(midroll, merged)).toEqual([
      [23, "#EXTINF:2.000,live"],
      [24, "https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3003.ts"],
      [26, "#EXTINF:2.000,live"],
      [27, "https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3004.ts"],
      [29, "#EXTINF:2.000,live"],
      [30, "https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3005.ts"],
    ]);
    for (const tag of ["#EXT-X-VERSION:3", "#EXT-X-TWITCH-ELAPSED-SECS", 'CLASS="twitch-stitched-ad"', "#EXT-X-DISCONTINUITY", "#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:10:06.000Z"]) {
      expect(merged).toContain(tag);
    }
  });

  // T-203: ad segments come from the detector, also without the title and URI markers
  test("numeric-title midroll: the three ad segments get the backup's live segments", () => {
    const midroll = fixture("m3u8/media-midroll-numeric.m3u8");
    const segments = readSegments(midroll.split("\n"));
    const merged = mergeM3u8Contents([midroll, fixture("m3u8/backup-clean.m3u8")]);

    expect(changed(midroll, merged)).toEqual(
      [3, 4, 5].flatMap((i) => [
        [segments[i].extinf, "#EXTINF:2.000,live"],
        [segments[i].uri, `https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-300${i}.ts`],
      ]),
    );
  });

  test("a backup segment under the backup's own numeric-title break is not used", () => {
    const midroll = fixture("m3u8/media-midroll-numeric.m3u8");
    const backup = midroll.replaceAll("/v1/segment/", "/v1/segment/backup-");
    expect(mergeM3u8Contents([midroll, backup])).toBe(midroll);
  });

  // T-204: only segment lines come from a backup; its announced break never reaches the merged text
  test("a backup announcing its own break gives its live segments and none of its announcement", () => {
    const merged = mergeM3u8Contents([fixture("m3u8/media-midroll-numeric.m3u8"), fixture("m3u8/backup-announced-break.m3u8")]);
    expect(merged).toContain("/v1/segment/backup-3003.ts");
    for (const line of ["stitched-ad-1791029418", "source-1791029418", "/ad-3009.ts", "/backup-3008.ts"]) expect(merged).not.toContain(line);
  });

  test.each(["media-live-ts.m3u8", "media-live-fmp4.m3u8", "media-ll-hls.m3u8"])(
    "%s with one ad segment: only that segment's #EXTINF and URI lines change; MAP, PREFETCH, PART, PRELOAD-HINT stay",
    (name) => {
      const live = fixture(`m3u8/${name}`);
      const second = readSegments(live.split("\n"))[1];
      const main = asAd(live, live.split("\n")[second.uri].split("/").pop()!);
      const backup = live.replaceAll("/v1/segment/", "/v1/segment/backup-");

      const merged = mergeM3u8Contents([main, backup]);

      expect(changed(main, merged)).toEqual([
        [second.extinf, "#EXTINF:2.000,live"],
        [second.uri, live.split("\n")[second.uri].replace("/v1/segment/", "/v1/segment/backup-")],
      ]);
      for (const tag of ["#EXT-X-MAP", "#EXT-X-TWITCH-PREFETCH", "#EXT-X-PART:", "#EXT-X-PRELOAD-HINT", "#EXT-X-SERVER-CONTROL"]) {
        expect(merged.includes(tag)).toBe(main.includes(tag));
      }
    },
  );

  // T-108: titles come from the #EXTINF lines, whatever the URIs contain
  test.each(["seg?x=1&y=2.ts", "seg+plus.ts", "seg(1).ts", "seg[1].ts"])("a URI like %s keeps its segment's title", (name) => {
    const main = `#EXTM3U\n#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z\n#EXTINF:2.000,Amazon|AD_ID\nhttps://edge.example/${name}\n#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:02.000Z\n#EXTINF:2.000,live\nhttps://edge.example/${name}2`;
    const backup = "#EXTM3U\n#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z\n#EXTINF:2.000,live\nhttps://edge.example/backup.ts";

    expect(readSegments(main.split("\n")).map((s) => s.title)).toEqual(["Amazon|AD_ID", "live"]);
    expect(mergeM3u8Contents([main, backup])).toBe(main.replace(`#EXTINF:2.000,Amazon|AD_ID\nhttps://edge.example/${name}\n`, "#EXTINF:2.000,live\nhttps://edge.example/backup.ts\n"));
  });

  test("#EXTINF is written as <duration>,<title> even when the backup line has no comma", () => {
    const backup = sampleM3U8_withDates_2.replace("#EXTINF:10,\n#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:20.000Z", "#EXTINF:10\n#EXT-X-PROGRAM-DATE-TIME:2023-01-01T00:00:20.000Z");
    expect(mergeM3u8Contents([sampleM3U8_withDates_1, backup])).toContain("#EXTINF:10,\nsegmentC.ts");
  });
});

// T-502 (F-14): ad segments no backup replaced keep their lines; their URIs are answered with a blank segment by the
// worker. Prefetch, preload and part lines that point at ad media go; every other line stays.
describe("blankAds", () => {
  const LIVE = fixture("m3u8/media-live-ts.m3u8");
  const URL = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/chunked.m3u8";
  const SEG = "https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/";
  const ads = (text: string) => detectAds(text).adSegments;

  test("media-ssai-preroll: the text is unchanged and the six ad URIs are listed", () => {
    const preroll = fixture("m3u8/media-ssai-preroll.m3u8");
    const result = blankAds(preroll, ads(preroll), URL);
    expect(result.text).toBe(preroll);
    expect(result.segments).toBe(6);
    expect(result.uris).toEqual([0, 1, 2, 3, 4, 5].map((n) => `${SEG}adsquared/ad-100${n}.ts`));
  });

  test("an ad in the middle: the prefetch lines of the live tail stay", () => {
    const main = asAd(LIVE, "live-1001.ts");
    const result = blankAds(main, ads(main), URL);
    expect(result.text).toBe(main);
    expect(result.uris).toEqual([`${SEG}live-1001.ts`]);
  });

  test("an ad at the end: the prefetch lines after it go, and their URIs are answered blank too", () => {
    const main = asAd(LIVE, "live-1005.ts");
    const result = blankAds(main, ads(main), URL);
    expect(result.text.split("\n")).toEqual(main.split("\n").filter((l) => !l.startsWith("#EXT-X-TWITCH-PREFETCH")));
    expect(result.segments).toBe(1);
    expect(result.uris).toEqual([`${SEG}live-1005.ts`, `${SEG}live-1006.ts`, `${SEG}live-1007.ts`]);
  });

  test("a prefetch line with an ad URI pattern goes, with a live tail", () => {
    const main = asAd(LIVE, "live-1001.ts").replace("/live-1007.ts", "/adsquared/ad-1007.ts");
    const result = blankAds(main, ads(main), URL);
    expect(result.text).not.toContain("ad-1007.ts");
    expect(result.text).toContain("#EXT-X-TWITCH-PREFETCH:https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/live-1006.ts");
  });

  test("a break announced after the last segment: the prefetch lines after the announcement go", () => {
    const announcement = '#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="2026-10-03T12:00:14.000Z",DURATION=20.234';
    const main = asAd(LIVE, "live-1001.ts").replace(`\n#EXT-X-TWITCH-PREFETCH:${SEG}live-1007.ts`, `\n${announcement}\n#EXT-X-TWITCH-PREFETCH:${SEG}live-1007.ts`);
    const result = blankAds(main, ads(main), URL);
    expect(result.text).toContain(`#EXT-X-TWITCH-PREFETCH:${SEG}live-1006.ts`);
    expect(result.text).not.toContain(`#EXT-X-TWITCH-PREFETCH:${SEG}live-1007.ts`);
    expect(result.text).toContain(announcement);
  });

  test("LL-HLS: the parts of an ad segment go; the parts and preload hint of the live segment in progress stay", () => {
    const parts = `#EXT-X-PART:DURATION=1.000,URI="${SEG}part-500-0.ts",INDEPENDENT=YES\n#EXT-X-PART:DURATION=1.000,URI="${SEG}part-500-1.ts"\n`;
    const live = fixture("m3u8/media-ll-hls.m3u8").replace("#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z", parts + "#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z");
    const main = asAd(live, "live-500.ts");
    const result = blankAds(main, ads(main), URL);
    expect(result.text).not.toContain("part-500-");
    for (const kept of ["part-502-0.ts", "part-502-1.ts", "#EXT-X-PRELOAD-HINT", "#EXT-X-SERVER-CONTROL", "#EXT-X-PART-INF"]) expect(result.text).toContain(kept);
    expect(result.uris).toEqual([`${SEG}live-500.ts`, `${SEG}part-500-0.ts`, `${SEG}part-500-1.ts`]);
  });

  test("media-preroll-ft: the EXT-X-MAP that only ad segments use is answered blank too; its line stays", () => {
    const preroll = fixture("m3u8/media-preroll-ft.m3u8");
    const result = blankAds(preroll, ads(preroll), URL);
    expect(result.text).toBe(preroll);
    expect(result.uris).toContain(`${SEG}init-ft.mp4`);
    expect(result.segments).toBe(6);
  });

  test("an EXT-X-MAP that live segments use is not answered blank", () => {
    const main = asAd(fixture("m3u8/media-live-fmp4.m3u8"), "main-1001.mp4");
    expect(blankAds(main, ads(main), URL).uris).not.toContain(`${SEG}init-main.mp4`);
  });

  // a break announced after the last segment (B-034), with no ad segment yet: only its prefetch lines go
  test("backup-announced-break with no ad segment: the two prefetch lines after the announcement go, the live one stays", () => {
    const announced = fixture("m3u8/backup-announced-break.m3u8");
    const result = blankAds(announced, [], URL);
    expect(result.text.split("\n")).toEqual(announced.split("\n").filter((l) => !l.includes("/ad-3009.ts") && !l.includes("/ad-3010.ts")));
    expect(result.text).toContain(`#EXT-X-TWITCH-PREFETCH:${SEG}backup-3008.ts`);
    expect(result.uris).toEqual([`${SEG}ad-3009.ts`, `${SEG}ad-3010.ts`]);
    expect(result.segments).toBe(0);
  });

  test("relative URIs are resolved against the playlist URL", () => {
    const main = "#EXTM3U\n#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z\n#EXTINF:2.000,Amazon|AD_ID\nad-1.ts\n";
    expect(blankAds(main, [0], URL).uris).toEqual(["https://video-weaver.example.hls.ttvnw.net/v1/playlist/ad-1.ts"]);
  });

  test("the merge reports the ad segments it left: none with backup-clean, all three without a backup", () => {
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    expect(mergeWithBackups([midroll, fixture("m3u8/backup-clean.m3u8")]).remaining).toEqual([]);
    expect(mergeWithBackups([midroll]).remaining).toEqual([3, 4, 5]);
  });
});
