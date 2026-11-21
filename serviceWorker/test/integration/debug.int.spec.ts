// T-109 and T-110: with `debug` off the worker prints nothing; with it on, it logs and posts events (adDetected,
// backupUsed, segmentsReplaced) for the page's window.__purple.events. F-31 (T-606): the events are also posted with
// `debug` off for the page's diagnostic log, unless `diagnostics` is false.
import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { fixture } from "../harness/fixtures";
import { createWorkerScope } from "../harness/worker-scope";
import { StreamType } from "../../src/modules/stream/interface/stream.enum";

const HOST = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/";
const USHER = "https://usher.ttvnw.net/api/v2/channel/hls/channel.m3u8?token=PAGE_TOKEN&sig=PAGE_SIG";
const MAIN = `${HOST}chunked.m3u8`;
const masterFor = (prefix: string) => fixture("m3u8/master-video-weaver.m3u8").replaceAll(HOST, HOST + prefix);

const settle = async (until: () => boolean) => {
  for (let i = 0; i < 50 && !until(); i++) await Bun.sleep(1);
};

const adBreak = () => {
  const worker = createWorkerScope();
  worker.twitch.master("channel", masterFor(""));
  worker.twitch.master("channel", masterFor("frontpage-"), StreamType.FRONTPAGE);
  worker.twitch.master("channel", masterFor("picture-"), StreamType.PICTURE);
  worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
  worker.twitch.mediaPlaylist(`${HOST}frontpage-chunked.m3u8`, fixture("m3u8/backup-clean.m3u8"));
  return worker;
};

// two polls: the first finds the ad and requests the backup tokens, the second gets the clean frontpage backup
const twoPolls = async (worker: ReturnType<typeof adBreak>) => {
  await worker.text(USHER);
  await worker.text(MAIN);
  await settle(() => worker.player.currentStream().serverList.length === 2);
  await worker.text(MAIN);
};

const events = (worker: ReturnType<typeof adBreak>) => worker.posted.filter((m) => m.type === "purpleEvent").map((m) => m.event);
// F-31's events for the diagnostic log only (backup outcomes, failed requests, ...); the F-17 ones are the others
const F31_ONLY = new Set(["backupTried", "requestFailed", "playlistClean", "tokenFlags"]);
const f17 = (worker: ReturnType<typeof adBreak>) => events(worker).filter((e) => !F31_ONLY.has(e.type));

afterEach(() => {
  (console.log as any).mockRestore?.();
});

describe("debug off (default)", () => {
  test("with diagnostics off, a full ad break prints nothing and posts no event", async () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const worker = adBreak();
    worker.send("setSettings", { whitelist: [], debug: false, diagnostics: false });

    await twoPolls(worker);

    expect(log).not.toHaveBeenCalled();
    expect(events(worker)).toEqual([]);
  });

  // F-31: diagnostics is on by default (no key, and before any setSettings: the userscript gets none)
  test.each([
    ["diagnostics not set", { whitelist: [], debug: false }],
    ["no setSettings", null],
  ])("with %s, a full ad break prints nothing and posts its events for the diagnostic log", async (_, settings) => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const worker = adBreak();
    if (settings) worker.send("setSettings", settings);

    await twoPolls(worker);

    expect(log).not.toHaveBeenCalled();
    expect(f17(worker).map((e) => e.type)).toEqual(["channelLoaded", "adDetected", "blankInserted", "adDetected", "backupUsed"]);
    expect(events(worker).map((e) => e.type)).toContain("backupTried");
  });

  test("diagnostics false after true stops the events", async () => {
    spyOn(console, "log").mockImplementation(() => {});
    const worker = adBreak();
    worker.send("setSettings", { whitelist: [], diagnostics: true });
    worker.send("setSettings", { whitelist: [], diagnostics: false });

    await twoPolls(worker);

    expect(events(worker)).toEqual([]);
  });
});

describe("debug on", () => {
  // the first poll has no backup yet: its ad segments are answered blank (T-502); the second gets the frontpage backup
  test("the worker logs and posts adDetected, blankInserted and backupUsed, with channel, playerType and time", async () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const worker = adBreak();
    worker.send("setSettings", { whitelist: [], debug: true });
    const before = Date.now();

    await twoPolls(worker);

    expect(log).toHaveBeenCalled();
    const posted = f17(worker);
    // F-31: channelLoaded at the usher request
    expect(posted.map((e) => e.type)).toEqual(["channelLoaded", "adDetected", "blankInserted", "adDetected", "backupUsed"]);
    expect(posted[2]).toMatchObject({ type: "blankInserted", channel: "channel", count: 3 });
    expect(posted[4]).toMatchObject({ type: "backupUsed", channel: "channel", playerType: StreamType.FRONTPAGE });
    expect(posted.every((e) => e.channel === "channel" && e.at >= before)).toBe(true);
  });

  test("segmentsReplaced carries the number of ad segments replaced", async () => {
    spyOn(console, "log").mockImplementation(() => {});
    const worker = createWorkerScope();
    worker.twitch.master("channel", masterFor(""));
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    // the frontpage backup has an ad segment too (at 12:10:00), so its live segments replace the main ad segments by time
    const markedBackup = fixture("m3u8/backup-clean.m3u8").replace(
      "#EXTINF:2.000,live\nhttps://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3000.ts",
      "#EXTINF:2.000,Amazon|AD_ID\nhttps://edge.j.cloudfront.hls.ttvnw.net/v1/segment/backup-3000.ts",
    );
    worker.twitch.mediaPlaylist(`${HOST}frontpage-chunked.m3u8`, markedBackup);
    worker.send("setSettings", { whitelist: [], debug: true });
    await worker.text(USHER);
    worker.player.currentStream().setStreamAccess(masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.player.currentStream().createStreamAccess = async () => {};

    await worker.text(MAIN);

    expect(f17(worker).map((e) => [e.type, e.count])).toEqual([
      ["channelLoaded", undefined],
      ["adDetected", undefined],
      ["segmentsReplaced", 3],
    ]);
  });

  test("turning debug off again (diagnostics off) stops the logs and the events", async () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const worker = adBreak();
    worker.send("setSettings", { whitelist: [], debug: true });
    worker.send("setSettings", { whitelist: [], debug: false, diagnostics: false });
    log.mockClear();

    await twoPolls(worker);

    expect(log).not.toHaveBeenCalled();
    expect(events(worker)).toEqual([]);
  });
});
