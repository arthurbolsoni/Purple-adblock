const random = require('random')
const fetch = require('node-fetch')
const HttpsProxyAgent = require('https-proxy-agent')


async function requestUrlByProxy(id, server) {
	if (id && server) {
		try {
			var ritorno = await fetch("https://video-weaver." + server.slice(0, 5) + ".hls.ttvnw.net/v1/playlist/" + id + ".m3u8", {
				agent: new HttpsProxyAgent(''),
				timeout: 4000,
				method: 'GET'
			})
			
			return await ritorno.status == 200 ? true : false;

		} catch (e) {
			return false;
		}
	}
}

module.exports = { requestUrlByProxy };