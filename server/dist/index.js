"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_helmet_1 = __importDefault(require("fastify-helmet"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const logger_1 = require("./utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.PORT) {
    logger_1.logger.warn("Port not set in .env file. Using default port 8080.");
}
const twHLS_1 = require("./modules/twHLS");
const proxyFetch_1 = __importDefault(require("./modules/proxyFetch"));
const fetchClientId_1 = __importDefault(require("./modules/fetchClientId"));
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
// SSL code removed: Use Nginx or Caddy with reverse_proxy instead
const port = process.env.PORT || 80;
const app = (0, fastify_1.default)({
    logger: false,
});
const init = async () => {
    app.register(fastify_helmet_1.default);
    app.register(fastify_cors_1.default, {
        origin: "*",
    });
    app.get("/", (req, res) => {
        res.send({
            status: "ok",
            serviceName: "HLS Proxy",
            serviceVersion: package_json_1.default.version,
        });
    });
    //receive the first request on twitch stream to be done proxy/vps.
    app.get("/hls/v2/sig/:links/:server", async (req, res) => {
        if (req.params.links == null) {
            res.status(400).send({
                success: false,
                message: "No links provided",
            });
            return;
        }
        if (req.params.server == null) {
            res.status(400).send({
                success: false,
                message: "No server provided",
            });
            return;
        }
        try {
            //receive the first request on twitch stream to be done proxy/vps.
            const url = await (0, proxyFetch_1.default)(req.params.links.toString(), req.params.server.toString());
            if (url) {
                res.status(200).send();
            }
            else {
                res.status(404).send();
            }
        }
        catch {
            res.status(400).send({
                success: false,
                message: "Server 500",
            });
        }
    });
    app.get("/hls/v2/channel/:channelName", async (req, res) => {
        if (req.params.channelName == null) {
            res.status(400).send({
                success: false,
                message: "Missing channel name",
            });
            return;
        }
        try {
            //I thought about reducing all the unnecessary content of the requests to increase the speed, but I don't know if it was really worth it
            const hls = await (0, twHLS_1.getNewHLSv2)(req.params.channelName.toString(), "");
            if (hls.valid) {
                res.header("proxystatus", "200");
                res.status(hls.status).send(hls.content);
            }
            else {
                res.header("proxystatus", "404");
                res.status(hls.status).send(hls.content);
            }
        }
        catch {
            res.status(400).send({
                success: false,
                message: "Server 500",
            });
        }
    });
    app.get("/channel/:channelName", async (req, res) => {
        if (req.params.channelName == null) {
            res.status(400).send({
                success: false,
                message: "Missing channel name",
            });
            return;
        }
        try {
            const result = await (0, twHLS_1.getNewHLS)(req.params.channelName, "");
            if (result.valid) {
                res.header("proxystatus", "200");
                res.send(result.content);
            }
            else {
                res.header("proxystatus", "404");
                res.status(result.status).send(result);
            }
        }
        catch (e) {
            logger_1.logger.error(e);
        }
    });
    //old, need to run on firefox and chrome "browser code"
    app.get("/on", (_req, res) => {
        const status = true;
        if (status) {
            res.header("proxystatus", "200");
            res.send();
        }
        else {
            res.header("proxystatus", "404");
            res.status(503).send();
        }
    });
};
const start = async () => {
    logger_1.logger.info("Fetching client ID...");
    logger_1.logger.info(await (0, fetchClientId_1.default)());
    logger_1.logger.info("Starting server...");
    await init();
    app.listen(port);
    logger_1.logger.info(`Server listening on port ${port} - https://127.0.0.1:${port}`);
};
start();
// process.on("unhandledRejection", (reason, p) => {
//   logger.error(["Unhandled Rejection at: Promise", p, "reason:", reason]);
// });
// process.on("uncaughtException", (err) => {
//   logger.error("Uncaught Exception:", err);
// });
