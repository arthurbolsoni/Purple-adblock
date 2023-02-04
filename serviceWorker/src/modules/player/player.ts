import { Stream } from "../stream/stream";
import { Setting } from "./interface/setting.interface";
import { StreamType } from "../stream/interface/stream.enum";
import { StreamUrl } from "../stream/interface/stream.types";

export class Player {
  streamList: Stream[] = [];
  actualChannel: string = "";
  playingAds = false;
  setting: Setting | undefined;
  quality: string = "";

  setSettings = (setting: Setting) => {
    this.setting = setting;
    if (this.setting?.toggleProxy && this.setting?.proxyUrl) this.currentStream().currentTunnel = this.setting?.proxyUrl;
    logPrint("Settings set");
  };
  getQuality = () => global.postMessage({ type: "getQuality" });
  getSettings = () => global.postMessage({ type: "getSettings" });
  pause = () => global.postMessage({ type: "pause" });
  play = () => global.postMessage({ type: "play" });
  pauseAndPlay = () => {
    this.pause();
    this.play();
  };
  onStartAds = () => {
    console.log("ads started");
    this.pauseAndPlay();
  };
  onEndAds = () => {
    console.log("ads ended");
    this.pauseAndPlay();
    this.pauseAndPlay();
  };

  isAds = (x: string, allowChange: boolean = false) => {
    // const ads = x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad") || x.toString().includes("twitch-ad-quartile");
    const ads = x.toString().includes("stitched");
    if (!allowChange) return ads;
    if (this.playingAds == false && this.playingAds != ads) this.onStartAds();
    if (this.playingAds == true && this.playingAds != ads) this.onEndAds();
    this.playingAds = ads;

    return this.playingAds;
  };

  currentStream = (channel: string = this.actualChannel): Stream => {
    return this.streamList.find((x: Stream) => x.channelName === channel)!;
  };

  isWhitelist(): boolean {
    if (!this.setting?.whitelist) return false;
    return this.setting?.whitelist?.includes(this.actualChannel);
  }

  async onFetch(text: string): Promise<string> {
    if (this.isWhitelist()) return text;
    if (!this.isAds(text, true)) return text;

    const local = await this.fetchm3u8ByStreamType(StreamType.EMBED);
    if (!local) this.currentStream().CreateStreamAccess(StreamType.EMBED);
    if (local) return local;

    const external = await this.fetchm3u8ByStreamType(StreamType.EXTERNAL);
    if (external) return external;

    console.log("All stream types failed");

    return text;
  }

  async fetchm3u8ByStreamType(accessType: StreamType): Promise<string | null> {
    logPrint("Stream Type: " + accessType);

    const streamUrlList: StreamUrl[] = this.currentStream().getStreamServersByStreamType(accessType, this.quality);

    //by the array order, try get m3u8 content and return if don't have ads.
    for (const streamUrl of streamUrlList) {
      const text: string = await (await global.request(streamUrl?.url)).text();
      if (this.isAds(text)) continue;
      return text;
    }
    return null;
  }
  async onStartChannel(url: string): Promise<void> {
    const channelName: RegExpExecArray | [] = /hls\/(.*).m3u8/gm.exec(url) || [];

    logPrint("Loading channel", channelName[1]);
    this.actualChannel = channelName[1];

    const currentStream = new Stream(this.actualChannel);
    currentStream.CreateStreamAccess(StreamType.EXTERNAL);
    this.streamList.push(currentStream);
    return;
  }
}
