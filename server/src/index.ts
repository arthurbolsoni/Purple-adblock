import Fastify from 'fastify';
import helmet from 'fastify-helmet'
import cors from 'fastify-cors'

import { logger } from "./utils/logger";

import dotenv from "dotenv";
dotenv.config();

if (!process.env.PORT) {
  logger.warn("Port not set in .env file. Using default port 80.");
}

import { getNewHLS, getNewHLSv2 } from "./modules/twHLS";
import requestUrlByProxy from "./modules/proxyFetch";
import fetchClientId from "./modules/fetchClientId";

// @ts-ignore
import Package from "../package.json";
import { channelRequest, signatureRequest } from './types/env';
// SSL code removed: Use Nginx or Caddy with reverse_proxy instead

const port = process.env.PORT || 80;
const app = Fastify({
  logger: false,
})

const init = async () => {
  app.register(helmet);
  app.register(cors, {
    origin: "*",
  });

  app.get("/", (req, res) => {
    res.send({
      status: "ok",
      serviceName: "HLS Proxy",
      serviceVersion: Package.version,
    });
  });

  //receive the first request on twitch stream to be done proxy/vps.
  app.get("/hls/v2/sig/:links/:server", async (req: signatureRequest, res) => {
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

  app.get("/hls/v2/channel/:channelName", async (req: channelRequest, res) => {
    if (req.params.channelName == null) {
      res.status(400).send({
        success: false,
        message: "Missing channel name",
      });
      return;
    }
    try{
      
    //I thought about reducing all the unnecessary content of the requests to increase the speed, but I don't know if it was really worth it
    const hls = await getNewHLSv2(req.params.channelName.toString(), "");
    
    if (hls.valid) {
      res.header("proxystatus", "200");
      res.status(hls.status).send(hls.content);
    } else {
      res.header("proxystatus", "404");
      res.status(hls.status).send(hls.content);
    }

    }catch{

      res.status(400).send({
        success: false,
        message: "Server 500",
      });

    }
  });

  app.get("/channel/:channelName", async (req: channelRequest, res) => {
    if (req.params.channelName == null) {
      res.status(400).send({
        success: false,
        message: "Missing channel name",
      });
      return;
    }
    try {
      const result = await getNewHLS(req.params.channelName, "");

      if (result.valid) {
        res.header("proxystatus", "200");
        res.send(result.content);
      } else {
        res.header("proxystatus", "404");
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
      res.header("proxystatus", "200");
      res.send();
    } else {
      res.header("proxystatus", "404");
      res.status(503).send();
    }
  });
};

const start = async () => {
  logger.info("Fetching client ID...");
  logger.info(await fetchClientId());
  logger.info("Starting server...");
  await init();
  app.listen({ port: 80 });
  logger.info(`Server listening on port ${port} - https://127.0.0.1:${port}`);
};

start();

// process.on("unhandledRejection", (reason, p) => {
//   logger.error(["Unhandled Rejection at: Promise", p, "reason:", reason]);
// });

// process.on("uncaughtException", (err) => {
//   logger.error("Uncaught Exception:", err);
// });
