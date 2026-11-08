// T-010: properties of the playlist edits (rule 3, E5/T-501, F-14/T-502, F-20/T-811) over generated Twitch-shaped playlists
import { describe, expect, test } from "bun:test";
import { fc } from "../../../harness/property";
import { buildPlaylist, playlistParams, playlists, PLAYLIST_URL } from "../../../harness/arbitraries";
import { blankAds, mergeWithBackups, readSegments, stripAdDateranges } from "../../../../src/modules/player/m3u8";

const isSegmentLine = (line: string) => line.startsWith("#EXTINF:") || (line !== "" && !line.startsWith("#"));
const resolve = (uri: string) => new URL(uri, PLAYLIST_URL).href;
const liveOf = (uri: string) => Number(/live-(\d+)\./.exec(uri)?.[1] ?? NaN);

// the EXT-X-MAP in effect for each segment of a playlist, in segment order
function mapsOf(text: string): (string | null)[] {
  const maps: (string | null)[] = [];
  let map: string | null = null;
  for (const line of text.split("\n")) {
    if (line.startsWith("#EXT-X-MAP:")) map = line;
    else if (line && !line.startsWith("#")) maps.push(map);
  }
  return maps;
}

describe("stripAdDateranges (properties)", () => {
  test("only the ad's DATERANGE lines go, and a playlist without them comes back as it was", () => {
    fc.assert(
      fc.property(playlists(), (p) => {
        const out = stripAdDateranges(p.text);
        if (!p.adDateranges.length) expect(out).toBe(p.text);
        expect(out.split("\n")).toEqual(p.text.split("\n").filter((line) => !p.adDateranges.includes(line)));
      }),
    );
  });
});

describe("mergeWithBackups (properties)", () => {
  // a page playlist with ads and backups of the same stream (same date-times, other live windows, their own ads)
  const timeline = fc
    .record({
      main: playlistParams({ ads: fc.tuple(fc.nat(15), fc.nat(15)), relative: fc.constant(false) }),
      backups: fc.array(fc.record({ shift: fc.integer({ min: -6, max: 6 }), count: fc.integer({ min: 1, max: 16 }), ads: fc.option(fc.tuple(fc.nat(15), fc.nat(15)), { nil: null }) }), { maxLength: 3 }),
    })
    .map(({ main, backups }) => ({
      main: buildPlaylist(main),
      backups: backups.map((b) => {
        const liveStart = Math.max(0, main.liveStart + b.shift);
        const ads = b.ads ? ([Math.min(...b.ads, b.count - 1), Math.min(Math.max(...b.ads), b.count - 1)] as [number, number]) : null;
        return buildPlaylist({ ...main, liveStart, mediaSequence: liveStart, count: b.count, ads, announced: false, adTitle: main.stitched ? main.adTitle : "Amazon|AD_ID" });
      }),
    }));

  test("without backups, or with a main playlist without ads, the main text comes back as it was", () => {
    fc.assert(
      fc.property(playlists(), fc.array(playlists(), { maxLength: 2 }), (main, backups) => {
        const alone = mergeWithBackups([main.text]);
        expect(alone).toEqual({ text: main.text, replaced: 0, remaining: main.adIndexes });
        if (!main.adIndexes.length) expect(mergeWithBackups([main.text, ...backups.map((b) => b.text)]).text).toBe(main.text);
      }),
    );
  });

  test("an ad segment is replaced when a backup has a live segment at its date-time; every other line stays", () => {
    fc.assert(
      fc.property(timeline, ({ main, backups }) => {
        const result = mergeWithBackups([main.text, ...backups.map((b) => b.text)]);
        const backupLive = new Set(backups.flatMap((b) => b.segmentUris.filter((_, i) => !b.adIndexes.includes(i)).map(liveOf)));
        const replaced = main.adIndexes.filter((i) => backupLive.has(main.params.liveStart + i));
        expect(result.replaced).toBe(replaced.length);
        expect(result.remaining).toEqual(main.adIndexes.filter((i) => !replaced.includes(i)));

        const outLines = result.text.split("\n");
        const segments = readSegments(outLines);
        expect(segments.length).toBe(main.params.count);
        segments.forEach((segment, i) => {
          const uri = outLines[segment.uri];
          expect(uri).toBe(replaced.includes(i) ? `${main.segmentUris[i].replace(/ad-(\d+)/, "live-$1")}` : main.segmentUris[i]);
        });
        // rule 3: every line of the main playlist but the replaced segments' own two stays, in order; MAP lines may be added
        const kept = (lines: string[]) => lines.filter((line) => !isSegmentLine(line) && !line.startsWith("#EXT-X-MAP:"));
        expect(kept(outLines)).toEqual(kept(main.text.split("\n")));
        // T-501: each segment plays under the MAP of its own rendition
        if (main.params.fmp4) mapsOf(result.text).forEach((map, i) => expect(map).toContain(segments[i] && outLines[segments[i].uri].includes("/ad-") ? "ad-init" : "live-init"));
      }),
    );
  });
});

describe("blankAds (properties)", () => {
  test("lines only go, never change; the segments all stay; their ad URIs are listed, no live one", () => {
    fc.assert(
      fc.property(playlists(), (p) => {
        const out = blankAds(p.text, p.adIndexes, PLAYLIST_URL);
        const input = p.text.split("\n");
        const output = out.text.split("\n");
        // a subsequence of the input with only ahead lines taken out
        let at = 0;
        const removed: string[] = [];
        for (const line of input) {
          if (output[at] === line) at++;
          else removed.push(line);
        }
        expect(at).toBe(output.length);
        for (const line of removed) expect(line).toMatch(/^#EXT-X-(TWITCH-PREFETCH|PART|PRELOAD-HINT):/);
        expect(output.filter(isSegmentLine)).toEqual(input.filter(isSegmentLine));

        const adUris = p.adIndexes.map((i) => resolve(p.segmentUris[i]));
        const liveUris = p.segmentUris.filter((_, i) => !p.adIndexes.includes(i)).map(resolve);
        expect(out.uris.slice(0, out.segments)).toEqual(adUris);
        for (const uri of liveUris) expect(out.uris).not.toContain(uri);
      }),
    );
  });

  test("a break announced past the last segment (B-034): its prefetch line goes and is listed; the live ones before it stay", () => {
    fc.assert(
      fc.property(playlists({ ads: fc.constant(null), announced: fc.constant(true) }), (p) => {
        fc.pre(p.adPrefetch != null);
        const out = blankAds(p.text, [], PLAYLIST_URL);
        expect(out.uris).toEqual([resolve(p.adPrefetch!)]);
        expect(out.text.split("\n")).toEqual(p.text.split("\n").filter((line) => line !== `#EXT-X-TWITCH-PREFETCH:${p.adPrefetch}`));
      }),
    );
  });

  test("a playlist with no ad and no announced break comes back as it was, with nothing listed", () => {
    fc.assert(
      fc.property(playlists({ ads: fc.constant(null), announced: fc.constant(false) }), (p) => {
        expect(blankAds(p.text, [], PLAYLIST_URL)).toEqual({ text: p.text, uris: [], segments: 0 });
      }),
    );
  });
});
