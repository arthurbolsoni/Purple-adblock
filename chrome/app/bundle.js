/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/HLS.ts":
/*!********************!*\
  !*** ./src/HLS.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HLS": () => (/* binding */ HLS)
/* harmony export */ });
class HLS {
    constructor() {
        this._header = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", "#EXT-X-MEDIA-SEQUENCE:"];
        this._playlist = [];
        this._sequence = 0;
        this._streamServerList = [];
    }
    //add m3u8 links with quality to the list of servers
    async addStreamLink(text, type = "local", sig = false) {
        const qualityUrlSplit = [];
        let captureArray;
        const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;
        while ((captureArray = REGEX.exec(text)) !== null) {
            qualityUrlSplit.push({ quality: captureArray[1], url: captureArray[2] });
        }
        console.log(qualityUrlSplit);
        const streamList = { server: type, urlList: qualityUrlSplit, sig: sig };
        this._streamServerList.push(streamList);
        if (!sig) {
            await this.signature();
        }
        return true;
    }
    async signature() {
        const REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;
        await new Promise((resolve) => this._streamServerList
            .filter((x) => x.sig == false)
            .forEach(async (x) => {
            const match = REGEX.exec(x.urlList[0].url);
            if (match) {
                try {
                    const a = await fetch("https://jupter.ga/hls/v2/sig/" + match[2] + "/" + match[1], {
                        method: "GET",
                    });
                    x.sig = true;
                    resolve(true);
                }
                catch {
                    resolve(false);
                }
            }
            else {
                resolve(false);
            }
        }));
    }
    get StreamServerList() {
        return this._streamServerList;
    }
    addPlaylist(playlist) {
        if (playlist === null) {
            return false;
        }
        let changed = false;
        const lines = playlist.toString().split(/[\r\n]/);
        this._header[4] = lines[4];
        this._header[5] = lines[5];
        //take all m3u9 content to the playlist and build a varible
        for (const i in lines) {
            if (lines[i].includes("#EXTINF") && lines[i].includes(",live")) {
                //timestamp sequence
                const sequenceTimestamp = Math.floor(new Date(lines[parseInt(i) - 1].slice(lines[parseInt(i) - 1].length - 24, lines[parseInt(i) - 1].length)).getTime() / 1000);
                //select all sequence that no exist
                const r = this._playlist.filter((x) => {
                    return x.timestamp >= sequenceTimestamp;
                });
                //add the sequence on playlist variable if it no exist
                if (!r.length) {
                    this._sequence = this._sequence + 1;
                    this._playlist.push({
                        time: lines[parseInt(i) - 1],
                        timestamp: sequenceTimestamp,
                        info: lines[parseInt(i)],
                        url: lines[parseInt(i) + 1],
                    });
                    changed = true;
                }
                while (this._playlist.length > 15) {
                    this._playlist.shift();
                }
            }
        }
        return changed;
    }
    getAllPlaylist() {
        return (this._header[0] +
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
            }));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0hMUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sR0FBRztJQUFoQjtRQUNVLFlBQU8sR0FBa0IsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUM5RyxjQUFTLEdBQW1CLEVBQUUsQ0FBQztRQUMvQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2Qsc0JBQWlCLEdBQW1CLEVBQUUsQ0FBQztJQStHakQsQ0FBQztJQTdHQyxvREFBb0Q7SUFDcEQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBSSxHQUFHLE9BQU8sRUFBRSxHQUFHLEdBQUcsS0FBSztRQUMzRCxNQUFNLGVBQWUsR0FBaUIsRUFBRSxDQUFDO1FBQ3pDLElBQUksWUFBb0MsQ0FBQztRQUV6QyxNQUFNLEtBQUssR0FBRyxxRkFBcUYsQ0FBQztRQUVwRyxPQUFPLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDakQsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUU7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sVUFBVSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN4RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUixNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUN4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

/***/ }),

/***/ "./src/channel/current.channel.ts":
/*!****************************************!*\
  !*** ./src/channel/current.channel.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "current": () => (/* binding */ current)
/* harmony export */ });
function current(channel = null) {
    if (channel) {
        return __webpack_require__.g.channel.find((x) => x.name === channel);
    }
    else {
        return __webpack_require__.g.channel.find((x) => x.name === __webpack_require__.g.actualChannel);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVudC5jaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NoYW5uZWwvY3VycmVudC5jaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUk7SUFDcEMsSUFBSSxPQUFPLEVBQUU7UUFDWCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDO0tBQ3ZEO1NBQU07UUFDTCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNwRTtBQUNILENBQUMifQ==

/***/ }),

/***/ "./src/channel/on.channel.ts":
/*!***********************************!*\
  !*** ./src/channel/on.channel.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "onStart": () => (/* binding */ onStart)
/* harmony export */ });
async function onStart(_window, url, text /* isOffline = false */) {
    const regex = /hls\/(.*).m3u8/gm;
    const match = regex.exec(url) || [];
    let existent = false;
    if (match[1]) {
        if (__webpack_require__.g.whitelist == undefined) {
            __webpack_require__.g.whitelist = [];
        }
        __webpack_require__.g.actualChannel = match[1];
        if (__webpack_require__.g.whitelist.includes(match[1])) {
            return;
        }
        if (!_window.channel.find((c) => c.name === match[1])) {
            _window.LogPrint("Channel: " + match[1]);
            _window.channel.push({ name: match[1], flowSig: [], hls: new _window.HLS() });
        }
        else {
            _window.LogPrint("Exist: " + match[1]);
            existent = true;
        }
    }
    //--------------------------------------------//
    //--------------------------------------------//
    _window.LogPrint("Local Server: Loading");
    __webpack_require__.g.currentChannel(match[1]).hls.addStreamLink(text);
    _window.LogPrint("Local Server: OK");
    if (existent)
        return;
    //--------------------------------------------//
    //--------------------------------------------//
    await __webpack_require__.g.newPicture(__webpack_require__.g.actualChannel).then((textPicture) => {
        __webpack_require__.g.currentChannel(match[1]).hls.addStreamLink(textPicture, "picture", true);
        __webpack_require__.g.LogPrint("Local Server 480p: OK");
    });
    //--------------------------------------------//
    //--------------------------------------------//
    if (!__webpack_require__.g.isProxyAuth)
        return;
    __webpack_require__.g.newExternal(__webpack_require__.g.actualChannel).then((text) => __webpack_require__.g.currentChannel(match[1]).hls.addStreamLink(text, "proxy", true));
    return;
    try {
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
        _window.LogPrint(streamList);
        _window.channel.find((x) => x.name === match[1]).hls.add(streamList);
        _window.LogPrint("External Server: OK");
    }
    catch (e) {
        _window.LogPrint(e);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFubmVsL29uLmNoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsdUJBQXVCO0lBQ3RFLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDO0lBQ2pDLE1BQU0sS0FBSyxHQUF5QixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxRCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFFckIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDWixJQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksU0FBUyxFQUFDO1lBQy9CLE1BQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1NBQ3ZCO1FBQ0QsTUFBTSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN2QyxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDckQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFF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

/***/ }),

/***/ "./src/fetch/external.fetch.ts":
/*!*************************************!*\
  !*** ./src/fetch/external.fetch.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "external": () => (/* binding */ external)
/* harmony export */ });
//external request throuhg purple server
async function external(channelName) {
    try {
        __webpack_require__.g.LogPrint("External Server: Loading");
        const response = await __webpack_require__.g.realFetch("https://" + __webpack_require__.g.tunnel[0] + "/channel/" + channelName);
        if (!response.ok) {
            throw new Error("server proxy return error or not found");
        }
        const text = await response.text();
        __webpack_require__.g.LogPrint("External Server: OK");
        return text;
    }
    catch (e) {
        __webpack_require__.g.LogPrint(e);
        return "";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwuZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBQ3hDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsUUFBUSxDQUFDLFdBQW1CO0lBQ2hELElBQUk7UUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDNUMsTUFBTSxRQUFRLEdBQWEsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUU5RyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDM0Q7UUFFRCxNQUFNLElBQUksR0FBVyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUUzQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFFdkMsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixPQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0gsQ0FBQyJ9

/***/ }),

/***/ "./src/fetch/fetch.inflate.ts":
/*!************************************!*\
  !*** ./src/fetch/fetch.inflate.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "inflateFetch": () => (/* binding */ inflateFetch)
/* harmony export */ });
function inflateFetch(_window) {
    // eslint-disable-next-line no-global-assign
    _window.fetch = async function (url, options) {
        if (typeof url === "string") {
            if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !_window.whitelist.includes(_window.actualChannel)) {
                return new Promise(function (resolve, reject) {
                    var processFetch = async function (url) {
                        try {
                            await _window.realFetch(url, options).then(function (response) {
                                response.text().then(function (text) {
                                    _window.onFetch(_window, text, url).then(function (r) {
                                        var playlist = __webpack_require__.g.currentChannel().hls.getAllPlaylist();
                                        resolve(new Response(playlist));
                                    });
                                });
                            });
                        }
                        catch (e) {
                            resolve(new Response());
                        }
                    };
                    processFetch(url);
                });
            }
            if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
                return new Promise(function (resolve, reject) {
                    var processFetch = async function (url) {
                        await _window.realFetch(url, options).then(function (response) {
                            if (response.ok) {
                                response.text().then(async function (text) {
                                    await _window.onStartChannel(_window, url, text);
                                    resolve(new Response(text));
                                });
                            }
                            else {
                                resolve(response);
                                _window.LogPrint("channel offline");
                            }
                        });
                    };
                    processFetch(url);
                });
            }
            if (url.includes("picture-by-picture")) {
            }
        }
        return _window.realFetch.apply(this, arguments);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guaW5mbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBTztJQUNsQyw0Q0FBNEM7SUFDNUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLE9BQU87UUFDMUMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDM0IsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzNHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDMUMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ3BDLElBQUk7NEJBQ0YsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFRO2dDQUMzRCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtvQ0FDakMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7d0NBQ2xELElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7d0NBQzVELE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29DQUNsQyxDQUFDLENBQUMsQ0FBQztnQ0FDTCxDQUFDLENBQUMsQ0FBQzs0QkFDTCxDQUFDLENBQUMsQ0FBQzt5QkFDSjt3QkFBQyxPQUFPLENBQUMsRUFBRTs0QkFDVixPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO3lCQUN6QjtvQkFDSCxDQUFDLENBQUM7b0JBQ0YsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQixDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7Z0JBQzNGLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDMUMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ3BDLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTs0QkFDM0QsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFO2dDQUNmLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUk7b0NBQ3ZDLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUNqRCxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDOUIsQ0FBQyxDQUFDLENBQUM7NkJBQ0o7aUNBQU07Z0NBQ0wsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUNsQixPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7NkJBQ3JDO3dCQUNILENBQUMsQ0FBQyxDQUFDO29CQUNMLENBQUMsQ0FBQztvQkFDRixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTthQUN2QztTQUNGO1FBRUQsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9

/***/ }),

/***/ "./src/fetch/on.fetch.ts":
/*!*******************************!*\
  !*** ./src/fetch/on.fetch.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "on": () => (/* binding */ on)
/* harmony export */ });
async function on(_window, response, url) {
    //  if (Math.random() < 0.5 ){
    //      response += "twitch-client-ad";
    //  }
    const channelCurrent = await __webpack_require__.g.currentChannel();
    //if ads find on main link called from twitch api player
    if (__webpack_require__.g.isAds(response)) {
        __webpack_require__.g.LogPrint("ads found");
        channelCurrent.hls.addPlaylist(response);
        __webpack_require__.g.postMessage({
            type: "getQuality",
            value: null,
        });
        __webpack_require__.g.postMessage({
            type: "reload",
            value: null,
        });
        const quality = __webpack_require__.g.quality;
        const StreamServerList = channelCurrent.hls.StreamServerList;
        __webpack_require__.g.LogPrint(quality);
        try {
            //try all hls sigs that have on StreamServerList from HLS 
            if (StreamServerList.length > 0) {
                const proxy = StreamServerList.find((x) => x.server == "proxy");
                if (!proxy) {
                    throw new Error("No m3u8 valid url found on StreamServerList");
                }
                const url = proxy.urlList.find((a) => a.quality == quality);
                if (!url) {
                    throw new Error("No m3u8 valid url found on StreamServerList");
                }
                const returno2 = await __webpack_require__.g.realFetch(url.url);
                var returnoText = await returno2.text();
                if (__webpack_require__.g.isAds(returnoText)) {
                    __webpack_require__.g.LogPrint("ads on proxy");
                    throw new Error("No m3u8 valid url found on StreamServerList");
                }
                return channelCurrent.hls.addPlaylist(returnoText);
            }
            //gera erro se nao tiver link
            throw new Error("No m3u8 valid url found on StreamServerList");
        }
        catch (e) {
            //if nothing resolve, return 480p flow
            const pictureStream = StreamServerList.filter((x) => x.server == "picture").map((x) => x.urlList.find((x) => x.quality.includes("480")))[0].url;
            const returno = await (await __webpack_require__.g.realFetch(pictureStream)).text();
            if (channelCurrent.hls.addPlaylist(returno)) {
                __webpack_require__.g.LogPrint("480p");
            }
            return true;
        }
    }
    else {
        channelCurrent.hls.addPlaylist(response);
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvb24uZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzdDLDhCQUE4QjtJQUM5Qix1Q0FBdUM7SUFDdkMsS0FBSztJQUVMLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXJELHdEQUF3RDtJQUN4RCxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFFMUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU3QixjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV6QyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ2pCLElBQUksRUFBRSxZQUFZO1lBQ2xCLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUNqQixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUMvQixNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFFN0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QixJQUFJO1lBQ0YsMERBQTBEO1lBQzFELElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxLQUFLLEdBQTJCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQztnQkFFeEYsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7aUJBQ2hFO2dCQUVELE1BQU0sR0FBRyxHQUEyQixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQztnQkFFcEYsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDUixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7aUJBQ2hFO2dCQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pELElBQUksV0FBVyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUV4QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztpQkFDaEU7Z0JBRUQsT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNwRDtZQUVELDZCQUE2QjtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7U0FDaEU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLHNDQUFzQztZQUN0QyxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDcEYsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBRVQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXJFLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzNDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDekI7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7U0FBTTtRQUNMLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFDSCxDQUFDIn0=

/***/ }),

/***/ "./src/fetch/picture.fetch.ts":
/*!************************************!*\
  !*** ./src/fetch/picture.fetch.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "picture": () => (/* binding */ picture)
/* harmony export */ });
async function picture(channelName) {
    try {
        const gql = await __webpack_require__.g.realFetch("https://gql.twitch.tv/gql", {
            method: "POST",
            headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
            body: `{"operationName":"PlaybackAccessToken","variables":{"isLive":true,"login":"${channelName}","isVod":false,"vodID":"","playerType":"thunderdome"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
        });
        const status = await gql.json();
        const url = "https://usher.ttvnw.net/api/channel/hls/" +
            channelName +
            ".m3u8?allow_source=true&fast_bread=true&p=" +
            Math.floor(Math.random() * 1e7) +
            "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
            status["data"]["streamPlaybackAccessToken"]["signature"] +
            "&supported_codecs=avc1&token=" +
            status["data"]["streamPlaybackAccessToken"]["value"];
        const text = await (await __webpack_require__.g.realFetch(url)).text();
        return text;
    }
    catch (e) {
        console.log(e);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGljdHVyZS5mZXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9waWN0dXJlLmZldGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxLQUFLLFVBQVUsT0FBTyxDQUFDLFdBQW1CO0lBQy9DLElBQUk7UUFDRixNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsMkJBQTJCLEVBQUU7WUFDOUQsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsZ0NBQWdDLEVBQUU7WUFDMUQsSUFBSSxFQUFFLDhFQUE4RSxXQUFXLHVMQUF1TDtTQUN2UixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBVyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV4QyxNQUFNLEdBQUcsR0FDUCwwQ0FBMEM7WUFDMUMsV0FBVztZQUNYLDRDQUE0QztZQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDL0IsZ0dBQWdHO1lBQ2hHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUN4RCwrQkFBK0I7WUFDL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdkQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3hELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEI7QUFDSCxDQUFDIn0=

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "app": () => (/* binding */ app)
/* harmony export */ });
/* harmony import */ var _fetch_fetch_inflate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fetch/fetch.inflate */ "./src/fetch/fetch.inflate.ts");
/* harmony import */ var _HLS__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./HLS */ "./src/HLS.ts");
/* harmony import */ var _channel_on_channel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./channel/on.channel */ "./src/channel/on.channel.ts");
/* harmony import */ var _fetch_on_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./fetch/on.fetch */ "./src/fetch/on.fetch.ts");
/* harmony import */ var _channel_current_channel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./channel/current.channel */ "./src/channel/current.channel.ts");
/* harmony import */ var _fetch_picture_fetch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./fetch/picture.fetch */ "./src/fetch/picture.fetch.ts");
/* harmony import */ var _fetch_external_fetch__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./fetch/external.fetch */ "./src/fetch/external.fetch.ts");







function app(scope) {
    scope.LogPrint = (x) => {
        console.log("[Purple]: ", x);
    };
    scope.isAds = (x) => {
        return x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad") || x.toString().includes("twitch-ad-quartile");
    };
    scope.realFetch = fetch;
    scope.isProxyAuth = false;
    scope.quality = "";
    scope.whitelist = [];
    __webpack_require__.g.whitelist = [];
    //receive message from window
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
        switch (e.data.type) {
            case "setSetting": {
                if (e.data.value) {
                    scope.whitelist = e.data.value.whiteList;
                    scope.isProxyAuth = e.data.value.toggleProxy;
                }
                break;
            }
            case "setQuality": {
                scope.quality = e.data.value.name;
                break;
            }
            default: {
                break;
            }
        }
    });
    scope.postMessage({
        type: "init",
        value: null,
    });
    scope.comingAds = false;
    scope.channel = [];
    scope.actualChannel = "";
    scope.currentChannel = _channel_current_channel__WEBPACK_IMPORTED_MODULE_4__.current;
    scope.newPicture = _fetch_picture_fetch__WEBPACK_IMPORTED_MODULE_5__.picture;
    scope.newExternal = _fetch_external_fetch__WEBPACK_IMPORTED_MODULE_6__.external;
    scope.tunnel = ["eu1.jupter.ga"];
    scope.onFetch = _fetch_on_fetch__WEBPACK_IMPORTED_MODULE_3__.on;
    scope.onStartChannel = _channel_on_channel__WEBPACK_IMPORTED_MODULE_2__.onStart;
    scope.HLS = _HLS__WEBPACK_IMPORTED_MODULE_1__.HLS;
    (0,_fetch_fetch_inflate__WEBPACK_IMPORTED_MODULE_0__.inflateFetch)(scope);
}
app(self);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBVTtJQUM1QixLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzFJLENBQUMsQ0FBQztJQUVGLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQzFCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBRXRCLDZCQUE2QjtJQUM3QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztRQUMzQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLEtBQUssWUFBWSxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxNQUFNO2FBQ1A7WUFDRCxPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNO2FBQ1A7U0FDRjtRQUVELFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDbkIsS0FBSyxZQUFZLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDaEIsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7b0JBQ3pDLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO2lCQUM5QztnQkFDRCxNQUFNO2FBQ1A7WUFDRCxLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNqQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDbEMsTUFBTTthQUNQO1lBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ1AsTUFBTTthQUNQO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDaEIsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsSUFBSTtLQUNaLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9CLEtBQUssQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzNCLEtBQUssQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO0lBQzdCLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUVoQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFLLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUUvQixLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUVoQixZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIsQ0FBQztBQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyJ9
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsZ0RBQWdEO0FBQ25GO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSwyQ0FBMkM7Ozs7Ozs7Ozs7Ozs7O0FDdkdwQztBQUNQO0FBQ0EsZUFBZSxxQkFBTTtBQUNyQjtBQUNBO0FBQ0EsZUFBZSxxQkFBTSxnQ0FBZ0MscUJBQU07QUFDM0Q7QUFDQTtBQUNBLDJDQUEyQzs7Ozs7Ozs7Ozs7Ozs7QUNScEM7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVkscUJBQU07QUFDbEIsWUFBWSxxQkFBTTtBQUNsQjtBQUNBLFFBQVEscUJBQU07QUFDZCxZQUFZLHFCQUFNO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLHFEQUFxRDtBQUN4RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHFCQUFNO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUscUJBQU0sWUFBWSxxQkFBTTtBQUNsQyxRQUFRLHFCQUFNO0FBQ2QsUUFBUSxxQkFBTTtBQUNkLEtBQUs7QUFDTDtBQUNBO0FBQ0EsU0FBUyxxQkFBTTtBQUNmO0FBQ0EsSUFBSSxxQkFBTSxhQUFhLHFCQUFNLCtCQUErQixxQkFBTTtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7Ozs7Ozs7Ozs7Ozs7O0FDNUQzQztBQUNPO0FBQ1A7QUFDQSxRQUFRLHFCQUFNO0FBQ2QsK0JBQStCLHFCQUFNLHdCQUF3QixxQkFBTTtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEscUJBQU07QUFDZDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHFCQUFNO0FBQ2Q7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDOzs7Ozs7Ozs7Ozs7OztBQ2pCcEM7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RCxxQkFBTTtBQUM3RDtBQUNBLHFDQUFxQztBQUNyQyxpQ0FBaUM7QUFDakMsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDOzs7Ozs7Ozs7Ozs7OztBQ2pEcEM7QUFDUDtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMscUJBQU07QUFDdkM7QUFDQSxRQUFRLHFCQUFNO0FBQ2QsUUFBUSxxQkFBTTtBQUNkO0FBQ0EsUUFBUSxxQkFBTTtBQUNkO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsUUFBUSxxQkFBTTtBQUNkO0FBQ0E7QUFDQSxTQUFTO0FBQ1Qsd0JBQXdCLHFCQUFNO0FBQzlCO0FBQ0EsUUFBUSxxQkFBTTtBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMscUJBQU07QUFDN0M7QUFDQSxvQkFBb0IscUJBQU07QUFDMUIsb0JBQW9CLHFCQUFNO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLHFCQUFNO0FBQy9DO0FBQ0EsZ0JBQWdCLHFCQUFNO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQzs7Ozs7Ozs7Ozs7Ozs7QUN6RHBDO0FBQ1A7QUFDQSwwQkFBMEIscUJBQU07QUFDaEM7QUFDQSx1QkFBdUIsK0NBQStDO0FBQ3RFLG9CQUFvQixtREFBbUQseUJBQXlCLFlBQVksc0RBQXNELGVBQWUsa0JBQWtCLDhGQUE4RjtBQUNqUyxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLHFCQUFNO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQzs7Ozs7O1VDdkIzQztVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTnFEO0FBQ3pCO0FBQ21CO0FBQ1Q7QUFDYztBQUNKO0FBQ0U7QUFDM0M7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkscUJBQU07QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQiw2REFBTztBQUNsQyx1QkFBdUIseURBQU87QUFDOUIsd0JBQXdCLDJEQUFRO0FBQ2hDO0FBQ0Esb0JBQW9CLCtDQUFFO0FBQ3RCLDJCQUEyQix3REFBTztBQUNsQyxnQkFBZ0IscUNBQUc7QUFDbkIsSUFBSSxrRUFBWTtBQUNoQjtBQUNBO0FBQ0EsMkNBQTJDLG0xRiIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9ITFMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NoYW5uZWwvY3VycmVudC5jaGFubmVsLnRzIiwid2VicGFjazovLy8uL3NyYy9jaGFubmVsL29uLmNoYW5uZWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL2V4dGVybmFsLmZldGNoLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9vbi5mZXRjaC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvcGljdHVyZS5mZXRjaC50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBITFMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyID0gW1wiI0VYVE0zVVwiLCBcIiNFWFQtWC1WRVJTSU9OOjNcIiwgXCIjRVhULVgtVEFSR0VURFVSQVRJT046NlwiLCBcIiNFWFQtWC1NRURJQS1TRVFVRU5DRTpcIl07XHJcbiAgICAgICAgdGhpcy5fcGxheWxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLl9zZXF1ZW5jZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fc3RyZWFtU2VydmVyTGlzdCA9IFtdO1xyXG4gICAgfVxyXG4gICAgLy9hZGQgbTN1OCBsaW5rcyB3aXRoIHF1YWxpdHkgdG8gdGhlIGxpc3Qgb2Ygc2VydmVyc1xyXG4gICAgYXN5bmMgYWRkU3RyZWFtTGluayh0ZXh0LCB0eXBlID0gXCJsb2NhbFwiLCBzaWcgPSBmYWxzZSkge1xyXG4gICAgICAgIGNvbnN0IHF1YWxpdHlVcmxTcGxpdCA9IFtdO1xyXG4gICAgICAgIGxldCBjYXB0dXJlQXJyYXk7XHJcbiAgICAgICAgY29uc3QgUkVHRVggPSAvTkFNRT1cIigoPzpcXFMrXFxzK1xcUyt8XFxTKykpXCIsQVVUTyg/Ol58XFxTK1xccyspKD86XnxcXFMrXFxzKykoaHR0cHM6XFwvXFwvdmlkZW8oXFxTKykubTN1OCkvZztcclxuICAgICAgICB3aGlsZSAoKGNhcHR1cmVBcnJheSA9IFJFR0VYLmV4ZWModGV4dCkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHF1YWxpdHlVcmxTcGxpdC5wdXNoKHsgcXVhbGl0eTogY2FwdHVyZUFycmF5WzFdLCB1cmw6IGNhcHR1cmVBcnJheVsyXSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2cocXVhbGl0eVVybFNwbGl0KTtcclxuICAgICAgICBjb25zdCBzdHJlYW1MaXN0ID0geyBzZXJ2ZXI6IHR5cGUsIHVybExpc3Q6IHF1YWxpdHlVcmxTcGxpdCwgc2lnOiBzaWcgfTtcclxuICAgICAgICB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0LnB1c2goc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgaWYgKCFzaWcpIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zaWduYXR1cmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBhc3luYyBzaWduYXR1cmUoKSB7XHJcbiAgICAgICAgY29uc3QgUkVHRVggPSAvdmlkZW8td2VhdmVyLiguKikuaGxzLnR0dm53Lm5ldFxcL3YxXFwvcGxheWxpc3RcXC8oLiopLm0zdTgkL2dtO1xyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0XHJcbiAgICAgICAgICAgIC5maWx0ZXIoKHgpID0+IHguc2lnID09IGZhbHNlKVxyXG4gICAgICAgICAgICAuZm9yRWFjaChhc3luYyAoeCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtYXRjaCA9IFJFR0VYLmV4ZWMoeC51cmxMaXN0WzBdLnVybCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhID0gYXdhaXQgZmV0Y2goXCJodHRwczovL2p1cHRlci5nYS9obHMvdjIvc2lnL1wiICsgbWF0Y2hbMl0gKyBcIi9cIiArIG1hdGNoWzFdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB4LnNpZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgZ2V0IFN0cmVhbVNlcnZlckxpc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0cmVhbVNlcnZlckxpc3Q7XHJcbiAgICB9XHJcbiAgICBhZGRQbGF5bGlzdChwbGF5bGlzdCkge1xyXG4gICAgICAgIGlmIChwbGF5bGlzdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBwbGF5bGlzdC50b1N0cmluZygpLnNwbGl0KC9bXFxyXFxuXS8pO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls0XSA9IGxpbmVzWzRdO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls1XSA9IGxpbmVzWzVdO1xyXG4gICAgICAgIC8vdGFrZSBhbGwgbTN1OSBjb250ZW50IHRvIHRoZSBwbGF5bGlzdCBhbmQgYnVpbGQgYSB2YXJpYmxlXHJcbiAgICAgICAgZm9yIChjb25zdCBpIGluIGxpbmVzKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5lc1tpXS5pbmNsdWRlcyhcIiNFWFRJTkZcIikgJiYgbGluZXNbaV0uaW5jbHVkZXMoXCIsbGl2ZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgLy90aW1lc3RhbXAgc2VxdWVuY2VcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcXVlbmNlVGltZXN0YW1wID0gTWF0aC5mbG9vcihuZXcgRGF0ZShsaW5lc1twYXJzZUludChpKSAtIDFdLnNsaWNlKGxpbmVzW3BhcnNlSW50KGkpIC0gMV0ubGVuZ3RoIC0gMjQsIGxpbmVzW3BhcnNlSW50KGkpIC0gMV0ubGVuZ3RoKSkuZ2V0VGltZSgpIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICAvL3NlbGVjdCBhbGwgc2VxdWVuY2UgdGhhdCBubyBleGlzdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuX3BsYXlsaXN0LmZpbHRlcigoeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWVzdGFtcCA+PSBzZXF1ZW5jZVRpbWVzdGFtcDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy9hZGQgdGhlIHNlcXVlbmNlIG9uIHBsYXlsaXN0IHZhcmlhYmxlIGlmIGl0IG5vIGV4aXN0XHJcbiAgICAgICAgICAgICAgICBpZiAoIXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSB0aGlzLl9zZXF1ZW5jZSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGxpbmVzW3BhcnNlSW50KGkpIC0gMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogc2VxdWVuY2VUaW1lc3RhbXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm86IGxpbmVzW3BhcnNlSW50KGkpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBsaW5lc1twYXJzZUludChpKSArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuX3BsYXlsaXN0Lmxlbmd0aCA+IDE1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hhbmdlZDtcclxuICAgIH1cclxuICAgIGdldEFsbFBsYXlsaXN0KCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5faGVhZGVyWzBdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclsxXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMl0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzNdICtcclxuICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzRdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls1XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5tYXAoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWUgKyBcIlxcblwiICsgeC5pbmZvICsgXCJcXG5cIiArIHgudXJsICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNFeFRMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZjM0pqTDBoTVV5NTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4TlFVRk5MRTlCUVU4c1IwRkJSenRKUVVGb1FqdFJRVU5WTEZsQlFVOHNSMEZCYTBJc1EwRkJReXhUUVVGVExFVkJRVVVzYTBKQlFXdENMRVZCUVVVc2VVSkJRWGxDTEVWQlFVVXNkMEpCUVhkQ0xFTkJRVU1zUTBGQlF6dFJRVU01Unl4alFVRlRMRWRCUVcxQ0xFVkJRVVVzUTBGQlF6dFJRVU12UWl4alFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRMlFzYzBKQlFXbENMRWRCUVcxQ0xFVkJRVVVzUTBGQlF6dEpRU3RIYWtRc1EwRkJRenRKUVRkSFF5eHZSRUZCYjBRN1NVRkRjRVFzUzBGQlN5eERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRlpMRVZCUVVVc1NVRkJTU3hIUVVGSExFOUJRVThzUlVGQlJTeEhRVUZITEVkQlFVY3NTMEZCU3p0UlFVTXpSQ3hOUVVGTkxHVkJRV1VzUjBGQmFVSXNSVUZCUlN4RFFVRkRPMUZCUTNwRExFbEJRVWtzV1VGQmIwTXNRMEZCUXp0UlFVVjZReXhOUVVGTkxFdEJRVXNzUjBGQlJ5eHhSa0ZCY1VZc1EwRkJRenRSUVVWd1J5eFBRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkpMRVZCUVVVN1dVRkRha1FzWlVGQlpTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRTlCUVU4c1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSMEZCUnl4RlFVRkZMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdVMEZETVVVN1VVRkRSQ3hQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEdWQlFXVXNRMEZCUXl4RFFVRkRPMUZCUXpkQ0xFMUJRVTBzVlVGQlZTeEhRVUZITEVWQlFVVXNUVUZCVFN4RlFVRkZMRWxCUVVrc1JVRkJSU3hQUVVGUExFVkJRVVVzWlVGQlpTeEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVONFJTeEpRVUZKTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMUZCUlhoRExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdXVUZEVWl4TlFVRk5MRWxCUVVrc1EwRkJReXhUUVVGVExFVkJRVVVzUTBGQlF6dFRRVU40UWp0UlFVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRE8wbEJRMlFzUTBGQlF6dEpRVVZFTEV0QlFVc3NRMEZCUXl4VFFVRlRPMUZCUTJJc1RVRkJUU3hMUVVGTExFZEJRVWNzTmtSQlFUWkVMRU5CUVVNN1VVRkZOVVVzVFVGQlRTeEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFTkJRelZDTEVsQlFVa3NRMEZCUXl4cFFrRkJhVUk3WVVGRGJrSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SlFVRkpMRXRCUVVzc1EwRkJRenRoUVVOc1F5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVUwc1JVRkJSU3hGUVVGRk8xbEJRM2hDTEUxQlFVMHNTMEZCU3l4SFFVRXlRaXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZEYmtVc1NVRkJTU3hMUVVGTExFVkJRVVU3WjBKQlExUXNTVUZCU1R0dlFrRkRSaXhOUVVGTkxFTkJRVU1zUjBGQlJ5eE5RVUZOTEV0QlFVc3NRMEZCUXl3clFrRkJLMElzUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1IwRkJSeXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0M1FrRkRha1lzVFVGQlRTeEZRVUZGTEV0QlFVczdjVUpCUTJRc1EwRkJReXhEUVVGRE8yOUNRVU5JTEVOQlFVTXNRMEZCUXl4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRE8yOUNRVU5pTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRwUWtGRFpqdG5Ra0ZCUXl4TlFVRk5PMjlDUVVOT0xFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0cFFrRkRhRUk3WVVGRFJqdHBRa0ZCVFR0blFrRkRUQ3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdZVUZEYUVJN1VVRkRTQ3hEUVVGRExFTkJRVU1zUTBGRFRDeERRVUZETzBsQlEwb3NRMEZCUXp0SlFVVkVMRWxCUVVrc1owSkJRV2RDTzFGQlEyeENMRTlCUVU4c1NVRkJTU3hEUVVGRExHbENRVUZwUWl4RFFVRkRPMGxCUTJoRExFTkJRVU03U1VGRlJDeFhRVUZYTEVOQlFVTXNVVUZCWjBJN1VVRkRNVUlzU1VGQlNTeFJRVUZSTEV0QlFVc3NTVUZCU1N4RlFVRkZPMWxCUTNKQ0xFOUJRVThzUzBGQlN5eERRVUZETzFOQlEyUTdVVUZGUkN4SlFVRkpMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU03VVVGRmNFSXNUVUZCVFN4TFFVRkxMRWRCUVVjc1VVRkJVU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVOc1JDeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTXpRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVVV6UWl3eVJFRkJNa1E3VVVGRE0wUXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExFVkJRVVU3V1VGRGNrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVN1owSkJRemxFTEc5Q1FVRnZRanRuUWtGRGNFSXNUVUZCVFN4cFFrRkJhVUlzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkhMRVZCUVVVc1JVRkJSU3hMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlJXcExMRzFEUVVGdFF6dG5Ra0ZEYmtNc1RVRkJUU3hEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJUdHZRa0ZEY0VNc1QwRkJUeXhEUVVGRExFTkJRVU1zVTBGQlV5eEpRVUZKTEdsQ1FVRnBRaXhEUVVGRE8yZENRVU14UXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRFNDeHpSRUZCYzBRN1owSkJRM1JFTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRk8yOUNRVU5pTEVsQlFVa3NRMEZCUXl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eERRVUZETEVOQlFVTTdiMEpCUTNCRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRPM2RDUVVOc1FpeEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdkMEpCUXpWQ0xGTkJRVk1zUlVGQlJTeHBRa0ZCYVVJN2QwSkJRelZDTEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTjRRaXhIUVVGSExFVkJRVVVzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03Y1VKQlF6VkNMRU5CUVVNc1EwRkJRenR2UWtGRFNDeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmxDUVVOb1FqdG5Ra0ZEUkN4UFFVRlBMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zVFVGQlRTeEhRVUZITEVWQlFVVXNSVUZCUlR0dlFrRkRha01zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRwUWtGRGVFSTdZVUZEUmp0VFFVTkdPMUZCUTBRc1QwRkJUeXhQUVVGUExFTkJRVU03U1VGRGFrSXNRMEZCUXp0SlFVVkVMR05CUVdNN1VVRkRXaXhQUVVGUExFTkJRMHdzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSkxFTkJRVU1zVTBGQlV6dFpRVU5rTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZPMmRDUVVOMlFpeFBRVUZQTEVOQlFVTXNRMEZCUXl4SlFVRkpMRWRCUVVjc1NVRkJTU3hIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETzFsQlEzUkVMRU5CUVVNc1EwRkJReXhEUVVOSUxFTkJRVU03U1VGRFNpeERRVUZETzBOQlEwWWlmUT09IiwiZXhwb3J0IGZ1bmN0aW9uIGN1cnJlbnQoY2hhbm5lbCA9IG51bGwpIHtcclxuICAgIGlmIChjaGFubmVsKSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gY2hhbm5lbCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZ2xvYmFsLmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBnbG9iYWwuYWN0dWFsQ2hhbm5lbCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWTNWeWNtVnVkQzVqYUdGdWJtVnNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyTm9ZVzV1Wld3dlkzVnljbVZ1ZEM1amFHRnVibVZzTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1ZVRkJWU3hQUVVGUExFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVazdTVUZEY0VNc1NVRkJTU3hQUVVGUExFVkJRVVU3VVVGRFdDeFBRVUZQTEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExFOUJRVThzUTBGQlF5eERRVUZETzB0QlEzWkVPMU5CUVUwN1VVRkRUQ3hQUVVGUExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRTFCUVUwc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF6dExRVU53UlR0QlFVTklMRU5CUVVNaWZRPT0iLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gb25TdGFydChfd2luZG93LCB1cmwsIHRleHQgLyogaXNPZmZsaW5lID0gZmFsc2UgKi8pIHtcclxuICAgIGNvbnN0IHJlZ2V4ID0gL2hsc1xcLyguKikubTN1OC9nbTtcclxuICAgIGNvbnN0IG1hdGNoID0gcmVnZXguZXhlYyh1cmwpIHx8IFtdO1xyXG4gICAgbGV0IGV4aXN0ZW50ID0gZmFsc2U7XHJcbiAgICBpZiAobWF0Y2hbMV0pIHtcclxuICAgICAgICBpZiAoZ2xvYmFsLndoaXRlbGlzdCA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZ2xvYmFsLndoaXRlbGlzdCA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBnbG9iYWwuYWN0dWFsQ2hhbm5lbCA9IG1hdGNoWzFdO1xyXG4gICAgICAgIGlmIChnbG9iYWwud2hpdGVsaXN0LmluY2x1ZGVzKG1hdGNoWzFdKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghX3dpbmRvdy5jaGFubmVsLmZpbmQoKGMpID0+IGMubmFtZSA9PT0gbWF0Y2hbMV0pKSB7XHJcbiAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJDaGFubmVsOiBcIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgX3dpbmRvdy5jaGFubmVsLnB1c2goeyBuYW1lOiBtYXRjaFsxXSwgZmxvd1NpZzogW10sIGhsczogbmV3IF93aW5kb3cuSExTKCkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXhpc3Q6IFwiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICBleGlzdGVudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIF93aW5kb3cuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICBnbG9iYWwuY3VycmVudENoYW5uZWwobWF0Y2hbMV0pLmhscy5hZGRTdHJlYW1MaW5rKHRleHQpO1xyXG4gICAgX3dpbmRvdy5Mb2dQcmludChcIkxvY2FsIFNlcnZlcjogT0tcIik7XHJcbiAgICBpZiAoZXhpc3RlbnQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIGF3YWl0IGdsb2JhbC5uZXdQaWN0dXJlKGdsb2JhbC5hY3R1YWxDaGFubmVsKS50aGVuKCh0ZXh0UGljdHVyZSkgPT4ge1xyXG4gICAgICAgIGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dFBpY3R1cmUsIFwicGljdHVyZVwiLCB0cnVlKTtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXIgNDgwcDogT0tcIik7XHJcbiAgICB9KTtcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICBpZiAoIWdsb2JhbC5pc1Byb3h5QXV0aClcclxuICAgICAgICByZXR1cm47XHJcbiAgICBnbG9iYWwubmV3RXh0ZXJuYWwoZ2xvYmFsLmFjdHVhbENoYW5uZWwpLnRoZW4oKHRleHQpID0+IGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dCwgXCJwcm94eVwiLCB0cnVlKSk7XHJcbiAgICByZXR1cm47XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHF1YWxpdHlVcmxTcGxpdCA9IHRleHQuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgIGNvbnN0IHNlcnZlciA9IHF1YWxpdHlVcmxTcGxpdC5zaGlmdCgpO1xyXG4gICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSB7IHNlcnZlcjogXCJwcm94eVwiLCB1cmxMaXN0OiBbXSB9O1xyXG4gICAgICAgIHF1YWxpdHlVcmxTcGxpdC5mb3JFYWNoKChlbGVtZW50LCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKCEoaW5kZXggJSAyKSkge1xyXG4gICAgICAgICAgICAgICAgc3RyZWFtTGlzdC51cmxMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6IHN0cmVhbUxpc3QudXJsTGlzdC5zb21lKCh4KSA9PiB4LnF1YWxpdHkgPT0gZWxlbWVudCkgPyBlbGVtZW50ICsgXCJwMzBcIiA6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vdmlkZW8td2VhdmVyLlwiICsgc2VydmVyICsgXCIuaGxzLnR0dm53Lm5ldC92MS9wbGF5bGlzdC9cIiArIGFycmF5W2luZGV4ICsgMV0gKyBcIi5tM3U4XCIsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgX3dpbmRvdy5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gbWF0Y2hbMV0pLmhscy5hZGQoc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogT0tcIik7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoZSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYjI0dVkyaGhibTVsYkM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTlqYUdGdWJtVnNMMjl1TG1Ob1lXNXVaV3d1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hQUVVGUExFTkJRVU1zVDBGQlR5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SlFVRkpMRU5CUVVNc2RVSkJRWFZDTzBsQlEzUkZMRTFCUVUwc1MwRkJTeXhIUVVGSExHdENRVUZyUWl4RFFVRkRPMGxCUTJwRExFMUJRVTBzUzBGQlN5eEhRVUY1UWl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0SlFVTXhSQ3hKUVVGSkxGRkJRVkVzUjBGQlJ5eExRVUZMTEVOQlFVTTdTVUZGY2tJc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVTdVVUZEV2l4SlFVRkhMRTFCUVUwc1EwRkJReXhUUVVGVExFbEJRVWtzVTBGQlV5eEZRVUZETzFsQlF5OUNMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzUlVGQlJTeERRVUZETzFOQlEzWkNPMUZCUTBRc1RVRkJUU3hEUVVGRExHRkJRV0VzUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRhRU1zU1VGQlNTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0WlFVTjJReXhQUVVGUE8xTkJRMUk3VVVGRlJDeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFdEJRVXNzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVN1dVRkRja1FzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4WFFVRlhMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEZWtNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEU5QlFVOHNSVUZCUlN4RlFVRkZMRVZCUVVVc1IwRkJSeXhGUVVGRkxFbEJRVWtzVDBGQlR5eERRVUZETEVkQlFVY3NSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRUUVVNdlJUdGhRVUZOTzFsQlEwd3NUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhUUVVGVExFZEJRVWNzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRka01zVVVGQlVTeEhRVUZITEVsQlFVa3NRMEZCUXp0VFFVTnFRanRMUVVOR08wbEJRMFFzWjBSQlFXZEVPMGxCUldoRUxHZEVRVUZuUkR0SlFVTm9SQ3hQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEhWQ1FVRjFRaXhEUVVGRExFTkJRVU03U1VGRE1VTXNUVUZCVFN4RFFVRkRMR05CUVdNc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBsQlEzaEVMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1EwRkJRenRKUVVWeVF5eEpRVUZKTEZGQlFWRTdVVUZCUlN4UFFVRlBPMGxCUlhKQ0xHZEVRVUZuUkR0SlFVVm9SQ3huUkVGQlowUTdTVUZEYUVRc1RVRkJUU3hOUVVGTkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eFhRVUZYTEVWQlFVVXNSVUZCUlR0UlFVTnFSU3hOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eGhRVUZoTEVOQlFVTXNWMEZCVnl4RlFVRkZMRk5CUVZNc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU5vUml4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExIVkNRVUYxUWl4RFFVRkRMRU5CUVVNN1NVRkRNME1zUTBGQlF5eERRVUZETEVOQlFVTTdTVUZGU0N4blJFRkJaMFE3U1VGRmFFUXNaMFJCUVdkRU8wbEJSV2hFTEVsQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1YwRkJWenRSUVVGRkxFOUJRVTg3U1VGREwwSXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhOUVVGTkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNZMEZCWXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFOUJRVThzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUldoSkxFOUJRVTg3U1VGRlVDeEpRVUZKTzFGQlEwWXNUVUZCVFN4bFFVRmxMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTjRReXhOUVVGTkxFMUJRVTBzUjBGQlJ5eGxRVUZsTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1VVRkZka01zVFVGQlRTeFZRVUZWTEVkQlFXVXNSVUZCUlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhGUVVGRkxFOUJRVThzUlVGQlJTeEZRVUZGTEVWQlFVVXNRMEZCUXp0UlFVTm9SU3hsUVVGbExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFVkJRVVVzUlVGQlJUdFpRVU5vUkN4SlFVRkpMRU5CUVVNc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVTdaMEpCUTJoQ0xGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRPMjlDUVVOMFFpeFBRVUZQTEVWQlFVVXNWVUZCVlN4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVODdiMEpCUTNwR0xFZEJRVWNzUlVGQlJTeDFRa0ZCZFVJc1IwRkJSeXhOUVVGTkxFZEJRVWNzTmtKQlFUWkNMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4UFFVRlBPMmxDUVVOdVJ5eERRVUZETEVOQlFVTTdZVUZEU2p0UlFVTklMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJSVWdzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVNM1FpeFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzFGQlJYSkZMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1EwRkJRenRMUVVONlF6dEpRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPMUZCUTFZc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0TFFVTnlRanRCUVVOSUxFTkJRVU1pZlE9PSIsIi8vZXh0ZXJuYWwgcmVxdWVzdCB0aHJvdWhnIHB1cnBsZSBzZXJ2ZXJcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4dGVybmFsKGNoYW5uZWxOYW1lKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2goXCJodHRwczovL1wiICsgZ2xvYmFsLnR1bm5lbFswXSArIFwiL2NoYW5uZWwvXCIgKyBjaGFubmVsTmFtZSk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXJ2ZXIgcHJveHkgcmV0dXJuIGVycm9yIG9yIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJFeHRlcm5hbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoZSk7XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWlhoMFpYSnVZV3d1Wm1WMFkyZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdlptVjBZMmd2WlhoMFpYSnVZV3d1Wm1WMFkyZ3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc2QwTkJRWGRETzBGQlEzaERMRTFCUVUwc1EwRkJReXhMUVVGTExGVkJRVlVzVVVGQlVTeERRVUZETEZkQlFXMUNPMGxCUTJoRUxFbEJRVWs3VVVGRFJpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMREJDUVVFd1FpeERRVUZETEVOQlFVTTdVVUZETlVNc1RVRkJUU3hSUVVGUkxFZEJRV0VzVFVGQlRTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRlZCUVZVc1IwRkJSeXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkpMRmRCUVZjc1IwRkJSeXhYUVVGWExFTkJRVU1zUTBGQlF6dFJRVVU1Unl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUlVGQlJUdFpRVU5vUWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExIZERRVUYzUXl4RFFVRkRMRU5CUVVNN1UwRkRNMFE3VVVGRlJDeE5RVUZOTEVsQlFVa3NSMEZCVnl4TlFVRk5MRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVVV6UXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExIRkNRVUZ4UWl4RFFVRkRMRU5CUVVNN1VVRkZka01zVDBGQlR5eEpRVUZKTEVOQlFVTTdTMEZEWWp0SlFVRkRMRTlCUVU4c1EwRkJReXhGUVVGRk8xRkJRMVlzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOdVFpeFBRVUZQTEVWQlFVVXNRMEZCUXp0TFFVTllPMEZCUTBnc1EwRkJReUo5IiwiZXhwb3J0IGZ1bmN0aW9uIGluZmxhdGVGZXRjaChfd2luZG93KSB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZ2xvYmFsLWFzc2lnblxyXG4gICAgX3dpbmRvdy5mZXRjaCA9IGFzeW5jIGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHVybCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBpZiAodXJsLmVuZHNXaXRoKFwibTN1OFwiKSAmJiB1cmwuaW5jbHVkZXMoXCJ0dHZudy5uZXRcIikgJiYgIV93aW5kb3cud2hpdGVsaXN0LmluY2x1ZGVzKF93aW5kb3cuYWN0dWFsQ2hhbm5lbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb2Nlc3NGZXRjaCA9IGFzeW5jIGZ1bmN0aW9uICh1cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF93aW5kb3cucmVhbEZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfd2luZG93Lm9uRmV0Y2goX3dpbmRvdywgdGV4dCwgdXJsKS50aGVuKGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWxpc3QgPSBnbG9iYWwuY3VycmVudENoYW5uZWwoKS5obHMuZ2V0QWxsUGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHBsYXlsaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRmV0Y2godXJsKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoXCJ1c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiKSAmJiAhdXJsLmluY2x1ZGVzKFwicGljdHVyZS1ieS1waWN0dXJlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzRmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF93aW5kb3cucmVhbEZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGFzeW5jIGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF93aW5kb3cub25TdGFydENoYW5uZWwoX3dpbmRvdywgdXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UodGV4dCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcImNoYW5uZWwgb2ZmbGluZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRmV0Y2godXJsKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIikpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3dpbmRvdy5yZWFsRmV0Y2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWm1WMFkyZ3VhVzVtYkdGMFpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5bVpYUmphQzltWlhSamFDNXBibVpzWVhSbExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEUxQlFVMHNWVUZCVlN4WlFVRlpMRU5CUVVNc1QwRkJUenRKUVVOc1F5dzBRMEZCTkVNN1NVRkROVU1zVDBGQlR5eERRVUZETEV0QlFVc3NSMEZCUnl4TFFVRkxMRmRCUVZjc1IwRkJSeXhGUVVGRkxFOUJRVTg3VVVGRE1VTXNTVUZCU1N4UFFVRlBMRWRCUVVjc1MwRkJTeXhSUVVGUkxFVkJRVVU3V1VGRE0wSXNTVUZCU1N4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zWVVGQllTeERRVUZETEVWQlFVVTdaMEpCUXpOSExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNWVUZCVlN4UFFVRlBMRVZCUVVVc1RVRkJUVHR2UWtGRE1VTXNTVUZCU1N4WlFVRlpMRWRCUVVjc1MwRkJTeXhYUVVGWExFZEJRVWM3ZDBKQlEzQkRMRWxCUVVrN05FSkJRMFlzVFVGQlRTeFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4UlFVRlJPMmREUVVNelJDeFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzU1VGQlNUdHZRMEZEYWtNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTTdkME5CUTJ4RUxFbEJRVWtzVVVGQlVTeEhRVUZITEUxQlFVMHNRMEZCUXl4alFVRmpMRVZCUVVVc1EwRkJReXhIUVVGSExFTkJRVU1zWTBGQll5eEZRVUZGTEVOQlFVTTdkME5CUXpWRUxFOUJRVThzUTBGQlF5eEpRVUZKTEZGQlFWRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRE8yOURRVU5zUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUTBGRFRDeERRVUZETEVOQlFVTXNRMEZCUXpzMFFrRkRUQ3hEUVVGRExFTkJRVU1zUTBGQlF6dDVRa0ZEU2p0M1FrRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUczBRa0ZEVml4UFFVRlBMRU5CUVVNc1NVRkJTU3hSUVVGUkxFVkJRVVVzUTBGQlF5eERRVUZETzNsQ1FVTjZRanR2UWtGRFNDeERRVUZETEVOQlFVTTdiMEpCUTBZc1dVRkJXU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJkQ1FVTndRaXhEUVVGRExFTkJRVU1zUTBGQlF6dGhRVU5LTzFsQlJVUXNTVUZCU1N4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExHdERRVUZyUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEc5Q1FVRnZRaXhEUVVGRExFVkJRVVU3WjBKQlF6TkdMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zVlVGQlZTeFBRVUZQTEVWQlFVVXNUVUZCVFR0dlFrRkRNVU1zU1VGQlNTeFpRVUZaTEVkQlFVY3NTMEZCU3l4WFFVRlhMRWRCUVVjN2QwSkJRM0JETEUxQlFVMHNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1VVRkJVVHMwUWtGRE0wUXNTVUZCU1N4UlFVRlJMRU5CUVVNc1JVRkJSU3hGUVVGRk8yZERRVU5tTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eFhRVUZYTEVsQlFVazdiME5CUTNaRExFMUJRVTBzVDBGQlR5eERRVUZETEdOQlFXTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1IwRkJSeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzI5RFFVTnFSQ3hQUVVGUExFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRuUTBGRE9VSXNRMEZCUXl4RFFVRkRMRU5CUVVNN05rSkJRMG83YVVOQlFVMDdaME5CUTB3c1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzJkRFFVTnNRaXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFTkJRVU03TmtKQlEzSkRPM2RDUVVOSUxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTk1MRU5CUVVNc1EwRkJRenR2UWtGRFJpeFpRVUZaTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1owSkJRM0JDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMkZCUTBvN1dVRkZSQ3hKUVVGSkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNiMEpCUVc5Q0xFTkJRVU1zUlVGQlJUdGhRVU4yUXp0VFFVTkdPMUZCUlVRc1QwRkJUeXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU03U1VGRGJFUXNRMEZCUXl4RFFVRkRPMEZCUTBvc1EwRkJReUo5IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uKF93aW5kb3csIHJlc3BvbnNlLCB1cmwpIHtcclxuICAgIC8vICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuNSApe1xyXG4gICAgLy8gICAgICByZXNwb25zZSArPSBcInR3aXRjaC1jbGllbnQtYWRcIjtcclxuICAgIC8vICB9XHJcbiAgICBjb25zdCBjaGFubmVsQ3VycmVudCA9IGF3YWl0IGdsb2JhbC5jdXJyZW50Q2hhbm5lbCgpO1xyXG4gICAgLy9pZiBhZHMgZmluZCBvbiBtYWluIGxpbmsgY2FsbGVkIGZyb20gdHdpdGNoIGFwaSBwbGF5ZXJcclxuICAgIGlmIChnbG9iYWwuaXNBZHMocmVzcG9uc2UpKSB7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiYWRzIGZvdW5kXCIpO1xyXG4gICAgICAgIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXNwb25zZSk7XHJcbiAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgdHlwZTogXCJnZXRRdWFsaXR5XCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwicmVsb2FkXCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHF1YWxpdHkgPSBnbG9iYWwucXVhbGl0eTtcclxuICAgICAgICBjb25zdCBTdHJlYW1TZXJ2ZXJMaXN0ID0gY2hhbm5lbEN1cnJlbnQuaGxzLlN0cmVhbVNlcnZlckxpc3Q7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KHF1YWxpdHkpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vdHJ5IGFsbCBobHMgc2lncyB0aGF0IGhhdmUgb24gU3RyZWFtU2VydmVyTGlzdCBmcm9tIEhMUyBcclxuICAgICAgICAgICAgaWYgKFN0cmVhbVNlcnZlckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJveHkgPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbmQoKHgpID0+IHguc2VydmVyID09IFwicHJveHlcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByb3h5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHByb3h5LnVybExpc3QuZmluZCgoYSkgPT4gYS5xdWFsaXR5ID09IHF1YWxpdHkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmV0dXJubzIgPSBhd2FpdCBnbG9iYWwucmVhbEZldGNoKHVybC51cmwpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJldHVybm9UZXh0ID0gYXdhaXQgcmV0dXJubzIudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5pc0FkcyhyZXR1cm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJhZHMgb24gcHJveHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmV0dXJub1RleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZ2VyYSBlcnJvIHNlIG5hbyB0aXZlciBsaW5rXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG0zdTggdmFsaWQgdXJsIGZvdW5kIG9uIFN0cmVhbVNlcnZlckxpc3RcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIC8vaWYgbm90aGluZyByZXNvbHZlLCByZXR1cm4gNDgwcCBmbG93XHJcbiAgICAgICAgICAgIGNvbnN0IHBpY3R1cmVTdHJlYW0gPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbHRlcigoeCkgPT4geC5zZXJ2ZXIgPT0gXCJwaWN0dXJlXCIpLm1hcCgoeCkgPT4geC51cmxMaXN0LmZpbmQoKHgpID0+IHgucXVhbGl0eS5pbmNsdWRlcyhcIjQ4MFwiKSkpWzBdLnVybDtcclxuICAgICAgICAgICAgY29uc3QgcmV0dXJubyA9IGF3YWl0IChhd2FpdCBnbG9iYWwucmVhbEZldGNoKHBpY3R1cmVTdHJlYW0pKS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGlmIChjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmV0dXJubykpIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIjQ4MHBcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY2hhbm5lbEN1cnJlbnQuaGxzLmFkZFBsYXlsaXN0KHJlc3BvbnNlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liMjR1Wm1WMFkyZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdlptVjBZMmd2YjI0dVptVjBZMmd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hGUVVGRkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4SFFVRkhPMGxCUXpkRExEaENRVUU0UWp0SlFVTTVRaXgxUTBGQmRVTTdTVUZEZGtNc1MwRkJTenRKUVVWTUxFMUJRVTBzWTBGQll5eEhRVUZITEUxQlFVMHNUVUZCVFN4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRE8wbEJSWEpFTEhkRVFVRjNSRHRKUVVONFJDeEpRVUZKTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVU3VVVGRk1VSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dFJRVVUzUWl4alFVRmpMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0UlFVVjZReXhOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETzFsQlEycENMRWxCUVVrc1JVRkJSU3haUVVGWk8xbEJRMnhDTEV0QlFVc3NSVUZCUlN4SlFVRkpPMU5CUTFvc1EwRkJReXhEUVVGRE8xRkJSVWdzVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXp0WlFVTnFRaXhKUVVGSkxFVkJRVVVzVVVGQlVUdFpRVU5rTEV0QlFVc3NSVUZCUlN4SlFVRkpPMU5CUTFvc1EwRkJReXhEUVVGRE8xRkJSVWdzVFVGQlRTeFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJRenRSUVVNdlFpeE5RVUZOTEdkQ1FVRm5RaXhIUVVGSExHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03VVVGRk4wUXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFJRVVY2UWl4SlFVRkpPMWxCUTBZc01FUkJRVEJFTzFsQlF6RkVMRWxCUVVrc1owSkJRV2RDTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1JVRkJSVHRuUWtGREwwSXNUVUZCVFN4TFFVRkxMRWRCUVRKQ0xHZENRVUZuUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF6dG5Ra0ZGZUVZc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJUdHZRa0ZEVml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN2FVSkJRMmhGTzJkQ1FVVkVMRTFCUVUwc1IwRkJSeXhIUVVFeVFpeExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF6dG5Ra0ZGY0VZc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJUdHZRa0ZEVWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN2FVSkJRMmhGTzJkQ1FVVkVMRTFCUVUwc1VVRkJVU3hIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WjBKQlEycEVMRWxCUVVrc1YwRkJWeXhIUVVGSExFMUJRVTBzVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMmRDUVVWNFF5eEpRVUZKTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1YwRkJWeXhEUVVGRExFVkJRVVU3YjBKQlF6ZENMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zWTBGQll5eERRVUZETEVOQlFVTTdiMEpCUTJoRExFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNOa05CUVRaRExFTkJRVU1zUTBGQlF6dHBRa0ZEYUVVN1owSkJSVVFzVDBGQlR5eGpRVUZqTEVOQlFVTXNSMEZCUnl4RFFVRkRMRmRCUVZjc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dGhRVU53UkR0WlFVVkVMRFpDUVVFMlFqdFpRVU0zUWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN1UwRkRhRVU3VVVGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0WlFVTldMSE5EUVVGelF6dFpRVU4wUXl4TlFVRk5MR0ZCUVdFc1IwRkJSeXhuUWtGQlowSXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWxCUVVrc1UwRkJVeXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkRjRVlzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlEycEVMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETzFsQlJWUXNUVUZCVFN4UFFVRlBMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFsQlJYSkZMRWxCUVVrc1kwRkJZeXhEUVVGRExFZEJRVWNzUTBGQlF5eFhRVUZYTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVN1owSkJRek5ETEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03WVVGRGVrSTdXVUZEUkN4UFFVRlBMRWxCUVVrc1EwRkJRenRUUVVOaU8wdEJRMFk3VTBGQlRUdFJRVU5NTEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1YwRkJWeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFGQlEzcERMRTlCUVU4c1NVRkJTU3hEUVVGRE8wdEJRMkk3UVVGRFNDeERRVUZESW4wPSIsImV4cG9ydCBhc3luYyBmdW5jdGlvbiBwaWN0dXJlKGNoYW5uZWxOYW1lKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGdxbCA9IGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2goXCJodHRwczovL2dxbC50d2l0Y2gudHYvZ3FsXCIsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVyczogeyBcIkNsaWVudC1JRFwiOiBcImtpbW5lNzhreDNuY3g2YnJnbzRtdjZ3a2k1aDFrb1wiIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IGB7XCJvcGVyYXRpb25OYW1lXCI6XCJQbGF5YmFja0FjY2Vzc1Rva2VuXCIsXCJ2YXJpYWJsZXNcIjp7XCJpc0xpdmVcIjp0cnVlLFwibG9naW5cIjpcIiR7Y2hhbm5lbE5hbWV9XCIsXCJpc1ZvZFwiOmZhbHNlLFwidm9kSURcIjpcIlwiLFwicGxheWVyVHlwZVwiOlwidGh1bmRlcmRvbWVcIn0sXCJleHRlbnNpb25zXCI6e1wicGVyc2lzdGVkUXVlcnlcIjp7XCJ2ZXJzaW9uXCI6MSxcInNoYTI1Nkhhc2hcIjpcIjA4MjgxMTlkZWQxYzEzNDc3OTY2NDM0ZTE1ODAwZmY1N2RkYWNmMTNiYTE5MTFjMTI5ZGMyMjAwNzA1YjA3MTJcIn19fWAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgZ3FsLmpzb24oKTtcclxuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vdXNoZXIudHR2bncubmV0L2FwaS9jaGFubmVsL2hscy9cIiArXHJcbiAgICAgICAgICAgIGNoYW5uZWxOYW1lICtcclxuICAgICAgICAgICAgXCIubTN1OD9hbGxvd19zb3VyY2U9dHJ1ZSZmYXN0X2JyZWFkPXRydWUmcD1cIiArXHJcbiAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDFlNykgK1xyXG4gICAgICAgICAgICBcIiZwbGF5ZXJfYmFja2VuZD1tZWRpYXBsYXllciZwbGF5bGlzdF9pbmNsdWRlX2ZyYW1lcmF0ZT10cnVlJnJlYXNzaWdubWVudHNfc3VwcG9ydGVkPWZhbHNlJnNpZz1cIiArXHJcbiAgICAgICAgICAgIHN0YXR1c1tcImRhdGFcIl1bXCJzdHJlYW1QbGF5YmFja0FjY2Vzc1Rva2VuXCJdW1wic2lnbmF0dXJlXCJdICtcclxuICAgICAgICAgICAgXCImc3VwcG9ydGVkX2NvZGVjcz1hdmMxJnRva2VuPVwiICtcclxuICAgICAgICAgICAgc3RhdHVzW1wiZGF0YVwiXVtcInN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW5cIl1bXCJ2YWx1ZVwiXTtcclxuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgKGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2godXJsKSkudGV4dCgpO1xyXG4gICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljR2xqZEhWeVpTNW1aWFJqYUM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTltWlhSamFDOXdhV04wZFhKbExtWmxkR05vTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1EwRkJReXhMUVVGTExGVkJRVlVzVDBGQlR5eERRVUZETEZkQlFXMUNPMGxCUXk5RExFbEJRVWs3VVVGRFJpeE5RVUZOTEVkQlFVY3NSMEZCUnl4TlFVRk5MRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zTWtKQlFUSkNMRVZCUVVVN1dVRkRPVVFzVFVGQlRTeEZRVUZGTEUxQlFVMDdXVUZEWkN4UFFVRlBMRVZCUVVVc1JVRkJSU3hYUVVGWExFVkJRVVVzWjBOQlFXZERMRVZCUVVVN1dVRkRNVVFzU1VGQlNTeEZRVUZGTERoRlFVRTRSU3hYUVVGWExIVk1RVUYxVER0VFFVTjJVaXhEUVVGRExFTkJRVU03VVVGRlNDeE5RVUZOTEUxQlFVMHNSMEZCVnl4TlFVRk5MRWRCUVVjc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVVY0UXl4TlFVRk5MRWRCUVVjc1IwRkRVQ3d3UTBGQk1FTTdXVUZETVVNc1YwRkJWenRaUVVOWUxEUkRRVUUwUXp0WlFVTTFReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1IwRkJSeXhIUVVGSExFTkJRVU03V1VGREwwSXNaMGRCUVdkSE8xbEJRMmhITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXd5UWtGQk1rSXNRMEZCUXl4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVONFJDd3JRa0ZCSzBJN1dVRkRMMElzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMREpDUVVFeVFpeERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1VVRkZka1FzVFVGQlRTeEpRVUZKTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xRkJRM2hFTEU5QlFVOHNTVUZCU1N4RFFVRkRPMHRCUTJJN1NVRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdFJRVU5XTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UzBGRGFFSTdRVUZEU0N4RFFVRkRJbjA9IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGluZmxhdGVGZXRjaCB9IGZyb20gXCIuL2ZldGNoL2ZldGNoLmluZmxhdGVcIjtcclxuaW1wb3J0IHsgSExTIH0gZnJvbSBcIi4vSExTXCI7XHJcbmltcG9ydCB7IG9uU3RhcnQgfSBmcm9tIFwiLi9jaGFubmVsL29uLmNoYW5uZWxcIjtcclxuaW1wb3J0IHsgb24gfSBmcm9tIFwiLi9mZXRjaC9vbi5mZXRjaFwiO1xyXG5pbXBvcnQgeyBjdXJyZW50IH0gZnJvbSBcIi4vY2hhbm5lbC9jdXJyZW50LmNoYW5uZWxcIjtcclxuaW1wb3J0IHsgcGljdHVyZSB9IGZyb20gXCIuL2ZldGNoL3BpY3R1cmUuZmV0Y2hcIjtcclxuaW1wb3J0IHsgZXh0ZXJuYWwgfSBmcm9tIFwiLi9mZXRjaC9leHRlcm5hbC5mZXRjaFwiO1xyXG5leHBvcnQgZnVuY3Rpb24gYXBwKHNjb3BlKSB7XHJcbiAgICBzY29wZS5Mb2dQcmludCA9ICh4KSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJbUHVycGxlXTogXCIsIHgpO1xyXG4gICAgfTtcclxuICAgIHNjb3BlLmlzQWRzID0gKHgpID0+IHtcclxuICAgICAgICByZXR1cm4geC50b1N0cmluZygpLmluY2x1ZGVzKFwic3RpdGNoZWQtYWRcIikgfHwgeC50b1N0cmluZygpLmluY2x1ZGVzKFwidHdpdGNoLWNsaWVudC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtYWQtcXVhcnRpbGVcIik7XHJcbiAgICB9O1xyXG4gICAgc2NvcGUucmVhbEZldGNoID0gZmV0Y2g7XHJcbiAgICBzY29wZS5pc1Byb3h5QXV0aCA9IGZhbHNlO1xyXG4gICAgc2NvcGUucXVhbGl0eSA9IFwiXCI7XHJcbiAgICBzY29wZS53aGl0ZWxpc3QgPSBbXTtcclxuICAgIGdsb2JhbC53aGl0ZWxpc3QgPSBbXTtcclxuICAgIC8vcmVjZWl2ZSBtZXNzYWdlIGZyb20gd2luZG93XHJcbiAgICBzY29wZS5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHN3aXRjaCAoZS5kYXRhLmZ1bmNOYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRRdWFsaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnF1YWxpdHkgPSBlLmRhdGEuYXJnc1swXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChlLmRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0U2V0dGluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5kYXRhLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUud2hpdGVsaXN0ID0gZS5kYXRhLnZhbHVlLndoaXRlTGlzdDtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5pc1Byb3h5QXV0aCA9IGUuZGF0YS52YWx1ZS50b2dnbGVQcm94eTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRRdWFsaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnF1YWxpdHkgPSBlLmRhdGEudmFsdWUubmFtZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzY29wZS5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogXCJpbml0XCIsXHJcbiAgICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICB9KTtcclxuICAgIHNjb3BlLmNvbWluZ0FkcyA9IGZhbHNlO1xyXG4gICAgc2NvcGUuY2hhbm5lbCA9IFtdO1xyXG4gICAgc2NvcGUuYWN0dWFsQ2hhbm5lbCA9IFwiXCI7XHJcbiAgICBzY29wZS5jdXJyZW50Q2hhbm5lbCA9IGN1cnJlbnQ7XHJcbiAgICBzY29wZS5uZXdQaWN0dXJlID0gcGljdHVyZTtcclxuICAgIHNjb3BlLm5ld0V4dGVybmFsID0gZXh0ZXJuYWw7XHJcbiAgICBzY29wZS50dW5uZWwgPSBbXCJldTEuanVwdGVyLmdhXCJdO1xyXG4gICAgc2NvcGUub25GZXRjaCA9IG9uO1xyXG4gICAgc2NvcGUub25TdGFydENoYW5uZWwgPSBvblN0YXJ0O1xyXG4gICAgc2NvcGUuSExTID0gSExTO1xyXG4gICAgaW5mbGF0ZUZldGNoKHNjb3BlKTtcclxufVxyXG5hcHAoc2VsZik7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZjM0pqTDJGd2NDNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4UFFVRlBMRVZCUVVVc1dVRkJXU3hGUVVGRkxFMUJRVTBzZFVKQlFYVkNMRU5CUVVNN1FVRkRja1FzVDBGQlR5eEZRVUZGTEVkQlFVY3NSVUZCUlN4TlFVRk5MRTlCUVU4c1EwRkJRenRCUVVNMVFpeFBRVUZQTEVWQlFVVXNUMEZCVHl4RlFVRkZMRTFCUVUwc2MwSkJRWE5DTEVOQlFVTTdRVUZETDBNc1QwRkJUeXhGUVVGRkxFVkJRVVVzUlVGQlJTeE5RVUZOTEd0Q1FVRnJRaXhEUVVGRE8wRkJRM1JETEU5QlFVOHNSVUZCUlN4UFFVRlBMRVZCUVVVc1RVRkJUU3d5UWtGQk1rSXNRMEZCUXp0QlFVTndSQ3hQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNkVUpCUVhWQ0xFTkJRVU03UVVGRGFFUXNUMEZCVHl4RlFVRkZMRkZCUVZFc1JVRkJSU3hOUVVGTkxIZENRVUYzUWl4RFFVRkRPMEZCUld4RUxFMUJRVTBzVlVGQlZTeEhRVUZITEVOQlFVTXNTMEZCVlR0SlFVTTFRaXhMUVVGTExFTkJRVU1zVVVGQlVTeEhRVUZITEVOQlFVTXNRMEZCVFN4RlFVRkZMRVZCUVVVN1VVRkRNVUlzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4WlFVRlpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03U1VGREwwSXNRMEZCUXl4RFFVRkRPMGxCUlVZc1MwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFWTXNSVUZCUlN4RlFVRkZPMUZCUXpGQ0xFOUJRVThzUTBGQlF5eERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4dlFrRkJiMElzUTBGQlF5eERRVUZETzBsQlF6RkpMRU5CUVVNc1EwRkJRenRKUVVWR0xFdEJRVXNzUTBGQlF5eFRRVUZUTEVkQlFVY3NTMEZCU3l4RFFVRkRPMGxCUTNoQ0xFdEJRVXNzUTBGQlF5eFhRVUZYTEVkQlFVY3NTMEZCU3l4RFFVRkRPMGxCUXpGQ0xFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTI1Q0xFdEJRVXNzUTBGQlF5eFRRVUZUTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTNKQ0xFMUJRVTBzUTBGQlF5eFRRVUZUTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUlhSQ0xEWkNRVUUyUWp0SlFVTTNRaXhMUVVGTExFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1UwRkJVeXhGUVVGRkxGVkJRVlVzUTBGQlF6dFJRVU16UXl4UlFVRlJMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeEZRVUZGTzFsQlEzWkNMRXRCUVVzc1dVRkJXU3hEUVVGRExFTkJRVU03WjBKQlEycENMRXRCUVVzc1EwRkJReXhQUVVGUExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETzJkQ1FVTndReXhOUVVGTk8yRkJRMUE3V1VGRFJDeFBRVUZQTEVOQlFVTXNRMEZCUXp0blFrRkRVQ3hOUVVGTk8yRkJRMUE3VTBGRFJqdFJRVVZFTEZGQlFWRXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVU3V1VGRGJrSXNTMEZCU3l4WlFVRlpMRU5CUVVNc1EwRkJRenRuUWtGRGFrSXNTVUZCU1N4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJUdHZRa0ZEYUVJc1MwRkJTeXhEUVVGRExGTkJRVk1zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhUUVVGVExFTkJRVU03YjBKQlEzcERMRXRCUVVzc1EwRkJReXhYUVVGWExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1YwRkJWeXhEUVVGRE8ybENRVU01UXp0blFrRkRSQ3hOUVVGTk8yRkJRMUE3V1VGRFJDeExRVUZMTEZsQlFWa3NRMEZCUXl4RFFVRkRPMmRDUVVOcVFpeExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXp0blFrRkRiRU1zVFVGQlRUdGhRVU5RTzFsQlEwUXNUMEZCVHl4RFFVRkRMRU5CUVVNN1owSkJRMUFzVFVGQlRUdGhRVU5RTzFOQlEwWTdTVUZEU0N4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVWSUxFdEJRVXNzUTBGQlF5eFhRVUZYTEVOQlFVTTdVVUZEYUVJc1NVRkJTU3hGUVVGRkxFMUJRVTA3VVVGRFdpeExRVUZMTEVWQlFVVXNTVUZCU1R0TFFVTmFMRU5CUVVNc1EwRkJRenRKUVVWSUxFdEJRVXNzUTBGQlF5eFRRVUZUTEVkQlFVY3NTMEZCU3l4RFFVRkRPMGxCUTNoQ0xFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTI1Q0xFdEJRVXNzUTBGQlF5eGhRVUZoTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTNwQ0xFdEJRVXNzUTBGQlF5eGpRVUZqTEVkQlFVY3NUMEZCVHl4RFFVRkRPMGxCUlM5Q0xFdEJRVXNzUTBGQlF5eFZRVUZWTEVkQlFVY3NUMEZCVHl4RFFVRkRPMGxCUXpOQ0xFdEJRVXNzUTBGQlF5eFhRVUZYTEVkQlFVY3NVVUZCVVN4RFFVRkRPMGxCUXpkQ0xFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4bFFVRmxMRU5CUVVNc1EwRkJRVHRKUVVWb1F5eExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRVZCUVVVc1EwRkJRenRKUVVOdVFpeExRVUZMTEVOQlFVTXNZMEZCWXl4SFFVRkhMRTlCUVU4c1EwRkJRenRKUVVVdlFpeExRVUZMTEVOQlFVTXNSMEZCUnl4SFFVRkhMRWRCUVVjc1EwRkJRenRKUVVWb1FpeFpRVUZaTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1FVRkRkRUlzUTBGQlF6dEJRVU5FTEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReUo5Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9