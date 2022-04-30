import { FastifyRequest } from "fastify";

declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    NODE_ENV: "development" | "production";
    TWITCH_CLIENT_ID: string;
    PROXY_URL: string;
  }
  
}

export type signatureRequest = FastifyRequest<{
  Params: { links: string, server: string },
}>

export type channelRequest = FastifyRequest<{
  Params: { channelName: string},
}>
