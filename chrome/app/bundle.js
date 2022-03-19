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
        this._header = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", "#EXT-X-MEDIA-SEQUENCE:6"];
        this._playlist = [];
        this._sequence = 0;
        this._streamServerList = [];
    }
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
    StreamServerListSet(value) {
        this._streamServerList.push(value);
    }
    addPlaylist(playlist) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0hMUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sR0FBRztJQUFoQjtRQUNVLFlBQU8sR0FBa0IsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztRQUMvRyxjQUFTLEdBQW1CLEVBQUUsQ0FBQztRQUMvQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2Qsc0JBQWlCLEdBQW1CLEVBQUUsQ0FBQztJQStHakQsQ0FBQztJQTdHQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsT0FBTyxFQUFFLEdBQUcsR0FBRyxLQUFLO1FBQzNELE1BQU0sZUFBZSxHQUFpQixFQUFFLENBQUM7UUFDekMsSUFBSSxZQUFvQyxDQUFDO1FBRXpDLE1BQU0sS0FBSyxHQUFHLHFGQUFxRixDQUFDO1FBRXBHLE9BQU8sQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUMvQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM1RTtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDN0IsTUFBTSxVQUFVLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3hFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNSLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxJ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

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVudC5jaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NoYW5uZWwvY3VycmVudC5jaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUk7SUFDbEMsSUFBRyxPQUFPLEVBQUM7UUFDUCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDO0tBQ3pEO1NBQUk7UUFDRCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUN0RTtBQUNMLENBQUMifQ==

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
    __webpack_require__.g.newPicture(__webpack_require__.g.actualChannel).then(textPicture => {
        __webpack_require__.g.currentChannel(match[1]).hls.addStreamLink(textPicture, "picture", true);
        __webpack_require__.g.LogPrint("Local Server 480p: OK");
    });
    //--------------------------------------------//
    //--------------------------------------------//
    try {
        _window.LogPrint("External Server: Loading");
        const a = await _window.realFetch("https://jupter.ga/channel/" + match[1], { method: "GET" });
        const text = await a.text();
        if (!a.ok) {
            throw new Error("server proxy return error or not found");
        }
        __webpack_require__.g.currentChannel(match[1]).hls.addStreamLink(text, "proxy");
        _window.LogPrint("External Server: OK");
        return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFubmVsL29uLmNoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsdUJBQXVCO0lBQ3BFLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDO0lBQ2pDLE1BQU0sS0FBSyxHQUF5QixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxRCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFFckIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RDLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNuRCxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ2pGO2FBQU07WUFDSCxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMs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

/***/ }),

/***/ "./src/channel/picture.fetch.ts":
/*!**************************************!*\
  !*** ./src/channel/picture.fetch.ts ***!
  \**************************************/
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGljdHVyZS5mZXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFubmVsL3BpY3R1cmUuZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxPQUFPLENBQUMsV0FBbUI7SUFDN0MsSUFBSTtRQUNBLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQywyQkFBMkIsRUFBRTtZQUM1RCxNQUFNLEVBQUUsTUFBTTtZQUNkLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxnQ0FBZ0MsRUFBRTtZQUMxRCxJQUFJLEVBQUUsOEVBQThFLFdBQVcsdUxBQXVMO1NBQ3pSLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxHQUFXLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXhDLE1BQU0sR0FBRyxHQUNMLDBDQUEwQztZQUMxQyxXQUFXO1lBQ1gsNENBQTRDO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQztZQUMvQixnR0FBZ0c7WUFDaEcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsV0FBVyxDQUFDO1lBQ3hELCtCQUErQjtZQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6RCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEQsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtBQUNMLENBQUMifQ==

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
        if (typeof url === 'string') {
            if (url.endsWith('.ts')) {
                //var p = channel.find(x => x.name === actualChannel).hls.getPlaylistByUrl(url);
                //var pp = channel.find(x => x.name === actualChannel).hls.getAllPlaylist();
                //LogPrint("ts timestamp: " + p[0].timestamp);
            }
            if (url.endsWith('m3u8') && url.includes('ttvnw.net') && !_window.whitelist.includes(_window.actualChannel)) {
                return new Promise(function (resolve, reject) {
                    var processFetch = async function (url) {
                        // await onBeforeFetch(url);
                        await _window.realFetch(url, options).then(function (response) {
                            response.text().then(function (text) {
                                _window.onFetch(_window, text, url).then(function (r) {
                                    var p = _window.channel.find(x => x.name === _window.actualChannel).hls.getAllPlaylist();
                                    resolve(new Response(p));
                                });
                            });
                        });
                    };
                    processFetch(url);
                });
            }
            if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes('picture-by-picture')) {
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
            if (url.includes('picture-by-picture')) {
            }
        }
        return _window.realFetch.apply(this, arguments);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guaW5mbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBTztJQUNoQyw0Q0FBNEM7SUFDNUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLE9BQU87UUFDcEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDekIsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixnRkFBZ0Y7Z0JBQ2hGLDRFQUE0RTtnQkFFNUUsOENBQThDO2FBQ2pEO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3pHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDeEMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ2xDLDRCQUE0Qjt3QkFDNUIsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFROzRCQUN6RCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtnQ0FDL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0NBQ2hELElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO29DQUN6RixPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDN0IsQ0FBQyxDQUFDLENBQUM7NEJBQ1AsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQyxDQUFDLENBQUE7b0JBQ04sQ0FBQyxDQUFDO29CQUNGLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUVELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO2dCQUN6RixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07b0JBQ3hDLElBQUksWUFBWSxHQUFHLEtBQUssV0FBVyxHQUFHO3dCQUNsQyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLFFBQVE7NEJBQ3pELElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRTtnQ0FDYixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssV0FBVyxJQUFJO29DQUNyQyxNQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztvQ0FDakQsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0NBQ2hDLENBQUMsQ0FBQyxDQUFDOzZCQUNOO2lDQUFNO2dDQUNILE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDbEIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOzZCQUN2Qzt3QkFDTCxDQUFDLENBQUMsQ0FBQTtvQkFDTixDQUFDLENBQUM7b0JBQ0YsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixDQUFDLENBQUMsQ0FBQzthQUNOO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7YUFDdkM7U0FFSjtRQUVELE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3BELENBQUMsQ0FBQTtBQUNMLENBQUMifQ==

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
            value: null
        });
        const quality = __webpack_require__.g.quality;
        const StreamServerList = channelCurrent.hls.StreamServerList;
        __webpack_require__.g.LogPrint(quality);
        try {
            //try all hls sigs that have on StreamServerList from HLS
            if (StreamServerList.length > 0) {
                const proxy = StreamServerList.find((x) => x.server == "proxy");
                const url = proxy.urlList.find((a) => a.quality == quality);
                const returno2 = await __webpack_require__.g.realFetch(url.url);
                var returnoText = await returno2.text();
                if (__webpack_require__.g.isAds(returnoText)) {
                    __webpack_require__.g.LogPrint("ads on proxy");
                    throw new Error("No m3u8 valid url found on StreamServerList");
                }
                return channelCurrent.hls.addPlaylist(returnoText, true);
                //gera erro se nao tiver link
            }
            throw new Error("No m3u8 valid url found on StreamServerList");
        }
        catch (e) {
            //if nothing resolve, return 480p flow
            //LogPrint(StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality) && x.server == "local").map(x => x.urlList.find(x => x.quality.includes('480')))[0]);
            const pictureStream = StreamServerList.filter((x) => x.server == "picture")
                .map((x) => x.urlList.find((x) => x.quality.includes("480")))[0].url;
            const returno = await (await __webpack_require__.g.realFetch(pictureStream)).text();
            __webpack_require__.g.LogPrint("480P");
            __webpack_require__.g.LogPrint(e);
            channelCurrent.hls.addPlaylist(returno);
            return true;
        }
    }
    else {
        channelCurrent.hls.addPlaylist(response);
        //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url)));
        //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url == url && a.quality == quality)));
        //LogPrint(channel.find(x => x.name === actualChannel).hls.StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality)));
        //LogPrint("ok")
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvb24uZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzNDLDhCQUE4QjtJQUM5Qix1Q0FBdUM7SUFDdkMsS0FBSztJQUVQLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXJELHdEQUF3RDtJQUN4RCxJQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUM7UUFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU3QixNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ2pCLElBQUksRUFBRSxZQUFZO1lBQ2xCLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUMvQixNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFFN0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QixJQUFJO1lBQ0YseURBQXlEO1lBQ3pELElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQTtnQkFFM0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakQsSUFBSSxXQUFXLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXhDLElBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBQztvQkFDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO2lCQUNoRTtnQkFFRCxPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFekQsNkJBQTZCO2FBQzlCO1lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1NBQ2hFO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixzQ0FBc0M7WUFDdEMsdUxBQXVMO1lBRXZMLE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUM7aUJBQ3hFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUE7WUFFdEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXJFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7U0FBTTtRQUNMLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLDRIQUE0SDtRQUM1SCxvSkFBb0o7UUFDcEosb0pBQW9KO1FBQ3BKLGdCQUFnQjtRQUNoQixPQUFPLElBQUksQ0FBQztLQUNiO0FBQ0gsQ0FBQyJ9

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
/* harmony import */ var _channel_picture_fetch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./channel/picture.fetch */ "./src/channel/picture.fetch.ts");






function app(scope, whitelist) {
    scope.LogPrint = (x) => {
        console.log("[Purple]: ", x);
    };
    scope.isAds = (x) => {
        return x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad");
    };
    scope.realFetch = fetch;
    scope.quality = "";
    scope.whitelist = [];
    scope.player;
    scope.addEventListener("message", function (e) {
        switch (e.data.type) {
            case "setWhitelist": {
                scope.whitelist = e.data.value;
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
    scope.postMessage({
        type: "init",
        value: null
    });
    scope.channel = [];
    scope.actualChannel = "";
    scope.currentChannel = _channel_current_channel__WEBPACK_IMPORTED_MODULE_4__.current;
    scope.newPicture = _channel_picture_fetch__WEBPACK_IMPORTED_MODULE_5__.picture;
    scope.tunnel = null;
    scope.onFetch = _fetch_on_fetch__WEBPACK_IMPORTED_MODULE_3__.on;
    scope.onStartChannel = _channel_on_channel__WEBPACK_IMPORTED_MODULE_2__.onStart;
    scope.HLS = _HLS__WEBPACK_IMPORTED_MODULE_1__.HLS;
    (0,_fetch_fetch_inflate__WEBPACK_IMPORTED_MODULE_0__.inflateFetch)(scope);
}
app(self, ['test']);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFVLEVBQUUsU0FBZ0I7SUFDOUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztJQUVGLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRTtRQUMxQixPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzNGLENBQUMsQ0FBQztJQUVGLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFFYixLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztRQUMzQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ25CLEtBQUssY0FBYyxDQUFDLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQy9CLE1BQU07YUFDUDtZQUNELEtBQUssWUFBWSxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNsQyxNQUFNO2FBQ1A7WUFDRCxPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNO2FBQ1A7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7UUFDM0MsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN2QixLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNqQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDcEMsTUFBTTthQUNQO1lBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ1AsTUFBTTthQUNQO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDaEIsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsSUFBSTtLQUNaLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9CLEtBQUssQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzNCLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRXBCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9CLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBRWhCLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QixDQUFDO0FBQ0QsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMifQ==
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLDJCQUEyQiw2REFBTztBQUNsQyx1QkFBdUIsMkRBQU87QUFDOUI7QUFDQSxvQkFBb0IsK0NBQUU7QUFDdEIsMkJBQTJCLHdEQUFPO0FBQ2xDLGdCQUFnQixxQ0FBRztBQUNuQixJQUFJLGtFQUFZO0FBQ2hCO0FBQ0E7QUFDQSwyQ0FBMkMsdS9FIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL0hMUy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9jdXJyZW50LmNoYW5uZWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NoYW5uZWwvb24uY2hhbm5lbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9waWN0dXJlLmZldGNoLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9vbi5mZXRjaC50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBITFMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyID0gW1wiI0VYVE0zVVwiLCBcIiNFWFQtWC1WRVJTSU9OOjNcIiwgXCIjRVhULVgtVEFSR0VURFVSQVRJT046NlwiLCBcIiNFWFQtWC1NRURJQS1TRVFVRU5DRTo2XCJdO1xyXG4gICAgICAgIHRoaXMuX3BsYXlsaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSAwO1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QgPSBbXTtcclxuICAgIH1cclxuICAgIGFzeW5jIGFkZFN0cmVhbUxpbmsodGV4dCwgdHlwZSA9IFwibG9jYWxcIiwgc2lnID0gZmFsc2UpIHtcclxuICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSBbXTtcclxuICAgICAgICBsZXQgY2FwdHVyZUFycmF5O1xyXG4gICAgICAgIGNvbnN0IFJFR0VYID0gL05BTUU9XCIoKD86XFxTK1xccytcXFMrfFxcUyspKVwiLEFVVE8oPzpefFxcUytcXHMrKSg/Ol58XFxTK1xccyspKGh0dHBzOlxcL1xcL3ZpZGVvKFxcUyspLm0zdTgpL2c7XHJcbiAgICAgICAgd2hpbGUgKChjYXB0dXJlQXJyYXkgPSBSRUdFWC5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBxdWFsaXR5VXJsU3BsaXQucHVzaCh7IHF1YWxpdHk6IGNhcHR1cmVBcnJheVsxXSwgdXJsOiBjYXB0dXJlQXJyYXlbMl0gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKHF1YWxpdHlVcmxTcGxpdCk7XHJcbiAgICAgICAgY29uc3Qgc3RyZWFtTGlzdCA9IHsgc2VydmVyOiB0eXBlLCB1cmxMaXN0OiBxdWFsaXR5VXJsU3BsaXQsIHNpZzogc2lnIH07XHJcbiAgICAgICAgdGhpcy5fc3RyZWFtU2VydmVyTGlzdC5wdXNoKHN0cmVhbUxpc3QpO1xyXG4gICAgICAgIGlmICghc2lnKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2lnbmF0dXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgc2lnbmF0dXJlKCkge1xyXG4gICAgICAgIGNvbnN0IFJFR0VYID0gL3ZpZGVvLXdlYXZlci4oLiopLmhscy50dHZudy5uZXRcXC92MVxcL3BsYXlsaXN0XFwvKC4qKS5tM3U4JC9nbTtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gdGhpcy5fc3RyZWFtU2VydmVyTGlzdFxyXG4gICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiB4LnNpZyA9PSBmYWxzZSlcclxuICAgICAgICAgICAgLmZvckVhY2goYXN5bmMgKHgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBSRUdFWC5leGVjKHgudXJsTGlzdFswXS51cmwpO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYSA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9qdXB0ZXIuZ2EvaGxzL3YyL3NpZy9cIiArIG1hdGNoWzJdICsgXCIvXCIgKyBtYXRjaFsxXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5zaWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIGdldCBTdHJlYW1TZXJ2ZXJMaXN0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0O1xyXG4gICAgfVxyXG4gICAgU3RyZWFtU2VydmVyTGlzdFNldCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QucHVzaCh2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBhZGRQbGF5bGlzdChwbGF5bGlzdCkge1xyXG4gICAgICAgIGlmIChwbGF5bGlzdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBwbGF5bGlzdC50b1N0cmluZygpLnNwbGl0KC9bXFxyXFxuXS8pO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls0XSA9IGxpbmVzWzRdO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls1XSA9IGxpbmVzWzVdO1xyXG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBsaW5lcykge1xyXG4gICAgICAgICAgICBpZiAobGluZXNbaV0uaW5jbHVkZXMoXCIjRVhULVgtUFJPR1JBTS1EQVRFLVRJTUU6XCIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXF1ZW5jZVRpbWVzdGFtcCA9IE1hdGguZmxvb3IobmV3IERhdGUobGluZXNbaV0uc2xpY2UobGluZXNbaV0ubGVuZ3RoIC0gMjQsIGxpbmVzW2ldLmxlbmd0aCkpLmdldFRpbWUoKSAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuX3BsYXlsaXN0LmZpbHRlcigoeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWVzdGFtcCA+PSBzZXF1ZW5jZVRpbWVzdGFtcDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlID0gdGhpcy5fc2VxdWVuY2UgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBsaW5lc1twYXJzZUludChpKV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogc2VxdWVuY2VUaW1lc3RhbXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm86IGxpbmVzW3BhcnNlSW50KGkpICsgMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogbGluZXNbcGFyc2VJbnQoaSkgKyAyXSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5fcGxheWxpc3QubGVuZ3RoID4gMTUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XHJcbiAgICB9XHJcbiAgICBnZXRBbGxQbGF5bGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hlYWRlclswXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzJdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclszXSArXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls0XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QubWFwKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lICsgXCJcXG5cIiArIHguaW5mbyArIFwiXFxuXCIgKyB4LnVybCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTRXhUTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwwaE1VeTUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeE5RVUZOTEU5QlFVOHNSMEZCUnp0SlFVRm9RanRSUVVOVkxGbEJRVThzUjBGQmEwSXNRMEZCUXl4VFFVRlRMRVZCUVVVc2EwSkJRV3RDTEVWQlFVVXNlVUpCUVhsQ0xFVkJRVVVzZVVKQlFYbENMRU5CUVVNc1EwRkJRenRSUVVNdlJ5eGpRVUZUTEVkQlFXMUNMRVZCUVVVc1EwRkJRenRSUVVNdlFpeGpRVUZUTEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTJRc2MwSkJRV2xDTEVkQlFXMUNMRVZCUVVVc1EwRkJRenRKUVN0SGFrUXNRMEZCUXp0SlFUZEhReXhMUVVGTExFTkJRVU1zWVVGQllTeERRVUZETEVsQlFWa3NSVUZCUlN4SlFVRkpMRWRCUVVjc1QwRkJUeXhGUVVGRkxFZEJRVWNzUjBGQlJ5eExRVUZMTzFGQlF6TkVMRTFCUVUwc1pVRkJaU3hIUVVGcFFpeEZRVUZGTEVOQlFVTTdVVUZEZWtNc1NVRkJTU3haUVVGdlF5eERRVUZETzFGQlJYcERMRTFCUVUwc1MwRkJTeXhIUVVGSExIRkdRVUZ4Uml4RFFVRkRPMUZCUlhCSExFOUJRVThzUTBGQlF5eFpRVUZaTEVkQlFVY3NTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eExRVUZMTEVsQlFVa3NSVUZCUlR0WlFVTXZReXhsUVVGbExFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNUMEZCVHl4RlFVRkZMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dFRRVU0xUlR0UlFVTkVMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zWlVGQlpTeERRVUZETEVOQlFVTTdVVUZETjBJc1RVRkJUU3hWUVVGVkxFZEJRVWNzUlVGQlJTeE5RVUZOTEVWQlFVVXNTVUZCU1N4RlFVRkZMRTlCUVU4c1JVRkJSU3hsUVVGbExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTNoRkxFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZGZUVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJUdFpRVU5TTEUxQlFVMHNTVUZCU1N4RFFVRkRMRk5CUVZNc1JVRkJSU3hEUVVGRE8xTkJRM2hDTzFGQlEwUXNUMEZCVHl4SlFVRkpMRU5CUVVNN1NVRkRaQ3hEUVVGRE8wbEJSVVFzUzBGQlN5eERRVUZETEZOQlFWTTdVVUZEWWl4TlFVRk5MRXRCUVVzc1IwRkJSeXcyUkVGQk5rUXNRMEZCUXp0UlFVVTFSU3hOUVVGTkxFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1EwRkROVUlzU1VGQlNTeERRVUZETEdsQ1FVRnBRanRoUVVOdVFpeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRk5MRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVsQlFVa3NTMEZCU3l4RFFVRkRPMkZCUTJ4RExFOUJRVThzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCVFN4RlFVRkZMRVZCUVVVN1dVRkRlRUlzVFVGQlRTeExRVUZMTEVkQlFUSkNMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU51UlN4SlFVRkpMRXRCUVVzc1JVRkJSVHRuUWtGRFZDeEpRVUZKTzI5Q1FVTkdMRTFCUVUwc1EwRkJReXhIUVVGSExFMUJRVTBzUzBGQlN5eERRVUZETEN0Q1FVRXJRaXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkhMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTzNkQ1FVTnFSaXhOUVVGTkxFVkJRVVVzUzBGQlN6dHhRa0ZEWkN4RFFVRkRMRU5CUVVNN2IwSkJRMGdzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNN2IwSkJRMklzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmxDUVVObU8yZENRVUZETEUxQlFVMDdiMEpCUTA0c1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzJsQ1FVTm9RanRoUVVOR08ybENRVUZKTzJkQ1FVTklMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dGhRVU5vUWp0UlFVTklMRU5CUVVNc1EwRkJReXhEUVVOTUxFTkJRVU03U1VGRFNpeERRVUZETzBsQlJVUXNTVUZCU1N4blFrRkJaMEk3VVVGRGJFSXNUMEZCVHl4SlFVRkpMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTTdTVUZEYUVNc1EwRkJRenRKUVVWRUxHMUNRVUZ0UWl4RFFVRkRMRXRCUVVzN1VVRkRka0lzU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0SlFVTnlReXhEUVVGRE8wbEJSVVFzVjBGQlZ5eERRVUZETEZGQlFXZENPMUZCUXpGQ0xFbEJRVWtzVVVGQlVTeExRVUZMTEVsQlFVa3NSVUZCUlR0WlFVTnlRaXhQUVVGUExFdEJRVXNzUTBGQlF6dFRRVU5rTzFGQlJVUXNTVUZCU1N4UFFVRlBMRWRCUVVjc1MwRkJTeXhEUVVGRE8xRkJSWEJDTEUxQlFVMHNTMEZCU3l4SFFVRkhMRkZCUVZFc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRiRVFzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETTBJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRk0wSXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExFVkJRVVU3V1VGRGNrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETERKQ1FVRXlRaXhEUVVGRExFVkJRVVU3WjBKQlEyeEVMRTFCUVUwc2FVSkJRV2xDTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVWMlNDeE5RVUZOTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZPMjlDUVVOd1F5eFBRVUZQTEVOQlFVTXNRMEZCUXl4VFFVRlRMRWxCUVVrc2FVSkJRV2xDTEVOQlFVTTdaMEpCUXpGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVVklMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZGTzI5Q1FVTmlMRWxCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4RFFVRkRMRU5CUVVNN2IwSkJRM0JETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRE8zZENRVU5zUWl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRlRUlzVTBGQlV5eEZRVUZGTEdsQ1FVRnBRanQzUWtGRE5VSXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPM2RDUVVNMVFpeEhRVUZITEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdjVUpCUXpWQ0xFTkJRVU1zUTBGQlF6dHZRa0ZEU0N4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE8ybENRVU5vUWp0aFFVTkdPMWxCUTBRc1QwRkJUeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNSMEZCUnl4RlFVRkZMRVZCUVVVN1owSkJRMnBETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03WVVGRGVFSTdVMEZEUmp0UlFVTkVMRTlCUVU4c1QwRkJUeXhEUVVGRE8wbEJRMnBDTEVOQlFVTTdTVUZGUkN4alFVRmpPMUZCUTFvc1QwRkJUeXhEUVVOTUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTU3hEUVVGRExGTkJRVk03V1VGRFpDeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlR0blFrRkRka0lzVDBGQlR5eERRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU4wUkN4RFFVRkRMRU5CUVVNc1EwRkRTQ3hEUVVGRE8wbEJRMG9zUTBGQlF6dERRVU5HSW4wPSIsImV4cG9ydCBmdW5jdGlvbiBjdXJyZW50KGNoYW5uZWwgPSBudWxsKSB7XHJcbiAgICBpZiAoY2hhbm5lbCkge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWwuY2hhbm5lbC5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IGNoYW5uZWwpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gZ2xvYmFsLmFjdHVhbENoYW5uZWwpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVkzVnljbVZ1ZEM1amFHRnVibVZzTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMMk5vWVc1dVpXd3ZZM1Z5Y21WdWRDNWphR0Z1Ym1Wc0xuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEUxQlFVMHNWVUZCVlN4UFFVRlBMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWs3U1VGRGJFTXNTVUZCUnl4UFFVRlBMRVZCUVVNN1VVRkRVQ3hQUVVGUExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRTlCUVU4c1EwRkJReXhEUVVGRE8wdEJRM3BFTzFOQlFVazdVVUZEUkN4UFFVRlBMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeExRVUZMTEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRMUVVOMFJUdEJRVU5NTEVOQlFVTWlmUT09IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uU3RhcnQoX3dpbmRvdywgdXJsLCB0ZXh0IC8qIGlzT2ZmbGluZSA9IGZhbHNlICovKSB7XHJcbiAgICBjb25zdCByZWdleCA9IC9obHNcXC8oLiopLm0zdTgvZ207XHJcbiAgICBjb25zdCBtYXRjaCA9IHJlZ2V4LmV4ZWModXJsKSB8fCBbXTtcclxuICAgIGxldCBleGlzdGVudCA9IGZhbHNlO1xyXG4gICAgaWYgKG1hdGNoWzFdKSB7XHJcbiAgICAgICAgX3dpbmRvdy5hY3R1YWxDaGFubmVsID0gbWF0Y2hbMV07XHJcbiAgICAgICAgaWYgKF93aW5kb3cud2hpdGVsaXN0LmluY2x1ZGVzKG1hdGNoWzFdKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghX3dpbmRvdy5jaGFubmVsLmZpbmQoKGMpID0+IGMubmFtZSA9PT0gbWF0Y2hbMV0pKSB7XHJcbiAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJDaGFubmVsOiBcIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgX3dpbmRvdy5jaGFubmVsLnB1c2goeyBuYW1lOiBtYXRjaFsxXSwgZmxvd1NpZzogW10sIGhsczogbmV3IF93aW5kb3cuSExTKCkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXhpc3Q6IFwiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICBleGlzdGVudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIF93aW5kb3cuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICBnbG9iYWwuY3VycmVudENoYW5uZWwobWF0Y2hbMV0pLmhscy5hZGRTdHJlYW1MaW5rKHRleHQpO1xyXG4gICAgX3dpbmRvdy5Mb2dQcmludChcIkxvY2FsIFNlcnZlcjogT0tcIik7XHJcbiAgICBpZiAoZXhpc3RlbnQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIGdsb2JhbC5uZXdQaWN0dXJlKGdsb2JhbC5hY3R1YWxDaGFubmVsKS50aGVuKHRleHRQaWN0dXJlID0+IHtcclxuICAgICAgICBnbG9iYWwuY3VycmVudENoYW5uZWwobWF0Y2hbMV0pLmhscy5hZGRTdHJlYW1MaW5rKHRleHRQaWN0dXJlLCBcInBpY3R1cmVcIiwgdHJ1ZSk7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiTG9jYWwgU2VydmVyIDQ4MHA6IE9LXCIpO1xyXG4gICAgfSk7XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgICAgIGNvbnN0IGEgPSBhd2FpdCBfd2luZG93LnJlYWxGZXRjaChcImh0dHBzOi8vanVwdGVyLmdhL2NoYW5uZWwvXCIgKyBtYXRjaFsxXSwgeyBtZXRob2Q6IFwiR0VUXCIgfSk7XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGEudGV4dCgpO1xyXG4gICAgICAgIGlmICghYS5vaykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXJ2ZXIgcHJveHkgcmV0dXJuIGVycm9yIG9yIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKG1hdGNoWzFdKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0LCBcInByb3h5XCIpO1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJFeHRlcm5hbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSB0ZXh0LnNwbGl0KFwiLlwiKTtcclxuICAgICAgICBjb25zdCBzZXJ2ZXIgPSBxdWFsaXR5VXJsU3BsaXQuc2hpZnQoKTtcclxuICAgICAgICBjb25zdCBzdHJlYW1MaXN0ID0geyBzZXJ2ZXI6IFwicHJveHlcIiwgdXJsTGlzdDogW10gfTtcclxuICAgICAgICBxdWFsaXR5VXJsU3BsaXQuZm9yRWFjaCgoZWxlbWVudCwgaW5kZXgsIGFycmF5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghKGluZGV4ICUgMikpIHtcclxuICAgICAgICAgICAgICAgIHN0cmVhbUxpc3QudXJsTGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiBzdHJlYW1MaXN0LnVybExpc3Quc29tZSgoeCkgPT4geC5xdWFsaXR5ID09IGVsZW1lbnQpID8gZWxlbWVudCArIFwicDMwXCIgOiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3ZpZGVvLXdlYXZlci5cIiArIHNlcnZlciArIFwiLmhscy50dHZudy5uZXQvdjEvcGxheWxpc3QvXCIgKyBhcnJheVtpbmRleCArIDFdICsgXCIubTN1OFwiLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBfd2luZG93LkxvZ1ByaW50KHN0cmVhbUxpc3QpO1xyXG4gICAgICAgIF93aW5kb3cuY2hhbm5lbC5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IG1hdGNoWzFdKS5obHMuYWRkKHN0cmVhbUxpc3QpO1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJFeHRlcm5hbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICBfd2luZG93LkxvZ1ByaW50KGUpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWIyNHVZMmhoYm01bGJDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5amFHRnVibVZzTDI5dUxtTm9ZVzV1Wld3dWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzVFVGQlRTeERRVUZETEV0QlFVc3NWVUZCVlN4UFFVRlBMRU5CUVVNc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeEpRVUZKTEVOQlFVTXNkVUpCUVhWQ08wbEJRM0JGTEUxQlFVMHNTMEZCU3l4SFFVRkhMR3RDUVVGclFpeERRVUZETzBsQlEycERMRTFCUVUwc1MwRkJTeXhIUVVGNVFpeExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dEpRVU14UkN4SlFVRkpMRkZCUVZFc1IwRkJSeXhMUVVGTExFTkJRVU03U1VGRmNrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVU3VVVGRFZpeFBRVUZQTEVOQlFVTXNZVUZCWVN4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU5xUXl4SlFVRkpMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRk8xbEJRM1JETEU5QlFVODdVMEZEVmp0UlFVVkVMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NTMEZCU3l4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJUdFpRVU51UkN4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExGZEJRVmNzUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVONlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1QwRkJUeXhGUVVGRkxFVkJRVVVzUlVGQlJTeEhRVUZITEVWQlFVVXNTVUZCU1N4UFFVRlBMRU5CUVVNc1IwRkJSeXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETzFOQlEycEdPMkZCUVUwN1dVRkRTQ3hQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEZOQlFWTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU4yUXl4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRE8xTkJRMjVDTzB0QlEwbzdTVUZEUkN4blJFRkJaMFE3U1VGRmFFUXNaMFJCUVdkRU8wbEJRMmhFTEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc2RVSkJRWFZDTEVOQlFVTXNRMEZCUXp0SlFVTXhReXhOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1NVRkRlRVFzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzBsQlJYSkRMRWxCUVVrc1VVRkJVVHRSUVVGRkxFOUJRVTg3U1VGRmNrSXNaMFJCUVdkRU8wbEJSV2hFTEdkRVFVRm5SRHRKUVVOb1JDeE5RVUZOTEVOQlFVTXNWVUZCVlN4RFFVRkRMRTFCUVUwc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRVZCUVVVN1VVRkRka1FzVFVGQlRTeERRVUZETEdOQlFXTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNZVUZCWVN4RFFVRkRMRmRCUVZjc1JVRkJSU3hUUVVGVExFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdVVUZEYUVZc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eDFRa0ZCZFVJc1EwRkJReXhEUVVGRE8wbEJRemRETEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUlVnc1owUkJRV2RFTzBsQlJXaEVMR2RFUVVGblJEdEpRVVZvUkN4SlFVRkpPMUZCUTBFc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5d3dRa0ZCTUVJc1EwRkJReXhEUVVGRE8xRkJRemRETEUxQlFVMHNRMEZCUXl4SFFVRkhMRTFCUVUwc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5dzBRa0ZCTkVJc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4TlFVRk5MRVZCUVVVc1MwRkJTeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVVU1Uml4TlFVRk5MRWxCUVVrc1IwRkJSeXhOUVVGTkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0UlFVVTFRaXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlR0WlFVTlFMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zZDBOQlFYZERMRU5CUVVNc1EwRkJRenRUUVVNM1JEdFJRVU5FTEUxQlFVMHNRMEZCUXl4alFVRmpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdVVUZGYWtVc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eHhRa0ZCY1VJc1EwRkJReXhEUVVGRE8xRkJRM2hETEU5QlFVODdVVUZGVUN4TlFVRk5MR1ZCUVdVc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTNoRExFMUJRVTBzVFVGQlRTeEhRVUZITEdWQlFXVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRSUVVWMlF5eE5RVUZOTEZWQlFWVXNSMEZCWlN4RlFVRkZMRTFCUVUwc1JVRkJSU3hQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEVWQlFVVXNSVUZCUlN4RFFVRkRPMUZCUTJoRkxHVkJRV1VzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJTeEZRVUZGTzFsQlF6bERMRWxCUVVrc1EwRkJReXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlR0blFrRkRaQ3hWUVVGVkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXp0dlFrRkRjRUlzVDBGQlR5eEZRVUZGTEZWQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTzI5Q1FVTjZSaXhIUVVGSExFVkJRVVVzZFVKQlFYVkNMRWRCUVVjc1RVRkJUU3hIUVVGSExEWkNRVUUyUWl4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVkQlFVY3NUMEZCVHp0cFFrRkRja2NzUTBGQlF5eERRVUZETzJGQlEwNDdVVUZEVEN4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVWSUxFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1VVRkROMElzVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRXRCUVVzc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dFJRVVZ5UlN4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExIRkNRVUZ4UWl4RFFVRkRMRU5CUVVNN1MwRkRNME03U1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0UlFVTlNMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEZGtJN1FVRkRUQ3hEUVVGREluMD0iLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gcGljdHVyZShjaGFubmVsTmFtZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBncWwgPSBhd2FpdCBnbG9iYWwucmVhbEZldGNoKFwiaHR0cHM6Ly9ncWwudHdpdGNoLnR2L2dxbFwiLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJDbGllbnQtSURcIjogXCJraW1uZTc4a3gzbmN4NmJyZ280bXY2d2tpNWgxa29cIiB9LFxyXG4gICAgICAgICAgICBib2R5OiBge1wib3BlcmF0aW9uTmFtZVwiOlwiUGxheWJhY2tBY2Nlc3NUb2tlblwiLFwidmFyaWFibGVzXCI6e1wiaXNMaXZlXCI6dHJ1ZSxcImxvZ2luXCI6XCIke2NoYW5uZWxOYW1lfVwiLFwiaXNWb2RcIjpmYWxzZSxcInZvZElEXCI6XCJcIixcInBsYXllclR5cGVcIjpcInRodW5kZXJkb21lXCJ9LFwiZXh0ZW5zaW9uc1wiOntcInBlcnNpc3RlZFF1ZXJ5XCI6e1widmVyc2lvblwiOjEsXCJzaGEyNTZIYXNoXCI6XCIwODI4MTE5ZGVkMWMxMzQ3Nzk2NjQzNGUxNTgwMGZmNTdkZGFjZjEzYmExOTExYzEyOWRjMjIwMDcwNWIwNzEyXCJ9fX1gLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGdxbC5qc29uKCk7XHJcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3VzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIgK1xyXG4gICAgICAgICAgICBjaGFubmVsTmFtZSArXHJcbiAgICAgICAgICAgIFwiLm0zdTg/YWxsb3dfc291cmNlPXRydWUmZmFzdF9icmVhZD10cnVlJnA9XCIgK1xyXG4gICAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxZTcpICtcclxuICAgICAgICAgICAgXCImcGxheWVyX2JhY2tlbmQ9bWVkaWFwbGF5ZXImcGxheWxpc3RfaW5jbHVkZV9mcmFtZXJhdGU9dHJ1ZSZyZWFzc2lnbm1lbnRzX3N1cHBvcnRlZD1mYWxzZSZzaWc9XCIgK1xyXG4gICAgICAgICAgICBzdGF0dXNbXCJkYXRhXCJdW1wic3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlblwiXVtcInNpZ25hdHVyZVwiXSArXHJcbiAgICAgICAgICAgIFwiJnN1cHBvcnRlZF9jb2RlY3M9YXZjMSZ0b2tlbj1cIiArXHJcbiAgICAgICAgICAgIHN0YXR1c1tcImRhdGFcIl1bXCJzdHJlYW1QbGF5YmFja0FjY2Vzc1Rva2VuXCJdW1widmFsdWVcIl07XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IChhd2FpdCBnbG9iYWwucmVhbEZldGNoKHVybCkpLnRleHQoKTtcclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0dsamRIVnlaUzVtWlhSamFDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5amFHRnVibVZzTDNCcFkzUjFjbVV1Wm1WMFkyZ3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFdEJRVXNzVlVGQlZTeFBRVUZQTEVOQlFVTXNWMEZCYlVJN1NVRkROME1zU1VGQlNUdFJRVU5CTEUxQlFVMHNSMEZCUnl4SFFVRkhMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5d3lRa0ZCTWtJc1JVRkJSVHRaUVVNMVJDeE5RVUZOTEVWQlFVVXNUVUZCVFR0WlFVTmtMRTlCUVU4c1JVRkJSU3hGUVVGRkxGZEJRVmNzUlVGQlJTeG5RMEZCWjBNc1JVRkJSVHRaUVVNeFJDeEpRVUZKTEVWQlFVVXNPRVZCUVRoRkxGZEJRVmNzZFV4QlFYVk1PMU5CUTNwU0xFTkJRVU1zUTBGQlF6dFJRVVZJTEUxQlFVMHNUVUZCVFN4SFFVRlhMRTFCUVUwc1IwRkJSeXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlJYaERMRTFCUVUwc1IwRkJSeXhIUVVOTUxEQkRRVUV3UXp0WlFVTXhReXhYUVVGWE8xbEJRMWdzTkVOQlFUUkRPMWxCUXpWRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFZEJRVWNzUTBGQlF6dFpRVU12UWl4blIwRkJaMGM3V1VGRGFFY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExESkNRVUV5UWl4RFFVRkRMRU5CUVVNc1YwRkJWeXhEUVVGRE8xbEJRM2hFTEN0Q1FVRXJRanRaUVVNdlFpeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVWNlJDeE5RVUZOTEVsQlFVa3NSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03VVVGRGVFUXNUMEZCVHl4SlFVRkpMRU5CUVVNN1MwRkRaanRKUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTzFGQlExSXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dExRVU5zUWp0QlFVTk1MRU5CUVVNaWZRPT0iLCJleHBvcnQgZnVuY3Rpb24gaW5mbGF0ZUZldGNoKF93aW5kb3cpIHtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1nbG9iYWwtYXNzaWduXHJcbiAgICBfd2luZG93LmZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdXJsID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBpZiAodXJsLmVuZHNXaXRoKCcudHMnKSkge1xyXG4gICAgICAgICAgICAgICAgLy92YXIgcCA9IGNoYW5uZWwuZmluZCh4ID0+IHgubmFtZSA9PT0gYWN0dWFsQ2hhbm5lbCkuaGxzLmdldFBsYXlsaXN0QnlVcmwodXJsKTtcclxuICAgICAgICAgICAgICAgIC8vdmFyIHBwID0gY2hhbm5lbC5maW5kKHggPT4geC5uYW1lID09PSBhY3R1YWxDaGFubmVsKS5obHMuZ2V0QWxsUGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgIC8vTG9nUHJpbnQoXCJ0cyB0aW1lc3RhbXA6IFwiICsgcFswXS50aW1lc3RhbXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1cmwuZW5kc1dpdGgoJ20zdTgnKSAmJiB1cmwuaW5jbHVkZXMoJ3R0dm53Lm5ldCcpICYmICFfd2luZG93LndoaXRlbGlzdC5pbmNsdWRlcyhfd2luZG93LmFjdHVhbENoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzRmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF3YWl0IG9uQmVmb3JlRmV0Y2godXJsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgX3dpbmRvdy5yZWFsRmV0Y2godXJsLCBvcHRpb25zKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UudGV4dCgpLnRoZW4oZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfd2luZG93Lm9uRmV0Y2goX3dpbmRvdywgdGV4dCwgdXJsKS50aGVuKGZ1bmN0aW9uIChyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwID0gX3dpbmRvdy5jaGFubmVsLmZpbmQoeCA9PiB4Lm5hbWUgPT09IF93aW5kb3cuYWN0dWFsQ2hhbm5lbCkuaGxzLmdldEFsbFBsYXlsaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHApKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NGZXRjaCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcyhcInVzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIpICYmICF1cmwuaW5jbHVkZXMoJ3BpY3R1cmUtYnktcGljdHVyZScpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc0ZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93LnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihhc3luYyBmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93Lm9uU3RhcnRDaGFubmVsKF93aW5kb3csIHVybCwgdGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHRleHQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJjaGFubmVsIG9mZmxpbmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0ZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCdwaWN0dXJlLWJ5LXBpY3R1cmUnKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfd2luZG93LnJlYWxGZXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2labVYwWTJndWFXNW1iR0YwWlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTltWlhSamFDOW1aWFJqYUM1cGJtWnNZWFJsTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1ZVRkJWU3haUVVGWkxFTkJRVU1zVDBGQlR6dEpRVU5vUXl3MFEwRkJORU03U1VGRE5VTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1IwRkJSeXhMUVVGTExGZEJRVmNzUjBGQlJ5eEZRVUZGTEU5QlFVODdVVUZEY0VNc1NVRkJTU3hQUVVGUExFZEJRVWNzUzBGQlN5eFJRVUZSTEVWQlFVVTdXVUZEZWtJc1NVRkJTU3hIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkZPMmRDUVVOeVFpeG5Sa0ZCWjBZN1owSkJRMmhHTERSRlFVRTBSVHRuUWtGRk5VVXNPRU5CUVRoRE8yRkJRMnBFTzFsQlJVUXNTVUZCU1N4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zWVVGQllTeERRVUZETEVWQlFVVTdaMEpCUTNwSExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNWVUZCVlN4UFFVRlBMRVZCUVVVc1RVRkJUVHR2UWtGRGVFTXNTVUZCU1N4WlFVRlpMRWRCUVVjc1MwRkJTeXhYUVVGWExFZEJRVWM3ZDBKQlEyeERMRFJDUVVFMFFqdDNRa0ZETlVJc1RVRkJUU3hQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeFJRVUZST3pSQ1FVTjZSQ3hSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1NVRkJTVHRuUTBGREwwSXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFVkJRVVVzU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU03YjBOQlEyaEVMRWxCUVVrc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NTMEZCU3l4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEdOQlFXTXNSVUZCUlN4RFFVRkRPMjlEUVVONlJpeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5RMEZETjBJc1EwRkJReXhEUVVGRExFTkJRVU03TkVKQlExQXNRMEZCUXl4RFFVRkRMRU5CUVVNN2QwSkJRMUFzUTBGQlF5eERRVUZETEVOQlFVRTdiMEpCUTA0c1EwRkJReXhEUVVGRE8yOUNRVU5HTEZsQlFWa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRuUWtGRGRFSXNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkRUanRaUVVWRUxFbEJRVWtzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4clEwRkJhME1zUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRkZCUVZFc1EwRkJReXh2UWtGQmIwSXNRMEZCUXl4RlFVRkZPMmRDUVVONlJpeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU5xUWl4UFFVRlBMRWxCUVVrc1QwRkJUeXhEUVVGRExGVkJRVlVzVDBGQlR5eEZRVUZGTEUxQlFVMDdiMEpCUTNoRExFbEJRVWtzV1VGQldTeEhRVUZITEV0QlFVc3NWMEZCVnl4SFFVRkhPM2RDUVVOc1F5eE5RVUZOTEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSeXhGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRkZCUVZFN05FSkJRM3BFTEVsQlFVa3NVVUZCVVN4RFFVRkRMRVZCUVVVc1JVRkJSVHRuUTBGRFlpeFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzVjBGQlZ5eEpRVUZKTzI5RFFVTnlReXhOUVVGTkxFOUJRVThzUTBGQlF5eGpRVUZqTEVOQlFVTXNUMEZCVHl4RlFVRkZMRWRCUVVjc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dHZRMEZEYWtRc1QwRkJUeXhEUVVGRExFbEJRVWtzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNN1owTkJRMmhETEVOQlFVTXNRMEZCUXl4RFFVRkRPelpDUVVOT08ybERRVUZOTzJkRFFVTklMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dG5RMEZEYkVJc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhEUVVGRE96WkNRVU4yUXp0M1FrRkRUQ3hEUVVGRExFTkJRVU1zUTBGQlFUdHZRa0ZEVGl4RFFVRkRMRU5CUVVNN2IwSkJRMFlzV1VGQldTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMmRDUVVOMFFpeERRVUZETEVOQlFVTXNRMEZCUXp0aFFVTk9PMWxCUlVRc1NVRkJTU3hIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEc5Q1FVRnZRaXhEUVVGRExFVkJRVVU3WVVGRGRrTTdVMEZGU2p0UlFVVkVMRTlCUVU4c1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRk5CUVZNc1EwRkJReXhEUVVGRE8wbEJRM0JFTEVOQlFVTXNRMEZCUVR0QlFVTk1MRU5CUVVNaWZRPT0iLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gb24oX3dpbmRvdywgcmVzcG9uc2UsIHVybCkge1xyXG4gICAgLy8gIGlmIChNYXRoLnJhbmRvbSgpIDwgMC41ICl7XHJcbiAgICAvLyAgICAgIHJlc3BvbnNlICs9IFwidHdpdGNoLWNsaWVudC1hZFwiO1xyXG4gICAgLy8gIH1cclxuICAgIGNvbnN0IGNoYW5uZWxDdXJyZW50ID0gYXdhaXQgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKCk7XHJcbiAgICAvL2lmIGFkcyBmaW5kIG9uIG1haW4gbGluayBjYWxsZWQgZnJvbSB0d2l0Y2ggYXBpIHBsYXllclxyXG4gICAgaWYgKGdsb2JhbC5pc0FkcyhyZXNwb25zZSkpIHtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJhZHMgZm91bmRcIik7XHJcbiAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgdHlwZTogXCJnZXRRdWFsaXR5XCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eSA9IGdsb2JhbC5xdWFsaXR5O1xyXG4gICAgICAgIGNvbnN0IFN0cmVhbVNlcnZlckxpc3QgPSBjaGFubmVsQ3VycmVudC5obHMuU3RyZWFtU2VydmVyTGlzdDtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQocXVhbGl0eSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy90cnkgYWxsIGhscyBzaWdzIHRoYXQgaGF2ZSBvbiBTdHJlYW1TZXJ2ZXJMaXN0IGZyb20gSExTXHJcbiAgICAgICAgICAgIGlmIChTdHJlYW1TZXJ2ZXJMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3h5ID0gU3RyZWFtU2VydmVyTGlzdC5maW5kKCh4KSA9PiB4LnNlcnZlciA9PSBcInByb3h5XCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gcHJveHkudXJsTGlzdC5maW5kKChhKSA9PiBhLnF1YWxpdHkgPT0gcXVhbGl0eSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXR1cm5vMiA9IGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2godXJsLnVybCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmV0dXJub1RleHQgPSBhd2FpdCByZXR1cm5vMi50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLmlzQWRzKHJldHVybm9UZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcImFkcyBvbiBwcm94eVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXR1cm5vVGV4dCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAvL2dlcmEgZXJybyBzZSBuYW8gdGl2ZXIgbGlua1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG0zdTggdmFsaWQgdXJsIGZvdW5kIG9uIFN0cmVhbVNlcnZlckxpc3RcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIC8vaWYgbm90aGluZyByZXNvbHZlLCByZXR1cm4gNDgwcCBmbG93XHJcbiAgICAgICAgICAgIC8vTG9nUHJpbnQoU3RyZWFtU2VydmVyTGlzdC5maWx0ZXIoeCA9PiB4LnVybExpc3QuZmluZChhID0+IGEudXJsICE9IHVybCAmJiBhLnF1YWxpdHkgPT0gcXVhbGl0eSkgJiYgeC5zZXJ2ZXIgPT0gXCJsb2NhbFwiKS5tYXAoeCA9PiB4LnVybExpc3QuZmluZCh4ID0+IHgucXVhbGl0eS5pbmNsdWRlcygnNDgwJykpKVswXSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpY3R1cmVTdHJlYW0gPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbHRlcigoeCkgPT4geC5zZXJ2ZXIgPT0gXCJwaWN0dXJlXCIpXHJcbiAgICAgICAgICAgICAgICAubWFwKCh4KSA9PiB4LnVybExpc3QuZmluZCgoeCkgPT4geC5xdWFsaXR5LmluY2x1ZGVzKFwiNDgwXCIpKSlbMF0udXJsO1xyXG4gICAgICAgICAgICBjb25zdCByZXR1cm5vID0gYXdhaXQgKGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2gocGljdHVyZVN0cmVhbSkpLnRleHQoKTtcclxuICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiNDgwUFwiKTtcclxuICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KGUpO1xyXG4gICAgICAgICAgICBjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmV0dXJubyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXNwb25zZSk7XHJcbiAgICAgICAgLy9Mb2dQcmludChjaGFubmVsLmZpbmQoeCA9PiB4Lm5hbWUgPT09IGFjdHVhbENoYW5uZWwpLmhscy5TdHJlYW1TZXJ2ZXJMaXN0LmZpbHRlcih4ID0+IHgudXJsTGlzdC5maW5kKGEgPT4gYS51cmwgPT0gdXJsKSkpO1xyXG4gICAgICAgIC8vTG9nUHJpbnQoY2hhbm5lbC5maW5kKHggPT4geC5uYW1lID09PSBhY3R1YWxDaGFubmVsKS5obHMuU3RyZWFtU2VydmVyTGlzdC5maWx0ZXIoeCA9PiB4LnVybExpc3QuZmluZChhID0+IGEudXJsID09IHVybCAmJiBhLnF1YWxpdHkgPT0gcXVhbGl0eSkpKTtcclxuICAgICAgICAvL0xvZ1ByaW50KGNoYW5uZWwuZmluZCh4ID0+IHgubmFtZSA9PT0gYWN0dWFsQ2hhbm5lbCkuaGxzLlN0cmVhbVNlcnZlckxpc3QuZmlsdGVyKHggPT4geC51cmxMaXN0LmZpbmQoYSA9PiBhLnVybCAhPSB1cmwgJiYgYS5xdWFsaXR5ID09IHF1YWxpdHkpKSk7XHJcbiAgICAgICAgLy9Mb2dQcmludChcIm9rXCIpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYjI0dVptVjBZMmd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZabVYwWTJndmIyNHVabVYwWTJndWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJSVUVzVFVGQlRTeERRVUZETEV0QlFVc3NWVUZCVlN4RlFVRkZMRU5CUVVNc1QwRkJUeXhGUVVGRkxGRkJRVkVzUlVGQlJTeEhRVUZITzBsQlF6TkRMRGhDUVVFNFFqdEpRVU01UWl4MVEwRkJkVU03U1VGRGRrTXNTMEZCU3p0SlFVVlFMRTFCUVUwc1kwRkJZeXhIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEdOQlFXTXNSVUZCUlN4RFFVRkRPMGxCUlhKRUxIZEVRVUYzUkR0SlFVTjRSQ3hKUVVGSExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVNN1VVRkRlRUlzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRSUVVVM1FpeE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRPMWxCUTJwQ0xFbEJRVWtzUlVGQlJTeFpRVUZaTzFsQlEyeENMRXRCUVVzc1JVRkJSU3hKUVVGSk8xTkJRMW9zUTBGQlF5eERRVUZETzFGQlJVZ3NUVUZCVFN4UFFVRlBMRWRCUVVjc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF6dFJRVU12UWl4TlFVRk5MR2RDUVVGblFpeEhRVUZITEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdVVUZGTjBRc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVVjZRaXhKUVVGSk8xbEJRMFlzZVVSQlFYbEVPMWxCUTNwRUxFbEJRVWtzWjBKQlFXZENMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJUdG5Ra0ZETDBJc1RVRkJUU3hMUVVGTExFZEJRVWNzWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZETzJkQ1FVTm9SU3hOUVVGTkxFZEJRVWNzUjBGQlJ5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlFUdG5Ra0ZGTTBRc1RVRkJUU3hSUVVGUkxFZEJRVWNzVFVGQlRTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtRc1NVRkJTU3hYUVVGWExFZEJRVWNzVFVGQlRTeFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1owSkJSWGhETEVsQlFVY3NUVUZCVFN4RFFVRkRMRXRCUVVzc1EwRkJReXhYUVVGWExFTkJRVU1zUlVGQlF6dHZRa0ZETTBJc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXp0dlFrRkRhRU1zVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3MlEwRkJOa01zUTBGQlF5eERRVUZETzJsQ1FVTm9SVHRuUWtGRlJDeFBRVUZQTEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1YwRkJWeXhEUVVGRExGZEJRVmNzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0blFrRkZla1FzTmtKQlFUWkNPMkZCUXpsQ08xbEJSVVFzVFVGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3MlEwRkJOa01zUTBGQlF5eERRVUZETzFOQlEyaEZPMUZCUVVNc1QwRkJUeXhEUVVGRExFVkJRVVU3V1VGRFZpeHpRMEZCYzBNN1dVRkRkRU1zZFV4QlFYVk1PMWxCUlhaTUxFMUJRVTBzWVVGQllTeEhRVUZITEdkQ1FVRm5RaXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzU1VGQlNTeFRRVUZUTEVOQlFVTTdhVUpCUTNoRkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVFN1dVRkZkRVVzVFVGQlRTeFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xbEJSWEpGTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03V1VGRGVFSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU51UWl4alFVRmpMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0WlFVTjRReXhQUVVGUExFbEJRVWtzUTBGQlF6dFRRVU5pTzB0QlEwWTdVMEZCVFR0UlFVTk1MR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zVjBGQlZ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMUZCUTNwRExEUklRVUUwU0R0UlFVTTFTQ3h2U2tGQmIwbzdVVUZEY0Vvc2IwcEJRVzlLTzFGQlEzQktMR2RDUVVGblFqdFJRVU5vUWl4UFFVRlBMRWxCUVVrc1EwRkJRenRMUVVOaU8wRkJRMGdzUTBGQlF5SjkiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaW5mbGF0ZUZldGNoIH0gZnJvbSBcIi4vZmV0Y2gvZmV0Y2guaW5mbGF0ZVwiO1xyXG5pbXBvcnQgeyBITFMgfSBmcm9tIFwiLi9ITFNcIjtcclxuaW1wb3J0IHsgb25TdGFydCB9IGZyb20gXCIuL2NoYW5uZWwvb24uY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBvbiB9IGZyb20gXCIuL2ZldGNoL29uLmZldGNoXCI7XHJcbmltcG9ydCB7IGN1cnJlbnQgfSBmcm9tIFwiLi9jaGFubmVsL2N1cnJlbnQuY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBwaWN0dXJlIH0gZnJvbSBcIi4vY2hhbm5lbC9waWN0dXJlLmZldGNoXCI7XHJcbmV4cG9ydCBmdW5jdGlvbiBhcHAoc2NvcGUsIHdoaXRlbGlzdCkge1xyXG4gICAgc2NvcGUuTG9nUHJpbnQgPSAoeCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiW1B1cnBsZV06IFwiLCB4KTtcclxuICAgIH07XHJcbiAgICBzY29wZS5pc0FkcyA9ICh4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInN0aXRjaGVkLWFkXCIpIHx8IHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInR3aXRjaC1jbGllbnQtYWRcIik7XHJcbiAgICB9O1xyXG4gICAgc2NvcGUucmVhbEZldGNoID0gZmV0Y2g7XHJcbiAgICBzY29wZS5xdWFsaXR5ID0gXCJcIjtcclxuICAgIHNjb3BlLndoaXRlbGlzdCA9IFtdO1xyXG4gICAgc2NvcGUucGxheWVyO1xyXG4gICAgc2NvcGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBzd2l0Y2ggKGUuZGF0YS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRXaGl0ZWxpc3RcIjoge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUud2hpdGVsaXN0ID0gZS5kYXRhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUucXVhbGl0eSA9IGUuZGF0YS52YWx1ZS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNjb3BlLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgc3dpdGNoIChlLmRhdGEuZnVuY05hbWUpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUucXVhbGl0eSA9IGUuZGF0YS5hcmdzWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2NvcGUucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6IFwiaW5pdFwiLFxyXG4gICAgICAgIHZhbHVlOiBudWxsXHJcbiAgICB9KTtcclxuICAgIHNjb3BlLmNoYW5uZWwgPSBbXTtcclxuICAgIHNjb3BlLmFjdHVhbENoYW5uZWwgPSBcIlwiO1xyXG4gICAgc2NvcGUuY3VycmVudENoYW5uZWwgPSBjdXJyZW50O1xyXG4gICAgc2NvcGUubmV3UGljdHVyZSA9IHBpY3R1cmU7XHJcbiAgICBzY29wZS50dW5uZWwgPSBudWxsO1xyXG4gICAgc2NvcGUub25GZXRjaCA9IG9uO1xyXG4gICAgc2NvcGUub25TdGFydENoYW5uZWwgPSBvblN0YXJ0O1xyXG4gICAgc2NvcGUuSExTID0gSExTO1xyXG4gICAgaW5mbGF0ZUZldGNoKHNjb3BlKTtcclxufVxyXG5hcHAoc2VsZiwgWyd0ZXN0J10pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwyRndjQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNXVUZCV1N4RlFVRkZMRTFCUVUwc2RVSkJRWFZDTEVOQlFVTTdRVUZEY2tRc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeE5RVUZOTEU5QlFVOHNRMEZCUXp0QlFVTTFRaXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNjMEpCUVhOQ0xFTkJRVU03UVVGREwwTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hOUVVGTkxHdENRVUZyUWl4RFFVRkRPMEZCUTNSRExFOUJRVThzUlVGQlJTeFBRVUZQTEVWQlFVVXNUVUZCVFN3eVFrRkJNa0lzUTBGQlF6dEJRVU53UkN4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRkxFMUJRVTBzZVVKQlFYbENMRU5CUVVNN1FVRkZiRVFzVFVGQlRTeFZRVUZWTEVkQlFVY3NRMEZCUXl4TFFVRlZMRVZCUVVVc1UwRkJaMEk3U1VGRE9VTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhEUVVGRExFTkJRVTBzUlVGQlJTeEZRVUZGTzFGQlF6RkNMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXk5Q0xFTkJRVU1zUTBGQlF6dEpRVVZHTEV0QlFVc3NRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGVExFVkJRVVVzUlVGQlJUdFJRVU14UWl4UFFVRlBMRU5CUVVNc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzBsQlF6TkdMRU5CUVVNc1EwRkJRenRKUVVWR0xFdEJRVXNzUTBGQlF5eFRRVUZUTEVkQlFVY3NTMEZCU3l4RFFVRkRPMGxCUTNoQ0xFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTI1Q0xFdEJRVXNzUTBGQlF5eFRRVUZUTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTNKQ0xFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTTdTVUZGWWl4TFFVRkxMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVMEZCVXl4RlFVRkZMRlZCUVZVc1EwRkJRenRSUVVNelF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRk8xbEJRMjVDTEV0QlFVc3NZMEZCWXl4RFFVRkRMRU5CUVVNN1owSkJRMjVDTEV0QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTTdaMEpCUXk5Q0xFMUJRVTA3WVVGRFVEdFpRVU5FTEV0QlFVc3NXVUZCV1N4RFFVRkRMRU5CUVVNN1owSkJRMnBDTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRPMmRDUVVOc1F5eE5RVUZOTzJGQlExQTdXVUZEUkN4UFFVRlBMRU5CUVVNc1EwRkJRenRuUWtGRFVDeE5RVUZOTzJGQlExQTdVMEZEUmp0SlFVTklMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJSVWdzUzBGQlN5eERRVUZETEdkQ1FVRm5RaXhEUVVGRExGTkJRVk1zUlVGQlJTeFZRVUZWTEVOQlFVTTdVVUZETTBNc1VVRkJVU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlR0WlFVTjJRaXhMUVVGTExGbEJRVmtzUTBGQlF5eERRVUZETzJkQ1FVTnFRaXhMUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXp0blFrRkRjRU1zVFVGQlRUdGhRVU5RTzFsQlEwUXNUMEZCVHl4RFFVRkRMRU5CUVVNN1owSkJRMUFzVFVGQlRUdGhRVU5RTzFOQlEwWTdTVUZEU0N4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVWSUxFdEJRVXNzUTBGQlF5eFhRVUZYTEVOQlFVTTdVVUZEYUVJc1NVRkJTU3hGUVVGRkxFMUJRVTA3VVVGRFdpeExRVUZMTEVWQlFVVXNTVUZCU1R0TFFVTmFMRU5CUVVNc1EwRkJRenRKUVVWSUxFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTI1Q0xFdEJRVXNzUTBGQlF5eGhRVUZoTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTNwQ0xFdEJRVXNzUTBGQlF5eGpRVUZqTEVkQlFVY3NUMEZCVHl4RFFVRkRPMGxCUlM5Q0xFdEJRVXNzUTBGQlF5eFZRVUZWTEVkQlFVY3NUMEZCVHl4RFFVRkRPMGxCUXpOQ0xFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRPMGxCUlhCQ0xFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTI1Q0xFdEJRVXNzUTBGQlF5eGpRVUZqTEVkQlFVY3NUMEZCVHl4RFFVRkRPMGxCUlM5Q0xFdEJRVXNzUTBGQlF5eEhRVUZITEVkQlFVY3NSMEZCUnl4RFFVRkRPMGxCUldoQ0xGbEJRVmtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0QlFVTjBRaXhEUVVGRE8wRkJRMFFzUjBGQlJ5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1pZlE9PSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==