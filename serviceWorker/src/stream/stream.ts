import { HLS } from "../hls/HLS";
import { streams, streamType } from "./type/stream.type";
import { qualityUrl, streamServer } from "./type/streamServer.types";

export class Stream {
  serverList: streamServer[] = [];
  hls: HLS = new HLS();
  channelName: string = "";

  tunnel = ["https://eu1.jupter.ga/channel/{channelname}", "https://eu2.jupter.ga/channel/{channelname}"];
  currentTunnel: string = this.tunnel[0];

  getStreamServerByStreamType = (accessType: streamType): streamServer[] => this.serverList.filter((x) => x.type == accessType.name);

  constructor(channelName: string, tunnel: string = "") {
    this.channelName = channelName;
    if (tunnel) this.currentTunnel = tunnel;
  }

  //add m3u8 links with quality to the list of servers
  async addStreamLink(text: string, type = "local", sig = true) {
    const qualityUrlSplit: qualityUrl[] = [];
    let captureArray: RegExpExecArray | null;

    const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;

    while ((captureArray = REGEX.exec(text)) !== null) {
      qualityUrlSplit.push({ quality: captureArray[1], url: captureArray[2] });
    }

    const streamList: streamServer = new streamServer({ type: type, urlList: qualityUrlSplit, sig: sig });
    this.serverList.push(streamList);

    if (!sig) {
      await this.signature();
    }
    return true;
  }

  async signature() {
    const REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;

    await new Promise((resolve) => {
      this.serverList
        .filter((x: any) => x.sig == false)
        .forEach(async (x: any) => {
          const match: RegExpExecArray | null = REGEX.exec(x.urlList[0].url);
          if (match) {
            try {
              await fetch("https://jupter.ga/hls/v2/sig/" + match[2] + "/" + match[1]);
              x.sig = true;
              resolve(true);
            } catch {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }),
        resolve(false);
    });
  }

  //add a new player stream external
  async externalPlayer(customIgnore: boolean = false): Promise<boolean> {
    if (customIgnore) this.currentTunnel = this.tunnel[0];
    try {
      global.LogPrint("External Server: Loading");
      const response: Response = await global.realFetch(this.currentTunnel.replace("{channelname}", this.channelName));

      if (!response.ok) {
        throw new Error("server proxy return error or not found");
      }

      const text: string = await response.text();

      global.LogPrint("External Server: OK");

      this.addStreamLink(text, streams.external.name);

      return true;
    } catch (e) {
      global.LogPrint("server proxy return error or not found " + this.currentTunnel);
      global.LogPrint(e);
      return false;
    }
  }

  tryExternalPlayer = async () => {
    if (!(await this.streamAccess(streams.external))) {
      this.externalPlayer(true);
    }
  };

  //create a new stream access
  async streamAccess(stream: streamType): Promise<boolean> {
    if (stream.name == streams.external.name) return await this.externalPlayer();

    try {
      const query =
        'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}';
      const body = {
        operationName: "PlaybackAccessToken_Template",
        query: query,
        variables: {
          isLive: true,
          login: this.channelName,
          isVod: false,
          vodID: "",
          playerType: stream.playerType,
        },
      };

      const gql = await global.realFetch("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
        body: JSON.stringify(body),
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

      this.addStreamLink(text, stream.name);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
