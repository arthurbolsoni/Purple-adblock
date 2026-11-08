// T-010: properties of F-29's widened removals (T-829) over generated buffered ranges and removals
import { describe, expect, test } from "bun:test";
import { fc } from "../../harness/property";
import { widenRemoval } from "../../../src/page/buffer-removal";

const EDGE_S = 0.1;

// TimeRanges: sorted, disjoint ranges from 0 up
const bufferedArb = fc.array(fc.tuple(fc.double({ min: 0.01, max: 20, noNaN: true }), fc.double({ min: 0.01, max: 20, noNaN: true })), { maxLength: 4 }).map((pairs) => {
  const ranges: [number, number][] = [];
  let at = 0;
  for (const [gap, length] of pairs) {
    const start = at + gap;
    ranges.push([start, start + length]);
    at = start + length;
  }
  return { length: ranges.length, start: (i: number) => ranges[i][0], end: (i: number) => ranges[i][1], ranges };
});
const removalArb = fc.tuple(fc.double({ min: 0, max: 120, noNaN: true }), fc.double({ min: 0, max: 120, noNaN: true })).map(([a, b]) => [Math.min(a, b), Math.max(a, b)] as const);

// seconds of buffered media inside [from, to)
const bufferedIn = (ranges: [number, number][], from: number, to: number) => ranges.reduce((sum, [s, e]) => sum + Math.max(0, Math.min(e, to) - Math.max(s, from)), 0);

describe("widenRemoval (properties)", () => {
  test("the range removed holds the one asked, and what it adds holds at most EDGE_S of buffered media on each side", () => {
    fc.assert(
      fc.property(bufferedArb, removalArb, (buffered, [start, end]) => {
        const widened = widenRemoval(buffered, start, end);
        if (!buffered.length) return expect(widened).toBeNull();
        if (!widened) return;
        const [from, to] = widened;
        expect(from <= start && to >= end).toBe(true);
        expect([0, start]).toContain(from);
        expect([Infinity, end]).toContain(to);
        expect(bufferedIn(buffered.ranges, from, start)).toBeLessThanOrEqual(EDGE_S + 1e-9);
        expect(bufferedIn(buffered.ranges, end, to)).toBeLessThanOrEqual(EDGE_S + 1e-9);
      }),
    );
  });

  test("a removal inside the buffered range, away from both ends, is left as asked", () => {
    // a removal drawn between the buffered start + EDGE_S and the buffered end - EDGE_S
    const inside = bufferedArb
      .filter((b) => b.length > 0 && b.end(b.length - 1) - b.start(0) > 2 * EDGE_S + 0.02)
      .chain((buffered) => {
        const low = buffered.start(0) + EDGE_S + 0.005;
        const high = buffered.end(buffered.length - 1) - EDGE_S - 0.005;
        return fc.tuple(fc.constant(buffered), fc.double({ min: low, max: high, noNaN: true }), fc.double({ min: low, max: high, noNaN: true }));
      });
    fc.assert(
      fc.property(inside, ([buffered, a, b]) => {
        expect(widenRemoval(buffered, Math.min(a, b), Math.max(a, b))).toBeNull();
      }),
    );
  });

  test("a removal from the buffered start starts at 0, and one to the buffered end goes to the end", () => {
    fc.assert(
      fc.property(bufferedArb, removalArb, (buffered, [start, end]) => {
        fc.pre(buffered.length > 0);
        const widened = widenRemoval(buffered, start, end) ?? [start, end];
        if (start <= buffered.start(0) + EDGE_S) expect(widened[0]).toBe(0);
        if (end >= buffered.end(buffered.length - 1) - EDGE_S) expect(widened[1]).toBe(Infinity);
      }),
    );
  });
});
