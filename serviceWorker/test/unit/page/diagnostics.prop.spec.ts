// T-010: properties of F-31's diagnostic log (T-606). Whatever the worker's events, break states, settings, scripts and
// Twitch's overlay text hold, every entry posted keeps to the contract (types, levels, keys and values of the type), and
// none carries a URL, a host, a token or Twitch's text.
import { describe, expect, test } from "bun:test";
import { fc } from "../../harness/property";
import { AD_UI, PLAYER_ERROR, type DiagEntry } from "../../../src/page/diagnostics";
import { createMediaPage, ranges } from "../../harness/media-page";

// the contract, written out on its own
const KEYS: Record<string, string[]> = {
  load: ["player", "worker"],
  breakStart: ["kind", "roll", "declared", "quality"],
  breakEnd: ["result", "seconds", "backup", "quality", "replaced", "blanked", "restarts", "firstCleanMs", "tried"],
  adPassed: ["via", "segments"],
  stall: ["track", "seconds", "purple", "hidden"],
  restart: ["why", "count"],
  decode: ["codec", "width", "height", "dropped", "corrupted", "total"],
  playerError: ["code", "source"],
  error: ["name", "where"],
  backupTry: ["backup", "outcome", "status", "ms"],
  request: ["what", "status", "backup"],
  avsync: ["offset", "moment"],
  quality: ["name"],
  token: ["hideAds", "showAds", "serverAds", "adblock"],
  conflict: ["what", "when"],
};
const LEVELS = ["info", "warn", "error"];

const keepsToContract = (entry: DiagEntry) => {
  expect(Number.isFinite(entry.at)).toBe(true);
  expect(entry.channel).toMatch(/^[a-z0-9_]{0,25}$/);
  expect(LEVELS).toContain(entry.level);
  expect(Object.keys(KEYS)).toContain(entry.type);
  const data = entry.data ?? {};
  expect(Object.keys(data).length).toBeLessThanOrEqual(12);
  for (const [key, value] of Object.entries(data)) {
    expect(key).toMatch(/^[a-zA-Z]{1,24}$/);
    expect(KEYS[entry.type]).toContain(key);
    if (typeof value === "string") expect(value.length).toBeLessThanOrEqual(120);
    else if (typeof value === "number") expect(Number.isFinite(value)).toBe(true);
    else expect(typeof value).toBe("boolean");
  }
};

// strings with what must never reach the log
const SECRET = "SECRETVALUE";
// shaped like the values a field takes (an identifier, a lower-case word, a hex id), so only closed vocabularies stop it
const SECRET_LOWER = "deadbeef0123";
const secretText = fc.constantFrom(
  SECRET_LOWER,
  `D${SECRET_LOWER.slice(1)}Error`,
  `https://usher.ttvnw.net/api/channel/hls/x.m3u8?token=${SECRET}&sig=${SECRET}`,
  `video-weaver.${SECRET}.hls.ttvnw.net`,
  `${SECRET}`,
  `Error #2000 ${SECRET}`,
  `device ${SECRET} session ${SECRET}`,
  `avc1.64002A,mp4a.40.2; url=https://${SECRET}`,
);
const anyText = fc.oneof(secretText, fc.string({ maxLength: 40 }), fc.constantFrom("site", "720p60", "1080p60 (source)", "TypeError", "playlist", "usher", "channel_a", "Channel_B", ""));
const anyNumber = fc.oneof(fc.integer({ min: -5, max: 50 }), fc.double(), fc.constantFrom(NaN, Infinity, -Infinity));
const anyValue = fc.oneof(anyText, anyNumber, fc.boolean(), fc.constant(undefined), fc.constant(null));
const EVENT_TYPES = ["adDetected", "backupUsed", "segmentsReplaced", "blankInserted", "whitelisted", "reloadRequested", "playerReloaded", "backupsPrewarmed", "sequenceShifted", "sequenceRestart", "segmentRepeat", "backupBehind", "channelLoaded", "adPassed", "error", "csaiBlocked", "backupTried", "requestFailed", "playlistClean", "tokenFlags", "toString", "__proto__"];
const anyPlayerType = fc.oneof(anyValue, fc.constantFrom("site", "popout", "frontpage", "picture-by-picture", "autoplay"));

const action = fc.oneof(
  fc.record({
    kind: fc.constant("event" as const),
    worker: fc.nat(2),
    event: fc.record({
      type: fc.oneof(fc.constantFrom(...EVENT_TYPES), anyText),
      channel: anyValue,
      playerType: anyPlayerType,
      quality: anyValue,
      count: anyValue,
      name: anyValue,
      where: anyValue,
      url: anyValue,
      outcome: fc.oneof(anyValue, fc.constantFrom("clean", "ads", "behind", "noMaster", "noToken", "status")),
      status: anyValue,
      what: fc.oneof(anyValue, fc.constantFrom("token", "usher", "playlist", "integrity")),
      flags: fc.oneof(anyValue, fc.record({ hideAds: anyValue, showAds: anyValue, serverAds: anyValue, adblock: anyValue, userId: anyValue })),
    }),
  }),
  fc.record({
    kind: fc.constant("adState" as const),
    worker: fc.nat(2),
    blocking: fc.boolean(),
    info: fc.oneof(anyValue, fc.record({ kind: fc.oneof(anyValue, fc.constantFrom("stitched", "csai")), roll: anyValue, declared: anyValue, quality: anyValue })),
  }),
  fc.record({ kind: fc.constant("csai" as const), bp: fc.oneof(anyValue, fc.constantFrom("preroll", "midroll")) }),
  fc.record({ kind: fc.constant("quality" as const), name: fc.oneof(anyValue, fc.constantFrom("Auto", "720p60", "1080p60 (source)")) }),
  fc.record({ kind: fc.constant("hooks" as const), worker: fc.boolean(), fetch: fc.boolean(), xhr: fc.boolean() }),
  fc.record({ kind: fc.constant("created" as const), worker: fc.nat(2), script: fc.oneof(fc.constant(null), anyText, fc.constant("importScripts('https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-3c5ad1e0.js')")), url: anyText }),
  fc.record({ kind: fc.constant("settings" as const), diagnostics: fc.oneof(fc.boolean(), fc.constant(undefined)), whitelist: fc.array(anyText, { maxLength: 2 }) }),
  fc.record({ kind: fc.constant("media" as const), type: fc.constantFrom("loadstart", "waiting", "playing", "pause", "seeking", "error", "emptied"), readyState: fc.integer({ min: 0, max: 4 }), errorCode: anyValue }),
  fc.record({ kind: fc.constant("overlay" as const), ui: fc.boolean(), error: fc.oneof(fc.constant(null), anyText) }),
  fc.record({ kind: fc.constant("play" as const), ms: fc.integer({ min: 0, max: 40_000 }), frames: fc.integer({ min: 0, max: 60 }), ahead: fc.double({ min: -1, max: 5, noNaN: true }), width: fc.constantFrom(0, 640, 1920) }),
  fc.record({ kind: fc.constant("restart" as const) }),
);

describe("the diagnostic log (properties)", () => {
  test("every entry keeps to the contract and holds no URL, host, token or Twitch text", () => {
    fc.assert(
      fc.property(fc.array(action, { maxLength: 40 }), fc.constantFrom("/channel_a", `/${SECRET}`, "/popout/channel_b/chat", "/directory"), (actions, path) => {
        const page = createMediaPage({ path });
        const workers = [{}, {}, {}];
        const { video, buffers } = page.video('video/mp4; codecs="avc1.4D401F"', 'audio/mp4; codecs="mp4a.40.2"');
        for (const step of actions) {
          switch (step.kind) {
            case "event":
              page.diagnostics.workerEvent(workers[step.worker], step.event);
              break;
            case "adState":
              page.diagnostics.adState(workers[step.worker], step.blocking, step.info);
              break;
            case "csai":
              page.diagnostics.csaiBlocked(step.bp);
              break;
            case "quality":
              page.diagnostics.qualityChanged(step.name);
              break;
            case "hooks":
              page.diagnostics.noteNatives({ worker: step.worker ? function Worker() {} : Function.prototype, fetch: step.fetch ? () => SECRET : Function.prototype, xhr: step.xhr ? () => 1 : Function.prototype });
              page.diagnostics.setHooked(() => ({ worker: step.worker, fetch: step.fetch, xhr: step.xhr }));
              break;
            case "created":
              page.diagnostics.workerCreated(workers[step.worker], step.script, String(step.url));
              break;
            case "settings":
              page.diagnostics.setSettings({ diagnostics: step.diagnostics, whitelist: step.whitelist });
              break;
            case "media":
              video.readyState = step.readyState;
              video.paused = step.type === "pause";
              video.error = { code: step.errorCode, message: `decode failed ${SECRET}` };
              page.fire(step.type, video);
              break;
            case "overlay":
              if (step.ui) page.document.elements.set(AD_UI, {});
              else page.document.elements.delete(AD_UI);
              if (step.error === null) page.document.elements.delete(PLAYER_ERROR);
              else page.document.elements.set(PLAYER_ERROR, { textContent: step.error });
              break;
            case "play":
              video.videoWidth = step.width;
              for (const buffer of buffers) buffer.buffered = ranges([0, video.currentTime + step.ahead]);
              page.play(video, step.ms, { frames: step.frames });
              break;
            case "restart":
              page.diagnostics.purpleRestart();
              break;
          }
        }
        page.clock.advance(70_000);
        const entries = page.entries();
        for (const entry of entries) keepsToContract(entry);
        const text = JSON.stringify(entries);
        expect(text).not.toContain(SECRET);
        expect(text).not.toContain("://");
        expect(text).not.toContain("ttvnw");
        // the channel is a login, which a lower-case word is: the secret shaped like one is looked for in the data
        expect(JSON.stringify(entries.map((entry) => entry.data ?? {})).toLowerCase()).not.toContain(SECRET_LOWER);
      }),
    );
  });

  test("a break's lines: never two breakStart in a row, and every breakEnd follows a breakStart", () => {
    fc.assert(
      fc.property(fc.array(fc.tuple(fc.nat(2), fc.boolean(), fc.integer({ min: 0, max: 20_000 })), { maxLength: 30 }), (steps) => {
        const page = createMediaPage();
        const workers = [{}, {}, {}];
        for (const [worker, blocking, ms] of steps) {
          page.diagnostics.adState(workers[worker], blocking, { kind: worker === 0 ? "csai" : "stitched" });
          page.clock.advance(ms);
        }
        let open = false;
        for (const entry of page.entries()) {
          if (entry.type === "breakStart") {
            expect(open).toBe(false);
            open = true;
          } else if (entry.type === "breakEnd") {
            expect(open).toBe(true);
            open = false;
          }
        }
      }),
    );
  });
});
