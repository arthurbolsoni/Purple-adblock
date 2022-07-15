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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class HLS {
    constructor() {
        this._header = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:6", "#EXT-X-MEDIA-SEQUENCE:"];
        this._playlist = [];
        this._sequence = 0;
        this._streamServerList = [];
    }
    //add m3u8 links with quality to the list of servers
    addStreamLink(text, type = "local", sig = false) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.signature();
            }
            return true;
        });
    }
    signature() {
        return __awaiter(this, void 0, void 0, function* () {
            const REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;
            yield new Promise((resolve) => this._streamServerList
                .filter((x) => x.sig == false)
                .forEach((x) => __awaiter(this, void 0, void 0, function* () {
                const match = REGEX.exec(x.urlList[0].url);
                if (match) {
                    try {
                        const a = yield fetch("https://jupter.ga/hls/v2/sig/" + match[2] + "/" + match[1], {
                            method: "GET",
                        });
                        x.sig = true;
                        resolve(true);
                    }
                    catch (_a) {
                        resolve(false);
                    }
                }
                else {
                    resolve(false);
                }
            })));
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0hMUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxNQUFNLE9BQU8sR0FBRztJQUFoQjtRQUNVLFlBQU8sR0FBa0IsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUM5RyxjQUFTLEdBQW1CLEVBQUUsQ0FBQztRQUMvQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2Qsc0JBQWlCLEdBQW1CLEVBQUUsQ0FBQztJQStHakQsQ0FBQztJQTdHQyxvREFBb0Q7SUFDOUMsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsT0FBTyxFQUFFLEdBQUcsR0FBRyxLQUFLOztZQUMzRCxNQUFNLGVBQWUsR0FBaUIsRUFBRSxDQUFDO1lBQ3pDLElBQUksWUFBb0MsQ0FBQztZQUV6QyxNQUFNLEtBQUssR0FBRyxxRkFBcUYsQ0FBQztZQUVwRyxPQUFPLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2pELGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzFFO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3QixNQUFNLFVBQVUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDeEUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNSLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2FB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

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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function onStart(_window, url, text /* isOffline = false */) {
    return __awaiter(this, void 0, void 0, function* () {
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
            if (!__webpack_require__.g.channel.find((c) => c.name === match[1])) {
                __webpack_require__.g.LogPrint("Channel: " + match[1]);
                __webpack_require__.g.channel.push({ name: match[1], flowSig: [], hls: new __webpack_require__.g.HLS() });
            }
            else {
                __webpack_require__.g.LogPrint("Exist: " + match[1]);
                existent = true;
            }
        }
        //--------------------------------------------//
        //--------------------------------------------//
        __webpack_require__.g.LogPrint("Local Server: Loading");
        __webpack_require__.g.currentChannel(match[1]).hls.addStreamLink(text);
        __webpack_require__.g.LogPrint("Local Server: OK");
        if (existent)
            return;
        //--------------------------------------------//
        //--------------------------------------------//
        yield __webpack_require__.g.newPicture(__webpack_require__.g.actualChannel).then((textPicture) => {
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
            __webpack_require__.g.LogPrint(streamList);
            __webpack_require__.g.channel.find((x) => x.name === match[1]).hls.add(streamList);
            __webpack_require__.g.LogPrint("External Server: OK");
        }
        catch (e) {
            __webpack_require__.g.LogPrint(e);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFubmVsL29uLmNoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsTUFBTSxVQUFnQixPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsdUJBQXVCOztRQUN0RSxNQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQztRQUNqQyxNQUFNLEtBQUssR0FBeUIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRXJCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ1osSUFBRyxNQUFNLENBQUMsU0FBUyxJQUFJLFNBQVMsRUFBQztnQkFDL0IsTUFBTSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDdkI7WUFDRCxNQUFNLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN2QyxPQUFPO2FBQ1I7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BELE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFF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

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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//external request throuhg purple server
function external(channelName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            __webpack_require__.g.LogPrint("External Server: Loading");
            const response = yield __webpack_require__.g.realFetch("https://" + __webpack_require__.g.tunnel[0] + "/channel/" + channelName);
            if (!response.ok) {
                throw new Error("server proxy return error or not found");
            }
            const text = yield response.text();
            __webpack_require__.g.LogPrint("External Server: OK");
            return text;
        }
        catch (e) {
            __webpack_require__.g.LogPrint(e);
            return "";
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwuZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsd0NBQXdDO0FBQ3hDLE1BQU0sVUFBZ0IsUUFBUSxDQUFDLFdBQW1COztRQUNoRCxJQUFJO1lBQ0YsTUFBTSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sUUFBUSxHQUFhLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUM7WUFFOUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQzthQUMzRDtZQUVELE1BQU0sSUFBSSxHQUFXLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRTNDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUV2QyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sRUFBRSxDQUFDO1NBQ1g7SUFDSCxDQUFDO0NBQUEifQ==

/***/ }),

/***/ "./src/fetch/inflate.fetch.ts":
/*!************************************!*\
  !*** ./src/fetch/inflate.fetch.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "inflateFetch": () => (/* binding */ inflateFetch)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function inflateFetch() {
    // eslint-disable-next-line no-global-assign
    __webpack_require__.g.fetch = function (url, options) {
        return __awaiter(this, arguments, void 0, function* () {
            if (typeof url === "string") {
                if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !__webpack_require__.g.whitelist.includes(__webpack_require__.g.actualChannel)) {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield __webpack_require__.g.realFetch(url, options)
                                .then((response) => __awaiter(this, void 0, void 0, function* () { return (response.text()); }))
                                .then((text) => __awaiter(this, void 0, void 0, function* () {
                                //send the flow stream to script valitor and classificator
                                yield __webpack_require__.g.onFetch(__webpack_require__.g, text, url);
                                var playlist = __webpack_require__.g.currentChannel().hls.getAllPlaylist();
                                resolve(new Response(playlist));
                            }));
                        }
                        catch (_a) {
                            resolve(new Response());
                        }
                    }));
                }
                if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
                    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const response = yield __webpack_require__.g.realFetch(url, options);
                            if (!response.ok) {
                                resolve(response);
                                __webpack_require__.g.LogPrint("channel offline");
                            }
                            response.text().then((text) => __awaiter(this, void 0, void 0, function* () {
                                yield __webpack_require__.g.onStartChannel(__webpack_require__.g, url, text);
                                resolve(new Response(text));
                            }));
                        }
                        catch (_b) {
                            resolve(new Response());
                        }
                    }));
                }
                if (url.includes("picture-by-picture")) {
                }
            }
            return __webpack_require__.g.realFetch.apply(this, arguments);
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mbGF0ZS5mZXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9pbmZsYXRlLmZldGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE1BQU0sVUFBVSxZQUFZO0lBQzFCLDRDQUE0QztJQUM1QyxNQUFNLENBQUMsS0FBSyxHQUFHLFVBQWdCLEdBQUcsRUFBRSxPQUFPOztZQUN6QyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtnQkFDM0IsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ3pHLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBTyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQzNDLElBQUk7NEJBQ0YsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7aUNBQ2pDLElBQUksQ0FBQyxDQUFNLFFBQVEsRUFBQyxFQUFFLGdEQUFDLE9BQUEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQSxHQUFBLENBQUM7aUNBQ3pDLElBQUksQ0FBQyxDQUFNLElBQUksRUFBQyxFQUFFO2dDQUNqQiwwREFBMEQ7Z0NBQzFELE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dDQUV4QyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dDQUM1RCxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs0QkFDbEMsQ0FBQyxDQUFBLENBQUMsQ0FBQzt5QkFDTjt3QkFBQyxXQUFNOzRCQUNOLE9BQU8sQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUM7eUJBQ3pCO29CQUNILENBQUMsQ0FBQSxDQUFDLENBQUM7aUJBQ0o7Z0JBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7b0JBQzNGLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBTyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQzNDLElBQUk7NEJBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQzs0QkFDdEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUM7Z0NBQ2YsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dDQUNqQixNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7NkJBQ3BDOzRCQUVELFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBTSxJQUFJLEVBQUMsRUFBRTtnQ0FDaEMsTUFBTSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0NBQy9DLE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUM5QixDQUFDLENBQUEsQ0FBQyxDQUFDO3lCQUNKO3dCQUFDLFdBQU07NEJBQ04sT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQzt5QkFDekI7b0JBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQztpQkFDSjtnQkFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTtpQkFDdkM7YUFDRjtZQUVELE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELENBQUM7S0FBQSxDQUFDO0FBQ0osQ0FBQyJ9

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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function on(_window, response, url) {
    return __awaiter(this, void 0, void 0, function* () {
        //  if (Math.random() < 0.5 ){
        //      response += "twitch-client-ad";
        //  }
        const channelCurrent = yield __webpack_require__.g.currentChannel();
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
                    const returno2 = yield __webpack_require__.g.realFetch(url.url);
                    var returnoText = yield returno2.text();
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
                const returno = yield (yield __webpack_require__.g.realFetch(pictureStream)).text();
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
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvb24uZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsTUFBTSxVQUFnQixFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHOztRQUM3Qyw4QkFBOEI7UUFDOUIsdUNBQXVDO1FBQ3ZDLEtBQUs7UUFFTCxNQUFNLGNBQWMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyRCx3REFBd0Q7UUFDeEQsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBRTFCLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFN0IsY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFekMsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFDakIsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLEtBQUssRUFBRSxJQUFJO2FBQ1osQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFDakIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLElBQUk7YUFDWixDQUFDLENBQUM7WUFFSCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQy9CLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztZQUU3RCxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpCLElBQUk7Z0JBQ0YsMERBQTBEO2dCQUMxRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQy9CLE1BQU0sS0FBSyxHQUEyQixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUM7b0JBRXhGLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO3FCQUNoRTtvQkFFRCxNQUFNLEdBQUcsR0FBMkIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUM7b0JBRXBGLElBQUksQ0FBQyxHQUFHLEVBQUU7d0JBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO3FCQUNoRTtvQkFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNqRCxJQUFJLFdBQVcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFeEMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUM3QixNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7cUJBQ2hFO29CQUVELE9BQU8sY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ3BEO2dCQUVELDZCQUE2QjtnQkFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO2FBQ2hFO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1Ysc0NBQXNDO2dCQUN0QyxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDcEYsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ2pELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUVULE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFckUsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDM0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDekI7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO2FBQU07WUFDTCxjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztDQUFBIn0=

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
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function picture(channelName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const gql = yield __webpack_require__.g.realFetch("https://gql.twitch.tv/gql", {
                method: "POST",
                headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
                body: `{"operationName":"PlaybackAccessToken","variables":{"isLive":true,"login":"${channelName}","isVod":false,"vodID":"","playerType":"thunderdome"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
            });
            const status = yield gql.json();
            const url = "https://usher.ttvnw.net/api/channel/hls/" +
                channelName +
                ".m3u8?allow_source=true&fast_bread=true&p=" +
                Math.floor(Math.random() * 1e7) +
                "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
                status["data"]["streamPlaybackAccessToken"]["signature"] +
                "&supported_codecs=avc1&token=" +
                status["data"]["streamPlaybackAccessToken"]["value"];
            const text = yield (yield __webpack_require__.g.realFetch(url)).text();
            return text;
        }
        catch (e) {
            console.log(e);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGljdHVyZS5mZXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9waWN0dXJlLmZldGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE1BQU0sVUFBZ0IsT0FBTyxDQUFDLFdBQW1COztRQUMvQyxJQUFJO1lBQ0YsTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLDJCQUEyQixFQUFFO2dCQUM5RCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsZ0NBQWdDLEVBQUU7Z0JBQzFELElBQUksRUFBRSw4RUFBOEUsV0FBVyx1TEFBdUw7YUFDdlIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxNQUFNLEdBQVcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFeEMsTUFBTSxHQUFHLEdBQ1AsMENBQTBDO2dCQUMxQyxXQUFXO2dCQUNYLDRDQUE0QztnQkFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUMvQixnR0FBZ0c7Z0JBQ2hHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLFdBQVcsQ0FBQztnQkFDeEQsK0JBQStCO2dCQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV2RCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQjtJQUNILENBQUM7Q0FBQSJ9

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
/* harmony import */ var _fetch_inflate_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fetch/inflate.fetch */ "./src/fetch/inflate.fetch.ts");
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
    scope.LogPrint("Script running");
    (0,_fetch_inflate_fetch__WEBPACK_IMPORTED_MODULE_0__.inflateFetch)();
}
app(__webpack_require__.g);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBVTtJQUU1QixLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzFJLENBQUMsQ0FBQztJQUVGLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQzFCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBRXRCLDZCQUE2QjtJQUM3QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztRQUMzQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3ZCLEtBQUssWUFBWSxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxNQUFNO2FBQ1A7WUFDRCxPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNO2FBQ1A7U0FDRjtRQUVELFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDbkIsS0FBSyxZQUFZLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtvQkFDaEIsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7b0JBQ3pDLEtBQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO2lCQUM5QztnQkFDRCxNQUFNO2FBQ1A7WUFDRCxLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNqQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDbEMsTUFBTTthQUNQO1lBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ1AsTUFBTTthQUNQO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDaEIsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsSUFBSTtLQUNaLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9CLEtBQUssQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzNCLEtBQUssQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO0lBQzdCLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUVoQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFLLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztJQUUvQixLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUVoQixLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDaEMsWUFBWSxFQUFFLENBQUM7QUFDakIsQ0FBQztBQUNELEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyJ9
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU87QUFDbEMsZ0JBQWdCLHFDQUFHO0FBQ25CO0FBQ0EsSUFBSSxrRUFBWTtBQUNoQjtBQUNBLElBQUkscUJBQU07QUFDViwyQ0FBMkMsKzNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL0hMUy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9jdXJyZW50LmNoYW5uZWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NoYW5uZWwvb24uY2hhbm5lbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL2luZmxhdGUuZmV0Y2gudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL29uLmZldGNoLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9waWN0dXJlLmZldGNoLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5leHBvcnQgY2xhc3MgSExTIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2hlYWRlciA9IFtcIiNFWFRNM1VcIiwgXCIjRVhULVgtVkVSU0lPTjozXCIsIFwiI0VYVC1YLVRBUkdFVERVUkFUSU9OOjZcIiwgXCIjRVhULVgtTUVESUEtU0VRVUVOQ0U6XCJdO1xyXG4gICAgICAgIHRoaXMuX3BsYXlsaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSAwO1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QgPSBbXTtcclxuICAgIH1cclxuICAgIC8vYWRkIG0zdTggbGlua3Mgd2l0aCBxdWFsaXR5IHRvIHRoZSBsaXN0IG9mIHNlcnZlcnNcclxuICAgIGFkZFN0cmVhbUxpbmsodGV4dCwgdHlwZSA9IFwibG9jYWxcIiwgc2lnID0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGNhcHR1cmVBcnJheTtcclxuICAgICAgICAgICAgY29uc3QgUkVHRVggPSAvTkFNRT1cIigoPzpcXFMrXFxzK1xcUyt8XFxTKykpXCIsQVVUTyg/Ol58XFxTK1xccyspKD86XnxcXFMrXFxzKykoaHR0cHM6XFwvXFwvdmlkZW8oXFxTKykubTN1OCkvZztcclxuICAgICAgICAgICAgd2hpbGUgKChjYXB0dXJlQXJyYXkgPSBSRUdFWC5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcXVhbGl0eVVybFNwbGl0LnB1c2goeyBxdWFsaXR5OiBjYXB0dXJlQXJyYXlbMV0sIHVybDogY2FwdHVyZUFycmF5WzJdIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHF1YWxpdHlVcmxTcGxpdCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSB7IHNlcnZlcjogdHlwZSwgdXJsTGlzdDogcXVhbGl0eVVybFNwbGl0LCBzaWc6IHNpZyB9O1xyXG4gICAgICAgICAgICB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0LnB1c2goc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgICAgIGlmICghc2lnKSB7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNpZ25hdHVyZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc2lnbmF0dXJlKCkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFJFR0VYID0gL3ZpZGVvLXdlYXZlci4oLiopLmhscy50dHZudy5uZXRcXC92MVxcL3BsYXlsaXN0XFwvKC4qKS5tM3U4JC9nbTtcclxuICAgICAgICAgICAgeWllbGQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHRoaXMuX3N0cmVhbVNlcnZlckxpc3RcclxuICAgICAgICAgICAgICAgIC5maWx0ZXIoKHgpID0+IHguc2lnID09IGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLmZvckVhY2goKHgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gUkVHRVguZXhlYyh4LnVybExpc3RbMF0udXJsKTtcclxuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSB5aWVsZCBmZXRjaChcImh0dHBzOi8vanVwdGVyLmdhL2hscy92Mi9zaWcvXCIgKyBtYXRjaFsyXSArIFwiL1wiICsgbWF0Y2hbMV0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHguc2lnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZ2V0IFN0cmVhbVNlcnZlckxpc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0cmVhbVNlcnZlckxpc3Q7XHJcbiAgICB9XHJcbiAgICBhZGRQbGF5bGlzdChwbGF5bGlzdCkge1xyXG4gICAgICAgIGlmIChwbGF5bGlzdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBwbGF5bGlzdC50b1N0cmluZygpLnNwbGl0KC9bXFxyXFxuXS8pO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls0XSA9IGxpbmVzWzRdO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls1XSA9IGxpbmVzWzVdO1xyXG4gICAgICAgIC8vdGFrZSBhbGwgbTN1OSBjb250ZW50IHRvIHRoZSBwbGF5bGlzdCBhbmQgYnVpbGQgYSB2YXJpYmxlXHJcbiAgICAgICAgZm9yIChjb25zdCBpIGluIGxpbmVzKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5lc1tpXS5pbmNsdWRlcyhcIiNFWFRJTkZcIikgJiYgbGluZXNbaV0uaW5jbHVkZXMoXCIsbGl2ZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgLy90aW1lc3RhbXAgc2VxdWVuY2VcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcXVlbmNlVGltZXN0YW1wID0gTWF0aC5mbG9vcihuZXcgRGF0ZShsaW5lc1twYXJzZUludChpKSAtIDFdLnNsaWNlKGxpbmVzW3BhcnNlSW50KGkpIC0gMV0ubGVuZ3RoIC0gMjQsIGxpbmVzW3BhcnNlSW50KGkpIC0gMV0ubGVuZ3RoKSkuZ2V0VGltZSgpIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICAvL3NlbGVjdCBhbGwgc2VxdWVuY2UgdGhhdCBubyBleGlzdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuX3BsYXlsaXN0LmZpbHRlcigoeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWVzdGFtcCA+PSBzZXF1ZW5jZVRpbWVzdGFtcDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy9hZGQgdGhlIHNlcXVlbmNlIG9uIHBsYXlsaXN0IHZhcmlhYmxlIGlmIGl0IG5vIGV4aXN0XHJcbiAgICAgICAgICAgICAgICBpZiAoIXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSB0aGlzLl9zZXF1ZW5jZSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGxpbmVzW3BhcnNlSW50KGkpIC0gMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogc2VxdWVuY2VUaW1lc3RhbXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm86IGxpbmVzW3BhcnNlSW50KGkpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBsaW5lc1twYXJzZUludChpKSArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuX3BsYXlsaXN0Lmxlbmd0aCA+IDE1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hhbmdlZDtcclxuICAgIH1cclxuICAgIGdldEFsbFBsYXlsaXN0KCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5faGVhZGVyWzBdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclsxXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMl0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzNdICtcclxuICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzRdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls1XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5tYXAoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWUgKyBcIlxcblwiICsgeC5pbmZvICsgXCJcXG5cIiArIHgudXJsICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNFeFRMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZjM0pqTDBoTVV5NTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPenM3T3pzN096czdRVUZCUVN4TlFVRk5MRTlCUVU4c1IwRkJSenRKUVVGb1FqdFJRVU5WTEZsQlFVOHNSMEZCYTBJc1EwRkJReXhUUVVGVExFVkJRVVVzYTBKQlFXdENMRVZCUVVVc2VVSkJRWGxDTEVWQlFVVXNkMEpCUVhkQ0xFTkJRVU1zUTBGQlF6dFJRVU01Unl4alFVRlRMRWRCUVcxQ0xFVkJRVVVzUTBGQlF6dFJRVU12UWl4alFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRMlFzYzBKQlFXbENMRWRCUVcxQ0xFVkJRVVVzUTBGQlF6dEpRU3RIYWtRc1EwRkJRenRKUVRkSFF5eHZSRUZCYjBRN1NVRkRPVU1zWVVGQllTeERRVUZETEVsQlFWa3NSVUZCUlN4SlFVRkpMRWRCUVVjc1QwRkJUeXhGUVVGRkxFZEJRVWNzUjBGQlJ5eExRVUZMT3p0WlFVTXpSQ3hOUVVGTkxHVkJRV1VzUjBGQmFVSXNSVUZCUlN4RFFVRkRPMWxCUTNwRExFbEJRVWtzV1VGQmIwTXNRMEZCUXp0WlFVVjZReXhOUVVGTkxFdEJRVXNzUjBGQlJ5eHhSa0ZCY1VZc1EwRkJRenRaUVVWd1J5eFBRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkpMRVZCUVVVN1owSkJRMnBFTEdWQlFXVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hQUVVGUExFVkJRVVVzV1VGQldTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPMkZCUXpGRk8xbEJRMFFzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4bFFVRmxMRU5CUVVNc1EwRkJRenRaUVVNM1FpeE5RVUZOTEZWQlFWVXNSMEZCUnl4RlFVRkZMRTFCUVUwc1JVRkJSU3hKUVVGSkxFVkJRVVVzVDBGQlR5eEZRVUZGTEdWQlFXVXNSVUZCUlN4SFFVRkhMRVZCUVVVc1IwRkJSeXhGUVVGRkxFTkJRVU03V1VGRGVFVXNTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRaUVVWNFF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZPMmRDUVVOU0xFMUJRVTBzU1VGQlNTeERRVUZETEZOQlFWTXNSVUZCUlN4RFFVRkRPMkZCUTNoQ08xbEJRMFFzVDBGQlR5eEpRVUZKTEVOQlFVTTdVVUZEWkN4RFFVRkRPMHRCUVVFN1NVRkZTeXhUUVVGVE96dFpRVU5pTEUxQlFVMHNTMEZCU3l4SFFVRkhMRFpFUVVFMlJDeERRVUZETzFsQlJUVkZMRTFCUVUwc1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlN4RFFVTTFRaXhKUVVGSkxFTkJRVU1zYVVKQlFXbENPMmxDUVVOdVFpeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRk5MRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVsQlFVa3NTMEZCU3l4RFFVRkRPMmxDUVVOc1F5eFBRVUZQTEVOQlFVTXNRMEZCVHl4RFFVRk5MRVZCUVVVc1JVRkJSVHRuUWtGRGVFSXNUVUZCVFN4TFFVRkxMRWRCUVRKQ0xFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0blFrRkRia1VzU1VGQlNTeExRVUZMTEVWQlFVVTdiMEpCUTFRc1NVRkJTVHQzUWtGRFJpeE5RVUZOTEVOQlFVTXNSMEZCUnl4TlFVRk5MRXRCUVVzc1EwRkJReXdyUWtGQkswSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSVHMwUWtGRGFrWXNUVUZCVFN4RlFVRkZMRXRCUVVzN2VVSkJRMlFzUTBGQlF5eERRVUZETzNkQ1FVTklMRU5CUVVNc1EwRkJReXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETzNkQ1FVTmlMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dHhRa0ZEWmp0dlFrRkJReXhYUVVGTk8zZENRVU5PTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenR4UWtGRGFFSTdhVUpCUTBZN2NVSkJRVTA3YjBKQlEwd3NUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8ybENRVU5vUWp0WlFVTklMRU5CUVVNc1EwRkJRU3hEUVVGRExFTkJRMHdzUTBGQlF6dFJRVU5LTEVOQlFVTTdTMEZCUVR0SlFVVkVMRWxCUVVrc1owSkJRV2RDTzFGQlEyeENMRTlCUVU4c1NVRkJTU3hEUVVGRExHbENRVUZwUWl4RFFVRkRPMGxCUTJoRExFTkJRVU03U1VGRlJDeFhRVUZYTEVOQlFVTXNVVUZCWjBJN1VVRkRNVUlzU1VGQlNTeFJRVUZSTEV0QlFVc3NTVUZCU1N4RlFVRkZPMWxCUTNKQ0xFOUJRVThzUzBGQlN5eERRVUZETzFOQlEyUTdVVUZGUkN4SlFVRkpMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU03VVVGRmNFSXNUVUZCVFN4TFFVRkxMRWRCUVVjc1VVRkJVU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVOc1JDeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTXpRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVVV6UWl3eVJFRkJNa1E3VVVGRE0wUXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExFVkJRVVU3V1VGRGNrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVN1owSkJRemxFTEc5Q1FVRnZRanRuUWtGRGNFSXNUVUZCVFN4cFFrRkJhVUlzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkhMRVZCUVVVc1JVRkJSU3hMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlJXcExMRzFEUVVGdFF6dG5Ra0ZEYmtNc1RVRkJUU3hEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJUdHZRa0ZEY0VNc1QwRkJUeXhEUVVGRExFTkJRVU1zVTBGQlV5eEpRVUZKTEdsQ1FVRnBRaXhEUVVGRE8yZENRVU14UXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRFNDeHpSRUZCYzBRN1owSkJRM1JFTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRk8yOUNRVU5pTEVsQlFVa3NRMEZCUXl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eERRVUZETEVOQlFVTTdiMEpCUTNCRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRPM2RDUVVOc1FpeEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdkMEpCUXpWQ0xGTkJRVk1zUlVGQlJTeHBRa0ZCYVVJN2QwSkJRelZDTEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzNkQ1FVTjRRaXhIUVVGSExFVkJRVVVzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03Y1VKQlF6VkNMRU5CUVVNc1EwRkJRenR2UWtGRFNDeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmxDUVVOb1FqdG5Ra0ZEUkN4UFFVRlBMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zVFVGQlRTeEhRVUZITEVWQlFVVXNSVUZCUlR0dlFrRkRha01zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRwUWtGRGVFSTdZVUZEUmp0VFFVTkdPMUZCUTBRc1QwRkJUeXhQUVVGUExFTkJRVU03U1VGRGFrSXNRMEZCUXp0SlFVVkVMR05CUVdNN1VVRkRXaXhQUVVGUExFTkJRMHdzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSkxFTkJRVU1zVTBGQlV6dFpRVU5rTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZPMmRDUVVOMlFpeFBRVUZQTEVOQlFVTXNRMEZCUXl4SlFVRkpMRWRCUVVjc1NVRkJTU3hIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETzFsQlEzUkVMRU5CUVVNc1EwRkJReXhEUVVOSUxFTkJRVU03U1VGRFNpeERRVUZETzBOQlEwWWlmUT09IiwiZXhwb3J0IGZ1bmN0aW9uIGN1cnJlbnQoY2hhbm5lbCA9IG51bGwpIHtcclxuICAgIGlmIChjaGFubmVsKSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gY2hhbm5lbCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZ2xvYmFsLmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBnbG9iYWwuYWN0dWFsQ2hhbm5lbCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWTNWeWNtVnVkQzVqYUdGdWJtVnNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyTm9ZVzV1Wld3dlkzVnljbVZ1ZEM1amFHRnVibVZzTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1ZVRkJWU3hQUVVGUExFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVazdTVUZEY0VNc1NVRkJTU3hQUVVGUExFVkJRVVU3VVVGRFdDeFBRVUZQTEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExFOUJRVThzUTBGQlF5eERRVUZETzB0QlEzWkVPMU5CUVUwN1VVRkRUQ3hQUVVGUExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRTFCUVUwc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF6dExRVU53UlR0QlFVTklMRU5CUVVNaWZRPT0iLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn07XHJcbmV4cG9ydCBmdW5jdGlvbiBvblN0YXJ0KF93aW5kb3csIHVybCwgdGV4dCAvKiBpc09mZmxpbmUgPSBmYWxzZSAqLykge1xyXG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICBjb25zdCByZWdleCA9IC9obHNcXC8oLiopLm0zdTgvZ207XHJcbiAgICAgICAgY29uc3QgbWF0Y2ggPSByZWdleC5leGVjKHVybCkgfHwgW107XHJcbiAgICAgICAgbGV0IGV4aXN0ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKG1hdGNoWzFdKSB7XHJcbiAgICAgICAgICAgIGlmIChnbG9iYWwud2hpdGVsaXN0ID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLndoaXRlbGlzdCA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGdsb2JhbC5hY3R1YWxDaGFubmVsID0gbWF0Y2hbMV07XHJcbiAgICAgICAgICAgIGlmIChnbG9iYWwud2hpdGVsaXN0LmluY2x1ZGVzKG1hdGNoWzFdKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZ2xvYmFsLmNoYW5uZWwuZmluZCgoYykgPT4gYy5uYW1lID09PSBtYXRjaFsxXSkpIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkNoYW5uZWw6IFwiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLmNoYW5uZWwucHVzaCh7IG5hbWU6IG1hdGNoWzFdLCBmbG93U2lnOiBbXSwgaGxzOiBuZXcgZ2xvYmFsLkhMUygpIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXhpc3Q6IFwiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICAgICAgZXhpc3RlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkxvY2FsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgICAgICBnbG9iYWwuY3VycmVudENoYW5uZWwobWF0Y2hbMV0pLmhscy5hZGRTdHJlYW1MaW5rKHRleHQpO1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkxvY2FsIFNlcnZlcjogT0tcIik7XHJcbiAgICAgICAgaWYgKGV4aXN0ZW50KVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAgICAgeWllbGQgZ2xvYmFsLm5ld1BpY3R1cmUoZ2xvYmFsLmFjdHVhbENoYW5uZWwpLnRoZW4oKHRleHRQaWN0dXJlKSA9PiB7XHJcbiAgICAgICAgICAgIGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dFBpY3R1cmUsIFwicGljdHVyZVwiLCB0cnVlKTtcclxuICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiTG9jYWwgU2VydmVyIDQ4MHA6IE9LXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgICAgIGlmICghZ2xvYmFsLmlzUHJveHlBdXRoKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgZ2xvYmFsLm5ld0V4dGVybmFsKGdsb2JhbC5hY3R1YWxDaGFubmVsKS50aGVuKCh0ZXh0KSA9PiBnbG9iYWwuY3VycmVudENoYW5uZWwobWF0Y2hbMV0pLmhscy5hZGRTdHJlYW1MaW5rKHRleHQsIFwicHJveHlcIiwgdHJ1ZSkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSB0ZXh0LnNwbGl0KFwiLlwiKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VydmVyID0gcXVhbGl0eVVybFNwbGl0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSB7IHNlcnZlcjogXCJwcm94eVwiLCB1cmxMaXN0OiBbXSB9O1xyXG4gICAgICAgICAgICBxdWFsaXR5VXJsU3BsaXQuZm9yRWFjaCgoZWxlbWVudCwgaW5kZXgsIGFycmF5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShpbmRleCAlIDIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtTGlzdC51cmxMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5OiBzdHJlYW1MaXN0LnVybExpc3Quc29tZSgoeCkgPT4geC5xdWFsaXR5ID09IGVsZW1lbnQpID8gZWxlbWVudCArIFwicDMwXCIgOiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly92aWRlby13ZWF2ZXIuXCIgKyBzZXJ2ZXIgKyBcIi5obHMudHR2bncubmV0L3YxL3BsYXlsaXN0L1wiICsgYXJyYXlbaW5kZXggKyAxXSArIFwiLm0zdThcIixcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChzdHJlYW1MaXN0KTtcclxuICAgICAgICAgICAgZ2xvYmFsLmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBtYXRjaFsxXSkuaGxzLmFkZChzdHJlYW1MaXN0KTtcclxuICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWIyNHVZMmhoYm01bGJDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5amFHRnVibVZzTDI5dUxtTm9ZVzV1Wld3dWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPenM3T3pzN08wRkJRVUVzVFVGQlRTeFZRVUZuUWl4UFFVRlBMRU5CUVVNc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeEpRVUZKTEVOQlFVTXNkVUpCUVhWQ096dFJRVU4wUlN4TlFVRk5MRXRCUVVzc1IwRkJSeXhyUWtGQmEwSXNRMEZCUXp0UlFVTnFReXhOUVVGTkxFdEJRVXNzUjBGQmVVSXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdVVUZETVVRc1NVRkJTU3hSUVVGUkxFZEJRVWNzUzBGQlN5eERRVUZETzFGQlJYSkNMRWxCUVVrc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTzFsQlExb3NTVUZCUnl4TlFVRk5MRU5CUVVNc1UwRkJVeXhKUVVGSkxGTkJRVk1zUlVGQlF6dG5Ra0ZETDBJc1RVRkJUU3hEUVVGRExGTkJRVk1zUjBGQlJ5eEZRVUZGTEVOQlFVTTdZVUZEZGtJN1dVRkRSQ3hOUVVGTkxFTkJRVU1zWVVGQllTeEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOb1F5eEpRVUZKTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZPMmRDUVVOMlF5eFBRVUZQTzJGQlExSTdXVUZGUkN4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEV0QlFVc3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVU3WjBKQlEzQkVMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVjBGQlZ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU40UXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzVDBGQlR5eEZRVUZGTEVWQlFVVXNSVUZCUlN4SFFVRkhMRVZCUVVVc1NVRkJTU3hOUVVGTkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMkZCUXpkRk8ybENRVUZOTzJkQ1FVTk1MRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVTBGQlV5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU4wUXl4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRE8yRkJRMnBDTzFOQlEwWTdVVUZEUkN4blJFRkJaMFE3VVVGRmFFUXNaMFJCUVdkRU8xRkJRMmhFTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc2RVSkJRWFZDTEVOQlFVTXNRMEZCUXp0UlFVTjZReXhOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRlRVFzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzFGQlJYQkRMRWxCUVVrc1VVRkJVVHRaUVVGRkxFOUJRVTg3VVVGRmNrSXNaMFJCUVdkRU8xRkJSV2hFTEdkRVFVRm5SRHRSUVVOb1JDeE5RVUZOTEUxQlFVMHNRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRmRCUVZjc1JVRkJSU3hGUVVGRk8xbEJRMnBGTEUxQlFVMHNRMEZCUXl4alFVRmpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMR0ZCUVdFc1EwRkJReXhYUVVGWExFVkJRVVVzVTBGQlV5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTJoR0xFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNkVUpCUVhWQ0xFTkJRVU1zUTBGQlF6dFJRVU16UXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVWSUxHZEVRVUZuUkR0UlFVVm9SQ3huUkVGQlowUTdVVUZGYUVRc1NVRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTzFsQlFVVXNUMEZCVHp0UlFVTXZRaXhOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhqUVVGakxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNUMEZCVHl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRmFFa3NUMEZCVHp0UlFVVlFMRWxCUVVrN1dVRkRSaXhOUVVGTkxHVkJRV1VzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRM2hETEUxQlFVMHNUVUZCVFN4SFFVRkhMR1ZCUVdVc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF6dFpRVVYyUXl4TlFVRk5MRlZCUVZVc1IwRkJaU3hGUVVGRkxFMUJRVTBzUlVGQlJTeFBRVUZQTEVWQlFVVXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hEUVVGRE8xbEJRMmhGTEdWQlFXVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhQUVVGUExFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4RlFVRkZPMmRDUVVOb1JDeEpRVUZKTEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFVkJRVVU3YjBKQlEyaENMRlZCUVZVc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETzNkQ1FVTjBRaXhQUVVGUExFVkJRVVVzVlVGQlZTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRWxCUVVrc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVTg3ZDBKQlEzcEdMRWRCUVVjc1JVRkJSU3gxUWtGQmRVSXNSMEZCUnl4TlFVRk5MRWRCUVVjc05rSkJRVFpDTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eFBRVUZQTzNGQ1FVTnVSeXhEUVVGRExFTkJRVU03YVVKQlEwbzdXVUZEU0N4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVWSUxFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1dVRkROVUlzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRXRCUVVzc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dFpRVVZ3UlN4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExIRkNRVUZ4UWl4RFFVRkRMRU5CUVVNN1UwRkRlRU03VVVGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0WlFVTldMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVMEZEY0VJN1NVRkRTQ3hEUVVGRE8wTkJRVUVpZlE9PSIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufTtcclxuLy9leHRlcm5hbCByZXF1ZXN0IHRocm91aGcgcHVycGxlIHNlcnZlclxyXG5leHBvcnQgZnVuY3Rpb24gZXh0ZXJuYWwoY2hhbm5lbE5hbWUpIHtcclxuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2goXCJodHRwczovL1wiICsgZ2xvYmFsLnR1bm5lbFswXSArIFwiL2NoYW5uZWwvXCIgKyBjaGFubmVsTmFtZSk7XHJcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInNlcnZlciBwcm94eSByZXR1cm4gZXJyb3Igb3Igbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB5aWVsZCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogT0tcIik7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpYaDBaWEp1WVd3dVptVjBZMmd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZabVYwWTJndlpYaDBaWEp1WVd3dVptVjBZMmd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWpzN096czdPenM3TzBGQlFVRXNkME5CUVhkRE8wRkJRM2hETEUxQlFVMHNWVUZCWjBJc1VVRkJVU3hEUVVGRExGZEJRVzFDT3p0UlFVTm9SQ3hKUVVGSk8xbEJRMFlzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl3d1FrRkJNRUlzUTBGQlF5eERRVUZETzFsQlF6VkRMRTFCUVUwc1VVRkJVU3hIUVVGaExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCU1N4WFFVRlhMRWRCUVVjc1YwRkJWeXhEUVVGRExFTkJRVU03V1VGRk9VY3NTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFVkJRVVU3WjBKQlEyaENMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zZDBOQlFYZERMRU5CUVVNc1EwRkJRenRoUVVNelJEdFpRVVZFTEUxQlFVMHNTVUZCU1N4SFFVRlhMRTFCUVUwc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFsQlJUTkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1EwRkJRenRaUVVWMlF5eFBRVUZQTEVsQlFVa3NRMEZCUXp0VFFVTmlPMUZCUVVNc1QwRkJUeXhEUVVGRExFVkJRVVU3V1VGRFZpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMjVDTEU5QlFVOHNSVUZCUlN4RFFVRkRPMU5CUTFnN1NVRkRTQ3hEUVVGRE8wTkJRVUVpZlE9PSIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufTtcclxuZXhwb3J0IGZ1bmN0aW9uIGluZmxhdGVGZXRjaCgpIHtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1nbG9iYWwtYXNzaWduXHJcbiAgICBnbG9iYWwuZmV0Y2ggPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1cmwuZW5kc1dpdGgoXCJtM3U4XCIpICYmIHVybC5pbmNsdWRlcyhcInR0dm53Lm5ldFwiKSAmJiAhZ2xvYmFsLndoaXRlbGlzdC5pbmNsdWRlcyhnbG9iYWwuYWN0dWFsQ2hhbm5lbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7IHJldHVybiAocmVzcG9uc2UudGV4dCgpKTsgfSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHRleHQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NlbmQgdGhlIGZsb3cgc3RyZWFtIHRvIHNjcmlwdCB2YWxpdG9yIGFuZCBjbGFzc2lmaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZ2xvYmFsLm9uRmV0Y2goZ2xvYmFsLCB0ZXh0LCB1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5bGlzdCA9IGdsb2JhbC5jdXJyZW50Q2hhbm5lbCgpLmhscy5nZXRBbGxQbGF5bGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHBsYXlsaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoXCJ1c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiKSAmJiAhdXJsLmluY2x1ZGVzKFwicGljdHVyZS1ieS1waWN0dXJlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcImNoYW5uZWwgb2ZmbGluZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKCh0ZXh0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZ2xvYmFsLm9uU3RhcnRDaGFubmVsKGdsb2JhbCwgdXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSh0ZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKF9iKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIikpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsLnJlYWxGZXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhVzVtYkdGMFpTNW1aWFJqYUM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTltWlhSamFDOXBibVpzWVhSbExtWmxkR05vTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096czdPenM3T3p0QlFVRkJMRTFCUVUwc1ZVRkJWU3haUVVGWk8wbEJRekZDTERSRFFVRTBRenRKUVVNMVF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4SFFVRkhMRlZCUVdkQ0xFZEJRVWNzUlVGQlJTeFBRVUZQT3p0WlFVTjZReXhKUVVGSkxFOUJRVThzUjBGQlJ5eExRVUZMTEZGQlFWRXNSVUZCUlR0blFrRkRNMElzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1lVRkJZU3hEUVVGRExFVkJRVVU3YjBKQlEzcEhMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlR5eFBRVUZQTEVWQlFVVXNUVUZCVFN4RlFVRkZMRVZCUVVVN2QwSkJRek5ETEVsQlFVazdORUpCUTBZc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNN2FVTkJRMnBETEVsQlFVa3NRMEZCUXl4RFFVRk5MRkZCUVZFc1JVRkJReXhGUVVGRkxHZEVRVUZETEU5QlFVRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlFTeEhRVUZCTEVOQlFVTTdhVU5CUTNwRExFbEJRVWtzUTBGQlF5eERRVUZOTEVsQlFVa3NSVUZCUXl4RlFVRkZPMmREUVVOcVFpd3dSRUZCTUVRN1owTkJRekZFTEUxQlFVMHNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTkxFVkJRVVVzU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMmREUVVWNFF5eEpRVUZKTEZGQlFWRXNSMEZCUnl4TlFVRk5MRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU1zUjBGQlJ5eERRVUZETEdOQlFXTXNSVUZCUlN4RFFVRkRPMmREUVVNMVJDeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEYkVNc1EwRkJReXhEUVVGQkxFTkJRVU1zUTBGQlF6dDVRa0ZEVGp0M1FrRkJReXhYUVVGTk96UkNRVU5PTEU5QlFVOHNRMEZCUXl4SlFVRkpMRkZCUVZFc1JVRkJSU3hEUVVGRExFTkJRVU03ZVVKQlEzcENPMjlDUVVOSUxFTkJRVU1zUTBGQlFTeERRVUZETEVOQlFVTTdhVUpCUTBvN1owSkJSVVFzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMR3REUVVGclF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExHOUNRVUZ2UWl4RFFVRkRMRVZCUVVVN2IwSkJRek5HTEU5QlFVOHNTVUZCU1N4UFFVRlBMRU5CUVVNc1EwRkJUeXhQUVVGUExFVkJRVVVzVFVGQlRTeEZRVUZGTEVWQlFVVTdkMEpCUXpORExFbEJRVWs3TkVKQlEwWXNUVUZCVFN4UlFVRlJMRWRCUVVjc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenMwUWtGRGRFUXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxFVkJRVU03WjBOQlEyWXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGQk8yZERRVU5xUWl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRU5CUVVNN05rSkJRM0JET3pSQ1FVVkVMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCVFN4SlFVRkpMRVZCUVVNc1JVRkJSVHRuUTBGRGFFTXNUVUZCVFN4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1owTkJReTlETEU5QlFVOHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZET3pSQ1FVTTVRaXhEUVVGRExFTkJRVUVzUTBGQlF5eERRVUZETzNsQ1FVTktPM2RDUVVGRExGZEJRVTA3TkVKQlEwNHNUMEZCVHl4RFFVRkRMRWxCUVVrc1VVRkJVU3hGUVVGRkxFTkJRVU1zUTBGQlF6dDVRa0ZEZWtJN2IwSkJRMGdzUTBGQlF5eERRVUZCTEVOQlFVTXNRMEZCUXp0cFFrRkRTanRuUWtGRlJDeEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc2IwSkJRVzlDTEVOQlFVTXNSVUZCUlR0cFFrRkRka003WVVGRFJqdFpRVVZFTEU5QlFVOHNUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEZOQlFWTXNRMEZCUXl4RFFVRkRPMUZCUTJwRUxFTkJRVU03UzBGQlFTeERRVUZETzBGQlEwb3NRMEZCUXlKOSIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufTtcclxuZXhwb3J0IGZ1bmN0aW9uIG9uKF93aW5kb3csIHJlc3BvbnNlLCB1cmwpIHtcclxuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgLy8gIGlmIChNYXRoLnJhbmRvbSgpIDwgMC41ICl7XHJcbiAgICAgICAgLy8gICAgICByZXNwb25zZSArPSBcInR3aXRjaC1jbGllbnQtYWRcIjtcclxuICAgICAgICAvLyAgfVxyXG4gICAgICAgIGNvbnN0IGNoYW5uZWxDdXJyZW50ID0geWllbGQgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKCk7XHJcbiAgICAgICAgLy9pZiBhZHMgZmluZCBvbiBtYWluIGxpbmsgY2FsbGVkIGZyb20gdHdpdGNoIGFwaSBwbGF5ZXJcclxuICAgICAgICBpZiAoZ2xvYmFsLmlzQWRzKHJlc3BvbnNlKSkge1xyXG4gICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJhZHMgZm91bmRcIik7XHJcbiAgICAgICAgICAgIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImdldFF1YWxpdHlcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwicmVsb2FkXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHF1YWxpdHkgPSBnbG9iYWwucXVhbGl0eTtcclxuICAgICAgICAgICAgY29uc3QgU3RyZWFtU2VydmVyTGlzdCA9IGNoYW5uZWxDdXJyZW50Lmhscy5TdHJlYW1TZXJ2ZXJMaXN0O1xyXG4gICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQocXVhbGl0eSk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvL3RyeSBhbGwgaGxzIHNpZ3MgdGhhdCBoYXZlIG9uIFN0cmVhbVNlcnZlckxpc3QgZnJvbSBITFMgXHJcbiAgICAgICAgICAgICAgICBpZiAoU3RyZWFtU2VydmVyTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJveHkgPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbmQoKHgpID0+IHguc2VydmVyID09IFwicHJveHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm94eSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBwcm94eS51cmxMaXN0LmZpbmQoKGEpID0+IGEucXVhbGl0eSA9PSBxdWFsaXR5KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXR1cm5vMiA9IHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsLnVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJldHVybm9UZXh0ID0geWllbGQgcmV0dXJubzIudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnbG9iYWwuaXNBZHMocmV0dXJub1RleHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcImFkcyBvbiBwcm94eVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXR1cm5vVGV4dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL2dlcmEgZXJybyBzZSBuYW8gdGl2ZXIgbGlua1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy9pZiBub3RoaW5nIHJlc29sdmUsIHJldHVybiA0ODBwIGZsb3dcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBpY3R1cmVTdHJlYW0gPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbHRlcigoeCkgPT4geC5zZXJ2ZXIgPT0gXCJwaWN0dXJlXCIpLm1hcCgoeCkgPT4geC51cmxMaXN0LmZpbmQoKHgpID0+IHgucXVhbGl0eS5pbmNsdWRlcyhcIjQ4MFwiKSkpWzBdLnVybDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJldHVybm8gPSB5aWVsZCAoeWllbGQgZ2xvYmFsLnJlYWxGZXRjaChwaWN0dXJlU3RyZWFtKSkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXR1cm5vKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIjQ4MHBcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY2hhbm5lbEN1cnJlbnQuaGxzLmFkZFBsYXlsaXN0KHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYjI0dVptVjBZMmd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZabVYwWTJndmIyNHVabVYwWTJndWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPenM3T3pzN08wRkJRVUVzVFVGQlRTeFZRVUZuUWl4RlFVRkZMRU5CUVVNc1QwRkJUeXhGUVVGRkxGRkJRVkVzUlVGQlJTeEhRVUZIT3p0UlFVTTNReXc0UWtGQk9FSTdVVUZET1VJc2RVTkJRWFZETzFGQlEzWkRMRXRCUVVzN1VVRkZUQ3hOUVVGTkxHTkJRV01zUjBGQlJ5eE5RVUZOTEUxQlFVMHNRMEZCUXl4alFVRmpMRVZCUVVVc1EwRkJRenRSUVVWeVJDeDNSRUZCZDBRN1VVRkRlRVFzU1VGQlNTeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRk8xbEJSVEZDTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU03V1VGRk4wSXNZMEZCWXl4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGWExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdXVUZGZWtNc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF6dG5Ra0ZEYWtJc1NVRkJTU3hGUVVGRkxGbEJRVms3WjBKQlEyeENMRXRCUVVzc1JVRkJSU3hKUVVGSk8yRkJRMW9zUTBGQlF5eERRVUZETzFsQlJVZ3NUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJRenRuUWtGRGFrSXNTVUZCU1N4RlFVRkZMRkZCUVZFN1owSkJRMlFzUzBGQlN5eEZRVUZGTEVsQlFVazdZVUZEV2l4RFFVRkRMRU5CUVVNN1dVRkZTQ3hOUVVGTkxFOUJRVThzUjBGQlJ5eE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRPMWxCUXk5Q0xFMUJRVTBzWjBKQlFXZENMRWRCUVVjc1kwRkJZeXhEUVVGRExFZEJRVWNzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJRenRaUVVVM1JDeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8xbEJSWHBDTEVsQlFVazdaMEpCUTBZc01FUkJRVEJFTzJkQ1FVTXhSQ3hKUVVGSkxHZENRVUZuUWl4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFVkJRVVU3YjBKQlF5OUNMRTFCUVUwc1MwRkJTeXhIUVVFeVFpeG5Ra0ZCWjBJc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTTdiMEpCUlhoR0xFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVTdkMEpCUTFZc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5dzJRMEZCTmtNc1EwRkJReXhEUVVGRE8zRkNRVU5vUlR0dlFrRkZSQ3hOUVVGTkxFZEJRVWNzUjBGQk1rSXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTTdiMEpCUlhCR0xFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdkMEpCUTFJc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5dzJRMEZCTmtNc1EwRkJReXhEUVVGRE8zRkNRVU5vUlR0dlFrRkZSQ3hOUVVGTkxGRkJRVkVzUjBGQlJ5eE5RVUZOTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzI5Q1FVTnFSQ3hKUVVGSkxGZEJRVmNzUjBGQlJ5eE5RVUZOTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenR2UWtGRmVFTXNTVUZCU1N4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRExGZEJRVmNzUTBGQlF5eEZRVUZGTzNkQ1FVTTNRaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEdOQlFXTXNRMEZCUXl4RFFVRkRPM2RDUVVOb1F5eE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRFpEUVVFMlF5eERRVUZETEVOQlFVTTdjVUpCUTJoRk8yOUNRVVZFTEU5QlFVOHNZMEZCWXl4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGWExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdhVUpCUTNCRU8yZENRVVZFTERaQ1FVRTJRanRuUWtGRE4wSXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXcyUTBGQk5rTXNRMEZCUXl4RFFVRkRPMkZCUTJoRk8xbEJRVU1zVDBGQlR5eERRVUZETEVWQlFVVTdaMEpCUTFZc2MwTkJRWE5ETzJkQ1FVTjBReXhOUVVGTkxHRkJRV0VzUjBGQlJ5eG5Ra0ZCWjBJc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVWtzVTBGQlV5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGRGNFWXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUTJwRUxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRPMmRDUVVWVUxFMUJRVTBzVDBGQlR5eEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRuUWtGRmNrVXNTVUZCU1N4alFVRmpMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0dlFrRkRNME1zVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRwUWtGRGVrSTdaMEpCUTBRc1QwRkJUeXhKUVVGSkxFTkJRVU03WVVGRFlqdFRRVU5HTzJGQlFVMDdXVUZEVEN4alFVRmpMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0WlFVTjZReXhQUVVGUExFbEJRVWtzUTBGQlF6dFRRVU5pTzBsQlEwZ3NRMEZCUXp0RFFVRkJJbjA9IiwidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5leHBvcnQgZnVuY3Rpb24gcGljdHVyZShjaGFubmVsTmFtZSkge1xyXG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBncWwgPSB5aWVsZCBnbG9iYWwucmVhbEZldGNoKFwiaHR0cHM6Ly9ncWwudHdpdGNoLnR2L2dxbFwiLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIkNsaWVudC1JRFwiOiBcImtpbW5lNzhreDNuY3g2YnJnbzRtdjZ3a2k1aDFrb1wiIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5OiBge1wib3BlcmF0aW9uTmFtZVwiOlwiUGxheWJhY2tBY2Nlc3NUb2tlblwiLFwidmFyaWFibGVzXCI6e1wiaXNMaXZlXCI6dHJ1ZSxcImxvZ2luXCI6XCIke2NoYW5uZWxOYW1lfVwiLFwiaXNWb2RcIjpmYWxzZSxcInZvZElEXCI6XCJcIixcInBsYXllclR5cGVcIjpcInRodW5kZXJkb21lXCJ9LFwiZXh0ZW5zaW9uc1wiOntcInBlcnNpc3RlZFF1ZXJ5XCI6e1widmVyc2lvblwiOjEsXCJzaGEyNTZIYXNoXCI6XCIwODI4MTE5ZGVkMWMxMzQ3Nzk2NjQzNGUxNTgwMGZmNTdkZGFjZjEzYmExOTExYzEyOWRjMjIwMDcwNWIwNzEyXCJ9fX1gLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0geWllbGQgZ3FsLmpzb24oKTtcclxuICAgICAgICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3VzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIgK1xyXG4gICAgICAgICAgICAgICAgY2hhbm5lbE5hbWUgK1xyXG4gICAgICAgICAgICAgICAgXCIubTN1OD9hbGxvd19zb3VyY2U9dHJ1ZSZmYXN0X2JyZWFkPXRydWUmcD1cIiArXHJcbiAgICAgICAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxZTcpICtcclxuICAgICAgICAgICAgICAgIFwiJnBsYXllcl9iYWNrZW5kPW1lZGlhcGxheWVyJnBsYXlsaXN0X2luY2x1ZGVfZnJhbWVyYXRlPXRydWUmcmVhc3NpZ25tZW50c19zdXBwb3J0ZWQ9ZmFsc2Umc2lnPVwiICtcclxuICAgICAgICAgICAgICAgIHN0YXR1c1tcImRhdGFcIl1bXCJzdHJlYW1QbGF5YmFja0FjY2Vzc1Rva2VuXCJdW1wic2lnbmF0dXJlXCJdICtcclxuICAgICAgICAgICAgICAgIFwiJnN1cHBvcnRlZF9jb2RlY3M9YXZjMSZ0b2tlbj1cIiArXHJcbiAgICAgICAgICAgICAgICBzdGF0dXNbXCJkYXRhXCJdW1wic3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlblwiXVtcInZhbHVlXCJdO1xyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0geWllbGQgKHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsKSkudGV4dCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0dsamRIVnlaUzVtWlhSamFDNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5bVpYUmphQzl3YVdOMGRYSmxMbVpsZEdOb0xuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenM3T3pzN096dEJRVUZCTEUxQlFVMHNWVUZCWjBJc1QwRkJUeXhEUVVGRExGZEJRVzFDT3p0UlFVTXZReXhKUVVGSk8xbEJRMFlzVFVGQlRTeEhRVUZITEVkQlFVY3NUVUZCVFN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExESkNRVUV5UWl4RlFVRkZPMmRDUVVNNVJDeE5RVUZOTEVWQlFVVXNUVUZCVFR0blFrRkRaQ3hQUVVGUExFVkJRVVVzUlVGQlJTeFhRVUZYTEVWQlFVVXNaME5CUVdkRExFVkJRVVU3WjBKQlF6RkVMRWxCUVVrc1JVRkJSU3c0UlVGQk9FVXNWMEZCVnl4MVRFRkJkVXc3WVVGRGRsSXNRMEZCUXl4RFFVRkRPMWxCUlVnc1RVRkJUU3hOUVVGTkxFZEJRVmNzVFVGQlRTeEhRVUZITEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1dVRkZlRU1zVFVGQlRTeEhRVUZITEVkQlExQXNNRU5CUVRCRE8yZENRVU14UXl4WFFVRlhPMmRDUVVOWUxEUkRRVUUwUXp0blFrRkROVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUjBGQlJ5eERRVUZETzJkQ1FVTXZRaXhuUjBGQlowYzdaMEpCUTJoSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl3eVFrRkJNa0lzUTBGQlF5eERRVUZETEZkQlFWY3NRMEZCUXp0blFrRkRlRVFzSzBKQlFTdENPMmRDUVVNdlFpeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRaUVVWMlJDeE5RVUZOTEVsQlFVa3NSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03V1VGRGVFUXNUMEZCVHl4SlFVRkpMRU5CUVVNN1UwRkRZanRSUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTzFsQlExWXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFRRVU5vUWp0SlFVTklMRU5CUVVNN1EwRkJRU0o5IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGluZmxhdGVGZXRjaCB9IGZyb20gXCIuL2ZldGNoL2luZmxhdGUuZmV0Y2hcIjtcclxuaW1wb3J0IHsgSExTIH0gZnJvbSBcIi4vSExTXCI7XHJcbmltcG9ydCB7IG9uU3RhcnQgfSBmcm9tIFwiLi9jaGFubmVsL29uLmNoYW5uZWxcIjtcclxuaW1wb3J0IHsgb24gfSBmcm9tIFwiLi9mZXRjaC9vbi5mZXRjaFwiO1xyXG5pbXBvcnQgeyBjdXJyZW50IH0gZnJvbSBcIi4vY2hhbm5lbC9jdXJyZW50LmNoYW5uZWxcIjtcclxuaW1wb3J0IHsgcGljdHVyZSB9IGZyb20gXCIuL2ZldGNoL3BpY3R1cmUuZmV0Y2hcIjtcclxuaW1wb3J0IHsgZXh0ZXJuYWwgfSBmcm9tIFwiLi9mZXRjaC9leHRlcm5hbC5mZXRjaFwiO1xyXG5leHBvcnQgZnVuY3Rpb24gYXBwKHNjb3BlKSB7XHJcbiAgICBzY29wZS5Mb2dQcmludCA9ICh4KSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJbUHVycGxlXTogXCIsIHgpO1xyXG4gICAgfTtcclxuICAgIHNjb3BlLmlzQWRzID0gKHgpID0+IHtcclxuICAgICAgICByZXR1cm4geC50b1N0cmluZygpLmluY2x1ZGVzKFwic3RpdGNoZWQtYWRcIikgfHwgeC50b1N0cmluZygpLmluY2x1ZGVzKFwidHdpdGNoLWNsaWVudC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtYWQtcXVhcnRpbGVcIik7XHJcbiAgICB9O1xyXG4gICAgc2NvcGUucmVhbEZldGNoID0gZmV0Y2g7XHJcbiAgICBzY29wZS5pc1Byb3h5QXV0aCA9IGZhbHNlO1xyXG4gICAgc2NvcGUucXVhbGl0eSA9IFwiXCI7XHJcbiAgICBzY29wZS53aGl0ZWxpc3QgPSBbXTtcclxuICAgIGdsb2JhbC53aGl0ZWxpc3QgPSBbXTtcclxuICAgIC8vcmVjZWl2ZSBtZXNzYWdlIGZyb20gd2luZG93XHJcbiAgICBzY29wZS5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHN3aXRjaCAoZS5kYXRhLmZ1bmNOYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRRdWFsaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnF1YWxpdHkgPSBlLmRhdGEuYXJnc1swXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChlLmRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0U2V0dGluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5kYXRhLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUud2hpdGVsaXN0ID0gZS5kYXRhLnZhbHVlLndoaXRlTGlzdDtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5pc1Byb3h5QXV0aCA9IGUuZGF0YS52YWx1ZS50b2dnbGVQcm94eTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRRdWFsaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnF1YWxpdHkgPSBlLmRhdGEudmFsdWUubmFtZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzY29wZS5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgdHlwZTogXCJpbml0XCIsXHJcbiAgICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICB9KTtcclxuICAgIHNjb3BlLmNvbWluZ0FkcyA9IGZhbHNlO1xyXG4gICAgc2NvcGUuY2hhbm5lbCA9IFtdO1xyXG4gICAgc2NvcGUuYWN0dWFsQ2hhbm5lbCA9IFwiXCI7XHJcbiAgICBzY29wZS5jdXJyZW50Q2hhbm5lbCA9IGN1cnJlbnQ7XHJcbiAgICBzY29wZS5uZXdQaWN0dXJlID0gcGljdHVyZTtcclxuICAgIHNjb3BlLm5ld0V4dGVybmFsID0gZXh0ZXJuYWw7XHJcbiAgICBzY29wZS50dW5uZWwgPSBbXCJldTEuanVwdGVyLmdhXCJdO1xyXG4gICAgc2NvcGUub25GZXRjaCA9IG9uO1xyXG4gICAgc2NvcGUub25TdGFydENoYW5uZWwgPSBvblN0YXJ0O1xyXG4gICAgc2NvcGUuSExTID0gSExTO1xyXG4gICAgc2NvcGUuTG9nUHJpbnQoXCJTY3JpcHQgcnVubmluZ1wiKTtcclxuICAgIGluZmxhdGVGZXRjaCgpO1xyXG59XHJcbmFwcChnbG9iYWwpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwyRndjQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNXVUZCV1N4RlFVRkZMRTFCUVUwc2RVSkJRWFZDTEVOQlFVTTdRVUZEY2tRc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeE5RVUZOTEU5QlFVOHNRMEZCUXp0QlFVTTFRaXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNjMEpCUVhOQ0xFTkJRVU03UVVGREwwTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hOUVVGTkxHdENRVUZyUWl4RFFVRkRPMEZCUTNSRExFOUJRVThzUlVGQlJTeFBRVUZQTEVWQlFVVXNUVUZCVFN3eVFrRkJNa0lzUTBGQlF6dEJRVU53UkN4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRkxFMUJRVTBzZFVKQlFYVkNMRU5CUVVNN1FVRkRhRVFzVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4TlFVRk5MSGRDUVVGM1FpeERRVUZETzBGQlJXeEVMRTFCUVUwc1ZVRkJWU3hIUVVGSExFTkJRVU1zUzBGQlZUdEpRVVUxUWl4TFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExFTkJRVU1zUTBGQlRTeEZRVUZGTEVWQlFVVTdVVUZETVVJc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFpRVUZaTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRMMElzUTBGQlF5eERRVUZETzBsQlJVWXNTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVk1zUlVGQlJTeEZRVUZGTzFGQlF6RkNMRTlCUVU4c1EwRkJReXhEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMR3RDUVVGclFpeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eHZRa0ZCYjBJc1EwRkJReXhEUVVGRE8wbEJRekZKTEVOQlFVTXNRMEZCUXp0SlFVVkdMRXRCUVVzc1EwRkJReXhUUVVGVExFZEJRVWNzUzBGQlN5eERRVUZETzBsQlEzaENMRXRCUVVzc1EwRkJReXhYUVVGWExFZEJRVWNzUzBGQlN5eERRVUZETzBsQlF6RkNMRXRCUVVzc1EwRkJReXhQUVVGUExFZEJRVWNzUlVGQlJTeERRVUZETzBsQlEyNUNMRXRCUVVzc1EwRkJReXhUUVVGVExFZEJRVWNzUlVGQlJTeERRVUZETzBsQlEzSkNMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzUlVGQlJTeERRVUZETzBsQlJYUkNMRFpDUVVFMlFqdEpRVU0zUWl4TFFVRkxMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVMEZCVXl4RlFVRkZMRlZCUVZVc1EwRkJRenRSUVVNelF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRk8xbEJRM1pDTEV0QlFVc3NXVUZCV1N4RFFVRkRMRU5CUVVNN1owSkJRMnBDTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRE8yZENRVU53UXl4TlFVRk5PMkZCUTFBN1dVRkRSQ3hQUVVGUExFTkJRVU1zUTBGQlF6dG5Ra0ZEVUN4TlFVRk5PMkZCUTFBN1UwRkRSanRSUVVWRUxGRkJRVkVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVN1dVRkRia0lzUzBGQlN5eFpRVUZaTEVOQlFVTXNRMEZCUXp0blFrRkRha0lzU1VGQlNTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSVHR2UWtGRGFFSXNTMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4VFFVRlRMRU5CUVVNN2IwSkJRM3BETEV0QlFVc3NRMEZCUXl4WFFVRlhMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRPMmxDUVVNNVF6dG5Ra0ZEUkN4TlFVRk5PMkZCUTFBN1dVRkRSQ3hMUVVGTExGbEJRVmtzUTBGQlF5eERRVUZETzJkQ1FVTnFRaXhMUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF6dG5Ra0ZEYkVNc1RVRkJUVHRoUVVOUU8xbEJRMFFzVDBGQlR5eERRVUZETEVOQlFVTTdaMEpCUTFBc1RVRkJUVHRoUVVOUU8xTkJRMFk3U1VGRFNDeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVVklMRXRCUVVzc1EwRkJReXhYUVVGWExFTkJRVU03VVVGRGFFSXNTVUZCU1N4RlFVRkZMRTFCUVUwN1VVRkRXaXhMUVVGTExFVkJRVVVzU1VGQlNUdExRVU5hTEVOQlFVTXNRMEZCUXp0SlFVVklMRXRCUVVzc1EwRkJReXhUUVVGVExFZEJRVWNzUzBGQlN5eERRVUZETzBsQlEzaENMRXRCUVVzc1EwRkJReXhQUVVGUExFZEJRVWNzUlVGQlJTeERRVUZETzBsQlEyNUNMRXRCUVVzc1EwRkJReXhoUVVGaExFZEJRVWNzUlVGQlJTeERRVUZETzBsQlEzcENMRXRCUVVzc1EwRkJReXhqUVVGakxFZEJRVWNzVDBGQlR5eERRVUZETzBsQlJTOUNMRXRCUVVzc1EwRkJReXhWUVVGVkxFZEJRVWNzVDBGQlR5eERRVUZETzBsQlF6TkNMRXRCUVVzc1EwRkJReXhYUVVGWExFZEJRVWNzVVVGQlVTeERRVUZETzBsQlF6ZENMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eGxRVUZsTEVOQlFVTXNRMEZCUVR0SlFVVm9ReXhMUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEVWQlFVVXNRMEZCUXp0SlFVTnVRaXhMUVVGTExFTkJRVU1zWTBGQll5eEhRVUZITEU5QlFVOHNRMEZCUXp0SlFVVXZRaXhMUVVGTExFTkJRVU1zUjBGQlJ5eEhRVUZITEVkQlFVY3NRMEZCUXp0SlFVVm9RaXhMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExFTkJRVUU3U1VGRGFFTXNXVUZCV1N4RlFVRkZMRU5CUVVNN1FVRkRha0lzUTBGQlF6dEJRVU5FTEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReUo5Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9