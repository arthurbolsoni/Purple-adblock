export function inflateFetch() {
  // eslint-disable-next-line no-global-assign
  global.fetch = async function (url, options) {
    if (typeof url === "string") {
      if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !global.whitelist.includes(global.actualChannel)) {
        return new Promise(function (resolve, reject) {
          var processFetch = async function (url) {
            try {
              await global.realFetch(url, options).then(function (response) {
                response.text().then(function (text) {
                  global.onFetch(global, text, url).then(function (r) {
                    var playlist = global.currentChannel().hls.getAllPlaylist();
                    resolve(new Response(playlist));
                  });
                });
              });
            } catch (e) {
              resolve(new Response());
            }
          };
          processFetch(url);
        });
      }

      if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
        return new Promise(function (resolve, reject) {
          var processFetch = async function (url) {
            await global.realFetch(url, options).then(function (response) {
              if (response.ok) {
                response.text().then(async function (text) {
                  await global.onStartChannel(global, url, text);
                  resolve(new Response(text));
                });
              } else {
                resolve(response);
                global.LogPrint("channel offline");
              }
            });
          };
          processFetch(url);
        });
      }

      if (url.includes("picture-by-picture")) {
      }
    }

    return global.realFetch.apply(this, arguments);
  };
}
