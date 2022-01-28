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
                //LogPrint(Math.floor(date.getTime() / 1000));
                //LogPrint(r);
                if (!r.length) {
                    this._sequence = this._sequence + 1;
                    this._playlist.push({
                        time: lines[parseInt(i)],
                        timestamp: sequenceTimestamp,
                        info: lines[parseInt(i) + 1],
                        url: lines[parseInt(i) + 2],
                    });
                    //LogPrint("new seek add");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSExTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0hMUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sR0FBRztJQUFoQjtRQUNVLFlBQU8sR0FBa0IsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztRQUMvRyxjQUFTLEdBQW1CLEVBQUUsQ0FBQztRQUMvQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2Qsc0JBQWlCLEdBQW1CLEVBQUUsQ0FBQztJQWtIakQsQ0FBQztJQWhIQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQVksRUFBRSxJQUFJLEdBQUcsT0FBTyxFQUFFLEdBQUcsR0FBRyxLQUFLO1FBQzNELE1BQU0sZUFBZSxHQUFpQixFQUFFLENBQUM7UUFDekMsSUFBSSxZQUFvQyxDQUFDO1FBRXpDLE1BQU0sS0FBSyxHQUFHLHFGQUFxRixDQUFDO1FBRXBHLE9BQU8sQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUMvQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM1RTtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDN0IsTUFBTSxVQUFVLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3hFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNSLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxJ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

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
function current() {
    return __webpack_require__.g.channel.find((x) => x.name === __webpack_require__.g.actualChannel);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VycmVudC5jaGFubmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NoYW5uZWwvY3VycmVudC5jaGFubmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxPQUFPO0lBQ25CLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZFLENBQUMifQ==

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
            _window.LogPrint("new channel 2: " + match[1]);
            _window.channel.push({ name: match[1], flowSig: [], hls: new _window.HLS() });
        }
        else {
            existent = true;
        }
    }
    //--------------------------------------------//
    //--------------------------------------------//
    _window.LogPrint("Local Server: Loading");
    __webpack_require__.g.currentChannel().hls.addStreamLink(text);
    _window.LogPrint("Local Server: OK");
    if (existent) {
        return;
    }
    //--------------------------------------------//
    //--------------------------------------------//
    __webpack_require__.g.newPicture(__webpack_require__.g.actualChannel).then(textPicture => {
        __webpack_require__.g.currentChannel().hls.addStreamLink(textPicture, "picture", true);
        __webpack_require__.g.LogPrint("Local Server 480p: OK");
    });
    //--------------------------------------------//
    //--------------------------------------------//
    try {
        _window.LogPrint("External Server: Loading");
        const a = await _window.realFetch("https://jupter.ga/hls/v2/channel/" + _window.actualChannel, { method: "GET" });
        const text = await a.text();
        if (!a.ok) {
            throw new Error("server proxy return error or not found");
        }
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
        _window.channel.find((x) => x.name === _window.actualChannel).hls.StreamServerListSet(streamList);
        console.log(_window.channel.find((x) => x.name === _window.actualChannel).hls.StreamServerList);
        //channel.find(x => x.name === actualChannel).hls.addStreamLink(text);
        _window.LogPrint("External Server: OK");
        _window.LogPrint("External Server: OK");
    }
    catch (e) {
        _window.LogPrint(e);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFubmVsL29uLmNoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsdUJBQXVCO0lBQ3BFLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDO0lBQ2pDLE1BQU0sS0FBSyxHQUF5QixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxRCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFFckIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RDLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNuRCxPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDakY7YUFBTTtZQUNILFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDbkI7S0FDSjtJQUNELGdEQUFnRDtJQUVoRCxnREFB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

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
                                    console.log("ccccccccccccccccccccccccccccccccccccccccccc");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guaW5mbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBTztJQUNoQyw0Q0FBNEM7SUFDNUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLE9BQU87UUFDcEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDekIsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixnRkFBZ0Y7Z0JBQ2hGLDRFQUE0RTtnQkFFNUUsOENBQThDO2FBQ2pEO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3pHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDeEMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ2xDLDRCQUE0Qjt3QkFDNUIsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFROzRCQUN6RCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtnQ0FDL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0NBQ2hELElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO29DQUN6RixPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDN0IsQ0FBQyxDQUFDLENBQUM7NEJBQ1AsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQyxDQUFDLENBQUE7b0JBQ04sQ0FBQyxDQUFDO29CQUNGLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUVELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO2dCQUN6RixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07b0JBQ3hDLElBQUksWUFBWSxHQUFHLEtBQUssV0FBVyxHQUFHO3dCQUNsQyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLFFBQVE7NEJBQ3pELElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRTtnQ0FDYixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssV0FBVyxJQUFJO29DQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUE7b0NBQzFELE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUNqRCxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDaEMsQ0FBQyxDQUFDLENBQUM7NkJBQ047aUNBQU07Z0NBQ0gsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUNsQixPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7NkJBQ3ZDO3dCQUNMLENBQUMsQ0FBQyxDQUFBO29CQUNOLENBQUMsQ0FBQztvQkFDRixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxDQUFDO2FBQ047WUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTthQUN2QztTQUVKO1FBRUQsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFBO0FBQ0wsQ0FBQyJ9

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
    //   if (Math.random() < 0.5 ){
    //       response += "twitch-client-ad";
    //   }
    const channelCurrent = await __webpack_require__.g.currentChannel();
    //if ads find on main link called from twitch api player
    if (response.toString().includes("stitched-ad") || response.toString().includes("twitch-client-ad")) {
        __webpack_require__.g.LogPrint("ads found");
        const quality = __webpack_require__.g.quality;
        const StreamServerList = channelCurrent.hls.StreamServerList;
        try {
            //try all hls sigs that have on StreamServerList from HLS
            if (StreamServerList.length > 0) {
                const returno = await __webpack_require__.g.realFetch(StreamServerList.find((x) => x.server == "proxy").urlList.find((a) => a.quality == quality).url, {
                    method: "GET",
                }).text();
                if (returno.toString().includes("stitched-ad") || returno.toString().includes("twitch-client-ad")) {
                    __webpack_require__.g.LogPrint("ads on proxy");
                    throw new Error("No m3u8 valid url found on StreamServerList");
                }
                return channelCurrent.hls.addPlaylist(returno, true);
                //gera erro se nao tiver link
            }
            throw new Error("No m3u8 valid url found on StreamServerList");
        }
        catch (e) {
            //if nothing resolve, return 480p flow
            //LogPrint(StreamServerList.filter(x => x.urlList.find(a => a.url != url && a.quality == quality) && x.server == "local").map(x => x.urlList.find(x => x.quality.includes('480')))[0]);
            const pictureStream = StreamServerList.filter((x) => x.server == "picture")
                .map((x) => x.urlList.find((x) => x.quality.includes("480")))[0].url;
            const returno = await __webpack_require__.g.realFetch(pictureStream).text();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvb24uZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzdDLCtCQUErQjtJQUMvQix3Q0FBd0M7SUFDeEMsTUFBTTtJQUVOLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXJELHdEQUF3RDtJQUN4RCxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQ25HLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFN0IsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUMvQixNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFFN0QsSUFBSTtZQUNGLHlEQUF5RDtZQUN6RCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLE1BQU0sT0FBTyxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUU7b0JBQ3RJLE1BQU0sRUFBRSxLQUFLO2lCQUNkLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDVixJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO29CQUNqRyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7aUJBQ2hFO2dCQUVELE9BQU8sY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVyRCw2QkFBNkI7YUFDOUI7WUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7U0FDaEU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLHNDQUFzQztZQUN0Qyx1TEFBdUw7WUFFdkwsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQztpQkFDeEUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtZQUV0RSxNQUFNLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFN0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtTQUFNO1FBQ0wsY0FBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsNEhBQTRIO1FBQzVILG9KQUFvSjtRQUNwSixvSkFBb0o7UUFDcEosZ0JBQWdCO1FBQ2hCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFDSCxDQUFDIn0=

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGljdHVyZS5mZXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9waWN0dXJlLmZldGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxLQUFLLFVBQVUsT0FBTyxDQUFDLFdBQW1CO0lBQzdDLElBQUk7UUFDQSxNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsMkJBQTJCLEVBQUU7WUFDNUQsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsRUFBRSxXQUFXLEVBQUUsZ0NBQWdDLEVBQUU7WUFDMUQsSUFBSSxFQUFFLDhFQUE4RSxXQUFXLHVMQUF1TDtTQUN6UixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBVyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV4QyxNQUFNLEdBQUcsR0FDTCwwQ0FBMEM7WUFDMUMsV0FBVztZQUNYLDRDQUE0QztZQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDL0IsZ0dBQWdHO1lBQ2hHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLFdBQVcsQ0FBQztZQUN4RCwrQkFBK0I7WUFDL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFekQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3hELE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEI7QUFDTCxDQUFDIn0=

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






function app(scope, whitelist) {
    scope.LogPrint = (x) => {
        console.log("[Purple]: ", x);
    };
    scope.realFetch = fetch;
    scope.quality = "";
    scope.addEventListener("message", function (e) {
        switch (e.data.funcName) {
            case "setQuality": {
                scope.quality = e.data.args[0].name;
                console.log(scope.quality);
                break;
            }
            default: {
                break;
            }
        }
    });
    scope.channel = [];
    scope.actualChannel = "";
    scope.whitelist = whitelist;
    scope.onFetch = _fetch_on_fetch__WEBPACK_IMPORTED_MODULE_3__.on;
    scope.newPicture = _fetch_picture_fetch__WEBPACK_IMPORTED_MODULE_5__.picture;
    scope.onStartChannel = _channel_on_channel__WEBPACK_IMPORTED_MODULE_2__.onStart;
    scope.currentChannel = _channel_current_channel__WEBPACK_IMPORTED_MODULE_4__.current;
    scope.HLS = _HLS__WEBPACK_IMPORTED_MODULE_1__.HLS;
    (0,_fetch_fetch_inflate__WEBPACK_IMPORTED_MODULE_0__.inflateFetch)(scope);
}
app(self, ["jukes"]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFVLEVBQUUsU0FBZ0I7SUFDNUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztJQUNGLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1FBQzNDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDdkIsS0FBSyxZQUFZLENBQUMsQ0FBQztnQkFDakIsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQixNQUFNO2FBQ1A7WUFDRCxPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNO2FBQ1A7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDekIsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFFNUIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7SUFFM0IsS0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFDL0IsS0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFFL0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFFaEIsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFFRCxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyJ9
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LDJDQUEyQyx1ckQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvSExTLnRzIiwid2VicGFjazovLy8uL3NyYy9jaGFubmVsL2N1cnJlbnQuY2hhbm5lbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9vbi5jaGFubmVsLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9vbi5mZXRjaC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvcGljdHVyZS5mZXRjaC50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBITFMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyID0gW1wiI0VYVE0zVVwiLCBcIiNFWFQtWC1WRVJTSU9OOjNcIiwgXCIjRVhULVgtVEFSR0VURFVSQVRJT046NlwiLCBcIiNFWFQtWC1NRURJQS1TRVFVRU5DRTo2XCJdO1xyXG4gICAgICAgIHRoaXMuX3BsYXlsaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSAwO1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QgPSBbXTtcclxuICAgIH1cclxuICAgIGFzeW5jIGFkZFN0cmVhbUxpbmsodGV4dCwgdHlwZSA9IFwibG9jYWxcIiwgc2lnID0gZmFsc2UpIHtcclxuICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSBbXTtcclxuICAgICAgICBsZXQgY2FwdHVyZUFycmF5O1xyXG4gICAgICAgIGNvbnN0IFJFR0VYID0gL05BTUU9XCIoKD86XFxTK1xccytcXFMrfFxcUyspKVwiLEFVVE8oPzpefFxcUytcXHMrKSg/Ol58XFxTK1xccyspKGh0dHBzOlxcL1xcL3ZpZGVvKFxcUyspLm0zdTgpL2c7XHJcbiAgICAgICAgd2hpbGUgKChjYXB0dXJlQXJyYXkgPSBSRUdFWC5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBxdWFsaXR5VXJsU3BsaXQucHVzaCh7IHF1YWxpdHk6IGNhcHR1cmVBcnJheVsxXSwgdXJsOiBjYXB0dXJlQXJyYXlbMl0gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKHF1YWxpdHlVcmxTcGxpdCk7XHJcbiAgICAgICAgY29uc3Qgc3RyZWFtTGlzdCA9IHsgc2VydmVyOiB0eXBlLCB1cmxMaXN0OiBxdWFsaXR5VXJsU3BsaXQsIHNpZzogc2lnIH07XHJcbiAgICAgICAgdGhpcy5fc3RyZWFtU2VydmVyTGlzdC5wdXNoKHN0cmVhbUxpc3QpO1xyXG4gICAgICAgIGlmICghc2lnKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2lnbmF0dXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgc2lnbmF0dXJlKCkge1xyXG4gICAgICAgIGNvbnN0IFJFR0VYID0gL3ZpZGVvLXdlYXZlci4oLiopLmhscy50dHZudy5uZXRcXC92MVxcL3BsYXlsaXN0XFwvKC4qKS5tM3U4JC9nbTtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gdGhpcy5fc3RyZWFtU2VydmVyTGlzdFxyXG4gICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiB4LnNpZyA9PSBmYWxzZSlcclxuICAgICAgICAgICAgLmZvckVhY2goYXN5bmMgKHgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBSRUdFWC5leGVjKHgudXJsTGlzdFswXS51cmwpO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYSA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9qdXB0ZXIuZ2EvaGxzL3YyL3NpZy9cIiArIG1hdGNoWzJdICsgXCIvXCIgKyBtYXRjaFsxXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5zaWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIGdldCBTdHJlYW1TZXJ2ZXJMaXN0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0O1xyXG4gICAgfVxyXG4gICAgU3RyZWFtU2VydmVyTGlzdFNldCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QucHVzaCh2YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBhZGRQbGF5bGlzdChwbGF5bGlzdCkge1xyXG4gICAgICAgIGlmIChwbGF5bGlzdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBwbGF5bGlzdC50b1N0cmluZygpLnNwbGl0KC9bXFxyXFxuXS8pO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls0XSA9IGxpbmVzWzRdO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls1XSA9IGxpbmVzWzVdO1xyXG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBsaW5lcykge1xyXG4gICAgICAgICAgICBpZiAobGluZXNbaV0uaW5jbHVkZXMoXCIjRVhULVgtUFJPR1JBTS1EQVRFLVRJTUU6XCIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXF1ZW5jZVRpbWVzdGFtcCA9IE1hdGguZmxvb3IobmV3IERhdGUobGluZXNbaV0uc2xpY2UobGluZXNbaV0ubGVuZ3RoIC0gMjQsIGxpbmVzW2ldLmxlbmd0aCkpLmdldFRpbWUoKSAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuX3BsYXlsaXN0LmZpbHRlcigoeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWVzdGFtcCA+PSBzZXF1ZW5jZVRpbWVzdGFtcDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy9Mb2dQcmludChNYXRoLmZsb29yKGRhdGUuZ2V0VGltZSgpIC8gMTAwMCkpO1xyXG4gICAgICAgICAgICAgICAgLy9Mb2dQcmludChyKTtcclxuICAgICAgICAgICAgICAgIGlmICghci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXF1ZW5jZSA9IHRoaXMuX3NlcXVlbmNlICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogbGluZXNbcGFyc2VJbnQoaSldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHNlcXVlbmNlVGltZXN0YW1wLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiBsaW5lc1twYXJzZUludChpKSArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGxpbmVzW3BhcnNlSW50KGkpICsgMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9Mb2dQcmludChcIm5ldyBzZWVrIGFkZFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5fcGxheWxpc3QubGVuZ3RoID4gMTUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XHJcbiAgICB9XHJcbiAgICBnZXRBbGxQbGF5bGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hlYWRlclswXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzJdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclszXSArXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls0XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QubWFwKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lICsgXCJcXG5cIiArIHguaW5mbyArIFwiXFxuXCIgKyB4LnVybCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTRXhUTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwwaE1VeTUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeE5RVUZOTEU5QlFVOHNSMEZCUnp0SlFVRm9RanRSUVVOVkxGbEJRVThzUjBGQmEwSXNRMEZCUXl4VFFVRlRMRVZCUVVVc2EwSkJRV3RDTEVWQlFVVXNlVUpCUVhsQ0xFVkJRVVVzZVVKQlFYbENMRU5CUVVNc1EwRkJRenRSUVVNdlJ5eGpRVUZUTEVkQlFXMUNMRVZCUVVVc1EwRkJRenRSUVVNdlFpeGpRVUZUTEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTJRc2MwSkJRV2xDTEVkQlFXMUNMRVZCUVVVc1EwRkJRenRKUVd0SWFrUXNRMEZCUXp0SlFXaElReXhMUVVGTExFTkJRVU1zWVVGQllTeERRVUZETEVsQlFWa3NSVUZCUlN4SlFVRkpMRWRCUVVjc1QwRkJUeXhGUVVGRkxFZEJRVWNzUjBGQlJ5eExRVUZMTzFGQlF6TkVMRTFCUVUwc1pVRkJaU3hIUVVGcFFpeEZRVUZGTEVOQlFVTTdVVUZEZWtNc1NVRkJTU3haUVVGdlF5eERRVUZETzFGQlJYcERMRTFCUVUwc1MwRkJTeXhIUVVGSExIRkdRVUZ4Uml4RFFVRkRPMUZCUlhCSExFOUJRVThzUTBGQlF5eFpRVUZaTEVkQlFVY3NTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eExRVUZMTEVsQlFVa3NSVUZCUlR0WlFVTXZReXhsUVVGbExFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNUMEZCVHl4RlFVRkZMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dFRRVU0xUlR0UlFVTkVMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zWlVGQlpTeERRVUZETEVOQlFVTTdVVUZETjBJc1RVRkJUU3hWUVVGVkxFZEJRVWNzUlVGQlJTeE5RVUZOTEVWQlFVVXNTVUZCU1N4RlFVRkZMRTlCUVU4c1JVRkJSU3hsUVVGbExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVkQlFVY3NSVUZCUlN4RFFVRkRPMUZCUTNoRkxFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZGZUVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJUdFpRVU5TTEUxQlFVMHNTVUZCU1N4RFFVRkRMRk5CUVZNc1JVRkJSU3hEUVVGRE8xTkJRM2hDTzFGQlEwUXNUMEZCVHl4SlFVRkpMRU5CUVVNN1NVRkRaQ3hEUVVGRE8wbEJSVVFzUzBGQlN5eERRVUZETEZOQlFWTTdVVUZEWWl4TlFVRk5MRXRCUVVzc1IwRkJSeXcyUkVGQk5rUXNRMEZCUXp0UlFVVTFSU3hOUVVGTkxFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1EwRkROVUlzU1VGQlNTeERRVUZETEdsQ1FVRnBRanRoUVVOdVFpeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRk5MRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVsQlFVa3NTMEZCU3l4RFFVRkRPMkZCUTJ4RExFOUJRVThzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCVFN4RlFVRkZMRVZCUVVVN1dVRkRlRUlzVFVGQlRTeExRVUZMTEVkQlFUSkNMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU51UlN4SlFVRkpMRXRCUVVzc1JVRkJSVHRuUWtGRFZDeEpRVUZKTzI5Q1FVTkdMRTFCUVUwc1EwRkJReXhIUVVGSExFMUJRVTBzUzBGQlN5eERRVUZETEN0Q1FVRXJRaXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkhMRWRCUVVjc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTzNkQ1FVTnFSaXhOUVVGTkxFVkJRVVVzUzBGQlN6dHhRa0ZEWkN4RFFVRkRMRU5CUVVNN2IwSkJRMGdzUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNN2IwSkJRMklzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmxDUVVObU8yZENRVUZETEUxQlFVMDdiMEpCUTA0c1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzJsQ1FVTm9RanRoUVVOR08ybENRVUZKTzJkQ1FVTklMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dGhRVU5vUWp0UlFVTklMRU5CUVVNc1EwRkJReXhEUVVOTUxFTkJRVU03U1VGRFNpeERRVUZETzBsQlJVUXNTVUZCU1N4blFrRkJaMEk3VVVGRGJFSXNUMEZCVHl4SlFVRkpMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTTdTVUZEYUVNc1EwRkJRenRKUVVWRUxHMUNRVUZ0UWl4RFFVRkRMRXRCUVVzN1VVRkRka0lzU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0SlFVTnlReXhEUVVGRE8wbEJSVVFzVjBGQlZ5eERRVUZETEZGQlFXZENPMUZCUXpGQ0xFbEJRVWtzVVVGQlVTeExRVUZMTEVsQlFVa3NSVUZCUlR0WlFVTnlRaXhQUVVGUExFdEJRVXNzUTBGQlF6dFRRVU5rTzFGQlJVUXNTVUZCU1N4UFFVRlBMRWRCUVVjc1MwRkJTeXhEUVVGRE8xRkJSWEJDTEUxQlFVMHNTMEZCU3l4SFFVRkhMRkZCUVZFc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1VVRkRiRVFzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVVUZETTBJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03VVVGRk0wSXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExFVkJRVVU3V1VGRGNrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETERKQ1FVRXlRaXhEUVVGRExFVkJRVVU3WjBKQlEyeEVMRTFCUVUwc2FVSkJRV2xDTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVWMlNDeE5RVUZOTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZPMjlDUVVOd1F5eFBRVUZQTEVOQlFVTXNRMEZCUXl4VFFVRlRMRWxCUVVrc2FVSkJRV2xDTEVOQlFVTTdaMEpCUXpGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVTklMRGhEUVVFNFF6dG5Ra0ZET1VNc1kwRkJZenRuUWtGRlpDeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJSVHR2UWtGRFlpeEpRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRWxCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzUTBGQlF5eERRVUZETzI5Q1FVTndReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUXp0M1FrRkRiRUlzU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03ZDBKQlEzaENMRk5CUVZNc1JVRkJSU3hwUWtGQmFVSTdkMEpCUXpWQ0xFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dDNRa0ZETlVJc1IwRkJSeXhGUVVGRkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8zRkNRVU0xUWl4RFFVRkRMRU5CUVVNN2IwSkJRMGdzTWtKQlFUSkNPMjlDUVVNelFpeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmxDUVVOb1FqdGhRVU5HTzFsQlEwUXNUMEZCVHl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUjBGQlJ5eEZRVUZGTEVWQlFVVTdaMEpCUTJwRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1lVRkRlRUk3VTBGRFJqdFJRVU5FTEU5QlFVOHNUMEZCVHl4RFFVRkRPMGxCUTJwQ0xFTkJRVU03U1VGRlJDeGpRVUZqTzFGQlExb3NUMEZCVHl4RFFVTk1MRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1N4RFFVRkRMRk5CUVZNN1dVRkRaQ3hKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJUdG5Ra0ZEZGtJc1QwRkJUeXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOMFJDeERRVUZETEVOQlFVTXNRMEZEU0N4RFFVRkRPMGxCUTBvc1EwRkJRenREUVVOR0luMD0iLCJleHBvcnQgZnVuY3Rpb24gY3VycmVudCgpIHtcclxuICAgIHJldHVybiBnbG9iYWwuY2hhbm5lbC5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IGdsb2JhbC5hY3R1YWxDaGFubmVsKTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZM1Z5Y21WdWRDNWphR0Z1Ym1Wc0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDJOb1lXNXVaV3d2WTNWeWNtVnVkQzVqYUdGdWJtVnNMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFMUJRVTBzVlVGQlZTeFBRVUZQTzBsQlEyNUNMRTlCUVU4c1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEV0QlFVc3NUVUZCVFN4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRE8wRkJRM1pGTEVOQlFVTWlmUT09IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uU3RhcnQoX3dpbmRvdywgdXJsLCB0ZXh0IC8qIGlzT2ZmbGluZSA9IGZhbHNlICovKSB7XHJcbiAgICBjb25zdCByZWdleCA9IC9obHNcXC8oLiopLm0zdTgvZ207XHJcbiAgICBjb25zdCBtYXRjaCA9IHJlZ2V4LmV4ZWModXJsKSB8fCBbXTtcclxuICAgIGxldCBleGlzdGVudCA9IGZhbHNlO1xyXG4gICAgaWYgKG1hdGNoWzFdKSB7XHJcbiAgICAgICAgX3dpbmRvdy5hY3R1YWxDaGFubmVsID0gbWF0Y2hbMV07XHJcbiAgICAgICAgaWYgKF93aW5kb3cud2hpdGVsaXN0LmluY2x1ZGVzKG1hdGNoWzFdKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghX3dpbmRvdy5jaGFubmVsLmZpbmQoKGMpID0+IGMubmFtZSA9PT0gbWF0Y2hbMV0pKSB7XHJcbiAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJuZXcgY2hhbm5lbCAyOiBcIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgX3dpbmRvdy5jaGFubmVsLnB1c2goeyBuYW1lOiBtYXRjaFsxXSwgZmxvd1NpZzogW10sIGhsczogbmV3IF93aW5kb3cuSExTKCkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBleGlzdGVudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIF93aW5kb3cuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICBnbG9iYWwuY3VycmVudENoYW5uZWwoKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0KTtcclxuICAgIF93aW5kb3cuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgaWYgKGV4aXN0ZW50KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIGdsb2JhbC5uZXdQaWN0dXJlKGdsb2JhbC5hY3R1YWxDaGFubmVsKS50aGVuKHRleHRQaWN0dXJlID0+IHtcclxuICAgICAgICBnbG9iYWwuY3VycmVudENoYW5uZWwoKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0UGljdHVyZSwgXCJwaWN0dXJlXCIsIHRydWUpO1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkxvY2FsIFNlcnZlciA0ODBwOiBPS1wiKTtcclxuICAgIH0pO1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIHRyeSB7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgICAgICBjb25zdCBhID0gYXdhaXQgX3dpbmRvdy5yZWFsRmV0Y2goXCJodHRwczovL2p1cHRlci5nYS9obHMvdjIvY2hhbm5lbC9cIiArIF93aW5kb3cuYWN0dWFsQ2hhbm5lbCwgeyBtZXRob2Q6IFwiR0VUXCIgfSk7XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGEudGV4dCgpO1xyXG4gICAgICAgIGlmICghYS5vaykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzZXJ2ZXIgcHJveHkgcmV0dXJuIGVycm9yIG9yIG5vdCBmb3VuZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eVVybFNwbGl0ID0gdGV4dC5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgY29uc3Qgc2VydmVyID0gcXVhbGl0eVVybFNwbGl0LnNoaWZ0KCk7XHJcbiAgICAgICAgY29uc3Qgc3RyZWFtTGlzdCA9IHsgc2VydmVyOiBcInByb3h5XCIsIHVybExpc3Q6IFtdIH07XHJcbiAgICAgICAgcXVhbGl0eVVybFNwbGl0LmZvckVhY2goKGVsZW1lbnQsIGluZGV4LCBhcnJheSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIShpbmRleCAlIDIpKSB7XHJcbiAgICAgICAgICAgICAgICBzdHJlYW1MaXN0LnVybExpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogc3RyZWFtTGlzdC51cmxMaXN0LnNvbWUoKHgpID0+IHgucXVhbGl0eSA9PSBlbGVtZW50KSA/IGVsZW1lbnQgKyBcInAzMFwiIDogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly92aWRlby13ZWF2ZXIuXCIgKyBzZXJ2ZXIgKyBcIi5obHMudHR2bncubmV0L3YxL3BsYXlsaXN0L1wiICsgYXJyYXlbaW5kZXggKyAxXSArIFwiLm0zdThcIixcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgX3dpbmRvdy5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gX3dpbmRvdy5hY3R1YWxDaGFubmVsKS5obHMuU3RyZWFtU2VydmVyTGlzdFNldChzdHJlYW1MaXN0KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhfd2luZG93LmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBfd2luZG93LmFjdHVhbENoYW5uZWwpLmhscy5TdHJlYW1TZXJ2ZXJMaXN0KTtcclxuICAgICAgICAvL2NoYW5uZWwuZmluZCh4ID0+IHgubmFtZSA9PT0gYWN0dWFsQ2hhbm5lbCkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dCk7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogT0tcIik7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogT0tcIik7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoZSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYjI0dVkyaGhibTVsYkM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTlqYUdGdWJtVnNMMjl1TG1Ob1lXNXVaV3d1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hQUVVGUExFTkJRVU1zVDBGQlR5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SlFVRkpMRU5CUVVNc2RVSkJRWFZDTzBsQlEzQkZMRTFCUVUwc1MwRkJTeXhIUVVGSExHdENRVUZyUWl4RFFVRkRPMGxCUTJwRExFMUJRVTBzUzBGQlN5eEhRVUY1UWl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0SlFVTXhSQ3hKUVVGSkxGRkJRVkVzUjBGQlJ5eExRVUZMTEVOQlFVTTdTVUZGY2tJc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVTdVVUZEVml4UFFVRlBMRU5CUVVNc1lVRkJZU3hIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTnFReXhKUVVGSkxFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTzFsQlEzUkRMRTlCUVU4N1UwRkRWanRSUVVWRUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0WlFVTnVSQ3hQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEdsQ1FVRnBRaXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUXk5RExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4UFFVRlBMRVZCUVVVc1JVRkJSU3hGUVVGRkxFZEJRVWNzUlVGQlJTeEpRVUZKTEU5QlFVOHNRMEZCUXl4SFFVRkhMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU03VTBGRGFrWTdZVUZCVFR0WlFVTklMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU03VTBGRGJrSTdTMEZEU2p0SlFVTkVMR2RFUVVGblJEdEpRVVZvUkN4blJFRkJaMFE3U1VGRGFFUXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXgxUWtGQmRVSXNRMEZCUXl4RFFVRkRPMGxCUXpGRExFMUJRVTBzUTBGQlF5eGpRVUZqTEVWQlFVVXNRMEZCUXl4SFFVRkhMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBsQlEyaEVMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1EwRkJRenRKUVVWeVF5eEpRVUZKTEZGQlFWRXNSVUZCUlR0UlFVTldMRTlCUVU4N1MwRkRWanRKUVVORUxHZEVRVUZuUkR0SlFVVm9SQ3huUkVGQlowUTdTVUZEYUVRc1RVRkJUU3hEUVVGRExGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eEZRVUZGTzFGQlEzWkVMRTFCUVUwc1EwRkJReXhqUVVGakxFVkJRVVVzUTBGQlF5eEhRVUZITEVOQlFVTXNZVUZCWVN4RFFVRkRMRmRCUVZjc1JVRkJSU3hUUVVGVExFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdVVUZEZUVVc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eDFRa0ZCZFVJc1EwRkJReXhEUVVGRE8wbEJRemRETEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUlVnc1owUkJRV2RFTzBsQlJXaEVMR2RFUVVGblJEdEpRVVZvUkN4SlFVRkpPMUZCUTBFc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5d3dRa0ZCTUVJc1EwRkJReXhEUVVGRE8xRkJRemRETEUxQlFVMHNRMEZCUXl4SFFVRkhMRTFCUVUwc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eHRRMEZCYlVNc1IwRkJSeXhQUVVGUExFTkJRVU1zWVVGQllTeEZRVUZGTEVWQlFVVXNUVUZCVFN4RlFVRkZMRXRCUVVzc1JVRkJSU3hEUVVGRExFTkJRVU03VVVGRmJFZ3NUVUZCVFN4SlFVRkpMRWRCUVVjc1RVRkJUU3hEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdVVUZGTlVJc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVTdXVUZEVUN4TlFVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExIZERRVUYzUXl4RFFVRkRMRU5CUVVNN1UwRkROMFE3VVVGRlJDeE5RVUZOTEdWQlFXVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEzaERMRTFCUVUwc1RVRkJUU3hIUVVGSExHVkJRV1VzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0UlFVVjJReXhOUVVGTkxGVkJRVlVzUjBGQlpTeEZRVUZGTEUxQlFVMHNSVUZCUlN4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRkxFVkJRVVVzUlVGQlJTeERRVUZETzFGQlEyaEZMR1ZCUVdVc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hGUVVGRk8xbEJRemxETEVsQlFVa3NRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUlVGQlJUdG5Ra0ZEWkN4VlFVRlZMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF6dHZRa0ZEY0VJc1QwRkJUeXhGUVVGRkxGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUE8yOUNRVU42Uml4SFFVRkhMRVZCUVVVc2RVSkJRWFZDTEVkQlFVY3NUVUZCVFN4SFFVRkhMRFpDUVVFMlFpeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzVDBGQlR6dHBRa0ZEY2tjc1EwRkJReXhEUVVGRE8yRkJRMDQ3VVVGRFRDeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVklMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeExRVUZMTEU5QlFVOHNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03VVVGRGJFY3NUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NTMEZCU3l4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEdkQ1FVRm5RaXhEUVVGRExFTkJRVU03VVVGRmFFY3NjMFZCUVhORk8xRkJRM1JGTEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc2NVSkJRWEZDTEVOQlFVTXNRMEZCUXp0UlFVTjRReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEhGQ1FVRnhRaXhEUVVGRExFTkJRVU03UzBGRE0wTTdTVUZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRSUVVOU0xFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1MwRkRka0k3UVVGRFRDeERRVUZESW4wPSIsImV4cG9ydCBmdW5jdGlvbiBpbmZsYXRlRmV0Y2goX3dpbmRvdykge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWdsb2JhbC1hc3NpZ25cclxuICAgIF93aW5kb3cuZmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGlmICh1cmwuZW5kc1dpdGgoJy50cycpKSB7XHJcbiAgICAgICAgICAgICAgICAvL3ZhciBwID0gY2hhbm5lbC5maW5kKHggPT4geC5uYW1lID09PSBhY3R1YWxDaGFubmVsKS5obHMuZ2V0UGxheWxpc3RCeVVybCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgLy92YXIgcHAgPSBjaGFubmVsLmZpbmQoeCA9PiB4Lm5hbWUgPT09IGFjdHVhbENoYW5uZWwpLmhscy5nZXRBbGxQbGF5bGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgLy9Mb2dQcmludChcInRzIHRpbWVzdGFtcDogXCIgKyBwWzBdLnRpbWVzdGFtcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVybC5lbmRzV2l0aCgnbTN1OCcpICYmIHVybC5pbmNsdWRlcygndHR2bncubmV0JykgJiYgIV93aW5kb3cud2hpdGVsaXN0LmluY2x1ZGVzKF93aW5kb3cuYWN0dWFsQ2hhbm5lbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb2Nlc3NGZXRjaCA9IGFzeW5jIGZ1bmN0aW9uICh1cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXdhaXQgb25CZWZvcmVGZXRjaCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93LnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF93aW5kb3cub25GZXRjaChfd2luZG93LCB0ZXh0LCB1cmwpLnRoZW4oZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHAgPSBfd2luZG93LmNoYW5uZWwuZmluZCh4ID0+IHgubmFtZSA9PT0gX3dpbmRvdy5hY3R1YWxDaGFubmVsKS5obHMuZ2V0QWxsUGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UocCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0ZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKFwidXNoZXIudHR2bncubmV0L2FwaS9jaGFubmVsL2hscy9cIikgJiYgIXVybC5pbmNsdWRlcygncGljdHVyZS1ieS1waWN0dXJlJykpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVybCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzRmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF93aW5kb3cucmVhbEZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGFzeW5jIGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY1wiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgX3dpbmRvdy5vblN0YXJ0Q2hhbm5lbChfd2luZG93LCB1cmwsIHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSh0ZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiY2hhbm5lbCBvZmZsaW5lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NGZXRjaCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcygncGljdHVyZS1ieS1waWN0dXJlJykpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3dpbmRvdy5yZWFsRmV0Y2guYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgIH07XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWm1WMFkyZ3VhVzVtYkdGMFpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWk0dUx5NHVMM055WXk5bVpYUmphQzltWlhSamFDNXBibVpzWVhSbExuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEUxQlFVMHNWVUZCVlN4WlFVRlpMRU5CUVVNc1QwRkJUenRKUVVOb1F5dzBRMEZCTkVNN1NVRkROVU1zVDBGQlR5eERRVUZETEV0QlFVc3NSMEZCUnl4TFFVRkxMRmRCUVZjc1IwRkJSeXhGUVVGRkxFOUJRVTg3VVVGRGNFTXNTVUZCU1N4UFFVRlBMRWRCUVVjc1MwRkJTeXhSUVVGUkxFVkJRVVU3V1VGRGVrSXNTVUZCU1N4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTzJkQ1FVTnlRaXhuUmtGQlowWTdaMEpCUTJoR0xEUkZRVUUwUlR0blFrRkZOVVVzT0VOQlFUaERPMkZCUTJwRU8xbEJSVVFzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExFVkJRVVU3WjBKQlEzcEhMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zVlVGQlZTeFBRVUZQTEVWQlFVVXNUVUZCVFR0dlFrRkRlRU1zU1VGQlNTeFpRVUZaTEVkQlFVY3NTMEZCU3l4WFFVRlhMRWRCUVVjN2QwSkJRMnhETERSQ1FVRTBRanQzUWtGRE5VSXNUVUZCVFN4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hSUVVGUk96UkNRVU42UkN4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNTVUZCU1R0blEwRkRMMElzVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRVZCUVVVc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNN2IwTkJRMmhFTEVsQlFVa3NRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUzBGQlN5eFBRVUZQTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETzI5RFFVTjZSaXhQUVVGUExFTkJRVU1zU1VGQlNTeFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRuUTBGRE4wSXNRMEZCUXl4RFFVRkRMRU5CUVVNN05FSkJRMUFzUTBGQlF5eERRVUZETEVOQlFVTTdkMEpCUTFBc1EwRkJReXhEUVVGRExFTkJRVUU3YjBKQlEwNHNRMEZCUXl4RFFVRkRPMjlDUVVOR0xGbEJRVmtzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0blFrRkRkRUlzUTBGQlF5eERRVUZETEVOQlFVTTdZVUZEVGp0WlFVVkVMRWxCUVVrc1IwRkJSeXhEUVVGRExGRkJRVkVzUTBGQlF5eHJRMEZCYTBNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXl4dlFrRkJiMElzUTBGQlF5eEZRVUZGTzJkQ1FVTjZSaXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMmRDUVVOcVFpeFBRVUZQTEVsQlFVa3NUMEZCVHl4RFFVRkRMRlZCUVZVc1QwRkJUeXhGUVVGRkxFMUJRVTA3YjBKQlEzaERMRWxCUVVrc1dVRkJXU3hIUVVGSExFdEJRVXNzVjBGQlZ5eEhRVUZITzNkQ1FVTnNReXhOUVVGTkxFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEZGQlFWRTdORUpCUTNwRUxFbEJRVWtzVVVGQlVTeERRVUZETEVWQlFVVXNSVUZCUlR0blEwRkRZaXhSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1YwRkJWeXhKUVVGSk8yOURRVU55UXl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExEWkRRVUUyUXl4RFFVRkRMRU5CUVVFN2IwTkJRekZFTEUxQlFVMHNUMEZCVHl4RFFVRkRMR05CUVdNc1EwRkJReXhQUVVGUExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlEUVVOcVJDeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5RMEZEYUVNc1EwRkJReXhEUVVGRExFTkJRVU03TmtKQlEwNDdhVU5CUVUwN1owTkJRMGdzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMmREUVVOc1FpeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVOQlFVTTdOa0pCUTNaRE8zZENRVU5NTEVOQlFVTXNRMEZCUXl4RFFVRkJPMjlDUVVOT0xFTkJRVU1zUTBGQlF6dHZRa0ZEUml4WlFVRlpMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WjBKQlEzUkNMRU5CUVVNc1EwRkJReXhEUVVGRE8yRkJRMDQ3V1VGRlJDeEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc2IwSkJRVzlDTEVOQlFVTXNSVUZCUlR0aFFVTjJRenRUUVVWS08xRkJSVVFzVDBGQlR5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzVTBGQlV5eERRVUZETEVOQlFVTTdTVUZEY0VRc1EwRkJReXhEUVVGQk8wRkJRMHdzUTBGQlF5SjkiLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gb24oX3dpbmRvdywgcmVzcG9uc2UsIHVybCkge1xyXG4gICAgLy8gICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuNSApe1xyXG4gICAgLy8gICAgICAgcmVzcG9uc2UgKz0gXCJ0d2l0Y2gtY2xpZW50LWFkXCI7XHJcbiAgICAvLyAgIH1cclxuICAgIGNvbnN0IGNoYW5uZWxDdXJyZW50ID0gYXdhaXQgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKCk7XHJcbiAgICAvL2lmIGFkcyBmaW5kIG9uIG1haW4gbGluayBjYWxsZWQgZnJvbSB0d2l0Y2ggYXBpIHBsYXllclxyXG4gICAgaWYgKHJlc3BvbnNlLnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJzdGl0Y2hlZC1hZFwiKSB8fCByZXNwb25zZS50b1N0cmluZygpLmluY2x1ZGVzKFwidHdpdGNoLWNsaWVudC1hZFwiKSkge1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcImFkcyBmb3VuZFwiKTtcclxuICAgICAgICBjb25zdCBxdWFsaXR5ID0gZ2xvYmFsLnF1YWxpdHk7XHJcbiAgICAgICAgY29uc3QgU3RyZWFtU2VydmVyTGlzdCA9IGNoYW5uZWxDdXJyZW50Lmhscy5TdHJlYW1TZXJ2ZXJMaXN0O1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vdHJ5IGFsbCBobHMgc2lncyB0aGF0IGhhdmUgb24gU3RyZWFtU2VydmVyTGlzdCBmcm9tIEhMU1xyXG4gICAgICAgICAgICBpZiAoU3RyZWFtU2VydmVyTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXR1cm5vID0gYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChTdHJlYW1TZXJ2ZXJMaXN0LmZpbmQoKHgpID0+IHguc2VydmVyID09IFwicHJveHlcIikudXJsTGlzdC5maW5kKChhKSA9PiBhLnF1YWxpdHkgPT0gcXVhbGl0eSkudXJsLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgfSkudGV4dCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJldHVybm8udG9TdHJpbmcoKS5pbmNsdWRlcyhcInN0aXRjaGVkLWFkXCIpIHx8IHJldHVybm8udG9TdHJpbmcoKS5pbmNsdWRlcyhcInR3aXRjaC1jbGllbnQtYWRcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJhZHMgb24gcHJveHlcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmV0dXJubywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAvL2dlcmEgZXJybyBzZSBuYW8gdGl2ZXIgbGlua1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG0zdTggdmFsaWQgdXJsIGZvdW5kIG9uIFN0cmVhbVNlcnZlckxpc3RcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIC8vaWYgbm90aGluZyByZXNvbHZlLCByZXR1cm4gNDgwcCBmbG93XHJcbiAgICAgICAgICAgIC8vTG9nUHJpbnQoU3RyZWFtU2VydmVyTGlzdC5maWx0ZXIoeCA9PiB4LnVybExpc3QuZmluZChhID0+IGEudXJsICE9IHVybCAmJiBhLnF1YWxpdHkgPT0gcXVhbGl0eSkgJiYgeC5zZXJ2ZXIgPT0gXCJsb2NhbFwiKS5tYXAoeCA9PiB4LnVybExpc3QuZmluZCh4ID0+IHgucXVhbGl0eS5pbmNsdWRlcygnNDgwJykpKVswXSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpY3R1cmVTdHJlYW0gPSBTdHJlYW1TZXJ2ZXJMaXN0LmZpbHRlcigoeCkgPT4geC5zZXJ2ZXIgPT0gXCJwaWN0dXJlXCIpXHJcbiAgICAgICAgICAgICAgICAubWFwKCh4KSA9PiB4LnVybExpc3QuZmluZCgoeCkgPT4geC5xdWFsaXR5LmluY2x1ZGVzKFwiNDgwXCIpKSlbMF0udXJsO1xyXG4gICAgICAgICAgICBjb25zdCByZXR1cm5vID0gYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChwaWN0dXJlU3RyZWFtKS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcIjQ4MFBcIik7XHJcbiAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChlKTtcclxuICAgICAgICAgICAgY2hhbm5lbEN1cnJlbnQuaGxzLmFkZFBsYXlsaXN0KHJldHVybm8pO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmVzcG9uc2UpO1xyXG4gICAgICAgIC8vTG9nUHJpbnQoY2hhbm5lbC5maW5kKHggPT4geC5uYW1lID09PSBhY3R1YWxDaGFubmVsKS5obHMuU3RyZWFtU2VydmVyTGlzdC5maWx0ZXIoeCA9PiB4LnVybExpc3QuZmluZChhID0+IGEudXJsID09IHVybCkpKTtcclxuICAgICAgICAvL0xvZ1ByaW50KGNoYW5uZWwuZmluZCh4ID0+IHgubmFtZSA9PT0gYWN0dWFsQ2hhbm5lbCkuaGxzLlN0cmVhbVNlcnZlckxpc3QuZmlsdGVyKHggPT4geC51cmxMaXN0LmZpbmQoYSA9PiBhLnVybCA9PSB1cmwgJiYgYS5xdWFsaXR5ID09IHF1YWxpdHkpKSk7XHJcbiAgICAgICAgLy9Mb2dQcmludChjaGFubmVsLmZpbmQoeCA9PiB4Lm5hbWUgPT09IGFjdHVhbENoYW5uZWwpLmhscy5TdHJlYW1TZXJ2ZXJMaXN0LmZpbHRlcih4ID0+IHgudXJsTGlzdC5maW5kKGEgPT4gYS51cmwgIT0gdXJsICYmIGEucXVhbGl0eSA9PSBxdWFsaXR5KSkpO1xyXG4gICAgICAgIC8vTG9nUHJpbnQoXCJva1wiKVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWIyNHVabVYwWTJndWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12Wm1WMFkyZ3ZiMjR1Wm1WMFkyZ3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFdEJRVXNzVlVGQlZTeEZRVUZGTEVOQlFVTXNUMEZCVHl4RlFVRkZMRkZCUVZFc1JVRkJSU3hIUVVGSE8wbEJRemRETEN0Q1FVRXJRanRKUVVNdlFpeDNRMEZCZDBNN1NVRkRlRU1zVFVGQlRUdEpRVVZPTEUxQlFVMHNZMEZCWXl4SFFVRkhMRTFCUVUwc1RVRkJUU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETzBsQlJYSkVMSGRFUVVGM1JEdEpRVU40UkN4SlFVRkpMRkZCUVZFc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWxCUVVrc1VVRkJVU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4clFrRkJhMElzUTBGQlF5eEZRVUZGTzFGQlEyNUhMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTTdVVUZGTjBJc1RVRkJUU3hQUVVGUExFZEJRVWNzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXp0UlFVTXZRaXhOUVVGTkxHZENRVUZuUWl4SFFVRkhMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1VVRkZOMFFzU1VGQlNUdFpRVU5HTEhsRVFVRjVSRHRaUVVONlJDeEpRVUZKTEdkQ1FVRm5RaXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVWQlFVVTdaMEpCUXk5Q0xFMUJRVTBzVDBGQlR5eEhRVUZITEUxQlFVMHNUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWxCUVVrc1QwRkJUeXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNTVUZCU1N4UFFVRlBMRU5CUVVNc1EwRkJReXhIUVVGSExFVkJRVVU3YjBKQlEzUkpMRTFCUVUwc1JVRkJSU3hMUVVGTE8ybENRVU5rTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRuUWtGRFZpeEpRVUZKTEU5QlFVOHNRMEZCUXl4UlFVRlJMRVZCUVVVc1EwRkJReXhSUVVGUkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NUMEZCVHl4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhGUVVGRk8yOUNRVU5xUnl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExHTkJRV01zUTBGQlF5eERRVUZETzI5Q1FVTm9ReXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETERaRFFVRTJReXhEUVVGRExFTkJRVU03YVVKQlEyaEZPMmRDUVVWRUxFOUJRVThzWTBGQll5eERRVUZETEVkQlFVY3NRMEZCUXl4WFFVRlhMRU5CUVVNc1QwRkJUeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVVnlSQ3cyUWtGQk5rSTdZVUZET1VJN1dVRkZSQ3hOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETERaRFFVRTJReXhEUVVGRExFTkJRVU03VTBGRGFFVTdVVUZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRaUVVOV0xITkRRVUZ6UXp0WlFVTjBReXgxVEVGQmRVdzdXVUZGZGt3c1RVRkJUU3hoUVVGaExFZEJRVWNzWjBKQlFXZENMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGSkxGTkJRVk1zUTBGQlF6dHBRa0ZEZUVVc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUVR0WlFVVjBSU3hOUVVGTkxFOUJRVThzUjBGQlJ5eE5RVUZOTEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdXVUZGTjBRc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0WlFVTjRRaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTI1Q0xHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNWMEZCVnl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8xbEJRM2hETEU5QlFVOHNTVUZCU1N4RFFVRkRPMU5CUTJJN1MwRkRSanRUUVVGTk8xRkJRMHdzWTBGQll5eERRVUZETEVkQlFVY3NRMEZCUXl4WFFVRlhMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03VVVGRGVrTXNORWhCUVRSSU8xRkJRelZJTEc5S1FVRnZTanRSUVVOd1NpeHZTa0ZCYjBvN1VVRkRjRW9zWjBKQlFXZENPMUZCUTJoQ0xFOUJRVThzU1VGQlNTeERRVUZETzB0QlEySTdRVUZEU0N4RFFVRkRJbjA9IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBpY3R1cmUoY2hhbm5lbE5hbWUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ3FsID0gYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChcImh0dHBzOi8vZ3FsLnR3aXRjaC50di9ncWxcIiwge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7IFwiQ2xpZW50LUlEXCI6IFwia2ltbmU3OGt4M25jeDZicmdvNG12NndraTVoMWtvXCIgfSxcclxuICAgICAgICAgICAgYm9keTogYHtcIm9wZXJhdGlvbk5hbWVcIjpcIlBsYXliYWNrQWNjZXNzVG9rZW5cIixcInZhcmlhYmxlc1wiOntcImlzTGl2ZVwiOnRydWUsXCJsb2dpblwiOlwiJHtjaGFubmVsTmFtZX1cIixcImlzVm9kXCI6ZmFsc2UsXCJ2b2RJRFwiOlwiXCIsXCJwbGF5ZXJUeXBlXCI6XCJ0aHVuZGVyZG9tZVwifSxcImV4dGVuc2lvbnNcIjp7XCJwZXJzaXN0ZWRRdWVyeVwiOntcInZlcnNpb25cIjoxLFwic2hhMjU2SGFzaFwiOlwiMDgyODExOWRlZDFjMTM0Nzc5NjY0MzRlMTU4MDBmZjU3ZGRhY2YxM2JhMTkxMWMxMjlkYzIyMDA3MDViMDcxMlwifX19YCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCBncWwuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly91c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiICtcclxuICAgICAgICAgICAgY2hhbm5lbE5hbWUgK1xyXG4gICAgICAgICAgICBcIi5tM3U4P2FsbG93X3NvdXJjZT10cnVlJmZhc3RfYnJlYWQ9dHJ1ZSZwPVwiICtcclxuICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMWU3KSArXHJcbiAgICAgICAgICAgIFwiJnBsYXllcl9iYWNrZW5kPW1lZGlhcGxheWVyJnBsYXlsaXN0X2luY2x1ZGVfZnJhbWVyYXRlPXRydWUmcmVhc3NpZ25tZW50c19zdXBwb3J0ZWQ9ZmFsc2Umc2lnPVwiICtcclxuICAgICAgICAgICAgc3RhdHVzW1wiZGF0YVwiXVtcInN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW5cIl1bXCJzaWduYXR1cmVcIl0gK1xyXG4gICAgICAgICAgICBcIiZzdXBwb3J0ZWRfY29kZWNzPWF2YzEmdG9rZW49XCIgK1xyXG4gICAgICAgICAgICBzdGF0dXNbXCJkYXRhXCJdW1wic3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlblwiXVtcInZhbHVlXCJdO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCAoYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwpKS50ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHRleHQ7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHbGpkSFZ5WlM1bVpYUmphQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OW1aWFJqYUM5d2FXTjBkWEpsTG1abGRHTm9MblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFMUJRVTBzUTBGQlF5eExRVUZMTEZWQlFWVXNUMEZCVHl4RFFVRkRMRmRCUVcxQ08wbEJRemRETEVsQlFVazdVVUZEUVN4TlFVRk5MRWRCUVVjc1IwRkJSeXhOUVVGTkxFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNNa0pCUVRKQ0xFVkJRVVU3V1VGRE5VUXNUVUZCVFN4RlFVRkZMRTFCUVUwN1dVRkRaQ3hQUVVGUExFVkJRVVVzUlVGQlJTeFhRVUZYTEVWQlFVVXNaME5CUVdkRExFVkJRVVU3V1VGRE1VUXNTVUZCU1N4RlFVRkZMRGhGUVVFNFJTeFhRVUZYTEhWTVFVRjFURHRUUVVONlVpeERRVUZETEVOQlFVTTdVVUZGU0N4TlFVRk5MRTFCUVUwc1IwRkJWeXhOUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0UlFVVjRReXhOUVVGTkxFZEJRVWNzUjBGRFRDd3dRMEZCTUVNN1dVRkRNVU1zVjBGQlZ6dFpRVU5ZTERSRFFVRTBRenRaUVVNMVF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEhRVUZITEVOQlFVTTdXVUZETDBJc1owZEJRV2RITzFsQlEyaEhMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5d3lRa0ZCTWtJc1EwRkJReXhEUVVGRExGZEJRVmNzUTBGQlF6dFpRVU40UkN3clFrRkJLMEk3V1VGREwwSXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExESkNRVUV5UWl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRmVrUXNUVUZCVFN4SlFVRkpMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlEzaEVMRTlCUVU4c1NVRkJTU3hEUVVGRE8wdEJRMlk3U1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0UlFVTlNMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEYkVJN1FVRkRUQ3hEUVVGREluMD0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaW5mbGF0ZUZldGNoIH0gZnJvbSBcIi4vZmV0Y2gvZmV0Y2guaW5mbGF0ZVwiO1xyXG5pbXBvcnQgeyBITFMgfSBmcm9tIFwiLi9ITFNcIjtcclxuaW1wb3J0IHsgb25TdGFydCB9IGZyb20gXCIuL2NoYW5uZWwvb24uY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBvbiB9IGZyb20gXCIuL2ZldGNoL29uLmZldGNoXCI7XHJcbmltcG9ydCB7IGN1cnJlbnQgfSBmcm9tIFwiLi9jaGFubmVsL2N1cnJlbnQuY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBwaWN0dXJlIH0gZnJvbSBcIi4vZmV0Y2gvcGljdHVyZS5mZXRjaFwiO1xyXG5leHBvcnQgZnVuY3Rpb24gYXBwKHNjb3BlLCB3aGl0ZWxpc3QpIHtcclxuICAgIHNjb3BlLkxvZ1ByaW50ID0gKHgpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIltQdXJwbGVdOiBcIiwgeCk7XHJcbiAgICB9O1xyXG4gICAgc2NvcGUucmVhbEZldGNoID0gZmV0Y2g7XHJcbiAgICBzY29wZS5xdWFsaXR5ID0gXCJcIjtcclxuICAgIHNjb3BlLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgc3dpdGNoIChlLmRhdGEuZnVuY05hbWUpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUucXVhbGl0eSA9IGUuZGF0YS5hcmdzWzBdLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzY29wZS5xdWFsaXR5KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzY29wZS5jaGFubmVsID0gW107XHJcbiAgICBzY29wZS5hY3R1YWxDaGFubmVsID0gXCJcIjtcclxuICAgIHNjb3BlLndoaXRlbGlzdCA9IHdoaXRlbGlzdDtcclxuICAgIHNjb3BlLm9uRmV0Y2ggPSBvbjtcclxuICAgIHNjb3BlLm5ld1BpY3R1cmUgPSBwaWN0dXJlO1xyXG4gICAgc2NvcGUub25TdGFydENoYW5uZWwgPSBvblN0YXJ0O1xyXG4gICAgc2NvcGUuY3VycmVudENoYW5uZWwgPSBjdXJyZW50O1xyXG4gICAgc2NvcGUuSExTID0gSExTO1xyXG4gICAgaW5mbGF0ZUZldGNoKHNjb3BlKTtcclxufVxyXG5hcHAoc2VsZiwgW1wianVrZXNcIl0pO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwyRndjQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNXVUZCV1N4RlFVRkZMRTFCUVUwc2RVSkJRWFZDTEVOQlFVTTdRVUZEY2tRc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeE5RVUZOTEU5QlFVOHNRMEZCUXp0QlFVTTFRaXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNjMEpCUVhOQ0xFTkJRVU03UVVGREwwTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hOUVVGTkxHdENRVUZyUWl4RFFVRkRPMEZCUTNSRExFOUJRVThzUlVGQlJTeFBRVUZQTEVWQlFVVXNUVUZCVFN3eVFrRkJNa0lzUTBGQlF6dEJRVU53UkN4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRkxFMUJRVTBzZFVKQlFYVkNMRU5CUVVNN1FVRkZhRVFzVFVGQlRTeFZRVUZWTEVkQlFVY3NRMEZCUXl4TFFVRlZMRVZCUVVVc1UwRkJaMEk3U1VGRE5VTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhEUVVGRExFTkJRVTBzUlVGQlJTeEZRVUZGTzFGQlF6RkNMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zV1VGQldTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXk5Q0xFTkJRVU1zUTBGQlF6dEpRVU5HTEV0QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1MwRkJTeXhEUVVGRE8wbEJRM2hDTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRMjVDTEV0QlFVc3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFRRVUZUTEVWQlFVVXNWVUZCVlN4RFFVRkRPMUZCUXpORExGRkJRVkVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVN1dVRkRka0lzUzBGQlN5eFpRVUZaTEVOQlFVTXNRMEZCUXp0blFrRkRha0lzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNN1owSkJRM0JETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzJkQ1FVTXpRaXhOUVVGTk8yRkJRMUE3V1VGRFJDeFBRVUZQTEVOQlFVTXNRMEZCUXp0blFrRkRVQ3hOUVVGTk8yRkJRMUE3VTBGRFJqdEpRVU5JTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUlVnc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVTTdTVUZEYmtJc1MwRkJTeXhEUVVGRExHRkJRV0VzUjBGQlJ5eEZRVUZGTEVOQlFVTTdTVUZEZWtJc1MwRkJTeXhEUVVGRExGTkJRVk1zUjBGQlJ5eFRRVUZUTEVOQlFVTTdTVUZGTlVJc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eEZRVUZGTEVOQlFVTTdTVUZEYmtJc1MwRkJTeXhEUVVGRExGVkJRVlVzUjBGQlJ5eFBRVUZQTEVOQlFVTTdTVUZGTTBJc1MwRkJTeXhEUVVGRExHTkJRV01zUjBGQlJ5eFBRVUZQTEVOQlFVTTdTVUZETDBJc1MwRkJTeXhEUVVGRExHTkJRV01zUjBGQlJ5eFBRVUZQTEVOQlFVTTdTVUZGTDBJc1MwRkJTeXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEVOQlFVTTdTVUZGYUVJc1dVRkJXU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzBGQlEzUkNMRU5CUVVNN1FVRkZSQ3hIUVVGSExFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReUo5Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9