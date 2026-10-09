// Worker pipeline as it runs inside the Twitch player worker (bootstrapWorker on a fake scope), against FakeTwitch.
// Characterizes Purple 2.6.7: usher -> channel, media playlist -> ad check -> backup by playerType (E3, E4),
// merge by PROGRAM-DATE-TIME (E5), picture-by-picture capture (E10), pause/play on ad state changes (E6).
import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { Parser } from "m3u8-parser";
import { silenceConsole } from "../harness/console";
import { fixture } from "../harness/fixtures";
import { createWorkerScope, type WorkerHarness } from "../harness/worker-scope";
import { sigFor, tokenFor } from "../harness/fake-twitch";
import { StreamType } from "../../src/modules/stream/interface/stream.enum";
import { stripAdDateranges } from "../../src/modules/player/m3u8";

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

    // first poll: no backup yet, the ad playlist goes out with its lines (without the ad's DATERANGE lines, F-20) and
    // the tokens are requested
    const first = await worker.text(MAIN);
    expect(first).toBe(stripAdDateranges(midroll));
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

  // F-19 (T-409): the page asks for a picture-by-picture master 3 to 11 s before each stitched midroll (B-044)
  describe("prewarmed backups", () => {
    const PBYP = "https://usher.ttvnw.net/api/channel/hls/channel.m3u8?token=TOKEN-picture-by-picture&player_type=picture-by-picture";
    // through the setSettings message, with debug on so the events are posted
    const prewarm = (worker: WorkerHarness, on?: boolean) =>
      worker.send("setSettings", {
        debug: true,
        whitelist: [],
        toggleProxy: false,
        proxyUrl: "",
        backupPlayerTypes: [StreamType.SITE, StreamType.FRONTPAGE],
        lowQualityFallback: false,
        ...(on === undefined ? {} : { prewarmBackups: on }),
      });

    afterEach(() => setSystemTime());

    test("with prewarmBackups, the page's picture-by-picture request brings a token for every backup type", async () => {
      const worker = setup();
      prewarm(worker, true);
      worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE).master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
      await worker.text(USHER);
      expect(await (await worker.fetch(PBYP)).text()).toBe("");
      await settle(() => worker.twitch.callsOf("gql").length === 2);
      expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.SITE, StreamType.FRONTPAGE]);
      await settle(() => worker.player.currentStream().getStreamByStreamType(StreamType.FRONTPAGE).length === 1);
      expect(worker.player.currentStream().getStreamByStreamType(StreamType.FRONTPAGE)[0].urlList[0].url).toBe(FRONTPAGE);
      const events = worker.posted.filter((m) => m.type === "purpleEvent" && m.event.type === "backupsPrewarmed").map((m) => m.event);
      expect(events).toEqual([expect.objectContaining({ type: "backupsPrewarmed", count: 2 })]);
    });

    test("prewarmBackups false: no token request", async () => {
      const worker = setup();
      prewarm(worker, false);
      worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
      await worker.text(USHER);
      await worker.fetch(PBYP);
      await Bun.sleep(5);
      expect(worker.twitch.callsOf("gql")).toEqual([]);
    });

    // T-410: on by default since soak f (docs/findings/2026-10-08-prewarm-backups.md)
    test("without the setting, the tokens are asked (default on)", async () => {
      const worker = setup();
      prewarm(worker);
      worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
      await worker.text(USHER);
      await worker.fetch(PBYP);
      await settle(() => worker.twitch.callsOf("gql").length === 2);
      expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.SITE, StreamType.FRONTPAGE]);
    });

    // usher has no frontpage master here, so frontpage stays without one after each prewarm
    test("at most once a minute", async () => {
      const worker = setup();
      prewarm(worker, true);
      worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
      setSystemTime(new Date("2026-10-08T12:00:00Z"));
      await worker.text(USHER);
      await worker.fetch(PBYP);
      await worker.fetch(PBYP);
      await settle(() => worker.twitch.callsOf("gql").length === 2);
      await Bun.sleep(5);
      expect(worker.twitch.callsOf("gql")).toHaveLength(2);
      setSystemTime(new Date("2026-10-08T12:01:01Z"));
      await worker.fetch(PBYP);
      await settle(() => worker.twitch.callsOf("gql").length === 3);
      expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.SITE, StreamType.FRONTPAGE, StreamType.FRONTPAGE]);
    });

    // T-410: a type keeps its master until its backup fails or announces a break; only the others get a token
    test("only the backup types with no stored master get a token", async () => {
      const worker = setup();
      prewarm(worker, true);
      worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
      await worker.text(USHER);
      worker.player.currentStream().setStreamAccess(masterFor("frontpage-"), StreamType.FRONTPAGE);
      await worker.fetch(PBYP);
      await settle(() => worker.twitch.callsOf("gql").length === 1);
      await Bun.sleep(5);
      expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.SITE]);
      const events = worker.posted.filter((m) => m.type === "purpleEvent" && m.event.type === "backupsPrewarmed").map((m) => m.event);
      expect(events).toEqual([expect.objectContaining({ type: "backupsPrewarmed", count: 1 })]);
    });

    // T-812 (F-22): midrolls announced in the first seconds of a load came before any backup token was asked
    test("prewarmAtLoad: the page's usher request brings tokens for the backup types", async () => {
      const worker = setup();
      worker.send("setSettings", { debug: true, whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.SITE, StreamType.FRONTPAGE], lowQualityFallback: false, prewarmAtLoad: true });
      await worker.text(USHER);
      await settle(() => worker.twitch.callsOf("gql").length === 2);
      expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.SITE, StreamType.FRONTPAGE]);
    });

    // on by default since T-812's scheduled joins (docs/findings/2026-10-09-prewarm-at-load.md)
    test("without the setting, the usher request brings the tokens (default on)", async () => {
      const worker = createWorkerScope(undefined, { productDefaults: true });
      worker.twitch.master("channel", masterFor(""));
      prewarm(worker, true);
      await worker.text(USHER);
      await settle(() => worker.twitch.callsOf("gql").length === 2);
      expect(worker.twitch.callsOf("gql").map((c) => c.playerType)).toEqual([StreamType.SITE, StreamType.FRONTPAGE]);
    });

    test("prewarmAtLoad off: the usher request brings no token", async () => {
      const worker = setup();
      worker.send("setSettings", { debug: true, whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.SITE, StreamType.FRONTPAGE], lowQualityFallback: false, prewarmAtLoad: false });
      await worker.text(USHER);
      await Bun.sleep(5);
      expect(worker.twitch.callsOf("gql")).toEqual([]);
    });

    test("every backup type with a master: no token request and no event", async () => {
      const worker = setup();
      prewarm(worker, true);
      worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
      await worker.text(USHER);
      worker.player.currentStream().setStreamAccess(masterFor("site-"), StreamType.SITE);
      worker.player.currentStream().setStreamAccess(masterFor("frontpage-"), StreamType.FRONTPAGE);
      await worker.fetch(PBYP);
      await Bun.sleep(5);
      expect(worker.twitch.callsOf("gql")).toEqual([]);
      expect(worker.posted.filter((m) => m.type === "purpleEvent" && m.event.type === "backupsPrewarmed")).toEqual([]);
    });
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

  // T-402 (F-06): once the page offers its GQL bridge, backup token requests go through the page
  test("with the page's GQL bridge, backup token requests go to the page and its answers give the tokens", async () => {
    const worker = setup();
    twoTypes(worker);
    const clean = fixture("m3u8/backup-clean.m3u8");
    worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    worker.twitch.mediaPlaylist(FRONTPAGE, clean);
    worker.send("setGqlBridge", true);
    await worker.text(USHER);
    await worker.text(MAIN);
    const gqlRequests = () => worker.posted.filter((m) => m.type === "gqlRequest");
    await settle(() => gqlRequests().length === 2);

    expect(gqlRequests().map((r) => JSON.parse(r.body).variables.playerType)).toEqual([StreamType.FRONTPAGE, StreamType.PICTURE]);
    expect(gqlRequests()[0].headers).toMatchObject({ "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" });
    expect(worker.twitch.callsOf("gql")).toEqual([]);
    for (const request of gqlRequests()) {
      const type = JSON.parse(request.body).variables.playerType;
      const token = { data: { streamPlaybackAccessToken: { value: tokenFor(type), signature: sigFor(type), __typename: "PlaybackAccessToken" } } };
      worker.send("gqlResponse", { id: request.id, status: 200, body: JSON.stringify(token) });
    }
    await settle(() => worker.player.currentStream().serverList.length === 3);
    expect(await worker.text(MAIN)).toBe(clean);
    expect(worker.twitch.callsOf("usher").map((c) => new URL(c.url).searchParams.get("token"))).toEqual(["PAGE_TOKEN", tokenFor(StreamType.FRONTPAGE), tokenFor(StreamType.PICTURE)]);
  });

  // T-408 (F-12): with forcePopoutToken, parent_domains leaves the page's usher request, and so the backups' requests
  test("parent_domains is removed from the page's usher request and the backups' usher requests", async () => {
    const page = "https://usher.ttvnw.net/api/v2/channel/hls/channel.m3u8?parent_domains=example.com,other.example&token=PAGE_TOKEN&sig=PAGE_SIG&supported_codecs=avc1";
    const worker = setup();
    twoTypes(worker);
    worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    expect(await worker.text(page)).toBe(masterFor(""));
    await worker.text(MAIN);
    await settle(() => worker.twitch.callsOf("usher").length === 3);

    const usher = worker.twitch.callsOf("usher");
    expect(usher[0].url).toBe("https://usher.ttvnw.net/api/v2/channel/hls/channel.m3u8?token=PAGE_TOKEN&sig=PAGE_SIG&supported_codecs=avc1");
    expect(usher.map((call) => new URL(call.url).searchParams.has("parent_domains"))).toEqual([false, false, false]);
  });

  test("with forcePopoutToken off, parent_domains stays", async () => {
    const page = "https://usher.ttvnw.net/api/channel/hls/channel.m3u8?parent_domains=example.com&token=PAGE_TOKEN&sig=PAGE_SIG";
    const worker = setup();
    worker.player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", forcePopoutToken: false });
    await worker.text(page);
    expect(worker.twitch.callsOf("usher").map((c) => c.url)).toEqual([page]);
  });

  test("quality and integrity messages reach the player", () => {
    const worker = setup();
    worker.send("setQuality", "720p60");
    worker.send("setIntegrity", JSON.stringify({ token: "INTEGRITY" }));
    expect(worker.player.quality).toBe("720p60");
    expect(worker.player.integrityToken).toBe("INTEGRITY");
  });

  // T-601 (F-15): the page answers a reload; when it found no player, the worker pauses and plays instead
  test("reloadResult: a failed reload falls back to pause/play, a done one does not", () => {
    const worker = setup();
    worker.send("reloadResult", { ok: true });
    expect(worker.posted.filter((m) => m.type === "pause")).toEqual([]);
    worker.send("reloadResult", { ok: false });
    expect(worker.posted.filter((m) => m.type === "pause")).toEqual([{ type: "pause" }]);
  });

  test("with reloadAfterAd, the end of an ad break asks the page for a reload", async () => {
    const worker = setup();
    worker.player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", reloadAfterAd: true, backupPlayerTypes: [], lowQualityFallback: false });
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    await worker.text(USHER);
    await worker.text(MAIN);
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-live-ts.m3u8"));
    await worker.text(MAIN);
    expect(worker.posted.filter((m) => m.type === "pause" || m.type === "reload")).toEqual([{ type: "pause" }, { type: "reload" }]);
  });

  // T-809 (F-21): E6 at the break edges behind pausePlayOnBreaks (default on)
  const breakEdges = async (settings: Record<string, unknown>) => {
    const worker = setup();
    worker.player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [], lowQualityFallback: false, ...settings });
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    await worker.text(USHER);
    await worker.text(MAIN);
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-live-ts.m3u8"));
    await worker.text(MAIN);
    return worker.posted.filter((m) => m.type === "pause" || m.type === "play").map((m) => m.type);
  };

  test("pause and play at the start and the end of a break by default", async () => {
    expect(await breakEdges({})).toEqual(["pause", "play", "play", "pause", "play", "play"]);
  });

  test("pausePlayOnBreaks off: no pause or play at the break edges", async () => {
    expect(await breakEdges({ pausePlayOnBreaks: false })).toEqual([]);
  });

  test("pausePlayOnBreaks off: a failed reload still falls back to pause/play", () => {
    const worker = setup();
    worker.player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", pausePlayOnBreaks: false });
    worker.send("reloadResult", { ok: false });
    expect(worker.posted.filter((m) => m.type === "pause")).toEqual([{ type: "pause" }]);
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

  // T-802: a break that ended on the 360p picture-by-picture master started the next midroll on it
  test("picture-by-picture is never pinned", async () => {
    setSystemTime(T0);
    const worker = await breakWith({ popout: ads, "picture-by-picture": clean }, {}, midroll, midroll, live, midroll);
    await poll(worker);
    await servers(worker, 3);
    expect((await poll(worker)).text).toBe(clean); // popout has ads, picture-by-picture is clean
    await poll(worker); // live: the break is over
    await servers(worker, 3);

    setSystemTime(T0 + 6000);
    expect((await poll(worker)).media).toEqual(["chunked.m3u8", "popout-chunked.m3u8", "picture-by-picture-chunked.m3u8"]);
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
    // every line but the ad's DATERANGE lines (F-20, default on)
    expect(await worker.text(MAIN)).toBe(stripAdDateranges(preroll));
    await settle(() => worker.player.currentStream().serverList.length >= 3);
    expect(await worker.text(MAIN)).toBe(stripAdDateranges(preroll));

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
    const kept = announced.split("\n").filter((l) => !l.includes("/ad-3009.ts") && !l.includes("/ad-3010.ts")).join("\n");
    expect(delivered).toBe(stripAdDateranges(kept));
    expect((await (await worker.fetch(AD_PREFETCH)).arrayBuffer()).byteLength).toBe(1137);
    expect(worker.twitch.calls.filter((c) => c.url === AD_PREFETCH)).toEqual([]);
    expect(blankEvents(worker)).toEqual([2]);
    await Bun.sleep(5);
    expect(worker.twitch.callsOf("gql")).toEqual([]);
    expect(worker.posted.filter((m) => m.type === "pause" || m.type === "play")).toEqual([]);
  });

  // T-811 (F-20): the page's ad UI started on breaks whose ad segments reached the player with their DATERANGE lines
  const adDateranges = (text: string) => text.split("\n").filter((l) => l.includes('CLASS="twitch-stitched-ad"') || l.includes('CLASS="twitch-ad-quartile"'));

  test("stripAdMarkers: blanked ad segments come without the ad's DATERANGE lines; the other lines stay", async () => {
    const worker = await prerollEverywhere({ stripAdMarkers: true });
    const delivered = await worker.text(MAIN);
    expect(adDateranges(preroll)).toHaveLength(2);
    expect(adDateranges(delivered)).toEqual([]);
    expect(delivered.split("\n")).toEqual(preroll.split("\n").filter((l) => !adDateranges(preroll).includes(l)));
    expect((await (await worker.fetch(AD)).arrayBuffer()).byteLength).toBe(1137);
  });

  test("stripAdMarkers: an announced break loses its prefetch lines to ad segments and the ad's DATERANGE lines", async () => {
    const announced = fixture("m3u8/backup-announced-break.m3u8");
    const worker = setup();
    worker.twitch.mediaPlaylist(MAIN, announced);
    worker.send("setSettings", { whitelist: [], toggleProxy: false, proxyUrl: "", stripAdMarkers: true });
    await worker.text(USHER);
    const delivered = await worker.text(MAIN);
    expect(adDateranges(delivered)).toEqual([]);
    expect(delivered).not.toContain("/ad-3009.ts");
    expect(delivered).toContain('CLASS="twitch-session"');
  });

  // on by default since T-811's joins (docs/findings/2026-10-08-ad-ui-on-early-breaks.md)
  test("without the setting the ad's DATERANGE lines go (default on)", async () => {
    const worker = await prerollEverywhere();
    expect(adDateranges(await worker.text(MAIN))).toEqual([]);
  });

  test("stripAdMarkers off: the ad's DATERANGE lines stay", async () => {
    const worker = await prerollEverywhere({ stripAdMarkers: false });
    expect(adDateranges(await worker.text(MAIN))).toHaveLength(2);
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

// F-23 (T-817): each token's playlist numbers the stream from its own base, and the page's moves ahead of the backups'
// at each stitched midroll it gets (B-054); the player asks for the number after the last segment it fetched
describe("backup sequence numbers", () => {
  const SEGMENTS = "https://edge.j.cloudfront.hls.ttvnw.net/v1/segment/";
  const T0 = Date.parse("2026-10-09T02:46:00.910Z");
  const PAGE_BASE = T0 - 100 * 2000; // the page's playlist: segment 100 at T0
  const OLD_BASE = PAGE_BASE + 3000; // a backup asked before the page's last midrolls: the same moment 1.5 segments lower

  // `count` 2 s segments from `first`, segment n at `base` + n x 2 s; `ads`: indexes with an ad title; prefetch URIs after
  const playlist = (prefix: string, first: number, count: number, base: number, { ads = [] as number[], prefetch = 2 } = {}) => {
    const lines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", `#EXT-X-MEDIA-SEQUENCE:${first}`, `#EXT-X-TWITCH-LIVE-SEQUENCE:${first}`];
    for (let i = 0; i < count; i++) {
      const n = first + i;
      lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(base + n * 2000).toISOString()}`, `#EXTINF:2.000,${ads.includes(i) ? "Amazon|AD_ID" : "live"}`, `${SEGMENTS}${prefix}-${n}.ts`);
    }
    for (let p = 1; p <= prefetch; p++) lines.push(`#EXT-X-TWITCH-PREFETCH:${SEGMENTS}${prefix}-${first + count - 1 + p}.ts`);
    return lines.join("\n");
  };
  // the last number the player can fetch from a playlist: MEDIA-SEQUENCE + segments + prefetch URIs - 1
  const newest = (text: string) =>
    Number(/#EXT-X-MEDIA-SEQUENCE:(\d+)/.exec(text)![1]) + (text.match(/^#EXTINF:/gm) ?? []).length + (text.match(/^#EXT-X-TWITCH-PREFETCH:/gm) ?? []).length - 1;
  const mediaSequence = (text: string) => Number(/#EXT-X-MEDIA-SEQUENCE:(\d+)/.exec(text)![1]);
  const otherLines = (text: string) => text.split("\n").filter((line) => !line.startsWith("#EXT-X-MEDIA-SEQUENCE:"));

  // the page's polls in order, the frontpage backup's polls (one per poll with ads); the playlists the player got
  const polls = async (settings: Record<string, unknown>, main: string[], backup: string[]) => {
    const worker = setup();
    worker.player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false, ...settings });
    worker.twitch.mediaPlaylist(MAIN, ...main);
    worker.twitch.mediaPlaylist(FRONTPAGE, ...backup);
    await worker.text(USHER);
    worker.player.currentStream().setStreamAccess(masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.player.currentStream().createStreamAccess = async () => {};
    const out: string[] = [];
    for (let i = 0; i < main.length; i++) out.push(await worker.text(MAIN));
    return out;
  };

  const free = playlist("live", 100, 14, PAGE_BASE); // newest 113 at T0 + 26 s, prefetch 114 and 115
  const withAds = playlist("live", 101, 16, PAGE_BASE, { ads: [14, 15], prefetch: 0 }); // live up to 114, ads 115 and 116
  const lowerBackup = playlist("backup", 100, 14, OLD_BASE); // 113 at T0 + 29 s, prefetch 114 and 115

  test("alignBackupSequence: a backup that numbers the same moment lower gets the page's numbers, past the player's last", async () => {
    const [first, second] = await polls({ alignBackupSequence: true }, [free, withAds], [lowerBackup]);

    expect(first).toBe(free);
    // 113 starts 1.5 page segments after the page's 113: it gets 115, so the player's next number, 116, is the segment
    // after the end of what it fetched
    expect(mediaSequence(second)).toBe(102);
    expect(newest(second)).toBeGreaterThan(newest(free));
    expect(otherLines(second)).toEqual(otherLines(lowerBackup));
  });

  test("alignBackupSequence off: the backup comes out as Twitch sent it, with nothing past the player's last number", async () => {
    const [, second] = await polls({ alignBackupSequence: false }, [free, withAds], [lowerBackup]);

    expect(second).toBe(lowerBackup);
    expect(newest(second)).toBe(newest(free));
  });

  test("alignBackupSequence: a backup numbered like the page's playlist comes out unchanged", async () => {
    const sameBackup = playlist("backup", 101, 14, PAGE_BASE);
    const [, second] = await polls({ alignBackupSequence: true }, [free, withAds], [sameBackup]);

    expect(second).toBe(sameBackup);
  });

  test("alignBackupSequence: a poll with ads does not move the reference the last poll without ads set", async () => {
    // the page's playlist inside the break, its live segments 3 s earlier for the same numbers: from it the shift would be 3
    const drifted = playlist("live", 101, 16, PAGE_BASE - 3000, { ads: [14, 15], prefetch: 0 });
    const [, second, third] = await polls({ alignBackupSequence: true }, [free, drifted, drifted], [lowerBackup, playlist("backup", 101, 14, OLD_BASE)]);

    expect(mediaSequence(second)).toBe(102);
    expect(mediaSequence(third)).toBe(103);
  });

  test("alignBackupSequence: with no poll without ads before the break, the live segments before the ads are the reference", async () => {
    const [first] = await polls({ alignBackupSequence: true }, [withAds], [lowerBackup]);

    // 114 at T0 + 28 s on the page; the backup's 113 at T0 + 29 s starts half a segment later
    expect(mediaSequence(first)).toBe(102);
  });

  test("alignBackupSequence: the page's playlist after a break comes out untouched, and the next break takes its numbering", async () => {
    // after the first break the page numbers the same moment 1 segment higher (B-054): base 2 s earlier
    const after = playlist("live", 120, 14, PAGE_BASE - 2000);
    const nextAds = playlist("live", 121, 16, PAGE_BASE - 2000, { ads: [14, 15], prefetch: 0 });
    const out = await polls({ alignBackupSequence: true }, [free, withAds, after, nextAds], [lowerBackup, playlist("backup", 120, 14, OLD_BASE)]);

    expect(mediaSequence(out[1])).toBe(102);
    expect(out[2]).toBe(after);
    // 133 at T0 + 69 s on the backup; on the page 133 is at T0 + 64 s: 2.5 segments later, so 3
    expect(mediaSequence(out[3])).toBe(123);
  });
});
