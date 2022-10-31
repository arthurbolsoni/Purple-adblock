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
        this.getSetting = () => __webpack_require__.g.postMessage({ type: "getSetting" });
        this.pause = () => __webpack_require__.g.postMessage({ type: "pause" });
        this.play = () => __webpack_require__.g.postMessage({ type: "play" });
        this.pauseAndPlay = () => {
            this.pause();
            this.play();
        };
        this.isLoaded = false;
        this.quality = "";
        // setting: { proxyUrl: string, toggleProxy: boolean, whiteList: Array<string>};
        this.setting = { whitelist: [], toggleProxy: true, proxyUrl: "" };
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
                    this.setting = Object.assign(Object.assign({}, this.setting), e.data.value);
                    console.log(this.setting);
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
appController = __decorate([
    (0, controller_decorator_1.Controller)()
], appController);
exports.appController = appController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYXBwLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkVBQThEO0FBQzlELHFFQUFzRDtBQUl0RCxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBZ0J4QixZQUE2QixVQUFrQjtRQUFsQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBZi9DLGVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDOUQsZUFBVSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUM5RCxVQUFLLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELFNBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDbEQsaUJBQVksR0FBRyxHQUFHLEVBQUU7WUFDbEIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQyxDQUFDO1FBRUYsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUVqQixZQUFPLEdBQVcsRUFBRSxDQUFDO1FBQ3JCLGdGQUFnRjtRQUNoRixZQUFPLEdBQW9FLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUc1SCxNQUFNLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUU7WUFDakMsaUVBQWlFO1lBRWpF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

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
    __webpack_require__.g.addEventListener("message", (e) => {
        __webpack_require__.g.onEventMessage(e);
    });
    __webpack_require__.g.appController = new app_controller_1.appController(new player_1.Player());
    __webpack_require__.g.LogPrint("Script running");
}
exports["default"] = app;
__webpack_require__.g.realFetch = __webpack_require__.g.fetch;
__webpack_require__.g.fetch = (url, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof url === "string") {
        routerList.forEach(x => {
            if (url.includes(x.match)) {
                if (!url.includes(x.ignore)) {
                    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () { return resolve(yield __webpack_require__.g.appController[x.propertyKey](url, options)); }));
                }
            }
        });
    }
    return __webpack_require__.g.realFetch.apply(this, [url, options]);
});
app();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLndvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hcHAud29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscURBQWlEO0FBQ2pELDRDQUF5QztBQVV6QyxTQUF3QixHQUFHO0lBQ3pCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRTtRQUM1QyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGFBQWEsR0FBRyxJQUFJLDhCQUFhLENBQUMsSUFBSSxlQUFNLEVBQUUsQ0FBQyxDQUFDO0lBRXZELE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBUkQsc0JBUUM7QUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDaEMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFPLEdBQVEsRUFBRSxPQUFZLEVBQUUsRUFBRTtJQUM5QyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtRQUMzQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3JCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDN0IsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFPLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxrREFBQyxPQUFBLE9BQU8sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDO2lCQUNqSDthQUNGO1FBQ0QsQ0FBQyxDQUFDLENBQUE7S0FDSDtJQUNELE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDdEQsQ0FBQyxDQUFBLENBQUM7QUFFRixHQUFHLEVBQUUsQ0FBQyJ9

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5kZWNvcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVjb3JhdG9yL2NvbnRyb2xsZXIuZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFPLE1BQU0sVUFBVSxHQUFHLEdBQW1CLEVBQUU7SUFDN0MsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUUsQ0FBQyxDQUFBO0FBQ3ZCLENBQUMsQ0FBQztBQUZXLFFBQUEsVUFBVSxjQUVyQiJ9

/***/ }),

/***/ "./src/decorator/handler.decorator.ts":
/*!********************************************!*\
  !*** ./src/decorator/handler.decorator.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Message = exports.Fetch = void 0;
const methodDecoratorFactory = () => {
    return (match, ignore = "") => {
        return (target, propertyKey) => {
            if (!__webpack_require__.g.routerList)
                __webpack_require__.g.routerList = [];
            __webpack_require__.g.routerList.push({ propertyKey: propertyKey, match: match, ignore: ignore });
        };
    };
};
exports.Fetch = methodDecoratorFactory();
exports.Message = methodDecoratorFactory();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlci5kZWNvcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVjb3JhdG9yL2hhbmRsZXIuZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQU0sc0JBQXNCLEdBQUUsR0FBRyxFQUFFO0lBQ2pDLE9BQU8sQ0FBQyxLQUFhLEVBQUUsU0FBaUIsRUFBRSxFQUFtQixFQUFFO1FBQzdELE9BQU8sQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUU7WUFDN0IsSUFBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVO2dCQUFFLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFBO1lBQzdDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLFdBQXFCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQTtRQUM3RixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7QUFDSixDQUFDLENBQUM7QUFDVyxRQUFBLEtBQUssR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0FBQ2pDLFFBQUEsT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUMifQ==

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsYXllci9wbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQTBDO0FBQzFDLGlFQUFzRTtBQUd0RSxNQUFhLE1BQU07SUFBbkI7UUFDRSxlQUFVLEdBQWEsRUFBRSxDQUFDO1FBQzFCLGtCQUFhLEdBQVcsRUFBRSxDQUFDO1FBQzNCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFDbkIsYUFBUSxHQUFvRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDL0gsWUFBTyxHQUFXLEVBQUUsQ0FBQztRQUVyQixlQUFVLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO1FBQ3RCLGFBQVEsR0FBRyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7UUFFcEIsVUFBSyxHQUFHLENBQUMsQ0FBUyxFQUFFLGNBQXVCLEtBQUssRUFBRSxFQUFFO1lBQ2xELGdKQUFnSjtZQUNoSixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxXQUFXO2dCQUFFLE9BQU8sR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxHQUFHLElBQUksR0FBRztnQkFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckQsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUc7Z0JBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BELElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO1lBRXRCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN6QixDQUFDLENBQUM7UUFFRixrQkFBYSxHQUFHLENBQUMsVUFBa0IsSUFBSSxDQUFD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

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMscUJBQU07QUFDaEQsZ0JBQWdCLHFCQUFNO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsMkNBQTJDOzs7Ozs7VUN2SjNDO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztVRVBEO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC5jb250cm9sbGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9hcHAud29ya2VyLnRzIiwid2VicGFjazovLy8uL3NyYy9kZWNvcmF0b3IvY29udHJvbGxlci5kZWNvcmF0b3IudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RlY29yYXRvci9oYW5kbGVyLmRlY29yYXRvci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaGxzL0hMUy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcGxheWVyL3BsYXllci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RyZWFtL2ludGVyZmFjZS9zdHJlYW0udHlwZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RyZWFtL2ludGVyZmFjZS9zdHJlYW1TZXJ2ZXIudHlwZXMudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0cmVhbS9zdHJlYW0udHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufTtcclxudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuYXBwQ29udHJvbGxlciA9IHZvaWQgMDtcclxuY29uc3QgY29udHJvbGxlcl9kZWNvcmF0b3JfMSA9IHJlcXVpcmUoXCIuL2RlY29yYXRvci9jb250cm9sbGVyLmRlY29yYXRvclwiKTtcclxuY29uc3QgaGFuZGxlcl9kZWNvcmF0b3JfMSA9IHJlcXVpcmUoXCIuL2RlY29yYXRvci9oYW5kbGVyLmRlY29yYXRvclwiKTtcclxubGV0IGFwcENvbnRyb2xsZXIgPSBjbGFzcyBhcHBDb250cm9sbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGFwcFNlcnZpY2UpIHtcclxuICAgICAgICB0aGlzLmFwcFNlcnZpY2UgPSBhcHBTZXJ2aWNlO1xyXG4gICAgICAgIHRoaXMuZ2V0UXVhbGl0eSA9ICgpID0+IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiZ2V0UXVhbGl0eVwiIH0pO1xyXG4gICAgICAgIHRoaXMuZ2V0U2V0dGluZyA9ICgpID0+IGdsb2JhbC5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiZ2V0U2V0dGluZ1wiIH0pO1xyXG4gICAgICAgIHRoaXMucGF1c2UgPSAoKSA9PiBnbG9iYWwucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInBhdXNlXCIgfSk7XHJcbiAgICAgICAgdGhpcy5wbGF5ID0gKCkgPT4gZ2xvYmFsLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJwbGF5XCIgfSk7XHJcbiAgICAgICAgdGhpcy5wYXVzZUFuZFBsYXkgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmlzTG9hZGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5xdWFsaXR5ID0gXCJcIjtcclxuICAgICAgICAvLyBzZXR0aW5nOiB7IHByb3h5VXJsOiBzdHJpbmcsIHRvZ2dsZVByb3h5OiBib29sZWFuLCB3aGl0ZUxpc3Q6IEFycmF5PHN0cmluZz59O1xyXG4gICAgICAgIHRoaXMuc2V0dGluZyA9IHsgd2hpdGVsaXN0OiBbXSwgdG9nZ2xlUHJveHk6IHRydWUsIHByb3h5VXJsOiBcIlwiIH07XHJcbiAgICAgICAgZ2xvYmFsLm9uRXZlbnRNZXNzYWdlID0gKGUpID0+IHtcclxuICAgICAgICAgICAgLy8gdmFyIG15TWVzc2FnZSA9IG5ldyBNZXNzYWdlRXZlbnQoJ3dvcmtlcicsIHsgZGF0YTogJ2hlbGxvJyB9KTtcclxuICAgICAgICAgICAgLy8gaWYgKGdsb2JhbC5vbm1lc3NhZ2UpIGdsb2JhbC5vbm1lc3NhZ2UodGhpcywgbXlNZXNzYWdlKTtcclxuICAgICAgICAgICAgc3dpdGNoIChlLmRhdGEuZnVuY05hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJCdWZmZXJpbmdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIm9uQ2xpZW50U2lua1BsYXlpbmdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIm9uQ2xpZW50U2lua1VwZGF0ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwicGF1c2VcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInBsYXlcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcIlJlYWR5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJQbGF5aW5nXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhc2UgXCJzZXRRdWFsaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZS5kYXRhLmFyZ3MpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVhbGl0eSA9IGUuZGF0YS5hcmdzWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuZGF0YS52YWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWFsaXR5ID0gZS5kYXRhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2FzZSBcInNldFNldHRpbmdcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5zZXR0aW5nKSwgZS5kYXRhLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNldHRpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIG9uQ2hhbm5lbCh1cmwsIG9wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIGdsb2JhbC5yZWFsRmV0Y2godXJsLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIHJlc3BvbnNlLnRleHQoKS50aGVuKCh0ZXh0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCB0aGlzLmFwcFNlcnZpY2Uub25TdGFydENoYW5uZWwodXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGV4dCk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIG9uRmV0Y2godXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHlpZWxkIHJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTsgfSkpXHJcbiAgICAgICAgICAgICAgICAudGhlbigodGV4dCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgeWllbGQgdGhpcy5hcHBTZXJ2aWNlLm9uZmV0Y2godXJsLCB0ZXh0KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXlsaXN0ID0gdGhpcy5hcHBTZXJ2aWNlLmN1cnJlbnRTdHJlYW0oKS5obHMuZ2V0UGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UocGxheWxpc3QpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBvbkNoYW5uZWxQaWN0dXJlKHVybCwgb3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuX19kZWNvcmF0ZShbXHJcbiAgICAoMCwgaGFuZGxlcl9kZWNvcmF0b3JfMS5GZXRjaCkoXCJ1c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiLCBcInBpY3R1cmUtYnktcGljdHVyZVwiKVxyXG5dLCBhcHBDb250cm9sbGVyLnByb3RvdHlwZSwgXCJvbkNoYW5uZWxcIiwgbnVsbCk7XHJcbl9fZGVjb3JhdGUoW1xyXG4gICAgKDAsIGhhbmRsZXJfZGVjb3JhdG9yXzEuRmV0Y2gpKFwiaGxzLnR0dm53Lm5ldC92MS9wbGF5bGlzdC9cIilcclxuXSwgYXBwQ29udHJvbGxlci5wcm90b3R5cGUsIFwib25GZXRjaFwiLCBudWxsKTtcclxuX19kZWNvcmF0ZShbXHJcbiAgICAoMCwgaGFuZGxlcl9kZWNvcmF0b3JfMS5GZXRjaCkoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIilcclxuXSwgYXBwQ29udHJvbGxlci5wcm90b3R5cGUsIFwib25DaGFubmVsUGljdHVyZVwiLCBudWxsKTtcclxuYXBwQ29udHJvbGxlciA9IF9fZGVjb3JhdGUoW1xyXG4gICAgKDAsIGNvbnRyb2xsZXJfZGVjb3JhdG9yXzEuQ29udHJvbGxlcikoKVxyXG5dLCBhcHBDb250cm9sbGVyKTtcclxuZXhwb3J0cy5hcHBDb250cm9sbGVyID0gYXBwQ29udHJvbGxlcjtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xtTnZiblJ5YjJ4c1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOXpjbU12WVhCd0xtTnZiblJ5YjJ4c1pYSXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3T3pzN096czdPenM3T3pzN096czdPMEZCUVVFc01rVkJRVGhFTzBGQlF6bEVMSEZGUVVGelJEdEJRVWwwUkN4SlFVRmhMR0ZCUVdFc1IwRkJNVUlzVFVGQllTeGhRVUZoTzBsQlowSjRRaXhaUVVFMlFpeFZRVUZyUWp0UlFVRnNRaXhsUVVGVkxFZEJRVllzVlVGQlZTeERRVUZSTzFGQlppOURMR1ZCUVZVc1IwRkJSeXhIUVVGSExFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxGbEJRVmtzUlVGQlJTeERRVUZETEVOQlFVTTdVVUZET1VRc1pVRkJWU3hIUVVGSExFZEJRVWNzUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzV1VGQldTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTTVSQ3hWUVVGTExFZEJRVWNzUjBGQlJ5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhGUVVGRkxFbEJRVWtzUlVGQlJTeFBRVUZQTEVWQlFVVXNRMEZCUXl4RFFVRkRPMUZCUTNCRUxGTkJRVWtzUjBGQlJ5eEhRVUZITEVWQlFVVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1YwRkJWeXhEUVVGRExFVkJRVVVzU1VGQlNTeEZRVUZGTEUxQlFVMHNSVUZCUlN4RFFVRkRMRU5CUVVNN1VVRkRiRVFzYVVKQlFWa3NSMEZCUnl4SFFVRkhMRVZCUVVVN1dVRkRiRUlzU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMWxCUTJJc1NVRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlEyUXNRMEZCUXl4RFFVRkRPMUZCUlVZc1lVRkJVU3hIUVVGSExFdEJRVXNzUTBGQlF6dFJRVVZxUWl4WlFVRlBMRWRCUVZjc1JVRkJSU3hEUVVGRE8xRkJRM0pDTEdkR1FVRm5SanRSUVVOb1JpeFpRVUZQTEVkQlFXOUZMRVZCUVVVc1UwRkJVeXhGUVVGRkxFVkJRVVVzUlVGQlJTeFhRVUZYTEVWQlFVVXNTVUZCU1N4RlFVRkZMRkZCUVZFc1JVRkJSU3hGUVVGRkxFVkJRVVVzUTBGQlF6dFJRVWMxU0N4TlFVRk5MRU5CUVVNc1kwRkJZeXhIUVVGSExFTkJRVU1zUTBGQlRTeEZRVUZGTEVWQlFVVTdXVUZEYWtNc2FVVkJRV2xGTzFsQlJXcEZMREpFUVVFeVJEdFpRVVV6UkN4UlFVRlJMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlVTeEZRVUZGTzJkQ1FVTjJRaXhMUVVGTExGZEJRVmNzUTBGQlF5eERRVUZETzI5Q1FVTm9RaXhOUVVGTk8ybENRVU5RTzJkQ1FVTkVMRXRCUVVzc2NVSkJRWEZDTEVOQlFVTXNRMEZCUXp0dlFrRkRNVUlzVFVGQlRUdHBRa0ZEVUR0blFrRkRSQ3hMUVVGTExHOUNRVUZ2UWl4RFFVRkRMRU5CUVVNN2IwSkJRM3BDTEUxQlFVMDdhVUpCUTFBN1owSkJRMFFzUzBGQlN5eFBRVUZQTEVOQlFVTXNRMEZCUXp0dlFrRkRXaXhOUVVGTk8ybENRVU5RTzJkQ1FVTkVMRXRCUVVzc1RVRkJUU3hEUVVGRExFTkJRVU03YjBKQlExZ3NUVUZCVFR0cFFrRkRVRHRuUWtGRFJDeExRVUZMTEU5QlFVOHNRMEZCUXl4RFFVRkRPMjlDUVVOYUxFMUJRVTA3YVVKQlExQTdaMEpCUTBRc1MwRkJTeXhUUVVGVExFTkJRVU1zUTBGQlF6dHZRa0ZEWkN4TlFVRk5PMmxDUVVOUU8yZENRVU5FTEV0QlFVc3NXVUZCV1N4RFFVRkRMRU5CUVVNN2IwSkJRMnBDTEVsQlFVa3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSk8zZENRVUZGTEVsQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRE8yOUNRVU53UkN4SlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN6dDNRa0ZCUlN4SlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRPMjlDUVVNNVF5eE5RVUZOTzJsQ1FVTlFPMmRDUVVORUxFdEJRVXNzV1VGQldTeERRVUZETEVOQlFVTTdiMEpCUTJwQ0xFbEJRVWtzUTBGQlF5eFBRVUZQTEcxRFFVRlJMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVXNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVVc1EwRkJRenR2UWtGRGNFUXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdiMEpCUXpGQ0xFMUJRVTA3YVVKQlExQTdaMEpCUTBRc1QwRkJUeXhEUVVGRExFTkJRVU03YjBKQlExQXNUVUZCVFR0cFFrRkRVRHRoUVVOR08xRkJRMGdzUTBGQlF5eERRVUZETzBsQlEwb3NRMEZCUXp0SlFVZExMRk5CUVZNc1EwRkJReXhIUVVGWExFVkJRVVVzVDBGQldUczdXVUZEZGtNc1RVRkJUU3hSUVVGUkxFZEJRV0VzVFVGQlRTeE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dFpRVU5vUlN4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVU3WjBKQlFVVXNUMEZCVHl4UlFVRlJMRU5CUVVNN1dVRkZiRU1zVDBGQlR5eE5RVUZOTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlR5eEpRVUZaTEVWQlFVVXNSVUZCUlR0blFrRkRka1FzVFVGQlRTeEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMR05CUVdNc1EwRkJReXhIUVVGSExFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdaMEpCUTJoRUxFOUJRVThzU1VGQlNTeFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1dVRkROVUlzUTBGQlF5eERRVUZCTEVOQlFVTXNRMEZCUXp0UlFVTk1MRU5CUVVNN1MwRkJRVHRKUVVkTExFOUJRVThzUTBGQlF5eEhRVUZYTEVWQlFVVXNUMEZCV1RzN1dVRkRja01zVDBGQlR5eE5RVUZOTEZOQlFWTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1QwRkJUeXhEUVVGRE8ybENRVU5xUXl4SlFVRkpMRU5CUVVNc1EwRkJUeXhSUVVGclFpeEZRVUZGTEVWQlFVVXNaMFJCUVVNc1QwRkJRU3hSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVRXNSMEZCUVN4RFFVRkRPMmxDUVVOdVJDeEpRVUZKTEVOQlFVTXNRMEZCVHl4SlFVRlpMRVZCUVVVc1JVRkJSVHRuUWtGRE0wSXNUVUZCVFN4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1owSkJRM3BETEUxQlFVMHNVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zWVVGQllTeEZRVUZGTEVOQlFVTXNSMEZCUnl4RFFVRkRMRmRCUVZjc1JVRkJSU3hEUVVGRE8yZENRVU51UlN4UFFVRlBMRWxCUVVrc1VVRkJVU3hEUVVGRExGRkJRV1VzUTBGQlF5eERRVUZETzFsQlEzWkRMRU5CUVVNc1EwRkJRU3hEUVVGRExFTkJRVUU3VVVGRFRpeERRVUZETzB0QlFVRTdTVUZIU3l4blFrRkJaMElzUTBGQlF5eEhRVUZYTEVWQlFVVXNUMEZCV1RzN1dVRkRPVU1zVDBGQlR5eEpRVUZKTEZGQlFWRXNSVUZCUlN4RFFVRkRPMUZCUTNoQ0xFTkJRVU03UzBGQlFUdERRVU5HTEVOQlFVRTdRVUY2UWtNN1NVRkVReXhKUVVGQkxIbENRVUZMTEVWQlFVTXNhME5CUVd0RExFVkJRVVVzYjBKQlFXOUNMRU5CUVVNN09FTkJVeTlFTzBGQlIwUTdTVUZFUXl4SlFVRkJMSGxDUVVGTExFVkJRVU1zTkVKQlFUUkNMRU5CUVVNN05FTkJVMjVETzBGQlIwUTdTVUZFUXl4SlFVRkJMSGxDUVVGTExFVkJRVU1zYjBKQlFXOUNMRU5CUVVNN2NVUkJSek5DTzBGQmRFWlZMR0ZCUVdFN1NVRkVla0lzU1VGQlFTeHBRMEZCVlN4SFFVRkZPMGRCUTBFc1lVRkJZU3hEUVhWR2VrSTdRVUYyUmxrc2MwTkJRV0VpZlE9PSIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuY29uc3QgYXBwX2NvbnRyb2xsZXJfMSA9IHJlcXVpcmUoXCIuL2FwcC5jb250cm9sbGVyXCIpO1xyXG5jb25zdCBwbGF5ZXJfMSA9IHJlcXVpcmUoXCIuL3BsYXllci9wbGF5ZXJcIik7XHJcbmZ1bmN0aW9uIGFwcCgpIHtcclxuICAgIGdsb2JhbC5Mb2dQcmludCA9ICh4KSA9PiBjb25zb2xlLmxvZyhcIltQdXJwbGVdOiBcIiwgeCk7XHJcbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgKGUpID0+IHtcclxuICAgICAgICBnbG9iYWwub25FdmVudE1lc3NhZ2UoZSk7XHJcbiAgICB9KTtcclxuICAgIGdsb2JhbC5hcHBDb250cm9sbGVyID0gbmV3IGFwcF9jb250cm9sbGVyXzEuYXBwQ29udHJvbGxlcihuZXcgcGxheWVyXzEuUGxheWVyKCkpO1xyXG4gICAgZ2xvYmFsLkxvZ1ByaW50KFwiU2NyaXB0IHJ1bm5pbmdcIik7XHJcbn1cclxuZXhwb3J0cy5kZWZhdWx0ID0gYXBwO1xyXG5nbG9iYWwucmVhbEZldGNoID0gZ2xvYmFsLmZldGNoO1xyXG5nbG9iYWwuZmV0Y2ggPSAodXJsLCBvcHRpb25zKSA9PiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgIGlmICh0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcm91dGVyTGlzdC5mb3JFYWNoKHggPT4ge1xyXG4gICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKHgubWF0Y2gpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVybC5pbmNsdWRlcyh4Lmlnbm9yZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gX19hd2FpdGVyKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7IHJldHVybiByZXNvbHZlKHlpZWxkIGdsb2JhbC5hcHBDb250cm9sbGVyW3gucHJvcGVydHlLZXldKHVybCwgb3B0aW9ucykpOyB9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBnbG9iYWwucmVhbEZldGNoLmFwcGx5KHRoaXMsIFt1cmwsIG9wdGlvbnNdKTtcclxufSk7XHJcbmFwcCgpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG5kdmNtdGxjaTVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMM055WXk5aGNIQXVkMjl5YTJWeUxuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenM3T3pzN096czdPMEZCUVVFc2NVUkJRV2xFTzBGQlEycEVMRFJEUVVGNVF6dEJRVlY2UXl4VFFVRjNRaXhIUVVGSE8wbEJRM3BDTEUxQlFVMHNRMEZCUXl4UlFVRlJMRWRCUVVjc1EwRkJReXhEUVVGTkxFVkJRVVVzUlVGQlJTeERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1dVRkJXU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzBsQlF6TkVMRTFCUVUwc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4VFFVRlRMRVZCUVVVc1EwRkJReXhEUVVGTkxFVkJRVVVzUlVGQlJUdFJRVU0xUXl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzBsQlF6TkNMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJRMGdzVFVGQlRTeERRVUZETEdGQlFXRXNSMEZCUnl4SlFVRkpMRGhDUVVGaExFTkJRVU1zU1VGQlNTeGxRVUZOTEVWQlFVVXNRMEZCUXl4RFFVRkRPMGxCUlhaRUxFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zUTBGQlF6dEJRVU53UXl4RFFVRkRPMEZCVWtRc2MwSkJVVU03UVVGRlJDeE5RVUZOTEVOQlFVTXNVMEZCVXl4SFFVRkhMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03UVVGRGFFTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGUExFZEJRVkVzUlVGQlJTeFBRVUZaTEVWQlFVVXNSVUZCUlR0SlFVTTVReXhKUVVGSkxFOUJRVThzUjBGQlJ5eExRVUZMTEZGQlFWRXNSVUZCUlR0UlFVTXpRaXhWUVVGVkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZPMWxCUTNKQ0xFbEJRVWtzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFVkJRVVU3WjBKQlEzcENMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1JVRkJSVHR2UWtGRE4wSXNUMEZCVHl4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGUExFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNSVUZCUlN4clJFRkJReXhQUVVGQkxFOUJRVThzUTBGQlF5eE5RVUZOTEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGQkxFZEJRVUVzUTBGQlF5eERRVUZETzJsQ1FVTnFTRHRoUVVOR08xRkJRMFFzUTBGQlF5eERRVUZETEVOQlFVRTdTMEZEU0R0SlFVTkVMRTlCUVU4c1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1IwRkJSeXhGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEZEVRc1EwRkJReXhEUVVGQkxFTkJRVU03UVVGRlJpeEhRVUZITEVWQlFVVXNRMEZCUXlKOSIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuQ29udHJvbGxlciA9IHZvaWQgMDtcclxuY29uc3QgQ29udHJvbGxlciA9ICgpID0+IHtcclxuICAgIHJldHVybiAodGFyZ2V0KSA9PiB7IH07XHJcbn07XHJcbmV4cG9ydHMuQ29udHJvbGxlciA9IENvbnRyb2xsZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVkyOXVkSEp2Ykd4bGNpNWtaV052Y21GMGIzSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdlpHVmpiM0poZEc5eUwyTnZiblJ5YjJ4c1pYSXVaR1ZqYjNKaGRHOXlMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3T3p0QlFVRlBMRTFCUVUwc1ZVRkJWU3hIUVVGSExFZEJRVzFDTEVWQlFVVTdTVUZETjBNc1QwRkJUeXhEUVVGRExFMUJRVTBzUlVGQlJTeEZRVUZGTEVkQlFVVXNRMEZCUXl4RFFVRkJPMEZCUTNaQ0xFTkJRVU1zUTBGQlF6dEJRVVpYTEZGQlFVRXNWVUZCVlN4alFVVnlRaUo5IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5NZXNzYWdlID0gZXhwb3J0cy5GZXRjaCA9IHZvaWQgMDtcclxuY29uc3QgbWV0aG9kRGVjb3JhdG9yRmFjdG9yeSA9ICgpID0+IHtcclxuICAgIHJldHVybiAobWF0Y2gsIGlnbm9yZSA9IFwiXCIpID0+IHtcclxuICAgICAgICByZXR1cm4gKHRhcmdldCwgcHJvcGVydHlLZXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFnbG9iYWwucm91dGVyTGlzdClcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5yb3V0ZXJMaXN0ID0gW107XHJcbiAgICAgICAgICAgIGdsb2JhbC5yb3V0ZXJMaXN0LnB1c2goeyBwcm9wZXJ0eUtleTogcHJvcGVydHlLZXksIG1hdGNoOiBtYXRjaCwgaWdub3JlOiBpZ25vcmUgfSk7XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbn07XHJcbmV4cG9ydHMuRmV0Y2ggPSBtZXRob2REZWNvcmF0b3JGYWN0b3J5KCk7XHJcbmV4cG9ydHMuTWVzc2FnZSA9IG1ldGhvZERlY29yYXRvckZhY3RvcnkoKTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYUdGdVpHeGxjaTVrWldOdmNtRjBiM0l1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZaR1ZqYjNKaGRHOXlMMmhoYm1Sc1pYSXVaR1ZqYjNKaGRHOXlMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3T3p0QlFVRkJMRTFCUVUwc2MwSkJRWE5DTEVkQlFVVXNSMEZCUnl4RlFVRkZPMGxCUTJwRExFOUJRVThzUTBGQlF5eExRVUZoTEVWQlFVVXNVMEZCYVVJc1JVRkJSU3hGUVVGdFFpeEZRVUZGTzFGQlF6ZEVMRTlCUVU4c1EwRkJReXhOUVVGTkxFVkJRVVVzVjBGQlZ5eEZRVUZGTEVWQlFVVTdXVUZETjBJc1NVRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eFZRVUZWTzJkQ1FVRkZMRTFCUVUwc1EwRkJReXhWUVVGVkxFZEJRVWNzUlVGQlJTeERRVUZCTzFsQlF6ZERMRTFCUVUwc1EwRkJReXhWUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNWMEZCVnl4RlFVRkZMRmRCUVhGQ0xFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4TlFVRk5MRVZCUVVVc1RVRkJUU3hGUVVGRExFTkJRVU1zUTBGQlFUdFJRVU0zUml4RFFVRkRMRU5CUVVNN1NVRkRTaXhEUVVGRExFTkJRVU03UVVGRFNpeERRVUZETEVOQlFVTTdRVUZEVnl4UlFVRkJMRXRCUVVzc1IwRkJSeXh6UWtGQmMwSXNSVUZCUlN4RFFVRkRPMEZCUTJwRExGRkJRVUVzVDBGQlR5eEhRVUZITEhOQ1FVRnpRaXhGUVVGRkxFTkJRVU1pZlE9PSIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuSExTID0gdm9pZCAwO1xyXG5jbGFzcyBITFMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyID0gW1wiI0VYVE0zVVwiLCBcIiNFWFQtWC1WRVJTSU9OOjNcIiwgXCIjRVhULVgtVEFSR0VURFVSQVRJT046NlwiLCBcIiNFWFQtWC1NRURJQS1TRVFVRU5DRTpcIl07XHJcbiAgICAgICAgdGhpcy5fcGxheWxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLl9zZXF1ZW5jZSA9IDA7XHJcbiAgICB9XHJcbiAgICBhZGRQbGF5bGlzdFRlc3QocGxheWxpc3QpIHsgfVxyXG4gICAgYWRkUGxheWxpc3QocGxheWxpc3QsIGFsbG93QWRzID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAocGxheWxpc3QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gcGxheWxpc3QudG9TdHJpbmcoKS5zcGxpdCgvW1xcclxcbl0vKTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJbNF0gPSBsaW5lc1s0XTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJbNV0gPSBsaW5lc1s1XTtcclxuICAgICAgICAvL3Rha2UgYWxsIG0zdTkgY29udGVudCB0byB0aGUgcGxheWxpc3QgYW5kIGJ1aWxkIGEgdmFyaWJsZVxyXG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBsaW5lcykge1xyXG4gICAgICAgICAgICBpZiAobGluZXNbaV0uaW5jbHVkZXMoXCIjRVhUSU5GXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWFsbG93QWRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsaW5lc1tpXS5pbmNsdWRlcyhcIixsaXZlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vdGltZXN0YW1wIHNlcXVlbmNlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXF1ZW5jZVRpbWVzdGFtcCA9IE1hdGguZmxvb3IobmV3IERhdGUobGluZXNbcGFyc2VJbnQoaSkgLSAxXS5zbGljZShsaW5lc1twYXJzZUludChpKSAtIDFdLmxlbmd0aCAtIDI0LCBsaW5lc1twYXJzZUludChpKSAtIDFdLmxlbmd0aCkpLmdldFRpbWUoKSAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgLy9zZWxlY3QgYWxsIHNlcXVlbmNlIHRoYXQgbm8gZXhpc3RcclxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLl9wbGF5bGlzdC5maWx0ZXIoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lc3RhbXAgPj0gc2VxdWVuY2VUaW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vYWRkIHRoZSBzZXF1ZW5jZSBvbiBwbGF5bGlzdCB2YXJpYWJsZSBpZiBpdCBubyBleGlzdFxyXG4gICAgICAgICAgICAgICAgaWYgKCFyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlID0gdGhpcy5fc2VxdWVuY2UgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBsaW5lc1twYXJzZUludChpKSAtIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHNlcXVlbmNlVGltZXN0YW1wLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiBsaW5lc1twYXJzZUludChpKV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogbGluZXNbcGFyc2VJbnQoaSkgKyAxXSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wbGF5bGlzdC5sZW5ndGggPiAxNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XHJcbiAgICB9XHJcbiAgICBnZXRQbGF5bGlzdCgpIHtcclxuICAgICAgICBsZXQgcGxheWxpc3QgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuX3BsYXlsaXN0LmZvckVhY2goKHgpID0+IChwbGF5bGlzdCA9IHBsYXlsaXN0ICsgeC50aW1lICsgXCJcXG5cIiArIHguaW5mbyArIFwiXFxuXCIgKyB4LnVybCArIFwiXFxuXCIpKTtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hlYWRlclswXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzJdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclszXSArXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls0XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgcGxheWxpc3QpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuSExTID0gSExTO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTRXhUTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMMmhzY3k5SVRGTXVkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3TzBGQlFVRXNUVUZCWVN4SFFVRkhPMGxCUVdoQ08xRkJRMVVzV1VGQlR5eEhRVUZyUWl4RFFVRkRMRk5CUVZNc1JVRkJSU3hyUWtGQmEwSXNSVUZCUlN4NVFrRkJlVUlzUlVGQlJTeDNRa0ZCZDBJc1EwRkJReXhEUVVGRE8xRkJRemxITEdOQlFWTXNSMEZCYlVJc1JVRkJSU3hEUVVGRE8xRkJReTlDTEdOQlFWTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1NVRjNSWGhDTEVOQlFVTTdTVUYwUlVNc1pVRkJaU3hEUVVGRExGRkJRV2RDTEVsQlFVY3NRMEZCUXp0SlFVVndReXhYUVVGWExFTkJRVU1zVVVGQlowSXNSVUZCUlN4WFFVRnZRaXhMUVVGTE8xRkJRM0pFTEVsQlFVa3NVVUZCVVN4TFFVRkxMRWxCUVVrc1JVRkJSVHRaUVVOeVFpeFBRVUZQTEV0QlFVc3NRMEZCUXp0VFFVTmtPMUZCUlVRc1NVRkJTU3hQUVVGUExFZEJRVWNzUzBGQlN5eERRVUZETzFGQlJYQkNMRTFCUVUwc1MwRkJTeXhIUVVGSExGRkJRVkVzUTBGQlF5eFJRVUZSTEVWQlFVVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03VVVGRGJFUXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRNMElzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZGTTBJc01rUkJRVEpFTzFGQlF6TkVMRXRCUVVzc1RVRkJUU3hEUVVGRExFbEJRVWtzUzBGQlN5eEZRVUZGTzFsQlEzSkNMRWxCUVVrc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4VFFVRlRMRU5CUVVNc1JVRkJSVHRuUWtGRGFFTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1JVRkJSVHR2UWtGRFlpeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0M1FrRkRMMElzVTBGQlV6dHhRa0ZEVmp0cFFrRkRSanRuUWtGRFJDeHZRa0ZCYjBJN1owSkJRM0JDTEUxQlFVMHNhVUpCUVdsQ0xFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZEYkVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hGUVVGRkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRek5JTEVOQlFVTTdaMEpCUlVZc2JVTkJRVzFETzJkQ1FVTnVReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTzI5Q1FVTndReXhQUVVGUExFTkJRVU1zUTBGQlF5eFRRVUZUTEVsQlFVa3NhVUpCUVdsQ0xFTkJRVU03WjBKQlF6RkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVU5JTEhORVFVRnpSRHRuUWtGRGRFUXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVVU3YjBKQlEySXNTVUZCU1N4RFFVRkRMRk5CUVZNc1IwRkJSeXhKUVVGSkxFTkJRVU1zVTBGQlV5eEhRVUZITEVOQlFVTXNRMEZCUXp0dlFrRkRjRU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNN2QwSkJRMnhDTEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0M1FrRkROVUlzVTBGQlV5eEZRVUZGTEdsQ1FVRnBRanQzUWtGRE5VSXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTNoQ0xFZEJRVWNzUlVGQlJTeExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dHhRa0ZETlVJc1EwRkJReXhEUVVGRE8yOUNRVU5JTEU5QlFVOHNSMEZCUnl4SlFVRkpMRU5CUVVNN2FVSkJRMmhDTzJkQ1FVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eE5RVUZOTEVkQlFVY3NSVUZCUlN4RlFVRkZPMjlDUVVOcVF5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8ybENRVU40UWp0aFFVTkdPMU5CUTBZN1VVRkRSQ3hQUVVGUExFOUJRVThzUTBGQlF6dEpRVU5xUWl4RFFVRkRPMGxCUlVRc1YwRkJWenRSUVVOVUxFbEJRVWtzVVVGQlVTeEhRVUZYTEVWQlFVVXNRMEZCUXp0UlFVVXhRaXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eFJRVUZSTEVkQlFVY3NVVUZCVVN4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFZEJRVWNzU1VGQlNTeEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRWRCUVVjc1NVRkJTU3hIUVVGSExFTkJRVU1zUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOd1J5eFBRVUZQTEVOQlEwd3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTEVOQlFVTXNVMEZCVXp0WlFVTmtMRWxCUVVrN1dVRkRTaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTm1MRWxCUVVrN1dVRkRTaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTm1MRWxCUVVrN1dVRkRTaXhSUVVGUkxFTkJRMVFzUTBGQlF6dEpRVU5LTEVOQlFVTTdRMEZEUmp0QlFUTkZSQ3hyUWtFeVJVTWlmUT09IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlBsYXllciA9IHZvaWQgMDtcclxuY29uc3Qgc3RyZWFtXzEgPSByZXF1aXJlKFwiLi4vc3RyZWFtL3N0cmVhbVwiKTtcclxuY29uc3Qgc3RyZWFtX3R5cGVfMSA9IHJlcXVpcmUoXCIuLi9zdHJlYW0vaW50ZXJmYWNlL3N0cmVhbS50eXBlXCIpO1xyXG5jbGFzcyBQbGF5ZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5zdHJlYW1MaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5hY3R1YWxDaGFubmVsID0gXCJcIjtcclxuICAgICAgICB0aGlzLnBsYXlpbmdBZHMgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0geyB3aGl0ZWxpc3Q6IFtdLCB0b2dnbGVQcm94eTogdHJ1ZSwgcHJveHlVcmw6IFwiXCIgfTtcclxuICAgICAgICB0aGlzLnF1YWxpdHkgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMub25TdGFydEFkcyA9ICgpID0+IHsgfTtcclxuICAgICAgICB0aGlzLm9uRW5kQWRzID0gKCkgPT4geyB9O1xyXG4gICAgICAgIHRoaXMuaXNBZHMgPSAoeCwgYWxsb3dDaGFuZ2UgPSBmYWxzZSkgPT4ge1xyXG4gICAgICAgICAgICAvLyBjb25zdCBhZHMgPSB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJzdGl0Y2hlZC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtY2xpZW50LWFkXCIpIHx8IHgudG9TdHJpbmcoKS5pbmNsdWRlcyhcInR3aXRjaC1hZC1xdWFydGlsZVwiKTtcclxuICAgICAgICAgICAgY29uc3QgYWRzID0geC50b1N0cmluZygpLmluY2x1ZGVzKFwic3RpdGNoZWRcIik7XHJcbiAgICAgICAgICAgIGlmICghYWxsb3dDaGFuZ2UpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wbGF5aW5nQWRzICE9IGFkcyAmJiBhZHMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uU3RhcnRBZHMoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGxheWluZ0FkcyAhPSBhZHMgJiYgIWFkcylcclxuICAgICAgICAgICAgICAgIHRoaXMub25FbmRBZHMoKTtcclxuICAgICAgICAgICAgdGhpcy5wbGF5aW5nQWRzID0gYWRzO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wbGF5aW5nQWRzO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50U3RyZWFtID0gKGNoYW5uZWwgPSB0aGlzLmFjdHVhbENoYW5uZWwpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RyZWFtTGlzdC5maW5kKCh4KSA9PiB4LmNoYW5uZWxOYW1lID09PSBjaGFubmVsKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgaXNXaGl0ZWxpc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3Mud2hpdGVsaXN0LmluY2x1ZGVzKHRoaXMuYWN0dWFsQ2hhbm5lbCkgJiYgdGhpcy5jdXJyZW50U3RyZWFtKCkgPT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgb25mZXRjaCh1cmwsIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0cmVhbSA9IHlpZWxkIHRoaXMuY3VycmVudFN0cmVhbSgpO1xyXG4gICAgICAgICAgICBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0FkcyhyZXNwb25zZSwgdHJ1ZSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsID0geWllbGQgdGhpcy5mZXRjaG0zdThCeVN0cmVhbVR5cGUoc3RyZWFtX3R5cGVfMS5zdHJlYW1zLmxvY2FsKTtcclxuICAgICAgICAgICAgICAgIGlmIChsb2NhbClcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RyZWFtLmhscy5hZGRQbGF5bGlzdChsb2NhbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsKVxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdHJlYW0uc3RyZWFtQWNjZXNzKHN0cmVhbV90eXBlXzEuc3RyZWFtcy5sb2NhbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobG9jYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBleHRlcm5hbCA9IHlpZWxkIHRoaXMuZmV0Y2htM3U4QnlTdHJlYW1UeXBlKHN0cmVhbV90eXBlXzEuc3RyZWFtcy5leHRlcm5hbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZXJuYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0cmVhbS5obHMuYWRkUGxheWxpc3QoZXh0ZXJuYWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVybmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmYWlsXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gY3VycmVudFN0cmVhbS5obHMuYWRkUGxheWxpc3QocmVzcG9uc2UsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmZXRjaG0zdThCeVN0cmVhbVR5cGUoYWNjZXNzVHlwZSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIExvZ1ByaW50KFwiU3RyZWFtIFR5cGU6IFwiICsgYWNjZXNzVHlwZS5uYW1lKTtcclxuICAgICAgICAgICAgY29uc3Qgc3RyZWFtVXJsTGlzdCA9IHRoaXMuY3VycmVudFN0cmVhbSgpLmdldFN0cmVhbVNlcnZlcnNCeVN0cmVhbVR5cGUoYWNjZXNzVHlwZSwgdGhpcy5xdWFsaXR5KTtcclxuICAgICAgICAgICAgLy9ieSB0aGUgYXJyYXkgb3JkZXIsIHRyeSBnZXQgbTN1OCBjb250ZW50IGFuZCByZXR1cm4gaWYgZG9uJ3QgaGF2ZSBhZHMuXHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3RyZWFtVXJsIG9mIHN0cmVhbVVybExpc3QpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB5aWVsZCAoeWllbGQgZ2xvYmFsLnJlYWxGZXRjaChzdHJlYW1VcmwgPT09IG51bGwgfHwgc3RyZWFtVXJsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBzdHJlYW1VcmwudXJsKSkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNBZHModGV4dCkpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIG9uU3RhcnRDaGFubmVsKHVybCwgdGV4dCkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lID0gL2hsc1xcLyguKikubTN1OC9nbS5leGVjKHVybCkgfHwgW107XHJcbiAgICAgICAgICAgIGxldCBleGlzdGVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBMb2dQcmludChcIkNoYW5uZWwgXCIgKyBjaGFubmVsTmFtZVsxXSk7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsQ2hhbm5lbCA9IGNoYW5uZWxOYW1lWzFdO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1doaXRlbGlzdCgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RyZWFtTGlzdC5maW5kKChjKSA9PiBjLmNoYW5uZWxOYW1lID09PSB0aGlzLmFjdHVhbENoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJveHlVcmwgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MpXHJcbiAgICAgICAgICAgICAgICAgICAgcHJveHlVcmwgPSB0aGlzLnNldHRpbmdzLnByb3h5VXJsID8gdGhpcy5zZXR0aW5ncy5wcm94eVVybCA6IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0cmVhbUxpc3QucHVzaChuZXcgc3RyZWFtXzEuU3RyZWFtKHRoaXMuYWN0dWFsQ2hhbm5lbCwgcHJveHlVcmwpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIExvZ1ByaW50KFwiRXhpc3Q6IFwiICsgdGhpcy5hY3R1YWxDaGFubmVsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFN0cmVhbSgpLnNlcnZlckxpc3QgPSBbXTtcclxuICAgICAgICAgICAgICAgIGV4aXN0ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzdHJlYW0gPSB0aGlzLmN1cnJlbnRTdHJlYW0oKTtcclxuICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAgICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgICAgICAgICBMb2dQcmludChcIkxvY2FsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgICAgICAgICAgeWllbGQgc3RyZWFtLmFkZFN0cmVhbUxpbmsodGV4dCwgXCJsb2NhbFwiKTtcclxuICAgICAgICAgICAgTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgICAgICAgICBzdHJlYW0uc3RyZWFtQWNjZXNzKHN0cmVhbV90eXBlXzEuc3RyZWFtcy5sb2NhbCk7XHJcbiAgICAgICAgICAgIGlmIChleGlzdGVudClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgLy9pZiB0aGUgcHJveHkgb3B0aW9uIG9uIHBvcHVwIGlzIGRpc2FibGVkLCBpdCBpcyBuZXZlciBjYWxsZWQuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy50b2dnbGVQcm94eSlcclxuICAgICAgICAgICAgICAgICAgICBzdHJlYW0udHJ5RXh0ZXJuYWxQbGF5ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5QbGF5ZXIgPSBQbGF5ZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHeGhlV1Z5TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMM0JzWVhsbGNpOXdiR0Y1WlhJdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPenM3T3pzN096czdPMEZCUVVFc05rTkJRVEJETzBGQlF6RkRMR2xGUVVGelJUdEJRVWQwUlN4TlFVRmhMRTFCUVUwN1NVRkJia0k3VVVGRFJTeGxRVUZWTEVkQlFXRXNSVUZCUlN4RFFVRkRPMUZCUXpGQ0xHdENRVUZoTEVkQlFWY3NSVUZCUlN4RFFVRkRPMUZCUXpOQ0xHVkJRVlVzUjBGQlJ5eExRVUZMTEVOQlFVTTdVVUZEYmtJc1lVRkJVU3hIUVVGdlJTeEZRVUZGTEZOQlFWTXNSVUZCUlN4RlFVRkZMRVZCUVVVc1YwRkJWeXhGUVVGRkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVXNSVUZCUlN4RlFVRkZMRU5CUVVNN1VVRkRMMGdzV1VGQlR5eEhRVUZYTEVWQlFVVXNRMEZCUXp0UlFVVnlRaXhsUVVGVkxFZEJRVWNzUjBGQlJ5eEZRVUZGTEVkQlFVVXNRMEZCUXl4RFFVRkRPMUZCUTNSQ0xHRkJRVkVzUjBGQlJ5eEhRVUZITEVWQlFVVXNSMEZCUlN4RFFVRkRMRU5CUVVNN1VVRkZjRUlzVlVGQlN5eEhRVUZITEVOQlFVTXNRMEZCVXl4RlFVRkZMR05CUVhWQ0xFdEJRVXNzUlVGQlJTeEZRVUZGTzFsQlEyeEVMR2RLUVVGblNqdFpRVU5vU2l4TlFVRk5MRWRCUVVjc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8xbEJRemxETEVsQlFVa3NRMEZCUXl4WFFVRlhPMmRDUVVGRkxFOUJRVThzUjBGQlJ5eERRVUZETzFsQlF6ZENMRWxCUVVrc1NVRkJTU3hEUVVGRExGVkJRVlVzU1VGQlNTeEhRVUZITEVsQlFVa3NSMEZCUnp0blFrRkJSU3hKUVVGSkxFTkJRVU1zVlVGQlZTeEZRVUZGTEVOQlFVTTdXVUZEY2tRc1NVRkJTU3hKUVVGSkxFTkJRVU1zVlVGQlZTeEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjN1owSkJRVVVzU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRPMWxCUTNCRUxFbEJRVWtzUTBGQlF5eFZRVUZWTEVkQlFVY3NSMEZCUnl4RFFVRkRPMWxCUlhSQ0xFOUJRVThzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXp0UlFVTjZRaXhEUVVGRExFTkJRVU03VVVGRlJpeHJRa0ZCWVN4SFFVRkhMRU5CUVVNc1ZVRkJhMElzU1VGQlNTeERRVUZETEdGQlFXRXNSVUZCVlN4RlFVRkZPMWxCUXk5RUxFOUJRVThzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGVExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVzc1QwRkJUeXhEUVVGRkxFTkJRVU03VVVGRGVrVXNRMEZCUXl4RFFVRkRPMGxCYlVaS0xFTkJRVU03U1VGcVJrTXNWMEZCVnp0UlFVTlVMRTlCUVU4c1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZMRWxCUVVrc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJRenRKUVVOc1NDeERRVUZETzBsQlJVc3NUMEZCVHl4RFFVRkRMRWRCUVZjc1JVRkJSU3hSUVVGblFqczdXVUZEZWtNc1RVRkJUU3hoUVVGaExFZEJRVmNzVFVGQlRTeEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZMRU5CUVVNN1dVRkRla1FzWVVGQllTeERRVUZETEVkQlFVY3NRMEZCUXl4WFFVRlhMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03V1VGRmVFTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeEZRVUZGTEVsQlFVa3NRMEZCUXp0blFrRkJSU3hQUVVGUExFbEJRVWtzUTBGQlF6dFpRVVUzUXl4SlFVRkpPMmRDUVVOR0xFMUJRVTBzUzBGQlN5eEhRVUZITEUxQlFVMHNTVUZCU1N4RFFVRkRMSEZDUVVGeFFpeERRVUZETEhGQ1FVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03WjBKQlF6bEVMRWxCUVVrc1MwRkJTenR2UWtGQlJTeGhRVUZoTEVOQlFVTXNSMEZCUnl4RFFVRkRMRmRCUVZjc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dG5Ra0ZEYUVRc1NVRkJTU3hEUVVGRExFdEJRVXM3YjBKQlFVVXNZVUZCWVN4RFFVRkRMRmxCUVZrc1EwRkJReXh4UWtGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMmRDUVVOMFJDeEpRVUZKTEV0QlFVczdiMEpCUVVVc1QwRkJUeXhKUVVGSkxFTkJRVU03WjBKQlJYWkNMRTFCUVUwc1VVRkJVU3hIUVVGSExFMUJRVTBzU1VGQlNTeERRVUZETEhGQ1FVRnhRaXhEUVVGRExIRkNRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1owSkJRM0JGTEVsQlFVa3NVVUZCVVR0dlFrRkJSU3hoUVVGaExFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRuUWtGRGRFUXNTVUZCU1N4UlFVRlJPMjlDUVVGRkxFOUJRVThzU1VGQlNTeERRVUZETzJkQ1FVVXhRaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMmRDUVVWd1FpeHBSRUZCYVVRN1owSkJRMnBFTEU5QlFVOHNTMEZCU3l4RFFVRkRPMkZCUTJRN1dVRkJReXhQUVVGUExFTkJRVTBzUlVGQlJUdG5Ra0ZEWml4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0aFFVTjRRanRSUVVOSUxFTkJRVU03UzBGQlFUdEpRVVZMTEhGQ1FVRnhRaXhEUVVGRExGVkJRWE5DT3p0WlFVTm9SQ3hSUVVGUkxFTkJRVU1zWlVGQlpTeEhRVUZITEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRaUVVVMVF5eE5RVUZOTEdGQlFXRXNSMEZCYVVJc1NVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJTeERRVUZETERSQ1FVRTBRaXhEUVVGRExGVkJRVlVzUlVGQlJTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1dVRkZhRWdzZDBWQlFYZEZPMWxCUTNoRkxFdEJRVXNzVFVGQlRTeFRRVUZUTEVsQlFVa3NZVUZCWVN4RlFVRkZPMmRDUVVOeVF5eE5RVUZOTEVsQlFVa3NSMEZCVnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEZOQlFWTXNZVUZCVkN4VFFVRlRMSFZDUVVGVUxGTkJRVk1zUTBGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8yZENRVU16UlN4SlFVRkpMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETzI5Q1FVRkZMRk5CUVZNN1owSkJReTlDTEU5QlFVOHNTVUZCU1N4RFFVRkRPMkZCUTJJN1dVRkZSQ3hQUVVGUExFVkJRVVVzUTBGQlF6dFJRVU5hTEVOQlFVTTdTMEZCUVR0SlFVTkxMR05CUVdNc1EwRkJReXhIUVVGWExFVkJRVVVzU1VGQldUczdXVUZETlVNc1RVRkJUU3hYUVVGWExFZEJRWGxDTEd0Q1FVRnJRaXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1dVRkROMFVzU1VGQlNTeFJRVUZSTEVkQlFVY3NTMEZCU3l4RFFVRkRPMWxCUlhKQ0xGRkJRVkVzUTBGQlF5eFZRVUZWTEVkQlFVY3NWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03V1VGRGRFTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1IwRkJSeXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdXVUZGY0VNc1NVRkJTU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eEZRVUZGTzJkQ1FVRkZMRTlCUVU4c1MwRkJTeXhEUVVGRE8xbEJSWEpETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFWTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExGZEJRVmNzUzBGQlN5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRVZCUVVVN1owSkJRemxGTEVsQlFVa3NVVUZCVVN4SFFVRkhMRVZCUVVVc1EwRkJRenRuUWtGRGJFSXNTVUZCU1N4SlFVRkpMRU5CUVVNc1VVRkJVVHR2UWtGQlJTeFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTTdaMEpCUTI1R0xFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1pVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eGhRVUZoTEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVOb1JUdHBRa0ZCVFR0blFrRkRUQ3hSUVVGUkxFTkJRVU1zVTBGQlV5eEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRuUWtGRGVrTXNTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSU3hEUVVGRExGVkJRVlVzUjBGQlJ5eEZRVUZGTEVOQlFVTTdaMEpCUTNKRExGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTTdZVUZEYWtJN1dVRkZSQ3hOUVVGTkxFMUJRVTBzUjBGQlJ5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZMRU5CUVVNN1dVRkRjRU1zWjBSQlFXZEVPMWxCUldoRUxHZEVRVUZuUkR0WlFVTm9SQ3hSUVVGUkxFTkJRVU1zZFVKQlFYVkNMRU5CUVVNc1EwRkJRenRaUVVOc1F5eE5RVUZOTEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFOUJRVThzUTBGQlF5eERRVUZETzFsQlF6RkRMRkZCUVZFc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4RFFVRkRPMWxCUlRkQ0xFMUJRVTBzUTBGQlF5eFpRVUZaTEVOQlFVTXNjVUpCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFpRVVZ1UXl4SlFVRkpMRkZCUVZFN1owSkJRVVVzVDBGQlR6dFpRVVZ5UWl3clJFRkJLMFE3V1VGREwwUXNTVUZCU1N4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRk8yZENRVU5xUWl4SlFVRkpMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zVjBGQlZ6dHZRa0ZCUlN4TlFVRk5MRU5CUVVNc2FVSkJRV2xDTEVWQlFVVXNRMEZCUXp0aFFVTXpSRHRaUVVWRUxFOUJRVTg3VVVGRFZDeERRVUZETzB0QlFVRTdRMEZEUmp0QlFURkhSQ3gzUWtFd1IwTWlmUT09IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5zdHJlYW1zID0gdm9pZCAwO1xyXG5leHBvcnRzLnN0cmVhbXMgPSB7XHJcbiAgICBwaWN0dXJlOiB7IHBsYXllclR5cGU6IFwidGh1bmRlcmRvbWVcIiwgbmFtZTogXCJsb3dlclwiIH0sXHJcbiAgICBsb2NhbDogeyBwbGF5ZXJUeXBlOiBcImVtYmVkXCIsIG5hbWU6IFwibm9ybWFsXCIgfSxcclxuICAgIGV4dGVybmFsOiB7IG5hbWU6IFwiZXh0ZXJuYWxcIiB9LFxyXG59O1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1J5WldGdExuUjVjR1V1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk4dUxpOXpjbU12YzNSeVpXRnRMMmx1ZEdWeVptRmpaUzl6ZEhKbFlXMHVkSGx3WlM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96czdRVUZCWVN4UlFVRkJMRTlCUVU4c1IwRkJSenRKUVVOeVFpeFBRVUZQTEVWQlFVVXNSVUZCUlN4VlFVRlZMRVZCUVVVc1lVRkJZU3hGUVVGRkxFbEJRVWtzUlVGQlJTeFBRVUZQTEVWQlFVVTdTVUZEY2tRc1MwRkJTeXhGUVVGRkxFVkJRVVVzVlVGQlZTeEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpMRVZCUVVVc1VVRkJVU3hGUVVGRk8wbEJRemxETEZGQlFWRXNSVUZCUlN4RlFVRkZMRWxCUVVrc1JVRkJSU3hWUVVGVkxFVkJRVVU3UTBGREwwSXNRMEZCUXlKOSIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuc3RyZWFtU2VydmVyID0gZXhwb3J0cy5xdWFsaXR5VXJsID0gdm9pZCAwO1xyXG5jbGFzcyBxdWFsaXR5VXJsIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudXJsID0gXCJcIjtcclxuICAgICAgICB0aGlzLnF1YWxpdHkgPSBcIlwiO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMucXVhbGl0eVVybCA9IHF1YWxpdHlVcmw7XHJcbmNsYXNzIHN0cmVhbVNlcnZlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihwYXJ0aWFsKSB7XHJcbiAgICAgICAgdGhpcy5iZXN0UXVhbGl0eSA9ICgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXJsTGlzdFswXTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuZmluZEJ5UXVhbGl0eSA9IChxdWFsaXR5KSA9PiB0aGlzLnVybExpc3QuZmluZCgoeCkgPT4geC5xdWFsaXR5ID09IHF1YWxpdHkpO1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgcGFydGlhbCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5zdHJlYW1TZXJ2ZXIgPSBzdHJlYW1TZXJ2ZXI7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUnlaV0Z0VTJWeWRtVnlMblI1Y0dWekxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZMaTR2YzNKakwzTjBjbVZoYlM5cGJuUmxjbVpoWTJVdmMzUnlaV0Z0VTJWeWRtVnlMblI1Y0dWekxuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenRCUVVGQkxFMUJRV0VzVlVGQlZUdEpRVUYyUWp0UlFVTkZMRkZCUVVjc1IwRkJWeXhGUVVGRkxFTkJRVU03VVVGRGFrSXNXVUZCVHl4SFFVRlhMRVZCUVVVc1EwRkJRenRKUVVOMlFpeERRVUZETzBOQlFVRTdRVUZJUkN4blEwRkhRenRCUVVORUxFMUJRV0VzV1VGQldUdEpRVlYyUWl4WlFVRlpMRTlCUVRoQ08xRkJUREZETEdkQ1FVRlhMRWRCUVVjc1IwRkJSeXhGUVVGRk8xbEJRMnBDTEU5QlFVOHNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU42UWl4RFFVRkRMRU5CUVVNN1VVRkRSaXhyUWtGQllTeEhRVUZITEVOQlFVTXNUMEZCWlN4RlFVRkZMRVZCUVVVc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNTVUZCU1N4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVkc1JpeE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dEpRVU12UWl4RFFVRkRPME5CUTBZN1FVRmlSQ3h2UTBGaFF5SjkiLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuU3RyZWFtID0gdm9pZCAwO1xyXG5jb25zdCBITFNfMSA9IHJlcXVpcmUoXCIuLi9obHMvSExTXCIpO1xyXG5jb25zdCBzdHJlYW1fdHlwZV8xID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlL3N0cmVhbS50eXBlXCIpO1xyXG5jb25zdCBzdHJlYW1TZXJ2ZXJfdHlwZXNfMSA9IHJlcXVpcmUoXCIuL2ludGVyZmFjZS9zdHJlYW1TZXJ2ZXIudHlwZXNcIik7XHJcbmNsYXNzIFN0cmVhbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihjaGFubmVsTmFtZSwgdHVubmVsID0gXCJcIikge1xyXG4gICAgICAgIHRoaXMuc2VydmVyTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuaGxzID0gbmV3IEhMU18xLkhMUygpO1xyXG4gICAgICAgIHRoaXMuY2hhbm5lbE5hbWUgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMudHVubmVsID0gW1wiaHR0cHM6Ly9ldTEuanVwdGVyLmdhL2NoYW5uZWwve2NoYW5uZWxuYW1lfVwiLCBcImh0dHBzOi8vZXUyLmp1cHRlci5nYS9jaGFubmVsL3tjaGFubmVsbmFtZX1cIl07XHJcbiAgICAgICAgdGhpcy5jdXJyZW50VHVubmVsID0gdGhpcy50dW5uZWxbMF07XHJcbiAgICAgICAgdGhpcy50cnlFeHRlcm5hbFBsYXllciA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgaWYgKCEoeWllbGQgdGhpcy5zdHJlYW1BY2Nlc3Moc3RyZWFtX3R5cGVfMS5zdHJlYW1zLmV4dGVybmFsKSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0ZXJuYWxQbGF5ZXIodHJ1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNoYW5uZWxOYW1lID0gY2hhbm5lbE5hbWU7XHJcbiAgICAgICAgaWYgKHR1bm5lbClcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VHVubmVsID0gdHVubmVsO1xyXG4gICAgfVxyXG4gICAgLy9hZGQgbTN1OCBsaW5rcyB3aXRoIHF1YWxpdHkgdG8gdGhlIGxpc3Qgb2Ygc2VydmVyc1xyXG4gICAgYWRkU3RyZWFtTGluayh0ZXh0LCB0eXBlID0gXCJsb2NhbFwiLCBzaWcgPSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgY29uc3QgcXVhbGl0eVVybFNwbGl0ID0gW107XHJcbiAgICAgICAgICAgIGxldCBjYXB0dXJlQXJyYXk7XHJcbiAgICAgICAgICAgIGNvbnN0IFJFR0VYID0gL05BTUU9XCIoKD86XFxTK1xccytcXFMrfFxcUyspKVwiLEFVVE8oPzpefFxcUytcXHMrKSg/Ol58XFxTK1xccyspKGh0dHBzOlxcL1xcL3ZpZGVvKFxcUyspLm0zdTgpL2c7XHJcbiAgICAgICAgICAgIHdoaWxlICgoY2FwdHVyZUFycmF5ID0gUkVHRVguZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHF1YWxpdHlVcmxTcGxpdC5wdXNoKHsgcXVhbGl0eTogY2FwdHVyZUFycmF5WzFdLCB1cmw6IGNhcHR1cmVBcnJheVsyXSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzdHJlYW1MaXN0ID0gbmV3IHN0cmVhbVNlcnZlcl90eXBlc18xLnN0cmVhbVNlcnZlcih7IHR5cGU6IHR5cGUsIHVybExpc3Q6IHF1YWxpdHlVcmxTcGxpdCwgc2lnOiBzaWcgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VydmVyTGlzdC5wdXNoKHN0cmVhbUxpc3QpO1xyXG4gICAgICAgICAgICBpZiAoIXNpZykge1xyXG4gICAgICAgICAgICAgICAgeWllbGQgdGhpcy5zaWduYXR1cmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHNpZ25hdHVyZSgpIHtcclxuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICBjb25zdCBSRUdFWCA9IC92aWRlby13ZWF2ZXIuKC4qKS5obHMudHR2bncubmV0XFwvdjFcXC9wbGF5bGlzdFxcLyguKikubTN1OCQvZ207XHJcbiAgICAgICAgICAgIHlpZWxkIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZlckxpc3RcclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiB4LnNpZyA9PSBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgoeCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gUkVHRVguZXhlYyh4LnVybExpc3RbMF0udXJsKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIGZldGNoKFwiaHR0cHM6Ly9qdXB0ZXIuZ2EvaGxzL3YyL3NpZy9cIiArIG1hdGNoWzJdICsgXCIvXCIgKyBtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4LnNpZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChfYSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pKSxcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvL2FkZCBhIG5ldyBwbGF5ZXIgc3RyZWFtIGV4dGVybmFsXHJcbiAgICBleHRlcm5hbFBsYXllcihjdXN0b21JZ25vcmUgPSBmYWxzZSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChjdXN0b21JZ25vcmUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRUdW5uZWwgPSB0aGlzLnR1bm5lbFswXTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgZ2xvYmFsLnJlYWxGZXRjaCh0aGlzLmN1cnJlbnRUdW5uZWwucmVwbGFjZShcIntjaGFubmVsbmFtZX1cIiwgdGhpcy5jaGFubmVsTmFtZSkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInNlcnZlciBwcm94eSByZXR1cm4gZXJyb3Igb3Igbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IHlpZWxkIHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogT0tcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFN0cmVhbUxpbmsodGV4dCwgc3RyZWFtX3R5cGVfMS5zdHJlYW1zLmV4dGVybmFsLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcInNlcnZlciBwcm94eSByZXR1cm4gZXJyb3Igb3Igbm90IGZvdW5kIFwiICsgdGhpcy5jdXJyZW50VHVubmVsKTtcclxuICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy9jcmVhdGUgYSBuZXcgc3RyZWFtIGFjY2Vzc1xyXG4gICAgc3RyZWFtQWNjZXNzKHN0cmVhbSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChzdHJlYW0ubmFtZSA9PSBzdHJlYW1fdHlwZV8xLnN0cmVhbXMuZXh0ZXJuYWwubmFtZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB5aWVsZCB0aGlzLmV4dGVybmFsUGxheWVyKCk7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9ICdxdWVyeSBQbGF5YmFja0FjY2Vzc1Rva2VuX1RlbXBsYXRlKCRsb2dpbjogU3RyaW5nISwgJGlzTGl2ZTogQm9vbGVhbiEsICR2b2RJRDogSUQhLCAkaXNWb2Q6IEJvb2xlYW4hLCAkcGxheWVyVHlwZTogU3RyaW5nISkgeyAgc3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlbihjaGFubmVsTmFtZTogJGxvZ2luLCBwYXJhbXM6IHtwbGF0Zm9ybTogXCJ3ZWJcIiwgcGxheWVyQmFja2VuZDogXCJtZWRpYXBsYXllclwiLCBwbGF5ZXJUeXBlOiAkcGxheWVyVHlwZX0pIEBpbmNsdWRlKGlmOiAkaXNMaXZlKSB7ICAgIHZhbHVlICAgIHNpZ25hdHVyZSAgICBfX3R5cGVuYW1lICB9ICB2aWRlb1BsYXliYWNrQWNjZXNzVG9rZW4oaWQ6ICR2b2RJRCwgcGFyYW1zOiB7cGxhdGZvcm06IFwid2ViXCIsIHBsYXllckJhY2tlbmQ6IFwibWVkaWFwbGF5ZXJcIiwgcGxheWVyVHlwZTogJHBsYXllclR5cGV9KSBAaW5jbHVkZShpZjogJGlzVm9kKSB7ICAgIHZhbHVlICAgIHNpZ25hdHVyZSAgICBfX3R5cGVuYW1lICB9fSc7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbk5hbWU6IFwiUGxheWJhY2tBY2Nlc3NUb2tlbl9UZW1wbGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeSxcclxuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNMaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpbjogdGhpcy5jaGFubmVsTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNWb2Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b2RJRDogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyVHlwZTogc3RyZWFtLnBsYXllclR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBncWwgPSB5aWVsZCBnbG9iYWwucmVhbEZldGNoKFwiaHR0cHM6Ly9ncWwudHdpdGNoLnR2L2dxbFwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7IFwiQ2xpZW50LUlEXCI6IFwia2ltbmU3OGt4M25jeDZicmdvNG12NndraTVoMWtvXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyZWFtRGF0YUFjY2VzcyA9IHlpZWxkIGdxbC5qc29uKCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vdXNoZXIudHR2bncubmV0L2FwaS9jaGFubmVsL2hscy9cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFubmVsTmFtZSArXHJcbiAgICAgICAgICAgICAgICAgICAgXCIubTN1OD9hbGxvd19zb3VyY2U9dHJ1ZSZmYXN0X2JyZWFkPXRydWUmcD1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMWU3KSArXHJcbiAgICAgICAgICAgICAgICAgICAgXCImcGxheWVyX2JhY2tlbmQ9bWVkaWFwbGF5ZXImcGxheWxpc3RfaW5jbHVkZV9mcmFtZXJhdGU9dHJ1ZSZyZWFzc2lnbm1lbnRzX3N1cHBvcnRlZD1mYWxzZSZzaWc9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbURhdGFBY2Nlc3MuZGF0YS5zdHJlYW1QbGF5YmFja0FjY2Vzc1Rva2VuLnNpZ25hdHVyZSArXHJcbiAgICAgICAgICAgICAgICAgICAgXCImc3VwcG9ydGVkX2NvZGVjcz1hdmMxJnRva2VuPVwiICtcclxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1EYXRhQWNjZXNzLmRhdGEuc3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlbi52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHQgPSB5aWVsZCAoeWllbGQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwpKS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJTZXJ2ZXIgbG9hZGVkIFwiICsgc3RyZWFtLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTdHJlYW1MaW5rKHRleHQsIHN0cmVhbS5uYW1lKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZ2V0U3RyZWFtU2VydmVyc0J5U3RyZWFtVHlwZShhY2Nlc3NUeXBlLCBxdWFsaXR5KSB7XHJcbiAgICAgICAgLy9maWx0ZXIgYWxsIHNlcnZlciBieSB0eXBlXHJcbiAgICAgICAgY29uc3Qgc2VydmVycyA9IHRoaXMuc2VydmVyTGlzdC5maWx0ZXIoKHgpID0+IHgudHlwZSA9PSBhY2Nlc3NUeXBlLm5hbWUpO1xyXG4gICAgICAgIGlmICghc2VydmVycylcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIC8vZmlsdGVyIGFsbCBzZXJ2ZXIgdXJsIGJ5IHF1YWxpdHkgb3IgYmVzdHF1YWxpdHlcclxuICAgICAgICBjb25zdCBzdHJlYW1VcmxMaXN0ID0gc2VydmVycy5tYXAoKHgpID0+IHguZmluZEJ5UXVhbGl0eShxdWFsaXR5KSkuZmlsdGVyKCh4KSA9PiB4ICE9PSB1bmRlZmluZWQpO1xyXG4gICAgICAgIHJldHVybiAhc3RyZWFtVXJsTGlzdC5sZW5ndGggPyBzZXJ2ZXJzLm1hcCgoeCkgPT4geC5iZXN0UXVhbGl0eSgpKSA6IHN0cmVhbVVybExpc3Q7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5TdHJlYW0gPSBTdHJlYW07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUnlaV0Z0TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMM04wY21WaGJTOXpkSEpsWVcwdWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdPenM3T3pzN096czdPMEZCUVVFc2IwTkJRV2xETzBGQlEycERMSGxFUVVFNFJEdEJRVU01UkN4MVJVRkJNRVU3UVVGRk1VVXNUVUZCWVN4TlFVRk5PMGxCVVdwQ0xGbEJRVmtzVjBGQmJVSXNSVUZCUlN4VFFVRnBRaXhGUVVGRk8xRkJVSEJFTEdWQlFWVXNSMEZCYlVJc1JVRkJSU3hEUVVGRE8xRkJRMmhETEZGQlFVY3NSMEZCVVN4SlFVRkpMRk5CUVVjc1JVRkJSU3hEUVVGRE8xRkJRM0pDTEdkQ1FVRlhMRWRCUVZjc1JVRkJSU3hEUVVGRE8xRkJSWHBDTEZkQlFVMHNSMEZCUnl4RFFVRkRMRFpEUVVFMlF5eEZRVUZGTERaRFFVRTJReXhEUVVGRExFTkJRVU03VVVGRGVFY3NhMEpCUVdFc1IwRkJWeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCTkVWMlF5eHpRa0ZCYVVJc1IwRkJSeXhIUVVGVExFVkJRVVU3V1VGRE4wSXNTVUZCU1N4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEhGQ1FVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJUdG5Ra0ZEYUVRc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0aFFVTXpRanRSUVVOSUxFTkJRVU1zUTBGQlFTeERRVUZETzFGQk4wVkJMRWxCUVVrc1EwRkJReXhYUVVGWExFZEJRVWNzVjBGQlZ5eERRVUZETzFGQlF5OUNMRWxCUVVrc1RVRkJUVHRaUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NUVUZCVFN4RFFVRkRPMGxCUXpGRExFTkJRVU03U1VGRlJDeHZSRUZCYjBRN1NVRkRPVU1zWVVGQllTeERRVUZETEVsQlFWa3NSVUZCUlN4SlFVRkpMRWRCUVVjc1QwRkJUeXhGUVVGRkxFZEJRVWNzUjBGQlJ5eEpRVUZKT3p0WlFVTXhSQ3hOUVVGTkxHVkJRV1VzUjBGQmFVSXNSVUZCUlN4RFFVRkRPMWxCUTNwRExFbEJRVWtzV1VGQmIwTXNRMEZCUXp0WlFVVjZReXhOUVVGTkxFdEJRVXNzUjBGQlJ5eHhSa0ZCY1VZc1EwRkJRenRaUVVWd1J5eFBRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkpMRVZCUVVVN1owSkJRMnBFTEdWQlFXVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hQUVVGUExFVkJRVVVzV1VGQldTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRPMkZCUXpGRk8xbEJSVVFzVFVGQlRTeFZRVUZWTEVkQlFXbENMRWxCUVVrc2FVTkJRVmtzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1QwRkJUeXhGUVVGRkxHVkJRV1VzUlVGQlJTeEhRVUZITEVWQlFVVXNSMEZCUnl4RlFVRkZMRU5CUVVNc1EwRkJRenRaUVVOMFJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dFpRVVZxUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRk8yZENRVU5TTEUxQlFVMHNTVUZCU1N4RFFVRkRMRk5CUVZNc1JVRkJSU3hEUVVGRE8yRkJRM2hDTzFsQlEwUXNUMEZCVHl4SlFVRkpMRU5CUVVNN1VVRkRaQ3hEUVVGRE8wdEJRVUU3U1VGRlN5eFRRVUZUT3p0WlFVTmlMRTFCUVUwc1MwRkJTeXhIUVVGSExEWkVRVUUyUkN4RFFVRkRPMWxCUlRWRkxFMUJRVTBzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1JVRkJSVHRuUWtGRE5VSXNTVUZCU1N4RFFVRkRMRlZCUVZVN2NVSkJRMW9zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eEpRVUZKTEV0QlFVc3NRMEZCUXp0eFFrRkRiRU1zVDBGQlR5eERRVUZETEVOQlFVOHNRMEZCVFN4RlFVRkZMRVZCUVVVN2IwSkJRM2hDTEUxQlFVMHNTMEZCU3l4SFFVRXlRaXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdiMEpCUTI1RkxFbEJRVWtzUzBGQlN5eEZRVUZGTzNkQ1FVTlVMRWxCUVVrN05FSkJRMFlzVFVGQlRTeExRVUZMTEVOQlFVTXNLMEpCUVN0Q0xFZEJRVWNzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRWRCUVVjc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXpzMFFrRkRla1VzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNN05FSkJRMklzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPM2xDUVVObU8zZENRVUZETEZkQlFVMDdORUpCUTA0c1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzNsQ1FVTm9RanR4UWtGRFJqdDVRa0ZCVFR0M1FrRkRUQ3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdjVUpCUTJoQ08yZENRVU5JTEVOQlFVTXNRMEZCUVN4RFFVRkRPMjlDUVVOR0xFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0WlFVTnVRaXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU5NTEVOQlFVTTdTMEZCUVR0SlFVVkVMR3REUVVGclF6dEpRVU0xUWl4alFVRmpMRU5CUVVNc1pVRkJkMElzUzBGQlN6czdXVUZEYUVRc1NVRkJTU3haUVVGWk8yZENRVUZGTEVsQlFVa3NRMEZCUXl4aFFVRmhMRWRCUVVjc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjBSQ3hKUVVGSk8yZENRVU5HTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc01FSkJRVEJDTEVOQlFVTXNRMEZCUXp0blFrRkROVU1zVFVGQlRTeFJRVUZSTEVkQlFXRXNUVUZCVFN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNUMEZCVHl4RFFVRkRMR1ZCUVdVc1JVRkJSU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXp0blFrRkZha2dzU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZMRVZCUVVVN2IwSkJRMmhDTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2QwTkJRWGRETEVOQlFVTXNRMEZCUXp0cFFrRkRNMFE3WjBKQlJVUXNUVUZCVFN4SlFVRkpMRWRCUVZjc1RVRkJUU3hSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdaMEpCUlRORExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNjVUpCUVhGQ0xFTkJRVU1zUTBGQlF6dG5Ra0ZGZGtNc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVXNjVUpCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdaMEpCUldoRUxFOUJRVThzU1VGQlNTeERRVUZETzJGQlEySTdXVUZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRuUWtGRFZpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMSGxEUVVGNVF5eEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRuUWtGRGFFWXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5Ra0ZEYmtJc1QwRkJUeXhMUVVGTExFTkJRVU03WVVGRFpEdFJRVU5JTEVOQlFVTTdTMEZCUVR0SlFWRkVMRFJDUVVFMFFqdEpRVU4wUWl4WlFVRlpMRU5CUVVNc1RVRkJhMEk3TzFsQlEyNURMRWxCUVVrc1RVRkJUU3hEUVVGRExFbEJRVWtzU1VGQlNTeHhRa0ZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSk8yZENRVUZGTEU5QlFVOHNUVUZCVFN4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU03V1VGRk4wVXNTVUZCU1R0blFrRkRSaXhOUVVGTkxFdEJRVXNzUjBGRFZDeDFaa0ZCZFdZc1EwRkJRenRuUWtGRE1XWXNUVUZCVFN4SlFVRkpMRWRCUVVjN2IwSkJRMWdzWVVGQllTeEZRVUZGTERoQ1FVRTRRanR2UWtGRE4wTXNTMEZCU3l4RlFVRkZMRXRCUVVzN2IwSkJRMW9zVTBGQlV5eEZRVUZGTzNkQ1FVTlVMRTFCUVUwc1JVRkJSU3hKUVVGSk8zZENRVU5hTEV0QlFVc3NSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWenQzUWtGRGRrSXNTMEZCU3l4RlFVRkZMRXRCUVVzN2QwSkJRMW9zUzBGQlN5eEZRVUZGTEVWQlFVVTdkMEpCUTFRc1ZVRkJWU3hGUVVGRkxFMUJRVTBzUTBGQlF5eFZRVUZWTzNGQ1FVTTVRanRwUWtGRFJpeERRVUZETzJkQ1FVVkdMRTFCUVUwc1IwRkJSeXhIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl3eVFrRkJNa0lzUlVGQlJUdHZRa0ZET1VRc1RVRkJUU3hGUVVGRkxFMUJRVTA3YjBKQlEyUXNUMEZCVHl4RlFVRkZMRVZCUVVVc1YwRkJWeXhGUVVGRkxHZERRVUZuUXl4RlFVRkZPMjlDUVVNeFJDeEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU03YVVKQlF6TkNMRU5CUVVNc1EwRkJRenRuUWtGRFNDeE5RVUZOTEdkQ1FVRm5RaXhIUVVGUkxFMUJRVTBzUjBGQlJ5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMmRDUVVVdlF5eE5RVUZOTEVkQlFVY3NSMEZEVUN3d1EwRkJNRU03YjBKQlF6RkRMRWxCUVVrc1EwRkJReXhYUVVGWE8yOUNRVU5vUWl3MFEwRkJORU03YjBKQlF6VkRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRWRCUVVjc1EwRkJRenR2UWtGREwwSXNaMGRCUVdkSE8yOUNRVU5vUnl4blFrRkJaMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNlVUpCUVhsQ0xFTkJRVU1zVTBGQlV6dHZRa0ZEZWtRc0swSkJRU3RDTzI5Q1FVTXZRaXhuUWtGQlowSXNRMEZCUXl4SlFVRkpMRU5CUVVNc2VVSkJRWGxDTEVOQlFVTXNTMEZCU3l4RFFVRkRPMmRDUVVONFJDeE5RVUZOTEVsQlFVa3NSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03WjBKQlJYaEVMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zWjBKQlFXZENMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVVm9SQ3hKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlJYUkRMRTlCUVU4c1NVRkJTU3hEUVVGRE8yRkJRMkk3V1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0blFrRkRWaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVObUxFOUJRVThzUzBGQlN5eERRVUZETzJGQlEyUTdVVUZEU0N4RFFVRkRPMHRCUVVFN1NVRkZSQ3cwUWtGQk5FSXNRMEZCUXl4VlFVRnpRaXhGUVVGRkxFOUJRV1U3VVVGRGJFVXNNa0pCUVRKQ08xRkJRek5DTEUxQlFVMHNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEpRVUZKTEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVONlJTeEpRVUZKTEVOQlFVTXNUMEZCVHp0WlFVRkZMRTlCUVU4c1JVRkJSU3hEUVVGRE8xRkJSWGhDTEdsRVFVRnBSRHRSUVVOcVJDeE5RVUZOTEdGQlFXRXNSMEZCUnl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlpTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1lVRkJZU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NVMEZCVXl4RFFVRnBRaXhEUVVGRE8xRkJRMmhKTEU5QlFVOHNRMEZCUXl4aFFVRmhMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNWMEZCVnl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zWVVGQllTeERRVUZETzBsQlEzSkdMRU5CUVVNN1EwRkRSanRCUVdwS1JDeDNRa0ZwU2tNaWZRPT0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hcHAud29ya2VyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9