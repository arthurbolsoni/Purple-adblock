// F-31 (T-606): what a break's playlist says about the break, for the diagnostic log's breakStart (docs/server/ads.md):
// - stitched breaks: the twitch-stitched-ad DATERANGE's X-TV-TWITCH-AD-ROLL-TYPE (PREROLL, MIDROLL) is the roll; the
//   pod lasts X-TV-TWITCH-AD-POD-FILLED-DURATION when given, else the DURATIONs of its X-TV-TWITCH-AD-POD-LENGTH ads
//   when the playlist lists every X-TV-TWITCH-AD-POD-POSITION (one DATERANGE per ad);
// - client-side breaks: the twitch-maf-ad DATERANGE has no roll (B-032; the page's blocked request says it, F-04) and
//   its PLANNED-DURATION is the slot's length.
// Read only from tag attributes; nothing else of the playlist (ids, URLs, tokens) leaves here.
import { isStitchedMarker } from "./ad-detector";

export type Roll = "preroll" | "midroll";
export type BreakDetails = { roll?: Roll; declared?: number };

// an attribute's value, quoted or not
const attribute = (line: string, name: string): string | undefined => {
  const match = new RegExp(`[:,]${name}=(?:"([^"]*)"|([^,]*))`).exec(line);
  return match ? (match[1] ?? match[2]) : undefined;
};
const positive = (text: string | undefined) => {
  const value = parseFloat(text ?? "");
  return Number.isFinite(value) && value > 0 ? value : undefined;
};
const ROLLS: Record<string, Roll> = { PREROLL: "preroll", MIDROLL: "midroll" };

export function breakDetails(text: string): BreakDetails {
  const dateranges = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("#EXT-X-DATERANGE:"));
  const stitched = dateranges.filter(isStitchedMarker);
  const details: BreakDetails = {};
  if (stitched.length) {
    const roll = ROLLS[(stitched.map((line) => attribute(line, "X-TV-TWITCH-AD-ROLL-TYPE")).find(Boolean) ?? "").toUpperCase()];
    if (roll) details.roll = roll;
    const filled = stitched.map((line) => positive(attribute(line, "X-TV-TWITCH-AD-POD-FILLED-DURATION"))).find((value) => value != null);
    const declared = filled ?? podDuration(stitched);
    if (declared != null) details.declared = Math.round(declared * 1000) / 1000;
    return details;
  }
  const slot = dateranges.find((line) => attribute(line, "CLASS") === "twitch-maf-ad");
  const planned = slot ? positive(attribute(slot, "PLANNED-DURATION")) : undefined;
  if (planned != null) details.declared = planned;
  return details;
}

// the DURATIONs of a pod's ads, when the playlist lists one for each of its positions
function podDuration(stitched: string[]): number | undefined {
  const durations = new Map<number, number>();
  let length = 1;
  for (const line of stitched) {
    const duration = positive(attribute(line, "DURATION"));
    if (duration == null) continue;
    const position = parseInt(attribute(line, "X-TV-TWITCH-AD-POD-POSITION") ?? "0", 10);
    length = Math.max(length, parseInt(attribute(line, "X-TV-TWITCH-AD-POD-LENGTH") ?? "1", 10) || 1);
    if (Number.isInteger(position) && position >= 0 && !durations.has(position)) durations.set(position, duration);
  }
  if (length > 50) return undefined;
  let sum = 0;
  for (let position = 0; position < length; position++) {
    const duration = durations.get(position);
    if (duration == null) return undefined;
    sum += duration;
  }
  return sum;
}
