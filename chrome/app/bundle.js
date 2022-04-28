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
        const response = await __webpack_require__.g.realFetch("https://" + __webpack_require__.g.tunnel[0] + "/channel/" + channelName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwuZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBQ3hDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsUUFBUSxDQUFDLFdBQW1CO0lBQ2hELElBQUk7UUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDNUMsTUFBTSxRQUFRLEdBQWEsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQztRQUU5RyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDM0Q7UUFFRCxNQUFNLElBQUksR0FBVyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUUzQyxNQUFNLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFFdkMsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQixPQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0gsQ0FBQyJ9

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
    scope.tunnel = ["jupter.ga", "eu.jupter.ga"];
    scope.onFetch = _fetch_on_fetch__WEBPACK_IMPORTED_MODULE_3__.on;
    scope.onStartChannel = _channel_on_channel__WEBPACK_IMPORTED_MODULE_2__.onStart;
    scope.HLS = _HLS__WEBPACK_IMPORTED_MODULE_1__.HLS;
    (0,_fetch_fetch_inflate__WEBPACK_IMPORTED_MODULE_0__.inflateFetch)(scope);
}
app(self);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDckQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQUM1QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBVTtJQUM1QixLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBTSxFQUFFLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDM0YsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDeEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFFckIsNkJBQTZCO0lBQzdCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1FBQzNDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDdkIsS0FBSyxZQUFZLENBQUMsQ0FBQztnQkFDakIsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLE1BQU07YUFDUDtZQUNELE9BQU8sQ0FBQyxDQUFDO2dCQUNQLE1BQU07YUFDUDtTQUNGO1FBRUQsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNuQixLQUFLLGNBQWMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNoQixLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2lCQUNoQztnQkFDRCxNQUFNO2FBQ1A7WUFDRCxLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNqQixLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDbEMsTUFBTTthQUNQO1lBQ0QsT0FBTyxDQUFDLENBQUM7Z0JBQ1AsTUFBTTthQUNQO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxXQUFXLENBQUM7UUFDaEIsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsSUFBSTtLQUNaLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0lBRS9CLEtBQUssQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzNCLEtBQUssQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDO0lBQzdCLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxXQUFXLEVBQUMsY0FBYyxDQUFDLENBQUE7SUFFM0MsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsS0FBSyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7SUFFL0IsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFFaEIsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMifQ==
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTnFEO0FBQ3pCO0FBQ21CO0FBQ1Q7QUFDYztBQUNKO0FBQ0U7QUFDM0M7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsMkJBQTJCLDZEQUFPO0FBQ2xDLHVCQUF1Qix5REFBTztBQUM5Qix3QkFBd0IsMkRBQVE7QUFDaEM7QUFDQSxvQkFBb0IsK0NBQUU7QUFDdEIsMkJBQTJCLHdEQUFPO0FBQ2xDLGdCQUFnQixxQ0FBRztBQUNuQixJQUFJLGtFQUFZO0FBQ2hCO0FBQ0E7QUFDQSwyQ0FBMkMsdWlGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL0hMUy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2hhbm5lbC9jdXJyZW50LmNoYW5uZWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NoYW5uZWwvb24uY2hhbm5lbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvZmV0Y2gvZXh0ZXJuYWwuZmV0Y2gudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL2ZldGNoLmluZmxhdGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZldGNoL29uLmZldGNoLnRzIiwid2VicGFjazovLy8uL3NyYy9mZXRjaC9waWN0dXJlLmZldGNoLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEhMUyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9oZWFkZXIgPSBbXCIjRVhUTTNVXCIsIFwiI0VYVC1YLVZFUlNJT046M1wiLCBcIiNFWFQtWC1UQVJHRVREVVJBVElPTjo2XCIsIFwiI0VYVC1YLU1FRElBLVNFUVVFTkNFOlwiXTtcclxuICAgICAgICB0aGlzLl9wbGF5bGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuX3NlcXVlbmNlID0gMDtcclxuICAgICAgICB0aGlzLl9zdHJlYW1TZXJ2ZXJMaXN0ID0gW107XHJcbiAgICB9XHJcbiAgICAvL2FkZCBtM3U4IGxpbmtzIHdpdGggcXVhbGl0eSB0byB0aGUgbGlzdCBvZiBzZXJ2ZXJzXHJcbiAgICBhc3luYyBhZGRTdHJlYW1MaW5rKHRleHQsIHR5cGUgPSBcImxvY2FsXCIsIHNpZyA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eVVybFNwbGl0ID0gW107XHJcbiAgICAgICAgbGV0IGNhcHR1cmVBcnJheTtcclxuICAgICAgICBjb25zdCBSRUdFWCA9IC9OQU1FPVwiKCg/OlxcUytcXHMrXFxTK3xcXFMrKSlcIixBVVRPKD86XnxcXFMrXFxzKykoPzpefFxcUytcXHMrKShodHRwczpcXC9cXC92aWRlbyhcXFMrKS5tM3U4KS9nO1xyXG4gICAgICAgIHdoaWxlICgoY2FwdHVyZUFycmF5ID0gUkVHRVguZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcXVhbGl0eVVybFNwbGl0LnB1c2goeyBxdWFsaXR5OiBjYXB0dXJlQXJyYXlbMV0sIHVybDogY2FwdHVyZUFycmF5WzJdIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZyhxdWFsaXR5VXJsU3BsaXQpO1xyXG4gICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSB7IHNlcnZlcjogdHlwZSwgdXJsTGlzdDogcXVhbGl0eVVybFNwbGl0LCBzaWc6IHNpZyB9O1xyXG4gICAgICAgIHRoaXMuX3N0cmVhbVNlcnZlckxpc3QucHVzaChzdHJlYW1MaXN0KTtcclxuICAgICAgICBpZiAoIXNpZykge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNpZ25hdHVyZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGFzeW5jIHNpZ25hdHVyZSgpIHtcclxuICAgICAgICBjb25zdCBSRUdFWCA9IC92aWRlby13ZWF2ZXIuKC4qKS5obHMudHR2bncubmV0XFwvdjFcXC9wbGF5bGlzdFxcLyguKikubTN1OCQvZ207XHJcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHRoaXMuX3N0cmVhbVNlcnZlckxpc3RcclxuICAgICAgICAgICAgLmZpbHRlcigoeCkgPT4geC5zaWcgPT0gZmFsc2UpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKGFzeW5jICh4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gUkVHRVguZXhlYyh4LnVybExpc3RbMF0udXJsKTtcclxuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vanVwdGVyLmdhL2hscy92Mi9zaWcvXCIgKyBtYXRjaFsyXSArIFwiL1wiICsgbWF0Y2hbMV0sIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHguc2lnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbiAgICBnZXQgU3RyZWFtU2VydmVyTGlzdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3RyZWFtU2VydmVyTGlzdDtcclxuICAgIH1cclxuICAgIGFkZFBsYXlsaXN0KHBsYXlsaXN0KSB7XHJcbiAgICAgICAgaWYgKHBsYXlsaXN0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IHBsYXlsaXN0LnRvU3RyaW5nKCkuc3BsaXQoL1tcXHJcXG5dLyk7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyWzRdID0gbGluZXNbNF07XHJcbiAgICAgICAgdGhpcy5faGVhZGVyWzVdID0gbGluZXNbNV07XHJcbiAgICAgICAgLy90YWtlIGFsbCBtM3U5IGNvbnRlbnQgdG8gdGhlIHBsYXlsaXN0IGFuZCBidWlsZCBhIG5ldyBmbG93XHJcbiAgICAgICAgZm9yIChjb25zdCBpIGluIGxpbmVzKSB7XHJcbiAgICAgICAgICAgIGlmIChsaW5lc1tpXS5pbmNsdWRlcyhcIiNFWFQtWC1QUk9HUkFNLURBVEUtVElNRTpcIikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcXVlbmNlVGltZXN0YW1wID0gTWF0aC5mbG9vcihuZXcgRGF0ZShsaW5lc1tpXS5zbGljZShsaW5lc1tpXS5sZW5ndGggLSAyNCwgbGluZXNbaV0ubGVuZ3RoKSkuZ2V0VGltZSgpIC8gMTAwMCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByID0gdGhpcy5fcGxheWxpc3QuZmlsdGVyKCh4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudGltZXN0YW1wID49IHNlcXVlbmNlVGltZXN0YW1wO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgPSB0aGlzLl9zZXF1ZW5jZSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3QucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IGxpbmVzW3BhcnNlSW50KGkpXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBzZXF1ZW5jZVRpbWVzdGFtcCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5mbzogbGluZXNbcGFyc2VJbnQoaSkgKyAxXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBsaW5lc1twYXJzZUludChpKSArIDJdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLl9wbGF5bGlzdC5sZW5ndGggPiAxNSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheWxpc3Quc2hpZnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hhbmdlZDtcclxuICAgIH1cclxuICAgIGdldEFsbFBsYXlsaXN0KCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5faGVhZGVyWzBdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlclsxXSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9oZWFkZXJbMl0gK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzNdICtcclxuICAgICAgICAgICAgdGhpcy5fc2VxdWVuY2UgK1xyXG4gICAgICAgICAgICBcIlxcblwiICtcclxuICAgICAgICAgICAgdGhpcy5faGVhZGVyWzRdICtcclxuICAgICAgICAgICAgXCJcXG5cIiArXHJcbiAgICAgICAgICAgIHRoaXMuX2hlYWRlcls1XSArXHJcbiAgICAgICAgICAgIFwiXFxuXCIgK1xyXG4gICAgICAgICAgICB0aGlzLl9wbGF5bGlzdC5tYXAoKHgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4LnRpbWUgKyBcIlxcblwiICsgeC5pbmZvICsgXCJcXG5cIiArIHgudXJsICsgXCJcXG5cIjtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNFeFRMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaUxpNHZjM0pqTDBoTVV5NTBjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4TlFVRk5MRTlCUVU4c1IwRkJSenRKUVVGb1FqdFJRVU5WTEZsQlFVOHNSMEZCYTBJc1EwRkJReXhUUVVGVExFVkJRVVVzYTBKQlFXdENMRVZCUVVVc2VVSkJRWGxDTEVWQlFVVXNkMEpCUVhkQ0xFTkJRVU1zUTBGQlF6dFJRVU01Unl4alFVRlRMRWRCUVcxQ0xFVkJRVVVzUTBGQlF6dFJRVU12UWl4alFVRlRMRWRCUVVjc1EwRkJReXhEUVVGRE8xRkJRMlFzYzBKQlFXbENMRWRCUVcxQ0xFVkJRVVVzUTBGQlF6dEpRVFpIYWtRc1EwRkJRenRKUVROSFF5eHZSRUZCYjBRN1NVRkRjRVFzUzBGQlN5eERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRlpMRVZCUVVVc1NVRkJTU3hIUVVGSExFOUJRVThzUlVGQlJTeEhRVUZITEVkQlFVY3NTMEZCU3p0UlFVTXpSQ3hOUVVGTkxHVkJRV1VzUjBGQmFVSXNSVUZCUlN4RFFVRkRPMUZCUTNwRExFbEJRVWtzV1VGQmIwTXNRMEZCUXp0UlFVVjZReXhOUVVGTkxFdEJRVXNzUjBGQlJ5eHhSa0ZCY1VZc1EwRkJRenRSUVVWd1J5eFBRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRXRCUVVzc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkpMRVZCUVVVN1dVRkRha1FzWlVGQlpTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRTlCUVU4c1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSMEZCUnl4RlFVRkZMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdVMEZETVVVN1VVRkRSQ3hQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETEdWQlFXVXNRMEZCUXl4RFFVRkRPMUZCUXpkQ0xFMUJRVTBzVlVGQlZTeEhRVUZITEVWQlFVVXNUVUZCVFN4RlFVRkZMRWxCUVVrc1JVRkJSU3hQUVVGUExFVkJRVVVzWlVGQlpTeEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVONFJTeEpRVUZKTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMUZCUlhoRExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVTdXVUZEVWl4TlFVRk5MRWxCUVVrc1EwRkJReXhUUVVGVExFVkJRVVVzUTBGQlF6dFRRVU40UWp0UlFVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRE8wbEJRMlFzUTBGQlF6dEpRVVZFTEV0QlFVc3NRMEZCUXl4VFFVRlRPMUZCUTJJc1RVRkJUU3hMUVVGTExFZEJRVWNzTmtSQlFUWkVMRU5CUVVNN1VVRkZOVVVzVFVGQlRTeEpRVUZKTEU5QlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hGUVVGRkxFTkJRelZDTEVsQlFVa3NRMEZCUXl4cFFrRkJhVUk3WVVGRGJrSXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJUU3hGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SlFVRkpMRXRCUVVzc1EwRkJRenRoUVVOc1F5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVUwc1JVRkJSU3hGUVVGRk8xbEJRM2hDTEUxQlFVMHNTMEZCU3l4SFFVRXlRaXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdXVUZEYmtVc1NVRkJTU3hMUVVGTExFVkJRVVU3WjBKQlExUXNTVUZCU1R0dlFrRkRSaXhOUVVGTkxFTkJRVU1zUjBGQlJ5eE5RVUZOTEV0QlFVc3NRMEZCUXl3clFrRkJLMElzUjBGQlJ5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1IwRkJSeXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0M1FrRkRha1lzVFVGQlRTeEZRVUZGTEV0QlFVczdjVUpCUTJRc1EwRkJReXhEUVVGRE8yOUNRVU5JTEVOQlFVTXNRMEZCUXl4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRE8yOUNRVU5pTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRwUWtGRFpqdG5Ra0ZCUXl4TlFVRk5PMjlDUVVOT0xFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0cFFrRkRhRUk3WVVGRFJqdHBRa0ZCVFR0blFrRkRUQ3hQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdZVUZEYUVJN1VVRkRTQ3hEUVVGRExFTkJRVU1zUTBGRFRDeERRVUZETzBsQlEwb3NRMEZCUXp0SlFVVkVMRWxCUVVrc1owSkJRV2RDTzFGQlEyeENMRTlCUVU4c1NVRkJTU3hEUVVGRExHbENRVUZwUWl4RFFVRkRPMGxCUTJoRExFTkJRVU03U1VGRlJDeFhRVUZYTEVOQlFVTXNVVUZCWjBJN1VVRkRNVUlzU1VGQlNTeFJRVUZSTEV0QlFVc3NTVUZCU1N4RlFVRkZPMWxCUTNKQ0xFOUJRVThzUzBGQlN5eERRVUZETzFOQlEyUTdVVUZGUkN4SlFVRkpMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU03VVVGRmNFSXNUVUZCVFN4TFFVRkxMRWRCUVVjc1VVRkJVU3hEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRSUVVOc1JDeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTXpRaXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVVV6UWl3MFJFRkJORVE3VVVGRE5VUXNTMEZCU3l4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExFVkJRVVU3V1VGRGNrSXNTVUZCU1N4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETERKQ1FVRXlRaXhEUVVGRExFVkJRVVU3WjBKQlEyeEVMRTFCUVUwc2FVSkJRV2xDTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1JVRkJSU3hGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4RFFVRkRPMmRDUVVWMlNDeE5RVUZOTEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZPMjlDUVVOd1F5eFBRVUZQTEVOQlFVTXNRMEZCUXl4VFFVRlRMRWxCUVVrc2FVSkJRV2xDTEVOQlFVTTdaMEpCUXpGRExFTkJRVU1zUTBGQlF5eERRVUZETzJkQ1FVVklMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZGTzI5Q1FVTmlMRWxCUVVrc1EwRkJReXhUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4RFFVRkRMRU5CUVVNN2IwSkJRM0JETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRE8zZENRVU5zUWl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0M1FrRkRlRUlzVTBGQlV5eEZRVUZGTEdsQ1FVRnBRanQzUWtGRE5VSXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPM2RDUVVNMVFpeEhRVUZITEVWQlFVVXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdjVUpCUXpWQ0xFTkJRVU1zUTBGQlF6dHZRa0ZEU0N4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE8ybENRVU5vUWp0aFFVTkdPMWxCUTBRc1QwRkJUeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNSMEZCUnl4RlFVRkZMRVZCUVVVN1owSkJRMnBETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03WVVGRGVFSTdVMEZEUmp0UlFVTkVMRTlCUVU4c1QwRkJUeXhEUVVGRE8wbEJRMnBDTEVOQlFVTTdTVUZGUkN4alFVRmpPMUZCUTFvc1QwRkJUeXhEUVVOTUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTVHRaUVVOS0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTJZc1NVRkJTU3hEUVVGRExGTkJRVk03V1VGRFpDeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU03V1VGRFppeEpRVUZKTzFsQlEwb3NTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlR0blFrRkRka0lzVDBGQlR5eERRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1IwRkJSeXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1IwRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF6dFpRVU4wUkN4RFFVRkRMRU5CUVVNc1EwRkRTQ3hEUVVGRE8wbEJRMG9zUTBGQlF6dERRVU5HSW4wPSIsImV4cG9ydCBmdW5jdGlvbiBjdXJyZW50KGNoYW5uZWwgPSBudWxsKSB7XHJcbiAgICBpZiAoY2hhbm5lbCkge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWwuY2hhbm5lbC5maW5kKCh4KSA9PiB4Lm5hbWUgPT09IGNoYW5uZWwpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gZ2xvYmFsLmFjdHVhbENoYW5uZWwpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVkzVnljbVZ1ZEM1amFHRnVibVZzTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2TGk0dmMzSmpMMk5vWVc1dVpXd3ZZM1Z5Y21WdWRDNWphR0Z1Ym1Wc0xuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEUxQlFVMHNWVUZCVlN4UFFVRlBMRU5CUVVNc1QwRkJUeXhIUVVGSExFbEJRVWs3U1VGRGNFTXNTVUZCU1N4UFFVRlBMRVZCUVVVN1VVRkRXQ3hQUVVGUExFMUJRVTBzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRTlCUVU4c1EwRkJReXhEUVVGRE8wdEJRM1pFTzFOQlFVMDdVVUZEVEN4UFFVRlBMRTFCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeExRVUZMTEUxQlFVMHNRMEZCUXl4aFFVRmhMRU5CUVVNc1EwRkJRenRMUVVOd1JUdEJRVU5JTEVOQlFVTWlmUT09IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uU3RhcnQoX3dpbmRvdywgdXJsLCB0ZXh0IC8qIGlzT2ZmbGluZSA9IGZhbHNlICovKSB7XHJcbiAgICBjb25zdCByZWdleCA9IC9obHNcXC8oLiopLm0zdTgvZ207XHJcbiAgICBjb25zdCBtYXRjaCA9IHJlZ2V4LmV4ZWModXJsKSB8fCBbXTtcclxuICAgIGxldCBleGlzdGVudCA9IGZhbHNlO1xyXG4gICAgaWYgKG1hdGNoWzFdKSB7XHJcbiAgICAgICAgX3dpbmRvdy5hY3R1YWxDaGFubmVsID0gbWF0Y2hbMV07XHJcbiAgICAgICAgaWYgKF93aW5kb3cud2hpdGVsaXN0LmluY2x1ZGVzKG1hdGNoWzFdKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghX3dpbmRvdy5jaGFubmVsLmZpbmQoKGMpID0+IGMubmFtZSA9PT0gbWF0Y2hbMV0pKSB7XHJcbiAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJDaGFubmVsOiBcIiArIG1hdGNoWzFdKTtcclxuICAgICAgICAgICAgX3dpbmRvdy5jaGFubmVsLnB1c2goeyBuYW1lOiBtYXRjaFsxXSwgZmxvd1NpZzogW10sIGhsczogbmV3IF93aW5kb3cuSExTKCkgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBfd2luZG93LkxvZ1ByaW50KFwiRXhpc3Q6IFwiICsgbWF0Y2hbMV0pO1xyXG4gICAgICAgICAgICBleGlzdGVudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIF93aW5kb3cuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICBnbG9iYWwuY3VycmVudENoYW5uZWwobWF0Y2hbMV0pLmhscy5hZGRTdHJlYW1MaW5rKHRleHQpO1xyXG4gICAgX3dpbmRvdy5Mb2dQcmludChcIkxvY2FsIFNlcnZlcjogT0tcIik7XHJcbiAgICBpZiAoZXhpc3RlbnQpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cclxuICAgIGF3YWl0IGdsb2JhbC5uZXdQaWN0dXJlKGdsb2JhbC5hY3R1YWxDaGFubmVsKS50aGVuKCh0ZXh0UGljdHVyZSkgPT4ge1xyXG4gICAgICAgIGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dFBpY3R1cmUsIFwicGljdHVyZVwiLCB0cnVlKTtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJMb2NhbCBTZXJ2ZXIgNDgwcDogT0tcIik7XHJcbiAgICB9KTtcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXHJcbiAgICBnbG9iYWwubmV3RXh0ZXJuYWwoZ2xvYmFsLmFjdHVhbENoYW5uZWwpLnRoZW4oKHRleHQpID0+IGdsb2JhbC5jdXJyZW50Q2hhbm5lbChtYXRjaFsxXSkuaGxzLmFkZFN0cmVhbUxpbmsodGV4dCwgXCJwcm94eVwiLCB0cnVlKSk7XHJcbiAgICByZXR1cm47XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHF1YWxpdHlVcmxTcGxpdCA9IHRleHQuc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgIGNvbnN0IHNlcnZlciA9IHF1YWxpdHlVcmxTcGxpdC5zaGlmdCgpO1xyXG4gICAgICAgIGNvbnN0IHN0cmVhbUxpc3QgPSB7IHNlcnZlcjogXCJwcm94eVwiLCB1cmxMaXN0OiBbXSB9O1xyXG4gICAgICAgIHF1YWxpdHlVcmxTcGxpdC5mb3JFYWNoKChlbGVtZW50LCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgICAgICAgICAgaWYgKCEoaW5kZXggJSAyKSkge1xyXG4gICAgICAgICAgICAgICAgc3RyZWFtTGlzdC51cmxMaXN0LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHF1YWxpdHk6IHN0cmVhbUxpc3QudXJsTGlzdC5zb21lKCh4KSA9PiB4LnF1YWxpdHkgPT0gZWxlbWVudCkgPyBlbGVtZW50ICsgXCJwMzBcIiA6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vdmlkZW8td2VhdmVyLlwiICsgc2VydmVyICsgXCIuaGxzLnR0dm53Lm5ldC92MS9wbGF5bGlzdC9cIiArIGFycmF5W2luZGV4ICsgMV0gKyBcIi5tM3U4XCIsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgX3dpbmRvdy5jaGFubmVsLmZpbmQoKHgpID0+IHgubmFtZSA9PT0gbWF0Y2hbMV0pLmhscy5hZGQoc3RyZWFtTGlzdCk7XHJcbiAgICAgICAgX3dpbmRvdy5Mb2dQcmludChcIkV4dGVybmFsIFNlcnZlcjogT0tcIik7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIF93aW5kb3cuTG9nUHJpbnQoZSk7XHJcbiAgICB9XHJcbn1cclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYjI0dVkyaGhibTVsYkM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTnlZeTlqYUdGdWJtVnNMMjl1TG1Ob1lXNXVaV3d1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hQUVVGUExFTkJRVU1zVDBGQlR5eEZRVUZGTEVkQlFVY3NSVUZCUlN4SlFVRkpMRU5CUVVNc2RVSkJRWFZDTzBsQlEzUkZMRTFCUVUwc1MwRkJTeXhIUVVGSExHdENRVUZyUWl4RFFVRkRPMGxCUTJwRExFMUJRVTBzUzBGQlN5eEhRVUY1UWl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0SlFVTXhSQ3hKUVVGSkxGRkJRVkVzUjBGQlJ5eExRVUZMTEVOQlFVTTdTVUZGY2tJc1NVRkJTU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVTdVVUZEV2l4UFFVRlBMRU5CUVVNc1lVRkJZU3hIUVVGSExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTnFReXhKUVVGSkxFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTzFsQlEzaERMRTlCUVU4N1UwRkRVanRSUVVWRUxFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlR0WlFVTnlSQ3hQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETEZkQlFWY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU42UXl4UFFVRlBMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzVDBGQlR5eEZRVUZGTEVWQlFVVXNSVUZCUlN4SFFVRkhMRVZCUVVVc1NVRkJTU3hQUVVGUExFTkJRVU1zUjBGQlJ5eEZRVUZGTEVWQlFVVXNRMEZCUXl4RFFVRkRPMU5CUXk5Rk8yRkJRVTA3V1VGRFRDeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1IwRkJSeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0WlFVTjJReXhSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETzFOQlEycENPMHRCUTBZN1NVRkRSQ3huUkVGQlowUTdTVUZGYUVRc1owUkJRV2RFTzBsQlEyaEVMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zZFVKQlFYVkNMRU5CUVVNc1EwRkJRenRKUVVNeFF5eE5RVUZOTEVOQlFVTXNZMEZCWXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03U1VGRGVFUXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhyUWtGQmEwSXNRMEZCUXl4RFFVRkRPMGxCUlhKRExFbEJRVWtzVVVGQlVUdFJRVUZGTEU5QlFVODdTVUZGY2tJc1owUkJRV2RFTzBsQlJXaEVMR2RFUVVGblJEdEpRVU5vUkN4TlFVRk5MRTFCUVUwc1EwRkJReXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExGZEJRVmNzUlVGQlJTeEZRVUZGTzFGQlEycEZMRTFCUVUwc1EwRkJReXhqUVVGakxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExHRkJRV0VzUTBGQlF5eFhRVUZYTEVWQlFVVXNVMEZCVXl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8xRkJRMmhHTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc2RVSkJRWFZDTEVOQlFVTXNRMEZCUXp0SlFVTXpReXhEUVVGRExFTkJRVU1zUTBGQlF6dEpRVVZJTEdkRVFVRm5SRHRKUVVWb1JDeG5SRUZCWjBRN1NVRkZhRVFzVFVGQlRTeERRVUZETEZkQlFWY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNTVUZCU1N4RlFVRkZMRVZCUVVVc1EwRkJReXhOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTlCUVU4c1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETzBsQlJXaEpMRTlCUVU4N1NVRkZVQ3hKUVVGSk8xRkJRMFlzVFVGQlRTeGxRVUZsTEVkQlFVY3NTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFJRVU40UXl4TlFVRk5MRTFCUVUwc1IwRkJSeXhsUVVGbExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdVVUZGZGtNc1RVRkJUU3hWUVVGVkxFZEJRV1VzUlVGQlJTeE5RVUZOTEVWQlFVVXNUMEZCVHl4RlFVRkZMRTlCUVU4c1JVRkJSU3hGUVVGRkxFVkJRVVVzUTBGQlF6dFJRVU5vUlN4bFFVRmxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEV0QlFVc3NSVUZCUlN4TFFVRkxMRVZCUVVVc1JVRkJSVHRaUVVOb1JDeEpRVUZKTEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFVkJRVVU3WjBKQlEyaENMRlZCUVZVc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETzI5Q1FVTjBRaXhQUVVGUExFVkJRVVVzVlVGQlZTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRWxCUVVrc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVTg3YjBKQlEzcEdMRWRCUVVjc1JVRkJSU3gxUWtGQmRVSXNSMEZCUnl4TlFVRk5MRWRCUVVjc05rSkJRVFpDTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eFBRVUZQTzJsQ1FVTnVSeXhEUVVGRExFTkJRVU03WVVGRFNqdFJRVU5JTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUlVnc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0UlFVTTNRaXhQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVa3NTMEZCU3l4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8xRkJSWEpGTEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc2NVSkJRWEZDTEVOQlFVTXNRMEZCUXp0TFFVTjZRenRKUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTzFGQlExWXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dExRVU55UWp0QlFVTklMRU5CUVVNaWZRPT0iLCIvL2V4dGVybmFsIHJlcXVlc3QgdGhyb3VoZyBwdXJwbGUgc2VydmVyXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHRlcm5hbChjaGFubmVsTmFtZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCJFeHRlcm5hbCBTZXJ2ZXI6IExvYWRpbmdcIik7XHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBnbG9iYWwucmVhbEZldGNoKFwiaHR0cHM6Ly9cIiArIGdsb2JhbC50dW5uZWxbMF0gKyBcIi9jaGFubmVsL1wiICsgY2hhbm5lbE5hbWUpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwic2VydmVyIHByb3h5IHJldHVybiBlcnJvciBvciBub3QgZm91bmRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiRXh0ZXJuYWwgU2VydmVyOiBPS1wiKTtcclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgIH1cclxuICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KGUpO1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVpYaDBaWEp1WVd3dVptVjBZMmd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZabVYwWTJndlpYaDBaWEp1WVd3dVptVjBZMmd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNkME5CUVhkRE8wRkJRM2hETEUxQlFVMHNRMEZCUXl4TFFVRkxMRlZCUVZVc1VVRkJVU3hEUVVGRExGZEJRVzFDTzBsQlEyaEVMRWxCUVVrN1VVRkRSaXhOUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETERCQ1FVRXdRaXhEUVVGRExFTkJRVU03VVVGRE5VTXNUVUZCVFN4UlFVRlJMRWRCUVdFc1RVRkJUU3hOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEZWQlFWVXNSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZKTEZkQlFWY3NSMEZCUnl4WFFVRlhMRU5CUVVNc1EwRkJRenRSUVVVNVJ5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1JVRkJSVHRaUVVOb1FpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMSGREUVVGM1F5eERRVUZETEVOQlFVTTdVMEZETTBRN1VVRkZSQ3hOUVVGTkxFbEJRVWtzUjBGQlZ5eE5RVUZOTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRSUVVVelF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RFFVRkRMSEZDUVVGeFFpeERRVUZETEVOQlFVTTdVVUZGZGtNc1QwRkJUeXhKUVVGSkxFTkJRVU03UzBGRFlqdEpRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPMUZCUTFZc1RVRkJUU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVTnVRaXhQUVVGUExFVkJRVVVzUTBGQlF6dExRVU5ZTzBGQlEwZ3NRMEZCUXlKOSIsImV4cG9ydCBmdW5jdGlvbiBpbmZsYXRlRmV0Y2goX3dpbmRvdykge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWdsb2JhbC1hc3NpZ25cclxuICAgIF93aW5kb3cuZmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgaWYgKHVybC5lbmRzV2l0aChcIm0zdThcIikgJiYgdXJsLmluY2x1ZGVzKFwidHR2bncubmV0XCIpICYmICFfd2luZG93LndoaXRlbGlzdC5pbmNsdWRlcyhfd2luZG93LmFjdHVhbENoYW5uZWwpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9jZXNzRmV0Y2ggPSBhc3luYyBmdW5jdGlvbiAodXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93LnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UudGV4dCgpLnRoZW4oZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3dpbmRvdy5vbkZldGNoKF93aW5kb3csIHRleHQsIHVybCkudGhlbihmdW5jdGlvbiAocikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXlsaXN0ID0gZ2xvYmFsLmN1cnJlbnRDaGFubmVsKCkuaGxzLmdldEFsbFBsYXlsaXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShwbGF5bGlzdCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0ZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKFwidXNoZXIudHR2bncubmV0L2FwaS9jaGFubmVsL2hscy9cIikgJiYgIXVybC5pbmNsdWRlcyhcInBpY3R1cmUtYnktcGljdHVyZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvY2Vzc0ZldGNoID0gYXN5bmMgZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93LnJlYWxGZXRjaCh1cmwsIG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZS50ZXh0KCkudGhlbihhc3luYyBmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfd2luZG93Lm9uU3RhcnRDaGFubmVsKF93aW5kb3csIHVybCwgdGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKHRleHQpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF93aW5kb3cuTG9nUHJpbnQoXCJjaGFubmVsIG9mZmxpbmVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0ZldGNoKHVybCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKFwicGljdHVyZS1ieS1waWN0dXJlXCIpKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF93aW5kb3cucmVhbEZldGNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgICB9O1xyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVptVjBZMmd1YVc1bWJHRjBaUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OW1aWFJqYUM5bVpYUmphQzVwYm1ac1lYUmxMblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFMUJRVTBzVlVGQlZTeFpRVUZaTEVOQlFVTXNUMEZCVHp0SlFVTnNReXcwUTBGQk5FTTdTVUZETlVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUjBGQlJ5eExRVUZMTEZkQlFWY3NSMEZCUnl4RlFVRkZMRTlCUVU4N1VVRkRNVU1zU1VGQlNTeFBRVUZQTEVkQlFVY3NTMEZCU3l4UlFVRlJMRVZCUVVVN1dVRkRNMElzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1lVRkJZU3hEUVVGRExFVkJRVVU3WjBKQlF6TkhMRTlCUVU4c1NVRkJTU3hQUVVGUExFTkJRVU1zVlVGQlZTeFBRVUZQTEVWQlFVVXNUVUZCVFR0dlFrRkRNVU1zU1VGQlNTeFpRVUZaTEVkQlFVY3NTMEZCU3l4WFFVRlhMRWRCUVVjN2QwSkJRM0JETEVsQlFVazdORUpCUTBZc1RVRkJUU3hQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeFJRVUZSTzJkRFFVTXpSQ3hSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1NVRkJTVHR2UTBGRGFrTXNUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUExFVkJRVVVzU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU03ZDBOQlEyeEVMRWxCUVVrc1VVRkJVU3hIUVVGSExFMUJRVTBzUTBGQlF5eGpRVUZqTEVWQlFVVXNRMEZCUXl4SFFVRkhMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU03ZDBOQlF6VkVMRTlCUVU4c1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRPMjlEUVVOc1F5eERRVUZETEVOQlFVTXNRMEZCUXp0blEwRkRUQ3hEUVVGRExFTkJRVU1zUTBGQlF6czBRa0ZEVEN4RFFVRkRMRU5CUVVNc1EwRkJRenQ1UWtGRFNqdDNRa0ZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHMwUWtGRFZpeFBRVUZQTEVOQlFVTXNTVUZCU1N4UlFVRlJMRVZCUVVVc1EwRkJReXhEUVVGRE8zbENRVU42UWp0dlFrRkRTQ3hEUVVGRExFTkJRVU03YjBKQlEwWXNXVUZCV1N4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8yZENRVU53UWl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVOS08xbEJSVVFzU1VGQlNTeEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMR3REUVVGclF5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExHOUNRVUZ2UWl4RFFVRkRMRVZCUVVVN1owSkJRek5HTEU5QlFVOHNTVUZCU1N4UFFVRlBMRU5CUVVNc1ZVRkJWU3hQUVVGUExFVkJRVVVzVFVGQlRUdHZRa0ZETVVNc1NVRkJTU3haUVVGWkxFZEJRVWNzUzBGQlN5eFhRVUZYTEVkQlFVYzdkMEpCUTNCRExFMUJRVTBzVDBGQlR5eERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNVVUZCVVRzMFFrRkRNMFFzU1VGQlNTeFJRVUZSTEVOQlFVTXNSVUZCUlN4RlFVRkZPMmREUVVObUxGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhYUVVGWExFbEJRVWs3YjBOQlEzWkRMRTFCUVUwc1QwRkJUeXhEUVVGRExHTkJRV01zUTBGQlF5eFBRVUZQTEVWQlFVVXNSMEZCUnl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8yOURRVU5xUkN4UFFVRlBMRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXp0blEwRkRPVUlzUTBGQlF5eERRVUZETEVOQlFVTTdOa0pCUTBvN2FVTkJRVTA3WjBOQlEwd3NUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8yZERRVU5zUWl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRU5CUVVNN05rSkJRM0pETzNkQ1FVTklMRU5CUVVNc1EwRkJReXhEUVVGRE8yOUNRVU5NTEVOQlFVTXNRMEZCUXp0dlFrRkRSaXhaUVVGWkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUTNCQ0xFTkJRVU1zUTBGQlF5eERRVUZETzJGQlEwbzdXVUZGUkN4SlFVRkpMRWRCUVVjc1EwRkJReXhSUVVGUkxFTkJRVU1zYjBKQlFXOUNMRU5CUVVNc1JVRkJSVHRoUVVOMlF6dFRRVU5HTzFGQlJVUXNUMEZCVHl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1NVRkRiRVFzUTBGQlF5eERRVUZETzBGQlEwb3NRMEZCUXlKOSIsImV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbihfd2luZG93LCByZXNwb25zZSwgdXJsKSB7XHJcbiAgICAvLyAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjUgKXtcclxuICAgIC8vICAgICAgcmVzcG9uc2UgKz0gXCJ0d2l0Y2gtY2xpZW50LWFkXCI7XHJcbiAgICAvLyAgfVxyXG4gICAgY29uc3QgY2hhbm5lbEN1cnJlbnQgPSBhd2FpdCBnbG9iYWwuY3VycmVudENoYW5uZWwoKTtcclxuICAgIC8vaWYgYWRzIGZpbmQgb24gbWFpbiBsaW5rIGNhbGxlZCBmcm9tIHR3aXRjaCBhcGkgcGxheWVyXHJcbiAgICBpZiAoZ2xvYmFsLmlzQWRzKHJlc3BvbnNlKSkge1xyXG4gICAgICAgIGdsb2JhbC5Mb2dQcmludChcImFkcyBmb3VuZFwiKTtcclxuICAgICAgICBnbG9iYWwucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICB0eXBlOiBcImdldFF1YWxpdHlcIixcclxuICAgICAgICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKHtcclxuICAgICAgICAgICAgdHlwZTogXCJyZWxvYWRcIixcclxuICAgICAgICAgICAgdmFsdWU6IG51bGwsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29uc3QgcXVhbGl0eSA9IGdsb2JhbC5xdWFsaXR5O1xyXG4gICAgICAgIGNvbnN0IFN0cmVhbVNlcnZlckxpc3QgPSBjaGFubmVsQ3VycmVudC5obHMuU3RyZWFtU2VydmVyTGlzdDtcclxuICAgICAgICBnbG9iYWwuTG9nUHJpbnQocXVhbGl0eSk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy90cnkgYWxsIGhscyBzaWdzIHRoYXQgaGF2ZSBvbiBTdHJlYW1TZXJ2ZXJMaXN0IGZyb20gSExTXHJcbiAgICAgICAgICAgIGlmIChTdHJlYW1TZXJ2ZXJMaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHByb3h5ID0gU3RyZWFtU2VydmVyTGlzdC5maW5kKCh4KSA9PiB4LnNlcnZlciA9PSBcInByb3h5XCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcm94eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG0zdTggdmFsaWQgdXJsIGZvdW5kIG9uIFN0cmVhbVNlcnZlckxpc3RcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBwcm94eS51cmxMaXN0LmZpbmQoKGEpID0+IGEucXVhbGl0eSA9PSBxdWFsaXR5KTtcclxuICAgICAgICAgICAgICAgIGlmICghdXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gbTN1OCB2YWxpZCB1cmwgZm91bmQgb24gU3RyZWFtU2VydmVyTGlzdFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJldHVybm8yID0gYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwudXJsKTtcclxuICAgICAgICAgICAgICAgIHZhciByZXR1cm5vVGV4dCA9IGF3YWl0IHJldHVybm8yLnRleHQoKTtcclxuICAgICAgICAgICAgICAgIGlmIChnbG9iYWwuaXNBZHMocmV0dXJub1RleHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLkxvZ1ByaW50KFwiYWRzIG9uIHByb3h5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG0zdTggdmFsaWQgdXJsIGZvdW5kIG9uIFN0cmVhbVNlcnZlckxpc3RcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhbm5lbEN1cnJlbnQuaGxzLmFkZFBsYXlsaXN0KHJldHVybm9UZXh0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2dlcmEgZXJybyBzZSBuYW8gdGl2ZXIgbGlua1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBtM3U4IHZhbGlkIHVybCBmb3VuZCBvbiBTdHJlYW1TZXJ2ZXJMaXN0XCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAvL2lmIG5vdGhpbmcgcmVzb2x2ZSwgcmV0dXJuIDQ4MHAgZmxvd1xyXG4gICAgICAgICAgICBjb25zdCBwaWN0dXJlU3RyZWFtID0gU3RyZWFtU2VydmVyTGlzdC5maWx0ZXIoKHgpID0+IHguc2VydmVyID09IFwicGljdHVyZVwiKS5tYXAoKHgpID0+IHgudXJsTGlzdC5maW5kKCh4KSA9PiB4LnF1YWxpdHkuaW5jbHVkZXMoXCI0ODBcIikpKVswXS51cmw7XHJcbiAgICAgICAgICAgIGNvbnN0IHJldHVybm8gPSBhd2FpdCAoYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChwaWN0dXJlU3RyZWFtKSkudGV4dCgpO1xyXG4gICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoXCI0ODBQXCIpO1xyXG4gICAgICAgICAgICBnbG9iYWwuTG9nUHJpbnQoZSk7XHJcbiAgICAgICAgICAgIGNoYW5uZWxDdXJyZW50Lmhscy5hZGRQbGF5bGlzdChyZXR1cm5vKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY2hhbm5lbEN1cnJlbnQuaGxzLmFkZFBsYXlsaXN0KHJlc3BvbnNlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liMjR1Wm1WMFkyZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lJdUxpOHVMaTl6Y21NdlptVjBZMmd2YjI0dVptVjBZMmd1ZEhNaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNUVUZCVFN4RFFVRkRMRXRCUVVzc1ZVRkJWU3hGUVVGRkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4SFFVRkhPMGxCUXpkRExEaENRVUU0UWp0SlFVTTVRaXgxUTBGQmRVTTdTVUZEZGtNc1MwRkJTenRKUVVWTUxFMUJRVTBzWTBGQll5eEhRVUZITEUxQlFVMHNUVUZCVFN4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRE8wbEJSWEpFTEhkRVFVRjNSRHRKUVVONFJDeEpRVUZKTEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVU3VVVGRE1VSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dFJRVVUzUWl4TlFVRk5MRU5CUVVNc1YwRkJWeXhEUVVGRE8xbEJRMnBDTEVsQlFVa3NSVUZCUlN4WlFVRlpPMWxCUTJ4Q0xFdEJRVXNzUlVGQlJTeEpRVUZKTzFOQlExb3NRMEZCUXl4RFFVRkRPMUZCUlVnc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF6dFpRVU5xUWl4SlFVRkpMRVZCUVVVc1VVRkJVVHRaUVVOa0xFdEJRVXNzUlVGQlJTeEpRVUZKTzFOQlExb3NRMEZCUXl4RFFVRkRPMUZCUlVnc1RVRkJUU3hQUVVGUExFZEJRVWNzVFVGQlRTeERRVUZETEU5QlFVOHNRMEZCUXp0UlFVTXZRaXhOUVVGTkxHZENRVUZuUWl4SFFVRkhMR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zWjBKQlFXZENMRU5CUVVNN1VVRkZOMFFzVFVGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRSUVVWNlFpeEpRVUZKTzFsQlEwWXNlVVJCUVhsRU8xbEJRM3BFTEVsQlFVa3NaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNSVUZCUlR0blFrRkRMMElzVFVGQlRTeExRVUZMTEVkQlFUSkNMR2RDUVVGblFpeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTVUZCU1N4UFFVRlBMRU5CUVVNc1EwRkJRenRuUWtGRmVFWXNTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSVHR2UWtGRFZpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRFpEUVVFMlF5eERRVUZETEVOQlFVTTdhVUpCUTJoRk8yZENRVVZFTEUxQlFVMHNSMEZCUnl4SFFVRXlRaXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNTVUZCU1N4UFFVRlBMRU5CUVVNc1EwRkJRenRuUWtGRmNFWXNTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSVHR2UWtGRFVpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRFpEUVVFMlF5eERRVUZETEVOQlFVTTdhVUpCUTJoRk8yZENRVVZFTEUxQlFVMHNVVUZCVVN4SFFVRkhMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1owSkJRMnBFTEVsQlFVa3NWMEZCVnl4SFFVRkhMRTFCUVUwc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzJkQ1FVVjRReXhKUVVGSkxFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRVZCUVVVN2IwSkJRemRDTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRVU03YjBKQlEyaERMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zTmtOQlFUWkRMRU5CUVVNc1EwRkJRenRwUWtGRGFFVTdaMEpCUlVRc1QwRkJUeXhqUVVGakxFTkJRVU1zUjBGQlJ5eERRVUZETEZkQlFWY3NRMEZCUXl4WFFVRlhMRU5CUVVNc1EwRkJRenRoUVVOd1JEdFpRVVZFTERaQ1FVRTJRanRaUVVNM1FpeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRFpEUVVFMlF5eERRVUZETEVOQlFVTTdVMEZEYUVVN1VVRkJReXhQUVVGUExFTkJRVU1zUlVGQlJUdFpRVU5XTEhORFFVRnpRenRaUVVOMFF5eE5RVUZOTEdGQlFXRXNSMEZCUnl4blFrRkJaMElzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVa3NVMEZCVXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZEY0VZc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRMnBFTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRE8xbEJSVlFzVFVGQlRTeFBRVUZQTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xbEJSWEpGTEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03V1VGRGVFSXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFpRVU51UWl4alFVRmpMRU5CUVVNc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0WlFVTjRReXhQUVVGUExFbEJRVWtzUTBGQlF6dFRRVU5pTzB0QlEwWTdVMEZCVFR0UlFVTk1MR05CUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zVjBGQlZ5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPMUZCUTNwRExFOUJRVThzU1VGQlNTeERRVUZETzB0QlEySTdRVUZEU0N4RFFVRkRJbjA9IiwiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBpY3R1cmUoY2hhbm5lbE5hbWUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZ3FsID0gYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaChcImh0dHBzOi8vZ3FsLnR3aXRjaC50di9ncWxcIiwge1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7IFwiQ2xpZW50LUlEXCI6IFwia2ltbmU3OGt4M25jeDZicmdvNG12NndraTVoMWtvXCIgfSxcclxuICAgICAgICAgICAgYm9keTogYHtcIm9wZXJhdGlvbk5hbWVcIjpcIlBsYXliYWNrQWNjZXNzVG9rZW5cIixcInZhcmlhYmxlc1wiOntcImlzTGl2ZVwiOnRydWUsXCJsb2dpblwiOlwiJHtjaGFubmVsTmFtZX1cIixcImlzVm9kXCI6ZmFsc2UsXCJ2b2RJRFwiOlwiXCIsXCJwbGF5ZXJUeXBlXCI6XCJ0aHVuZGVyZG9tZVwifSxcImV4dGVuc2lvbnNcIjp7XCJwZXJzaXN0ZWRRdWVyeVwiOntcInZlcnNpb25cIjoxLFwic2hhMjU2SGFzaFwiOlwiMDgyODExOWRlZDFjMTM0Nzc5NjY0MzRlMTU4MDBmZjU3ZGRhY2YxM2JhMTkxMWMxMjlkYzIyMDA3MDViMDcxMlwifX19YCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBzdGF0dXMgPSBhd2FpdCBncWwuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly91c2hlci50dHZudy5uZXQvYXBpL2NoYW5uZWwvaGxzL1wiICtcclxuICAgICAgICAgICAgY2hhbm5lbE5hbWUgK1xyXG4gICAgICAgICAgICBcIi5tM3U4P2FsbG93X3NvdXJjZT10cnVlJmZhc3RfYnJlYWQ9dHJ1ZSZwPVwiICtcclxuICAgICAgICAgICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMWU3KSArXHJcbiAgICAgICAgICAgIFwiJnBsYXllcl9iYWNrZW5kPW1lZGlhcGxheWVyJnBsYXlsaXN0X2luY2x1ZGVfZnJhbWVyYXRlPXRydWUmcmVhc3NpZ25tZW50c19zdXBwb3J0ZWQ9ZmFsc2Umc2lnPVwiICtcclxuICAgICAgICAgICAgc3RhdHVzW1wiZGF0YVwiXVtcInN0cmVhbVBsYXliYWNrQWNjZXNzVG9rZW5cIl1bXCJzaWduYXR1cmVcIl0gK1xyXG4gICAgICAgICAgICBcIiZzdXBwb3J0ZWRfY29kZWNzPWF2YzEmdG9rZW49XCIgK1xyXG4gICAgICAgICAgICBzdGF0dXNbXCJkYXRhXCJdW1wic3RyZWFtUGxheWJhY2tBY2Nlc3NUb2tlblwiXVtcInZhbHVlXCJdO1xyXG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCAoYXdhaXQgZ2xvYmFsLnJlYWxGZXRjaCh1cmwpKS50ZXh0KCk7XHJcbiAgICAgICAgcmV0dXJuIHRleHQ7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgfVxyXG59XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHbGpkSFZ5WlM1bVpYUmphQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OW1aWFJqYUM5d2FXTjBkWEpsTG1abGRHTm9MblJ6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFMUJRVTBzUTBGQlF5eExRVUZMTEZWQlFWVXNUMEZCVHl4RFFVRkRMRmRCUVcxQ08wbEJReTlETEVsQlFVazdVVUZEUml4TlFVRk5MRWRCUVVjc1IwRkJSeXhOUVVGTkxFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNNa0pCUVRKQ0xFVkJRVVU3V1VGRE9VUXNUVUZCVFN4RlFVRkZMRTFCUVUwN1dVRkRaQ3hQUVVGUExFVkJRVVVzUlVGQlJTeFhRVUZYTEVWQlFVVXNaME5CUVdkRExFVkJRVVU3V1VGRE1VUXNTVUZCU1N4RlFVRkZMRGhGUVVFNFJTeFhRVUZYTEhWTVFVRjFURHRUUVVOMlVpeERRVUZETEVOQlFVTTdVVUZGU0N4TlFVRk5MRTFCUVUwc1IwRkJWeXhOUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVWQlFVVXNRMEZCUXp0UlFVVjRReXhOUVVGTkxFZEJRVWNzUjBGRFVDd3dRMEZCTUVNN1dVRkRNVU1zVjBGQlZ6dFpRVU5ZTERSRFFVRTBRenRaUVVNMVF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEhRVUZITEVOQlFVTTdXVUZETDBJc1owZEJRV2RITzFsQlEyaEhMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5d3lRa0ZCTWtJc1EwRkJReXhEUVVGRExGZEJRVmNzUTBGQlF6dFpRVU40UkN3clFrRkJLMEk3V1VGREwwSXNUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExESkNRVUV5UWl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03VVVGRmRrUXNUVUZCVFN4SlFVRkpMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzFGQlEzaEVMRTlCUVU4c1NVRkJTU3hEUVVGRE8wdEJRMkk3U1VGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlR0UlFVTldMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEYUVJN1FVRkRTQ3hEUVVGREluMD0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgaW5mbGF0ZUZldGNoIH0gZnJvbSBcIi4vZmV0Y2gvZmV0Y2guaW5mbGF0ZVwiO1xyXG5pbXBvcnQgeyBITFMgfSBmcm9tIFwiLi9ITFNcIjtcclxuaW1wb3J0IHsgb25TdGFydCB9IGZyb20gXCIuL2NoYW5uZWwvb24uY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBvbiB9IGZyb20gXCIuL2ZldGNoL29uLmZldGNoXCI7XHJcbmltcG9ydCB7IGN1cnJlbnQgfSBmcm9tIFwiLi9jaGFubmVsL2N1cnJlbnQuY2hhbm5lbFwiO1xyXG5pbXBvcnQgeyBwaWN0dXJlIH0gZnJvbSBcIi4vZmV0Y2gvcGljdHVyZS5mZXRjaFwiO1xyXG5pbXBvcnQgeyBleHRlcm5hbCB9IGZyb20gXCIuL2ZldGNoL2V4dGVybmFsLmZldGNoXCI7XHJcbmV4cG9ydCBmdW5jdGlvbiBhcHAoc2NvcGUpIHtcclxuICAgIHNjb3BlLkxvZ1ByaW50ID0gKHgpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIltQdXJwbGVdOiBcIiwgeCk7XHJcbiAgICB9O1xyXG4gICAgc2NvcGUuaXNBZHMgPSAoeCkgPT4ge1xyXG4gICAgICAgIHJldHVybiB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJzdGl0Y2hlZC1hZFwiKSB8fCB4LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJ0d2l0Y2gtY2xpZW50LWFkXCIpO1xyXG4gICAgfTtcclxuICAgIHNjb3BlLnJlYWxGZXRjaCA9IGZldGNoO1xyXG4gICAgc2NvcGUucXVhbGl0eSA9IFwiXCI7XHJcbiAgICBzY29wZS53aGl0ZWxpc3QgPSBbXTtcclxuICAgIC8vcmVjZWl2ZSBtZXNzYWdlIGZyb20gd2luZG93XHJcbiAgICBzY29wZS5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIHN3aXRjaCAoZS5kYXRhLmZ1bmNOYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJzZXRRdWFsaXR5XCI6IHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnF1YWxpdHkgPSBlLmRhdGEuYXJnc1swXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChlLmRhdGEudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIFwic2V0V2hpdGVsaXN0XCI6IHtcclxuICAgICAgICAgICAgICAgIGlmIChlLmRhdGEudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS53aGl0ZWxpc3QgPSBlLmRhdGEudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIFwic2V0UXVhbGl0eVwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5xdWFsaXR5ID0gZS5kYXRhLnZhbHVlLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgc2NvcGUucG9zdE1lc3NhZ2Uoe1xyXG4gICAgICAgIHR5cGU6IFwiaW5pdFwiLFxyXG4gICAgICAgIHZhbHVlOiBudWxsLFxyXG4gICAgfSk7XHJcbiAgICBzY29wZS5jaGFubmVsID0gW107XHJcbiAgICBzY29wZS5hY3R1YWxDaGFubmVsID0gXCJcIjtcclxuICAgIHNjb3BlLmN1cnJlbnRDaGFubmVsID0gY3VycmVudDtcclxuICAgIHNjb3BlLm5ld1BpY3R1cmUgPSBwaWN0dXJlO1xyXG4gICAgc2NvcGUubmV3RXh0ZXJuYWwgPSBleHRlcm5hbDtcclxuICAgIHNjb3BlLnR1bm5lbCA9IFtcImp1cHRlci5nYVwiLCBcImV1Lmp1cHRlci5nYVwiXTtcclxuICAgIHNjb3BlLm9uRmV0Y2ggPSBvbjtcclxuICAgIHNjb3BlLm9uU3RhcnRDaGFubmVsID0gb25TdGFydDtcclxuICAgIHNjb3BlLkhMUyA9IEhMUztcclxuICAgIGluZmxhdGVGZXRjaChzY29wZSk7XHJcbn1cclxuYXBwKHNlbGYpO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lMaTR2YzNKakwyRndjQzUwY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeFBRVUZQTEVWQlFVVXNXVUZCV1N4RlFVRkZMRTFCUVUwc2RVSkJRWFZDTEVOQlFVTTdRVUZEY2tRc1QwRkJUeXhGUVVGRkxFZEJRVWNzUlVGQlJTeE5RVUZOTEU5QlFVOHNRMEZCUXp0QlFVTTFRaXhQUVVGUExFVkJRVVVzVDBGQlR5eEZRVUZGTEUxQlFVMHNjMEpCUVhOQ0xFTkJRVU03UVVGREwwTXNUMEZCVHl4RlFVRkZMRVZCUVVVc1JVRkJSU3hOUVVGTkxHdENRVUZyUWl4RFFVRkRPMEZCUTNSRExFOUJRVThzUlVGQlJTeFBRVUZQTEVWQlFVVXNUVUZCVFN3eVFrRkJNa0lzUTBGQlF6dEJRVU53UkN4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRkxFMUJRVTBzZFVKQlFYVkNMRU5CUVVNN1FVRkRhRVFzVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4TlFVRk5MSGRDUVVGM1FpeERRVUZETzBGQlJXeEVMRTFCUVUwc1ZVRkJWU3hIUVVGSExFTkJRVU1zUzBGQlZUdEpRVU0xUWl4TFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExFTkJRVU1zUTBGQlRTeEZRVUZGTEVWQlFVVTdVVUZETVVJc1QwRkJUeXhEUVVGRExFZEJRVWNzUTBGQlF5eFpRVUZaTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1NVRkRMMElzUTBGQlF5eERRVUZETzBsQlJVWXNTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVk1zUlVGQlJTeEZRVUZGTzFGQlF6RkNMRTlCUVU4c1EwRkJReXhEUVVGRExGRkJRVkVzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zVVVGQlVTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMR3RDUVVGclFpeERRVUZETEVOQlFVTTdTVUZETTBZc1EwRkJReXhEUVVGRE8wbEJSVVlzUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUnl4TFFVRkxMRU5CUVVNN1NVRkRlRUlzUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUnl4RlFVRkZMRU5CUVVNN1NVRkRia0lzUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUnl4RlFVRkZMRU5CUVVNN1NVRkZja0lzTmtKQlFUWkNPMGxCUXpkQ0xFdEJRVXNzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhUUVVGVExFVkJRVVVzVlVGQlZTeERRVUZETzFGQlF6TkRMRkZCUVZFc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVWQlFVVTdXVUZEZGtJc1MwRkJTeXhaUVVGWkxFTkJRVU1zUTBGQlF6dG5Ra0ZEYWtJc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTTdaMEpCUTNCRExFMUJRVTA3WVVGRFVEdFpRVU5FTEU5QlFVOHNRMEZCUXl4RFFVRkRPMmRDUVVOUUxFMUJRVTA3WVVGRFVEdFRRVU5HTzFGQlJVUXNVVUZCVVN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJUdFpRVU51UWl4TFFVRkxMR05CUVdNc1EwRkJReXhEUVVGRE8yZENRVU51UWl4SlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTzI5Q1FVTm9RaXhMUVVGTExFTkJRVU1zVTBGQlV5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRE8ybENRVU5vUXp0blFrRkRSQ3hOUVVGTk8yRkJRMUE3V1VGRFJDeExRVUZMTEZsQlFWa3NRMEZCUXl4RFFVRkRPMmRDUVVOcVFpeExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXp0blFrRkRiRU1zVFVGQlRUdGhRVU5RTzFsQlEwUXNUMEZCVHl4RFFVRkRMRU5CUVVNN1owSkJRMUFzVFVGQlRUdGhRVU5RTzFOQlEwWTdTVUZEU0N4RFFVRkRMRU5CUVVNc1EwRkJRenRKUVVWSUxFdEJRVXNzUTBGQlF5eFhRVUZYTEVOQlFVTTdVVUZEYUVJc1NVRkJTU3hGUVVGRkxFMUJRVTA3VVVGRFdpeExRVUZMTEVWQlFVVXNTVUZCU1R0TFFVTmFMRU5CUVVNc1EwRkJRenRKUVVWSUxFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTI1Q0xFdEJRVXNzUTBGQlF5eGhRVUZoTEVkQlFVY3NSVUZCUlN4RFFVRkRPMGxCUTNwQ0xFdEJRVXNzUTBGQlF5eGpRVUZqTEVkQlFVY3NUMEZCVHl4RFFVRkRPMGxCUlM5Q0xFdEJRVXNzUTBGQlF5eFZRVUZWTEVkQlFVY3NUMEZCVHl4RFFVRkRPMGxCUXpOQ0xFdEJRVXNzUTBGQlF5eFhRVUZYTEVkQlFVY3NVVUZCVVN4RFFVRkRPMGxCUXpkQ0xFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4WFFVRlhMRVZCUVVNc1kwRkJZeXhEUVVGRExFTkJRVUU3U1VGRk0wTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJSeXhGUVVGRkxFTkJRVU03U1VGRGJrSXNTMEZCU3l4RFFVRkRMR05CUVdNc1IwRkJSeXhQUVVGUExFTkJRVU03U1VGRkwwSXNTMEZCU3l4RFFVRkRMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU03U1VGRmFFSXNXVUZCV1N4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wRkJRM1JDTEVOQlFVTTdRVUZEUkN4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1pZlE9PSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==