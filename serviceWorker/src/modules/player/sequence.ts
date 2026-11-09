// F-23 (T-817): a backup playlist numbered as the page's playlist numbers the same segment. Each token's playlist
// numbers the stream from its own base, and the page's moves ahead of the backups' at each stitched midroll it gets
// (B-054); the player asks for the number after the last segment it fetched, so a backup that gives the same moment a
// lower number lists nothing new to it until its numbers catch up (docs/findings/2026-10-09-sequence-numbering.md).
// F-27 (T-826): after stitched breaks the page's playlist also dates a segment 0.07 to 1.6 s earlier than the backups'
// (B-057), so by date-time the backup's copy of the page's newest segment took the next number and the player fetched
// that segment again; EXT-X-TWITCH-LIVE-SEQUENCE numbers the segments alike on every token
// (docs/findings/2026-10-31-same-segment-twice.md).

import { detectAds } from "./ad-detector";
import { readSegments } from "./segments";

// a segment of the page's playlist: its sequence number, PROGRAM-DATE-TIME (ms), duration (s) and, when the playlist
// has EXT-X-TWITCH-LIVE-SEQUENCE, its live number
export type SequenceReference = { sequence: number; time: number; duration: number; live?: number };

const MEDIA_SEQUENCE = "#EXT-X-MEDIA-SEQUENCE:";
const LIVE_SEQUENCE = "#EXT-X-TWITCH-LIVE-SEQUENCE:";
// PROGRAM-DATE-TIME jitter, in segments, under which a backup segment counts as starting with a page segment
const TOLERANCE = 0.05;

const tagNumber = (lines: string[], tag: string): number | null => {
  const line = lines.find((raw) => raw.trim().startsWith(tag));
  const value = line ? Number(line.trim().slice(tag.length)) : NaN;
  return Number.isInteger(value) ? value : null;
};
const mediaSequence = (lines: string[]): number | null => tagNumber(lines, MEDIA_SEQUENCE);

// F-24: the last number the player can fetch from a playlist, prefetch URIs included (it fetches them as soon as they
// are listed): MEDIA-SEQUENCE + segments + EXT-X-TWITCH-PREFETCH lines - 1. null without MEDIA-SEQUENCE.
export function newestNumber(text: string): number | null {
  const lines = text.split("\n");
  const first = mediaSequence(lines);
  if (first == null) return null;
  const count = lines.filter((raw) => {
    const line = raw.trim();
    return line.startsWith("#EXTINF:") || line.startsWith("#EXT-X-TWITCH-PREFETCH:");
  }).length;
  return first + count - 1;
}

// F-28: the live number of the segment or prefetch URI a playlist lists under `number` (EXT-X-TWITCH-LIVE-SEQUENCE +
// its offset from MEDIA-SEQUENCE). null when the playlist does not list `number`, without both tags, or with ad
// segments, whose positions have no live number.
export function liveNumberAt(text: string, number: number): number | null {
  const lines = text.split("\n");
  const first = mediaSequence(lines);
  const live = tagNumber(lines, LIVE_SEQUENCE);
  const newest = newestNumber(text);
  if (first == null || live == null || newest == null || number < first || number > newest || detectAds(text).adSegments.length) return null;
  return live + number - first;
}

// F-28 (T-832): the newest live number among the segments of a page playlist the player gets as content, leaving out the
// `blank` ones (indexes the player gets as the blank segment: ad segments no backup replaced). They are numbered by
// EXT-X-TWITCH-LIVE-SEQUENCE + index when the ad segments (`ads`) are the end of the playlist, a midroll in place of live
// segments: a replaced ad segment is the live segment of its time. A preroll lists its ad segments first and live ones
// after, and the page's next playlist numbers those otherwise (twitch.tv, 2026-11-08): then only the segments before
// the first ad count. null without the tag or with no segment left.
export function newestLiveContent(text: string, ads: number[], blank: number[]): number | null {
  const lines = text.split("\n");
  const live = tagNumber(lines, LIVE_SEQUENCE);
  if (live == null) return null;
  const count = readSegments(lines).length;
  const first = ads.length ? Math.min(...ads) : count;
  const endsWithAds = first + ads.length === count;
  const skip = new Set(blank);
  for (let index = (endsWithAds ? count : first) - 1; index >= 0; index--) if (!skip.has(index)) return live + index;
  return null;
}

// The newest segment that is not an ad and has a date-time; with `beforeAds`, the newest before the first ad segment
export function sequenceReference(text: string, beforeAds = false): SequenceReference | null {
  const lines = text.split("\n");
  const first = mediaSequence(lines);
  if (first == null) return null;
  const live = tagNumber(lines, LIVE_SEQUENCE);
  const segments = readSegments(lines);
  const ads = new Set(detectAds(text).adSegments);
  const end = beforeAds && ads.size ? Math.min(...ads) : segments.length;
  for (let index = end - 1; index >= 0; index--) {
    const segment = segments[index];
    if (ads.has(index) || segment.time == null || !(segment.duration > 0)) continue;
    const reference: SequenceReference = { sequence: first + index, time: segment.time, duration: segment.duration };
    if (live != null) reference.live = live + index;
    return reference;
  }
  return null;
}

// What to add to `backup`'s sequence numbers so that each of its segments gets the number the page's playlist gives
// the same segment. F-27: with `byLive` (alignByLiveSequence, default on) and EXT-X-TWITCH-LIVE-SEQUENCE in both, the
// page's number minus its live number, less the backup's. Else by date-time: the number the page's playlist gives the
// moment where the backup segment ends, so a backup segment starting inside a page segment gets the next number.
// null without a date-time to compare.
export function sequenceShift(backup: string, reference: SequenceReference, byLive = true): number | null {
  const own = sequenceReference(backup);
  if (!own) return null;
  if (byLive && reference.live != null && own.live != null) return reference.sequence - reference.live - (own.sequence - own.live) || 0;
  const position = reference.sequence + (own.time - reference.time) / (reference.duration * 1000);
  return Math.ceil(position - own.sequence - TOLERANCE) || 0;
}

// The MEDIA-SEQUENCE line moved by `shift`; every other line as it was (rule 3). EXT-X-TWITCH-LIVE-SEQUENCE stays: it
// numbers the live stream alike on every token, and the page's playlist runs ahead of it by the same shift (B-054).
export function shiftSequence(text: string, shift: number): string {
  if (!shift) return text;
  const lines = text.split("\n");
  const index = lines.findIndex((raw) => raw.trim().startsWith(MEDIA_SEQUENCE));
  const first = mediaSequence(lines);
  if (index < 0 || first == null) return text;
  lines[index] = lines[index].replace(String(first), String(first + shift));
  return lines.join("\n");
}
