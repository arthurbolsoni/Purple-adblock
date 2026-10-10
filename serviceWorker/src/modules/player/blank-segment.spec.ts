// T-502: the blank segment is Brave's BLANK_MP4, an fMP4 init segment without samples (source in blank-segment.ts)
import { expect, test } from "bun:test";
import { blankSegment } from "./blank-segment";

const sha256 = async (bytes: Uint8Array) => Buffer.from(await crypto.subtle.digest("SHA-256", bytes)).toString("hex");

test("blankSegment: the 1137 bytes of BLANK_MP4, ftyp then moov, a new body for each response", async () => {
  const first = blankSegment();
  const bytes = new Uint8Array(await first.arrayBuffer());
  const again = new Uint8Array(await blankSegment().arrayBuffer());

  expect(first.status).toBe(200);
  expect(first.headers.get("Content-Type")).toBe("video/mp4");
  expect(bytes.length).toBe(1137);
  expect(new TextDecoder().decode(bytes.slice(4, 8))).toBe("ftyp");
  expect(new TextDecoder().decode(bytes.slice(44, 48))).toBe("moov");
  // the same bytes as TwitchAdSolutions' vaft script (ryanbr/TwitchAdSolutions@74f1248, shipped by Brave)
  expect(await sha256(bytes)).toBe("a49d65cbdf2b332a8925f1012329c441e3cefef5c20200d7c8494b67df403204");
  expect(again).toEqual(bytes);
});
