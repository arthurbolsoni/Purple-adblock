import { Stream } from "../stream/stream";
import { streams } from "../stream/type/stream.type";
import { qualityUrl, streamServer } from "../stream/type/streamServer.types";
import { PlayerMessage } from "./message";

export class Player {
    whitelist: string[] = [];
    isProxyAuth: boolean = false;

    streamList: Stream[] = []
    actualChannel: string = "";
    playingAds = false;

    quality: string = "";
    LogPrint = global.LogPrint;

    message = new PlayerMessage();

    constructor() {
        this.message.init();
    }

    endAds = () => this.message.pauseAndPlay();

    isAds = (x: string) => {
        const ads = x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad") || x.toString().includes("twitch-ad-quartile");
        if (this.playingAds != ads) this.endAds();
        this.playingAds = ads;

        return this.playingAds;
    }

    currentStream = (channel: string = this.actualChannel): Stream => {
        return this.streamList.find((x: Stream) => x.channelName === channel)!;
    }

    async onfetch(url: string, response: string) {
        const currentStream: Stream = await this.currentStream();
        currentStream.hls.addPlaylist(response);

        if (!this.isAds(response)) return true;

        this.LogPrint("ads found");

        try {
            const local = await this.fetchm3u8ByStreamType(streams.local.name)
            if (local) currentStream.hls.addPlaylist(local);
            if (local) return true;

            const picture = await this.fetchm3u8ByStreamType(streams.picture.name)
            if (picture) currentStream.hls.addPlaylist(picture);
            if (picture) return true;

            const external = await this.fetchm3u8ByStreamType(streams.external.name)
            if (external) currentStream.hls.addPlaylist(external);
            if (external) return true;

            //if not resolve return the 480p to the user.
            currentStream.hls.addPlaylist(picture);
            return true;

        } catch (e: any) {
            console.log(e.message);
        }
    }


    async fetchm3u8ByStreamType(serverType: string): Promise<string> {
        this.LogPrint("Stream Type: " + serverType);
        //filter all server by type
        const servers: streamServer[] = this.currentStream().serverList.filter((x) => x.type == serverType);
        if (!servers) return "";

        //filter all server url by quality or bestquality
        var qualityUrl = servers.map(x => x.findByQuality(this.message.quality)).filter(x => x !== undefined);
        if (!qualityUrl.length) qualityUrl = servers.map(x => x.bestQuality());

        //by the array order, try get m3u8 content and return if don't have ads.
        for (const url of qualityUrl) {
            const text: string = await (await global.realFetch(url?.url)).text();
            console.log(url?.url);  
            console.log(text);
            if (this.isAds(text)) continue;

            return text;
        }
        return "";
    }
    async onStartChannel(url: string, text: string) {
        const channelName: RegExpExecArray | [] = /hls\/(.*).m3u8/gm.exec(url) || [];
        let stream: Stream;
        let existent = false;

        if (channelName[1]) {
            if (this.whitelist == undefined) {
                this.whitelist = [];
            }

            this.actualChannel = channelName[1];
            this.LogPrint("Channel " + channelName[1]);

            if (this.whitelist.includes(channelName[1])) return;

            if (!this.streamList.find((c: Stream) => c.channelName === channelName[1])) {
                this.streamList.push(new Stream(channelName[1]))
            } else {
                this.LogPrint("Exist: " + channelName[1]);
                existent = true;
            }
        }

        stream = this.currentStream();
        //--------------------------------------------//

        //--------------------------------------------//
        this.LogPrint("Local Server: Loading");
        await stream.addStreamLink(text, "local", false);
        this.LogPrint("Local Server: OK");

        await stream.streamAccess(streams.picture);

        stream.streamAccess(streams.local);

        if (existent) return;

        stream.externalPlayer();

        //--------------------------------------------//
        return;
    }

    inflateFetch() {
        //eslint-disable-next-line no-this-assign
        global.fetch = async function (url, options) {
            if (typeof url === "string") {
                if (url.endsWith("m3u8") && url.includes("ttvnw.net")) {
                    return new Promise(async (resolve, reject) => {
                        try {
                            await global.realFetch(url, options)
                                .then(async (response: Response) => (response.text()))
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
                                resolve(response)
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
                }
            }

            return global.realFetch.apply(this, arguments);
        };
    }
}