// Media Source appends for the soak recordings (T-825: audio out of step with the video during a break). Runs in the
// page after recorder.js and in every worker after worker-logger.js (lib.py adds it to both): the player can build its
// MediaSource in a worker (MediaSource.canConstructInDedicatedWorker). Each SourceBuffer gets an id and its MIME type
// is posted once; after each append, removal or abort its timestampOffset and the newest 3 buffered ranges are posted,
// so the audio track and the video track can be compared with each other and with the segments the player fetched.
(() => {
  if (self.__purpleMse || typeof MediaSource === "undefined" || typeof SourceBuffer === "undefined") return;
  self.__purpleMse = true;
  const channel = new BroadcastChannel("purple-e2e");
  const scope = typeof document === "undefined" ? "worker" : "page";
  const round = (x) => Math.round(x * 1000) / 1000;
  const post = (entry) => {
    try {
      channel.postMessage(Object.assign({ kind: "mse", scope, at: Math.round(performance.now()), wall: Date.now() }, entry));
    } catch (e) {}
  };
  const ranges = (sb) => {
    try {
      const out = [];
      for (let i = Math.max(0, sb.buffered.length - 3); i < sb.buffered.length; i++) out.push([round(sb.buffered.start(i)), round(sb.buffered.end(i))]);
      return out;
    } catch (e) {
      return null;
    }
  };
  const buffers = new WeakMap(); // SourceBuffer -> { id, pending }
  let next = 0;

  const nativeAdd = MediaSource.prototype.addSourceBuffer;
  MediaSource.prototype.addSourceBuffer = function (type) {
    const sb = nativeAdd.apply(this, arguments);
    const info = { id: next++, pending: null };
    buffers.set(sb, info);
    post({ op: "add", sb: info.id, type: String(type) });
    sb.addEventListener("updateend", () => {
      if (!info.pending) return;
      post(Object.assign({ sb: info.id, offset: round(sb.timestampOffset), ranges: ranges(sb) }, info.pending));
      info.pending = null;
    });
    sb.addEventListener("error", () => post({ op: "error", sb: info.id }));
    return sb;
  };

  const wrap = (name, pending) => {
    const native = SourceBuffer.prototype[name];
    SourceBuffer.prototype[name] = function (...args) {
      const info = buffers.get(this);
      if (info) info.pending = pending(...args);
      return native.apply(this, args);
    };
  };
  wrap("appendBuffer", (data) => ({ op: "append", bytes: data ? data.byteLength : 0 }));
  wrap("remove", (start, end) => ({ op: "remove", start: round(start), end: Number.isFinite(end) ? round(end) : String(end) }));

  const nativeAbort = SourceBuffer.prototype.abort;
  SourceBuffer.prototype.abort = function () {
    const info = buffers.get(this);
    const result = nativeAbort.apply(this, arguments);
    if (info) post({ op: "abort", sb: info.id, offset: round(this.timestampOffset), ranges: ranges(this) });
    return result;
  };

  const offset = Object.getOwnPropertyDescriptor(SourceBuffer.prototype, "timestampOffset");
  if (offset && offset.set) {
    Object.defineProperty(SourceBuffer.prototype, "timestampOffset", {
      configurable: true,
      enumerable: offset.enumerable,
      get: offset.get,
      set(value) {
        const info = buffers.get(this);
        const before = offset.get.call(this);
        offset.set.call(this, value);
        if (info && value !== before) post({ op: "offset", sb: info.id, from: round(before), offset: round(value) });
      },
    });
  }
})();
