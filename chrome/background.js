let whiteList = [];
let servererror = false;
let version1 = true;

let servertwitch = "";

const logger = {
  logs: [],
  log: function (message) {
    const logstring = `[${new Date().toLocaleString()}]: ${message}`;
    logger.logs.push(logstring);
    console.log(logstring);
  },
};

logger.log("Initializing..");

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key == "whiteList") {
      whiteList = newValue;
      logger.log(whiteList);
    }

    if (key == "settings") {
      version1 = newValue[0];
      logger.log(newValue);
    }
  }
});

chrome.storage.local.get(["whiteList", "settings"], function (items) {
  if (items.whiteList !== undefined) {
    whiteList = items.whiteList;
    logger.log(whiteList);
  }
  if (items.settings !== undefined) {
    settings = items.settings;
    version1 = settings[0];
  } else {
    version1 = false;
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendResponse(log);
});

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (!details.url.includes("usher.ttvnw.net/api/channel/hls/")) {
      return {
        cancel: true,
      };
    }

    if (!version1) {
      logger.log("v1 = false");
      return;
    }

    if (servererror == true) {
      return { redirectUrl: details.url };
    }

    const match = /hls\/(\w+)\.m3u8/gim.exec(details.url);

    if (match !== null && match.length > 1) {
      if (whiteList.includes(match[1])) {
        return { redirectUrl: details.url };
      }

      logger.log("Opening: " + match[1]);

      fetch(server + "/on", {
        method: "GET",
      })
        .then((r) => {
          if (r.status !== 200) {
            servererror = true;
            logger.log("Server is offline");
          }
          logger.log("Server is online");
        })
        .catch((error) => {
          servererror = true;
          logger.log("Server is offline");
        });

      return { redirectUrl: server + `/channel/${match[1]}` };
    }
  },
  {
    urls: [
      "https://*.amazon-adsystem.com/*",
      "https://cdn.krxd.net/*",
      "https://script.ioam.de/iam.js",
      "https://edge.quantserve.com/quant.js",
      "https://ddacn6pr5v0tl.cloudfront.net/*",
      "https://d2v02itv0y9u9t.cloudfront.net/dist/1.0.5/v6s.js",
      "https://*.imrworldwide.com/*",
      "https://countess.twitch.tv/*",
      "https://*.scorecardresearch.com/*",
      "https://www.googletagservices.com/tag/js/gpt.js",
      "*://*.branch.io/*",
      "*://comscore.com/*",
      "https://usher.ttvnw.net/api/channel/hls/*",
    ],
  },
  ["blocking", "extraHeaders"],
);

chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (!version1) {
      return;
    }
    if (details.url.includes("abs.hls.ttvnw.net/")) {
      return;
    }
    if (details.url.includes("jupter.ga/on")) {
      return;
    }

    if (details.url.includes("hls.ttvnw.net/")) {
      var regex = /(?:^https?:\/\/([^/]+)(?:[/,]|$)|^(.*)$)/;
      const match = regex.exec(details.url)[1];

      if (!servertwitch.includes(match)) {
        logger.log("twitch server: " + match);
        servertwitch += match;
      }
      return;
    }
    logger.log("url: " + details.url + "   " + details.statusCode);
    if (details.url.includes("jupter.ga/channel")) {
      if (details.statusCode == 200) {
        logger.log("blocking success: " + details.statusCode);
        return;
      }

      //if the proxystatus if 404, the server proxy is offline so the extension turn off
      if (details.responseHeaders.find((x) => x.name == "proxystatus").value == 404) {
        logger.log("blocking error: " + details.statusCode);
        servererror = true;
        return {
          cancel: true,
        };
      }

      //if the return of the twitch is 404 the stream is offline or not found
      if (details.statusCode == 404) {
        logger.log("Stream Offline: " + details.statusCode);
        return;
      }
    } else if (details.url.includes("usher.ttvnw.net/api/channel/")) {
      const match = /hls\/(\w+)\.m3u8/gim.exec(details.url);

      if (match !== null && match.length > 1) {
        if (whiteList.includes(match[1])) {
          logger.log("blocking desabled: running native");
        } else {
          logger.log("blocking error: running native" + "url: " + details.url);
        }
      } else {
        logger.log("blocking error: running native" + "url: " + details.url);
      }
    }
  },
  { urls: [server + "/*", "https://*.hls.ttvnw.net/*", "https://usher.ttvnw.net/api/channel/*"] },
  ["responseHeaders"],
);

chrome.runtime.onInstalled.addListener(function (details) {
  switch (details.reason) {
    case "install":
      chrome.storage.local.set({ ["settings"]: [true, false] });
      break;
    case "update":
      // First run after an update
      break;
  }
});
