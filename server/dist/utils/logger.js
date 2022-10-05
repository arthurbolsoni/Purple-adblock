"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = require("pino");
/**
 * Creates a new pino logger
 */
const pinoOptions = {
    transport: {
        target: "pino-pretty",
        options: {
            translateTime: "yyyy-mm-dd HH:MM:ss",
            colorize: true,
        },
    },
};
exports.logger = (0, pino_1.pino)(process.env.NODE_ENV === "production" ? {} : pinoOptions);
