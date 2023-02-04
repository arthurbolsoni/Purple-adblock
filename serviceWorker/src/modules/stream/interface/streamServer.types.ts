export class qualityUrl {
  url: string = "";
  quality: string = "";
}
export class Server {
  type!: string;
  urlList!: qualityUrl[];
  sig!: boolean;

  bestQuality = () => {
    return this.urlList[0];
  };
  findByQuality = (quality: string) => this.urlList.find((x) => x.quality == quality);

  constructor(partial: Partial<Server>) {
    Object.assign(this, partial);
  }
}
