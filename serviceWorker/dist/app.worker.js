/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.controller.ts":
/*!*******************************!*\
  !*** ./src/app.controller.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.appController = void 0;
const controller_decorator_1 = __webpack_require__(/*! ./decorator/controller.decorator */ "./src/decorator/controller.decorator.ts");
const handler_decorator_1 = __webpack_require__(/*! ./decorator/handler.decorator */ "./src/decorator/handler.decorator.ts");
let appController = class appController {
    constructor(appService) {
        this.appService = appService;
        this.getQuality = () => __webpack_require__.g.postMessage({ type: "getQuality" });
        this.getSettings = () => __webpack_require__.g.postMessage({ type: "getSettings" });
        this.pause = () => __webpack_require__.g.postMessage({ type: "pause" });
        this.play = () => __webpack_require__.g.postMessage({ type: "play" });
        this.pauseAndPlay = () => {
            this.pause();
            this.play();
        };
        this.getSettings();
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
                    break;
                }
                case "setSetting": {
                    break;
                }
                default: {
                    break;
                }
            }
        };
    }
    onChannel(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield __webpack_require__.g.realFetch(url, options);
            if (!response.ok)
                return response;
            return yield response.text().then((text) => __awaiter(this, void 0, void 0, function* () {
                yield this.appService.onStartChannel(url, text);
                return new Response(text);
            }));
        });
    }
    onFetch(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield realFetch(url, options)
                .then((response) => __awaiter(this, void 0, void 0, function* () { return response.text(); }))
                .then((text) => __awaiter(this, void 0, void 0, function* () {
                yield this.appService.onfetch(url, text);
                const playlist = this.appService.currentStream().hls.getPlaylist();
                return new Response(playlist);
            }));
        });
    }
    onChannelPicture(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Response();
        });
    }
    setSettings(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.appService.settings = data.value;
        });
    }
    setQuality(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.appService.quality = data.value;
        });
    }
};
__decorate([
    (0, handler_decorator_1.Fetch)("usher.ttvnw.net/api/channel/hls/", "picture-by-picture")
], appController.prototype, "onChannel", null);
__decorate([
    (0, handler_decorator_1.Fetch)("hls.ttvnw.net/v1/playlist/")
], appController.prototype, "onFetch", null);
__decorate([
    (0, handler_decorator_1.Fetch)("picture-by-picture")
], appController.prototype, "onChannelPicture", null);
__decorate([
    (0, handler_decorator_1.Message)("setSettings")
], appController.prototype, "setSettings", null);
__decorate([
    (0, handler_decorator_1.Message)("setQuality")
], appController.prototype, "setQuality", null);
appController = __decorate([
    (0, controller_decorator_1.Controller)()
], appController);
exports.appController = appController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBwLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkVBQThEO0FBQzlELHFFQUErRDtBQUsvRCxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBVXhCLFlBQTZCLFVBQWtCO1FBQWxCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFUL0MsZUFBVSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUM5RCxnQkFBVyxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUNoRSxVQUFLLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELFNBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbEQsaUJBQVksR0FBRyxHQUFHLEVBQUU7WUFDbEIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQyxDQUFDO1FBR0EsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRTtZQUNqQyxpRUFBaUU7WUFFakUsMkRBQTJEO1lBRTNELFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZCLEtBQUssV0FBVyxDQUFDLENBQUM7b0JBQ2hCLE1BQU07aUJBQ1A7Z0JBQ0QsS0FBSyxxQkFBcUIsQ0FBQyxDQUFD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

/***/ }),

/***/ "./src/app.worker.ts":
/*!***************************!*\
  !*** ./src/app.worker.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./src/app.controller.ts");
const player_1 = __webpack_require__(/*! ./player/player */ "./src/player/player.ts");
function app() {
    __webpack_require__.g.LogPrint = (x) => console.log("[Purple]: ", x);
    __webpack_require__.g.appController = new app_controller_1.appController(new player_1.Player());
    __webpack_require__.g.LogPrint("Script running");
}
exports["default"] = app;
__webpack_require__.g.realFetch = __webpack_require__.g.fetch;
__webpack_require__.g.fetch = (url, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof url === "string") {
        routerList.forEach((x) => {
            if (url.includes(x.match) && !url.includes(x.ignore)) {
                return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () { return resolve(yield __webpack_require__.g.appController[x.propertyKey](url, options)); }));
            }
        });
    }
    return __webpack_require__.g.realFetch.apply(this, [url, options]);
});
__webpack_require__.g.addEventListener("message", (e) => {
    __webpack_require__.g.messageList.forEach((x) => {
        if (e.data.funcName == x.match)
            __webpack_require__.g.appController[x.propertyKey](e.data);
    });
});
app();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLndvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHAud29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscURBQWlEO0FBQ2pELDRDQUF5QztBQVd6QyxTQUF3QixHQUFHO0lBQ3pCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELE1BQU0sQ0FBQyxhQUFhLEdBQUcsSUFBSSw4QkFBYSxDQUFDLElBQUksZUFBTSxFQUFFLENBQUMsQ0FBQztJQUV2RCxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUxELHNCQUtDO0FBRUQsTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2hDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBTyxHQUFRLEVBQUUsT0FBWSxFQUFFLEVBQUU7SUFDOUMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDM0IsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3ZCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFPLENBQUMsRUFBRTtnQkFDckQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFPLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxrREFBQyxPQUFBLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDO2FBQ2pIO1FBQ0gsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUNELE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdEQsQ0FBQyxDQUFBLENBQUM7QUFFRixNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUU7SUFDNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUMvQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxLQUFLO1lBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlFLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxHQUFHLEVBQUUsQ0FBQyJ9

/***/ }),

/***/ "./src/decorator/controller.decorator.ts":
/*!***********************************************!*\
  !*** ./src/decorator/controller.decorator.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Controller = void 0;
const Controller = () => {
    return (target) => { };
};
exports.Controller = Controller;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5kZWNvcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVjb3JhdG9yL2NvbnRyb2xsZXIuZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU0sVUFBVSxHQUFHLEdBQW1CLEVBQUU7SUFDN0MsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUUsQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQztBQUZXLFFBQUEsVUFBVSxjQUVyQiJ9

/***/ }),

/***/ "./src/decorator/handler.decorator.ts":
/*!********************************************!*\
  !*** ./src/decorator/handler.decorator.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Message = exports.Fetch = void 0;
const Fetch = (match, ignore = null) => {
    return (target, propertyKey) => {
        if (!__webpack_require__.g.routerList)
            __webpack_require__.g.routerList = [];
        __webpack_require__.g.routerList.push({ propertyKey: propertyKey, match: match, ignore: ignore });
    };
};
exports.Fetch = Fetch;
const Message = (match) => {
    return (target, propertyKey) => {
        if (!__webpack_require__.g.messageList)
            __webpack_require__.g.messageList = [];
        __webpack_require__.g.messageList.push({ propertyKey: propertyKey, match: match });
    };
};
exports.Message = Message;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlci5kZWNvcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVjb3JhdG9yL2hhbmRsZXIuZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBYSxFQUFFLFNBQXdCLElBQUksRUFBbUIsRUFBRTtJQUNwRixPQUFPLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFO1FBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVTtZQUFFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLFdBQXFCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUMvRixDQUFDLENBQUM7QUFDSixDQUFDLENBQUM7QUFMVyxRQUFBLEtBQUssU0FLaEI7QUFFSyxNQUFNLE9BQU8sR0FBRyxDQUFDLEtBQWEsRUFBbUIsRUFBRTtJQUN4RCxPQUFPLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFO1FBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVztZQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLFdBQXFCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDaEYsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBTFcsUUFBQSxPQUFPLFdBS2xCIn0=

/***/ }),

/***/ "./src/hls/HLS.ts":
/*!************************!*\
  !*** ./src/hls/HLS.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HLS = void 0;
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
exports.HLS = HLS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hscy9ITFMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsTUFBYSxHQUFHO0lBQWhCO1FBQ1UsWUFBTyxHQUFrQixDQUFDLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSx5QkFBeUIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQzlHLGNBQVMsR0FBbUIsRUFBRSxDQUFDO1FBQy9CLGNBQVMsR0FBRyxDQUFDLENBQUM7SUF3RXhCLENBQUM7SUF0RUMsZUFBZSxDQUFDLFFBQWdCLElBQUcsQ0FBQztJQUVwQyxXQUFXLENBQUMsUUFBZ0IsRUFBRSxXQUFvQixLQUFLO1FBQ3JELElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUNyQixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBRXBCLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0IsMkRBQTJEO1FBQzNELEtBQUssTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFO1lBQ3JCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDYixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDL0IsU0FBUztxQkFDVjtpQkFDRjtnQkFDRCxvQkFBb0I7Z0JBQ3BCLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtB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

/***/ }),

/***/ "./src/player/player.ts":
/*!******************************!*\
  !*** ./src/player/player.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Player = void 0;
const stream_1 = __webpack_require__(/*! ../stream/stream */ "./src/stream/stream.ts");
const stream_type_1 = __webpack_require__(/*! ../stream/interface/stream.type */ "./src/stream/interface/stream.type.ts");
class Player {
    constructor() {
        this.streamList = [];
        this.actualChannel = "";
        this.playingAds = false;
        this.settings = { whitelist: [], toggleProxy: true, proxyUrl: "" };
        this.quality = "";
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
    }
    isWhitelist() {
        if (!this.settings.whitelist)
            return false;
        return this.settings.whitelist.includes(this.actualChannel) && this.currentStream() == undefined ? true : false;
    }
    onfetch(url, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentStream = yield this.currentStream();
            currentStream.hls.addPlaylist(response);
            if (!this.isAds(response, true))
                return true;
            try {
                const local = yield this.fetchm3u8ByStreamType(stream_type_1.streams.local);
                if (local)
                    currentStream.hls.addPlaylist(local);
                if (!local)
                    currentStream.streamAccess(stream_type_1.streams.local);
                if (local)
                    return true;
                const external = yield this.fetchm3u8ByStreamType(stream_type_1.streams.external);
                if (external)
                    currentStream.hls.addPlaylist(external);
                if (external)
                    return true;
                console.log("fail");
                // currentStream.hls.addPlaylist(response, true);
                return false;
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    fetchm3u8ByStreamType(accessType) {
        return __awaiter(this, void 0, void 0, function* () {
            LogPrint("Stream Type: " + accessType.name);
            const streamUrlList = this.currentStream().getStreamServersByStreamType(accessType, this.quality);
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
            let existent = false;
            LogPrint("Channel " + channelName[1]);
            this.actualChannel = channelName[1];
            if (this.isWhitelist())
                return false;
            if (!this.streamList.find((c) => c.channelName === this.actualChannel)) {
                let proxyUrl = "";
                if (this.settings)
                    proxyUrl = this.settings.proxyUrl ? this.settings.proxyUrl : "";
                this.streamList.push(new stream_1.Stream(this.actualChannel, proxyUrl));
            }
            else {
                LogPrint("Exist: " + this.actualChannel);
                this.currentStream().serverList = [];
                existent = true;
            }
            const stream = this.currentStream();
            //--------------------------------------------//
            //--------------------------------------------//
            LogPrint("Local Server: Loading");
            yield stream.addStreamLink(text, "local");
            LogPrint("Local Server: OK");
            stream.streamAccess(stream_type_1.streams.local);
            if (existent)
                return;
            //if the proxy option on popup is disabled, it is never called.
            if (this.settings) {
                if (this.settings.toggleProxy)
                    stream.tryExternalPlayer();
            }
            return;
        });
    }
}
exports.Player = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsYXllci9wbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQTBDO0FBQzFDLGlFQUFzRTtBQUl0RSxNQUFhLE1BQU07SUFBbkI7UUFDRSxlQUFVLEdBQWEsRUFBRSxDQUFDO1FBQzFCLGtCQUFhLEdBQVcsRUFBRSxDQUFDO1FBQzNCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsYUFBUSxHQUFZLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUN2RSxZQUFPLEdBQVcsRUFBRSxDQUFDO1FBRXJCLGVBQVUsR0FBRyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7UUFDdEIsYUFBUSxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztRQUVwQixVQUFLLEdBQUcsQ0FBQyxDQUFTLEVBQUUsY0FBdUIsS0FBSyxFQUFFLEVBQUU7WUFDbEQsZ0pBQWdKO1lBQ2hKLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFdBQVc7Z0JBQUUsT0FBTyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLEdBQUcsSUFBSSxHQUFHO2dCQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNyRCxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRztnQkFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7WUFFdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3pCLENBQUMsQ0FBQztRQUVGLGtCQUFhLEdBQUcsQ0FBQyxVQUFrQixJQUFJLENBQUMs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

/***/ }),

/***/ "./src/stream/interface/stream.type.ts":
/*!*********************************************!*\
  !*** ./src/stream/interface/stream.type.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.streams = void 0;
exports.streams = {
    picture: { playerType: "thunderdome", name: "lower" },
    local: { playerType: "embed", name: "normal" },
    external: { name: "external" },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLnR5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc3RyZWFtL2ludGVyZmFjZS9zdHJlYW0udHlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBYSxRQUFBLE9BQU8sR0FBRztJQUNyQixPQUFPLEVBQUUsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7SUFDckQsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0lBQzlDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7Q0FDL0IsQ0FBQyJ9

/***/ }),

/***/ "./src/stream/interface/streamServer.types.ts":
/*!****************************************************!*\
  !*** ./src/stream/interface/streamServer.types.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.streamServer = exports.qualityUrl = void 0;
class qualityUrl {
    constructor() {
        this.url = "";
        this.quality = "";
    }
}
exports.qualityUrl = qualityUrl;
class streamServer {
    constructor(partial) {
        this.bestQuality = () => {
            return this.urlList[0];
        };
        this.findByQuality = (quality) => this.urlList.find((x) => x.quality == quality);
        Object.assign(this, partial);
    }
}
exports.streamServer = streamServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtU2VydmVyLnR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cmVhbS9pbnRlcmZhY2Uvc3RyZWFtU2VydmVyLnR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsVUFBVTtJQUF2QjtRQUNFLFFBQUcsR0FBVyxFQUFFLENBQUM7UUFDakIsWUFBTyxHQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0NBQUE7QUFIRCxnQ0FHQztBQUNELE1BQWEsWUFBWTtJQVV2QixZQUFZLE9BQThCO1FBTDFDLGdCQUFXLEdBQUcsR0FBRyxFQUFFO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUM7UUFDRixrQkFBYSxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQztRQUdsRixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvQixDQUFDO0NBQ0Y7QUFiRCxvQ0FhQyJ9

/***/ }),

/***/ "./src/stream/stream.ts":
/*!******************************!*\
  !*** ./src/stream/stream.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Stream = void 0;
const HLS_1 = __webpack_require__(/*! ../hls/HLS */ "./src/hls/HLS.ts");
const stream_type_1 = __webpack_require__(/*! ./interface/stream.type */ "./src/stream/interface/stream.type.ts");
const streamServer_types_1 = __webpack_require__(/*! ./interface/streamServer.types */ "./src/stream/interface/streamServer.types.ts");
class Stream {
    constructor(channelName, tunnel = "") {
        this.serverList = [];
        this.hls = new HLS_1.HLS();
        this.channelName = "";
        this.tunnel = ["https://eu1.jupter.ga/channel/{channelname}", "https://eu2.jupter.ga/channel/{channelname}"];
        this.currentTunnel = this.tunnel[0];
        this.tryExternalPlayer = () => __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.streamAccess(stream_type_1.streams.external))) {
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
            const streamList = new streamServer_types_1.streamServer({ type: type, urlList: qualityUrlSplit, sig: sig });
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
                this.addStreamLink(text, stream_type_1.streams.external.name);
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
            if (stream.name == stream_type_1.streams.external.name)
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
    getStreamServersByStreamType(accessType, quality) {
        //filter all server by type
        const servers = this.serverList.filter((x) => x.type == accessType.name);
        if (!servers)
            return [];
        //filter all server url by quality or bestquality
        const streamUrlList = servers.map((x) => x.findByQuality(quality)).filter((x) => x !== undefined);
        return !streamUrlList.length ? servers.map((x) => x.bestQuality()) : streamUrlList;
    }
}
exports.Stream = Stream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmVhbS9zdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsb0NBQWlDO0FBQ2pDLHlEQUE4RDtBQUM5RCx1RUFBMEU7QUFFMUUsTUFBYSxNQUFNO0lBUWpCLFlBQVksV0FBbUIsRUFBRSxTQUFpQixFQUFFO1FBUHBELGVBQVUsR0FBbUIsRUFBRSxDQUFDO1FBQ2hDLFFBQUcsR0FBUSxJQUFJLFNBQUcsRUFBRSxDQUFDO1FBQ3JCLGdCQUFXLEdBQVcsRUFBRSxDQUFDO1FBRXpCLFdBQU0sR0FBRyxDQUFDLDZDQUE2QyxFQUFFLDZDQUE2QyxDQUFDLENBQUM7UUFDeEcsa0JBQWEsR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBNEV2QyxzQkFBaUIsR0FBRyxHQUFTLEVBQUU7WUFDN0IsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQjtRQUNILENBQUMsQ0FBQSxDQUFDO1FBN0VBLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksTUFBTTtZQUFFLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFFRCxvREFBb0Q7SUFDOUMsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsT0FBTyxFQUFFLEdBQUcsR0FBRyxJQUFJOztZQUMxRCxNQUFNLGVBQWUsR0FBaUIsRUFBRSxDQUFDO1lBQ3pDLElBQUksWUFBb0MsQ0FBQztZQUV6QyxNQUFNLEtBQUssR0FBRyxxRkFBcUYsQ0FBQztZQUVwRyxPQUFPLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FB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

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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
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
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/app.worker.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QztBQUNwaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0Esa0NBQWtDLHFCQUFNO0FBQ3hDO0FBQ0EsK0JBQStCLCtDQUErQztBQUM5RTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMscUJBQU07QUFDaEQsZ0JBQWdCLHFCQUFNO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsMkNBQTJDOzs7Ozs7VUN2SjNDO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztVRVBEO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC5jb250cm9sbGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9hcHAud29ya2VyLnRzIiwid2VicGFjazovLy8uL3NyYy9kZWNvcmF0b3IvY29udHJvbGxlci5kZWNvcmF0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RlY29yYXRvci9oYW5kbGVyLmRlY29yYXRvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaGxzL0hMUy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGxheWVyL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RyZWFtL2ludGVyZmFjZS9zdHJlYW0udHlwZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RyZWFtL2ludGVyZmFjZS9zdHJlYW1TZXJ2ZXIudHlwZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0cmVhbS9zdHJlYW0udHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufTtcclxudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuYXBwQ29udHJvbGxlciA9IHZvaWQgMDtcclxuY29uc3QgY29udHJvbGxlcl9kZWNvcmF0b3JfMSA9IHJlcXVpcmUoXCIuL2RlY29yYXRvci9jb250cm9sbGVyLmRlY29yYXRvclwiKTtcclxuY29uc3QgaGFuZGxlcl9kZWNvcmF0b3JfMSA9IHJlcXVpcmUoXCIuL2RlY29yYXRvci9oYW5kbGVyLmRlY29yYXRvclwiKTtcclxubGV0IGFwcENvbnRyb2xsZXIgPSBjbGFzcyBhcHBDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGFwcFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmFwcFNlcnZpY2UgPSBhcHBTZXJ2aWNlO1xyXG4gICAgICAgIHRoaXMuZ2V0UXVhbGl0eSA9ICgpID0+IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiZ2V0UXVhbGl0eVwiIH0pO1xyXG4gICAgICAgIHRoaXMuZ2V0U2V0dGluZ3MgPSAoKSA9PiBnbG9iYWwucG9zdE1lc3NhZ2UoeyB0eXBlOiBcImdldFNldHRpbmdzXCIgfSk7XHJcbiAgICAgICAgdGhpcy5wYXVzZSA9ICgpID0+IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwicGF1c2VcIiB9KTtcclxuICAgICAgICB0aGlzLnBsYXkgPSAoKSA9PiBnbG9iYWwucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInBsYXlcIiB9KTtcclxuICAgICAgICB0aGlzLnBhdXNlQW5kUGxheSA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZ2V0U2V0dGluZ3MoKTtcclxuICAgICAgICBnbG9iYWwub25FdmVudE1lc3NhZ2UgPSAoZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyB2YXIgbXlNZXNzYWdlID0gbmV3IE1lc3NhZ2VFdmVudCgnd29ya2VyJywgeyBkYXRhOiAnaGVsbG8nIH0pO1xyXG4gICAgICAgICAgICAvLyBpZiAoZ2xvYmFsLm9ubWVzc2FnZSkgZ2xvYmFsLm9ubWVzc2FnZSh0aGlzLCBteU1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGUuZGF0YS5mdW5jTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIkJ1ZmZlcmluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwib25DbGllbnRTaW5rUGxheWluZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwib25DbGllbnRTaW5rVXBkYXRlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJwYXVzZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwicGxheVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmVhZHlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIlBsYXlpbmdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInNldFNldHRpbmdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIG9uQ2hhbm5lbCh1cmwsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIHJlc3BvbnNlLnRleHQoKS50aGVuKCh0ZXh0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLmFwcFNlcnZpY2Uub25TdGFydENoYW5uZWwodXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGV4dCk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIG9uRmV0Y2godXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIHJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTsgfSkpXHJcbiAgICAgICAgICAgICAgICAudGhlbigodGV4dCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgeWllbGQgdGhpcy5hcHBTZXJ2aWNlLm9uZmV0Y2godXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXlsaXN0ID0gdGhpcy5hcHBTZXJ2aWNlLmN1cnJlbnRTdHJlYW0oKS5obHMuZ2V0UGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UocGxheWxpc3QpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBvbkNoYW5uZWxQaWN0dXJlKHVybCwgb3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHNldFNldHRpbmdzKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICB0aGlzLmFwcFNlcnZpY2Uuc2V0dGluZ3MgPSBkYXRhLnZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc2V0UXVhbGl0eShkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBTZXJ2aWNlLnF1YWxpdHkgPSBkYXRhLnZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5fX2RlY29yYXRlKFtcclxuICAgICgwLCBoYW5kbGVyX2RlY29yYXRvcl8xLkZldGNoKShcInVzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIsIFwicGljdHVyZS1ieS1waWN0dXJlXCIpXHJcbl0sIGFwcENvbnRyb2xsZXIucHJvdG90eXBlLCBcIm9uQ2hhbm5lbFwiLCBudWxsKTtcclxuX19kZWNvcmF0ZShbXHJcbiAgICAoMCwgaGFuZGxlcl9kZWNvcmF0b3JfMS5GZXRjaCkoXCJobHMudHR2bncubmV0L3YxL3BsYXlsaXN0L1wiKVxyXG5dLCBhcHBDb250cm9sbGVyLnByb3RvdHlwZSwgXCJvbkZldGNoXCIsIG51bGwpO1xyXG5fX2RlY29yYXRlKFtcclxuICAgICgwLCBoYW5kbGVyX2RlY29yYXRvcl8xLkZldGNoKShcInBpY3R1cmUtYnktcGljdHVyZVwiKVxyXG5dLCBhcHBDb250cm9sbGVyLnByb3RvdHlwZSwgXCJvbkNoYW5uZWxQaWN0dXJlXCIsIG51bGwpO1xyXG5fX2RlY29yYXRlKFtcclxuICAgICgwLCBoYW5kbGVyX2RlY29yYXRvcl8xLk1lc3NhZ2UpKFwic2V0U2V0dGluZ3NcIilcclxuXSwgYXBwQ29udHJvbGxlci5wcm90b3R5cGUsIFwic2V0U2V0dGluZ3NcIiwgbnVsbCk7XHJcbl9fZGVjb3JhdGUoW1xyXG4gICAgKDAsIGhhbmRsZXJfZGVjb3JhdG9yXzEuTWVzc2FnZSkoXCJzZXRRdWFsaXR5XCIpXHJcbl0sIGFwcENvbnRyb2xsZXIucHJvdG90eXBlLCBcInNldFF1YWxpdHlcIiwgbnVsbCk7XHJcbmFwcENvbnRyb2xsZXIgPSBfX2RlY29yYXRlKFtcclxuICAgICgwLCBjb250cm9sbGVyX2RlY29yYXRvcl8xLkNvbnRyb2xsZXIpKClcclxuXSwgYXBwQ29udHJvbGxlcik7XHJcbmV4cG9ydHMuYXBwQ29udHJvbGxlciA9IGFwcENvbnRyb2xsZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbU52Ym5SeWIyeHNaWEl1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTl6Y21NdllYQndMbU52Ym5SeWIyeHNaWEl1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWpzN096czdPenM3T3pzN096czdPenM3TzBGQlFVRXNNa1ZCUVRoRU8wRkJRemxFTEhGRlFVRXJSRHRCUVVzdlJDeEpRVUZoTEdGQlFXRXNSMEZCTVVJc1RVRkJZU3hoUVVGaE8wbEJWWGhDTEZsQlFUWkNMRlZCUVd0Q08xRkJRV3hDTEdWQlFWVXNSMEZCVml4VlFVRlZMRU5CUVZFN1VVRlVMME1zWlVGQlZTeEhRVUZITEVkQlFVY3NSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhYUVVGWExFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNXVUZCV1N4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVNNVJDeG5Ra0ZCVnl4SFFVRkhMRWRCUVVjc1JVRkJSU3hEUVVGRExFMUJRVTBzUTBGQlF5eFhRVUZYTEVOQlFVTXNSVUZCUlN4SlFVRkpMRVZCUVVVc1lVRkJZU3hGUVVGRkxFTkJRVU1zUTBGQlF6dFJRVU5vUlN4VlFVRkxMRWRCUVVjc1IwRkJSeXhGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hQUVVGUExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlEzQkVMRk5CUVVrc1IwRkJSeXhIUVVGSExFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZEYkVRc2FVSkJRVmtzUjBGQlJ5eEhRVUZITEVWQlFVVTdXVUZEYkVJc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzFsQlEySXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xRkJRMlFzUTBGQlF5eERRVUZETzFGQlIwRXNTVUZCU1N4RFFVRkRMRmRCUVZjc1JVRkJSU3hEUVVGRE8xRkJRMjVDTEUxQlFVMHNRMEZCUXl4alFVRmpMRWRCUVVjc1EwRkJReXhEUVVGTkxFVkJRVVVzUlVGQlJUdFpRVU5xUXl4cFJVRkJhVVU3V1VGRmFrVXNNa1JCUVRKRU8xbEJSVE5FTEZGQlFWRXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFVkJRVVU3WjBKQlEzWkNMRXRCUVVzc1YwRkJWeXhEUVVGRExFTkJRVU03YjBKQlEyaENMRTFCUVUwN2FVSkJRMUE3WjBKQlEwUXNTMEZCU3l4eFFrRkJjVUlzUTBGQlF5eERRVUZETzI5Q1FVTXhRaXhOUVVGTk8ybENRVU5RTzJkQ1FVTkVMRXRCUVVzc2IwSkJRVzlDTEVOQlFVTXNRMEZCUXp0dlFrRkRla0lzVFVGQlRUdHBRa0ZEVUR0blFrRkRSQ3hMUVVGTExFOUJRVThzUTBGQlF5eERRVUZETzI5Q1FVTmFMRTFCUVUwN2FVSkJRMUE3WjBKQlEwUXNTMEZCU3l4TlFVRk5MRU5CUVVNc1EwRkJRenR2UWtGRFdDeE5RVUZOTzJsQ1FVTlFPMmRDUVVORUxFdEJRVXNzVDBGQlR5eERRVUZETEVOQlFVTTdiMEpCUTFvc1RVRkJUVHRwUWtGRFVEdG5Ra0ZEUkN4TFFVRkxMRk5CUVZNc1EwRkJReXhEUVVGRE8yOUNRVU5rTEUxQlFVMDdhVUpCUTFBN1owSkJRMFFzUzBGQlN5eFpRVUZaTEVOQlFVTXNRMEZCUXp0dlFrRkRha0lzVFVGQlRUdHBRa0ZEVUR0blFrRkRSQ3hMUVVGTExGbEJRVmtzUTBGQlF5eERRVUZETzI5Q1FVTnFRaXhOUVVGTk8ybENRVU5RTzJkQ1FVTkVMRTlCUVU4c1EwRkJReXhEUVVGRE8yOUNRVU5RTEUxQlFVMDdhVUpCUTFBN1lVRkRSanRSUVVOSUxFTkJRVU1zUTBGQlF6dEpRVU5LTEVOQlFVTTdTVUZIU3l4VFFVRlRMRU5CUVVNc1IwRkJWeXhGUVVGRkxFOUJRVms3TzFsQlEzWkRMRTFCUVUwc1VVRkJVU3hIUVVGaExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03V1VGRGFFVXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRk8yZENRVUZGTEU5QlFVOHNVVUZCVVN4RFFVRkRPMWxCUld4RExFOUJRVThzVFVGQlRTeFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVThzU1VGQldTeEZRVUZGTEVWQlFVVTdaMEpCUTNaRUxFMUJRVTBzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4alFVRmpMRU5CUVVNc1IwRkJSeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVTm9SQ3hQUVVGUExFbEJRVWtzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMWxCUXpWQ0xFTkJRVU1zUTBGQlFTeERRVUZETEVOQlFVTTdVVUZEVEN4RFFVRkRPMHRCUVVFN1NVRkhTeXhQUVVGUExFTkJRVU1zUjBGQlZ5eEZRVUZGTEU5QlFWazdPMWxCUTNKRExFOUJRVThzVFVGQlRTeFRRVUZUTEVOQlFVTXNSMEZCUnl4RlFVRkZMRTlCUVU4c1EwRkJRenRwUWtGRGFrTXNTVUZCU1N4RFFVRkRMRU5CUVU4c1VVRkJhMElzUlVGQlJTeEZRVUZGTEdkRVFVRkRMRTlCUVVFc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZCTEVkQlFVRXNRMEZCUXp0cFFrRkRia1FzU1VGQlNTeERRVUZETEVOQlFVOHNTVUZCV1N4RlFVRkZMRVZCUVVVN1owSkJRek5DTEUxQlFVMHNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVONlF5eE5RVUZOTEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExHRkJRV0VzUlVGQlJTeERRVUZETEVkQlFVY3NRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJRenRuUWtGRGJrVXNUMEZCVHl4SlFVRkpMRkZCUVZFc1EwRkJReXhSUVVGbExFTkJRVU1zUTBGQlF6dFpRVU4yUXl4RFFVRkRMRU5CUVVFc1EwRkJReXhEUVVGRE8xRkJRMUFzUTBGQlF6dExRVUZCTzBsQlIwc3NaMEpCUVdkQ0xFTkJRVU1zUjBGQlZ5eEZRVUZGTEU5QlFWazdPMWxCUXpsRExFOUJRVThzU1VGQlNTeFJRVUZSTEVWQlFVVXNRMEZCUXp0UlFVTjRRaXhEUVVGRE8wdEJRVUU3U1VGSFN5eFhRVUZYTEVOQlFVTXNTVUZCVXpzN1dVRkRla0lzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF6dFJRVU40UXl4RFFVRkRPMHRCUVVFN1NVRkhTeXhWUVVGVkxFTkJRVU1zU1VGQlV6czdXVUZEZUVJc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJRenRSUVVOMlF5eERRVUZETzB0QlFVRTdRMEZEUml4RFFVRkJPMEZCYmtORE8wbEJSRU1zU1VGQlFTeDVRa0ZCU3l4RlFVRkRMR3REUVVGclF5eEZRVUZGTEc5Q1FVRnZRaXhEUVVGRE96aERRVk12UkR0QlFVZEVPMGxCUkVNc1NVRkJRU3g1UWtGQlN5eEZRVUZETERSQ1FVRTBRaXhEUVVGRE96UkRRVk51UXp0QlFVZEVPMGxCUkVNc1NVRkJRU3g1UWtGQlN5eEZRVUZETEc5Q1FVRnZRaXhEUVVGRE8zRkVRVWN6UWp0QlFVZEVPMGxCUkVNc1NVRkJRU3d5UWtGQlR5eEZRVUZETEdGQlFXRXNRMEZCUXp0blJFRkhkRUk3UVVGSFJEdEpRVVJETEVsQlFVRXNNa0pCUVU4c1JVRkJReXhaUVVGWkxFTkJRVU03SzBOQlIzSkNPMEZCZGtaVkxHRkJRV0U3U1VGRWVrSXNTVUZCUVN4cFEwRkJWU3hIUVVGRk8wZEJRMEVzWVVGQllTeERRWGRHZWtJN1FVRjRSbGtzYzBOQlFXRWlmUT09IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5jb25zdCBhcHBfY29udHJvbGxlcl8xID0gcmVxdWlyZShcIi4vYXBwLmNvbnRyb2xsZXJcIik7XHJcbmNvbnN0IHBsYXllcl8xID0gcmVxdWlyZShcIi4vcGxheWVyL3BsYXllclwiKTtcclxuZnVuY3Rpb24gYXBwKCkge1xyXG4gICAgZ2xvYmFsLkxvZ1ByaW50ID0gKHgpID0+IGNvbnNvbGUubG9nKFwiW1B1cnBsZV06IFwiLCB4KTtcclxuICAgIGdsb2JhbC5hcHBDb250cm9sbGVyID0gbmV3IGFwcF9jb250cm9sbGVyXzEuYXBwQ29udHJvbGxlcihuZXcgcGxheWVyXzEuUGxheWVyKCkpO1xyXG4gICAgZ2xvYmFsLkxvZ1ByaW50KFwiU2NyaXB0IHJ1bm5pbmdcIik7XHJcbn1cclxuZXhwb3J0cy5kZWZhdWx0ID0gYXBwO1xyXG5nbG9iYWwucmVhbEZldGNoID0gZ2xvYmFsLmZldGNoO1xyXG5nbG9iYWwuZmV0Y2ggPSAodXJsLCBvcHRpb25zKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgIGlmICh0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcm91dGVyTGlzdC5mb3JFYWNoKCh4KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoeC5tYXRjaCkgJiYgIXVybC5pbmNsdWRlcyh4Lmlnbm9yZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsgcmV0dXJuIHJlc29sdmUoeWllbGQgZ2xvYmFsLmFwcENvbnRyb2xsZXJbeC5wcm9wZXJ0eUtleV0odXJsLCBvcHRpb25zKSk7IH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGdsb2JhbC5yZWFsRmV0Y2guYXBwbHkodGhpcywgW3VybCwgb3B0aW9uc10pO1xyXG59KTtcclxuZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIChlKSA9PiB7XHJcbiAgICBnbG9iYWwubWVzc2FnZUxpc3QuZm9yRWFjaCgoeCkgPT4ge1xyXG4gICAgICAgIGlmIChlLmRhdGEuZnVuY05hbWUgPT0geC5tYXRjaClcclxuICAgICAgICAgICAgZ2xvYmFsLmFwcENvbnRyb2xsZXJbeC5wcm9wZXJ0eUtleV0oZS5kYXRhKTtcclxuICAgIH0pO1xyXG59KTtcclxuYXBwKCk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbmR2Y210bGNpNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUwzTnlZeTloY0hBdWQyOXlhMlZ5TG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096czdPenM3T3pzN08wRkJRVUVzY1VSQlFXbEVPMEZCUTJwRUxEUkRRVUY1UXp0QlFWZDZReXhUUVVGM1FpeEhRVUZITzBsQlEzcENMRTFCUVUwc1EwRkJReXhSUVVGUkxFZEJRVWNzUTBGQlF5eERRVUZOTEVWQlFVVXNSVUZCUlN4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpORUxFMUJRVTBzUTBGQlF5eGhRVUZoTEVkQlFVY3NTVUZCU1N3NFFrRkJZU3hEUVVGRExFbEJRVWtzWlVGQlRTeEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVVjJSQ3hOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExFTkJRVU03UVVGRGNFTXNRMEZCUXp0QlFVeEVMSE5DUVV0RE8wRkJSVVFzVFVGQlRTeERRVUZETEZOQlFWTXNSMEZCUnl4TlFVRk5MRU5CUVVNc1MwRkJTeXhEUVVGRE8wRkJRMmhETEUxQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJUeXhIUVVGUkxFVkJRVVVzVDBGQldTeEZRVUZGTEVWQlFVVTdTVUZET1VNc1NVRkJTU3hQUVVGUExFZEJRVWNzUzBGQlN5eFJRVUZSTEVWQlFVVTdVVUZETTBJc1ZVRkJWU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZPMWxCUTNaQ0xFbEJRVWtzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGUExFTkJRVU1zUlVGQlJUdG5Ra0ZEY2tRc1QwRkJUeXhKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZQTEU5QlFVOHNSVUZCUlN4TlFVRk5MRVZCUVVVc1JVRkJSU3hyUkVGQlF5eFBRVUZCTEU5QlFVOHNRMEZCUXl4TlFVRk5MRTFCUVUwc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF5eERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRMRWRCUVVjc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZCTEVkQlFVRXNRMEZCUXl4RFFVRkRPMkZCUTJwSU8xRkJRMGdzUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEU2p0SlFVTkVMRTlCUVU4c1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1IwRkJSeXhGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEZEVRc1EwRkJReXhEUVVGQkxFTkJRVU03UVVGRlJpeE5RVUZOTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVTBGQlV5eEZRVUZGTEVOQlFVTXNRMEZCVFN4RlFVRkZMRVZCUVVVN1NVRkROVU1zVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJUdFJRVU12UWl4SlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeEpRVUZKTEVOQlFVTXNRMEZCUXl4TFFVRkxPMWxCUVVVc1RVRkJUU3hEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBsQlF6bEZMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRMHdzUTBGQlF5eERRVUZETEVOQlFVTTdRVUZGU0N4SFFVRkhMRVZCUVVVc1EwRkJReUo5IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5Db250cm9sbGVyID0gdm9pZCAwO1xyXG5jb25zdCBDb250cm9sbGVyID0gKCkgPT4ge1xyXG4gICAgcmV0dXJuICh0YXJnZXQpID0+IHsgfTtcclxufTtcclxuZXhwb3J0cy5Db250cm9sbGVyID0gQ29udHJvbGxlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWTI5dWRISnZiR3hsY2k1a1pXTnZjbUYwYjNJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12WkdWamIzSmhkRzl5TDJOdmJuUnliMnhzWlhJdVpHVmpiM0poZEc5eUxuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenRCUVVGUExFMUJRVTBzVlVGQlZTeEhRVUZITEVkQlFXMUNMRVZCUVVVN1NVRkROME1zVDBGQlR5eERRVUZETEUxQlFVMHNSVUZCUlN4RlFVRkZMRWRCUVVVc1EwRkJReXhEUVVGRE8wRkJRM2hDTEVOQlFVTXNRMEZCUXp0QlFVWlhMRkZCUVVFc1ZVRkJWU3hqUVVWeVFpSjkiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLk1lc3NhZ2UgPSBleHBvcnRzLkZldGNoID0gdm9pZCAwO1xyXG5jb25zdCBGZXRjaCA9IChtYXRjaCwgaWdub3JlID0gbnVsbCkgPT4ge1xyXG4gICAgcmV0dXJuICh0YXJnZXQsIHByb3BlcnR5S2V5KSA9PiB7XHJcbiAgICAgICAgaWYgKCFnbG9iYWwucm91dGVyTGlzdClcclxuICAgICAgICAgICAgZ2xvYmFsLnJvdXRlckxpc3QgPSBbXTtcclxuICAgICAgICBnbG9iYWwucm91dGVyTGlzdC5wdXNoKHsgcHJvcGVydHlLZXk6IHByb3BlcnR5S2V5LCBtYXRjaDogbWF0Y2gsIGlnbm9yZTogaWdub3JlIH0pO1xyXG4gICAgfTtcclxufTtcclxuZXhwb3J0cy5GZXRjaCA9IEZldGNoO1xyXG5jb25zdCBNZXNzYWdlID0gKG1hdGNoKSA9PiB7XHJcbiAgICByZXR1cm4gKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcclxuICAgICAgICBpZiAoIWdsb2JhbC5tZXNzYWdlTGlzdClcclxuICAgICAgICAgICAgZ2xvYmFsLm1lc3NhZ2VMaXN0ID0gW107XHJcbiAgICAgICAgZ2xvYmFsLm1lc3NhZ2VMaXN0LnB1c2goeyBwcm9wZXJ0eUtleTogcHJvcGVydHlLZXksIG1hdGNoOiBtYXRjaCB9KTtcclxuICAgIH07XHJcbn07XHJcbmV4cG9ydHMuTWVzc2FnZSA9IE1lc3NhZ2U7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFHRnVaR3hsY2k1a1pXTnZjbUYwYjNJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12WkdWamIzSmhkRzl5TDJoaGJtUnNaWEl1WkdWamIzSmhkRzl5TG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096dEJRVUZQTEUxQlFVMHNTMEZCU3l4SFFVRkhMRU5CUVVNc1MwRkJZU3hGUVVGRkxGTkJRWGRDTEVsQlFVa3NSVUZCYlVJc1JVRkJSVHRKUVVOd1JpeFBRVUZQTEVOQlFVTXNUVUZCVFN4RlFVRkZMRmRCUVZjc1JVRkJSU3hGUVVGRk8xRkJRemRDTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1ZVRkJWVHRaUVVGRkxFMUJRVTBzUTBGQlF5eFZRVUZWTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUXk5RExFMUJRVTBzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1YwRkJWeXhGUVVGRkxGZEJRWEZDTEVWQlFVVXNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hOUVVGTkxFVkJRVVVzVFVGQlRTeEZRVUZGTEVOQlFVTXNRMEZCUXp0SlFVTXZSaXhEUVVGRExFTkJRVU03UVVGRFNpeERRVUZETEVOQlFVTTdRVUZNVnl4UlFVRkJMRXRCUVVzc1UwRkxhRUk3UVVGRlN5eE5RVUZOTEU5QlFVOHNSMEZCUnl4RFFVRkRMRXRCUVdFc1JVRkJiVUlzUlVGQlJUdEpRVU40UkN4UFFVRlBMRU5CUVVNc1RVRkJUU3hGUVVGRkxGZEJRVmNzUlVGQlJTeEZRVUZGTzFGQlF6ZENMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zVjBGQlZ6dFpRVUZGTEUxQlFVMHNRMEZCUXl4WFFVRlhMRWRCUVVjc1JVRkJSU3hEUVVGRE8xRkJRMnBFTEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzVjBGQlZ5eEZRVUZGTEZkQlFYRkNMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJTeERRVUZETEVOQlFVTTdTVUZEYUVZc1EwRkJReXhEUVVGRE8wRkJRMG9zUTBGQlF5eERRVUZETzBGQlRGY3NVVUZCUVN4UFFVRlBMRmRCUzJ4Q0luMD0iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkhMUyA9IHZvaWQgMDtcclxuY2xhc3MgSExTIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2hlYWRlciA9IFtcIiNFWFRNM1VcIiwgXCIjRVhULVgtVkVSU0lPTjozXCIsIFwiI0VYVC1YLVRBUkdFVERVUkFUSU9OOjZcIiwgXCIjRVhULVgtTUVESUEtU0VRVUVOQ0U6XCJdO1xyXG4gICAgICAgIHRoaXMuX3BsYXlsaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSAwO1xyXG4gICAgfVxyXG4gICAgYWRkUGxheWxpc3RUZXN0KHBsYXlsaXN0KSB7IH1cclxuICAgIGFkZFBsYXlsaXN0KHBsYXlsaXN0LCBhbGxvd0FkcyA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKHBsYXlsaXN0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IHBsYXlsaXN0LnRvU3RyaW5nKCkuc3BsaXQoL1tcXHJcXG5dLyk7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyWzRdID0gbGluZXNbNF07XHJcbiAgICAgICAgdGhpcy5faGVhZGVyWzVdID0gbGluZXNbNV07XHJcbiAgICAgICAgLy90YWtlIGFsbCBtM3U5IGNvbnRlbnQgdG8gdGhlIHBsYXlsaXN0IGFuZCBidWlsZCBhIHZhcmlibGVcclxuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gbGluZXMpIHtcclxuICAgICAgICAgICAgaWYgKGxpbmVzW2ldLmluY2x1ZGVzKFwiI0VYVElORlwiKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFhbGxvd0Fkcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbGluZXNbaV0uaW5jbHVkZXMoXCIsbGl2ZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL3RpbWVzdGFtcCBzZXF1ZW5jZVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VxdWVuY2VUaW1lc3RhbXAgPSBNYXRoLmZsb29yKG5ldyBEYXRlKGxpbmVzW3BhcnNlSW50KGkpIC0gMV0uc2xpY2UobGluZXNbcGFyc2VJbnQoaSkgLSAxXS5sZW5ndGggLSAyNCwgbGluZXNbcGFyc2VJbnQoaSkgLSAxXS5sZW5ndGgpKS5nZXRUaW1lKCkgLyAxMDAwKTtcclxuICAgICAgICAgICAgICAgIC8vc2VsZWN0IGFsbCBzZXF1ZW5jZSB0aGF0IG5vIGV4aXN0XHJcbiAgICAgICAgICAgICAgICBjb25zdCByID0gdGhpcy5fcGxheWxpc3QuZmlsdGVyKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudGltZXN0YW1wID49IHNlcXVlbmNlVGltZXN0YW1wO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvL2FkZCB0aGUgc2VxdWVuY2Ugb24gcGxheWxpc3QgdmFyaWFibGUgaWYgaXQgbm8gZXhpc3RcclxuICAgICAgICAgICAgICAgIGlmICghci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXF1ZW5jZSA9IHRoaXMuX3NlcXVlbmNlICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogbGluZXNbcGFyc2VJbnQoaSkgLSAxXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBzZXF1ZW5jZVRpbWVzdGFtcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mbzogbGluZXNbcGFyc2VJbnQoaSldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGxpbmVzW3BhcnNlSW50KGkpICsgMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5fcGxheWxpc3QubGVuZ3RoID4gMTUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkO1xyXG4gICAgfVxyXG4gICAgZ2V0UGxheWxpc3QoKSB7XHJcbiAgICAgICAgbGV0IHBsYXlsaXN0ID0gXCJcIjtcclxuICAgICAgICB0aGlzLl9wbGF5bGlzdC5mb3JFYWNoKCh4KSA9PiAocGxheWxpc3QgPSBwbGF5bGlzdCArIHgudGltZSArIFwiXFxuXCIgKyB4LmluZm8gKyBcIlxcblwiICsgeC51cmwgKyBcIlxcblwiKSk7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9oZWFkZXJbMF0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzFdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclsyXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbM10gK1xyXG4gICAgICAgICAgICB0aGlzLl9zZXF1ZW5jZSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNF0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzVdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHBsYXlsaXN0KTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkhMUyA9IEhMUztcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU0V4VExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDJoc2N5OUlURk11ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWpzN08wRkJRVUVzVFVGQllTeEhRVUZITzBsQlFXaENPMUZCUTFVc1dVRkJUeXhIUVVGclFpeERRVUZETEZOQlFWTXNSVUZCUlN4clFrRkJhMElzUlVGQlJTeDVRa0ZCZVVJc1JVRkJSU3gzUWtGQmQwSXNRMEZCUXl4RFFVRkRPMUZCUXpsSExHTkJRVk1zUjBGQmJVSXNSVUZCUlN4RFFVRkRPMUZCUXk5Q0xHTkJRVk1zUjBGQlJ5eERRVUZETEVOQlFVTTdTVUYzUlhoQ0xFTkJRVU03U1VGMFJVTXNaVUZCWlN4RFFVRkRMRkZCUVdkQ0xFbEJRVWNzUTBGQlF6dEpRVVZ3UXl4WFFVRlhMRU5CUVVNc1VVRkJaMElzUlVGQlJTeFhRVUZ2UWl4TFFVRkxPMUZCUTNKRUxFbEJRVWtzVVVGQlVTeExRVUZMTEVsQlFVa3NSVUZCUlR0WlFVTnlRaXhQUVVGUExFdEJRVXNzUTBGQlF6dFRRVU5rTzFGQlJVUXNTVUZCU1N4UFFVRlBMRWRCUVVjc1MwRkJTeXhEUVVGRE8xRkJSWEJDTEUxQlFVMHNTMEZCU3l4SFFVRkhMRkZCUVZFc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRiRVFzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETTBJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRk0wSXNNa1JCUVRKRU8xRkJRek5FTEV0QlFVc3NUVUZCVFN4RFFVRkRMRWxCUVVrc1MwRkJTeXhGUVVGRk8xbEJRM0pDTEVsQlFVa3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eFRRVUZUTEVOQlFVTXNSVUZCUlR0blFrRkRhRU1zU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlR0dlFrRkRZaXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdDNRa0ZETDBJc1UwRkJVenR4UWtGRFZqdHBRa0ZEUmp0blFrRkRSQ3h2UWtGQmIwSTdaMEpCUTNCQ0xFMUJRVTBzYVVKQlFXbENMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGRGJFTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVkQlFVY3NSVUZCUlN4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUXpOSUxFTkJRVU03WjBKQlJVWXNiVU5CUVcxRE8yZENRVU51UXl4TlFVRk5MRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRk8yOUNRVU53UXl4UFFVRlBMRU5CUVVNc1EwRkJReXhUUVVGVExFbEJRVWtzYVVKQlFXbENMRU5CUVVNN1owSkJRekZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOSUxITkVRVUZ6UkR0blFrRkRkRVFzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVN2IwSkJRMklzU1VGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1UwRkJVeXhIUVVGSExFTkJRVU1zUTBGQlF6dHZRa0ZEY0VNc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVOQlFVTTdkMEpCUTJ4Q0xFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dDNRa0ZETlVJc1UwRkJVeXhGUVVGRkxHbENRVUZwUWp0M1FrRkROVUlzU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEzaENMRWRCUVVjc1JVRkJSU3hMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenR4UWtGRE5VSXNRMEZCUXl4RFFVRkRPMjlDUVVOSUxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTTdhVUpCUTJoQ08yZENRVU5FTEU5QlFVOHNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhOUVVGTkxFZEJRVWNzUlVGQlJTeEZRVUZGTzI5Q1FVTnFReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMmxDUVVONFFqdGhRVU5HTzFOQlEwWTdVVUZEUkN4UFFVRlBMRTlCUVU4c1EwRkJRenRKUVVOcVFpeERRVUZETzBsQlJVUXNWMEZCVnp0UlFVTlVMRWxCUVVrc1VVRkJVU3hIUVVGWExFVkJRVVVzUTBGQlF6dFJRVVV4UWl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhSUVVGUkxFZEJRVWNzVVVGQlVTeEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRWRCUVVjc1NVRkJTU3hIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTndSeXhQUVVGUExFTkJRMHdzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSkxFTkJRVU1zVTBGQlV6dFpRVU5rTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU5tTEVsQlFVazdXVUZEU2l4UlFVRlJMRU5CUTFRc1EwRkJRenRKUVVOS0xFTkJRVU03UTBGRFJqdEJRVE5GUkN4clFrRXlSVU1pZlE9PSIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5QbGF5ZXIgPSB2b2lkIDA7XHJcbmNvbnN0IHN0cmVhbV8xID0gcmVxdWlyZShcIi4uL3N0cmVhbS9zdHJlYW1cIik7XHJcbmNvbnN0IHN0cmVhbV90eXBlXzEgPSByZXF1aXJlKFwiLi4vc3RyZWFtL2ludGVyZmFjZS9zdHJlYW0udHlwZVwiKTtcclxuY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuc3RyZWFtTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuYWN0dWFsQ2hhbm5lbCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5wbGF5aW5nQWRzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHsgd2hpdGVsaXN0OiBbXSwgdG9nZ2xlUHJveHk6IHRydWUsIHByb3h5VXJsOiBcIlwiIH07XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gXCJcIjtcclxuICAgICAgICB0aGlzLm9uU3RhcnRBZHMgPSAoKSA9PiB7IH07XHJcbiAgICAgICAgdGhpcy5vbkVuZEFkcyA9ICgpID0+IHsgfTtcclxuICAgICAgICB0aGlzLmlzQWRzID0gKHgsIGFsbG93Q2hhbmdlID0gZmFsc2UpID0+IHtcclxuICAgICAgICAgICAgLy8gY29uc3QgYWRzID0geC50b1N0cmluZygpLmluY2x1ZGVzKFwic3RpdGNoZWQtYWRcIikgfHwgeC50b1N0cmluZygpLmluY2x1ZGVzKFwidHdpdGNoLWNsaWVudC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtYWQtcXVhcnRpbGVcIik7XHJcbiAgICAgICAgICAgIGNvbnN0IGFkcyA9IHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInN0aXRjaGVkXCIpO1xyXG4gICAgICAgICAgICBpZiAoIWFsbG93Q2hhbmdlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkcztcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWluZ0FkcyAhPSBhZHMgJiYgYWRzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vblN0YXJ0QWRzKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBsYXlpbmdBZHMgIT0gYWRzICYmICFhZHMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRW5kQWRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWluZ0FkcyA9IGFkcztcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGxheWluZ0FkcztcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuY3VycmVudFN0cmVhbSA9IChjaGFubmVsID0gdGhpcy5hY3R1YWxDaGFubmVsKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0cmVhbUxpc3QuZmluZCgoeCkgPT4geC5jaGFubmVsTmFtZSA9PT0gY2hhbm5lbCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGlzV2hpdGVsaXN0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5zZXR0aW5ncy53aGl0ZWxpc3QpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy53aGl0ZWxpc3QuaW5jbHVkZXModGhpcy5hY3R1YWxDaGFubmVsKSAmJiB0aGlzLmN1cnJlbnRTdHJlYW0oKSA9PSB1bmRlZmluZWQgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcbiAgICBvbmZldGNoKHVybCwgcmVzcG9uc2UpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50U3RyZWFtID0geWllbGQgdGhpcy5jdXJyZW50U3RyZWFtKCk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTdHJlYW0uaGxzLmFkZFBsYXlsaXN0KHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQWRzKHJlc3BvbnNlLCB0cnVlKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWwgPSB5aWVsZCB0aGlzLmZldGNobTN1OEJ5U3RyZWFtVHlwZShzdHJlYW1fdHlwZV8xLnN0cmVhbXMubG9jYWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsKVxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdHJlYW0uaGxzLmFkZFBsYXlsaXN0KGxvY2FsKTtcclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0cmVhbS5zdHJlYW1BY2Nlc3Moc3RyZWFtX3R5cGVfMS5zdHJlYW1zLmxvY2FsKTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2NhbClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsID0geWllbGQgdGhpcy5mZXRjaG0zdThCeVN0cmVhbVR5cGUoc3RyZWFtX3R5cGVfMS5zdHJlYW1zLmV4dGVybmFsKTtcclxuICAgICAgICAgICAgICAgIGlmIChleHRlcm5hbClcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChleHRlcm5hbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZXJuYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxcIik7XHJcbiAgICAgICAgICAgICAgICAvLyBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChyZXNwb25zZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGZldGNobTN1OEJ5U3RyZWFtVHlwZShhY2Nlc3NUeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgTG9nUHJpbnQoXCJTdHJlYW0gVHlwZTogXCIgKyBhY2Nlc3NUeXBlLm5hbWUpO1xyXG4gICAgICAgICAgICBjb25zdCBzdHJlYW1VcmxMaXN0ID0gdGhpcy5jdXJyZW50U3RyZWFtKCkuZ2V0U3RyZWFtU2VydmVyc0J5U3RyZWFtVHlwZShhY2Nlc3NUeXBlLCB0aGlzLnF1YWxpdHkpO1xyXG4gICAgICAgICAgICAvL2J5IHRoZSBhcnJheSBvcmRlciwgdHJ5IGdldCBtM3U4IGNvbnRlbnQgYW5kIHJldHVybiBpZiBkb24ndCBoYXZlIGFkcy5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBzdHJlYW1Vcmwgb2Ygc3RyZWFtVXJsTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHlpZWxkICh5aWVsZCBnbG9iYWwucmVhbEZldGNoKHN0cmVhbVVybCA9PT0gbnVsbCB8fCBzdHJlYW1VcmwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHN0cmVhbVVybC51cmwpKS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0Fkcyh0ZXh0KSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgb25TdGFydENoYW5uZWwodXJsLCB0ZXh0KSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgY29uc3QgY2hhbm5lbE5hbWUgPSAvaGxzXFwvKC4qKS5tM3U4L2dtLmV4ZWModXJsKSB8fCBbXTtcclxuICAgICAgICAgICAgbGV0IGV4aXN0ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIExvZ1ByaW50KFwiQ2hhbm5lbCBcIiArIGNoYW5uZWxOYW1lWzFdKTtcclxuICAgICAgICAgICAgdGhpcy5hY3R1YWxDaGFubmVsID0gY2hhbm5lbE5hbWVbMV07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzV2hpdGVsaXN0KCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zdHJlYW1MaXN0LmZpbmQoKGMpID0+IGMuY2hhbm5lbE5hbWUgPT09IHRoaXMuYWN0dWFsQ2hhbm5lbCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBwcm94eVVybCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncylcclxuICAgICAgICAgICAgICAgICAgICBwcm94eVVybCA9IHRoaXMuc2V0dGluZ3MucHJveHlVcmwgPyB0aGlzLnNldHRpbmdzLnByb3h5VXJsIDogXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RyZWFtTGlzdC5wdXNoKG5ldyBzdHJlYW1fMS5TdHJlYW0odGhpcy5hY3R1YWxDaGFubmVsLCBwcm94eVVybCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgTG9nUHJpbnQoXCJFeGlzdDogXCIgKyB0aGlzLmFjdHVhbENoYW5uZWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RyZWFtKCkuc2VydmVyTGlzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZXhpc3RlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbSA9IHRoaXMuY3VycmVudFN0cmVhbSgpO1xyXG4gICAgICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAgICAgICAgIExvZ1ByaW50KFwiTG9jYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgICAgICAgICB5aWVsZCBzdHJlYW0uYWRkU3RyZWFtTGluayh0ZXh0LCBcImxvY2FsXCIpO1xyXG4gICAgICAgICAgICBMb2dQcmludChcIkxvY2FsIFNlcnZlcjogT0tcIik7XHJcbiAgICAgICAgICAgIHN0cmVhbS5zdHJlYW1BY2Nlc3Moc3RyZWFtX3R5cGVfMS5zdHJlYW1zLmxvY2FsKTtcclxuICAgICAgICAgICAgaWYgKGV4aXN0ZW50KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAvL2lmIHRoZSBwcm94eSBvcHRpb24gb24gcG9wdXAgaXMgZGlzYWJsZWQsIGl0IGlzIG5ldmVyIGNhbGxlZC5cclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnRvZ2dsZVByb3h5KVxyXG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbS50cnlFeHRlcm5hbFBsYXllcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBsYXllciA9IFBsYXllcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0d4aGVXVnlMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwzQnNZWGxsY2k5d2JHRjVaWEl1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWpzN096czdPenM3T3pzN08wRkJRVUVzTmtOQlFUQkRPMEZCUXpGRExHbEZRVUZ6UlR0QlFVbDBSU3hOUVVGaExFMUJRVTA3U1VGQmJrSTdVVUZEUlN4bFFVRlZMRWRCUVdFc1JVRkJSU3hEUVVGRE8xRkJRekZDTEd0Q1FVRmhMRWRCUVZjc1JVRkJSU3hEUVVGRE8xRkJRek5DTEdWQlFWVXNSMEZCUnl4TFFVRkxMRU5CUVVNN1VVRkRia0lzWVVGQlVTeEhRVUZaTEVWQlFVVXNVMEZCVXl4RlFVRkZMRVZCUVVVc1JVRkJSU3hYUVVGWExFVkJRVVVzU1VGQlNTeEZRVUZGTEZGQlFWRXNSVUZCUlN4RlFVRkZMRVZCUVVVc1EwRkJRenRSUVVOMlJTeFpRVUZQTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUlhKQ0xHVkJRVlVzUjBGQlJ5eEhRVUZITEVWQlFVVXNSMEZCUlN4RFFVRkRMRU5CUVVNN1VVRkRkRUlzWVVGQlVTeEhRVUZITEVkQlFVY3NSVUZCUlN4SFFVRkZMRU5CUVVNc1EwRkJRenRSUVVWd1FpeFZRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRlRMRVZCUVVVc1kwRkJkVUlzUzBGQlN5eEZRVUZGTEVWQlFVVTdXVUZEYkVRc1owcEJRV2RLTzFsQlEyaEtMRTFCUVUwc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03V1VGRE9VTXNTVUZCU1N4RFFVRkRMRmRCUVZjN1owSkJRVVVzVDBGQlR5eEhRVUZITEVOQlFVTTdXVUZETjBJc1NVRkJTU3hKUVVGSkxFTkJRVU1zVlVGQlZTeEpRVUZKTEVkQlFVY3NTVUZCU1N4SFFVRkhPMmRDUVVGRkxFbEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNRMEZCUXp0WlFVTnlSQ3hKUVVGSkxFbEJRVWtzUTBGQlF5eFZRVUZWTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSenRuUWtGQlJTeEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNN1dVRkRjRVFzU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUnl4SFFVRkhMRU5CUVVNN1dVRkZkRUlzVDBGQlR5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRPMUZCUTNwQ0xFTkJRVU1zUTBGQlF6dFJRVVZHTEd0Q1FVRmhMRWRCUVVjc1EwRkJReXhWUVVGclFpeEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRlZMRVZCUVVVN1dVRkRMMFFzVDBGQlR5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVk1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRmRCUVZjc1MwRkJTeXhQUVVGUExFTkJRVVVzUTBGQlF6dFJRVU42UlN4RFFVRkRMRU5CUVVNN1NVRnZSa29zUTBGQlF6dEpRV3hHUXl4WFFVRlhPMUZCUTFRc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNVMEZCVXp0WlFVRkZMRTlCUVU4c1MwRkJTeXhEUVVGRE8xRkJRek5ETEU5QlFVOHNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhUUVVGVExFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zWVVGQllTeEZRVUZGTEVsQlFVa3NVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXp0SlFVTnNTQ3hEUVVGRE8wbEJSVXNzVDBGQlR5eERRVUZETEVkQlFWY3NSVUZCUlN4UlFVRm5RanM3V1VGRGVrTXNUVUZCVFN4aFFVRmhMRWRCUVZjc1RVRkJUU3hKUVVGSkxFTkJRVU1zWVVGQllTeEZRVUZGTEVOQlFVTTdXVUZEZWtRc1lVRkJZU3hEUVVGRExFZEJRVWNzUTBGQlF5eFhRVUZYTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1dVRkZlRU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hGUVVGRkxFbEJRVWtzUTBGQlF6dG5Ra0ZCUlN4UFFVRlBMRWxCUVVrc1EwRkJRenRaUVVVM1F5eEpRVUZKTzJkQ1FVTkdMRTFCUVUwc1MwRkJTeXhIUVVGSExFMUJRVTBzU1VGQlNTeERRVUZETEhGQ1FVRnhRaXhEUVVGRExIRkNRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1owSkJRemxFTEVsQlFVa3NTMEZCU3p0dlFrRkJSU3hoUVVGaExFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRuUWtGRGFFUXNTVUZCU1N4RFFVRkRMRXRCUVVzN2IwSkJRVVVzWVVGQllTeERRVUZETEZsQlFWa3NRMEZCUXl4eFFrRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzJkQ1FVTjBSQ3hKUVVGSkxFdEJRVXM3YjBKQlFVVXNUMEZCVHl4SlFVRkpMRU5CUVVNN1owSkJSWFpDTEUxQlFVMHNVVUZCVVN4SFFVRkhMRTFCUVUwc1NVRkJTU3hEUVVGRExIRkNRVUZ4UWl4RFFVRkRMSEZDUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdaMEpCUTNCRkxFbEJRVWtzVVVGQlVUdHZRa0ZCUlN4aFFVRmhMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0blFrRkRkRVFzU1VGQlNTeFJRVUZSTzI5Q1FVRkZMRTlCUVU4c1NVRkJTU3hEUVVGRE8yZENRVVV4UWl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzJkQ1FVVndRaXhwUkVGQmFVUTdaMEpCUTJwRUxFOUJRVThzUzBGQlN5eERRVUZETzJGQlEyUTdXVUZCUXl4UFFVRlBMRU5CUVUwc1JVRkJSVHRuUWtGRFppeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dGhRVU40UWp0UlFVTklMRU5CUVVNN1MwRkJRVHRKUVVWTExIRkNRVUZ4UWl4RFFVRkRMRlZCUVhOQ096dFpRVU5vUkN4UlFVRlJMRU5CUVVNc1pVRkJaU3hIUVVGSExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0WlFVVTFReXhOUVVGTkxHRkJRV0VzUjBGQmFVSXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSU3hEUVVGRExEUkNRVUUwUWl4RFFVRkRMRlZCUVZVc1JVRkJSU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdXVUZGYUVnc2QwVkJRWGRGTzFsQlEzaEZMRXRCUVVzc1RVRkJUU3hUUVVGVExFbEJRVWtzWVVGQllTeEZRVUZGTzJkQ1FVTnlReXhOUVVGTkxFbEJRVWtzUjBGQlZ5eE5RVUZOTEVOQlFVTXNUVUZCVFN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExGTkJRVk1zWVVGQlZDeFRRVUZUTEhWQ1FVRlVMRk5CUVZNc1EwRkJSU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMmRDUVVNelJTeEpRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRE8yOUNRVUZGTEZOQlFWTTdaMEpCUXk5Q0xFOUJRVThzU1VGQlNTeERRVUZETzJGQlEySTdXVUZGUkN4UFFVRlBMRVZCUVVVc1EwRkJRenRSUVVOYUxFTkJRVU03UzBGQlFUdEpRVU5MTEdOQlFXTXNRMEZCUXl4SFFVRlhMRVZCUVVVc1NVRkJXVHM3V1VGRE5VTXNUVUZCVFN4WFFVRlhMRWRCUVhsQ0xHdENRVUZyUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdXVUZETjBVc1NVRkJTU3hSUVVGUkxFZEJRVWNzUzBGQlN5eERRVUZETzFsQlJYSkNMRkZCUVZFc1EwRkJReXhWUVVGVkxFZEJRVWNzVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRkRU1zU1VGQlNTeERRVUZETEdGQlFXRXNSMEZCUnl4WFFVRlhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRmNFTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1YwRkJWeXhGUVVGRk8yZENRVUZGTEU5QlFVOHNTMEZCU3l4RFFVRkRPMWxCUlhKRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVk1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRmRCUVZjc1MwRkJTeXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVWQlFVVTdaMEpCUXpsRkxFbEJRVWtzVVVGQlVTeEhRVUZITEVWQlFVVXNRMEZCUXp0blFrRkRiRUlzU1VGQlNTeEpRVUZKTEVOQlFVTXNVVUZCVVR0dlFrRkJSU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU03WjBKQlEyNUdMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NaVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXp0aFFVTm9SVHRwUWtGQlRUdG5Ra0ZEVEN4UlFVRlJMRU5CUVVNc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXp0blFrRkRla01zU1VGQlNTeERRVUZETEdGQlFXRXNSVUZCUlN4RFFVRkRMRlZCUVZVc1IwRkJSeXhGUVVGRkxFTkJRVU03WjBKQlEzSkRMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU03WVVGRGFrSTdXVUZGUkN4TlFVRk5MRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zWVVGQllTeEZRVUZGTEVOQlFVTTdXVUZEY0VNc1owUkJRV2RFTzFsQlJXaEVMR2RFUVVGblJEdFpRVU5vUkN4UlFVRlJMRU5CUVVNc2RVSkJRWFZDTEVOQlFVTXNRMEZCUXp0WlFVTnNReXhOUVVGTkxFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8xbEJRekZETEZGQlFWRXNRMEZCUXl4clFrRkJhMElzUTBGQlF5eERRVUZETzFsQlJUZENMRTFCUVUwc1EwRkJReXhaUVVGWkxFTkJRVU1zY1VKQlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRaUVVWdVF5eEpRVUZKTEZGQlFWRTdaMEpCUVVVc1QwRkJUenRaUVVWeVFpd3JSRUZCSzBRN1dVRkRMMFFzU1VGQlNTeEpRVUZKTEVOQlFVTXNVVUZCVVN4RlFVRkZPMmRDUVVOcVFpeEpRVUZKTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWenR2UWtGQlJTeE5RVUZOTEVOQlFVTXNhVUpCUVdsQ0xFVkJRVVVzUTBGQlF6dGhRVU16UkR0WlFVVkVMRTlCUVU4N1VVRkRWQ3hEUVVGRE8wdEJRVUU3UTBGRFJqdEJRVE5IUkN4M1FrRXlSME1pZlE9PSIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuc3RyZWFtcyA9IHZvaWQgMDtcclxuZXhwb3J0cy5zdHJlYW1zID0ge1xyXG4gICAgcGljdHVyZTogeyBwbGF5ZXJUeXBlOiBcInRodW5kZXJkb21lXCIsIG5hbWU6IFwibG93ZXJcIiB9LFxyXG4gICAgbG9jYWw6IHsgcGxheWVyVHlwZTogXCJlbWJlZFwiLCBuYW1lOiBcIm5vcm1hbFwiIH0sXHJcbiAgICBleHRlcm5hbDogeyBuYW1lOiBcImV4dGVybmFsXCIgfSxcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzNSeVpXRnRMblI1Y0dVdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOHVMaTl6Y21NdmMzUnlaV0Z0TDJsdWRHVnlabUZqWlM5emRISmxZVzB1ZEhsd1pTNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPenM3UVVGQllTeFJRVUZCTEU5QlFVOHNSMEZCUnp0SlFVTnlRaXhQUVVGUExFVkJRVVVzUlVGQlJTeFZRVUZWTEVWQlFVVXNZVUZCWVN4RlFVRkZMRWxCUVVrc1JVRkJSU3hQUVVGUExFVkJRVVU3U1VGRGNrUXNTMEZCU3l4RlFVRkZMRVZCUVVVc1ZVRkJWU3hGUVVGRkxFOUJRVThzUlVGQlJTeEpRVUZKTEVWQlFVVXNVVUZCVVN4RlFVRkZPMGxCUXpsRExGRkJRVkVzUlVGQlJTeEZRVUZGTEVsQlFVa3NSVUZCUlN4VlFVRlZMRVZCUVVVN1EwRkRMMElzUTBGQlF5SjkiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLnN0cmVhbVNlcnZlciA9IGV4cG9ydHMucXVhbGl0eVVybCA9IHZvaWQgMDtcclxuY2xhc3MgcXVhbGl0eVVybCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnVybCA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gXCJcIjtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLnF1YWxpdHlVcmwgPSBxdWFsaXR5VXJsO1xyXG5jbGFzcyBzdHJlYW1TZXJ2ZXIge1xyXG4gICAgY29uc3RydWN0b3IocGFydGlhbCkge1xyXG4gICAgICAgIHRoaXMuYmVzdFF1YWxpdHkgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVybExpc3RbMF07XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmZpbmRCeVF1YWxpdHkgPSAocXVhbGl0eSkgPT4gdGhpcy51cmxMaXN0LmZpbmQoKHgpID0+IHgucXVhbGl0eSA9PSBxdWFsaXR5KTtcclxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHBhcnRpYWwpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuc3RyZWFtU2VydmVyID0gc3RyZWFtU2VydmVyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdFUyVnlkbVZ5TG5SNWNHVnpMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2TGk0dmMzSmpMM04wY21WaGJTOXBiblJsY21aaFkyVXZjM1J5WldGdFUyVnlkbVZ5TG5SNWNHVnpMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3T3p0QlFVRkJMRTFCUVdFc1ZVRkJWVHRKUVVGMlFqdFJRVU5GTEZGQlFVY3NSMEZCVnl4RlFVRkZMRU5CUVVNN1VVRkRha0lzV1VGQlR5eEhRVUZYTEVWQlFVVXNRMEZCUXp0SlFVTjJRaXhEUVVGRE8wTkJRVUU3UVVGSVJDeG5RMEZIUXp0QlFVTkVMRTFCUVdFc1dVRkJXVHRKUVZWMlFpeFpRVUZaTEU5QlFUaENPMUZCVERGRExHZENRVUZYTEVkQlFVY3NSMEZCUnl4RlFVRkZPMWxCUTJwQ0xFOUJRVThzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVONlFpeERRVUZETEVOQlFVTTdVVUZEUml4clFrRkJZU3hIUVVGSExFTkJRVU1zVDBGQlpTeEZRVUZGTEVWQlFVVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVZHNSaXhOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRKUVVNdlFpeERRVUZETzBOQlEwWTdRVUZpUkN4dlEwRmhReUo5IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlN0cmVhbSA9IHZvaWQgMDtcclxuY29uc3QgSExTXzEgPSByZXF1aXJlKFwiLi4vaGxzL0hMU1wiKTtcclxuY29uc3Qgc3RyZWFtX3R5cGVfMSA9IHJlcXVpcmUoXCIuL2ludGVyZmFjZS9zdHJlYW0udHlwZVwiKTtcclxuY29uc3Qgc3RyZWFtU2VydmVyX3R5cGVzXzEgPSByZXF1aXJlKFwiLi9pbnRlcmZhY2Uvc3RyZWFtU2VydmVyLnR5cGVzXCIpO1xyXG5jbGFzcyBTdHJlYW0ge1xyXG4gICAgY29uc3RydWN0b3IoY2hhbm5lbE5hbWUsIHR1bm5lbCA9IFwiXCIpIHtcclxuICAgICAgICB0aGlzLnNlcnZlckxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLmhscyA9IG5ldyBITFNfMS5ITFMoKTtcclxuICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gXCJcIjtcclxuICAgICAgICB0aGlzLnR1bm5lbCA9IFtcImh0dHBzOi8vZXUxLmp1cHRlci5nYS9jaGFubmVsL3tjaGFubmVsbmFtZX1cIiwgXCJodHRwczovL2V1Mi5qdXB0ZXIuZ2EvY2hhbm5lbC97Y2hhbm5lbG5hbWV9XCJdO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFR1bm5lbCA9IHRoaXMudHVubmVsWzBdO1xyXG4gICAgICAgIHRoaXMudHJ5RXh0ZXJuYWxQbGF5ZXIgPSAoKSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghKHlpZWxkIHRoaXMuc3RyZWFtQWNjZXNzKHN0cmVhbV90eXBlXzEuc3RyZWFtcy5leHRlcm5hbCkpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dGVybmFsUGxheWVyKHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5jaGFubmVsTmFtZSA9IGNoYW5uZWxOYW1lO1xyXG4gICAgICAgIGlmICh0dW5uZWwpXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFR1bm5lbCA9IHR1bm5lbDtcclxuICAgIH1cclxuICAgIC8vYWRkIG0zdTggbGlua3Mgd2l0aCBxdWFsaXR5IHRvIHRoZSBsaXN0IG9mIHNlcnZlcnNcclxuICAgIGFkZFN0cmVhbUxpbmsodGV4dCwgdHlwZSA9IFwibG9jYWxcIiwgc2lnID0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHF1YWxpdHlVcmxTcGxpdCA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgY2FwdHVyZUFycmF5O1xyXG4gICAgICAgICAgICBjb25zdCBSRUdFWCA9IC9OQU1FPVwiKCg/OlxcUytcXHMrXFxTK3xcXFMrKSlcIixBVVRPKD86XnxcXFMrXFxzKykoPzpefFxcUytcXHMrKShodHRwczpcXC9cXC92aWRlbyhcXFMrKS5tM3U4KS9nO1xyXG4gICAgICAgICAgICB3aGlsZSAoKGNhcHR1cmVBcnJheSA9IFJFR0VYLmV4ZWModGV4dCkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBxdWFsaXR5VXJsU3BsaXQucHVzaCh7IHF1YWxpdHk6IGNhcHR1cmVBcnJheVsxXSwgdXJsOiBjYXB0dXJlQXJyYXlbMl0gfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgc3RyZWFtTGlzdCA9IG5ldyBzdHJlYW1TZXJ2ZXJfdHlwZXNfMS5zdHJlYW1TZXJ2ZXIoeyB0eXBlOiB0eXBlLCB1cmxMaXN0OiBxdWFsaXR5VXJsU3BsaXQsIHNpZzogc2lnIH0pO1xyXG4gICAgICAgICAgICB0aGlzLnNlcnZlckxpc3QucHVzaChzdHJlYW1MaXN0KTtcclxuICAgICAgICAgICAgaWYgKCFzaWcpIHtcclxuICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMuc2lnbmF0dXJlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzaWduYXR1cmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgY29uc3QgUkVHRVggPSAvdmlkZW8td2VhdmVyLiguKikuaGxzLnR0dm53Lm5ldFxcL3YxXFwvcGxheWxpc3RcXC8oLiopLm0zdTgkL2dtO1xyXG4gICAgICAgICAgICB5aWVsZCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXJ2ZXJMaXN0XHJcbiAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4geC5zaWcgPT0gZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goKHgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IFJFR0VYLmV4ZWMoeC51cmxMaXN0WzBdLnVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBmZXRjaChcImh0dHBzOi8vanVwdGVyLmdhL2hscy92Mi9zaWcvXCIgKyBtYXRjaFsyXSArIFwiL1wiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeC5zaWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoX2EpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KSksXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy9hZGQgYSBuZXcgcGxheWVyIHN0cmVhbSBleHRlcm5hbFxyXG4gICAgZXh0ZXJuYWxQbGF5ZXIoY3VzdG9tSWdub3JlID0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBpZiAoY3VzdG9tSWdub3JlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50VHVubmVsID0gdGhpcy50dW5uZWxbMF07XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJFeHRlcm5hbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godGhpcy5jdXJyZW50VHVubmVsLnJlcGxhY2UoXCJ7Y2hhbm5lbG5hbWV9XCIsIHRoaXMuY2hhbm5lbE5hbWUpKTtcclxuICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXJ2ZXIgcHJveHkgcmV0dXJuIGVycm9yIG9yIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB5aWVsZCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJFeHRlcm5hbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTdHJlYW1MaW5rKHRleHQsIHN0cmVhbV90eXBlXzEuc3RyZWFtcy5leHRlcm5hbC5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJzZXJ2ZXIgcHJveHkgcmV0dXJuIGVycm9yIG9yIG5vdCBmb3VuZCBcIiArIHRoaXMuY3VycmVudFR1bm5lbCk7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vY3JlYXRlIGEgbmV3IHN0cmVhbSBhY2Nlc3NcclxuICAgIHN0cmVhbUFjY2VzcyhzdHJlYW0pIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBpZiAoc3RyZWFtLm5hbWUgPT0gc3RyZWFtX3R5cGVfMS5zdHJlYW1zLmV4dGVybmFsLm5hbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4geWllbGQgdGhpcy5leHRlcm5hbFBsYXllcigpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnkgPSAncXVlcnkgUGxheWJhY2tBY2Nlc3NUb2tlbl9UZW1wbGF0ZSgkbG9naW46IFN0cmluZyEsICRpc0xpdmU6IEJvb2xlYW4hLCAkdm9kSUQ6IElEISwgJGlzVm9kOiBCb29sZWFuISwgJHBsYXllclR5cGU6IFN0cmluZyEpIHsgIHN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW4oY2hhbm5lbE5hbWU6ICRsb2dpbiwgcGFyYW1zOiB7cGxhdGZvcm06IFwid2ViXCIsIHBsYXllckJhY2tlbmQ6IFwibWVkaWFwbGF5ZXJcIiwgcGxheWVyVHlwZTogJHBsYXllclR5cGV9KSBAaW5jbHVkZShpZjogJGlzTGl2ZSkgeyAgICB2YWx1ZSAgICBzaWduYXR1cmUgICAgX190eXBlbmFtZSAgfSAgdmlkZW9QbGF5YmFja0FjY2Vzc1Rva2VuKGlkOiAkdm9kSUQsIHBhcmFtczoge3BsYXRmb3JtOiBcIndlYlwiLCBwbGF5ZXJCYWNrZW5kOiBcIm1lZGlhcGxheWVyXCIsIHBsYXllclR5cGU6ICRwbGF5ZXJUeXBlfSkgQGluY2x1ZGUoaWY6ICRpc1ZvZCkgeyAgICB2YWx1ZSAgICBzaWduYXR1cmUgICAgX190eXBlbmFtZSAgfX0nO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25OYW1lOiBcIlBsYXliYWNrQWNjZXNzVG9rZW5fVGVtcGxhdGVcIixcclxuICAgICAgICAgICAgICAgICAgICBxdWVyeTogcXVlcnksXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTGl2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW46IHRoaXMuY2hhbm5lbE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVm9kOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm9kSUQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllclR5cGU6IHN0cmVhbS5wbGF5ZXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ3FsID0geWllbGQgZ2xvYmFsLnJlYWxGZXRjaChcImh0dHBzOi8vZ3FsLnR3aXRjaC50di9ncWxcIiwge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogeyBcIkNsaWVudC1JRFwiOiBcImtpbW5lNzhreDNuY3g2YnJnbzRtdjZ3a2k1aDFrb1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmVhbURhdGFBY2Nlc3MgPSB5aWVsZCBncWwuanNvbigpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gXCJodHRwczovL3VzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiLm0zdTg/YWxsb3dfc291cmNlPXRydWUmZmFzdF9icmVhZD10cnVlJnA9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDFlNykgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJnBsYXllcl9iYWNrZW5kPW1lZGlhcGxheWVyJnBsYXlsaXN0X2luY2x1ZGVfZnJhbWVyYXRlPXRydWUmcmVhc3NpZ25tZW50c19zdXBwb3J0ZWQ9ZmFsc2Umc2lnPVwiICtcclxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1EYXRhQWNjZXNzLmRhdGEuc3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlbi5zaWduYXR1cmUgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiJnN1cHBvcnRlZF9jb2RlY3M9YXZjMSZ0b2tlbj1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtRGF0YUFjY2Vzcy5kYXRhLnN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW4udmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0geWllbGQgKHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsKSkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiU2VydmVyIGxvYWRlZCBcIiArIHN0cmVhbS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkU3RyZWFtTGluayh0ZXh0LCBzdHJlYW0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGdldFN0cmVhbVNlcnZlcnNCeVN0cmVhbVR5cGUoYWNjZXNzVHlwZSwgcXVhbGl0eSkge1xyXG4gICAgICAgIC8vZmlsdGVyIGFsbCBzZXJ2ZXIgYnkgdHlwZVxyXG4gICAgICAgIGNvbnN0IHNlcnZlcnMgPSB0aGlzLnNlcnZlckxpc3QuZmlsdGVyKCh4KSA9PiB4LnR5cGUgPT0gYWNjZXNzVHlwZS5uYW1lKTtcclxuICAgICAgICBpZiAoIXNlcnZlcnMpXHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAvL2ZpbHRlciBhbGwgc2VydmVyIHVybCBieSBxdWFsaXR5IG9yIGJlc3RxdWFsaXR5XHJcbiAgICAgICAgY29uc3Qgc3RyZWFtVXJsTGlzdCA9IHNlcnZlcnMubWFwKCh4KSA9PiB4LmZpbmRCeVF1YWxpdHkocXVhbGl0eSkpLmZpbHRlcigoeCkgPT4geCAhPT0gdW5kZWZpbmVkKTtcclxuICAgICAgICByZXR1cm4gIXN0cmVhbVVybExpc3QubGVuZ3RoID8gc2VydmVycy5tYXAoKHgpID0+IHguYmVzdFF1YWxpdHkoKSkgOiBzdHJlYW1VcmxMaXN0O1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuU3RyZWFtID0gU3RyZWFtO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDNOMGNtVmhiUzl6ZEhKbFlXMHVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPenM3TzBGQlFVRXNiME5CUVdsRE8wRkJRMnBETEhsRVFVRTRSRHRCUVVNNVJDeDFSVUZCTUVVN1FVRkZNVVVzVFVGQllTeE5RVUZOTzBsQlVXcENMRmxCUVZrc1YwRkJiVUlzUlVGQlJTeFRRVUZwUWl4RlFVRkZPMUZCVUhCRUxHVkJRVlVzUjBGQmJVSXNSVUZCUlN4RFFVRkRPMUZCUTJoRExGRkJRVWNzUjBGQlVTeEpRVUZKTEZOQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTNKQ0xHZENRVUZYTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUlhwQ0xGZEJRVTBzUjBGQlJ5eERRVUZETERaRFFVRTJReXhGUVVGRkxEWkRRVUUyUXl4RFFVRkRMRU5CUVVNN1VVRkRlRWNzYTBKQlFXRXNSMEZCVnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzFGQk5FVjJReXh6UWtGQmFVSXNSMEZCUnl4SFFVRlRMRVZCUVVVN1dVRkROMElzU1VGQlNTeERRVUZETEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1dVRkJXU3hEUVVGRExIRkNRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1JVRkJSVHRuUWtGRGFFUXNTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dGhRVU16UWp0UlFVTklMRU5CUVVNc1EwRkJRU3hEUVVGRE8xRkJOMFZCTEVsQlFVa3NRMEZCUXl4WFFVRlhMRWRCUVVjc1YwRkJWeXhEUVVGRE8xRkJReTlDTEVsQlFVa3NUVUZCVFR0WlFVRkZMRWxCUVVrc1EwRkJReXhoUVVGaExFZEJRVWNzVFVGQlRTeERRVUZETzBsQlF6RkRMRU5CUVVNN1NVRkZSQ3h2UkVGQmIwUTdTVUZET1VNc1lVRkJZU3hEUVVGRExFbEJRVmtzUlVGQlJTeEpRVUZKTEVkQlFVY3NUMEZCVHl4RlFVRkZMRWRCUVVjc1IwRkJSeXhKUVVGSk96dFpRVU14UkN4TlFVRk5MR1ZCUVdVc1IwRkJhVUlzUlVGQlJTeERRVUZETzFsQlEzcERMRWxCUVVrc1dVRkJiME1zUTBGQlF6dFpRVVY2UXl4TlFVRk5MRXRCUVVzc1IwRkJSeXh4UmtGQmNVWXNRMEZCUXp0WlFVVndSeXhQUVVGUExFTkJRVU1zV1VGQldTeEhRVUZITEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZKTEVWQlFVVTdaMEpCUTJwRUxHVkJRV1VzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4UFFVRlBMRVZCUVVVc1dVRkJXU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVY3NSVUZCUlN4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzJGQlF6RkZPMWxCUlVRc1RVRkJUU3hWUVVGVkxFZEJRV2xDTEVsQlFVa3NhVU5CUVZrc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeEpRVUZKTEVWQlFVVXNUMEZCVHl4RlFVRkZMR1ZCUVdVc1JVRkJSU3hIUVVGSExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVOQlFVTXNRMEZCUXp0WlFVTjBSeXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRaUVVWcVF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZPMmRDUVVOU0xFMUJRVTBzU1VGQlNTeERRVUZETEZOQlFWTXNSVUZCUlN4RFFVRkRPMkZCUTNoQ08xbEJRMFFzVDBGQlR5eEpRVUZKTEVOQlFVTTdVVUZEWkN4RFFVRkRPMHRCUVVFN1NVRkZTeXhUUVVGVE96dFpRVU5pTEUxQlFVMHNTMEZCU3l4SFFVRkhMRFpFUVVFMlJDeERRVUZETzFsQlJUVkZMRTFCUVUwc1NVRkJTU3hQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNSVUZCUlR0blFrRkROVUlzU1VGQlNTeERRVUZETEZWQlFWVTdjVUpCUTFvc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhKUVVGSkxFdEJRVXNzUTBGQlF6dHhRa0ZEYkVNc1QwRkJUeXhEUVVGRExFTkJRVThzUTBGQlRTeEZRVUZGTEVWQlFVVTdiMEpCUTNoQ0xFMUJRVTBzUzBGQlN5eEhRVUV5UWl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03YjBKQlEyNUZMRWxCUVVrc1MwRkJTeXhGUVVGRk8zZENRVU5VTEVsQlFVazdORUpCUTBZc1RVRkJUU3hMUVVGTExFTkJRVU1zSzBKQlFTdENMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVkQlFVY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEZWtVc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTTdORUpCUTJJc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzNsQ1FVTm1PM2RDUVVGRExGZEJRVTA3TkVKQlEwNHNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8zbENRVU5vUWp0eFFrRkRSanQ1UWtGQlRUdDNRa0ZEVEN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03Y1VKQlEyaENPMmRDUVVOSUxFTkJRVU1zUTBGQlFTeERRVUZETzI5Q1FVTkdMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFpRVU51UWl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOTUxFTkJRVU03UzBGQlFUdEpRVVZFTEd0RFFVRnJRenRKUVVNMVFpeGpRVUZqTEVOQlFVTXNaVUZCZDBJc1MwRkJTenM3V1VGRGFFUXNTVUZCU1N4WlFVRlpPMmRDUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU4wUkN4SlFVRkpPMmRDUVVOR0xFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNNRUpCUVRCQ0xFTkJRVU1zUTBGQlF6dG5Ra0ZETlVNc1RVRkJUU3hSUVVGUkxFZEJRV0VzVFVGQlRTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zVDBGQlR5eERRVUZETEdWQlFXVXNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZGYWtnc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEVWQlFVVTdiMEpCUTJoQ0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNkME5CUVhkRExFTkJRVU1zUTBGQlF6dHBRa0ZETTBRN1owSkJSVVFzVFVGQlRTeEpRVUZKTEVkQlFWY3NUVUZCVFN4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03WjBKQlJUTkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1EwRkJRenRuUWtGRmRrTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFVkJRVVVzY1VKQlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlJXaEVMRTlCUVU4c1NVRkJTU3hEUVVGRE8yRkJRMkk3V1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0blFrRkRWaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEhsRFFVRjVReXhIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXp0blFrRkRhRVlzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUWtGRGJrSXNUMEZCVHl4TFFVRkxMRU5CUVVNN1lVRkRaRHRSUVVOSUxFTkJRVU03UzBGQlFUdEpRVkZFTERSQ1FVRTBRanRKUVVOMFFpeFpRVUZaTEVOQlFVTXNUVUZCYTBJN08xbEJRMjVETEVsQlFVa3NUVUZCVFN4RFFVRkRMRWxCUVVrc1NVRkJTU3h4UWtGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpPMmRDUVVGRkxFOUJRVThzVFVGQlRTeEpRVUZKTEVOQlFVTXNZMEZCWXl4RlFVRkZMRU5CUVVNN1dVRkZOMFVzU1VGQlNUdG5Ra0ZEUml4TlFVRk5MRXRCUVVzc1IwRkRWQ3gxWmtGQmRXWXNRMEZCUXp0blFrRkRNV1lzVFVGQlRTeEpRVUZKTEVkQlFVYzdiMEpCUTFnc1lVRkJZU3hGUVVGRkxEaENRVUU0UWp0dlFrRkROME1zUzBGQlN5eEZRVUZGTEV0QlFVczdiMEpCUTFvc1UwRkJVeXhGUVVGRk8zZENRVU5VTEUxQlFVMHNSVUZCUlN4SlFVRkpPM2RDUVVOYUxFdEJRVXNzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnp0M1FrRkRka0lzUzBGQlN5eEZRVUZGTEV0QlFVczdkMEpCUTFvc1MwRkJTeXhGUVVGRkxFVkJRVVU3ZDBKQlExUXNWVUZCVlN4RlFVRkZMRTFCUVUwc1EwRkJReXhWUVVGVk8zRkNRVU01UWp0cFFrRkRSaXhEUVVGRE8yZENRVVZHTEUxQlFVMHNSMEZCUnl4SFFVRkhMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5d3lRa0ZCTWtJc1JVRkJSVHR2UWtGRE9VUXNUVUZCVFN4RlFVRkZMRTFCUVUwN2IwSkJRMlFzVDBGQlR5eEZRVUZGTEVWQlFVVXNWMEZCVnl4RlFVRkZMR2REUVVGblF5eEZRVUZGTzI5Q1FVTXhSQ3hKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNN2FVSkJRek5DTEVOQlFVTXNRMEZCUXp0blFrRkRTQ3hOUVVGTkxHZENRVUZuUWl4SFFVRlJMRTFCUVUwc1IwRkJSeXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzJkQ1FVVXZReXhOUVVGTkxFZEJRVWNzUjBGRFVDd3dRMEZCTUVNN2IwSkJRekZETEVsQlFVa3NRMEZCUXl4WFFVRlhPMjlDUVVOb1FpdzBRMEZCTkVNN2IwSkJRelZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXp0dlFrRkRMMElzWjBkQlFXZEhPMjlDUVVOb1J5eG5Ra0ZCWjBJc1EwRkJReXhKUVVGSkxFTkJRVU1zZVVKQlFYbENMRU5CUVVNc1UwRkJVenR2UWtGRGVrUXNLMEpCUVN0Q08yOUNRVU12UWl4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNlVUpCUVhsQ0xFTkJRVU1zUzBGQlN5eERRVUZETzJkQ1FVTjRSQ3hOUVVGTkxFbEJRVWtzUjBGQlJ5eE5RVUZOTEVOQlFVTXNUVUZCVFN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1owSkJSWGhFTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yZENRVVZvUkN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUlVGQlJTeE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1owSkJSWFJETEU5QlFVOHNTVUZCU1N4RFFVRkRPMkZCUTJJN1dVRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdG5Ra0ZEVml4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTm1MRTlCUVU4c1MwRkJTeXhEUVVGRE8yRkJRMlE3VVVGRFNDeERRVUZETzB0QlFVRTdTVUZGUkN3MFFrRkJORUlzUTBGQlF5eFZRVUZ6UWl4RlFVRkZMRTlCUVdVN1VVRkRiRVVzTWtKQlFUSkNPMUZCUXpOQ0xFMUJRVTBzVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hKUVVGSkxGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0UlFVTjZSU3hKUVVGSkxFTkJRVU1zVDBGQlR6dFpRVUZGTEU5QlFVOHNSVUZCUlN4RFFVRkRPMUZCUlhoQ0xHbEVRVUZwUkR0UlFVTnFSQ3hOUVVGTkxHRkJRV0VzUjBGQlJ5eFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJaU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNZVUZCWVN4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFdEJRVXNzVTBGQlV5eERRVUZwUWl4RFFVRkRPMUZCUTJoSkxFOUJRVThzUTBGQlF5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zVjBGQlZ5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1lVRkJZU3hEUVVGRE8wbEJRM0pHTEVOQlFVTTdRMEZEUmp0QlFXcEtSQ3gzUWtGcFNrTWlmUT09IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLndvcmtlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==