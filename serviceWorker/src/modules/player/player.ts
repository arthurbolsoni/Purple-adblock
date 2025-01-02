import { Stream } from "../stream/stream";
import { Setting } from "./setting.interface";
import { StreamType } from "../stream/interface/stream.enum";
import { Server } from "../stream/interface/stream.types";
import { Parser } from "m3u8-parser";
import { mergeM3u8Contents } from "./m3u8";

export class Player {
  integrityToken = ""; //the integrity token

  streamList: Stream[] = []; //the list of streams that are currently being played
  actualChannel: string = ""; //the channel
  playingAds = false; //if the stream is playing ads
  setting: Setting | undefined; //the settings
  quality: string = ""; //the quality of the stream
  freeStream: boolean = false; //if the stream is free

  getQuality = () => global.postMessage({ type: "getQuality" });
  getSettings = () => global.postMessage({ type: "getSettings" });
  pause = () => global.postMessage({ type: "pause" });
  play = () => global.postMessage({ type: "play" });

  setSettings = (setting: Setting) => {
    this.setting = setting;
    logger("Settings loaded");
  };

  setIntegrityToken = (integrityToken: string) => this.integrityToken = integrityToken;

  pauseAndPlay = async () => {
    this.pause();
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.play();
    this.play();
  };

  onStartAds = () => {
    console.log("ads started");
    this.pauseAndPlay();
  };
  onEndAds = () => {
    console.log("ads ended");
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
    console.log("freeStreamChanged:", x);
    // call pause and play when changed
    if (this.freeStream != x) this.pauseAndPlay();
    this.freeStream = x;
  }

  hasAds = (x: string) => x?.toString().includes("stitched") || x?.toString().includes("Amazon") || x?.toString().includes("DCM,");

  currentStream = (channel: string = this.actualChannel): Stream => {
    return this.streamList?.find((x: Stream) => x.channelName === channel)!;
  };

  isWhitelist(): boolean {
    return this.setting?.whitelist?.includes(this.actualChannel) || false;
  }

  async onFetch(text: string): Promise<string> {
    if (this.isWhitelist()) return text;
    // is ads and is the principal stream
    if (!this.isAds(text, true)) {
      console.log("Stream is free");
      this.freeStream = false;
      return mergeM3u8Contents([text]);
    }

    const dump: string[] = [];

    const frontpage = await this.fetchm3u8ByStreamType(StreamType.FRONTPAGE);
    if (!frontpage.data) this.currentStream().createStreamAccess(StreamType.FRONTPAGE, this.integrityToken);
    if (frontpage.dump) dump.push(...frontpage.dump);
    if (frontpage.data) return frontpage.data;

    const picture = await this.fetchm3u8ByStreamType(StreamType.PICTURE);
    if (!picture.data) this.currentStream().createStreamAccess(StreamType.PICTURE, this.integrityToken);
    if (picture.dump) dump.push(...picture.dump);
    if (picture.data) return picture.data;

    if (dump?.length) {
      this.freeStreamChanged(true);
    } else {
      this.freeStreamChanged(false);
    }
    
    return mergeM3u8Contents([text, ...dump]);
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
      const text: string = await (await global.request(streamUrl?.url)).text();
      dump.push(text);
      if (this.isAds(text)) {
        logger("Stream Type: " + accessType + " - Ads found");
        this.currentStream().removeServer(server);
        continue;
      } else {
        data = text;
        logger("Stream Type: " + accessType + " - Free Stream");
        break;
      }

    }

    return { data: data, dump: dump };
  }

  setChannel(channelName: string) {
    logger(`Loading channel ${channelName}`);
    this.actualChannel = channelName;

    let currentStream = this.streamList.find((stream) => stream.channelName === channelName);
    if (!currentStream) {
      currentStream = new Stream(channelName);
      this.streamList.push(currentStream);
    }
  }
}