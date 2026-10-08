// Ad detection (F-02, F-03, T-201, T-203): the only place that knows the ad markers.
import { readSegments, type SegmentLines } from "./segments";

export enum AdClass {
  NONE = "NONE", // no marker
  MARKED_LIVE = "MARKED_LIVE", // playlist marker, every segment live (the ad comes client-side, F-04)
  SSAI = "SSAI", // at least one ad segment in the playlist
}

// Segment level: Purple 2.6.7's title markers, and URI patterns reported by Brave's script.
const TITLE_MARKERS = ["stitched", "Amazon", "DCM,"];
const URI_MARKERS = ["/adsquared/", "/_404/", "/processing"];

// Playlist level, read from tag attributes, never from the whole text: "stitched-ads-eligible" in a
// twitch-stream-source attribute is not an ad. twitch-trigger alone is not a marker either: it is in every
// playlist, with or without ads (B-021); it counts only when it carries an ad attribute.
const AD_CLASSES = ["twitch-stitched-ad", "twitch-maf-ad"];
const AD_ATTRIBUTES = ["X-TV-TWITCH-AD-AD-SESSION-ID=", "X-TV-TWITCH-AD-RADS-TOKEN="];

const attr = (line: string, name: string) => {
  const at = line.indexOf(`${name}="`);
  if (at < 0) return "";
  const start = at + name.length + 2;
  return line.slice(start, line.indexOf('"', start));
};

export const isAdSegment = (title: string, uri: string) =>
  TITLE_MARKERS.some((marker) => title.includes(marker)) || URI_MARKERS.some((marker) => uri.includes(marker));

const numberAttr = (line: string, name: string) => parseFloat(new RegExp(`[:,]${name}=([0-9.]+)`).exec(line)?.[1] ?? "");

const isStitchedMarker = (line: string) =>
  line.startsWith("#EXT-X-DATERANGE:") && (attr(line, "CLASS").startsWith("twitch-stitched") || attr(line, "ID").startsWith("stitched-ad"));

const isPlaylistMarker = (line: string) => {
  if (line.startsWith("#EXT-X-CUE-OUT")) return true;
  if (!line.startsWith("#EXT-X-DATERANGE:")) return false;
  const cls = attr(line, "CLASS");
  return (
    AD_CLASSES.includes(cls) ||
    cls.startsWith("twitch-stitched") ||
    attr(line, "ID").startsWith("stitched-ad") ||
    AD_ATTRIBUTES.some((attribute) => line.includes(attribute))
  );
};

// T-203: in a playlist with a stitched-ad marker, a segment is also an ad when its title is not "live", when a
// twitch-stitched-ad START-DATE + DURATION covers more than half of it, or when the twitch-stream-source in force at
// its time is not "live" (B-035). Ad segments titled with a number or "FT|..." carry no other marker. In the soak
// recordings the three signals agree on every segment; a range runs a little past its last segment (20.234 s over ten
// 2 s segments), hence the half-segment rule (docs/findings/2026-10-08-ad-segment-coverage.md).
function stitchedBreak(lines: string[]): ((segment: SegmentLines) => boolean) | null {
  if (!lines.some(isStitchedMarker)) return null;
  const ranges: { start: number; end: number }[] = [];
  const sources: { start: number; value: string }[] = [];
  for (const line of lines) {
    if (!line.startsWith("#EXT-X-DATERANGE:")) continue;
    const start = Date.parse(attr(line, "START-DATE"));
    if (Number.isNaN(start)) continue;
    const duration = numberAttr(line, "DURATION");
    if (isStitchedMarker(line) && duration > 0) ranges.push({ start, end: start + duration * 1000 });
    if (attr(line, "CLASS") === "twitch-stream-source") sources.push({ start, value: attr(line, "X-TV-TWITCH-STREAM-SOURCE") });
  }
  sources.sort((a, b) => a.start - b.start);

  return ({ title, time, duration }) => {
    if (title && title !== "live") return true;
    if (time == null) return false;
    const end = time + duration * 1000;
    if (ranges.some((range) => Math.min(end, range.end) - Math.max(time, range.start) > (duration * 1000) / 2)) return true;
    const source = sources.filter((s) => s.start <= time).pop();
    return source != null && source.value !== "live";
  };
}

// Class of a media playlist and the indexes (in segment order) of its ad segments.
export function detectAds(text: string): { class: AdClass; adSegments: number[] } {
  const lines = text.split("\n").map((line) => line.trim());
  const inStitchedBreak = stitchedBreak(lines);
  const adSegments = readSegments(lines).flatMap((segment, index) =>
    isAdSegment(segment.title, lines[segment.uri]) || inStitchedBreak?.(segment) ? [index] : [],
  );
  if (adSegments.length) return { class: AdClass.SSAI, adSegments };
  return { class: lines.some(isPlaylistMarker) ? AdClass.MARKED_LIVE : AdClass.NONE, adSegments };
}

// T-204: a backup is clean when it has no ad segment and no stitched-ad marker. Live segments under a stitched-ad
// marker are a break announced ahead (B-034): each backup token gets its own pod (B-036), and a backup delivered in
// that state hands the player its announcement and the prefetch lines of its first ad segments. A twitch-maf-ad
// marker over live segments does not make a backup unclean.
export const isCleanBackup = (text: string) =>
  detectAds(text).class !== AdClass.SSAI && !text.split("\n").some((line) => isStitchedMarker(line.trim()));
