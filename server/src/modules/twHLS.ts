/* eslint-disable quotes */
// NodeJS
import fetch from "../utils/fetchWithTimeout";
import crypto from "crypto";
import HttpsProxyAgent from "https-proxy-agent";
import { logger } from "../utils/logger";
import fetchClientId from "./fetchClientId";

async function tokenSignature(
  channelName: string,
  proxy: any,
): Promise<{ token?: string; sig?: string; status?: number; content?: unknown }> {
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

  let clientId = process.env.TWITCH_CLIENT_ID;

  //maybe call .js from twitch is not a good idea because the url changes. no better change randomly?
  //default Client-ID from twitch app kimne78kx3ncx6brgo4mv6wki5h1ko
  if (!clientId) {
    logger.error("Failed to fetch client id, trying again then giving up");
    clientId = await fetchClientId();
    if (!clientId) {
      logger.error("Failed to fetch client id, giving up");
      return {
        status: 500,
        content: "Failed to fetch client id",
      };
    }
  }

  let request;
  try {
    request = await fetch(
      "https://gql.twitch.tv/gql",
      {
        // agent: null,
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
          "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
          "Device-ID": crypto.randomBytes(16).toString("hex"),
        },
      },
      4000,
    );

    const status = request.status;
    const requestJson = (await request.json()) as {
      data: {
        streamPlaybackAccessToken: {
          value: string;
          signature: string;
        };
      };
    };
    logger.info(requestJson);

    const returning: {
      token?: string;
      sig?: string;
      status?: number;
      content?: unknown;
    } = {};

    if (status == 200 && requestJson.data.streamPlaybackAccessToken !== null) {
      returning.token = requestJson.data.streamPlaybackAccessToken?.value;
      returning.sig = requestJson.data.streamPlaybackAccessToken?.signature;
    } else {
      returning.status = status;
      returning.content = requestJson;
    }
    return returning;
  } catch (error) {
    logger.error(error);
    return {
      status: 500,
      content: (error as Response).json(),
    };
  }
}

//method to work in method 1
export async function readm3u8(channelName: any, proxyUrl: string | null | HttpsProxyAgent.HttpsProxyAgentOptions) {
  const proxy = proxyUrl ? HttpsProxyAgent(proxyUrl) : null;

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

  if (r.status == 500) return r;

  try {
    const regex = /(\S+).m3u8/g;
    const list = r.content.match(regex);

    if (list != null) {
      // call the twitch stream before the user to sign it as withot ads.
      const returning = await fetch(
        list[0],
        {
          method: "GET",
        },
        4000,
      );

      return {
        status: returning.status,
        content: await returning.text(),
        valid: true,
      };
    }
  } catch {}

  return r;
}

//method to work on method 2
export async function getNewHLS(channelName: any, proxyUrl: string | HttpsProxyAgent.HttpsProxyAgentOptions) {
  const proxy = proxyUrl ? HttpsProxyAgent(proxyUrl) : null;

  // get token and signature
  const signature = await tokenSignature(channelName, proxy);
  if (signature.content != undefined) {
    return {
      status: 404,
      content: "Can't find channel",
      valid: false,
    };
  }

  logger.log(signature);

  // get stream from twitch server
  return await getStream(channelName, proxy, signature.token, signature.sig);
}

async function getStream(channelName: any, proxy: any, token?: string, sig?: string) {
  try {
    // random number 0 to 1e7 to avoid cache
    const random = Math.floor(Math.random() * 1e7);

    const request = await fetch(
      `http://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8?player=twitchweb&fast_bread=true&token=${token}&sig=${sig}&$allow_audio_only=true&allow_source=true&type=any&p=${random}`,
      {
        // agent: proxy,
        method: "GET",
      },
    );

    return {
      content: await request.text(),
      status: request.status,
      valid: true,
    };
  } catch {
    return {
      status: 500,
      content: "",
      valid: false,
    };
  }
}
