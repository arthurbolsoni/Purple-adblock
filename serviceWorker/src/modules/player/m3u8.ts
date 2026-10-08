// Playlist edits work on the lines of the original text: a replaced segment changes its #EXTINF and URI lines, and
// every other line (MAP, PROGRAM-DATE-TIME, DATERANGE, DISCONTINUITY, PART, PRELOAD-HINT, Twitch and unknown tags)
// stays as it was (T-101). The player often does not start on regenerated playlists
// (docs/findings/2026-10-07-backups-and-rewritten-playlists.md).

import { detectAds, isAdUri, isStitchedMarker } from "./ad-detector";
import { readSegments, type SegmentLines } from "./segments";

export { readSegments } from "./segments";
export type { SegmentLines } from "./segments";

type Candidate = SegmentLines & { uriLine: string; map: string | null };

// EXT-X-MAP line in effect for each segment, in segment order; null in a playlist without one
function mapsOf(lines: string[], segments: SegmentLines[]): (string | null)[] {
  const maps: (string | null)[] = [];
  let current: string | null = null;
  let next = 0;
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (line.startsWith("#EXT-X-MAP:")) current = line;
    while (next < segments.length && segments[next].uri === index) {
      maps.push(current);
      next++;
    }
  });
  return maps;
}

// T-501 (F-13): a backup segment matches when its PROGRAM-DATE-TIME is less than half the ad segment's duration away
const nearest = (candidates: Candidate[], segment: SegmentLines): Candidate | undefined => {
  if (segment.time == null) return undefined;
  const tolerance = ((segment.duration > 0 ? segment.duration : 2) * 1000) / 2;
  let best: Candidate | undefined;
  for (const candidate of candidates) {
    if (candidate.time == null) continue;
    const distance = Math.abs(candidate.time - segment.time);
    if (distance < tolerance && (!best || distance < Math.abs(best.time! - segment.time))) best = candidate;
  }
  return best;
};

const isAheadLine = (line: string) => line.startsWith("#EXT-X-TWITCH-PREFETCH:") || line.startsWith("#EXT-X-PRELOAD-HINT:") || line.startsWith("#EXT-X-PART:");

// Replaces each ad segment of the main playlist (first text) with the nearest live segment of a backup whose
// PROGRAM-DATE-TIME is less than half the segment's duration away (T-501), trying the backups in order. Ad segments are
// the detector's, in the main playlist and in each backup (T-203); only segment lines are copied from a backup, never its
// tags. A backup segment with another EXT-X-MAP brings that MAP line before it, and the main one comes back before the
// next main segment or the prefetch lines after the last one (T-501); a backup that uses EXT-X-MAP is not used in a
// playlist without one, nor the other way round. Without a replacement the main text comes back unchanged.
export function mergeM3u8Contents(contents: string[]): string {
  return mergeWithBackups(contents).text;
}

// mergeM3u8Contents, with the number of ad segments replaced and the indexes of those left (T-502).
export function mergeWithBackups(contents: string[]): { text: string; replaced: number; remaining: number[] } {
  if (!contents.length) return { text: "", replaced: 0, remaining: [] };
  const [main, ...backups] = contents;

  const lines = main.split("\n");
  const backupSegments = backups.map((text) => {
    const backupLines = text.split("\n");
    const segments = readSegments(backupLines);
    const maps = mapsOf(backupLines, segments);
    const ads = new Set(detectAds(text).adSegments);
    return segments.flatMap((segment, index): Candidate[] => (ads.has(index) ? [] : [{ ...segment, uriLine: backupLines[segment.uri].trim(), map: maps[index] }]));
  });

  const segments = readSegments(lines);
  const mainMaps = mapsOf(lines, segments);
  const ads = new Set(detectAds(main).adSegments);
  const replacements = new Map<number, Candidate>();
  const remaining: number[] = [];
  for (const [index, segment] of segments.entries()) {
    if (!ads.has(index)) continue;
    const usable = (candidate: Candidate) => (candidate.map == null) === (mainMaps[index] == null);
    const replacement = backupSegments.map((candidates) => nearest(candidates.filter(usable), segment)).find(Boolean);
    if (replacement) replacements.set(index, replacement);
    else remaining.push(index);
  }
  if (!replacements.size) return { text: main, replaced: 0, remaining };

  // the line each segment starts at for the MAP it needs: its #EXTINF, else its URI
  const anchors = new Map(segments.map((segment, index) => [segment.extinf >= 0 ? segment.extinf : segment.uri, index]));
  const lastUri = segments.length ? segments[segments.length - 1].uri : -1;
  const out: string[] = [];
  let mainMap: string | null = null;
  let outMap: string | null = null;
  const useMap = (map: string | null) => {
    if (map == null || map === outMap) return;
    out.push(map);
    outMap = map;
  };
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (line.startsWith("#EXT-X-MAP:")) {
      mainMap = outMap = line;
      out.push(raw);
      return;
    }
    const anchored = anchors.get(index);
    if (anchored != null) useMap(replacements.get(anchored)?.map ?? mainMap);
    else if (index > lastUri && isAheadLine(line)) useMap(mainMap);

    const owner = segments.findIndex((segment) => segment.extinf === index || segment.uri === index);
    const replacement = owner >= 0 ? replacements.get(owner) : undefined;
    if (!replacement) out.push(raw);
    else if (segments[owner].extinf === index) out.push(`#EXTINF:${replacement.durationText},${replacement.title}`);
    else out.push(replacement.uriLine);
  });
  return { text: out.join("\n"), replaced: replacements.size, remaining };
}

const uriAttr = (line: string) => /URI="([^"]*)"/.exec(line)?.[1] ?? null;

// URI of a line that makes the player fetch media ahead of the segments: EXT-X-PART, EXT-X-PRELOAD-HINT,
// EXT-X-TWITCH-PREFETCH (the URL follows the colon)
const aheadUri = (line: string) => {
  if (line.startsWith("#EXT-X-TWITCH-PREFETCH:")) return line.slice("#EXT-X-TWITCH-PREFETCH:".length).trim();
  if (line.startsWith("#EXT-X-PART:") || line.startsWith("#EXT-X-PRELOAD-HINT:")) return uriAttr(line);
  return null;
};

// T-502 (F-14): the last resort for the ad segments no backup replaced (`adSegments`, indexes in segment order), as
// in Brave's script. Their lines stay and their URIs are listed, with the EXT-X-MAP only ad segments use, for the
// worker to answer with a blank segment (blank-segment.ts). Lines that make the player fetch ad media ahead go, and
// their URIs are listed too: the EXT-X-PART lines of an ad segment; the EXT-X-PART, EXT-X-PRELOAD-HINT and
// EXT-X-TWITCH-PREFETCH lines after the last segment when that segment is an ad or when they follow a break announced
// after it (B-034); any of them with an ad URI. Every other line stays. Relative URIs are resolved against the
// playlist URL, absolute ones are kept as written (the player requests them as they are).
export function blankAds(text: string, adSegments: number[], playlistUrl: string): { text: string; uris: string[]; segments: number } {
  const lines = text.split("\n");
  const segments = readSegments(lines);
  const ads = new Set(adSegments.filter((index) => index >= 0 && index < segments.length));
  const resolve = (uri: string) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(uri)) return uri;
    try {
      return new URL(uri, playlistUrl).href;
    } catch {
      return uri;
    }
  };

  const segmentUris = [...ads].sort((a, b) => a - b).map((index) => resolve(lines[segments[index].uri].trim()));
  const known = new Set(segmentUris);
  const last = segments.length - 1;
  const lastUri = last >= 0 ? segments[last].uri : -1;
  const announced = lines.findIndex((line, index) => index > lastUri && isStitchedMarker(line.trim()));

  const maps: string[] = [];
  const ahead: string[] = [];
  const removed = new Set<number>();
  let map: { uri: string; segments: number[] } | null = null;
  const closeMap = () => {
    if (map && map.segments.length && map.segments.every((index) => ads.has(index))) maps.push(map.uri);
  };
  let owner = 0; // segment whose URI line comes next: the tags before a URI line belong to that segment
  lines.forEach((raw, index) => {
    while (owner < segments.length && segments[owner].uri < index) owner++;
    const line = raw.trim();
    if (line.startsWith("#EXT-X-MAP:")) {
      closeMap();
      const uri = uriAttr(line);
      map = uri == null ? null : { uri: resolve(uri), segments: [] };
      return;
    }
    if (owner < segments.length && segments[owner].uri === index) {
      map?.segments.push(owner);
      return;
    }
    const uri = aheadUri(line);
    if (uri == null) return;
    const absolute = resolve(uri);
    const tail = owner >= segments.length;
    const ad =
      known.has(absolute) ||
      isAdUri(absolute) ||
      (!tail && line.startsWith("#EXT-X-PART:") && ads.has(owner)) ||
      (tail && (ads.has(last) || (announced >= 0 && index > announced)));
    if (!ad) return;
    removed.add(index);
    ahead.push(absolute);
  });
  closeMap();

  return {
    text: removed.size ? lines.filter((_, index) => !removed.has(index)).join("\n") : text,
    uris: [...segmentUris, ...maps, ...ahead],
    segments: segmentUris.length,
  };
}
