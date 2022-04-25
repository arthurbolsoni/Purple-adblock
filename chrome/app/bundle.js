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
    await __webpack_require__.g.newPicture(__webpack_require__.g.actualChannel).then((textPicture) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24uY2hhbm5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFubmVsL29uLmNoYW5uZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLEtBQUssVUFBVSxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsdUJBQXVCO0lBQ3RFLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDO0lBQ2pDLE1BQU0sS0FBSyxHQUF5QixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMxRCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFFckIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDWixPQUFPLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3hDLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNyRCxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQy9FO2FBQU07WUFDTCxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ2pCO0tBQ0Y7SUFDRCxnREFBZ0Q7SUFFaEQsZ0RBQWdEO0lBQ2hELE9BQU8sQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMxQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBRXJDLElBQUksUUFBUTtRQUFFLE9BQU87SUFFckIsZ0RBQWdEO0lBRWhELGdEQUFnRDtJQUNoRCxNQUFNLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1FBQ2pFLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztJQUVILGdEQUFnRDtJQUVoRCxnREFBZ0Q7SUFFaEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRWhJLE9BQU87SUFFUCxJQUFJO1FBQ0YsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QyxNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFdkMsTUFBTSxVQUFVLEdBQWUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUNoRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hCLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO29CQUN0QixPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU87b0JBQ3pGLEdBQUcsRUFBRSx1QkFBdUIsR0FBRyxNQUFNLEdBQUcsNkJBQTZCLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPO2lCQUNuRyxDQUFDLENBQUM7YUFDSjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXJFLE9BQU8sQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUN6QztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNyQjtBQUNILENBQUMifQ==

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
        const response = await __webpack_require__.g.realFetch("https://jupter.ga/channel/" + channelName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwuZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBQ3hDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsUUFBUSxDQUFDLFdBQW1CO0lBQ2hELElBQUk7UUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDNUMsTUFBTSxRQUFRLEdBQWEsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLDRCQUE0QixHQUFHLFdBQVcsQ0FBQyxDQUFDO1FBRTlGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztTQUMzRDtRQUVELE1BQU0sSUFBSSxHQUFXLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRTNDLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUV2QyxPQUFPLElBQUksQ0FBQztLQUNiO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDIn0=

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
            if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !_window.whitelist.includes(_window.actualChannel)) {
                return new Promise(function (resolve, reject) {
                    var processFetch = async function (url) {
                        try {
                            await _window.realFetch(url, options).then(function (response) {
                                response.text().then(function (text) {
                                    _window.onFetch(_window, text, url).then(function (r) {
                                        var playlist = __webpack_require__.g.currentChannel().hls.getAllPlaylist();
                                        resolve(new Response(playlist));
                                    });
                                });
                            });
                        }
                        catch (e) {
                            resolve(new Response());
                        }
                    };
                    processFetch(url);
                });
            }
            if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guaW5mbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9mZXRjaC9mZXRjaC5pbmZsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sVUFBVSxZQUFZLENBQUMsT0FBTztJQUNsQyw0Q0FBNEM7SUFDNUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLE9BQU87UUFDMUMsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDM0IsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzNHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDMUMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ3BDLElBQUk7NEJBQ0YsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxRQUFRO2dDQUMzRCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtvQ0FDakMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7d0NBQ2xELElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUM7d0NBQzVELE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29DQUNsQyxDQUFDLENBQUMsQ0FBQztnQ0FDTCxDQUFDLENBQUMsQ0FBQzs0QkFDTCxDQUFDLENBQUMsQ0FBQzt5QkFDSjt3QkFBQyxPQUFPLENBQUMsRUFBRTs0QkFDVixPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQyxDQUFDO3lCQUN6QjtvQkFDSCxDQUFDLENBQUM7b0JBQ0YsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQixDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7Z0JBQzNGLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDMUMsSUFBSSxZQUFZLEdBQUcsS0FBSyxXQUFXLEdBQUc7d0JBQ3BDLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTs0QkFDM0QsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFO2dDQUNmLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUk7b0NBQ3ZDLE1BQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29DQUNqRCxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDOUIsQ0FBQyxDQUFDLENBQUM7NkJBQ0o7aUNBQU07Z0NBQ0wsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dDQUNsQixPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7NkJBQ3JDO3dCQUNILENBQUMsQ0FBQyxDQUFDO29CQUNMLENBQUMsQ0FBQztvQkFDRixZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFFRCxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsRUFBRTthQUN2QztTQUNGO1FBRUQsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbEQsQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBVTtJQUM1QixLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDM0YsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDeEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFFckIsNkJBQTZCO0lBQzdCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1FBQzNDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDdkIsS0FBSyxZQUFZLENBQUMsQ0FBQztnQkFDakIsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLE1BQU07YUFDUDtZQUNELE9BQU8sQ0FBQyxDQUFDO2dCQUNQLE1BQU07YUFDUDtTQUNGO1FBRUQsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNuQixLQUFLLGNBQWMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNoQixLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2lCQUNoQztnQkFDRCxNQUFNO2FBQ1A7WUFDRCxLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNqQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDbEMsTUFBTTthQUNQO1lBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ1AsTUFBTTthQUNQO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDaEIsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsSUFBSTtLQUNaLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9CLEtBQUssQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzNCLEtBQUssQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO0lBQzdCLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRXBCLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9CLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBRWhCLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QixDQUFDO0FBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDIn0=
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7Ozs7Ozs7QUNOcUQ7QUFDekI7QUFDbUI7QUFDVDtBQUNjO0FBQ0o7QUFDRTtBQUMzQztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSwyQkFBMkIsNkRBQU87QUFDbEMsdUJBQXVCLHlEQUFPO0FBQzlCLHdCQUF3QiwyREFBUTtBQUNoQztBQUNBLG9CQUFvQiwrQ0FBRTtBQUN0QiwyQkFBMkIsd0RBQU87QUFDbEMsZ0JBQWdCLHFDQUFHO0FBQ25CLElBQUksa0VBQVk7QUFDaEI7QUFDQTtBQUNBLDJDQUEyQywyZ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvSExTLnRzIiwid2VicGFjazovLy8uL3NyYy9jaGFubmVsL2N1cnJlbnQuY2hhbm5lbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9vbi5jaGFubmVsLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9leHRlcm5hbC5mZXRjaC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvZmV0Y2guaW5mbGF0ZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvb24uZmV0Y2gudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL3BpY3R1cmUuZmV0Y2gudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgSExTIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2hlYWRlciA9IFtcIiNFWFRNM1VcIiwgXCIjRVhULVgtVkVSU0lPTjozXCIsIFwiI0VYVC1YLVRBUkdFVERVUkFUSU9OOjZcIiwgXCIjRVhULVgtTUVESUEtU0VRVUVOQ0U6XCJdO1xyXG4gICAgICAgIHRoaXMuX3BsYXlsaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSAwO1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QgPSBbXTtcclxuICAgIH1cclxuICAgIC8vYWRkIG0zdTggbGlua3Mgd2l0aCBxdWFsaXR5IHRvIHRoZSBsaXN0IG9mIHNlcnZlcnNcclxuICAgIGFzeW5jIGFkZFN0cmVhbUxpbmsodGV4dCwgdHlwZSA9IFwibG9jYWxcIiwgc2lnID0gZmFsc2UpIHtcclxuICAgICAgICBjb25zdCBxdWFsaXR5VXJsU3BsaXQgPSBbXTtcclxuICAgICAgICBsZXQgY2FwdHVyZUFycmF5O1xyXG4gICAgICAgIGNvbnN0IFJFR0VYID0gL05BTUU9XCIoKD86XFxTK1xccytcXFMrfFxcUyspKVwiLEFVVE8oPzpefFxcUytcXHMrKSg/Ol58XFxTK1xccyspKGh0dHBzOlxcL1xcL3ZpZGVvKFxcUyspLm0zdTgpL2c7XHJcbiAgICAgICAgd2hpbGUgKChjYXB0dXJlQXJyYXkgPSBSRUdFWC5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBxdWFsaXR5VXJsU3BsaXQucHVzaCh7IHF1YWxpdHk6IGNhcHR1cmVBcnJheVsxXSwgdXJsOiBjYXB0dXJlQXJyYXlbMl0gfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUubG9nKHF1YWxpdHlVcmxTcGxpdCk7XHJcbiAgICAgICAgY29uc3Qgc3RyZWFtTGlzdCA9IHsgc2VydmVyOiB0eXBlLCB1cmxMaXN0OiBxdWFsaXR5VXJsU3BsaXQsIHNpZzogc2lnIH07XHJcbiAgICAgICAgdGhpcy5fc3RyZWFtU2VydmVyTGlzdC5wdXNoKHN0cmVhbUxpc3QpO1xyXG4gICAgICAgIGlmICghc2lnKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2lnbmF0dXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgc2lnbmF0dXJlKCkge1xyXG4gICAgICAgIGNvbnN0IFJFR0VYID0gL3ZpZGVvLXdlYXZlci4oLiopLmhscy50dHZudy5uZXRcXC92MVxcL3BsYXlsaXN0XFwvKC4qKS5tM3U4JC9nbTtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gdGhpcy5fc3RyZWFtU2VydmVyTGlzdFxyXG4gICAgICAgICAgICAuZmlsdGVyKCh4KSA9PiB4LnNpZyA9PSBmYWxzZSlcclxuICAgICAgICAgICAgLmZvckVhY2goYXN5bmMgKHgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBSRUdFWC5leGVjKHgudXJsTGlzdFswXS51cmwpO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYSA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9qdXB0ZXIuZ2EvaGxzL3YyL3NpZy9cIiArIG1hdGNoWzJdICsgXCIvXCIgKyBtYXRjaFsxXSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5zaWcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIGdldCBTdHJlYW1TZXJ2ZXJMaXN0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0O1xyXG4gICAgfVxyXG4gICAgYWRkUGxheWxpc3QocGxheWxpc3QpIHtcclxuICAgICAgICBpZiAocGxheWxpc3QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gcGxheWxpc3QudG9TdHJpbmcoKS5zcGxpdCgvW1xcclxcbl0vKTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJbNF0gPSBsaW5lc1s0XTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJbNV0gPSBsaW5lc1s1XTtcclxuICAgICAgICAvL3Rha2UgYWxsIG0zdTkgY29udGVudCB0byB0aGUgcGxheWxpc3QgYW5kIGJ1aWxkIGEgbmV3IGZsb3dcclxuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gbGluZXMpIHtcclxuICAgICAgICAgICAgaWYgKGxpbmVzW2ldLmluY2x1ZGVzKFwiI0VYVC1YLVBST0dSQU0tREFURS1USU1FOlwiKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VxdWVuY2VUaW1lc3RhbXAgPSBNYXRoLmZsb29yKG5ldyBEYXRlKGxpbmVzW2ldLnNsaWNlKGxpbmVzW2ldLmxlbmd0aCAtIDI0LCBsaW5lc1tpXS5sZW5ndGgpKS5nZXRUaW1lKCkgLyAxMDAwKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLl9wbGF5bGlzdC5maWx0ZXIoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC50aW1lc3RhbXAgPj0gc2VxdWVuY2VUaW1lc3RhbXA7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICghci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXF1ZW5jZSA9IHRoaXMuX3NlcXVlbmNlICsgMTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZTogbGluZXNbcGFyc2VJbnQoaSldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHNlcXVlbmNlVGltZXN0YW1wLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiBsaW5lc1twYXJzZUludChpKSArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGxpbmVzW3BhcnNlSW50KGkpICsgMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuX3BsYXlsaXN0Lmxlbmd0aCA+IDE1KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5zaGlmdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkO1xyXG4gICAgfVxyXG4gICAgZ2V0QWxsUGxheWxpc3QoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9oZWFkZXJbMF0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzFdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclsyXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbM10gK1xyXG4gICAgICAgICAgICB0aGlzLl9zZXF1ZW5jZSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbNF0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzVdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX3BsYXlsaXN0Lm1hcCgoeCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHgudGltZSArIFwiXFxuXCIgKyB4LmluZm8gKyBcIlxcblwiICsgeC51cmwgKyBcIlxcblwiO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU0V4VExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpTGk0dmMzSmpMMGhNVXk1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hOUVVGTkxFOUJRVThzUjBGQlJ6dEpRVUZvUWp0UlFVTlZMRmxCUVU4c1IwRkJhMElzUTBGQlF5eFRRVUZUTEVWQlFVVXNhMEpCUVd0Q0xFVkJRVVVzZVVKQlFYbENMRVZCUVVVc2QwSkJRWGRDTEVOQlFVTXNRMEZCUXp0UlFVTTVSeXhqUVVGVExFZEJRVzFDTEVWQlFVVXNRMEZCUXp0UlFVTXZRaXhqUVVGVExFZEJRVWNzUTBGQlF5eERRVUZETzFGQlEyUXNjMEpCUVdsQ0xFZEJRVzFDTEVWQlFVVXNRMEZCUXp0SlFUWkhha1FzUTBGQlF6dEpRVE5IUXl4dlJFRkJiMFE3U1VGRGNFUXNTMEZCU3l4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGWkxFVkJRVVVzU1VGQlNTeEhRVUZITEU5QlFVOHNSVUZCUlN4SFFVRkhMRWRCUVVjc1MwRkJTenRSUVVNelJDeE5RVUZOTEdWQlFXVXNSMEZCYVVJc1JVRkJSU3hEUVVGRE8xRkJRM3BETEVsQlFVa3NXVUZCYjBNc1EwRkJRenRSUVVWNlF5eE5RVUZOTEV0QlFVc3NSMEZCUnl4eFJrRkJjVVlzUTBGQlF6dFJRVVZ3Unl4UFFVRlBMRU5CUVVNc1dVRkJXU3hIUVVGSExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1MwRkJTeXhKUVVGSkxFVkJRVVU3V1VGRGFrUXNaVUZCWlN4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFOUJRVThzUlVGQlJTeFpRVUZaTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1IwRkJSeXhGUVVGRkxGbEJRVmtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN1UwRkRNVVU3VVVGRFJDeFBRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMR1ZCUVdVc1EwRkJReXhEUVVGRE8xRkJRemRDTEUxQlFVMHNWVUZCVlN4SFFVRkhMRVZCUVVVc1RVRkJUU3hGUVVGRkxFbEJRVWtzUlVGQlJTeFBRVUZQTEVWQlFVVXNaVUZCWlN4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFVkJRVVVzUTBGQlF6dFJRVU40UlN4SlFVRkpMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8xRkJSWGhETEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVN1dVRkRVaXhOUVVGTkxFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVXNRMEZCUXp0VFFVTjRRanRSUVVORUxFOUJRVThzU1VGQlNTeERRVUZETzBsQlEyUXNRMEZCUXp0SlFVVkVMRXRCUVVzc1EwRkJReXhUUVVGVE8xRkJRMklzVFVGQlRTeExRVUZMTEVkQlFVY3NOa1JCUVRaRUxFTkJRVU03VVVGRk5VVXNUVUZCVFN4SlFVRkpMRTlCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeEZRVUZGTEVOQlF6VkNMRWxCUVVrc1EwRkJReXhwUWtGQmFVSTdZVUZEYmtJc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlRTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhKUVVGSkxFdEJRVXNzUTBGQlF6dGhRVU5zUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVTBzUlVGQlJTeEZRVUZGTzFsQlEzaENMRTFCUVUwc1MwRkJTeXhIUVVFeVFpeExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1dVRkRia1VzU1VGQlNTeExRVUZMTEVWQlFVVTdaMEpCUTFRc1NVRkJTVHR2UWtGRFJpeE5RVUZOTEVOQlFVTXNSMEZCUnl4TlFVRk5MRXRCUVVzc1EwRkJReXdyUWtGQkswSXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUjBGQlJ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSVHQzUWtGRGFrWXNUVUZCVFN4RlFVRkZMRXRCUVVzN2NVSkJRMlFzUTBGQlF5eERRVUZETzI5Q1FVTklMRU5CUVVNc1EwRkJReXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETzI5Q1FVTmlMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dHBRa0ZEWmp0blFrRkJReXhOUVVGTk8yOUNRVU5PTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRwUWtGRGFFSTdZVUZEUmp0cFFrRkJUVHRuUWtGRFRDeFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1lVRkRhRUk3VVVGRFNDeERRVUZETEVOQlFVTXNRMEZEVEN4RFFVRkRPMGxCUTBvc1EwRkJRenRKUVVWRUxFbEJRVWtzWjBKQlFXZENPMUZCUTJ4Q0xFOUJRVThzU1VGQlNTeERRVUZETEdsQ1FVRnBRaXhEUVVGRE8wbEJRMmhETEVOQlFVTTdTVUZGUkN4WFFVRlhMRU5CUVVNc1VVRkJaMEk3VVVGRE1VSXNTVUZCU1N4UlFVRlJMRXRCUVVzc1NVRkJTU3hGUVVGRk8xbEJRM0pDTEU5QlFVOHNTMEZCU3l4RFFVRkRPMU5CUTJRN1VVRkZSQ3hKUVVGSkxFOUJRVThzUjBGQlJ5eExRVUZMTEVOQlFVTTdVVUZGY0VJc1RVRkJUU3hMUVVGTExFZEJRVWNzVVVGQlVTeERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dFJRVU5zUkN4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVNelFpeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVVXpRaXcwUkVGQk5FUTdVVUZETlVRc1MwRkJTeXhOUVVGTkxFTkJRVU1zU1VGQlNTeExRVUZMTEVWQlFVVTdXVUZEY2tJc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMREpDUVVFeVFpeERRVUZETEVWQlFVVTdaMEpCUTJ4RUxFMUJRVTBzYVVKQlFXbENMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFZEJRVWNzUlVGQlJTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNSVUZCUlN4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRE8yZENRVVYyU0N4TlFVRk5MRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRk8yOUNRVU53UXl4UFFVRlBMRU5CUVVNc1EwRkJReXhUUVVGVExFbEJRVWtzYVVKQlFXbENMRU5CUVVNN1owSkJRekZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMmRDUVVWSUxFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkZPMjlDUVVOaUxFbEJRVWtzUTBGQlF5eFRRVUZUTEVkQlFVY3NTVUZCU1N4RFFVRkRMRk5CUVZNc1IwRkJSeXhEUVVGRExFTkJRVU03YjBKQlEzQkRMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETzNkQ1FVTnNRaXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenQzUWtGRGVFSXNVMEZCVXl4RlFVRkZMR2xDUVVGcFFqdDNRa0ZETlVJc1NVRkJTU3hGUVVGRkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8zZENRVU0xUWl4SFFVRkhMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN2NVSkJRelZDTEVOQlFVTXNRMEZCUXp0dlFrRkRTQ3hQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETzJsQ1FVTm9RanRoUVVOR08xbEJRMFFzVDBGQlR5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTFCUVUwc1IwRkJSeXhGUVVGRkxFVkJRVVU3WjBKQlEycERMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdZVUZEZUVJN1UwRkRSanRSUVVORUxFOUJRVThzVDBGQlR5eERRVUZETzBsQlEycENMRU5CUVVNN1NVRkZSQ3hqUVVGak8xRkJRMW9zVDBGQlR5eERRVU5NTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMllzU1VGQlNUdFpRVU5LTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMllzU1VGQlNUdFpRVU5LTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMllzU1VGQlNUdFpRVU5LTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8xbEJRMllzU1VGQlNTeERRVUZETEZOQlFWTTdXVUZEWkN4SlFVRkpPMWxCUTBvc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEWml4SlFVRkpPMWxCUTBvc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTTdXVUZEWml4SlFVRkpPMWxCUTBvc1NVRkJTU3hEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSVHRuUWtGRGRrSXNUMEZCVHl4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGSExFbEJRVWtzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eEhRVUZITEVsQlFVa3NRMEZCUXp0WlFVTjBSQ3hEUVVGRExFTkJRVU1zUTBGRFNDeERRVUZETzBsQlEwb3NRMEZCUXp0RFFVTkdJbjA9IiwiZXhwb3J0IGZ1bmN0aW9uIGN1cnJlbnQoY2hhbm5lbCA9IG51bGwpIHtcclxuICAgIGlmIChjaGFubmVsKSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gY2hhbm5lbCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZ2xvYmFsLmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBnbG9iYWwuYWN0dWFsQ2hhbm5lbCk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWTNWeWNtVnVkQzVqYUdGdWJtVnNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZMaTR2YzNKakwyTm9ZVzV1Wld3dlkzVnljbVZ1ZEM1amFHRnVibVZzTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1ZVRkJWU3hQUVVGUExFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVazdTVUZEY0VNc1NVRkJTU3hQUVVGUExFVkJRVVU3VVVGRFdDeFBRVUZQTEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hMUVVGTExFOUJRVThzUTBGQlF5eERRVUZETzB0QlEzWkVPMU5CUVUwN1VVRkRUQ3hQUVVGUExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRTFCUVUwc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF6dExRVU53UlR0QlFVTklMRU5CUVVNaWZRPT0iLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gb25TdGFydChfd2luZG93LCB1cmwsIHRleHQgLyogaXNPZmZsaW5lID0gZmFsc2UgKi8pIHtcclxuICAgIGNvbnN0IHJlZ2V4ID0gL2hsc1xcLyguKikubTN1OC9nbTtcclxuICAgIGNvbnN0IG1hdGNoID0gcmVnZXguZXhlYyh1cmwpIHx8IFtdO1xyXG4gICAgbGV0IGV4aXN0ZW50ID0gZmFsc2U7XHJcbiAgICBpZiAobWF0Y2hbMV0pIHtcclxuICAgICAgICBfd2luZG93LmFjdHVhbENoYW5uZWwgPSBtYXRjaFsxXTtcclxuICAgICAgICBpZiAoX3dpbmRvdy53aGl0ZWxpc3QuaW5jbHVkZXMobWF0Y2hbMV0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFfd2luZG93LmNoYW5uZWwuZmluZCgoYykgPT4gYy5uYW1lID09PSBtYXRjaFsxXSkpIHtcclxuICAgICAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkNoYW5uZWw6IFwiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICBfd2luZG93LmNoYW5uZWwucHVzaCh7IG5hbWU6IG1hdGNoWzFdLCBmbG93U2lnOiBbXSwgaGxzOiBuZXcgX3dpbmRvdy5ITFMoKSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJFeGlzdDogXCIgKyBtYXRjaFsxXSk7XHJcbiAgICAgICAgICAgIGV4aXN0ZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgX3dpbmRvdy5Mb2dQcmludChcIkxvY2FsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgIGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dCk7XHJcbiAgICBfd2luZG93LkxvZ1ByaW50KFwiTG9jYWwgU2VydmVyOiBPS1wiKTtcclxuICAgIGlmIChleGlzdGVudClcclxuICAgICAgICByZXR1cm47XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgYXdhaXQgZ2xvYmFsLm5ld1BpY3R1cmUoZ2xvYmFsLmFjdHVhbENoYW5uZWwpLnRoZW4oKHRleHRQaWN0dXJlKSA9PiB7XHJcbiAgICAgICAgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKG1hdGNoWzFdKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0UGljdHVyZSwgXCJwaWN0dXJlXCIsIHRydWUpO1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkxvY2FsIFNlcnZlciA0ODBwOiBPS1wiKTtcclxuICAgIH0pO1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIGdsb2JhbC5uZXdFeHRlcm5hbChnbG9iYWwuYWN0dWFsQ2hhbm5lbCkudGhlbigodGV4dCkgPT4gZ2xvYmFsLmN1cnJlbnRDaGFubmVsKG1hdGNoWzFdKS5obHMuYWRkU3RyZWFtTGluayh0ZXh0LCBcInByb3h5XCIsIHRydWUpKTtcclxuICAgIHJldHVybjtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eVVybFNwbGl0ID0gdGV4dC5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgY29uc3Qgc2VydmVyID0gcXVhbGl0eVVybFNwbGl0LnNoaWZ0KCk7XHJcbiAgICAgICAgY29uc3Qgc3RyZWFtTGlzdCA9IHsgc2VydmVyOiBcInByb3h5XCIsIHVybExpc3Q6IFtdIH07XHJcbiAgICAgICAgcXVhbGl0eVVybFNwbGl0LmZvckVhY2goKGVsZW1lbnQsIGluZGV4LCBhcnJheSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIShpbmRleCAlIDIpKSB7XHJcbiAgICAgICAgICAgICAgICBzdHJlYW1MaXN0LnVybExpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVhbGl0eTogc3RyZWFtTGlzdC51cmxMaXN0LnNvbWUoKHgpID0+IHgucXVhbGl0eSA9PSBlbGVtZW50KSA/IGVsZW1lbnQgKyBcInAzMFwiIDogZWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly92aWRlby13ZWF2ZXIuXCIgKyBzZXJ2ZXIgKyBcIi5obHMudHR2bncubmV0L3YxL3BsYXlsaXN0L1wiICsgYXJyYXlbaW5kZXggKyAxXSArIFwiLm0zdThcIixcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChzdHJlYW1MaXN0KTtcclxuICAgICAgICBfd2luZG93LmNoYW5uZWwuZmluZCgoeCkgPT4geC5uYW1lID09PSBtYXRjaFsxXSkuaGxzLmFkZChzdHJlYW1MaXN0KTtcclxuICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChlKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liMjR1WTJoaGJtNWxiQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OWphR0Z1Ym1Wc0wyOXVMbU5vWVc1dVpXd3VkSE1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1RVRkJUU3hEUVVGRExFdEJRVXNzVlVGQlZTeFBRVUZQTEVOQlFVTXNUMEZCVHl4RlFVRkZMRWRCUVVjc1JVRkJSU3hKUVVGSkxFTkJRVU1zZFVKQlFYVkNPMGxCUTNSRkxFMUJRVTBzUzBGQlN5eEhRVUZITEd0Q1FVRnJRaXhEUVVGRE8wbEJRMnBETEUxQlFVMHNTMEZCU3l4SFFVRjVRaXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRKUVVNeFJDeEpRVUZKTEZGQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNN1NVRkZja0lzU1VGQlNTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVN1VVRkRXaXhQUVVGUExFTkJRVU1zWVVGQllTeEhRVUZITEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVOcVF5eEpRVUZKTEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZPMWxCUTNoRExFOUJRVTg3VTBGRFVqdFJRVVZFTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUzBGQlN5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSVHRaUVVOeVJDeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRmRCUVZjc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjZReXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hIUVVGSExFVkJRVVVzU1VGQlNTeFBRVUZQTEVOQlFVTXNSMEZCUnl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRE8xTkJReTlGTzJGQlFVMDdXVUZEVEN4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOMlF5eFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRPMU5CUTJwQ08wdEJRMFk3U1VGRFJDeG5SRUZCWjBRN1NVRkZhRVFzWjBSQlFXZEVPMGxCUTJoRUxFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNkVUpCUVhWQ0xFTkJRVU1zUTBGQlF6dEpRVU14UXl4TlFVRk5MRU5CUVVNc1kwRkJZeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdTVUZEZUVRc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eHJRa0ZCYTBJc1EwRkJReXhEUVVGRE8wbEJSWEpETEVsQlFVa3NVVUZCVVR0UlFVRkZMRTlCUVU4N1NVRkZja0lzWjBSQlFXZEVPMGxCUldoRUxHZEVRVUZuUkR0SlFVTm9SQ3hOUVVGTkxFMUJRVTBzUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEZkQlFWY3NSVUZCUlN4RlFVRkZPMUZCUTJwRkxFMUJRVTBzUTBGQlF5eGpRVUZqTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEdGQlFXRXNRMEZCUXl4WFFVRlhMRVZCUVVVc1UwRkJVeXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEyaEdMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zZFVKQlFYVkNMRU5CUVVNc1EwRkJRenRKUVVNelF5eERRVUZETEVOQlFVTXNRMEZCUXp0SlFVVklMR2RFUVVGblJEdEpRVVZvUkN4blJFRkJaMFE3U1VGRmFFUXNUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJReXhOUVVGTkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNZMEZCWXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hGUVVGRkxFOUJRVThzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUldoSkxFOUJRVTg3U1VGRlVDeEpRVUZKTzFGQlEwWXNUVUZCVFN4bFFVRmxMRWRCUVVjc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTjRReXhOUVVGTkxFMUJRVTBzUjBGQlJ5eGxRVUZsTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN1VVRkZka01zVFVGQlRTeFZRVUZWTEVkQlFXVXNSVUZCUlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhGUVVGRkxFOUJRVThzUlVGQlJTeEZRVUZGTEVWQlFVVXNRMEZCUXp0UlFVTm9SU3hsUVVGbExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFVkJRVVVzUlVGQlJUdFpRVU5vUkN4SlFVRkpMRU5CUVVNc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEVWQlFVVTdaMEpCUTJoQ0xGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRPMjlDUVVOMFFpeFBRVUZQTEVWQlFVVXNWVUZCVlN4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFbEJRVWtzVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVODdiMEpCUTNwR0xFZEJRVWNzUlVGQlJTeDFRa0ZCZFVJc1IwRkJSeXhOUVVGTkxFZEJRVWNzTmtKQlFUWkNMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNSMEZCUnl4UFFVRlBPMmxDUVVOdVJ5eERRVUZETEVOQlFVTTdZVUZEU2p0UlFVTklMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJSVWdzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRSUVVNM1FpeFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzFGQlJYSkZMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1EwRkJRenRMUVVONlF6dEpRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPMUZCUTFZc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0TFFVTnlRanRCUVVOSUxFTkJRVU1pZlE9PSIsIi8vZXh0ZXJuYWwgcmVxdWVzdCB0aHJvdWhnIHB1cnBsZSBzZXJ2ZXJcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4dGVybmFsKGNoYW5uZWxOYW1lKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogTG9hZGluZ1wiKTtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2goXCJodHRwczovL2p1cHRlci5nYS9jaGFubmVsL1wiICsgY2hhbm5lbE5hbWUpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2VydmVyIHByb3h5IHJldHVybiBlcnJvciBvciBub3QgZm91bmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KGUpO1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpYaDBaWEp1WVd3dVptVjBZMmd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZabVYwWTJndlpYaDBaWEp1WVd3dVptVjBZMmd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNkME5CUVhkRE8wRkJRM2hETEUxQlFVMHNRMEZCUXl4TFFVRkxMRlZCUVZVc1VVRkJVU3hEUVVGRExGZEJRVzFDTzBsQlEyaEVMRWxCUVVrN1VVRkRSaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETERCQ1FVRXdRaXhEUVVGRExFTkJRVU03VVVGRE5VTXNUVUZCVFN4UlFVRlJMRWRCUVdFc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETERSQ1FVRTBRaXhIUVVGSExGZEJRVmNzUTBGQlF5eERRVUZETzFGQlJUbEdMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTzFsQlEyaENMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zZDBOQlFYZERMRU5CUVVNc1EwRkJRenRUUVVNelJEdFJRVVZFTEUxQlFVMHNTVUZCU1N4SFFVRlhMRTFCUVUwc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlJUTkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zY1VKQlFYRkNMRU5CUVVNc1EwRkJRenRSUVVWMlF5eFBRVUZQTEVsQlFVa3NRMEZCUXp0TFFVTmlPMGxCUVVNc1QwRkJUeXhEUVVGRExFVkJRVVU3VVVGRFZpeE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8xRkJRMjVDTEU5QlFVOHNSVUZCUlN4RFFVRkRPMHRCUTFnN1FVRkRTQ3hEUVVGREluMD0iLCJleHBvcnQgZnVuY3Rpb24gaW5mbGF0ZUZldGNoKF93aW5kb3cpIHtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1nbG9iYWwtYXNzaWduXHJcbiAgICBfd2luZG93LmZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdXJsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGlmICh1cmwuZW5kc1dpdGgoXCJtM3U4XCIpICYmIHVybC5pbmNsdWRlcyhcInR0dm53Lm5ldFwiKSAmJiAhX3dpbmRvdy53aGl0ZWxpc3QuaW5jbHVkZXMoX3dpbmRvdy5hY3R1YWxDaGFubmVsKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc0ZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgX3dpbmRvdy5yZWFsRmV0Y2godXJsLCBvcHRpb25zKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF93aW5kb3cub25GZXRjaChfd2luZG93LCB0ZXh0LCB1cmwpLnRoZW4oZnVuY3Rpb24gKHIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5bGlzdCA9IGdsb2JhbC5jdXJyZW50Q2hhbm5lbCgpLmhscy5nZXRBbGxQbGF5bGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UocGxheWxpc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NGZXRjaCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcyhcInVzaGVyLnR0dm53Lm5ldC9hcGkvY2hhbm5lbC9obHMvXCIpICYmICF1cmwuaW5jbHVkZXMoXCJwaWN0dXJlLWJ5LXBpY3R1cmVcIikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb2Nlc3NGZXRjaCA9IGFzeW5jIGZ1bmN0aW9uICh1cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgX3dpbmRvdy5yZWFsRmV0Y2godXJsLCBvcHRpb25zKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UudGV4dCgpLnRoZW4oYXN5bmMgZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgX3dpbmRvdy5vblN0YXJ0Q2hhbm5lbChfd2luZG93LCB1cmwsIHRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSh0ZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiY2hhbm5lbCBvZmZsaW5lXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NGZXRjaCh1cmwpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcyhcInBpY3R1cmUtYnktcGljdHVyZVwiKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfd2luZG93LnJlYWxGZXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2labVYwWTJndWFXNW1iR0YwWlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTltWlhSamFDOW1aWFJqYUM1cGJtWnNZWFJsTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1ZVRkJWU3haUVVGWkxFTkJRVU1zVDBGQlR6dEpRVU5zUXl3MFEwRkJORU03U1VGRE5VTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1IwRkJSeXhMUVVGTExGZEJRVmNzUjBGQlJ5eEZRVUZGTEU5QlFVODdVVUZETVVNc1NVRkJTU3hQUVVGUExFZEJRVWNzUzBGQlN5eFJRVUZSTEVWQlFVVTdXVUZETTBJc1NVRkJTU3hIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRWRCUVVjc1EwRkJReXhSUVVGUkxFTkJRVU1zVjBGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExGRkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNZVUZCWVN4RFFVRkRMRVZCUVVVN1owSkJRek5ITEU5QlFVOHNTVUZCU1N4UFFVRlBMRU5CUVVNc1ZVRkJWU3hQUVVGUExFVkJRVVVzVFVGQlRUdHZRa0ZETVVNc1NVRkJTU3haUVVGWkxFZEJRVWNzUzBGQlN5eFhRVUZYTEVkQlFVYzdkMEpCUTNCRExFbEJRVWs3TkVKQlEwWXNUVUZCVFN4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hSUVVGUk8yZERRVU16UkN4UlFVRlJMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNTVUZCU1R0dlEwRkRha01zVDBGQlR5eERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRVZCUVVVc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNN2QwTkJRMnhFTEVsQlFVa3NVVUZCVVN4SFFVRkhMRTFCUVUwc1EwRkJReXhqUVVGakxFVkJRVVVzUTBGQlF5eEhRVUZITEVOQlFVTXNZMEZCWXl4RlFVRkZMRU5CUVVNN2QwTkJRelZFTEU5QlFVOHNRMEZCUXl4SlFVRkpMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETzI5RFFVTnNReXhEUVVGRExFTkJRVU1zUTBGQlF6dG5RMEZEVEN4RFFVRkRMRU5CUVVNc1EwRkJRenMwUWtGRFRDeERRVUZETEVOQlFVTXNRMEZCUXp0NVFrRkRTanQzUWtGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlRzMFFrRkRWaXhQUVVGUExFTkJRVU1zU1VGQlNTeFJRVUZSTEVWQlFVVXNRMEZCUXl4RFFVRkRPM2xDUVVONlFqdHZRa0ZEU0N4RFFVRkRMRU5CUVVNN2IwSkJRMFlzV1VGQldTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMmRDUVVOd1FpeERRVUZETEVOQlFVTXNRMEZCUXp0aFFVTktPMWxCUlVRc1NVRkJTU3hIUVVGSExFTkJRVU1zVVVGQlVTeERRVUZETEd0RFFVRnJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRzlDUVVGdlFpeERRVUZETEVWQlFVVTdaMEpCUXpOR0xFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNWVUZCVlN4UFFVRlBMRVZCUVVVc1RVRkJUVHR2UWtGRE1VTXNTVUZCU1N4WlFVRlpMRWRCUVVjc1MwRkJTeXhYUVVGWExFZEJRVWM3ZDBKQlEzQkRMRTFCUVUwc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzVVVGQlVUczBRa0ZETTBRc1NVRkJTU3hSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTzJkRFFVTm1MRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4WFFVRlhMRWxCUVVrN2IwTkJRM1pETEUxQlFVMHNUMEZCVHl4RFFVRkRMR05CUVdNc1EwRkJReXhQUVVGUExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMjlEUVVOcVJDeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dG5RMEZET1VJc1EwRkJReXhEUVVGRExFTkJRVU03TmtKQlEwbzdhVU5CUVUwN1owTkJRMHdzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMmREUVVOc1FpeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVOQlFVTTdOa0pCUTNKRE8zZENRVU5JTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlDUVVOTUxFTkJRVU1zUTBGQlF6dHZRa0ZEUml4WlFVRlpMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WjBKQlEzQkNMRU5CUVVNc1EwRkJReXhEUVVGRE8yRkJRMG83V1VGRlJDeEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc2IwSkJRVzlDTEVOQlFVTXNSVUZCUlR0aFFVTjJRenRUUVVOR08xRkJSVVFzVDBGQlR5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzVTBGQlV5eERRVUZETEVOQlFVTTdTVUZEYkVRc1EwRkJReXhEUVVGRE8wRkJRMG9zUTBGQlF5SjkiLCJleHBvcnQgYXN5bmMgZnVuY3Rpb24gb24oX3dpbmRvdywgcmVzcG9uc2UsIHVybCkge1xyXG4gICAgLy8gIGlmIChNYXRoLnJhbmRvbSgpIDwgMC41ICl7XHJcbiAgICAvLyAgICAgIHJlc3BvbnNlICs9IFwidHdpdGNoLWNsaWVudC1hZFwiO1xyXG4gICAgLy8gIH1cclxuICAgIGNvbnN0IGNoYW5uZWxDdXJyZW50ID0gYXdhaXQgZ2xvYmFsLmN1cnJlbnRDaGFubmVsKCk7XHJcbiAgICAvL2lmIGFkcyBmaW5kIG9uIG1haW4gbGluayBjYWxsZWQgZnJvbSB0d2l0Y2ggYXBpIHBsYXllclxyXG4gICAgaWYgKGdsb2JhbC5pc0FkcyhyZXNwb25zZSkpIHtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJhZHMgZm91bmRcIik7XHJcbiAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgdHlwZTogXCJnZXRRdWFsaXR5XCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZSh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwicmVsb2FkXCIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHF1YWxpdHkgPSBnbG9iYWwucXVhbGl0eTtcclxuICAgICAgICBjb25zdCBTdHJlYW1TZXJ2ZXJMaXN0ID0gY2hhbm5lbEN1cnJlbnQuaGxzLlN0cmVhbVNlcnZlckxpc3Q7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KHF1YWxpdHkpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vdHJ5IGFsbCBobHMgc2lncyB0aGF0IGhhdmUgb24gU3RyZWFtU2VydmVyTGlzdCBmcm9tIEhMU1xyXG4gICAgICAgICAgICBpZiAoU3RyZWFtU2VydmVyTGlzdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm94eSA9IFN0cmVhbVNlcnZlckxpc3QuZmluZCgoeCkgPT4geC5zZXJ2ZXIgPT0gXCJwcm94eVwiKTtcclxuICAgICAgICAgICAgICAgIGlmICghcHJveHkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gcHJveHkudXJsTGlzdC5maW5kKChhKSA9PiBhLnF1YWxpdHkgPT0gcXVhbGl0eSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG0zdTggdmFsaWQgdXJsIGZvdW5kIG9uIFN0cmVhbVNlcnZlckxpc3RcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXR1cm5vMiA9IGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2godXJsLnVybCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmV0dXJub1RleHQgPSBhd2FpdCByZXR1cm5vMi50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLmlzQWRzKHJldHVybm9UZXh0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbC5Mb2dQcmludChcImFkcyBvbiBwcm94eVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXR1cm5vVGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9nZXJhIGVycm8gc2UgbmFvIHRpdmVyIGxpbmtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgLy9pZiBub3RoaW5nIHJlc29sdmUsIHJldHVybiA0ODBwIGZsb3dcclxuICAgICAgICAgICAgY29uc3QgcGljdHVyZVN0cmVhbSA9IFN0cmVhbVNlcnZlckxpc3QuZmlsdGVyKCh4KSA9PiB4LnNlcnZlciA9PSBcInBpY3R1cmVcIikubWFwKCh4KSA9PiB4LnVybExpc3QuZmluZCgoeCkgPT4geC5xdWFsaXR5LmluY2x1ZGVzKFwiNDgwXCIpKSlbMF0udXJsO1xyXG4gICAgICAgICAgICBjb25zdCByZXR1cm5vID0gYXdhaXQgKGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2gocGljdHVyZVN0cmVhbSkpLnRleHQoKTtcclxuICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiNDgwUFwiKTtcclxuICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KGUpO1xyXG4gICAgICAgICAgICBjaGFubmVsQ3VycmVudC5obHMuYWRkUGxheWxpc3QocmV0dXJubyk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXNwb25zZSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYjI0dVptVjBZMmd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZabVYwWTJndmIyNHVabVYwWTJndWRITWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzVFVGQlRTeERRVUZETEV0QlFVc3NWVUZCVlN4RlFVRkZMRU5CUVVNc1QwRkJUeXhGUVVGRkxGRkJRVkVzUlVGQlJTeEhRVUZITzBsQlF6ZERMRGhDUVVFNFFqdEpRVU01UWl4MVEwRkJkVU03U1VGRGRrTXNTMEZCU3p0SlFVVk1MRTFCUVUwc1kwRkJZeXhIUVVGSExFMUJRVTBzVFVGQlRTeERRVUZETEdOQlFXTXNSVUZCUlN4RFFVRkRPMGxCUlhKRUxIZEVRVUYzUkR0SlFVTjRSQ3hKUVVGSkxFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVN1VVRkRNVUlzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRSUVVVM1FpeE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRPMWxCUTJwQ0xFbEJRVWtzUlVGQlJTeFpRVUZaTzFsQlEyeENMRXRCUVVzc1JVRkJSU3hKUVVGSk8xTkJRMW9zUTBGQlF5eERRVUZETzFGQlJVZ3NUVUZCVFN4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVOcVFpeEpRVUZKTEVWQlFVVXNVVUZCVVR0WlFVTmtMRXRCUVVzc1JVRkJSU3hKUVVGSk8xTkJRMW9zUTBGQlF5eERRVUZETzFGQlJVZ3NUVUZCVFN4UFFVRlBMRWRCUVVjc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF6dFJRVU12UWl4TlFVRk5MR2RDUVVGblFpeEhRVUZITEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdVVUZGTjBRc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0UlFVVjZRaXhKUVVGSk8xbEJRMFlzZVVSQlFYbEVPMWxCUTNwRUxFbEJRVWtzWjBKQlFXZENMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJUdG5Ra0ZETDBJc1RVRkJUU3hMUVVGTExFZEJRVEpDTEdkQ1FVRm5RaXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXp0blFrRkZlRVlzU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlR0dlFrRkRWaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETERaRFFVRTJReXhEUVVGRExFTkJRVU03YVVKQlEyaEZPMmRDUVVWRUxFMUJRVTBzUjBGQlJ5eEhRVUV5UWl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzU1VGQlNTeFBRVUZQTEVOQlFVTXNRMEZCUXp0blFrRkZjRVlzU1VGQlNTeERRVUZETEVkQlFVY3NSVUZCUlR0dlFrRkRVaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETERaRFFVRTJReXhEUVVGRExFTkJRVU03YVVKQlEyaEZPMmRDUVVWRUxFMUJRVTBzVVVGQlVTeEhRVUZITEUxQlFVMHNUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUTJwRUxFbEJRVWtzVjBGQlZ5eEhRVUZITEUxQlFVMHNVVUZCVVN4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8yZENRVVY0UXl4SlFVRkpMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zVjBGQlZ5eERRVUZETEVWQlFVVTdiMEpCUXpkQ0xFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNZMEZCWXl4RFFVRkRMRU5CUVVNN2IwSkJRMmhETEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc05rTkJRVFpETEVOQlFVTXNRMEZCUXp0cFFrRkRhRVU3WjBKQlJVUXNUMEZCVHl4alFVRmpMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFhRVUZYTEVOQlFVTXNRMEZCUXp0aFFVTndSRHRaUVVWRUxEWkNRVUUyUWp0WlFVTTNRaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETERaRFFVRTJReXhEUVVGRExFTkJRVU03VTBGRGFFVTdVVUZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRaUVVOV0xITkRRVUZ6UXp0WlFVTjBReXhOUVVGTkxHRkJRV0VzUjBGQlJ5eG5Ra0ZCWjBJc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVWtzVTBGQlV5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGRGNFWXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUTJwRUxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRPMWxCUlZRc1RVRkJUU3hQUVVGUExFZEJRVWNzVFVGQlRTeERRVUZETEUxQlFVMHNUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhoUVVGaExFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMWxCUlhKRkxFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1dVRkRlRUlzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOdVFpeGpRVUZqTEVOQlFVTXNSMEZCUnl4RFFVRkRMRmRCUVZjc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFpRVU40UXl4UFFVRlBMRWxCUVVrc1EwRkJRenRUUVVOaU8wdEJRMFk3VTBGQlRUdFJRVU5NTEdOQlFXTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1YwRkJWeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzFGQlEzcERMRTlCUVU4c1NVRkJTU3hEUVVGRE8wdEJRMkk3UVVGRFNDeERRVUZESW4wPSIsImV4cG9ydCBhc3luYyBmdW5jdGlvbiBwaWN0dXJlKGNoYW5uZWxOYW1lKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGdxbCA9IGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2goXCJodHRwczovL2dxbC50d2l0Y2gudHYvZ3FsXCIsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgaGVhZGVyczogeyBcIkNsaWVudC1JRFwiOiBcImtpbW5lNzhreDNuY3g2YnJnbzRtdjZ3a2k1aDFrb1wiIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IGB7XCJvcGVyYXRpb25OYW1lXCI6XCJQbGF5YmFja0FjY2Vzc1Rva2VuXCIsXCJ2YXJpYWJsZXNcIjp7XCJpc0xpdmVcIjp0cnVlLFwibG9naW5cIjpcIiR7Y2hhbm5lbE5hbWV9XCIsXCJpc1ZvZFwiOmZhbHNlLFwidm9kSURcIjpcIlwiLFwicGxheWVyVHlwZVwiOlwidGh1bmRlcmRvbWVcIn0sXCJleHRlbnNpb25zXCI6e1wicGVyc2lzdGVkUXVlcnlcIjp7XCJ2ZXJzaW9uXCI6MSxcInNoYTI1Nkhhc2hcIjpcIjA4MjgxMTlkZWQxYzEzNDc3OTY2NDM0ZTE1ODAwZmY1N2RkYWNmMTNiYTE5MTFjMTI5ZGMyMjAwNzA1YjA3MTJcIn19fWAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgZ3FsLmpzb24oKTtcclxuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHBzOi8vdXNoZXIudHR2bncubmV0L2FwaS9jaGFubmVsL2hscy9cIiArXHJcbiAgICAgICAgICAgIGNoYW5uZWxOYW1lICtcclxuICAgICAgICAgICAgXCIubTN1OD9hbGxvd19zb3VyY2U9dHJ1ZSZmYXN0X2JyZWFkPXRydWUmcD1cIiArXHJcbiAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDFlNykgK1xyXG4gICAgICAgICAgICBcIiZwbGF5ZXJfYmFja2VuZD1tZWRpYXBsYXllciZwbGF5bGlzdF9pbmNsdWRlX2ZyYW1lcmF0ZT10cnVlJnJlYXNzaWdubWVudHNfc3VwcG9ydGVkPWZhbHNlJnNpZz1cIiArXHJcbiAgICAgICAgICAgIHN0YXR1c1tcImRhdGFcIl1bXCJzdHJlYW1QbGF5YmFja0FjY2Vzc1Rva2VuXCJdW1wic2lnbmF0dXJlXCJdICtcclxuICAgICAgICAgICAgXCImc3VwcG9ydGVkX2NvZGVjcz1hdmMxJnRva2VuPVwiICtcclxuICAgICAgICAgICAgc3RhdHVzW1wiZGF0YVwiXVtcInN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW5cIl1bXCJ2YWx1ZVwiXTtcclxuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgKGF3YWl0IGdsb2JhbC5yZWFsRmV0Y2godXJsKSkudGV4dCgpO1xyXG4gICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljR2xqZEhWeVpTNW1aWFJqYUM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTltWlhSamFDOXdhV04wZFhKbExtWmxkR05vTG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRTFCUVUwc1EwRkJReXhMUVVGTExGVkJRVlVzVDBGQlR5eERRVUZETEZkQlFXMUNPMGxCUXk5RExFbEJRVWs3VVVGRFJpeE5RVUZOTEVkQlFVY3NSMEZCUnl4TlFVRk5MRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zTWtKQlFUSkNMRVZCUVVVN1dVRkRPVVFzVFVGQlRTeEZRVUZGTEUxQlFVMDdXVUZEWkN4UFFVRlBMRVZCUVVVc1JVRkJSU3hYUVVGWExFVkJRVVVzWjBOQlFXZERMRVZCUVVVN1dVRkRNVVFzU1VGQlNTeEZRVUZGTERoRlFVRTRSU3hYUVVGWExIVk1RVUYxVER0VFFVTjJVaXhEUVVGRExFTkJRVU03VVVGRlNDeE5RVUZOTEUxQlFVMHNSMEZCVnl4TlFVRk5MRWRCUVVjc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF6dFJRVVY0UXl4TlFVRk5MRWRCUVVjc1IwRkRVQ3d3UTBGQk1FTTdXVUZETVVNc1YwRkJWenRaUVVOWUxEUkRRVUUwUXp0WlFVTTFReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRVZCUVVVc1IwRkJSeXhIUVVGSExFTkJRVU03V1VGREwwSXNaMGRCUVdkSE8xbEJRMmhITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXd5UWtGQk1rSXNRMEZCUXl4RFFVRkRMRmRCUVZjc1EwRkJRenRaUVVONFJDd3JRa0ZCSzBJN1dVRkRMMElzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMREpDUVVFeVFpeERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1VVRkZka1FzVFVGQlRTeEpRVUZKTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xRkJRM2hFTEU5QlFVOHNTVUZCU1N4RFFVRkRPMHRCUTJJN1NVRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdFJRVU5XTEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UzBGRGFFSTdRVUZEU0N4RFFVRkRJbjA9IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGluZmxhdGVGZXRjaCB9IGZyb20gXCIuL2ZldGNoL2ZldGNoLmluZmxhdGVcIjtcclxuaW1wb3J0IHsgSExTIH0gZnJvbSBcIi4vSExTXCI7XHJcbmltcG9ydCB7IG9uU3RhcnQgfSBmcm9tIFwiLi9jaGFubmVsL29uLmNoYW5uZWxcIjtcclxuaW1wb3J0IHsgb24gfSBmcm9tIFwiLi9mZXRjaC9vbi5mZXRjaFwiO1xyXG5pbXBvcnQgeyBjdXJyZW50IH0gZnJvbSBcIi4vY2hhbm5lbC9jdXJyZW50LmNoYW5uZWxcIjtcclxuaW1wb3J0IHsgcGljdHVyZSB9IGZyb20gXCIuL2ZldGNoL3BpY3R1cmUuZmV0Y2hcIjtcclxuaW1wb3J0IHsgZXh0ZXJuYWwgfSBmcm9tIFwiLi9mZXRjaC9leHRlcm5hbC5mZXRjaFwiO1xyXG5leHBvcnQgZnVuY3Rpb24gYXBwKHNjb3BlKSB7XHJcbiAgICBzY29wZS5Mb2dQcmludCA9ICh4KSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJbUHVycGxlXTogXCIsIHgpO1xyXG4gICAgfTtcclxuICAgIHNjb3BlLmlzQWRzID0gKHgpID0+IHtcclxuICAgICAgICByZXR1cm4geC50b1N0cmluZygpLmluY2x1ZGVzKFwic3RpdGNoZWQtYWRcIikgfHwgeC50b1N0cmluZygpLmluY2x1ZGVzKFwidHdpdGNoLWNsaWVudC1hZFwiKTtcclxuICAgIH07XHJcbiAgICBzY29wZS5yZWFsRmV0Y2ggPSBmZXRjaDtcclxuICAgIHNjb3BlLnF1YWxpdHkgPSBcIlwiO1xyXG4gICAgc2NvcGUud2hpdGVsaXN0ID0gW107XHJcbiAgICAvL3JlY2VpdmUgbWVzc2FnZSBmcm9tIHdpbmRvd1xyXG4gICAgc2NvcGUuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBzd2l0Y2ggKGUuZGF0YS5mdW5jTmFtZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0UXVhbGl0eVwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5xdWFsaXR5ID0gZS5kYXRhLmFyZ3NbMF0ubmFtZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN3aXRjaCAoZS5kYXRhLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBcInNldFdoaXRlbGlzdFwiOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5kYXRhLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUud2hpdGVsaXN0ID0gZS5kYXRhLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBcInNldFF1YWxpdHlcIjoge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUucXVhbGl0eSA9IGUuZGF0YS52YWx1ZS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHNjb3BlLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICB0eXBlOiBcImluaXRcIixcclxuICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgIH0pO1xyXG4gICAgc2NvcGUuY2hhbm5lbCA9IFtdO1xyXG4gICAgc2NvcGUuYWN0dWFsQ2hhbm5lbCA9IFwiXCI7XHJcbiAgICBzY29wZS5jdXJyZW50Q2hhbm5lbCA9IGN1cnJlbnQ7XHJcbiAgICBzY29wZS5uZXdQaWN0dXJlID0gcGljdHVyZTtcclxuICAgIHNjb3BlLm5ld0V4dGVybmFsID0gZXh0ZXJuYWw7XHJcbiAgICBzY29wZS50dW5uZWwgPSBudWxsO1xyXG4gICAgc2NvcGUub25GZXRjaCA9IG9uO1xyXG4gICAgc2NvcGUub25TdGFydENoYW5uZWwgPSBvblN0YXJ0O1xyXG4gICAgc2NvcGUuSExTID0gSExTO1xyXG4gICAgaW5mbGF0ZUZldGNoKHNjb3BlKTtcclxufVxyXG5hcHAoc2VsZik7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZjM0pqTDJGd2NDNTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4UFFVRlBMRVZCUVVVc1dVRkJXU3hGUVVGRkxFMUJRVTBzZFVKQlFYVkNMRU5CUVVNN1FVRkRja1FzVDBGQlR5eEZRVUZGTEVkQlFVY3NSVUZCUlN4TlFVRk5MRTlCUVU4c1EwRkJRenRCUVVNMVFpeFBRVUZQTEVWQlFVVXNUMEZCVHl4RlFVRkZMRTFCUVUwc2MwSkJRWE5DTEVOQlFVTTdRVUZETDBNc1QwRkJUeXhGUVVGRkxFVkJRVVVzUlVGQlJTeE5RVUZOTEd0Q1FVRnJRaXhEUVVGRE8wRkJRM1JETEU5QlFVOHNSVUZCUlN4UFFVRlBMRVZCUVVVc1RVRkJUU3d5UWtGQk1rSXNRMEZCUXp0QlFVTndSQ3hQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNkVUpCUVhWQ0xFTkJRVU03UVVGRGFFUXNUMEZCVHl4RlFVRkZMRkZCUVZFc1JVRkJSU3hOUVVGTkxIZENRVUYzUWl4RFFVRkRPMEZCUld4RUxFMUJRVTBzVlVGQlZTeEhRVUZITEVOQlFVTXNTMEZCVlR0SlFVTTFRaXhMUVVGTExFTkJRVU1zVVVGQlVTeEhRVUZITEVOQlFVTXNRMEZCVFN4RlFVRkZMRVZCUVVVN1VVRkRNVUlzVDBGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4WlFVRlpMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03U1VGREwwSXNRMEZCUXl4RFFVRkRPMGxCUlVZc1MwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFWTXNSVUZCUlN4RlFVRkZPMUZCUXpGQ0xFOUJRVThzUTBGQlF5eERRVUZETEZGQlFWRXNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExHdENRVUZyUWl4RFFVRkRMRU5CUVVNN1NVRkRNMFlzUTBGQlF5eERRVUZETzBsQlJVWXNTMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJSeXhMUVVGTExFTkJRVU03U1VGRGVFSXNTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJSeXhGUVVGRkxFTkJRVU03U1VGRGJrSXNTMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJSeXhGUVVGRkxFTkJRVU03U1VGRmNrSXNOa0pCUVRaQ08wbEJRemRDTEV0QlFVc3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eFRRVUZUTEVWQlFVVXNWVUZCVlN4RFFVRkRPMUZCUXpORExGRkJRVkVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRVZCUVVVN1dVRkRka0lzUzBGQlN5eFpRVUZaTEVOQlFVTXNRMEZCUXp0blFrRkRha0lzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNN1owSkJRM0JETEUxQlFVMDdZVUZEVUR0WlFVTkVMRTlCUVU4c1EwRkJReXhEUVVGRE8yZENRVU5RTEUxQlFVMDdZVUZEVUR0VFFVTkdPMUZCUlVRc1VVRkJVU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUlR0WlFVTnVRaXhMUVVGTExHTkJRV01zUTBGQlF5eERRVUZETzJkQ1FVTnVRaXhKUVVGSkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZPMjlDUVVOb1FpeExRVUZMTEVOQlFVTXNVMEZCVXl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETzJsQ1FVTm9RenRuUWtGRFJDeE5RVUZOTzJGQlExQTdXVUZEUkN4TFFVRkxMRmxCUVZrc1EwRkJReXhEUVVGRE8yZENRVU5xUWl4TFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJRenRuUWtGRGJFTXNUVUZCVFR0aFFVTlFPMWxCUTBRc1QwRkJUeXhEUVVGRExFTkJRVU03WjBKQlExQXNUVUZCVFR0aFFVTlFPMU5CUTBZN1NVRkRTQ3hEUVVGRExFTkJRVU1zUTBGQlF6dEpRVVZJTEV0QlFVc3NRMEZCUXl4WFFVRlhMRU5CUVVNN1VVRkRhRUlzU1VGQlNTeEZRVUZGTEUxQlFVMDdVVUZEV2l4TFFVRkxMRVZCUVVVc1NVRkJTVHRMUVVOYUxFTkJRVU1zUTBGQlF6dEpRVVZJTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRMjVDTEV0QlFVc3NRMEZCUXl4aFFVRmhMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRM3BDTEV0QlFVc3NRMEZCUXl4alFVRmpMRWRCUVVjc1QwRkJUeXhEUVVGRE8wbEJSUzlDTEV0QlFVc3NRMEZCUXl4VlFVRlZMRWRCUVVjc1QwRkJUeXhEUVVGRE8wbEJRek5DTEV0QlFVc3NRMEZCUXl4WFFVRlhMRWRCUVVjc1VVRkJVU3hEUVVGRE8wbEJRemRDTEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRE8wbEJSWEJDTEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRMjVDTEV0QlFVc3NRMEZCUXl4alFVRmpMRWRCUVVjc1QwRkJUeXhEUVVGRE8wbEJSUzlDTEV0QlFVc3NRMEZCUXl4SFFVRkhMRWRCUVVjc1IwRkJSeXhEUVVGRE8wbEJSV2hDTEZsQlFWa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRCUVVOMFFpeERRVUZETzBGQlEwUXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGREluMD0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=