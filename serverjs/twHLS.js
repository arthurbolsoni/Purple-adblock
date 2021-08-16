const random = require('random')
const fetch = require('node-fetch')
const HttpsProxyAgent = require('https-proxy-agent')

function makeid(length) {
	var result = [];
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result.push(characters.charAt(Math.floor(Math.random() *
			charactersLength)));
	}
	return result.join('');
}

async function tokenSignature(channelName, proxy) {
		request = '{"operationName":"PlaybackAccessToken","extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}},"variables":{"isLive":true,"login":"' + channelName + '","isVod":false,"vodID":"","playerType":"site"}}'; //"playerType":"embed"

		var r = await fetch("https://gql.twitch.tv/gql", {
			agent: null,
			timeout: 4000,
			method: 'POST',
			body: request,
			headers: {
				'Client-ID': "kimne78kx3ncx6brgo4mv6wki5h1ko",
				'Device-ID': makeid(32)
			}
		});

		var status = r.status;
		var r = await r.json();
		
		return status == "200" ? (r['data']['streamPlaybackAccessToken'] != null ? {token: r['data']['streamPlaybackAccessToken']['value'], sig: r['data']['streamPlaybackAccessToken']['signature']} : {content: r, s: status}) : {content: r, s: status};
}

async function readm3u8(channelName, proxyUrl) {

	proxy = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

	//twitch signature on CDN
	var values = await tokenSignature(channelName, proxy);
	if(values.content != undefined){
		return ["Can not find channel", 404, true];
	}
	//twitch request on twitch server
	var r = await getStream(channelName, proxy, values.token, values.sig);

	if(r[1] != 500){
		try{
			let regex = /(\S+).m3u8/g;
			var list = r[0].match(regex);
			var ritorno = await fetch(list[0], {
				agent: null,
				timeout: 4000,
				method: 'GET'
			}).then((x)=>{})

		}catch{

		}
		return r
	}
	return r
}


async function getNewHLS(channelName, proxyUrl) {
	proxy = proxyUrl ? new HttpsProxyAgent(proxyUrl) : null;

	//twitch signature on CDN
	var values = await tokenSignature(channelName, proxy);
	if(values.content != undefined){
		return ["Can not find channel", 404, true];
	}
	//twitch request on twitch server
	var ritorno = await getStream(channelName, proxy, values.token, values.sig);

	return ritorno;
}

async function getStream(channelName, proxy, token, sig) {
	try{
		rr = random.int(0, 1E7);

		var r = await fetch(`http://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8?player=twitchweb&fast_bread=true&token=${token}&sig=${sig}&$allow_audio_only=true&allow_source=true&type=any&p=${rr}`, {
			agent: proxy,
			timeout: 5000,
			method: 'GET'
		});


		return [await r.text(), r.status, true];
	} catch {
		return [await "offline :(", 500, false];
	}
}

module.exports = { getNewHLS, readm3u8 };