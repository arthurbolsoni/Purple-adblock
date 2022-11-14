import { Stream } from "../stream/stream";
import { streams, streamType } from "../stream/interface/stream.type";
import { qualityUrl, streamServer } from "../stream/interface/streamServer.types";
import { setting } from "./interface/setting.interface";

export class Player {
  streamList: Stream[] = [];
  actualChannel: string = "";
  playingAds = false;
  settings: setting = { whitelist: [], toggleProxy: false, proxyUrl: "", toggleDNS: false };
  quality: string = "";

  onStartAds = () => { };
  onEndAds = () => { };

  isAds = (x: string, allowChange: boolean = false) => {
    // const ads = x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad") || x.toString().includes("twitch-ad-quartile");
    const ads = x.toString().includes("stitched");
    if (!allowChange) return ads;
    if (this.playingAds != ads && ads) this.onStartAds();
    if (this.playingAds != ads && !ads) this.onEndAds();
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

  async onfetch(url: string, response: string) {
    const currentStream: Stream = await this.currentStream();
    currentStream.hls.addPlaylist(response);

    if (this.isWhitelist()) return true;
    if (!this.isAds(response, true)) return true;

    try {
      const local = await this.fetchm3u8ByStreamType(streams.local);
      if (local) currentStream.hls.addPlaylist(local);
      if (!local) currentStream.streamAccess(streams.local);
      if (local) return true;

      const external = await this.fetchm3u8ByStreamType(streams.external);
      if (external) currentStream.hls.addPlaylist(external);
      if (external) return true;

      console.log("fail");
      return false;
    } catch (e: any) {
      console.log(e.message);
    }
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
  async onStartChannel(url: string, text: string) {
    const channelName: RegExpExecArray | [] = /hls\/(.*).m3u8/gm.exec(url) || [];

    LogPrint("Channel " + channelName[1]);
    this.actualChannel = channelName[1];

    this.streamList = [];
    this.streamList.push(new Stream(this.actualChannel, this.settings.proxyUrl || ""));

    const stream = this.currentStream();

    // await stream.addStreamLink(text, streams.local.name);

    if (this.settings.whitelist) {
      if (this.settings.whitelist.includes(this.actualChannel)) return false;
    }
    stream.streamAccess(streams.local);

    if (this.settings.toggleProxy) stream.streamAccess(streams.external);

    return true;
  }
}
