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
                    __webpack_require__.g.LogPrint(sequenceTimestamp);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0hMUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sR0FBRztJQUFoQjtRQUNVLFlBQU8sR0FBa0IsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUM5RyxjQUFTLEdBQW1CLEVBQUUsQ0FBQztRQUMvQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2Qsc0JBQWlCLEdBQW1CLEVBQUUsQ0FBQztJQWdIakQsQ0FBQztJQTlHQyxvREFBb0Q7SUFDcEQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBSSxHQUFHLE9BQU8sRUFBRSxHQUFHLEdBQUcsS0FBSztRQUMzRCxNQUFNLGVBQWUsR0FBaUIsRUFBRSxDQUFDO1FBQ3pDLElBQUksWUFBb0MsQ0FBQztRQUV6QyxNQUFNLEtBQUssR0FBRyxxRkFBcUYsQ0FBQztRQUVwRyxPQUFPLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDakQsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUU7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sVUFBVSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN4RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUixNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUN4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

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
        _window.actualChannel = match[1];
        if (_window.whitelist.includes(match[1])) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFubmVsL29uLmNoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsdUJBQXVCO0lBQ3RFLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDO0lBQ2pDLE1BQU0sS0FBSyxHQUF5QixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxRCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFFckIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDWixPQUFPLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3hDLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNyRCxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQy9FO2FBQU07WUFDTCxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMs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

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
    __webpack_require__.g.LogPrint("Sequence");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvb24uZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzdDLDhCQUE4QjtJQUM5Qix1Q0FBdUM7SUFDdkMsS0FBSztJQUVMLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3JELE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFNUIsd0RBQXdEO0lBQ3hELElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUUxQixNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdCLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFDakIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsS0FBSyxFQUFFLElBQUk7U0FDWixDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ2pCLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLElBQUk7U0FDWixDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQy9CLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUU3RCxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpCLElBQUk7WUFDRiwwREFBMEQ7WUFDMUQsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixNQUFNLEtBQUssR0FBMkIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDO2dCQUV4RixJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztpQkFDaEU7Z0JBRUQsTUFBTSxHQUFHLEdBQTJCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDO2dCQUVwRixJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztpQkFDaEU7Z0JBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakQsSUFBSSxXQUFXLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXhDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDN0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO2lCQUNoRTtnQkFFRCxPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3BEO1lBRUQsNkJBQTZCO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztTQUNoRTtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1Ysc0NBQXNDO1lBQ3RDLE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUNwRixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFFVCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFckUsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDM0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN6QjtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtTQUFNO1FBQ0wsY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsT0FBTyxJQUFJLENBQUM7S0FDYjtBQUNILENBQUMifQ==

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBVTtJQUM1QixLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzFJLENBQUMsQ0FBQztJQUVGLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQzFCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBRXJCLDZCQUE2QjtJQUM3QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztRQUMzQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLEtBQUssWUFBWSxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxNQUFNO2FBQ1A7WUFDRCxPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNO2FBQ1A7U0FDRjtRQUVELFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDbkIsS0FBSyxZQUFZLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDaEIsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7b0JBQ3pDLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO2lCQUM5QztnQkFDRCxNQUFNO2FBQ1A7WUFDRCxLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNqQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDbEMsTUFBTTthQUNQO1lBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ1AsTUFBTTthQUNQO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDaEIsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsSUFBSTtLQUNaLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9CLEtBQUssQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzNCLEtBQUssQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO0lBQzdCLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUVoQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFLLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUUvQixLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUVoQixZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIsQ0FBQztBQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyJ9
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTnFEO0FBQ3pCO0FBQ21CO0FBQ1Q7QUFDYztBQUNKO0FBQ0U7QUFDM0M7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLDZEQUFPO0FBQ2xDLHVCQUF1Qix5REFBTztBQUM5Qix3QkFBd0IsMkRBQVE7QUFDaEM7QUFDQSxvQkFBb0IsK0NBQUU7QUFDdEIsMkJBQTJCLHdEQUFPO0FBQ2xDLGdCQUFnQixxQ0FBRztBQUNuQixJQUFJLGtFQUFZO0FBQ2hCO0FBQ0E7QUFDQSwyQ0FBMkMsbXlGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL0hMUy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9jdXJyZW50LmNoYW5uZWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NoYW5uZWwvb24uY2hhbm5lbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL2ZldGNoLmluZmxhdGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL29uLmZldGNoLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9waWN0dXJlLmZldGNoLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEhMUyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBbXCIjRVhUTTNVXCIsIFwiI0VYVC1YLVZFUlNJT046M1wiLCBcIiNFWFQtWC1UQVJHRVREVVJBVElPTjo2XCIsIFwiI0VYVC1YLU1FRElBLVNFUVVFTkNFOlwiXTtcclxuICAgICAgICB0aGlzLl9wbGF5bGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3NlcXVlbmNlID0gMDtcclxuICAgICAgICB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0ID0gW107XHJcbiAgICB9XHJcbiAgICAvL2FkZCBtM3U4IGxpbmtzIHdpdGggcXVhbGl0eSB0byB0aGUgbGlzdCBvZiBzZXJ2ZXJzXHJcbiAgICBhc3luYyBhZGRTdHJlYW1MaW5rKHRleHQsIHR5cGUgPSBcImxvY2FsXCIsIHNpZyA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eVVybFNwbGl0ID0gW107XHJcbiAgICAgICAgbGV0IGNhcHR1cmVBcnJheTtcclxuICAgICAgICBjb25zdCBSRUdFWCA9IC9OQU1FPVwiKCg/OlxcUytcXHMrXFxTK3xcXFMrKSlcIixBVVRPKD86XnxcXFMrXFxzKykoPzpefFxcUytcXHMrKShodHRwczpcXC9cXC92aWRlbyhcXFMrKS5tM3U4KS9nO1xyXG4gICAgICAgIHdoaWxlICgoY2FwdHVyZUFycmF5ID0gUkVHRVguZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcXVhbGl0eVVybFNwbGl0LnB1c2goeyBxdWFsaXR5OiBjYXB0dXJlQXJyYXlbMV0sIHVybDogY2FwdHVyZUFycmF5WzJdIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZyhxdWFsaXR5VXJsU3BsaXQpO1xyXG4gICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSB7IHNlcnZlcjogdHlwZSwgdXJsTGlzdDogcXVhbGl0eVVybFNwbGl0LCBzaWc6IHNpZyB9O1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QucHVzaChzdHJlYW1MaXN0KTtcclxuICAgICAgICBpZiAoIXNpZykge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNpZ25hdHVyZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGFzeW5jIHNpZ25hdHVyZSgpIHtcclxuICAgICAgICBjb25zdCBSRUdFWCA9IC92aWRlby13ZWF2ZXIuKC4qKS5obHMudHR2bncubmV0XFwvdjFcXC9wbGF5bGlzdFxcLyguKikubTN1OCQvZ207XHJcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHRoaXMuX3N0cmVhbVNlcnZlckxpc3RcclxuICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4geC5zaWcgPT0gZmFsc2UpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKGFzeW5jICh4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gUkVHRVguZXhlYyh4LnVybExpc3RbMF0udXJsKTtcclxuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vanVwdGVyLmdhL2hscy92Mi9zaWcvXCIgKyBtYXRjaFsyXSArIFwiL1wiICsgbWF0Y2hbMV0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHguc2lnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBnZXQgU3RyZWFtU2VydmVyTGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3RyZWFtU2VydmVyTGlzdDtcclxuICAgIH1cclxuICAgIGFkZFBsYXlsaXN0KHBsYXlsaXN0KSB7XHJcbiAgICAgICAgaWYgKHBsYXlsaXN0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IHBsYXlsaXN0LnRvU3RyaW5nKCkuc3BsaXQoL1tcXHJcXG5dLyk7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyWzRdID0gbGluZXNbNF07XHJcbiAgICAgICAgdGhpcy5faGVhZGVyWzVdID0gbGluZXNbNV07XHJcbiAgICAgICAgLy90YWtlIGFsbCBtM3U5IGNvbnRlbnQgdG8gdGhlIHBsYXlsaXN0IGFuZCBidWlsZCBhIHZhcmlibGVcclxuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gbGluZXMpIHtcclxuICAgICAgICAgICAgaWYgKGxpbmVzW2ldLmluY2x1ZGVzKFwiI0VYVElORlwiKSAmJiBsaW5lc1tpXS5pbmNsdWRlcyhcIixsaXZlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAvL3RpbWVzdGFtcCBzZXF1ZW5jZVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VxdWVuY2VUaW1lc3RhbXAgPSBNYXRoLmZsb29yKG5ldyBEYXRlKGxpbmVzW3BhcnNlSW50KGkpIC0gMV0uc2xpY2UobGluZXNbcGFyc2VJbnQoaSkgLSAxXS5sZW5ndGggLSAyNCwgbGluZXNbcGFyc2VJbnQoaSkgLSAxXS5sZW5ndGgpKS5nZXRUaW1lKCkgLyAxMDAwKTtcclxuICAgICAgICAgICAgICAgIC8vc2VsZWN0IGFsbCBzZXF1ZW5jZSB0aGF0IG5vIGV4aXN0XHJcbiAgICAgICAgICAgICAgICBjb25zdCByID0gdGhpcy5fcGxheWxpc3QuZmlsdGVyKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudGltZXN0YW1wID49IHNlcXVlbmNlVGltZXN0YW1wO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvL2FkZCB0aGUgc2VxdWVuY2Ugb24gcGxheWxpc3QgdmFyaWFibGUgaWYgaXQgbm8gZXhpc3RcclxuICAgICAgICAgICAgICAgIGlmICghci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoc2VxdWVuY2VUaW1lc3RhbXApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlID0gdGhpcy5fc2VxdWVuY2UgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBsaW5lc1twYXJzZUludChpKSAtIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHNlcXVlbmNlVGltZXN0YW1wLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiBsaW5lc1twYXJzZUludChpKV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogbGluZXNbcGFyc2VJbnQoaSkgKyAxXSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wbGF5bGlzdC5sZW5ndGggPiAxNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XHJcbiAgICB9XHJcbiAgICBnZXRBbGxQbGF5bGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hlYWRlclswXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzJdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclszXSArXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls0XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QubWFwKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lICsgXCJcXG5cIiArIHguaW5mbyArIFwiXFxuXCIgKyB4LnVybCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTRXhUTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwwaE1VeTUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeE5RVUZOTEU5QlFVOHNSMEZCUnp0SlFVRm9RanRSUVVOVkxGbEJRVThzUjBGQmEwSXNRMEZCUXl4VFFVRlRMRVZCUVVVc2EwSkJRV3RDTEVWQlFVVXNlVUpCUVhsQ0xFVkJRVVVzZDBKQlFYZENMRU5CUVVNc1EwRkJRenRSUVVNNVJ5eGpRVUZUTEVkQlFXMUNMRVZCUVVVc1EwRkJRenRSUVVNdlFpeGpRVUZUTEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTJRc2MwSkJRV2xDTEVkQlFXMUNMRVZCUVVVc1EwRkJRenRKUVdkSWFrUXNRMEZCUXp0SlFUbEhReXh2UkVGQmIwUTdTVUZEY0VRc1MwRkJTeXhEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZaTEVWQlFVVXNTVUZCU1N4SFFVRkhMRTlCUVU4c1JVRkJSU3hIUVVGSExFZEJRVWNzUzBGQlN6dFJRVU16UkN4TlFVRk5MR1ZCUVdVc1IwRkJhVUlzUlVGQlJTeERRVUZETzFGQlEzcERMRWxCUVVrc1dVRkJiME1zUTBGQlF6dFJRVVY2UXl4TlFVRk5MRXRCUVVzc1IwRkJSeXh4UmtGQmNVWXNRMEZCUXp0UlFVVndSeXhQUVVGUExFTkJRVU1zV1VGQldTeEhRVUZITEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZKTEVWQlFVVTdXVUZEYWtRc1pVRkJaU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEU5QlFVOHNSVUZCUlN4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUjBGQlJ5eEZRVUZGTEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03VTBGRE1VVTdVVUZEUkN4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExHVkJRV1VzUTBGQlF5eERRVUZETzFGQlF6ZENMRTFCUVUwc1ZVRkJWU3hIUVVGSExFVkJRVVVzVFVGQlRTeEZRVUZGTEVsQlFVa3NSVUZCUlN4UFFVRlBMRVZCUVVVc1pVRkJaU3hGUVVGRkxFZEJRVWNzUlVGQlJTeEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjRSU3hKUVVGSkxFTkJRVU1zYVVKQlFXbENMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzFGQlJYaERMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVU3V1VGRFVpeE5RVUZOTEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVc1EwRkJRenRUUVVONFFqdFJRVU5FTEU5QlFVOHNTVUZCU1N4RFFVRkRPMGxCUTJRc1EwRkJRenRKUVVWRUxFdEJRVXNzUTBGQlF5eFRRVUZUTzFGQlEySXNUVUZCVFN4TFFVRkxMRWRCUVVjc05rUkJRVFpFTEVOQlFVTTdVVUZGTlVVc1RVRkJUU3hKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZETEU5QlFVOHNSVUZCUlN4RlFVRkZMRU5CUXpWQ0xFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJN1lVRkRia0lzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eEpRVUZKTEV0QlFVc3NRMEZCUXp0aFFVTnNReXhQUVVGUExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVMHNSVUZCUlN4RlFVRkZPMWxCUTNoQ0xFMUJRVTBzUzBGQlN5eEhRVUV5UWl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03V1VGRGJrVXNTVUZCU1N4TFFVRkxMRVZCUVVVN1owSkJRMVFzU1VGQlNUdHZRa0ZEUml4TlFVRk5MRU5CUVVNc1IwRkJSeXhOUVVGTkxFdEJRVXNzUTBGQlF5d3JRa0ZCSzBJc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJUdDNRa0ZEYWtZc1RVRkJUU3hGUVVGRkxFdEJRVXM3Y1VKQlEyUXNRMEZCUXl4RFFVRkRPMjlDUVVOSUxFTkJRVU1zUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRPMjlDUVVOaUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0cFFrRkRaanRuUWtGQlF5eE5RVUZOTzI5Q1FVTk9MRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dHBRa0ZEYUVJN1lVRkRSanRwUWtGQlRUdG5Ra0ZEVEN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03WVVGRGFFSTdVVUZEU0N4RFFVRkRMRU5CUVVNc1EwRkRUQ3hEUVVGRE8wbEJRMG9zUTBGQlF6dEpRVVZFTEVsQlFVa3NaMEpCUVdkQ08xRkJRMnhDTEU5QlFVOHNTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeERRVUZETzBsQlEyaERMRU5CUVVNN1NVRkZSQ3hYUVVGWExFTkJRVU1zVVVGQlowSTdVVUZETVVJc1NVRkJTU3hSUVVGUkxFdEJRVXNzU1VGQlNTeEZRVUZGTzFsQlEzSkNMRTlCUVU4c1MwRkJTeXhEUVVGRE8xTkJRMlE3VVVGRlJDeEpRVUZKTEU5QlFVOHNSMEZCUnl4TFFVRkxMRU5CUVVNN1VVRkZjRUlzVFVGQlRTeExRVUZMTEVkQlFVY3NVVUZCVVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0UlFVTnNSQ3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU16UWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVVelFpd3lSRUZCTWtRN1VVRkRNMFFzUzBGQlN5eE5RVUZOTEVOQlFVTXNTVUZCU1N4TFFVRkxMRVZCUVVVN1dVRkRja0lzU1VGQlNTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhSUVVGUkxFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVTdaMEpCUXpsRUxHOUNRVUZ2UWp0blFrRkRjRUlzVFVGQlRTeHBRa0ZCYVVJc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEhRVUZITEVWQlFVVXNSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNN1owSkJSV3BMTEcxRFFVRnRRenRuUWtGRGJrTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSVHR2UWtGRGNFTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1UwRkJVeXhKUVVGSkxHbENRVUZwUWl4RFFVRkRPMmRDUVVNeFF5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkRTQ3h6UkVGQmMwUTdaMEpCUTNSRUxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkZPMjlDUVVOaUxFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zUTBGQlF6dHZRa0ZEYmtNc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRU5CUVVNc1EwRkJRenR2UWtGRGNFTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU03ZDBKQlEyeENMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenQzUWtGRE5VSXNVMEZCVXl4RlFVRkZMR2xDUVVGcFFqdDNRa0ZETlVJc1NVRkJTU3hGUVVGRkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRM2hDTEVkQlFVY3NSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0eFFrRkROVUlzUTBGQlF5eERRVUZETzI5Q1FVTklMRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU03YVVKQlEyaENPMmRDUVVORUxFOUJRVThzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hGUVVGRk8yOUNRVU5xUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzJsQ1FVTjRRanRoUVVOR08xTkJRMFk3VVVGRFJDeFBRVUZQTEU5QlFVOHNRMEZCUXp0SlFVTnFRaXhEUVVGRE8wbEJSVVFzWTBGQll6dFJRVU5hTEU5QlFVOHNRMEZEVEN4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVa3NRMEZCUXl4VFFVRlRPMWxCUTJRc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVU3WjBKQlEzWkNMRTlCUVU4c1EwRkJReXhEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNN1dVRkRkRVFzUTBGQlF5eERRVUZETEVOQlEwZ3NRMEZCUXp0SlFVTktMRU5CUVVNN1EwRkRSaUo5IiwiZXhwb3J0IGZ1bmN0aW9uIGN1cnJlbnQoY2hhbm5lbCA9IG51bGwpIHtcclxuICAgIGlmIChjaGFubmVsKSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gY2hhbm5lbCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZ2xvYmFsLmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBnbG9iYWwuYWN0dWFsQ2hhbm5lbCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWTNWeWNtVnVkQzVqYUdGdWJtVnNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyTm9ZVzV1Wld3dlkzVnljbVZ1ZEM1amFHRnVibVZzTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1ZVRkJWU3hQUVVGUExFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVazdTVUZEY0VNc1NVRkJTU3hQUVVGUExFVkJRVVU3VVVGRFdDeFBRVUZQTEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExFOUJRVThzUTBGQlF5eERRVUZETzB0QlEzWkVPMU5CUVUwN1VVRkRUQ3hQUVVGUExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRTFCUVUwc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF6dExRVU53UlR0QlFVTklMRU5CUVVNaWZRPT0iLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gb25TdGFydChfd2luZG93LCB1cmwsIHRleHQgLyogaXNPZmZsaW5lID0gZmFsc2UgKi8pIHtcclxuICAgIGNvbnN0IHJlZ2V4ID0gL2hsc1xcLyguKikubTN1OC9nbTtcclxuICAgIGNvbnN0IG1hdGNoID0gcmVnZXguZXhlYyh1cmwpIHx8IFtdO1xyXG4gICAgbGV0IGV4aXN0ZW50ID0gZmFsc2U7XHJcbiAgICBpZiAobWF0Y2hbMV0pIHtcclxuICAgICAgICBfd2luZG93LmFjdHVhbENoYW5uZWwgPSBtYXRjaFsxXTtcclxuICAgICAgICBpZiAoX3dpbmRvdy53aGl0ZWxpc3QuaW5jbHVkZXMobWF0Y2hbMV0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFfd2luZG93LmNoYW5uZWwuZmluZCgoYykgPT4gYy5uYW1lID09PSBtYXRjaFsxXSkpIHtcclxuICAgICAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkNoYW5uZWw6IFwiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICBfd2luZG93LmNoYW5uZWwucHVzaCh7IG5hbWU6IG1hdGNoWzFdLCBmbG93U2lnOiBbXSwgaGxzOiBuZXcgX3dpbmRvdy5ITFMoKSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJFeGlzdDogXCIgKyBtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgIGV4aXN0ZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgX3dpbmRvdy5Mb2dQcmludChcIkxvY2FsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgIGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dCk7XHJcbiAgICBfd2luZG93LkxvZ1ByaW50KFwiTG9jYWwgU2VydmVyOiBPS1wiKTtcclxuICAgIGlmIChleGlzdGVudClcclxuICAgICAgICByZXR1cm47XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgYXdhaXQgZ2xvYmFsLm5ld1BpY3R1cmUoZ2xvYmFsLmFjdHVhbENoYW5uZWwpLnRoZW4oKHRleHRQaWN0dXJlKSA9PiB7XHJcbiAgICAgICAgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKG1hdGNoWzFdKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0UGljdHVyZSwgXCJwaWN0dXJlXCIsIHRydWUpO1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkxvY2FsIFNlcnZlciA0ODBwOiBPS1wiKTtcclxuICAgIH0pO1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIGlmICghZ2xvYmFsLmlzUHJveHlBdXRoKVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIGdsb2JhbC5uZXdFeHRlcm5hbChnbG9iYWwuYWN0dWFsQ2hhbm5lbCkudGhlbigodGV4dCkgPT4gZ2xvYmFsLmN1cnJlbnRDaGFubmVsKG1hdGNoWzFdKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0LCBcInByb3h5XCIsIHRydWUpKTtcclxuICAgIHJldHVybjtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eVVybFNwbGl0ID0gdGV4dC5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgY29uc3Qgc2VydmVyID0gcXVhbGl0eVVybFNwbGl0LnNoaWZ0KCk7XHJcbiAgICAgICAgY29uc3Qgc3RyZWFtTGlzdCA9IHsgc2VydmVyOiBcInByb3h5XCIsIHVybExpc3Q6IFtdIH07XHJcbiAgICAgICAgcXVhbGl0eVVybFNwbGl0LmZvckVhY2goKGVsZW1lbnQsIGluZGV4LCBhcnJheSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIShpbmRleCAlIDIpKSB7XHJcbiAgICAgICAgICAgICAgICBzdHJlYW1MaXN0LnVybExpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogc3RyZWFtTGlzdC51cmxMaXN0LnNvbWUoKHgpID0+IHgucXVhbGl0eSA9PSBlbGVtZW50KSA/IGVsZW1lbnQgKyBcInAzMFwiIDogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly92aWRlby13ZWF2ZXIuXCIgKyBzZXJ2ZXIgKyBcIi5obHMudHR2bncubmV0L3YxL3BsYXlsaXN0L1wiICsgYXJyYXlbaW5kZXggKyAxXSArIFwiLm0zdThcIixcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChzdHJlYW1MaXN0KTtcclxuICAgICAgICBfd2luZG93LmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBtYXRjaFsxXSkuaGxzLmFkZChzdHJlYW1MaXN0KTtcclxuICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChlKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liMjR1WTJoaGJtNWxiQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OWphR0Z1Ym1Wc0wyOXVMbU5vWVc1dVpXd3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFdEJRVXNzVlVGQlZTeFBRVUZQTEVOQlFVTXNUMEZCVHl4RlFVRkZMRWRCUVVjc1JVRkJSU3hKUVVGSkxFTkJRVU1zZFVKQlFYVkNPMGxCUTNSRkxFMUJRVTBzUzBGQlN5eEhRVUZITEd0Q1FVRnJRaXhEUVVGRE8wbEJRMnBETEUxQlFVMHNTMEZCU3l4SFFVRjVRaXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRKUVVNeFJDeEpRVUZKTEZGQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNN1NVRkZja0lzU1VGQlNTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVN1VVRkRXaXhQUVVGUExFTkJRVU1zWVVGQllTeEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOcVF5eEpRVUZKTEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZPMWxCUTNoRExFOUJRVTg3VTBGRFVqdFJRVVZFTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUzBGQlN5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSVHRaUVVOeVJDeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRmRCUVZjc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjZReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hIUVVGSExFVkJRVVVzU1VGQlNTeFBRVUZQTEVOQlFVTXNSMEZCUnl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8xTkJReTlGTzJGQlFVMDdXVUZEVEN4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOMlF5eFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRPMU5CUTJwQ08wdEJRMFk3U1VGRFJDeG5SRUZCWjBRN1NVRkZhRVFzWjBSQlFXZEVPMGxCUTJoRUxFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNkVUpCUVhWQ0xFTkJRVU1zUTBGQlF6dEpRVU14UXl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdTVUZEZUVRc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhEUVVGRE8wbEJSWEpETEVsQlFVa3NVVUZCVVR0UlFVRkZMRTlCUVU4N1NVRkZja0lzWjBSQlFXZEVPMGxCUldoRUxHZEVRVUZuUkR0SlFVTm9SQ3hOUVVGTkxFMUJRVTBzUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEZkQlFWY3NSVUZCUlN4RlFVRkZPMUZCUTJwRkxFMUJRVTBzUTBGQlF5eGpRVUZqTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEdGQlFXRXNRMEZCUXl4WFFVRlhMRVZCUVVVc1UwRkJVeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEyaEdMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zZFVKQlFYVkNMRU5CUVVNc1EwRkJRenRKUVVNelF5eERRVUZETEVOQlFVTXNRMEZCUXp0SlFVVklMR2RFUVVGblJEdEpRVVZvUkN4blJFRkJaMFE3U1VGRmFFUXNTVUZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXhYUVVGWE8xRkJRVVVzVDBGQlR6dEpRVU12UWl4TlFVRk5MRU5CUVVNc1YwRkJWeXhEUVVGRExFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4alFVRmpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzVDBGQlR5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkZhRWtzVDBGQlR6dEpRVVZRTEVsQlFVazdVVUZEUml4TlFVRk5MR1ZCUVdVc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTNoRExFMUJRVTBzVFVGQlRTeEhRVUZITEdWQlFXVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRSUVVWMlF5eE5RVUZOTEZWQlFWVXNSMEZCWlN4RlFVRkZMRTFCUVUwc1JVRkJSU3hQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEVWQlFVVXNSVUZCUlN4RFFVRkRPMUZCUTJoRkxHVkJRV1VzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJTeEZRVUZGTzFsQlEyaEVMRWxCUVVrc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlR0blFrRkRhRUlzVlVGQlZTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNN2IwSkJRM1JDTEU5QlFVOHNSVUZCUlN4VlFVRlZMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHp0dlFrRkRla1lzUjBGQlJ5eEZRVUZGTEhWQ1FVRjFRaXhIUVVGSExFMUJRVTBzUjBGQlJ5dzJRa0ZCTmtJc1IwRkJSeXhMUVVGTExFTkJRVU1zUzBGQlN5eEhRVUZITEVOQlFVTXNRMEZCUXl4SFFVRkhMRTlCUVU4N2FVSkJRMjVITEVOQlFVTXNRMEZCUXp0aFFVTktPMUZCUTBnc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRlNDeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8xRkJRemRDTEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZGY2tVc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eHhRa0ZCY1VJc1EwRkJReXhEUVVGRE8wdEJRM3BETzBsQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVN1VVRkRWaXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMHRCUTNKQ08wRkJRMGdzUTBGQlF5SjkiLCIvL2V4dGVybmFsIHJlcXVlc3QgdGhyb3VoZyBwdXJwbGUgc2VydmVyXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHRlcm5hbChjaGFubmVsTmFtZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJFeHRlcm5hbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnbG9iYWwucmVhbEZldGNoKFwiaHR0cHM6Ly9cIiArIGdsb2JhbC50dW5uZWxbMF0gKyBcIi9jaGFubmVsL1wiICsgY2hhbm5lbE5hbWUpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2VydmVyIHByb3h5IHJldHVybiBlcnJvciBvciBub3QgZm91bmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KGUpO1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpYaDBaWEp1WVd3dVptVjBZMmd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZabVYwWTJndlpYaDBaWEp1WVd3dVptVjBZMmd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNkME5CUVhkRE8wRkJRM2hETEUxQlFVMHNRMEZCUXl4TFFVRkxMRlZCUVZVc1VVRkJVU3hEUVVGRExGZEJRVzFDTzBsQlEyaEVMRWxCUVVrN1VVRkRSaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETERCQ1FVRXdRaXhEUVVGRExFTkJRVU03VVVGRE5VTXNUVUZCVFN4UlFVRlJMRWRCUVdFc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZKTEZkQlFWY3NSMEZCUnl4WFFVRlhMRU5CUVVNc1EwRkJRenRSUVVVNVJ5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1JVRkJSVHRaUVVOb1FpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMSGREUVVGM1F5eERRVUZETEVOQlFVTTdVMEZETTBRN1VVRkZSQ3hOUVVGTkxFbEJRVWtzUjBGQlZ5eE5RVUZOTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRSUVVVelF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMSEZDUVVGeFFpeERRVUZETEVOQlFVTTdVVUZGZGtNc1QwRkJUeXhKUVVGSkxFTkJRVU03UzBGRFlqdEpRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPMUZCUTFZc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTnVRaXhQUVVGUExFVkJRVVVzUTBGQlF6dExRVU5ZTzBGQlEwZ3NRMEZCUXlKOSIsImV4cG9ydCBmdW5jdGlvbiBpbmZsYXRlRmV0Y2goX3dpbmRvdykge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWdsb2JhbC1hc3NpZ25cclxuICAgIF93aW5kb3cuZmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWYgKHVybC5lbmRzV2l0aChcIm0zdThcIikgJiYgdXJsLmluY2x1ZGVzKFwidHR2bncubmV0XCIpICYmICFfd2luZG93LndoaXRlbGlzdC5pbmNsdWRlcyhfd2luZG93LmFjdHVhbENoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzRmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93LnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UudGV4dCgpLnRoZW4oZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dpbmRvdy5vbkZldGNoKF93aW5kb3csIHRleHQsIHVybCkudGhlbihmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXlsaXN0ID0gZ2xvYmFsLmN1cnJlbnRDaGFubmVsKCkuaGxzLmdldEFsbFBsYXlsaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShwbGF5bGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0ZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKFwidXNoZXIudHR2bncubmV0L2FwaS9jaGFubmVsL2hscy9cIikgJiYgIXVybC5pbmNsdWRlcyhcInBpY3R1cmUtYnktcGljdHVyZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc0ZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93LnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihhc3luYyBmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93Lm9uU3RhcnRDaGFubmVsKF93aW5kb3csIHVybCwgdGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHRleHQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJjaGFubmVsIG9mZmxpbmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0ZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKFwicGljdHVyZS1ieS1waWN0dXJlXCIpKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF93aW5kb3cucmVhbEZldGNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVptVjBZMmd1YVc1bWJHRjBaUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OW1aWFJqYUM5bVpYUmphQzVwYm1ac1lYUmxMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFMUJRVTBzVlVGQlZTeFpRVUZaTEVOQlFVTXNUMEZCVHp0SlFVTnNReXcwUTBGQk5FTTdTVUZETlVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUjBGQlJ5eExRVUZMTEZkQlFWY3NSMEZCUnl4RlFVRkZMRTlCUVU4N1VVRkRNVU1zU1VGQlNTeFBRVUZQTEVkQlFVY3NTMEZCU3l4UlFVRlJMRVZCUVVVN1dVRkRNMElzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExFVkJRVVU3WjBKQlF6TkhMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zVlVGQlZTeFBRVUZQTEVWQlFVVXNUVUZCVFR0dlFrRkRNVU1zU1VGQlNTeFpRVUZaTEVkQlFVY3NTMEZCU3l4WFFVRlhMRWRCUVVjN2QwSkJRM0JETEVsQlFVazdORUpCUTBZc1RVRkJUU3hQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeFJRVUZSTzJkRFFVTXpSQ3hSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1NVRkJTVHR2UTBGRGFrTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFVkJRVVVzU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU03ZDBOQlEyeEVMRWxCUVVrc1VVRkJVU3hIUVVGSExFMUJRVTBzUTBGQlF5eGpRVUZqTEVWQlFVVXNRMEZCUXl4SFFVRkhMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU03ZDBOQlF6VkVMRTlCUVU4c1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlEUVVOc1F5eERRVUZETEVOQlFVTXNRMEZCUXp0blEwRkRUQ3hEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEVEN4RFFVRkRMRU5CUVVNc1EwRkJRenQ1UWtGRFNqdDNRa0ZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHMwUWtGRFZpeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRVZCUVVVc1EwRkJReXhEUVVGRE8zbENRVU42UWp0dlFrRkRTQ3hEUVVGRExFTkJRVU03YjBKQlEwWXNXVUZCV1N4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU53UWl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVOS08xbEJSVVFzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMR3REUVVGclF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExHOUNRVUZ2UWl4RFFVRkRMRVZCUVVVN1owSkJRek5HTEU5QlFVOHNTVUZCU1N4UFFVRlBMRU5CUVVNc1ZVRkJWU3hQUVVGUExFVkJRVVVzVFVGQlRUdHZRa0ZETVVNc1NVRkJTU3haUVVGWkxFZEJRVWNzUzBGQlN5eFhRVUZYTEVkQlFVYzdkMEpCUTNCRExFMUJRVTBzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNVVUZCVVRzMFFrRkRNMFFzU1VGQlNTeFJRVUZSTEVOQlFVTXNSVUZCUlN4RlFVRkZPMmREUVVObUxGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhYUVVGWExFbEJRVWs3YjBOQlEzWkRMRTFCUVUwc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eFBRVUZQTEVWQlFVVXNSMEZCUnl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8yOURRVU5xUkN4UFFVRlBMRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0blEwRkRPVUlzUTBGQlF5eERRVUZETEVOQlFVTTdOa0pCUTBvN2FVTkJRVTA3WjBOQlEwd3NUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8yZERRVU5zUWl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRU5CUVVNN05rSkJRM0pETzNkQ1FVTklMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5NTEVOQlFVTXNRMEZCUXp0dlFrRkRSaXhaUVVGWkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUTNCQ0xFTkJRVU1zUTBGQlF5eERRVUZETzJGQlEwbzdXVUZGUkN4SlFVRkpMRWRCUVVjc1EwRkJReXhSUVVGUkxFTkJRVU1zYjBKQlFXOUNMRU5CUVVNc1JVRkJSVHRoUVVOMlF6dFRRVU5HTzFGQlJVUXNUMEZCVHl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1NVRkRiRVFzUTBGQlF5eERRVUZETzBGQlEwb3NRMEZCUXlKOSIsImV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbihfd2luZG93LCByZXNwb25zZSwgdXJsKSB7XHJcbiAgICAvLyAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjUgKXtcclxuICAgIC8vICAgICAgcmVzcG9uc2UgKz0gXCJ0d2l0Y2gtY2xpZW50LWFkXCI7XHJcbiAgICAvLyAgfVxyXG4gICAgY29uc3QgY2hhbm5lbEN1cnJlbnQgPSBhd2FpdCBnbG9iYWwuY3VycmVudENoYW5uZWwoKTtcclxuICAgIGdsb2JhbC5Mb2dQcmludChcIlNlcXVlbmNlXCIpO1xyXG4gICAgLy9pZiBhZHMgZmluZCBvbiBtYWluIGxpbmsgY2FsbGVkIGZyb20gdHdpdGNoIGFwaSBwbGF5ZXJcclxuICAgIGlmIChnbG9iYWwuaXNBZHMocmVzcG9uc2UpKSB7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiYWRzIGZvdW5kXCIpO1xyXG4gICAgICAgIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXNwb25zZSk7XHJcbiAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgdHlwZTogXCJnZXRRdWFsaXR5XCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwicmVsb2FkXCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHF1YWxpdHkgPSBnbG9iYWwucXVhbGl0eTtcclxuICAgICAgICBjb25zdCBTdHJlYW1TZXJ2ZXJMaXN0ID0gY2hhbm5lbEN1cnJlbnQuaGxzLlN0cmVhbVNlcnZlckxpc3Q7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KHF1YWxpdHkpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vdHJ5IGFsbCBobHMgc2lncyB0aGF0IGhhdmUgb24gU3RyZWFtU2VydmVyTGlzdCBmcm9tIEhMUyBcclxuICAgICAgICAgICAgaWYgKFN0cmVhbVNlcnZlckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJveHkgPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbmQoKHgpID0+IHguc2VydmVyID09IFwicHJveHlcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByb3h5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHByb3h5LnVybExpc3QuZmluZCgoYSkgPT4gYS5xdWFsaXR5ID09IHF1YWxpdHkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmV0dXJubzIgPSBhd2FpdCBnbG9iYWwucmVhbEZldGNoKHVybC51cmwpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJldHVybm9UZXh0ID0gYXdhaXQgcmV0dXJubzIudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5pc0FkcyhyZXR1cm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJhZHMgb24gcHJveHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmV0dXJub1RleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZ2VyYSBlcnJvIHNlIG5hbyB0aXZlciBsaW5rXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG0zdTggdmFsaWQgdXJsIGZvdW5kIG9uIFN0cmVhbVNlcnZlckxpc3RcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIC8vaWYgbm90aGluZyByZXNvbHZlLCByZXR1cm4gNDgwcCBmbG93XHJcbiAgICAgICAgICAgIGNvbnN0IHBpY3R1cmVTdHJlYW0gPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbHRlcigoeCkgPT4geC5zZXJ2ZXIgPT0gXCJwaWN0dXJlXCIpLm1hcCgoeCkgPT4geC51cmxMaXN0LmZpbmQoKHgpID0+IHgucXVhbGl0eS5pbmNsdWRlcyhcIjQ4MFwiKSkpWzBdLnVybDtcclxuICAgICAgICAgICAgY29uc3QgcmV0dXJubyA9IGF3YWl0IChhd2FpdCBnbG9iYWwucmVhbEZldGNoKHBpY3R1cmVTdHJlYW0pKS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGlmIChjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmV0dXJubykpIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIjQ4MHBcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY2hhbm5lbEN1cnJlbnQuaGxzLmFkZFBsYXlsaXN0KHJlc3BvbnNlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liMjR1Wm1WMFkyZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdlptVjBZMmd2YjI0dVptVjBZMmd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hGUVVGRkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4SFFVRkhPMGxCUXpkRExEaENRVUU0UWp0SlFVTTVRaXgxUTBGQmRVTTdTVUZEZGtNc1MwRkJTenRKUVVWTUxFMUJRVTBzWTBGQll5eEhRVUZITEUxQlFVMHNUVUZCVFN4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRE8wbEJRM0pFTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03U1VGRk5VSXNkMFJCUVhkRU8wbEJRM2hFTEVsQlFVa3NUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJUdFJRVVV4UWl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzFGQlJUZENMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zVjBGQlZ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMUZCUlhwRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTTdXVUZEYWtJc1NVRkJTU3hGUVVGRkxGbEJRVms3V1VGRGJFSXNTMEZCU3l4RlFVRkZMRWxCUVVrN1UwRkRXaXhEUVVGRExFTkJRVU03VVVGRlNDeE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRPMWxCUTJwQ0xFbEJRVWtzUlVGQlJTeFJRVUZSTzFsQlEyUXNTMEZCU3l4RlFVRkZMRWxCUVVrN1UwRkRXaXhEUVVGRExFTkJRVU03VVVGRlNDeE5RVUZOTEU5QlFVOHNSMEZCUnl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRE8xRkJReTlDTEUxQlFVMHNaMEpCUVdkQ0xFZEJRVWNzWTBGQll5eERRVUZETEVkQlFVY3NRMEZCUXl4blFrRkJaMElzUTBGQlF6dFJRVVUzUkN4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzFGQlJYcENMRWxCUVVrN1dVRkRSaXd3UkVGQk1FUTdXVUZETVVRc1NVRkJTU3huUWtGQlowSXNRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhGUVVGRk8yZENRVU12UWl4TlFVRk5MRXRCUVVzc1IwRkJNa0lzWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZETzJkQ1FVVjRSaXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTzI5Q1FVTldMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zTmtOQlFUWkRMRU5CUVVNc1EwRkJRenRwUWtGRGFFVTdaMEpCUlVRc1RVRkJUU3hIUVVGSExFZEJRVEpDTEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZETzJkQ1FVVndSaXhKUVVGSkxFTkJRVU1zUjBGQlJ5eEZRVUZGTzI5Q1FVTlNMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zTmtOQlFUWkRMRU5CUVVNc1EwRkJRenRwUWtGRGFFVTdaMEpCUlVRc1RVRkJUU3hSUVVGUkxFZEJRVWNzVFVGQlRTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtRc1NVRkJTU3hYUVVGWExFZEJRVWNzVFVGQlRTeFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1owSkJSWGhETEVsQlFVa3NUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhYUVVGWExFTkJRVU1zUlVGQlJUdHZRa0ZETjBJc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXp0dlFrRkRhRU1zVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3MlEwRkJOa01zUTBGQlF5eERRVUZETzJsQ1FVTm9SVHRuUWtGRlJDeFBRVUZQTEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1YwRkJWeXhEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzJGQlEzQkVPMWxCUlVRc05rSkJRVFpDTzFsQlF6ZENMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zTmtOQlFUWkRMRU5CUVVNc1EwRkJRenRUUVVOb1JUdFJRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPMWxCUTFZc2MwTkJRWE5ETzFsQlEzUkRMRTFCUVUwc1lVRkJZU3hIUVVGSExHZENRVUZuUWl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hUUVVGVExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVOd1JpeERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZEYWtRc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTTdXVUZGVkN4TlFVRk5MRTlCUVU4c1IwRkJSeXhOUVVGTkxFTkJRVU1zVFVGQlRTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdXVUZGY2tVc1NVRkJTU3hqUVVGakxFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRuUWtGRE0wTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dGhRVU42UWp0WlFVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRE8xTkJRMkk3UzBGRFJqdFRRVUZOTzFGQlEwd3NZMEZCWXl4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGWExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdVVUZEZWtNc1QwRkJUeXhKUVVGSkxFTkJRVU03UzBGRFlqdEJRVU5JTEVOQlFVTWlmUT09IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBpY3R1cmUoY2hhbm5lbE5hbWUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ3FsID0gYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChcImh0dHBzOi8vZ3FsLnR3aXRjaC50di9ncWxcIiwge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7IFwiQ2xpZW50LUlEXCI6IFwia2ltbmU3OGt4M25jeDZicmdvNG12NndraTVoMWtvXCIgfSxcclxuICAgICAgICAgICAgYm9keTogYHtcIm9wZXJhdGlvbk5hbWVcIjpcIlBsYXliYWNrQWNjZXNzVG9rZW5cIixcInZhcmlhYmxlc1wiOntcImlzTGl2ZVwiOnRydWUsXCJsb2dpblwiOlwiJHtjaGFubmVsTmFtZX1cIixcImlzVm9kXCI6ZmFsc2UsXCJ2b2RJRFwiOlwiXCIsXCJwbGF5ZXJUeXBlXCI6XCJ0aHVuZGVyZG9tZVwifSxcImV4dGVuc2lvbnNcIjp7XCJwZXJzaXN0ZWRRdWVyeVwiOntcInZlcnNpb25cIjoxLFwic2hhMjU2SGFzaFwiOlwiMDgyODExOWRlZDFjMTM0Nzc5NjY0MzRlMTU4MDBmZjU3ZGRhY2YxM2JhMTkxMWMxMjlkYzIyMDA3MDViMDcxMlwifX19YCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCBncWwuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly91c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiICtcclxuICAgICAgICAgICAgY2hhbm5lbE5hbWUgK1xyXG4gICAgICAgICAgICBcIi5tM3U4P2FsbG93X3NvdXJjZT10cnVlJmZhc3RfYnJlYWQ9dHJ1ZSZwPVwiICtcclxuICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMWU3KSArXHJcbiAgICAgICAgICAgIFwiJnBsYXllcl9iYWNrZW5kPW1lZGlhcGxheWVyJnBsYXlsaXN0X2luY2x1ZGVfZnJhbWVyYXRlPXRydWUmcmVhc3NpZ25tZW50c19zdXBwb3J0ZWQ9ZmFsc2Umc2lnPVwiICtcclxuICAgICAgICAgICAgc3RhdHVzW1wiZGF0YVwiXVtcInN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW5cIl1bXCJzaWduYXR1cmVcIl0gK1xyXG4gICAgICAgICAgICBcIiZzdXBwb3J0ZWRfY29kZWNzPWF2YzEmdG9rZW49XCIgK1xyXG4gICAgICAgICAgICBzdGF0dXNbXCJkYXRhXCJdW1wic3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlblwiXVtcInZhbHVlXCJdO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCAoYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwpKS50ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHRleHQ7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHbGpkSFZ5WlM1bVpYUmphQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OW1aWFJqYUM5d2FXTjBkWEpsTG1abGRHTm9MblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFMUJRVTBzUTBGQlF5eExRVUZMTEZWQlFWVXNUMEZCVHl4RFFVRkRMRmRCUVcxQ08wbEJReTlETEVsQlFVazdVVUZEUml4TlFVRk5MRWRCUVVjc1IwRkJSeXhOUVVGTkxFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNNa0pCUVRKQ0xFVkJRVVU3V1VGRE9VUXNUVUZCVFN4RlFVRkZMRTFCUVUwN1dVRkRaQ3hQUVVGUExFVkJRVVVzUlVGQlJTeFhRVUZYTEVWQlFVVXNaME5CUVdkRExFVkJRVVU3V1VGRE1VUXNTVUZCU1N4RlFVRkZMRGhGUVVFNFJTeFhRVUZYTEhWTVFVRjFURHRUUVVOMlVpeERRVUZETEVOQlFVTTdVVUZGU0N4TlFVRk5MRTFCUVUwc1IwRkJWeXhOUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0UlFVVjRReXhOUVVGTkxFZEJRVWNzUjBGRFVDd3dRMEZCTUVNN1dVRkRNVU1zVjBGQlZ6dFpRVU5ZTERSRFFVRTBRenRaUVVNMVF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEhRVUZITEVOQlFVTTdXVUZETDBJc1owZEJRV2RITzFsQlEyaEhMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5d3lRa0ZCTWtJc1EwRkJReXhEUVVGRExGZEJRVmNzUTBGQlF6dFpRVU40UkN3clFrRkJLMEk3V1VGREwwSXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExESkNRVUV5UWl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRmRrUXNUVUZCVFN4SlFVRkpMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlEzaEVMRTlCUVU4c1NVRkJTU3hEUVVGRE8wdEJRMkk3U1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0UlFVTldMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEYUVJN1FVRkRTQ3hEUVVGREluMD0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaW5mbGF0ZUZldGNoIH0gZnJvbSBcIi4vZmV0Y2gvZmV0Y2guaW5mbGF0ZVwiO1xyXG5pbXBvcnQgeyBITFMgfSBmcm9tIFwiLi9ITFNcIjtcclxuaW1wb3J0IHsgb25TdGFydCB9IGZyb20gXCIuL2NoYW5uZWwvb24uY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBvbiB9IGZyb20gXCIuL2ZldGNoL29uLmZldGNoXCI7XHJcbmltcG9ydCB7IGN1cnJlbnQgfSBmcm9tIFwiLi9jaGFubmVsL2N1cnJlbnQuY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBwaWN0dXJlIH0gZnJvbSBcIi4vZmV0Y2gvcGljdHVyZS5mZXRjaFwiO1xyXG5pbXBvcnQgeyBleHRlcm5hbCB9IGZyb20gXCIuL2ZldGNoL2V4dGVybmFsLmZldGNoXCI7XHJcbmV4cG9ydCBmdW5jdGlvbiBhcHAoc2NvcGUpIHtcclxuICAgIHNjb3BlLkxvZ1ByaW50ID0gKHgpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIltQdXJwbGVdOiBcIiwgeCk7XHJcbiAgICB9O1xyXG4gICAgc2NvcGUuaXNBZHMgPSAoeCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJzdGl0Y2hlZC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtY2xpZW50LWFkXCIpIHx8IHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInR3aXRjaC1hZC1xdWFydGlsZVwiKTtcclxuICAgIH07XHJcbiAgICBzY29wZS5yZWFsRmV0Y2ggPSBmZXRjaDtcclxuICAgIHNjb3BlLmlzUHJveHlBdXRoID0gZmFsc2U7XHJcbiAgICBzY29wZS5xdWFsaXR5ID0gXCJcIjtcclxuICAgIHNjb3BlLndoaXRlbGlzdCA9IFtdO1xyXG4gICAgLy9yZWNlaXZlIG1lc3NhZ2UgZnJvbSB3aW5kb3dcclxuICAgIHNjb3BlLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgc3dpdGNoIChlLmRhdGEuZnVuY05hbWUpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUucXVhbGl0eSA9IGUuZGF0YS5hcmdzWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGUuZGF0YS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRTZXR0aW5nXCI6IHtcclxuICAgICAgICAgICAgICAgIGlmIChlLmRhdGEudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS53aGl0ZWxpc3QgPSBlLmRhdGEudmFsdWUud2hpdGVMaXN0O1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmlzUHJveHlBdXRoID0gZS5kYXRhLnZhbHVlLnRvZ2dsZVByb3h5O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUucXVhbGl0eSA9IGUuZGF0YS52YWx1ZS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNjb3BlLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiBcImluaXRcIixcclxuICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgIH0pO1xyXG4gICAgc2NvcGUuY29taW5nQWRzID0gZmFsc2U7XHJcbiAgICBzY29wZS5jaGFubmVsID0gW107XHJcbiAgICBzY29wZS5hY3R1YWxDaGFubmVsID0gXCJcIjtcclxuICAgIHNjb3BlLmN1cnJlbnRDaGFubmVsID0gY3VycmVudDtcclxuICAgIHNjb3BlLm5ld1BpY3R1cmUgPSBwaWN0dXJlO1xyXG4gICAgc2NvcGUubmV3RXh0ZXJuYWwgPSBleHRlcm5hbDtcclxuICAgIHNjb3BlLnR1bm5lbCA9IFtcImV1MS5qdXB0ZXIuZ2FcIl07XHJcbiAgICBzY29wZS5vbkZldGNoID0gb247XHJcbiAgICBzY29wZS5vblN0YXJ0Q2hhbm5lbCA9IG9uU3RhcnQ7XHJcbiAgICBzY29wZS5ITFMgPSBITFM7XHJcbiAgICBpbmZsYXRlRmV0Y2goc2NvcGUpO1xyXG59XHJcbmFwcChzZWxmKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dmMzSmpMMkZ3Y0M1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hQUVVGUExFVkJRVVVzV1VGQldTeEZRVUZGTEUxQlFVMHNkVUpCUVhWQ0xFTkJRVU03UVVGRGNrUXNUMEZCVHl4RlFVRkZMRWRCUVVjc1JVRkJSU3hOUVVGTkxFOUJRVThzUTBGQlF6dEJRVU0xUWl4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRkxFMUJRVTBzYzBKQlFYTkNMRU5CUVVNN1FVRkRMME1zVDBGQlR5eEZRVUZGTEVWQlFVVXNSVUZCUlN4TlFVRk5MR3RDUVVGclFpeERRVUZETzBGQlEzUkRMRTlCUVU4c1JVRkJSU3hQUVVGUExFVkJRVVVzVFVGQlRTd3lRa0ZCTWtJc1EwRkJRenRCUVVOd1JDeFBRVUZQTEVWQlFVVXNUMEZCVHl4RlFVRkZMRTFCUVUwc2RVSkJRWFZDTEVOQlFVTTdRVUZEYUVRc1QwRkJUeXhGUVVGRkxGRkJRVkVzUlVGQlJTeE5RVUZOTEhkQ1FVRjNRaXhEUVVGRE8wRkJSV3hFTEUxQlFVMHNWVUZCVlN4SFFVRkhMRU5CUVVNc1MwRkJWVHRKUVVNMVFpeExRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRU5CUVVNc1EwRkJUU3hGUVVGRkxFVkJRVVU3VVVGRE1VSXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhaUVVGWkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZETDBJc1EwRkJReXhEUVVGRE8wbEJSVVlzUzBGQlN5eERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVZNc1JVRkJSU3hGUVVGRk8xRkJRekZDTEU5QlFVOHNRMEZCUXl4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEd0Q1FVRnJRaXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXh2UWtGQmIwSXNRMEZCUXl4RFFVRkRPMGxCUXpGSkxFTkJRVU1zUTBGQlF6dEpRVVZHTEV0QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1MwRkJTeXhEUVVGRE8wbEJRM2hDTEV0QlFVc3NRMEZCUXl4WFFVRlhMRWRCUVVjc1MwRkJTeXhEUVVGRE8wbEJRekZDTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRMjVDTEV0QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJSWEpDTERaQ1FVRTJRanRKUVVNM1FpeExRVUZMTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVTBGQlV5eEZRVUZGTEZWQlFWVXNRMEZCUXp0UlFVTXpReXhSUVVGUkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZPMWxCUTNaQ0xFdEJRVXNzV1VGQldTeERRVUZETEVOQlFVTTdaMEpCUTJwQ0xFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRPMmRDUVVOd1F5eE5RVUZOTzJGQlExQTdXVUZEUkN4UFFVRlBMRU5CUVVNc1EwRkJRenRuUWtGRFVDeE5RVUZOTzJGQlExQTdVMEZEUmp0UlFVVkVMRkZCUVZFc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVTdXVUZEYmtJc1MwRkJTeXhaUVVGWkxFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtJc1NVRkJTU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlR0dlFrRkRhRUlzUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFRRVUZUTEVOQlFVTTdiMEpCUTNwRExFdEJRVXNzUTBGQlF5eFhRVUZYTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVjBGQlZ5eERRVUZETzJsQ1FVTTVRenRuUWtGRFJDeE5RVUZOTzJGQlExQTdXVUZEUkN4TFFVRkxMRmxCUVZrc1EwRkJReXhEUVVGRE8yZENRVU5xUWl4TFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJRenRuUWtGRGJFTXNUVUZCVFR0aFFVTlFPMWxCUTBRc1QwRkJUeXhEUVVGRExFTkJRVU03WjBKQlExQXNUVUZCVFR0aFFVTlFPMU5CUTBZN1NVRkRTQ3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVVZJTEV0QlFVc3NRMEZCUXl4WFFVRlhMRU5CUVVNN1VVRkRhRUlzU1VGQlNTeEZRVUZGTEUxQlFVMDdVVUZEV2l4TFFVRkxMRVZCUVVVc1NVRkJTVHRMUVVOYUxFTkJRVU1zUTBGQlF6dEpRVVZJTEV0QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1MwRkJTeXhEUVVGRE8wbEJRM2hDTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRMjVDTEV0QlFVc3NRMEZCUXl4aFFVRmhMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRM3BDTEV0QlFVc3NRMEZCUXl4alFVRmpMRWRCUVVjc1QwRkJUeXhEUVVGRE8wbEJSUzlDTEV0QlFVc3NRMEZCUXl4VlFVRlZMRWRCUVVjc1QwRkJUeXhEUVVGRE8wbEJRek5DTEV0QlFVc3NRMEZCUXl4WFFVRlhMRWRCUVVjc1VVRkJVU3hEUVVGRE8wbEJRemRDTEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhsUVVGbExFTkJRVU1zUTBGQlFUdEpRVVZvUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExFVkJRVVVzUTBGQlF6dEpRVU51UWl4TFFVRkxMRU5CUVVNc1kwRkJZeXhIUVVGSExFOUJRVThzUTBGQlF6dEpRVVV2UWl4TFFVRkxMRU5CUVVNc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF6dEpRVVZvUWl4WlFVRlpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03UVVGRGRFSXNRMEZCUXp0QlFVTkVMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5SjkiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=