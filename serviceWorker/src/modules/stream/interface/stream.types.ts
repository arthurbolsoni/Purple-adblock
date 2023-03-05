export class StreamUrl {
  url: string = "";
  quality: string = "";
}
export class Server {
  type!: string;
  urlList!: StreamUrl[];
  sig!: boolean;

  bestQuality = () => {
    return this.urlList[0];
  };
  findByQuality = (quality: string) => this.urlList.find((x) => x.quality == quality)

  constructor(partial: Partial<Server>) {
    Object.assign(this, partial);
  }
}
