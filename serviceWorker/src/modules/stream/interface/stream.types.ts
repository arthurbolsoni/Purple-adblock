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
export class Server {
  type!: string;
  urlList!: StreamUrl[];
  sig!: boolean;

  // highest bandwidth; masters are not sorted by quality (the first variant of a captured backup master is 360p30)
  bestQuality = (): StreamUrl | undefined => this.urlList.reduce<StreamUrl | undefined>((best, x) => (!best || x.bandwidth > best.bandwidth ? x : best), undefined);
  findByQuality = (quality: string) => this.urlList.find((x) => x.quality == quality);

  constructor(partial: Partial<Server>) {
    Object.assign(this, partial);
  }
}
