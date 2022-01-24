const log = [];
let whiteList = [];
let servererror = false;

const logger = {
  logs: [],
  log: function (message) {
    const logstring = `[${new Date().toLocaleString()}]: ${message}`;
    logger.logs.push(logstring);
    console.log(logstring);
  },
};

logger.log("Initializing..");
// const server = "http://127.0.0.1:8080";
const server = "https://much.ga";
browser.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (newValue !== undefined) {
      whiteList = newValue;
      logger.log("update");
      logger.log(whiteList);
    }
  }
});

browser.storage.local.get("whiteList").then(function (items) {
  if (items.whiteList !== undefined) {
    whiteList = items.whiteList;
    logger.log("whiteList");
    logger.log(whiteList);
  }
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendResponse(log);
});

browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    {
      const match = /hls\/(\w+)\.m3u8/gim.exec(details.url);
      if (servererror == true) {
        return;
      }

      if (match !== null && match.length > 1) {
        if (whiteList.includes(match[1])) {
          return {};
        }
        logger.log("Opening: " + match[1]);

        fetch(server + "/on", {
          method: "GET",
        })
          .then((r) => {
            if (r.status == 200) {
              logger.log("Server is online");
            } else {
              servererror = true;
              logger.log("Server is offline");
            }
          })
          .catch((error) => {
            servererror = true;
            logger.log("server off");
          });

        return { redirectUrl: server + `/channel/${match[1]}` };
      }
    }
  },
  { urls: ["https://usher.ttvnw.net/api/channel/hls/*"] },
  ["blocking"],
);
browser.webRequest.onCompleted.addListener(
  function (details) {
    logger.log("url: " + details.url + "   " + details.statusCode);
    if (details.url.includes(server.split("://")[1] + "/channel")) {
      if (details.statusCode == 200) {
        consollogger.log("blocking success: " + details.statusCode);
        return;
      }
      //if the return not 200, see if exist the proxystatus. if not exist the proxystatus the server has offline.
      if (details.responseHeaders.find((x) => x.name == "proxystatus").value == 200) {
        consollogger.log("Stream Offline: " + details.statusCode);
        return;
      }

      if (details.statusCode == 404) {
        consolelogger("blocking error: " + details.statusCode);
        servererror = true;
      }
    } else if (details.url.includes("usher.ttvnw.net/api/channel/")) {
      const match = /hls\/(\w+)\.m3u8/gim.exec(details.url);

      if (match !== null && match.length > 1) {
        if (whiteList.includes(match[1])) {
          consologger.log("blocking desabled: running native");
        } else {
          logger.log("blocking error: running native" + "url: " + details.url);
        }
      }
    }
  },
  { urls: [server + "/*", "https://usher.ttvnw.net/api/channel/*"] },
  ["responseHeaders"],
);
