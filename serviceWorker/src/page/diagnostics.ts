// F-31 (T-606): the page's diagnostic log. Entries describe what happened on a channel (its player's load, the ad
// breaks and how they ended, ads that reached the viewer, stalls, what the player decodes, player errors, Purple's own
// errors, how each backup type answered in a break, failed requests, the gap between the audio and the video buffered,
// the player's quality, the ad flags of the page's token, other scripts that replaced what Purple hooks) and are posted
// to the window as { type: "purpleDiag", entries }: the content script hands them to the extension, which keeps them 7
// days on the viewer's computer and exports them as text for a bug report.
//
// Sources: the worker's events (purpleEvent) and break state (adState), which index.ts passes here, and the page's own
// watchers of the main <video>, its Media Source and Twitch's player overlays. Every entry goes through sanitizeEntry:
// fixed keys per type, labels from fixed lists, numbers, and strings that match narrow patterns, so no URL, host,
// token, id, header value or Twitch text can reach the log.
//
// Nothing here may change what the player sees: the wrapped methods call the original with the same arguments and
// return or throw what it does, and every handler runs in a guard; the first failure inside it becomes one `error`
// entry (where "diagnostics"). With `diagnostics` false nothing is posted and the watchers stop.
import { AUDIO, VIDEO } from "./buffer-removal";
import { StreamType } from "../modules/stream/interface/stream.enum";

export type DiagLevel = "info" | "warn" | "error";
export type DiagType = "load" | "breakStart" | "breakEnd" | "adPassed" | "stall" | "restart" | "decode" | "playerError" | "error" | "backupTry" | "request" | "avsync" | "quality" | "token" | "conflict";
export type DiagValue = string | number | boolean;
export type DiagEntry = { at: number; channel: string; level: DiagLevel; type: DiagType; data?: Record<string, DiagValue> };

// ---- the contract: what an entry may hold

type Check = (value: unknown) => DiagValue | undefined;
const oneOf =
  (...values: string[]): Check =>
  (value) =>
    typeof value === "string" && values.includes(value) ? value : undefined;
const matching =
  (pattern: RegExp): Check =>
  (value) =>
    typeof value === "string" && value.length <= 120 && pattern.test(value) ? value : undefined;
const count: Check = (value) => (typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : undefined);
// up to a year: the rounding of a larger number can overflow
const seconds: Check = (value) => (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 31_536_000 ? Math.round(value * 10) / 10 : undefined);
const flag: Check = (value) => (typeof value === "boolean" ? value : undefined);
const either =
  (...checks: Check[]): Check =>
  (value) => {
    for (const check of checks) {
      const result = check(value);
      if (result !== undefined) return result;
    }
    return undefined;
  };

const LEVELS: DiagLevel[] = ["info", "warn", "error"];
// an exception's name as JavaScript gives it (TypeError, InvalidStateError, NS_ERROR_FAILURE's Exception), or the type
// of something thrown that is not an Error; anything else is written as Error
const ERROR_NAME = /^(?:[A-Z][A-Za-z]{0,30}(?:Error|Exception)|Error|string|number|boolean|undefined|object|symbol|bigint|function)$/;
// a codec as a SourceBuffer's type names it: a known codec, then dot-separated parameters (avc1.64002A, hvc1.1.6.L120.B0)
const CODEC = /^(?:avc1|avc3|hvc1|hev1|av01|vp09|vp08|vp8|vp9|mp4a|opus|ac-3|ec-3|flac|mp3)(?:\.[A-Za-z0-9]{1,12}){0,6}$/;
const codecs: Check = (value) => {
  if (typeof value !== "string" || value.length > 120) return undefined;
  const list = value.split(",");
  return list.length <= 4 && list.every((codec) => CODEC.test(codec)) ? value : undefined;
};
// Twitch's quality names (160p30 to 1080p60, audio_only), without " (source)"
const QUALITY = /^(?:[0-9]{3,4}p[0-9]{0,3}|audio_only|chunked)$/;
const BACKUPS = Object.values(StreamType) as string[];
const httpStatus: Check = (value) => (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 999 ? value : undefined);
// seconds with a sign, 2 decimals
const offset: Check = (value) => (typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 3600 ? Math.round(value * 100) / 100 || 0 : undefined);
export const OUTCOMES = ["clean", "ads", "behind", "noMaster", "noToken", "status"];
const FIELDS: Record<DiagType, Record<string, Check>> = {
  load: { player: matching(/^(?:[0-9a-f]{1,64}|unknown)$/), worker: oneOf("injected", "fallback") },
  breakStart: { kind: oneOf("stitched", "csai"), roll: oneOf("preroll", "midroll", "unknown"), declared: seconds, quality: matching(QUALITY) },
  breakEnd: {
    result: oneOf("blocked", "passed"),
    seconds,
    backup: oneOf(...BACKUPS),
    quality: matching(QUALITY),
    replaced: count,
    blanked: count,
    restarts: count,
    firstCleanMs: count,
    tried: count,
  },
  adPassed: { via: oneOf("segments", "ui"), segments: count },
  stall: { track: oneOf("video", "audio", "both", "unknown"), seconds, purple: flag, hidden: flag },
  restart: { why: oneOf("sequenceBack", "segmentRepeat"), count },
  decode: {
    codec: codecs,
    width: count,
    height: count,
    dropped: count,
    corrupted: count,
    total: count,
  },
  playerError: { code: either(count, matching(/^(?:[0-9]{1,6}|unknown)$/)), source: oneOf("media", "twitch") },
  error: { name: (value) => matching(ERROR_NAME)(value) ?? "Error", where: oneOf("playlist", "usher", "diagnostics") },
  backupTry: { backup: oneOf(...BACKUPS), outcome: oneOf(...OUTCOMES), status: httpStatus, ms: count },
  request: { what: oneOf("token", "usher", "playlist", "integrity"), status: httpStatus, backup: oneOf(...BACKUPS) },
  avsync: { offset, moment: oneOf("breakStart", "breakEnd", "restart", "periodic") },
  quality: { name: either(matching(QUALITY), oneOf("auto")) },
  token: { hideAds: flag, showAds: flag, serverAds: flag, adblock: flag },
  conflict: { what: oneOf("worker", "fetch", "xhr"), when: oneOf("before", "after") },
};

// the keys of each type, the table the store and the formatter keep too (platform/src/app/diagnostics.js,
// platform/src/common/js/diag-format.js; a test keeps the three equal)
export const DATA_KEYS: Record<DiagType, string[]> = Object.fromEntries(Object.entries(FIELDS).map(([type, fields]) => [type, Object.keys(fields)])) as any;

const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

// A Twitch login: lower case letters, digits and _; anything else is no channel ("", dropped by the store)
export const normalizeChannel = (value: unknown): string => {
  const channel = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[a-z0-9_]{1,25}$/.test(channel) ? channel : "";
};

// The entry as the log keeps it, or null when its type, time or level is not one of the contract's. Keys outside the
// type's list and values that do not pass its check are left out.
export function sanitizeEntry(raw: any): DiagEntry | null {
  if (!raw || typeof raw.type !== "string" || !own(FIELDS, raw.type)) return null;
  if (typeof raw.at !== "number" || !Number.isFinite(raw.at) || !LEVELS.includes(raw.level)) return null;
  const type = raw.type as DiagType;
  const data: Record<string, DiagValue> = {};
  if (raw.data && typeof raw.data === "object") {
    for (const [key, check] of Object.entries(FIELDS[type])) {
      if (!own(raw.data, key)) continue;
      const value = check(raw.data[key]);
      if (value !== undefined) data[key] = value;
    }
  }
  const entry: DiagEntry = { at: Math.round(raw.at), channel: normalizeChannel(raw.channel), level: raw.level, type };
  if (Object.keys(data).length) entry.data = data;
  return entry;
}

// The Twitch player's build: the hash in the name of the IVS worker script the original worker imports
// (importScripts('.../amazon-ivs-wasmworker.min-<hash>.js'), B-017), else in the worker's URL; "unknown" without one.
// Its first 12 characters, like a short commit hash: the whole hash (20 or more) read as a token to the store's
// scrubber, and the export showed `player=<id>` (Firefox 157, 2026-11-21)
const PLAYER_BUILD_LENGTH = 12;
export function playerBuild(script: string | null, url = ""): string {
  const pattern = /amazon-ivs-wasmworker\.min-([0-9a-f]{1,64})\.js/i;
  const match = pattern.exec(script ?? "") ?? pattern.exec(url);
  return match ? match[1].toLowerCase().slice(0, PLAYER_BUILD_LENGTH) : "unknown";
}

// twitch.tv paths that are not a channel
const NOT_CHANNELS = new Set(["directory", "search", "settings", "videos", "downloads", "subscriptions", "inventory", "wallet", "drops", "turbo", "p", "store", "jobs", "friends", "messages", "following", "embed", "moderator"]);

// The channel of a twitch.tv path: /<channel>, /<channel>/..., /popout/<channel>/..., /moderator/<channel>
export function channelFromPath(pathname: string): string {
  const parts = String(pathname ?? "").split("/").filter(Boolean);
  const first = (parts[0] ?? "").toLowerCase();
  const candidate = first === "popout" || first === "moderator" || first === "embed" ? parts[1] : NOT_CHANNELS.has(first) ? "" : parts[0];
  return normalizeChannel(candidate ?? "");
}

// Twitch's player overlays (e2e/twitch_selectors.py)
export const AD_UI = '[data-a-target="video-ad-label"], [data-a-target="video-ad-countdown"]';
export const PLAYER_ERROR = '[data-a-target="player-overlay-content-gate"]';

// entries wait up to this long to be posted together (error entries go at once)
export const FLUSH_MS = 1000;
// without a setSettings by then (the userscript gets none), the entries go with the default (on)
export const SETTINGS_WAIT_MS = 5000;
// the main <video> is looked at this often while one exists
export const TICK_MS = 1000;
// stalls: shorter ones and the first seconds after a load are not written; one that goes on is written at the cap
export const MIN_STALL_MS = 500;
export const LOAD_GRACE_MS = 5000;
export const LONG_STALL_MS = 60_000;
// a stall this close to Purple's own pause and play (E6, F-24, F-28) is marked `purple`
export const PURPLE_MS = 3000;
// the picture stands still while the time moves for this long: a stall of the video track
export const FROZEN_MS = 2000;
// what the player decodes, again while playing when frames were dropped or corrupted since
export const DECODE_MS = 300_000;
// ads that reached the viewer: one entry per window (the segments of the window after the first entry come at its end)
export const PASSED_MS = 30_000;
// a channel the worker said is whitelisted (each poll) counts as such for this long
export const WHITELIST_MS = 10_000;
// the same channel's load from another worker this soon after (two workers on a direct load, B-017) is the same load
export const LOAD_SAME_MS = 10_000;
// a client-side break's start waits this long for the roll of the ad request the page blocks (bp, F-04)
export const CSAI_ROLL_MS = 10_000;
// the same failed request (what, status, backup) of a channel is written once in this long
export const REQUEST_SAME_MS = 60_000;
// the gap between the audio and the video buffered: measured this long after a break's start and end and after a
// restart; written again every AV_PERIOD_MS while it is over AV_LIMIT_S
export const AV_DELAY_MS = 2000;
export const AV_PERIOD_MS = 300_000;
export const AV_LIMIT_S = 0.5;
// the player's quality: at most one entry in this long (the last one of the window at its end)
export const QUALITY_MS = 10_000;
const QUEUE_LIMIT = 500;
const SOURCE_URLS = 16;
const RECENT_SOURCES = 8;
const EDGE_S = 0.1;
// media events of the main <video> (they do not bubble: a capturing listener on the document sees them)
const MEDIA_EVENTS = ["loadstart", "emptied", "waiting", "playing", "pause", "seeking", "error"];

export type Timers = {
  now: () => number;
  setTimeout: (run: () => void, ms: number) => unknown;
  clearTimeout: (id: unknown) => void;
  setInterval: (run: () => void, ms: number) => unknown;
  clearInterval: (id: unknown) => void;
};

export type DiagnosticsDeps = {
  window: any; // location, MediaSource, SourceBuffer, URL
  document: any;
  post: (entries: DiagEntry[]) => void;
  timers?: Partial<Timers>;
};

type Kind = "stitched" | "csai";
type Track = "video" | "audio" | "both" | "unknown";
// what the worker's adState says at a break's start
export type BreakInfo = { kind?: Kind; roll?: string; declared?: number; quality?: string };
type Break = {
  start: number;
  channel: string;
  info: BreakInfo;
  roll?: string; // the client-side break's, from the page's blocked request
  backup?: string;
  quality?: string;
  replaced: number;
  blanked: number;
  restarts: number;
  passed: boolean;
  silent: boolean;
  tried: Set<string>; // the backup types asked
  tries: Set<string>; // type and outcome already written
  firstCleanAt?: number;
  started: boolean; // breakStart written
  startTimer: unknown;
};
type Hooked = Partial<Record<"worker" | "fetch" | "xhr", boolean>>;
type Counters = { dropped: number; corrupted: number; total: number };
type MediaState = {
  loadAt: number;
  lastTime: number | null;
  lastTickAt: number;
  stall: { start: number; track: Track; purple: boolean; hidden: boolean } | null;
  stuck: boolean; // a stall written at LONG_STALL_MS: no other one until the time moves
  frames: number | null;
  framesAt: number;
  frozen: { start: number; purple: boolean } | null;
  decode: { codec: string; width: number; height: number; at: number } | null;
  base: Counters;
};

const codecsOf = (mime: string | undefined) => {
  const match = /codecs\s*=\s*"?([^";]+)"?/i.exec(mime ?? "");
  return match ? match[1].split(",").map((codec) => codec.trim()).filter(Boolean) : [];
};
const kindOf = (mime: string | undefined): Track => {
  const text = String(mime ?? "");
  const audio = AUDIO.test(text);
  const video = VIDEO.test(text) || (!audio && /^video\//i.test(text));
  return audio && video ? "both" : video ? "video" : audio ? "audio" : "unknown";
};
// "1080p60 (source)" -> "1080p60"
const qualityName = (quality: unknown) => (typeof quality === "string" ? quality.replace(/\s*\(source\)\s*$/i, "").trim() || undefined : undefined);
// a function whose source is the browser's own
const isNative = (fn: unknown) => {
  try {
    return /\[native code\]/.test(Function.prototype.toString.call(fn));
  } catch {
    return false;
  }
};

export class Diagnostics {
  private enabled = true;
  private settingsKnown = false;
  private failed = false;
  private readonly startedAt: number;
  private queue: DiagEntry[] = [];
  private flushTimer: unknown = null;

  private whitelist = new Set<string>();
  private whitelistedAt = new Map<string, number>();
  private lastChannel = "";
  private workers = new WeakMap<object, { player: string; channel: string }>();
  private loads = new Map<string, number>();
  private blocking = new Map<object, BreakInfo>();
  private current: Break | null = null;
  private purpleAt = -Infinity;
  private passed: { until: number; pending: number; channel: string; timer: unknown } | null = null;
  private uiSeen = 0;
  private uiAt = -Infinity;
  private overlayShown = false;
  private requests = new Map<string, number>();
  private loadNow: { channel: string; token: boolean } | null = null;
  private notNative: string[] = [];
  private hooked: (() => Hooked) | null = null;
  private avTimers = new Map<string, unknown>();
  private av = { bad: false, at: -Infinity };
  private quality: { written?: string; at: number; pending?: string; timer: unknown } = { at: -Infinity, timer: null };

  private bufferTypes = new WeakMap<object, string>();
  private sources = new WeakMap<object, object[]>();
  private recentSources: any[] = [];
  private sourceUrls = new Map<string, object>();
  private interval: unknown = null;
  private video: any = null;
  private media: MediaState;

  private readonly timers: Timers;

  constructor(private readonly deps: DiagnosticsDeps) {
    const t = deps.timers ?? {};
    this.timers = {
      now: t.now ?? (() => Date.now()),
      setTimeout: t.setTimeout ?? ((run, ms) => globalThis.setTimeout(run, ms)),
      clearTimeout: t.clearTimeout ?? ((id) => globalThis.clearTimeout(id as any)),
      setInterval: t.setInterval ?? ((run, ms) => globalThis.setInterval(run, ms)),
      clearInterval: t.clearInterval ?? ((id) => globalThis.clearInterval(id as any)),
    };
    this.startedAt = this.now();
    this.media = this.freshMedia();
  }

  // ---- inputs from index.ts

  // the content script's setSettings: `diagnostics` (default on) and the whitelist
  setSettings(value: any) {
    this.guard(() => {
      const was = this.enabled;
      this.enabled = value?.diagnostics !== false;
      this.settingsKnown = true;
      this.whitelist = new Set((Array.isArray(value?.whitelist) ? value.whitelist : []).map(normalizeChannel).filter(Boolean));
      this.whitelistedAt.clear();
      if (!this.enabled) return this.stop();
      if (!was) this.watch();
      // what waited for the settings goes now
      this.flush();
    });
  }

  // a worker the page created: with Purple's code (the original script read) or without it (fallback)
  workerCreated(worker: object, script: string | null, url: string) {
    this.guard(() => {
      const player = playerBuild(script, url);
      this.workers.set(worker, { player, channel: "" });
      if (script === null) {
        this.add("load", "warn", { player, worker: "fallback" });
        this.afterLoad(this.channel());
      }
    });
  }

  workerEvent(worker: object, event: any) {
    this.guard(() => {
      if (!this.enabled || !event || typeof event.type !== "string") return;
      const info = this.workers.get(worker);
      const named = normalizeChannel(event.channel);
      if (named) {
        this.lastChannel = named;
        if (info) info.channel = named;
      }
      const channel = named || info?.channel || this.channel();
      const current = this.current;
      switch (event.type) {
        case "channelLoaded":
          return this.load(worker, channel);
        case "whitelisted":
          if (channel) this.whitelistedAt.set(channel, this.now());
          return;
        case "backupUsed":
          if (current) {
            current.backup = typeof event.playerType === "string" ? event.playerType : undefined;
            current.quality = qualityName(event.quality);
          }
          return;
        case "segmentsReplaced":
          if (current) current.replaced += Number(count(event.count) ?? 0);
          return;
        case "blankInserted":
          if (current) current.blanked += Number(count(event.count) ?? 0);
          return;
        case "sequenceRestart":
        case "segmentRepeat":
          this.purpleAt = this.now();
          if (current) current.restarts++;
          this.scheduleAv("restart");
          return this.add("restart", "info", { why: event.type === "sequenceRestart" ? "sequenceBack" : "segmentRepeat", count: event.count }, channel);
        case "adPassed":
          return this.passedSegments(Number(count(event.count) ?? 0), channel);
        case "error":
          return this.add("error", "error", { name: event.name, where: event.where }, channel);
        case "backupTried":
          return this.backupTried(event);
        case "playlistClean":
          if (current && current.firstCleanAt == null) current.firstCleanAt = this.now();
          return;
        case "requestFailed":
          return this.requestFailed(event, channel);
        case "tokenFlags":
          return this.tokenFlags(event, channel);
      }
    });
  }

  // a worker's main playlist entered or left a break Purple blocks (F-30); the page is in a break while any worker is.
  // `info`: what the worker's adState says of the break at its start (kind, roll, announced length, quality)
  adState(worker: object, blocking: boolean, info?: any) {
    this.guard(() => {
      if (blocking) {
        const kind = info?.kind === "stitched" || info?.kind === "csai" ? info.kind : undefined;
        this.blocking.set(worker, { kind, roll: info?.roll, declared: info?.declared, quality: qualityName(info?.quality) });
      } else this.blocking.delete(worker);
      if (this.blocking.size && !this.current && this.enabled) this.startBreak(worker);
      else if (!this.blocking.size && this.current) this.endBreak();
    });
  }

  // Purple's own pause and play or reload of the player (E6, F-15, F-24, F-28)
  purpleRestart() {
    this.guard(() => {
      this.purpleAt = this.now();
      this.scheduleAv("restart");
    });
  }

  // the page's ad request Purple answered (F-04) and its `bp` (preroll, midroll): the roll of a client-side break
  csaiBlocked(bp: unknown) {
    this.guard(() => {
      const current = this.current;
      if (!this.enabled || !current || current.started || current.info.kind !== "csai") return;
      current.roll = bp === "preroll" || bp === "midroll" ? bp : "unknown";
      this.writeStart();
    });
  }

  // the player's quality (PlayerQualityChanged, or its `quality` state): its name or auto, when it changes, at most
  // once every QUALITY_MS (the last one of a window at its end)
  qualityChanged(name: unknown) {
    this.guard(() => {
      if (!this.enabled || typeof name !== "string") return;
      const value = /^auto$/i.test(name.trim()) ? "auto" : qualityName(name);
      if (!value || (value !== "auto" && !QUALITY.test(value))) return;
      const state = this.quality;
      if (state.timer != null) {
        state.pending = value;
        return;
      }
      if (value === state.written) return;
      const wait = state.at + QUALITY_MS - this.now();
      if (wait <= 0) return this.writeQuality(value);
      state.pending = value;
      state.timer = this.timers.setTimeout(
        () =>
          this.guard(() => {
            state.timer = null;
            const pending = state.pending;
            state.pending = undefined;
            if (pending && pending !== state.written) this.writeQuality(pending);
          }),
        wait,
      );
    });
  }

  // the page's Worker, fetch and XMLHttpRequest.prototype.open before Purple replaces them: the ones another script
  // replaced first (their source is not native code)
  noteNatives(functions: Record<"worker" | "fetch" | "xhr", unknown>) {
    this.guard(() => {
      this.notNative = Object.entries(functions)
        .filter(([, fn]) => typeof fn === "function" && !isNative(fn))
        .map(([what]) => what);
    });
  }

  // whether Purple's Worker, fetch and XHR hooks are still the page's, asked at each load
  setHooked(check: () => Hooked) {
    this.hooked = check;
  }

  // a worker that ends takes its break with it
  workerGone(worker: object) {
    this.adState(worker, false);
  }

  // Hooks the Media Source (to know each SourceBuffer's type and the MediaSource behind a <video>) and listens to the
  // media events of the page. Installed when the bundle loads, before the player builds anything.
  install() {
    this.guard(() => {
      const self = this;
      const win = this.deps.window;
      const MediaSource = win?.MediaSource;
      const add = MediaSource?.prototype?.addSourceBuffer;
      if (typeof add === "function") {
        MediaSource.prototype.addSourceBuffer = function (this: any, type: string, ...rest: any[]) {
          const buffer = add.call(this, type, ...rest);
          self.guard(() => self.noteBuffer(this, buffer, type));
          return buffer;
        };
      }
      const changeType = win?.SourceBuffer?.prototype?.changeType;
      if (typeof changeType === "function") {
        win.SourceBuffer.prototype.changeType = function (this: any, type: string, ...rest: any[]) {
          const result = changeType.call(this, type, ...rest);
          self.guard(() => self.enabled && self.bufferTypes.set(this, String(type)));
          return result;
        };
      }
      const URLs = win?.URL;
      const create = URLs?.createObjectURL;
      if (typeof create === "function" && typeof MediaSource === "function") {
        URLs.createObjectURL = function (this: any, object: any, ...rest: any[]) {
          const url = create.call(this, object, ...rest);
          self.guard(() => self.noteObjectUrl(object, url));
          return url;
        };
      }
      for (const type of MEDIA_EVENTS) this.deps.document?.addEventListener?.(type, (event: any) => this.guard(() => this.onMedia(event)), true);
      // what is waiting goes before the page does
      win?.addEventListener?.("pagehide", () => this.flushNow());
    });
  }

  // the entries waiting for their batch, posted now (once the settings are known)
  flushNow() {
    this.guard(() => this.flush());
  }

  // ---- entries

  private now = () => this.timers.now();

  private channel() {
    return this.lastChannel || channelFromPath(this.deps.window?.location?.pathname ?? "");
  }

  private add(type: DiagType, level: DiagLevel, data: Record<string, unknown> = {}, channel = this.channel(), at = this.now()) {
    if (!this.enabled) return;
    const entry = sanitizeEntry({ at, channel, level, type, data });
    if (!entry) return;
    this.queue.push(entry);
    if (this.queue.length > QUEUE_LIMIT) this.queue.splice(0, this.queue.length - QUEUE_LIMIT);
    this.schedule(level === "error");
  }

  private ready() {
    return this.settingsKnown || this.now() - this.startedAt >= SETTINGS_WAIT_MS;
  }

  private schedule(now: boolean) {
    if (!this.queue.length) return;
    if (now && this.ready()) return this.flush();
    if (this.flushTimer != null) return;
    const wait = this.ready() ? FLUSH_MS : Math.max(FLUSH_MS, this.startedAt + SETTINGS_WAIT_MS - this.now());
    this.flushTimer = this.timers.setTimeout(() => {
      this.flushTimer = null;
      this.guard(() => this.flush());
    }, wait);
  }

  private flush() {
    if (!this.enabled) {
      this.queue = [];
      return;
    }
    if (!this.ready()) return this.schedule(false);
    if (this.flushTimer != null) {
      this.timers.clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    const entries = this.queue.splice(0);
    if (entries.length) this.deps.post(entries);
  }

  private guard(run: () => unknown) {
    try {
      run();
    } catch (e) {
      this.fail(e);
    }
  }

  // the first failure inside the diagnostics is written once; the player never sees it
  private fail(error: unknown) {
    if (this.failed) return;
    this.failed = true;
    try {
      this.add("error", "error", { name: (error as any)?.name, where: "diagnostics" });
    } catch {}
  }

  private stop() {
    this.queue = [];
    if (this.flushTimer != null) this.timers.clearTimeout(this.flushTimer);
    this.flushTimer = null;
    if (this.passed) this.timers.clearTimeout(this.passed.timer);
    this.passed = null;
    if (this.current) this.timers.clearTimeout(this.current.startTimer);
    this.current = null;
    for (const timer of this.avTimers.values()) this.timers.clearTimeout(timer);
    this.avTimers.clear();
    this.av = { bad: false, at: -Infinity };
    if (this.quality.timer != null) this.timers.clearTimeout(this.quality.timer);
    this.quality = { at: -Infinity, timer: null };
    this.unwatch();
    this.video = null;
  }

  private isWhitelisted(channel: string) {
    return this.whitelist.has(channel) || this.now() - (this.whitelistedAt.get(channel) ?? -Infinity) <= WHITELIST_MS;
  }

  private load(worker: object, channel: string) {
    const now = this.now();
    const last = this.loads.get(channel);
    this.media.loadAt = now;
    this.watch();
    if (last != null && now - last < LOAD_SAME_MS) return;
    this.loads.set(channel, now);
    if (this.loads.size > 32) this.loads.delete(this.loads.keys().next().value!);
    this.add("load", "info", { player: this.workers.get(worker)?.player ?? "unknown", worker: "injected" }, channel);
    this.afterLoad(channel);
  }

  // the lines that go with a load: the scripts that replaced Purple's hooks, before Purple or since; the next token
  // flags of the channel
  private afterLoad(channel: string) {
    this.loadNow = { channel, token: false };
    for (const what of this.notNative) this.add("conflict", "warn", { what, when: "before" }, channel);
    let hooked: Hooked = {};
    try {
      hooked = this.hooked?.() ?? {};
    } catch {
      hooked = {};
    }
    for (const what of ["worker", "fetch", "xhr"] as const) if (hooked[what] === false) this.add("conflict", "warn", { what, when: "after" }, channel);
  }

  // the ad flags of the page's own token, once per load
  private tokenFlags(event: any, channel: string) {
    const load = this.loadNow;
    if (!load || load.channel !== channel || load.token || !event.flags || typeof event.flags !== "object") return;
    load.token = true;
    const { hideAds, showAds, serverAds, adblock } = event.flags;
    this.add("token", "info", { hideAds, showAds, serverAds, adblock }, channel);
  }

  // a request of the worker that failed; the same one of a channel once every REQUEST_SAME_MS. A network error is an
  // error; an integrity token missing (status 0 too) and an HTTP status are warnings
  private requestFailed(event: any, channel: string) {
    const what = event.what;
    if (!["token", "usher", "playlist", "integrity"].includes(what)) return;
    const status = httpStatus(event.status) ?? 0;
    const backup = typeof event.playerType === "string" && BACKUPS.includes(event.playerType) ? event.playerType : undefined;
    const key = `${channel}|${what}|${status}|${backup ?? ""}`;
    const now = this.now();
    if (now - (this.requests.get(key) ?? -Infinity) < REQUEST_SAME_MS) return;
    this.requests.set(key, now);
    if (this.requests.size > 200) for (const [old, at] of this.requests) if (now - at >= REQUEST_SAME_MS) this.requests.delete(old);
    const data: Record<string, unknown> = { what, status };
    if (backup) data.backup = backup;
    this.add("request", status === 0 && what !== "integrity" ? "error" : "warn", data, channel);
  }

  private writeQuality(name: string) {
    this.quality.written = name;
    this.quality.at = this.now();
    this.add("quality", "info", { name });
  }

  // ---- breaks

  private startBreak(worker: object) {
    const channel = this.workers.get(worker)?.channel || this.channel();
    const info = this.blocking.get(worker) ?? {};
    const silent = this.isWhitelisted(channel);
    const current: Break = { start: this.now(), channel, info, replaced: 0, blanked: 0, restarts: 0, passed: false, silent, tried: new Set(), tries: new Set(), started: false, startTimer: null };
    this.current = current;
    if (silent) return;
    this.scheduleAv("breakStart");
    // a client-side break's roll comes with the ad request the page makes after it (B-033)
    if (info.kind === "csai" && !info.roll) current.startTimer = this.timers.setTimeout(() => this.guard(() => this.writeStart()), CSAI_ROLL_MS);
    else this.writeStart();
  }

  // breakStart, at the break's start: its kind, roll (unknown when neither the playlist nor the ad request said it),
  // the length its pod is announced to last and the player's quality
  private writeStart() {
    const current = this.current;
    if (!current || current.started || current.silent) return;
    current.started = true;
    this.timers.clearTimeout(current.startTimer);
    const { kind, declared, quality } = current.info;
    const data: Record<string, unknown> = {};
    if (kind) data.kind = kind;
    data.roll = current.info.roll ?? current.roll ?? "unknown";
    if (declared != null) data.declared = declared;
    if (quality) data.quality = quality;
    this.add("breakStart", "info", data, current.channel, current.start);
  }

  private endBreak() {
    const current = this.current!;
    if (current.silent || this.isWhitelisted(current.channel)) {
      this.timers.clearTimeout(current.startTimer);
      this.current = null;
      return;
    }
    this.writeStart();
    this.current = null;
    this.flushPassed(true);
    const now = this.now();
    const data: Record<string, unknown> = {
      result: current.passed ? "passed" : "blocked",
      seconds: (now - current.start) / 1000,
      replaced: current.replaced,
      blanked: current.blanked,
      restarts: current.restarts,
      tried: current.tried.size,
    };
    if (current.backup) data.backup = current.backup;
    if (current.quality) data.quality = current.quality;
    if (current.firstCleanAt != null) data.firstCleanMs = current.firstCleanAt - current.start;
    this.add("breakEnd", current.passed ? "warn" : "info", data, current.channel);
    this.scheduleAv("breakEnd");
  }

  // a backup type's outcome in the break: written the first time the break sees it, with the time since its start
  private backupTried(event: any) {
    const current = this.current;
    const type = event.playerType;
    if (!current || current.silent || typeof type !== "string" || !BACKUPS.includes(type) || !OUTCOMES.includes(event.outcome)) return;
    current.tried.add(type);
    const key = `${type}|${event.outcome}`;
    if (current.tries.has(key)) return;
    current.tries.add(key);
    const data: Record<string, unknown> = { backup: type, outcome: event.outcome, ms: this.now() - current.start };
    if (event.outcome === "status") data.status = httpStatus(event.status) ?? 0;
    this.add("backupTry", event.outcome === "clean" ? "info" : "warn", data, current.channel);
  }

  // ad segments the player got (the worker counts each once): one entry at once, the ones after it in the same
  // PASSED_MS window in one entry at its end
  private passedSegments(segments: number, channel: string) {
    if (segments <= 0 || this.isWhitelisted(channel)) return;
    if (this.current) this.current.passed = true;
    const now = this.now();
    if (this.passed && now < this.passed.until && this.passed.channel === channel) {
      this.passed.pending += segments;
      return;
    }
    this.flushPassed(true);
    this.add("adPassed", "warn", { via: "segments", segments }, channel);
    this.openPassed(channel, now);
  }

  private openPassed(channel: string, now: number) {
    this.passed = { until: now + PASSED_MS, pending: 0, channel, timer: this.timers.setTimeout(() => this.guard(() => this.flushPassed(false)), PASSED_MS) };
  }

  // the window's pending segments; `last`: no window after it
  private flushPassed(last: boolean) {
    const open = this.passed;
    if (!open) return;
    this.timers.clearTimeout(open.timer);
    this.passed = null;
    if (!open.pending || this.isWhitelisted(open.channel)) return;
    this.add("adPassed", "warn", { via: "segments", segments: open.pending }, open.channel);
    if (!last) this.openPassed(open.channel, this.now());
  }

  // ---- Media Source

  private noteBuffer(source: any, buffer: any, type: string) {
    if (!this.enabled || !buffer || typeof buffer !== "object") return;
    this.bufferTypes.set(buffer, String(type));
    const list = this.sources.get(source) ?? [];
    list.push(buffer);
    this.sources.set(source, list);
    if (!this.recentSources.includes(source)) {
      this.recentSources.push(source);
      if (this.recentSources.length > RECENT_SOURCES) this.recentSources.shift();
    }
  }

  private noteObjectUrl(object: any, url: unknown) {
    const MediaSource = this.deps.window?.MediaSource;
    if (!this.enabled || typeof url !== "string" || typeof MediaSource !== "function" || !(object instanceof MediaSource)) return;
    this.sourceUrls.set(url, object);
    if (this.sourceUrls.size > SOURCE_URLS) this.sourceUrls.delete(this.sourceUrls.keys().next().value!);
  }

  // the MediaSource behind a <video>: by its blob URL or srcObject, else the newest one not closed that has
  // SourceBuffers (on Firefox the video was not found by its URL and the page had more than one open, so the decode
  // line went without its codec, 2026-11-21)
  private sourceOf(video: any): any {
    const object = video?.srcObject;
    if (object && this.sources.has(object)) return object;
    const src = video?.currentSrc || video?.src;
    if (src && this.sourceUrls.has(src)) return this.sourceUrls.get(src);
    const open = this.recentSources.filter((source) => source?.readyState !== "closed" && (this.sources.get(source)?.length ?? 0) > 0);
    return open.length ? open[open.length - 1] : null;
  }

  private buffersOf(video: any): { buffer: any; type: string }[] {
    const source = this.sourceOf(video);
    return (source ? this.sources.get(source) ?? [] : []).map((buffer) => ({ buffer, type: this.bufferTypes.get(buffer) ?? "" }));
  }

  // the track that ran dry: the SourceBuffer with nothing left past the playhead; both when the one SourceBuffer holds
  // both tracks (fMP4) or when the audio's and the video's ran dry
  private trackOf(video: any): Track {
    const time = Number(video?.currentTime);
    let audio = false;
    let picture = false;
    for (const { buffer, type } of this.buffersOf(video)) {
      let dry: boolean;
      try {
        const ranges = buffer.buffered;
        dry = !ranges || ranges.length === 0 || ranges.end(ranges.length - 1) - time <= EDGE_S;
      } catch {
        continue; // a SourceBuffer the MediaSource removed
      }
      if (!dry) continue;
      const kind = kindOf(type);
      if (kind === "both") return "both";
      if (kind === "audio") audio = true;
      if (kind === "video") picture = true;
    }
    return audio && picture ? "both" : picture ? "video" : audio ? "audio" : "unknown";
  }

  // the codecs the main <video> decodes, from its SourceBuffers' types, the video's first
  private codecOf(video: any): string {
    const buffers = this.buffersOf(video);
    const rank = (type: string) => (kindOf(type) === "audio" ? 1 : 0);
    const codecs = buffers.sort((a, b) => rank(a.type) - rank(b.type)).flatMap(({ type }) => codecsOf(type));
    return [...new Set(codecs)].join(",").slice(0, 120);
  }

  // the audio SourceBuffer's buffered end minus the video's, with one of each (TS); none with one SourceBuffer for both
  private avOffset(video: any): number | null {
    const buffers = this.buffersOf(video);
    const audio = buffers.filter(({ type }) => kindOf(type) === "audio");
    const picture = buffers.filter(({ type }) => kindOf(type) === "video");
    if (audio.length !== 1 || picture.length !== 1) return null;
    const end = (buffer: any): number | null => {
      try {
        const ranges = buffer.buffered;
        return ranges && ranges.length ? Number(ranges.end(ranges.length - 1)) : null;
      } catch {
        return null;
      }
    };
    const audioEnd = end(audio[0].buffer);
    const videoEnd = end(picture[0].buffer);
    return audioEnd == null || videoEnd == null || !Number.isFinite(audioEnd - videoEnd) ? null : audioEnd - videoEnd;
  }

  // the gap AV_DELAY_MS after the moment; a moment again before then measures once, after the last
  private scheduleAv(moment: "breakStart" | "breakEnd" | "restart") {
    if (!this.enabled) return;
    const previous = this.avTimers.get(moment);
    if (previous != null) this.timers.clearTimeout(previous);
    this.avTimers.set(
      moment,
      this.timers.setTimeout(
        () =>
          this.guard(() => {
            this.avTimers.delete(moment);
            this.measureAv(moment);
          }),
        AV_DELAY_MS,
      ),
    );
  }

  // `periodic`: written only while the gap is over AV_LIMIT_S
  private measureAv(moment: "breakStart" | "breakEnd" | "restart" | "periodic") {
    if (!this.enabled) return;
    const video = this.mainVideo();
    const gap = video ? this.avOffset(video) : null;
    this.av.at = this.now();
    if (gap == null) {
      this.av.bad = false;
      return;
    }
    const bad = Math.abs(gap) > AV_LIMIT_S;
    this.av.bad = bad;
    if (moment === "periodic" && !bad) return;
    this.add("avsync", bad ? "warn" : "info", { offset: gap, moment });
  }

  // ---- the main <video>

  private freshMedia(): MediaState {
    return { loadAt: this.now(), lastTime: null, lastTickAt: this.now(), stall: null, stuck: false, frames: null, framesAt: this.now(), frozen: null, decode: null, base: { dropped: 0, corrupted: 0, total: 0 } };
  }

  // the Twitch player's <video>: the largest one (picture-by-picture has a smaller one), the first on a tie
  private mainVideo(): any {
    const videos = [...(this.deps.document?.querySelectorAll?.("video") ?? [])];
    let best: any = null;
    let bestArea = -1;
    for (const video of videos) {
      const rect = video.getBoundingClientRect?.();
      const area = rect ? Math.max(0, rect.width) * Math.max(0, rect.height) : 0;
      if (area > bestArea) {
        best = video;
        bestArea = area;
      }
    }
    return best;
  }

  private follow(video: any) {
    if (video === this.video) return;
    this.video = video;
    this.media = this.freshMedia();
  }

  private watch() {
    if (this.interval != null || !this.enabled) return;
    this.interval = this.timers.setInterval(() => this.guard(() => this.tick()), TICK_MS);
  }

  private unwatch() {
    if (this.interval == null) return;
    this.timers.clearInterval(this.interval);
    this.interval = null;
  }

  private onMedia(event: any) {
    if (!this.enabled) return;
    const target = event?.target;
    if (!target || String(target.tagName ?? "").toUpperCase() !== "VIDEO") return;
    this.watch();
    if (target !== this.mainVideo()) return;
    this.follow(target);
    const media = this.media;
    switch (event.type) {
      case "loadstart":
      case "emptied": {
        this.endStall(this.now());
        this.endFrozen(this.now(), true);
        media.loadAt = this.now();
        media.decode = null;
        media.frames = null;
        media.stuck = false;
        // the next decode entry counts from here (the element's counters may go on across loads)
        const quality = typeof target.getVideoPlaybackQuality === "function" ? target.getVideoPlaybackQuality() : null;
        if (quality) media.base = { dropped: Number(quality.droppedVideoFrames) || 0, corrupted: Number(quality.corruptedVideoFrames) || 0, total: Number(quality.totalVideoFrames) || 0 };
        return;
      }
      case "waiting":
        return this.startStall(target, this.now());
      case "playing":
        return this.endStall(this.now());
      case "pause":
      case "seeking":
        this.endStall(this.now());
        return this.endFrozen(this.now(), false);
      case "error": {
        const code = target.error?.code;
        return this.add("playerError", "error", { code: typeof code === "number" ? code : "unknown", source: "media" });
      }
    }
  }

  private startStall(video: any, start: number) {
    const media = this.media;
    if (media.stall || video.paused || video.seeking || video.ended || start - media.loadAt < LOAD_GRACE_MS) return;
    media.stall = { start, track: this.trackOf(video), purple: Math.abs(start - this.purpleAt) <= PURPLE_MS, hidden: this.deps.document?.visibilityState === "hidden" };
  }

  private endStall(end: number) {
    const stall = this.media.stall;
    if (!stall) return;
    this.media.stall = null;
    if (end - stall.start < MIN_STALL_MS) return;
    this.add("stall", "warn", { track: stall.track, seconds: (end - stall.start) / 1000, purple: stall.purple, hidden: stall.hidden }, this.channel(), stall.start);
  }

  // `drop`: the picture's state is unknown from here (a new load): nothing is written
  private endFrozen(end: number, drop: boolean) {
    const frozen = this.media.frozen;
    this.media.frozen = null;
    this.media.frames = null;
    if (!frozen || drop || end - frozen.start < MIN_STALL_MS) return;
    // never in a hidden tab (frozenCheck)
    this.add("stall", "warn", { track: "video", seconds: (end - frozen.start) / 1000, purple: frozen.purple, hidden: false }, this.channel(), frozen.start);
  }

  private tick() {
    if (!this.enabled) return this.unwatch();
    const video = this.mainVideo();
    if (!video) {
      this.video = null;
      return this.unwatch();
    }
    this.follow(video);
    const now = this.now();
    const media = this.media;
    const time = Number(video.currentTime);
    const active = !video.paused && !video.seeking && !video.ended;
    const moved = media.lastTime != null && time > media.lastTime;
    if (active) {
      if (moved) {
        this.endStall(now);
        media.stuck = false;
      } else if (media.stall && now - media.stall.start >= LONG_STALL_MS) {
        this.endStall(now);
        media.stuck = true;
      } else if (media.lastTime != null && !media.stall && !media.stuck && Number(video.readyState) < 3 && now - media.loadAt >= LOAD_GRACE_MS) {
        // a stall without a waiting event: since the last tick, or since the end of the load's first seconds
        this.startStall(video, Math.max(media.lastTickAt, media.loadAt + LOAD_GRACE_MS));
      }
    }
    const quality = typeof video.getVideoPlaybackQuality === "function" ? video.getVideoPlaybackQuality() : null;
    if (quality) {
      this.frozenCheck(video, quality, active, moved, now);
      this.decodeCheck(video, quality, active, now);
    }
    this.overlays(now);
    if (this.av.bad && now - this.av.at >= AV_PERIOD_MS) this.measureAv("periodic");
    media.lastTime = time;
    media.lastTickAt = now;
  }

  // the picture stands still while the time moves (Chromium stops decoding the picture of a hidden tab, and the
  // audio-only quality has no picture: not then)
  private frozenCheck(video: any, quality: any, active: boolean, moved: boolean, now: number) {
    const media = this.media;
    const hidden = this.deps.document?.visibilityState === "hidden";
    if (hidden || !Number(video.videoWidth)) return this.endFrozen(now, true);
    if (!active) return this.endFrozen(now, false);
    const frames = Number(quality.totalVideoFrames);
    if (media.frames == null || frames !== media.frames) {
      this.endFrozen(now, false);
      media.frames = frames;
      media.framesAt = now;
      return;
    }
    if (media.frozen || media.stall || !moved || now - media.framesAt < FROZEN_MS || media.framesAt - media.loadAt < LOAD_GRACE_MS) return;
    media.frozen = { start: media.framesAt, purple: Math.abs(media.framesAt - this.purpleAt) <= PURPLE_MS };
  }

  // at the first frames of a load, when the picture size or the codecs change, and at most every DECODE_MS while
  // playing when frames were dropped or corrupted; the counts since the entry before
  private decodeCheck(video: any, quality: any, active: boolean, now: number) {
    const media = this.media;
    const width = Number(video.videoWidth) || 0;
    const height = Number(video.videoHeight) || 0;
    const current: Counters = { dropped: Number(quality.droppedVideoFrames) || 0, corrupted: Number(quality.corruptedVideoFrames) || 0, total: Number(quality.totalVideoFrames) || 0 };
    if (!width || !current.total) return;
    const base = current.total < media.base.total || current.dropped < media.base.dropped || current.corrupted < media.base.corrupted ? { dropped: 0, corrupted: 0, total: 0 } : media.base;
    const codec = this.codecOf(video);
    const last = media.decode;
    const grew = current.dropped > base.dropped || current.corrupted > base.corrupted;
    const due = !last || last.width !== width || last.height !== height || last.codec !== codec || (active && grew && now - last.at >= DECODE_MS);
    if (!due) return;
    const data: Record<string, unknown> = { width, height, dropped: current.dropped - base.dropped, corrupted: current.corrupted - base.corrupted, total: current.total - base.total };
    if (codec) data.codec = codec;
    this.add("decode", "info", data);
    media.decode = { codec, width, height, at: now };
    media.base = current;
  }

  // Twitch's ad UI while no worker is in a break (twice in a row, so a break's first poll is not taken for it), and
  // its error overlay: the #NNNN number only
  private overlays(now: number) {
    const doc = this.deps.document;
    const ui = doc?.querySelector?.(AD_UI) != null;
    if (!ui || this.blocking.size || this.isWhitelisted(this.channel())) this.uiSeen = 0;
    else if (++this.uiSeen >= 2 && now - this.uiAt >= PASSED_MS) {
      this.uiAt = now;
      this.add("adPassed", "warn", { via: "ui" });
    }
    const overlay = doc?.querySelector?.(PLAYER_ERROR);
    if (overlay && !this.overlayShown) {
      const number = /#\s?(\d{1,6})\b/.exec(String(overlay.textContent ?? ""))?.[1];
      this.add("playerError", "error", { code: number ? Number(number) : "unknown", source: "twitch" });
    }
    this.overlayShown = overlay != null;
  }
}
