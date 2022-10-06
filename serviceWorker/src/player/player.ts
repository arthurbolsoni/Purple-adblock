import { Stream } from "../stream/stream";
import { streams, streamType } from "../stream/type/stream.type";
import { qualityUrl, streamServer } from "../stream/type/streamServer.types";
import { PlayerMessage } from "./message";

export class Player {
  streamList: Stream[] = [];
  actualChannel: string = "";
  playingAds = false;

  quality: string = "";
  LogPrint = global.LogPrint;

  message = new PlayerMessage();

  constructor() {
    this.message.init();
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

  async onfetch(url: string, response: string) {
    const currentStream: Stream = await this.currentStream();
    currentStream.hls.addPlaylist(response);

    if (!this.isAds(response, true)) return true;

    try {
      const local = await this.fetchm3u8ByStreamType(streams.local);
      if (local) currentStream.hls.addPlaylist(local);
      if (!local) currentStream.streamAccess(streams.local);
      if (local) return true;

      const picture = await this.fetchm3u8ByStreamType(streams.picture);
      if (picture) currentStream.hls.addPlaylist(picture);
      if (picture) return true;

      const external = await this.fetchm3u8ByStreamType(streams.external);
      if (external) currentStream.hls.addPlaylist(external);
      if (external) return true;

      console.log("fail");
      //if not resolve return the 480p to the user.
      currentStream.hls.addPlaylist(local, true);
      return true;
    } catch (e: any) {
      console.log(e.message);
    }
  }

  async fetchm3u8ByStreamType(accessType: streamType): Promise<string> {
    this.LogPrint("Stream Type: " + accessType.name);
    //filter all server by type
    const servers = this.currentStream().getStreamServerByStreamType(accessType);
    if (!servers) return "";

    //filter all server url by quality or bestquality
    var streamUrlList = servers.map((x) => x.findByQuality(this.message.quality)).filter((x) => x !== undefined);
    if (!streamUrlList.length) streamUrlList = servers.map((x) => x.bestQuality());

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
    let stream: Stream;
    let existent = false;
    let whitelist: string[] = [];

    if (!channelName[1]) return false;

    this.actualChannel = channelName[1];
    this.LogPrint("Channel " + channelName[1]);

    if (!this.message.setting == undefined) {
      if (!this.message.setting.whitelist == undefined) {
        whitelist = this.message.setting.whitelist;
      }
    }

    if (whitelist.includes(channelName[1])) return false;

    if (!this.streamList.find((c: Stream) => c.channelName === channelName[1])) {
      let proxyUrl = "";
      if (this.message.setting) proxyUrl = this.message.setting.proxyUrl ? this.message.setting.proxyUrl : "";
      this.streamList.push(new Stream(channelName[1], proxyUrl));
    } else {
      this.LogPrint("Exist: " + channelName[1]);
      existent = true;
    }

    stream = this.currentStream();
    //--------------------------------------------//

    //--------------------------------------------//
    this.LogPrint("Local Server: Loading");
    await stream.addStreamLink(text, "local", true);
    this.LogPrint("Local Server: OK");

    stream.streamAccess(streams.local);

    if (existent) return;

    //if the proxy option on popup is disabled, it is never called.
    if (this.message.setting) {
      if (this.message.setting.toggleProxy == false) return;
    }

    stream.tryExternalPlayer();

    return;
  }

  inflateFetch() {
    //eslint-disable-next-line no-this-assign
    global.fetch = async function (url, options) {
      if (typeof url === "string") {
        if (url.endsWith("m3u8") && url.includes("ttvnw.net")) {
          return new Promise(async (resolve, reject) => {
            try {
              await global
                .realFetch(url, options)
                .then(async (response: Response) => response.text())
                .then(async (text: string) => {
                  //send the flow stream to script valitor and classificator
                  await global.player.onfetch(url, text);

                  var playlist = global.player.currentStream().hls.getPlaylist();
                  console.log(playlist);
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
