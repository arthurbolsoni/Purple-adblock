import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from "bun:test";
import { DEFAULT_BACKUP_PLAYER_TYPES, Player } from "./player";
import { Stream } from "../stream/stream";
import { StreamType } from "../stream/interface/stream.enum";
import { fixture } from "../../../test/harness/fixtures";

const LIVE = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:100
#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z
#EXTINF:2.000,live
https://seg.example/live-100.ts
#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:02.000Z
#EXTINF:2.000,live
https://seg.example/live-101.ts
`;

const ADS = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:100
#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:00.000Z
#EXTINF:2.000,Amazon|AD-1
https://seg.example/ad-100.ts
#EXT-X-PROGRAM-DATE-TIME:2026-10-03T12:00:02.000Z
#EXTINF:2.000,Amazon|AD-1
https://seg.example/ad-101.ts
`;

// Legacy variant host: the 2.6.7 regex only reads URLs starting with `https://video` (see T-104).
const master = (prefix: string) => `#EXTM3U
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="chunked",NAME="1080p60 (source)",AUTOSELECT=YES,DEFAULT=YES
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,CODECS="avc1.64002A,mp4a.40.2",VIDEO="chunked",FRAME-RATE=60.000
https://video-weaver.example.hls.ttvnw.net/v1/playlist/${prefix}-chunked.m3u8
#EXT-X-MEDIA:TYPE=VIDEO,GROUP-ID="720p60",NAME="720p60",AUTOSELECT=YES,DEFAULT=YES
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720,CODECS="avc1.4D401F,mp4a.40.2",VIDEO="720p60",FRAME-RATE=60.000
https://video-weaver.example.hls.ttvnw.net/v1/playlist/${prefix}-720p60.m3u8
`;

const makeContext = (responses: Record<string, string> = {}) => {
  const posted: any[] = [];
  const requests: string[] = [];
  return {
    posted,
    requests,
    logger: () => {},
    postMessage: (message: any) => posted.push(message),
    request: async (url: any) => {
      requests.push(url);
      return new Response(responses[url] ?? "");
    },
  };
};

beforeEach(() => {
  spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe("Player.setChannel", () => {
  test("creates a stream for a new channel and reuses it when the channel comes back", () => {
    const player = new Player(makeContext());

    player.setChannel("first");
    const first = player.currentStream();
    expect(first).toBeInstanceOf(Stream);
    expect(first.channelName).toBe("first");

    player.setChannel("second");
    expect(player.actualChannel).toBe("second");
    expect(player.streamList.map((s) => s.channelName)).toEqual(["first", "second"]);

    player.setChannel("first");
    expect(player.currentStream()).toBe(first);
    expect(player.streamList).toHaveLength(2);
  });

  test("currentStream accepts another channel name", () => {
    const player = new Player(makeContext());
    player.setChannel("first");
    player.setChannel("second");
    expect(player.currentStream("first").channelName).toBe("first");
    expect(player.currentStream("missing")).toBeUndefined();
  });
});

describe("Player.isWhitelist", () => {
  test("false without settings", () => {
    const player = new Player(makeContext());
    player.setChannel("channel");
    expect(player.isWhitelist()).toBe(false);
  });

  test("true only for a channel in setting.whitelist", () => {
    const player = new Player(makeContext());
    player.setSettings({ whitelist: ["channel"], toggleProxy: false, proxyUrl: "" });

    player.setChannel("channel");
    expect(player.isWhitelist()).toBe(true);

    player.setChannel("other");
    expect(player.isWhitelist()).toBe(false);
  });
});

// T-201: a playlist has ads when the detector finds ad segments (SSAI); markers over live segments are MARKED_LIVE
describe("Player.hasAds", () => {
  test.each([
    ["media-ssai-midroll.m3u8", true],
    ["media-ssai-preroll.m3u8", true],
    ["media-midroll-numeric.m3u8", true],
    ["media-preroll-ft.m3u8", true],
    ["media-marked-live.m3u8", false],
    ["backup-announced-break.m3u8", false],
    ["media-false-positive.m3u8", false],
    ["media-live-ts.m3u8", false],
  ])("%s -> %p", (name, expected) => {
    expect(new Player(makeContext()).hasAds(fixture(`m3u8/${name}`))).toBe(expected);
  });

  test.each([
    [ADS, true],
    [LIVE, false],
    ["", false],
  ])("inline playlist %# -> %p", (text, expected) => {
    expect(new Player(makeContext()).hasAds(text)).toBe(expected);
  });
});

describe("Player.isAds", () => {
  test("without allowChange it reports ads and keeps playingAds", () => {
    const context = makeContext();
    const player = new Player(context);
    expect(player.isAds(ADS)).toBe(true);
    expect(player.playingAds).toBe(false);
    expect(context.posted).toEqual([]);
  });

  test("with allowChange, a change pauses and plays the player", async () => {
    jest.useFakeTimers();
    const context = makeContext();
    const player = new Player(context);

    expect(player.isAds(ADS, true)).toBe(true);
    expect(player.playingAds).toBe(true);
    expect(context.posted).toEqual([{ type: "pause" }]);

    jest.advanceTimersByTime(1500);
    for (let i = 0; i < 10; i++) await Promise.resolve();
    expect(context.posted).toEqual([{ type: "pause" }, { type: "play" }, { type: "play" }]);

    // same state again: no new messages
    player.isAds(ADS, true);
    expect(context.posted).toHaveLength(3);
  });

  // T-601 (F-15)
  test("with reloadAfterAd, the end of a break posts reload instead of pause/play", async () => {
    jest.useFakeTimers();
    const context = makeContext();
    const events: any[] = [];
    const player = new Player({ ...context, emit: (event: any) => events.push(event) });
    player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", reloadAfterAd: true });

    player.isAds(ADS, true);
    jest.advanceTimersByTime(1500);
    for (let i = 0; i < 10; i++) await Promise.resolve();
    player.isAds(LIVE, true);

    expect(context.posted).toEqual([{ type: "pause" }, { type: "play" }, { type: "play" }, { type: "reload" }]);
    expect(events).toContainEqual({ type: "reloadRequested", channel: "" });
    expect(player.playingAds).toBe(false);
  });

  test("without reloadAfterAd, the end of a break pauses and plays as before", async () => {
    jest.useFakeTimers();
    const context = makeContext();
    const player = new Player(context);
    player.isAds(ADS, true);
    player.isAds(LIVE, true);
    expect(context.posted).toEqual([{ type: "pause" }, { type: "pause" }]);
  });

  test("a reload the page could not do falls back to pause/play", async () => {
    jest.useFakeTimers();
    const context = makeContext();
    const events: any[] = [];
    const player = new Player({ ...context, emit: (event: any) => events.push(event) });

    player.onReloadResult(true);
    expect(context.posted).toEqual([]);

    player.onReloadResult(false);
    expect(context.posted).toEqual([{ type: "pause" }]);
    expect(events).toEqual([
      { type: "playerReloaded", ok: true, channel: "" },
      { type: "playerReloaded", ok: false, channel: "" },
    ]);
  });
});

describe("Player.onFetch", () => {
  test("a whitelisted channel gets the playlist unchanged and no request is made", async () => {
    const context = makeContext();
    const player = new Player(context);
    player.setSettings({ whitelist: ["channel"], toggleProxy: false, proxyUrl: "" });
    player.setChannel("channel");

    expect(await player.onFetch(ADS)).toBe(ADS);
    expect(context.requests).toEqual([]);
  });

  // T-101: the player often does not start on regenerated playlists (docs/findings/2026-10-07-backups-and-rewritten-playlists.md)
  test("without ads the playlist comes back unchanged", async () => {
    const player = new Player(makeContext());
    player.setChannel("channel");

    expect(await player.onFetch(LIVE)).toBe(LIVE);
    expect(player.freeStream).toBe(false);
  });

  test("with ads and backups that have ads too, the playlist comes back unchanged", async () => {
    jest.useFakeTimers();
    const frontpageUrl = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8";
    const pictureUrl = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/picture-chunked.m3u8";
    const player = new Player(makeContext({ [frontpageUrl]: ADS, [pictureUrl]: ADS }));
    player.setChannel("channel");
    const stream = player.currentStream();
    stream.setStreamAccess(master("frontpage"), StreamType.FRONTPAGE);
    stream.setStreamAccess(master("picture"), StreamType.PICTURE);
    stream.createStreamAccess = async () => {};

    expect(await player.onFetch(ADS)).toBe(ADS);
  });

  test("with ads, a clean frontpage backup is returned as is", async () => {
    jest.useFakeTimers();
    const frontpageUrl = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8";
    const context = makeContext({ [frontpageUrl]: LIVE });
    const player = new Player(context);
    player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE, StreamType.PICTURE], lowQualityFallback: false });
    player.setChannel("channel");
    player.currentStream().setStreamAccess(master("frontpage"), StreamType.FRONTPAGE);

    expect(await player.onFetch(ADS)).toBe(LIVE);
    expect(context.requests).toEqual([frontpageUrl]);
  });

  test("the backup URL follows the selected quality", async () => {
    jest.useFakeTimers();
    const url720 = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-720p60.m3u8";
    const context = makeContext({ [url720]: LIVE });
    const player = new Player(context);
    player.quality = "720p60";
    player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE, StreamType.PICTURE], lowQualityFallback: false });
    player.setChannel("channel");
    player.currentStream().setStreamAccess(master("frontpage"), StreamType.FRONTPAGE);

    expect(await player.onFetch(ADS)).toBe(LIVE);
    expect(context.requests).toEqual([url720]);
  });

  test("a backup with ads is dropped and the next type is tried", async () => {
    jest.useFakeTimers();
    const frontpageUrl = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8";
    const pictureUrl = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/picture-chunked.m3u8";
    const context = makeContext({ [frontpageUrl]: ADS, [pictureUrl]: LIVE });
    const player = new Player(context);
    player.setChannel("channel");
    const stream = player.currentStream();
    stream.setStreamAccess(master("frontpage"), StreamType.FRONTPAGE);
    stream.setStreamAccess(master("picture"), StreamType.PICTURE);
    stream.createStreamAccess = async () => {};

    expect(await player.onFetch(ADS)).toBe(LIVE);
    expect(context.requests).toEqual([frontpageUrl, pictureUrl]);
    expect(stream.getStreamByStreamType(StreamType.FRONTPAGE)).toEqual([]);
    expect(stream.getStreamByStreamType(StreamType.PICTURE)).toHaveLength(1);
  });

  // T-103: the page requested usher v2, which 2.6.7 does not route, so no stream was stored
  test.each([["live", LIVE], ["ads", ADS]])("before the usher (no stream stored), a %s playlist comes back unchanged", async (_, text) => {
    jest.useFakeTimers();
    const context = makeContext();
    const player = new Player(context);

    expect(await player.onFetch(text)).toBe(text);
    expect(context.requests).toEqual([]);
    expect(context.posted).toEqual([]);
  });

  // T-104: one failing backup is dropped, the next one is tried
  test.each([
    ["a network error", () => Promise.reject(new TypeError("Failed to fetch"))],
    ["an error status", () => Promise.resolve(new Response("forbidden", { status: 403 }))],
  ])("a backup that fails with %s is dropped and the next type is tried", async (_, fail) => {
    jest.useFakeTimers();
    const frontpageUrl = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8";
    const pictureUrl = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/picture-chunked.m3u8";
    const requests: string[] = [];
    const context = {
      ...makeContext(),
      request: async (url: any) => {
        requests.push(url);
        return url === frontpageUrl ? fail() : new Response(LIVE);
      },
    };
    const player = new Player(context);
    player.setChannel("channel");
    const stream = player.currentStream();
    stream.setStreamAccess(master("frontpage"), StreamType.FRONTPAGE);
    stream.setStreamAccess(master("picture"), StreamType.PICTURE);
    stream.createStreamAccess = async () => {};

    expect(await player.onFetch(ADS)).toBe(LIVE);
    expect(requests).toEqual([frontpageUrl, pictureUrl]);
    expect(stream.getStreamByStreamType(StreamType.FRONTPAGE)).toEqual([]);
    expect(stream.getStreamByStreamType(StreamType.PICTURE)).toHaveLength(1);
  });

  test("with ads and no backup yet, it requests backup tokens and keeps the ad playlist", async () => {
    jest.useFakeTimers();
    const player = new Player(makeContext());
    player.setChannel("channel");
    const requested: string[] = [];
    player.currentStream().createStreamAccess = async (type: StreamType) => {
      requested.push(type);
    };

    const out = await player.onFetch(ADS);
    // T-405: F-09 order, autoplay last (lowQualityFallback is on by default)
    expect(requested).toEqual([...DEFAULT_BACKUP_PLAYER_TYPES, StreamType.AUTOPLAY]);
    expect(out).toContain("https://seg.example/ad-100.ts");
    expect(player.freeStream).toBe(false);
  });
});

describe("Player messages to the page", () => {
  test("getQuality, getSettings, pause and play post their type", () => {
    const context = makeContext();
    const player = new Player(context);
    player.getQuality();
    player.getSettings();
    player.pause();
    player.play();
    expect(context.posted).toEqual([{ type: "getQuality" }, { type: "getSettings" }, { type: "pause" }, { type: "play" }]);
  });

  test("setIntegrityToken stores the token", () => {
    const player = new Player(makeContext());
    player.setIntegrityToken("INTEGRITY");
    expect(player.integrityToken).toBe("INTEGRITY");
  });
});

// T-406 (F-10): a type is skipped only when none of its servers gave a clean backup
describe("contaminated backup types", () => {
  test("a type whose backup was clean is tried again on the next poll, even if another of its servers had ads", async () => {
    jest.useFakeTimers();
    const player = new Player(makeContext());
    player.setChannel("channel");
    player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.POPOUT], lowQualityFallback: false });
    player.currentStream().createStreamAccess = async () => {};
    const tried: string[] = [];
    player.fetchm3u8ByStreamType = async (type) => {
      tried.push(type);
      return { data: LIVE, dump: [ADS, LIVE], contaminated: true };
    };

    expect(await player.onFetch(ADS)).toBe(LIVE);
    expect(await player.onFetch(ADS)).toBe(LIVE);
    expect(tried).toEqual([StreamType.POPOUT, StreamType.POPOUT]);
  });
});
