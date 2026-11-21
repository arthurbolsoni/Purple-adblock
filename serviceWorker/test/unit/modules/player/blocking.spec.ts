// F-30 (T-605): Player tells the page when the main playlist enters and leaves a break it blocks ("adState"), once per
// change and with any setting (it is not a debug event): the badge on the extension's icon follows it.
import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import { Player } from "../../../../src/modules/player/player";
import { StreamType } from "../../../../src/modules/stream/interface/stream.enum";

const T0 = Date.parse("2026-11-21T00:00:00.000Z");
const MAIN = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8";
const FRONTPAGE = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8";
const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,CODECS="avc1.64002A,mp4a.40.2",VIDEO="chunked",FRAME-RATE=60.000
${FRONTPAGE}
`;

// 8 segments ending at `edge`; `ads`: numbers given as stitched ad segments; `maf`: a twitch-maf-ad marker over live ones
const playlist = (edge: number, ads: number[] = [], maf = false) => {
  const first = edge - 7;
  const lines = ["#EXTM3U", "#EXT-X-TARGETDURATION:6", `#EXT-X-MEDIA-SEQUENCE:${first}`, `#EXT-X-TWITCH-LIVE-SEQUENCE:${first}`];
  const at = (n: number) => new Date(T0 + n * 2000).toISOString();
  if (ads.length) lines.push(`#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="${at(Math.min(...ads))}",DURATION=${(ads.length * 2).toFixed(3)}`);
  if (maf) lines.push(`#EXT-X-DATERANGE:ID="maf-1",CLASS="twitch-maf-ad",START-DATE="${at(edge - 1)}",DURATION=30.000,X-TV-TWITCH-AD-ROLL-TYPE="MIDROLL"`);
  for (let n = first; n <= edge; n++) {
    const ad = ads.includes(n);
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${at(n)}`, `#EXTINF:2.000,${ad ? "Amazon|AD" : "live"}`, `https://seg.example/${ad ? "ad" : "live"}-${n}.ts`);
  }
  return lines.join("\n");
};

const setup = (settings: Record<string, unknown> = {}) => {
  const states: boolean[] = [];
  const debugEvents: string[] = [];
  const player = new Player({
    logger: () => {},
    postMessage: (message: any) => message.type === "adState" && states.push(message.blocking),
    emit: (event: any) => debugEvents.push(event.type),
    // a clean backup for every poll
    request: ((url: string) => Promise.resolve(new Response(url === FRONTPAGE ? playlist(200) : ""))) as any,
  } as any);
  player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false, ...settings } as any);
  player.setChannel("channel");
  const stream = player.currentStream();
  stream.setStreamAccess(master, StreamType.FRONTPAGE);
  stream.createStreamAccess = (async () => stream.setStreamAccess(master, StreamType.FRONTPAGE)) as any;
  return { player, states };
};

beforeEach(() => {
  spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("F-30: the break Purple blocks, told to the page", () => {
  test("a stitched break: once when it starts, once when it ends", async () => {
    const { player, states } = setup();
    await player.onFetch(playlist(103), MAIN);
    expect(states).toEqual([]); // no break yet: nothing to say
    await player.onFetch(playlist(105, [104, 105]), MAIN);
    await player.onFetch(playlist(106, [104, 105, 106]), MAIN);
    expect(states).toEqual([true]);
    await player.onFetch(playlist(110), MAIN);
    await player.onFetch(playlist(111), MAIN);
    expect(states).toEqual([true, false]);
  });

  test("a client-side break (a marker over live segments) counts while blockCsai is on", async () => {
    const on = setup();
    await on.player.onFetch(playlist(105, [], true), MAIN);
    await on.player.onFetch(playlist(106), MAIN);
    expect(on.states).toEqual([true, false]);

    const off = setup({ blockCsai: false });
    await off.player.onFetch(playlist(105, [], true), MAIN);
    expect(off.states).toEqual([]);
  });

  test("a whitelisted channel shows its ads: nothing is blocked", async () => {
    const { player, states } = setup({ whitelist: ["channel"] });
    await player.onFetch(playlist(105, [104, 105]), MAIN);
    expect(states).toEqual([]);
  });

  test("another channel starts with no break", async () => {
    const { player, states } = setup();
    await player.onFetch(playlist(105, [104, 105]), MAIN);
    player.setChannel("other");
    expect(states).toEqual([true, false]);
    player.setChannel("other");
    expect(states).toEqual([true, false]);
  });
});
