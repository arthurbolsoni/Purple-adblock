import { describe, expect, test } from "bun:test";
import { sequenceReference, sequenceShift, shiftSequence } from "./sequence";

const T0 = Date.parse("2026-10-09T02:46:00.910Z");

// segments from `first`, segment n at `base` + n x 2 s; `ads`: indexes with an ad title
const playlist = (first: number, count: number, base: number, ads: number[] = [], eol = "\n") => {
  const lines = ["#EXTM3U", `#EXT-X-MEDIA-SEQUENCE:${first}`, `#EXT-X-TWITCH-LIVE-SEQUENCE:${first}`];
  for (let i = 0; i < count; i++) {
    const n = first + i;
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(base + n * 2000).toISOString()}`, `#EXTINF:2.000,${ads.includes(i) ? "Amazon|AD_ID" : "live"}`, `https://example.net/${n}.ts`);
  }
  lines.push(`#EXT-X-TWITCH-PREFETCH:https://example.net/${first + count}.ts`);
  return lines.join(eol);
};

describe("sequenceReference", () => {
  test("the newest live segment with its number, date-time and duration", () => {
    expect(sequenceReference(playlist(100, 14, T0))).toEqual({ sequence: 113, time: T0 + 113 * 2000, duration: 2 });
  });

  test("ad segments are skipped; with beforeAds, the newest before the first ad", () => {
    const text = playlist(100, 16, T0, [10, 11]);
    expect(sequenceReference(text)?.sequence).toBe(115);
    expect(sequenceReference(text, true)?.sequence).toBe(109);
  });

  test("null without MEDIA-SEQUENCE or without a date-time", () => {
    expect(sequenceReference(playlist(100, 3, T0).replace(/#EXT-X-MEDIA-SEQUENCE:\d+\n/, ""))).toBeNull();
    expect(sequenceReference(playlist(100, 3, T0).replace(/#EXT-X-PROGRAM-DATE-TIME:.*\n/g, ""))).toBeNull();
  });
});

describe("sequenceShift", () => {
  const page = { sequence: 113, time: T0 + 113 * 2000, duration: 2 };

  test.each([
    ["the same base", 0, 0],
    ["1.5 segments lower for the same moment (soak h, B-054)", 3000, 2],
    ["one segment lower", 2000, 1],
    ["PROGRAM-DATE-TIME 60 ms off", 60, 0],
    ["just under a segment lower", 1940, 1],
    ["one segment higher", -2000, -1],
  ])("%s: %d ms -> %d", (_, offset, shift) => {
    expect(sequenceShift(playlist(100, 14, T0 + offset), page)).toBe(shift);
  });

  test("null for a backup with no date-time", () => {
    expect(sequenceShift(playlist(100, 3, T0).replace(/#EXT-X-PROGRAM-DATE-TIME:.*\n/g, ""), page)).toBeNull();
  });
});

describe("shiftSequence", () => {
  test("only the MEDIA-SEQUENCE line changes; TWITCH-LIVE-SEQUENCE and every other line stay", () => {
    const text = playlist(100, 3, T0);
    const out = shiftSequence(text, 2);
    expect(out.split("\n")[1]).toBe("#EXT-X-MEDIA-SEQUENCE:102");
    expect(out.split("\n").filter((_, i) => i !== 1)).toEqual(text.split("\n").filter((_, i) => i !== 1));
  });

  test("a shift of 0 or a playlist without MEDIA-SEQUENCE comes back as it was", () => {
    const text = playlist(100, 3, T0);
    expect(shiftSequence(text, 0)).toBe(text);
    const without = text.replace(/#EXT-X-MEDIA-SEQUENCE:\d+\n/, "");
    expect(shiftSequence(without, 2)).toBe(without);
  });

  test("CRLF line ends stay", () => {
    const text = playlist(100, 3, T0, [], "\r\n");
    expect(shiftSequence(text, -1)).toBe(text.replace("#EXT-X-MEDIA-SEQUENCE:100\r\n", "#EXT-X-MEDIA-SEQUENCE:99\r\n"));
  });
});
