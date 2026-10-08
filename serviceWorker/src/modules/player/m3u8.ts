// Playlist edits work on the lines of the original text: a replaced segment changes its #EXTINF and URI lines, and
// every other line (MAP, PROGRAM-DATE-TIME, DATERANGE, DISCONTINUITY, PART, PRELOAD-HINT, Twitch and unknown tags)
// stays as it was (T-101). The player often does not start on regenerated playlists
// (docs/findings/2026-10-07-backups-and-rewritten-playlists.md).

import { detectAds } from "./ad-detector";
import { readSegments } from "./segments";

export { readSegments } from "./segments";
export type { SegmentLines } from "./segments";

const sameSecond = (a: number | null, b: number | null) => a != null && b != null && Math.floor(a / 1000) === Math.floor(b / 1000);

// Replaces each ad segment of the main playlist (first text) with the first live segment of a backup that starts in
// the same second. Ad segments are the detector's, in the main playlist and in each backup (T-203); only segment lines
// are copied from a backup, never its tags. Without a replacement the main text comes back unchanged.
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
    const ads = new Set(detectAds(text).adSegments);
    return readSegments(backupLines).flatMap((segment, index) => (ads.has(index) ? [] : [{ ...segment, uriLine: backupLines[segment.uri].trim() }]));
  });

  const ads = new Set(detectAds(main).adSegments);
  let replaced = 0;
  for (const [index, segment] of readSegments(lines).entries()) {
    if (!ads.has(index)) continue;
    for (const candidates of backupSegments) {
      const replacement = candidates.find((candidate) => sameSecond(candidate.time, segment.time));
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
