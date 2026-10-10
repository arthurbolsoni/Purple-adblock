// T-407 (F-11): a backup variant in the quality and codec family the player is on
import { describe, expect, test } from "bun:test";
import { fixture } from "../../../../test/harness/fixtures";
import { parseVariants } from "../master";
import { Server, StreamUrl, codecFamily } from "./stream.types";

const serverOf = (name: string) => new Server({ type: "frontpage", urlList: parseVariants(fixture(`m3u8/${name}`)), sig: true });
// 1440p60 (source) HEVC 9 Mb/s, 1080p60 AV1 6 Mb/s, 1080p60 AVC 6.5 Mb/s, 720p60 AVC 3.4 Mb/s
const MIXED = serverOf("master-hevc.m3u8");
const file = (variant?: StreamUrl) => variant?.url.split("/").pop();

describe("codecFamily", () => {
  test.each([
    ["avc1.64002A,mp4a.40.2", "avc"],
    ["mp4a.40.2,avc3.640028", "avc"],
    ["hvc1.2.4.L153.B0,mp4a.40.2", "hevc"],
    ["hev1.1.6.L93.B0", "hevc"],
    ["av01.0.12M.10,mp4a.40.2", "av1"],
    ["mp4a.40.2", ""],
    ["", ""],
  ])("%p -> %p", (codecs, family) => {
    expect(codecFamily(codecs)).toBe(family);
  });
});

describe("Server.pick", () => {
  test("same quality and codec family: an AVC 1080p60 player gets the AVC 1080p60 variant, not the AV1 one", () => {
    expect(file(MIXED.pick({ quality: "1080p60", resolution: "1920x1080", codecs: "avc1.4D402A,mp4a.40.2" }))).toBe("1080p60.m3u8");
  });

  test("an AV1 1080p60 player gets the AV1 variant", () => {
    expect(file(MIXED.pick({ quality: "1080p60", resolution: "1920x1080", codecs: "av01.0.08M.08,mp4a.40.2" }))).toBe("1080p60_av1.m3u8");
  });

  test('the "(source)" suffix is not part of the quality', () => {
    expect(file(MIXED.pick({ quality: "1440p60", resolution: "2560x1440", codecs: "hvc1.2.4.L150.B0" }))).toBe("chunked.m3u8");
  });

  test("no variant of the family at that quality: the same resolution with another codec, highest bandwidth first", () => {
    expect(file(MIXED.pick({ quality: "1080p60", resolution: "1920x1080", codecs: "hvc1.2.4.L123.B0" }))).toBe("1080p60.m3u8");
  });

  test("neither quality nor resolution: the best variant of the same family, not the best overall", () => {
    expect(file(MIXED.pick({ quality: "480p30", resolution: "852x480", codecs: "avc1.4D401F" }))).toBe("1080p60.m3u8");
  });

  test("a family the master does not have: bestQuality()", () => {
    expect(file(MIXED.pick({ quality: "480p30", resolution: "852x480", codecs: "vp09.00.10.08" }))).toBe("chunked.m3u8");
  });

  test("only a quality name (the player's setQuality): by name, then bestQuality()", () => {
    expect(file(MIXED.pick({ quality: "720p60" }))).toBe("720p60.m3u8");
    expect(file(MIXED.pick({ quality: "" }))).toBe("chunked.m3u8");
  });

  test("an AVC-only master: an HEVC player at 1440p60 gets the best AVC variant there is", () => {
    expect(file(serverOf("master-avc.m3u8").pick({ quality: "1440p60", resolution: "2560x1440", codecs: "hvc1.2.4.L150.B0" }))).toBe(
      file(serverOf("master-avc.m3u8").bestQuality()),
    );
  });
});
