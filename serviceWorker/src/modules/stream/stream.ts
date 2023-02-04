import { streams, streamType } from "./interface/stream.type";
import { qualityUrl, Server, } from "./interface/streamServer.types";

export class Stream {
  serverList: Server[] = [];
  // hls: HLS = new HLS();
  channelName: string;
  currentTunnel: string;
  tunnelList: string[];

  constructor(channelName: string, tunnel?: string) {
    this.tunnelList = ["https://eu1.jupter.ga/channel/{channelname}"];

    this.channelName = channelName;
    this.currentTunnel = tunnel || this.tunnelList[0];
  }

  //add m3u8 links with quality to the list of servers
  async createServer(text: string, type = "local", sig = true) {
    const qualityUrlSplit: qualityUrl[] = [];
    let captureArray: RegExpExecArray | null;

    const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;

    while ((captureArray = REGEX.exec(text)) !== null) {
      qualityUrlSplit.push({ quality: captureArray[1], url: captureArray[2] });
    }

    const streamList: Server = new Server({ type: type, urlList: qualityUrlSplit, sig: sig });
    this.serverList.push(streamList);

    // if (!sig) {
    //   await this.signature();
    // }
    return true;
  }

  // async signature() {
  //   const REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;

  //   await new Promise((resolve) => {
  //     this.serverList
  //       .filter((x: any) => x.sig == false)
  //       .forEach(async (x: any) => {
  //         const match: RegExpExecArray | null = REGEX.exec(x.urlList[0].url);
  //         if (match) {
  //           try {
  //             await fetch("https://jupter.ga/hls/v2/sig/" + match[2] + "/" + match[1]);
  //             x.sig = true;
  //             resolve(true);
  //           } catch {
  //             resolve(false);
  //           }
  //         } else {
  //           resolve(false);
  //         }
  //       }),
  //       resolve(false);
  //   });
  // }

  //add a new player stream external
  async externalRequest(customIgnore: boolean = false): Promise<boolean> {
    if (customIgnore) this.currentTunnel = this.tunnelList[0];

    try {
      global.LogPrint("External Server: Loading");
      const response: Response = await global.realFetch(this.currentTunnel.replace("{channelname}", this.channelName));

      if (!response.ok) {
        throw new Error("server proxy return error or not found");
      }

      const text: string = await response.text();

      global.LogPrint("External Server: OK");

      this.createServer(text, streams.external.name);

      return true;
    } catch (e) {
      global.LogPrint("server proxy return error or not found " + this.currentTunnel);
      global.LogPrint(e);
      return false;
    }
  }

  //create a new stream access
  async streamAccess(stream: streamType): Promise<boolean> {
    if (stream.name == streams.external.name) {
      if (!this.externalRequest()) this.externalRequest(true);
      return false;
    }

    try {
      const query = {
        "operationName": "PlaybackAccessToken",
        "variables": {
          "isLive": true,
          "login": this.channelName,
          "isVod": false,
          "vodID": "",
          "playerType": stream.playerType
        },
        "extensions": {
          "persistedQuery": {
            "version": 1,
            "sha256Hash": "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"
          }
        }
      }

      const gql = await global.realFetch("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "Host": "gql.twitch.tv", "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
        body: JSON.stringify(query),
      });
      const streamDataAccess: any = await gql.json();

      const url =
        "https://usher.ttvnw.net/api/channel/hls/" +
        this.channelName +
        ".m3u8?allow_source=true&fast_bread=true&p=" +
        Math.floor(Math.random() * 1e7) +
        "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
        streamDataAccess.data.streamPlaybackAccessToken.signature +
        "&supported_codecs=avc1&token=" +
        streamDataAccess.data.streamPlaybackAccessToken.value;
      const text = await (await global.realFetch(url)).text();

      global.LogPrint("Server loaded " + stream.name);

      this.createServer(text, stream.name);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  getStreamServersByStreamType(accessType: streamType, quality: string): qualityUrl[] {
    //filter all server by type
    const servers = this.serverList.filter((x) => x.type == accessType.name);
    if (!servers) return [];

    //filter all server url by quality or bestquality
    const streamUrlList = servers.map((x: Server) => x.findByQuality(quality)).filter((x) => x !== undefined) as qualityUrl[];
    return !streamUrlList.length ? servers.map((x) => x.bestQuality()) : streamUrlList;
  }
}