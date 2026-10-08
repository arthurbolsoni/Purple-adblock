// Worker pipeline as it runs inside the Twitch player worker (bootstrapWorker on a fake scope), against FakeTwitch.
// Characterizes Purple 2.6.7: usher -> channel, media playlist -> ad check -> backup by playerType (E3, E4),
// merge by PROGRAM-DATE-TIME (E5), picture-by-picture capture (E10), pause/play on ad state changes (E6).
import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { Parser } from "m3u8-parser";
import { silenceConsole } from "../harness/console";
import { fixture } from "../harness/fixtures";
import { createWorkerScope, type WorkerHarness } from "../harness/worker-scope";
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

// The 2.6.7 chain (frontpage, then picture-by-picture), for tests about the mechanics rather than the type list (T-405)
const twoTypes = (worker: ReturnType<typeof createWorkerScope>) =>
  worker.player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE, StreamType.PICTURE], lowQualityFallback: false });

describe("worker pipeline", () => {
  test("bootstrapping registers the routes and asks the page for settings", () => {
    const worker = setup();
    expect(worker.router.routes.map((r) => (typeof r.match === "string" ? r.match : r.propertyKey === "onBlankSegment" ? "ad URI answered blank" : "variant of the player's master"))).toEqual([
      "ad URI answered blank",
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
    twoTypes(worker);
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

  // T-602: the worker keeps the value of setSettings (C-10): the setting's backup list and whitelist apply
  test("settings sent by the page apply: the backup list on this break, the whitelist from the next poll", async () => {
    const worker = setup();
    const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
    const clean = fixture("m3u8/backup-clean.m3u8");
    worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(MAIN, midroll);
    worker.twitch.mediaPlaylist(FRONTPAGE, clean);
    const settings = { whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE, StreamType.PICTURE], lowQualityFallback: false };
    worker.send("setSettings", settings);
    await worker.text(USHER);

    await worker.text(MAIN);
    await settle(() => worker.player.currentStream().serverList.length === 2);
    expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.FRONTPAGE, StreamType.PICTURE]);
    expect(await worker.text(MAIN)).toBe(clean);

    // the channel is added to the whitelist mid-session: the next poll gets Twitch's playlist, no backup is fetched
    worker.send("setSettings", { ...settings, whitelist: ["channel"] });
    expect(worker.player.isWhitelist()).toBe(true);
    const media = worker.twitch.callsOf("media").length;
    expect(await worker.text(MAIN)).toBe(midroll);
    expect(worker.twitch.callsOf("media").length).toBe(media + 1);
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
    twoTypes(worker);
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
    twoTypes(worker);
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

  // T-201, T-204: a backup with a twitch-maf-ad marker over live segments is usable (B-032)
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

  // T-401 (F-05): backup token requests carry the headers of the page's GQL requests; the newest integrity token wins
  test("backup token requests carry the page's GQL headers", async () => {
    const worker = setup();
    twoTypes(worker);
    worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    worker.send("setIntegrity", JSON.stringify({ token: "INTEGRITY" }));
    const page = { "Client-Integrity": "PAGE_INTEGRITY", "X-Device-Id": "DEVICE_ID", Authorization: "OAuth OAUTH", "Client-Version": "CLIENT_VERSION", "Client-Session-Id": "SESSION_ID" };
    worker.send("setGqlHeaders", page);
    await worker.text(USHER);
    await worker.text(MAIN);
    await settle(() => worker.twitch.callsOf("gql").length === 2);

    const gql = worker.twitch.callsOf("gql");
    expect(gql).toHaveLength(2);
    for (const call of gql) {
      expect(call.headers).toMatchObject({
        "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
        "client-integrity": "PAGE_INTEGRITY",
        "x-device-id": "DEVICE_ID",
        authorization: "OAuth OAUTH",
        "client-version": "CLIENT_VERSION",
        "client-session-id": "SESSION_ID",
      });
    }
    expect(worker.player.integrityToken).toBe("PAGE_INTEGRITY");
  });

  test("quality and integrity messages reach the player", () => {
    const worker = setup();
    worker.send("setQuality", "720p60");
    worker.send("setIntegrity", JSON.stringify({ token: "INTEGRITY" }));
    expect(worker.player.quality).toBe("720p60");
    expect(worker.player.integrityToken).toBe("INTEGRITY");
  });
});

// T-405: the backup chain walks the player types of F-09; autoplay (platform android) only with lowQualityFallback
describe("backup player types", () => {
  const DEFAULT_ORDER = ["site", "popout", "frontpage", "picture-by-picture", "mobile_web", "embed", "autoplay"];

  const breakWith = (backups: Record<string, string | null>, main = fixture("m3u8/media-ssai-midroll.m3u8")) => {
    const worker = createWorkerScope();
    worker.twitch.master("channel", masterFor(""));
    worker.twitch.mediaPlaylist(MAIN, main);
    for (const [type, playlist] of Object.entries(backups)) {
      if (type === "site") continue; // the page's master: its variant is MAIN, which has the ad
      worker.twitch.master("channel", masterFor(`${type}-`), type);
      if (playlist) worker.twitch.mediaPlaylist(`${HOST}${type}-chunked.m3u8`, playlist);
    }
    return worker;
  };

  test("the first poll requests a token for every type, in the F-09 order, autoplay with platform android", async () => {
    const worker = breakWith({});
    await worker.text(USHER);
    await worker.text(MAIN);
    await settle(() => worker.twitch.callsOf("gql").length === DEFAULT_ORDER.length);

    const gql = worker.twitch.callsOf("gql");
    expect(gql.map((c) => c.playerType)).toEqual(DEFAULT_ORDER);
    const platforms = gql.map((c) => JSON.parse(c.body!).variables.platform);
    expect(platforms).toEqual(["web", "web", "web", "web", "web", "web", "android"]);
  });

  test("site with ads and popout clean: the popout playlist replaces the main one", async () => {
    const clean = fixture("m3u8/backup-clean.m3u8");
    const worker = breakWith({ site: null, popout: clean, frontpage: clean });
    await worker.text(USHER);
    await worker.text(MAIN);
    await settle(() => worker.player.currentStream().serverList.length >= 3);

    expect(await worker.text(MAIN)).toBe(clean);
    const media = worker.twitch.callsOf("media").map((c) => c.url.replace(HOST, ""));
    expect(media.slice(2)).toEqual(["chunked.m3u8", "popout-chunked.m3u8"]);
  });

  // T-203: breaks whose segments carry no title or URI marker (B-035)
  test.each(["media-midroll-numeric.m3u8", "media-preroll-ft.m3u8"])("%s: the popout backup replaces the main playlist", async (name) => {
    const clean = fixture("m3u8/backup-clean.m3u8");
    const worker = breakWith({ site: null, popout: clean }, fixture(`m3u8/${name}`));
    await worker.text(USHER);
    await worker.text(MAIN);
    await settle(() => worker.player.currentStream().serverList.length >= 2);

    expect(await worker.text(MAIN)).toBe(clean);
  });

  // T-204: a backup that announces its own break (B-034, B-036) is not clean: the next type is tried
  test("popout announcing its own break and frontpage clean: the frontpage playlist replaces the main one", async () => {
    const clean = fixture("m3u8/backup-clean.m3u8");
    const worker = breakWith({ site: null, popout: fixture("m3u8/backup-announced-break.m3u8"), frontpage: clean });
    await worker.text(USHER);
    await worker.text(MAIN);
    await settle(() => worker.player.currentStream().serverList.length >= 3);

    expect(await worker.text(MAIN)).toBe(clean);
    const media = worker.twitch.callsOf("media").map((c) => c.url.replace(HOST, ""));
    expect(media.slice(2)).toEqual(["chunked.m3u8", "popout-chunked.m3u8", "frontpage-chunked.m3u8"]);
  });

  test("every backup announcing its own break: their live segments replace the ads, their announcement stays out", async () => {
    const announced = fixture("m3u8/backup-announced-break.m3u8");
    const main = fixture("m3u8/media-ssai-midroll.m3u8");
    const worker = breakWith({ site: null, popout: announced, frontpage: announced });
    await worker.text(USHER);
    await worker.text(MAIN);
    await settle(() => worker.player.currentStream().serverList.length >= 3);

    const delivered = await worker.text(MAIN);
    expect(uris(delivered)).toEqual(["live-2000.ts", "live-2001.ts", "live-2002.ts", "backup-3003.ts", "backup-3004.ts", "backup-3005.ts", "live-2006.ts", "live-2007.ts"]);
    // the only lines not taken from the main playlist are the three backup URIs
    expect(delivered.split("\n").filter((line) => !main.includes(line))).toEqual([3003, 3004, 3005].map((n) => `https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-${n}.ts`));
  });

  test("without lowQualityFallback, autoplay is not requested", async () => {
    const worker = breakWith({});
    await worker.text(USHER);
    worker.player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", lowQualityFallback: false } as any);
    await worker.text(MAIN);
    await settle(() => worker.twitch.callsOf("gql").length === DEFAULT_ORDER.length - 1);
    await Bun.sleep(5);

    expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual(DEFAULT_ORDER.slice(0, -1));
  });
});

// T-406 (F-10): the type that gave the last clean backup is tried first (never autoplay); a type that returned ads,
// or announced its own break, is skipped for 5 s. site is left out: its backup is the main playlist's own URL.
describe("pinned and contaminated backup types", () => {
  const clean = fixture("m3u8/backup-clean.m3u8");
  const ads = fixture("m3u8/backup-ads.m3u8");
  const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
  const live = fixture("m3u8/media-live-ts.m3u8");
  const T0 = new Date("2026-10-08T12:00:00.000Z").getTime();

  afterEach(() => setSystemTime());

  const breakWith = async (backups: Record<string, string>, settings: Record<string, unknown>, ...main: string[]) => {
    const worker = createWorkerScope();
    worker.twitch.master("channel", masterFor(""));
    worker.twitch.mediaPlaylist(MAIN, ...main);
    for (const [type, playlist] of Object.entries(backups)) {
      worker.twitch.master("channel", masterFor(`${type}-`), type);
      worker.twitch.mediaPlaylist(`${HOST}${type}-chunked.m3u8`, playlist);
    }
    await worker.text(USHER);
    worker.player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: Object.keys(backups), lowQualityFallback: false, ...settings });
    return worker;
  };
  // media playlists fetched by one poll, without the host
  const poll = async (worker: Awaited<ReturnType<typeof breakWith>>) => {
    const before = worker.twitch.callsOf("media").length;
    const text = await worker.text(MAIN);
    return { text, media: worker.twitch.callsOf("media").slice(before).map((c) => c.url.replace(HOST, "")) };
  };
  const servers = (worker: Awaited<ReturnType<typeof breakWith>>, n: number) => settle(() => worker.player.currentStream().serverList.length >= n);

  test.each([
    [true, ["chunked.m3u8", "frontpage-chunked.m3u8"]],
    [false, ["chunked.m3u8", "popout-chunked.m3u8", "frontpage-chunked.m3u8"]],
  ])("pinBackupPlayerType %p: order on the next break", async (pin, expected) => {
    setSystemTime(T0);
    const worker = await breakWith({ popout: ads, frontpage: clean }, { pinBackupPlayerType: pin }, midroll, midroll, live, midroll);
    await poll(worker); // tokens requested
    await servers(worker, 3);
    expect((await poll(worker)).text).toBe(clean); // popout has ads, frontpage is clean
    await poll(worker); // live: the break is over
    await servers(worker, 3);

    setSystemTime(T0 + 6000); // popout is no longer skipped
    const next = await poll(worker);
    expect(next.text).toBe(clean);
    expect(next.media).toEqual(expected);
  });

  test("autoplay is never pinned", async () => {
    setSystemTime(T0);
    const worker = await breakWith({ popout: ads }, { lowQualityFallback: true }, midroll);
    worker.twitch.master("channel", masterFor("autoplay-"), "autoplay");
    worker.twitch.mediaPlaylist(`${HOST}autoplay-chunked.m3u8`, clean);
    await poll(worker);
    await servers(worker, 3);
    expect((await poll(worker)).text).toBe(clean); // popout has ads, autoplay is clean
    await servers(worker, 3);

    setSystemTime(T0 + 6000);
    expect((await poll(worker)).media).toEqual(["chunked.m3u8", "popout-chunked.m3u8", "autoplay-chunked.m3u8"]);
  });

  test("a type that returned ads is skipped for 5 s, with no new token, then tried again", async () => {
    setSystemTime(T0);
    const worker = await breakWith({ popout: ads, frontpage: fixture("m3u8/backup-announced-break.m3u8") }, {}, midroll);
    await poll(worker);
    await servers(worker, 3);
    expect((await poll(worker)).media).toEqual(["chunked.m3u8", "popout-chunked.m3u8", "frontpage-chunked.m3u8"]);
    await servers(worker, 3);
    const tokens = worker.twitch.callsOf("gql").length;

    setSystemTime(T0 + 3000);
    const skipped = await poll(worker);
    expect(skipped.media).toEqual(["chunked.m3u8"]);
    await Bun.sleep(5);
    expect(worker.twitch.callsOf("gql").length).toBe(tokens);

    setSystemTime(T0 + 5001);
    expect((await poll(worker)).media).toEqual(["chunked.m3u8", "popout-chunked.m3u8", "frontpage-chunked.m3u8"]);
  });
});

// T-502 (F-14): ad segments no backup replaced stay in the playlist; the worker answers their requests with the blank
// segment (BLANK_MP4), so Twitch never gets them
describe("blank segments", () => {
  const preroll = fixture("m3u8/media-ssai-preroll.m3u8");
  const AD = "https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/adsquared/ad-1000.ts";
  const T0 = new Date("2026-10-08T12:00:00.000Z").getTime();

  afterEach(() => setSystemTime());

  // the main playlist and both backups each inside their own preroll: no live segment to merge
  const prerollEverywhere = async (settings: Record<string, unknown> = {}) => {
    const worker = setup();
    worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(MAIN, preroll);
    worker.twitch.mediaPlaylist(FRONTPAGE, preroll.replaceAll("/adsquared/ad-", "/adsquared/fp-"));
    worker.twitch.mediaPlaylist(PICTURE, preroll.replaceAll("/adsquared/ad-", "/adsquared/pp-"));
    const backupPlayerTypes = [StreamType.FRONTPAGE, StreamType.PICTURE];
    worker.send("setSettings", { whitelist: [], toggleProxy: false, proxyUrl: "", debug: true, backupPlayerTypes, lowQualityFallback: false, ...settings });
    await worker.text(USHER);
    return worker;
  };
  const blankEvents = (worker: WorkerHarness) => worker.posted.filter((m) => m.type === "purpleEvent" && m.event.type === "blankInserted").map((m) => m.event.count);
  const adRequests = (worker: WorkerHarness) => worker.twitch.calls.filter((c) => c.url === AD);

  test("every backup in its own preroll: the playlist keeps its lines, the ad URIs get the blank segment, Twitch gets none", async () => {
    const worker = await prerollEverywhere();
    expect(await worker.text(MAIN)).toBe(preroll);
    await settle(() => worker.player.currentStream().serverList.length >= 3);
    expect(await worker.text(MAIN)).toBe(preroll);

    const response = await worker.fetch(AD);
    expect((await response.arrayBuffer()).byteLength).toBe(1137);
    expect(adRequests(worker)).toEqual([]);
    expect(blankEvents(worker)).toEqual([6]);
  });

  // a main playlist announcing its break (B-034) is MARKED_LIVE (T-202), but its last prefetch lines point at the first
  // ad segments: on twitch.tv the player fetched them before the first poll with ad segments
  // (docs/findings/2026-10-08-page-gql-headers.md)
  test("an announced break: its prefetch lines to ad segments go and are answered blank; no backup lookup, no pause/play", async () => {
    const announced = fixture("m3u8/backup-announced-break.m3u8");
    const AD_PREFETCH = "https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/ad-3009.ts";
    const worker = setup();
    worker.twitch.mediaPlaylist(MAIN, announced);
    worker.send("setSettings", { whitelist: [], toggleProxy: false, proxyUrl: "", debug: true });
    await worker.text(USHER);

    const delivered = await worker.text(MAIN);
    expect(delivered.split("\n")).toEqual(announced.split("\n").filter((l) => !l.includes("/ad-3009.ts") && !l.includes("/ad-3010.ts")));
    expect((await (await worker.fetch(AD_PREFETCH)).arrayBuffer()).byteLength).toBe(1137);
    expect(worker.twitch.calls.filter((c) => c.url === AD_PREFETCH)).toEqual([]);
    expect(blankEvents(worker)).toEqual([2]);
    await Bun.sleep(5);
    expect(worker.twitch.callsOf("gql")).toEqual([]);
    expect(worker.posted.filter((m) => m.type === "pause" || m.type === "play")).toEqual([]);
  });

  test("stripFallback off: an announced break comes out identical", async () => {
    const announced = fixture("m3u8/backup-announced-break.m3u8");
    const worker = setup();
    worker.twitch.mediaPlaylist(MAIN, announced);
    worker.send("setSettings", { whitelist: [], toggleProxy: false, proxyUrl: "", stripFallback: false });
    await worker.text(USHER);
    expect(await worker.text(MAIN)).toBe(announced);
  });

  test("stripFallback off: the ad segments are requested from Twitch", async () => {
    const worker = await prerollEverywhere({ stripFallback: false });
    await worker.text(MAIN);
    await worker.fetch(AD);
    expect(adRequests(worker)).toHaveLength(1);
    expect(blankEvents(worker)).toEqual([]);
  });

  test("an ad URI is answered blank until 120 s after the last poll that listed it", async () => {
    setSystemTime(T0);
    const worker = await prerollEverywhere();
    await worker.text(MAIN);

    setSystemTime(T0 + 119_000);
    expect((await (await worker.fetch(AD)).arrayBuffer()).byteLength).toBe(1137);
    setSystemTime(T0 + 121_000);
    await worker.fetch(AD);
    expect(adRequests(worker)).toHaveLength(1);
  });
});

// T-407 (F-11): the backup variant follows the variant the player polls: same quality and codec family
describe("backup variant", () => {
  const EDGE = "https://edge.playlist.ttvnw.net/v1/playlist/";
  const mixed = (prefix: string) => fixture("m3u8/master-hevc.m3u8").replaceAll(EDGE, EDGE + prefix);

  test("a player on the AVC 1080p60 variant gets the backup's AVC 1080p60, not its HEVC source or its AV1 1080p60", async () => {
    const worker = createWorkerScope();
    worker.twitch.master("channel", mixed(""));
    worker.twitch.master("channel", mixed("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.mediaPlaylist(`${EDGE}1080p60.m3u8`, fixture("m3u8/media-ssai-midroll.m3u8"));
    const clean = fixture("m3u8/backup-clean.m3u8");
    for (const variant of ["chunked", "1080p60_av1", "1080p60", "720p60"]) worker.twitch.mediaPlaylist(`${EDGE}frontpage-${variant}.m3u8`, clean);
    await worker.text(USHER);
    worker.send("setSettings", { whitelist: [], toggleProxy: false, proxyUrl: "", debug: true, backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false });

    await worker.text(`${EDGE}1080p60.m3u8`);
    await settle(() => worker.player.currentStream().serverList.length >= 2);
    expect(await worker.text(`${EDGE}1080p60.m3u8`)).toBe(clean);
    const backups = worker.twitch.callsOf("media").map((c) => c.url.replace(EDGE, "")).filter((url) => url.startsWith("frontpage-"));
    expect(backups).toEqual(["frontpage-1080p60.m3u8"]);
    // the backupUsed debug event names the variant's quality
    const used = worker.posted.filter((m) => m.type === "purpleEvent" && m.event.type === "backupUsed").map((m) => m.event);
    expect(used).toMatchObject([{ playerType: StreamType.FRONTPAGE, quality: "1080p60" }]);
  });
});

// T-404 (F-08): backup usher requests reuse the page's usher request: its path and parameters, new token, sig and p
describe("backup usher request", () => {
  test("after a v2 usher request, backups use the v2 path with the page's parameters", async () => {
    const page = "https://usher.ttvnw.net/api/v2/channel/hls/channel.m3u8?supported_codecs=av1,h265,h264&play_session_id=PLAY_SESSION_ID&p=1&token=PAGE_TOKEN&sig=PAGE_SIG";
    const worker = setup();
    twoTypes(worker);
    worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    await worker.text(page);
    await worker.text(MAIN);
    await settle(() => worker.twitch.callsOf("usher").length === 3);

    const backups = worker.twitch.callsOf("usher").slice(1).map((c) => new URL(c.url));
    expect(backups.map((u) => u.pathname)).toEqual(["/api/v2/channel/hls/channel.m3u8", "/api/v2/channel/hls/channel.m3u8"]);
    expect(backups.map((u) => u.searchParams.get("token"))).toEqual(["TOKEN-frontpage", "TOKEN-picture-by-picture"]);
    for (const u of backups) {
      expect(u.searchParams.get("supported_codecs")).toBe("av1,h265,h264");
      expect(u.searchParams.get("play_session_id")).toBe("PLAY_SESSION_ID");
      expect(u.searchParams.get("p")).not.toBe("1");
    }
  });
});
