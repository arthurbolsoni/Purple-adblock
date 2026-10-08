// Page state recorder for levels 2 and 3. Added with Page.addScriptToEvaluateOnNewDocument before
// Purple's userscript, so it runs before any page script. Results in window.__e2e, read as JSON by lib.py.
// Same worker checks as docs/findings/probes/worker_boot_probe.py, plus a log from inside each worker.
(() => {
  if (window.__e2e) return;
  const state = (window.__e2e = { workers: [], messages: [], hookAt: null, workerLog: [], media: [], playlists: [], server: [], delivered: [], csai: [], serverTexts: [] });
  const LOG_LIMIT = 2000;
  const now = () => Math.round(performance.now());

  // <video> events (they do not bubble; a capturing listener on the document sees them) and the outcome of
  // every play() call, to tell a blocked play() from a player that never gets media
  const MEDIA_EVENTS = ["loadstart", "loadedmetadata", "loadeddata", "canplay", "play", "playing", "pause", "waiting", "stalled", "emptied", "error", "abort"];
  const media = (entry, el) =>
    state.media.length < 400 &&
    state.media.push(Object.assign({ at: now(), readyState: el.readyState, currentTime: Math.round(el.currentTime * 10) / 10, paused: el.paused, muted: el.muted }, entry));
  for (const type of MEDIA_EVENTS) document.addEventListener(type, (e) => e.target instanceof HTMLMediaElement && media({ event: type }, e.target), true);
  const nativePlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...args) {
    const result = nativePlay.apply(this, args);
    Promise.resolve(result).then(
      () => media({ play: "resolved" }, this),
      (err) => media({ play: "rejected", error: String((err && err.name) || err) }, this),
    );
    return result;
  };

  // page <-> content script messages
  window.addEventListener("message", (e) => {
    const type = e.data && e.data.type;
    if (type === "getSettings" || type === "setSettings") state.messages.push({ type, at: Math.round(performance.now()) });
  });

  // e2e/worker-logger.js, inserted by lib.py; runs first in every worker
  const WORKER_PREFIX = __WORKER_LOGGER__;
  new BroadcastChannel("purple-e2e").onmessage = (e) => {
    const kind = e.data && e.data.kind;
    if (kind === "playlist") {
      // the last 60 only
      state.playlists.push(e.data);
      if (state.playlists.length > 60) state.playlists.shift();
    } else if (kind === "serverText") {
      // the last 300 only
      state.serverTexts.push(e.data);
      if (state.serverTexts.length > 300) state.serverTexts.shift();
    } else if (kind === "server" || kind === "delivered") {
      if (state[kind].length < 3000) state[kind].push(e.data);
    } else if (state.workerLog.length < LOG_LIMIT) state.workerLog.push(e.data);
  };

  // requests the page makes to edge.ads.twitch.tv (client-side ads, B-011), from the resource timing entries
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.name.includes("edge.ads.twitch.tv")) continue;
        const u = new URL(entry.name);
        state.csai.push({
          at: Math.round(entry.startTime),
          wall: Math.round(performance.timeOrigin + entry.startTime),
          path: u.pathname,
          bp: u.searchParams.get("bp"),
          queryKeys: [...u.searchParams.keys()].sort(),
          initiator: entry.initiatorType,
          status: entry.responseStatus,
          duration: Math.round(entry.duration),
        });
      }
    }).observe({ type: "resource", buffered: true });
  } catch (e) {}

  // what edge.ads.twitch.tv answered the page: a digest of the body (VAST tags and counts, no ids or URLs)
  state.csaiAnswers = [];
  // structure of a JSON answer: keys and value types down to depth 4, array lengths; no values
  const shape = (value, depth = 0) => {
    if (Array.isArray(value)) return depth > 3 ? `array(${value.length})` : [`array(${value.length})`, ...value.slice(0, 1).map((v) => shape(v, depth + 1))];
    if (value && typeof value === "object") {
      if (depth > 3) return "object";
      return Object.fromEntries(Object.keys(value).slice(0, 60).map((k) => [k, shape(value[k], depth + 1)]));
    }
    return value === null ? "null" : typeof value;
  };
  const vast = (body) => {
    let json = null;
    try {
      if (/^\s*[[{]/.test(body)) json = shape(JSON.parse(body));
    } catch (e) {}
    const count = (re) => (body.match(re) || []).length;
    const values = (re) => [...new Set([...body.matchAll(re)].map((m) => m[1].trim()))].slice(0, 20);
    return {
      length: body.length,
      json,
      ads: count(/<Ad[\s>]/g),
      inline: count(/<InLine[\s>]/g),
      wrappers: count(/<Wrapper[\s>]/g),
      creatives: count(/<Creative[\s>]/g),
      mediaFiles: count(/<MediaFile[\s>]/g),
      mediaTypes: values(/<MediaFile[^>]*type="([^"]*)"/g),
      durations: values(/<Duration>\s*([^<]*)</g),
      adSystems: values(/<AdSystem[^>]*>\s*(?:<!\[CDATA\[)?([^<\]]*)/g),
      extensions: values(/<Extension[^>]*type="([^"]*)"/g),
      errors: count(/<Error[\s>]/g),
    };
  };
  const answer = (url, status, body) => {
    try {
      const u = new URL(url, location.href);
      if (state.csaiAnswers.length < 200) state.csaiAnswers.push({ wall: Date.now(), path: u.pathname, bp: u.searchParams.get("bp"), status, body: vast(body || "") });
    } catch (e) {}
  };
  const nativeFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = String((input && input.url) || input);
    const result = nativeFetch.apply(this, arguments);
    if (url.includes("edge.ads.twitch.tv")) {
      result.then((r) => r.clone().text().then((body) => answer(url, r.status, body)), (err) => answer(url, "error: " + err, ""));
    }
    return result;
  };
  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (String(url).includes("edge.ads.twitch.tv")) {
      this.addEventListener("loadend", () => answer(String(url), this.status, this.responseType === "" || this.responseType === "text" ? this.responseText : ""));
    }
    return nativeOpen.call(this, method, url, ...rest);
  };

  // Wraps the native Worker. Per worker: creation time, whether it came through Purple's injector
  // (Purple's class extends this proxy, so newTarget is not the proxy), whether its script holds
  // Purple's worker code, the end of the script (the player's own script follows Purple's code),
  // errors, and whether it posted Purple's boot message.
  const NativeWorker = window.Worker;
  // Purple's messages to a worker: logged on the native prototype, so calls through super.postMessage
  // (Purple's own sends) are seen too (the player's RPC also uses funcName, so pause and play may come from it)
  const entries = new WeakMap();
  const nativePost = NativeWorker.prototype.postMessage;
  NativeWorker.prototype.postMessage = function (message, ...rest) {
    const entry = entries.get(this);
    const name = message && message.funcName;
    if (entry && ["pause", "play", "setSettings", "setQuality", "setIntegrity"].includes(name) && entry.messages.length < 200) {
      entry.messages.push({ at: Math.round(performance.now()), to: "worker", funcName: name });
    }
    return nativePost.call(this, message, ...rest);
  };
  const proxy = new Proxy(NativeWorker, {
    construct(target, args, newTarget) {
      const url = String(args[0]);
      const entry = {
        url: url.slice(0, 80),
        at: Math.round(performance.now()),
        viaInjector: newTarget !== proxy,
        purpleCode: null,
        size: null,
        tail: null,
        errors: [],
        purpleBoot: false,
      };
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        const text = xhr.responseText;
        entry.size = text.length;
        entry.purpleCode = text.includes("Script running");
        entry.tail = text.slice(-300);
        const prefixed = URL.createObjectURL(new Blob([WORKER_PREFIX + text], { type: "text/javascript" }));
        args = [prefixed, ...args.slice(1)];
      } catch (err) {
        entry.purpleCode = "xhr failed: " + err.message;
      }
      const worker = Reflect.construct(target, args, newTarget);
      state.workers.push(entry);
      // pause/play/settings requests from the worker; what the page sends back is logged on the prototype above
      entry.messages = [];
      entries.set(worker, entry);
      const log = (m) => entry.messages.length < 200 && entry.messages.push(Object.assign({ at: Math.round(performance.now()) }, m));
      worker.addEventListener("message", (e) => {
        const type = e.data && e.data.type;
        if (type === "getSettings") entry.purpleBoot = true;
        if (type === "getSettings" || type === "pause" || type === "play") log({ from: "worker", type });
      });
      worker.addEventListener("error", (e) => entry.errors.push(String(e.message || e.type).slice(0, 200)));
      return worker;
    },
  });
  let current = proxy;
  Object.defineProperty(window, "Worker", {
    configurable: true,
    get: () => current,
    set: (value) => {
      current = value;
      state.hookAt = Math.round(performance.now());
    },
  });
})();
