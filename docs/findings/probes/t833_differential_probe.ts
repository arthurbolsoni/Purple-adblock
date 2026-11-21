// Two versions of Player on the same random polls (T-833, 2026-11-20): where 2.7.3 (T-831, T-832) restarts the player or
// lets it fetch a live segment again and the version before it does not, or the other way round.
//
//   bun docs/findings/probes/t833_differential_probe.ts --old <folder with serviceWorker/src> [--runs N] [--seed S] [--show K]
//
// `--old` takes another checkout's `serviceWorker/src` (git archive c7e89c5 serviceWorker/src | tar -x -C <folder>, inside
// the repo so its imports resolve, e.g. dist/v272). The new version is this checkout's.
//
// Each run is a channel watched for 30 to 60 polls 2 s apart, with one or two midrolls: inside a break the page's
// playlist ends with ad segments (a twitch-stitched-ad DATERANGE, B-034) and Purple asks a backup (frontpage), which
// answers clean and up to date, clean and 1 or 2 segments behind (B-048), with ads too, or nothing. At the end of each
// break the page's playlist numbers the stream further ahead (B-054: MEDIA-SEQUENCE 0 to 4 above
// EXT-X-TWITCH-LIVE-SEQUENCE) and dates its segments up to 1.6 s apart from the backups' (B-057). A player that asks for
// the number after the last one it fetched runs on each version's output (as in polls.spec.ts): it counts the live
// segments it fetches again (a segment file it already has) and the restarts (a `pause` posted by Purple).
import { join, resolve } from "path";

const args = process.argv.slice(2);
const option = (name: string, fallback: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const oldSrc = resolve(option("--old", "dist/v272"), "serviceWorker/src");
const newSrc = resolve(import.meta.dir, "../../../serviceWorker/src");
const runs = Number(option("--runs", "2000"));
const seed = Number(option("--seed", "20261120"));
const show = Number(option("--show", "3"));
// --trace R: every poll of run R through both versions (the playlist given, the live segments it lists, restarts)
const traceRun = args.includes("--trace") ? Number(option("--trace", "-1")) : -1;
let tracing = false;

const load = async (src: string) => ({
  Player: (await import(join(src, "modules/player/player"))).Player,
  StreamType: (await import(join(src, "modules/stream/interface/stream.enum"))).StreamType,
  readSegments: (await import(join(src, "modules/player/segments"))).readSegments,
  newestNumber: (await import(join(src, "modules/player/sequence"))).newestNumber,
});
const versions = { old: await load(oldSrc), new: await load(newSrc) };

// the clock Player reads (F-10, F-19); setTimeout stays real (POLL_TURN_MS: the polls here never overlap)
let now = 0;
Date.now = () => now;

const T0 = Date.parse("2026-11-20T00:00:00.000Z");
const MAIN = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8";
const FRONTPAGE = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/frontpage-chunked.m3u8";
const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080,CODECS="avc1.64002A,mp4a.40.2",VIDEO="chunked",FRAME-RATE=60.000
${FRONTPAGE}
`;

// 8 segments ending at live number `edge`; MEDIA-SEQUENCE = live number + `ahead`; `ads`: live numbers that are ad
// segments; `shift`: ms added to every PROGRAM-DATE-TIME
const playlist = (edge: number, ahead = 0, ads: number[] = [], shift = 0) => {
  const first = edge - 7;
  const lines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", `#EXT-X-MEDIA-SEQUENCE:${first + ahead}`, `#EXT-X-TWITCH-LIVE-SEQUENCE:${first}`];
  if (ads.length) {
    const start = new Date(T0 + Math.min(...ads) * 2000 + shift).toISOString();
    lines.push(`#EXT-X-DATERANGE:ID="stitched-ad-1",CLASS="twitch-stitched-ad",START-DATE="${start}",DURATION=${(ads.length * 2).toFixed(3)}`);
  }
  for (let n = first; n <= edge; n++) {
    const ad = ads.includes(n);
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${new Date(T0 + n * 2000 + shift).toISOString()}`, `#EXTINF:2.000,${ad ? "Amazon|AD" : "live"}`, `https://seg.example/${ad ? "ad" : "live"}-${n}.ts`);
  }
  return lines.join("\n");
};

type Poll = { page: string; backup: string; ms: number; note: string };

// mulberry32
const random = (s: number) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const scenario = (rand: () => number): Poll[] => {
  const int = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));
  const count = int(30, 60);
  const breaks: [number, number][] = [];
  let at = int(2, 8);
  for (let b = 0; b < int(1, 2) && at < count - 4; b++) {
    const length = int(2, 20);
    breaks.push([at, Math.min(at + length, count - 2)]);
    at += length + int(3, 10);
  }
  let ahead = 0;
  let shift = 0;
  const backupAhead = int(0, 3);
  const polls: Poll[] = [];
  for (let i = 0; i < count; i++) {
    const edge = 100 + i;
    const current = breaks.find(([a, b]) => i >= a && i < b);
    const ended = breaks.find(([, b]) => i === b);
    if (ended) {
      ahead += int(0, 4);
      shift = rand() < 0.5 ? 0 : -Math.round(rand() * 1600);
    }
    if (!current) {
      polls.push({ page: playlist(edge, ahead, [], shift), backup: "", ms: 2000, note: `live +${ahead} ${shift}ms` });
      continue;
    }
    const ads = Array.from({ length: Math.min(i - current[0] + 1, 8) }, (_, k) => edge - k);
    const r = rand();
    let backup: string, note: string;
    if (r < 0.1) [backup, note] = ["", "backup none"];
    else if (r < 0.25) [backup, note] = [playlist(edge, backupAhead, ads.slice(0, int(1, ads.length))), "backup ads"];
    else {
      const behind = r < 0.6 ? 0 : r < 0.85 ? 1 : 2;
      [backup, note] = [playlist(edge - behind, backupAhead), `backup -${behind}`];
    }
    polls.push({ page: playlist(edge, ahead, ads, shift), backup, ms: rand() < 0.85 ? 2000 : 6000, note: `break ${note} +${ahead}` });
  }
  return polls;
};

const play = async (version: (typeof versions)["old"], polls: Poll[]) => {
  const { Player, StreamType, readSegments, newestNumber } = version;
  now = T0 + 1_000_000;
  const posted: string[] = [];
  const state = { answer: "" };
  const player = new Player({
    logger: () => {},
    postMessage: (message: any) => posted.push(message.type),
    request: ((url: string) => Promise.resolve(new Response(url === FRONTPAGE ? state.answer : ""))) as any,
  } as any);
  player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "", backupPlayerTypes: [StreamType.FRONTPAGE], lowQualityFallback: false } as any);
  player.setChannel("channel");
  const stream = player.currentStream();
  const access = () => stream.setStreamAccess(master, StreamType.FRONTPAGE);
  access();
  stream.createStreamAccess = (async () => access()) as any;
  const contentAt = (text: string, number: number): number | null => {
    const lines = text.split("\n");
    const first = Number(/#EXT-X-MEDIA-SEQUENCE:(\d+)/.exec(text)![1]);
    const segment = readSegments(lines)[number - first];
    const uri = segment ? lines[segment.uri].trim() : "";
    const live = /\/live-(\d+)\.ts$/.exec(uri);
    return live && !player.isBlankSegment(uri) ? Number(live[1]) : null;
  };
  let have = -1;
  let haveLive = -1;
  const again: string[] = [];
  const restarts: number[] = [];
  for (const [index, poll] of polls.entries()) {
    now += poll.ms;
    state.answer = poll.backup;
    const before = posted.length;
    const out = await player.onFetch(poll.page, MAIN);
    const restarted = posted.slice(before).includes("pause");
    if (restarted) restarts.push(index);
    const newest = newestNumber(out)!;
    if (tracing) {
      const ms = Number(/#EXT-X-MEDIA-SEQUENCE:(\d+)/.exec(out)![1]);
      const content = Array.from({ length: newest - ms + 1 }, (_, k) => contentAt(out, ms + k) ?? "-").join(" ");
      console.log(`    ${String(index).padStart(2)} ${poll.note.padEnd(26)} MS ${ms} newest ${newest} content [${content}]${restarted ? " RESTART" : ""} have ${have} haveLive ${haveLive}`);
    }
    if (restarted || have < 0) {
      have = newest;
      haveLive = contentAt(out, newest) ?? haveLive;
      continue;
    }
    for (let n = have + 1; n <= newest; n++) {
      const live = contentAt(out, n);
      if (live == null) continue;
      if (live <= haveLive) again.push(`${index}:${live}`);
      else haveLive = live;
    }
    // a playlist that ends below the last number fetched: the player waits for the number after it
    have = Math.max(have, newest);
  }
  return { again, restarts };
};

const rand = random(seed);
const kinds = new Map<string, { count: number; examples: { run: number; polls: Poll[]; old: any; new: any }[] }>();
const totals = { old: { again: 0, restarts: 0 }, new: { again: 0, restarts: 0 } };
for (let run = 0; run < runs; run++) {
  const polls = scenario(rand);
  tracing = run === traceRun;
  if (tracing) console.log(`run ${run}, old:`);
  const o = await play(versions.old, polls);
  if (tracing) console.log(`run ${run}, new:`);
  const n = await play(versions.new, polls);
  tracing = false;
  totals.old.again += o.again.length;
  totals.old.restarts += o.restarts.length;
  totals.new.again += n.again.length;
  totals.new.restarts += n.restarts.length;
  const kind = [
    n.restarts.length > o.restarts.length ? "new restarts more" : n.restarts.length < o.restarts.length ? "new restarts less" : "",
    n.again.length > o.again.length ? "new repeats more" : n.again.length < o.again.length ? "new repeats less" : "",
  ].filter(Boolean).join(", ") || (JSON.stringify(o) !== JSON.stringify(n) ? "same counts, other polls" : "");
  if (n.again.length) {
    const entry = kinds.get("new still repeats") ?? { count: 0, examples: [] };
    entry.count++;
    if (entry.examples.length < 50) entry.examples.push({ run, polls, old: o, new: n });
    kinds.set("new still repeats", entry);
  }
  if (!kind) continue;
  const entry = kinds.get(kind) ?? { count: 0, examples: [] };
  entry.count++;
  if (entry.examples.length < 50) entry.examples.push({ run, polls, old: o, new: n });
  kinds.set(kind, entry);
}

console.log(`${runs} runs, seed ${seed}`);
console.log(`old: ${totals.old.restarts} restarts, ${totals.old.again} live segments fetched again`);
console.log(`new: ${totals.new.restarts} restarts, ${totals.new.again} live segments fetched again`);
for (const [kind, { count, examples }] of kinds) {
  console.log(`\n${kind}: ${count} runs`);
  // the shortest examples first
  for (const e of examples.sort((a, b) => a.polls.length - b.polls.length).slice(0, show)) {
    console.log(`  run ${e.run}: old restarts ${JSON.stringify(e.old.restarts)} again ${JSON.stringify(e.old.again)}; new restarts ${JSON.stringify(e.new.restarts)} again ${JSON.stringify(e.new.again)}`);
    const marks = new Set([...e.old.restarts, ...e.new.restarts, ...[...e.old.again, ...e.new.again].map((s: string) => Number(s.split(":")[0]))]);
    for (const [i, p] of e.polls.entries()) if ([...marks].some((m) => Math.abs(m - i) <= 3)) console.log(`    ${String(i).padStart(2)} ${p.ms}ms ${p.note}`);
  }
}
