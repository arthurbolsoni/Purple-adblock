/* eslint-disable quotes */
// NodeJS
import fetch from "../utils/fetchWithTimeout";
import crypto from "crypto";
import HttpsProxyAgent from "https-proxy-agent";
import { logger } from "../utils/logger";
import fetchClientId from "./fetchClientId";

export async function tokenSignature(channelName: string, proxy: any) {
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

  if (!clientId) {
    logger.error("Failed to fetch client id, trying again then giving up");
    clientId = await fetchClientId();
    if (!clientId) {
      logger.error("Failed to fetch client id, giving up");
      return {
        s: 500,
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
      s?: number;
      content?: unknown;
    } = {};

    if (status == 200 && requestJson.data.streamPlaybackAccessToken !== null) {
      returning.token = requestJson.data.streamPlaybackAccessToken?.value;
      returning.sig = requestJson.data.streamPlaybackAccessToken?.signature;
    } else {
      returning.s = status;
      returning.content = requestJson;
    }
    return returning;
  } catch (error) {
    logger.error(error);
    return {
      s: 500,
      content: (error as Response).json(),
    };
  }
}

export async function readm3u8(channelName: any, proxyUrl: string | null | HttpsProxyAgent.HttpsProxyAgentOptions) {
  const proxy = proxyUrl ? HttpsProxyAgent(proxyUrl) : null;

  //twitch signature on CDN
  const signature = await tokenSignature(channelName, proxy);
  if (signature.content != undefined) {
    return {
      status: signature.s || 404,
      content: signature.s === 404 ? "Channel not found" : signature.content,
      valid: false,
    };
  }

  //twitch request on twitch server
  const r = await getStream(channelName, proxy, signature.token, signature.sig);

  if (r.status != 500) {
    try {
      const regex = /(\S+).m3u8/g;
      const list = r.content.match(regex);

      if (list != null) {
        // Unsure what this does
        const ritorno = await fetch(
          list[0],
          {
            method: "GET",
          },
          4000,
        );

        return {
          status: ritorno.status,
          content: await ritorno.text(),
          valid: true,
        };
      }
    } catch {}

    return r;
  }
  return r;
}

export async function getNewHLS(channelName: any, proxyUrl: string | HttpsProxyAgent.HttpsProxyAgentOptions) {
  const proxy = proxyUrl ? HttpsProxyAgent(proxyUrl) : null;

  // get token and signature
  const values = await tokenSignature(channelName, proxy);
  if (values.content != undefined) {
    return {
      status: 404,
      content: "Can't find channel",
      valid: false,
    };
  }

  logger.log(values);

  // get stream
  return await getStream(channelName, proxy, values.token, values.sig);
}

async function getStream(channelName: any, proxy: any, token?: string, sig?: string) {
  try {
    // random number 0 to 1e7 to avoid cache
    const rr = Math.floor(Math.random() * 1e7);

    const r = await fetch(
      `http://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8?player=twitchweb&fast_bread=true&token=${token}&sig=${sig}&$allow_audio_only=true&allow_source=true&type=any&p=${rr}`,
      {
        // agent: proxy,
        method: "GET",
      },
    );

    return {
      content: await r.text(),
      status: r.status,
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

// export default {
//   readm3u8,
//   getNewHLS,
//   tokenSignature,
// };
