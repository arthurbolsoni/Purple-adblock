// F-31 (T-607): the diagnostic log, per channel, kept 7 days in this browser's IndexedDB and never sent anywhere. The
// page posts entries, the content script relays them, the background script stores them here; the popup and the
// export page read them and the viewer saves them as a .txt (common/js/diag-format.js).
// A classic script: the Chromium MV3 service worker loads it with importScripts, the Firefox MV2 event page lists it
// before background.js, the popup and export pages include it with a <script> tag (same origin, same database).
// Nothing here throws: a failure of IndexedDB resolves with 0, [] or a zero summary.
(function (root) {
  "use strict";

  const DB_NAME = "purple-diagnostics";
  const DB_VERSION = 1;
  const HOUR_MS = 60 * 60 * 1000;
  const DAY_MS = 24 * HOUR_MS;
  const RETENTION_MS = 7 * DAY_MS;
  // an entry's `at` is accepted from 8 days back (entries buffered by a page left open) to 1 hour ahead (clock skew)
  const OLDEST_MS = 8 * DAY_MS;
  const NEWEST_MS = HOUR_MS;
  const CHANNEL_CAP = 4000;
  // entries taken from one add() call (the content script sends at most 500 at a time)
  const ADD_MAX = 500;
  const PRUNE_EVERY_MS = HOUR_MS;

  const CHANNEL = /^[a-z0-9_]{1,25}$/;
  const KEY = /^[a-zA-Z]{1,24}$/;
  const LEVELS = ["info", "warn", "error"];
  // the data keys the page writes for each type (the shared contract, serviceWorker/src/page/diagnostics.ts, where each
  // value is also checked against its closed list); any other key is dropped
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
  // a longer string is cut to this before the passes below (they are quadratic at worst), without its last word,
  // which the cut may have split
  const MAX_INPUT = 1000;

  // Strings lose anything that could identify the viewer or a video address, in this order: control characters,
  // URLs and host names, runs of 20 or more token characters with a digit or one of + / = (a long word of letters
  // only, such as an error name, stays), UUIDs, IPv4 and IPv6 addresses; then the cut to 120.
  // The passes repeat until nothing changes, so sanitize(sanitize(x)) is sanitize(x).
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

  // the entry as the contract allows it, or null; `now` sets the window `at` must be in
  function sanitize(entry, now) {
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

  // IndexedDB: store `entries` (auto-increment key; indexes [channel, at] and at), store `channels` keyed by channel
  let opening = null;
  function open() {
    if (opening) return opening;
    const pending = new Promise((resolve, reject) => {
      const request = root.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("entries")) {
          const entries = db.createObjectStore("entries", { autoIncrement: true });
          entries.createIndex("channelAt", ["channel", "at"]);
          entries.createIndex("at", "at");
        }
        if (!db.objectStoreNames.contains("channels")) db.createObjectStore("channels", { keyPath: "channel" });
      };
      request.onsuccess = () => {
        const db = request.result;
        const forget = () => {
          if (opening === pending) opening = null;
        };
        db.onversionchange = () => {
          db.close();
          forget();
        };
        db.onclose = forget;
        resolve(db);
      };
      request.onerror = () => reject(request.error);
    });
    opening = pending;
    pending.catch(() => {
      if (opening === pending) opening = null;
    });
    return pending;
  }

  // runs `work(stores, done)` in one transaction over both stores; resolves with the value given to done() once the
  // transaction completes
  function transact(mode, work) {
    return open().then(
      (db) =>
        new Promise((resolve, reject) => {
          let tx;
          try {
            tx = db.transaction(["entries", "channels"], mode);
          } catch (e) {
            // the connection was closed under us: the next call opens a new one
            opening = null;
            throw e;
          }
          let result;
          tx.oncomplete = () => resolve(result);
          tx.onerror = () => reject(tx.error);
          tx.onabort = () => reject(tx.error);
          work({ entries: tx.objectStore("entries"), channels: tx.objectStore("channels") }, (value) => {
            result = value;
          });
        }),
    );
  }

  const channelRange = (channel, from) => root.IDBKeyRange.bound([channel, from == null ? -Infinity : from], [channel, Infinity]);

  // rewrites the channel's record from its entries ({channel, first, last, count}), or deletes it when none is left
  function refreshChannel(stores, channel) {
    const index = stores.entries.index("channelAt");
    const range = channelRange(channel);
    const count = index.count(range);
    count.onsuccess = () => {
      if (!count.result) return void stores.channels.delete(channel);
      const first = index.openKeyCursor(range);
      first.onsuccess = () => {
        const last = index.openKeyCursor(range, "prev");
        last.onsuccess = () => {
          if (first.result && last.result) stores.channels.put({ channel, first: first.result.key[1], last: last.result.key[1], count: count.result });
        };
      };
    };
  }

  // deletes the channel's oldest entries above CHANNEL_CAP, then calls done()
  function capChannel(stores, channel, done) {
    const index = stores.entries.index("channelAt");
    const range = channelRange(channel);
    const count = index.count(range);
    count.onsuccess = () => {
      let excess = count.result - CHANNEL_CAP;
      if (excess <= 0) return done();
      const cursor = index.openCursor(range);
      cursor.onsuccess = () => {
        const row = cursor.result;
        if (!row) return done();
        row.delete();
        if (--excess > 0) row.continue();
        else done();
      };
    };
  }

  let lastPrune = -Infinity;

  // stores the valid entries (none from an incognito tab); resolves with how many were stored
  function add(list, options) {
    try {
      const opts = isRecord(options) ? options : {};
      if (opts.incognito === true || !Array.isArray(list)) return Promise.resolve(0);
      const now = Number.isFinite(opts.now) ? opts.now : Date.now();
      const clean = list.slice(-ADD_MAX).map((entry) => sanitize(entry, now)).filter(Boolean);
      if (!clean.length) return Promise.resolve(0);
      return transact("readwrite", (stores, done) => {
        for (const entry of clean) stores.entries.add(entry);
        for (const channel of new Set(clean.map((entry) => entry.channel))) capChannel(stores, channel, () => refreshChannel(stores, channel));
        done(clean.length);
      })
        .then((stored) => {
          if (now - lastPrune < PRUNE_EVERY_MS) return stored;
          lastPrune = now;
          return prune(now).then(() => stored);
        })
        .catch(() => 0);
    } catch (e) {
      return Promise.resolve(0);
    }
  }

  // deletes the entries older than 7 days; resolves with how many were deleted
  function prune(now) {
    try {
      const clock = Number.isFinite(now) ? now : Date.now();
      const cutoff = clock - RETENTION_MS;
      return transact("readwrite", (stores, done) => {
        const touched = new Set();
        let removed = 0;
        const cursor = stores.entries.index("at").openCursor(root.IDBKeyRange.upperBound(cutoff, true));
        cursor.onsuccess = () => {
          const row = cursor.result;
          if (row) {
            touched.add(row.value.channel);
            row.delete();
            removed++;
            return row.continue();
          }
          done(removed);
          const records = stores.channels.getAll();
          records.onsuccess = () => {
            for (const record of records.result || []) if (record.last < cutoff) touched.add(record.channel);
            for (const channel of touched) refreshChannel(stores, channel);
          };
        };
      }).catch(() => 0);
    } catch (e) {
      return Promise.resolve(0);
    }
  }

  // the channels with entries in the last 7 days, the most recent first: [{ channel, first, last, count }]
  function channels(now) {
    try {
      const cutoff = (Number.isFinite(now) ? now : Date.now()) - RETENTION_MS;
      return transact("readonly", (stores, done) => {
        const result = [];
        const records = stores.channels.getAll();
        records.onsuccess = () => {
          const recent = (records.result || []).filter((record) => record.last >= cutoff);
          const index = stores.entries.index("channelAt");
          let left = recent.length;
          if (!left) return done(result);
          for (const record of recent) {
            const range = channelRange(record.channel, cutoff);
            const count = index.count(range);
            count.onsuccess = () => {
              const first = index.openKeyCursor(range);
              first.onsuccess = () => {
                if (count.result && first.result) result.push({ channel: record.channel, first: first.result.key[1], last: record.last, count: count.result });
                if (--left === 0) done(result.sort((a, b) => b.last - a.last || (a.channel < b.channel ? -1 : 1)));
              };
            };
          }
        };
      }).catch(() => []);
    } catch (e) {
      return Promise.resolve([]);
    }
  }

  // the channel's entries from `from` on, oldest first
  function read(channel, from) {
    if (typeof channel !== "string" || !CHANNEL.test(channel)) return Promise.resolve([]);
    return transact("readonly", (stores, done) => {
      const request = stores.entries.index("channelAt").getAll(channelRange(channel, from));
      request.onsuccess = () => done((request.result || []).map((entry) => sanitize(entry, entry.at)).filter(Boolean));
    });
  }

  // the channel's entries of the last 7 days, oldest first
  function entries(channel, now) {
    try {
      const cutoff = (Number.isFinite(now) ? now : Date.now()) - RETENTION_MS;
      return read(channel, cutoff).catch(() => []);
    } catch (e) {
      return Promise.resolve([]);
    }
  }

  const zeroSummary = () => ({ breaks: 0, blocked: 0, passed: 0, stalls: 0 });

  // counts since `since` (ms, at most 7 days back): breaks started, breaks blocked, ads that passed, stalls
  function summary(channel, since, now) {
    try {
      const cutoff = (Number.isFinite(now) ? now : Date.now()) - RETENTION_MS;
      const from = Number.isFinite(since) ? Math.max(since, cutoff) : cutoff;
      return read(channel, from)
        .then((list) => {
          const counts = zeroSummary();
          for (const entry of list) {
            const result = entry.data && entry.data.result;
            if (entry.type === "breakStart") counts.breaks++;
            else if (entry.type === "breakEnd" && result === "blocked") counts.blocked++;
            else if (entry.type === "breakEnd" && result === "passed") counts.passed++;
            else if (entry.type === "adPassed") counts.passed++;
            else if (entry.type === "stall") counts.stalls++;
          }
          return counts;
        })
        .catch(zeroSummary);
    } catch (e) {
      return Promise.resolve(zeroSummary());
    }
  }

  root.PurpleDiagnostics = Object.freeze({ RETENTION_MS, CHANNEL_CAP, add, prune, channels, entries, summary, sanitize });
})(globalThis);
