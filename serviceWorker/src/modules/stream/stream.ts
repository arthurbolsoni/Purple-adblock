import { TwitchService } from "../twitch/twitch.service";
import { StreamType } from "./interface/stream.enum";
import { Server } from "./interface/stream.types";
import { parseVariants } from "./master";
import type { WorkerContext } from "../../scope";

export class Stream {
  serverList: Server[] = []; //the list of servers links m3u8
  channelName: string; //the channel name
  usherUrl?: string; // F-08: the page's usher request for the channel; backups reuse its path and parameters
  twitchService: TwitchService;
  private pendingAccess = new Map<string, Promise<void>>(); //token requests in flight, by playerType

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

  //create a new stream access; a call while one is in flight for the same playerType waits for it (T-105)
  createStreamAccess(playerType: StreamType | string, integrityToken: string, platform = "web"): Promise<void> {
    const inFlight = this.pendingAccess.get(playerType);
    if (inFlight) return inFlight;

    const request = this.requestStreamAccess(playerType, integrityToken, platform).finally(() => this.pendingAccess.delete(playerType));
    this.pendingAccess.set(playerType, request);
    return request;
  }

  // F-31: a type whose token request gives no token is "noToken", one whose usher request gives no master "noMaster"
  private async requestStreamAccess(playerType: StreamType | string, integrityToken: string, platform: string): Promise<void> {
    let streamDataAccess: { token: string; signature: string };
    try {
      streamDataAccess = await this.twitchService.playbackAccessToken(this.channelName, playerType, integrityToken, platform);
    } catch (e) {
      this.scope.logger(e);
      this.tried(playerType, "noToken");
      return;
    }
    try {
      this.scope.logger("New Connection: ", playerType, streamDataAccess.token.includes('"hide_ads":true'));
      const m3u8Text = await this.twitchService.getM3U8(this.channelName, streamDataAccess, this.usherUrl, playerType);
      // the new master replaces the playerType's previous server
      const previous = this.getStreamByStreamType(playerType);
      const before = this.serverList.length;
      this.setStreamAccess(m3u8Text, playerType);
      if (this.serverList.length > before) previous.forEach((server) => this.removeServer(server));
      else this.tried(playerType, "noMaster");
    } catch (e) {
      this.scope.logger(e);
      this.tried(playerType, "noMaster");
    }
  }

  private tried(playerType: string, outcome: "noToken" | "noMaster") {
    this.scope.emit?.({ type: "backupTried", channel: this.channelName, playerType, outcome });
  }

  getStreamByStreamType(accessType: StreamType | string): Server[] {
    //filter all server by type
    const servers = this.serverList.filter((x) => x.type == accessType);
    if (!servers) return [];

    return servers;
  }
}
