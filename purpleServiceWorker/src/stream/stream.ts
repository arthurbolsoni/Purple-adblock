import { HLS } from "../hls/HLS";
import { streamType } from "./type/stream.type";
import { qualityUrl, streamServer } from "./type/streamServer.types";

export class Stream {
    serverList: streamServer[] = [];
    hls: HLS = new HLS();
    channelName: string = "";

    tunnel = ["eu1.jupter.ga"]

    constructor(channelName: string) {
        this.channelName = channelName;
    }

    //add m3u8 links with quality to the list of servers
    async addStreamLink(text: string, type = "local", sig = false) {
        const qualityUrlSplit: qualityUrl[] = [];
        let captureArray: RegExpExecArray | null;

        const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;

        while ((captureArray = REGEX.exec(text)) !== null) {
            qualityUrlSplit.push({ quality: captureArray[1], url: captureArray[2] });
        }
        console.log(qualityUrlSplit);
        const streamList: streamServer = new streamServer({ type: type, urlList: qualityUrlSplit, sig: sig });
        this.serverList.push(streamList);

        if (!sig) {
            await this.signature();
        }
        return true;
    }

    async signature() {
        const REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;

        await new Promise((resolve) =>
            this.serverList
                .filter((x: any) => x.sig == false)
                .forEach(async (x: any) => {
                    const match: RegExpExecArray | null = REGEX.exec(x.urlList[0].url);
                    if (match) {
                        try {
                            await fetch("https://jupter.ga/hls/v2/sig/" + match[2] + "/" + match[1]);
                            x.sig = true;
                            resolve(true);
                        } catch {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                }),
        );
    }

    //add a new player stream external
    async externalPlayer(): Promise<boolean> {
        try {
            global.LogPrint("External Server: Loading");
            const response: Response = await global.realFetch("https://" + this.tunnel[0] + "/channel/" + this.channelName);

            if (!response.ok) {
                throw new Error("server proxy return error or not found");
            }

            const text: string = await response.text();

            global.LogPrint("External Server: OK");

            this.addStreamLink(text);

            return true;
        } catch (e) {
            global.LogPrint(e);
            return false;
        }
    }

    //add a new player stream local
    async streamAccess(stream: streamType): Promise<boolean> {
        try {
            const gql = await global.realFetch("https://gql.twitch.tv/gql", {
                method: "POST",
                headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
                body: `{"operationName":"PlaybackAccessToken","variables":{"isLive":true,"login":"${this.channelName}","isVod":false,"vodID":"","playerType":"${stream.playerType}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
            });

            const status: any = await gql.json();

            const url =
                "https://usher.ttvnw.net/api/channel/hls/" +
                this.channelName +
                ".m3u8?allow_source=true&fast_bread=true&p=" +
                Math.floor(Math.random() * 1e7) +
                "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
                status["data"]["streamPlaybackAccessToken"]["signature"] +
                "&supported_codecs=avc1&token=" +
                status["data"]["streamPlaybackAccessToken"]["value"];

            const text = await (await global.realFetch(url)).text();

            global.LogPrint("Server loaded " + stream.name);

            this.addStreamLink(text, stream.name);

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

}