export async function onStart(_window, url, text /* isOffline = false */) {
  const regex = /hls\/(.*).m3u8/gm;
  const match: RegExpExecArray | [] = regex.exec(url) || [];
  let existent = false;

  if (match[1]) {
    if(global.whitelist == undefined){
      global.whitelist = [];
    }
    global.actualChannel = match[1];
    if (global.whitelist.includes(match[1])) {
      return;
    }

    if (!global.channel.find((c) => c.name === match[1])) {
      global.LogPrint("Channel: " + match[1]);
      global.channel.push({ name: match[1], flowSig: [], hls: new global.HLS() });
    } else {
      global.LogPrint("Exist: " + match[1]);
      existent = true;
    }
  }
  //--------------------------------------------//

  //--------------------------------------------//
  global.LogPrint("Local Server: Loading");
  global.currentChannel(match[1]).hls.addStreamLink(text);
  global.LogPrint("Local Server: OK");

  if (existent) return;

  //--------------------------------------------//

  //--------------------------------------------//
  await global.newPicture(global.actualChannel).then((textPicture) => {
    global.currentChannel(match[1]).hls.addStreamLink(textPicture, "picture", true);
    global.LogPrint("Local Server 480p: OK");
  });

  //--------------------------------------------//

  //--------------------------------------------//

  if(!global.isProxyAuth) return;
  global.newExternal(global.actualChannel).then((text) => global.currentChannel(match[1]).hls.addStreamLink(text, "proxy", true));

  return;

  try {
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

    global.LogPrint(streamList);
    global.channel.find((x) => x.name === match[1]).hls.add(streamList);

    global.LogPrint("External Server: OK");
  } catch (e) {
    global.LogPrint(e);
  }
}
