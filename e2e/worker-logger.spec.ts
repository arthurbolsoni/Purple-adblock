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

// soak.py --fake-breaks (T-829 test): during a window the player's own media playlists reach Purple's hook with their
// segments titled as ads; backups (URLs the player never asked for) and playlists outside a window are left alone.
describe("worker logger fake breaks", () => {
  const LIVE = `#EXTM3U
#EXT-X-TWITCH-LIVE-SEQUENCE:100
#EXTINF:2.000,live
${H}/live-1.ts
#EXTINF:2.000,live
${H}/live-2.ts
#EXT-X-TWITCH-PREFETCH:${H}/live-3.ts
`;
  const MAIN = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8";
  const BACKUP = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/backup.m3u8";

  // a scope whose page fetch is the worker's, then Purple's hook (set on self.fetch) reads through the original
  const run = async (fake: object) => {
    class Channel {
      postMessage() {}
    }
    const scope: any = { fetch: async () => new Response(LIVE), addEventListener: () => {}, __e2eFakeBreaks: fake };
    const quiet = { log() {}, warn() {}, error() {} };
    new Function("self", "BroadcastChannel", "console", SOURCE)(scope, Channel, quiet);
    const request = scope.fetch; // what Purple keeps as scope.request
    const seen: Record<string, string> = {};
    scope.fetch = async (url: string) => {
      const text = await (await request(url)).text();
      seen[url] = text;
      await (await request(BACKUP)).text().then((backup: string) => (seen[BACKUP] = backup));
      return new Response(text);
    };
    await scope.fetch(MAIN);
    return seen;
  };

  test("inside a window: the player's playlist titled as ads, the backup left alone", async () => {
    const seen = await run({ start: Date.now() - 1000, every: 60, length: 30 });
    expect(seen[MAIN].match(/^#EXTINF:.*$/gm)).toEqual(["#EXTINF:2.000,Amazon|e2e-fake-break", "#EXTINF:2.000,Amazon|e2e-fake-break"]);
    expect(seen[MAIN]).toContain(`#EXT-X-TWITCH-PREFETCH:${H}/live-3.ts`);
    expect(seen[BACKUP]).toBe(LIVE);
  });

  test("outside a window: the player's playlist as the server sent it", async () => {
    const seen = await run({ start: Date.now() - 40_000, every: 60, length: 30 });
    expect(seen[MAIN]).toBe(LIVE);
  });
});

describe("worker logger: the player's playlist requests (T-831)", () => {
  test("each .m3u8 request of the player posts its start and its end with the same call", async () => {
    const posted: any[] = [];
    class Channel {
      postMessage(message: any) {
        posted.push(message);
      }
    }
    const scope: any = { fetch: async () => new Response(""), addEventListener: () => {} };
    const quiet = { log() {}, warn() {}, error() {} };
    new Function("self", "BroadcastChannel", "console", SOURCE)(scope, Channel, quiet);
    scope.fetch = async () => new Response("#EXTM3U");
    const url = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8";
    await Promise.all([scope.fetch(url), scope.fetch(url)]);
    await scope.fetch("https://edge.example.hls.ttvnw.net/v1/segment/live-1.ts");
    const calls = posted.filter((m) => m.level === "player" && (m.kind === "fetchStart" || m.kind === "fetch"));
    expect(calls.map((m) => [m.kind, m.call])).toEqual([
      ["fetchStart", 1],
      ["fetchStart", 2],
      ["fetch", 1],
      ["fetch", 2],
      ["fetch", 3], // a segment: no start
    ]);
  });
});
