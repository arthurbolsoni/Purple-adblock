// Contributors Note: my eyes and brain hurt from trying to understand this code - Flleeppyy
// :)

declare let LogPrint: (x: any) => void;

// declare let fetch: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

declare let realFetch: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

declare let quality: string;

declare let abc: null;

declare let channel: any;

declare let actualChannel: string;

declare let whitelist: string[];

(function () {
  function declare(scope: any, whitelist: any[]) {
    scope.LogPrint = (x: any) => {
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

  //class where the app format all pieces of the "hls" stream to a object.
  //merge local hls with external hls
  class HLS {
    private _header: Array<string> = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", "#EXT-X-MEDIA-SEQUENCE:6"];
    private _playlist: playlistItem[] = [];
    private _sequence = 0;
    private _streamServerList: streamServer[] = [];

    async addStreamLink(text: string, type = "local", sig = false) {
      const qualityUrlSplit: qualityUrl[] = [];
      let captureArray: RegExpExecArray | null;

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
          .filter((x: any) => x.sig == false)
          .forEach(async (x: any) => {
            const match: RegExpExecArray | null = REGEX.exec(x.urlList[0].url);

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

    addPlaylist(playlist: string) {
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
  let twitchMainWorker: any;
  window.Worker = class WorkerInjector extends Worker {
    constructor(twitchBlobUrl: string | URL) {
      if (twitchMainWorker) {
        super(twitchBlobUrl);
      }

      const newBlobStr = `
                ${onAfterFetch.toString()}
                ${onStartChannel.toString()}
                ${inflateFetch.toString()}
                ${newCallHLS480p.toString()}
                ${declare.toString()}
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
  async function newCallHLS480p(channelName: string) {
    try {
      const gql = await realFetch("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
        body: `{"operationName":"PlaybackAccessToken","letiables":{"isLive":true,"login":"${channelName}","isVod":false,"vodID":"","playerType":"thunderdome"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
      });
      const status: string = await gql.json();
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
  function inflateFetch() {
    // @ts-expect-error
    // eslint-disable-next-line no-global-assign
        fetch = async function (url, options) {
            if (typeof url === 'string') {
                if (url.endsWith('.ts')) {
                    //var p = channel.find(x => x.name === actualChannel).hls.getPlaylistByUrl(url);
                    //var pp = channel.find(x => x.name === actualChannel).hls.getAllPlaylist();

                    //LogPrint("ts timestamp: " + p[0].timestamp);
                }

                if (url.endsWith('m3u8') && url.includes('ttvnw.net') && !whitelist.includes(actualChannel)) {
                    return new Promise(function (resolve, reject) {
                        var processFetch = async function (url) {
                            // await onBeforeFetch(url);
                            await realFetch(url, options).then(function (response) {
                                response.text().then(function (text) {
                                    onAfterFetch(text, url).then(function (r) {
                                        var p = channel.find(x => x.name === actualChannel).hls.getAllPlaylist();
                                        resolve(new Response(p));
                                    });
                                });
                            })
                        };
                        processFetch(url);
                    });
                }

                if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes('picture-by-picture')) {
                    return new Promise(function (resolve, reject) {
                        var processFetch = async function (url) {
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
                            })
                        };
                        processFetch(url);
                    });
                }

                if (url.includes('picture-by-picture')) {
                }

            }      
            
            // @ts-expect-error
            return realFetch.apply(this, arguments);
        }
    }
})();
