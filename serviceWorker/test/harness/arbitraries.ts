// Media playlists shaped like Twitch's (B-022, B-023, B-034, B-035) for the property tests (T-010). A playlist is built
// from plain parameters, so a test can build several from one timeline (a page playlist and its backups) and knows
// which segments are ads.
import type { Arbitrary } from "fast-check";
import { fc } from "./property";

export const T0 = Date.parse("2026-10-03T12:00:00.000Z");
export const BASE = "https://seg.example/v1/segment/";
export const PLAYLIST_URL = "https://video-weaver.example.hls.ttvnw.net/v1/playlist/main.m3u8";

export type PlaylistParams = {
  liveStart: number; // live number of the first segment
  mediaSequence: number;
  count: number;
  liveTag: boolean; // EXT-X-TWITCH-LIVE-SEQUENCE written
  ads: [number, number] | null; // index range of the ad segments, inclusive
  stitched: boolean; // a twitch-stitched-ad DATERANGE over the ad segments (else the titles carry the marker)
  quartiles: number; // twitch-ad-quartile DATERANGE lines
  adTitle: string;
  announced: boolean; // a break announced after the last segment (B-034), only without ad segments
  fmp4: boolean;
  prefetch: number; // EXT-X-TWITCH-PREFETCH lines after the last segment when it is live
  extras: boolean; // unknown Twitch tags between segments
  relative: boolean; // segment URIs relative to the playlist URL
  jitterMs: number; // added to every PROGRAM-DATE-TIME of this token (B-057)
};

export type Playlist = {
  params: PlaylistParams;
  text: string;
  adIndexes: number[];
  segmentUris: string[]; // as written
  adPrefetch: string | null; // the announced break's prefetch URI, as written
  adDateranges: string[]; // the lines stripAdDateranges takes out
};

const iso = (ms: number) => new Date(ms).toISOString();
const isAd = (p: PlaylistParams, index: number) => p.ads != null && index >= p.ads[0] && index <= p.ads[1];

export function buildPlaylist(p: PlaylistParams): Playlist {
  const ext = p.fmp4 ? "mp4" : "ts";
  const uri = (kind: string, live: number) => `${p.relative ? "" : BASE}${kind}-${live}.${ext}`;
  const map = (kind: string) => `#EXT-X-MAP:URI="${p.relative ? "" : BASE}${kind}-init.mp4"`;
  const pdt = (index: number) => T0 + (p.liveStart + index) * 2000 + p.jitterMs;
  const lines = ["#EXTM3U", `#EXT-X-VERSION:${p.fmp4 ? 6 : 3}`, "#EXT-X-TARGETDURATION:6", `#EXT-X-MEDIA-SEQUENCE:${p.mediaSequence}`];
  if (p.liveTag) lines.push(`#EXT-X-TWITCH-LIVE-SEQUENCE:${p.liveStart}`);
  lines.push(`#EXT-X-TWITCH-ELAPSED-SECS:${(p.liveStart * 2).toFixed(3)}`);
  lines.push(`#EXT-X-DATERANGE:ID="playlist-creation-1",CLASS="timestamp",START-DATE="${iso(T0)}",END-ON-NEXT=YES`);
  const adDateranges: string[] = [];
  if (p.ads) {
    const [from, to] = p.ads;
    if (p.stitched) {
      const line = `#EXT-X-DATERANGE:ID="stitched-ad-1-${to - from + 1}",CLASS="twitch-stitched-ad",START-DATE="${iso(pdt(from))}",DURATION=${((to - from + 1) * 2).toFixed(3)},X-TV-TWITCH-AD-ROLL-TYPE="MIDROLL"`;
      lines.push(line);
      adDateranges.push(line);
    }
    for (let q = 0; q < p.quartiles; q++) {
      const line = `#EXT-X-DATERANGE:ID="quartile-${q}",CLASS="twitch-ad-quartile",START-DATE="${iso(pdt(from) + q * 1000)}",X-TV-TWITCH-AD-QUARTILE="${q}"`;
      lines.push(line);
      adDateranges.push(line);
    }
  }
  const segmentUris: string[] = [];
  const adIndexes: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const ad = isAd(p, i);
    const changed = i > 0 && ad !== isAd(p, i - 1);
    if (p.fmp4 && (i === 0 || changed)) lines.push(map(ad ? "ad" : "live"));
    if (changed) lines.push("#EXT-X-DISCONTINUITY");
    lines.push(`#EXT-X-PROGRAM-DATE-TIME:${iso(pdt(i))}`);
    lines.push(`#EXTINF:2.000,${ad ? p.adTitle : "live"}`);
    if (p.extras && i % 3 === 1) lines.push(`#EXT-X-TWITCH-INFO:SEGMENT=${i}`);
    const u = uri(ad ? "ad" : "live", p.liveStart + i);
    lines.push(u);
    segmentUris.push(u);
    if (ad) adIndexes.push(i);
  }
  const lastLive = p.count > 0 && !isAd(p, p.count - 1);
  if (lastLive) for (let n = 1; n <= p.prefetch; n++) lines.push(`#EXT-X-TWITCH-PREFETCH:${uri("live", p.liveStart + p.count - 1 + n)}`);
  let adPrefetch: string | null = null;
  if (p.announced && !p.ads && lastLive) {
    const line = `#EXT-X-DATERANGE:ID="stitched-ad-2-10",CLASS="twitch-stitched-ad",START-DATE="${iso(pdt(p.count) + 1300)}",DURATION=20.000`;
    lines.push(line);
    adDateranges.push(line);
    lines.push("#EXT-X-DISCONTINUITY");
    if (p.fmp4) lines.push(map("ad"));
    adPrefetch = uri("ad", p.liveStart + p.count + p.prefetch);
    lines.push(`#EXT-X-TWITCH-PREFETCH:${adPrefetch}`);
  }
  return { params: p, text: lines.join("\n") + "\n", adIndexes, segmentUris, adPrefetch, adDateranges };
}

// the titles Twitch gave ad segments (B-035); outside a stitched break only "Amazon|..." marks one by itself
const STITCHED_TITLES = ["Amazon|AD_ID", "3935266624", "FT|abc", "InnovidAds|123"];

export const playlistParams = (overrides: Partial<{ [K in keyof PlaylistParams]: Arbitrary<PlaylistParams[K]> }> = {}) =>
  fc
    .record({
      liveStart: fc.integer({ min: 0, max: 1_000_000 }),
      mediaSequence: fc.integer({ min: 0, max: 1_000_000 }),
      count: fc.integer({ min: 1, max: 16 }),
      liveTag: fc.boolean(),
      ads: fc.option(fc.tuple(fc.nat(15), fc.nat(15)), { nil: null }),
      stitched: fc.boolean(),
      quartiles: fc.integer({ min: 0, max: 2 }),
      adTitle: fc.constantFrom(...STITCHED_TITLES),
      announced: fc.boolean(),
      fmp4: fc.boolean(),
      prefetch: fc.integer({ min: 0, max: 2 }),
      extras: fc.boolean(),
      relative: fc.boolean(),
      jitterMs: fc.constant(0),
      ...overrides,
    })
    .map((p): PlaylistParams => {
      // the ad range inside the playlist, and a title that marks an ad where the playlist has no stitched DATERANGE
      const ads = p.ads ? ([Math.min(p.ads[0], p.ads[1], p.count - 1), Math.min(Math.max(p.ads[0], p.ads[1]), p.count - 1)] as [number, number]) : null;
      return { ...p, ads, adTitle: ads && !p.stitched ? "Amazon|AD_ID" : p.adTitle };
    });

export const playlists = (overrides: Parameters<typeof playlistParams>[0] = {}) => playlistParams(overrides).map(buildPlaylist);
