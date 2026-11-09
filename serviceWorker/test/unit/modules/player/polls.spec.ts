// T-831 and T-832: what Player gives the player across polls. Level 1 reproductions of the faults the Quint model of the
// polls (test/model/player.qnt) found: polls that overlap, and the end of a break whose last playlists were the page's.
import { afterEach, beforeEach, describe, expect, setSystemTime, spyOn, test, jest } from "bun:test";
import { Player } from "../../../../src/modules/player/player";
import { StreamType } from "../../../../src/modules/stream/interface/stream.enum";
import { readSegments } from "../../../../src/modules/player/segments";
import { newestNumber } from "../../../../src/modules/player/sequence";

const T0 = Date.parse("2026-11-08T00:00:00.000Z");
const MAIN = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8";
const FRONTPAGE = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8";
const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,CODECS="avc1.64002A,mp4a.40.2",VIDEO="chunked",FRAME-RATE=60.000
${FRONTPAGE}
`;

// 8 segments ending at live number `edge`; MEDIA-SEQUENCE = live number + `ahead`; `ads`: live numbers that are ad
// segments, under a twitch-stitched-ad DATERANGE as in the page's playlist during a break (B-034)
const playlist = (edge: number, ahead = 0, ads: number[] = []) => {
  const first = edge - 7;
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", `#EXT-X-MEDIA-SEQUENCE:${first + ahead}`, `#EXT-X-TWITCH-LIVE-SEQUENCE:${first}`];
  if (ads.length) {
    const start = new Date(T0 + Math.min(...ads) * 2000).toISOString();
    lines.push(`#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="${start}",DURATION=${(ads.length * 2).toFixed(3)}`);
  }
  for (let n = first; n <= edge; n++) {
    const ad = ads.includes(n);
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(T0 + n * 2000).toISOString()}`, `#EXTINF:2.000,${ad ? "Amazon|AD" : "live"}`, `https://seg.example/${ad ? "ad" : "live"}-${n}.ts`);
  }
  return lines.join("\n");
};

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

// a Player whose backup requests wait for the test (`pending`, in the order they were made) or answer at once (`answer`)
const setup = () => {
  const posted: string[] = [];
  const pending: { resolve: (body: string) => void }[] = [];
  const state = { answer: null as string | null };
  const player = new Player({
    logger: () => {},
    postMessage: (message: any) => posted.push(message.type),
    request: ((url: string) => {
      if (url !== FRONTPAGE) return Promise.resolve(new Response(""));
      if (state.answer != null) return Promise.resolve(new Response(state.answer));
      return new Promise<Response>((resolve) => pending.push({ resolve: (body) => resolve(new Response(body)) }));
    }) as any,
  } as any);
  player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false } as any);
  player.setChannel("channel");
  const stream = player.currentStream();
  const access = () => stream.setStreamAccess(master, StreamType.FRONTPAGE);
  access();
  // a new token brings the frontpage master back (Purple drops a server whose playlist had ads)
  stream.createStreamAccess = (async () => access()) as any;
  return { player, posted, pending, state, access };
};

// answers the backup requests as the polls make them, in the order given, until `done` settles: "first" the oldest
// request pending, "last" the newest. `bodies[i]`: the answer to the i-th request made.
const answerAll = async (pending: { resolve: (body: string) => void }[], bodies: string[], order: "first" | "last", done: Promise<unknown>) => {
  let finished = false;
  done.then(() => (finished = true));
  let asked = 0;
  const seen = new Map<{ resolve: (body: string) => void }, number>();
  while (!finished) {
    await tick();
    for (const request of pending) if (!seen.has(request)) seen.set(request, asked++);
    const request = order === "first" ? pending.shift() : pending.pop();
    if (request) request.resolve(bodies[seen.get(request)!]);
  }
};

beforeEach(() => {
  spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  setSystemTime();
});

describe("T-831: polls that overlap", () => {
  // the page's playlist with ads is numbered 100 to 107 (its last two segments are ads); a clean backup ends at 91
  const ADS = playlist(101, 6, [100, 101]);
  const CLEAN = playlist(91);

  test("each poll records the source of the playlist it gave, the first poll's backup answered first", async () => {
    const { player, posted, pending, state, access } = setup();
    // poll A's backup is clean (A gives the backup); poll B's has ads (B gives the page's playlist, blanked)
    const a = player.onFetch(ADS, MAIN);
    await tick();
    const b = player.onFetch(ADS, MAIN); // starts while A waits for its backup
    await answerAll(pending, [CLEAN, ADS], "first", Promise.all([a, b]));
    const [outA, outB] = [await a, await b];
    expect(outA).toContain("live-91.ts");
    expect(outB).toContain("ad-100.ts"); // the page's playlist, its ad segments blanked when fetched

    // the next poll: a clean backup numbered below the page's playlist B gave. The player's last playlist was the page's,
    // so a source that changes to numbers that go back is F-24's restart
    setSystemTime(Date.now() + 6000); // past F-10: the frontpage type is left out for 5 s after a backup with ads
    access();
    posted.length = 0;
    state.answer = CLEAN;
    await player.onFetch(ADS, MAIN);
    expect(posted).toContain("pause");
  });

  test("a slower poll does not give the player an older playlist after a newer one", async () => {
    const { player, pending } = setup();
    // both backups have ads, so both polls give the page's playlist: poll A's numbered up to 107, poll B's, started
    // later, up to 111; B's backup answers first
    const olderPage = playlist(101, 6, [100, 101]);
    const newerPage = playlist(105, 6, [104, 105]);
    const given: (number | null)[] = [];
    const a = player.onFetch(olderPage, MAIN).then((text) => given.push(newestNumber(text)));
    await tick();
    const b = player.onFetch(newerPage, MAIN).then((text) => given.push(newestNumber(text)));
    await answerAll(pending, [olderPage, newerPage], "last", Promise.all([a, b]));
    expect(given).toEqual([107, 111]);
  });
});

// the live segment under `number` in a playlist Purple gave (null: an ad, a blanked one or none)
const contentAt = (text: string, number: number, player: Player): number | null => {
  const lines = text.split("\n");
  const first = Number(/#EXT-X-MEDIA-SEQUENCE:(\d+)/.exec(text)![1]);
  const segment = readSegments(lines)[number - first];
  const uri = segment ? lines[segment.uri].trim() : "";
  const live = /\/live-(\d+)\.ts$/.exec(uri);
  return live && !player.isBlankSegment(uri) ? Number(live[1]) : null;
};

type Poll = { page: string; backup: string; ms: number };

// the polls through one Player, with a player that asks for the number after the last one it fetched. Returns what it
// fetched again (a live segment at or behind the newest it already had) and how many times Purple restarted it.
const play = async (polls: Poll[]) => {
  let now = T0 + 1_000_000;
  setSystemTime(now);
  const { player, posted, state } = setup();
  let have = -1; // the last number the player fetched
  let haveLive = -1; // the newest live segment on its timeline
  const again: number[] = [];
  let restarts = 0;
  for (const poll of polls) {
    now += poll.ms;
    setSystemTime(now);
    state.answer = poll.backup;
    const before = posted.length;
    const out = await player.onFetch(poll.page, MAIN);
    const restarted = posted.slice(before).includes("pause");
    if (restarted) restarts++;
    const newest = newestNumber(out)!;
    if (restarted || have < 0) {
      have = newest;
      haveLive = contentAt(out, newest, player) ?? haveLive;
      continue;
    }
    for (let n = have + 1; n <= newest; n++) {
      const live = contentAt(out, n, player);
      if (live == null) continue;
      if (live <= haveLive) again.push(live);
      else haveLive = live;
    }
    have = newest;
  }
  return { again, restarts };
};

describe("T-832: the end of a break whose last playlists were the page's", () => {
  // the page's playlist numbers the stream as the backups do until the break is over, then 4 further ahead (B-054)
  const after = playlist(110, 4);

  test("blanked: no live segment fetched again, the player restarted instead", async () => {
    const { again, restarts } = await play([
      { page: playlist(103), backup: "", ms: 2000 },
      { page: playlist(105, 0, [104, 105]), backup: playlist(105, 0, [104, 105]), ms: 2000 },
      { page: playlist(106, 0, [104, 105, 106]), backup: playlist(106), ms: 6000 },
      { page: playlist(108, 0, [104, 105, 106, 107, 108]), backup: playlist(108, 0, [107, 108]), ms: 6000 },
      { page: after, backup: "", ms: 2000 },
    ]);
    expect(again).toEqual([]);
    expect(restarts).toBe(1);
  });

  test("merged: no live segment fetched again, the player restarted instead", async () => {
    const { again, restarts } = await play([
      { page: playlist(103), backup: "", ms: 2000 },
      { page: playlist(105, 0, [104, 105]), backup: playlist(105, 0, [98]), ms: 6000 },
      { page: playlist(107, 0, [104, 105, 106, 107]), backup: playlist(107, 0, [100]), ms: 6000 },
      { page: after, backup: "", ms: 2000 },
    ]);
    expect(again).toEqual([]);
    expect(restarts).toBe(1);
  });

  test("a break that ends with the page's playlist right behind the last one needs no restart", async () => {
    // the page's playlist numbers the stream as before: nothing it lists is a segment the player has
    const { again, restarts } = await play([
      { page: playlist(103), backup: "", ms: 2000 },
      { page: playlist(105, 0, [104, 105]), backup: playlist(105, 0, [104, 105]), ms: 2000 },
      { page: playlist(108, 0, [104, 105, 106, 107, 108]), backup: playlist(108, 0, [107, 108]), ms: 6000 },
      { page: playlist(111), backup: "", ms: 2000 },
    ]);
    expect(again).toEqual([]);
    expect(restarts).toBe(0);
  });
});

describe("T-832: the end of a preroll", () => {
  // a preroll's playlist lists its ad segments first and the live ones after: the live segments after the ads are not
  // numbered by EXT-X-TWITCH-LIVE-SEQUENCE + their index (the ads are not in place of live segments), and the page's
  // playlist after the break numbers them otherwise (recorded on twitch.tv, 2026-11-08: a live number 22 behind)
  const preroll = (first: number, live: number, ads: number, segments: number) => {
    const lines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", `#EXT-X-MEDIA-SEQUENCE:${first}`, `#EXT-X-TWITCH-LIVE-SEQUENCE:${live}`];
    if (ads) lines.push(`#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="${new Date(T0).toISOString()}",DURATION=${(ads * 2).toFixed(3)}`);
    for (let i = 0; i < segments; i++) {
      const ad = i < ads;
      lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(T0 + (first + i) * 2000).toISOString()}`, `#EXTINF:2.000,${ad ? "Amazon|AD" : "live"}`, `https://seg.example/${ad ? "ad" : "live"}-${first + i}.ts`);
    }
    return lines.join("\n");
  };

  test("live segments listed after the ad segments do not make the page's next playlist a repeat", async () => {
    const { again, restarts } = await play([
      { page: preroll(0, 5570, 6, 14), backup: "", ms: 2000 },
      { page: preroll(1, 5571, 6, 14), backup: "", ms: 2000 },
      // the break is over: the same numbers, a live number 22 lower
      { page: preroll(2, 5550, 0, 14), backup: "", ms: 2000 },
      { page: preroll(3, 5551, 0, 14), backup: "", ms: 2000 },
    ]);
    expect(again).toEqual([]);
    expect(restarts).toBe(0);
  });
});
