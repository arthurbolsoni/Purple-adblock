// Worker pipeline as it runs inside the Twitch player worker (bootstrapWorker on a fake scope), against FakeTwitch.
// Characterizes Purple 2.6.7: usher -> channel, media playlist -> ad check -> backup by playerType (E3, E4),
// merge by PROGRAM-DATE-TIME (E5), picture-by-picture capture (E10), pause/play on ad state changes (E6).
import { describe, expect, test } from "bun:test";
import { Parser } from "m3u8-parser";
import { silenceConsole } from "../harness/console";
import { fixture } from "../harness/fixtures";
import { createWorkerScope } from "../harness/worker-scope";
import { StreamType } from "../../src/modules/stream/interface/stream.enum";

silenceConsole();

const HOST = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/";
const USHER = "https://usher.ttvnw.net/api/channel/hls/channel.m3u8?token=PAGE_TOKEN&sig=PAGE_SIG";
const MAIN = `${HOST}chunked.m3u8`;
const FRONTPAGE = `${HOST}frontpage-chunked.m3u8`;
const PICTURE = `${HOST}picture-chunked.m3u8`;

// master-video-weaver.m3u8 with the variant URLs of one playerType
const masterFor = (prefix: string) => fixture("m3u8/master-video-weaver.m3u8").replaceAll(HOST, HOST + prefix);

const uris = (text: string) => {
  const parser = new Parser();
  parser.push(text);
  parser.end();
  return parser.manifest.segments.map((s: any) => s.uri.split("/").pop());
};

// Backup token requests run without being awaited by the poll; wait until they settle.
const settle = async (until: () => boolean) => {
  for (let i = 0; i < 50 && !until(); i++) await Bun.sleep(1);
};

const setup = () => {
  const worker = createWorkerScope();
  worker.twitch.master("channel", masterFor(""));
  return worker;
};

describe("worker pipeline", () => {
  test("bootstrapping registers the routes and asks the page for settings", () => {
    const worker = setup();
    expect(worker.router.routes.map((r) => (typeof r.match === "string" ? r.match : "variant of the player's master"))).toEqual([
      "usher.ttvnw.net/api/v2/channel/hls/",
      "usher.ttvnw.net/api/channel/hls/",
      "variant of the player's master",
      "ttvnw.net/v1/playlist/",
      "picture-by-picture",
    ]);
    expect(worker.posted).toEqual([{ type: "getSettings" }]);
  });

  test("usher: the master passes through and the channel is stored", async () => {
    const worker = setup();
    expect(await worker.text(USHER)).toBe(masterFor(""));
    expect(worker.player.actualChannel).toBe("channel");
    expect(worker.player.currentStream().channelName).toBe("channel");
    expect(worker.twitch.callsOf("usher")).toHaveLength(1);
  });

  test("segments and other requests are not routed", async () => {
    const worker = setup();
    await worker.fetch("https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/live-1000.ts");
    expect(worker.twitch.calls.map((c) => c.kind)).toEqual(["unknown"]);
    expect(worker.player.actualChannel).toBe("");
  });

  test("a media playlist without ads keeps its segments and makes no token request", async () => {
    const worker = setup();
    const live = fixture("m3u8/media-live-ts.m3u8");
    worker.twitch.mediaPlaylist(MAIN, live);
    await worker.text(USHER);

    const out = await worker.text(MAIN);

    expect(uris(out)).toEqual(uris(live));
    expect(worker.twitch.callsOf("gql")).toEqual([]);
    expect(worker.posted).toEqual([{ type: "getSettings" }]);
  });

  // T-101
  test.each(["media-live-ts.m3u8", "media-live-fmp4.m3u8", "media-ll-hls.m3u8"])("%s without ads comes out byte-identical", async (name) => {
    const worker = setup();
    const live = fixture(`m3u8/${name}`);
    worker.twitch.mediaPlaylist(MAIN, live);
    await worker.text(USHER);

    expect(await worker.text(MAIN)).toBe(live);
  });

  test("ad break: backup tokens are requested, then the clean frontpage backup replaces the playlist", async () => {
    const worker = setup();
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    const clean = fixture("m3u8/backup-clean.m3u8");
    worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(MAIN, midroll);
    worker.twitch.mediaPlaylist(FRONTPAGE, clean);
    worker.send("setIntegrity", JSON.stringify({ token: "INTEGRITY" }));
    await worker.text(USHER);

    // first poll: no backup yet, the ad playlist goes out unchanged and the tokens are requested
    const first = await worker.text(MAIN);
    expect(first).toBe(midroll);
    expect(worker.posted).toContainEqual({ type: "pause" });

    await settle(() => worker.player.currentStream().serverList.length === 2);
    const gql = worker.twitch.callsOf("gql");
    expect(gql.map((c) => c.playerType)).toEqual([StreamType.FRONTPAGE, StreamType.PICTURE]);
    expect(gql.every((c) => c.headers["client-integrity"] === "INTEGRITY")).toBe(true);
    expect(worker.twitch.callsOf("usher").map((c) => c.playerType)).toEqual(["site", StreamType.FRONTPAGE, StreamType.PICTURE]);

    // second poll: the frontpage backup has no ads and is returned as is
    expect(await worker.text(MAIN)).toBe(clean);
    expect(worker.twitch.callsOf("media").map((c) => c.url)).toEqual([MAIN, MAIN, FRONTPAGE]);
  });

  test("ad break: a backup with ad segments is dropped and its live segments replace the ads by PROGRAM-DATE-TIME", async () => {
    const worker = setup();
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    // an ad segment at 12:10:00, not where the main stream has its ads: the backup is SSAI and dropped
    const markedBackup = fixture("m3u8/backup-clean.m3u8").replace(
      "#EXTINF:2.000,live\nhttps://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3000.ts",
      "#EXTINF:2.000,Amazon|AD_ID\nhttps://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3000.ts",
    );
    const stream = () => worker.player.currentStream();
    worker.twitch.mediaPlaylist(MAIN, midroll);
    worker.twitch.mediaPlaylist(FRONTPAGE, markedBackup);
    await worker.text(USHER);
    stream().setStreamAccess(masterFor("frontpage-"), StreamType.FRONTPAGE);
    stream().createStreamAccess = async () => {};

    const out = await worker.text(MAIN);

    expect(uris(out)).toEqual(["live-2000.ts", "live-2001.ts", "live-2002.ts", "backup-3003.ts", "backup-3004.ts", "backup-3005.ts", "live-2006.ts", "live-2007.ts"]);
    expect(stream().getStreamByStreamType(StreamType.FRONTPAGE)).toEqual([]);
    expect(worker.player.freeStream).toBe(true);
  });

  test("picture-by-picture: the usher response is stored as a backup and the player gets an empty body", async () => {
    const worker = setup();
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    await worker.text(USHER);

    const response = await worker.fetch(
      `https://usher.ttvnw.net/api/channel/hls/channel.m3u8?token=TOKEN-picture-by-picture&player_type=picture-by-picture`,
    );

    expect(await response.text()).toBe("");
    const [server] = worker.player.currentStream().getStreamByStreamType(StreamType.PICTURE);
    expect(server.urlList[0].url).toBe(PICTURE);
    expect(worker.player.actualChannel).toBe("channel");
  });

  // T-103: the Twitch page requests usher v2 (docs/findings/2026-10-07-e2e-harness.md)
  test.each([
    ["v1", "https://usher.ttvnw.net/api/channel/hls/channel.m3u8?token=PAGE_TOKEN&sig=PAGE_SIG"],
    ["v2", "https://usher.ttvnw.net/api/v2/channel/hls/channel.m3u8?token=PAGE_TOKEN&sig=PAGE_SIG"],
  ])("usher %s: the master passes through and the channel is stored", async (_, usher) => {
    const worker = setup();
    expect(await worker.text(usher)).toBe(masterFor(""));
    expect(worker.player.actualChannel).toBe("channel");
    expect(worker.player.currentStream().channelName).toBe("channel");
  });

  test("the channel comes from the usher path, not from the query string", async () => {
    const worker = setup();
    worker.twitch.master("other_channel", masterFor(""));
    await worker.text("https://usher.ttvnw.net/api/v2/channel/hls/other_channel.m3u8?token=PAGE_TOKEN&note=hls/x.m3u8");
    expect(worker.player.actualChannel).toBe("other_channel");
  });

  test("an ad playlist before the usher comes back unchanged, with no token request", async () => {
    const worker = setup();
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    worker.twitch.mediaPlaylist(MAIN, midroll);

    const response = await worker.fetch(MAIN);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(midroll);
    expect(worker.twitch.callsOf("gql")).toEqual([]);
  });

  // CLAUDE.md rule 5: a failure in the blocking logic returns Twitch's original playlist
  test("a failure while handling a media playlist returns the original playlist", async () => {
    const worker = setup();
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    worker.twitch.mediaPlaylist(MAIN, midroll);
    await worker.text(USHER);
    worker.player.onFetch = async () => {
      throw new TypeError("boom");
    };

    const response = await worker.fetch(MAIN);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(midroll);
  });

  // T-104: current masters list their variants on <edge>.playlist.ttvnw.net (Q-013)
  test("ad break with backup masters on *.playlist.ttvnw.net: the clean frontpage backup replaces the playlist", async () => {
    const EDGE = "https://edge.playlist.ttvnw.net/v1/playlist/";
    const avcFor = (prefix: string) => fixture("m3u8/master-avc.m3u8").replaceAll(EDGE, EDGE + prefix);
    const worker = createWorkerScope();
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    const clean = fixture("m3u8/backup-clean.m3u8");
    worker.twitch.master("channel", avcFor(""));
    worker.twitch.master("channel", avcFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", avcFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(`${EDGE}chunked.m3u8`, midroll);
    worker.twitch.mediaPlaylist(`${EDGE}frontpage-chunked.m3u8`, clean);
    await worker.text("https://usher.ttvnw.net/api/v2/channel/hls/channel.m3u8?token=PAGE_TOKEN&sig=PAGE_SIG");

    await worker.text(`${EDGE}chunked.m3u8`);
    await settle(() => worker.player.currentStream().serverList.length === 2);

    expect(await worker.text(`${EDGE}chunked.m3u8`)).toBe(clean);
    expect(worker.twitch.calls.map((c) => c.url)).not.toContain("undefined");
  });

  test("a media playlist listed in the player's master is handled even without the v1/playlist path", async () => {
    const worker = createWorkerScope();
    const variant = "https://edge.playlist.ttvnw.net/v2/hls/opaque-1.m3u8";
    worker.twitch.master("channel", `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=1280x720,IVS-NAME="720p60"
${variant}
`);
    worker.twitch.mediaPlaylist(variant, fixture("m3u8/media-ssai-preroll.m3u8"));
    worker.twitch.mediaPlaylist("https://edge.playlist.ttvnw.net/v2/hls/other.m3u8", fixture("m3u8/media-ssai-preroll.m3u8"));
    await worker.text("https://usher.ttvnw.net/api/v2/channel/hls/channel.m3u8?token=PAGE_TOKEN&sig=PAGE_SIG");

    // a URL that is not in the master and does not match v1/playlist is not handled: no backup token request
    await worker.text("https://edge.playlist.ttvnw.net/v2/hls/other.m3u8");
    await Bun.sleep(5);
    expect(worker.twitch.callsOf("gql")).toEqual([]);

    // the variant of the player's master is handled: its ad playlist starts the backup token requests
    await worker.text(`${variant}?player_backend=mediaplayer`);
    await settle(() => worker.twitch.callsOf("gql").length === 2);
    expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.FRONTPAGE, StreamType.PICTURE]);
  });

  // T-105
  test("two concurrent ad polls make one token request per playerType and store one server each", async () => {
    const worker = setup();
    worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    await worker.text(USHER);

    await Promise.all([worker.text(MAIN), worker.text(MAIN)]);
    await settle(() => worker.player.currentStream().serverList.length === 2);
    await Bun.sleep(5);

    expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.FRONTPAGE, StreamType.PICTURE]);
    expect(worker.player.currentStream().serverList.map((s) => s.type)).toEqual([StreamType.FRONTPAGE, StreamType.PICTURE]);
  });

  // T-202: markers over live segments (the ad comes client-side): untouched, no backup lookup, no pause/play
  test("a MARKED_LIVE playlist comes out identical, with no token request and no pause/play", async () => {
    const worker = setup();
    const marked = fixture("m3u8/media-marked-live.m3u8");
    worker.twitch.mediaPlaylist(MAIN, marked);
    await worker.text(USHER);

    expect(await worker.text(MAIN)).toBe(marked);
    expect(await worker.text(MAIN)).toBe(marked);
    await Bun.sleep(5);

    expect(worker.twitch.callsOf("gql")).toEqual([]);
    expect(worker.posted.filter((m) => m.type === "pause" || m.type === "play")).toEqual([]);
  });

  // T-201: a backup with markers but only live segments is usable (seen during a midroll, B-028)
  test("ad break: a MARKED_LIVE backup replaces the playlist", async () => {
    const worker = setup();
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    const markedBackup = fixture("m3u8/media-marked-live.m3u8").replaceAll("/live-", "/backup-");
    worker.twitch.mediaPlaylist(MAIN, midroll);
    worker.twitch.mediaPlaylist(`${HOST}frontpage-chunked.m3u8`, markedBackup);
    await worker.text(USHER);
    worker.player.currentStream().setStreamAccess(masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.player.currentStream().createStreamAccess = async () => {};

    expect(await worker.text(MAIN)).toBe(markedBackup);
  });

  test("quality and integrity messages reach the player", () => {
    const worker = setup();
    worker.send("setQuality", "720p60");
    worker.send("setIntegrity", JSON.stringify({ token: "INTEGRITY" }));
    expect(worker.player.quality).toBe("720p60");
    expect(worker.player.integrityToken).toBe("INTEGRITY");
  });
});
