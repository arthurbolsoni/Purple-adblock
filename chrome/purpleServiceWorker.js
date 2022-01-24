"use strict";
// Contributors Note: my eyes and brain hurt from trying to understand this code - Flleeppyy
(function () {
  function declare(scope, whitelist) {
    scope.LogPrint = (x) => {
      console.log("[Purple]: ", x);
    };
    scope.realFetch = fetch;
    scope.quality = "";
    scope.addEventListener("message", function (e) {
      switch (e.data.funcName) {
        case "setQuality": {
          scope.quality = e.data.args[0].name;
          break;
        }
        default: {
          break;
        }
      }
    });
    scope.channel = [];
    scope.actualChannel = "";
    scope.whitelist = whitelist;
  }
  class HLS {
    constructor() {
      this._header = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", "#EXT-X-MEDIA-SEQUENCE:6"];
      this._playlist = [];
      this._sequence = 0;
      this._streamServerList = [];
    }
    async addStreamLink(text, type = "local", sig = false) {
      const qualityUrlSplit = [];
      let captureArray;
      const REGEX = /RESOLUTION=(\S+),C(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/gs;
      while ((captureArray = REGEX.exec(text)) != null) {
        qualityUrlSplit.push({
          quality: qualityUrlSplit.some((x) => x.quality == captureArray?.[1]) ? captureArray[1] + "p30" : captureArray[1],
          url: captureArray[2],
        });
      }
      const streamList = { server: type, urlList: qualityUrlSplit, sig: sig };
      this._streamServerList.push(streamList);
      if (!sig) {
        await this.signature();
      }
      return true;
    }
    async signature() {
      const REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;
      await new Promise((resolve) =>
        this._streamServerList
          .filter((x) => x.sig == false)
          .forEach(async (x) => {
            const match = REGEX.exec(x.urlList[0].url);
            try {
              const a = await fetch(`https://jupter.ga/hls/v2/sig/${match?.[2]}/${match?.[1]}`, {
                method: "GET",
              });
              LogPrint("Server signature: " + a.ok);
              x.sig = true;
              resolve(true);
            } catch {
              resolve(false);
            }
          }),
      );
    }
    get StreamServerList() {
      return this._streamServerList;
    }
    StreamServerListSet(value) {
      this._streamServerList.push(value);
    }
    addPlaylist(playlist) {
      if (playlist === null) {
        return false;
      }
      let changed = false;
      const lines = playlist.toString().split(/[\r\n]/);
      this._header[4] = lines[4];
      this._header[5] = lines[5];
      for (const i in lines) {
        if (lines[i].includes("#EXT-X-PROGRAM-DATE-TIME:")) {
          const sequenceTimestamp = Math.floor(new Date(lines[i].slice(lines[i].length - 24, lines[i].length)).getTime() / 1000);
          const r = this._playlist.filter((x) => {
            return x.timestamp >= sequenceTimestamp;
          });
          //LogPrint(Math.floor(date.getTime() / 1000));
          //LogPrint(r);
          if (!r.length) {
            this._sequence = this._sequence + 1;
            this._playlist.push({
              time: lines[parseInt(i)],
              timestamp: sequenceTimestamp,
              info: lines[parseInt(i) + 1],
              url: lines[parseInt(i) + 2],
            });
            //LogPrint("new seek add");
            changed = true;
          }
        }
        while (this._playlist.length > 15) {
          this._playlist.shift();
        }
      }
      return changed;
    }
    getAllPlaylist() {
      return (
        this._header[0] +
        "\n" +
        this._header[1] +
        "\n" +
        this._header[2] +
        "\n" +
        this._header[3] +
        this._sequence +
        "\n" +
        this._header[4] +
        "\n" +
        this._header[5] +
        "\n" +
        this._playlist.map((x) => {
          return x.time + "\n" + x.info + "\n" + x.url + "\n";
        })
      );
    }
  }
  let twitchMainWorker;
  window.Worker = class WorkerInjector extends Worker {
    constructor(twitchBlobUrl) {
      if (twitchMainWorker) {
        super(twitchBlobUrl);
      }
      const newBlobStr = `
                ${onAfterFetch.toString()};
                ${onStartChannel.toString()};
                ${inflateFetch.toString()};
                ${newCallHLS480p.toString()};
                ${declare.toString()};
                ${HLS.toString()}
                declare(self, "${whitelist}");
                inflateFetch();
                importScripts('${twitchBlobUrl}');
                `;
      super(URL.createObjectURL(new Blob([newBlobStr])));
      twitchMainWorker = this;
      //this.addEventListener('message', function (e) {console.log(e.data)});
    }
  };
  async function onAfterFetch(response, url) {
    //   if (Math.random() < 0.5 ){
    //       response += "twitch-client-ad";
    //   }
    const quality = channel
      .find((x) => x.name === actualChannel)
      .hls.StreamServerList.map((x) => x.urlList.find((a) => a.url == url))
      .find((x) => x != undefined).quality;
    //if ads find on main link called from twitch api player
    if (response.toString().includes("stitched-ad") || response.toString().includes("twitch-client-ad")) {
      LogPrint("ads found");
      const StreamServerList = channel.find((x) => x.name === actualChannel).hls.StreamServerList;
      console.log(StreamServerList);
      try {
        //try all hls sigs that have on StreamServerList from HLS
        if (StreamServerList.length > 0) {
          const a = await realFetch(StreamServerList.find((x) => x.server == "proxy").urlList.find((a) => a.quality == quality).url, {
            method: "GET",
          });
          const returno = await a.text();
          if (returno.toString().includes("stitched-ad") || returno.toString().includes("twitch-client-ad")) {
            LogPrint("ads on proxy");
          }
          return channel.find((x) => x.name === actualChannel).hls.addPlaylist(returno, true);
          //gera erro se nao tiver link
        }
        throw new Error("No m3u8 valid url found on StreamServerList");
      } catch (e) {
        //if nothing resolve, return 480p flow
        //LogPrint(StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality) && x.server == "local").map(x => x.urlList.find(x => x.quality.includes('480')))[0]);
        const a = await realFetch(
          StreamServerList.filter((x) => x.urlList.find((a) => a.url != url && a.quality == quality) && x.server == "picture").map((x) =>
            x.urlList.find((x) => x.quality.includes("480")),
          )[0].url,
          { method: "GET" },
        );
        const returno = await a.text();
        LogPrint("480P");
        LogPrint(e);
        channel.find((x) => x.name === actualChannel).hls.addPlaylist(returno);
        return true;
      }
    } else {
      channel.find((x) => x.name === actualChannel).hls.addPlaylist(response);
      //LogPrint(quality);
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url)));
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url && a.quality == quality)));
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality)));
      //LogPrint("ok")
      return true;
    }
  }
  async function newCallHLS480p(channelName) {
    try {
      const gql = await realFetch("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
        body: `{"operationName":"PlaybackAccessToken","letiables":{"isLive":true,"login":"${channelName}","isVod":false,"vodID":"","playerType":"thunderdome"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
      });
      const status = await gql.json();
      const url =
        "https://usher.ttvnw.net/api/channel/hls/" +
        channelName +
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
  // TODO: implement isOffline
  async function onStartChannel(url, text /* isOffline = false */) {
    const regex = /hls\/(.*).m3u8/gm;
    const match = regex.exec(url) || [];
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
    newCallHLS480p(actualChannel);
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
      const streamList = { server: "proxy", urlList: [] };
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
  const inflateFetch = () => {
    // @ts-expect-error
    // eslint-disable-next-line no-global-assign
    fetch = async (url, options) => {
      if (typeof url === "string") {
        if (url.endsWith(".ts")) {
          //let p = channel.find(x => x.name === actualChannel).hls.getPlaylistByUrl(url);
          //let pp = channel.find(x => x.name === actualChannel).hls.getAllPlaylist();
          //LogPrint("ts timestamp: " + p[0].timestamp);
        }
        if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !whitelist.includes(actualChannel)) {
          return new Promise(function (resolve, reject) {
            const processFetch = async function (url) {
              // await onBeforeFetch(url);
              await realFetch(url, options).then(function (response) {
                response.text().then(function (text) {
                  onAfterFetch(text, url).then(function (r) {
                    const p = channel.find((x) => x.name === actualChannel).hls.getAllPlaylist();
                    resolve(new Response(p));
                  });
                });
              });
            };
            processFetch(url);
          });
        }
        if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
          return new Promise(function (resolve, reject) {
            const processFetch = async function (url) {
              await realFetch(url, options).then(function (response) {
                if (response.ok) {
                  response.text().then(async function (text) {
                    await onStartChannel(url, text);
                    resolve(new Response(text));
                  });
                } else {
                  resolve(response);
                  LogPrint("channel offline");
                }
              });
            };
            processFetch(url);
          });
        }
        if (url.includes("picture-by-picture")) {
          // TODO
        }
      }
      // @ts-expect-error
      return realFetch.apply(this, arguments);
    };
  };
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVycGxlU2VydmljZVdvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wdXJwbGVTZXJ2aWNlV29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw0RkFBNEY7QUFrQjVGLENBQUM7SUFDQyxTQUFTLE9BQU8sQ0FBQyxLQUFVLEVBQUUsU0FBZ0I7UUFDM0MsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFO1lBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQztRQUNGLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ25CLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1lBQzNDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZCLEtBQUssWUFBWSxDQUFDLENBQUM7b0JBQ2pCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNwQyxNQUFNO2lCQUNQO2dCQUNELE9BQU8sQ0FBQyxDQUFDO29CQUNQLE1BQU07aUJBQ1A7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsS0FBSyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDekIsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDOUIsQ0FBQztJQUVELE1BQU0sR0FBRztRQUFUO1lBQ1UsWUFBTyxHQUFrQixDQUFDLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSx5QkFBeUIsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQy9HLGNBQVMsR0FBbUIsRUFBRSxDQUFDO1lBQy9CLGNBQVMs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
