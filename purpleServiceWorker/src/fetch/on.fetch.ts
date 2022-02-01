export async function on(_window, response, url) {
    //  if (Math.random() < 0.5 ){
    //      response += "twitch-client-ad";
    //  }

  const channelCurrent = await global.currentChannel();
  
  //if ads find on main link called from twitch api player
  if (response.toString().includes("stitched-ad") || response.toString().includes("twitch-client-ad")) {
    global.LogPrint("ads found");
    
    const quality = global.quality;
    const StreamServerList = channelCurrent.hls.StreamServerList;

    try {
      //try all hls sigs that have on StreamServerList from HLS
      if (StreamServerList.length > 0) {
        const returno = await global.realFetch(StreamServerList.find((x) => x.server == "proxy").urlList.find((a) => a.quality == quality).url, {
          method: "GET",
        }).text();
        if (returno.toString().includes("stitched-ad") || returno.toString().includes("twitch-client-ad")) {
          global.LogPrint("ads on proxy");
          throw new Error("No m3u8 valid url found on StreamServerList");
        }

        return channelCurrent.hls.addPlaylist(returno, true);

        //gera erro se nao tiver link
      }

      throw new Error("No m3u8 valid url found on StreamServerList");
    } catch (e) {
      //if nothing resolve, return 480p flow
      //LogPrint(StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality) && x.server == "local").map(x => x.urlList.find(x => x.quality.includes('480')))[0]);

      const pictureStream = StreamServerList.filter((x) => x.server == "picture")
        .map((x) => x.urlList.find((x) => x.quality.includes("480")))[0].url
        
      const returno = await (await global.realFetch(pictureStream)).text();

      global.LogPrint("480P");
      global.LogPrint(e);
      channelCurrent.hls.addPlaylist(returno);
      return true;
    }
  } else {
    channelCurrent.hls.addPlaylist(response);
    //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url)));
    //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url && a.quality == quality)));
    //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality)));
    //LogPrint("ok")
    return true;
  }
}