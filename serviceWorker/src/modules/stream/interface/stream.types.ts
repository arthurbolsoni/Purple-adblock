export class StreamUrl {
  quality: string = "";
  resolution: string = "";
  codecs: string = "";
  bandwidth: number = 0;
  url: string = "";

  constructor(partial: Partial<StreamUrl> = {}) {
    Object.assign(this, partial);
  }
}
// T-407 (F-11): codec family of a variant's CODECS: avc (avc1, avc3), hevc (hvc1, hev1), av1 (av01); "" otherwise
export function codecFamily(codecs: string): string {
  for (const codec of codecs.split(",").map((c) => c.trim().toLowerCase())) {
    if (codec.startsWith("avc1") || codec.startsWith("avc3")) return "avc";
    if (codec.startsWith("hvc1") || codec.startsWith("hev1")) return "hevc";
    if (codec.startsWith("av01")) return "av1";
  }
  return "";
}

// the variant the player is on, or only its quality name (from the player's setQuality)
export type VariantTarget = { quality: string; resolution?: string; codecs?: string };

const qualityName = (quality: string) => quality.replace(/\s*\(source\)\s*$/i, "").trim();
const highest = (list: StreamUrl[]) => list.reduce<StreamUrl | undefined>((best, x) => (!best || x.bandwidth > best.bandwidth ? x : best), undefined);

export class Server {
  type!: string;
  urlList!: StreamUrl[];
  sig!: boolean;

  // highest bandwidth; masters are not sorted by quality (the first variant of a captured backup master is 360p30)
  bestQuality = (): StreamUrl | undefined => this.urlList.reduce<StreamUrl | undefined>((best, x) => (!best || x.bandwidth > best.bandwidth ? x : best), undefined);
  findByQuality = (quality: string) => this.urlList.find((x) => x.quality == quality);

  // T-407 (F-11): same quality and codec family; else the same resolution, same family first; else the best variant of
  // the same family; else bestQuality(). Without codecs (a quality name only), the variant with that name. Switching
  // codec family in the middle of a stream is what F-11 avoids (issue #105).
  pick = (target: VariantTarget): StreamUrl | undefined => {
    const family = codecFamily(target.codecs ?? "");
    const quality = qualityName(target.quality ?? "");
    const sameFamily = (x: StreamUrl) => family !== "" && codecFamily(x.codecs) === family;
    if (family) {
      const same = highest(this.urlList.filter((x) => sameFamily(x) && quality !== "" && qualityName(x.quality) === quality));
      if (same) return same;
    } else if (quality) {
      const named = this.urlList.find((x) => qualityName(x.quality) === quality);
      if (named) return named;
    }
    if (target.resolution) {
      const sameResolution = this.urlList.filter((x) => x.resolution === target.resolution);
      const found = highest(sameResolution.filter(sameFamily)) ?? highest(sameResolution);
      if (found) return found;
    }
    return highest(this.urlList.filter(sameFamily)) ?? this.bestQuality();
  };

  constructor(partial: Partial<Server>) {
    Object.assign(this, partial);
  }
}
