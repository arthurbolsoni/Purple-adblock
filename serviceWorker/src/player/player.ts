import { Stream } from "../stream/stream";
import { streams, streamType } from "../stream/type/stream.type";
import { qualityUrl, streamServer } from "../stream/type/streamServer.types";
import { PlayerMessage } from "./message";

export class Player {
  streamList: Stream[] = [];
  actualChannel: string = "";
  playingAds = false;

  message = new PlayerMessage();
  LogPrint = global.LogPrint;

  constructor() {
    this.message.getSetting();
  }

  onStartAds = () => {};
  onEndAds = () => {};

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
    return this.message.setting.whitelist.includes(this.actualChannel) && this.currentStream() == undefined ? true : false;
  }

  async onfetch(url: string, response: string) {
    const currentStream: Stream = await this.currentStream();
    currentStream.hls.addPlaylist(response);

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

      // currentStream.hls.addPlaylist(response, true);
      return false;
    } catch (e: any) {
      console.log(e.message);
    }
  }

  async fetchm3u8ByStreamType(accessType: streamType): Promise<string> {
    this.LogPrint("Stream Type: " + accessType.name);

    const streamUrlList: qualityUrl[] = this.currentStream().getStreamServersByStreamType(accessType, this.message.quality);

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
    let existent = false;

    this.LogPrint("Channel " + channelName[1]);
    this.actualChannel = channelName[1];

    if (this.isWhitelist()) return false;

    if (!this.streamList.find((c: Stream) => c.channelName === this.actualChannel)) {
      let proxyUrl = "";
      if (this.message.setting) proxyUrl = this.message.setting.proxyUrl ? this.message.setting.proxyUrl : "";
      this.streamList.push(new Stream(this.actualChannel, proxyUrl));
    } else {
      this.LogPrint("Exist: " + this.actualChannel);
      this.currentStream().serverList = [];
      existent = true;
    }

    const stream = this.currentStream();
    //--------------------------------------------//

    //--------------------------------------------//
    this.LogPrint("Local Server: Loading");
    await stream.addStreamLink(text, "local");
    this.LogPrint("Local Server: OK");

    stream.streamAccess(streams.local);

    if (existent) return;

    //if the proxy option on popup is disabled, it is never called.
    if (this.message.setting) {
      if (this.message.setting.toggleProxy) stream.tryExternalPlayer();
    }

    return;
  }

  inflateFetch() {
    //eslint-disable-next-line no-this-assign
    global.fetch = async function (url, options) {
      if (typeof url === "string") {
        if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !global.player.isWhitelist()) {
          return new Promise(async (resolve, reject) => {
            try {
              await global
                .realFetch(url, options)
                .then(async (response: Response) => response.text())
                .then(async (text: string) => {
                  //send the flow stream to script valitor and classificator
                  await global.player.onfetch(url, text);

                  var playlist = global.player.currentStream().hls.getPlaylist();
                  resolve(new Response(playlist as any));
                });
            } catch {
              resolve(new Response());
            }
          });
        }

        if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
          return new Promise(async (resolve, reject) => {
            try {
              const response = await global.realFetch(url, options);
              if (!response.ok) {
                resolve(response);
                //this.LogPrint("channel offline");
              }

              response.text().then(async (text: string) => {
                await global.player.onStartChannel(url, text);
                resolve(new Response(text));
              });
            } catch {
              resolve(new Response());
            }
          });
        }

        if (url.includes("picture-by-picture")) {
          this.LogPrint("picture-by-picture");
          return new Response();
        }
      }

      return global.realFetch.apply(this, arguments);
    };
  }
}
