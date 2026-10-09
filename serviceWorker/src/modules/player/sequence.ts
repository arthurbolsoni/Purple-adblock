// F-23 (T-817): a backup playlist numbered as the page's playlist numbers the same date-time. Each token's playlist
// numbers the stream from its own base, and the page's moves ahead of the backups' at each stitched midroll it gets
// (B-054); the player asks for the number after the last segment it fetched, so a backup that gives the same moment a
// lower number lists nothing new to it until its numbers catch up (docs/findings/2026-10-09-sequence-numbering.md).

import { detectAds } from "./ad-detector";
import { readSegments } from "./segments";

// a segment of the page's playlist: its sequence number, PROGRAM-DATE-TIME (ms) and duration (s)
export type SequenceReference = { sequence: number; time: number; duration: number };

const MEDIA_SEQUENCE = "#EXT-X-MEDIA-SEQUENCE:";
// PROGRAM-DATE-TIME jitter, in segments, under which a backup segment counts as starting with a page segment
const TOLERANCE = 0.05;

const mediaSequence = (lines: string[]): number | null => {
  const line = lines.find((raw) => raw.trim().startsWith(MEDIA_SEQUENCE));
  const value = line ? Number(line.trim().slice(MEDIA_SEQUENCE.length)) : NaN;
  return Number.isInteger(value) ? value : null;
};

// The newest segment that is not an ad and has a date-time; with `beforeAds`, the newest before the first ad segment
export function sequenceReference(text: string, beforeAds = false): SequenceReference | null {
  const lines = text.split("\n");
  const first = mediaSequence(lines);
  if (first == null) return null;
  const segments = readSegments(lines);
  const ads = new Set(detectAds(text).adSegments);
  const end = beforeAds && ads.size ? Math.min(...ads) : segments.length;
  for (let index = end - 1; index >= 0; index--) {
    const segment = segments[index];
    if (!ads.has(index) && segment.time != null && segment.duration > 0) return { sequence: first + index, time: segment.time, duration: segment.duration };
  }
  return null;
}

// What to add to `backup`'s sequence numbers so that each of its segments gets the number the page's playlist gives
// the moment where it ends: a backup segment starting inside a page segment gets the next number, so the player, at
// the end of what it fetched, asks for the backup segment covering what follows. null without a date-time to compare.
export function sequenceShift(backup: string, reference: SequenceReference): number | null {
  const own = sequenceReference(backup);
  if (!own) return null;
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
