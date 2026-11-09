// Runs first in every worker the page creates (recorder.js prepends it to the worker script). Reports through a
// BroadcastChannel, separate from the player's postMessage protocol:
// - "fetch": each fetch the worker makes on the network ("network") and what the player gets back once Purple has
//   replaced self.fetch ("player"); URL without the query string, status or error
// - "server": what Twitch answered, read from a clone of the network response before Purple sees it: a digest of
//   masters and media playlists, and of PlaybackAccessToken responses (status, errors, token flags; no ids, no tokens)
// - "serverText": full text of a media playlist from the server that carries ad markers
// - "delivered": the digest of each media playlist the player got from Purple's hook; "playlist": its text
// - "console": Purple's console lines and console errors and warnings; "error" and "rejection": uncaught ones
// - "fakeBreak": a media playlist of the player's own given to Purple with its segments titled as ads (fake breaks,
//   below)
//
// Fake breaks (T-829 test, soak.py --fake-breaks): with self.__e2eFakeBreaks = { start, every, length } (ms since the
// epoch, s, s; recorder.js puts the page's window.__e2eFakeBreaks in front of this script), while a window is on (each
// `every` s from `start`, for `length` s) every media playlist the player asked for (its own URL, which Purple fetches
// on its behalf) reaches Purple with each segment titled `Amazon|e2e-fake-break`, an ad title Purple knows. Purple
// gives the player a backup and goes back to the page's playlist when the window ends. Backups are left alone.
(() => {
  const channel = new BroadcastChannel("purple-e2e");
  const id = Math.random().toString(36).slice(2, 8);
  const post = (entry) => {
    try {
      channel.postMessage(Object.assign({ worker: id, at: Math.round(performance.now()), wall: Date.now() }, entry));
    } catch (e) {}
  };
  const urlOf = (input) => String((input && input.url) || input);
  const parse = (input) => {
    try {
      return new URL(urlOf(input));
    } catch (e) {
      return null;
    }
  };
  const short = (input) => {
    const u = parse(input);
    return u ? u.host + u.pathname : urlOf(input).slice(0, 150);
  };
  const text = (value) => String((value && (value.stack || value.message)) || value).slice(0, 500);
  const unique = (list) => [...new Set(list)];
  const hostOf = (uri) => (parse(uri) || {}).host || "";
  const attr = (line, name) => {
    const at = line.indexOf(name + '="');
    if (at < 0) return null;
    const start = at + name.length + 2;
    return line.slice(start, line.indexOf('"', start));
  };
  const number = (lines, tag) => {
    const line = lines.find((l) => l.startsWith(tag + ":"));
    return line ? Number(line.slice(tag.length + 1)) : null;
  };
  const AD_TEXT = /stitched|twitch-maf-ad|X-TV-TWITCH-AD-ROLL-TYPE|#EXTINF:[^\n]*(Amazon|DCM,)/;
  // Purple 2.6.7's markers in the segment title
  const isAdTitle = (title) => title.includes("Amazon") || title.includes("stitched") || title.includes("DCM,");

  // Flags of a PlaybackAccessToken value: booleans and a few descriptors; ids, ip and channel are left out.
  const tokenFlags = (value) => {
    try {
      const token = JSON.parse(value);
      const flags = {};
      for (const [key, v] of Object.entries(token)) {
        if (typeof v === "boolean" || key === "player_type" || key === "platform" || key === "version") flags[key] = v;
      }
      return flags;
    } catch (e) {
      return null;
    }
  };

  // Structure and ad markers of a playlist, without identifiers.
  const digest = (body) => {
    const lines = body.split("\n").map((l) => l.trim());
    const tags = unique(lines.filter((l) => l.startsWith("#EXT")).map((l) => l.split(":")[0]));
    const uris = lines.filter((l) => l && !l.startsWith("#"));
    if (tags.includes("#EXT-X-STREAM-INF")) {
      return {
        type: "master",
        tags,
        variants: uris.length,
        variantHosts: unique(uris.map(hostOf)),
        names: lines
          .filter((l) => l.startsWith("#EXT-X-MEDIA:") || l.startsWith("#EXT-X-STREAM-INF:"))
          .map((l) => attr(l, "NAME") || attr(l, "IVS-NAME"))
          .filter(Boolean),
        sessionData: lines.filter((l) => l.startsWith("#EXT-X-SESSION-DATA:")).map((l) => attr(l, "DATA-ID")),
      };
    }
    const titles = [];
    const adHosts = [];
    const adPaths = [];
    // with a stitched-ad marker, a title other than "live" is an ad too (T-203: "FT|...", a 10-digit number)
    const stitched = lines.some((l) => l.startsWith("#EXT-X-DATERANGE:") && /CLASS="twitch-stitched|ID="stitched-ad/.test(l));
    // adPaths also takes the URIs the player fetches for ad positions (B-046: on fMP4 a prefetch URI is not the URI
    // of the later segment line): the EXT-X-MAP before an ad segment, and prefetch lines after an ad segment or after
    // a stitched-ad marker past the last segment (a break announced, B-034)
    let title = "";
    let maps = [];
    let lastAd = false;
    let markerAfterLast = false;
    for (const line of lines) {
      if (line.startsWith("#EXTINF:")) title = line.slice(line.indexOf(",") + 1);
      else if (line.startsWith("#EXT-X-MAP:")) {
        const uri = attr(line, "URI");
        if (uri) maps.push(uri);
      } else if (line.startsWith("#EXT-X-DATERANGE:") && /CLASS="twitch-stitched|ID="stitched-ad/.test(line)) markerAfterLast = true;
      else if (line.startsWith("#EXT-X-TWITCH-PREFETCH:")) {
        if (lastAd || markerAfterLast) adPaths.push(short(line.slice("#EXT-X-TWITCH-PREFETCH:".length)));
      } else if (line && !line.startsWith("#")) {
        titles.push(title);
        lastAd = isAdTitle(title) || (stitched && !!title && title !== "live");
        if (lastAd) {
          adHosts.push(hostOf(line));
          adPaths.push(...maps.map(short), short(line));
        }
        maps = [];
        markerAfterLast = false;
        title = "";
      }
    }
    const dateranges = lines.filter((l) => l.startsWith("#EXT-X-DATERANGE:"));
    // attribute names (not values) per DATERANGE class
    const daterangeAttributes = {};
    for (const line of dateranges) {
      const names = line.slice("#EXT-X-DATERANGE:".length).split(",").map((p) => p.split("=")[0]).filter((k) => /^[A-Z][A-Z0-9-]*$/.test(k));
      const cls = attr(line, "CLASS") || "-";
      daterangeAttributes[cls] = unique([...(daterangeAttributes[cls] || []), ...names]);
    }
    return {
      type: "media",
      tags,
      targetDuration: number(lines, "#EXT-X-TARGETDURATION"),
      mediaSequence: number(lines, "#EXT-X-MEDIA-SEQUENCE"),
      segments: uris.length,
      // the 2.6.7 title markers, and with a stitched-ad marker any title other than "live" (T-203)
      adSegments: adHosts.length,
      titles: unique(titles.map((t) => (isAdTitle(t) ? t.split("|")[0] + "|" : t).slice(0, 24))),
      durations: unique(lines.filter((l) => l.startsWith("#EXTINF:")).map((l) => l.slice(8).split(",")[0])),
      dateranges: unique(dateranges.map((l) => attr(l, "CLASS") || "-")),
      daterangeAttributes,
      rollTypes: unique(dateranges.map((l) => attr(l, "X-TV-TWITCH-AD-ROLL-TYPE")).filter(Boolean)),
      adAttributes: unique(dateranges.flatMap((l) => l.split(",").map((p) => p.split("=")[0]).filter((k) => k.startsWith("X-TV-TWITCH-AD-")))),
      discontinuities: lines.filter((l) => l === "#EXT-X-DISCONTINUITY").length,
      prefetch: lines.filter((l) => l.startsWith("#EXT-X-TWITCH-PREFETCH:")).length,
      segmentHosts: unique(uris.map(hostOf)),
      adSegmentHosts: unique(adHosts),
      // host + path of the ad segments, to tell whether the player got them from the network (kept local, not committed)
      adSegmentPaths: unique(adPaths),
    };
  };

  const describeServer = (input, init, response) => {
    const u = parse(input);
    if (!u || !response) return;
    const url = u.host + u.pathname;
    if (u.host === "usher.ttvnw.net" || u.pathname.endsWith(".m3u8")) {
      const entry = { kind: "server", url, status: response.status };
      if (u.host === "usher.ttvnw.net") {
        entry.queryKeys = [...u.searchParams.keys()].sort();
        entry.tokenFlags = tokenFlags(u.searchParams.get("token"));
      }
      response
        .clone()
        .text()
        .then((body) => {
          post(Object.assign(entry, { playlist: response.ok ? digest(body) : null }));
          // full text of a media playlist with ad markers ("serverText"), for the soak recordings
          if (response.ok && !body.includes("#EXT-X-STREAM-INF") && AD_TEXT.test(body)) post({ kind: "serverText", url, text: body.slice(0, 100000) });
        }, () => post(entry));
    } else if (u.host === "gql.twitch.tv" && u.pathname === "/gql") {
      let request = [];
      try {
        const body = JSON.parse((init && init.body) || "null");
        request = (Array.isArray(body) ? body : [body]).filter(Boolean);
      } catch (e) {}
      // names of the request headers, never their values (T-401: the page's GQL headers on Purple's token requests)
      let headerNames = [];
      try {
        headerNames = [...new Headers((init && init.headers) || undefined).keys()].sort();
      } catch (e) {}
      response
        .clone()
        .json()
        .then(
          (json) => {
            const answers = Array.isArray(json) ? json : [json];
            post({
              kind: "server",
              url,
              status: response.status,
              headerNames,
              gql: answers.map((answer, i) => ({
                operation: (request[i] && request[i].operationName) || null,
                playerType: (request[i] && request[i].variables && request[i].variables.playerType) || null,
                errors: ((answer && answer.errors) || []).map((e) => String(e.message).slice(0, 120)),
                tokenFlags: tokenFlags(answer && answer.data && answer.data.streamPlaybackAccessToken && answer.data.streamPlaybackAccessToken.value),
              })),
            });
          },
          () => post({ kind: "server", url, status: response.status, gql: null }),
        );
    }
  };

  const fake = self.__e2eFakeBreaks || null;
  const playerUrls = new Set();
  const inFakeBreak = () => !!fake && Date.now() >= fake.start && (Date.now() - fake.start) % (fake.every * 1000) < fake.length * 1000;
  const asAds = (body) => body.replace(/^(#EXTINF:[^,\n]*,).*$/gm, (line, head) => head + "Amazon|e2e-fake-break");
  const fakeBreak = (url, r) => {
    if (!fake || !r || !r.ok || !url.endsWith(".m3u8") || !playerUrls.has(url) || !inFakeBreak()) return Promise.resolve(r);
    return r.text().then((body) => {
      const marked = body.includes("#EXTINF") ? asAds(body) : body;
      if (marked !== body) post({ kind: "fakeBreak", url });
      return new Response(marked, { status: r.status, statusText: r.statusText, headers: r.headers });
    });
  };

  let calls = 0;
  const wrap = (fn, level) =>
    function (input, init) {
      const url = short(input);
      if (level === "player" && fake) playerUrls.add(url);
      // T-831: the start of each playlist request the player makes, to tell polls that overlap; `call` pairs it with its end
      const call = ++calls;
      if (level === "player" && url.endsWith(".m3u8")) post({ kind: "fetchStart", level, url, call });
      return Promise.resolve(fn.apply(this, arguments))
        .then((r) => (level === "network" ? fakeBreak(url, r) : r))
        .then(
        (r) => {
          post({ kind: "fetch", level, url, status: r && r.status, call });
          if (level === "network") describeServer(input, init, r);
          if (level === "player" && url.endsWith(".m3u8") && r && r.ok) {
            r.clone()
              .text()
              .then(
                (body) => {
                  post({ kind: "delivered", url, playlist: digest(body) });
                  post({ kind: "playlist", url, text: body.slice(0, 20000) });
                },
                () => {},
              );
          }
          return r;
        },
        (err) => {
          post({ kind: "fetch", level, url, error: text(err), call });
          throw err;
        },
      );
    };

  const network = wrap(self.fetch, "network");
  let hook = null;
  Object.defineProperty(self, "fetch", { configurable: true, get: () => hook || network, set: (fn) => (hook = wrap(fn, "player")) });

  for (const name of ["log", "warn", "error"]) {
    const original = console[name];
    console[name] = function (...args) {
      const line = args
        .map((a) => {
          if (typeof a === "string") return a;
          try {
            return JSON.stringify(a);
          } catch (e) {
            return String(a);
          }
        })
        .join(" ");
      if (name !== "log" || line.includes("[Purple]")) post({ kind: "console", level: name, text: line.slice(0, 500) });
      return original.apply(this, args);
    };
  }
  self.addEventListener("error", (e) => post({ kind: "error", text: text(e.error || e.message) }));
  self.addEventListener("unhandledrejection", (e) => post({ kind: "rejection", text: text(e.reason) }));
})();
