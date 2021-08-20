"use strict";
(function () {
    function declareOptions(scope, whitelist) {
        // Options / globals
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
            let qualityUrlSplit = [];
            let m = [];
            let REGEX = /RESOLUTION=(\S+),C(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/gs;
            while ((m = REGEX.exec(text)) !== null) {
                qualityUrlSplit.push({ quality: (qualityUrlSplit.some(x => x.quality == m[1]) ? m[1] + "p30" : m[1]), url: m[2] });
            }
            let streamList = { server: type, urlList: qualityUrlSplit, sig: sig };
            this._streamServerList.push(streamList);
            await this.signature();
            return true;
        }
        async signature() {
            let REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;
            await new Promise(resolve => this._streamServerList.filter((x) => x.sig == false).forEach(async (x) => {
                let match = REGEX.exec(x.urlList[0].url);
                try {
                    var a = await fetch(`https://jupter.ga/hls/v2/sig/${match[2]}/${match[1]}`, {
                        method: 'GET'
                    });
                    LogPrint("Server signature: " + a.ok);
                    x.sig = true;
                    resolve(true);
                }
                catch {
                    resolve(false);
                }
            }));
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
            var lines = playlist.toString().split(/[\r\n]/);
            this._header[4] = (lines[4]);
            this._header[5] = (lines[5]);
            for (let i in lines) {
                if (lines[i].includes("#EXT-X-PROGRAM-DATE-TIME:")) {
                    var sequenceTimestamp = Math.floor(new Date(lines[i].slice(lines[i].length - 24, lines[i].length)).getTime() / 1000);
                    var r = this._playlist.filter(x => { return x.timestamp >= sequenceTimestamp; });
                    //LogPrint(Math.floor(date.getTime() / 1000));
                    //LogPrint(r);
                    if (!r.length) {
                        this._sequence = this._sequence + 1;
                        this._playlist.push({ time: lines[parseInt(i)], timestamp: sequenceTimestamp, info: lines[parseInt(i) + 1], url: lines[parseInt(i) + 2] });
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
            return this._header[0] + "\n" + this._header[1] + "\n" + this._header[2] + "\n" + this._header[3] + this._sequence + "\n" + this._header[4] + "\n" + this._header[5] + "\n" +
                this._playlist.map(x => { return x.time + "\n" + x.info + "\n" + x.url + "\n"; });
        }
    }
    var twitchMainWorker = null;
    let oldWorker = window.Worker;
    window.Worker = class Worker extends oldWorker {
        constructor(twitchBlobUrl) {
            if (twitchMainWorker) {
                super(twitchBlobUrl);
                return;
            }
            var newBlobStr = `
                const LogPrint = (x => {console.log("[Purple]: " + x)});
                ${onAfterFetch.toString()}
                ${onStartChannel.toString()}
                ${hookWorkerFetch.toString()}
                ${declareOptions.toString()}
                ${HLS.toString()}
                declareOptions(self, "${whitelist}");
                hookWorkerFetch();
                importScripts('${twitchBlobUrl}');
            `;
            super(URL.createObjectURL(new Blob([newBlobStr])));
            twitchMainWorker = this;
        }
    };
    function getWasmWorkerUrl(twitchBlobUrl) {
        var req = new XMLHttpRequest();
        req.open('GET', twitchBlobUrl, false);
        req.send();
        //LogPrint(req.responseText);
        return req.responseText.split("'")[1];
    }
    async function onAfterFetch(response, realFetch, url) {
        //  if (Math.random() < 0.5 ){
        //      response += "twitch-client-ad";
        //  }
        var quality = channel.find(x => x.name === actualChannel).hls.StreamServerList.map(x => x.urlList.find(a => a.url == url)).find(x => x != undefined).quality;
        LogPrint(quality);
        //if ads find on main link called from twitch api player
        if (response.toString().includes("stitched-ad") || response.toString().includes("twitch-client-ad")) {
            LogPrint("ads found");
            var StreamServerList = channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality));
            try {
                //try all hls sigs that have on StreamServerList from HLS
                if (StreamServerList.length > 0) {
                    var a = await realFetch(StreamServerList.find(x => x.server == "proxy").urlList.find(a => a.quality == quality).url, { method: 'GET' });
                    var returno = await a.text();
                    return channel.find(x => x.name === actualChannel).hls.addPlaylist(returno, true);
                    //gera erro se nao tiver link
                }
                throw new Error("No m3u8 valid url found on StreamServerList");
            }
            catch (e) {
                //if nothing resolve, return 480p flow
                //LogPrint(StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality) && x.server == "local").map(x => x.urlList.find(x => x.quality.includes('480')))[0]);
                var a = await realFetch(StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality) && x.server == "local").map(x => x.urlList.find(x => x.quality.includes('480')))[0].url, { method: 'GET' });
                var returno = await a.text();
                LogPrint("480P");
                LogPrint(e);
                channel.find(x => x.name === actualChannel).hls.addPlaylist(returno);
                return true;
            }
        }
        else {
            channel.find(x => x.name === actualChannel).hls.addPlaylist(response);
            //LogPrint(quality);
            //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url)));
            //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url && a.quality == quality)));
            //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality)));
            //LogPrint("ok")
            return true;
        }
    }
    async function onStartChannel(realFetch, url, text, isOffline = false) {
        let regex = /hls\/(.*).m3u8/gm;
        var match = regex.exec(url);
        var existe = false;
        if (match[1]) {
            actualChannel = match[1];
            if (whitelist.includes(match[1])) {
                return;
            }
            if (!channel.find(c => c.name === match[1])) {
                LogPrint("new channel 2: " + match[1]);
                channel.push({ name: match[1], flowSig: [], hls: new HLS(), });
            }
            else {
                existe = true;
            }
        }
        //--------------------------------------------//
        LogPrint("Local Server: Loading");
        await channel.find(x => x.name === actualChannel).hls.addStreamLink(text);
        LogPrint("Local Server: OK");
        if (existe) {
            return;
        }
        //--------------------------------------------//
        //i gonna do a new sig call here. with new device id
        var r = await realFetch(url.replace("usher.ttvnw.net", "cdn.router.trade"), { method: 'GET' });
        var text = await r.text();
        channel.find(x => x.name === actualChannel).hls.addStreamLink(text);
        LogPrint("Local Server 480p: OK");
        //--------------------------------------------//
        try {
            LogPrint("External Server: Loading");
            var a = await realFetch('https://jupter.ga/hls/v2/channel/' + actualChannel, { method: 'GET' });
            let text = await a.text();
            if (!a.ok) {
                throw new Error("server proxy return error or not found");
            }
            var qualityUrlSplit = text.split('.');
            var server = qualityUrlSplit.shift();
            var streamList = { server: "proxy", urlList: [] };
            qualityUrlSplit.forEach((element, index, array) => { if (!(index % 2)) {
                streamList.urlList.push({ quality: (streamList.urlList.some(x => x.quality == element) ? element + "p30" : element), url: "https://video-weaver." + server + ".hls.ttvnw.net/v1/playlist/" + array[index + 1] + ".m3u8" });
            } });
            channel.find(x => x.name === actualChannel).hls.StreamServerListSet(streamList);
            console.log(channel.find(x => x.name === actualChannel).hls.StreamServerList);
            //channel.find(x => x.name === actualChannel).hls.addStreamLink(text);
            LogPrint("External Server: OK");
        }
        catch (e) {
            LogPrint(e);
        }
    }
    function hookWorkerFetch() {
        var realFetch = fetch;
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
                                    onAfterFetch(text, realFetch, url).then(function (r) {
                                        var p = channel.find(x => x.name === actualChannel).hls.getAllPlaylist();
                                        resolve(new Response(p));
                                    });
                                });
                            });
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
                                        await onStartChannel(realFetch, url, text);
                                        resolve(new Response(text));
                                    });
                                }
                                else {
                                    resolve(response);
                                    LogPrint("channel offline");
                                }
                            });
                        };
                        processFetch(url);
                    });
                }
                if (url.includes('picture-by-picture')) {
                }
            }
            return realFetch.apply(this, arguments);
        };
    }
    function onContentLoaded() {
        // This stops Twitch from pausing the player when in another tab and an ad shows.
        // Taken from https://github.com/saucettv/VideoAdBlockForTwitch/blob/cefce9d2b565769c77e3666ac8234c3acfe20d83/chrome/content.js#L30
        try {
            Object.defineProperty(document, 'visibilityState', {
                get() {
                    return 'visible';
                }
            });
        }
        catch { }
        try {
            Object.defineProperty(document, 'hidden', {
                get() {
                    return false;
                }
            });
        }
        catch { }
        var block = e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        };
        document.addEventListener('visibilitychange', block, true);
        document.addEventListener('webkitvisibilitychange', block, true);
        document.addEventListener('mozvisibilitychange', block, true);
        document.addEventListener('hasFocus', block, true);
        try {
            if (/Firefox/.test(navigator.userAgent)) {
                Object.defineProperty(document, 'mozHidden', {
                    get() {
                        return false;
                    }
                });
            }
            else {
                Object.defineProperty(document, 'webkitHidden', {
                    get() {
                        return false;
                    }
                });
            }
        }
        catch { }
    }
    if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
        onContentLoaded();
    }
    else {
        window.addEventListener("DOMContentLoaded", function () {
            onContentLoaded();
        });
    }
})();
