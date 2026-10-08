import { Stream } from "../stream/stream";
import { Setting } from "./setting.interface";
import { StreamType } from "../stream/interface/stream.enum";
import { Server } from "../stream/interface/stream.types";
import { mergeWithBackups } from "./m3u8";
import { AdClass, detectAds } from "./ad-detector";
import { parseVariants } from "../stream/master";
import type { PurpleEvent, WorkerContext } from "../../scope";

export class Player {
  integrityToken = ""; //the integrity token

  streamList: Stream[] = []; //the list of streams that are currently being played
  actualChannel: string = ""; //the channel
  playingAds = false; //if the stream is playing ads
  setting: Setting | undefined; //the settings
  quality: string = ""; //the quality of the stream
  freeStream: boolean = false; //if the stream is free
  private playerVariants = new Map<string, Stream>(); //variant URL (without query) of the player's masters -> stream

  constructor(private readonly scope: WorkerContext) {}

  getQuality = () => this.scope.postMessage({ type: "getQuality" });
  getSettings = () => this.scope.postMessage({ type: "getSettings" });
  pause = () => this.scope.postMessage({ type: "pause" });
  play = () => this.scope.postMessage({ type: "play" });

  setSettings = (setting: Setting) => {
    this.setting = setting;
    this.scope.logger("Settings loaded");
  };

  setIntegrityToken = (integrityToken: string) => this.integrityToken = integrityToken;

  pauseAndPlay = async () => {
    this.pause();
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.play();
    this.play();
  };

  onStartAds = () => {
    this.scope.logger("ads started");
    this.pauseAndPlay();
  };
  onEndAds = () => {
    this.scope.logger("ads ended");
    this.pauseAndPlay();
  };

  isAds = (x: string, allowChange: boolean = false) => {
    const ads = this.hasAds(x);
    // const ads: boolean = Math.random() < 0;
    if (!allowChange) return ads;
    if (this.playingAds != ads) this.pauseAndPlay();
    this.playingAds = ads;

    return this.playingAds;
  }

  // some ads are not in the principal stream
  freeStreamChanged(x: boolean) {
    this.scope.logger("freeStreamChanged:", x);
    // call pause and play when changed
    if (this.freeStream != x) this.pauseAndPlay();
    this.freeStream = x;
  }

  // ad segments in the playlist (F-02, F-03); markers over live segments alone (MARKED_LIVE) are not ads here
  hasAds = (x: string) => detectAds(x ?? "").class === AdClass.SSAI;

  currentStream = (channel: string = this.actualChannel): Stream => {
    return this.streamList?.find((x: Stream) => x.channelName === channel)!;
  };

  isWhitelist(): boolean {
    return this.setting?.whitelist?.includes(this.actualChannel) || false;
  }

  async onFetch(text: string): Promise<string> {
    // no stream stored for the channel yet (media playlist before the usher)
    if (!this.currentStream()) return text;
    if (this.isWhitelist()) {
      this.emit({ type: "whitelisted" });
      return text;
    }
    // T-202: markers over live segments: the ad comes client-side (F-04); no backup, no pause/play
    if (detectAds(text).class === AdClass.MARKED_LIVE) return text;
    // is ads and is the principal stream
    if (!this.isAds(text, true)) {
      this.scope.logger("Stream is free");
      this.freeStream = false;
      return text;
    }
    this.emit({ type: "adDetected" });

    const dump: string[] = [];

    const frontpage = await this.fetchm3u8ByStreamType(StreamType.FRONTPAGE);
    if (!frontpage.data) this.currentStream().createStreamAccess(StreamType.FRONTPAGE, this.integrityToken);
    if (frontpage.dump) dump.push(...frontpage.dump);
    if (frontpage.data) {
      this.emit({ type: "backupUsed", playerType: StreamType.FRONTPAGE });
      return frontpage.data;
    }

    const picture = await this.fetchm3u8ByStreamType(StreamType.PICTURE);
    if (!picture.data) this.currentStream().createStreamAccess(StreamType.PICTURE, this.integrityToken);
    if (picture.dump) dump.push(...picture.dump);
    if (picture.data) {
      this.emit({ type: "backupUsed", playerType: StreamType.PICTURE });
      return picture.data;
    }

    if (dump?.length) {
      this.freeStreamChanged(true);
    } else {
      this.freeStreamChanged(false);
    }
    
    const merged = mergeWithBackups([text, ...dump]);
    if (merged.replaced) this.emit({ type: "segmentsReplaced", count: merged.replaced });
    return merged.text;
  }


  async fetchm3u8ByStreamType(accessType: StreamType): Promise<{ data: string | null; dump: string[] }> {
    let dump: string[] = [];
    let data: string = "";

    let servers: Server[] = this.currentStream().getStreamByStreamType(accessType);

    // do the all request in same time
    for (const server of servers) {
      //filter server url by quality or bestquality
      const streamUrl = server.findByQuality(this.quality) || server.bestQuality();

      //try get m3u8 content and return if don't have ads.
      // a backup without a URL or that fails to load is dropped; the next one is tried
      let text: string;
      try {
        if (!streamUrl) throw new Error("Stream Type: " + accessType + " - no variant");
        const response: Response = await this.scope.request(streamUrl.url);
        if (!response.ok) throw new Error("Stream Type: " + accessType + " - status " + response.status);
        text = await response.text();
      } catch (e) {
        this.scope.logger(e);
        this.currentStream().removeServer(server);
        continue;
      }
      dump.push(text);
      if (this.isAds(text)) {
        this.scope.logger("Stream Type: " + accessType + " - Ads found");
        this.currentStream().removeServer(server);
        continue;
      } else {
        data = text;
        this.scope.logger("Stream Type: " + accessType + " - Free Stream");
        break;
      }

    }

    return { data: data, dump: dump };
  }

  // Variants of a master the player requested: their media playlists are recognized by URL, whatever their path.
  setPlayerMaster(text: string) {
    for (const variant of parseVariants(text)) this.playerVariants.set(withoutQuery(variant.url), this.currentStream());
  }

  isPlayerPlaylist = (url: string) => this.playerVariants.has(withoutQuery(url));

  // debug event (F-17) for the current channel
  private emit(event: Omit<PurpleEvent, "channel">) {
    this.scope.emit?.({ ...event, channel: this.actualChannel });
  }

  setChannel(channelName: string) {
    this.scope.logger(`Loading channel ${channelName}`);
    this.actualChannel = channelName;

    let currentStream = this.streamList.find((stream) => stream.channelName === channelName);
    if (!currentStream) {
      currentStream = new Stream(channelName, this.scope);
      this.streamList.push(currentStream);
    }
  }
}

const withoutQuery = (url: string) => url.split(/[?#]/)[0];
