export async function on(_window, response, url) {
    //   if (Math.random() < 0.5 ){
    //       response += "twitch-client-ad";
    //   }
      
      console.log("quality");
      console.log(global.quality);
      console.log("channelActual");
      console.log(global.actualChannel);

      console.log("channel object");
      console.log(global.channel.find((x) => x.name === global.actualChannel));
      console.log("channel url");
      console.log(global.channel
        .find((x) => x.name === global.actualChannel)
        .hls.StreamServerList.map((x) => x.urlList.find((a) => a.url == url)));

      const quality = global.channel
        .find((x) => x.name === global.actualChannel)
        .hls.StreamServerList.map((x) => x.urlList.find((a) => a.url == url))
        .find((x) => x != undefined).quality;

        console.log(quality);
  
    //if ads find on main link called from twitch api player
    if (response.toString().includes("stitched-ad") || response.toString().includes("twitch-client-ad")) {
      global.LogPrint("ads found");
      const StreamServerList = global.channel.find((x) => x.name === global.actualChannel).hls.StreamServerList;
      console.log(StreamServerList);
  
      try {
        //try all hls sigs that have on StreamServerList from HLS
        if (StreamServerList.length > 0) {
          const a = await global.realFetch(StreamServerList.find((x) => x.server == "proxy").urlList.find((a) => a.quality == quality).url, {
            method: "GET",
          });
          const returno = await a.text();
          if (returno.toString().includes("stitched-ad") || returno.toString().includes("twitch-client-ad")) {
            global.LogPrint("ads on proxy");
          }
  
          return global.channel.find((x) => x.name === global.actualChannel).hls.addPlaylist(returno, true);
  
          //gera erro se nao tiver link
        }
  
        throw new Error("No m3u8 valid url found on StreamServerList");
      } catch (e) {
        //if nothing resolve, return 480p flow
        //LogPrint(StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality) && x.server == "local").map(x => x.urlList.find(x => x.quality.includes('480')))[0]);
  
        const a = await global.realFetch(
          StreamServerList.filter((x) => x.urlList.find((a) => a.url != url && a.quality == quality) && x.server == "picture").map((x) =>
            x.urlList.find((x) => x.quality.includes("480")),
          )[0].url,
          { method: "GET" },
        );
        const returno = await a.text();
  
        global.LogPrint("480P");
        global.LogPrint(e);
        global.channel.find((x) => x.name === global.actualChannel).hls.addPlaylist(returno);
        return true;
      }
    } else {
      global.channel.find((x) => x.name === global.actualChannel).hls.addPlaylist(response);
      //LogPrint(quality);
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url)));
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url && a.quality == quality)));
      //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality)));
      //LogPrint("ok")
      return true;
    }
  }