export function inflateFetch() {
  // eslint-disable-next-line no-global-assign
  global.fetch = async function (url, options) {
    if (typeof url === "string") {
      if (url.endsWith("m3u8") && url.includes("ttvnw.net") && !global.whitelist.includes(global.actualChannel)) {
        return new Promise(async (resolve, reject) => {
          try {
            await global.realFetch(url, options)
              .then(async response => (response.text()))
              .then(async text => {
                //send the flow stream to script valitor and classificator
                await global.onFetch(global, text, url);

                var playlist = global.currentChannel().hls.getAllPlaylist();
                resolve(new Response(playlist));
              });
          } catch {
            resolve(new Response());
          }
        });
      }

      if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes("picture-by-picture")) {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await global.realFetch(url, options);
            if (!response.ok){
              resolve(response)
              global.LogPrint("channel offline");
            }
            
            response.text().then(async text => {
              await global.onStartChannel(global, url, text);
              resolve(new Response(text));
            });
          } catch {
            resolve(new Response());
          }
        });
      }

      if (url.includes("picture-by-picture")) {
      }
    }

    return global.realFetch.apply(this, arguments);
  };
}
