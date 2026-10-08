// Page state recorder for levels 2 and 3. Added with Page.addScriptToEvaluateOnNewDocument before
// Purple's userscript, so it runs before any page script. Results in window.__e2e, read as JSON by lib.py.
// Same worker checks as docs/findings/probes/worker_boot_probe.py, plus a log from inside each worker.
(() => {
  if (window.__e2e) return;
  const state = (window.__e2e = { workers: [], messages: [], hookAt: null, workerLog: [], media: [], playlists: [] });
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

  // Runs first in every worker. Logs, through a BroadcastChannel (separate from the player's
  // postMessage protocol): fetches the worker makes on the network ("network"), what the player gets
  // back once Purple has replaced self.fetch ("player"), Purple's console lines, console errors,
  // uncaught errors and unhandled rejections. URLs without the query string. The only bodies read are the
  // media playlists the player gets from Purple's hook, from a clone of the response.
  const WORKER_PREFIX = `(() => {
  const channel = new BroadcastChannel("purple-e2e");
  const id = Math.random().toString(36).slice(2, 8);
  const post = (entry) => { try { channel.postMessage(Object.assign({ worker: id, at: Math.round(performance.now()) }, entry)); } catch (e) {} };
  const short = (input) => { try { const u = new URL(String((input && input.url) || input)); return u.host + u.pathname; } catch (e) { return String(input).slice(0, 150); } };
  const text = (value) => String((value && (value.stack || value.message)) || value).slice(0, 500);
  const wrap = (fn, level) => function (input, init) {
    const url = short(input);
    return Promise.resolve(fn.apply(this, arguments)).then(
      (r) => {
        post({ kind: "fetch", level, url, status: r && r.status });
        if (level === "player" && /\\.m3u8$/.test(url) && r && r.ok) r.clone().text().then((body) => post({ kind: "playlist", url, text: body.slice(0, 20000) }), () => {});
        return r;
      },
      (err) => { post({ kind: "fetch", level, url, error: text(err) }); throw err; });
  };
  const network = wrap(self.fetch, "network");
  let hook = null;
  Object.defineProperty(self, "fetch", { configurable: true, get: () => hook || network, set: (fn) => { hook = wrap(fn, "player"); } });
  for (const name of ["log", "warn", "error"]) {
    const original = console[name];
    console[name] = function (...args) {
      const line = args.map((a) => { if (typeof a === "string") return a; try { return JSON.stringify(a); } catch (e) { return String(a); } }).join(" ");
      if (name === "error" || line.includes("[Purple]")) post({ kind: "console", level: name, text: line.slice(0, 500) });
      return original.apply(this, args);
    };
  }
  self.addEventListener("error", (e) => post({ kind: "error", text: text(e.error || e.message) }));
  self.addEventListener("unhandledrejection", (e) => post({ kind: "rejection", text: text(e.reason) }));
})();
`;
  new BroadcastChannel("purple-e2e").onmessage = (e) => {
    // playlists: the last 60 only
    if (e.data && e.data.kind === "playlist") {
      state.playlists.push(e.data);
      if (state.playlists.length > 60) state.playlists.shift();
    } else if (state.workerLog.length < LOG_LIMIT) state.workerLog.push(e.data);
  };

  // Wraps the native Worker. Per worker: creation time, whether it came through Purple's injector
  // (Purple's class extends this proxy, so newTarget is not the proxy), whether its script holds
  // Purple's worker code, the end of the script (the player's own script follows Purple's code),
  // errors, and whether it posted Purple's boot message.
  const NativeWorker = window.Worker;
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
      // Purple's messages: pause/play/settings requests from the worker, and what the page sends back
      // (the player's own RPC also uses funcName, so pause and play may come from the player too)
      entry.messages = [];
      const log = (m) => entry.messages.length < 200 && entry.messages.push(Object.assign({ at: Math.round(performance.now()) }, m));
      const nativePost = worker.postMessage;
      worker.postMessage = function (message, ...rest) {
        const name = message && message.funcName;
        if (["pause", "play", "setSettings", "setQuality", "setIntegrity"].includes(name)) log({ to: "worker", funcName: name });
        return nativePost.call(this, message, ...rest);
      };
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
