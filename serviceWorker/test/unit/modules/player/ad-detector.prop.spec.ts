// T-010: properties of the ad detector (F-02, F-03, T-203, T-204) over generated Twitch-shaped playlists
import { describe, expect, test } from "bun:test";
import { fc } from "../../../harness/property";
import { playlists } from "../../../harness/arbitraries";
import { AdClass, detectAds, isCleanBackup } from "../../../../src/modules/player/ad-detector";

describe("detectAds (properties)", () => {
  test("the ad segments are the ones titled as ads, or inside a stitched-ad range; live ones never", () => {
    fc.assert(
      fc.property(playlists(), (p) => {
        expect(detectAds(p.text).adSegments).toEqual(p.adIndexes);
      }),
    );
  });

  test("SSAI with ad segments; MARKED_LIVE for a break announced past the last segment; NONE otherwise", () => {
    fc.assert(
      fc.property(playlists(), (p) => {
        const expected = p.adIndexes.length ? AdClass.SSAI : p.adPrefetch ? AdClass.MARKED_LIVE : AdClass.NONE;
        expect(detectAds(p.text).class).toBe(expected);
      }),
    );
  });

  test("a backup is clean when it has no ad segment and no stitched-ad marker", () => {
    fc.assert(
      fc.property(playlists(), (p) => {
        const stitchedMarker = (p.params.ads != null && p.params.stitched) || p.adPrefetch != null;
        expect(isCleanBackup(p.text)).toBe(!p.adIndexes.length && !stitchedMarker);
      }),
    );
  });
});
