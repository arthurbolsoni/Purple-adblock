// T-109 and T-110: with `debug` off the worker prints nothing and posts no event; with it on, it logs and posts
// events (adDetected, backupUsed, segmentsReplaced) for the page's window.__purple.events.
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

afterEach(() => {
  (console.log as any).mockRestore?.();
});

describe("debug off (default)", () => {
  test("a full ad break prints nothing and posts no event", async () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const worker = adBreak();
    worker.send("setSettings", { whitelist: [], debug: false });

    await twoPolls(worker);

    expect(log).not.toHaveBeenCalled();
    expect(events(worker)).toEqual([]);
  });
});

describe("debug on", () => {
  test("the worker logs and posts adDetected and backupUsed, with channel, playerType and time", async () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const worker = adBreak();
    worker.send("setSettings", { whitelist: [], debug: true });
    const before = Date.now();

    await twoPolls(worker);

    expect(log).toHaveBeenCalled();
    const posted = events(worker);
    expect(posted.map((e) => e.type)).toEqual(["adDetected", "adDetected", "backupUsed"]);
    expect(posted[2]).toMatchObject({ type: "backupUsed", channel: "channel", playerType: StreamType.FRONTPAGE });
    expect(posted.every((e) => e.channel === "channel" && e.at >= before)).toBe(true);
  });

  test("segmentsReplaced carries the number of ad segments replaced", async () => {
    spyOn(console, "log").mockImplementation(() => {});
    const worker = createWorkerScope();
    worker.twitch.master("channel", masterFor(""));
    worker.twitch.mediaPlaylist(MAIN, fixture("m3u8/media-ssai-midroll.m3u8"));
    // the frontpage backup has ad markers too, so its live segments replace the main ad segments by time
    const markedBackup = fixture("m3u8/backup-clean.m3u8").replace(
      "#EXT-X-PROGRAM-DATE-TIME",
      '#EXT-X-DATERANGE:ID="stitched-ad-x",CLASS="twitch-stitched-ad",START-DATE="2026-10-03T12:10:06.000Z",DURATION=6.000\n#EXT-X-PROGRAM-DATE-TIME',
    );
    worker.twitch.mediaPlaylist(`${HOST}frontpage-chunked.m3u8`, markedBackup);
    worker.send("setSettings", { whitelist: [], debug: true });
    await worker.text(USHER);
    worker.player.currentStream().setStreamAccess(masterFor("frontpage-"), StreamType.FRONTPAGE);
    worker.player.currentStream().createStreamAccess = async () => {};

    await worker.text(MAIN);

    expect(events(worker).map((e) => [e.type, e.count])).toEqual([
      ["adDetected", undefined],
      ["segmentsReplaced", 3],
    ]);
  });

  test("turning debug off again stops the logs and the events", async () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const worker = adBreak();
    worker.send("setSettings", { whitelist: [], debug: true });
    worker.send("setSettings", { whitelist: [], debug: false });
    log.mockClear();

    await twoPolls(worker);

    expect(log).not.toHaveBeenCalled();
    expect(events(worker)).toEqual([]);
  });
});
