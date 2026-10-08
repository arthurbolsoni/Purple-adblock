// Ad detection (F-02, F-03, T-201): the only place that knows the ad markers.
import { readSegments } from "./segments";

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

// Class of a media playlist and the indexes (in segment order) of its ad segments.
export function detectAds(text: string): { class: AdClass; adSegments: number[] } {
  const lines = text.split("\n").map((line) => line.trim());
  const adSegments = readSegments(lines).flatMap((segment, index) => (isAdSegment(segment.title, lines[segment.uri]) ? [index] : []));
  if (adSegments.length) return { class: AdClass.SSAI, adSegments };
  return { class: lines.some(isPlaylistMarker) ? AdClass.MARKED_LIVE : AdClass.NONE, adSegments };
}
