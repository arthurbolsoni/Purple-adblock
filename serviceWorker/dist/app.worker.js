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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hscy9ITFMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLEdBQUc7SUFBaEI7UUFDVSxZQUFPLEdBQWtCLENBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLHlCQUF5QixFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDOUcsY0FBUyxHQUFtQixFQUFFLENBQUM7UUFDL0IsY0FBUyxHQUFHLENBQUMsQ0FBQztJQXdFeEIsQ0FBQztJQXRFQyxlQUFlLENBQUMsUUFBZ0IsSUFBRyxDQUFDO0lBRXBDLFdBQVcsQ0FBQyxRQUFnQixFQUFFLFdBQW9CLEtBQUs7UUFDckQsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFcEIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUzQiwyREFBMkQ7UUFDM0QsS0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUU7WUFDckIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUMvQixTQUFTO3FCQUNWO2lCQUNGO2dCQUNELG9CQUFvQjtnQkFDcEIsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUNsQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FDM0gsQ0FBQztnQkFFRixtQ0FBbUM7Z0JBQ25DLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7b0JBQ3BDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQztnQkFDMUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsc0RBQXNEO2dCQUN0RCxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtvQkFDYixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzt3QkFDbEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUM1QixTQUFTLEVBQUUsaUJBQWlCO3dCQUM1QixJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUM1QixDQUFDLENBQUM7b0JBQ0gsT0FBTyxHQUFHLElBQUksQ0FBQztpQkFDaEI7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7b0JBQ2pDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3hCO2FBQ0Y7U0FDRjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxRQUFRLEdBQVcsRUFBRSxDQUFDO1FBRTFCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BHLE9BQU8sQ0FDTCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUk7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUk7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUk7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxTQUFTO1lBQ2QsSUFBSTtZQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2YsSUFBSTtZQUNKLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2YsSUFBSTtZQUNKLFFBQVEsQ0FDVCxDQUFDO0lBQ0osQ0FBQztDQUNGIn0=

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
                                    console.log(playlist);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsYXllci9wbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxPQUFPLEVBQWMsTUFBTSw0QkFBNEIsQ0FBQztBQUVqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTFDLE1BQU0sT0FBTyxNQUFNO0lBVWpCO1FBVEEsZUFBVSxHQUFhLEVBQUUsQ0FBQztRQUMxQixrQkFBYSxHQUFXLEVBQUUsQ0FBQztRQUMzQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBRW5CLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFDckIsYUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFFM0IsWUFBTyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7UUFNOUIsZUFBVSxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztRQUN0QixhQUFRLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO1FBRXBCLFVBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxjQUF1QixLQUFLLEVBQUUsRUFBRTtZQUNsRCxnSkFBZ0o7WUFDaEosTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsV0FBVztnQkFBRSxPQUFPLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksR0FBRyxJQUFJLEdBQUc7Z0JBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3JELElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHO2dCQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcs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

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbS9zdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNqQyxPQUFPLEVBQUUsT0FBTyxFQUFjLE1BQU0sb0JBQW9CLENBQUM7QUFDekQsT0FBTyxFQUFjLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXJFLE1BQU0sT0FBTyxNQUFNO0lBVWpCLFlBQVksV0FBbUIsRUFBRSxTQUFpQixFQUFFO1FBVHBELGVBQVUsR0FBbUIsRUFBRSxDQUFDO1FBQ2hDLFFBQUcsR0FBUSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBRXpCLFdBQU0sR0FBRyxDQUFDLDZDQUE2QyxFQUFFLDZDQUE2QyxDQUFDLENBQUM7UUFDeEcsa0JBQWEsR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZDLGdDQUEyQixHQUFHLENBQUMsVUFBc0IsRUFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTRFbkksc0JBQWlCLEdBQUcsR0FBUyxFQUFFO1lBQzdCLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQjtRQUNILENBQUMsQ0FBQSxDQUFDO1FBN0VBLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksTUFBTTtZQUFFLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFFRCxvREFBb0Q7SUFDOUMsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsT0FBTyxFQUFFLEdBQUcsR0FBRyxJQUFJOztZQUMxRCxNQUFNLGVBQWUsR0FBaUIsRUFBRSxDQUFDO1lBQ3pDLElBQUksWUFBb0MsQ0FBQztZQUV6QyxNQUFNLEtBQUssR0FBRyxxRkFBcUYsQ0FBQztZQUVwRyxPQUFPLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2pELGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQzFFO1lBRUQsTUFBTSxVQUFVLEdBQWlCLElBQUksWUFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3RHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRWpDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1IsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDeEI7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7S0FBQTtJQUVLLFNBQVM7O1lBQ2IsTUFBTSxLQUFLLEdBQUcsNkRBQTZELENBQUM7WUFFNUUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM1QixJQUFJLENBQUMsVUFBVTtxQkFDWixNQUFNLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO3FCQUNsQyxPQUFPLENBQUMsQ0FBTyxDQUFNLEVBQUUsRUFBRTtvQkFDeEIsTUFBTSxLQUFLLEdBQTJCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkUsSUFBSSxLQUFLLEVBQUU7d0JBQ1QsSUFBSTs0QkFDRixNQUFNLEtBQUssQ0FBQywrQkFBK0IsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN6RSxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQzs0QkFDYixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQ2Y7d0JBQUMsV0FBTTs0QkFDTixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7eUJBQ2hCO3FCQUNGO3lCQUFNO3dCQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDaEI7Z0JBQ0gsQ0FBQyxDQUFBLENBQUM7b0JBQ0YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUFBO0lBRUQsa0NBQWtDO0lBQzVCLGNBQWMsQ0FBQyxlQUF3QixLQUFLOztZQUNoRCxJQUFJLFlBQVk7Z0JBQUUsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RELElBQUk7Z0JBQ0YsTUFBTSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLFFBQVEsR0FBYSxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUVqSCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtvQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO2lCQUMzRDtnQkFFRCxNQUFNLElBQUksR0FBVyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFM0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUV2QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVoRCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsTUFBTSxDQUFDLFFBQVEsQ0FBQyx5Q0FBeUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ2hGLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7UUFDSCxDQUFDO0tBQUE7SUFRRCw0QkFBNEI7SUFDdEIsWUFBWSxDQUFDLE1BQWtCOztZQUNuQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJO2dCQUFFLE9BQU8sTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFN0UsSUFBSTtnQkFDRixNQUFNLEtBQUssR0FDVCx1ZkFBdWYsQ0FBQztnQkFDMWYsTUFBTSxJQUFJLEdBQUc7b0JBQ1gsYUFBYSxFQUFFLDhCQUE4QjtvQkFDN0MsS0FBSyxFQUFFLEtBQUs7b0JBQ1osU0FBUyxFQUFFO3dCQUNULE1BQU0sRUFBRSxJQUFJO3dCQUNaLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVzt3QkFDdkIsS0FBSyxFQUFFLEtBQUs7d0JBQ1osS0FBSyxFQUFFLEVBQUU7d0JBQ1QsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO3FCQUM5QjtpQkFDRixDQUFDO2dCQUVGLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQywyQkFBMkIsRUFBRTtvQkFDOUQsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFFLGdDQUFnQyxFQUFFO29CQUMxRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7aUJBQzNCLENBQUMsQ0FBQztnQkFDSCxNQUFNLGdCQUFnQixHQUFRLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUUvQyxNQUFNLEdBQUcsR0FDUCwwQ0FBMEM7b0JBQzFDLElBQUksQ0FBQyxXQUFXO29CQUNoQiw0Q0FBNEM7b0JBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQztvQkFDL0IsZ0dBQWdHO29CQUNoRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUztvQkFDekQsK0JBQStCO29CQUMvQixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDO2dCQUN4RCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXhELE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVoRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXRDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7UUFDSCxDQUFDO0tBQUE7Q0FDRiJ9

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQzs7Ozs7O1VDZjNDO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7QUNOeUM7QUFDMUI7QUFDZixJQUFJLHFCQUFNO0FBQ1YsSUFBSSxxQkFBTTtBQUNWLFFBQVEscUJBQU07QUFDZCxLQUFLO0FBQ0wsdUJBQXVCLGtEQUFNO0FBQzdCLElBQUkscUJBQU0sYUFBYSxxQkFBTTtBQUM3QixJQUFJLHFCQUFNO0FBQ1Y7QUFDQSxJQUFJLHFCQUFNO0FBQ1Y7QUFDQTtBQUNBLDJDQUEyQywyMEIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaGxzL0hMUy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGxheWVyL21lc3NhZ2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BsYXllci9wbGF5ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0cmVhbS9zdHJlYW0udHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0cmVhbS90eXBlL3N0cmVhbS50eXBlLnRzIiwid2VicGFjazovLy8uL3NyYy9zdHJlYW0vdHlwZS9zdHJlYW1TZXJ2ZXIudHlwZXMudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC53b3JrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEhMUyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBbXCIjRVhUTTNVXCIsIFwiI0VYVC1YLVZFUlNJT046M1wiLCBcIiNFWFQtWC1UQVJHRVREVVJBVElPTjo2XCIsIFwiI0VYVC1YLU1FRElBLVNFUVVFTkNFOlwiXTtcclxuICAgICAgICB0aGlzLl9wbGF5bGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3NlcXVlbmNlID0gMDtcclxuICAgIH1cclxuICAgIGFkZFBsYXlsaXN0VGVzdChwbGF5bGlzdCkgeyB9XHJcbiAgICBhZGRQbGF5bGlzdChwbGF5bGlzdCwgYWxsb3dBZHMgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmIChwbGF5bGlzdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBwbGF5bGlzdC50b1N0cmluZygpLnNwbGl0KC9bXFxyXFxuXS8pO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls0XSA9IGxpbmVzWzRdO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls1XSA9IGxpbmVzWzVdO1xyXG4gICAgICAgIC8vdGFrZSBhbGwgbTN1OSBjb250ZW50IHRvIHRoZSBwbGF5bGlzdCBhbmQgYnVpbGQgYSB2YXJpYmxlXHJcbiAgICAgICAgZm9yIChjb25zdCBpIGluIGxpbmVzKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5lc1tpXS5pbmNsdWRlcyhcIiNFWFRJTkZcIikpIHtcclxuICAgICAgICAgICAgICAgIGlmICghYWxsb3dBZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWxpbmVzW2ldLmluY2x1ZGVzKFwiLGxpdmVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy90aW1lc3RhbXAgc2VxdWVuY2VcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcXVlbmNlVGltZXN0YW1wID0gTWF0aC5mbG9vcihuZXcgRGF0ZShsaW5lc1twYXJzZUludChpKSAtIDFdLnNsaWNlKGxpbmVzW3BhcnNlSW50KGkpIC0gMV0ubGVuZ3RoIC0gMjQsIGxpbmVzW3BhcnNlSW50KGkpIC0gMV0ubGVuZ3RoKSkuZ2V0VGltZSgpIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICAvL3NlbGVjdCBhbGwgc2VxdWVuY2UgdGhhdCBubyBleGlzdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuX3BsYXlsaXN0LmZpbHRlcigoeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWVzdGFtcCA+PSBzZXF1ZW5jZVRpbWVzdGFtcDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy9hZGQgdGhlIHNlcXVlbmNlIG9uIHBsYXlsaXN0IHZhcmlhYmxlIGlmIGl0IG5vIGV4aXN0XHJcbiAgICAgICAgICAgICAgICBpZiAoIXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSB0aGlzLl9zZXF1ZW5jZSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGxpbmVzW3BhcnNlSW50KGkpIC0gMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogc2VxdWVuY2VUaW1lc3RhbXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm86IGxpbmVzW3BhcnNlSW50KGkpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBsaW5lc1twYXJzZUludChpKSArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuX3BsYXlsaXN0Lmxlbmd0aCA+IDE1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hhbmdlZDtcclxuICAgIH1cclxuICAgIGdldFBsYXlsaXN0KCkge1xyXG4gICAgICAgIGxldCBwbGF5bGlzdCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5fcGxheWxpc3QuZm9yRWFjaCgoeCkgPT4gKHBsYXlsaXN0ID0gcGxheWxpc3QgKyB4LnRpbWUgKyBcIlxcblwiICsgeC5pbmZvICsgXCJcXG5cIiArIHgudXJsICsgXCJcXG5cIikpO1xyXG4gICAgICAgIHJldHVybiAodGhpcy5faGVhZGVyWzBdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclsxXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMl0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzNdICtcclxuICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzRdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls1XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICBwbGF5bGlzdCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU0V4VExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDJoc2N5OUlURk11ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4UFFVRlBMRWRCUVVjN1NVRkJhRUk3VVVGRFZTeFpRVUZQTEVkQlFXdENMRU5CUVVNc1UwRkJVeXhGUVVGRkxHdENRVUZyUWl4RlFVRkZMSGxDUVVGNVFpeEZRVUZGTEhkQ1FVRjNRaXhEUVVGRExFTkJRVU03VVVGRE9VY3NZMEZCVXl4SFFVRnRRaXhGUVVGRkxFTkJRVU03VVVGREwwSXNZMEZCVXl4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVhkRmVFSXNRMEZCUXp0SlFYUkZReXhsUVVGbExFTkJRVU1zVVVGQlowSXNTVUZCUnl4RFFVRkRPMGxCUlhCRExGZEJRVmNzUTBGQlF5eFJRVUZuUWl4RlFVRkZMRmRCUVc5Q0xFdEJRVXM3VVVGRGNrUXNTVUZCU1N4UlFVRlJMRXRCUVVzc1NVRkJTU3hGUVVGRk8xbEJRM0pDTEU5QlFVOHNTMEZCU3l4RFFVRkRPMU5CUTJRN1VVRkZSQ3hKUVVGSkxFOUJRVThzUjBGQlJ5eExRVUZMTEVOQlFVTTdVVUZGY0VJc1RVRkJUU3hMUVVGTExFZEJRVWNzVVVGQlVTeERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVU5zUkN4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVNelFpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVXpRaXd5UkVGQk1rUTdVVUZETTBRc1MwRkJTeXhOUVVGTkxFTkJRVU1zU1VGQlNTeExRVUZMTEVWQlFVVTdXVUZEY2tJc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1EwRkJReXhGUVVGRk8yZENRVU5vUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRk8yOUNRVU5pTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPM2RDUVVNdlFpeFRRVUZUTzNGQ1FVTldPMmxDUVVOR08yZENRVU5FTEc5Q1FVRnZRanRuUWtGRGNFSXNUVUZCVFN4cFFrRkJhVUlzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVTnNReXhKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1IwRkJSeXhGUVVGRkxFVkJRVVVzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGRE0wZ3NRMEZCUXp0blFrRkZSaXh0UTBGQmJVTTdaMEpCUTI1RExFMUJRVTBzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVTdiMEpCUTNCRExFOUJRVThzUTBGQlF5eERRVUZETEZOQlFWTXNTVUZCU1N4cFFrRkJhVUlzUTBGQlF6dG5Ra0ZETVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEwZ3NjMFJCUVhORU8yZENRVU4wUkN4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUlVGQlJUdHZRa0ZEWWl4SlFVRkpMRU5CUVVNc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eFRRVUZUTEVkQlFVY3NRMEZCUXl4RFFVRkRPMjlDUVVOd1F5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJRenQzUWtGRGJFSXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPM2RDUVVNMVFpeFRRVUZUTEVWQlFVVXNhVUpCUVdsQ08zZENRVU0xUWl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRlRUlzUjBGQlJ5eEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzNGQ1FVTTFRaXhEUVVGRExFTkJRVU03YjBKQlEwZ3NUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJRenRwUWtGRGFFSTdaMEpCUTBRc1QwRkJUeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNSMEZCUnl4RlFVRkZMRVZCUVVVN2IwSkJRMnBETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03YVVKQlEzaENPMkZCUTBZN1UwRkRSanRSUVVORUxFOUJRVThzVDBGQlR5eERRVUZETzBsQlEycENMRU5CUVVNN1NVRkZSQ3hYUVVGWE8xRkJRMVFzU1VGQlNTeFJRVUZSTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUlRGQ0xFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEZGQlFWRXNSMEZCUnl4UlFVRlJMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRM0JITEU5QlFVOHNRMEZEVEN4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVa3NRMEZCUXl4VFFVRlRPMWxCUTJRc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xGRkJRVkVzUTBGRFZDeERRVUZETzBsQlEwb3NRMEZCUXp0RFFVTkdJbjA9IiwiZXhwb3J0IGNsYXNzIFBsYXllck1lc3NhZ2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5nZXRRdWFsaXR5ID0gKCkgPT4gZ2xvYmFsLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJnZXRRdWFsaXR5XCIgfSk7XHJcbiAgICAgICAgdGhpcy5pbml0ID0gKCkgPT4gZ2xvYmFsLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJpbml0XCIgfSk7XHJcbiAgICAgICAgdGhpcy5wYXVzZSA9ICgpID0+IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwicGF1c2VcIiB9KTtcclxuICAgICAgICB0aGlzLnBsYXkgPSAoKSA9PiBnbG9iYWwucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInBsYXlcIiB9KTtcclxuICAgICAgICB0aGlzLnBhdXNlQW5kUGxheSA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaXNMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnF1YWxpdHkgPSBcIlwiO1xyXG4gICAgICAgIGdsb2JhbC5vbkV2ZW50TWVzc2FnZSA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIHZhciBteU1lc3NhZ2UgPSBuZXcgTWVzc2FnZUV2ZW50KCd3b3JrZXInLCB7IGRhdGE6ICdoZWxsbycgfSk7XHJcbiAgICAgICAgICAgIC8vIGlmIChnbG9iYWwub25tZXNzYWdlKSBnbG9iYWwub25tZXNzYWdlKHRoaXMsIG15TWVzc2FnZSk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZS5kYXRhLmZ1bmNOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiQnVmZmVyaW5nXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJvbkNsaWVudFNpbmtQbGF5aW5nXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJvbkNsaWVudFNpbmtVcGRhdGVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInBhdXNlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJwbGF5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJSZWFkeVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiUGxheWluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwic2V0UXVhbGl0eVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuZGF0YS5hcmdzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1YWxpdHkgPSBlLmRhdGEuYXJnc1swXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLmRhdGEudmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVhbGl0eSA9IGUuZGF0YS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJzZXRTZXR0aW5nXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmcgPSBlLmRhdGEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWJXVnpjMkZuWlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTl3YkdGNVpYSXZiV1Z6YzJGblpTNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4TlFVRk5MRTlCUVU4c1lVRkJZVHRKUVdkQ2VFSTdVVUZtUVN4bFFVRlZMRWRCUVVjc1IwRkJSeXhGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3haUVVGWkxFVkJRVVVzUTBGQlF5eERRVUZETzFGQlF6bEVMRk5CUVVrc1IwRkJSeXhIUVVGSExFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEYkVRc1ZVRkJTeXhIUVVGSExFZEJRVWNzUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzVDBGQlR5eEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTndSQ3hUUVVGSkxFZEJRVWNzUjBGQlJ5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeE5RVUZOTEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUTJ4RUxHbENRVUZaTEVkQlFVY3NSMEZCUnl4RlFVRkZPMWxCUTJ4Q0xFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0WlFVTmlMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVU5rTEVOQlFVTXNRMEZCUXp0UlFVVkdMR0ZCUVZFc1IwRkJSeXhMUVVGTExFTkJRVU03VVVGRmFrSXNXVUZCVHl4SFFVRlhMRVZCUVVVc1EwRkJRenRSUVV0dVFpeE5RVUZOTEVOQlFVTXNZMEZCWXl4SFFVRkhMRU5CUVVNc1EwRkJUU3hGUVVGRkxFVkJRVVU3V1VGRGFrTXNhVVZCUVdsRk8xbEJSV3BGTERKRVFVRXlSRHRaUVVVelJDeFJRVUZSTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRk8yZENRVU4yUWl4TFFVRkxMRmRCUVZjc1EwRkJReXhEUVVGRE8yOUNRVU5vUWl4TlFVRk5PMmxDUVVOUU8yZENRVU5FTEV0QlFVc3NjVUpCUVhGQ0xFTkJRVU1zUTBGQlF6dHZRa0ZETVVJc1RVRkJUVHRwUWtGRFVEdG5Ra0ZEUkN4TFFVRkxMRzlDUVVGdlFpeERRVUZETEVOQlFVTTdiMEpCUTNwQ0xFMUJRVTA3YVVKQlExQTdaMEpCUTBRc1MwRkJTeXhQUVVGUExFTkJRVU1zUTBGQlF6dHZRa0ZEV2l4TlFVRk5PMmxDUVVOUU8yZENRVU5FTEV0QlFVc3NUVUZCVFN4RFFVRkRMRU5CUVVNN2IwSkJRMWdzVFVGQlRUdHBRa0ZEVUR0blFrRkRSQ3hMUVVGTExFOUJRVThzUTBGQlF5eERRVUZETzI5Q1FVTmFMRTFCUVUwN2FVSkJRMUE3WjBKQlEwUXNTMEZCU3l4VFFVRlRMRU5CUVVNc1EwRkJRenR2UWtGRFpDeE5RVUZOTzJsQ1FVTlFPMmRDUVVORUxFdEJRVXNzV1VGQldTeERRVUZETEVOQlFVTTdiMEpCUTJwQ0xFbEJRVWtzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpPM2RDUVVGRkxFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRPMjlDUVVOd1JDeEpRVUZKTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTenQzUWtGQlJTeEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETzI5Q1FVTTVReXhOUVVGTk8ybENRVU5RTzJkQ1FVTkVMRXRCUVVzc1dVRkJXU3hEUVVGRExFTkJRVU03YjBKQlEycENMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNN2IwSkJRelZDTEUxQlFVMDdhVUpCUTFBN1owSkJRMFFzVDBGQlR5eERRVUZETEVOQlFVTTdiMEpCUTFBc1RVRkJUVHRwUWtGRFVEdGhRVU5HTzFGQlEwZ3NRMEZCUXl4RFFVRkRPMGxCUTBvc1EwRkJRenREUVVOR0luMD0iLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn07XHJcbmltcG9ydCB7IFN0cmVhbSB9IGZyb20gXCIuLi9zdHJlYW0vc3RyZWFtXCI7XHJcbmltcG9ydCB7IHN0cmVhbXMgfSBmcm9tIFwiLi4vc3RyZWFtL3R5cGUvc3RyZWFtLnR5cGVcIjtcclxuaW1wb3J0IHsgUGxheWVyTWVzc2FnZSB9IGZyb20gXCIuL21lc3NhZ2VcIjtcclxuZXhwb3J0IGNsYXNzIFBsYXllciB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnN0cmVhbUxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLmFjdHVhbENoYW5uZWwgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMucGxheWluZ0FkcyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucXVhbGl0eSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5Mb2dQcmludCA9IGdsb2JhbC5Mb2dQcmludDtcclxuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBuZXcgUGxheWVyTWVzc2FnZSgpO1xyXG4gICAgICAgIHRoaXMub25TdGFydEFkcyA9ICgpID0+IHsgfTtcclxuICAgICAgICB0aGlzLm9uRW5kQWRzID0gKCkgPT4geyB9O1xyXG4gICAgICAgIHRoaXMuaXNBZHMgPSAoeCwgYWxsb3dDaGFuZ2UgPSBmYWxzZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBjb25zdCBhZHMgPSB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJzdGl0Y2hlZC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtY2xpZW50LWFkXCIpIHx8IHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInR3aXRjaC1hZC1xdWFydGlsZVwiKTtcclxuICAgICAgICAgICAgY29uc3QgYWRzID0geC50b1N0cmluZygpLmluY2x1ZGVzKFwic3RpdGNoZWRcIik7XHJcbiAgICAgICAgICAgIGlmICghYWxsb3dDaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5aW5nQWRzICE9IGFkcyAmJiBhZHMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uU3RhcnRBZHMoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWluZ0FkcyAhPSBhZHMgJiYgIWFkcylcclxuICAgICAgICAgICAgICAgIHRoaXMub25FbmRBZHMoKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5aW5nQWRzID0gYWRzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wbGF5aW5nQWRzO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U3RyZWFtID0gKGNoYW5uZWwgPSB0aGlzLmFjdHVhbENoYW5uZWwpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtTGlzdC5maW5kKCh4KSA9PiB4LmNoYW5uZWxOYW1lID09PSBjaGFubmVsKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMubWVzc2FnZS5pbml0KCk7XHJcbiAgICB9XHJcbiAgICBvbmZldGNoKHVybCwgcmVzcG9uc2UpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50U3RyZWFtID0geWllbGQgdGhpcy5jdXJyZW50U3RyZWFtKCk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTdHJlYW0uaGxzLmFkZFBsYXlsaXN0KHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQWRzKHJlc3BvbnNlLCB0cnVlKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWwgPSB5aWVsZCB0aGlzLmZldGNobTN1OEJ5U3RyZWFtVHlwZShzdHJlYW1zLmxvY2FsKTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2NhbClcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChsb2NhbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsKVxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdHJlYW0uc3RyZWFtQWNjZXNzKHN0cmVhbXMubG9jYWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGljdHVyZSA9IHlpZWxkIHRoaXMuZmV0Y2htM3U4QnlTdHJlYW1UeXBlKHN0cmVhbXMucGljdHVyZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocGljdHVyZSlcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChwaWN0dXJlKTtcclxuICAgICAgICAgICAgICAgIGlmIChwaWN0dXJlKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXh0ZXJuYWwgPSB5aWVsZCB0aGlzLmZldGNobTN1OEJ5U3RyZWFtVHlwZShzdHJlYW1zLmV4dGVybmFsKTtcclxuICAgICAgICAgICAgICAgIGlmIChleHRlcm5hbClcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChleHRlcm5hbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZXJuYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxcIik7XHJcbiAgICAgICAgICAgICAgICAvL2lmIG5vdCByZXNvbHZlIHJldHVybiB0aGUgNDgwcCB0byB0aGUgdXNlci5cclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdHJlYW0uaGxzLmFkZFBsYXlsaXN0KGxvY2FsLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmZXRjaG0zdThCeVN0cmVhbVR5cGUoYWNjZXNzVHlwZSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJTdHJlYW0gVHlwZTogXCIgKyBhY2Nlc3NUeXBlLm5hbWUpO1xyXG4gICAgICAgICAgICAvL2ZpbHRlciBhbGwgc2VydmVyIGJ5IHR5cGVcclxuICAgICAgICAgICAgY29uc3Qgc2VydmVycyA9IHRoaXMuY3VycmVudFN0cmVhbSgpLmdldFN0cmVhbVNlcnZlckJ5U3RyZWFtVHlwZShhY2Nlc3NUeXBlKTtcclxuICAgICAgICAgICAgaWYgKCFzZXJ2ZXJzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgICAgIC8vZmlsdGVyIGFsbCBzZXJ2ZXIgdXJsIGJ5IHF1YWxpdHkgb3IgYmVzdHF1YWxpdHlcclxuICAgICAgICAgICAgdmFyIHN0cmVhbVVybExpc3QgPSBzZXJ2ZXJzLm1hcCgoeCkgPT4geC5maW5kQnlRdWFsaXR5KHRoaXMubWVzc2FnZS5xdWFsaXR5KSkuZmlsdGVyKCh4KSA9PiB4ICE9PSB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICBpZiAoIXN0cmVhbVVybExpc3QubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgc3RyZWFtVXJsTGlzdCA9IHNlcnZlcnMubWFwKCh4KSA9PiB4LmJlc3RRdWFsaXR5KCkpO1xyXG4gICAgICAgICAgICAvL2J5IHRoZSBhcnJheSBvcmRlciwgdHJ5IGdldCBtM3U4IGNvbnRlbnQgYW5kIHJldHVybiBpZiBkb24ndCBoYXZlIGFkcy5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBzdHJlYW1Vcmwgb2Ygc3RyZWFtVXJsTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHlpZWxkICh5aWVsZCBnbG9iYWwucmVhbEZldGNoKHN0cmVhbVVybCA9PT0gbnVsbCB8fCBzdHJlYW1VcmwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHN0cmVhbVVybC51cmwpKS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0Fkcyh0ZXh0KSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgb25TdGFydENoYW5uZWwodXJsLCB0ZXh0KSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgY29uc3QgY2hhbm5lbE5hbWUgPSAvaGxzXFwvKC4qKS5tM3U4L2dtLmV4ZWModXJsKSB8fCBbXTtcclxuICAgICAgICAgICAgbGV0IHN0cmVhbTtcclxuICAgICAgICAgICAgbGV0IGV4aXN0ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCB3aGl0ZWxpc3QgPSBbXTtcclxuICAgICAgICAgICAgaWYgKCFjaGFubmVsTmFtZVsxXSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5hY3R1YWxDaGFubmVsID0gY2hhbm5lbE5hbWVbMV07XHJcbiAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJDaGFubmVsIFwiICsgY2hhbm5lbE5hbWVbMV0pO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMubWVzc2FnZS5zZXR0aW5nID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2Uuc2V0dGluZy53aGl0ZWxpc3QgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpdGVsaXN0ID0gdGhpcy5tZXNzYWdlLnNldHRpbmcud2hpdGVsaXN0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3aGl0ZWxpc3QuaW5jbHVkZXMoY2hhbm5lbE5hbWVbMV0pKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RyZWFtTGlzdC5maW5kKChjKSA9PiBjLmNoYW5uZWxOYW1lID09PSBjaGFubmVsTmFtZVsxXSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwcm94eVVybCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tZXNzYWdlLnNldHRpbmcpXHJcbiAgICAgICAgICAgICAgICAgICAgcHJveHlVcmwgPSB0aGlzLm1lc3NhZ2Uuc2V0dGluZy5wcm94eVVybCA/IHRoaXMubWVzc2FnZS5zZXR0aW5nLnByb3h5VXJsIDogXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RyZWFtTGlzdC5wdXNoKG5ldyBTdHJlYW0oY2hhbm5lbE5hbWVbMV0sIHByb3h5VXJsKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkxvZ1ByaW50KFwiRXhpc3Q6IFwiICsgY2hhbm5lbE5hbWVbMV0pO1xyXG4gICAgICAgICAgICAgICAgZXhpc3RlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0cmVhbSA9IHRoaXMuY3VycmVudFN0cmVhbSgpO1xyXG4gICAgICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICAgICAgICAgIHlpZWxkIHN0cmVhbS5hZGRTdHJlYW1MaW5rKHRleHQsIFwibG9jYWxcIiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgICAgICAgICBzdHJlYW0uc3RyZWFtQWNjZXNzKHN0cmVhbXMubG9jYWwpO1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RlbnQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIC8vaWYgdGhlIHByb3h5IG9wdGlvbiBvbiBwb3B1cCBpcyBkaXNhYmxlZCwgaXQgaXMgbmV2ZXIgY2FsbGVkLlxyXG4gICAgICAgICAgICBpZiAodGhpcy5tZXNzYWdlLnNldHRpbmcpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1lc3NhZ2Uuc2V0dGluZy50b2dnbGVQcm94eSA9PSBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyZWFtLnRyeUV4dGVybmFsUGxheWVyKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGluZmxhdGVGZXRjaCgpIHtcclxuICAgICAgICAvL2VzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10aGlzLWFzc2lnblxyXG4gICAgICAgIGdsb2JhbC5mZXRjaCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5lbmRzV2l0aChcIm0zdThcIikgJiYgdXJsLmluY2x1ZGVzKFwidHR2bncubmV0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIGdsb2JhbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVhbEZldGNoKHVybCwgb3B0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7IHJldHVybiByZXNwb25zZS50ZXh0KCk7IH0pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigodGV4dCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NlbmQgdGhlIGZsb3cgc3RyZWFtIHRvIHNjcmlwdCB2YWxpdG9yIGFuZCBjbGFzc2lmaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIGdsb2JhbC5wbGF5ZXIub25mZXRjaCh1cmwsIHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWxpc3QgPSBnbG9iYWwucGxheWVyLmN1cnJlbnRTdHJlYW0oKS5obHMuZ2V0UGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocGxheWxpc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShwbGF5bGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChfYSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoXCJ1c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiKSAmJiAhdXJsLmluY2x1ZGVzKFwicGljdHVyZS1ieS1waWN0dXJlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcy5Mb2dQcmludChcImNoYW5uZWwgb2ZmbGluZVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UudGV4dCgpLnRoZW4oKHRleHQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZ2xvYmFsLnBsYXllci5vblN0YXJ0Q2hhbm5lbCh1cmwsIHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSh0ZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKF9iKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcyhcInBpY3R1cmUtYnktcGljdHVyZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkxvZ1ByaW50KFwicGljdHVyZS1ieS1waWN0dXJlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdsb2JhbC5yZWFsRmV0Y2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljR3hoZVdWeUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDNCc1lYbGxjaTl3YkdGNVpYSXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPMEZCUVVFc1QwRkJUeXhGUVVGRkxFMUJRVTBzUlVGQlJTeE5RVUZOTEd0Q1FVRnJRaXhEUVVGRE8wRkJRekZETEU5QlFVOHNSVUZCUlN4UFFVRlBMRVZCUVdNc1RVRkJUU3cwUWtGQk5FSXNRMEZCUXp0QlFVVnFSU3hQUVVGUExFVkJRVVVzWVVGQllTeEZRVUZGTEUxQlFVMHNWMEZCVnl4RFFVRkRPMEZCUlRGRExFMUJRVTBzVDBGQlR5eE5RVUZOTzBsQlZXcENPMUZCVkVFc1pVRkJWU3hIUVVGaExFVkJRVVVzUTBGQlF6dFJRVU14UWl4clFrRkJZU3hIUVVGWExFVkJRVVVzUTBGQlF6dFJRVU16UWl4bFFVRlZMRWRCUVVjc1MwRkJTeXhEUVVGRE8xRkJSVzVDTEZsQlFVOHNSMEZCVnl4RlFVRkZMRU5CUVVNN1VVRkRja0lzWVVGQlVTeEhRVUZITEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNN1VVRkZNMElzV1VGQlR5eEhRVUZITEVsQlFVa3NZVUZCWVN4RlFVRkZMRU5CUVVNN1VVRk5PVUlzWlVGQlZTeEhRVUZITEVkQlFVY3NSVUZCUlN4SFFVRkZMRU5CUVVNc1EwRkJRenRSUVVOMFFpeGhRVUZSTEVkQlFVY3NSMEZCUnl4RlFVRkZMRWRCUVVVc1EwRkJReXhEUVVGRE8xRkJSWEJDTEZWQlFVc3NSMEZCUnl4RFFVRkRMRU5CUVZNc1JVRkJSU3hqUVVGMVFpeExRVUZMTEVWQlFVVXNSVUZCUlR0WlFVTnNSQ3huU2tGQlowbzdXVUZEYUVvc1RVRkJUU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dFpRVU01UXl4SlFVRkpMRU5CUVVNc1YwRkJWenRuUWtGQlJTeFBRVUZQTEVkQlFVY3NRMEZCUXp0WlFVTTNRaXhKUVVGSkxFbEJRVWtzUTBGQlF5eFZRVUZWTEVsQlFVa3NSMEZCUnl4SlFVRkpMRWRCUVVjN1owSkJRVVVzU1VGQlNTeERRVUZETEZWQlFWVXNSVUZCUlN4RFFVRkRPMWxCUTNKRUxFbEJRVWtzU1VGQlNTeERRVUZETEZWQlFWVXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSE8yZENRVUZGTEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVc1EwRkJRenRaUVVOd1JDeEpRVUZKTEVOQlFVTXNWVUZCVlN4SFFVRkhMRWRCUVVjc1EwRkJRenRaUVVWMFFpeFBRVUZQTEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNN1VVRkRla0lzUTBGQlF5eERRVUZETzFGQlJVWXNhMEpCUVdFc1IwRkJSeXhEUVVGRExGVkJRV3RDTEVsQlFVa3NRMEZCUXl4aFFVRmhMRVZCUVZVc1JVRkJSVHRaUVVNdlJDeFBRVUZQTEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlV5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1YwRkJWeXhMUVVGTExFOUJRVThzUTBGQlJTeERRVUZETzFGQlEzcEZMRU5CUVVNc1EwRkJRenRSUVc1Q1FTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8wbEJRM1JDTEVOQlFVTTdTVUZ2UWtzc1QwRkJUeXhEUVVGRExFZEJRVmNzUlVGQlJTeFJRVUZuUWpzN1dVRkRla01zVFVGQlRTeGhRVUZoTEVkQlFWY3NUVUZCVFN4SlFVRkpMRU5CUVVNc1lVRkJZU3hGUVVGRkxFTkJRVU03V1VGRGVrUXNZVUZCWVN4RFFVRkRMRWRCUVVjc1EwRkJReXhYUVVGWExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdXVUZGZUVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RlFVRkZMRWxCUVVrc1EwRkJRenRuUWtGQlJTeFBRVUZQTEVsQlFVa3NRMEZCUXp0WlFVVTNReXhKUVVGSk8yZENRVU5HTEUxQlFVMHNTMEZCU3l4SFFVRkhMRTFCUVUwc1NVRkJTU3hEUVVGRExIRkNRVUZ4UWl4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dG5Ra0ZET1VRc1NVRkJTU3hMUVVGTE8yOUNRVUZGTEdGQlFXRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1YwRkJWeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzJkQ1FVTm9SQ3hKUVVGSkxFTkJRVU1zUzBGQlN6dHZRa0ZCUlN4aFFVRmhMRU5CUVVNc1dVRkJXU3hEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0blFrRkRkRVFzU1VGQlNTeExRVUZMTzI5Q1FVRkZMRTlCUVU4c1NVRkJTU3hEUVVGRE8yZENRVVYyUWl4TlFVRk5MRTlCUVU4c1IwRkJSeXhOUVVGTkxFbEJRVWtzUTBGQlF5eHhRa0ZCY1VJc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdaMEpCUTJ4RkxFbEJRVWtzVDBGQlR6dHZRa0ZCUlN4aFFVRmhMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0blFrRkRjRVFzU1VGQlNTeFBRVUZQTzI5Q1FVRkZMRTlCUVU4c1NVRkJTU3hEUVVGRE8yZENRVVY2UWl4TlFVRk5MRkZCUVZFc1IwRkJSeXhOUVVGTkxFbEJRVWtzUTBGQlF5eHhRa0ZCY1VJc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdaMEpCUTNCRkxFbEJRVWtzVVVGQlVUdHZRa0ZCUlN4aFFVRmhMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0blFrRkRkRVFzU1VGQlNTeFJRVUZSTzI5Q1FVRkZMRTlCUVU4c1NVRkJTU3hEUVVGRE8yZENRVVV4UWl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzJkQ1FVTndRaXcyUTBGQk5rTTdaMEpCUXpkRExHRkJRV0VzUTBGQlF5eEhRVUZITEVOQlFVTXNWMEZCVnl4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dG5Ra0ZETTBNc1QwRkJUeXhKUVVGSkxFTkJRVU03WVVGRFlqdFpRVUZETEU5QlFVOHNRMEZCVFN4RlFVRkZPMmRDUVVObUxFOUJRVThzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8yRkJRM2hDTzFGQlEwZ3NRMEZCUXp0TFFVRkJPMGxCUlVzc2NVSkJRWEZDTEVOQlFVTXNWVUZCYzBJN08xbEJRMmhFTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1pVRkJaU3hIUVVGSExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVTnFSQ3d5UWtGQk1rSTdXVUZETTBJc1RVRkJUU3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNSVUZCUlN4RFFVRkRMREpDUVVFeVFpeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMWxCUXpkRkxFbEJRVWtzUTBGQlF5eFBRVUZQTzJkQ1FVRkZMRTlCUVU4c1JVRkJSU3hEUVVGRE8xbEJSWGhDTEdsRVFVRnBSRHRaUVVOcVJDeEpRVUZKTEdGQlFXRXNSMEZCUnl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1MwRkJTeXhUUVVGVExFTkJRVU1zUTBGQlF6dFpRVU0zUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFMUJRVTA3WjBKQlFVVXNZVUZCWVN4SFFVRkhMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF5eERRVUZETzFsQlJTOUZMSGRGUVVGM1JUdFpRVU40UlN4TFFVRkxMRTFCUVUwc1UwRkJVeXhKUVVGSkxHRkJRV0VzUlVGQlJUdG5Ra0ZEY2tNc1RVRkJUU3hKUVVGSkxFZEJRVmNzVFVGQlRTeERRVUZETEUxQlFVMHNUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhUUVVGVExHRkJRVlFzVTBGQlV5eDFRa0ZCVkN4VFFVRlRMRU5CUVVVc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0blFrRkRNMFVzU1VGQlNTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJRenR2UWtGQlJTeFRRVUZUTzJkQ1FVVXZRaXhQUVVGUExFbEJRVWtzUTBGQlF6dGhRVU5pTzFsQlEwUXNUMEZCVHl4RlFVRkZMRU5CUVVNN1VVRkRXaXhEUVVGRE8wdEJRVUU3U1VGRFN5eGpRVUZqTEVOQlFVTXNSMEZCVnl4RlFVRkZMRWxCUVZrN08xbEJRelZETEUxQlFVMHNWMEZCVnl4SFFVRjVRaXhyUWtGQmEwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFsQlF6ZEZMRWxCUVVrc1RVRkJZeXhEUVVGRE8xbEJRMjVDTEVsQlFVa3NVVUZCVVN4SFFVRkhMRXRCUVVzc1EwRkJRenRaUVVOeVFpeEpRVUZKTEZOQlFWTXNSMEZCWVN4RlFVRkZMRU5CUVVNN1dVRkZOMElzU1VGQlNTeERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1owSkJRVVVzVDBGQlR5eExRVUZMTEVOQlFVTTdXVUZGYkVNc1NVRkJTU3hEUVVGRExHRkJRV0VzUjBGQlJ5eFhRVUZYTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRjRU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4VlFVRlZMRWRCUVVjc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZGTTBNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4SlFVRkpMRk5CUVZNc1JVRkJSVHRuUWtGRGRFTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEZOQlFWTXNTVUZCU1N4VFFVRlRMRVZCUVVVN2IwSkJRMmhFTEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTTdhVUpCUXpWRE8yRkJRMFk3V1VGRlJDeEpRVUZKTEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVRkZMRTlCUVU4c1MwRkJTeXhEUVVGRE8xbEJSWEpFTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFWTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExGZEJRVmNzUzBGQlN5eFhRVUZYTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSVHRuUWtGRE1VVXNTVUZCU1N4UlFVRlJMRWRCUVVjc1JVRkJSU3hEUVVGRE8yZENRVU5zUWl4SlFVRkpMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR6dHZRa0ZCUlN4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF6dG5Ra0ZEZUVjc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4TlFVRk5MRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkROVVE3YVVKQlFVMDdaMEpCUTB3c1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eFRRVUZUTEVkQlFVY3NWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlF6RkRMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU03WVVGRGFrSTdXVUZGUkN4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJTeERRVUZETzFsQlF6bENMR2RFUVVGblJEdFpRVVZvUkN4blJFRkJaMFE3V1VGRGFFUXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXgxUWtGQmRVSXNRMEZCUXl4RFFVRkRPMWxCUTNaRExFMUJRVTBzVFVGQlRTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzFsQlEyaEVMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1EwRkJRenRaUVVWc1F5eE5RVUZOTEVOQlFVTXNXVUZCV1N4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFpRVVZ1UXl4SlFVRkpMRkZCUVZFN1owSkJRVVVzVDBGQlR6dFpRVVZ5UWl3clJFRkJLMFE3V1VGREwwUXNTVUZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUlVGQlJUdG5Ra0ZEZUVJc1NVRkJTU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4WFFVRlhMRWxCUVVrc1MwRkJTenR2UWtGQlJTeFBRVUZQTzJGQlEzWkVPMWxCUlVRc1RVRkJUU3hEUVVGRExHbENRVUZwUWl4RlFVRkZMRU5CUVVNN1dVRkZNMElzVDBGQlR6dFJRVU5VTEVOQlFVTTdTMEZCUVR0SlFVVkVMRmxCUVZrN1VVRkRWaXg1UTBGQmVVTTdVVUZEZWtNc1RVRkJUU3hEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZuUWl4SFFVRkhMRVZCUVVVc1QwRkJUenM3WjBKQlEzcERMRWxCUVVrc1QwRkJUeXhIUVVGSExFdEJRVXNzVVVGQlVTeEZRVUZGTzI5Q1FVTXpRaXhKUVVGSkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eFhRVUZYTEVOQlFVTXNSVUZCUlR0M1FrRkRja1FzVDBGQlR5eEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRlBMRTlCUVU4c1JVRkJSU3hOUVVGTkxFVkJRVVVzUlVGQlJUczBRa0ZETTBNc1NVRkJTVHRuUTBGRFJpeE5RVUZOTEUxQlFVMDdjVU5CUTFRc1UwRkJVeXhEUVVGRExFZEJRVWNzUlVGQlJTeFBRVUZQTEVOQlFVTTdjVU5CUTNaQ0xFbEJRVWtzUTBGQlF5eERRVUZQTEZGQlFXdENMRVZCUVVVc1JVRkJSU3huUkVGQlF5eFBRVUZCTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRU3hIUVVGQkxFTkJRVU03Y1VOQlEyNUVMRWxCUVVrc1EwRkJReXhEUVVGUExFbEJRVmtzUlVGQlJTeEZRVUZGTzI5RFFVTXpRaXd3UkVGQk1FUTdiME5CUXpGRUxFMUJRVTBzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1IwRkJSeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzI5RFFVVjJReXhKUVVGSkxGRkJRVkVzUjBGQlJ5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMR0ZCUVdFc1JVRkJSU3hEUVVGRExFZEJRVWNzUTBGQlF5eFhRVUZYTEVWQlFVVXNRMEZCUXp0dlEwRkRMMFFzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenR2UTBGRGRFSXNUMEZCVHl4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExGRkJRV1VzUTBGQlF5eERRVUZETEVOQlFVTTdaME5CUTNwRExFTkJRVU1zUTBGQlFTeERRVUZETEVOQlFVTTdOa0pCUTA0N05FSkJRVU1zVjBGQlRUdG5RMEZEVGl4UFFVRlBMRU5CUVVNc1NVRkJTU3hSUVVGUkxFVkJRVVVzUTBGQlF5eERRVUZET3paQ1FVTjZRanQzUWtGRFNDeERRVUZETEVOQlFVRXNRMEZCUXl4RFFVRkRPM0ZDUVVOS08yOUNRVVZFTEVsQlFVa3NSMEZCUnl4RFFVRkRMRkZCUVZFc1EwRkJReXhyUTBGQmEwTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eHZRa0ZCYjBJc1EwRkJReXhGUVVGRk8zZENRVU16Uml4UFFVRlBMRWxCUVVrc1QwRkJUeXhEUVVGRExFTkJRVThzVDBGQlR5eEZRVUZGTEUxQlFVMHNSVUZCUlN4RlFVRkZPelJDUVVNelF5eEpRVUZKTzJkRFFVTkdMRTFCUVUwc1VVRkJVU3hIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03WjBOQlEzUkVMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTzI5RFFVTm9RaXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdiME5CUTJ4Q0xHMURRVUZ0UXp0cFEwRkRjRU03WjBOQlJVUXNVVUZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZQTEVsQlFWa3NSVUZCUlN4RlFVRkZPMjlEUVVNeFF5eE5RVUZOTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFZEJRVWNzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0dlEwRkRPVU1zVDBGQlR5eERRVUZETEVsQlFVa3NVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03WjBOQlF6bENMRU5CUVVNc1EwRkJRU3hEUVVGRExFTkJRVU03TmtKQlEwbzdORUpCUVVNc1YwRkJUVHRuUTBGRFRpeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRVZCUVVVc1EwRkJReXhEUVVGRE96WkNRVU42UWp0M1FrRkRTQ3hEUVVGRExFTkJRVUVzUTBGQlF5eERRVUZETzNGQ1FVTktPMjlDUVVWRUxFbEJRVWtzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4dlFrRkJiMElzUTBGQlF5eEZRVUZGTzNkQ1FVTjBReXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEc5Q1FVRnZRaXhEUVVGRExFTkJRVU03ZDBKQlEzQkRMRTlCUVU4c1NVRkJTU3hSUVVGUkxFVkJRVVVzUTBGQlF6dHhRa0ZEZGtJN2FVSkJRMFk3WjBKQlJVUXNUMEZCVHl4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1dVRkRha1FzUTBGQlF6dFRRVUZCTEVOQlFVTTdTVUZEU2l4RFFVRkRPME5CUTBZaWZRPT0iLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn07XHJcbmltcG9ydCB7IEhMUyB9IGZyb20gXCIuLi9obHMvSExTXCI7XHJcbmltcG9ydCB7IHN0cmVhbXMgfSBmcm9tIFwiLi90eXBlL3N0cmVhbS50eXBlXCI7XHJcbmltcG9ydCB7IHN0cmVhbVNlcnZlciB9IGZyb20gXCIuL3R5cGUvc3RyZWFtU2VydmVyLnR5cGVzXCI7XHJcbmV4cG9ydCBjbGFzcyBTdHJlYW0ge1xyXG4gICAgY29uc3RydWN0b3IoY2hhbm5lbE5hbWUsIHR1bm5lbCA9IFwiXCIpIHtcclxuICAgICAgICB0aGlzLnNlcnZlckxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLmhscyA9IG5ldyBITFMoKTtcclxuICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gXCJcIjtcclxuICAgICAgICB0aGlzLnR1bm5lbCA9IFtcImh0dHBzOi8vZXUxLmp1cHRlci5nYS9jaGFubmVsL3tjaGFubmVsbmFtZX1cIiwgXCJodHRwczovL2V1Mi5qdXB0ZXIuZ2EvY2hhbm5lbC97Y2hhbm5lbG5hbWV9XCJdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFR1bm5lbCA9IHRoaXMudHVubmVsWzBdO1xyXG4gICAgICAgIHRoaXMuZ2V0U3RyZWFtU2VydmVyQnlTdHJlYW1UeXBlID0gKGFjY2Vzc1R5cGUpID0+IHRoaXMuc2VydmVyTGlzdC5maWx0ZXIoKHgpID0+IHgudHlwZSA9PSBhY2Nlc3NUeXBlLm5hbWUpO1xyXG4gICAgICAgIHRoaXMudHJ5RXh0ZXJuYWxQbGF5ZXIgPSAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghKHlpZWxkIHRoaXMuc3RyZWFtQWNjZXNzKHN0cmVhbXMuZXh0ZXJuYWwpKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRlcm5hbFBsYXllcih0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBjaGFubmVsTmFtZTtcclxuICAgICAgICBpZiAodHVubmVsKVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRUdW5uZWwgPSB0dW5uZWw7XHJcbiAgICB9XHJcbiAgICAvL2FkZCBtM3U4IGxpbmtzIHdpdGggcXVhbGl0eSB0byB0aGUgbGlzdCBvZiBzZXJ2ZXJzXHJcbiAgICBhZGRTdHJlYW1MaW5rKHRleHQsIHR5cGUgPSBcImxvY2FsXCIsIHNpZyA9IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGNhcHR1cmVBcnJheTtcclxuICAgICAgICAgICAgY29uc3QgUkVHRVggPSAvTkFNRT1cIigoPzpcXFMrXFxzK1xcUyt8XFxTKykpXCIsQVVUTyg/Ol58XFxTK1xccyspKD86XnxcXFMrXFxzKykoaHR0cHM6XFwvXFwvdmlkZW8oXFxTKykubTN1OCkvZztcclxuICAgICAgICAgICAgd2hpbGUgKChjYXB0dXJlQXJyYXkgPSBSRUdFWC5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcXVhbGl0eVVybFNwbGl0LnB1c2goeyBxdWFsaXR5OiBjYXB0dXJlQXJyYXlbMV0sIHVybDogY2FwdHVyZUFycmF5WzJdIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSBuZXcgc3RyZWFtU2VydmVyKHsgdHlwZTogdHlwZSwgdXJsTGlzdDogcXVhbGl0eVVybFNwbGl0LCBzaWc6IHNpZyB9KTtcclxuICAgICAgICAgICAgdGhpcy5zZXJ2ZXJMaXN0LnB1c2goc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgICAgIGlmICghc2lnKSB7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLnNpZ25hdHVyZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc2lnbmF0dXJlKCkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFJFR0VYID0gL3ZpZGVvLXdlYXZlci4oLiopLmhscy50dHZudy5uZXRcXC92MVxcL3BsYXlsaXN0XFwvKC4qKS5tM3U4JC9nbTtcclxuICAgICAgICAgICAgeWllbGQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VydmVyTGlzdFxyXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKHgpID0+IHguc2lnID09IGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKCh4KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBSRUdFWC5leGVjKHgudXJsTGlzdFswXS51cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgZmV0Y2goXCJodHRwczovL2p1cHRlci5nYS9obHMvdjIvc2lnL1wiICsgbWF0Y2hbMl0gKyBcIi9cIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHguc2lnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vYWRkIGEgbmV3IHBsYXllciBzdHJlYW0gZXh0ZXJuYWxcclxuICAgIGV4dGVybmFsUGxheWVyKGN1c3RvbUlnbm9yZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgaWYgKGN1c3RvbUlnbm9yZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFR1bm5lbCA9IHRoaXMudHVubmVsWzBdO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBnbG9iYWwucmVhbEZldGNoKHRoaXMuY3VycmVudFR1bm5lbC5yZXBsYWNlKFwie2NoYW5uZWxuYW1lfVwiLCB0aGlzLmNoYW5uZWxOYW1lKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2VydmVyIHByb3h5IHJldHVybiBlcnJvciBvciBub3QgZm91bmRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0geWllbGQgcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyZWFtTGluayh0ZXh0LCBzdHJlYW1zLmV4dGVybmFsLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcInNlcnZlciBwcm94eSByZXR1cm4gZXJyb3Igb3Igbm90IGZvdW5kIFwiICsgdGhpcy5jdXJyZW50VHVubmVsKTtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy9jcmVhdGUgYSBuZXcgc3RyZWFtIGFjY2Vzc1xyXG4gICAgc3RyZWFtQWNjZXNzKHN0cmVhbSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChzdHJlYW0ubmFtZSA9PSBzdHJlYW1zLmV4dGVybmFsLm5hbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQgdGhpcy5leHRlcm5hbFBsYXllcigpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSAncXVlcnkgUGxheWJhY2tBY2Nlc3NUb2tlbl9UZW1wbGF0ZSgkbG9naW46IFN0cmluZyEsICRpc0xpdmU6IEJvb2xlYW4hLCAkdm9kSUQ6IElEISwgJGlzVm9kOiBCb29sZWFuISwgJHBsYXllclR5cGU6IFN0cmluZyEpIHsgIHN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW4oY2hhbm5lbE5hbWU6ICRsb2dpbiwgcGFyYW1zOiB7cGxhdGZvcm06IFwid2ViXCIsIHBsYXllckJhY2tlbmQ6IFwibWVkaWFwbGF5ZXJcIiwgcGxheWVyVHlwZTogJHBsYXllclR5cGV9KSBAaW5jbHVkZShpZjogJGlzTGl2ZSkgeyAgICB2YWx1ZSAgICBzaWduYXR1cmUgICAgX190eXBlbmFtZSAgfSAgdmlkZW9QbGF5YmFja0FjY2Vzc1Rva2VuKGlkOiAkdm9kSUQsIHBhcmFtczoge3BsYXRmb3JtOiBcIndlYlwiLCBwbGF5ZXJCYWNrZW5kOiBcIm1lZGlhcGxheWVyXCIsIHBsYXllclR5cGU6ICRwbGF5ZXJUeXBlfSkgQGluY2x1ZGUoaWY6ICRpc1ZvZCkgeyAgICB2YWx1ZSAgICBzaWduYXR1cmUgICAgX190eXBlbmFtZSAgfX0nO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25OYW1lOiBcIlBsYXliYWNrQWNjZXNzVG9rZW5fVGVtcGxhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICBxdWVyeTogcXVlcnksXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW46IHRoaXMuY2hhbm5lbE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVm9kOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm9kSUQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllclR5cGU6IHN0cmVhbS5wbGF5ZXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ3FsID0geWllbGQgZ2xvYmFsLnJlYWxGZXRjaChcImh0dHBzOi8vZ3FsLnR3aXRjaC50di9ncWxcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIkNsaWVudC1JRFwiOiBcImtpbW5lNzhreDNuY3g2YnJnbzRtdjZ3a2k1aDFrb1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbURhdGFBY2Nlc3MgPSB5aWVsZCBncWwuanNvbigpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3VzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiLm0zdTg/YWxsb3dfc291cmNlPXRydWUmZmFzdF9icmVhZD10cnVlJnA9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDFlNykgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJnBsYXllcl9iYWNrZW5kPW1lZGlhcGxheWVyJnBsYXlsaXN0X2luY2x1ZGVfZnJhbWVyYXRlPXRydWUmcmVhc3NpZ25tZW50c19zdXBwb3J0ZWQ9ZmFsc2Umc2lnPVwiICtcclxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1EYXRhQWNjZXNzLmRhdGEuc3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlbi5zaWduYXR1cmUgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJnN1cHBvcnRlZF9jb2RlY3M9YXZjMSZ0b2tlbj1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtRGF0YUFjY2Vzcy5kYXRhLnN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW4udmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0geWllbGQgKHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsKSkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiU2VydmVyIGxvYWRlZCBcIiArIHN0cmVhbS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyZWFtTGluayh0ZXh0LCBzdHJlYW0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDNOMGNtVmhiUzl6ZEhKbFlXMHVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPMEZCUVVFc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeE5RVUZOTEZsQlFWa3NRMEZCUXp0QlFVTnFReXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZqTEUxQlFVMHNiMEpCUVc5Q0xFTkJRVU03UVVGRGVrUXNUMEZCVHl4RlFVRmpMRmxCUVZrc1JVRkJSU3hOUVVGTkxESkNRVUV5UWl4RFFVRkRPMEZCUlhKRkxFMUJRVTBzVDBGQlR5eE5RVUZOTzBsQlZXcENMRmxCUVZrc1YwRkJiVUlzUlVGQlJTeFRRVUZwUWl4RlFVRkZPMUZCVkhCRUxHVkJRVlVzUjBGQmJVSXNSVUZCUlN4RFFVRkRPMUZCUTJoRExGRkJRVWNzUjBGQlVTeEpRVUZKTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTNKQ0xHZENRVUZYTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUlhwQ0xGZEJRVTBzUjBGQlJ5eERRVUZETERaRFFVRTJReXhGUVVGRkxEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN1VVRkRlRWNzYTBKQlFXRXNSMEZCVnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQlJYWkRMR2REUVVFeVFpeEhRVUZITEVOQlFVTXNWVUZCYzBJc1JVRkJhMElzUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hKUVVGSkxGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFUUkZia2tzYzBKQlFXbENMRWRCUVVjc1IwRkJVeXhGUVVGRk8xbEJRemRDTEVsQlFVa3NRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1JVRkJSVHRuUWtGRGFFUXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dGhRVU16UWp0UlFVTklMRU5CUVVNc1EwRkJRU3hEUVVGRE8xRkJOMFZCTEVsQlFVa3NRMEZCUXl4WFFVRlhMRWRCUVVjc1YwRkJWeXhEUVVGRE8xRkJReTlDTEVsQlFVa3NUVUZCVFR0WlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzVFVGQlRTeERRVUZETzBsQlF6RkRMRU5CUVVNN1NVRkZSQ3h2UkVGQmIwUTdTVUZET1VNc1lVRkJZU3hEUVVGRExFbEJRVmtzUlVGQlJTeEpRVUZKTEVkQlFVY3NUMEZCVHl4RlFVRkZMRWRCUVVjc1IwRkJSeXhKUVVGSk96dFpRVU14UkN4TlFVRk5MR1ZCUVdVc1IwRkJhVUlzUlVGQlJTeERRVUZETzFsQlEzcERMRWxCUVVrc1dVRkJiME1zUTBGQlF6dFpRVVY2UXl4TlFVRk5MRXRCUVVzc1IwRkJSeXh4UmtGQmNVWXNRMEZCUXp0WlFVVndSeXhQUVVGUExFTkJRVU1zV1VGQldTeEhRVUZITEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZKTEVWQlFVVTdaMEpCUTJwRUxHVkJRV1VzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4UFFVRlBMRVZCUVVVc1dVRkJXU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVY3NSVUZCUlN4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzJGQlF6RkZPMWxCUlVRc1RVRkJUU3hWUVVGVkxFZEJRV2xDTEVsQlFVa3NXVUZCV1N4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlJTeFBRVUZQTEVWQlFVVXNaVUZCWlN4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETzFsQlEzUkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMWxCUldwRExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdaMEpCUTFJc1RVRkJUU3hKUVVGSkxFTkJRVU1zVTBGQlV5eEZRVUZGTEVOQlFVTTdZVUZEZUVJN1dVRkRSQ3hQUVVGUExFbEJRVWtzUTBGQlF6dFJRVU5rTEVOQlFVTTdTMEZCUVR0SlFVVkxMRk5CUVZNN08xbEJRMklzVFVGQlRTeExRVUZMTEVkQlFVY3NOa1JCUVRaRUxFTkJRVU03V1VGRk5VVXNUVUZCVFN4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZGTzJkQ1FVTTFRaXhKUVVGSkxFTkJRVU1zVlVGQlZUdHhRa0ZEV2l4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGTkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRWxCUVVrc1MwRkJTeXhEUVVGRE8zRkNRVU5zUXl4UFFVRlBMRU5CUVVNc1EwRkJUeXhEUVVGTkxFVkJRVVVzUlVGQlJUdHZRa0ZEZUVJc1RVRkJUU3hMUVVGTExFZEJRVEpDTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenR2UWtGRGJrVXNTVUZCU1N4TFFVRkxMRVZCUVVVN2QwSkJRMVFzU1VGQlNUczBRa0ZEUml4TlFVRk5MRXRCUVVzc1EwRkJReXdyUWtGQkswSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE96UkNRVU42UlN4RFFVRkRMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF6czBRa0ZEWWl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03ZVVKQlEyWTdkMEpCUVVNc1YwRkJUVHMwUWtGRFRpeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN2VVSkJRMmhDTzNGQ1FVTkdPM2xDUVVGTk8zZENRVU5NTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenR4UWtGRGFFSTdaMEpCUTBnc1EwRkJReXhEUVVGQkxFTkJRVU03YjBKQlEwWXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8xbEJRMjVDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUTB3c1EwRkJRenRMUVVGQk8wbEJSVVFzYTBOQlFXdERPMGxCUXpWQ0xHTkJRV01zUTBGQlF5eGxRVUYzUWl4TFFVRkxPenRaUVVOb1JDeEpRVUZKTEZsQlFWazdaMEpCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRM1JFTEVsQlFVazdaMEpCUTBZc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5d3dRa0ZCTUVJc1EwRkJReXhEUVVGRE8yZENRVU0xUXl4TlFVRk5MRkZCUVZFc1IwRkJZU3hOUVVGTkxFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhQUVVGUExFTkJRVU1zWlVGQlpTeEZRVUZGTEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVVZxU0N4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUlVGQlJUdHZRa0ZEYUVJc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eDNRMEZCZDBNc1EwRkJReXhEUVVGRE8ybENRVU16UkR0blFrRkZSQ3hOUVVGTkxFbEJRVWtzUjBGQlZ5eE5RVUZOTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRuUWtGRk0wTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXh4UWtGQmNVSXNRMEZCUXl4RFFVRkRPMmRDUVVWMlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVWb1JDeFBRVUZQTEVsQlFVa3NRMEZCUXp0aFFVTmlPMWxCUVVNc1QwRkJUeXhEUVVGRExFVkJRVVU3WjBKQlExWXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXg1UTBGQmVVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU03WjBKQlEyaEdMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdaMEpCUTI1Q0xFOUJRVThzUzBGQlN5eERRVUZETzJGQlEyUTdVVUZEU0N4RFFVRkRPMHRCUVVFN1NVRlJSQ3cwUWtGQk5FSTdTVUZEZEVJc1dVRkJXU3hEUVVGRExFMUJRV3RDT3p0WlFVTnVReXhKUVVGSkxFMUJRVTBzUTBGQlF5eEpRVUZKTEVsQlFVa3NUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSk8yZENRVUZGTEU5QlFVOHNUVUZCVFN4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU03V1VGRk4wVXNTVUZCU1R0blFrRkRSaXhOUVVGTkxFdEJRVXNzUjBGRFZDeDFaa0ZCZFdZc1EwRkJRenRuUWtGRE1XWXNUVUZCVFN4SlFVRkpMRWRCUVVjN2IwSkJRMWdzWVVGQllTeEZRVUZGTERoQ1FVRTRRanR2UWtGRE4wTXNTMEZCU3l4RlFVRkZMRXRCUVVzN2IwSkJRMW9zVTBGQlV5eEZRVUZGTzNkQ1FVTlVMRTFCUVUwc1JVRkJSU3hKUVVGSk8zZENRVU5hTEV0QlFVc3NSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWenQzUWtGRGRrSXNTMEZCU3l4RlFVRkZMRXRCUVVzN2QwSkJRMW9zUzBGQlN5eEZRVUZGTEVWQlFVVTdkMEpCUTFRc1ZVRkJWU3hGUVVGRkxFMUJRVTBzUTBGQlF5eFZRVUZWTzNGQ1FVTTVRanRwUWtGRFJpeERRVUZETzJkQ1FVVkdMRTFCUVUwc1IwRkJSeXhIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl3eVFrRkJNa0lzUlVGQlJUdHZRa0ZET1VRc1RVRkJUU3hGUVVGRkxFMUJRVTA3YjBKQlEyUXNUMEZCVHl4RlFVRkZMRVZCUVVVc1YwRkJWeXhGUVVGRkxHZERRVUZuUXl4RlFVRkZPMjlDUVVNeFJDeEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU03YVVKQlF6TkNMRU5CUVVNc1EwRkJRenRuUWtGRFNDeE5RVUZOTEdkQ1FVRm5RaXhIUVVGUkxFMUJRVTBzUjBGQlJ5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMmRDUVVVdlF5eE5RVUZOTEVkQlFVY3NSMEZEVUN3d1EwRkJNRU03YjBKQlF6RkRMRWxCUVVrc1EwRkJReXhYUVVGWE8yOUNRVU5vUWl3MFEwRkJORU03YjBKQlF6VkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRWRCUVVjc1EwRkJRenR2UWtGREwwSXNaMGRCUVdkSE8yOUNRVU5vUnl4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNlVUpCUVhsQ0xFTkJRVU1zVTBGQlV6dHZRa0ZEZWtRc0swSkJRU3RDTzI5Q1FVTXZRaXhuUWtGQlowSXNRMEZCUXl4SlFVRkpMRU5CUVVNc2VVSkJRWGxDTEVOQlFVTXNTMEZCU3l4RFFVRkRPMmRDUVVONFJDeE5RVUZOTEVsQlFVa3NSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03WjBKQlJYaEVMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVVm9SQ3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlJYUkRMRTlCUVU4c1NVRkJTU3hEUVVGRE8yRkJRMkk3V1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0blFrRkRWaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVObUxFOUJRVThzUzBGQlN5eERRVUZETzJGQlEyUTdVVUZEU0N4RFFVRkRPMHRCUVVFN1EwRkRSaUo5IiwiZXhwb3J0IGNvbnN0IHN0cmVhbXMgPSB7XHJcbiAgICBwaWN0dXJlOiB7IHBsYXllclR5cGU6IFwidGh1bmRlcmRvbWVcIiwgbmFtZTogXCJsb3dlclwiIH0sXHJcbiAgICBsb2NhbDogeyBwbGF5ZXJUeXBlOiBcImVtYmVkXCIsIG5hbWU6IFwibm9ybWFsXCIgfSxcclxuICAgIGV4dGVybmFsOiB7IG5hbWU6IFwiZXh0ZXJuYWxcIiB9LFxyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdExuUjVjR1V1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12YzNSeVpXRnRMM1I1Y0dVdmMzUnlaV0Z0TG5SNWNHVXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFMUJRVTBzVDBGQlR5eEhRVUZITzBsQlEzSkNMRTlCUVU4c1JVRkJSU3hGUVVGRkxGVkJRVlVzUlVGQlJTeGhRVUZoTEVWQlFVVXNTVUZCU1N4RlFVRkZMRTlCUVU4c1JVRkJSVHRKUVVOeVJDeExRVUZMTEVWQlFVVXNSVUZCUlN4VlFVRlZMRVZCUVVVc1QwRkJUeXhGUVVGRkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVTdTVUZET1VNc1VVRkJVU3hGUVVGRkxFVkJRVVVzU1VGQlNTeEZRVUZGTEZWQlFWVXNSVUZCUlR0RFFVTXZRaXhEUVVGREluMD0iLCJleHBvcnQgY2xhc3MgcXVhbGl0eVVybCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnVybCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gXCJcIjtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3Mgc3RyZWFtU2VydmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcnRpYWwpIHtcclxuICAgICAgICB0aGlzLmJlc3RRdWFsaXR5ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51cmxMaXN0WzBdO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5maW5kQnlRdWFsaXR5ID0gKHF1YWxpdHkpID0+IHRoaXMudXJsTGlzdC5maW5kKCh4KSA9PiB4LnF1YWxpdHkgPT0gcXVhbGl0eSk7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBwYXJ0aWFsKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdFUyVnlkbVZ5TG5SNWNHVnpMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMM04wY21WaGJTOTBlWEJsTDNOMGNtVmhiVk5sY25abGNpNTBlWEJsY3k1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hOUVVGTkxFOUJRVThzVlVGQlZUdEpRVUYyUWp0UlFVTkZMRkZCUVVjc1IwRkJWeXhGUVVGRkxFTkJRVU03VVVGRGFrSXNXVUZCVHl4SFFVRlhMRVZCUVVVc1EwRkJRenRKUVVOMlFpeERRVUZETzBOQlFVRTdRVUZEUkN4TlFVRk5MRTlCUVU4c1dVRkJXVHRKUVZWMlFpeFpRVUZaTEU5QlFUaENPMUZCVERGRExHZENRVUZYTEVkQlFVY3NSMEZCUnl4RlFVRkZPMWxCUTJwQ0xFOUJRVThzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVONlFpeERRVUZETEVOQlFVTTdVVUZEUml4clFrRkJZU3hIUVVGSExFTkJRVU1zVDBGQlpTeEZRVUZGTEVWQlFVVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVZHNSaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRKUVVNdlFpeERRVUZETzBOQlEwWWlmUT09IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFBsYXllciB9IGZyb20gXCIuL3BsYXllci9wbGF5ZXJcIjtcclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXBwKCkge1xyXG4gICAgZ2xvYmFsLkxvZ1ByaW50ID0gKHgpID0+IGNvbnNvbGUubG9nKFwiW1B1cnBsZV06IFwiLCB4KTtcclxuICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZSkgPT4ge1xyXG4gICAgICAgIGdsb2JhbC5vbkV2ZW50TWVzc2FnZShlKTtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcGxheWVyID0gbmV3IFBsYXllcigpO1xyXG4gICAgZ2xvYmFsLnJlYWxGZXRjaCA9IGdsb2JhbC5mZXRjaDtcclxuICAgIGdsb2JhbC5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICBwbGF5ZXIuaW5mbGF0ZUZldGNoKCk7XHJcbiAgICBnbG9iYWwuTG9nUHJpbnQoXCJTY3JpcHQgcnVubmluZ1wiKTtcclxufVxyXG5hcHAoKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xuZHZjbXRsY2k1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1TDNOeVl5OWhjSEF1ZDI5eWEyVnlMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNUVUZCVFN4cFFrRkJhVUlzUTBGQlF6dEJRVk42UXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhWUVVGVkxFZEJRVWM3U1VGRGVrSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1IwRkJSeXhEUVVGRExFTkJRVTBzUlVGQlJTeEZRVUZGTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhaUVVGWkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZETTBRc1RVRkJUU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRk5CUVZNc1JVRkJSU3hEUVVGRExFTkJRVTBzUlVGQlJTeEZRVUZGTzFGQlF6VkRMRTFCUVUwc1EwRkJReXhqUVVGakxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTVUZETTBJc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRlNDeE5RVUZOTEUxQlFVMHNSMEZCUnl4SlFVRkpMRTFCUVUwc1JVRkJSU3hEUVVGRE8wbEJSVFZDTEUxQlFVMHNRMEZCUXl4VFFVRlRMRWRCUVVjc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF6dEpRVU5vUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF6dEpRVVYyUWl4TlFVRk5MRU5CUVVNc1dVRkJXU3hGUVVGRkxFTkJRVU03U1VGRGRFSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4RFFVRkRPMEZCUTNCRExFTkJRVU03UVVGRFJDeEhRVUZITEVWQlFVVXNRMEZCUXlKOSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==