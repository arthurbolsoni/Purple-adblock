// Segments of a media playlist read from its lines (T-101, T-108): no parser rewrite, no regex over raw URIs.

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
