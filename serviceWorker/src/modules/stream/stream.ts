import { StreamType } from "./interface/stream.enum";
import { Server, StreamUrl } from "./interface/stream.types";

export class Stream {
  serverList: Server[] = [];
  data: string[] = [];
  channelName: string;
  tunnelList: string[];

  constructor(channelName: string) {
    this.tunnelList = ["https://eu1.jupter.ga/channel/{channelname}", "https://eu2.jupter.ga/channel/{channelname}"];
    this.channelName = channelName;
  }

  defaultScreen(): string {
    const emptyM3u8 = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:0
#EXT-X-ALLOW-CACHE:YES`;
    return emptyM3u8;
  }

  removeServer(server: Server): void {
    const index = this.serverList.indexOf(server);
    if (index > -1) this.serverList.splice(index, 1);
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
  async externalRequest(): Promise<void> {
    logPrint("External Server: Loading");

    const urls = this.tunnelList.map((x) => x.replace("{channelname}", this.channelName));

    urls.forEach(async currentTunnel => {
      try {
        const response: Response = await global.request(currentTunnel);
        if (!response.ok) logPrint("Server proxy return error", currentTunnel, response);

        this.createServer(await response.text(), StreamType.EXTERNAL);
        logPrint("External Server: OK");
        return true;
      } catch (e) {
        logPrint("Server proxy return error", currentTunnel, e);
        return false;
      }
    });
  }

  //create a new stream access
  async CreateStreamAccess(stream: StreamType): Promise<boolean> {
    if (stream == StreamType.EXTERNAL) {
      await this.externalRequest();
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

      const gql = await global.request("https://gql.twitch.tv/gql", {
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
      const text = await (await global.request(url)).text();

      logPrint("Server loaded " + stream);

      this.createServer(text, stream);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  getStreamByStreamType(accessType: StreamType): Server[] {
    //filter all server by type
    const servers = this.serverList.filter((x) => x.type == accessType);
    if (!servers) return [];

    return servers;
  }
}
