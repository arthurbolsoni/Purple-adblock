export function inflateFetch(_window) {
    // eslint-disable-next-line no-global-assign
    _window.fetch = async function (url, options) {
            if (typeof url === 'string') {
                if (url.endsWith('.ts')) {
                    //var p = channel.find(x => x.name === actualChannel).hls.getPlaylistByUrl(url);
                    //var pp = channel.find(x => x.name === actualChannel).hls.getAllPlaylist();

                    //LogPrint("ts timestamp: " + p[0].timestamp);
                }

                if (url.endsWith('m3u8') && url.includes('ttvnw.net') && !_window.whitelist.includes(_window.actualChannel)) {
                    console.log(url);
                    return new Promise(function (resolve, reject) {
                        var processFetch = async function (url) {
                            // await onBeforeFetch(url);
                            await _window.realFetch(url, options).then(function (response) {
                                response.text().then(function (text) {
                                    _window.onFetch(text, url).then(function (r) {
                                        var p = _window.channel.find(x => x.name === _window.actualChannel).hls.getAllPlaylist();
                                        resolve(new Response(p));
                                    });
                                });
                            })
                        };
                        processFetch(url);
                    });
                }

                if (url.includes("usher.ttvnw.net/api/channel/hls/") && !url.includes('picture-by-picture')) {
                    console.log(url);
                    return new Promise(function (resolve, reject) {
                        var processFetch = async function (url) {
                            await _window.realFetch(url, options).then(function (response) {
                                if (response.ok) {
                                    response.text().then(async function (text) {
                                        console.log("ccccccccccccccccccccccccccccccccccccccccccc")
                                        await _window.onStartChannel(_window, url, text);
                                        resolve(new Response(text));
                                    });
                                } else {
                                    resolve(response);
                                    _window.LogPrint("channel offline");
                                }
                            })
                        };
                        processFetch(url);
                    });
                }

                if (url.includes('picture-by-picture')) {
                }

            }      
            
            return _window.realFetch.apply(this, arguments);
        }
    }