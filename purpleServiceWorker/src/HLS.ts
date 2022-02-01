export class HLS {
  private _header: Array<string> = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", "#EXT-X-MEDIA-SEQUENCE:6"];
  private _playlist: playlistItem[] = [];
  private _sequence = 0;
  private _streamServerList: streamServer[] = [];

  async addStreamLink(text: string, type = "local", sig = false) {
    const qualityUrlSplit: qualityUrl[] = [];
    let captureArray: RegExpExecArray | null;

    const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;

    while ((captureArray = REGEX.exec(text)) !== null) {
        qualityUrlSplit.push({ quality: captureArray[1], url: captureArray[2] });
    }
    console.log(qualityUrlSplit);
    const streamList = { server: type, urlList: qualityUrlSplit, sig: sig };
    this._streamServerList.push(streamList);

    if (!sig) {
      await this.signature();
    }
    return true;
  }

  async signature() {
    const REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;

    await new Promise((resolve) =>
      this._streamServerList
        .filter((x: any) => x.sig == false)
        .forEach(async (x: any) => {
          const match: RegExpExecArray | null = REGEX.exec(x.urlList[0].url);
          if (match) {
            try {
              const a = await fetch("https://jupter.ga/hls/v2/sig/" + match[2] + "/" + match[1], {
                method: "GET",
              });
              x.sig = true;
              resolve(true);
            } catch {
              resolve(false);
            }
          }else{
            resolve(false);
          }
        }),
    );
  }

  get StreamServerList() {
    return this._streamServerList;
  }

  StreamServerListSet(value) {
    this._streamServerList.push(value);
  }

  addPlaylist(playlist: string) {
    if (playlist === null) {
      return false;
    }

    let changed = false;

    const lines = playlist.toString().split(/[\r\n]/);
    this._header[4] = lines[4];
    this._header[5] = lines[5];

    for (const i in lines) {
      if (lines[i].includes("#EXT-X-PROGRAM-DATE-TIME:")) {
        const sequenceTimestamp = Math.floor(new Date(lines[i].slice(lines[i].length - 24, lines[i].length)).getTime() / 1000);

        const r = this._playlist.filter((x) => {
          return x.timestamp >= sequenceTimestamp;
        });
        
        if (!r.length) {
          this._sequence = this._sequence + 1;
          this._playlist.push({
            time: lines[parseInt(i)],
            timestamp: sequenceTimestamp,
            info: lines[parseInt(i) + 1],
            url: lines[parseInt(i) + 2],
          });
          changed = true;
        }
      }
      while (this._playlist.length > 15) {
        this._playlist.shift();
      }
    }
    return changed;
  }

  getAllPlaylist() {
    return (
      this._header[0] +
      "\n" +
      this._header[1] +
      "\n" +
      this._header[2] +
      "\n" +
      this._header[3] +
      this._sequence +
      "\n" +
      this._header[4] +
      "\n" +
      this._header[5] +
      "\n" +
      this._playlist.map((x) => {
        return x.time + "\n" + x.info + "\n" + x.url + "\n";
      })
    );
  }
}
