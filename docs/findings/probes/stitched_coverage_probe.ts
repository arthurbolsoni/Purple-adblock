// Probe for docs/findings/2026-10-08-ad-segment-coverage.md: reads the "serverText" playlists of soak recordings
// (outside the repo) and tallies, for each segment of a playlist with a stitched-ad marker, its title kind, whether a
// twitch-stitched-ad START-DATE + DURATION covers it (more than half of the segment), and the twitch-stream-source
// value in force at its time. Prints counts only: no URLs, no ids.
//
//   bun docs/findings/probes/stitched_coverage_probe.ts ~/purple-recordings/2026-10-07-soak [more dirs...]
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { readSegments } from "../../../serviceWorker/src/modules/player/segments";

const attr = (line: string, name: string) => {
  const at = line.indexOf(`${name}=`);
  if (at < 0) return "";
  const rest = line.slice(at + name.length + 1);
  return rest.startsWith('"') ? rest.slice(1, rest.indexOf('"', 1)) : rest.split(",")[0];
};

const titleKind = (title: string) =>
  title === "live" ? "live" : title.startsWith("Amazon") ? "Amazon|" : title.startsWith("FT|") ? "FT|" : /^\d+$/.test(title) ? "number" : title === "" ? "empty" : "other";

const tally = new Map<string, number>();
const add = (key: string, n = 1) => tally.set(key, (tally.get(key) ?? 0) + n);

const files = process.argv.slice(2).flatMap((dir) =>
  readdirSync(dir)
    .map((name) => join(dir, name, "serverTexts.jsonl"))
    .filter((file) => existsSync(file) && statSync(file).size > 0),
);

const rangeIds = new Set<string>();
const channels = new Set<string>();

for (const file of files) {
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    if (!raw) continue;
    const entry = JSON.parse(raw);
    const text: string = entry.text;
    const lines = text.split("\n").map((l) => l.trim());
    const ranges = lines.filter((l) => l.startsWith("#EXT-X-DATERANGE:") && attr(l, "CLASS") === "twitch-stitched-ad");
    add("playlists with markers");
    if (!ranges.length) continue;
    add("playlists with a twitch-stitched-ad range");
    for (const l of ranges) rangeIds.add(attr(l, "ID"));
    channels.add(entry.channel);

    const stitched = ranges.map((l) => ({ start: Date.parse(attr(l, "START-DATE")), end: Date.parse(attr(l, "START-DATE")) + parseFloat(attr(l, "DURATION") || "0") * 1000 }));
    const sources = lines
      .filter((l) => l.startsWith("#EXT-X-DATERANGE:") && attr(l, "CLASS") === "twitch-stream-source")
      .map((l) => ({ start: Date.parse(attr(l, "START-DATE")), value: attr(l, "X-TV-TWITCH-STREAM-SOURCE") }))
      .sort((a, b) => a.start - b.start);
    const segments = readSegments(lines);
    const last = segments[segments.length - 1];
    const lastEnd = last?.time != null ? last.time + last.duration * 1000 : NaN;
    if (stitched.every((r) => r.start >= lastEnd)) add("  every range starts at or after the last segment's end (announced)");
    if (segments.every((s) => s.title === "live")) add("  every segment titled live");

    for (const s of segments) {
      if (s.time == null) {
        add("segments without time");
        continue;
      }
      const end = s.time + s.duration * 1000;
      const covered = stitched.some((r) => Math.min(end, r.end) - Math.max(s.time!, r.start) > (s.duration * 1000) / 2);
      const source = [...sources].reverse().find((r) => r.start <= s.time! + 1)?.value;
      const sourceKind = source == null ? "no source" : source === "live" ? "source live" : `source ${titleKind(source)}`;
      add(`segment: title ${titleKind(s.title)} · ${covered ? "in range" : "outside range"} · ${sourceKind}`);
      // a rule on the segment's start alone would also take a live segment that starts before a range ends
      if (!covered && stitched.some((r) => s.time! >= r.start && s.time! < r.end)) add(`segment starts inside a range, covered less than half: title ${titleKind(s.title)}`);
    }
  }
}

for (const [key, n] of [...tally].sort(([a], [b]) => a.localeCompare(b))) console.log(`${String(n).padStart(8)}  ${key}`);
console.log(`${String(rangeIds.size).padStart(8)}  distinct twitch-stitched-ad ranges (one per ad of a pod)`);
console.log(`${String(channels.size).padStart(8)}  channels with a twitch-stitched-ad range`);
