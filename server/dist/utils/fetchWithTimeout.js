"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
// import type { RequestInfo, RequestInit, Response } from "cross-fetch";
function default_1(url, options, timeout = 7000) {
    return Promise.race([(0, cross_fetch_1.default)(url, options), new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout))]);
}
exports.default = default_1;
