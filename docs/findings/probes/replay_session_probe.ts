// Replays the media playlists a soak recorded (extension mode, --all-playlists, with no backups: backupPlayerTypes=[] and
// lowQualityFallback=false) through Player.onFetch, to compare two versions of Player on the same inputs (T-831, T-832,
// 2026-11-08). The page's playlist of each poll is the server's text the recorder kept (serverTexts.jsonl, the ones with
// ad markers) or, for a poll without ads, the playlist the player got (playlists.jsonl: untouched then). A player that
// asks for the number after the last one it fetched runs on each output; it counts the live segments it fetches again.
//
//   bun docs/findings/probes/replay_session_probe.ts <session folder> [--src <folder with serviceWorker/src>]
//
// `--src` takes another checkout's `serviceWorker/src` (git archive <commit> serviceWorker/src), for the version to compare.
import { readFileSync } from "fs";
import { join, resolve } from "path";

const [directory, ...rest] = process.argv.slice(2);
const src = rest.includes("--src") ? resolve(rest[rest.indexOf("--src") + 1], "serviceWorker/src") : resolve(import.meta.dir, "../../../serviceWorker/src");
const { Player } = await import(join(src, "modules/player/player"));
const { newestNumber } = await import(join(src, "modules/player/sequence"));
const { detectAds } = await import(join(src, "modules/player/ad-detector"));
const { readSegments } = await import(join(src, "modules/player/segments"));

const read = (name: string): any[] =>
  readFileSync(join(directory, `${name}.jsonl`), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
const delivered = read("playlists").filter((r) => r.url.includes("/v1/playlist/"));
const servers = read("serverTexts").filter((r) => r.url.includes("/v1/playlist/"));

// how many of a playlist's segments carry an ad title (anything but `live`), and how many it lists
const titles = (text: string) => {
  const all = [...text.matchAll(/^#EXTINF:[^,\n]*,(.*)$/gm)].map((m) => m[1].trim());
  return `${all.filter((t) => t !== "live").length} ad titles of ${all.length}`;
};
const tag = (text: string, name: string) => {
  const match = new RegExp(`#EXT-X-${name}:(\\d+)`).exec(text);
  return match ? Number(match[1]) : null;
};
// the live number of the segment under `number` that the player gets as content (not an ad, so not blanked), or null
const contentAt = (text: string, number: number): number | null => {
  const first = tag(text, "MEDIA-SEQUENCE");
  const live = tag(text, "TWITCH-LIVE-SEQUENCE");
  if (first == null || live == null || number < first) return null;
  const index = number - first;
  const segments = readSegments(text.split("\n"));
  if (index >= segments.length || new Set(detectAds(text).adSegments).has(index)) return null;
  return live + index;
};

for (const worker of [...new Set(delivered.map((r) => r.worker))]) {
  const mine = delivered.filter((r) => r.worker === worker).sort((a, b) => a.wall - b.wall);
  const pages = servers.filter((r) => r.worker === worker).sort((a, b) => a.wall - b.wall);
  let now = mine[0].wall;
  Date.now = () => now;
  const events: any[] = [];
  const player = new Player({ logger: () => {}, postMessage: () => {}, emit: (e: any) => events.push({ ...e, wall: now }), request: async () => new Response("", { status: 404 }) } as any);
  player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [], lowQualityFallback: false } as any);
  player.setChannel("channel");
  let have = -1;
  let haveLive = -1;
  let again = 0;
  let polls = 0;
  const notes: string[] = [];
  let used = 0;
  let lastOut = "";
  for (const row of mine) {
    // the server's text for this poll: the last kept one at or before the player's copy, if it is not older than 3 s
    let page = row.text;
    while (used < pages.length && pages[used].wall < row.wall - 3000) used++;
    const candidate = pages.slice(used).find((p) => p.url === row.url && p.wall <= row.wall + 5 && row.wall - p.wall < 3000 && p.text.length >= row.text.length);
    if (candidate) page = candidate.text;
    now = row.wall;
    const before = events.length;
    const prior = JSON.stringify((player as any).delivered);
    const out = await player.onFetch(page, row.url);
    polls++;
    const previousOut = lastOut;
    lastOut = out;
    const restarted = events.slice(before).some((e) => e.type === "segmentRepeat" || e.type === "sequenceRestart");
    for (const e of events.slice(before)) if (e.type === "segmentRepeat" || e.type === "sequenceRestart") notes.push(`${e.type} ${e.count} at poll ${polls} (kept before: ${prior}; the page's playlist: MEDIA-SEQUENCE ${tag(page, "MEDIA-SEQUENCE")}, live ${tag(page, "TWITCH-LIVE-SEQUENCE")}, newest ${newestNumber(page)}; given: newest ${newestNumber(out)}, ${titles(out)}; the poll before gave ${titles(previousOut)})`);
    const newest = newestNumber(out);
    if (newest == null) continue;
    if (restarted || have < 0) {
      have = newest;
      haveLive = contentAt(out, newest) ?? haveLive;
      continue;
    }
    for (let n = have + 1; n <= newest; n++) {
      const live = contentAt(out, n);
      if (live == null) continue;
      if (live <= haveLive) again++;
      else haveLive = live;
    }
    have = Math.max(have, newest);
  }
  const counts = events.filter((e) => e.type === "segmentRepeat" || e.type === "sequenceRestart").length;
  if (counts || again) console.log(`worker ${worker}: ${polls} polls, restarts ${counts}, live segments fetched again ${again}${notes.length ? `; ${notes.join(", ")}` : ""}`);
}
