import { StreamType } from "./interface/stream.enum";
import { Server, StreamUrl } from "./interface/stream.types";

export class Stream {
  serverList: Server[] = []; //the list of servers links m3u8
  tunnelList: string[]; //the list of tunnel links
  tunnelListHls: string[]; //the list of tunnel links
  channelName: string; //the channel name

  constructor(channelName: string) {
    this.tunnelList = ["https://eu1.jupter.ga/channel/{channelname}", "https://eu2.jupter.ga/channel/{channelname}"];
    this.tunnelListHls = ["https://eu1.jupter.ga/channel/hls/{channelname}"];
    this.channelName = channelName;
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
  async localRequest(playerType: string, complete = true): Promise<string> {
    try {
      const query = 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) { streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) { value signature __typename } videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) { value signature __typename }}'
      const body = {
        operationName: "PlaybackAccessToken_Template",
        query: query,
        variables: {
          isLive: true,
          login: this.channelName,
          isVod: false,
          vodID: "",
          playerType: playerType,
        },
      };

      const gql = await global.request("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "Host": "gql.twitch.tv", "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
        body: JSON.stringify(body),
      });
      const streamDataAccess: any = await gql.json();

      const params = "allow_source=true&fast_bread=true&p=" +
        Math.floor(Math.random() * 1e7) +
        "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
        streamDataAccess.data.streamPlaybackAccessToken.signature +
        "&supported_codecs=avc1&token=" +
        streamDataAccess.data.streamPlaybackAccessToken.value

      if (!complete) return params;

      const text = await (await global.request("https://usher.ttvnw.net/api/channel/hls/" + this.channelName + ".m3u8?" + params)).text();

      logPrint("Server loaded " + playerType);

      this.createServer(text, playerType);

      return text;
    } catch (e) {
      logPrint(e);
      return "";
    }
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

  //add a new player stream external
  async externalRequest2(stream: StreamType): Promise<void> {
    logPrint("External Server 2: Loading");

    const url = this.tunnelListHls[0].replace("{channelname}", this.channelName);
    const params = await this.localRequest(stream, false);
    const m3u8 = await fetch(url, { method: "POST", body: params });

    if (!m3u8.ok) {
      logPrint("Server proxy return error", this.tunnelListHls[0], m3u8);
      return;
    }

    const text = await m3u8.text();

    this.createServer(text, StreamType.EXTERNAL);

    logPrint("External Server 2: OK");
  }

  //create a new stream access
  async createStreamAccess(stream: StreamType): Promise<void> {
    if (stream == StreamType.EXTERNAL) {
      this.externalRequest2(StreamType.SITE);
      this.externalRequest2(StreamType.FRONTPAGE)
      this.externalRequest()
      return;
    }

    await this.localRequest(stream);
  }

  getStreamByStreamType(accessType: StreamType): Server[] {
    //filter all server by type
    const servers = this.serverList.filter((x) => x.type == accessType);
    if (!servers) return [];

    return servers;
  }
}
