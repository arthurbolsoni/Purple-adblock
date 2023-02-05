// ==UserScript==
// @name         Purple Adblocker
// @source       https://github.com/arthurbolsoni/Purple-adblock
// @version      2.5.1
// @description  Per aspera ad astra
// @author       ArthurBolzoni
// @downloadURL  https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/tampermonkey/dist/purpleadblocker.user.js
// @updateURL    https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/tampermonkey/dist/purpleadblocker.user.js
// @match        *://*.twitch.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(()=>{"use strict";var t={114:function(t,e,n){var r=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0});const s=r(n(597));!function(){let t;window.Worker=class extends Worker{constructor(e){console.log("new worker intance "+e),""==e&&super(e),console.log("[Purple]: init "+e);const n=`${s.default}\n      importScripts('${e}');`;super(URL.createObjectURL(new Blob([n],{type:"text/javascript"}))),t=this,t.declareEventWorker(),t.declareEventWindow()}declareEventWorker(){this.addEventListener("message",(e=>{var n,r,s,i,a;switch(null===(n=null==e?void 0:e.data)||void 0===n?void 0:n.type){case"getSettings":window.postMessage({type:"getSettings",value:null});break;case"PlayerQualityChanged":t.postMessage({funcName:"setQuality",value:e.data.arg.name});break;case"pause":t.postMessage({funcName:"pause",args:void 0,id:1});break;case"play":t.postMessage({funcName:"play",args:void 0,id:1})}switch(null===(s=null===(r=null==e?void 0:e.data)||void 0===r?void 0:r.arg)||void 0===s?void 0:s.key){case"quality":if(!e.data.arg.value.name)break;console.log("Changed quality by player: "+e.data.arg.value.name),t.postMessage({funcName:"setQuality",value:e.data.arg.value.name});break;case"state":t.postMessage({funcName:e.data.arg.value})}null===(a=null===(i=null==e?void 0:e.data)||void 0===i?void 0:i.arg)||void 0===a||a.name}))}declareEventWindow(){window.addEventListener("message",(e=>{"setSettings"===e.data.type&&t.postMessage({funcName:"setSettings",value:e.data.value})}))}}}()},597:t=>{t.exports='(()=>{"use strict";var t={799:function(t,e,n){var r=this&&this.__decorate||function(t,e,n,r){var i,s=arguments.length,o=s<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,n):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,n,r);else for(var a=t.length-1;a>=0;a--)(i=t[a])&&(o=(s<3?i(o):s>3?i(e,n,o):i(e,n))||o);return s>3&&o&&Object.defineProperty(e,n,o),o},i=this&&this.__awaiter||function(t,e,n,r){return new(n||(n=Promise))((function(i,s){function o(t){try{l(r.next(t))}catch(t){s(t)}}function a(t){try{l(r.throw(t))}catch(t){s(t)}}function l(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(o,a)}l((r=r.apply(t,e||[])).next())}))};Object.defineProperty(e,"__esModule",{value:!0}),e.appController=void 0;const s=n(289),o=n(35);let a=class{constructor(t){this.appService=t,this.getSettings=()=>n.g.postMessage({type:"getSettings"}),this.getSettings()}onChannel(t,e){return i(this,void 0,void 0,(function*(){const r=yield n.g.request(t,e);if(!r.ok)return console.log("Error on channel load"),r;const i=yield r.text();return yield this.appService.onStartChannel(t),new Response(i)}))}onFetch(t,e){return i(this,void 0,void 0,(function*(){const n=yield(yield request(t,e)).text(),r=yield this.appService.onFetch(n);return new Response(r)}))}onChannelPicture(t,e){return i(this,void 0,void 0,(function*(){return new Response}))}setSettings(t){return i(this,void 0,void 0,(function*(){this.appService.setSettings(t)}))}setQuality(t){return i(this,void 0,void 0,(function*(){this.appService.quality=t.value}))}};r([(0,o.Fetch)("usher.ttvnw.net/api/channel/hls/","picture-by-picture")],a.prototype,"onChannel",null),r([(0,o.Fetch)("hls.ttvnw.net/v1/playlist/")],a.prototype,"onFetch",null),r([(0,o.Fetch)("picture-by-picture")],a.prototype,"onChannelPicture",null),r([(0,o.Message)("setSettings")],a.prototype,"setSettings",null),r([(0,o.Message)("setQuality")],a.prototype,"setQuality",null),a=r([(0,s.Controller)()],a),e.appController=a},37:function(t,e,n){var r=this&&this.__awaiter||function(t,e,n,r){return new(n||(n=Promise))((function(i,s){function o(t){try{l(r.next(t))}catch(t){s(t)}}function a(t){try{l(r.throw(t))}catch(t){s(t)}}function l(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(o,a)}l((r=r.apply(t,e||[])).next())}))};Object.defineProperty(e,"__esModule",{value:!0});const i=n(799),s=n(651);function o(){n.g.logPrint=t=>console.log("[Purple]: ",t),n.g.appController=new i.appController(new s.Player),n.g.logPrint("Script running")}e.default=o,n.g.request=n.g.fetch,n.g.fetch=(t,e)=>r(void 0,void 0,void 0,(function*(){if("string"==typeof t)for(var i=0,s=routerList.length;i<s;i++)if(t.includes(routerList[i].match)&&!t.includes(routerList[i].ignore))return new Promise(((s,o)=>r(void 0,void 0,void 0,(function*(){return s(yield n.g.appController[routerList[i].propertyKey](t,e))}))));return n.g.request.apply(this,[t,e])})),n.g.addEventListener("message",(t=>{n.g.messageList.forEach((e=>{t.data.funcName==e.match&&n.g.appController[e.propertyKey](t.data)}))})),o()},289:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Controller=void 0,e.Controller=()=>t=>{}},35:(t,e,n)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Message=e.Fetch=void 0,e.Fetch=(t,e=null)=>(r,i)=>{n.g.routerList||(n.g.routerList=[]),n.g.routerList.push({propertyKey:i,match:t,ignore:e})},e.Message=t=>(e,r)=>{n.g.messageList||(n.g.messageList=[]),n.g.messageList.push({propertyKey:r,match:t})}},651:function(t,e,n){var r=this&&this.__awaiter||function(t,e,n,r){return new(n||(n=Promise))((function(i,s){function o(t){try{l(r.next(t))}catch(t){s(t)}}function a(t){try{l(r.throw(t))}catch(t){s(t)}}function l(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(o,a)}l((r=r.apply(t,e||[])).next())}))};Object.defineProperty(e,"__esModule",{value:!0}),e.Player=void 0;const i=n(770),s=n(938);e.Player=class{constructor(){this.streamList=[],this.actualChannel="",this.playingAds=!1,this.quality="",this.setSettings=t=>{var e,n,r;this.setting=t,(null===(e=this.setting)||void 0===e?void 0:e.toggleProxy)&&(null===(n=this.setting)||void 0===n?void 0:n.proxyUrl)&&(this.currentStream().currentTunnel=null===(r=this.setting)||void 0===r?void 0:r.proxyUrl),logPrint("Settings set")},this.getQuality=()=>n.g.postMessage({type:"getQuality"}),this.getSettings=()=>n.g.postMessage({type:"getSettings"}),this.pause=()=>n.g.postMessage({type:"pause"}),this.play=()=>n.g.postMessage({type:"play"}),this.pauseAndPlay=()=>{this.pause(),this.play()},this.onStartAds=()=>{console.log("ads started"),this.pauseAndPlay()},this.onEndAds=()=>{console.log("ads ended"),this.pauseAndPlay(),this.pauseAndPlay()},this.isAds=(t,e=!1)=>{const n=t.toString().includes("stitched");return e?(0==this.playingAds&&this.playingAds!=n&&this.onStartAds(),1==this.playingAds&&this.playingAds!=n&&this.onEndAds(),this.playingAds=n,this.playingAds):n},this.currentStream=(t=this.actualChannel)=>this.streamList.find((e=>e.channelName===t))}isWhitelist(){var t,e,n;return!!(null===(t=this.setting)||void 0===t?void 0:t.whitelist)&&(null===(n=null===(e=this.setting)||void 0===e?void 0:e.whitelist)||void 0===n?void 0:n.includes(this.actualChannel))}onFetch(t){return r(this,void 0,void 0,(function*(){if(this.isWhitelist())return t;if(!this.isAds(t,!0))return t;const e=yield this.fetchm3u8ByStreamType(s.StreamType.EMBED);if(e||this.currentStream().CreateStreamAccess(s.StreamType.EMBED),e)return e;return(yield this.fetchm3u8ByStreamType(s.StreamType.EXTERNAL))||(console.log("All stream types failed"),t)}))}fetchm3u8ByStreamType(t){return r(this,void 0,void 0,(function*(){logPrint("Stream Type: "+t);const e=this.currentStream().getStreamServersByStreamType(t,this.quality);for(const t of e){const e=yield(yield n.g.request(null==t?void 0:t.url)).text();if(!this.isAds(e))return e}return null}))}onStartChannel(t){return r(this,void 0,void 0,(function*(){const e=/hls\\/(.*).m3u8/gm.exec(t)||[];logPrint("Loading channel",e[1]),this.actualChannel=e[1];const n=new i.Stream(this.actualChannel);n.CreateStreamAccess(s.StreamType.EXTERNAL),this.streamList.push(n)}))}}},938:(t,e)=>{var n;Object.defineProperty(e,"__esModule",{value:!0}),e.StreamType=void 0,(n=e.StreamType||(e.StreamType={})).PICTURE="thunderdome",n.EMBED="embed",n.FRONTPAGE="frontpage",n.SITE="site",n.EXTERNAL="external",n.DNS="dns"},503:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Server=e.StreamUrl=void 0,e.StreamUrl=class{constructor(){this.url="",this.quality=""}},e.Server=class{constructor(t){this.bestQuality=()=>this.urlList[0],this.findByQuality=t=>this.urlList.find((e=>e.quality==t)),Object.assign(this,t)}}},770:function(t,e,n){var r=this&&this.__awaiter||function(t,e,n,r){return new(n||(n=Promise))((function(i,s){function o(t){try{l(r.next(t))}catch(t){s(t)}}function a(t){try{l(r.throw(t))}catch(t){s(t)}}function l(t){var e;t.done?i(t.value):(e=t.value,e instanceof n?e:new n((function(t){t(e)}))).then(o,a)}l((r=r.apply(t,e||[])).next())}))};Object.defineProperty(e,"__esModule",{value:!0}),e.Stream=void 0;const i=n(938),s=n(503);e.Stream=class{constructor(t){this.serverList=[],this.tunnelList=["https://eu1.jupter.ga/channel/{channelname}"],this.channelName=t,this.currentTunnel=this.tunnelList[0]}createServer(t,e="local",n=!0){const r=[];let i;const o=/NAME="((?:\\S+\\s+\\S+|\\S+))",AUTO(?:^|\\S+\\s+)(?:^|\\S+\\s+)(https:\\/\\/video(\\S+).m3u8)/g;for(;null!==(i=o.exec(t));)r.push({quality:i[1],url:i[2]});const a=new s.Server({type:e,urlList:r,sig:n});this.serverList.push(a)}externalRequest(t=!1){return r(this,void 0,void 0,(function*(){t&&(this.currentTunnel=this.tunnelList[0]),logPrint("External Server: Loading");try{const t=yield n.g.request(this.currentTunnel.replace("{channelname}",this.channelName));return t.ok||logPrint("Server proxy return error",this.currentTunnel,t.status),this.createServer(yield t.text(),i.StreamType.EXTERNAL),logPrint("External Server: OK"),!0}catch(t){return logPrint("Server proxy return error",this.currentTunnel,t),!1}}))}CreateStreamAccess(t){return r(this,void 0,void 0,(function*(){if(t==i.StreamType.EXTERNAL)return this.externalRequest()||this.externalRequest(!0),!1;try{const e={operationName:"PlaybackAccessToken",variables:{isLive:!0,login:this.channelName,isVod:!1,vodID:"",playerType:t},extensions:{persistedQuery:{version:1,sha256Hash:"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}},r=yield n.g.request("https://gql.twitch.tv/gql",{method:"POST",headers:{Host:"gql.twitch.tv","Client-ID":"kimne78kx3ncx6brgo4mv6wki5h1ko"},body:JSON.stringify(e)}),i=yield r.json(),s="https://usher.ttvnw.net/api/channel/hls/"+this.channelName+".m3u8?allow_source=true&fast_bread=true&p="+Math.floor(1e7*Math.random())+"&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig="+i.data.streamPlaybackAccessToken.signature+"&supported_codecs=avc1&token="+i.data.streamPlaybackAccessToken.value,o=yield(yield n.g.request(s)).text();return logPrint("Server loaded "+t),this.createServer(o,t),!0}catch(t){return console.log(t),!1}}))}getStreamServersByStreamType(t,e){const n=this.serverList.filter((e=>e.type==t));if(!n)return[];const r=n.map((t=>t.findByQuality(e))).filter((t=>void 0!==t));return r.length?r:n.map((t=>t.bestQuality()))}}}},e={};function n(r){var i=e[r];if(void 0!==i)return i.exports;var s=e[r]={exports:{}};return t[r].call(s.exports,s,s.exports,n),s.exports}n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),n(37)})();'}},e={};!function n(r){var s=e[r];if(void 0!==s)return s.exports;var i=e[r]={exports:{}};return t[r].call(i.exports,i,i.exports,n),i.exports}(114)})();