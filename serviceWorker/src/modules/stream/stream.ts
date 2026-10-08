import { TwitchService } from "../twitch/twitch.service";
import { StreamType } from "./interface/stream.enum";
import { Server } from "./interface/stream.types";
import { parseVariants } from "./master";
import type { WorkerContext } from "../../scope";

export class Stream {
  serverList: Server[] = []; //the list of servers links m3u8
  channelName: string; //the channel name
  twitchService: TwitchService;

  constructor(
    channelName: string,
    private readonly scope: WorkerContext,
  ) {
    this.channelName = channelName;
    this.twitchService = new TwitchService(scope);
  }

  removeServer(server: Server): void {
    const index = this.serverList.indexOf(server);
    if (index > -1) this.serverList.splice(index, 1);
  }

  //add the variants of a master to the list of servers
  setStreamAccess(text: string, type = "local", sig = true): void {
    const urlList = parseVariants(text);
    // a master without variants (error page, empty body) adds nothing to request later
    if (!urlList.length) return;

    this.serverList.push(new Server({ type: type, urlList: urlList, sig: sig }));
  }

  //create a new stream access
  async createStreamAccess(playerType: StreamType, integrityToken: string): Promise<void> {
    try {
      const streamDataAccess = await this.twitchService.playbackAccessToken(this.channelName, playerType, integrityToken);
      console.log("New Connection: ", playerType, streamDataAccess.token.includes('"hide_ads":true'));
      const m3u8Text = await this.twitchService.getM3U8(this.channelName, streamDataAccess);
      this.setStreamAccess(m3u8Text, playerType);
    } catch (e) {
      this.scope.logger(e);
    }
  }

  getStreamByStreamType(accessType: StreamType): Server[] {
    //filter all server by type
    const servers = this.serverList.filter((x) => x.type == accessType);
    if (!servers) return [];

    return servers;
  }
}
