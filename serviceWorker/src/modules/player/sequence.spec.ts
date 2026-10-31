import { describe, expect, test } from "bun:test";
import { liveNumberAt, newestNumber, sequenceReference, sequenceShift, shiftSequence } from "./sequence";

const T0 = Date.parse("2026-10-09T02:46:00.910Z");

// segments from `first`, segment n at `base` + n x 2 s; `ads`: indexes with an ad title; `live`: the live sequence of
// the first segment (`first` by default, null for none)
const playlist = (first: number, count: number, base: number, ads: number[] = [], eol = "\n", live: number | null = first) => {
  const lines = ["#EXTM3U", `#EXT-X-MEDIA-SEQUENCE:${first}`, ...(live == null ? [] : [`#EXT-X-TWITCH-LIVE-SEQUENCE:${live}`])];
  for (let i = 0; i < count; i++) {
    const n = first + i;
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(base + n * 2000).toISOString()}`, `#EXTINF:2.000,${ads.includes(i) ? "Amazon|AD_ID" : "live"}`, `https://example.net/${n}.ts`);
  }
  lines.push(`#EXT-X-TWITCH-PREFETCH:https://example.net/${first + count}.ts`);
  return lines.join(eol);
};

describe("sequenceReference", () => {
  test("the newest live segment with its number, date-time, duration and live number", () => {
    expect(sequenceReference(playlist(100, 14, T0))).toEqual({ sequence: 113, time: T0 + 113 * 2000, duration: 2, live: 113 });
    expect(sequenceReference(playlist(100, 14, T0, [], "\n", 97))?.live).toBe(110);
  });

  test("no live number without EXT-X-TWITCH-LIVE-SEQUENCE", () => {
    expect(sequenceReference(playlist(100, 14, T0, [], "\n", null))).toEqual({ sequence: 113, time: T0 + 113 * 2000, duration: 2 });
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

  // F-27 (T-826): the page's playlist numbers live segment 111 as 113 (B-054) and dates it earlier than the backups do
  // (B-057); the backup numbers it 111, at T0 + 111 x 2 s + offset
  describe("by live number", () => {
    const pageLive = { ...page, live: 111 };
    const backup = (offset: number, live: number | null = 100) => playlist(100, 14, T0 + 4000 + offset, [], "\n", live);

    test.each([
      ["dated 0.32 s later on the backup (soak 2026-10-30, 00:11)", 320],
      ["dated 1.60 s later on the backup (00:01)", 1600],
      ["dated 0.07 s later on the backup (01:11)", 70],
      ["the same date-time", 0],
    ])("%s: 2, the page's numbers for the same live segments", (_, offset) => {
      expect(sequenceShift(backup(offset), pageLive)).toBe(2);
    });

    test("by date-time the backup's copy of the page's newest segment took the next number", () => {
      expect(sequenceShift(backup(320), pageLive, false)).toBe(3);
      expect(sequenceShift(backup(1600), pageLive, false)).toBe(3);
    });

    test("by date-time when the backup or the reference has no live number", () => {
      expect(sequenceShift(backup(320, null), pageLive)).toBe(3);
      expect(sequenceShift(backup(320), page)).toBe(3);
    });

    test("a backup numbered like the page's playlist: 0", () => {
      expect(sequenceShift(playlist(102, 14, T0 + 320, [], "\n", 100), pageLive)).toBe(0);
    });
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

describe("newestNumber", () => {
  test("MEDIA-SEQUENCE + segments + prefetch URIs - 1", () => {
    expect(newestNumber(playlist(100, 14, T0))).toBe(114);
    expect(newestNumber(playlist(0, 3, T0, [0, 1, 2]).replace(/#EXT-X-TWITCH-PREFETCH:.*/, ""))).toBe(2);
  });

  test("null without MEDIA-SEQUENCE", () => {
    expect(newestNumber(playlist(100, 3, T0).replace(/#EXT-X-MEDIA-SEQUENCE:\d+\n/, ""))).toBeNull();
  });
});

describe("liveNumberAt", () => {
  test("EXT-X-TWITCH-LIVE-SEQUENCE + the offset from MEDIA-SEQUENCE, prefetch URIs included", () => {
    const text = playlist(107, 14, T0, [], "\n", 103);
    expect(liveNumberAt(text, 107)).toBe(103);
    expect(liveNumberAt(text, 121)).toBe(117);
  });

  test("null for a number the playlist does not list", () => {
    const text = playlist(107, 14, T0, [], "\n", 103);
    expect(liveNumberAt(text, 106)).toBeNull();
    expect(liveNumberAt(text, 122)).toBeNull();
  });

  test("null without EXT-X-TWITCH-LIVE-SEQUENCE or MEDIA-SEQUENCE, or with ad segments", () => {
    expect(liveNumberAt(playlist(100, 3, T0, [], "\n", null), 101)).toBeNull();
    expect(liveNumberAt(playlist(100, 3, T0).replace(/#EXT-X-MEDIA-SEQUENCE:\d+\n/, ""), 101)).toBeNull();
    expect(liveNumberAt(playlist(100, 4, T0, [2, 3]), 101)).toBeNull();
  });
});
