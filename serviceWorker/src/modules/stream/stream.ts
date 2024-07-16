import { TwitchService } from "../twitch/twitch.service";
import { StreamType } from "./interface/stream.enum";
import { Server, StreamUrl } from "./interface/stream.types";

export class Stream {
  serverList: Server[] = []; //the list of servers links m3u8
  channelName: string; //the channel name
  twitchService: TwitchService;

  constructor(channelName: string) {
    this.channelName = channelName;
    this.twitchService = new TwitchService("");
  }

  removeServer(server: Server): void {
    const index = this.serverList.indexOf(server);
    if (index > -1) this.serverList.splice(index, 1);
  }

  //add m3u8 links with quality to the list of servers
  setStreamAccess(text: string, type = "local", sig = true): void {
    const qualityUrlSplit: StreamUrl[] = [];
    let captureArray: RegExpExecArray | null;

    const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;

    while ((captureArray = REGEX.exec(text)) !== null) {
      qualityUrlSplit.push({ quality: captureArray[1], url: captureArray[2] });
    }

    const streamList: Server = new Server({ type: type, urlList: qualityUrlSplit, sig: sig });
    this.serverList.push(streamList);
  }

  //create a new stream access
  async createStreamAccess(playerType: StreamType, integrityToken: string): Promise<void> {
    try {
      const streamDataAccess = await this.twitchService.playbackAccessToken(this.channelName, playerType, integrityToken);
      console.log("New Connection: ", playerType, streamDataAccess.token.includes('"hide_ads":true'));
      const m3u8Text = await this.twitchService.getM3U8(this.channelName, streamDataAccess);
      this.setStreamAccess(m3u8Text, playerType);
    } catch (e) {
      logger(e);
    }
  }

  getStreamByStreamType(accessType: StreamType): Server[] {
    //filter all server by type
    const servers = this.serverList.filter((x) => x.type == accessType);
    if (!servers) return [];

    return servers;
  }
}
