// Playlist edits work on the lines of the original text: a replaced segment changes its #EXTINF and URI lines, and
// every other line (MAP, PROGRAM-DATE-TIME, DATERANGE, DISCONTINUITY, PART, PRELOAD-HINT, Twitch and unknown tags)
// stays as it was (T-101). The player often does not start on regenerated playlists
// (docs/findings/2026-10-07-backups-and-rewritten-playlists.md).

const hasAds = (x: string) => x?.toString().includes("stitched") || x?.toString().includes("Amazon") || x?.toString().includes("DCM,");

export type SegmentLines = {
  extinf: number; // index of the segment's #EXTINF line, -1 without one
  uri: number; // index of the URI line
  duration: number;
  durationText: string;
  title: string;
  time: number | null; // PROGRAM-DATE-TIME in ms: the segment's own tag, or the previous segment's time plus its duration
};

const EXTINF = /^#EXTINF:([^,]*),?(.*)$/;

// Segments of a media playlist. The tags between two URI lines belong to the segment of the second one, in any order;
// tags after the last URI (PART, PRELOAD-HINT, TWITCH-PREFETCH) belong to no segment.
export function readSegments(lines: string[]): SegmentLines[] {
  const segments: SegmentLines[] = [];
  let extinf = -1;
  let ownTime: number | null = null;

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (line.startsWith("#EXT-X-PROGRAM-DATE-TIME:")) {
      const time = Date.parse(line.slice("#EXT-X-PROGRAM-DATE-TIME:".length));
      ownTime = Number.isNaN(time) ? null : time;
    } else if (line.startsWith("#EXTINF:")) {
      extinf = index;
    } else if (line && !line.startsWith("#")) {
      const [, durationText = "", title = ""] = extinf >= 0 ? EXTINF.exec(lines[extinf].trim()) ?? [] : [];
      const previous = segments[segments.length - 1];
      const time = ownTime ?? (previous?.time != null ? previous.time + previous.duration * 1000 : null);
      segments.push({ extinf, uri: index, duration: parseFloat(durationText) || 0, durationText, title: title.trim(), time });
      extinf = -1;
      ownTime = null;
    }
  });
  return segments;
}

const sameSecond = (a: number | null, b: number | null) => a != null && b != null && Math.floor(a / 1000) === Math.floor(b / 1000);

// Replaces each ad segment of the main playlist (first text) with the first live segment of a backup that starts in
// the same second. Without a replacement the main text comes back unchanged.
export function mergeM3u8Contents(contents: string[]): string {
  if (!contents.length) return "";
  const [main, ...backups] = contents;

  const lines = main.split("\n");
  const backupSegments = backups.map((text) => {
    const backupLines = text.split("\n");
    return readSegments(backupLines).map((segment) => ({ ...segment, uriLine: backupLines[segment.uri].trim() }));
  });

  for (const segment of readSegments(lines)) {
    if (!hasAds(segment.title)) continue;
    for (const candidates of backupSegments) {
      const replacement = candidates.find((candidate) => !hasAds(candidate.title) && sameSecond(candidate.time, segment.time));
      if (!replacement) continue;

      const extinf = `#EXTINF:${replacement.durationText},${replacement.title}`;
      if (segment.extinf >= 0) lines[segment.extinf] = extinf;
      lines[segment.uri] = replacement.uriLine;
      break;
    }
  }
  return lines.join("\n");
}
