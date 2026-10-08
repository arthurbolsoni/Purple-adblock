// Playlist edits work on the lines of the original text: a replaced segment changes its #EXTINF and URI lines, and
// every other line (MAP, PROGRAM-DATE-TIME, DATERANGE, DISCONTINUITY, PART, PRELOAD-HINT, Twitch and unknown tags)
// stays as it was (T-101). The player often does not start on regenerated playlists
// (docs/findings/2026-10-07-backups-and-rewritten-playlists.md).

import { isAdSegment } from "./ad-detector";
import { readSegments } from "./segments";

export { readSegments } from "./segments";
export type { SegmentLines } from "./segments";

const sameSecond = (a: number | null, b: number | null) => a != null && b != null && Math.floor(a / 1000) === Math.floor(b / 1000);

// Replaces each ad segment of the main playlist (first text) with the first live segment of a backup that starts in
// the same second. Without a replacement the main text comes back unchanged.
export function mergeM3u8Contents(contents: string[]): string {
  return mergeWithBackups(contents).text;
}

// mergeM3u8Contents, with the number of ad segments replaced.
export function mergeWithBackups(contents: string[]): { text: string; replaced: number } {
  if (!contents.length) return { text: "", replaced: 0 };
  const [main, ...backups] = contents;

  const lines = main.split("\n");
  const backupSegments = backups.map((text) => {
    const backupLines = text.split("\n");
    return readSegments(backupLines).map((segment) => ({ ...segment, uriLine: backupLines[segment.uri].trim() }));
  });

  let replaced = 0;
  for (const segment of readSegments(lines)) {
    if (!isAdSegment(segment.title, lines[segment.uri])) continue;
    for (const candidates of backupSegments) {
      const replacement = candidates.find((candidate) => !isAdSegment(candidate.title, candidate.uriLine) && sameSecond(candidate.time, segment.time));
      if (!replacement) continue;

      const extinf = `#EXTINF:${replacement.durationText},${replacement.title}`;
      if (segment.extinf >= 0) lines[segment.extinf] = extinf;
      lines[segment.uri] = replacement.uriLine;
      replaced++;
      break;
    }
  }
  return { text: replaced ? lines.join("\n") : main, replaced };
}
