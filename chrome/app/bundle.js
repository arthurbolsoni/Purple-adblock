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
        //take all m3u9 content to the playlist and build a new flow
        for (const i in lines) {
            if (lines[i].includes("#EXT-X-PROGRAM-DATE-TIME:")) {
                const sequenceTimestamp = Math.floor(new Date(lines[i].slice(lines[i].length - 24, lines[i].length)).getTime() / 1000);
                const r = this._playlist.filter((x) => {
                    return x.timestamp >= sequenceTimestamp;
                });
                if (!r.length) {
                    this._sequence = this._sequence + 1;
                    this._playlist.push({
                        time: lines[parseInt(i)],
                        timestamp: sequenceTimestamp,
                        info: lines[parseInt(i) + 1],
                        url: lines[parseInt(i) + 2],
                    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0hMUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sR0FBRztJQUFoQjtRQUNVLFlBQU8sR0FBa0IsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUM5RyxjQUFTLEdBQW1CLEVBQUUsQ0FBQztRQUMvQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2Qsc0JBQWlCLEdBQW1CLEVBQUUsQ0FBQztJQTZHakQsQ0FBQztJQTNHQyxvREFBb0Q7SUFDcEQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFZLEVBQUUsSUFBSSxHQUFHLE9BQU8sRUFBRSxHQUFHLEdBQUcsS0FBSztRQUMzRCxNQUFNLGVBQWUsR0FBaUIsRUFBRSxDQUFDO1FBQ3pDLElBQUksWUFBb0MsQ0FBQztRQUV6QyxNQUFNLEtBQUssR0FBRyxxRkFBcUYsQ0FBQztRQUVwRyxPQUFPLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDakQsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUU7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdCLE1BQU0sVUFBVSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN4RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUixNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUN4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

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
    __webpack_require__.g.newPicture(__webpack_require__.g.actualChannel).then((textPicture) => {
        __webpack_require__.g.currentChannel(match[1]).hls.addStreamLink(textPicture, "picture", true);
        __webpack_require__.g.LogPrint("Local Server 480p: OK");
    });
    //--------------------------------------------//
    //--------------------------------------------//
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
        const response = await __webpack_require__.g.realFetch("https://jupter.ga/test/" + channelName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwuZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBQ3hDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsUUFBUSxDQUFDLFdBQW1CO0lBQ2hELElBQUk7UUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDNUMsTUFBTSxRQUFRLEdBQWEsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLHlCQUF5QixHQUFHLFdBQVcsQ0FBQyxDQUFDO1FBRTNGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztTQUMzRDtRQUVELE1BQU0sSUFBSSxHQUFXLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQztLQUNiO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDIn0=

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
            if (url.endsWith(".ts")) {
                //var p = channel.find(x => x.name === actualChannel).hls.getPlaylistByUrl(url);
                //var pp = channel.find(x => x.name === actualChannel).hls.getAllPlaylist();
                //LogPrint("ts timestamp: " + p[0].timestamp);
            }
            if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !_window.whitelist.includes(_window.actualChannel)) {
                return new Promise(function (resolve, reject) {
                    var processFetch = async function (url) {
                        // await onBeforeFetch(url);
                        await _window.realFetch(url, options).then(function (response) {
                            response.text().then(function (text) {
                                _window.onFetch(_window, text, url).then(function (r) {
                                    var playlist = __webpack_require__.g.currentChannel().hls.getAllPlaylist();
                                    resolve(new Response(playlist));
                                });
                            });
                        });
                    };
                    processFetch(url);
                });
            }
            if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
                console.log(url);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guaW5mbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBTztJQUNsQyw0Q0FBNEM7SUFDNUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLE9BQU87UUFDMUMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDM0IsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN2QixnRkFBZ0Y7Z0JBQ2hGLDRFQUE0RTtnQkFDNUUsOENBQThDO2FBQy9DO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzNHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDMUMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ3BDLDRCQUE0Qjt3QkFDNUIsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFROzRCQUMzRCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtnQ0FDakMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0NBQ2xELElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7b0NBQzVELE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dDQUNsQyxDQUFDLENBQUMsQ0FBQzs0QkFDTCxDQUFDLENBQUMsQ0FBQzt3QkFDTCxDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUM7b0JBQ0YsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQixDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7Z0JBQzNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDMUMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ3BDLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTs0QkFDM0QsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFO2dDQUNmLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUk7b0NBQ3ZDLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUNqRCxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDOUIsQ0FBQyxDQUFDLENBQUM7NkJBQ0o7aUNBQU07Z0NBQ0wsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUNsQixPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7NkJBQ3JDO3dCQUNILENBQUMsQ0FBQyxDQUFDO29CQUNMLENBQUMsQ0FBQztvQkFDRixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTthQUN2QztTQUNGO1FBRUQsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9

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
            __webpack_require__.g.LogPrint("480P");
            __webpack_require__.g.LogPrint(e);
            channelCurrent.hls.addPlaylist(returno);
            return true;
        }
    }
    else {
        channelCurrent.hls.addPlaylist(response);
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvb24uZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzdDLDhCQUE4QjtJQUM5Qix1Q0FBdUM7SUFDdkMsS0FBSztJQUVMLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXJELHdEQUF3RDtJQUN4RCxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDMUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU3QixNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ2pCLElBQUksRUFBRSxZQUFZO1lBQ2xCLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUNqQixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUMvQixNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFFN0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QixJQUFJO1lBQ0YseURBQXlEO1lBQ3pELElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxLQUFLLEdBQTJCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsQ0FBQztnQkFFeEYsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7aUJBQ2hFO2dCQUVELE1BQU0sR0FBRyxHQUEyQixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQztnQkFFcEYsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDUixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7aUJBQ2hFO2dCQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pELElBQUksV0FBVyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUV4QyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztpQkFDaEU7Z0JBRUQsT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNwRDtZQUVELDZCQUE2QjtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7U0FDaEU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLHNDQUFzQztZQUN0QyxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDcEYsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBRVQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXJFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7U0FBTTtRQUNMLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFDSCxDQUFDIn0=

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
        return x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad");
    };
    scope.realFetch = fetch;
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
            case "setWhitelist": {
                if (e.data.value) {
                    scope.whitelist = e.data.value;
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
    scope.channel = [];
    scope.actualChannel = "";
    scope.currentChannel = _channel_current_channel__WEBPACK_IMPORTED_MODULE_4__.current;
    scope.newPicture = _fetch_picture_fetch__WEBPACK_IMPORTED_MODULE_5__.picture;
    scope.newExternal = _fetch_external_fetch__WEBPACK_IMPORTED_MODULE_6__.external;
    scope.tunnel = null;
    scope.onFetch = _fetch_on_fetch__WEBPACK_IMPORTED_MODULE_3__.on;
    scope.onStartChannel = _channel_on_channel__WEBPACK_IMPORTED_MODULE_2__.onStart;
    scope.HLS = _HLS__WEBPACK_IMPORTED_MODULE_1__.HLS;
    (0,_fetch_fetch_inflate__WEBPACK_IMPORTED_MODULE_0__.inflateFetch)(scope);
}
app(self);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBVTtJQUM1QixLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDM0YsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDeEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFFckIsNkJBQTZCO0lBQzdCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1FBQzNDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDdkIsS0FBSyxZQUFZLENBQUMsQ0FBQztnQkFDakIsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLE1BQU07YUFDUDtZQUNELE9BQU8sQ0FBQyxDQUFDO2dCQUNQLE1BQU07YUFDUDtTQUNGO1FBRUQsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNuQixLQUFLLGNBQWMsQ0FBQyxDQUFDO2dCQUNuQixJQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDO29CQUNkLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7aUJBQ2hDO2dCQUNELE1BQU07YUFDUDtZQUNELEtBQUssWUFBWSxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNsQyxNQUFNO2FBQ1A7WUFDRCxPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNO2FBQ1A7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNoQixJQUFJLEVBQUUsTUFBTTtRQUNaLEtBQUssRUFBRSxJQUFJO0tBQ1osQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDekIsS0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFFL0IsS0FBSyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7SUFDM0IsS0FBSyxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUM7SUFDN0IsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFFcEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFFL0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFFaEIsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMifQ==
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTnFEO0FBQ3pCO0FBQ21CO0FBQ1Q7QUFDYztBQUNKO0FBQ0U7QUFDM0M7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsMkJBQTJCLDZEQUFPO0FBQ2xDLHVCQUF1Qix5REFBTztBQUM5Qix3QkFBd0IsMkRBQVE7QUFDaEM7QUFDQSxvQkFBb0IsK0NBQUU7QUFDdEIsMkJBQTJCLHdEQUFPO0FBQ2xDLGdCQUFnQixxQ0FBRztBQUNuQixJQUFJLGtFQUFZO0FBQ2hCO0FBQ0E7QUFDQSwyQ0FBMkMsMmdGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL0hMUy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9jdXJyZW50LmNoYW5uZWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NoYW5uZWwvb24uY2hhbm5lbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL2ZldGNoLmluZmxhdGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL29uLmZldGNoLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9waWN0dXJlLmZldGNoLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEhMUyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBbXCIjRVhUTTNVXCIsIFwiI0VYVC1YLVZFUlNJT046M1wiLCBcIiNFWFQtWC1UQVJHRVREVVJBVElPTjo2XCIsIFwiI0VYVC1YLU1FRElBLVNFUVVFTkNFOlwiXTtcclxuICAgICAgICB0aGlzLl9wbGF5bGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3NlcXVlbmNlID0gMDtcclxuICAgICAgICB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0ID0gW107XHJcbiAgICB9XHJcbiAgICAvL2FkZCBtM3U4IGxpbmtzIHdpdGggcXVhbGl0eSB0byB0aGUgbGlzdCBvZiBzZXJ2ZXJzXHJcbiAgICBhc3luYyBhZGRTdHJlYW1MaW5rKHRleHQsIHR5cGUgPSBcImxvY2FsXCIsIHNpZyA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eVVybFNwbGl0ID0gW107XHJcbiAgICAgICAgbGV0IGNhcHR1cmVBcnJheTtcclxuICAgICAgICBjb25zdCBSRUdFWCA9IC9OQU1FPVwiKCg/OlxcUytcXHMrXFxTK3xcXFMrKSlcIixBVVRPKD86XnxcXFMrXFxzKykoPzpefFxcUytcXHMrKShodHRwczpcXC9cXC92aWRlbyhcXFMrKS5tM3U4KS9nO1xyXG4gICAgICAgIHdoaWxlICgoY2FwdHVyZUFycmF5ID0gUkVHRVguZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcXVhbGl0eVVybFNwbGl0LnB1c2goeyBxdWFsaXR5OiBjYXB0dXJlQXJyYXlbMV0sIHVybDogY2FwdHVyZUFycmF5WzJdIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZyhxdWFsaXR5VXJsU3BsaXQpO1xyXG4gICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSB7IHNlcnZlcjogdHlwZSwgdXJsTGlzdDogcXVhbGl0eVVybFNwbGl0LCBzaWc6IHNpZyB9O1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QucHVzaChzdHJlYW1MaXN0KTtcclxuICAgICAgICBpZiAoIXNpZykge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNpZ25hdHVyZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGFzeW5jIHNpZ25hdHVyZSgpIHtcclxuICAgICAgICBjb25zdCBSRUdFWCA9IC92aWRlby13ZWF2ZXIuKC4qKS5obHMudHR2bncubmV0XFwvdjFcXC9wbGF5bGlzdFxcLyguKikubTN1OCQvZ207XHJcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHRoaXMuX3N0cmVhbVNlcnZlckxpc3RcclxuICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4geC5zaWcgPT0gZmFsc2UpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKGFzeW5jICh4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gUkVHRVguZXhlYyh4LnVybExpc3RbMF0udXJsKTtcclxuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vanVwdGVyLmdhL2hscy92Mi9zaWcvXCIgKyBtYXRjaFsyXSArIFwiL1wiICsgbWF0Y2hbMV0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHguc2lnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBnZXQgU3RyZWFtU2VydmVyTGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3RyZWFtU2VydmVyTGlzdDtcclxuICAgIH1cclxuICAgIGFkZFBsYXlsaXN0KHBsYXlsaXN0KSB7XHJcbiAgICAgICAgaWYgKHBsYXlsaXN0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IHBsYXlsaXN0LnRvU3RyaW5nKCkuc3BsaXQoL1tcXHJcXG5dLyk7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyWzRdID0gbGluZXNbNF07XHJcbiAgICAgICAgdGhpcy5faGVhZGVyWzVdID0gbGluZXNbNV07XHJcbiAgICAgICAgLy90YWtlIGFsbCBtM3U5IGNvbnRlbnQgdG8gdGhlIHBsYXlsaXN0IGFuZCBidWlsZCBhIG5ldyBmbG93XHJcbiAgICAgICAgZm9yIChjb25zdCBpIGluIGxpbmVzKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5lc1tpXS5pbmNsdWRlcyhcIiNFWFQtWC1QUk9HUkFNLURBVEUtVElNRTpcIikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcXVlbmNlVGltZXN0YW1wID0gTWF0aC5mbG9vcihuZXcgRGF0ZShsaW5lc1tpXS5zbGljZShsaW5lc1tpXS5sZW5ndGggLSAyNCwgbGluZXNbaV0ubGVuZ3RoKSkuZ2V0VGltZSgpIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByID0gdGhpcy5fcGxheWxpc3QuZmlsdGVyKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudGltZXN0YW1wID49IHNlcXVlbmNlVGltZXN0YW1wO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSB0aGlzLl9zZXF1ZW5jZSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGxpbmVzW3BhcnNlSW50KGkpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBzZXF1ZW5jZVRpbWVzdGFtcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mbzogbGluZXNbcGFyc2VJbnQoaSkgKyAxXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBsaW5lc1twYXJzZUludChpKSArIDJdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wbGF5bGlzdC5sZW5ndGggPiAxNSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hhbmdlZDtcclxuICAgIH1cclxuICAgIGdldEFsbFBsYXlsaXN0KCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5faGVhZGVyWzBdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclsxXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMl0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzNdICtcclxuICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzRdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls1XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5tYXAoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWUgKyBcIlxcblwiICsgeC5pbmZvICsgXCJcXG5cIiArIHgudXJsICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNFeFRMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZjM0pqTDBoTVV5NTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4TlFVRk5MRTlCUVU4c1IwRkJSenRKUVVGb1FqdFJRVU5WTEZsQlFVOHNSMEZCYTBJc1EwRkJReXhUUVVGVExFVkJRVVVzYTBKQlFXdENMRVZCUVVVc2VVSkJRWGxDTEVWQlFVVXNkMEpCUVhkQ0xFTkJRVU1zUTBGQlF6dFJRVU01Unl4alFVRlRMRWRCUVcxQ0xFVkJRVVVzUTBGQlF6dFJRVU12UWl4alFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRMlFzYzBKQlFXbENMRWRCUVcxQ0xFVkJRVVVzUTBGQlF6dEpRVFpIYWtRc1EwRkJRenRKUVROSFF5eHZSRUZCYjBRN1NVRkRjRVFzUzBGQlN5eERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRlpMRVZCUVVVc1NVRkJTU3hIUVVGSExFOUJRVThzUlVGQlJTeEhRVUZITEVkQlFVY3NTMEZCU3p0UlFVTXpSQ3hOUVVGTkxHVkJRV1VzUjBGQmFVSXNSVUZCUlN4RFFVRkRPMUZCUTNwRExFbEJRVWtzV1VGQmIwTXNRMEZCUXp0UlFVVjZReXhOUVVGTkxFdEJRVXNzUjBGQlJ5eHhSa0ZCY1VZc1EwRkJRenRSUVVWd1J5eFBRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkpMRVZCUVVVN1dVRkRha1FzWlVGQlpTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRTlCUVU4c1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSMEZCUnl4RlFVRkZMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdVMEZETVVVN1VVRkRSQ3hQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEdWQlFXVXNRMEZCUXl4RFFVRkRPMUZCUXpkQ0xFMUJRVTBzVlVGQlZTeEhRVUZITEVWQlFVVXNUVUZCVFN4RlFVRkZMRWxCUVVrc1JVRkJSU3hQUVVGUExFVkJRVVVzWlVGQlpTeEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVONFJTeEpRVUZKTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMUZCUlhoRExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdXVUZEVWl4TlFVRk5MRWxCUVVrc1EwRkJReXhUUVVGVExFVkJRVVVzUTBGQlF6dFRRVU40UWp0UlFVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRE8wbEJRMlFzUTBGQlF6dEpRVVZFTEV0QlFVc3NRMEZCUXl4VFFVRlRPMUZCUTJJc1RVRkJUU3hMUVVGTExFZEJRVWNzTmtSQlFUWkVMRU5CUVVNN1VVRkZOVVVzVFVGQlRTeEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFTkJRelZDTEVsQlFVa3NRMEZCUXl4cFFrRkJhVUk3WVVGRGJrSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SlFVRkpMRXRCUVVzc1EwRkJRenRoUVVOc1F5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVUwc1JVRkJSU3hGUVVGRk8xbEJRM2hDTEUxQlFVMHNTMEZCU3l4SFFVRXlRaXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZEYmtVc1NVRkJTU3hMUVVGTExFVkJRVVU3WjBKQlExUXNTVUZCU1R0dlFrRkRSaXhOUVVGTkxFTkJRVU1zUjBGQlJ5eE5RVUZOTEV0QlFVc3NRMEZCUXl3clFrRkJLMElzUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1IwRkJSeXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0M1FrRkRha1lzVFVGQlRTeEZRVUZGTEV0QlFVczdjVUpCUTJRc1EwRkJReXhEUVVGRE8yOUNRVU5JTEVOQlFVTXNRMEZCUXl4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRE8yOUNRVU5pTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRwUWtGRFpqdG5Ra0ZCUXl4TlFVRk5PMjlDUVVOT0xFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0cFFrRkRhRUk3WVVGRFJqdHBRa0ZCVFR0blFrRkRUQ3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdZVUZEYUVJN1VVRkRTQ3hEUVVGRExFTkJRVU1zUTBGRFRDeERRVUZETzBsQlEwb3NRMEZCUXp0SlFVVkVMRWxCUVVrc1owSkJRV2RDTzFGQlEyeENMRTlCUVU4c1NVRkJTU3hEUVVGRExHbENRVUZwUWl4RFFVRkRPMGxCUTJoRExFTkJRVU03U1VGRlJDeFhRVUZYTEVOQlFVTXNVVUZCWjBJN1VVRkRNVUlzU1VGQlNTeFJRVUZSTEV0QlFVc3NTVUZCU1N4RlFVRkZPMWxCUTNKQ0xFOUJRVThzUzBGQlN5eERRVUZETzFOQlEyUTdVVUZGUkN4SlFVRkpMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU03VVVGRmNFSXNUVUZCVFN4TFFVRkxMRWRCUVVjc1VVRkJVU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVOc1JDeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTXpRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVVV6UWl3MFJFRkJORVE3VVVGRE5VUXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExFVkJRVVU3V1VGRGNrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETERKQ1FVRXlRaXhEUVVGRExFVkJRVVU3WjBKQlEyeEVMRTFCUVUwc2FVSkJRV2xDTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVWMlNDeE5RVUZOTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZPMjlDUVVOd1F5eFBRVUZQTEVOQlFVTXNRMEZCUXl4VFFVRlRMRWxCUVVrc2FVSkJRV2xDTEVOQlFVTTdaMEpCUXpGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVVklMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZGTzI5Q1FVTmlMRWxCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4RFFVRkRMRU5CUVVNN2IwSkJRM0JETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRE8zZENRVU5zUWl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRlRUlzVTBGQlV5eEZRVUZGTEdsQ1FVRnBRanQzUWtGRE5VSXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPM2RDUVVNMVFpeEhRVUZITEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdjVUpCUXpWQ0xFTkJRVU1zUTBGQlF6dHZRa0ZEU0N4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE8ybENRVU5vUWp0aFFVTkdPMWxCUTBRc1QwRkJUeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNSMEZCUnl4RlFVRkZMRVZCUVVVN1owSkJRMnBETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03WVVGRGVFSTdVMEZEUmp0UlFVTkVMRTlCUVU4c1QwRkJUeXhEUVVGRE8wbEJRMnBDTEVOQlFVTTdTVUZGUkN4alFVRmpPMUZCUTFvc1QwRkJUeXhEUVVOTUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTU3hEUVVGRExGTkJRVk03V1VGRFpDeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlR0blFrRkRka0lzVDBGQlR5eERRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU4wUkN4RFFVRkRMRU5CUVVNc1EwRkRTQ3hEUVVGRE8wbEJRMG9zUTBGQlF6dERRVU5HSW4wPSIsImV4cG9ydCBmdW5jdGlvbiBjdXJyZW50KGNoYW5uZWwgPSBudWxsKSB7XHJcbiAgICBpZiAoY2hhbm5lbCkge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWwuY2hhbm5lbC5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IGNoYW5uZWwpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gZ2xvYmFsLmFjdHVhbENoYW5uZWwpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVkzVnljbVZ1ZEM1amFHRnVibVZzTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMMk5vWVc1dVpXd3ZZM1Z5Y21WdWRDNWphR0Z1Ym1Wc0xuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEUxQlFVMHNWVUZCVlN4UFFVRlBMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWs3U1VGRGNFTXNTVUZCU1N4UFFVRlBMRVZCUVVVN1VVRkRXQ3hQUVVGUExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRTlCUVU4c1EwRkJReXhEUVVGRE8wdEJRM1pFTzFOQlFVMDdVVUZEVEN4UFFVRlBMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeExRVUZMTEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRMUVVOd1JUdEJRVU5JTEVOQlFVTWlmUT09IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uU3RhcnQoX3dpbmRvdywgdXJsLCB0ZXh0IC8qIGlzT2ZmbGluZSA9IGZhbHNlICovKSB7XHJcbiAgICBjb25zdCByZWdleCA9IC9obHNcXC8oLiopLm0zdTgvZ207XHJcbiAgICBjb25zdCBtYXRjaCA9IHJlZ2V4LmV4ZWModXJsKSB8fCBbXTtcclxuICAgIGxldCBleGlzdGVudCA9IGZhbHNlO1xyXG4gICAgaWYgKG1hdGNoWzFdKSB7XHJcbiAgICAgICAgX3dpbmRvdy5hY3R1YWxDaGFubmVsID0gbWF0Y2hbMV07XHJcbiAgICAgICAgaWYgKF93aW5kb3cud2hpdGVsaXN0LmluY2x1ZGVzKG1hdGNoWzFdKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghX3dpbmRvdy5jaGFubmVsLmZpbmQoKGMpID0+IGMubmFtZSA9PT0gbWF0Y2hbMV0pKSB7XHJcbiAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJDaGFubmVsOiBcIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgX3dpbmRvdy5jaGFubmVsLnB1c2goeyBuYW1lOiBtYXRjaFsxXSwgZmxvd1NpZzogW10sIGhsczogbmV3IF93aW5kb3cuSExTKCkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXhpc3Q6IFwiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICBleGlzdGVudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIF93aW5kb3cuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICBnbG9iYWwuY3VycmVudENoYW5uZWwobWF0Y2hbMV0pLmhscy5hZGRTdHJlYW1MaW5rKHRleHQpO1xyXG4gICAgX3dpbmRvdy5Mb2dQcmludChcIkxvY2FsIFNlcnZlcjogT0tcIik7XHJcbiAgICBpZiAoZXhpc3RlbnQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIGdsb2JhbC5uZXdQaWN0dXJlKGdsb2JhbC5hY3R1YWxDaGFubmVsKS50aGVuKCh0ZXh0UGljdHVyZSkgPT4ge1xyXG4gICAgICAgIGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dFBpY3R1cmUsIFwicGljdHVyZVwiLCB0cnVlKTtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXIgNDgwcDogT0tcIik7XHJcbiAgICB9KTtcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICBnbG9iYWwubmV3RXh0ZXJuYWwoZ2xvYmFsLmFjdHVhbENoYW5uZWwpLnRoZW4oKHRleHQpID0+IGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dCwgXCJwcm94eVwiLCB0cnVlKSk7XHJcbiAgICByZXR1cm47XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHF1YWxpdHlVcmxTcGxpdCA9IHRleHQuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgIGNvbnN0IHNlcnZlciA9IHF1YWxpdHlVcmxTcGxpdC5zaGlmdCgpO1xyXG4gICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSB7IHNlcnZlcjogXCJwcm94eVwiLCB1cmxMaXN0OiBbXSB9O1xyXG4gICAgICAgIHF1YWxpdHlVcmxTcGxpdC5mb3JFYWNoKChlbGVtZW50LCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKCEoaW5kZXggJSAyKSkge1xyXG4gICAgICAgICAgICAgICAgc3RyZWFtTGlzdC51cmxMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6IHN0cmVhbUxpc3QudXJsTGlzdC5zb21lKCh4KSA9PiB4LnF1YWxpdHkgPT0gZWxlbWVudCkgPyBlbGVtZW50ICsgXCJwMzBcIiA6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vdmlkZW8td2VhdmVyLlwiICsgc2VydmVyICsgXCIuaGxzLnR0dm53Lm5ldC92MS9wbGF5bGlzdC9cIiArIGFycmF5W2luZGV4ICsgMV0gKyBcIi5tM3U4XCIsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgX3dpbmRvdy5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gbWF0Y2hbMV0pLmhscy5hZGQoc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogT0tcIik7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoZSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYjI0dVkyaGhibTVsYkM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTlqYUdGdWJtVnNMMjl1TG1Ob1lXNXVaV3d1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hQUVVGUExFTkJRVU1zVDBGQlR5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SlFVRkpMRU5CUVVNc2RVSkJRWFZDTzBsQlEzUkZMRTFCUVUwc1MwRkJTeXhIUVVGSExHdENRVUZyUWl4RFFVRkRPMGxCUTJwRExFMUJRVTBzUzBGQlN5eEhRVUY1UWl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0SlFVTXhSQ3hKUVVGSkxGRkJRVkVzUjBGQlJ5eExRVUZMTEVOQlFVTTdTVUZGY2tJc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVTdVVUZEV2l4UFFVRlBMRU5CUVVNc1lVRkJZU3hIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTnFReXhKUVVGSkxFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTzFsQlEzaERMRTlCUVU4N1UwRkRVanRSUVVWRUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0WlFVTnlSQ3hQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEZkQlFWY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU42UXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzVDBGQlR5eEZRVUZGTEVWQlFVVXNSVUZCUlN4SFFVRkhMRVZCUVVVc1NVRkJTU3hQUVVGUExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMU5CUXk5Rk8yRkJRVTA3V1VGRFRDeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjJReXhSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETzFOQlEycENPMHRCUTBZN1NVRkRSQ3huUkVGQlowUTdTVUZGYUVRc1owUkJRV2RFTzBsQlEyaEVMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zZFVKQlFYVkNMRU5CUVVNc1EwRkJRenRKUVVNeFF5eE5RVUZOTEVOQlFVTXNZMEZCWXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03U1VGRGVFUXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4RFFVRkRPMGxCUlhKRExFbEJRVWtzVVVGQlVUdFJRVUZGTEU5QlFVODdTVUZGY2tJc1owUkJRV2RFTzBsQlJXaEVMR2RFUVVGblJEdEpRVU5vUkN4TlFVRk5MRU5CUVVNc1ZVRkJWU3hEUVVGRExFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVVzUlVGQlJUdFJRVU16UkN4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhoUVVGaExFTkJRVU1zVjBGQlZ5eEZRVUZGTEZOQlFWTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOb1JpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMSFZDUVVGMVFpeERRVUZETEVOQlFVTTdTVUZETTBNc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRlNDeG5SRUZCWjBRN1NVRkZhRVFzWjBSQlFXZEVPMGxCUldoRUxFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNUVUZCVFN4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExHTkJRV01zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NSVUZCUlN4UFFVRlBMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVVZvU1N4UFFVRlBPMGxCUlZBc1NVRkJTVHRSUVVOR0xFMUJRVTBzWlVGQlpTeEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03VVVGRGVFTXNUVUZCVFN4TlFVRk5MRWRCUVVjc1pVRkJaU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzFGQlJYWkRMRTFCUVUwc1ZVRkJWU3hIUVVGbExFVkJRVVVzVFVGQlRTeEZRVUZGTEU5QlFVOHNSVUZCUlN4UFFVRlBMRVZCUVVVc1JVRkJSU3hGUVVGRkxFTkJRVU03VVVGRGFFVXNaVUZCWlN4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeExRVUZMTEVWQlFVVXNTMEZCU3l4RlFVRkZMRVZCUVVVN1dVRkRhRVFzU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRk8yZENRVU5vUWl4VlFVRlZMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF6dHZRa0ZEZEVJc1QwRkJUeXhGUVVGRkxGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUE8yOUNRVU42Uml4SFFVRkhMRVZCUVVVc2RVSkJRWFZDTEVkQlFVY3NUVUZCVFN4SFFVRkhMRFpDUVVFMlFpeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzVDBGQlR6dHBRa0ZEYmtjc1EwRkJReXhEUVVGRE8yRkJRMG83VVVGRFNDeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVklMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZETjBJc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEV0QlFVc3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVWeVJTeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMSEZDUVVGeFFpeERRVUZETEVOQlFVTTdTMEZEZWtNN1NVRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdFJRVU5XTEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UzBGRGNrSTdRVUZEU0N4RFFVRkRJbjA9IiwiLy9leHRlcm5hbCByZXF1ZXN0IHRocm91aGcgcHVycGxlIHNlcnZlclxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXh0ZXJuYWwoY2hhbm5lbE5hbWUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChcImh0dHBzOi8vanVwdGVyLmdhL3Rlc3QvXCIgKyBjaGFubmVsTmFtZSk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXJ2ZXIgcHJveHkgcmV0dXJuIGVycm9yIG9yIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJFeHRlcm5hbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoZSk7XHJcbiAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWlhoMFpYSnVZV3d1Wm1WMFkyZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdlptVjBZMmd2WlhoMFpYSnVZV3d1Wm1WMFkyZ3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc2QwTkJRWGRETzBGQlEzaERMRTFCUVUwc1EwRkJReXhMUVVGTExGVkJRVlVzVVVGQlVTeERRVUZETEZkQlFXMUNPMGxCUTJoRUxFbEJRVWs3VVVGRFJpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMREJDUVVFd1FpeERRVUZETEVOQlFVTTdVVUZETlVNc1RVRkJUU3hSUVVGUkxFZEJRV0VzVFVGQlRTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMSGxDUVVGNVFpeEhRVUZITEZkQlFWY3NRMEZCUXl4RFFVRkRPMUZCUlROR0xFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNSVUZCUlN4RlFVRkZPMWxCUTJoQ0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNkME5CUVhkRExFTkJRVU1zUTBGQlF6dFRRVU16UkR0UlFVVkVMRTFCUVUwc1NVRkJTU3hIUVVGWExFMUJRVTBzVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMUZCUlRORExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNjVUpCUVhGQ0xFTkJRVU1zUTBGQlF6dFJRVVYyUXl4UFFVRlBMRWxCUVVrc1EwRkJRenRMUVVOaU8wbEJRVU1zVDBGQlR5eERRVUZETEVWQlFVVTdVVUZEVml4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlEyNUNMRTlCUVU4c1JVRkJSU3hEUVVGRE8wdEJRMWc3UVVGRFNDeERRVUZESW4wPSIsImV4cG9ydCBmdW5jdGlvbiBpbmZsYXRlRmV0Y2goX3dpbmRvdykge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWdsb2JhbC1hc3NpZ25cclxuICAgIF93aW5kb3cuZmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWYgKHVybC5lbmRzV2l0aChcIi50c1wiKSkge1xyXG4gICAgICAgICAgICAgICAgLy92YXIgcCA9IGNoYW5uZWwuZmluZCh4ID0+IHgubmFtZSA9PT0gYWN0dWFsQ2hhbm5lbCkuaGxzLmdldFBsYXlsaXN0QnlVcmwodXJsKTtcclxuICAgICAgICAgICAgICAgIC8vdmFyIHBwID0gY2hhbm5lbC5maW5kKHggPT4geC5uYW1lID09PSBhY3R1YWxDaGFubmVsKS5obHMuZ2V0QWxsUGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgIC8vTG9nUHJpbnQoXCJ0cyB0aW1lc3RhbXA6IFwiICsgcFswXS50aW1lc3RhbXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1cmwuZW5kc1dpdGgoXCJtM3U4XCIpICYmIHVybC5pbmNsdWRlcyhcInR0dm53Lm5ldFwiKSAmJiAhX3dpbmRvdy53aGl0ZWxpc3QuaW5jbHVkZXMoX3dpbmRvdy5hY3R1YWxDaGFubmVsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc0ZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhd2FpdCBvbkJlZm9yZUZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF93aW5kb3cucmVhbEZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dpbmRvdy5vbkZldGNoKF93aW5kb3csIHRleHQsIHVybCkudGhlbihmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWxpc3QgPSBnbG9iYWwuY3VycmVudENoYW5uZWwoKS5obHMuZ2V0QWxsUGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UocGxheWxpc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NGZXRjaCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcyhcInVzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIpICYmICF1cmwuaW5jbHVkZXMoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVybCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzRmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF93aW5kb3cucmVhbEZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGFzeW5jIGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF93aW5kb3cub25TdGFydENoYW5uZWwoX3dpbmRvdywgdXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UodGV4dCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcImNoYW5uZWwgb2ZmbGluZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRmV0Y2godXJsKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIikpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3dpbmRvdy5yZWFsRmV0Y2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWm1WMFkyZ3VhVzVtYkdGMFpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5bVpYUmphQzltWlhSamFDNXBibVpzWVhSbExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEUxQlFVMHNWVUZCVlN4WlFVRlpMRU5CUVVNc1QwRkJUenRKUVVOc1F5dzBRMEZCTkVNN1NVRkROVU1zVDBGQlR5eERRVUZETEV0QlFVc3NSMEZCUnl4TFFVRkxMRmRCUVZjc1IwRkJSeXhGUVVGRkxFOUJRVTg3VVVGRE1VTXNTVUZCU1N4UFFVRlBMRWRCUVVjc1MwRkJTeXhSUVVGUkxFVkJRVVU3V1VGRE0wSXNTVUZCU1N4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTzJkQ1FVTjJRaXhuUmtGQlowWTdaMEpCUTJoR0xEUkZRVUUwUlR0blFrRkROVVVzT0VOQlFUaERPMkZCUXk5RE8xbEJSVVFzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExFVkJRVVU3WjBKQlF6TkhMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zVlVGQlZTeFBRVUZQTEVWQlFVVXNUVUZCVFR0dlFrRkRNVU1zU1VGQlNTeFpRVUZaTEVkQlFVY3NTMEZCU3l4WFFVRlhMRWRCUVVjN2QwSkJRM0JETERSQ1FVRTBRanQzUWtGRE5VSXNUVUZCVFN4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hSUVVGUk96UkNRVU16UkN4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNTVUZCU1R0blEwRkRha01zVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRVZCUVVVc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNN2IwTkJRMnhFTEVsQlFVa3NVVUZCVVN4SFFVRkhMRTFCUVUwc1EwRkJReXhqUVVGakxFVkJRVVVzUTBGQlF5eEhRVUZITEVOQlFVTXNZMEZCWXl4RlFVRkZMRU5CUVVNN2IwTkJRelZFTEU5QlFVOHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzJkRFFVTnNReXhEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEVEN4RFFVRkRMRU5CUVVNc1EwRkJRenQzUWtGRFRDeERRVUZETEVOQlFVTXNRMEZCUXp0dlFrRkRUQ3hEUVVGRExFTkJRVU03YjBKQlEwWXNXVUZCV1N4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU53UWl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVOS08xbEJSVVFzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMR3REUVVGclF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExHOUNRVUZ2UWl4RFFVRkRMRVZCUVVVN1owSkJRek5HTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WjBKQlEycENMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zVlVGQlZTeFBRVUZQTEVWQlFVVXNUVUZCVFR0dlFrRkRNVU1zU1VGQlNTeFpRVUZaTEVkQlFVY3NTMEZCU3l4WFFVRlhMRWRCUVVjN2QwSkJRM0JETEUxQlFVMHNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1VVRkJVVHMwUWtGRE0wUXNTVUZCU1N4UlFVRlJMRU5CUVVNc1JVRkJSU3hGUVVGRk8yZERRVU5tTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eFhRVUZYTEVsQlFVazdiME5CUTNaRExFMUJRVTBzVDBGQlR5eERRVUZETEdOQlFXTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1IwRkJSeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzI5RFFVTnFSQ3hQUVVGUExFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRuUTBGRE9VSXNRMEZCUXl4RFFVRkRMRU5CUVVNN05rSkJRMG83YVVOQlFVMDdaME5CUTB3c1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzJkRFFVTnNRaXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFTkJRVU03TmtKQlEzSkRPM2RDUVVOSUxFTkJRVU1zUTBGQlF5eERRVUZETzI5Q1FVTk1MRU5CUVVNc1EwRkJRenR2UWtGRFJpeFpRVUZaTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1owSkJRM0JDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMkZCUTBvN1dVRkZSQ3hKUVVGSkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNiMEpCUVc5Q0xFTkJRVU1zUlVGQlJUdGhRVU4yUXp0VFFVTkdPMUZCUlVRc1QwRkJUeXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU03U1VGRGJFUXNRMEZCUXl4RFFVRkRPMEZCUTBvc1EwRkJReUo5IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uKF93aW5kb3csIHJlc3BvbnNlLCB1cmwpIHtcclxuICAgIC8vICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuNSApe1xyXG4gICAgLy8gICAgICByZXNwb25zZSArPSBcInR3aXRjaC1jbGllbnQtYWRcIjtcclxuICAgIC8vICB9XHJcbiAgICBjb25zdCBjaGFubmVsQ3VycmVudCA9IGF3YWl0IGdsb2JhbC5jdXJyZW50Q2hhbm5lbCgpO1xyXG4gICAgLy9pZiBhZHMgZmluZCBvbiBtYWluIGxpbmsgY2FsbGVkIGZyb20gdHdpdGNoIGFwaSBwbGF5ZXJcclxuICAgIGlmIChnbG9iYWwuaXNBZHMocmVzcG9uc2UpKSB7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiYWRzIGZvdW5kXCIpO1xyXG4gICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZ2V0UXVhbGl0eVwiLFxyXG4gICAgICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBnbG9iYWwucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICB0eXBlOiBcInJlbG9hZFwiLFxyXG4gICAgICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBxdWFsaXR5ID0gZ2xvYmFsLnF1YWxpdHk7XHJcbiAgICAgICAgY29uc3QgU3RyZWFtU2VydmVyTGlzdCA9IGNoYW5uZWxDdXJyZW50Lmhscy5TdHJlYW1TZXJ2ZXJMaXN0O1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChxdWFsaXR5KTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvL3RyeSBhbGwgaGxzIHNpZ3MgdGhhdCBoYXZlIG9uIFN0cmVhbVNlcnZlckxpc3QgZnJvbSBITFNcclxuICAgICAgICAgICAgaWYgKFN0cmVhbVNlcnZlckxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJveHkgPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbmQoKHgpID0+IHguc2VydmVyID09IFwicHJveHlcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByb3h5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IHByb3h5LnVybExpc3QuZmluZCgoYSkgPT4gYS5xdWFsaXR5ID09IHF1YWxpdHkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgcmV0dXJubzIgPSBhd2FpdCBnbG9iYWwucmVhbEZldGNoKHVybC51cmwpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJldHVybm9UZXh0ID0gYXdhaXQgcmV0dXJubzIudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdsb2JhbC5pc0FkcyhyZXR1cm5vVGV4dCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJhZHMgb24gcHJveHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmV0dXJub1RleHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vZ2VyYSBlcnJvIHNlIG5hbyB0aXZlciBsaW5rXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG0zdTggdmFsaWQgdXJsIGZvdW5kIG9uIFN0cmVhbVNlcnZlckxpc3RcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIC8vaWYgbm90aGluZyByZXNvbHZlLCByZXR1cm4gNDgwcCBmbG93XHJcbiAgICAgICAgICAgIGNvbnN0IHBpY3R1cmVTdHJlYW0gPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbHRlcigoeCkgPT4geC5zZXJ2ZXIgPT0gXCJwaWN0dXJlXCIpLm1hcCgoeCkgPT4geC51cmxMaXN0LmZpbmQoKHgpID0+IHgucXVhbGl0eS5pbmNsdWRlcyhcIjQ4MFwiKSkpWzBdLnVybDtcclxuICAgICAgICAgICAgY29uc3QgcmV0dXJubyA9IGF3YWl0IChhd2FpdCBnbG9iYWwucmVhbEZldGNoKHBpY3R1cmVTdHJlYW0pKS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIjQ4MFBcIik7XHJcbiAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChlKTtcclxuICAgICAgICAgICAgY2hhbm5lbEN1cnJlbnQuaGxzLmFkZFBsYXlsaXN0KHJldHVybm8pO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmVzcG9uc2UpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWIyNHVabVYwWTJndWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12Wm1WMFkyZ3ZiMjR1Wm1WMFkyZ3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFdEJRVXNzVlVGQlZTeEZRVUZGTEVOQlFVTXNUMEZCVHl4RlFVRkZMRkZCUVZFc1JVRkJSU3hIUVVGSE8wbEJRemRETERoQ1FVRTRRanRKUVVNNVFpeDFRMEZCZFVNN1NVRkRka01zUzBGQlN6dEpRVVZNTEUxQlFVMHNZMEZCWXl4SFFVRkhMRTFCUVUwc1RVRkJUU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETzBsQlJYSkVMSGRFUVVGM1JEdEpRVU40UkN4SlFVRkpMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVTdVVUZETVVJc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0UlFVVTNRaXhOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETzFsQlEycENMRWxCUVVrc1JVRkJSU3haUVVGWk8xbEJRMnhDTEV0QlFVc3NSVUZCUlN4SlFVRkpPMU5CUTFvc1EwRkJReXhEUVVGRE8xRkJSVWdzVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXp0WlFVTnFRaXhKUVVGSkxFVkJRVVVzVVVGQlVUdFpRVU5rTEV0QlFVc3NSVUZCUlN4SlFVRkpPMU5CUTFvc1EwRkJReXhEUVVGRE8xRkJSVWdzVFVGQlRTeFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJRenRSUVVNdlFpeE5RVUZOTEdkQ1FVRm5RaXhIUVVGSExHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU03VVVGRk4wUXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFJRVVY2UWl4SlFVRkpPMWxCUTBZc2VVUkJRWGxFTzFsQlEzcEVMRWxCUVVrc1owSkJRV2RDTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1JVRkJSVHRuUWtGREwwSXNUVUZCVFN4TFFVRkxMRWRCUVRKQ0xHZENRVUZuUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF6dG5Ra0ZGZUVZc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJUdHZRa0ZEVml4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN2FVSkJRMmhGTzJkQ1FVVkVMRTFCUVUwc1IwRkJSeXhIUVVFeVFpeExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF6dG5Ra0ZGY0VZc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJUdHZRa0ZEVWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN2FVSkJRMmhGTzJkQ1FVVkVMRTFCUVUwc1VVRkJVU3hIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WjBKQlEycEVMRWxCUVVrc1YwRkJWeXhIUVVGSExFMUJRVTBzVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMmRDUVVWNFF5eEpRVUZKTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1YwRkJWeXhEUVVGRExFVkJRVVU3YjBKQlF6ZENMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zWTBGQll5eERRVUZETEVOQlFVTTdiMEpCUTJoRExFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNOa05CUVRaRExFTkJRVU1zUTBGQlF6dHBRa0ZEYUVVN1owSkJSVVFzVDBGQlR5eGpRVUZqTEVOQlFVTXNSMEZCUnl4RFFVRkRMRmRCUVZjc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dGhRVU53UkR0WlFVVkVMRFpDUVVFMlFqdFpRVU0zUWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN1UwRkRhRVU3VVVGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0WlFVTldMSE5EUVVGelF6dFpRVU4wUXl4TlFVRk5MR0ZCUVdFc1IwRkJSeXhuUWtGQlowSXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWxCUVVrc1UwRkJVeXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkRjRVlzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlEycEVMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETzFsQlJWUXNUVUZCVFN4UFFVRlBMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFsQlJYSkZMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdXVUZEZUVJc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTnVRaXhqUVVGakxFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRaUVVONFF5eFBRVUZQTEVsQlFVa3NRMEZCUXp0VFFVTmlPMHRCUTBZN1UwRkJUVHRSUVVOTUxHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNWMEZCVnl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJRM3BETEU5QlFVOHNTVUZCU1N4RFFVRkRPMHRCUTJJN1FVRkRTQ3hEUVVGREluMD0iLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gcGljdHVyZShjaGFubmVsTmFtZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBncWwgPSBhd2FpdCBnbG9iYWwucmVhbEZldGNoKFwiaHR0cHM6Ly9ncWwudHdpdGNoLnR2L2dxbFwiLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJDbGllbnQtSURcIjogXCJraW1uZTc4a3gzbmN4NmJyZ280bXY2d2tpNWgxa29cIiB9LFxyXG4gICAgICAgICAgICBib2R5OiBge1wib3BlcmF0aW9uTmFtZVwiOlwiUGxheWJhY2tBY2Nlc3NUb2tlblwiLFwidmFyaWFibGVzXCI6e1wiaXNMaXZlXCI6dHJ1ZSxcImxvZ2luXCI6XCIke2NoYW5uZWxOYW1lfVwiLFwiaXNWb2RcIjpmYWxzZSxcInZvZElEXCI6XCJcIixcInBsYXllclR5cGVcIjpcInRodW5kZXJkb21lXCJ9LFwiZXh0ZW5zaW9uc1wiOntcInBlcnNpc3RlZFF1ZXJ5XCI6e1widmVyc2lvblwiOjEsXCJzaGEyNTZIYXNoXCI6XCIwODI4MTE5ZGVkMWMxMzQ3Nzk2NjQzNGUxNTgwMGZmNTdkZGFjZjEzYmExOTExYzEyOWRjMjIwMDcwNWIwNzEyXCJ9fX1gLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGdxbC5qc29uKCk7XHJcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3VzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIgK1xyXG4gICAgICAgICAgICBjaGFubmVsTmFtZSArXHJcbiAgICAgICAgICAgIFwiLm0zdTg/YWxsb3dfc291cmNlPXRydWUmZmFzdF9icmVhZD10cnVlJnA9XCIgK1xyXG4gICAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxZTcpICtcclxuICAgICAgICAgICAgXCImcGxheWVyX2JhY2tlbmQ9bWVkaWFwbGF5ZXImcGxheWxpc3RfaW5jbHVkZV9mcmFtZXJhdGU9dHJ1ZSZyZWFzc2lnbm1lbnRzX3N1cHBvcnRlZD1mYWxzZSZzaWc9XCIgK1xyXG4gICAgICAgICAgICBzdGF0dXNbXCJkYXRhXCJdW1wic3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlblwiXVtcInNpZ25hdHVyZVwiXSArXHJcbiAgICAgICAgICAgIFwiJnN1cHBvcnRlZF9jb2RlY3M9YXZjMSZ0b2tlbj1cIiArXHJcbiAgICAgICAgICAgIHN0YXR1c1tcImRhdGFcIl1bXCJzdHJlYW1QbGF5YmFja0FjY2Vzc1Rva2VuXCJdW1widmFsdWVcIl07XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IChhd2FpdCBnbG9iYWwucmVhbEZldGNoKHVybCkpLnRleHQoKTtcclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0dsamRIVnlaUzVtWlhSamFDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5bVpYUmphQzl3YVdOMGRYSmxMbVpsZEdOb0xuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEUxQlFVMHNRMEZCUXl4TFFVRkxMRlZCUVZVc1QwRkJUeXhEUVVGRExGZEJRVzFDTzBsQlF5OURMRWxCUVVrN1VVRkRSaXhOUVVGTkxFZEJRVWNzUjBGQlJ5eE5RVUZOTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc01rSkJRVEpDTEVWQlFVVTdXVUZET1VRc1RVRkJUU3hGUVVGRkxFMUJRVTA3V1VGRFpDeFBRVUZQTEVWQlFVVXNSVUZCUlN4WFFVRlhMRVZCUVVVc1owTkJRV2RETEVWQlFVVTdXVUZETVVRc1NVRkJTU3hGUVVGRkxEaEZRVUU0UlN4WFFVRlhMSFZNUVVGMVREdFRRVU4yVWl4RFFVRkRMRU5CUVVNN1VVRkZTQ3hOUVVGTkxFMUJRVTBzUjBGQlZ5eE5RVUZOTEVkQlFVY3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRSUVVWNFF5eE5RVUZOTEVkQlFVY3NSMEZEVUN3d1EwRkJNRU03V1VGRE1VTXNWMEZCVnp0WlFVTllMRFJEUVVFMFF6dFpRVU0xUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZCUnl4SFFVRkhMRU5CUVVNN1dVRkRMMElzWjBkQlFXZEhPMWxCUTJoSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl3eVFrRkJNa0lzUTBGQlF5eERRVUZETEZkQlFWY3NRMEZCUXp0WlFVTjRSQ3dyUWtGQkswSTdXVUZETDBJc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETERKQ1FVRXlRaXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdVVUZGZGtRc1RVRkJUU3hKUVVGSkxFZEJRVWNzVFVGQlRTeERRVUZETEUxQlFVMHNUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMUZCUTNoRUxFOUJRVThzU1VGQlNTeERRVUZETzB0QlEySTdTVUZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRSUVVOV0xFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1MwRkRhRUk3UVVGRFNDeERRVUZESW4wPSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBpbmZsYXRlRmV0Y2ggfSBmcm9tIFwiLi9mZXRjaC9mZXRjaC5pbmZsYXRlXCI7XHJcbmltcG9ydCB7IEhMUyB9IGZyb20gXCIuL0hMU1wiO1xyXG5pbXBvcnQgeyBvblN0YXJ0IH0gZnJvbSBcIi4vY2hhbm5lbC9vbi5jaGFubmVsXCI7XHJcbmltcG9ydCB7IG9uIH0gZnJvbSBcIi4vZmV0Y2gvb24uZmV0Y2hcIjtcclxuaW1wb3J0IHsgY3VycmVudCB9IGZyb20gXCIuL2NoYW5uZWwvY3VycmVudC5jaGFubmVsXCI7XHJcbmltcG9ydCB7IHBpY3R1cmUgfSBmcm9tIFwiLi9mZXRjaC9waWN0dXJlLmZldGNoXCI7XHJcbmltcG9ydCB7IGV4dGVybmFsIH0gZnJvbSBcIi4vZmV0Y2gvZXh0ZXJuYWwuZmV0Y2hcIjtcclxuZXhwb3J0IGZ1bmN0aW9uIGFwcChzY29wZSkge1xyXG4gICAgc2NvcGUuTG9nUHJpbnQgPSAoeCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiW1B1cnBsZV06IFwiLCB4KTtcclxuICAgIH07XHJcbiAgICBzY29wZS5pc0FkcyA9ICh4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInN0aXRjaGVkLWFkXCIpIHx8IHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInR3aXRjaC1jbGllbnQtYWRcIik7XHJcbiAgICB9O1xyXG4gICAgc2NvcGUucmVhbEZldGNoID0gZmV0Y2g7XHJcbiAgICBzY29wZS5xdWFsaXR5ID0gXCJcIjtcclxuICAgIHNjb3BlLndoaXRlbGlzdCA9IFtdO1xyXG4gICAgLy9yZWNlaXZlIG1lc3NhZ2UgZnJvbSB3aW5kb3dcclxuICAgIHNjb3BlLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgc3dpdGNoIChlLmRhdGEuZnVuY05hbWUpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUucXVhbGl0eSA9IGUuZGF0YS5hcmdzWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKGUuZGF0YS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRXaGl0ZWxpc3RcIjoge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUuZGF0YS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLndoaXRlbGlzdCA9IGUuZGF0YS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRRdWFsaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnF1YWxpdHkgPSBlLmRhdGEudmFsdWUubmFtZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzY29wZS5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogXCJpbml0XCIsXHJcbiAgICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICB9KTtcclxuICAgIHNjb3BlLmNoYW5uZWwgPSBbXTtcclxuICAgIHNjb3BlLmFjdHVhbENoYW5uZWwgPSBcIlwiO1xyXG4gICAgc2NvcGUuY3VycmVudENoYW5uZWwgPSBjdXJyZW50O1xyXG4gICAgc2NvcGUubmV3UGljdHVyZSA9IHBpY3R1cmU7XHJcbiAgICBzY29wZS5uZXdFeHRlcm5hbCA9IGV4dGVybmFsO1xyXG4gICAgc2NvcGUudHVubmVsID0gbnVsbDtcclxuICAgIHNjb3BlLm9uRmV0Y2ggPSBvbjtcclxuICAgIHNjb3BlLm9uU3RhcnRDaGFubmVsID0gb25TdGFydDtcclxuICAgIHNjb3BlLkhMUyA9IEhMUztcclxuICAgIGluZmxhdGVGZXRjaChzY29wZSk7XHJcbn1cclxuYXBwKHNlbGYpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwyRndjQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNXVUZCV1N4RlFVRkZMRTFCUVUwc2RVSkJRWFZDTEVOQlFVTTdRVUZEY2tRc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeE5RVUZOTEU5QlFVOHNRMEZCUXp0QlFVTTFRaXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNjMEpCUVhOQ0xFTkJRVU03UVVGREwwTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hOUVVGTkxHdENRVUZyUWl4RFFVRkRPMEZCUTNSRExFOUJRVThzUlVGQlJTeFBRVUZQTEVWQlFVVXNUVUZCVFN3eVFrRkJNa0lzUTBGQlF6dEJRVU53UkN4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRkxFMUJRVTBzZFVKQlFYVkNMRU5CUVVNN1FVRkRhRVFzVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4TlFVRk5MSGRDUVVGM1FpeERRVUZETzBGQlJXeEVMRTFCUVUwc1ZVRkJWU3hIUVVGSExFTkJRVU1zUzBGQlZUdEpRVU0xUWl4TFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExFTkJRVU1zUTBGQlRTeEZRVUZGTEVWQlFVVTdVVUZETVVJc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFpRVUZaTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRMMElzUTBGQlF5eERRVUZETzBsQlJVWXNTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVk1zUlVGQlJTeEZRVUZGTzFGQlF6RkNMRTlCUVU4c1EwRkJReXhEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMR3RDUVVGclFpeERRVUZETEVOQlFVTTdTVUZETTBZc1EwRkJReXhEUVVGRE8wbEJSVVlzUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUnl4TFFVRkxMRU5CUVVNN1NVRkRlRUlzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4RlFVRkZMRU5CUVVNN1NVRkRia0lzUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUnl4RlFVRkZMRU5CUVVNN1NVRkZja0lzTmtKQlFUWkNPMGxCUXpkQ0xFdEJRVXNzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhUUVVGVExFVkJRVVVzVlVGQlZTeERRVUZETzFGQlF6TkRMRkZCUVZFc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVTdXVUZEZGtJc1MwRkJTeXhaUVVGWkxFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtJc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTTdaMEpCUTNCRExFMUJRVTA3WVVGRFVEdFpRVU5FTEU5QlFVOHNRMEZCUXl4RFFVRkRPMmRDUVVOUUxFMUJRVTA3WVVGRFVEdFRRVU5HTzFGQlJVUXNVVUZCVVN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJUdFpRVU51UWl4TFFVRkxMR05CUVdNc1EwRkJReXhEUVVGRE8yZENRVU51UWl4SlFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZETzI5Q1FVTmtMRXRCUVVzc1EwRkJReXhUUVVGVExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNN2FVSkJRMmhETzJkQ1FVTkVMRTFCUVUwN1lVRkRVRHRaUVVORUxFdEJRVXNzV1VGQldTeERRVUZETEVOQlFVTTdaMEpCUTJwQ0xFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETzJkQ1FVTnNReXhOUVVGTk8yRkJRMUE3V1VGRFJDeFBRVUZQTEVOQlFVTXNRMEZCUXp0blFrRkRVQ3hOUVVGTk8yRkJRMUE3VTBGRFJqdEpRVU5JTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUlVnc1MwRkJTeXhEUVVGRExGZEJRVmNzUTBGQlF6dFJRVU5vUWl4SlFVRkpMRVZCUVVVc1RVRkJUVHRSUVVOYUxFdEJRVXNzUlVGQlJTeEpRVUZKTzB0QlExb3NRMEZCUXl4RFFVRkRPMGxCUlVnc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVTTdTVUZEYmtJc1MwRkJTeXhEUVVGRExHRkJRV0VzUjBGQlJ5eEZRVUZGTEVOQlFVTTdTVUZEZWtJc1MwRkJTeXhEUVVGRExHTkJRV01zUjBGQlJ5eFBRVUZQTEVOQlFVTTdTVUZGTDBJc1MwRkJTeXhEUVVGRExGVkJRVlVzUjBGQlJ5eFBRVUZQTEVOQlFVTTdTVUZETTBJc1MwRkJTeXhEUVVGRExGZEJRVmNzUjBGQlJ5eFJRVUZSTEVOQlFVTTdTVUZETjBJc1MwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTTdTVUZGY0VJc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVTTdTVUZEYmtJc1MwRkJTeXhEUVVGRExHTkJRV01zUjBGQlJ5eFBRVUZQTEVOQlFVTTdTVUZGTDBJc1MwRkJTeXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVTTdTVUZGYUVJc1dVRkJXU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzBGQlEzUkNMRU5CUVVNN1FVRkRSQ3hIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTWlmUT09Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9