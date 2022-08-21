/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/hls/HLS.ts":
/*!************************!*\
  !*** ./src/hls/HLS.ts ***!
  \************************/
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
    }
    addPlaylistTest(playlist) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hscy9ITFMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLEdBQUc7SUFBaEI7UUFDVSxZQUFPLEdBQWtCLENBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLHlCQUF5QixFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDOUcsY0FBUyxHQUFtQixFQUFFLENBQUM7UUFDL0IsY0FBUyxHQUFHLENBQUMsQ0FBQztJQWtFeEIsQ0FBQztJQWhFQyxlQUFlLENBQUMsUUFBZ0I7SUFFaEMsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUFnQjtRQUMxQixJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7WUFDckIsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztRQUVwQixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNCLDJEQUEyRDtRQUMzRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRTtZQUNyQixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDOUQsb0JBQW9CO2dCQUNwQixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFFakssbUNBQW1DO2dCQUNuQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUNwQyxPQUFPLENBQUMsQ0FBQyxTQUFTLElBQUksaUJBQWlCLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyxDQUFDO2dCQUNILHNEQUFzRDtnQkFDdEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7d0JBQ2xCLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDNUIsU0FBUyxFQUFFLGlCQUFpQjt3QkFDNUIsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDNUIsQ0FBQyxDQUFDO29CQUNILE9BQU8sR0FBRyxJQUFJLENBQUM7aUJBQ2hCO2dCQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFO29CQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUN4QjthQUNGO1NBQ0Y7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRUQsY0FBYztRQUNaLE9BQU8sQ0FDTCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUk7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUk7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUk7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxTQUFTO1lBQ2QsSUFBSTtZQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2YsSUFBSTtZQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2YsSUFBSTtZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQ0gsQ0FBQztJQUNKLENBQUM7Q0FDRiJ9

/***/ }),

/***/ "./src/player/message.ts":
/*!*******************************!*\
  !*** ./src/player/message.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PlayerMessage": () => (/* binding */ PlayerMessage)
/* harmony export */ });
class PlayerMessage {
    constructor() {
        this.getQuality = __webpack_require__.g.postMessage({ type: "getQuality" });
        this.init = __webpack_require__.g.postMessage({ type: "init" });
        this.pause = __webpack_require__.g.postMessage({ type: "pause" });
        this.quality = "";
        this.setting = {};
    }
    listener() {
        __webpack_require__.g.onEventMessage = (e) => {
            // var myMessage = new MessageEvent('worker', { data: 'hello' });
            // if (global.onmessage) global.onmessage(this, myMessage);
            switch (e.data.funcName) {
                case "pause": {
                    break;
                }
                case "setQuality": {
                    if (!e.data.args)
                        break;
                    this.quality = e.data.args[0].name;
                    break;
                }
                case "setSetting": {
                    this.setting = e.data.value;
                    break;
                }
                default: {
                    break;
                }
            }
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbGF5ZXIvbWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sYUFBYTtJQUExQjtRQUNJLGVBQVUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDeEQsU0FBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUU1QyxVQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBRTdDLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFDckIsWUFBTyxHQUFRLEVBQUUsQ0FBQTtJQTJCckIsQ0FBQztJQXpCRyxRQUFRO1FBQ0osTUFBTSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFO1lBQy9CLGlFQUFpRTtZQUVqRSwyREFBMkQ7WUFFM0QsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDckIsS0FBSyxPQUFPLENBQUMsQ0FBQztvQkFDVixNQUFNO2lCQUNUO2dCQUNELEtBQUssWUFBWSxDQUFDLENBQUM7b0JBQ2YsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSTt3QkFBRSxNQUFNO29CQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDbkMsTUFBTTtpQkFDVDtnQkFDRCxLQUFLLFlBQVksQ0FBQyxDQUFDO29CQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQzVCLE1BQU07aUJBQ1Q7Z0JBQ0QsT0FBTyxDQUFDLENBQUM7b0JBQ0wsTUFBTTtpQkFDVDthQUNKO1FBQ0wsQ0FBQyxDQUFBO0lBQ0wsQ0FBQztDQUNKIn0=

/***/ }),

/***/ "./src/player/player.ts":
/*!******************************!*\
  !*** ./src/player/player.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Player": () => (/* binding */ Player)
/* harmony export */ });
/* harmony import */ var _stream_stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../stream/stream */ "./src/stream/stream.ts");
/* harmony import */ var _stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../stream/type/stream.type */ "./src/stream/type/stream.type.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./message */ "./src/player/message.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



class Player {
    constructor() {
        this.whitelist = [];
        this.isProxyAuth = false;
        this.streamList = [];
        this.actualChannel = "";
        this.quality = "";
        this.LogPrint = __webpack_require__.g.LogPrint;
        this.message = new _message__WEBPACK_IMPORTED_MODULE_2__.PlayerMessage();
        this.isAds = (x) => {
            return x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad") || x.toString().includes("twitch-ad-quartile");
        };
        this.currentStream = (channel = this.actualChannel) => {
            return this.streamList.find((x) => x.channelName === channel);
        };
        this.message.listener();
        this.message.init;
    }
    onfetch(url, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentStream = yield this.currentStream();
            currentStream.hls.addPlaylist(response);
            if (!this.isAds(response))
                return true;
            this.LogPrint("ads found");
            try {
                const local = yield this.fetchm3u8ByStreamType(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local.name);
                if (local)
                    currentStream.hls.addPlaylist(local);
                if (local)
                    return true;
                const picture = yield this.fetchm3u8ByStreamType(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.picture.name);
                if (picture)
                    currentStream.hls.addPlaylist(picture);
                if (picture)
                    return true;
                const external = yield this.fetchm3u8ByStreamType(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.external.name);
                if (external)
                    currentStream.hls.addPlaylist(external);
                if (external)
                    return true;
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    fetchm3u8ByStreamType(serverType) {
        return __awaiter(this, void 0, void 0, function* () {
            this.LogPrint("Stream Type: " + serverType);
            //filter all server by type
            const servers = this.currentStream().serverList.filter((x) => x.type == serverType);
            if (!servers)
                return "";
            //filter all server url by quality or bestquality
            var qualityUrl = servers.map(x => x.findByQuality(this.message.quality)).filter(x => x !== undefined);
            if (!qualityUrl.length)
                qualityUrl = servers.map(x => x.bestQuality());
            //by the array order, try get m3u8 content and return if don't have ads.
            for (const url of qualityUrl) {
                const text = yield (yield __webpack_require__.g.realFetch(url === null || url === void 0 ? void 0 : url.url)).text();
                if (this.isAds(text))
                    continue;
                return text;
            }
            return "";
        });
    }
    onStartChannel(url, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const channelName = /hls\/(.*).m3u8/gm.exec(url) || [];
            let stream;
            let existent = false;
            if (channelName[1]) {
                if (this.whitelist == undefined) {
                    this.whitelist = [];
                }
                this.actualChannel = channelName[1];
                this.LogPrint("Channel " + channelName[1]);
                if (this.whitelist.includes(channelName[1]))
                    return;
                if (!this.streamList.find((c) => c.channelName === channelName[1])) {
                    this.streamList.push(new _stream_stream__WEBPACK_IMPORTED_MODULE_0__.Stream(channelName[1]));
                }
                else {
                    this.LogPrint("Exist: " + channelName[1]);
                    existent = true;
                }
            }
            stream = this.currentStream();
            //--------------------------------------------//
            //--------------------------------------------//
            this.LogPrint("Local Server: Loading");
            yield stream.addStreamLink(text, "local");
            this.LogPrint("Local Server: OK");
            yield stream.streamAccess(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.picture);
            stream.streamAccess(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local);
            stream.streamAccess(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local);
            stream.streamAccess(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local);
            stream.streamAccess(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local);
            stream.streamAccess(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local);
            if (existent)
                return;
            //--------------------------------------------//
            return;
        });
    }
    inflateFetch() {
        //eslint-disable-next-line no-this-assign
        __webpack_require__.g.fetch = function (url, options) {
            return __awaiter(this, arguments, void 0, function* () {
                if (typeof url === "string") {
                    if (url.endsWith("m3u8") && url.includes("ttvnw.net")) {
                        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                            try {
                                yield __webpack_require__.g.realFetch(url, options)
                                    .then((response) => __awaiter(this, void 0, void 0, function* () { return (response.text()); }))
                                    .then((text) => __awaiter(this, void 0, void 0, function* () {
                                    //send the flow stream to script valitor and classificator
                                    yield __webpack_require__.g.player.onfetch(url, text);
                                    var playlist = __webpack_require__.g.player.currentStream().hls.getAllPlaylist();
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
                                    //this.LogPrint("channel offline");
                                }
                                response.text().then((text) => __awaiter(this, void 0, void 0, function* () {
                                    yield __webpack_require__.g.player.onStartChannel(url, text);
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
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsYXllci9wbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUVyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTFDLE1BQU0sT0FBTyxNQUFNO0lBWWY7UUFYQSxjQUFTLEdBQWEsRUFBRSxDQUFDO1FBQ3pCLGdCQUFXLEdBQVksS0FBSyxDQUFDO1FBRTdCLGVBQVUsR0FBYSxFQUFFLENBQUE7UUFDekIsa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFFM0IsWUFBTyxHQUFXLEVBQUUsQ0FBQztRQUNyQixhQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUUzQixZQUFPLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQU85QixVQUFLLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRTtZQUNsQixPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUM1SSxDQUFDLENBQUE7UUFFRCxrQkFBYSxHQUFHLENBQUMsVUFBa0IsSUFBSSxDQUFDLGFBQWEsRUFBVSxFQUFFO1lBQzdELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFFLENBQUM7UUFDM0UsQ0FBQyxDQUFBO1FBVkcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FB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

/***/ }),

/***/ "./src/stream/stream.ts":
/*!******************************!*\
  !*** ./src/stream/stream.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Stream": () => (/* binding */ Stream)
/* harmony export */ });
/* harmony import */ var _hls_HLS__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../hls/HLS */ "./src/hls/HLS.ts");
/* harmony import */ var _type_streamServer_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./type/streamServer.types */ "./src/stream/type/streamServer.types.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


class Stream {
    constructor(channelName) {
        this.serverList = [];
        this.hls = new _hls_HLS__WEBPACK_IMPORTED_MODULE_0__.HLS();
        this.channelName = "";
        this.tunnel = ["eu1.jupter.ga"];
        this.channelName = channelName;
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
            const streamList = new _type_streamServer_types__WEBPACK_IMPORTED_MODULE_1__.streamServer({ type: type, urlList: qualityUrlSplit, sig: sig });
            this.serverList.push(streamList);
            if (!sig) {
                yield this.signature();
            }
            return true;
        });
    }
    signature() {
        return __awaiter(this, void 0, void 0, function* () {
            const REGEX = /video-weaver.(.*).hls.ttvnw.net\/v1\/playlist\/(.*).m3u8$/gm;
            yield new Promise((resolve) => this.serverList
                .filter((x) => x.sig == false)
                .forEach((x) => __awaiter(this, void 0, void 0, function* () {
                const match = REGEX.exec(x.urlList[0].url);
                if (match) {
                    try {
                        yield fetch("https://jupter.ga/hls/v2/sig/" + match[2] + "/" + match[1]);
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
    //add a new player stream external
    externalPlayer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                __webpack_require__.g.LogPrint("External Server: Loading");
                const response = yield __webpack_require__.g.realFetch("https://" + this.tunnel[0] + "/channel/" + this.channelName);
                if (!response.ok) {
                    throw new Error("server proxy return error or not found");
                }
                const text = yield response.text();
                __webpack_require__.g.LogPrint("External Server: OK");
                this.addStreamLink(text);
                return true;
            }
            catch (e) {
                __webpack_require__.g.LogPrint(e);
                return false;
            }
        });
    }
    //add a new player stream local
    streamAccess(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gql = yield __webpack_require__.g.realFetch("https://gql.twitch.tv/gql", {
                    method: "POST",
                    headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
                    body: `{"operationName":"PlaybackAccessToken","variables":{"isLive":true,"login":"${this.channelName}","isVod":false,"vodID":"","playerType":"${stream.playerType}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}}`,
                });
                const status = yield gql.json();
                const url = "https://usher.ttvnw.net/api/channel/hls/" +
                    this.channelName +
                    ".m3u8?allow_source=true&fast_bread=true&p=" +
                    Math.floor(Math.random() * 1e7) +
                    "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
                    status["data"]["streamPlaybackAccessToken"]["signature"] +
                    "&supported_codecs=avc1&token=" +
                    status["data"]["streamPlaybackAccessToken"]["value"];
                const text = yield (yield __webpack_require__.g.realFetch(url)).text();
                __webpack_require__.g.LogPrint("Server loaded " + stream.name);
                this.addStreamLink(text, stream.name);
                return true;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbS9zdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVqQyxPQUFPLEVBQWMsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFckUsTUFBTSxPQUFPLE1BQU07SUFPZixZQUFZLFdBQW1CO1FBTi9CLGVBQVUsR0FBbUIsRUFBRSxDQUFDO1FBQ2hDLFFBQUcsR0FBUSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBRXpCLFdBQU0sR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBR3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBQ25DLENBQUM7SUFFRCxvREFBb0Q7SUFDOUMsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsT0FBTyxFQUFFLEdBQUcsR0FBRyxLQUFLOztZQUN6RCxNQUFNLGVBQWUsR0FBaUIsRUFBRSxDQUFDO1lBQ3pDLElBQUksWUFBb0MsQ0FBQztZQUV6QyxNQUFNLEtBQUssR0FBRyxxRkFBcUYsQ0FBQztZQUVwRyxPQUFPLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQy9DLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzVFO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3QixNQUFNLFVBQVUsR0FBaUIsSUFBSSxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsR0FBRyxFQUFF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

/***/ }),

/***/ "./src/stream/type/stream.type.ts":
/*!****************************************!*\
  !*** ./src/stream/type/stream.type.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "streams": () => (/* binding */ streams)
/* harmony export */ });
const streams = {
    picture: { playerType: "thunderdome", name: "lower" },
    local: { playerType: "site", name: "normal" },
    external: { name: "external" }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLnR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc3RyZWFtL3R5cGUvc3RyZWFtLnR5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHO0lBQ25CLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtJQUNyRCxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDN0MsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtDQUNqQyxDQUFBIn0=

/***/ }),

/***/ "./src/stream/type/streamServer.types.ts":
/*!***********************************************!*\
  !*** ./src/stream/type/streamServer.types.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "qualityUrl": () => (/* binding */ qualityUrl),
/* harmony export */   "streamServer": () => (/* binding */ streamServer)
/* harmony export */ });
class qualityUrl {
    constructor() {
        this.url = "";
        this.quality = "";
    }
}
class streamServer {
    constructor(partial) {
        this.bestQuality = () => { return this.urlList[0]; };
        this.findByQuality = (quality) => this.urlList.find(x => x.quality == quality);
        Object.assign(this, partial);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtU2VydmVyLnR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cmVhbS90eXBlL3N0cmVhbVNlcnZlci50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sVUFBVTtJQUF2QjtRQUNFLFFBQUcsR0FBVyxFQUFFLENBQUM7UUFDakIsWUFBTyxHQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0NBQUE7QUFDRCxNQUFNLE9BQU8sWUFBWTtJQVF2QixZQUFZLE9BQThCO1FBSDFDLGdCQUFXLEdBQUcsR0FBRyxFQUFFLEdBQUcsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFBO1FBQzlDLGtCQUFhLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQztRQUdoRixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvQixDQUFDO0NBQ0YifQ==

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
/* harmony import */ var _player_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player/player */ "./src/player/player.ts");

function app(scope) {
    scope.LogPrint = (x) => console.log("[Purple]: ", x);
    scope.addEventListener("message", (e) => {
        __webpack_require__.g.onEventMessage(e);
    });
    const player = new _player_player__WEBPACK_IMPORTED_MODULE_0__.Player();
    __webpack_require__.g.realFetch = __webpack_require__.g.fetch;
    __webpack_require__.g.player = player;
    player.inflateFetch();
    scope.LogPrint("Script running");
}
app(__webpack_require__.g);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFTekMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFVO0lBQzVCLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRTtRQUMzQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUU1QixNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUE7SUFDL0IsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFFdkIsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3RCLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDIn0=
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUkscUJBQU07QUFDViwyQ0FBMkMsdTBCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2hscy9ITFMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci9tZXNzYWdlLnRzIiwid2VicGFjazovLy8uL3NyYy9wbGF5ZXIvcGxheWVyLnRzIiwid2VicGFjazovLy8uL3NyYy9zdHJlYW0vc3RyZWFtLnRzIiwid2VicGFjazovLy8uL3NyYy9zdHJlYW0vdHlwZS9zdHJlYW0udHlwZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RyZWFtL3R5cGUvc3RyZWFtU2VydmVyLnR5cGVzLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEhMUyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBbXCIjRVhUTTNVXCIsIFwiI0VYVC1YLVZFUlNJT046M1wiLCBcIiNFWFQtWC1UQVJHRVREVVJBVElPTjo2XCIsIFwiI0VYVC1YLU1FRElBLVNFUVVFTkNFOlwiXTtcclxuICAgICAgICB0aGlzLl9wbGF5bGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3NlcXVlbmNlID0gMDtcclxuICAgIH1cclxuICAgIGFkZFBsYXlsaXN0VGVzdChwbGF5bGlzdCkge1xyXG4gICAgfVxyXG4gICAgYWRkUGxheWxpc3QocGxheWxpc3QpIHtcclxuICAgICAgICBpZiAocGxheWxpc3QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gcGxheWxpc3QudG9TdHJpbmcoKS5zcGxpdCgvW1xcclxcbl0vKTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJbNF0gPSBsaW5lc1s0XTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJbNV0gPSBsaW5lc1s1XTtcclxuICAgICAgICAvL3Rha2UgYWxsIG0zdTkgY29udGVudCB0byB0aGUgcGxheWxpc3QgYW5kIGJ1aWxkIGEgdmFyaWJsZVxyXG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBsaW5lcykge1xyXG4gICAgICAgICAgICBpZiAobGluZXNbaV0uaW5jbHVkZXMoXCIjRVhUSU5GXCIpICYmIGxpbmVzW2ldLmluY2x1ZGVzKFwiLGxpdmVcIikpIHtcclxuICAgICAgICAgICAgICAgIC8vdGltZXN0YW1wIHNlcXVlbmNlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXF1ZW5jZVRpbWVzdGFtcCA9IE1hdGguZmxvb3IobmV3IERhdGUobGluZXNbcGFyc2VJbnQoaSkgLSAxXS5zbGljZShsaW5lc1twYXJzZUludChpKSAtIDFdLmxlbmd0aCAtIDI0LCBsaW5lc1twYXJzZUludChpKSAtIDFdLmxlbmd0aCkpLmdldFRpbWUoKSAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgLy9zZWxlY3QgYWxsIHNlcXVlbmNlIHRoYXQgbm8gZXhpc3RcclxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLl9wbGF5bGlzdC5maWx0ZXIoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lc3RhbXAgPj0gc2VxdWVuY2VUaW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBzZXF1ZW5jZSBvbiBwbGF5bGlzdCB2YXJpYWJsZSBpZiBpdCBubyBleGlzdFxyXG4gICAgICAgICAgICAgICAgaWYgKCFyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlID0gdGhpcy5fc2VxdWVuY2UgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBsaW5lc1twYXJzZUludChpKSAtIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHNlcXVlbmNlVGltZXN0YW1wLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiBsaW5lc1twYXJzZUludChpKV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogbGluZXNbcGFyc2VJbnQoaSkgKyAxXSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wbGF5bGlzdC5sZW5ndGggPiAxNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XHJcbiAgICB9XHJcbiAgICBnZXRBbGxQbGF5bGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hlYWRlclswXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzJdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclszXSArXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls0XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QubWFwKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lICsgXCJcXG5cIiArIHguaW5mbyArIFwiXFxuXCIgKyB4LnVybCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTRXhUTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMMmhzY3k5SVRGTXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hQUVVGUExFZEJRVWM3U1VGQmFFSTdVVUZEVlN4WlFVRlBMRWRCUVd0Q0xFTkJRVU1zVTBGQlV5eEZRVUZGTEd0Q1FVRnJRaXhGUVVGRkxIbENRVUY1UWl4RlFVRkZMSGRDUVVGM1FpeERRVUZETEVOQlFVTTdVVUZET1Vjc1kwRkJVeXhIUVVGdFFpeEZRVUZGTEVOQlFVTTdVVUZETDBJc1kwRkJVeXhIUVVGSExFTkJRVU1zUTBGQlF6dEpRV3RGZUVJc1EwRkJRenRKUVdoRlF5eGxRVUZsTEVOQlFVTXNVVUZCWjBJN1NVRkZhRU1zUTBGQlF6dEpRVVZFTEZkQlFWY3NRMEZCUXl4UlFVRm5RanRSUVVNeFFpeEpRVUZKTEZGQlFWRXNTMEZCU3l4SlFVRkpMRVZCUVVVN1dVRkRja0lzVDBGQlR5eExRVUZMTEVOQlFVTTdVMEZEWkR0UlFVVkVMRWxCUVVrc1QwRkJUeXhIUVVGSExFdEJRVXNzUTBGQlF6dFJRVVZ3UWl4TlFVRk5MRXRCUVVzc1IwRkJSeXhSUVVGUkxFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8xRkJRMnhFTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUXpOQ0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlJUTkNMREpFUVVFeVJEdFJRVU16UkN4TFFVRkxMRTFCUVUwc1EwRkJReXhKUVVGSkxFdEJRVXNzUlVGQlJUdFpRVU55UWl4SlFVRkpMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRuUWtGRE9VUXNiMEpCUVc5Q08yZENRVU53UWl4TlFVRk5MR2xDUVVGcFFpeEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hGUVVGRkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF6dG5Ra0ZGYWtzc2JVTkJRVzFETzJkQ1FVTnVReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTzI5Q1FVTndReXhQUVVGUExFTkJRVU1zUTBGQlF5eFRRVUZUTEVsQlFVa3NhVUpCUVdsQ0xFTkJRVU03WjBKQlF6RkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5JTEhORVFVRnpSRHRuUWtGRGRFUXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVVU3YjBKQlEySXNTVUZCU1N4RFFVRkRMRk5CUVZNc1IwRkJSeXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEVOQlFVTXNRMEZCUXp0dlFrRkRjRU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNN2QwSkJRMnhDTEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0M1FrRkROVUlzVTBGQlV5eEZRVUZGTEdsQ1FVRnBRanQzUWtGRE5VSXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNoQ0xFZEJRVWNzUlVGQlJTeExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dHhRa0ZETlVJc1EwRkJReXhEUVVGRE8yOUNRVU5JTEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNN2FVSkJRMmhDTzJkQ1FVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eE5RVUZOTEVkQlFVY3NSVUZCUlN4RlFVRkZPMjlDUVVOcVF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8ybENRVU40UWp0aFFVTkdPMU5CUTBZN1VVRkRSQ3hQUVVGUExFOUJRVThzUTBGQlF6dEpRVU5xUWl4RFFVRkRPMGxCUlVRc1kwRkJZenRSUVVOYUxFOUJRVThzUTBGRFRDeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVObUxFbEJRVWs3V1VGRFNpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVObUxFbEJRVWs3V1VGRFNpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVObUxFbEJRVWs3V1VGRFNpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVObUxFbEJRVWtzUTBGQlF5eFRRVUZUTzFsQlEyUXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVN1owSkJRM1pDTEU5QlFVOHNRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTTdXVUZEZEVRc1EwRkJReXhEUVVGRExFTkJRMGdzUTBGQlF6dEpRVU5LTEVOQlFVTTdRMEZEUmlKOSIsImV4cG9ydCBjbGFzcyBQbGF5ZXJNZXNzYWdlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ2V0UXVhbGl0eSA9IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiZ2V0UXVhbGl0eVwiIH0pO1xyXG4gICAgICAgIHRoaXMuaW5pdCA9IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiaW5pdFwiIH0pO1xyXG4gICAgICAgIHRoaXMucGF1c2UgPSBnbG9iYWwucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInBhdXNlXCIgfSk7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gXCJcIjtcclxuICAgICAgICB0aGlzLnNldHRpbmcgPSB7fTtcclxuICAgIH1cclxuICAgIGxpc3RlbmVyKCkge1xyXG4gICAgICAgIGdsb2JhbC5vbkV2ZW50TWVzc2FnZSA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIHZhciBteU1lc3NhZ2UgPSBuZXcgTWVzc2FnZUV2ZW50KCd3b3JrZXInLCB7IGRhdGE6ICdoZWxsbycgfSk7XHJcbiAgICAgICAgICAgIC8vIGlmIChnbG9iYWwub25tZXNzYWdlKSBnbG9iYWwub25tZXNzYWdlKHRoaXMsIG15TWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS5kYXRhLmZ1bmNOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwicGF1c2VcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZS5kYXRhLmFyZ3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucXVhbGl0eSA9IGUuZGF0YS5hcmdzWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwic2V0U2V0dGluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5nID0gZS5kYXRhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liV1Z6YzJGblpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5d2JHRjVaWEl2YldWemMyRm5aUzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeE5RVUZOTEU5QlFVOHNZVUZCWVR0SlFVRXhRanRSUVVOSkxHVkJRVlVzUjBGQlJ5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxGbEJRVmtzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEZUVRc1UwRkJTU3hIUVVGSExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1RVRkJUU3hGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVVUxUXl4VlFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4UFFVRlBMRVZCUVVNc1EwRkJReXhEUVVGRE8xRkJSVGRETEZsQlFVOHNSMEZCVnl4RlFVRkZMRU5CUVVNN1VVRkRja0lzV1VGQlR5eEhRVUZSTEVWQlFVVXNRMEZCUVR0SlFUSkNja0lzUTBGQlF6dEpRWHBDUnl4UlFVRlJPMUZCUTBvc1RVRkJUU3hEUVVGRExHTkJRV01zUjBGQlJ5eERRVUZETEVOQlFVMHNSVUZCUlN4RlFVRkZPMWxCUXk5Q0xHbEZRVUZwUlR0WlFVVnFSU3d5UkVGQk1rUTdXVUZGTTBRc1VVRkJVU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlR0blFrRkRja0lzUzBGQlN5eFBRVUZQTEVOQlFVTXNRMEZCUXp0dlFrRkRWaXhOUVVGTk8ybENRVU5VTzJkQ1FVTkVMRXRCUVVzc1dVRkJXU3hEUVVGRExFTkJRVU03YjBKQlEyWXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNUdDNRa0ZCUlN4TlFVRk5PMjlDUVVONFFpeEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJRenR2UWtGRGJrTXNUVUZCVFR0cFFrRkRWRHRuUWtGRFJDeExRVUZMTEZsQlFWa3NRMEZCUXl4RFFVRkRPMjlDUVVObUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU03YjBKQlF6VkNMRTFCUVUwN2FVSkJRMVE3WjBKQlEwUXNUMEZCVHl4RFFVRkRMRU5CUVVNN2IwSkJRMHdzVFVGQlRUdHBRa0ZEVkR0aFFVTktPMUZCUTB3c1EwRkJReXhEUVVGQk8wbEJRMHdzUTBGQlF6dERRVU5LSW4wPSIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufTtcclxuaW1wb3J0IHsgU3RyZWFtIH0gZnJvbSBcIi4uL3N0cmVhbS9zdHJlYW1cIjtcclxuaW1wb3J0IHsgc3RyZWFtcyB9IGZyb20gXCIuLi9zdHJlYW0vdHlwZS9zdHJlYW0udHlwZVwiO1xyXG5pbXBvcnQgeyBQbGF5ZXJNZXNzYWdlIH0gZnJvbSBcIi4vbWVzc2FnZVwiO1xyXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMud2hpdGVsaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5pc1Byb3h5QXV0aCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RyZWFtTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuYWN0dWFsQ2hhbm5lbCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gXCJcIjtcclxuICAgICAgICB0aGlzLkxvZ1ByaW50ID0gZ2xvYmFsLkxvZ1ByaW50O1xyXG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG5ldyBQbGF5ZXJNZXNzYWdlKCk7XHJcbiAgICAgICAgdGhpcy5pc0FkcyA9ICh4KSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJzdGl0Y2hlZC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtY2xpZW50LWFkXCIpIHx8IHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInR3aXRjaC1hZC1xdWFydGlsZVwiKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuY3VycmVudFN0cmVhbSA9IChjaGFubmVsID0gdGhpcy5hY3R1YWxDaGFubmVsKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cmVhbUxpc3QuZmluZCgoeCkgPT4geC5jaGFubmVsTmFtZSA9PT0gY2hhbm5lbCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UubGlzdGVuZXIoKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UuaW5pdDtcclxuICAgIH1cclxuICAgIG9uZmV0Y2godXJsLCByZXNwb25zZSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTdHJlYW0gPSB5aWVsZCB0aGlzLmN1cnJlbnRTdHJlYW0oKTtcclxuICAgICAgICAgICAgY3VycmVudFN0cmVhbS5obHMuYWRkUGxheWxpc3QocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNBZHMocmVzcG9uc2UpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJhZHMgZm91bmRcIik7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbCA9IHlpZWxkIHRoaXMuZmV0Y2htM3U4QnlTdHJlYW1UeXBlKHN0cmVhbXMubG9jYWwubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobG9jYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0cmVhbS5obHMuYWRkUGxheWxpc3QobG9jYWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGljdHVyZSA9IHlpZWxkIHRoaXMuZmV0Y2htM3U4QnlTdHJlYW1UeXBlKHN0cmVhbXMucGljdHVyZS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIGlmIChwaWN0dXJlKVxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdHJlYW0uaGxzLmFkZFBsYXlsaXN0KHBpY3R1cmUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBpY3R1cmUpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbCA9IHlpZWxkIHRoaXMuZmV0Y2htM3U4QnlTdHJlYW1UeXBlKHN0cmVhbXMuZXh0ZXJuYWwubmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZXJuYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0cmVhbS5obHMuYWRkUGxheWxpc3QoZXh0ZXJuYWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVybmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmZXRjaG0zdThCeVN0cmVhbVR5cGUoc2VydmVyVHlwZSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJTdHJlYW0gVHlwZTogXCIgKyBzZXJ2ZXJUeXBlKTtcclxuICAgICAgICAgICAgLy9maWx0ZXIgYWxsIHNlcnZlciBieSB0eXBlXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlcnMgPSB0aGlzLmN1cnJlbnRTdHJlYW0oKS5zZXJ2ZXJMaXN0LmZpbHRlcigoeCkgPT4geC50eXBlID09IHNlcnZlclR5cGUpO1xyXG4gICAgICAgICAgICBpZiAoIXNlcnZlcnMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICAgICAgLy9maWx0ZXIgYWxsIHNlcnZlciB1cmwgYnkgcXVhbGl0eSBvciBiZXN0cXVhbGl0eVxyXG4gICAgICAgICAgICB2YXIgcXVhbGl0eVVybCA9IHNlcnZlcnMubWFwKHggPT4geC5maW5kQnlRdWFsaXR5KHRoaXMubWVzc2FnZS5xdWFsaXR5KSkuZmlsdGVyKHggPT4geCAhPT0gdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgaWYgKCFxdWFsaXR5VXJsLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHF1YWxpdHlVcmwgPSBzZXJ2ZXJzLm1hcCh4ID0+IHguYmVzdFF1YWxpdHkoKSk7XHJcbiAgICAgICAgICAgIC8vYnkgdGhlIGFycmF5IG9yZGVyLCB0cnkgZ2V0IG0zdTggY29udGVudCBhbmQgcmV0dXJuIGlmIGRvbid0IGhhdmUgYWRzLlxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHVybCBvZiBxdWFsaXR5VXJsKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0geWllbGQgKHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsID09PSBudWxsIHx8IHVybCA9PT0gdm9pZCAwID8gdm9pZCAwIDogdXJsLnVybCkpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQWRzKHRleHQpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBvblN0YXJ0Q2hhbm5lbCh1cmwsIHRleHQpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCBjaGFubmVsTmFtZSA9IC9obHNcXC8oLiopLm0zdTgvZ20uZXhlYyh1cmwpIHx8IFtdO1xyXG4gICAgICAgICAgICBsZXQgc3RyZWFtO1xyXG4gICAgICAgICAgICBsZXQgZXhpc3RlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKGNoYW5uZWxOYW1lWzFdKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy53aGl0ZWxpc3QgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aGl0ZWxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0dWFsQ2hhbm5lbCA9IGNoYW5uZWxOYW1lWzFdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5Mb2dQcmludChcIkNoYW5uZWwgXCIgKyBjaGFubmVsTmFtZVsxXSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy53aGl0ZWxpc3QuaW5jbHVkZXMoY2hhbm5lbE5hbWVbMV0pKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zdHJlYW1MaXN0LmZpbmQoKGMpID0+IGMuY2hhbm5lbE5hbWUgPT09IGNoYW5uZWxOYW1lWzFdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RyZWFtTGlzdC5wdXNoKG5ldyBTdHJlYW0oY2hhbm5lbE5hbWVbMV0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJFeGlzdDogXCIgKyBjaGFubmVsTmFtZVsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhpc3RlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0cmVhbSA9IHRoaXMuY3VycmVudFN0cmVhbSgpO1xyXG4gICAgICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICAgICAgICAgIHlpZWxkIHN0cmVhbS5hZGRTdHJlYW1MaW5rKHRleHQsIFwibG9jYWxcIik7XHJcbiAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgICAgICAgICB5aWVsZCBzdHJlYW0uc3RyZWFtQWNjZXNzKHN0cmVhbXMucGljdHVyZSk7XHJcbiAgICAgICAgICAgIHN0cmVhbS5zdHJlYW1BY2Nlc3Moc3RyZWFtcy5sb2NhbCk7XHJcbiAgICAgICAgICAgIHN0cmVhbS5zdHJlYW1BY2Nlc3Moc3RyZWFtcy5sb2NhbCk7XHJcbiAgICAgICAgICAgIHN0cmVhbS5zdHJlYW1BY2Nlc3Moc3RyZWFtcy5sb2NhbCk7XHJcbiAgICAgICAgICAgIHN0cmVhbS5zdHJlYW1BY2Nlc3Moc3RyZWFtcy5sb2NhbCk7XHJcbiAgICAgICAgICAgIHN0cmVhbS5zdHJlYW1BY2Nlc3Moc3RyZWFtcy5sb2NhbCk7XHJcbiAgICAgICAgICAgIGlmIChleGlzdGVudClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGluZmxhdGVGZXRjaCgpIHtcclxuICAgICAgICAvL2VzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10aGlzLWFzc2lnblxyXG4gICAgICAgIGdsb2JhbC5mZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5lbmRzV2l0aChcIm0zdThcIikgJiYgdXJsLmluY2x1ZGVzKFwidHR2bncubmV0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsLCBvcHRpb25zKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsgcmV0dXJuIChyZXNwb25zZS50ZXh0KCkpOyB9KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHRleHQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9zZW5kIHRoZSBmbG93IHN0cmVhbSB0byBzY3JpcHQgdmFsaXRvciBhbmQgY2xhc3NpZmljYXRvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBnbG9iYWwucGxheWVyLm9uZmV0Y2godXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXlsaXN0ID0gZ2xvYmFsLnBsYXllci5jdXJyZW50U3RyZWFtKCkuaGxzLmdldEFsbFBsYXlsaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHBsYXlsaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcyhcInVzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIpICYmICF1cmwuaW5jbHVkZXMoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBnbG9iYWwucmVhbEZldGNoKHVybCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzLkxvZ1ByaW50KFwiY2hhbm5lbCBvZmZsaW5lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbigodGV4dCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBnbG9iYWwucGxheWVyLm9uU3RhcnRDaGFubmVsKHVybCwgdGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHRleHQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoX2IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKFwicGljdHVyZS1ieS1waWN0dXJlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC5yZWFsRmV0Y2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljR3hoZVdWeUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDNCc1lYbGxjaTl3YkdGNVpYSXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPMEZCUVVFc1QwRkJUeXhGUVVGRkxFMUJRVTBzUlVGQlJTeE5RVUZOTEd0Q1FVRnJRaXhEUVVGRE8wRkJRekZETEU5QlFVOHNSVUZCUlN4UFFVRlBMRVZCUVVVc1RVRkJUU3cwUWtGQk5FSXNRMEZCUXp0QlFVVnlSQ3hQUVVGUExFVkJRVVVzWVVGQllTeEZRVUZGTEUxQlFVMHNWMEZCVnl4RFFVRkRPMEZCUlRGRExFMUJRVTBzVDBGQlR5eE5RVUZOTzBsQldXWTdVVUZZUVN4alFVRlRMRWRCUVdFc1JVRkJSU3hEUVVGRE8xRkJRM3BDTEdkQ1FVRlhMRWRCUVZrc1MwRkJTeXhEUVVGRE8xRkJSVGRDTEdWQlFWVXNSMEZCWVN4RlFVRkZMRU5CUVVFN1VVRkRla0lzYTBKQlFXRXNSMEZCVnl4RlFVRkZMRU5CUVVNN1VVRkZNMElzV1VGQlR5eEhRVUZYTEVWQlFVVXNRMEZCUXp0UlFVTnlRaXhoUVVGUkxFZEJRVWNzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXp0UlFVVXpRaXhaUVVGUExFZEJRVWNzU1VGQlNTeGhRVUZoTEVWQlFVVXNRMEZCUXp0UlFVODVRaXhWUVVGTExFZEJRVWNzUTBGQlF5eERRVUZUTEVWQlFVVXNSVUZCUlR0WlFVTnNRaXhQUVVGUExFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNiMEpCUVc5Q0xFTkJRVU1zUTBGQlF6dFJRVU0xU1N4RFFVRkRMRU5CUVVFN1VVRkZSQ3hyUWtGQllTeEhRVUZITEVOQlFVTXNWVUZCYTBJc1NVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlZTeEZRVUZGTzFsQlF6ZEVMRTlCUVU4c1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRlRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eFhRVUZYTEV0QlFVc3NUMEZCVHl4RFFVRkZMRU5CUVVNN1VVRkRNMFVzUTBGQlF5eERRVUZCTzFGQlZrY3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dFJRVU40UWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF6dEpRVU4wUWl4RFFVRkRPMGxCVlVzc1QwRkJUeXhEUVVGRExFZEJRVmNzUlVGQlJTeFJRVUZuUWpzN1dVRkZka01zVFVGQlRTeGhRVUZoTEVkQlFWY3NUVUZCVFN4SlFVRkpMRU5CUVVNc1lVRkJZU3hGUVVGRkxFTkJRVU03V1VGRGVrUXNZVUZCWVN4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGWExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdXVUZGZUVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRPMmRDUVVGRkxFOUJRVThzU1VGQlNTeERRVUZETzFsQlJYWkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdXVUZGTTBJc1NVRkJTVHRuUWtGRFFTeE5RVUZOTEV0QlFVc3NSMEZCUnl4TlFVRk5MRWxCUVVrc1EwRkJReXh4UWtGQmNVSXNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZCTzJkQ1FVTnNSU3hKUVVGSkxFdEJRVXM3YjBKQlFVVXNZVUZCWVN4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGWExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdaMEpCUTJoRUxFbEJRVWtzUzBGQlN6dHZRa0ZCUlN4UFFVRlBMRWxCUVVrc1EwRkJRenRuUWtGRmRrSXNUVUZCVFN4UFFVRlBMRWRCUVVjc1RVRkJUU3hKUVVGSkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUVR0blFrRkRkRVVzU1VGQlNTeFBRVUZQTzI5Q1FVRkZMR0ZCUVdFc1EwRkJReXhIUVVGSExFTkJRVU1zVjBGQlZ5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRPMmRDUVVOd1JDeEpRVUZKTEU5QlFVODdiMEpCUVVVc1QwRkJUeXhKUVVGSkxFTkJRVU03WjBKQlJYcENMRTFCUVUwc1VVRkJVU3hIUVVGSExFMUJRVTBzU1VGQlNTeERRVUZETEhGQ1FVRnhRaXhEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVFN1owSkJRM2hGTEVsQlFVa3NVVUZCVVR0dlFrRkJSU3hoUVVGaExFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRuUWtGRGRFUXNTVUZCU1N4UlFVRlJPMjlDUVVGRkxFOUJRVThzU1VGQlNTeERRVUZETzJGQlJUZENPMWxCUVVNc1QwRkJUeXhEUVVGTkxFVkJRVVU3WjBKQlEySXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdZVUZETVVJN1VVRkRUQ3hEUVVGRE8wdEJRVUU3U1VGSFN5eHhRa0ZCY1VJc1EwRkJReXhWUVVGclFqczdXVUZETVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eGxRVUZsTEVkQlFVY3NWVUZCVlN4RFFVRkRMRU5CUVVNN1dVRkROVU1zTWtKQlFUSkNPMWxCUXpOQ0xFMUJRVTBzVDBGQlR5eEhRVUZ0UWl4SlFVRkpMRU5CUVVNc1lVRkJZU3hGUVVGRkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NTVUZCU1N4VlFVRlZMRU5CUVVNc1EwRkJRenRaUVVOd1J5eEpRVUZKTEVOQlFVTXNUMEZCVHp0blFrRkJSU3hQUVVGUExFVkJRVVVzUTBGQlF6dFpRVVY0UWl4cFJFRkJhVVE3V1VGRGFrUXNTVUZCU1N4VlFVRlZMRWRCUVVjc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhUUVVGVExFTkJRVU1zUTBGQlF6dFpRVU4wUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFMUJRVTA3WjBKQlFVVXNWVUZCVlN4SFFVRkhMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1YwRkJWeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFpRVVYyUlN4M1JVRkJkMFU3V1VGRGVFVXNTMEZCU3l4TlFVRk5MRWRCUVVjc1NVRkJTU3hWUVVGVkxFVkJRVVU3WjBKQlF6RkNMRTFCUVUwc1NVRkJTU3hIUVVGWExFMUJRVTBzUTBGQlF5eE5RVUZOTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSeXhoUVVGSUxFZEJRVWNzZFVKQlFVZ3NSMEZCUnl4RFFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdaMEpCUTNKRkxFbEJRVWtzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNN2IwSkJRVVVzVTBGQlV6dG5Ra0ZGTDBJc1QwRkJUeXhKUVVGSkxFTkJRVU03WVVGRFpqdFpRVU5FTEU5QlFVOHNSVUZCUlN4RFFVRkRPMUZCUTJRc1EwRkJRenRMUVVGQk8wbEJRMHNzWTBGQll5eERRVUZETEVkQlFWY3NSVUZCUlN4SlFVRlpPenRaUVVNeFF5eE5RVUZOTEZkQlFWY3NSMEZCZVVJc2EwSkJRV3RDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFpRVU0zUlN4SlFVRkpMRTFCUVdNc1EwRkJRenRaUVVOdVFpeEpRVUZKTEZGQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNN1dVRkZja0lzU1VGQlNTeFhRVUZYTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVN1owSkJRMmhDTEVsQlFVa3NTVUZCU1N4RFFVRkRMRk5CUVZNc1NVRkJTU3hUUVVGVExFVkJRVVU3YjBKQlF6ZENMRWxCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzUlVGQlJTeERRVUZETzJsQ1FVTjJRanRuUWtGRlJDeEpRVUZKTEVOQlFVTXNZVUZCWVN4SFFVRkhMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEY0VNc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eFZRVUZWTEVkQlFVY3NWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlJUTkRMRWxCUVVrc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVUZGTEU5QlFVODdaMEpCUlhCRUxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVk1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRmRCUVZjc1MwRkJTeXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0dlFrRkRlRVVzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRwUWtGRGJrUTdjVUpCUVUwN2IwSkJRMGdzU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4VFFVRlRMRWRCUVVjc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdiMEpCUXpGRExGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTTdhVUpCUTI1Q08yRkJRMG83V1VGRlJDeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSU3hEUVVGRE8xbEJRemxDTEdkRVFVRm5SRHRaUVVWb1JDeG5SRUZCWjBRN1dVRkRhRVFzU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4MVFrRkJkVUlzUTBGQlF5eERRVUZETzFsQlEzWkRMRTFCUVUwc1RVRkJUU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNN1dVRkRNVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzFsQlJXeERMRTFCUVUwc1RVRkJUU3hEUVVGRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1dVRkZNME1zVFVGQlRTeERRVUZETEZsQlFWa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03V1VGRGJrTXNUVUZCVFN4RFFVRkRMRmxCUVZrc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdXVUZEYmtNc1RVRkJUU3hEUVVGRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1dVRkRia01zVFVGQlRTeERRVUZETEZsQlFWa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03V1VGRGJrTXNUVUZCVFN4RFFVRkRMRmxCUVZrc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdXVUZGYmtNc1NVRkJTU3hSUVVGUk8yZENRVUZGTEU5QlFVODdXVUZGY2tJc1owUkJRV2RFTzFsQlEyaEVMRTlCUVU4N1VVRkRXQ3hEUVVGRE8wdEJRVUU3U1VGRlJDeFpRVUZaTzFGQlExSXNlVU5CUVhsRE8xRkJRM3BETEUxQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1ZVRkJaMElzUjBGQlJ5eEZRVUZGTEU5QlFVODdPMmRDUVVOMlF5eEpRVUZKTEU5QlFVOHNSMEZCUnl4TFFVRkxMRkZCUVZFc1JVRkJSVHR2UWtGRGVrSXNTVUZCU1N4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFVkJRVVU3ZDBKQlEyNUVMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlR5eFBRVUZQTEVWQlFVVXNUVUZCVFN4RlFVRkZMRVZCUVVVN05FSkJRM3BETEVsQlFVazdaME5CUTBFc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNN2NVTkJReTlDTEVsQlFVa3NRMEZCUXl4RFFVRlBMRkZCUVd0Q0xFVkJRVVVzUlVGQlJTeG5SRUZCUXl4UFFVRkJMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVRXNSMEZCUVN4RFFVRkRPM0ZEUVVOeVJDeEpRVUZKTEVOQlFVTXNRMEZCVHl4SlFVRlpMRVZCUVVVc1JVRkJSVHR2UTBGRGVrSXNNRVJCUVRCRU8yOURRVU14UkN4TlFVRk5MRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zVDBGQlR5eERRVUZETEVkQlFVY3NSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenR2UTBGRmRrTXNTVUZCU1N4UlFVRlJMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eGhRVUZoTEVWQlFVVXNRMEZCUXl4SFFVRkhMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU03YjBOQlEyeEZMRTlCUVU4c1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eFJRVUZsTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmREUVVNelF5eERRVUZETEVOQlFVRXNRMEZCUXl4RFFVRkRPelpDUVVOV096UkNRVUZETEZkQlFVMDdaME5CUTBvc1QwRkJUeXhEUVVGRExFbEJRVWtzVVVGQlVTeEZRVUZGTEVOQlFVTXNRMEZCUXpzMlFrRkRNMEk3ZDBKQlEwd3NRMEZCUXl4RFFVRkJMRU5CUVVNc1EwRkJRenR4UWtGRFRqdHZRa0ZGUkN4SlFVRkpMRWRCUVVjc1EwRkJReXhSUVVGUkxFTkJRVU1zYTBOQlFXdERMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNiMEpCUVc5Q0xFTkJRVU1zUlVGQlJUdDNRa0ZEZWtZc1QwRkJUeXhKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZQTEU5QlFVOHNSVUZCUlN4TlFVRk5MRVZCUVVVc1JVRkJSVHMwUWtGRGVrTXNTVUZCU1R0blEwRkRRU3hOUVVGTkxGRkJRVkVzUjBGQlJ5eE5RVUZOTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSeXhGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZETzJkRFFVTjBSQ3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNSVUZCUlR0dlEwRkRaQ3hQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVRTdiME5CUTJwQ0xHMURRVUZ0UXp0cFEwRkRkRU03WjBOQlJVUXNVVUZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZQTEVsQlFWa3NSVUZCUlN4RlFVRkZPMjlEUVVONFF5eE5RVUZOTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFZEJRVWNzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0dlEwRkRPVU1zVDBGQlR5eERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03WjBOQlEyaERMRU5CUVVNc1EwRkJRU3hEUVVGRExFTkJRVU03TmtKQlEwNDdORUpCUVVNc1YwRkJUVHRuUTBGRFNpeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRVZCUVVVc1EwRkJReXhEUVVGRE96WkNRVU16UWp0M1FrRkRUQ3hEUVVGRExFTkJRVUVzUTBGQlF5eERRVUZETzNGQ1FVTk9PMjlDUVVWRUxFbEJRVWtzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4dlFrRkJiMElzUTBGQlF5eEZRVUZGTzNGQ1FVTjJRenRwUWtGRFNqdG5Ra0ZGUkN4UFFVRlBMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJRenRaUVVOdVJDeERRVUZETzFOQlFVRXNRMEZCUXp0SlFVTk9MRU5CUVVNN1EwRkRTaUo5IiwidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5pbXBvcnQgeyBITFMgfSBmcm9tIFwiLi4vaGxzL0hMU1wiO1xyXG5pbXBvcnQgeyBzdHJlYW1TZXJ2ZXIgfSBmcm9tIFwiLi90eXBlL3N0cmVhbVNlcnZlci50eXBlc1wiO1xyXG5leHBvcnQgY2xhc3MgU3RyZWFtIHtcclxuICAgIGNvbnN0cnVjdG9yKGNoYW5uZWxOYW1lKSB7XHJcbiAgICAgICAgdGhpcy5zZXJ2ZXJMaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5obHMgPSBuZXcgSExTKCk7XHJcbiAgICAgICAgdGhpcy5jaGFubmVsTmFtZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy50dW5uZWwgPSBbXCJldTEuanVwdGVyLmdhXCJdO1xyXG4gICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBjaGFubmVsTmFtZTtcclxuICAgIH1cclxuICAgIC8vYWRkIG0zdTggbGlua3Mgd2l0aCBxdWFsaXR5IHRvIHRoZSBsaXN0IG9mIHNlcnZlcnNcclxuICAgIGFkZFN0cmVhbUxpbmsodGV4dCwgdHlwZSA9IFwibG9jYWxcIiwgc2lnID0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGNhcHR1cmVBcnJheTtcclxuICAgICAgICAgICAgY29uc3QgUkVHRVggPSAvTkFNRT1cIigoPzpcXFMrXFxzK1xcUyt8XFxTKykpXCIsQVVUTyg/Ol58XFxTK1xccyspKD86XnxcXFMrXFxzKykoaHR0cHM6XFwvXFwvdmlkZW8oXFxTKykubTN1OCkvZztcclxuICAgICAgICAgICAgd2hpbGUgKChjYXB0dXJlQXJyYXkgPSBSRUdFWC5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcXVhbGl0eVVybFNwbGl0LnB1c2goeyBxdWFsaXR5OiBjYXB0dXJlQXJyYXlbMV0sIHVybDogY2FwdHVyZUFycmF5WzJdIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHF1YWxpdHlVcmxTcGxpdCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSBuZXcgc3RyZWFtU2VydmVyKHsgdHlwZTogdHlwZSwgdXJsTGlzdDogcXVhbGl0eVVybFNwbGl0LCBzaWc6IHNpZyB9KTtcclxuICAgICAgICAgICAgdGhpcy5zZXJ2ZXJMaXN0LnB1c2goc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgICAgIGlmICghc2lnKSB7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNpZ25hdHVyZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc2lnbmF0dXJlKCkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFJFR0VYID0gL3ZpZGVvLXdlYXZlci4oLiopLmhscy50dHZudy5uZXRcXC92MVxcL3BsYXlsaXN0XFwvKC4qKS5tM3U4JC9nbTtcclxuICAgICAgICAgICAgeWllbGQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHRoaXMuc2VydmVyTGlzdFxyXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4geC5zaWcgPT0gZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAuZm9yRWFjaCgoeCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBSRUdFWC5leGVjKHgudXJsTGlzdFswXS51cmwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZmV0Y2goXCJodHRwczovL2p1cHRlci5nYS9obHMvdjIvc2lnL1wiICsgbWF0Y2hbMl0gKyBcIi9cIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeC5zaWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvL2FkZCBhIG5ldyBwbGF5ZXIgc3RyZWFtIGV4dGVybmFsXHJcbiAgICBleHRlcm5hbFBsYXllcigpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBnbG9iYWwucmVhbEZldGNoKFwiaHR0cHM6Ly9cIiArIHRoaXMudHVubmVsWzBdICsgXCIvY2hhbm5lbC9cIiArIHRoaXMuY2hhbm5lbE5hbWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInNlcnZlciBwcm94eSByZXR1cm4gZXJyb3Igb3Igbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHlpZWxkIHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogT0tcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFN0cmVhbUxpbmsodGV4dCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KGUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvL2FkZCBhIG5ldyBwbGF5ZXIgc3RyZWFtIGxvY2FsXHJcbiAgICBzdHJlYW1BY2Nlc3Moc3RyZWFtKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdxbCA9IHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2goXCJodHRwczovL2dxbC50d2l0Y2gudHYvZ3FsXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgXCJDbGllbnQtSURcIjogXCJraW1uZTc4a3gzbmN4NmJyZ280bXY2d2tpNWgxa29cIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IGB7XCJvcGVyYXRpb25OYW1lXCI6XCJQbGF5YmFja0FjY2Vzc1Rva2VuXCIsXCJ2YXJpYWJsZXNcIjp7XCJpc0xpdmVcIjp0cnVlLFwibG9naW5cIjpcIiR7dGhpcy5jaGFubmVsTmFtZX1cIixcImlzVm9kXCI6ZmFsc2UsXCJ2b2RJRFwiOlwiXCIsXCJwbGF5ZXJUeXBlXCI6XCIke3N0cmVhbS5wbGF5ZXJUeXBlfVwifSxcImV4dGVuc2lvbnNcIjp7XCJwZXJzaXN0ZWRRdWVyeVwiOntcInZlcnNpb25cIjoxLFwic2hhMjU2SGFzaFwiOlwiMDgyODExOWRlZDFjMTM0Nzc5NjY0MzRlMTU4MDBmZjU3ZGRhY2YxM2JhMTkxMWMxMjlkYzIyMDA3MDViMDcxMlwifX19YCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0geWllbGQgZ3FsLmpzb24oKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly91c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiICtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoYW5uZWxOYW1lICtcclxuICAgICAgICAgICAgICAgICAgICBcIi5tM3U4P2FsbG93X3NvdXJjZT10cnVlJmZhc3RfYnJlYWQ9dHJ1ZSZwPVwiICtcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxZTcpICtcclxuICAgICAgICAgICAgICAgICAgICBcIiZwbGF5ZXJfYmFja2VuZD1tZWRpYXBsYXllciZwbGF5bGlzdF9pbmNsdWRlX2ZyYW1lcmF0ZT10cnVlJnJlYXNzaWdubWVudHNfc3VwcG9ydGVkPWZhbHNlJnNpZz1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzW1wiZGF0YVwiXVtcInN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW5cIl1bXCJzaWduYXR1cmVcIl0gK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJnN1cHBvcnRlZF9jb2RlY3M9YXZjMSZ0b2tlbj1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzW1wiZGF0YVwiXVtcInN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW5cIl1bXCJ2YWx1ZVwiXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB5aWVsZCAoeWllbGQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwpKS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJTZXJ2ZXIgbG9hZGVkIFwiICsgc3RyZWFtLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTdHJlYW1MaW5rKHRleHQsIHN0cmVhbS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUnlaV0Z0TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMM04wY21WaGJTOXpkSEpsWVcwdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPenM3T3pzN08wRkJRVUVzVDBGQlR5eEZRVUZGTEVkQlFVY3NSVUZCUlN4TlFVRk5MRmxCUVZrc1EwRkJRenRCUVVWcVF5eFBRVUZQTEVWQlFXTXNXVUZCV1N4RlFVRkZMRTFCUVUwc01rSkJRVEpDTEVOQlFVTTdRVUZGY2tVc1RVRkJUU3hQUVVGUExFMUJRVTA3U1VGUFppeFpRVUZaTEZkQlFXMUNPMUZCVGk5Q0xHVkJRVlVzUjBGQmJVSXNSVUZCUlN4RFFVRkRPMUZCUTJoRExGRkJRVWNzUjBGQlVTeEpRVUZKTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTNKQ0xHZENRVUZYTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUlhwQ0xGZEJRVTBzUjBGQlJ5eERRVUZETEdWQlFXVXNRMEZCUXl4RFFVRkJPMUZCUjNSQ0xFbEJRVWtzUTBGQlF5eFhRVUZYTEVkQlFVY3NWMEZCVnl4RFFVRkRPMGxCUTI1RExFTkJRVU03U1VGRlJDeHZSRUZCYjBRN1NVRkRPVU1zWVVGQllTeERRVUZETEVsQlFWa3NSVUZCUlN4SlFVRkpMRWRCUVVjc1QwRkJUeXhGUVVGRkxFZEJRVWNzUjBGQlJ5eExRVUZMT3p0WlFVTjZSQ3hOUVVGTkxHVkJRV1VzUjBGQmFVSXNSVUZCUlN4RFFVRkRPMWxCUTNwRExFbEJRVWtzV1VGQmIwTXNRMEZCUXp0WlFVVjZReXhOUVVGTkxFdEJRVXNzUjBGQlJ5eHhSa0ZCY1VZc1EwRkJRenRaUVVWd1J5eFBRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkpMRVZCUVVVN1owSkJReTlETEdWQlFXVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hQUVVGUExFVkJRVVVzV1VGQldTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPMkZCUXpWRk8xbEJRMFFzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4bFFVRmxMRU5CUVVNc1EwRkJRenRaUVVNM1FpeE5RVUZOTEZWQlFWVXNSMEZCYVVJc1NVRkJTU3haUVVGWkxFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkZMRTlCUVU4c1JVRkJSU3hsUVVGbExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNN1dVRkRkRWNzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03V1VGRmFrTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSVHRuUWtGRFRpeE5RVUZOTEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVc1EwRkJRenRoUVVNeFFqdFpRVU5FTEU5QlFVOHNTVUZCU1N4RFFVRkRPMUZCUTJoQ0xFTkJRVU03UzBGQlFUdEpRVVZMTEZOQlFWTTdPMWxCUTFnc1RVRkJUU3hMUVVGTExFZEJRVWNzTmtSQlFUWkVMRU5CUVVNN1dVRkZOVVVzVFVGQlRTeEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFTkJRekZDTEVsQlFVa3NRMEZCUXl4VlFVRlZPMmxDUVVOV0xFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVMHNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzU1VGQlNTeExRVUZMTEVOQlFVTTdhVUpCUTJ4RExFOUJRVThzUTBGQlF5eERRVUZQTEVOQlFVMHNSVUZCUlN4RlFVRkZPMmRDUVVOMFFpeE5RVUZOTEV0QlFVc3NSMEZCTWtJc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJkQ1FVTnVSU3hKUVVGSkxFdEJRVXNzUlVGQlJUdHZRa0ZEVUN4SlFVRkpPM2RDUVVOQkxFMUJRVTBzUzBGQlN5eERRVUZETEN0Q1FVRXJRaXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkhMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNwRkxFTkJRVU1zUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRPM2RDUVVOaUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0eFFrRkRha0k3YjBKQlFVTXNWMEZCVFR0M1FrRkRTaXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdjVUpCUTJ4Q08ybENRVU5LTzNGQ1FVRk5PMjlDUVVOSUxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0cFFrRkRiRUk3V1VGRFRDeERRVUZETEVOQlFVRXNRMEZCUXl4RFFVTlVMRU5CUVVNN1VVRkRUaXhEUVVGRE8wdEJRVUU3U1VGRlJDeHJRMEZCYTBNN1NVRkROVUlzWTBGQll6czdXVUZEYUVJc1NVRkJTVHRuUWtGRFFTeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMREJDUVVFd1FpeERRVUZETEVOQlFVTTdaMEpCUXpWRExFMUJRVTBzVVVGQlVTeEhRVUZoTEUxQlFVMHNUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhWUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhYUVVGWExFZEJRVWNzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRPMmRDUVVWb1NDeEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1JVRkJSVHR2UWtGRFpDeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMSGREUVVGM1F5eERRVUZETEVOQlFVTTdhVUpCUXpkRU8yZENRVVZFTEUxQlFVMHNTVUZCU1N4SFFVRlhMRTFCUVUwc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzJkQ1FVVXpReXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEhGQ1FVRnhRaXhEUVVGRExFTkJRVU03WjBKQlJYWkRMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdaMEpCUlhwQ0xFOUJRVThzU1VGQlNTeERRVUZETzJGQlEyWTdXVUZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRuUWtGRFVpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU51UWl4UFFVRlBMRXRCUVVzc1EwRkJRenRoUVVOb1FqdFJRVU5NTEVOQlFVTTdTMEZCUVR0SlFVVkVMQ3RDUVVFclFqdEpRVU42UWl4WlFVRlpMRU5CUVVNc1RVRkJhMEk3TzFsQlEycERMRWxCUVVrN1owSkJRMEVzVFVGQlRTeEhRVUZITEVkQlFVY3NUVUZCVFN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExESkNRVUV5UWl4RlFVRkZPMjlDUVVNMVJDeE5RVUZOTEVWQlFVVXNUVUZCVFR0dlFrRkRaQ3hQUVVGUExFVkJRVVVzUlVGQlJTeFhRVUZYTEVWQlFVVXNaME5CUVdkRExFVkJRVVU3YjBKQlF6RkVMRWxCUVVrc1JVRkJSU3c0UlVGQk9FVXNTVUZCU1N4RFFVRkRMRmRCUVZjc05FTkJRVFJETEUxQlFVMHNRMEZCUXl4VlFVRlZMRzFKUVVGdFNUdHBRa0ZEZGxNc1EwRkJReXhEUVVGRE8yZENRVVZJTEUxQlFVMHNUVUZCVFN4SFFVRlJMRTFCUVUwc1IwRkJSeXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzJkQ1FVVnlReXhOUVVGTkxFZEJRVWNzUjBGRFRDd3dRMEZCTUVNN2IwSkJRekZETEVsQlFVa3NRMEZCUXl4WFFVRlhPMjlDUVVOb1FpdzBRMEZCTkVNN2IwSkJRelZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXp0dlFrRkRMMElzWjBkQlFXZEhPMjlDUVVOb1J5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNRMEZCUXl4WFFVRlhMRU5CUVVNN2IwSkJRM2hFTEN0Q1FVRXJRanR2UWtGREwwSXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExESkNRVUV5UWl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03WjBKQlJYcEVMRTFCUVUwc1NVRkJTU3hIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0blFrRkZlRVFzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4blFrRkJaMElzUjBGQlJ5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1owSkJSV2hFTEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0blFrRkZkRU1zVDBGQlR5eEpRVUZKTEVOQlFVTTdZVUZEWmp0WlFVRkRMRTlCUVU4c1EwRkJReXhGUVVGRk8yZENRVU5TTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEyWXNUMEZCVHl4TFFVRkxMRU5CUVVNN1lVRkRhRUk3VVVGRFRDeERRVUZETzB0QlFVRTdRMEZGU2lKOSIsImV4cG9ydCBjb25zdCBzdHJlYW1zID0ge1xyXG4gICAgcGljdHVyZTogeyBwbGF5ZXJUeXBlOiBcInRodW5kZXJkb21lXCIsIG5hbWU6IFwibG93ZXJcIiB9LFxyXG4gICAgbG9jYWw6IHsgcGxheWVyVHlwZTogXCJzaXRlXCIsIG5hbWU6IFwibm9ybWFsXCIgfSxcclxuICAgIGV4dGVybmFsOiB7IG5hbWU6IFwiZXh0ZXJuYWxcIiB9XHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUnlaV0Z0TG5SNWNHVXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTh1TGk5emNtTXZjM1J5WldGdEwzUjVjR1V2YzNSeVpXRnRMblI1Y0dVdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzVFVGQlRTeERRVUZETEUxQlFVMHNUMEZCVHl4SFFVRkhPMGxCUTI1Q0xFOUJRVThzUlVGQlJTeEZRVUZGTEZWQlFWVXNSVUZCUlN4aFFVRmhMRVZCUVVVc1NVRkJTU3hGUVVGRkxFOUJRVThzUlVGQlJUdEpRVU55UkN4TFFVRkxMRVZCUVVVc1JVRkJSU3hWUVVGVkxFVkJRVVVzVFVGQlRTeEZRVUZGTEVsQlFVa3NSVUZCUlN4UlFVRlJMRVZCUVVVN1NVRkROME1zVVVGQlVTeEZRVUZGTEVWQlFVVXNTVUZCU1N4RlFVRkZMRlZCUVZVc1JVRkJSVHREUVVOcVF5eERRVUZCSW4wPSIsImV4cG9ydCBjbGFzcyBxdWFsaXR5VXJsIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudXJsID0gXCJcIjtcclxuICAgICAgICB0aGlzLnF1YWxpdHkgPSBcIlwiO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBzdHJlYW1TZXJ2ZXIge1xyXG4gICAgY29uc3RydWN0b3IocGFydGlhbCkge1xyXG4gICAgICAgIHRoaXMuYmVzdFF1YWxpdHkgPSAoKSA9PiB7IHJldHVybiB0aGlzLnVybExpc3RbMF07IH07XHJcbiAgICAgICAgdGhpcy5maW5kQnlRdWFsaXR5ID0gKHF1YWxpdHkpID0+IHRoaXMudXJsTGlzdC5maW5kKHggPT4geC5xdWFsaXR5ID09IHF1YWxpdHkpO1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgcGFydGlhbCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzNSeVpXRnRVMlZ5ZG1WeUxuUjVjR1Z6TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dkxpNHZjM0pqTDNOMGNtVmhiUzkwZVhCbEwzTjBjbVZoYlZObGNuWmxjaTUwZVhCbGN5NTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4TlFVRk5MRTlCUVU4c1ZVRkJWVHRKUVVGMlFqdFJRVU5GTEZGQlFVY3NSMEZCVnl4RlFVRkZMRU5CUVVNN1VVRkRha0lzV1VGQlR5eEhRVUZYTEVWQlFVVXNRMEZCUXp0SlFVTjJRaXhEUVVGRE8wTkJRVUU3UVVGRFJDeE5RVUZOTEU5QlFVOHNXVUZCV1R0SlFWRjJRaXhaUVVGWkxFOUJRVGhDTzFGQlNERkRMR2RDUVVGWExFZEJRVWNzUjBGQlJ5eEZRVUZGTEVkQlFVY3NUMEZCVHl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTEVOQlFVTXNRMEZCUXl4RFFVRkJPMUZCUXpsRExHdENRVUZoTEVkQlFVY3NRMEZCUXl4UFFVRmxMRVZCUVVVc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNTVUZCU1N4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVkb1JpeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dEpRVU12UWl4RFFVRkRPME5CUTBZaWZRPT0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgUGxheWVyIH0gZnJvbSBcIi4vcGxheWVyL3BsYXllclwiO1xyXG5leHBvcnQgZnVuY3Rpb24gYXBwKHNjb3BlKSB7XHJcbiAgICBzY29wZS5Mb2dQcmludCA9ICh4KSA9PiBjb25zb2xlLmxvZyhcIltQdXJwbGVdOiBcIiwgeCk7XHJcbiAgICBzY29wZS5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZSkgPT4ge1xyXG4gICAgICAgIGdsb2JhbC5vbkV2ZW50TWVzc2FnZShlKTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcigpO1xyXG4gICAgZ2xvYmFsLnJlYWxGZXRjaCA9IGdsb2JhbC5mZXRjaDtcclxuICAgIGdsb2JhbC5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICBwbGF5ZXIuaW5mbGF0ZUZldGNoKCk7XHJcbiAgICBzY29wZS5Mb2dQcmludChcIlNjcmlwdCBydW5uaW5nXCIpO1xyXG59XHJcbmFwcChnbG9iYWwpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwyRndjQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNUVUZCVFN4RlFVRkZMRTFCUVUwc2FVSkJRV2xDTEVOQlFVTTdRVUZUZWtNc1RVRkJUU3hWUVVGVkxFZEJRVWNzUTBGQlF5eExRVUZWTzBsQlF6VkNMRXRCUVVzc1EwRkJReXhSUVVGUkxFZEJRVWNzUTBGQlF5eERRVUZOTEVWQlFVVXNSVUZCUlN4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpGRUxFdEJRVXNzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhUUVVGVExFVkJRVVVzUTBGQlF5eERRVUZOTEVWQlFVVXNSVUZCUlR0UlFVTXpReXhOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpOQ0xFTkJRVU1zUTBGQlF5eERRVUZETzBsQlJVZ3NUVUZCVFN4TlFVRk5MRWRCUVVjc1NVRkJTU3hOUVVGTkxFVkJRVVVzUTBGQlF6dEpRVVUxUWl4TlFVRk5MRU5CUVVNc1UwRkJVeXhIUVVGSExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVRTdTVUZETDBJc1RVRkJUU3hEUVVGRExFMUJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTTdTVUZGZGtJc1RVRkJUU3hEUVVGRExGbEJRVmtzUlVGQlJTeERRVUZETzBsQlEzUkNMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1EwRkJRenRCUVVOdVF5eERRVUZETzBGQlJVUXNSMEZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGREluMD0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=