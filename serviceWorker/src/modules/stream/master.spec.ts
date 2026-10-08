// T-104: master variants read with m3u8-parser; Purple 2.6.7's regex only as a fallback.
import { describe, expect, test } from "bun:test";
import { fixture } from "../../../test/harness/fixtures";
import { parseVariants } from "./master";

describe("parseVariants", () => {
  test("master-avc: quality from the EXT-X-MEDIA NAME, resolution, codecs, bandwidth and URL", () => {
    const variants = parseVariants(fixture("m3u8/master-avc.m3u8"));
    expect(variants).toHaveLength(5);
    expect({ ...variants[0] }).toEqual({
      quality: "1080p60 (source)",
      resolution: "1920x1080",
      codecs: "avc1.64002A,mp4a.40.2",
      bandwidth: 8534030,
      url: "https://edge.playlist.ttvnw.net/v1/playlist/chunked.m3u8",
    });
    expect(variants.map((v) => v.quality)).toEqual(["1080p60 (source)", "720p60", "480p", "360p", "160p"]);
  });

  test("master-hevc: codecs of every family", () => {
    expect(parseVariants(fixture("m3u8/master-hevc.m3u8")).map((v) => v.codecs.split(".")[0])).toEqual(["hvc1", "av01", "avc1", "avc1"]);
  });

  test("master-empty: no variant", () => {
    expect(parseVariants(fixture("m3u8/master-empty.m3u8"))).toEqual([]);
  });

  // captured 2026-10-07: variants on *.playlist.ttvnw.net, which the 2.6.7 regex does not read (Q-013)
  test("captured backup master (v1): variants on *.playlist.ttvnw.net", () => {
    const variants = parseVariants(fixture("m3u8/master-frontpage-v1.m3u8"));
    expect(variants.map((v) => v.quality)).toEqual(["360p30", "160p30", "1080p60", "720p60", "480p30"]);
    expect(variants.every((v) => v.url.startsWith("https://sae12.playlist.ttvnw.net/v1/playlist/"))).toBe(true);
    expect(variants[2]).toMatchObject({ resolution: "1920x1080", bandwidth: 8042999 });
  });

  test("captured page master (v2): quality from IVS-NAME, no EXT-X-MEDIA", () => {
    const variants = parseVariants(fixture("m3u8/master-site-v2.m3u8"));
    expect(variants.map((v) => v.quality)).toEqual(["480p30", "160p30", "1080p60", "720p60", "360p30"]);
    expect(variants.every((v) => v.url.startsWith("https://sae12.playlist.ttvnw.net/v1/playlist/"))).toBe(true);
  });

  test("the 2.6.7 regex is used only when the parser finds no variant", () => {
    // EXT-X-MEDIA and STREAM-INF on one line: the parser sees no variant, the 2.6.7 regex does
    const oneLine =
      '#EXTM3U\n#EXT-X-MEDIA:TYPE=VIDEO,NAME="720p60",AUTOSELECT=YES,DEFAULT=YES #EXT-X-STREAM-INF:BANDWIDTH=1 https://video-weaver.example.hls.ttvnw.net/v1/playlist/720p60.m3u8\n';
    expect(parseVariants(oneLine).map((v) => ({ ...v }))).toEqual([
      { quality: "720p60", resolution: "", codecs: "", bandwidth: 0, url: "https://video-weaver.example.hls.ttvnw.net/v1/playlist/720p60.m3u8" },
    ]);

    // with variants, every field comes from the parser
    expect(parseVariants(fixture("m3u8/master-video-weaver.m3u8"))[0].resolution).toBe("1920x1080");
  });
});
