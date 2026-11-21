// F-31 (T-606): what the worker gives the page's diagnostic log: channelLoaded at the usher request, adPassed for ad
// segments the player gets as ads (each once), error with the exception's name only when the controller falls back to
// Twitch's response, and the kind of a break on its adState.
import { describe, expect, spyOn, test } from "bun:test";
import { silenceConsole } from "../harness/console";
import { fixture } from "../harness/fixtures";
import { createWorkerScope, type WorkerHarness } from "../harness/worker-scope";
import { detectAds } from "../../src/modules/player/ad-detector";
import { Player } from "../../src/modules/player/player";
import { StreamType } from "../../src/modules/stream/interface/stream.enum";

silenceConsole();

const HOST = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/";
const USHER = "https://usher.ttvnw.net/api/channel/hls/channel.m3u8?token=PAGE_TOKEN&sig=PAGE_SIG";
const MAIN = `${HOST}chunked.m3u8`;
const masterFor = (prefix: string) => fixture("m3u8/master-video-weaver.m3u8").replaceAll(HOST, HOST + prefix);
const midroll = fixture("m3u8/media-ssai-midroll.m3u8");
const AD_SEGMENTS = detectAds(midroll).adSegments.length;

const events = (worker: WorkerHarness, type?: string) =>
  worker.posted.filter((m) => m.type === "purpleEvent" && (!type || m.event.type === type)).map((m) => m.event);

// a channel whose backups never come (no master for any backup type): every ad segment is left to the fallback
const noBackups = (settings: Record<string, unknown> = {}) => {
  const worker = createWorkerScope();
  worker.twitch.master("channel", masterFor(""));
  worker.twitch.mediaPlaylist(MAIN, midroll);
  worker.send("setSettings", { whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false, ...settings });
  return worker;
};

describe("channelLoaded", () => {
  test("the usher request of a channel posts it, with the channel", async () => {
    const worker = noBackups();
    await worker.text(USHER);
    expect(events(worker, "channelLoaded")).toEqual([expect.objectContaining({ type: "channelLoaded", channel: "channel" })]);
  });
});

describe("adPassed", () => {
  test("stripFallback off: the ad segments no backup replaced are counted once each, across polls", async () => {
    const worker = noBackups({ stripFallback: false });
    await worker.text(USHER);

    expect(await worker.text(MAIN)).toContain("/adsquared/ad-2003.ts");
    await worker.text(MAIN);

    expect(events(worker, "adPassed").map((e) => [e.channel, e.count])).toEqual([["channel", AD_SEGMENTS]]);
  });

  test("stripFallback off: a new ad segment in a later poll is counted alone", async () => {
    const worker = noBackups({ stripFallback: false });
    await worker.text(USHER);
    await worker.text(MAIN);
    const later = midroll.replace(
      "#EXTINF:2.000,Amazon|AD_ID\nhttps://edge.j.cloudfront.hls.ttvnw.net/v1/segment/adsquared/ad-2003.ts",
      "#EXTINF:2.000,Amazon|AD_ID\nhttps://edge.j.cloudfront.hls.ttvnw.net/v1/segment/adsquared/ad-2103.ts",
    );
    worker.twitch.mediaPlaylist(MAIN, later);
    await worker.text(MAIN);

    expect(events(worker, "adPassed").map((e) => e.count)).toEqual([AD_SEGMENTS, 1]);
  });

  test("stripFallback on (default): the ad segments are answered blank, nothing passes", async () => {
    const worker = noBackups();
    await worker.text(USHER);
    await worker.text(MAIN);
    expect(events(worker, "blankInserted").map((e) => e.count)).toEqual([AD_SEGMENTS]);
    expect(events(worker, "adPassed")).toEqual([]);
  });

  test("a media playlist before the usher reaches the player as Twitch sent it: its ad segments passed", async () => {
    const worker = noBackups();
    expect(await worker.text(MAIN)).toBe(midroll);
    expect(events(worker, "adPassed").map((e) => [e.channel, e.count])).toEqual([["", AD_SEGMENTS]]);
  });

  test("segments replaced by a backup are not counted, though the ad's DATERANGE still covers them", async () => {
    const worker = createWorkerScope();
    worker.twitch.master("channel", masterFor(""));
    worker.twitch.mediaPlaylist(MAIN, midroll);
    // the frontpage backup has an ad segment too, so its live segments replace the main ones by time (merge, E5)
    const markedBackup = fixture("m3u8/backup-clean.m3u8").replace(
      "#EXTINF:2.000,live\nhttps://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3000.ts",
      "#EXTINF:2.000,Amazon|AD_ID\nhttps://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3000.ts",
    );
    worker.twitch.mediaPlaylist(`${HOST}frontpage-chunked.m3u8`, markedBackup);
    worker.send("setSettings", { whitelist: [], stripFallback: false, backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false });
    await worker.text(USHER);
    worker.player.currentStream().setStreamAccess(masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.player.currentStream().createStreamAccess = async () => {};

    await worker.text(MAIN);

    expect(events(worker, "segmentsReplaced").map((e) => e.count)).toEqual([3]);
    expect(events(worker, "adPassed")).toEqual([]);
  });

  test("a whitelisted channel's ads are not counted", async () => {
    const worker = noBackups({ whitelist: ["channel"] });
    await worker.text(USHER);
    await worker.text(MAIN);
    expect(events(worker, "whitelisted")).toHaveLength(1);
    expect(events(worker, "adPassed")).toEqual([]);
  });

  test("with diagnostics off nothing is counted or posted", async () => {
    const worker = noBackups({ stripFallback: false, diagnostics: false });
    await worker.text(USHER);
    await worker.text(MAIN);
    expect(events(worker)).toEqual([]);
  });
});

describe("error", () => {
  test("the playlist fallback: Twitch's playlist, an error with the exception's name only, and its ad segments passed", async () => {
    const worker = noBackups();
    await worker.text(USHER);
    spyOn(worker.player, "onFetch").mockImplementation(async () => {
      throw new TypeError("failed at https://video-weaver.example.hls.ttvnw.net/v1/playlist/x.m3u8?token=SECRET");
    });

    expect(await worker.text(MAIN)).toBe(midroll);

    const errors = events(worker, "error");
    expect(errors).toEqual([{ type: "error", name: "TypeError", where: "playlist", channel: "channel", at: expect.any(Number) }]);
    expect(JSON.stringify(worker.posted)).not.toContain("SECRET");
    expect(events(worker, "adPassed").map((e) => e.count)).toEqual([AD_SEGMENTS]);
  });

  test("the usher route: a failure in Purple's logic gives the player Twitch's master and an error named as thrown", async () => {
    const worker = noBackups();
    spyOn(worker.player, "setPlayerMaster").mockImplementation(() => {
      throw new RangeError("token=SECRET");
    });

    expect(await worker.text(USHER)).toBe(masterFor(""));

    expect(events(worker, "error").map((e) => [e.name, e.where])).toEqual([["RangeError", "usher"]]);
    expect(JSON.stringify(worker.posted)).not.toContain("SECRET");
  });

  test("something thrown that is not an Error is named by its type", async () => {
    const worker = noBackups();
    await worker.text(USHER);
    spyOn(worker.player, "onFetch").mockImplementation(async () => {
      throw "https://example.com/?sig=SECRET";
    });
    await worker.text(MAIN);
    expect(events(worker, "error").map((e) => e.name)).toEqual(["string"]);
  });
});

// F-31: the break's kind, roll and announced length ride on F-30's adState when it starts
describe("adState kind", () => {
  const T0 = Date.parse("2026-11-21T00:00:00.000Z");
  const at = (n: number) => new Date(T0 + n * 2000).toISOString();
  const playlist = (marker: string | null, ads: number[] = []) => {
    const lines = ["#EXTM3U", "#EXT-X-TARGETDURATION:6", "#EXT-X-MEDIA-SEQUENCE:100"];
    if (marker) lines.push(marker);
    for (let n = 100; n < 106; n++) {
      const ad = ads.includes(n);
      lines.push(`#EXT-X-PROGRAM-DATE-TIME:${at(n)}`, `#EXTINF:2.000,${ad ? "Amazon|AD" : "live"}`, `https://seg.example/${ad ? "ad" : "live"}-${n}.ts`);
    }
    return lines.join("\n");
  };
  const states = async (text: string) => {
    const posted: any[] = [];
    const player = new Player({ logger: () => {}, postMessage: (m: any) => posted.push(m), request: (async () => new Response("")) as any } as any);
    player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [], lowQualityFallback: false } as any);
    player.setChannel("channel");
    player.currentStream().createStreamAccess = (async () => {}) as any;
    await player.onFetch(text, "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8");
    return posted.filter((m) => m.type === "adState");
  };

  test("ad segments: stitched", async () => {
    expect(await states(playlist(`#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="${at(104)}",DURATION=4.000`, [104, 105]))).toEqual([
      { type: "adState", blocking: true, kind: "stitched", declared: 4 },
    ]);
  });

  test("a twitch-maf-ad marker over live segments: csai", async () => {
    expect(await states(playlist(`#EXT-X-DATERANGE:ID="maf-1",CLASS="twitch-maf-ad",START-DATE="${at(105)}",DURATION=30.000`))).toEqual([
      { type: "adState", blocking: true, kind: "csai" },
    ]);
  });

  test("a stitched break announced past the last segment (B-034): stitched", async () => {
    expect(await states(playlist(`#EXT-X-DATERANGE:ID="stitched-ad-2",CLASS="twitch-stitched-ad",START-DATE="${at(106)}",DURATION=30.000,X-TV-TWITCH-AD-ROLL-TYPE="MIDROLL"`))).toEqual([
      { type: "adState", blocking: true, kind: "stitched", roll: "midroll", declared: 30 },
    ]);
  });
});

// F-31: a break's start also says the quality the player is on and what the playlist announces
describe("adState at a break's start", () => {
  test("roll, announced length and the quality of the player's variant; the end says nothing more", async () => {
    const worker = noBackups();
    await worker.text(USHER);
    await worker.text(MAIN);
    const adStates = worker.posted.filter((m) => m.type === "adState");
    expect(adStates).toEqual([{ type: "adState", blocking: true, kind: "stitched", roll: "midroll", declared: 6, quality: worker.player.variantTarget(MAIN).quality }]);
    expect(adStates[0].quality).toMatch(/^\d{3,4}p/);
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-live-ts.m3u8"));
    await worker.text(MAIN);
    expect(worker.posted.filter((m) => m.type === "adState").at(-1)).toEqual({ type: "adState", blocking: false });
  });
});

// F-31: each backup type's outcome in a break's polls, and the requests that failed
describe("backupTried and requestFailed", () => {
  const FRONTPAGE = `${HOST}frontpage-chunked.m3u8`;
  const tries = (worker: WorkerHarness) => events(worker, "backupTried").map((e) => [e.playerType, e.outcome, e.status]);
  const failures = (worker: WorkerHarness) => events(worker, "requestFailed").map((e) => [e.what, e.status, e.playerType]);
  const settle = async (until: () => boolean) => {
    for (let i = 0; i < 50 && !until(); i++) await Bun.sleep(1);
  };
  const breakWith = async (setup: (worker: WorkerHarness) => void, integrity = true) => {
    const worker = noBackups();
    if (integrity) worker.send("setIntegrity", JSON.stringify({ token: "INTEGRITY" }));
    setup(worker);
    await worker.text(USHER);
    await worker.text(MAIN);
    await settle(() => events(worker, "backupTried").length >= 2);
    await worker.text(MAIN);
    return worker;
  };

  test("no master for the type at the first poll; then its usher request answers 404: noMaster, usher 404", async () => {
    const worker = await breakWith(() => {});
    expect(tries(worker)).toContainEqual(["frontpage", "noMaster", undefined]);
    expect(failures(worker)).toContainEqual(["usher", 404, "frontpage"]);
  });

  test("the token request answers 200 without a token, or 500: noToken, token with its status", async () => {
    for (const [body, status] of [[{ errors: [{ message: "service error" }] }, 200], [{ error: "x" }, 500]] as const) {
      const worker = await breakWith((w) => w.twitch.token("frontpage", body, status));
      expect(tries(worker)).toContainEqual(["frontpage", "noToken", undefined]);
      expect(failures(worker)).toContainEqual(["token", status, "frontpage"]);
    }
  });

  test("a token asked without an integrity token: integrity, status 0", async () => {
    const worker = await breakWith(() => {}, false);
    expect(failures(worker)).toContainEqual(["integrity", 0, "frontpage"]);
    const withIntegrity = await breakWith(() => {});
    expect(failures(withIntegrity).filter(([what]) => what === "integrity")).toEqual([]);
  });

  test("the backup's media playlist answers 404: status 404, playlist 404", async () => {
    const worker = await breakWith((w) => w.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE));
    expect(tries(worker)).toContainEqual(["frontpage", "status", 404]);
    expect(failures(worker)).toContainEqual(["playlist", 404, "frontpage"]);
  });

  test("the backup has ads: ads; a clean one: clean, and the break's first clean playlist once", async () => {
    const ads = await breakWith((w) => w.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE).mediaPlaylist(FRONTPAGE, midroll));
    expect(tries(ads)).toContainEqual(["frontpage", "ads", undefined]);
    expect(events(ads, "playlistClean")).toEqual([]);

    const clean = await breakWith((w) => w.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE).mediaPlaylist(FRONTPAGE, fixture("m3u8/backup-clean.m3u8")));
    await clean.text(MAIN);
    expect(tries(clean)).toContainEqual(["frontpage", "clean", undefined]);
    expect(events(clean, "playlistClean")).toHaveLength(1);
  });

  test("blanked ad segments are not a clean playlist; with diagnostics off, none of these events", async () => {
    const worker = await breakWith(() => {});
    expect(events(worker, "blankInserted").length).toBeGreaterThan(0);
    expect(events(worker, "playlistClean")).toEqual([]);

    const off = noBackups({ diagnostics: false });
    await off.text(USHER);
    await off.text(MAIN);
    await Bun.sleep(5);
    expect(events(off)).toEqual([]);
  });
});

// F-31: the ad flags of the page's own token, read from its usher request
describe("tokenFlags", () => {
  const usherWith = (token: unknown) => `https://usher.ttvnw.net/api/channel/hls/channel.m3u8?sig=PAGE_SIG&token=${encodeURIComponent(typeof token === "string" ? token : JSON.stringify(token))}`;

  test("hide_ads, show_ads, server_ads and adblock only, after the channel's load", async () => {
    const worker = noBackups();
    const token = { adblock: false, hide_ads: false, server_ads: true, show_ads: true, turbo: false, subscriber: false, user_id: 123456, device_id: "DEVICE", channel: "channel" };
    await worker.text(usherWith(token));
    const types = events(worker).map((e) => e.type);
    expect(types.indexOf("tokenFlags")).toBeGreaterThan(types.indexOf("channelLoaded"));
    expect(events(worker, "tokenFlags").map((e) => e.flags)).toEqual([{ hideAds: false, showAds: true, serverAds: true, adblock: false }]);
    expect(JSON.stringify(worker.posted)).not.toContain("DEVICE");
    expect(JSON.stringify(worker.posted)).not.toContain("123456");
  });

  test("a token that is not JSON, or no token: nothing", async () => {
    for (const url of [USHER, usherWith("PAGE_TOKEN"), usherWith({ hide_ads: "yes" })]) {
      const worker = noBackups();
      await worker.text(url);
      expect(events(worker, "tokenFlags")).toEqual([]);
    }
  });
});
