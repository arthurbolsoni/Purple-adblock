"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewHLS = exports.getNewHLSv2 = void 0;
/* eslint-disable quotes */
// NodeJS
const fetchWithTimeout_1 = __importDefault(require("../utils/fetchWithTimeout"));
const logger_1 = require("../utils/logger");
function makeid(length) {
    var result = [];
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}
async function tokenSignature(channelName, proxy) {
    const requestBody = {
        operationName: "PlaybackAccessToken",
        variables: {
            isLive: true,
            login: channelName,
            isVod: false,
            vodID: "",
            playerType: "site",
        },
        extensions: {
            persistedQuery: {
                version: 1,
                sha256Hash: "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712",
            },
        },
    };
    // let clientId = process.env.TWITCH_CLIENT_ID;
    // //maybe call .js from twitch is not a good idea because the url changes. no better change randomly?
    // //default Client-ID from twitch app kimne78kx3ncx6brgo4mv6wki5h1ko
    // if (!clientId) {
    //   logger.error("Failed to fetch client id, trying again then giving up");
    //   clientId = await fetchClientId();
    //   if (!clientId) {
    //     logger.error("Failed to fetch client id, giving up");
    //     return {
    //       status: 500,
    //       content: "Failed to fetch client id",
    //     };
    //   }
    // }
    let request;
    try {
        request = await (0, fetchWithTimeout_1.default)("https://gql.twitch.tv/gql", {
            // agent: null,
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                "Content-Type": "application/json",
                "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
                "Device-ID": makeid(32),
            },
        }, 10000);
        const status = request.status;
        const requestJson = (await request.json());
        logger_1.logger.info(requestJson);
        const returning = {};
        if (status == 200 && requestJson.data.streamPlaybackAccessToken !== null) {
            returning.token = requestJson.data.streamPlaybackAccessToken?.value;
            returning.sig = requestJson.data.streamPlaybackAccessToken?.signature;
        }
        else {
            returning.status = status;
            returning.content = requestJson;
        }
        return returning;
    }
    catch (error) {
        logger_1.logger.error(error);
        logger_1.logger.error(requestBody);
        return {
            status: 500,
            content: error.json(),
        };
    }
}
//method to work in method 1
async function getNewHLSv2(channelName, proxyUrl) {
    const proxy = null;
    //twitch signature on CDN
    const signature = await tokenSignature(channelName, proxy);
    if (signature.content != undefined) {
        return {
            status: signature.status || 404,
            content: signature.status === 404 ? "Channel not found" : signature.content,
            valid: false,
        };
    }
    //twitch request on twitch server
    const r = await getStream(channelName, proxy, signature.token, signature.sig);
    if (r.status == 500)
        return r;
    try {
        const regex = /(\S+).m3u8/g;
        const list = r.content.match(regex);
        if (list != null) {
            // call the twitch stream before the user to sign it as withot ads.
            const returning = await (0, fetchWithTimeout_1.default)(list[0], {
                method: "GET",
            }, 4000);
            return r;
        }
    }
    catch { }
    return r;
}
exports.getNewHLSv2 = getNewHLSv2;
//method to work on method 2
async function getNewHLS(channelName, proxyUrl) {
    const proxy = null;
    // get token and signature
    const signature = await tokenSignature(channelName, proxy);
    if (signature.content != undefined) {
        return {
            status: 404,
            content: "Can't find channel",
            valid: false,
        };
    }
    // get stream from twitch server
    return await getStream(channelName, proxy, signature.token, signature.sig);
}
exports.getNewHLS = getNewHLS;
async function getStream(channelName, proxy, token, sig) {
    try {
        // random number 0 to 1e7 to avoid cache
        const random = Math.floor(Math.random() * 1e7);
        const request = await (0, fetchWithTimeout_1.default)(`http://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8?player=twitchweb&fast_bread=true&token=${token}&sig=${sig}&$allow_audio_only=true&allow_source=true&type=any&p=${random}`, {
            // agent: proxy,
            method: "GET",
        });
        return {
            content: await request.text(),
            status: request.status,
            valid: true,
        };
    }
    catch {
        return {
            status: 500,
            content: "",
            valid: false,
        };
    }
}
