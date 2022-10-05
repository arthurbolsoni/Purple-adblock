"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const url = "https://static.twitchcdn.net/assets/core-fc4fce6327f604c4358d.js";
let allowed = true;
const clientId = "";
async function default_1() {
    if (!allowed) {
        return clientId;
    }
    resetTimeout();
    return fetchTwitchClientId();
}
exports.default = default_1;
async function fetchTwitchClientId() {
    const regex = /clientID:"(.{0,32})",cookieName:"twilight-user"/;
    const r = await (0, cross_fetch_1.default)(url);
    const content = await r.text();
    const match = regex.exec(content);
    if (match != null) {
        process.env.TWITCH_CLIENT_ID = match[1];
        return match[1];
    }
    else {
        return "";
    }
}
function resetTimeout() {
    setTimeout(() => {
        allowed = true;
    }, 60 * 1000);
}
