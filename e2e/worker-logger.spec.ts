// e2e/worker-logger.js runs in the browser ahead of each worker script. Here it runs on a fake worker scope: the
// network fetch answers with a media playlist and the "server" entry it posts carries the digest. adSegmentPaths is
// what the L3 checks and the soak report compare with the player's fetches (docs/findings/2026-10-08-l3-recorder.md).
import { describe, expect, test } from "bun:test";
import { join } from "path";

const SOURCE = await Bun.file(join(import.meta.dir, "worker-logger.js")).text();

const digestOf = async (playlist: string) => {
  const posted: any[] = [];
  class Channel {
    postMessage(message: any) {
      posted.push(message);
    }
  }
  const scope: any = { fetch: async () => new Response(playlist), addEventListener: () => {} };
  const quiet = { log() {}, warn() {}, error() {} };
  new Function("self", "BroadcastChannel", "console", SOURCE)(scope, Channel, quiet);
  await scope.fetch("https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8");
  for (let i = 0; i < 20 && !posted.some((m) => m.kind === "server" && m.playlist); i++) await Bun.sleep(1);
  return posted.find((m) => m.kind === "server").playlist;
};

const H = "https://seg.example.hls.ttvnw.net/v1/segment";
const STITCHED = '#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="2026-10-08T12:00:04.000Z",DURATION=4.000';

describe("worker logger digest: ad segment paths (B-046)", () => {
  test("fMP4 ad tail: the ad segments, the ad's EXT-X-MAP and the prefetch lines after them", async () => {
    const digest = await digestOf(`#EXTM3U
#EXT-X-MAP:URI="${H}/init-live.mp4"
#EXTINF:2.000,live
${H}/live-1.mp4
${STITCHED}
#EXT-X-DISCONTINUITY
#EXT-X-MAP:URI="${H}/init-ad.mp4"
#EXTINF:2.000,1234567890
${H}/ad-1.mp4
#EXTINF:2.000,1234567890
${H}/ad-2.mp4
#EXT-X-TWITCH-PREFETCH:${H}/ad-3.mp4
`);
    expect(digest.adSegments).toBe(2);
    expect(digest.adSegmentPaths.sort()).toEqual(["ad-1.mp4", "ad-2.mp4", "ad-3.mp4", "init-ad.mp4"].map((n) => `seg.example.hls.ttvnw.net/v1/segment/${n}`));
  });

  test("a break announced after the last segment: only the prefetch lines after the marker", async () => {
    const digest = await digestOf(`#EXTM3U
#EXTINF:2.000,live
${H}/live-1.mp4
#EXT-X-TWITCH-PREFETCH:${H}/live-2.mp4
${STITCHED}
#EXT-X-DISCONTINUITY
#EXT-X-TWITCH-PREFETCH:${H}/ad-1.mp4
`);
    expect(digest.adSegments).toBe(0);
    expect(digest.adSegmentPaths).toEqual(["seg.example.hls.ttvnw.net/v1/segment/ad-1.mp4"]);
  });

  test("a live playlist: no ad path, prefetch lines included", async () => {
    const digest = await digestOf(`#EXTM3U
#EXT-X-MAP:URI="${H}/init-live.mp4"
#EXTINF:2.000,live
${H}/live-1.mp4
#EXT-X-TWITCH-PREFETCH:${H}/live-2.mp4
`);
    expect(digest.adSegmentPaths).toEqual([]);
    expect(digest.prefetch).toBe(1);
  });
});
