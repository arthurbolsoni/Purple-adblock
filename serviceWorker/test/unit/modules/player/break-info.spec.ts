// F-31 (T-606): what a break's playlist says about the break, for the diagnostic log's breakStart: its roll and how long
// its ad pod is announced to last (docs/server/ads.md: twitch-stitched-ad and twitch-maf-ad DATERANGE attributes).
import { describe, expect, test } from "bun:test";
import { fixture } from "../../../harness/fixtures";
import { breakDetails } from "../../../../src/modules/player/break-info";

const stitched = (attributes: string) => `#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="2026-10-03T12:10:06.000Z",${attributes}`;
const playlist = (...lines: string[]) => ["#EXTM3U", "#EXT-X-TARGETDURATION:6", ...lines, "#EXTINF:2.000,live", "https://seg.example/live-1.ts"].join("\n");

describe("breakDetails", () => {
  test("the fixtures' stitched breaks: a one-ad pod lasts its DURATION; the roll from ROLL-TYPE", () => {
    expect(breakDetails(fixture("m3u8/media-ssai-midroll.m3u8"))).toEqual({ roll: "midroll", declared: 6 });
    expect(breakDetails(fixture("m3u8/media-ssai-preroll.m3u8"))).toEqual({ roll: "preroll", declared: 12 });
  });

  test("POD-FILLED-DURATION is the pod's length when given", () => {
    expect(breakDetails(playlist(stitched('DURATION=20.234,X-TV-TWITCH-AD-ROLL-TYPE="MIDROLL",X-TV-TWITCH-AD-POD-LENGTH="3",X-TV-TWITCH-AD-POD-POSITION="0",X-TV-TWITCH-AD-POD-FILLED-DURATION="90.04"')))).toEqual({
      roll: "midroll",
      declared: 90.04,
    });
  });

  test("a pod of several ads: the sum of their DURATIONs when every position is listed, else not known", () => {
    const first = stitched('DURATION=30.000,X-TV-TWITCH-AD-ROLL-TYPE="MIDROLL",X-TV-TWITCH-AD-POD-LENGTH="2",X-TV-TWITCH-AD-POD-POSITION="0"');
    const second = stitched('DURATION=15.500,X-TV-TWITCH-AD-ROLL-TYPE="MIDROLL",X-TV-TWITCH-AD-POD-LENGTH="2",X-TV-TWITCH-AD-POD-POSITION="1"');
    expect(breakDetails(playlist(first, second))).toEqual({ roll: "midroll", declared: 45.5 });
    expect(breakDetails(playlist(first))).toEqual({ roll: "midroll" });
  });

  test("a twitch-maf-ad slot (client-side): no roll in the playlist, its PLANNED-DURATION", () => {
    expect(breakDetails(fixture("m3u8/media-marked-live.m3u8"))).toEqual({ declared: 60 });
  });

  test("another roll type, or none, is not known; a playlist without a marker gives nothing", () => {
    expect(breakDetails(playlist(stitched('DURATION=6.000,X-TV-TWITCH-AD-ROLL-TYPE="POSTROLL"')))).toEqual({ declared: 6 });
    expect(breakDetails(playlist(stitched("DURATION=6.000")))).toEqual({ declared: 6 });
    expect(breakDetails(fixture("m3u8/media-live-ts.m3u8"))).toEqual({});
  });
});
