export async function onStart(_window, url, text /* isOffline = false */) {
    const regex = /hls\/(.*).m3u8/gm;
    const match: RegExpExecArray | [] = regex.exec(url) || [];
    let existent = false;

    if (match[1]) {
        _window.actualChannel = match[1];
        if (_window.whitelist.includes(match[1])) {
            return;
        }

        if (!_window.channel.find((c) => c.name === match[1])) {
            _window.LogPrint("new channel 2: " + match[1]);
            _window.channel.push({ name: match[1], flowSig: [], hls: new _window.HLS() });
        } else {
            existent = true;
        }
    }
    //--------------------------------------------//

    //--------------------------------------------//
    _window.LogPrint("Local Server: Loading");
    global.currentChannel().hls.addStreamLink(text);
    _window.LogPrint("Local Server: OK");

    if (existent) return;

    //--------------------------------------------//

    //--------------------------------------------//
    global.newPicture(global.actualChannel).then(textPicture => {
        global.currentChannel().hls.addStreamLink(textPicture, "picture", true);
        global.LogPrint("Local Server 480p: OK");
    });

    //--------------------------------------------//

    //--------------------------------------------//

    try {
        _window.LogPrint("External Server: Loading");
        const a = await _window.realFetch("https://jupter.ga/hls/v2/channel/" + _window.actualChannel, { method: "GET" });

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

        _window.channel.find((x) => x.name === _window.actualChannel).hls.StreamServerListSet(streamList);
        
        _window.LogPrint("External Server: OK");
    } catch (e) {
        _window.LogPrint(e);
    }
}