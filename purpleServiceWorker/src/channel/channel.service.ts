import { HLS } from "../HLS";

export class ChannelService {
  constructor(private channelName: string, private realFetch = fetch) {
    console.log(channel);
  }

  // TODO: implement isOffline
  async onStart(url, text /* isOffline = false */) {
    const regex = /hls\/(.*).m3u8/gm;
    const match: RegExpExecArray | [] = regex.exec(url) || [];
    let existent = false;

    if (match[1]) {
      actualChannel = match[1];
      if (whitelist.includes(match[1])) {
        return;
      }

      if (!channel.find((c) => c.name === match[1])) {
        LogPrint("new channel 2: " + match[1]);
        channel.push({ name: match[1], flowSig: [], hls: new HLS() });
      } else {
        existent = true;
      }
    }
    //--------------------------------------------//

    LogPrint("Local Server: Loading");
    await channel.find((x) => x.name === actualChannel).hls.addStreamLink(text);

    LogPrint("Local Server: OK");

    if (existent) {
      return;
    }
    //--------------------------------------------//

    //--------------------------------------------//
    this.newHLS480p();
    //--------------------------------------------//

    //--------------------------------------------//

    try {
      LogPrint("External Server: Loading");
      const a = await realFetch("https://jupter.ga/hls/v2/channel/" + actualChannel, { method: "GET" });

      const text = await a.text();

      if (!a.ok) {
        throw new Error("server proxy return error or not found");
      }

      const qualityUrlSplit = text.split(".");
      const server = qualityUrlSplit.shift();

      const streamList: streamList = { server: "proxy", urlList: [] };
      qualityUrlSplit.forEach((element, index, array) => {
        if (!(index % 2)) {
          streamList.urlList.push({
            quality: streamList.urlList.some((x) => x.quality == element) ? element + "p30" : element,
            url: "https://video-weaver." + server + ".hls.ttvnw.net/v1/playlist/" + array[index + 1] + ".m3u8",
          });
        }
      });

      channel.find((x) => x.name === actualChannel).hls.StreamServerListSet(streamList);
      console.log(channel.find((x) => x.name === actualChannel).hls.StreamServerList);

      //channel.find(x => x.name === actualChannel).hls.addStreamLink(text);
      LogPrint("External Server: OK");
      LogPrint("External Server: OK");
    } catch (e) {
      LogPrint(e);
    }
  }

  async newHLS480p() {
    try {
      const gql = await realFetch("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
        body: `{"operationName":"PlaybackAccessToken","letiables":{"isLive":true,"login":"${this.channelName}","isVod":false,"vodID":"","playerType":"thunderdome"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
      });
      const status: string = await gql.json();
      const url =
        "https://usher.ttvnw.net/api/channel/hls/" +
        this.channelName +
        ".m3u8?allow_source=true&fast_bread=true&p=" +
        Math.floor(Math.random() * 1e7) +
        "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
        status["data"]["streamPlaybackAccessToken"]["signature"] +
        "&supported_codecs=avc1&token=" +
        status["data"]["streamPlaybackAccessToken"]["value"];

      const r = await realFetch(url, { method: "GET" });
      const text = await r.text();

      channel.find((x) => x.name === actualChannel).hls.addStreamLink(text, "picture", true);
      LogPrint("Local Server 480p: OK");
    } catch (e) {
      console.log(e);
    }
  }
  
  async newHLSExternal() {
    try {
      const gql = await realFetch("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
        body: `{"operationName":"PlaybackAccessToken","letiables":{"isLive":true,"login":"${this.channelName}","isVod":false,"vodID":"","playerType":"thunderdome"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
      });
      const status: string = await gql.json();
      const url =
        "https://usher.ttvnw.net/api/channel/hls/" +
        this.channelName +
        ".m3u8?allow_source=true&fast_bread=true&p=" +
        Math.floor(Math.random() * 1e7) +
        "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
        status["data"]["streamPlaybackAccessToken"]["signature"] +
        "&supported_codecs=avc1&token=" +
        status["data"]["streamPlaybackAccessToken"]["value"];

      const r = await realFetch(url, { method: "GET" });
      const text = await r.text();

      channel.find((x) => x.name === actualChannel).hls.addStreamLink(text, "picture", true);
      LogPrint("Local Server 480p: OK");
    } catch (e) {
      console.log(e);
    }
  }
  
  async newHLSLocal() {
    try {
      const gql = await realFetch("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
        body: `{"operationName":"PlaybackAccessToken","letiables":{"isLive":true,"login":"${this.channelName}","isVod":false,"vodID":"","playerType":"thunderdome"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
      });
      const status: string = await gql.json();
      const url =
        "https://usher.ttvnw.net/api/channel/hls/" +
        this.channelName +
        ".m3u8?allow_source=true&fast_bread=true&p=" +
        Math.floor(Math.random() * 1e7) +
        "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
        status["data"]["streamPlaybackAccessToken"]["signature"] +
        "&supported_codecs=avc1&token=" +
        status["data"]["streamPlaybackAccessToken"]["value"];

      const r = await realFetch(url, { method: "GET" });
      const text = await r.text();

      channel.find((x) => x.name === actualChannel).hls.addStreamLink(text, "picture", true);
      LogPrint("Local Server 480p: OK");
    } catch (e) {
      console.log(e);
    }
  }
}