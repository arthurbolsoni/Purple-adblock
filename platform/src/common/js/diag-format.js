// F-31 (T-607): the .txt the viewer saves from the popup to attach to an issue: a header, then one line per entry of
// the diagnostic log (app/diagnostics.js). A classic script for the popup and export pages. Every entry goes through
// PurpleDiagnostics.sanitize when that script is loaded, else through the same checks here, so the file holds no URL,
// token, id or IP address even when the entries did not come from the store.
(function (root) {
  "use strict";

  // the stored settings and their defaults: the "Settings (`Setting`)" table of docs/feat.md (a test keeps them
  // equal), with F-09's backupPlayerTypes order
  const DEFAULTS = Object.freeze({
    whitelist: [],
    toggleProxy: true,
    proxyUrl: "",
    debug: false,
    blockCsai: true,
    forcePopoutToken: true,
    backupPlayerTypes: ["site", "popout", "frontpage", "mobile_web", "embed", "picture-by-picture"],
    lowQualityFallback: true,
    pinBackupPlayerType: true,
    stripFallback: true,
    reloadAfterAd: false,
    pausePlayDelayMs: 0,
    prewarmBackups: true,
    stripAdMarkers: true,
    pausePlayOnBreaks: false,
    prewarmAtLoad: true,
    alignBackupSequence: true,
    alignByLiveSequence: true,
    restartOnSequenceBack: true,
    restartOnRepeat: true,
    skipBackupBehind: true,
    parallelBackupFetch: true,
    widenBufferRemovals: true,
    adBadge: true,
    diagnostics: true,
  });

  // the same checks as PurpleDiagnostics.sanitize (app/diagnostics.js; a test keeps the two equal)
  const HOUR_MS = 60 * 60 * 1000;
  const DAY_MS = 24 * HOUR_MS;
  const OLDEST_MS = 8 * DAY_MS;
  const NEWEST_MS = HOUR_MS;
  const CHANNEL = /^[a-z0-9_]{1,25}$/;
  const KEY = /^[a-zA-Z]{1,24}$/;
  const LEVELS = ["info", "warn", "error"];
  const DATA_KEYS = {
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
  const MAX_KEYS = 12;
  const MAX_STRING = 120;
  const MAX_INPUT = 1000;
  const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g;
  const LINK = /[a-z][a-z0-9+.-]*:\/\/\S*/gi;
  const HOST = /(?:[a-z0-9-]+\.)+(?:net|com|tv|org|io|live|cloud|aws)(?::\d+)?(?:\/\S*)?/gi;
  const TOKEN = /[A-Za-z0-9+/=_-]{20,}/g;
  const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const IPV4 = /\d{1,3}(?:\.\d{1,3}){3}/g;
  const IPV6 = /[0-9a-f]*(?::[0-9a-f]*){2,}/gi;
  const isIpv6 = (text) => /[0-9a-f]/i.test(text) && (text.includes("::") || text.split(":").length > 3);

  const scrubOnce = (text) =>
    text
      .replace(CONTROL, " ")
      .replace(LINK, "<url>")
      .replace(HOST, "<url>")
      .replace(TOKEN, (run) => (/[0-9+/=]/.test(run) ? "<id>" : run))
      .replace(UUID, "<id>")
      .replace(IPV4, "<ip>")
      .replace(IPV6, (match) => (isIpv6(match) ? "<ip>" : match));

  function scrub(value) {
    let text = String(value);
    if (text.length > MAX_INPUT) text = text.slice(0, MAX_INPUT).replace(/[^\s<>]*$/, "");
    for (let i = 0; i < 8; i++) {
      const next = scrubOnce(text).slice(0, MAX_STRING);
      if (next === text) return text;
      text = next;
    }
    return "<redacted>";
  }

  const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

  function localSanitize(entry, now) {
    try {
      if (!isRecord(entry)) return null;
      const clock = Number.isFinite(now) ? now : Date.now();
      const { at, channel, level, type, data } = entry;
      if (typeof at !== "number" || !Number.isFinite(at) || at < clock - OLDEST_MS || at > clock + NEWEST_MS) return null;
      if (typeof channel !== "string" || !CHANNEL.test(channel)) return null;
      if (!LEVELS.includes(level) || !Object.prototype.hasOwnProperty.call(DATA_KEYS, type)) return null;
      const clean = { at, channel, level, type };
      if (isRecord(data)) {
        const known = DATA_KEYS[type];
        const kept = {};
        let count = 0;
        for (const key of Object.keys(data)) {
          if (count >= MAX_KEYS) break;
          if (!KEY.test(key) || !known.includes(key)) continue;
          const value = data[key];
          if (typeof value === "string") kept[key] = scrub(value);
          else if (typeof value === "number" && Number.isFinite(value)) kept[key] = value;
          else if (typeof value === "boolean") kept[key] = value;
          else continue;
          count++;
        }
        if (count) clean.data = kept;
      }
      return clean;
    } catch (e) {
      return null;
    }
  }

  const sanitizer = () => {
    const store = root.PurpleDiagnostics;
    return store && typeof store.sanitize === "function" ? store.sanitize : localSanitize;
  };

  // text for one line of the file: printable ASCII only, cut to 120 characters
  const plain = (value) => String(value).replace(CONTROL, " ").replace(/[^\x20-\x7e]/g, "?").slice(0, MAX_STRING);
  // the same, scrubbed like an entry's strings (values from the log and the settings)
  const ascii = (value) => plain(scrub(value));

  const formatters = new Map();
  function dateFormat(timeZone) {
    if (!formatters.has(timeZone)) {
      formatters.set(
        timeZone,
        new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      );
    }
    return formatters.get(timeZone);
  }

  // the time zone asked if Intl knows it, else the browser's, else UTC
  function zone(timeZone) {
    for (const candidate of [timeZone, safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone)]) {
      if (typeof candidate !== "string" || !candidate) continue;
      try {
        dateFormat(candidate);
        return candidate;
      } catch (e) {}
    }
    return "UTC";
  }

  function safe(read) {
    try {
      return read();
    } catch (e) {
      return undefined;
    }
  }

  const pad = (number, width) => String(number).padStart(width, "0");

  // the local wall time of `at` in `timeZone`, and its offset in minutes
  function local(at, timeZone) {
    const ms = Math.floor(at);
    const millis = ((ms % 1000) + 1000) % 1000;
    const parts = {};
    for (const part of dateFormat(timeZone).formatToParts(new Date(ms))) parts[part.type] = part.value;
    const wall = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    return { ...parts, ms: millis, offset: Math.round((wall - (ms - millis)) / 60000) };
  }

  const offsetText = (minutes) => `${minutes < 0 ? "-" : "+"}${pad(Math.floor(Math.abs(minutes) / 60), 2)}:${pad(Math.abs(minutes) % 60, 2)}`;

  // ISO 8601 in the time zone, with its offset: 2026-11-21T17:15:00.010-03:00 (without the milliseconds: `seconds`)
  function stamp(at, timeZone, seconds) {
    const t = local(at, timeZone);
    return `${t.year}-${t.month}-${t.day}T${t.hour}:${t.minute}:${t.second}${seconds ? "" : "." + pad(t.ms, 3)}${offsetText(t.offset)}`;
  }

  function value(data) {
    if (typeof data !== "string") return String(data);
    const text = ascii(data);
    return text === "" || /[\s"\\=]/.test(text) ? `"${text.replace(/["\\]/g, "\\$&")}"` : text;
  }

  function line(entry, timeZone) {
    const fields = Object.keys(entry.data || {}).map((key) => `${key}=${value(entry.data[key])}`);
    return `${stamp(entry.at, timeZone, false)} ${entry.level.toUpperCase().padEnd(5)} ${entry.type.padEnd(10)} ${fields.join(" ")}`.trimEnd();
  }

  // "key=value" of changedSettings(): the value scrubbed, not the key (setting names are long runs of letters)
  function setting(item) {
    const match = /^([a-zA-Z]{1,40})=([\s\S]*)$/.exec(String(item));
    return match ? `${match[1]}=${ascii(match[2])}` : ascii(item);
  }

  // a header value given by the popup (version, browser, system): not from the log, so only made plain
  const text = (data, fallback) => (data == null || data === "" ? fallback : plain(data));

  // the whole file: header lines starting with "# ", then one line per entry, oldest first; LF, a final newline
  function format(channel, entries, meta) {
    const info = isRecord(meta) ? meta : {};
    const now = Number.isFinite(info.now) ? info.now : Date.now();
    const timeZone = zone(info.timeZone);
    const name = typeof channel === "string" && CHANNEL.test(channel) ? channel : null;
    const clean = sanitizer();
    const list = (Array.isArray(entries) ? entries : [])
      .map((entry) => clean(entry, now))
      .filter((entry) => entry && entry.channel === name)
      .sort((a, b) => a.at - b.at);
    const loads = list.filter((entry) => entry.type === "load" && entry.data && entry.data.player != null);
    const player = loads.length ? ascii(loads[loads.length - 1].data.player) : "unknown";
    const settings = (Array.isArray(info.settingsChanged) ? info.settingsChanged : []).map(setting).filter(Boolean);
    const count = `${list.length} ${list.length === 1 ? "line" : "lines"}`;
    const range = list.length ? `${stamp(list[0].at, timeZone, true)} to ${stamp(list[list.length - 1].at, timeZone, true)}` : "no entries";
    const header = [
      "Purple Adblock diagnostic log",
      `Purple: ${text(info.purple, "unknown")} (${text(info.install, "unknown")})`,
      `Browser: ${text(info.browser, "unknown")} \u00b7 ${text(info.os, "unknown")}`,
      `Twitch player: ${player}`,
      `Channel: ${name || "unknown"}`,
      `Range: ${range} (${timeZone}), ${count}`,
      `Settings changed from defaults: ${settings.length ? settings.join(", ") : "none"}`,
      "This file stays on this computer until you attach it somewhere. It holds no account, token, cookie, IP or video address.",
    ];
    return header.map((row) => `# ${row}`).concat(list.map((entry) => line(entry, timeZone))).join("\n") + "\n";
  }

  // purple-log-<channel>-<YYYY-MM-DD>.txt, the date of `now` in the time zone
  function fileName(channel, now, timeZone) {
    const name = typeof channel === "string" && CHANNEL.test(channel) ? channel : "unknown";
    const t = local(Number.isFinite(now) ? now : Date.now(), zone(timeZone));
    return `purple-log-${name}-${t.year}-${t.month}-${t.day}.txt`;
  }

  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  // ["key=value", ...] for the stored settings that differ from their defaults; the whitelist as its size and the
  // proxy URL as "set", never their contents
  function changedSettings(stored) {
    if (!isRecord(stored)) return [];
    const changed = [];
    for (const key of Object.keys(DEFAULTS)) {
      if (!Object.prototype.hasOwnProperty.call(stored, key)) continue;
      const data = stored[key];
      if (key === "whitelist") {
        if (Array.isArray(data) && data.length) changed.push(`whitelist=${data.length}`);
      } else if (key === "proxyUrl") {
        if (typeof data === "string" && data !== "") changed.push("proxyUrl=set");
      } else if (!same(data, DEFAULTS[key])) {
        changed.push(`${key}=${ascii(Array.isArray(data) ? data.join(",") : String(data))}`);
      }
    }
    return changed;
  }

  root.PurpleDiagFormat = Object.freeze({ DEFAULTS, format, fileName, changedSettings, sanitize: localSanitize });
})(globalThis);
