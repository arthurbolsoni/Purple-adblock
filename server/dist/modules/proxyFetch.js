"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetchWithTimeout_1 = __importDefault(require("../utils/fetchWithTimeout"));
async function requestUrlByProxy(id, server) {
    if (id && server) {
        try {
            const returning = await (0, fetchWithTimeout_1.default)("https://video-weaver." + server.slice(0, 5) + ".hls.ttvnw.net/v1/playlist/" + id + ".m3u8", {
                // This wont work because... well, there's no proxy, as well as agent's aren't supported in cross-fetch/node-fetch
                // agent: new HttpsProxyAgent(''),
                method: "GET",
            }, 4000);
            return (await returning.status) == 200 ? true : false;
        }
        catch (e) {
            return false;
        }
    }
    else {
        return false;
    }
}
exports.default = requestUrlByProxy;
