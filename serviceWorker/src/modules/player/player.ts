import { Stream } from "../stream/stream";
import { streams, streamType } from "../stream/interface/stream.type";
import { qualityUrl } from "../stream/interface/streamServer.types";
import { setting } from "./interface/setting.interface";

export class Player {
  streamList: Stream[] = [];
  actualChannel: string = "";
  playingAds = false;
  settings: setting = { whitelist: [], toggleProxy: true, proxyUrl: "", toggleDNS: false };
  quality: string = "";

  getQuality = () => global.postMessage({ type: "getQuality" });
  getSettings = () => global.postMessage({ type: "getSettings" });
  pause = () => global.postMessage({ type: "pause" });
  play = () => global.postMessage({ type: "play" });
  pauseAndPlay = () => {
    this.pause();
    this.play();
  };
  onStartAds = () => { console.log("ads started"); this.pauseAndPlay(); };
  onEndAds = () => { console.log("ads ended"); this.pauseAndPlay(); };

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
    if (!this.settings.whitelist) return false;
    return this.settings.whitelist.includes(this.actualChannel) && this.currentStream() == undefined ? true : false;
  }

  async onfetch(url: string, response: string): Promise<string> {
    const currentStream: Stream = this.currentStream();
    // currentStream.hls.addPlaylist(response);

    if (this.isWhitelist()) return response;
    if (!this.isAds(response, true)) return response;

    try {
      const local = await this.fetchm3u8ByStreamType(streams.local);
      // if (local) currentStream.hls.addPlaylist(local);
      if (!local) currentStream.streamAccess(streams.local);
      if (local) return local

      const external = await this.fetchm3u8ByStreamType(streams.external);
      // if (external) currentStream.hls.addPlaylist(external);
      if (external) return external;

      console.log("All stream types failed");
    } catch (e: any) {
      console.log(e.message);
    }

    return response;
  }

  async fetchm3u8ByStreamType(accessType: streamType): Promise<string> {
    LogPrint("Stream Type: " + accessType.name);

    const streamUrlList: qualityUrl[] = this.currentStream().getStreamServersByStreamType(accessType, this.quality);

    //by the array order, try get m3u8 content and return if don't have ads.
    for (const streamUrl of streamUrlList) {
      const text: string = await (await global.realFetch(streamUrl?.url)).text();
      if (this.isAds(text)) continue;
      return text;
    }

    return "";
  }
  async onStartChannel(url: string) {
    const channelName: RegExpExecArray | [] = /hls\/(.*).m3u8/gm.exec(url) || [];

    LogPrint("Loading channel", channelName[1]);
    this.actualChannel = channelName[1];

    const currentStream = new Stream(this.actualChannel, this.settings.proxyUrl || "")

    this.streamList.push(currentStream);

    if (this.settings.whitelist) {
      if (this.settings.whitelist.includes(this.actualChannel)) return false;
    }

    this.currentStream().streamAccess(streams.external);

    return true;
  }
}
