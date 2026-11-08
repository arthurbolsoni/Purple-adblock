// T-010: properties of the sequence numbers (F-23, F-24, F-27, F-28) over generated Twitch-shaped playlists
import { describe, expect, test } from "bun:test";
import { fc } from "../../../harness/property";
import { buildPlaylist, playlistParams, type PlaylistParams } from "../../../harness/arbitraries";
import { liveNumberAt, newestNumber, sequenceReference, sequenceShift, shiftSequence } from "../../../../src/modules/player/sequence";

const live = playlistParams({ ads: fc.constant(null), announced: fc.constant(false), liveTag: fc.constant(true) });

describe("newestNumber, liveNumberAt (properties)", () => {
  test("newestNumber is MEDIA-SEQUENCE + segments + prefetch URIs - 1", () => {
    fc.assert(
      fc.property(playlistParams(), (params) => {
        const p = buildPlaylist(params);
        const prefetch = p.text.split("\n").filter((line) => line.startsWith("#EXT-X-TWITCH-PREFETCH:")).length;
        expect(newestNumber(p.text)).toBe(params.mediaSequence + params.count + prefetch - 1);
      }),
    );
  });

  test("liveNumberAt is the live number of the segment listed under a number, null past the playlist or with ads", () => {
    fc.assert(
      fc.property(playlistParams({ announced: fc.constant(false), liveTag: fc.constant(true), prefetch: fc.constant(0) }), fc.integer({ min: -3, max: 20 }), (params, offset) => {
        const p = buildPlaylist(params);
        const number = params.mediaSequence + offset;
        const listed = offset >= 0 && offset < params.count;
        expect(liveNumberAt(p.text, number)).toBe(listed && !p.adIndexes.length ? params.liveStart + offset : null);
      }),
    );
  });
});

describe("shiftSequence (properties)", () => {
  test("a shift of 0 gives the text back; any other moves MEDIA-SEQUENCE alone", () => {
    fc.assert(
      fc.property(playlistParams(), fc.integer({ min: -1000, max: 1000 }), (params, shift) => {
        const p = buildPlaylist(params);
        fc.pre(params.mediaSequence + shift >= 0);
        const shifted = shiftSequence(p.text, shift);
        if (shift === 0) expect(shifted).toBe(p.text);
        expect(newestNumber(shifted)).toBe(newestNumber(p.text)! + shift);
        const changed = p.text.split("\n").filter((line, i) => line !== shifted.split("\n")[i]);
        expect(changed).toEqual(shift ? [`#EXT-X-MEDIA-SEQUENCE:${params.mediaSequence}`] : []);
      }),
    );
  });

  test("a shifted playlist lists each live segment under its number + the shift", () => {
    fc.assert(
      fc.property(live, fc.integer({ min: 0, max: 1000 }), fc.nat(15), (params, shift, index) => {
        fc.pre(index < params.count);
        const p = buildPlaylist(params);
        const number = params.mediaSequence + index;
        expect(liveNumberAt(shiftSequence(p.text, shift), number + shift)).toBe(liveNumberAt(p.text, number));
      }),
    );
  });
});

describe("sequenceShift (properties)", () => {
  // a page playlist numbering the stream `pageAhead` past its live numbers, a backup `backupAhead` (B-054)
  const pair = fc.record({
    page: live,
    backupLive: fc.integer({ min: -5, max: 5 }),
    backupCount: fc.integer({ min: 1, max: 16 }),
    pageAhead: fc.integer({ min: 0, max: 50 }),
    backupAhead: fc.integer({ min: 0, max: 50 }),
  });
  type Pair = { page: PlaylistParams; backupLive: number; backupCount: number; pageAhead: number; backupAhead: number };
  const build = ({ page, backupLive, backupCount, pageAhead, backupAhead }: Pair, jitterMs = 0) => {
    const pageParams = { ...page, mediaSequence: page.liveStart + pageAhead };
    const liveStart = Math.max(0, page.liveStart + backupLive);
    const backupParams = { ...page, liveStart, count: backupCount, mediaSequence: liveStart + backupAhead, jitterMs };
    return { main: buildPlaylist(pageParams).text, backup: buildPlaylist(backupParams).text, expected: pageAhead - backupAhead };
  };

  test("by live number (F-27): the page's offset minus the backup's, and the same live segment then has the page's number", () => {
    fc.assert(
      fc.property(pair, (input) => {
        const { main, backup, expected } = build(input);
        const shift = sequenceShift(backup, sequenceReference(main)!, true);
        expect(shift).toBe(expected);
        const shifted = shiftSequence(backup, shift!);
        const first = input.page.liveStart + input.pageAhead;
        for (let number = first; number < first + input.page.count; number++) {
          const own = liveNumberAt(shifted, number);
          if (own != null) expect(own).toBe(liveNumberAt(main, number));
        }
      }),
    );
  });

  test("by date-time (F-23): the same shift while the tokens date a segment less than 4% of it apart", () => {
    fc.assert(
      fc.property(pair, fc.integer({ min: -79, max: 79 }), (input, jitterMs) => {
        const { main, backup, expected } = build(input, jitterMs);
        expect(sequenceShift(backup, sequenceReference(main)!, false)).toBe(expected);
      }),
    );
  });
});
