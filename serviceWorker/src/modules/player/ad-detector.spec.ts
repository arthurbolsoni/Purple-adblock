// T-201: one detector for the F-02 markers; class NONE / MARKED_LIVE / SSAI and the indexes of the ad segments.
import { describe, expect, test } from "bun:test";
import { fixture } from "../../../test/harness/fixtures";
import { AdClass, detectAds } from "./ad-detector";

const LIVE = fixture("m3u8/media-live-ts.m3u8");
const withTag = (tag: string) => LIVE.replace("#EXT-X-PROGRAM-DATE-TIME", `${tag}\n#EXT-X-PROGRAM-DATE-TIME`);
const withSecondSegment = (from: RegExp, to: string) => {
  const lines = LIVE.split("\n");
  const uri = lines.findIndex((l) => l.endsWith("live-1001.ts"));
  lines[uri - 1] = lines[uri - 1].replace(from, to);
  lines[uri] = lines[uri].replace(from, to);
  return lines.join("\n");
};

describe("detectAds", () => {
  test("a live playlist is NONE", () => {
    expect(detectAds(LIVE)).toEqual({ class: AdClass.NONE, adSegments: [] });
  });

  test.each([
    // a break announced after the last segment (B-034); a range over the segments makes them ads (T-203)
    ["twitch-stitched-ad class", '#EXT-X-DATERANGE:ID="stitched-ad-1-6",CLASS="twitch-stitched-ad",START-DATE="2026-10-03T12:00:12.000Z",DURATION=6.000'],
    ["stitched-ad id", '#EXT-X-DATERANGE:ID="stitched-ad-1-6",CLASS="other",START-DATE="2026-10-03T12:00:00.000Z"'],
    ["twitch-maf-ad class", '#EXT-X-DATERANGE:ID="maf-1",CLASS="twitch-maf-ad",START-DATE="2026-10-03T12:00:00.000Z"'],
    ["EXT-X-CUE-OUT", "#EXT-X-CUE-OUT:30"],
    ["ad session id", '#EXT-X-DATERANGE:ID="x",CLASS="twitch-trigger",START-DATE="2026-10-03T12:00:00.000Z",X-TV-TWITCH-AD-AD-SESSION-ID="AD_SESSION_ID"'],
    ["RADS token", '#EXT-X-DATERANGE:ID="x",CLASS="twitch-trigger",START-DATE="2026-10-03T12:00:00.000Z",X-TV-TWITCH-AD-RADS-TOKEN="RADS_TOKEN"'],
  ])("playlist marker (%s) without ad segments is MARKED_LIVE", (_, tag) => {
    expect(detectAds(withTag(tag))).toEqual({ class: AdClass.MARKED_LIVE, adSegments: [] });
  });

  // B-021: twitch-trigger with only X-TV-TWITCH-TRIGGER-URL is in every playlist, with or without ads
  test.each([
    ["twitch-trigger with a trigger URL", '#EXT-X-DATERANGE:ID="trigger-1",CLASS="twitch-trigger",START-DATE="2026-10-03T12:00:00.000Z",END-ON-NEXT=YES,X-TV-TWITCH-TRIGGER-URL="URL"'],
    ["twitch-ad-quartile alone", '#EXT-X-DATERANGE:ID="q",CLASS="twitch-ad-quartile",START-DATE="2026-10-03T12:00:00.000Z",DURATION=0.000,X-TV-TWITCH-AD-QUARTILE="0"'],
    ["twitch-assignment", '#EXT-X-DATERANGE:ID="a",CLASS="twitch-assignment",START-DATE="2026-10-03T12:00:00.000Z"'],
  ])("not an ad marker: %s", (_, tag) => {
    expect(detectAds(withTag(tag)).class).toBe(AdClass.NONE);
  });

  test("stitched outside a segment title is NONE (media-false-positive)", () => {
    expect(detectAds(fixture("m3u8/media-false-positive.m3u8")).class).toBe(AdClass.NONE);
  });

  test.each([
    ["Amazon in the title", /,live$/, ",Amazon|AD_ID"],
    ["stitched in the title", /,live$/, ",stitched-ad"],
    ["DCM, in the title", /,live$/, ",DCM,123"],
    ["/adsquared/ in the URI", /\/live-1001\.ts$/, "/adsquared/live-1001.ts"],
    ["/_404/ in the URI", /\/live-1001\.ts$/, "/_404/live-1001.ts"],
    ["/processing in the URI", /\/live-1001\.ts$/, "/processing-1001.ts"],
  ])("segment marker (%s) is SSAI with that segment's index", (_, from, to) => {
    expect(detectAds(withSecondSegment(from, to))).toEqual({ class: AdClass.SSAI, adSegments: [1] });
  });

  test("media-ssai-midroll: SSAI, segments 3 to 5", () => {
    expect(detectAds(fixture("m3u8/media-ssai-midroll.m3u8"))).toEqual({ class: AdClass.SSAI, adSegments: [3, 4, 5] });
  });

  test("media-ssai-preroll: every segment is an ad", () => {
    expect(detectAds(fixture("m3u8/media-ssai-preroll.m3u8"))).toEqual({ class: AdClass.SSAI, adSegments: [0, 1, 2, 3, 4, 5] });
  });

  test("media-marked-live: MARKED_LIVE", () => {
    expect(detectAds(fixture("m3u8/media-marked-live.m3u8"))).toEqual({ class: AdClass.MARKED_LIVE, adSegments: [] });
  });
});

// T-203: in a playlist with a stitched-ad marker, a segment is also an ad by its title (not "live"), by a
// twitch-stitched-ad START-DATE + DURATION covering more than half of it, or by a twitch-stream-source value other
// than "live" (B-035; docs/findings/2026-10-08-ad-segment-coverage.md)
describe("detectAds: stitched breaks without the title and URI markers (T-203)", () => {
  const AHEAD = '#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="2026-10-03T12:00:30.000Z",DURATION=20.234';
  const source = (time: string, value: string) =>
    `#EXT-X-DATERANGE:ID="source-${time}",CLASS="twitch-stream-source",START-DATE="2026-10-03T12:00:${time}.000Z",END-ON-NEXT=YES,X-TV-TWITCH-STREAM-SOURCE="${value}"`;
  const withTags = (text: string, ...tags: string[]) => text.replace("#EXT-X-PROGRAM-DATE-TIME", `${tags.join("\n")}\n#EXT-X-PROGRAM-DATE-TIME`);

  test("media-midroll-numeric: SSAI, segments 3 to 5 (10-digit titles, plain URIs)", () => {
    expect(detectAds(fixture("m3u8/media-midroll-numeric.m3u8"))).toEqual({ class: AdClass.SSAI, adSegments: [3, 4, 5] });
  });

  test("media-preroll-ft: every segment is an ad (FT| titles)", () => {
    expect(detectAds(fixture("m3u8/media-preroll-ft.m3u8"))).toEqual({ class: AdClass.SSAI, adSegments: [0, 1, 2, 3, 4, 5] });
  });

  test.each([
    ["a title other than live", withTags(withSecondSegment(/,live$/, ",1234567890"), AHEAD)],
    ["a twitch-stitched-ad range", withTag('#EXT-X-DATERANGE:ID="stitched-ad-2",CLASS="twitch-stitched-ad",START-DATE="2026-10-03T12:00:02.000Z",DURATION=2.000')],
    ["a twitch-stream-source other than live", withTags(LIVE, AHEAD, source("02", "1234567890"), source("04", "live"))],
  ])("%s alone makes the segment an ad", (_, text) => {
    expect(detectAds(text)).toEqual({ class: AdClass.SSAI, adSegments: [1] });
  });

  test("a range covers a segment only for more than half of it: DURATION=2.234 from 12:00:02 takes segment 1, not 2", () => {
    const text = withTag('#EXT-X-DATERANGE:ID="stitched-ad-2",CLASS="twitch-stitched-ad",START-DATE="2026-10-03T12:00:02.000Z",DURATION=2.234');
    expect(detectAds(text).adSegments).toEqual([1]);
  });

  test("without a stitched-ad marker, a title other than live is not an ad", () => {
    expect(detectAds(withSecondSegment(/,live$/, ",1234567890"))).toEqual({ class: AdClass.NONE, adSegments: [] });
  });

  test("twitch-maf-ad is not a stitched-ad marker: titles and sources under it stay as they are", () => {
    const maf = '#EXT-X-DATERANGE:ID="maf-ad-1",CLASS="twitch-maf-ad",START-DATE="2026-10-03T12:00:00.000Z",PLANNED-DURATION=60.000,END-ON-NEXT=YES';
    expect(detectAds(withTags(withSecondSegment(/,live$/, ",1234567890"), maf, source("02", "1234567890")))).toEqual({ class: AdClass.MARKED_LIVE, adSegments: [] });
  });

  test("an empty title is not an ad", () => {
    expect(detectAds(withTags(withSecondSegment(/,live$/, ","), AHEAD)).class).toBe(AdClass.MARKED_LIVE);
  });

  test("backup-announced-break: MARKED_LIVE, the break starts after the last segment", () => {
    expect(detectAds(fixture("m3u8/backup-announced-break.m3u8"))).toEqual({ class: AdClass.MARKED_LIVE, adSegments: [] });
  });
});
