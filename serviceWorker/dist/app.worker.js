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
    addPlaylistTest(playlist) { }
    addPlaylist(playlist, allowAds = false) {
        if (playlist === null) {
            return false;
        }
        let changed = false;
        const lines = playlist.toString().split(/[\r\n]/);
        this._header[4] = lines[4];
        this._header[5] = lines[5];
        //take all m3u9 content to the playlist and build a varible
        for (const i in lines) {
            if (lines[i].includes("#EXTINF")) {
                if (!allowAds) {
                    if (!lines[i].includes(",live")) {
                        continue;
                    }
                }
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
    getPlaylist() {
        let playlist = "";
        this._playlist.forEach((x) => (playlist = playlist + x.time + "\n" + x.info + "\n" + x.url + "\n"));
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
            playlist);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hscy9ITFMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLEdBQUc7SUFBaEI7UUFDVSxZQUFPLEdBQWtCLENBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLHlCQUF5QixFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDOUcsY0FBUyxHQUFtQixFQUFFLENBQUM7UUFDL0IsY0FBUyxHQUFHLENBQUMsQ0FBQztJQXdFeEIsQ0FBQztJQXRFQyxlQUFlLENBQUMsUUFBZ0IsSUFBRyxDQUFDO0lBRXBDLFdBQVcsQ0FBQyxRQUFnQixFQUFFLFdBQW9CLEtBQUs7UUFDckQsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFcEIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzQiwyREFBMkQ7UUFDM0QsS0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUU7WUFDckIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUMvQixTQUFTO3FCQUNWO2lCQUNGO2dCQUNELG9CQUFvQjtnQkFDcEIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMs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

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
        this.getQuality = () => __webpack_require__.g.postMessage({ type: "getQuality" });
        this.init = () => __webpack_require__.g.postMessage({ type: "init" });
        this.pause = () => __webpack_require__.g.postMessage({ type: "pause" });
        this.play = () => __webpack_require__.g.postMessage({ type: "play" });
        this.pauseAndPlay = () => {
            this.pause();
            this.play();
        };
        this.isLoaded = false;
        this.quality = "";
        __webpack_require__.g.onEventMessage = (e) => {
            // var myMessage = new MessageEvent('worker', { data: 'hello' });
            // if (global.onmessage) global.onmessage(this, myMessage);
            switch (e.data.funcName) {
                case "Buffering": {
                    break;
                }
                case "onClientSinkPlaying": {
                    break;
                }
                case "onClientSinkUpdate": {
                    break;
                }
                case "pause": {
                    break;
                }
                case "play": {
                    break;
                }
                case "Ready": {
                    break;
                }
                case "Playing": {
                    break;
                }
                case "setQuality": {
                    if (e.data.args)
                        this.quality = e.data.args[0].name;
                    if (e.data.value)
                        this.quality = e.data.value;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbGF5ZXIvbWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sYUFBYTtJQWdCeEI7UUFmQSxlQUFVLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQzlELFNBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbEQsVUFBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUNwRCxTQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELGlCQUFZLEdBQUcsR0FBRyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQztRQUVGLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFFakIsWUFBTyxHQUFXLEVBQUUsQ0FBQztRQUtuQixNQUFNLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUU7WUFDakMsaUVBQWlFO1lBRWpFLDJEQUEyRDtZQUUzRCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUN2QixLQUFLLFdBQVcsQ0FBQyxDQUFDO29CQUNoQixNQUFNO2lCQUNQO2dCQUNELEtBQUsscUJBQXFCLENBQUMsQ0FBQztvQkFDMUIsTUFBTTtpQkFDUDtnQkFDRCxLQUFLLG9CQUFvQixDQUFDLENBQUM7b0JBQ3pCLE1BQU07aUJBQ1A7Z0JBQ0QsS0FBSyxPQUFPLENBQUMsQ0FBQztvQkFDWixNQUFNO2lCQUNQO2dCQUNELEtBQUssTUFBTSxDQUFDLENBQUM7b0JBQ1gsTUFBTTtpQkFDUDtnQkFDRCxLQUFLLE9BQU8sQ0FBQyxDQUFDO29CQUNaLE1BQU07aUJBQ1A7Z0JBQ0QsS0FBSyxTQUFTLENBQUMsQ0FBQztvQkFDZCxNQUFNO2lCQUNQO2dCQUNELEtBQUssWUFBWSxDQUFDLENBQUM7b0JBQ2pCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJO3dCQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNwRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSzt3QkFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUM5QyxNQUFNO2lCQUNQO2dCQUNELEtBQUssWUFBWSxDQUFDLENBQUM7b0JBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQzVCLE1BQU07aUJBQ1A7Z0JBQ0QsT0FBTyxDQUFDLENBQUM7b0JBQ1AsTUFBTTtpQkFDUDthQUNGO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNGIn0=

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
        this.streamList = [];
        this.actualChannel = "";
        this.playingAds = false;
        this.quality = "";
        this.LogPrint = __webpack_require__.g.LogPrint;
        this.message = new _message__WEBPACK_IMPORTED_MODULE_2__.PlayerMessage();
        this.onStartAds = () => { };
        this.onEndAds = () => { };
        this.isAds = (x, allowChange = false) => {
            // const ads = x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad") || x.toString().includes("twitch-ad-quartile");
            const ads = x.toString().includes("stitched");
            if (!allowChange)
                return ads;
            if (this.playingAds != ads && ads)
                this.onStartAds();
            if (this.playingAds != ads && !ads)
                this.onEndAds();
            this.playingAds = ads;
            return this.playingAds;
        };
        this.currentStream = (channel = this.actualChannel) => {
            return this.streamList.find((x) => x.channelName === channel);
        };
        this.message.init();
    }
    onfetch(url, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentStream = yield this.currentStream();
            currentStream.hls.addPlaylist(response);
            if (!this.isAds(response, true))
                return true;
            try {
                const local = yield this.fetchm3u8ByStreamType(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local);
                if (local)
                    currentStream.hls.addPlaylist(local);
                if (!local)
                    currentStream.streamAccess(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local);
                if (local)
                    return true;
                const picture = yield this.fetchm3u8ByStreamType(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.picture);
                if (picture)
                    currentStream.hls.addPlaylist(picture);
                if (picture)
                    return true;
                const external = yield this.fetchm3u8ByStreamType(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.external);
                if (external)
                    currentStream.hls.addPlaylist(external);
                if (external)
                    return true;
                console.log("fail");
                //if not resolve return the 480p to the user.
                currentStream.hls.addPlaylist(local, true);
                return true;
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    fetchm3u8ByStreamType(accessType) {
        return __awaiter(this, void 0, void 0, function* () {
            this.LogPrint("Stream Type: " + accessType.name);
            //filter all server by type
            const servers = this.currentStream().getStreamServerByStreamType(accessType);
            if (!servers)
                return "";
            //filter all server url by quality or bestquality
            var streamUrlList = servers.map((x) => x.findByQuality(this.message.quality)).filter((x) => x !== undefined);
            if (!streamUrlList.length)
                streamUrlList = servers.map((x) => x.bestQuality());
            //by the array order, try get m3u8 content and return if don't have ads.
            for (const streamUrl of streamUrlList) {
                const text = yield (yield __webpack_require__.g.realFetch(streamUrl === null || streamUrl === void 0 ? void 0 : streamUrl.url)).text();
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
            let whitelist = [];
            if (!channelName[1])
                return false;
            this.actualChannel = channelName[1];
            this.LogPrint("Channel " + channelName[1]);
            if (!this.message.setting == undefined) {
                if (!this.message.setting.whitelist == undefined) {
                    whitelist = this.message.setting.whitelist;
                }
            }
            if (whitelist.includes(channelName[1]))
                return false;
            if (!this.streamList.find((c) => c.channelName === channelName[1])) {
                let proxyUrl = "";
                if (this.message.setting)
                    proxyUrl = this.message.setting.proxyUrl ? this.message.setting.proxyUrl : "";
                this.streamList.push(new _stream_stream__WEBPACK_IMPORTED_MODULE_0__.Stream(channelName[1], proxyUrl));
            }
            else {
                this.LogPrint("Exist: " + channelName[1]);
                existent = true;
            }
            stream = this.currentStream();
            //--------------------------------------------//
            //--------------------------------------------//
            this.LogPrint("Local Server: Loading");
            yield stream.addStreamLink(text, "local", true);
            this.LogPrint("Local Server: OK");
            stream.streamAccess(_stream_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.local);
            if (existent)
                return;
            //if the proxy option on popup is disabled, it is never called.
            if (this.message.setting) {
                if (this.message.setting.toggleProxy == false)
                    return;
            }
            stream.tryExternalPlayer();
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
                                yield __webpack_require__.g
                                    .realFetch(url, options)
                                    .then((response) => __awaiter(this, void 0, void 0, function* () { return response.text(); }))
                                    .then((text) => __awaiter(this, void 0, void 0, function* () {
                                    //send the flow stream to script valitor and classificator
                                    yield __webpack_require__.g.player.onfetch(url, text);
                                    var playlist = __webpack_require__.g.player.currentStream().hls.getPlaylist();
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
                        this.LogPrint("picture-by-picture");
                        return new Response();
                    }
                }
                return __webpack_require__.g.realFetch.apply(this, arguments);
            });
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsYXllci9wbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxPQUFPLEVBQWMsTUFBTSw0QkFBNEIsQ0FBQztBQUVqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTFDLE1BQU0sT0FBTyxNQUFNO0lBVWpCO1FBVEEsZUFBVSxHQUFhLEVBQUUsQ0FBQztRQUMxQixrQkFBYSxHQUFXLEVBQUUsQ0FBQztRQUMzQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBRW5CLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFDckIsYUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFFM0IsWUFBTyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7UUFNOUIsZUFBVSxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztRQUN0QixhQUFRLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO1FBRXBCLFVBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxjQUF1QixLQUFLLEVBQUUsRUFBRTtZQUNsRCxnSkFBZ0o7WUFDaEosTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksR0FBRyxJQUFJLEdBQUc7Z0JBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JELElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHO2dCQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztZQUV0QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDekIsQ0FBQyxDQUFDO1FBRUYsa0JBQWEsR0FBRyxDQUFDLFVBQWtCLElBQUksQ0FBQyxhQUFhLEVBQVUsRUFBRTtZQUMvRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxLQUFLLE9BQU8sQ0FBRSxDQUFDO1FBQ3pFLENBQUMsQ0FBQztRQW5CQSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFvQkssT0FBTyxDQUFDLEdBQVcsRUFBRSxRQUFnQjs7WUFDekMsTUFBTSxhQUFhLEdBQVcsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekQsYUFBYSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUU3QyxJQUFJO2dCQUNGLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxLQUFLO29CQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLENBQUMsS0FBSztvQkFBRSxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUV2QixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksT0FBTztvQkFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxPQUFPO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUV6QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3BFLElBQUksUUFBUTtvQkFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxRQUFRO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUUxQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQiw2Q0FBNkM7Z0JBQzdDLGFBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0MsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUFDLE9BQU8sQ0FBTSxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3hCO1FBQ0gsQ0FBQztLQUFBO0lBRUsscUJBQXFCLENBQUMsVUFBc0I7O1lBQ2hELElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCwyQkFBMkI7WUFDM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLDJCQUEyQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxPQUFPO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBRXhCLGlEQUFpRDtZQUNqRCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQztZQUM3RyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07Z0JBQUUsYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRS9FLHdFQUF3RTtZQUN4RSxLQUFLLE1BQU0sU0FBUyxJQUFJLGFBQWEsRUFBRTtnQkFDckMsTUFBTSxJQUFJLEdBQVcsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDM0UsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFBRSxTQUFTO2dCQUUvQixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsT0FBTyxFQUFFLENBQUM7UUFDWixDQUFDO0tBQUE7SUFDSyxjQUFjLENBQUMsR0FBVyxFQUFFLElBQVk7O1lBQzVDLE1BQU0sV0FBVyxHQUF5QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdFLElBQUksTUFBYyxDQUFDO1lBQ25CLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztZQUNyQixJQUFJLFNBQVMsR0FBYSxFQUFFLENBQUM7WUFFN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLFNBQVMsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxTQUFTLEVBQUU7b0JBQ2hELFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7aUJBQzVDO2FBQ0Y7WUFFRCxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBRXJELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDMUUsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO2dCQUNsQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTztvQkFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDeEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDNUQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLFFBQVEsR0FBRyxJQUFJLENBQUM7YUFDakI7WUFFRCxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzlCLGdEQUFnRDtZQUVoRCxnREFBZ0Q7WUFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hELElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUVsQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVuQyxJQUFJLFFBQVE7Z0JBQUUsT0FBTztZQUVyQiwrREFBK0Q7WUFDL0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksS0FBSztvQkFBRSxPQUFPO2FBQ3ZEO1lBRUQsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFM0IsT0FBTztRQUNULENBQUM7S0FBQTtJQUVELFlBQVk7UUFDVix5Q0FBeUM7UUFDekMsTUFBTSxDQUFDLEtBQUssR0FBRyxVQUFnQixHQUFHLEVBQUUsT0FBTzs7Z0JBQ3pDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO29CQUMzQixJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDckQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFPLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTs0QkFDM0MsSUFBSTtnQ0FDRixNQUFNLE1BQU07cUNBQ1QsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7cUNBQ3ZCLElBQUksQ0FBQyxDQUFPLFFBQWtCLEVBQUUsRUFBRSxnREFBQyxPQUFBLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQSxHQUFBLENBQUM7cUNBQ25ELElBQUksQ0FBQyxDQUFPLElBQVksRUFBRSxFQUFFO29DQUMzQiwwREFBMEQ7b0NBQzFELE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUV2QyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQ0FDL0QsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLFFBQWUsQ0FBQyxDQUFDLENBQUM7Z0NBQ3pDLENBQUMsQ0FBQSxDQUFDLENBQUM7NkJBQ047NEJBQUMsV0FBTTtnQ0FDTixPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDOzZCQUN6Qjt3QkFDSCxDQUFDLENBQUEsQ0FBQyxDQUFDO3FCQUNKO29CQUVELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO3dCQUMzRixPQUFPLElBQUksT0FBTyxDQUFDLENBQU8sT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFOzRCQUMzQyxJQUFJO2dDQUNGLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0NBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFO29DQUNoQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7b0NBQ2xCLG1DQUFtQztpQ0FDcEM7Z0NBRUQsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFPLElBQVksRUFBRSxFQUFFO29DQUMxQyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztvQ0FDOUMsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0NBQzlCLENBQUMsQ0FBQSxDQUFDLENBQUM7NkJBQ0o7NEJBQUMsV0FBTTtnQ0FDTixPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDOzZCQUN6Qjt3QkFDSCxDQUFDLENBQUEsQ0FBQyxDQUFDO3FCQUNKO29CQUVELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO3dCQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7d0JBQ3BDLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztxQkFDdkI7aUJBQ0Y7Z0JBRUQsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDakQsQ0FBQztTQUFBLENBQUM7SUFDSixDQUFDO0NBQ0YifQ==

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
/* harmony import */ var _type_stream_type__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./type/stream.type */ "./src/stream/type/stream.type.ts");
/* harmony import */ var _type_streamServer_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./type/streamServer.types */ "./src/stream/type/streamServer.types.ts");
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
    constructor(channelName, tunnel = "") {
        this.serverList = [];
        this.hls = new _hls_HLS__WEBPACK_IMPORTED_MODULE_0__.HLS();
        this.channelName = "";
        this.tunnel = ["https://eu1.jupter.ga/channel/{channelname}", "https://eu2.jupter.ga/channel/{channelname}"];
        this.currentTunnel = this.tunnel[0];
        this.getStreamServerByStreamType = (accessType) => this.serverList.filter((x) => x.type == accessType.name);
        this.tryExternalPlayer = () => __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.streamAccess(_type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.external))) {
                this.externalPlayer(true);
            }
        });
        this.channelName = channelName;
        if (tunnel)
            this.currentTunnel = tunnel;
    }
    //add m3u8 links with quality to the list of servers
    addStreamLink(text, type = "local", sig = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const qualityUrlSplit = [];
            let captureArray;
            const REGEX = /NAME="((?:\S+\s+\S+|\S+))",AUTO(?:^|\S+\s+)(?:^|\S+\s+)(https:\/\/video(\S+).m3u8)/g;
            while ((captureArray = REGEX.exec(text)) !== null) {
                qualityUrlSplit.push({ quality: captureArray[1], url: captureArray[2] });
            }
            const streamList = new _type_streamServer_types__WEBPACK_IMPORTED_MODULE_2__.streamServer({ type: type, urlList: qualityUrlSplit, sig: sig });
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
            yield new Promise((resolve) => {
                this.serverList
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
                })),
                    resolve(false);
            });
        });
    }
    //add a new player stream external
    externalPlayer(customIgnore = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (customIgnore)
                this.currentTunnel = this.tunnel[0];
            try {
                __webpack_require__.g.LogPrint("External Server: Loading");
                const response = yield __webpack_require__.g.realFetch(this.currentTunnel.replace("{channelname}", this.channelName));
                if (!response.ok) {
                    throw new Error("server proxy return error or not found");
                }
                const text = yield response.text();
                __webpack_require__.g.LogPrint("External Server: OK");
                this.addStreamLink(text, _type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.external.name);
                return true;
            }
            catch (e) {
                __webpack_require__.g.LogPrint("server proxy return error or not found " + this.currentTunnel);
                __webpack_require__.g.LogPrint(e);
                return false;
            }
        });
    }
    //create a new stream access
    streamAccess(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            if (stream.name == _type_stream_type__WEBPACK_IMPORTED_MODULE_1__.streams.external.name)
                return yield this.externalPlayer();
            try {
                const query = 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}';
                const body = {
                    operationName: "PlaybackAccessToken_Template",
                    query: query,
                    variables: {
                        isLive: true,
                        login: this.channelName,
                        isVod: false,
                        vodID: "",
                        playerType: stream.playerType,
                    },
                };
                const gql = yield __webpack_require__.g.realFetch("https://gql.twitch.tv/gql", {
                    method: "POST",
                    headers: { "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
                    body: JSON.stringify(body),
                });
                const streamDataAccess = yield gql.json();
                const url = "https://usher.ttvnw.net/api/channel/hls/" +
                    this.channelName +
                    ".m3u8?allow_source=true&fast_bread=true&p=" +
                    Math.floor(Math.random() * 1e7) +
                    "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
                    streamDataAccess.data.streamPlaybackAccessToken.signature +
                    "&supported_codecs=avc1&token=" +
                    streamDataAccess.data.streamPlaybackAccessToken.value;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbS9zdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNqQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sb0JBQW9CLENBQUM7QUFDekQsT0FBTyxFQUFjLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXJFLE1BQU0sT0FBTyxNQUFNO0lBVWpCLFlBQVksV0FBbUIsRUFBRSxTQUFpQixFQUFFO1FBVHBELGVBQVUsR0FBbUIsRUFBRSxDQUFDO1FBQ2hDLFFBQUcsR0FBUSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBRXpCLFdBQU0sR0FBRyxDQUFDLDZDQUE2QyxFQUFFLDZDQUE2QyxDQUFDLENBQUM7UUFDeEcsa0JBQWEsR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZDLGdDQUEyQixHQUFHLENBQUMsVUFBc0IsRUFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTRFbkksc0JBQWlCLEdBQUcsR0FBUyxFQUFFO1lBQzdCLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQjtRQUNILENBQUMsQ0FBQSxDQUFDO1FBN0VBLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksTUFBTTtZQUFFLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO0lB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

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
    local: { playerType: "embed", name: "normal" },
    external: { name: "external" },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLnR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc3RyZWFtL3R5cGUvc3RyZWFtLnR5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHO0lBQ3JCLE9BQU8sRUFBRSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtJQUNyRCxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDOUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtDQUMvQixDQUFDIn0=

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
        this.bestQuality = () => {
            return this.urlList[0];
        };
        this.findByQuality = (quality) => this.urlList.find((x) => x.quality == quality);
        Object.assign(this, partial);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtU2VydmVyLnR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cmVhbS90eXBlL3N0cmVhbVNlcnZlci50eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sVUFBVTtJQUF2QjtRQUNFLFFBQUcsR0FBVyxFQUFFLENBQUM7UUFDakIsWUFBTyxHQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0NBQUE7QUFDRCxNQUFNLE9BQU8sWUFBWTtJQVV2QixZQUFZLE9BQThCO1FBTDFDLGdCQUFXLEdBQUcsR0FBRyxFQUFFO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUM7UUFDRixrQkFBYSxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQztRQUdsRixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvQixDQUFDO0NBQ0YifQ==

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
/*!***************************!*\
  !*** ./src/app.worker.ts ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ app)
/* harmony export */ });
/* harmony import */ var _player_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player/player */ "./src/player/player.ts");

function app() {
    __webpack_require__.g.LogPrint = (x) => console.log("[Purple]: ", x);
    __webpack_require__.g.addEventListener("message", (e) => {
        __webpack_require__.g.onEventMessage(e);
    });
    const player = new _player_player__WEBPACK_IMPORTED_MODULE_0__.Player();
    __webpack_require__.g.realFetch = __webpack_require__.g.fetch;
    __webpack_require__.g.player = player;
    player.inflateFetch();
    __webpack_require__.g.LogPrint("Script running");
}
app();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLndvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHAud29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQVN6QyxNQUFNLENBQUMsT0FBTyxVQUFVLEdBQUc7SUFDekIsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQU0sRUFBRSxFQUFFO1FBQzVDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO0lBRTVCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNoQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUV2QixNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDdEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFDRCxHQUFHLEVBQUUsQ0FBQyJ9
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7Ozs7OztVQ2YzQztVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7O0FDTnlDO0FBQzFCO0FBQ2YsSUFBSSxxQkFBTTtBQUNWLElBQUkscUJBQU07QUFDVixRQUFRLHFCQUFNO0FBQ2QsS0FBSztBQUNMLHVCQUF1QixrREFBTTtBQUM3QixJQUFJLHFCQUFNLGFBQWEscUJBQU07QUFDN0IsSUFBSSxxQkFBTTtBQUNWO0FBQ0EsSUFBSSxxQkFBTTtBQUNWO0FBQ0E7QUFDQSwyQ0FBMkMsMjBCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2hscy9ITFMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci9tZXNzYWdlLnRzIiwid2VicGFjazovLy8uL3NyYy9wbGF5ZXIvcGxheWVyLnRzIiwid2VicGFjazovLy8uL3NyYy9zdHJlYW0vc3RyZWFtLnRzIiwid2VicGFjazovLy8uL3NyYy9zdHJlYW0vdHlwZS9zdHJlYW0udHlwZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RyZWFtL3R5cGUvc3RyZWFtU2VydmVyLnR5cGVzLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9hcHAud29ya2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBITFMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyID0gW1wiI0VYVE0zVVwiLCBcIiNFWFQtWC1WRVJTSU9OOjNcIiwgXCIjRVhULVgtVEFSR0VURFVSQVRJT046NlwiLCBcIiNFWFQtWC1NRURJQS1TRVFVRU5DRTpcIl07XHJcbiAgICAgICAgdGhpcy5fcGxheWxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLl9zZXF1ZW5jZSA9IDA7XHJcbiAgICB9XHJcbiAgICBhZGRQbGF5bGlzdFRlc3QocGxheWxpc3QpIHsgfVxyXG4gICAgYWRkUGxheWxpc3QocGxheWxpc3QsIGFsbG93QWRzID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAocGxheWxpc3QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gcGxheWxpc3QudG9TdHJpbmcoKS5zcGxpdCgvW1xcclxcbl0vKTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJbNF0gPSBsaW5lc1s0XTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJbNV0gPSBsaW5lc1s1XTtcclxuICAgICAgICAvL3Rha2UgYWxsIG0zdTkgY29udGVudCB0byB0aGUgcGxheWxpc3QgYW5kIGJ1aWxkIGEgdmFyaWJsZVxyXG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBsaW5lcykge1xyXG4gICAgICAgICAgICBpZiAobGluZXNbaV0uaW5jbHVkZXMoXCIjRVhUSU5GXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFsbG93QWRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsaW5lc1tpXS5pbmNsdWRlcyhcIixsaXZlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vdGltZXN0YW1wIHNlcXVlbmNlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXF1ZW5jZVRpbWVzdGFtcCA9IE1hdGguZmxvb3IobmV3IERhdGUobGluZXNbcGFyc2VJbnQoaSkgLSAxXS5zbGljZShsaW5lc1twYXJzZUludChpKSAtIDFdLmxlbmd0aCAtIDI0LCBsaW5lc1twYXJzZUludChpKSAtIDFdLmxlbmd0aCkpLmdldFRpbWUoKSAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgLy9zZWxlY3QgYWxsIHNlcXVlbmNlIHRoYXQgbm8gZXhpc3RcclxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLl9wbGF5bGlzdC5maWx0ZXIoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lc3RhbXAgPj0gc2VxdWVuY2VUaW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBzZXF1ZW5jZSBvbiBwbGF5bGlzdCB2YXJpYWJsZSBpZiBpdCBubyBleGlzdFxyXG4gICAgICAgICAgICAgICAgaWYgKCFyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlID0gdGhpcy5fc2VxdWVuY2UgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBsaW5lc1twYXJzZUludChpKSAtIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHNlcXVlbmNlVGltZXN0YW1wLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiBsaW5lc1twYXJzZUludChpKV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogbGluZXNbcGFyc2VJbnQoaSkgKyAxXSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wbGF5bGlzdC5sZW5ndGggPiAxNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XHJcbiAgICB9XHJcbiAgICBnZXRQbGF5bGlzdCgpIHtcclxuICAgICAgICBsZXQgcGxheWxpc3QgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuX3BsYXlsaXN0LmZvckVhY2goKHgpID0+IChwbGF5bGlzdCA9IHBsYXlsaXN0ICsgeC50aW1lICsgXCJcXG5cIiArIHguaW5mbyArIFwiXFxuXCIgKyB4LnVybCArIFwiXFxuXCIpKTtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hlYWRlclswXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzJdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclszXSArXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls0XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgcGxheWxpc3QpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNFeFRMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyaHNjeTlJVEZNdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzVFVGQlRTeFBRVUZQTEVkQlFVYzdTVUZCYUVJN1VVRkRWU3haUVVGUExFZEJRV3RDTEVOQlFVTXNVMEZCVXl4RlFVRkZMR3RDUVVGclFpeEZRVUZGTEhsQ1FVRjVRaXhGUVVGRkxIZENRVUYzUWl4RFFVRkRMRU5CUVVNN1VVRkRPVWNzWTBGQlV5eEhRVUZ0UWl4RlFVRkZMRU5CUVVNN1VVRkRMMElzWTBGQlV5eEhRVUZITEVOQlFVTXNRMEZCUXp0SlFYZEZlRUlzUTBGQlF6dEpRWFJGUXl4bFFVRmxMRU5CUVVNc1VVRkJaMElzU1VGQlJ5eERRVUZETzBsQlJYQkRMRmRCUVZjc1EwRkJReXhSUVVGblFpeEZRVUZGTEZkQlFXOUNMRXRCUVVzN1VVRkRja1FzU1VGQlNTeFJRVUZSTEV0QlFVc3NTVUZCU1N4RlFVRkZPMWxCUTNKQ0xFOUJRVThzUzBGQlN5eERRVUZETzFOQlEyUTdVVUZGUkN4SlFVRkpMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU03VVVGRmNFSXNUVUZCVFN4TFFVRkxMRWRCUVVjc1VVRkJVU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVOc1JDeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTXpRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVVV6UWl3eVJFRkJNa1E3VVVGRE0wUXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExFVkJRVVU3V1VGRGNrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZPMmRDUVVOb1F5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZPMjlDUVVOaUxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTzNkQ1FVTXZRaXhUUVVGVE8zRkNRVU5XTzJsQ1FVTkdPMmRDUVVORUxHOUNRVUZ2UWp0blFrRkRjRUlzVFVGQlRTeHBRa0ZCYVVJc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVU5zUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSMEZCUnl4RlFVRkZMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkRNMGdzUTBGQlF6dG5Ra0ZGUml4dFEwRkJiVU03WjBKQlEyNURMRTFCUVUwc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVU3YjBKQlEzQkRMRTlCUVU4c1EwRkJReXhEUVVGRExGTkJRVk1zU1VGQlNTeHBRa0ZCYVVJc1EwRkJRenRuUWtGRE1VTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRMGdzYzBSQlFYTkVPMmRDUVVOMFJDeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJSVHR2UWtGRFlpeEpRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRWxCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzUTBGQlF5eERRVUZETzI5Q1FVTndReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXp0M1FrRkRiRUlzU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzNkQ1FVTTFRaXhUUVVGVExFVkJRVVVzYVVKQlFXbENPM2RDUVVNMVFpeEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZEZUVJc1IwRkJSeXhGUVVGRkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8zRkNRVU0xUWl4RFFVRkRMRU5CUVVNN2IwSkJRMGdzVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXp0cFFrRkRhRUk3WjBKQlEwUXNUMEZCVHl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUjBGQlJ5eEZRVUZGTEVWQlFVVTdiMEpCUTJwRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN2FVSkJRM2hDTzJGQlEwWTdVMEZEUmp0UlFVTkVMRTlCUVU4c1QwRkJUeXhEUVVGRE8wbEJRMnBDTEVOQlFVTTdTVUZGUkN4WFFVRlhPMUZCUTFRc1NVRkJTU3hSUVVGUkxFZEJRVmNzUlVGQlJTeERRVUZETzFGQlJURkNMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExGRkJRVkVzUjBGQlJ5eFJRVUZSTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NSMEZCUnl4SlFVRkpMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTNCSExFOUJRVThzUTBGRFRDeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVObUxFbEJRVWs3V1VGRFNpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVObUxFbEJRVWs3V1VGRFNpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVObUxFbEJRVWs3V1VGRFNpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVObUxFbEJRVWtzUTBGQlF5eFRRVUZUTzFsQlEyUXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRkZCUVZFc1EwRkRWQ3hEUVVGRE8wbEJRMG9zUTBGQlF6dERRVU5HSW4wPSIsImV4cG9ydCBjbGFzcyBQbGF5ZXJNZXNzYWdlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZ2V0UXVhbGl0eSA9ICgpID0+IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiZ2V0UXVhbGl0eVwiIH0pO1xyXG4gICAgICAgIHRoaXMuaW5pdCA9ICgpID0+IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiaW5pdFwiIH0pO1xyXG4gICAgICAgIHRoaXMucGF1c2UgPSAoKSA9PiBnbG9iYWwucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInBhdXNlXCIgfSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ID0gKCkgPT4gZ2xvYmFsLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJwbGF5XCIgfSk7XHJcbiAgICAgICAgdGhpcy5wYXVzZUFuZFBsYXkgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gXCJcIjtcclxuICAgICAgICBnbG9iYWwub25FdmVudE1lc3NhZ2UgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyB2YXIgbXlNZXNzYWdlID0gbmV3IE1lc3NhZ2VFdmVudCgnd29ya2VyJywgeyBkYXRhOiAnaGVsbG8nIH0pO1xyXG4gICAgICAgICAgICAvLyBpZiAoZ2xvYmFsLm9ubWVzc2FnZSkgZ2xvYmFsLm9ubWVzc2FnZSh0aGlzLCBteU1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGUuZGF0YS5mdW5jTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIkJ1ZmZlcmluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwib25DbGllbnRTaW5rUGxheWluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwib25DbGllbnRTaW5rVXBkYXRlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJwYXVzZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwicGxheVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmVhZHlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIlBsYXlpbmdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLmRhdGEuYXJncylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWFsaXR5ID0gZS5kYXRhLmFyZ3NbMF0ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS5kYXRhLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1YWxpdHkgPSBlLmRhdGEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwic2V0U2V0dGluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5nID0gZS5kYXRhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liV1Z6YzJGblpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5d2JHRjVaWEl2YldWemMyRm5aUzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeE5RVUZOTEU5QlFVOHNZVUZCWVR0SlFXZENlRUk3VVVGbVFTeGxRVUZWTEVkQlFVY3NSMEZCUnl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4WlFVRlpMRVZCUVVVc1EwRkJReXhEUVVGRE8xRkJRemxFTEZOQlFVa3NSMEZCUnl4SFFVRkhMRVZCUVVVc1EwRkJReXhOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRTFCUVUwc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRGJFUXNWVUZCU3l4SFFVRkhMRWRCUVVjc1JVRkJSU3hEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1QwRkJUeXhGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU53UkN4VFFVRkpMRWRCUVVjc1IwRkJSeXhGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzFGQlEyeEVMR2xDUVVGWkxFZEJRVWNzUjBGQlJ5eEZRVUZGTzFsQlEyeENMRWxCUVVrc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF6dFpRVU5pTEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRSUVVOa0xFTkJRVU1zUTBGQlF6dFJRVVZHTEdGQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNN1VVRkZha0lzV1VGQlR5eEhRVUZYTEVWQlFVVXNRMEZCUXp0UlFVdHVRaXhOUVVGTkxFTkJRVU1zWTBGQll5eEhRVUZITEVOQlFVTXNRMEZCVFN4RlFVRkZMRVZCUVVVN1dVRkRha01zYVVWQlFXbEZPMWxCUldwRkxESkVRVUV5UkR0WlFVVXpSQ3hSUVVGUkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZPMmRDUVVOMlFpeExRVUZMTEZkQlFWY3NRMEZCUXl4RFFVRkRPMjlDUVVOb1FpeE5RVUZOTzJsQ1FVTlFPMmRDUVVORUxFdEJRVXNzY1VKQlFYRkNMRU5CUVVNc1EwRkJRenR2UWtGRE1VSXNUVUZCVFR0cFFrRkRVRHRuUWtGRFJDeExRVUZMTEc5Q1FVRnZRaXhEUVVGRExFTkJRVU03YjBKQlEzcENMRTFCUVUwN2FVSkJRMUE3WjBKQlEwUXNTMEZCU3l4UFFVRlBMRU5CUVVNc1EwRkJRenR2UWtGRFdpeE5RVUZOTzJsQ1FVTlFPMmRDUVVORUxFdEJRVXNzVFVGQlRTeERRVUZETEVOQlFVTTdiMEpCUTFnc1RVRkJUVHRwUWtGRFVEdG5Ra0ZEUkN4TFFVRkxMRTlCUVU4c1EwRkJReXhEUVVGRE8yOUNRVU5hTEUxQlFVMDdhVUpCUTFBN1owSkJRMFFzUzBGQlN5eFRRVUZUTEVOQlFVTXNRMEZCUXp0dlFrRkRaQ3hOUVVGTk8ybENRVU5RTzJkQ1FVTkVMRXRCUVVzc1dVRkJXU3hEUVVGRExFTkJRVU03YjBKQlEycENMRWxCUVVrc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTzNkQ1FVRkZMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETzI5Q1FVTndSQ3hKUVVGSkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3p0M1FrRkJSU3hKUVVGSkxFTkJRVU1zVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRE8yOUNRVU01UXl4TlFVRk5PMmxDUVVOUU8yZENRVU5FTEV0QlFVc3NXVUZCV1N4RFFVRkRMRU5CUVVNN2IwSkJRMnBDTEVsQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTTdiMEpCUXpWQ0xFMUJRVTA3YVVKQlExQTdaMEpCUTBRc1QwRkJUeXhEUVVGRExFTkJRVU03YjBKQlExQXNUVUZCVFR0cFFrRkRVRHRoUVVOR08xRkJRMGdzUTBGQlF5eERRVUZETzBsQlEwb3NRMEZCUXp0RFFVTkdJbjA9IiwidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5pbXBvcnQgeyBTdHJlYW0gfSBmcm9tIFwiLi4vc3RyZWFtL3N0cmVhbVwiO1xyXG5pbXBvcnQgeyBzdHJlYW1zIH0gZnJvbSBcIi4uL3N0cmVhbS90eXBlL3N0cmVhbS50eXBlXCI7XHJcbmltcG9ydCB7IFBsYXllck1lc3NhZ2UgfSBmcm9tIFwiLi9tZXNzYWdlXCI7XHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5zdHJlYW1MaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5hY3R1YWxDaGFubmVsID0gXCJcIjtcclxuICAgICAgICB0aGlzLnBsYXlpbmdBZHMgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnF1YWxpdHkgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuTG9nUHJpbnQgPSBnbG9iYWwuTG9nUHJpbnQ7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbmV3IFBsYXllck1lc3NhZ2UoKTtcclxuICAgICAgICB0aGlzLm9uU3RhcnRBZHMgPSAoKSA9PiB7IH07XHJcbiAgICAgICAgdGhpcy5vbkVuZEFkcyA9ICgpID0+IHsgfTtcclxuICAgICAgICB0aGlzLmlzQWRzID0gKHgsIGFsbG93Q2hhbmdlID0gZmFsc2UpID0+IHtcclxuICAgICAgICAgICAgLy8gY29uc3QgYWRzID0geC50b1N0cmluZygpLmluY2x1ZGVzKFwic3RpdGNoZWQtYWRcIikgfHwgeC50b1N0cmluZygpLmluY2x1ZGVzKFwidHdpdGNoLWNsaWVudC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtYWQtcXVhcnRpbGVcIik7XHJcbiAgICAgICAgICAgIGNvbnN0IGFkcyA9IHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInN0aXRjaGVkXCIpO1xyXG4gICAgICAgICAgICBpZiAoIWFsbG93Q2hhbmdlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkcztcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWluZ0FkcyAhPSBhZHMgJiYgYWRzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vblN0YXJ0QWRzKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXlpbmdBZHMgIT0gYWRzICYmICFhZHMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRW5kQWRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWluZ0FkcyA9IGFkcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGxheWluZ0FkcztcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuY3VycmVudFN0cmVhbSA9IChjaGFubmVsID0gdGhpcy5hY3R1YWxDaGFubmVsKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cmVhbUxpc3QuZmluZCgoeCkgPT4geC5jaGFubmVsTmFtZSA9PT0gY2hhbm5lbCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UuaW5pdCgpO1xyXG4gICAgfVxyXG4gICAgb25mZXRjaCh1cmwsIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0cmVhbSA9IHlpZWxkIHRoaXMuY3VycmVudFN0cmVhbSgpO1xyXG4gICAgICAgICAgICBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0FkcyhyZXNwb25zZSwgdHJ1ZSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsID0geWllbGQgdGhpcy5mZXRjaG0zdThCeVN0cmVhbVR5cGUoc3RyZWFtcy5sb2NhbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobG9jYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0cmVhbS5obHMuYWRkUGxheWxpc3QobG9jYWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbClcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RyZWFtLnN0cmVhbUFjY2VzcyhzdHJlYW1zLmxvY2FsKTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2NhbClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBpY3R1cmUgPSB5aWVsZCB0aGlzLmZldGNobTN1OEJ5U3RyZWFtVHlwZShzdHJlYW1zLnBpY3R1cmUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBpY3R1cmUpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0cmVhbS5obHMuYWRkUGxheWxpc3QocGljdHVyZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGljdHVyZSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsID0geWllbGQgdGhpcy5mZXRjaG0zdThCeVN0cmVhbVR5cGUoc3RyZWFtcy5leHRlcm5hbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZXJuYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0cmVhbS5obHMuYWRkUGxheWxpc3QoZXh0ZXJuYWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVybmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmYWlsXCIpO1xyXG4gICAgICAgICAgICAgICAgLy9pZiBub3QgcmVzb2x2ZSByZXR1cm4gdGhlIDQ4MHAgdG8gdGhlIHVzZXIuXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChsb2NhbCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZmV0Y2htM3U4QnlTdHJlYW1UeXBlKGFjY2Vzc1R5cGUpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICB0aGlzLkxvZ1ByaW50KFwiU3RyZWFtIFR5cGU6IFwiICsgYWNjZXNzVHlwZS5uYW1lKTtcclxuICAgICAgICAgICAgLy9maWx0ZXIgYWxsIHNlcnZlciBieSB0eXBlXHJcbiAgICAgICAgICAgIGNvbnN0IHNlcnZlcnMgPSB0aGlzLmN1cnJlbnRTdHJlYW0oKS5nZXRTdHJlYW1TZXJ2ZXJCeVN0cmVhbVR5cGUoYWNjZXNzVHlwZSk7XHJcbiAgICAgICAgICAgIGlmICghc2VydmVycylcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgICAgICAvL2ZpbHRlciBhbGwgc2VydmVyIHVybCBieSBxdWFsaXR5IG9yIGJlc3RxdWFsaXR5XHJcbiAgICAgICAgICAgIHZhciBzdHJlYW1VcmxMaXN0ID0gc2VydmVycy5tYXAoKHgpID0+IHguZmluZEJ5UXVhbGl0eSh0aGlzLm1lc3NhZ2UucXVhbGl0eSkpLmZpbHRlcigoeCkgPT4geCAhPT0gdW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgaWYgKCFzdHJlYW1VcmxMaXN0Lmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHN0cmVhbVVybExpc3QgPSBzZXJ2ZXJzLm1hcCgoeCkgPT4geC5iZXN0UXVhbGl0eSgpKTtcclxuICAgICAgICAgICAgLy9ieSB0aGUgYXJyYXkgb3JkZXIsIHRyeSBnZXQgbTN1OCBjb250ZW50IGFuZCByZXR1cm4gaWYgZG9uJ3QgaGF2ZSBhZHMuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3RyZWFtVXJsIG9mIHN0cmVhbVVybExpc3QpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB5aWVsZCAoeWllbGQgZ2xvYmFsLnJlYWxGZXRjaChzdHJlYW1VcmwgPT09IG51bGwgfHwgc3RyZWFtVXJsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBzdHJlYW1VcmwudXJsKSkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNBZHModGV4dCkpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRDaGFubmVsKHVybCwgdGV4dCkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lID0gL2hsc1xcLyguKikubTN1OC9nbS5leGVjKHVybCkgfHwgW107XHJcbiAgICAgICAgICAgIGxldCBzdHJlYW07XHJcbiAgICAgICAgICAgIGxldCBleGlzdGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgd2hpdGVsaXN0ID0gW107XHJcbiAgICAgICAgICAgIGlmICghY2hhbm5lbE5hbWVbMV0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsQ2hhbm5lbCA9IGNoYW5uZWxOYW1lWzFdO1xyXG4gICAgICAgICAgICB0aGlzLkxvZ1ByaW50KFwiQ2hhbm5lbCBcIiArIGNoYW5uZWxOYW1lWzFdKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2Uuc2V0dGluZyA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tZXNzYWdlLnNldHRpbmcud2hpdGVsaXN0ID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaXRlbGlzdCA9IHRoaXMubWVzc2FnZS5zZXR0aW5nLndoaXRlbGlzdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2hpdGVsaXN0LmluY2x1ZGVzKGNoYW5uZWxOYW1lWzFdKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0cmVhbUxpc3QuZmluZCgoYykgPT4gYy5jaGFubmVsTmFtZSA9PT0gY2hhbm5lbE5hbWVbMV0pKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJveHlVcmwgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWVzc2FnZS5zZXR0aW5nKVxyXG4gICAgICAgICAgICAgICAgICAgIHByb3h5VXJsID0gdGhpcy5tZXNzYWdlLnNldHRpbmcucHJveHlVcmwgPyB0aGlzLm1lc3NhZ2Uuc2V0dGluZy5wcm94eVVybCA6IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0cmVhbUxpc3QucHVzaChuZXcgU3RyZWFtKGNoYW5uZWxOYW1lWzFdLCBwcm94eVVybCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5Mb2dQcmludChcIkV4aXN0OiBcIiArIGNoYW5uZWxOYW1lWzFdKTtcclxuICAgICAgICAgICAgICAgIGV4aXN0ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHJlYW0gPSB0aGlzLmN1cnJlbnRTdHJlYW0oKTtcclxuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAgICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgICAgICAgICB0aGlzLkxvZ1ByaW50KFwiTG9jYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgICAgICAgICB5aWVsZCBzdHJlYW0uYWRkU3RyZWFtTGluayh0ZXh0LCBcImxvY2FsXCIsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLkxvZ1ByaW50KFwiTG9jYWwgU2VydmVyOiBPS1wiKTtcclxuICAgICAgICAgICAgc3RyZWFtLnN0cmVhbUFjY2VzcyhzdHJlYW1zLmxvY2FsKTtcclxuICAgICAgICAgICAgaWYgKGV4aXN0ZW50KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvL2lmIHRoZSBwcm94eSBvcHRpb24gb24gcG9wdXAgaXMgZGlzYWJsZWQsIGl0IGlzIG5ldmVyIGNhbGxlZC5cclxuICAgICAgICAgICAgaWYgKHRoaXMubWVzc2FnZS5zZXR0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tZXNzYWdlLnNldHRpbmcudG9nZ2xlUHJveHkgPT0gZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0cmVhbS50cnlFeHRlcm5hbFBsYXllcigpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpbmZsYXRlRmV0Y2goKSB7XHJcbiAgICAgICAgLy9lc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdGhpcy1hc3NpZ25cclxuICAgICAgICBnbG9iYWwuZmV0Y2ggPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgYXJndW1lbnRzLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHVybCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmwuZW5kc1dpdGgoXCJtM3U4XCIpICYmIHVybC5pbmNsdWRlcyhcInR0dm53Lm5ldFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBnbG9iYWxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgeyByZXR1cm4gcmVzcG9uc2UudGV4dCgpOyB9KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHRleHQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9zZW5kIHRoZSBmbG93IHN0cmVhbSB0byBzY3JpcHQgdmFsaXRvciBhbmQgY2xhc3NpZmljYXRvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBnbG9iYWwucGxheWVyLm9uZmV0Y2godXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXlsaXN0ID0gZ2xvYmFsLnBsYXllci5jdXJyZW50U3RyZWFtKCkuaGxzLmdldFBsYXlsaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHBsYXlsaXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcyhcInVzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIpICYmICF1cmwuaW5jbHVkZXMoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBnbG9iYWwucmVhbEZldGNoKHVybCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzLkxvZ1ByaW50KFwiY2hhbm5lbCBvZmZsaW5lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbigodGV4dCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBnbG9iYWwucGxheWVyLm9uU3RhcnRDaGFubmVsKHVybCwgdGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHRleHQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoX2IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKFwicGljdHVyZS1ieS1waWN0dXJlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2xvYmFsLnJlYWxGZXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHeGhlV1Z5TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMM0JzWVhsbGNpOXdiR0Y1WlhJdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPenM3T3pzN08wRkJRVUVzVDBGQlR5eEZRVUZGTEUxQlFVMHNSVUZCUlN4TlFVRk5MR3RDUVVGclFpeERRVUZETzBGQlF6RkRMRTlCUVU4c1JVRkJSU3hQUVVGUExFVkJRV01zVFVGQlRTdzBRa0ZCTkVJc1EwRkJRenRCUVVWcVJTeFBRVUZQTEVWQlFVVXNZVUZCWVN4RlFVRkZMRTFCUVUwc1YwRkJWeXhEUVVGRE8wRkJSVEZETEUxQlFVMHNUMEZCVHl4TlFVRk5PMGxCVldwQ08xRkJWRUVzWlVGQlZTeEhRVUZoTEVWQlFVVXNRMEZCUXp0UlFVTXhRaXhyUWtGQllTeEhRVUZYTEVWQlFVVXNRMEZCUXp0UlFVTXpRaXhsUVVGVkxFZEJRVWNzUzBGQlN5eERRVUZETzFGQlJXNUNMRmxCUVU4c1IwRkJWeXhGUVVGRkxFTkJRVU03VVVGRGNrSXNZVUZCVVN4SFFVRkhMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU03VVVGRk0wSXNXVUZCVHl4SFFVRkhMRWxCUVVrc1lVRkJZU3hGUVVGRkxFTkJRVU03VVVGTk9VSXNaVUZCVlN4SFFVRkhMRWRCUVVjc1JVRkJSU3hIUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU4wUWl4aFFVRlJMRWRCUVVjc1IwRkJSeXhGUVVGRkxFZEJRVVVzUTBGQlF5eERRVUZETzFGQlJYQkNMRlZCUVVzc1IwRkJSeXhEUVVGRExFTkJRVk1zUlVGQlJTeGpRVUYxUWl4TFFVRkxMRVZCUVVVc1JVRkJSVHRaUVVOc1JDeG5Ta0ZCWjBvN1dVRkRhRW9zVFVGQlRTeEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0WlFVTTVReXhKUVVGSkxFTkJRVU1zVjBGQlZ6dG5Ra0ZCUlN4UFFVRlBMRWRCUVVjc1EwRkJRenRaUVVNM1FpeEpRVUZKTEVsQlFVa3NRMEZCUXl4VlFVRlZMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWM3WjBKQlFVVXNTVUZCU1N4RFFVRkRMRlZCUVZVc1JVRkJSU3hEUVVGRE8xbEJRM0pFTEVsQlFVa3NTVUZCU1N4RFFVRkRMRlZCUVZVc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITzJkQ1FVRkZMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF6dFpRVU53UkN4SlFVRkpMRU5CUVVNc1ZVRkJWU3hIUVVGSExFZEJRVWNzUTBGQlF6dFpRVVYwUWl4UFFVRlBMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU03VVVGRGVrSXNRMEZCUXl4RFFVRkRPMUZCUlVZc2EwSkJRV0VzUjBGQlJ5eERRVUZETEZWQlFXdENMRWxCUVVrc1EwRkJReXhoUVVGaExFVkJRVlVzUlVGQlJUdFpRVU12UkN4UFFVRlBMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCVXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zVjBGQlZ5eExRVUZMTEU5QlFVOHNRMEZCUlN4RFFVRkRPMUZCUTNwRkxFTkJRVU1zUTBGQlF6dFJRVzVDUVN4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzBsQlEzUkNMRU5CUVVNN1NVRnZRa3NzVDBGQlR5eERRVUZETEVkQlFWY3NSVUZCUlN4UlFVRm5RanM3V1VGRGVrTXNUVUZCVFN4aFFVRmhMRWRCUVZjc1RVRkJUU3hKUVVGSkxFTkJRVU1zWVVGQllTeEZRVUZGTEVOQlFVTTdXVUZEZWtRc1lVRkJZU3hEUVVGRExFZEJRVWNzUTBGQlF5eFhRVUZYTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1dVRkZlRU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hGUVVGRkxFbEJRVWtzUTBGQlF6dG5Ra0ZCUlN4UFFVRlBMRWxCUVVrc1EwRkJRenRaUVVVM1F5eEpRVUZKTzJkQ1FVTkdMRTFCUVUwc1MwRkJTeXhIUVVGSExFMUJRVTBzU1VGQlNTeERRVUZETEhGQ1FVRnhRaXhEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0blFrRkRPVVFzU1VGQlNTeExRVUZMTzI5Q1FVRkZMR0ZCUVdFc1EwRkJReXhIUVVGSExFTkJRVU1zVjBGQlZ5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMmRDUVVOb1JDeEpRVUZKTEVOQlFVTXNTMEZCU3p0dlFrRkJSU3hoUVVGaExFTkJRVU1zV1VGQldTeERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRuUWtGRGRFUXNTVUZCU1N4TFFVRkxPMjlDUVVGRkxFOUJRVThzU1VGQlNTeERRVUZETzJkQ1FVVjJRaXhOUVVGTkxFOUJRVThzUjBGQlJ5eE5RVUZOTEVsQlFVa3NRMEZCUXl4eFFrRkJjVUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1owSkJRMnhGTEVsQlFVa3NUMEZCVHp0dlFrRkJSU3hoUVVGaExFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRuUWtGRGNFUXNTVUZCU1N4UFFVRlBPMjlDUVVGRkxFOUJRVThzU1VGQlNTeERRVUZETzJkQ1FVVjZRaXhOUVVGTkxGRkJRVkVzUjBGQlJ5eE5RVUZOTEVsQlFVa3NRMEZCUXl4eFFrRkJjVUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1owSkJRM0JGTEVsQlFVa3NVVUZCVVR0dlFrRkJSU3hoUVVGaExFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRuUWtGRGRFUXNTVUZCU1N4UlFVRlJPMjlDUVVGRkxFOUJRVThzU1VGQlNTeERRVUZETzJkQ1FVVXhRaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMmRDUVVOd1FpdzJRMEZCTmtNN1owSkJRemRETEdGQlFXRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1YwRkJWeXhEUVVGRExFdEJRVXNzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0blFrRkRNME1zVDBGQlR5eEpRVUZKTEVOQlFVTTdZVUZEWWp0WlFVRkRMRTlCUVU4c1EwRkJUU3hGUVVGRk8yZENRVU5tTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzJGQlEzaENPMUZCUTBnc1EwRkJRenRMUVVGQk8wbEJSVXNzY1VKQlFYRkNMRU5CUVVNc1ZVRkJjMEk3TzFsQlEyaEVMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zWlVGQlpTeEhRVUZITEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVOcVJDd3lRa0ZCTWtJN1dVRkRNMElzVFVGQlRTeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSU3hEUVVGRExESkNRVUV5UWl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8xbEJRemRGTEVsQlFVa3NRMEZCUXl4UFFVRlBPMmRDUVVGRkxFOUJRVThzUlVGQlJTeERRVUZETzFsQlJYaENMR2xFUVVGcFJEdFpRVU5xUkN4SlFVRkpMR0ZCUVdFc1IwRkJSeXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUzBGQlN5eFRRVUZUTEVOQlFVTXNRMEZCUXp0WlFVTTNSeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEUxQlFVMDdaMEpCUVVVc1lVRkJZU3hIUVVGSExFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXl4RFFVRkRPMWxCUlM5RkxIZEZRVUYzUlR0WlFVTjRSU3hMUVVGTExFMUJRVTBzVTBGQlV5eEpRVUZKTEdGQlFXRXNSVUZCUlR0blFrRkRja01zVFVGQlRTeEpRVUZKTEVkQlFWY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eFRRVUZUTEdGQlFWUXNVMEZCVXl4MVFrRkJWQ3hUUVVGVExFTkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRuUWtGRE0wVXNTVUZCU1N4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF6dHZRa0ZCUlN4VFFVRlRPMmRDUVVVdlFpeFBRVUZQTEVsQlFVa3NRMEZCUXp0aFFVTmlPMWxCUTBRc1QwRkJUeXhGUVVGRkxFTkJRVU03VVVGRFdpeERRVUZETzB0QlFVRTdTVUZEU3l4alFVRmpMRU5CUVVNc1IwRkJWeXhGUVVGRkxFbEJRVms3TzFsQlF6VkRMRTFCUVUwc1YwRkJWeXhIUVVGNVFpeHJRa0ZCYTBJc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMWxCUXpkRkxFbEJRVWtzVFVGQll5eERRVUZETzFsQlEyNUNMRWxCUVVrc1VVRkJVU3hIUVVGSExFdEJRVXNzUTBGQlF6dFpRVU55UWl4SlFVRkpMRk5CUVZNc1IwRkJZU3hGUVVGRkxFTkJRVU03V1VGRk4wSXNTVUZCU1N4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlFVVXNUMEZCVHl4TFFVRkxMRU5CUVVNN1dVRkZiRU1zU1VGQlNTeERRVUZETEdGQlFXRXNSMEZCUnl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGNFTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFZEJRVWNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkZNME1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhKUVVGSkxGTkJRVk1zUlVGQlJUdG5Ra0ZEZEVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRk5CUVZNc1NVRkJTU3hUUVVGVExFVkJRVVU3YjBKQlEyaEVMRk5CUVZNc1IwRkJSeXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNN2FVSkJRelZETzJGQlEwWTdXVUZGUkN4SlFVRkpMRk5CUVZNc1EwRkJReXhSUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVGRkxFOUJRVThzUzBGQlN5eERRVUZETzFsQlJYSkVMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVZNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEZkQlFWY3NTMEZCU3l4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJUdG5Ra0ZETVVVc1NVRkJTU3hSUVVGUkxFZEJRVWNzUlVGQlJTeERRVUZETzJkQ1FVTnNRaXhKUVVGSkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHp0dlFrRkJSU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXp0blFrRkRlRWNzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hOUVVGTkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU03WVVGRE5VUTdhVUpCUVUwN1owSkJRMHdzU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4VFFVRlRMRWRCUVVjc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUXpGRExGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTTdZVUZEYWtJN1dVRkZSQ3hOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNSVUZCUlN4RFFVRkRPMWxCUXpsQ0xHZEVRVUZuUkR0WlFVVm9SQ3huUkVGQlowUTdXVUZEYUVRc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eDFRa0ZCZFVJc1EwRkJReXhEUVVGRE8xbEJRM1pETEUxQlFVMHNUVUZCVFN4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzVDBGQlR5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUTJoRUxFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNhMEpCUVd0Q0xFTkJRVU1zUTBGQlF6dFpRVVZzUXl4TlFVRk5MRU5CUVVNc1dVRkJXU3hEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0WlFVVnVReXhKUVVGSkxGRkJRVkU3WjBKQlFVVXNUMEZCVHp0WlFVVnlRaXdyUkVGQkswUTdXVUZETDBRc1NVRkJTU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEU5QlFVOHNSVUZCUlR0blFrRkRlRUlzU1VGQlNTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhYUVVGWExFbEJRVWtzUzBGQlN6dHZRa0ZCUlN4UFFVRlBPMkZCUTNaRU8xbEJSVVFzVFVGQlRTeERRVUZETEdsQ1FVRnBRaXhGUVVGRkxFTkJRVU03V1VGRk0wSXNUMEZCVHp0UlFVTlVMRU5CUVVNN1MwRkJRVHRKUVVWRUxGbEJRVms3VVVGRFZpeDVRMEZCZVVNN1VVRkRla01zVFVGQlRTeERRVUZETEV0QlFVc3NSMEZCUnl4VlFVRm5RaXhIUVVGSExFVkJRVVVzVDBGQlR6czdaMEpCUTNwRExFbEJRVWtzVDBGQlR5eEhRVUZITEV0QlFVc3NVVUZCVVN4RlFVRkZPMjlDUVVNelFpeEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4WFFVRlhMRU5CUVVNc1JVRkJSVHQzUWtGRGNrUXNUMEZCVHl4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGUExFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNSVUZCUlRzMFFrRkRNME1zU1VGQlNUdG5RMEZEUml4TlFVRk5MRTFCUVUwN2NVTkJRMVFzVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNN2NVTkJRM1pDTEVsQlFVa3NRMEZCUXl4RFFVRlBMRkZCUVd0Q0xFVkJRVVVzUlVGQlJTeG5SRUZCUXl4UFFVRkJMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlFTeEhRVUZCTEVOQlFVTTdjVU5CUTI1RUxFbEJRVWtzUTBGQlF5eERRVUZQTEVsQlFWa3NSVUZCUlN4RlFVRkZPMjlEUVVNelFpd3dSRUZCTUVRN2IwTkJRekZFTEUxQlFVMHNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlEUVVWMlF5eEpRVUZKTEZGQlFWRXNSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExHRkJRV0VzUlVGQlJTeERRVUZETEVkQlFVY3NRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJRenR2UTBGREwwUXNUMEZCVHl4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExGRkJRV1VzUTBGQlF5eERRVUZETEVOQlFVTTdaME5CUTNwRExFTkJRVU1zUTBGQlFTeERRVUZETEVOQlFVTTdOa0pCUTA0N05FSkJRVU1zVjBGQlRUdG5RMEZEVGl4UFFVRlBMRU5CUVVNc1NVRkJTU3hSUVVGUkxFVkJRVVVzUTBGQlF5eERRVUZET3paQ1FVTjZRanQzUWtGRFNDeERRVUZETEVOQlFVRXNRMEZCUXl4RFFVRkRPM0ZDUVVOS08yOUNRVVZFTEVsQlFVa3NSMEZCUnl4RFFVRkRMRkZCUVZFc1EwRkJReXhyUTBGQmEwTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eHZRa0ZCYjBJc1EwRkJReXhGUVVGRk8zZENRVU16Uml4UFFVRlBMRWxCUVVrc1QwRkJUeXhEUVVGRExFTkJRVThzVDBGQlR5eEZRVUZGTEUxQlFVMHNSVUZCUlN4RlFVRkZPelJDUVVNelF5eEpRVUZKTzJkRFFVTkdMRTFCUVUwc1VVRkJVU3hIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03WjBOQlEzUkVMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTzI5RFFVTm9RaXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdiME5CUTJ4Q0xHMURRVUZ0UXp0cFEwRkRjRU03WjBOQlJVUXNVVUZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZQTEVsQlFWa3NSVUZCUlN4RlFVRkZPMjlEUVVNeFF5eE5RVUZOTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFZEJRVWNzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0dlEwRkRPVU1zVDBGQlR5eERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03WjBOQlF6bENMRU5CUVVNc1EwRkJRU3hEUVVGRExFTkJRVU03TmtKQlEwbzdORUpCUVVNc1YwRkJUVHRuUTBGRFRpeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRVZCUVVVc1EwRkJReXhEUVVGRE96WkNRVU42UWp0M1FrRkRTQ3hEUVVGRExFTkJRVUVzUTBGQlF5eERRVUZETzNGQ1FVTktPMjlDUVVWRUxFbEJRVWtzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4dlFrRkJiMElzUTBGQlF5eEZRVUZGTzNkQ1FVTjBReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEc5Q1FVRnZRaXhEUVVGRExFTkJRVU03ZDBKQlEzQkRMRTlCUVU4c1NVRkJTU3hSUVVGUkxFVkJRVVVzUTBGQlF6dHhRa0ZEZGtJN2FVSkJRMFk3WjBKQlJVUXNUMEZCVHl4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1dVRkRha1FzUTBGQlF6dFRRVUZCTEVOQlFVTTdTVUZEU2l4RFFVRkRPME5CUTBZaWZRPT0iLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn07XHJcbmltcG9ydCB7IEhMUyB9IGZyb20gXCIuLi9obHMvSExTXCI7XHJcbmltcG9ydCB7IHN0cmVhbXMgfSBmcm9tIFwiLi90eXBlL3N0cmVhbS50eXBlXCI7XHJcbmltcG9ydCB7IHN0cmVhbVNlcnZlciB9IGZyb20gXCIuL3R5cGUvc3RyZWFtU2VydmVyLnR5cGVzXCI7XHJcbmV4cG9ydCBjbGFzcyBTdHJlYW0ge1xyXG4gICAgY29uc3RydWN0b3IoY2hhbm5lbE5hbWUsIHR1bm5lbCA9IFwiXCIpIHtcclxuICAgICAgICB0aGlzLnNlcnZlckxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLmhscyA9IG5ldyBITFMoKTtcclxuICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gXCJcIjtcclxuICAgICAgICB0aGlzLnR1bm5lbCA9IFtcImh0dHBzOi8vZXUxLmp1cHRlci5nYS9jaGFubmVsL3tjaGFubmVsbmFtZX1cIiwgXCJodHRwczovL2V1Mi5qdXB0ZXIuZ2EvY2hhbm5lbC97Y2hhbm5lbG5hbWV9XCJdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFR1bm5lbCA9IHRoaXMudHVubmVsWzBdO1xyXG4gICAgICAgIHRoaXMuZ2V0U3RyZWFtU2VydmVyQnlTdHJlYW1UeXBlID0gKGFjY2Vzc1R5cGUpID0+IHRoaXMuc2VydmVyTGlzdC5maWx0ZXIoKHgpID0+IHgudHlwZSA9PSBhY2Nlc3NUeXBlLm5hbWUpO1xyXG4gICAgICAgIHRoaXMudHJ5RXh0ZXJuYWxQbGF5ZXIgPSAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghKHlpZWxkIHRoaXMuc3RyZWFtQWNjZXNzKHN0cmVhbXMuZXh0ZXJuYWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRlcm5hbFBsYXllcih0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBjaGFubmVsTmFtZTtcclxuICAgICAgICBpZiAodHVubmVsKVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUdW5uZWwgPSB0dW5uZWw7XHJcbiAgICB9XHJcbiAgICAvL2FkZCBtM3U4IGxpbmtzIHdpdGggcXVhbGl0eSB0byB0aGUgbGlzdCBvZiBzZXJ2ZXJzXHJcbiAgICBhZGRTdHJlYW1MaW5rKHRleHQsIHR5cGUgPSBcImxvY2FsXCIsIHNpZyA9IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGNhcHR1cmVBcnJheTtcclxuICAgICAgICAgICAgY29uc3QgUkVHRVggPSAvTkFNRT1cIigoPzpcXFMrXFxzK1xcUyt8XFxTKykpXCIsQVVUTyg/Ol58XFxTK1xccyspKD86XnxcXFMrXFxzKykoaHR0cHM6XFwvXFwvdmlkZW8oXFxTKykubTN1OCkvZztcclxuICAgICAgICAgICAgd2hpbGUgKChjYXB0dXJlQXJyYXkgPSBSRUdFWC5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcXVhbGl0eVVybFNwbGl0LnB1c2goeyBxdWFsaXR5OiBjYXB0dXJlQXJyYXlbMV0sIHVybDogY2FwdHVyZUFycmF5WzJdIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSBuZXcgc3RyZWFtU2VydmVyKHsgdHlwZTogdHlwZSwgdXJsTGlzdDogcXVhbGl0eVVybFNwbGl0LCBzaWc6IHNpZyB9KTtcclxuICAgICAgICAgICAgdGhpcy5zZXJ2ZXJMaXN0LnB1c2goc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgICAgIGlmICghc2lnKSB7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNpZ25hdHVyZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc2lnbmF0dXJlKCkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFJFR0VYID0gL3ZpZGVvLXdlYXZlci4oLiopLmhscy50dHZudy5uZXRcXC92MVxcL3BsYXlsaXN0XFwvKC4qKS5tM3U4JC9nbTtcclxuICAgICAgICAgICAgeWllbGQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHgpID0+IHguc2lnID09IGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKCh4KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBSRUdFWC5leGVjKHgudXJsTGlzdFswXS51cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZmV0Y2goXCJodHRwczovL2p1cHRlci5nYS9obHMvdjIvc2lnL1wiICsgbWF0Y2hbMl0gKyBcIi9cIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHguc2lnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vYWRkIGEgbmV3IHBsYXllciBzdHJlYW0gZXh0ZXJuYWxcclxuICAgIGV4dGVybmFsUGxheWVyKGN1c3RvbUlnbm9yZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgaWYgKGN1c3RvbUlnbm9yZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFR1bm5lbCA9IHRoaXMudHVubmVsWzBdO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBnbG9iYWwucmVhbEZldGNoKHRoaXMuY3VycmVudFR1bm5lbC5yZXBsYWNlKFwie2NoYW5uZWxuYW1lfVwiLCB0aGlzLmNoYW5uZWxOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2VydmVyIHByb3h5IHJldHVybiBlcnJvciBvciBub3QgZm91bmRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0geWllbGQgcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyZWFtTGluayh0ZXh0LCBzdHJlYW1zLmV4dGVybmFsLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcInNlcnZlciBwcm94eSByZXR1cm4gZXJyb3Igb3Igbm90IGZvdW5kIFwiICsgdGhpcy5jdXJyZW50VHVubmVsKTtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy9jcmVhdGUgYSBuZXcgc3RyZWFtIGFjY2Vzc1xyXG4gICAgc3RyZWFtQWNjZXNzKHN0cmVhbSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChzdHJlYW0ubmFtZSA9PSBzdHJlYW1zLmV4dGVybmFsLm5hbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQgdGhpcy5leHRlcm5hbFBsYXllcigpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSAncXVlcnkgUGxheWJhY2tBY2Nlc3NUb2tlbl9UZW1wbGF0ZSgkbG9naW46IFN0cmluZyEsICRpc0xpdmU6IEJvb2xlYW4hLCAkdm9kSUQ6IElEISwgJGlzVm9kOiBCb29sZWFuISwgJHBsYXllclR5cGU6IFN0cmluZyEpIHsgIHN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW4oY2hhbm5lbE5hbWU6ICRsb2dpbiwgcGFyYW1zOiB7cGxhdGZvcm06IFwid2ViXCIsIHBsYXllckJhY2tlbmQ6IFwibWVkaWFwbGF5ZXJcIiwgcGxheWVyVHlwZTogJHBsYXllclR5cGV9KSBAaW5jbHVkZShpZjogJGlzTGl2ZSkgeyAgICB2YWx1ZSAgICBzaWduYXR1cmUgICAgX190eXBlbmFtZSAgfSAgdmlkZW9QbGF5YmFja0FjY2Vzc1Rva2VuKGlkOiAkdm9kSUQsIHBhcmFtczoge3BsYXRmb3JtOiBcIndlYlwiLCBwbGF5ZXJCYWNrZW5kOiBcIm1lZGlhcGxheWVyXCIsIHBsYXllclR5cGU6ICRwbGF5ZXJUeXBlfSkgQGluY2x1ZGUoaWY6ICRpc1ZvZCkgeyAgICB2YWx1ZSAgICBzaWduYXR1cmUgICAgX190eXBlbmFtZSAgfX0nO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25OYW1lOiBcIlBsYXliYWNrQWNjZXNzVG9rZW5fVGVtcGxhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICBxdWVyeTogcXVlcnksXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW46IHRoaXMuY2hhbm5lbE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVm9kOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm9kSUQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllclR5cGU6IHN0cmVhbS5wbGF5ZXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ3FsID0geWllbGQgZ2xvYmFsLnJlYWxGZXRjaChcImh0dHBzOi8vZ3FsLnR3aXRjaC50di9ncWxcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIkNsaWVudC1JRFwiOiBcImtpbW5lNzhreDNuY3g2YnJnbzRtdjZ3a2k1aDFrb1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbURhdGFBY2Nlc3MgPSB5aWVsZCBncWwuanNvbigpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3VzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiLm0zdTg/YWxsb3dfc291cmNlPXRydWUmZmFzdF9icmVhZD10cnVlJnA9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDFlNykgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJnBsYXllcl9iYWNrZW5kPW1lZGlhcGxheWVyJnBsYXlsaXN0X2luY2x1ZGVfZnJhbWVyYXRlPXRydWUmcmVhc3NpZ25tZW50c19zdXBwb3J0ZWQ9ZmFsc2Umc2lnPVwiICtcclxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1EYXRhQWNjZXNzLmRhdGEuc3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlbi5zaWduYXR1cmUgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJnN1cHBvcnRlZF9jb2RlY3M9YXZjMSZ0b2tlbj1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtRGF0YUFjY2Vzcy5kYXRhLnN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW4udmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0geWllbGQgKHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsKSkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiU2VydmVyIGxvYWRlZCBcIiArIHN0cmVhbS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyZWFtTGluayh0ZXh0LCBzdHJlYW0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDNOMGNtVmhiUzl6ZEhKbFlXMHVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPMEZCUVVFc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeE5RVUZOTEZsQlFWa3NRMEZCUXp0QlFVTnFReXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZqTEUxQlFVMHNiMEpCUVc5Q0xFTkJRVU03UVVGRGVrUXNUMEZCVHl4RlFVRmpMRmxCUVZrc1JVRkJSU3hOUVVGTkxESkNRVUV5UWl4RFFVRkRPMEZCUlhKRkxFMUJRVTBzVDBGQlR5eE5RVUZOTzBsQlZXcENMRmxCUVZrc1YwRkJiVUlzUlVGQlJTeFRRVUZwUWl4RlFVRkZPMUZCVkhCRUxHVkJRVlVzUjBGQmJVSXNSVUZCUlN4RFFVRkRPMUZCUTJoRExGRkJRVWNzUjBGQlVTeEpRVUZKTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTNKQ0xHZENRVUZYTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUlhwQ0xGZEJRVTBzUjBGQlJ5eERRVUZETERaRFFVRTJReXhGUVVGRkxEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN1VVRkRlRWNzYTBKQlFXRXNSMEZCVnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlJYWkRMR2REUVVFeVFpeEhRVUZITEVOQlFVTXNWVUZCYzBJc1JVRkJhMElzUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hKUVVGSkxGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFUUkZia2tzYzBKQlFXbENMRWRCUVVjc1IwRkJVeXhGUVVGRk8xbEJRemRDTEVsQlFVa3NRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1JVRkJSVHRuUWtGRGFFUXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dGhRVU16UWp0UlFVTklMRU5CUVVNc1EwRkJRU3hEUVVGRE8xRkJOMFZCTEVsQlFVa3NRMEZCUXl4WFFVRlhMRWRCUVVjc1YwRkJWeXhEUVVGRE8xRkJReTlDTEVsQlFVa3NUVUZCVFR0WlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzVFVGQlRTeERRVUZETzBsQlF6RkRMRU5CUVVNN1NVRkZSQ3h2UkVGQmIwUTdTVUZET1VNc1lVRkJZU3hEUVVGRExFbEJRVmtzUlVGQlJTeEpRVUZKTEVkQlFVY3NUMEZCVHl4RlFVRkZMRWRCUVVjc1IwRkJSeXhKUVVGSk96dFpRVU14UkN4TlFVRk5MR1ZCUVdVc1IwRkJhVUlzUlVGQlJTeERRVUZETzFsQlEzcERMRWxCUVVrc1dVRkJiME1zUTBGQlF6dFpRVVY2UXl4TlFVRk5MRXRCUVVzc1IwRkJSeXh4UmtGQmNVWXNRMEZCUXp0WlFVVndSeXhQUVVGUExFTkJRVU1zV1VGQldTeEhRVUZITEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZKTEVWQlFVVTdaMEpCUTJwRUxHVkJRV1VzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4UFFVRlBMRVZCUVVVc1dVRkJXU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVY3NSVUZCUlN4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzJGQlF6RkZPMWxCUlVRc1RVRkJUU3hWUVVGVkxFZEJRV2xDTEVsQlFVa3NXVUZCV1N4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlJTeFBRVUZQTEVWQlFVVXNaVUZCWlN4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzFsQlEzUkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMWxCUldwRExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdaMEpCUTFJc1RVRkJUU3hKUVVGSkxFTkJRVU1zVTBGQlV5eEZRVUZGTEVOQlFVTTdZVUZEZUVJN1dVRkRSQ3hQUVVGUExFbEJRVWtzUTBGQlF6dFJRVU5rTEVOQlFVTTdTMEZCUVR0SlFVVkxMRk5CUVZNN08xbEJRMklzVFVGQlRTeExRVUZMTEVkQlFVY3NOa1JCUVRaRUxFTkJRVU03V1VGRk5VVXNUVUZCVFN4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZGTzJkQ1FVTTFRaXhKUVVGSkxFTkJRVU1zVlVGQlZUdHhRa0ZEV2l4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGTkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRWxCUVVrc1MwRkJTeXhEUVVGRE8zRkNRVU5zUXl4UFFVRlBMRU5CUVVNc1EwRkJUeXhEUVVGTkxFVkJRVVVzUlVGQlJUdHZRa0ZEZUVJc1RVRkJUU3hMUVVGTExFZEJRVEpDTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenR2UWtGRGJrVXNTVUZCU1N4TFFVRkxMRVZCUVVVN2QwSkJRMVFzU1VGQlNUczBRa0ZEUml4TlFVRk5MRXRCUVVzc1EwRkJReXdyUWtGQkswSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE96UkNRVU42UlN4RFFVRkRMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF6czBRa0ZEWWl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03ZVVKQlEyWTdkMEpCUVVNc1YwRkJUVHMwUWtGRFRpeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN2VVSkJRMmhDTzNGQ1FVTkdPM2xDUVVGTk8zZENRVU5NTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenR4UWtGRGFFSTdaMEpCUTBnc1EwRkJReXhEUVVGQkxFTkJRVU03YjBKQlEwWXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8xbEJRMjVDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTB3c1EwRkJRenRMUVVGQk8wbEJSVVFzYTBOQlFXdERPMGxCUXpWQ0xHTkJRV01zUTBGQlF5eGxRVUYzUWl4TFFVRkxPenRaUVVOb1JDeEpRVUZKTEZsQlFWazdaMEpCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM1JFTEVsQlFVazdaMEpCUTBZc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5d3dRa0ZCTUVJc1EwRkJReXhEUVVGRE8yZENRVU0xUXl4TlFVRk5MRkZCUVZFc1IwRkJZU3hOUVVGTkxFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhQUVVGUExFTkJRVU1zWlVGQlpTeEZRVUZGTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVVZxU0N4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUlVGQlJUdHZRa0ZEYUVJc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eDNRMEZCZDBNc1EwRkJReXhEUVVGRE8ybENRVU16UkR0blFrRkZSQ3hOUVVGTkxFbEJRVWtzUjBGQlZ5eE5RVUZOTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRuUWtGRk0wTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXh4UWtGQmNVSXNRMEZCUXl4RFFVRkRPMmRDUVVWMlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVWb1JDeFBRVUZQTEVsQlFVa3NRMEZCUXp0aFFVTmlPMWxCUVVNc1QwRkJUeXhEUVVGRExFVkJRVVU3WjBKQlExWXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXg1UTBGQmVVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU03WjBKQlEyaEdMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTI1Q0xFOUJRVThzUzBGQlN5eERRVUZETzJGQlEyUTdVVUZEU0N4RFFVRkRPMHRCUVVFN1NVRlJSQ3cwUWtGQk5FSTdTVUZEZEVJc1dVRkJXU3hEUVVGRExFMUJRV3RDT3p0WlFVTnVReXhKUVVGSkxFMUJRVTBzUTBGQlF5eEpRVUZKTEVsQlFVa3NUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSk8yZENRVUZGTEU5QlFVOHNUVUZCVFN4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU03V1VGRk4wVXNTVUZCU1R0blFrRkRSaXhOUVVGTkxFdEJRVXNzUjBGRFZDeDFaa0ZCZFdZc1EwRkJRenRuUWtGRE1XWXNUVUZCVFN4SlFVRkpMRWRCUVVjN2IwSkJRMWdzWVVGQllTeEZRVUZGTERoQ1FVRTRRanR2UWtGRE4wTXNTMEZCU3l4RlFVRkZMRXRCUVVzN2IwSkJRMW9zVTBGQlV5eEZRVUZGTzNkQ1FVTlVMRTFCUVUwc1JVRkJSU3hKUVVGSk8zZENRVU5hTEV0QlFVc3NSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWenQzUWtGRGRrSXNTMEZCU3l4RlFVRkZMRXRCUVVzN2QwSkJRMW9zUzBGQlN5eEZRVUZGTEVWQlFVVTdkMEpCUTFRc1ZVRkJWU3hGUVVGRkxFMUJRVTBzUTBGQlF5eFZRVUZWTzNGQ1FVTTVRanRwUWtGRFJpeERRVUZETzJkQ1FVVkdMRTFCUVUwc1IwRkJSeXhIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl3eVFrRkJNa0lzUlVGQlJUdHZRa0ZET1VRc1RVRkJUU3hGUVVGRkxFMUJRVTA3YjBKQlEyUXNUMEZCVHl4RlFVRkZMRVZCUVVVc1YwRkJWeXhGUVVGRkxHZERRVUZuUXl4RlFVRkZPMjlDUVVNeFJDeEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU03YVVKQlF6TkNMRU5CUVVNc1EwRkJRenRuUWtGRFNDeE5RVUZOTEdkQ1FVRm5RaXhIUVVGUkxFMUJRVTBzUjBGQlJ5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMmRDUVVVdlF5eE5RVUZOTEVkQlFVY3NSMEZEVUN3d1EwRkJNRU03YjBKQlF6RkRMRWxCUVVrc1EwRkJReXhYUVVGWE8yOUNRVU5vUWl3MFEwRkJORU03YjBKQlF6VkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRWRCUVVjc1EwRkJRenR2UWtGREwwSXNaMGRCUVdkSE8yOUNRVU5vUnl4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNlVUpCUVhsQ0xFTkJRVU1zVTBGQlV6dHZRa0ZEZWtRc0swSkJRU3RDTzI5Q1FVTXZRaXhuUWtGQlowSXNRMEZCUXl4SlFVRkpMRU5CUVVNc2VVSkJRWGxDTEVOQlFVTXNTMEZCU3l4RFFVRkRPMmRDUVVONFJDeE5RVUZOTEVsQlFVa3NSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03WjBKQlJYaEVMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVVm9SQ3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlJYUkRMRTlCUVU4c1NVRkJTU3hEUVVGRE8yRkJRMkk3V1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0blFrRkRWaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVObUxFOUJRVThzUzBGQlN5eERRVUZETzJGQlEyUTdVVUZEU0N4RFFVRkRPMHRCUVVFN1EwRkRSaUo5IiwiZXhwb3J0IGNvbnN0IHN0cmVhbXMgPSB7XHJcbiAgICBwaWN0dXJlOiB7IHBsYXllclR5cGU6IFwidGh1bmRlcmRvbWVcIiwgbmFtZTogXCJsb3dlclwiIH0sXHJcbiAgICBsb2NhbDogeyBwbGF5ZXJUeXBlOiBcImVtYmVkXCIsIG5hbWU6IFwibm9ybWFsXCIgfSxcclxuICAgIGV4dGVybmFsOiB7IG5hbWU6IFwiZXh0ZXJuYWxcIiB9LFxyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdExuUjVjR1V1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12YzNSeVpXRnRMM1I1Y0dVdmMzUnlaV0Z0TG5SNWNHVXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFMUJRVTBzVDBGQlR5eEhRVUZITzBsQlEzSkNMRTlCUVU4c1JVRkJSU3hGUVVGRkxGVkJRVlVzUlVGQlJTeGhRVUZoTEVWQlFVVXNTVUZCU1N4RlFVRkZMRTlCUVU4c1JVRkJSVHRKUVVOeVJDeExRVUZMTEVWQlFVVXNSVUZCUlN4VlFVRlZMRVZCUVVVc1QwRkJUeXhGUVVGRkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVTdTVUZET1VNc1VVRkJVU3hGUVVGRkxFVkJRVVVzU1VGQlNTeEZRVUZGTEZWQlFWVXNSVUZCUlR0RFFVTXZRaXhEUVVGREluMD0iLCJleHBvcnQgY2xhc3MgcXVhbGl0eVVybCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnVybCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gXCJcIjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3Mgc3RyZWFtU2VydmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcnRpYWwpIHtcclxuICAgICAgICB0aGlzLmJlc3RRdWFsaXR5ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51cmxMaXN0WzBdO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5maW5kQnlRdWFsaXR5ID0gKHF1YWxpdHkpID0+IHRoaXMudXJsTGlzdC5maW5kKCh4KSA9PiB4LnF1YWxpdHkgPT0gcXVhbGl0eSk7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBwYXJ0aWFsKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdFUyVnlkbVZ5TG5SNWNHVnpMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMM04wY21WaGJTOTBlWEJsTDNOMGNtVmhiVk5sY25abGNpNTBlWEJsY3k1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hOUVVGTkxFOUJRVThzVlVGQlZUdEpRVUYyUWp0UlFVTkZMRkZCUVVjc1IwRkJWeXhGUVVGRkxFTkJRVU03VVVGRGFrSXNXVUZCVHl4SFFVRlhMRVZCUVVVc1EwRkJRenRKUVVOMlFpeERRVUZETzBOQlFVRTdRVUZEUkN4TlFVRk5MRTlCUVU4c1dVRkJXVHRKUVZWMlFpeFpRVUZaTEU5QlFUaENPMUZCVERGRExHZENRVUZYTEVkQlFVY3NSMEZCUnl4RlFVRkZPMWxCUTJwQ0xFOUJRVThzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVONlFpeERRVUZETEVOQlFVTTdVVUZEUml4clFrRkJZU3hIUVVGSExFTkJRVU1zVDBGQlpTeEZRVUZGTEVWQlFVVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVZHNSaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRKUVVNdlFpeERRVUZETzBOQlEwWWlmUT09IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFBsYXllciB9IGZyb20gXCIuL3BsYXllci9wbGF5ZXJcIjtcclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXBwKCkge1xyXG4gICAgZ2xvYmFsLkxvZ1ByaW50ID0gKHgpID0+IGNvbnNvbGUubG9nKFwiW1B1cnBsZV06IFwiLCB4KTtcclxuICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZSkgPT4ge1xyXG4gICAgICAgIGdsb2JhbC5vbkV2ZW50TWVzc2FnZShlKTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcigpO1xyXG4gICAgZ2xvYmFsLnJlYWxGZXRjaCA9IGdsb2JhbC5mZXRjaDtcclxuICAgIGdsb2JhbC5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICBwbGF5ZXIuaW5mbGF0ZUZldGNoKCk7XHJcbiAgICBnbG9iYWwuTG9nUHJpbnQoXCJTY3JpcHQgcnVubmluZ1wiKTtcclxufVxyXG5hcHAoKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xuZHZjbXRsY2k1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1TDNOeVl5OWhjSEF1ZDI5eWEyVnlMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNUVUZCVFN4cFFrRkJhVUlzUTBGQlF6dEJRVk42UXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhWUVVGVkxFZEJRVWM3U1VGRGVrSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1IwRkJSeXhEUVVGRExFTkJRVTBzUlVGQlJTeEZRVUZGTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhaUVVGWkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZETTBRc1RVRkJUU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRk5CUVZNc1JVRkJSU3hEUVVGRExFTkJRVTBzUlVGQlJTeEZRVUZGTzFGQlF6VkRMRTFCUVUwc1EwRkJReXhqUVVGakxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTVUZETTBJc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRlNDeE5RVUZOTEUxQlFVMHNSMEZCUnl4SlFVRkpMRTFCUVUwc1JVRkJSU3hEUVVGRE8wbEJSVFZDTEUxQlFVMHNRMEZCUXl4VFFVRlRMRWRCUVVjc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF6dEpRVU5vUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF6dEpRVVYyUWl4TlFVRk5MRU5CUVVNc1dVRkJXU3hGUVVGRkxFTkJRVU03U1VGRGRFSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4RFFVRkRPMEZCUTNCRExFTkJRVU03UVVGRFJDeEhRVUZITEVWQlFVVXNRMEZCUXlKOSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==