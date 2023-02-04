import { StreamType } from "./interface/stream.enum";
import { Server, StreamUrl } from "./interface/stream.types";

export class Stream {
  serverList: Server[] = [];
  channelName: string;
  currentTunnel: string;
  tunnelList: string[];

  constructor(channelName: string) {
    this.tunnelList = ["https://eu1.jupter.ga/channel/{channelname}"];

    this.channelName = channelName;
    this.currentTunnel = this.tunnelList[0];
  }

  //add m3u8 links with quality to the list of servers
  createServer(text: string, type = "local", sig = true): void {
    const qualityUrlSplit: StreamUrl[] = [];
    let captureArray: RegExpExecArray | null;

    const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;

    while ((captureArray = REGEX.exec(text)) !== null) {
      qualityUrlSplit.push({ quality: captureArray[1], url: captureArray[2] });
    }

    const streamList: Server = new Server({ type: type, urlList: qualityUrlSplit, sig: sig });
    this.serverList.push(streamList);
  }

  //add a new player stream external
  async externalRequest(ignoreCustom: boolean = false): Promise<boolean> {
    if (ignoreCustom) this.currentTunnel = this.tunnelList[0];
    LogPrint("External Server: Loading");

    try {
      const response: Response = await global.realFetch(this.currentTunnel.replace("{channelname}", this.channelName));
      if (!response.ok) LogPrint("Server proxy return error", this.currentTunnel, response.status);

      this.createServer(await response.text(), StreamType.EXTERNAL);
      LogPrint("External Server: OK");
      return true;
    } catch (e) {
      LogPrint("Server proxy return error", this.currentTunnel, e);
      return false;
    }
  }

  //create a new stream access
  async CreateStreamAccess(stream: StreamType): Promise<boolean> {
    if (stream == StreamType.EXTERNAL) {
      if (!this.externalRequest()) this.externalRequest(true);
      return false;
    }

    try {
      const query = {
        operationName: "PlaybackAccessToken",
        variables: {
          isLive: true,
          login: this.channelName,
          isVod: false,
          vodID: "",
          playerType: stream,
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712",
          },
        },
      };

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

      LogPrint("Server loaded " + stream);

      this.createServer(text, stream);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  getStreamServersByStreamType(accessType: StreamType, quality: string): StreamUrl[] {
    //filter all server by type
    const servers = this.serverList.filter((x) => x.type == accessType);
    if (!servers) return [];

    //filter all server url by quality or bestquality
    const streamUrlList = servers.map((x: Server) => x.findByQuality(quality)).filter((x) => x !== undefined) as StreamUrl[];
    return !streamUrlList.length ? servers.map((x) => x.bestQuality()) : streamUrlList;
  }
}
