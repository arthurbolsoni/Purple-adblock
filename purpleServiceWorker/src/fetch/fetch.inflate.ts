export function inflateFetch(_window) {
  // eslint-disable-next-line no-global-assign
  _window.fetch = async function (url, options) {
    if (typeof url === "string") {
      if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !_window.whitelist.includes(_window.actualChannel)) {
        return new Promise(function (resolve, reject) {
          var processFetch = async function (url) {
            try {
              await _window.realFetch(url, options).then(function (response) {
                response.text().then(function (text) {
                  _window.onFetch(_window, text, url).then(function (r) {
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
            await _window.realFetch(url, options).then(function (response) {
              if (response.ok) {
                response.text().then(async function (text) {
                  await _window.onStartChannel(_window, url, text);
                  resolve(new Response(text));
                });
              } else {
                resolve(response);
                _window.LogPrint("channel offline");
              }
            });
          };
          processFetch(url);
        });
      }

      if (url.includes("picture-by-picture")) {
      }
    }

    return _window.realFetch.apply(this, arguments);
  };
}
