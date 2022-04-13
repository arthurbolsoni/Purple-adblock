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
                                    var playlist = __webpack_require__.g.currentChannel().hls.getAllPlaylist();
                                    resolve(new Response(playlist));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guaW5mbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBTztJQUNoQyw0Q0FBNEM7SUFDNUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLE9BQU87UUFDcEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDekIsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixnRkFBZ0Y7Z0JBQ2hGLDRFQUE0RTtnQkFFNUUsOENBQThDO2FBQ2pEO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3pHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDeEMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ2xDLDRCQUE0Qjt3QkFDNUIsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFROzRCQUN6RCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtnQ0FDL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0NBQ2hELElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7b0NBQzVELE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dDQUNwQyxDQUFDLENBQUMsQ0FBQzs0QkFDUCxDQUFDLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUMsQ0FBQTtvQkFDTixDQUFDLENBQUM7b0JBQ0YsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixDQUFDLENBQUMsQ0FBQzthQUNOO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7Z0JBQ3pGLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDeEMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ2xDLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTs0QkFDekQsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFO2dDQUNiLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUk7b0NBQ3JDLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUNqRCxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDaEMsQ0FBQyxDQUFDLENBQUM7NkJBQ047aUNBQU07Z0NBQ0gsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUNsQixPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7NkJBQ3ZDO3dCQUNMLENBQUMsQ0FBQyxDQUFBO29CQUNOLENBQUMsQ0FBQztvQkFDRixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxDQUFDO2FBQ047WUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTthQUN2QztTQUVKO1FBRUQsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxDQUFBO0FBQ0wsQ0FBQyJ9

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
                return channelCurrent.hls.addPlaylist(returnoText);
            }
            //gera erro se nao tiver link
            throw new Error("No m3u8 valid url found on StreamServerList");
        }
        catch (e) {
            //if nothing resolve, return 480p flow
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
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvb24uZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzdDLDhCQUE4QjtJQUM5Qix1Q0FBdUM7SUFDdkMsS0FBSztJQUVMLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXJELHdEQUF3RDtJQUN4RCxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDMUIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU3QixNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ2pCLElBQUksRUFBRSxZQUFZO1lBQ2xCLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUMvQixNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7UUFFN0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV6QixJQUFJO1lBQ0YseURBQXlEO1lBQ3pELElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQTtnQkFFM0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakQsSUFBSSxXQUFXLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXhDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDN0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO2lCQUNoRTtnQkFFRCxPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3BEO1lBRUQsNkJBQTZCO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztTQUNoRTtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1Ysc0NBQXNDO1lBQ3RDLE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUM7aUJBQ3hFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUE7WUFFdEUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXJFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixjQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QyxPQUFPLElBQUksQ0FBQztTQUNiO0tBQ0Y7U0FBTTtRQUNMLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFDSCxDQUFDIn0=

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
    scope.postMessage({
        type: "init",
        value: null
    });
    scope.channel = [];
    scope.actualChannel = "";
    scope.currentChannel = _channel_current_channel__WEBPACK_IMPORTED_MODULE_4__.current;
    scope.newPicture = _fetch_picture_fetch__WEBPACK_IMPORTED_MODULE_5__.picture;
    scope.tunnel = null;
    scope.onFetch = _fetch_on_fetch__WEBPACK_IMPORTED_MODULE_3__.on;
    scope.onStartChannel = _channel_on_channel__WEBPACK_IMPORTED_MODULE_2__.onStart;
    scope.HLS = _HLS__WEBPACK_IMPORTED_MODULE_1__.HLS;
    (0,_fetch_fetch_inflate__WEBPACK_IMPORTED_MODULE_0__.inflateFetch)(scope);
}
app(self);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFaEQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFVO0lBQzVCLEtBQUssQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRTtRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUM7SUFFRixLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBUyxFQUFFLEVBQUU7UUFDMUIsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUMzRixDQUFDLENBQUM7SUFFRixLQUFLLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN4QixLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFLLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUVyQiw2QkFBNkI7SUFDN0IsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7UUFDM0MsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN2QixLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNqQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDcEMsTUFBTTthQUNQO1lBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ1AsTUFBTTthQUNQO1NBQ0Y7UUFFRCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ25CLEtBQUssY0FBYyxDQUFDLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQy9CLE1BQU07YUFDUDtZQUNELEtBQUssWUFBWSxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNsQyxNQUFNO2FBQ1A7WUFDRCxPQUFPLENBQUMsQ0FBQztnQkFDUCxNQUFNO2FBQ1A7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNoQixJQUFJLEVBQUUsTUFBTTtRQUNaLEtBQUssRUFBRSxJQUFJO0tBQ1osQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDekIsS0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFFL0IsS0FBSyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7SUFDM0IsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFFcEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFFL0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFFaEIsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMifQ==
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsMkJBQTJCLDZEQUFPO0FBQ2xDLHVCQUF1Qix5REFBTztBQUM5QjtBQUNBLG9CQUFvQiwrQ0FBRTtBQUN0QiwyQkFBMkIsd0RBQU87QUFDbEMsZ0JBQWdCLHFDQUFHO0FBQ25CLElBQUksa0VBQVk7QUFDaEI7QUFDQTtBQUNBLDJDQUEyQyxtMkUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvSExTLnRzIiwid2VicGFjazovLy8uL3NyYy9jaGFubmVsL2N1cnJlbnQuY2hhbm5lbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9vbi5jaGFubmVsLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9vbi5mZXRjaC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvcGljdHVyZS5mZXRjaC50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9zcmMvYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBITFMge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyID0gW1wiI0VYVE0zVVwiLCBcIiNFWFQtWC1WRVJTSU9OOjNcIiwgXCIjRVhULVgtVEFSR0VURFVSQVRJT046NlwiLCBcIiNFWFQtWC1NRURJQS1TRVFVRU5DRTpcIl07XHJcbiAgICAgICAgdGhpcy5fcGxheWxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLl9zZXF1ZW5jZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fc3RyZWFtU2VydmVyTGlzdCA9IFtdO1xyXG4gICAgfVxyXG4gICAgLy9hZGQgbTN1OCBsaW5rcyB3aXRoIHF1YWxpdHkgdG8gdGhlIGxpc3Qgb2Ygc2VydmVyc1xyXG4gICAgYXN5bmMgYWRkU3RyZWFtTGluayh0ZXh0LCB0eXBlID0gXCJsb2NhbFwiLCBzaWcgPSBmYWxzZSkge1xyXG4gICAgICAgIGNvbnN0IHF1YWxpdHlVcmxTcGxpdCA9IFtdO1xyXG4gICAgICAgIGxldCBjYXB0dXJlQXJyYXk7XHJcbiAgICAgICAgY29uc3QgUkVHRVggPSAvTkFNRT1cIigoPzpcXFMrXFxzK1xcUyt8XFxTKykpXCIsQVVUTyg/Ol58XFxTK1xccyspKD86XnxcXFMrXFxzKykoaHR0cHM6XFwvXFwvdmlkZW8oXFxTKykubTN1OCkvZztcclxuICAgICAgICB3aGlsZSAoKGNhcHR1cmVBcnJheSA9IFJFR0VYLmV4ZWModGV4dCkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHF1YWxpdHlVcmxTcGxpdC5wdXNoKHsgcXVhbGl0eTogY2FwdHVyZUFycmF5WzFdLCB1cmw6IGNhcHR1cmVBcnJheVsyXSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2cocXVhbGl0eVVybFNwbGl0KTtcclxuICAgICAgICBjb25zdCBzdHJlYW1MaXN0ID0geyBzZXJ2ZXI6IHR5cGUsIHVybExpc3Q6IHF1YWxpdHlVcmxTcGxpdCwgc2lnOiBzaWcgfTtcclxuICAgICAgICB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0LnB1c2goc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgaWYgKCFzaWcpIHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zaWduYXR1cmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBhc3luYyBzaWduYXR1cmUoKSB7XHJcbiAgICAgICAgY29uc3QgUkVHRVggPSAvdmlkZW8td2VhdmVyLiguKikuaGxzLnR0dm53Lm5ldFxcL3YxXFwvcGxheWxpc3RcXC8oLiopLm0zdTgkL2dtO1xyXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0XHJcbiAgICAgICAgICAgIC5maWx0ZXIoKHgpID0+IHguc2lnID09IGZhbHNlKVxyXG4gICAgICAgICAgICAuZm9yRWFjaChhc3luYyAoeCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtYXRjaCA9IFJFR0VYLmV4ZWMoeC51cmxMaXN0WzBdLnVybCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhID0gYXdhaXQgZmV0Y2goXCJodHRwczovL2p1cHRlci5nYS9obHMvdjIvc2lnL1wiICsgbWF0Y2hbMl0gKyBcIi9cIiArIG1hdGNoWzFdLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB4LnNpZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgZ2V0IFN0cmVhbVNlcnZlckxpc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0cmVhbVNlcnZlckxpc3Q7XHJcbiAgICB9XHJcbiAgICBhZGRQbGF5bGlzdChwbGF5bGlzdCkge1xyXG4gICAgICAgIGlmIChwbGF5bGlzdCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBwbGF5bGlzdC50b1N0cmluZygpLnNwbGl0KC9bXFxyXFxuXS8pO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls0XSA9IGxpbmVzWzRdO1xyXG4gICAgICAgIHRoaXMuX2hlYWRlcls1XSA9IGxpbmVzWzVdO1xyXG4gICAgICAgIC8vdGFrZSBhbGwgbTN1OSBjb250ZW50IHRvIHRoZSBwbGF5bGlzdCBhbmQgYnVpbGQgYSBuZXcgZmxvd1xyXG4gICAgICAgIGZvciAoY29uc3QgaSBpbiBsaW5lcykge1xyXG4gICAgICAgICAgICBpZiAobGluZXNbaV0uaW5jbHVkZXMoXCIjRVhULVgtUFJPR1JBTS1EQVRFLVRJTUU6XCIpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZXF1ZW5jZVRpbWVzdGFtcCA9IE1hdGguZmxvb3IobmV3IERhdGUobGluZXNbaV0uc2xpY2UobGluZXNbaV0ubGVuZ3RoIC0gMjQsIGxpbmVzW2ldLmxlbmd0aCkpLmdldFRpbWUoKSAvIDEwMDApO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgciA9IHRoaXMuX3BsYXlsaXN0LmZpbHRlcigoeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWVzdGFtcCA+PSBzZXF1ZW5jZVRpbWVzdGFtcDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlID0gdGhpcy5fc2VxdWVuY2UgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBsaW5lc1twYXJzZUludChpKV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogc2VxdWVuY2VUaW1lc3RhbXAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm86IGxpbmVzW3BhcnNlSW50KGkpICsgMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogbGluZXNbcGFyc2VJbnQoaSkgKyAyXSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aGlsZSAodGhpcy5fcGxheWxpc3QubGVuZ3RoID4gMTUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWQ7XHJcbiAgICB9XHJcbiAgICBnZXRBbGxQbGF5bGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hlYWRlclswXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzJdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclszXSArXHJcbiAgICAgICAgICAgIHRoaXMuX3NlcXVlbmNlICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls0XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNV0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QubWFwKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lICsgXCJcXG5cIiArIHguaW5mbyArIFwiXFxuXCIgKyB4LnVybCArIFwiXFxuXCI7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTRXhUTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwwaE1VeTUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeE5RVUZOTEU5QlFVOHNSMEZCUnp0SlFVRm9RanRSUVVOVkxGbEJRVThzUjBGQmEwSXNRMEZCUXl4VFFVRlRMRVZCUVVVc2EwSkJRV3RDTEVWQlFVVXNlVUpCUVhsQ0xFVkJRVVVzZDBKQlFYZENMRU5CUVVNc1EwRkJRenRSUVVNNVJ5eGpRVUZUTEVkQlFXMUNMRVZCUVVVc1EwRkJRenRSUVVNdlFpeGpRVUZUTEVkQlFVY3NRMEZCUXl4RFFVRkRPMUZCUTJRc2MwSkJRV2xDTEVkQlFXMUNMRVZCUVVVc1EwRkJRenRKUVRaSGFrUXNRMEZCUXp0SlFUTkhReXh2UkVGQmIwUTdTVUZEY0VRc1MwRkJTeXhEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZaTEVWQlFVVXNTVUZCU1N4SFFVRkhMRTlCUVU4c1JVRkJSU3hIUVVGSExFZEJRVWNzUzBGQlN6dFJRVU16UkN4TlFVRk5MR1ZCUVdVc1IwRkJhVUlzUlVGQlJTeERRVUZETzFGQlEzcERMRWxCUVVrc1dVRkJiME1zUTBGQlF6dFJRVVY2UXl4TlFVRk5MRXRCUVVzc1IwRkJSeXh4UmtGQmNVWXNRMEZCUXp0UlFVVndSeXhQUVVGUExFTkJRVU1zV1VGQldTeEhRVUZITEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZKTEVWQlFVVTdXVUZEYWtRc1pVRkJaU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEU5QlFVOHNSVUZCUlN4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUjBGQlJ5eEZRVUZGTEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03VTBGRE1VVTdVVUZEUkN4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExHVkJRV1VzUTBGQlF5eERRVUZETzFGQlF6ZENMRTFCUVUwc1ZVRkJWU3hIUVVGSExFVkJRVVVzVFVGQlRTeEZRVUZGTEVsQlFVa3NSVUZCUlN4UFFVRlBMRVZCUVVVc1pVRkJaU3hGUVVGRkxFZEJRVWNzUlVGQlJTeEhRVUZITEVWQlFVVXNRMEZCUXp0UlFVTjRSU3hKUVVGSkxFTkJRVU1zYVVKQlFXbENMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzFGQlJYaERMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVU3V1VGRFVpeE5RVUZOTEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVc1EwRkJRenRUUVVONFFqdFJRVU5FTEU5QlFVOHNTVUZCU1N4RFFVRkRPMGxCUTJRc1EwRkJRenRKUVVWRUxFdEJRVXNzUTBGQlF5eFRRVUZUTzFGQlEySXNUVUZCVFN4TFFVRkxMRWRCUVVjc05rUkJRVFpFTEVOQlFVTTdVVUZGTlVVc1RVRkJUU3hKUVVGSkxFOUJRVThzUTBGQlF5eERRVUZETEU5QlFVOHNSVUZCUlN4RlFVRkZMRU5CUXpWQ0xFbEJRVWtzUTBGQlF5eHBRa0ZCYVVJN1lVRkRia0lzVFVGQlRTeERRVUZETEVOQlFVTXNRMEZCVFN4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eEpRVUZKTEV0QlFVc3NRMEZCUXp0aFFVTnNReXhQUVVGUExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVMHNSVUZCUlN4RlFVRkZPMWxCUTNoQ0xFMUJRVTBzUzBGQlN5eEhRVUV5UWl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03V1VGRGJrVXNTVUZCU1N4TFFVRkxMRVZCUVVVN1owSkJRMVFzU1VGQlNUdHZRa0ZEUml4TlFVRk5MRU5CUVVNc1IwRkJSeXhOUVVGTkxFdEJRVXNzUTBGQlF5d3JRa0ZCSzBJc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NSMEZCUnl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJUdDNRa0ZEYWtZc1RVRkJUU3hGUVVGRkxFdEJRVXM3Y1VKQlEyUXNRMEZCUXl4RFFVRkRPMjlDUVVOSUxFTkJRVU1zUTBGQlF5eEhRVUZITEVkQlFVY3NTVUZCU1N4RFFVRkRPMjlDUVVOaUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0cFFrRkRaanRuUWtGQlF5eE5RVUZOTzI5Q1FVTk9MRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dHBRa0ZEYUVJN1lVRkRSanRwUWtGQlRUdG5Ra0ZEVEN4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03WVVGRGFFSTdVVUZEU0N4RFFVRkRMRU5CUVVNc1EwRkRUQ3hEUVVGRE8wbEJRMG9zUTBGQlF6dEpRVVZFTEVsQlFVa3NaMEpCUVdkQ08xRkJRMnhDTEU5QlFVOHNTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeERRVUZETzBsQlEyaERMRU5CUVVNN1NVRkZSQ3hYUVVGWExFTkJRVU1zVVVGQlowSTdVVUZETVVJc1NVRkJTU3hSUVVGUkxFdEJRVXNzU1VGQlNTeEZRVUZGTzFsQlEzSkNMRTlCUVU4c1MwRkJTeXhEUVVGRE8xTkJRMlE3VVVGRlJDeEpRVUZKTEU5QlFVOHNSMEZCUnl4TFFVRkxMRU5CUVVNN1VVRkZjRUlzVFVGQlRTeExRVUZMTEVkQlFVY3NVVUZCVVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0UlFVTnNSQ3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU16UWl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVVelFpdzBSRUZCTkVRN1VVRkROVVFzUzBGQlN5eE5RVUZOTEVOQlFVTXNTVUZCU1N4TFFVRkxMRVZCUVVVN1dVRkRja0lzU1VGQlNTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1VVRkJVU3hEUVVGRExESkNRVUV5UWl4RFFVRkRMRVZCUVVVN1owSkJRMnhFTEUxQlFVMHNhVUpCUVdsQ0xFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVkQlFVY3NSVUZCUlN4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eERRVUZETzJkQ1FVVjJTQ3hOUVVGTkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTzI5Q1FVTndReXhQUVVGUExFTkJRVU1zUTBGQlF5eFRRVUZUTEVsQlFVa3NhVUpCUVdsQ0xFTkJRVU03WjBKQlF6RkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yZENRVVZJTEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRk8yOUNRVU5pTEVsQlFVa3NRMEZCUXl4VFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eERRVUZETEVOQlFVTTdiMEpCUTNCRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRPM2RDUVVOc1FpeEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZEZUVJc1UwRkJVeXhGUVVGRkxHbENRVUZwUWp0M1FrRkROVUlzU1VGQlNTeEZRVUZGTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzNkQ1FVTTFRaXhIUVVGSExFVkJRVVVzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03Y1VKQlF6VkNMRU5CUVVNc1EwRkJRenR2UWtGRFNDeFBRVUZQTEVkQlFVY3NTVUZCU1N4RFFVRkRPMmxDUVVOb1FqdGhRVU5HTzFsQlEwUXNUMEZCVHl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUjBGQlJ5eEZRVUZGTEVWQlFVVTdaMEpCUTJwRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1lVRkRlRUk3VTBGRFJqdFJRVU5FTEU5QlFVOHNUMEZCVHl4RFFVRkRPMGxCUTJwQ0xFTkJRVU03U1VGRlJDeGpRVUZqTzFGQlExb3NUMEZCVHl4RFFVTk1MRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1R0WlFVTktMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEyWXNTVUZCU1N4RFFVRkRMRk5CUVZNN1dVRkRaQ3hKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1dVRkRaaXhKUVVGSk8xbEJRMG9zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJUdG5Ra0ZEZGtJc1QwRkJUeXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJRenRaUVVOMFJDeERRVUZETEVOQlFVTXNRMEZEU0N4RFFVRkRPMGxCUTBvc1EwRkJRenREUVVOR0luMD0iLCJleHBvcnQgZnVuY3Rpb24gY3VycmVudChjaGFubmVsID0gbnVsbCkge1xyXG4gICAgaWYgKGNoYW5uZWwpIHtcclxuICAgICAgICByZXR1cm4gZ2xvYmFsLmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBjaGFubmVsKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWwuY2hhbm5lbC5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IGdsb2JhbC5hY3R1YWxDaGFubmVsKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZM1Z5Y21WdWRDNWphR0Z1Ym1Wc0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dkxpNHZjM0pqTDJOb1lXNXVaV3d2WTNWeWNtVnVkQzVqYUdGdWJtVnNMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFMUJRVTBzVlVGQlZTeFBRVUZQTEVOQlFVTXNUMEZCVHl4SFFVRkhMRWxCUVVrN1NVRkRiRU1zU1VGQlJ5eFBRVUZQTEVWQlFVTTdVVUZEVUN4UFFVRlBMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeExRVUZMTEU5QlFVOHNRMEZCUXl4RFFVRkRPMHRCUTNwRU8xTkJRVWs3VVVGRFJDeFBRVUZQTEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXp0TFFVTjBSVHRCUVVOTUxFTkJRVU1pZlE9PSIsImV4cG9ydCBhc3luYyBmdW5jdGlvbiBvblN0YXJ0KF93aW5kb3csIHVybCwgdGV4dCAvKiBpc09mZmxpbmUgPSBmYWxzZSAqLykge1xyXG4gICAgY29uc3QgcmVnZXggPSAvaGxzXFwvKC4qKS5tM3U4L2dtO1xyXG4gICAgY29uc3QgbWF0Y2ggPSByZWdleC5leGVjKHVybCkgfHwgW107XHJcbiAgICBsZXQgZXhpc3RlbnQgPSBmYWxzZTtcclxuICAgIGlmIChtYXRjaFsxXSkge1xyXG4gICAgICAgIF93aW5kb3cuYWN0dWFsQ2hhbm5lbCA9IG1hdGNoWzFdO1xyXG4gICAgICAgIGlmIChfd2luZG93LndoaXRlbGlzdC5pbmNsdWRlcyhtYXRjaFsxXSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIV93aW5kb3cuY2hhbm5lbC5maW5kKChjKSA9PiBjLm5hbWUgPT09IG1hdGNoWzFdKSkge1xyXG4gICAgICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiQ2hhbm5lbDogXCIgKyBtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgIF93aW5kb3cuY2hhbm5lbC5wdXNoKHsgbmFtZTogbWF0Y2hbMV0sIGZsb3dTaWc6IFtdLCBobHM6IG5ldyBfd2luZG93LkhMUygpIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkV4aXN0OiBcIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgZXhpc3RlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICBfd2luZG93LkxvZ1ByaW50KFwiTG9jYWwgU2VydmVyOiBMb2FkaW5nXCIpO1xyXG4gICAgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKG1hdGNoWzFdKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0KTtcclxuICAgIF93aW5kb3cuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IE9LXCIpO1xyXG4gICAgaWYgKGV4aXN0ZW50KVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICBnbG9iYWwubmV3UGljdHVyZShnbG9iYWwuYWN0dWFsQ2hhbm5lbCkudGhlbih0ZXh0UGljdHVyZSA9PiB7XHJcbiAgICAgICAgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKG1hdGNoWzFdKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0UGljdHVyZSwgXCJwaWN0dXJlXCIsIHRydWUpO1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkxvY2FsIFNlcnZlciA0ODBwOiBPS1wiKTtcclxuICAgIH0pO1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIHRyeSB7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgICAgICBjb25zdCBhID0gYXdhaXQgX3dpbmRvdy5yZWFsRmV0Y2goXCJodHRwczovL2p1cHRlci5nYS9jaGFubmVsL1wiICsgbWF0Y2hbMV0sIHsgbWV0aG9kOiBcIkdFVFwiIH0pO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCBhLnRleHQoKTtcclxuICAgICAgICBpZiAoIWEub2spIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2VydmVyIHByb3h5IHJldHVybiBlcnJvciBvciBub3QgZm91bmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dCwgXCJwcm94eVwiKTtcclxuICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eVVybFNwbGl0ID0gdGV4dC5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgY29uc3Qgc2VydmVyID0gcXVhbGl0eVVybFNwbGl0LnNoaWZ0KCk7XHJcbiAgICAgICAgY29uc3Qgc3RyZWFtTGlzdCA9IHsgc2VydmVyOiBcInByb3h5XCIsIHVybExpc3Q6IFtdIH07XHJcbiAgICAgICAgcXVhbGl0eVVybFNwbGl0LmZvckVhY2goKGVsZW1lbnQsIGluZGV4LCBhcnJheSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIShpbmRleCAlIDIpKSB7XHJcbiAgICAgICAgICAgICAgICBzdHJlYW1MaXN0LnVybExpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogc3RyZWFtTGlzdC51cmxMaXN0LnNvbWUoKHgpID0+IHgucXVhbGl0eSA9PSBlbGVtZW50KSA/IGVsZW1lbnQgKyBcInAzMFwiIDogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly92aWRlby13ZWF2ZXIuXCIgKyBzZXJ2ZXIgKyBcIi5obHMudHR2bncubmV0L3YxL3BsYXlsaXN0L1wiICsgYXJyYXlbaW5kZXggKyAxXSArIFwiLm0zdThcIixcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChzdHJlYW1MaXN0KTtcclxuICAgICAgICBfd2luZG93LmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBtYXRjaFsxXSkuaGxzLmFkZChzdHJlYW1MaXN0KTtcclxuICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChlKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liMjR1WTJoaGJtNWxiQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OWphR0Z1Ym1Wc0wyOXVMbU5vWVc1dVpXd3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFdEJRVXNzVlVGQlZTeFBRVUZQTEVOQlFVTXNUMEZCVHl4RlFVRkZMRWRCUVVjc1JVRkJSU3hKUVVGSkxFTkJRVU1zZFVKQlFYVkNPMGxCUTNCRkxFMUJRVTBzUzBGQlN5eEhRVUZITEd0Q1FVRnJRaXhEUVVGRE8wbEJRMnBETEUxQlFVMHNTMEZCU3l4SFFVRjVRaXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRKUVVNeFJDeEpRVUZKTEZGQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNN1NVRkZja0lzU1VGQlNTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVN1VVRkRWaXhQUVVGUExFTkJRVU1zWVVGQllTeEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOcVF5eEpRVUZKTEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZPMWxCUTNSRExFOUJRVTg3VTBGRFZqdFJRVVZFTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUzBGQlN5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSVHRaUVVOdVJDeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRmRCUVZjc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjZReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hIUVVGSExFVkJRVVVzU1VGQlNTeFBRVUZQTEVOQlFVTXNSMEZCUnl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8xTkJRMnBHTzJGQlFVMDdXVUZEU0N4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOMlF5eFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRPMU5CUTI1Q08wdEJRMG83U1VGRFJDeG5SRUZCWjBRN1NVRkZhRVFzWjBSQlFXZEVPMGxCUTJoRUxFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNkVUpCUVhWQ0xFTkJRVU1zUTBGQlF6dEpRVU14UXl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdTVUZEZUVRc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhEUVVGRE8wbEJSWEpETEVsQlFVa3NVVUZCVVR0UlFVRkZMRTlCUVU4N1NVRkZja0lzWjBSQlFXZEVPMGxCUldoRUxHZEVRVUZuUkR0SlFVTm9SQ3hOUVVGTkxFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVWQlFVVTdVVUZEZGtRc1RVRkJUU3hEUVVGRExHTkJRV01zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zWVVGQllTeERRVUZETEZkQlFWY3NSVUZCUlN4VFFVRlRMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03VVVGRGFFWXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXgxUWtGQmRVSXNRMEZCUXl4RFFVRkRPMGxCUXpkRExFTkJRVU1zUTBGQlF5eERRVUZETzBsQlJVZ3NaMFJCUVdkRU8wbEJSV2hFTEdkRVFVRm5SRHRKUVVWb1JDeEpRVUZKTzFGQlEwRXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXd3UWtGQk1FSXNRMEZCUXl4RFFVRkRPMUZCUXpkRExFMUJRVTBzUTBGQlF5eEhRVUZITEUxQlFVMHNUMEZCVHl4RFFVRkRMRk5CUVZNc1EwRkJReXcwUWtGQk5FSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeE5RVUZOTEVWQlFVVXNTMEZCU3l4RlFVRkZMRU5CUVVNc1EwRkJRenRSUVVVNVJpeE5RVUZOTEVsQlFVa3NSMEZCUnl4TlFVRk5MRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVVUxUWl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJUdFpRVU5RTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2QwTkJRWGRETEVOQlFVTXNRMEZCUXp0VFFVTTNSRHRSUVVORUxFMUJRVTBzUTBGQlF5eGpRVUZqTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRmFrVXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXh4UWtGQmNVSXNRMEZCUXl4RFFVRkRPMUZCUTNoRExFOUJRVTg3VVVGRlVDeE5RVUZOTEdWQlFXVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEzaERMRTFCUVUwc1RVRkJUU3hIUVVGSExHVkJRV1VzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0UlFVVjJReXhOUVVGTkxGVkJRVlVzUjBGQlpTeEZRVUZGTEUxQlFVMHNSVUZCUlN4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRkxFVkJRVVVzUlVGQlJTeERRVUZETzFGQlEyaEZMR1ZCUVdVc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hGUVVGRk8xbEJRemxETEVsQlFVa3NRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUlVGQlJUdG5Ra0ZEWkN4VlFVRlZMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF6dHZRa0ZEY0VJc1QwRkJUeXhGUVVGRkxGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUE8yOUNRVU42Uml4SFFVRkhMRVZCUVVVc2RVSkJRWFZDTEVkQlFVY3NUVUZCVFN4SFFVRkhMRFpDUVVFMlFpeEhRVUZITEV0QlFVc3NRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzVDBGQlR6dHBRa0ZEY2tjc1EwRkJReXhEUVVGRE8yRkJRMDQ3VVVGRFRDeERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVklMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdVVUZETjBJc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEV0QlFVc3NTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVWeVJTeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMSEZDUVVGeFFpeERRVUZETEVOQlFVTTdTMEZETTBNN1NVRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdFJRVU5TTEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UzBGRGRrSTdRVUZEVEN4RFFVRkRJbjA9IiwiZXhwb3J0IGZ1bmN0aW9uIGluZmxhdGVGZXRjaChfd2luZG93KSB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZ2xvYmFsLWFzc2lnblxyXG4gICAgX3dpbmRvdy5mZXRjaCA9IGFzeW5jIGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHVybCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgaWYgKHVybC5lbmRzV2l0aCgnLnRzJykpIHtcclxuICAgICAgICAgICAgICAgIC8vdmFyIHAgPSBjaGFubmVsLmZpbmQoeCA9PiB4Lm5hbWUgPT09IGFjdHVhbENoYW5uZWwpLmhscy5nZXRQbGF5bGlzdEJ5VXJsKHVybCk7XHJcbiAgICAgICAgICAgICAgICAvL3ZhciBwcCA9IGNoYW5uZWwuZmluZCh4ID0+IHgubmFtZSA9PT0gYWN0dWFsQ2hhbm5lbCkuaGxzLmdldEFsbFBsYXlsaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAvL0xvZ1ByaW50KFwidHMgdGltZXN0YW1wOiBcIiArIHBbMF0udGltZXN0YW1wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXJsLmVuZHNXaXRoKCdtM3U4JykgJiYgdXJsLmluY2x1ZGVzKCd0dHZudy5uZXQnKSAmJiAhX3dpbmRvdy53aGl0ZWxpc3QuaW5jbHVkZXMoX3dpbmRvdy5hY3R1YWxDaGFubmVsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc0ZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhd2FpdCBvbkJlZm9yZUZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF93aW5kb3cucmVhbEZldGNoKHVybCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dpbmRvdy5vbkZldGNoKF93aW5kb3csIHRleHQsIHVybCkudGhlbihmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWxpc3QgPSBnbG9iYWwuY3VycmVudENoYW5uZWwoKS5obHMuZ2V0QWxsUGxheWxpc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UocGxheWxpc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NGZXRjaCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcyhcInVzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIpICYmICF1cmwuaW5jbHVkZXMoJ3BpY3R1cmUtYnktcGljdHVyZScpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc0ZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93LnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihhc3luYyBmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93Lm9uU3RhcnRDaGFubmVsKF93aW5kb3csIHVybCwgdGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHRleHQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJjaGFubmVsIG9mZmxpbmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0ZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCdwaWN0dXJlLWJ5LXBpY3R1cmUnKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfd2luZG93LnJlYWxGZXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2labVYwWTJndWFXNW1iR0YwWlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTltWlhSamFDOW1aWFJqYUM1cGJtWnNZWFJsTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1ZVRkJWU3haUVVGWkxFTkJRVU1zVDBGQlR6dEpRVU5vUXl3MFEwRkJORU03U1VGRE5VTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1IwRkJSeXhMUVVGTExGZEJRVmNzUjBGQlJ5eEZRVUZGTEU5QlFVODdVVUZEY0VNc1NVRkJTU3hQUVVGUExFZEJRVWNzUzBGQlN5eFJRVUZSTEVWQlFVVTdXVUZEZWtJc1NVRkJTU3hIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkZPMmRDUVVOeVFpeG5Sa0ZCWjBZN1owSkJRMmhHTERSRlFVRTBSVHRuUWtGRk5VVXNPRU5CUVRoRE8yRkJRMnBFTzFsQlJVUXNTVUZCU1N4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zWVVGQllTeERRVUZETEVWQlFVVTdaMEpCUTNwSExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNWVUZCVlN4UFFVRlBMRVZCUVVVc1RVRkJUVHR2UWtGRGVFTXNTVUZCU1N4WlFVRlpMRWRCUVVjc1MwRkJTeXhYUVVGWExFZEJRVWM3ZDBKQlEyeERMRFJDUVVFMFFqdDNRa0ZETlVJc1RVRkJUU3hQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeFJRVUZST3pSQ1FVTjZSQ3hSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1NVRkJTVHRuUTBGREwwSXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFVkJRVVVzU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU03YjBOQlEyaEVMRWxCUVVrc1VVRkJVU3hIUVVGSExFMUJRVTBzUTBGQlF5eGpRVUZqTEVWQlFVVXNRMEZCUXl4SFFVRkhMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU03YjBOQlF6VkVMRTlCUVU4c1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmREUVVOd1F5eERRVUZETEVOQlFVTXNRMEZCUXpzMFFrRkRVQ3hEUVVGRExFTkJRVU1zUTBGQlF6dDNRa0ZEVUN4RFFVRkRMRU5CUVVNc1EwRkJRVHR2UWtGRFRpeERRVUZETEVOQlFVTTdiMEpCUTBZc1dVRkJXU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJkQ1FVTjBRaXhEUVVGRExFTkJRVU1zUTBGQlF6dGhRVU5PTzFsQlJVUXNTVUZCU1N4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExHdERRVUZyUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEc5Q1FVRnZRaXhEUVVGRExFVkJRVVU3WjBKQlEzcEdMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUTJwQ0xFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNWVUZCVlN4UFFVRlBMRVZCUVVVc1RVRkJUVHR2UWtGRGVFTXNTVUZCU1N4WlFVRlpMRWRCUVVjc1MwRkJTeXhYUVVGWExFZEJRVWM3ZDBKQlEyeERMRTFCUVUwc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzVVVGQlVUczBRa0ZEZWtRc1NVRkJTU3hSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTzJkRFFVTmlMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4WFFVRlhMRWxCUVVrN2IwTkJRM0pETEUxQlFVMHNUMEZCVHl4RFFVRkRMR05CUVdNc1EwRkJReXhQUVVGUExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlEUVVOcVJDeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5RMEZEYUVNc1EwRkJReXhEUVVGRExFTkJRVU03TmtKQlEwNDdhVU5CUVUwN1owTkJRMGdzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMmREUVVOc1FpeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVOQlFVTTdOa0pCUTNaRE8zZENRVU5NTEVOQlFVTXNRMEZCUXl4RFFVRkJPMjlDUVVOT0xFTkJRVU1zUTBGQlF6dHZRa0ZEUml4WlFVRlpMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WjBKQlEzUkNMRU5CUVVNc1EwRkJReXhEUVVGRE8yRkJRMDQ3V1VGRlJDeEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc2IwSkJRVzlDTEVOQlFVTXNSVUZCUlR0aFFVTjJRenRUUVVWS08xRkJSVVFzVDBGQlR5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzVTBGQlV5eERRVUZETEVOQlFVTTdTVUZEY0VRc1EwRkJReXhEUVVGQk8wRkJRMHdzUTBGQlF5SjkiLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gb24oX3dpbmRvdywgcmVzcG9uc2UsIHVybCkge1xyXG4gICAgLy8gIGlmIChNYXRoLnJhbmRvbSgpIDwgMC41ICl7XHJcbiAgICAvLyAgICAgIHJlc3BvbnNlICs9IFwidHdpdGNoLWNsaWVudC1hZFwiO1xyXG4gICAgLy8gIH1cclxuICAgIGNvbnN0IGNoYW5uZWxDdXJyZW50ID0gYXdhaXQgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKCk7XHJcbiAgICAvL2lmIGFkcyBmaW5kIG9uIG1haW4gbGluayBjYWxsZWQgZnJvbSB0d2l0Y2ggYXBpIHBsYXllclxyXG4gICAgaWYgKGdsb2JhbC5pc0FkcyhyZXNwb25zZSkpIHtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJhZHMgZm91bmRcIik7XHJcbiAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgdHlwZTogXCJnZXRRdWFsaXR5XCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eSA9IGdsb2JhbC5xdWFsaXR5O1xyXG4gICAgICAgIGNvbnN0IFN0cmVhbVNlcnZlckxpc3QgPSBjaGFubmVsQ3VycmVudC5obHMuU3RyZWFtU2VydmVyTGlzdDtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQocXVhbGl0eSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy90cnkgYWxsIGhscyBzaWdzIHRoYXQgaGF2ZSBvbiBTdHJlYW1TZXJ2ZXJMaXN0IGZyb20gSExTXHJcbiAgICAgICAgICAgIGlmIChTdHJlYW1TZXJ2ZXJMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3h5ID0gU3RyZWFtU2VydmVyTGlzdC5maW5kKCh4KSA9PiB4LnNlcnZlciA9PSBcInByb3h5XCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gcHJveHkudXJsTGlzdC5maW5kKChhKSA9PiBhLnF1YWxpdHkgPT0gcXVhbGl0eSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXR1cm5vMiA9IGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2godXJsLnVybCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmV0dXJub1RleHQgPSBhd2FpdCByZXR1cm5vMi50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLmlzQWRzKHJldHVybm9UZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcImFkcyBvbiBwcm94eVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXR1cm5vVGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9nZXJhIGVycm8gc2UgbmFvIHRpdmVyIGxpbmtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgLy9pZiBub3RoaW5nIHJlc29sdmUsIHJldHVybiA0ODBwIGZsb3dcclxuICAgICAgICAgICAgY29uc3QgcGljdHVyZVN0cmVhbSA9IFN0cmVhbVNlcnZlckxpc3QuZmlsdGVyKCh4KSA9PiB4LnNlcnZlciA9PSBcInBpY3R1cmVcIilcclxuICAgICAgICAgICAgICAgIC5tYXAoKHgpID0+IHgudXJsTGlzdC5maW5kKCh4KSA9PiB4LnF1YWxpdHkuaW5jbHVkZXMoXCI0ODBcIikpKVswXS51cmw7XHJcbiAgICAgICAgICAgIGNvbnN0IHJldHVybm8gPSBhd2FpdCAoYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChwaWN0dXJlU3RyZWFtKSkudGV4dCgpO1xyXG4gICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCI0ODBQXCIpO1xyXG4gICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoZSk7XHJcbiAgICAgICAgICAgIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXR1cm5vKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY2hhbm5lbEN1cnJlbnQuaGxzLmFkZFBsYXlsaXN0KHJlc3BvbnNlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liMjR1Wm1WMFkyZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdlptVjBZMmd2YjI0dVptVjBZMmd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hGUVVGRkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4SFFVRkhPMGxCUXpkRExEaENRVUU0UWp0SlFVTTVRaXgxUTBGQmRVTTdTVUZEZGtNc1MwRkJTenRKUVVWTUxFMUJRVTBzWTBGQll5eEhRVUZITEUxQlFVMHNUVUZCVFN4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRE8wbEJSWEpFTEhkRVFVRjNSRHRKUVVONFJDeEpRVUZKTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVU3VVVGRE1VSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dFJRVVUzUWl4TlFVRk5MRU5CUVVNc1YwRkJWeXhEUVVGRE8xbEJRMnBDTEVsQlFVa3NSVUZCUlN4WlFVRlpPMWxCUTJ4Q0xFdEJRVXNzUlVGQlJTeEpRVUZKTzFOQlExb3NRMEZCUXl4RFFVRkRPMUZCUlVnc1RVRkJUU3hQUVVGUExFZEJRVWNzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXp0UlFVTXZRaXhOUVVGTkxHZENRVUZuUWl4SFFVRkhMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1VVRkZOMFFzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVWNlFpeEpRVUZKTzFsQlEwWXNlVVJCUVhsRU8xbEJRM3BFTEVsQlFVa3NaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlR0blFrRkRMMElzVFVGQlRTeExRVUZMTEVkQlFVY3NaMEpCUVdkQ0xFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRkRPMmRDUVVOb1JTeE5RVUZOTEVkQlFVY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUVR0blFrRkZNMFFzVFVGQlRTeFJRVUZSTEVkQlFVY3NUVUZCVFN4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0blFrRkRha1FzU1VGQlNTeFhRVUZYTEVkQlFVY3NUVUZCVFN4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU03WjBKQlJYaERMRWxCUVVrc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eFhRVUZYTEVOQlFVTXNSVUZCUlR0dlFrRkROMElzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJRenR2UWtGRGFFTXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXcyUTBGQk5rTXNRMEZCUXl4RFFVRkRPMmxDUVVOb1JUdG5Ra0ZGUkN4UFFVRlBMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zVjBGQlZ5eERRVUZETEZkQlFWY3NRMEZCUXl4RFFVRkRPMkZCUTNCRU8xbEJSVVFzTmtKQlFUWkNPMWxCUXpkQ0xFMUJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNOa05CUVRaRExFTkJRVU1zUTBGQlF6dFRRVU5vUlR0UlFVRkRMRTlCUVU4c1EwRkJReXhGUVVGRk8xbEJRMVlzYzBOQlFYTkRPMWxCUTNSRExFMUJRVTBzWVVGQllTeEhRVUZITEdkQ1FVRm5RaXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzU1VGQlNTeFRRVUZUTEVOQlFVTTdhVUpCUTNoRkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVFN1dVRkZkRVVzVFVGQlRTeFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xbEJSWEpGTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03V1VGRGVFSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU51UWl4alFVRmpMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0WlFVTjRReXhQUVVGUExFbEJRVWtzUTBGQlF6dFRRVU5pTzB0QlEwWTdVMEZCVFR0UlFVTk1MR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zVjBGQlZ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMUZCUTNwRExFOUJRVThzU1VGQlNTeERRVUZETzB0QlEySTdRVUZEU0N4RFFVRkRJbjA9IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBpY3R1cmUoY2hhbm5lbE5hbWUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ3FsID0gYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChcImh0dHBzOi8vZ3FsLnR3aXRjaC50di9ncWxcIiwge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7IFwiQ2xpZW50LUlEXCI6IFwia2ltbmU3OGt4M25jeDZicmdvNG12NndraTVoMWtvXCIgfSxcclxuICAgICAgICAgICAgYm9keTogYHtcIm9wZXJhdGlvbk5hbWVcIjpcIlBsYXliYWNrQWNjZXNzVG9rZW5cIixcInZhcmlhYmxlc1wiOntcImlzTGl2ZVwiOnRydWUsXCJsb2dpblwiOlwiJHtjaGFubmVsTmFtZX1cIixcImlzVm9kXCI6ZmFsc2UsXCJ2b2RJRFwiOlwiXCIsXCJwbGF5ZXJUeXBlXCI6XCJ0aHVuZGVyZG9tZVwifSxcImV4dGVuc2lvbnNcIjp7XCJwZXJzaXN0ZWRRdWVyeVwiOntcInZlcnNpb25cIjoxLFwic2hhMjU2SGFzaFwiOlwiMDgyODExOWRlZDFjMTM0Nzc5NjY0MzRlMTU4MDBmZjU3ZGRhY2YxM2JhMTkxMWMxMjlkYzIyMDA3MDViMDcxMlwifX19YCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCBncWwuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly91c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiICtcclxuICAgICAgICAgICAgY2hhbm5lbE5hbWUgK1xyXG4gICAgICAgICAgICBcIi5tM3U4P2FsbG93X3NvdXJjZT10cnVlJmZhc3RfYnJlYWQ9dHJ1ZSZwPVwiICtcclxuICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMWU3KSArXHJcbiAgICAgICAgICAgIFwiJnBsYXllcl9iYWNrZW5kPW1lZGlhcGxheWVyJnBsYXlsaXN0X2luY2x1ZGVfZnJhbWVyYXRlPXRydWUmcmVhc3NpZ25tZW50c19zdXBwb3J0ZWQ9ZmFsc2Umc2lnPVwiICtcclxuICAgICAgICAgICAgc3RhdHVzW1wiZGF0YVwiXVtcInN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW5cIl1bXCJzaWduYXR1cmVcIl0gK1xyXG4gICAgICAgICAgICBcIiZzdXBwb3J0ZWRfY29kZWNzPWF2YzEmdG9rZW49XCIgK1xyXG4gICAgICAgICAgICBzdGF0dXNbXCJkYXRhXCJdW1wic3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlblwiXVtcInZhbHVlXCJdO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCAoYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwpKS50ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHRleHQ7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHbGpkSFZ5WlM1bVpYUmphQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OW1aWFJqYUM5d2FXTjBkWEpsTG1abGRHTm9MblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFMUJRVTBzUTBGQlF5eExRVUZMTEZWQlFWVXNUMEZCVHl4RFFVRkRMRmRCUVcxQ08wbEJRemRETEVsQlFVazdVVUZEUVN4TlFVRk5MRWRCUVVjc1IwRkJSeXhOUVVGTkxFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNNa0pCUVRKQ0xFVkJRVVU3V1VGRE5VUXNUVUZCVFN4RlFVRkZMRTFCUVUwN1dVRkRaQ3hQUVVGUExFVkJRVVVzUlVGQlJTeFhRVUZYTEVWQlFVVXNaME5CUVdkRExFVkJRVVU3V1VGRE1VUXNTVUZCU1N4RlFVRkZMRGhGUVVFNFJTeFhRVUZYTEhWTVFVRjFURHRUUVVONlVpeERRVUZETEVOQlFVTTdVVUZGU0N4TlFVRk5MRTFCUVUwc1IwRkJWeXhOUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0UlFVVjRReXhOUVVGTkxFZEJRVWNzUjBGRFRDd3dRMEZCTUVNN1dVRkRNVU1zVjBGQlZ6dFpRVU5ZTERSRFFVRTBRenRaUVVNMVF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEhRVUZITEVOQlFVTTdXVUZETDBJc1owZEJRV2RITzFsQlEyaEhMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5d3lRa0ZCTWtJc1EwRkJReXhEUVVGRExGZEJRVmNzUTBGQlF6dFpRVU40UkN3clFrRkJLMEk3V1VGREwwSXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExESkNRVUV5UWl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRmVrUXNUVUZCVFN4SlFVRkpMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlEzaEVMRTlCUVU4c1NVRkJTU3hEUVVGRE8wdEJRMlk3U1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0UlFVTlNMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEYkVJN1FVRkRUQ3hEUVVGREluMD0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaW5mbGF0ZUZldGNoIH0gZnJvbSBcIi4vZmV0Y2gvZmV0Y2guaW5mbGF0ZVwiO1xyXG5pbXBvcnQgeyBITFMgfSBmcm9tIFwiLi9ITFNcIjtcclxuaW1wb3J0IHsgb25TdGFydCB9IGZyb20gXCIuL2NoYW5uZWwvb24uY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBvbiB9IGZyb20gXCIuL2ZldGNoL29uLmZldGNoXCI7XHJcbmltcG9ydCB7IGN1cnJlbnQgfSBmcm9tIFwiLi9jaGFubmVsL2N1cnJlbnQuY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBwaWN0dXJlIH0gZnJvbSBcIi4vZmV0Y2gvcGljdHVyZS5mZXRjaFwiO1xyXG5leHBvcnQgZnVuY3Rpb24gYXBwKHNjb3BlKSB7XHJcbiAgICBzY29wZS5Mb2dQcmludCA9ICh4KSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJbUHVycGxlXTogXCIsIHgpO1xyXG4gICAgfTtcclxuICAgIHNjb3BlLmlzQWRzID0gKHgpID0+IHtcclxuICAgICAgICByZXR1cm4geC50b1N0cmluZygpLmluY2x1ZGVzKFwic3RpdGNoZWQtYWRcIikgfHwgeC50b1N0cmluZygpLmluY2x1ZGVzKFwidHdpdGNoLWNsaWVudC1hZFwiKTtcclxuICAgIH07XHJcbiAgICBzY29wZS5yZWFsRmV0Y2ggPSBmZXRjaDtcclxuICAgIHNjb3BlLnF1YWxpdHkgPSBcIlwiO1xyXG4gICAgc2NvcGUud2hpdGVsaXN0ID0gW107XHJcbiAgICAvL3JlY2VpdmUgbWVzc2FnZSBmcm9tIHdpbmRvd1xyXG4gICAgc2NvcGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBzd2l0Y2ggKGUuZGF0YS5mdW5jTmFtZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0UXVhbGl0eVwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5xdWFsaXR5ID0gZS5kYXRhLmFyZ3NbMF0ubmFtZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAoZS5kYXRhLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldFdoaXRlbGlzdFwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS53aGl0ZWxpc3QgPSBlLmRhdGEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFwic2V0UXVhbGl0eVwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5xdWFsaXR5ID0gZS5kYXRhLnZhbHVlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2NvcGUucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6IFwiaW5pdFwiLFxyXG4gICAgICAgIHZhbHVlOiBudWxsXHJcbiAgICB9KTtcclxuICAgIHNjb3BlLmNoYW5uZWwgPSBbXTtcclxuICAgIHNjb3BlLmFjdHVhbENoYW5uZWwgPSBcIlwiO1xyXG4gICAgc2NvcGUuY3VycmVudENoYW5uZWwgPSBjdXJyZW50O1xyXG4gICAgc2NvcGUubmV3UGljdHVyZSA9IHBpY3R1cmU7XHJcbiAgICBzY29wZS50dW5uZWwgPSBudWxsO1xyXG4gICAgc2NvcGUub25GZXRjaCA9IG9uO1xyXG4gICAgc2NvcGUub25TdGFydENoYW5uZWwgPSBvblN0YXJ0O1xyXG4gICAgc2NvcGUuSExTID0gSExTO1xyXG4gICAgaW5mbGF0ZUZldGNoKHNjb3BlKTtcclxufVxyXG5hcHAoc2VsZik7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZjM0pqTDJGd2NDNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4UFFVRlBMRVZCUVVVc1dVRkJXU3hGUVVGRkxFMUJRVTBzZFVKQlFYVkNMRU5CUVVNN1FVRkRja1FzVDBGQlR5eEZRVUZGTEVkQlFVY3NSVUZCUlN4TlFVRk5MRTlCUVU4c1EwRkJRenRCUVVNMVFpeFBRVUZQTEVWQlFVVXNUMEZCVHl4RlFVRkZMRTFCUVUwc2MwSkJRWE5DTEVOQlFVTTdRVUZETDBNc1QwRkJUeXhGUVVGRkxFVkJRVVVzUlVGQlJTeE5RVUZOTEd0Q1FVRnJRaXhEUVVGRE8wRkJRM1JETEU5QlFVOHNSVUZCUlN4UFFVRlBMRVZCUVVVc1RVRkJUU3d5UWtGQk1rSXNRMEZCUXp0QlFVTndSQ3hQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNkVUpCUVhWQ0xFTkJRVU03UVVGRmFFUXNUVUZCVFN4VlFVRlZMRWRCUVVjc1EwRkJReXhMUVVGVk8wbEJRelZDTEV0QlFVc3NRMEZCUXl4UlFVRlJMRWRCUVVjc1EwRkJReXhEUVVGTkxFVkJRVVVzUlVGQlJUdFJRVU14UWl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExGbEJRVmtzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTXZRaXhEUVVGRExFTkJRVU03U1VGRlJpeExRVUZMTEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJVeXhGUVVGRkxFVkJRVVU3VVVGRE1VSXNUMEZCVHl4RFFVRkRMRU5CUVVNc1VVRkJVU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhSUVVGUkxFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNhMEpCUVd0Q0xFTkJRVU1zUTBGQlF6dEpRVU16Uml4RFFVRkRMRU5CUVVNN1NVRkZSaXhMUVVGTExFTkJRVU1zVTBGQlV5eEhRVUZITEV0QlFVc3NRMEZCUXp0SlFVTjRRaXhMUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEVWQlFVVXNRMEZCUXp0SlFVTnVRaXhMUVVGTExFTkJRVU1zVTBGQlV5eEhRVUZITEVWQlFVVXNRMEZCUXp0SlFVVnlRaXcyUWtGQk5rSTdTVUZETjBJc1MwRkJTeXhEUVVGRExHZENRVUZuUWl4RFFVRkRMRk5CUVZNc1JVRkJSU3hWUVVGVkxFTkJRVU03VVVGRE0wTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUlVGQlJUdFpRVU4yUWl4TFFVRkxMRmxCUVZrc1EwRkJReXhEUVVGRE8yZENRVU5xUWl4TFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF6dG5Ra0ZEY0VNc1RVRkJUVHRoUVVOUU8xbEJRMFFzVDBGQlR5eERRVUZETEVOQlFVTTdaMEpCUTFBc1RVRkJUVHRoUVVOUU8xTkJRMFk3VVVGRlJDeFJRVUZSTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRk8xbEJRMjVDTEV0QlFVc3NZMEZCWXl4RFFVRkRMRU5CUVVNN1owSkJRMjVDTEV0QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTTdaMEpCUXk5Q0xFMUJRVTA3WVVGRFVEdFpRVU5FTEV0QlFVc3NXVUZCV1N4RFFVRkRMRU5CUVVNN1owSkJRMnBDTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRPMmRDUVVOc1F5eE5RVUZOTzJGQlExQTdXVUZEUkN4UFFVRlBMRU5CUVVNc1EwRkJRenRuUWtGRFVDeE5RVUZOTzJGQlExQTdVMEZEUmp0SlFVTklMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJSVWdzUzBGQlN5eERRVUZETEZkQlFWY3NRMEZCUXp0UlFVTm9RaXhKUVVGSkxFVkJRVVVzVFVGQlRUdFJRVU5hTEV0QlFVc3NSVUZCUlN4SlFVRkpPMHRCUTFvc1EwRkJReXhEUVVGRE8wbEJSVWdzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4RlFVRkZMRU5CUVVNN1NVRkRia0lzUzBGQlN5eERRVUZETEdGQlFXRXNSMEZCUnl4RlFVRkZMRU5CUVVNN1NVRkRla0lzUzBGQlN5eERRVUZETEdOQlFXTXNSMEZCUnl4UFFVRlBMRU5CUVVNN1NVRkZMMElzUzBGQlN5eERRVUZETEZWQlFWVXNSMEZCUnl4UFFVRlBMRU5CUVVNN1NVRkRNMElzUzBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNN1NVRkZjRUlzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4RlFVRkZMRU5CUVVNN1NVRkRia0lzUzBGQlN5eERRVUZETEdOQlFXTXNSMEZCUnl4UFFVRlBMRU5CUVVNN1NVRkZMMElzUzBGQlN5eERRVUZETEVkQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNN1NVRkZhRUlzV1VGQldTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMEZCUTNSQ0xFTkJRVU03UVVGRFJDeEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNaWZRPT0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=