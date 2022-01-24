export class fetchService{
  constructor(private realFetch = fetch){
    this.inflateFetch();
  }

  //return the current stream content from channelService.
  async onFetch(response, url): Promise<string> {
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
        return "";
      }
    } else {
      channel.find((x) => x.name === actualChannel).hls.addPlaylist(response);
      //LogPrint(quality);
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url)));
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url && a.quality == quality)));
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality)));
      //LogPrint("ok")
      return "";
    }
  }

  inflateFetch() {
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
          return new Promise(resolve => {
            realFetch(url, options).then(response => {
              response.text().then(async text => {
                //on m3u8 request from twitch app. so send requst to channelService and return current stream.
                //TODO: use the retorn of the onFetch to return getAllPlaylist;
                await this.onFetch(text, url);
                const p = channel.find((x) => x.name === actualChannel).hls.getAllPlaylist();
                resolve(new Response(p));
              });
            });
          });
        }

        if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
          return new Promise(function (resolve, reject) {
            const processFetch = async function (url) {
              await realFetch(url, options).then(response => {
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
      // eslint-disable-next-line prefer-rest-params
      return realFetch.apply(this, arguments);
    };
  }
}