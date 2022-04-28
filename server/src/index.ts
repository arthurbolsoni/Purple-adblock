// TODO: Switch to Fastify, especially if this extension is going to be recieves lots of requests. (https://www.fastify.io/)
import express from "express";
import helmet from "helmet";
import cors from "cors";

import { logger } from "./utils/logger";
import expressPino from "express-pino-logger";

import dotenv from "dotenv";
dotenv.config();

if (!process.env.PORT) {
  logger.warn("Port not set in .env file. Using default port 8080.");
}

import { getNewHLS, readm3u8 } from "./modules/twHLS";
import requestUrlByProxy from "./modules/proxyFetch";
import fetchClientId from "./modules/fetchClientId";

// @ts-ignore
import Package from "../package.json";
// SSL code removed: Use Nginx or Caddy with reverse_proxy instead

const port = process.env.PORT || 8080;
const app = express();

const init = async () => {
  if (process.env.NODE_ENV === "development") {
    app.use(expressPino({ logger }));
  }
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: "*",
      allowedHeaders: "*",
      exposedHeaders: "*",
    }),
  );

  app.disable("x-powered-by");
  app.disable("etag");

  app.get("/", (req, res) => {
    res.send({
      status: "ok",
      serviceName: "HLS Proxy",
      serviceVersion: Package.version,
    });
  });

  app.use((_req, res, next) => {
    res.removeHeader("Connection");
    res.removeHeader("Date");
    res.removeHeader("X-DNS-Prefetch-Control");
    next();
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

    try{

    //receive the first request on twitch stream to be done proxy/vps.
    const url = await requestUrlByProxy(req.params.links.toString(), req.params.server.toString());
    if (url) {
      res.status(200).send();
    } else {
      res.status(404).send();
    }
    }catch{
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
    try{
      
    //I thought about reducing all the unnecessary content of the requests to increase the speed, but I don't know if it was really worth it
    const hls = await getNewHLS(req.params.channelName.toString(), "");
    if (hls.valid) {
      if (hls.status == 200) {
        let m;
        const HlsRegex = /RESOLUTION=(\S+),C(?:^|\S+\s+\S+)video-weaver.(\S+).hls.ttvnw.net\/v1\/playlist\/(\S+).m3u8/g;
        while ((m = HlsRegex.exec(hls.content)) !== null) {
          await requestUrlByProxy(m[3], m[1]);
        }
      }

      res.set("proxystatus", "200");
      res.status(hls.status).send(hls.content);
    } else {
      res.set("proxystatus", "404");
      res.status(hls.status).send(hls.content);
    }

    }catch{

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
      const result = await readm3u8(req.params.channelName, null);

      if (result.valid) {
        res.set("proxystatus", "200");
        res.send(result.content);
      } else {
        res.set("proxystatus", "404");
        res.status(result.status).send(result);
      }
    } catch (e) {
      logger.error(e);
    }
  });

  //old, need to run on firefox and chrome "browser code"
  app.get("/on", (_req, res) => {
    const status = true;
    if (status) {
      res.set("proxystatus", "200");
      res.send();
    } else {
      res.set("proxystatus", "404");
      res.status(503).send();
    }
  });
};

const start = async () => {
  logger.info("Fetching client ID...");
  logger.info(await fetchClientId());
  logger.info("Starting server...");
  await init();
  app.listen(port);
  logger.info(`Server listening on port ${port} - https://127.0.0.1:${port}`);
};

start();

// process.on("unhandledRejection", (reason, p) => {
//   logger.error(["Unhandled Rejection at: Promise", p, "reason:", reason]);
// });

// process.on("uncaughtException", (err) => {
//   logger.error("Uncaught Exception:", err);
// });
