// F-31 (T-606): the page's diagnostic log (page/diagnostics.ts): the entries it writes from the worker's events and
// break state and from its own watchers of the main <video>, on a fake clock.
import { describe, expect, test } from "bun:test";
import { join } from "path";
import { AD_UI, Diagnostics, PLAYER_ERROR, channelFromPath, playerBuild, sanitizeEntry, type DiagEntry } from "../../../src/page/diagnostics";
import { FakeClock } from "../../harness/clock";
import { createMediaPage, ranges, type FakeVideo, type MediaPage } from "../../harness/media-page";

const SCRIPT = "importScripts('https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-3c5ad1e0a7d4b4b2.js')";
const TS = ['video/mp4; codecs="avc1.4D401F"', 'audio/mp4; codecs="mp4a.40.2"'];
const FMP4 = ['video/mp4; codecs="avc1.64002A,mp4a.40.2"'];
const event = (type: string, fields: Record<string, unknown> = {}) => ({ type, channel: "channel_a", at: 0, ...fields });
const shape = (entries: DiagEntry[]) => entries.map((e) => [e.type, e.level, e.data]);

describe("entries keep to the contract", () => {
  test("keys outside the type's list go; numbers are rounded; the channel is lower case", () => {
    expect(
      sanitizeEntry({
        at: 1.4,
        channel: "Channel_A",
        level: "info",
        type: "breakEnd",
        data: { result: "blocked", seconds: 12.345, backup: "site", quality: "720p60", replaced: 3.2, url: "https://usher.ttvnw.net/x", token: "T" },
      }),
    ).toEqual({ at: 1, channel: "channel_a", level: "info", type: "breakEnd", data: { result: "blocked", seconds: 12.3, backup: "site", quality: "720p60", replaced: 3 } });
  });

  test("values that do not match their field go: URLs, query strings, free text, numbers that are not finite", () => {
    const entry = sanitizeEntry({
      at: 5,
      channel: "channel_a",
      level: "warn",
      type: "breakEnd",
      data: { result: "maybe", seconds: Infinity, backup: "https://usher.ttvnw.net/api", quality: "720p60?token=SECRET", replaced: NaN, blanked: -1, restarts: "2" },
    });
    expect(entry).toEqual({ at: 5, channel: "channel_a", level: "warn", type: "breakEnd" });
    // a number so large that rounding it to 0.1 s overflows (found by the property test, seed 402382705)
    expect(sanitizeEntry({ at: 5, channel: "x", level: "info", type: "breakStart", data: { declared: 1.797693134862316e307 } })!.data).toBeUndefined();
    expect(sanitizeEntry({ at: 5, channel: "x", level: "info", type: "decode", data: { codec: 'avc1"; url=https://x' } })!.data).toBeUndefined();
    // closed vocabularies: a lower-case token is no player type, quality or codec
    expect(sanitizeEntry({ at: 5, channel: "x", level: "info", type: "breakEnd", data: { backup: "deadbeef", quality: "deadbeef" } })!.data).toBeUndefined();
    expect(sanitizeEntry({ at: 5, channel: "x", level: "info", type: "decode", data: { codec: "deadbeef,mp4a.40.2" } })!.data).toBeUndefined();
    expect(sanitizeEntry({ at: 5, channel: "x", level: "info", type: "decode", data: { codec: "hvc1.1.6.L120.B0,mp4a.40.2" } })!.data).toEqual({ codec: "hvc1.1.6.L120.B0,mp4a.40.2" });
    expect(sanitizeEntry({ at: 5, channel: "x", level: "info", type: "breakEnd", data: { backup: "picture-by-picture", quality: "audio_only" } })!.data).toEqual({ backup: "picture-by-picture", quality: "audio_only" });
  });

  test("an error's name is its name or Error, never a message", () => {
    const named = (name: unknown) => sanitizeEntry({ at: 1, channel: "", level: "error", type: "error", data: { name, where: "playlist" } })!.data;
    expect(named("TypeError")).toEqual({ name: "TypeError", where: "playlist" });
    expect(named("failed at https://x/?sig=SECRET")).toEqual({ name: "Error", where: "playlist" });
    // a name shaped like an identifier is not enough: a token or a device id could be one
    expect(named("SECRETVALUE")).toEqual({ name: "Error", where: "playlist" });
    expect(named("deadbeefcafebabe0123456789abcdef")).toEqual({ name: "Error", where: "playlist" });
    expect(named("InvalidStateError")).toEqual({ name: "InvalidStateError", where: "playlist" });
    expect(named("string")).toEqual({ name: "string", where: "playlist" });
  });

  test("an entry of no known type, level or time is none", () => {
    expect(sanitizeEntry({ at: 1, channel: "", level: "info", type: "toString" })).toBeNull();
    expect(sanitizeEntry({ at: 1, channel: "", level: "debug", type: "load" })).toBeNull();
    expect(sanitizeEntry({ at: NaN, channel: "", level: "info", type: "load" })).toBeNull();
  });

  test("a channel that is not a Twitch login is none", () => {
    for (const channel of ["/channel", "a".repeat(26), "chan nel", "https://www.twitch.tv/x", 7]) {
      expect(sanitizeEntry({ at: 1, channel, level: "info", type: "load" })!.channel).toBe("");
    }
  });
});

describe("the player's build and the page's channel", () => {
  test("the IVS worker script's hash, from the script the original worker imports, else from its URL", () => {
    expect(playerBuild(SCRIPT, "blob:https://www.twitch.tv/x")).toBe("3c5ad1e0a7d4");
    expect(playerBuild(null, "https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-ABC123.js")).toBe("abc123");
    expect(playerBuild("/* another worker */", "blob:https://www.twitch.tv/x")).toBe("unknown");
  });

  test("the channel of a twitch.tv path", () => {
    expect(channelFromPath("/Channel_A")).toBe("channel_a");
    expect(channelFromPath("/channel_a/videos")).toBe("channel_a");
    expect(channelFromPath("/popout/channel_b/chat")).toBe("channel_b");
    expect(channelFromPath("/directory/category/x")).toBe("");
    expect(channelFromPath("/")).toBe("");
  });
});

describe("load", () => {
  test("a worker with Purple's code: one load line when its channel loads, with the player's build", () => {
    const page = createMediaPage();
    const [w1, w2] = [{}, {}];
    page.diagnostics.workerCreated(w1, SCRIPT, "blob:x");
    page.diagnostics.workerCreated(w2, SCRIPT, "blob:y");
    page.diagnostics.workerEvent(w1, event("channelLoaded", { channel: "channel_b" }));
    // the second worker of a direct load (B-017)
    page.diagnostics.workerEvent(w2, event("channelLoaded", { channel: "channel_b" }));
    page.clock.advance(10_000);
    page.diagnostics.workerEvent(w1, event("channelLoaded", { channel: "channel_b" }));

    const loads = page.entries("load");
    expect(loads.map((e) => [e.channel, e.level, e.data])).toEqual([
      ["channel_b", "info", { player: "3c5ad1e0a7d4", worker: "injected" }],
      ["channel_b", "info", { player: "3c5ad1e0a7d4", worker: "injected" }],
    ]);
  });

  test("a worker Purple could not get into: a warning when it is created, on the page's channel", () => {
    const page = createMediaPage({ path: "/popout/channel_c/chat" });
    page.diagnostics.workerCreated({}, null, "https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-0a1b.js");
    expect(page.entries().map((e) => [e.type, e.channel, e.level, e.data])).toEqual([["load", "channel_c", "warn", { player: "0a1b", worker: "fallback" }]]);
  });
});

describe("breaks", () => {
  test("one breakStart and one breakEnd per break, the counts of every worker in it summed", () => {
    const page = createMediaPage();
    const d = page.diagnostics;
    const [w1, w2] = [{}, {}];
    d.workerCreated(w1, SCRIPT, "blob:x");
    d.workerEvent(w1, event("channelLoaded"));
    d.adState(w1, true, { kind: "stitched" });
    for (let i = 0; i < 3; i++) d.workerEvent(w1, event("adDetected"));
    d.workerEvent(w1, event("blankInserted", { count: 3 }));
    d.workerEvent(w1, event("backupUsed", { playerType: "popout", quality: "480p30" }));
    d.workerEvent(w1, event("backupUsed", { playerType: "site", quality: "720p60" }));
    d.workerEvent(w1, event("segmentsReplaced", { count: 2 }));
    d.adState(w2, true, { kind: "csai" });
    d.workerEvent(w2, event("segmentsReplaced", { count: 1 }));
    d.workerEvent(w1, event("segmentRepeat", { count: 2 }));
    page.clock.advance(31_250);
    d.adState(w1, false);
    expect(page.entries("breakEnd")).toEqual([]);
    d.adState(w2, false);

    expect(shape(page.entries().filter((e) => e.type.startsWith("break") || e.type === "restart"))).toEqual([
      ["breakStart", "info", { kind: "stitched", roll: "unknown" }],
      ["restart", "info", { why: "segmentRepeat", count: 2 }],
      ["breakEnd", "info", { result: "blocked", seconds: 31.3, backup: "site", quality: "720p60", replaced: 3, blanked: 3, restarts: 1, tried: 0 }],
    ]);
    expect(page.entries("breakEnd")[0].channel).toBe("channel_a");
  });

  test("a worker that ends ends its break; the next break starts its own lines", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.adState(w, true, { kind: "csai" });
    page.clock.advance(2000);
    page.diagnostics.workerGone(w);
    page.diagnostics.adState({}, true, { kind: "stitched" });
    page.diagnostics.adState({}, false);
    expect(shape(page.entries()).slice(0, 3)).toEqual([
      ["breakStart", "info", { kind: "csai", roll: "unknown" }],
      ["breakEnd", "info", { result: "blocked", seconds: 2, replaced: 0, blanked: 0, restarts: 0, tried: 0 }],
      ["breakStart", "info", { kind: "stitched", roll: "unknown" }],
    ]);
  });

  test("ad segments that passed in a break: an adPassed at once, the rest before a breakEnd that says passed (warn)", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.adState(w, true, { kind: "stitched" });
    page.diagnostics.workerEvent(w, event("adPassed", { count: 3 }));
    page.clock.advance(5000);
    page.diagnostics.workerEvent(w, event("adPassed", { count: 2 }));
    page.clock.advance(5000);
    page.diagnostics.workerEvent(w, event("adPassed", { count: 1 }));
    page.clock.advance(2000);
    page.diagnostics.adState(w, false);

    expect(shape(page.entries())).toEqual([
      ["breakStart", "info", { kind: "stitched", roll: "unknown" }],
      ["adPassed", "warn", { via: "segments", segments: 3 }],
      ["adPassed", "warn", { via: "segments", segments: 3 }],
      ["breakEnd", "warn", { result: "passed", seconds: 12, replaced: 0, blanked: 0, restarts: 0, tried: 0 }],
    ]);
  });

  test("ad segments outside a break: one entry per 30 s, the segments of a window summed at its end", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.workerEvent(w, event("adPassed", { count: 2, channel: "" }));
    page.clock.advance(10_000);
    page.diagnostics.workerEvent(w, event("adPassed", { count: 4, channel: "" }));
    expect(page.entries("adPassed").map((e) => e.data!.segments)).toEqual([2]);
    page.clock.advance(20_000);
    expect(page.entries("adPassed").map((e) => e.data!.segments)).toEqual([2, 4]);
    page.clock.advance(10_000);
    page.diagnostics.workerEvent(w, event("adPassed", { count: 1, channel: "" }));
    page.clock.advance(19_000);
    expect(page.entries("adPassed").map((e) => e.data!.segments)).toEqual([2, 4]);
    page.clock.advance(1000);
    // the channel of an event before the usher ("") is the page's
    expect(page.entries("adPassed").map((e) => [e.channel, e.data!.segments])).toEqual([["channel_a", 2], ["channel_a", 4], ["channel_a", 1]]);
  });
});

describe("a whitelisted channel (Purple off): ads are expected", () => {
  const playingPage = (settings: any) => {
    const page = createMediaPage({ settings });
    const { video, buffers } = page.video(...TS);
    page.fire("loadstart", video);
    page.play(video, 6000);
    return { page, video, buffers };
  };

  const check = (page: MediaPage, video: FakeVideo, buffers: any[], whitelistedByWorker: boolean) => {
    const w = {};
    page.diagnostics.workerCreated(w, SCRIPT, "blob:x");
    page.diagnostics.workerEvent(w, event("channelLoaded"));
    if (whitelistedByWorker) page.diagnostics.workerEvent(w, event("whitelisted"));
    page.diagnostics.adState(w, true, { kind: "stitched", roll: "midroll" });
    page.diagnostics.workerEvent(w, event("adPassed", { count: 4 }));
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "site", outcome: "clean" }));
    page.diagnostics.workerEvent(w, event("playlistClean"));
    page.diagnostics.adState(w, false);
    page.clock.advance(2500);
    page.document.elements.set(AD_UI, {});
    if (whitelistedByWorker) page.diagnostics.workerEvent(w, event("whitelisted"));
    page.play(video, 3000);
    if (whitelistedByWorker) page.diagnostics.workerEvent(w, event("whitelisted"));
    // past the first 5 s after the channel's load
    page.play(video, 3000);
    page.document.elements.delete(AD_UI);
    // a stall still goes
    buffers[0].buffered = ranges([0, video.currentTime]);
    buffers[1].buffered = ranges([0, video.currentTime + 5]);
    page.fire("waiting", video);
    page.clock.advance(1500);
    page.fire("playing", video);

    expect(page.entries().map((e) => e.type)).toEqual(["decode", "load", "stall"]);
  };

  test("named by the worker's whitelisted event: no break, backup or adPassed line (segments or UI), no avsync at its edges; load, decode and stalls still go", () => {
    const { page, video, buffers } = playingPage({ whitelist: [] });
    check(page, video, buffers, true);
  });

  test("named in the settings' whitelist", () => {
    const { page, video, buffers } = playingPage({ whitelist: ["Channel_A"] });
    check(page, video, buffers, false);
  });

  test("once the worker stops saying so (WHITELIST_MS) and the settings do not either, breaks are written again", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.workerEvent(w, event("whitelisted"));
    page.clock.advance(10_001);
    page.diagnostics.adState(w, true, { kind: "stitched" });
    page.diagnostics.adState(w, false);
    expect(page.entries().map((e) => e.type)).toEqual(["breakStart", "breakEnd"]);
  });
});

describe("stalls", () => {
  // a <video> that has played for 6 s since its load: past the first seconds of the load
  const playing = (types = TS) => {
    const page = createMediaPage();
    const { video, buffers } = page.video(...types);
    page.fire("loadstart", video);
    page.play(video, 6000);
    return { page, video, buffers };
  };
  const stall = (page: MediaPage, video: FakeVideo, ms: number) => {
    video.readyState = 2;
    page.fire("waiting", video);
    page.clock.advance(ms);
    video.readyState = 4;
    page.fire("playing", video);
  };
  const stalls = (page: MediaPage) => page.entries("stall").map((e) => e.data);

  test("from waiting to playing, with the track whose SourceBuffer ran dry", () => {
    const { page, video, buffers } = playing();
    const start = page.clock.now();
    buffers[0].buffered = ranges([0, video.currentTime + 0.05]);
    buffers[1].buffered = ranges([0, video.currentTime + 4]);
    stall(page, video, 2300);
    const [entry] = page.entries("stall");
    expect(entry).toEqual({ at: start, channel: "channel_a", level: "warn", type: "stall", data: { track: "video", seconds: 2.3, purple: false, hidden: false } });
  });

  test.each([
    ["audio", [6, 0], TS],
    ["both", [0, 0], TS],
    ["unknown", [4, 4], TS],
    ["both", [0], FMP4],
  ] as const)("track %s from the buffered ranges", (track, ahead, types) => {
    const { page, video, buffers } = playing([...types]);
    ahead.forEach((seconds, i) => (buffers[i].buffered = ranges([2, video.currentTime + seconds])));
    stall(page, video, 1000);
    expect(stalls(page)).toEqual([{ track, seconds: 1, purple: false, hidden: false }]);
  });

  test("an empty or removed SourceBuffer: one with nothing buffered ran dry, one that throws is not read", () => {
    const { page, video, buffers } = playing();
    buffers[0].buffered = ranges();
    Object.defineProperty(buffers[1], "buffered", {
      get() {
        throw new DOMException("removed", "InvalidStateError");
      },
    });
    stall(page, video, 1000);
    expect(stalls(page)).toEqual([{ track: "video", seconds: 1, purple: false, hidden: false }]);
  });

  test("under 0.5 s, while seeking, paused, or in the first 5 s of a load: not written", () => {
    const { page, video } = playing();
    stall(page, video, 400);
    video.seeking = true;
    stall(page, video, 2000);
    video.seeking = false;
    video.paused = true;
    stall(page, video, 2000);
    video.paused = false;
    page.fire("loadstart", video);
    page.play(video, 3000);
    stall(page, video, 1500);
    expect(stalls(page)).toEqual([]);
  });

  test("a stall that a pause ends is written up to the pause", () => {
    const { page, video } = playing();
    video.readyState = 2;
    page.fire("waiting", video);
    page.clock.advance(1800);
    video.paused = true;
    page.fire("pause", video);
    expect(stalls(page)).toEqual([{ track: "both", seconds: 1.8, purple: false, hidden: false }]);
  });

  test("within 3 s of Purple's own pause and play: purple", () => {
    const { page, video } = playing();
    page.diagnostics.purpleRestart();
    page.clock.advance(1000);
    stall(page, video, 1200);
    page.play(video, 4000);
    stall(page, video, 1200);
    expect(stalls(page).map((data) => data!.purple)).toEqual([true, false]);
  });

  test("without a waiting event: the time stands still while the media is not ready, from the last tick that saw it move", () => {
    const { page, video } = playing();
    video.readyState = 2;
    page.clock.advance(3000);
    video.readyState = 4;
    page.play(video, 1000);
    expect(stalls(page)).toEqual([{ track: "both", seconds: 4, purple: false, hidden: false }]);
  });

  test("a stall that goes on is written at 60 s, once", () => {
    const { page, video } = playing();
    video.readyState = 2;
    page.fire("waiting", video);
    page.clock.advance(125_000);
    expect(stalls(page)).toEqual([{ track: "both", seconds: 60, purple: false, hidden: false }]);
  });

  test("the picture-by-picture <video> (the smaller one) is not watched", () => {
    const { page, video } = playing();
    const small = page.video(...TS).video;
    small.rect = { width: 320, height: 180 };
    small.readyState = 2;
    page.fire("waiting", small);
    page.clock.advance(2000);
    page.fire("playing", small);
    expect(stalls(page)).toEqual([]);
    stall(page, video, 1000);
    expect(stalls(page)).toEqual([{ track: "both", seconds: 1, purple: false, hidden: false }]);
  });
});

describe("a frozen picture: the time moves, the frames do not", () => {
  const playing = () => {
    const page = createMediaPage();
    const { video } = page.video(...TS);
    page.fire("loadstart", video);
    page.play(video, 6000);
    return { page, video };
  };

  test("for 2 s or more: a stall of the video track, from the last tick with new frames", () => {
    const { page, video } = playing();
    const start = page.clock.now();
    page.play(video, 3000, { frames: 0 });
    page.play(video, 1000);
    const [entry] = page.entries("stall");
    expect(entry.at).toBe(start);
    expect(entry.data).toEqual({ track: "video", seconds: 4, purple: false, hidden: false });
  });

  test("for less than 2 s, or in a hidden tab (Chromium stops decoding its picture): nothing", () => {
    const { page, video } = playing();
    page.play(video, 1000, { frames: 0 });
    page.play(video, 1000);
    page.document.visibilityState = "hidden";
    page.play(video, 5000, { frames: 0 });
    page.document.visibilityState = "visible";
    page.play(video, 1000);
    expect(page.entries("stall")).toEqual([]);
  });

  test("the audio-only quality (no picture): nothing", () => {
    const { page, video } = playing();
    video.videoWidth = 0;
    video.videoHeight = 0;
    page.play(video, 5000, { frames: 0 });
    page.play(video, 1000);
    expect(page.entries("stall")).toEqual([]);
  });
});

describe("decode", () => {
  test("at the first frames of a load, when the picture size changes, and every 5 min while frames are dropped", () => {
    const page = createMediaPage();
    const { video } = page.video(...FMP4);
    page.fire("loadstart", video);
    page.play(video, 1000);
    video.videoWidth = 1920;
    video.videoHeight = 1080;
    video.quality.droppedVideoFrames = 4;
    page.play(video, 1000);
    // no new drops: nothing for 10 min
    page.play(video, 600_000);
    video.quality.droppedVideoFrames = 9;
    video.quality.corruptedVideoFrames = 1;
    page.play(video, 1000);

    const codec = "avc1.64002A,mp4a.40.2";
    expect(page.entries("decode").map((e) => e.data)).toEqual([
      { codec, width: 1280, height: 720, dropped: 0, corrupted: 0, total: 30 },
      { codec, width: 1920, height: 1080, dropped: 4, corrupted: 0, total: 30 },
      { codec, width: 1920, height: 1080, dropped: 5, corrupted: 1, total: 18_030 },
    ]);
  });

  // Firefox 157, 2026-11-21: the video was not found by its URL and the page had more than one MediaSource open, so
  // the decode line went without its codec
  test("a video not found by its URL: the codec of the newest open MediaSource with SourceBuffers", () => {
    const page = createMediaPage();
    const older = new page.window.MediaSource();
    older.addSourceBuffer('video/mp4; codecs="avc1.42C01E"');
    const { video } = page.video(...FMP4);
    const empty = new page.window.MediaSource();
    page.window.URL.createObjectURL(empty);
    video.src = video.currentSrc = "blob:https://www.twitch.tv/not-noted";
    page.fire("loadstart", video);
    page.play(video, 1000);
    expect(page.entries("decode").map((e) => e.data!.codec)).toEqual(["avc1.64002A,mp4a.40.2"]);
  });

  test("two SourceBuffers (TS): the video codec first; a changeType is a new codec", () => {
    const page = createMediaPage();
    const { video, buffers } = page.video('audio/mp4; codecs="mp4a.40.2"', 'video/mp4; codecs="avc1.4D401F"');
    page.fire("loadstart", video);
    page.play(video, 1000);
    buffers[1].changeType('video/mp4; codecs="hvc1.1.6.L120.B0"');
    page.play(video, 1000);
    expect(page.entries("decode").map((e) => e.data!.codec)).toEqual(["avc1.4D401F,mp4a.40.2", "hvc1.1.6.L120.B0,mp4a.40.2"]);
  });

  test("a new load writes its first frames again, the counts from where the element's counters are", () => {
    const page = createMediaPage();
    const { video } = page.video(...FMP4);
    page.fire("loadstart", video);
    page.play(video, 2000);
    page.fire("loadstart", video);
    page.play(video, 1000);
    expect(page.entries("decode").map((e) => e.data!.total)).toEqual([30, 30]);
  });
});

describe("player errors", () => {
  test("the <video>'s MediaError: its code, posted at once", () => {
    const page = createMediaPage();
    const { video } = page.video(...TS);
    video.error = { code: 3, message: "PIPELINE_ERROR_DECODE: https://video-edge.example/x.ts?token=SECRET" };
    page.fire("error", video);
    expect(page.posts.flat().map((e) => [e.type, e.level, e.data])).toEqual([["playerError", "error", { code: 3, source: "media" }]]);
  });

  test("Twitch's error overlay: the #NNNN number only, once each time it shows", () => {
    const page = createMediaPage();
    const { video } = page.video(...TS);
    page.fire("loadstart", video);
    page.document.elements.set(PLAYER_ERROR, { textContent: "Error #2000: something went wrong, see https://help.twitch.tv/?token=SECRET" });
    page.clock.advance(3000);
    page.document.elements.delete(PLAYER_ERROR);
    page.clock.advance(1000);
    page.document.elements.set(PLAYER_ERROR, { textContent: "Something went wrong" });
    page.clock.advance(1000);
    expect(page.entries("playerError").map((e) => e.data)).toEqual([
      { code: 2000, source: "twitch" },
      { code: "unknown", source: "twitch" },
    ]);
    expect(JSON.stringify(page.posts)).not.toContain("SECRET");
  });
});

describe("Twitch's ad UI while no worker is in a break", () => {
  test("one adPassed (ui) per 30 s, from the second tick that sees it", () => {
    const page = createMediaPage();
    const { video } = page.video(...TS);
    page.fire("loadstart", video);
    const shown = page.clock.now();
    page.document.elements.set(AD_UI, {});
    page.clock.advance(61_000);
    expect(page.entries("adPassed").map((e) => [e.at - shown, e.level, e.data])).toEqual([
      [2000, "warn", { via: "ui" }],
      [32_000, "warn", { via: "ui" }],
    ]);
  });

  test("not during a break, nor for a single tick", () => {
    const page = createMediaPage();
    const { video } = page.video(...TS);
    page.fire("loadstart", video);
    page.diagnostics.adState({}, true, { kind: "csai" });
    page.document.elements.set(AD_UI, {});
    page.clock.advance(10_000);
    const w = {};
    page.diagnostics.adState(w, false);
    page.diagnostics.adState({}, false);
    page.clock.advance(1000);
    page.document.elements.delete(AD_UI);
    page.clock.advance(5000);
    expect(page.entries("adPassed")).toEqual([]);
  });
});

describe("settings, batches and timers", () => {
  test("diagnostics false: nothing is posted and no watcher runs", () => {
    const page = createMediaPage({ settings: { whitelist: [], diagnostics: false } });
    const { video } = page.video(...TS);
    const w = {};
    page.diagnostics.workerCreated(w, null, "blob:x");
    page.diagnostics.workerEvent(w, event("channelLoaded"));
    page.diagnostics.workerEvent(w, event("error", { name: "TypeError", where: "playlist" }));
    page.diagnostics.adState(w, true, { kind: "stitched" });
    page.fire("loadstart", video);
    page.fire("waiting", video);
    page.clock.advance(10_000);
    page.diagnostics.adState(w, false);
    expect(page.clock.intervals).toBe(0);
    expect(page.entries()).toEqual([]);
  });

  test("turned off, what was waiting is dropped and the watcher stops; turned on again, it runs", () => {
    const page = createMediaPage();
    const { video } = page.video(...TS);
    page.fire("loadstart", video);
    page.diagnostics.workerEvent({}, event("segmentRepeat", { count: 1 }));
    expect(page.clock.intervals).toBe(1);
    page.diagnostics.setSettings({ whitelist: [], diagnostics: false });
    expect(page.clock.intervals).toBe(0);
    page.clock.advance(5000);
    expect(page.posts).toEqual([]);
    page.diagnostics.setSettings({ whitelist: [] });
    expect(page.clock.intervals).toBe(1);
  });

  test("no <video> left: the watcher stops", () => {
    const page = createMediaPage();
    const { video } = page.video(...TS);
    page.fire("loadstart", video);
    page.document.videos = [];
    page.clock.advance(2000);
    expect(page.clock.intervals).toBe(0);
  });

  test("entries go in batches at most once a second, an error at once with what waits", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.workerEvent(w, event("segmentRepeat", { count: 1 }));
    page.clock.advance(300);
    page.diagnostics.workerEvent(w, event("sequenceRestart", { count: 2 }));
    expect(page.posts).toEqual([]);
    page.clock.advance(700);
    expect(page.posts.map((batch) => batch.map((e) => e.type))).toEqual([["restart", "restart"]]);
    page.diagnostics.workerEvent(w, event("sequenceRestart", { count: 3 }));
    page.diagnostics.workerEvent(w, event("error", { name: "TypeError", where: "usher" }));
    expect(page.posts.map((batch) => batch.map((e) => e.type))).toEqual([["restart", "restart"], ["restart", "error"]]);
  });

  test("before the content script's settings, entries wait: dropped if they say off, posted if on, posted after 5 s without them", () => {
    for (const [settings, expected] of [
      [{ whitelist: [], diagnostics: false }, 0],
      [{ whitelist: [] }, 1],
    ] as const) {
      const page = createMediaPage({ settings: null });
      page.diagnostics.workerEvent({}, event("error", { name: "TypeError", where: "playlist" }));
      page.clock.advance(2000);
      expect(page.posts).toEqual([]);
      page.diagnostics.setSettings(settings);
      page.clock.advance(1000);
      expect(page.posts.flat()).toHaveLength(expected);
    }
    const userscript = createMediaPage({ settings: null });
    userscript.diagnostics.workerEvent({}, event("segmentRepeat", { count: 1 }));
    userscript.clock.advance(4900);
    expect(userscript.posts).toEqual([]);
    userscript.clock.advance(100);
    expect(userscript.posts.flat()).toHaveLength(1);
  });
});

describe("hooks never change what the player sees", () => {
  const pageWith = (window: any, document: any = { addEventListener() {}, querySelectorAll: () => [], querySelector: () => null }) => {
    const posts: DiagEntry[][] = [];
    const clock = new FakeClock();
    const diagnostics = new Diagnostics({ window, document, post: (entries) => posts.push(entries), timers: clock });
    diagnostics.install();
    diagnostics.setSettings({ whitelist: [] });
    return { diagnostics, posts, clock };
  };

  test("addSourceBuffer, changeType and createObjectURL return what the originals return and throw what they throw", () => {
    const failure = new DOMException("not supported", "NotSupportedError");
    const buffer = { buffered: ranges() };
    class MediaSource {
      addSourceBuffer(type: string, ...rest: any[]) {
        if (type === "bad") throw failure;
        return Object.assign(buffer, { args: [type, ...rest] });
      }
    }
    class SourceBuffer {
      changeType(type: string) {
        if (type === "bad") throw failure;
        return "changed";
      }
    }
    const created: any[] = [];
    const URL = {
      createObjectURL(object: any) {
        created.push([this, object]);
        if (object === "bad") throw failure;
        return "blob:url";
      },
    };
    pageWith({ MediaSource, SourceBuffer, URL });

    const source = new MediaSource();
    expect(source.addSourceBuffer('video/mp4; codecs="avc1"', "extra")).toBe(buffer);
    expect((buffer as any).args).toEqual(['video/mp4; codecs="avc1"', "extra"]);
    expect(() => source.addSourceBuffer("bad")).toThrow(failure);
    let thrown: unknown;
    try {
      source.addSourceBuffer("bad");
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBe(failure);
    expect(new SourceBuffer().changeType("x")).toBe("changed");
    expect(() => new SourceBuffer().changeType("bad")).toThrow(failure);
    expect(URL.createObjectURL(source)).toBe("blob:url");
    expect(() => URL.createObjectURL("bad")).toThrow(failure);
    expect(created[0][0]).toBe(URL);
  });

  test("a failure inside the diagnostics is one error entry (where diagnostics, its name only); the page goes on", () => {
    const document = {
      listeners: [] as any[],
      addEventListener(_type: string, listener: any) {
        this.listeners.push(listener);
      },
      querySelectorAll() {
        throw new TypeError("broken at https://www.twitch.tv/?token=SECRET");
      },
      querySelector: () => null,
    };
    const { posts } = pageWith({}, document);
    const video = { tagName: "VIDEO" };
    expect(() => document.listeners.forEach((listener) => listener({ type: "waiting", target: video }))).not.toThrow();
    document.listeners.forEach((listener) => listener({ type: "playing", target: video }));
    expect(posts.flat()).toEqual([{ at: expect.any(Number), channel: "", level: "error", type: "error", data: { name: "TypeError", where: "diagnostics" } }]);
  });
});

// ---- F-31 additions (Firefox review, 2026-11-21)

describe("a break's details at its start", () => {
  test("roll, announced length and quality from the worker's adState", () => {
    const page = createMediaPage();
    page.diagnostics.adState({}, true, { kind: "stitched", roll: "midroll", declared: 90.04, quality: "1080p60 (source)" });
    expect(page.entries("breakStart").map((e) => e.data)).toEqual([{ kind: "stitched", roll: "midroll", declared: 90, quality: "1080p60" }]);
  });

  test("a client-side break waits for the ad request's bp, its time the break's start", () => {
    const page = createMediaPage();
    const start = page.clock.now();
    page.diagnostics.adState({}, true, { kind: "csai", declared: 60 });
    page.clock.advance(4000);
    expect(page.entries("breakStart")).toEqual([]);
    page.diagnostics.csaiBlocked("preroll");
    page.diagnostics.csaiBlocked("midroll");
    expect(page.entries("breakStart").map((e) => [e.at - start, e.data])).toEqual([[0, { kind: "csai", roll: "preroll", declared: 60 }]]);
  });

  test("without a request in 10 s, or with an unknown bp, the roll is unknown; a break that ends first writes its start first", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.adState(w, true, { kind: "csai" });
    page.clock.advance(10_000);
    page.diagnostics.adState(w, false);
    page.diagnostics.adState(w, true, { kind: "csai" });
    page.diagnostics.csaiBlocked("other");
    page.diagnostics.adState(w, false);
    page.diagnostics.adState(w, true, { kind: "csai" });
    page.clock.advance(3000);
    page.diagnostics.adState(w, false);
    expect(page.entries().map((e) => [e.type, e.data!.roll ?? e.data!.result])).toEqual([
      ["breakStart", "unknown"],
      ["breakEnd", "blocked"],
      ["breakStart", "unknown"],
      ["breakEnd", "blocked"],
      ["breakStart", "unknown"],
      ["breakEnd", "blocked"],
    ]);
  });
});

describe("backup attempts in a break", () => {
  test("one line per type and outcome, the first time; breakEnd says how many types were asked and when the first clean playlist came", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "site", outcome: "noMaster" }));
    page.diagnostics.adState(w, true, { kind: "stitched" });
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "site", outcome: "noMaster" }));
    page.clock.advance(800);
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "site", outcome: "noMaster" }));
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "popout", outcome: "status", status: 404 }));
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "frontpage", outcome: "noToken", status: 500 }));
    page.clock.advance(1700);
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "site", outcome: "clean" }));
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "https://x", outcome: "clean" }));
    page.diagnostics.workerEvent(w, event("backupTried", { playerType: "embed", outcome: "maybe" }));
    page.diagnostics.workerEvent(w, event("playlistClean"));
    page.clock.advance(2000);
    page.diagnostics.workerEvent(w, event("playlistClean"));
    page.diagnostics.adState(w, false);

    expect(shape(page.entries("backupTry"))).toEqual([
      ["backupTry", "warn", { backup: "site", outcome: "noMaster", ms: 0 }],
      ["backupTry", "warn", { backup: "popout", outcome: "status", status: 404, ms: 800 }],
      ["backupTry", "warn", { backup: "frontpage", outcome: "noToken", ms: 800 }],
      ["backupTry", "info", { backup: "site", outcome: "clean", ms: 2500 }],
    ]);
    expect(page.entries("breakEnd")[0].data).toMatchObject({ tried: 3, firstCleanMs: 2500 });
  });

  test("no clean playlist in the break: no firstCleanMs", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.adState(w, true, { kind: "stitched" });
    page.diagnostics.adState(w, false);
    expect(page.entries("breakEnd")[0].data).not.toHaveProperty("firstCleanMs");
  });
});

describe("failed requests", () => {
  const fail = (page: MediaPage, what: string, status: unknown, playerType?: unknown) => page.diagnostics.workerEvent({}, event("requestFailed", { what, status, playerType }));

  test("what, status and backup; a network error is an error, an HTTP status or a missing integrity token a warning", () => {
    const page = createMediaPage();
    fail(page, "token", 0, "site");
    fail(page, "usher", 404, "popout");
    fail(page, "playlist", 502, "frontpage");
    fail(page, "integrity", 0, "site");
    fail(page, "token", 200, "https://usher.ttvnw.net/?token=SECRET");
    fail(page, "https://usher.ttvnw.net/", 500, "site");
    expect(shape(page.entries("request"))).toEqual([
      ["request", "error", { what: "token", status: 0, backup: "site" }],
      ["request", "warn", { what: "usher", status: 404, backup: "popout" }],
      ["request", "warn", { what: "playlist", status: 502, backup: "frontpage" }],
      ["request", "warn", { what: "integrity", status: 0, backup: "site" }],
      ["request", "warn", { what: "token", status: 200 }],
    ]);
  });

  test("the same one once a minute per channel", () => {
    const page = createMediaPage();
    fail(page, "token", 0, "site");
    page.clock.advance(30_000);
    fail(page, "token", 0, "site");
    fail(page, "token", 0, "popout");
    page.diagnostics.workerEvent({}, event("requestFailed", { what: "token", status: 0, playerType: "site", channel: "channel_b" }));
    page.clock.advance(30_000);
    fail(page, "token", 0, "site");
    expect(page.entries("request").map((e) => [e.channel, e.data!.backup])).toEqual([
      ["channel_a", "site"],
      ["channel_a", "popout"],
      ["channel_b", "site"],
      ["channel_a", "site"],
    ]);
  });
});

describe("the audio and the video buffered (avsync)", () => {
  const playing = (types = TS, audioEnd = 10, videoEnd = 9.2) => {
    const page = createMediaPage();
    const { video, buffers } = page.video(...types);
    page.fire("loadstart", video);
    page.play(video, 6000);
    buffers.forEach((buffer, i) => (buffer.buffered = ranges([0, i === 0 ? videoEnd : audioEnd])));
    return { page, video, buffers };
  };
  const avsync = (page: MediaPage) => page.entries("avsync").map((e) => [e.level, e.data]);

  test("2 s after a break starts and ends: the audio's buffered end minus the video's", () => {
    const { page, buffers } = playing();
    const w = {};
    page.diagnostics.adState(w, true, { kind: "stitched" });
    page.clock.advance(1999);
    expect(avsync(page)).toEqual([]);
    page.clock.advance(1);
    buffers[1].buffered = ranges([0, 9.3]);
    page.diagnostics.adState(w, false);
    page.clock.advance(2000);
    expect(avsync(page)).toEqual([
      ["warn", { offset: 0.8, moment: "breakStart" }],
      ["info", { offset: 0.1, moment: "breakEnd" }],
    ]);
  });

  test("2 s after Purple's restart (its pause and plays, or a restart event): one measure", () => {
    const { page } = playing(TS, 9, 9.25);
    page.diagnostics.purpleRestart();
    page.diagnostics.workerEvent({}, event("segmentRepeat", { count: 1 }));
    page.diagnostics.purpleRestart();
    page.clock.advance(2000);
    expect(avsync(page)).toEqual([["info", { offset: -0.25, moment: "restart" }]]);
  });

  test("every 5 min while it is over 0.5 s; not once it is back under", () => {
    const { page, video, buffers } = playing();
    page.diagnostics.purpleRestart();
    page.clock.advance(2000);
    page.play(video, 300_000);
    buffers[1].buffered = ranges([0, 9.4]);
    page.play(video, 300_000);
    page.play(video, 300_000);
    expect(avsync(page).map(([, data]: any) => [data.moment, data.offset])).toEqual([
      ["restart", 0.8],
      ["periodic", 0.8],
    ]);
  });

  test("one SourceBuffer for both tracks (fMP4), or a whitelisted channel's break: nothing", () => {
    const { page } = playing(FMP4);
    const w = {};
    page.diagnostics.purpleRestart();
    page.diagnostics.adState(w, true, { kind: "stitched" });
    page.diagnostics.adState(w, false);
    page.clock.advance(3000);
    expect(avsync(page)).toEqual([]);

    const whitelisted = playing();
    whitelisted.page.diagnostics.setSettings({ whitelist: ["channel_a"] });
    whitelisted.page.diagnostics.adState(w, true, { kind: "stitched" });
    whitelisted.page.diagnostics.adState(w, false);
    whitelisted.page.clock.advance(3000);
    expect(avsync(whitelisted.page)).toEqual([]);
  });
});

describe("the player's quality", () => {
  test("its name or auto when it changes, at most once every 10 s (the window's last at its end)", () => {
    const page = createMediaPage();
    page.diagnostics.qualityChanged("1080p60 (source)");
    page.diagnostics.qualityChanged("1080p60");
    page.clock.advance(3000);
    page.diagnostics.qualityChanged("480p30");
    page.diagnostics.qualityChanged("Auto");
    page.clock.advance(7000);
    page.clock.advance(20_000);
    page.diagnostics.qualityChanged("auto");
    page.diagnostics.qualityChanged("720p60");
    page.diagnostics.qualityChanged("https://x/?token=SECRET");
    expect(page.entries("quality").map((e) => e.data!.name)).toEqual(["1080p60", "auto", "720p60"]);
  });
});

describe("the page token's ad flags", () => {
  test("once per load, after it, the four flags only", () => {
    const page = createMediaPage();
    const w = {};
    page.diagnostics.workerEvent(w, event("tokenFlags", { flags: { hideAds: false } }));
    page.diagnostics.workerEvent(w, event("channelLoaded"));
    page.diagnostics.workerEvent(w, event("tokenFlags", { flags: { hideAds: false, showAds: true, serverAds: true, adblock: false, turbo: true, userId: 123 } }));
    page.diagnostics.workerEvent(w, event("tokenFlags", { flags: { hideAds: true } }));
    expect(shape(page.entries().filter((e) => e.type === "load" || e.type === "token"))).toEqual([
      ["load", "info", { player: "unknown", worker: "injected" }],
      ["token", "info", { hideAds: false, showAds: true, serverAds: true, adblock: false }],
    ]);
  });
});

describe("conflicts with other scripts", () => {
  test("at each load: what was not native code before Purple, and what no longer is Purple's", () => {
    const page = createMediaPage();
    let hooked = { worker: true, fetch: true, xhr: true };
    page.diagnostics.noteNatives({ worker: Math.max, fetch: async () => new Response(""), xhr: Array.prototype.push });
    page.diagnostics.setHooked(() => hooked);
    page.diagnostics.workerEvent({}, event("channelLoaded"));
    hooked = { worker: false, fetch: true, xhr: false };
    page.diagnostics.workerEvent({}, event("channelLoaded", { channel: "channel_b" }));
    expect(page.entries("conflict").map((e) => [e.channel, e.data])).toEqual([
      ["channel_a", { what: "fetch", when: "before" }],
      ["channel_b", { what: "fetch", when: "before" }],
      ["channel_b", { what: "worker", when: "after" }],
      ["channel_b", { what: "xhr", when: "after" }],
    ]);
  });

  test("a check that throws writes no conflict and breaks nothing", () => {
    const page = createMediaPage();
    page.diagnostics.setHooked(() => {
      throw new Error("x");
    });
    page.diagnostics.workerEvent({}, event("channelLoaded"));
    expect(page.entries().map((e) => e.type)).toEqual(["load"]);
  });
});

describe("a stall in a hidden tab", () => {
  test("hidden says whether the tab was hidden when the stall started", () => {
    const page = createMediaPage();
    const { video } = page.video(...TS);
    page.fire("loadstart", video);
    page.play(video, 6000);
    page.document.visibilityState = "hidden";
    video.readyState = 2;
    page.fire("waiting", video);
    page.document.visibilityState = "visible";
    page.clock.advance(1000);
    page.fire("playing", video);
    expect(page.entries("stall").map((e) => e.data!.hidden)).toEqual([true]);
  });
});

describe("the vocabulary", () => {
  test("the page's keys per type are the store's and the formatter's", async () => {
    const { DATA_KEYS } = await import("../../../src/page/diagnostics");
    const root = join(import.meta.dir, "..", "..", "..", "..", "platform", "src");
    for (const file of ["app/diagnostics.js", "common/js/diag-format.js"]) {
      const source = await Bun.file(join(root, file)).text();
      const table = /const DATA_KEYS = (\{[\s\S]*?\n\s*\});/.exec(source)![1];
      expect([file, new Function(`return ${table}`)()]).toEqual([file, DATA_KEYS]);
    }
  });
});
