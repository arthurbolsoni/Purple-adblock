// ==UserScript==
// @name         Purple Adblocker
// @source       https://github.com/arthurbolsoni/Purple-adblock
// @version      2.6.6
// @description  Per aspera ad astra
// @author       ArthurBolzoni
// @downloadURL  https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/platform/tampermonkey/dist/purpleadblocker.user.js
// @updateURL    https://raw.githubusercontent.com/arthurbolsoni/Purple-adblock/main/platform/tampermonkey/dist/purpleadblocker.user.js
// @match        *://*.twitch.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

const u='var t=Object.defineProperty,e=(e,s,i)=>((e,s,i)=>s in e?t(e,s,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[s]=i)(e,"symbol"!=typeof s?s+"":s,i);const s=(t,e=null)=>(s,i)=>{self.routerList||(self.routerList=[]),self.routerList.push({propertyKey:i,match:t,ignore:e})},i=t=>(e,s)=>{self.addEventListener("message",(e=>{var i;(null==(i=null==e?void 0:e.data)?void 0:i.funcName)==t&&self.appController[s](e.data)}))};var r=(t=>(t.PICTURE="picture-by-picture",t.THUNDERDOME="thunderdome",t.EMBED="embed",t.FRONTPAGE="frontpage",t.SITE="site",t.EXTERNAL="external",t.DNS="dns",t))(r||{}),a=Object.defineProperty,n=Object.getOwnPropertyDescriptor,o=(t,e,s,i)=>{for(var r,o=i>1?void 0:i?n(e,s):e,u=t.length-1;u>=0;u--)(r=t[u])&&(o=(i?r(e,s,o):r(o))||o);return i&&o&&a(e,s,o),o};let u=class{constructor(t){e(this,"getSettings",(()=>self.postMessage({type:"getSettings"}))),this.appService=t,this.getSettings()}async setIntegrity(t){this.appService.setIntegrityToken(JSON.parse(t.value).token)}async onChannel(t,e){const s=await self.request(t,e);if(!s.ok)return console.log("Error on channel load"),s;const i=await s.text(),r=/hls\\/(.*).m3u8/gm.exec(t)||[];return await this.appService.setChannel(r[1]),new Response(i)}async onFetch(t,e){const s=await(await request(t,e)).text(),i=await this.appService.onFetch(s);return new Response(i)}async onChannelPicture(t,e){const s=await self.request(t,e);if(!s.ok)return console.log("Error on channel load"),s;const i=await s.text();return await this.appService.currentStream().setStreamAccess(i,r.PICTURE),console.log("picture-by-picture",i),new Response}async setSettings(t){this.appService.setSettings(t)}async setQuality(t){this.appService.quality=t.value}};o([i("setIntegrity")],u.prototype,"setIntegrity",1),o([s("usher.ttvnw.net/api/channel/hls/","picture-by-picture")],u.prototype,"onChannel",1),o([s("hls.ttvnw.net/v1/playlist/")],u.prototype,"onFetch",1),o([s("picture-by-picture")],u.prototype,"onChannelPicture",1),o([i("setSettings")],u.prototype,"setSettings",1),o([i("setQuality")],u.prototype,"setQuality",1),u=o([t=>{}],u);class g{constructor(t){this.integrityToken=t}async playbackAccessToken(t,e,s){const i={operationName:"PlaybackAccessToken",variables:{isLive:!0,login:t,isVod:!1,vodID:"",playerType:e},extensions:{persistedQuery:{version:1,sha256Hash:"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}}},r=await self.request("https://gql.twitch.tv/gql#origin=twilight",{method:"POST",headers:{Host:"gql.twitch.tv","Client-ID":"kimne78kx3ncx6brgo4mv6wki5h1ko","Client-Integrity":s},body:JSON.stringify(i)}),a=await r.json();return{token:a.data.streamPlaybackAccessToken.value,signature:a.data.streamPlaybackAccessToken.signature}}async playbackAccessToken_Template(t,e){const s={operationName:"PlaybackAccessToken_Template",query:\'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) { streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) { value signature __typename } videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) { value signature __typename }}\',variables:{isLive:!0,isVod:!1,vodID:"",login:t,playerType:e}},i=await self.request("https://gql.twitch.tv/gql",{method:"POST",headers:{Host:"gql.twitch.tv","Client-ID":"kimne78kx3ncx6brgo4mv6wki5h1ko"},body:JSON.stringify(s)}),r=await i.json();return{token:r.data.streamPlaybackAccessToken.value,signature:r.data.streamPlaybackAccessToken.signature}}async getM3U8(t,e){const s="allow_source=true&fast_bread=true&p="+Math.floor(1e7*Math.random())+"&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig="+e.signature+"&supported_codecs=avc1&token="+e.token;return(await self.request("https://usher.ttvnw.net/api/channel/hls/"+t+".m3u8?"+s)).text()}}class l{constructor(t){e(this,"type"),e(this,"urlList"),e(this,"sig"),e(this,"bestQuality",(()=>this.urlList[0])),e(this,"findByQuality",(t=>this.urlList.find((e=>e.quality==t)))),Object.assign(this,t)}}var c=function(){function t(){this.listeners={}}var e=t.prototype;return e.on=function(t,e){this.listeners[t]||(this.listeners[t]=[]),this.listeners[t].push(e)},e.off=function(t,e){if(!this.listeners[t])return!1;var s=this.listeners[t].indexOf(e);return this.listeners[t]=this.listeners[t].slice(0),this.listeners[t].splice(s,1),s>-1},e.trigger=function(t){var e=this.listeners[t];if(e)if(2===arguments.length)for(var s=e.length,i=0;i<s;++i)e[i].call(this,arguments[1]);else for(var r=Array.prototype.slice.call(arguments,1),a=e.length,n=0;n<a;++n)e[n].apply(this,r)},e.dispose=function(){this.listeners={}},e.pipe=function(t){this.on("data",(function(e){t.push(e)}))},t}();function h(){return h=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var s=arguments[e];for(var i in s)Object.prototype.hasOwnProperty.call(s,i)&&(t[i]=s[i])}return t},h.apply(this,arguments)}function p(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}const d=p("undefined"!=typeof window?window:"undefined"!=typeof self||"undefined"!=typeof self?self:{});function f(t){for(var e,s=(e=t,d.atob?d.atob(e):Buffer.from(e,"base64").toString("binary")),i=new Uint8Array(s.length),r=0;r<s.length;r++)i[r]=s.charCodeAt(r);return i}\n/*! @name m3u8-parser @version 6.0.0 @license Apache-2.0 */class m extends c{constructor(){super(),this.buffer=""}push(t){let e;for(this.buffer+=t,e=this.buffer.indexOf("\\n");e>-1;e=this.buffer.indexOf("\\n"))this.trigger("data",this.buffer.substring(0,e)),this.buffer=this.buffer.substring(e+1)}}const y=String.fromCharCode(9),T=function(t){const e=/([0-9.]*)?@?([0-9.]*)?/.exec(t||""),s={};return e[1]&&(s.length=parseInt(e[1],10)),e[2]&&(s.offset=parseInt(e[2],10)),s},E=function(t){const e={};if(!t)return e;const s=t.split(new RegExp(\'(?:^|,)((?:[^=]*)=(?:"[^"]*"|[^,]*))\'));let i,r=s.length;for(;r--;)""!==s[r]&&(i=/([^=]*)=(.*)/.exec(s[r]).slice(1),i[0]=i[0].replace(/^\\s+|\\s+$/g,""),i[1]=i[1].replace(/^\\s+|\\s+$/g,""),i[1]=i[1].replace(/^[\'"](.*)[\'"]$/g,"$1"),e[i[0]]=i[1]);return e};class b extends c{constructor(){super(),this.customParsers=[],this.tagMappers=[]}push(t){let e,s;if(0===(t=t.trim()).length)return;if("#"!==t[0])return void this.trigger("data",{type:"uri",uri:t});this.tagMappers.reduce(((e,s)=>{const i=s(t);return i===t?e:e.concat([i])}),[t]).forEach((t=>{for(let e=0;e<this.customParsers.length;e++)if(this.customParsers[e].call(this,t))return;if(0===t.indexOf("#EXT"))if(t=t.replace("\\r",""),e=/^#EXTM3U/.exec(t),e)this.trigger("data",{type:"tag",tagType:"m3u"});else{if(e=/^#EXTINF:([0-9\\.]*)?,?(.*)?$/.exec(t),e)return s={type:"tag",tagType:"inf"},e[1]&&(s.duration=parseFloat(e[1])),e[2]&&(s.title=e[2]),void this.trigger("data",s);if(e=/^#EXT-X-TARGETDURATION:([0-9.]*)?/.exec(t),e)return s={type:"tag",tagType:"targetduration"},e[1]&&(s.duration=parseInt(e[1],10)),void this.trigger("data",s);if(e=/^#EXT-X-VERSION:([0-9.]*)?/.exec(t),e)return s={type:"tag",tagType:"version"},e[1]&&(s.version=parseInt(e[1],10)),void this.trigger("data",s);if(e=/^#EXT-X-MEDIA-SEQUENCE:(\\-?[0-9.]*)?/.exec(t),e)return s={type:"tag",tagType:"media-sequence"},e[1]&&(s.number=parseInt(e[1],10)),void this.trigger("data",s);if(e=/^#EXT-X-DISCONTINUITY-SEQUENCE:(\\-?[0-9.]*)?/.exec(t),e)return s={type:"tag",tagType:"discontinuity-sequence"},e[1]&&(s.number=parseInt(e[1],10)),void this.trigger("data",s);if(e=/^#EXT-X-PLAYLIST-TYPE:(.*)?$/.exec(t),e)return s={type:"tag",tagType:"playlist-type"},e[1]&&(s.playlistType=e[1]),void this.trigger("data",s);if(e=/^#EXT-X-BYTERANGE:(.*)?$/.exec(t),e)return s=h(T(e[1]),{type:"tag",tagType:"byterange"}),void this.trigger("data",s);if(e=/^#EXT-X-ALLOW-CACHE:(YES|NO)?/.exec(t),e)return s={type:"tag",tagType:"allow-cache"},e[1]&&(s.allowed=!/NO/.test(e[1])),void this.trigger("data",s);if(e=/^#EXT-X-MAP:(.*)$/.exec(t),e){if(s={type:"tag",tagType:"map"},e[1]){const t=E(e[1]);t.URI&&(s.uri=t.URI),t.BYTERANGE&&(s.byterange=T(t.BYTERANGE))}this.trigger("data",s)}else if(e=/^#EXT-X-STREAM-INF:(.*)$/.exec(t),e){if(s={type:"tag",tagType:"stream-inf"},e[1]){if(s.attributes=E(e[1]),s.attributes.RESOLUTION){const t=s.attributes.RESOLUTION.split("x"),e={};t[0]&&(e.width=parseInt(t[0],10)),t[1]&&(e.height=parseInt(t[1],10)),s.attributes.RESOLUTION=e}s.attributes.BANDWIDTH&&(s.attributes.BANDWIDTH=parseInt(s.attributes.BANDWIDTH,10)),s.attributes["FRAME-RATE"]&&(s.attributes["FRAME-RATE"]=parseFloat(s.attributes["FRAME-RATE"])),s.attributes["PROGRAM-ID"]&&(s.attributes["PROGRAM-ID"]=parseInt(s.attributes["PROGRAM-ID"],10))}this.trigger("data",s)}else{if(e=/^#EXT-X-MEDIA:(.*)$/.exec(t),e)return s={type:"tag",tagType:"media"},e[1]&&(s.attributes=E(e[1])),void this.trigger("data",s);if(e=/^#EXT-X-ENDLIST/.exec(t),e)this.trigger("data",{type:"tag",tagType:"endlist"});else if(e=/^#EXT-X-DISCONTINUITY/.exec(t),e)this.trigger("data",{type:"tag",tagType:"discontinuity"});else{if(e=/^#EXT-X-PROGRAM-DATE-TIME:(.*)$/.exec(t),e)return s={type:"tag",tagType:"program-date-time"},e[1]&&(s.dateTimeString=e[1],s.dateTimeObject=new Date(e[1])),void this.trigger("data",s);if(e=/^#EXT-X-KEY:(.*)$/.exec(t),e)return s={type:"tag",tagType:"key"},e[1]&&(s.attributes=E(e[1]),s.attributes.IV&&("0x"===s.attributes.IV.substring(0,2).toLowerCase()&&(s.attributes.IV=s.attributes.IV.substring(2)),s.attributes.IV=s.attributes.IV.match(/.{8}/g),s.attributes.IV[0]=parseInt(s.attributes.IV[0],16),s.attributes.IV[1]=parseInt(s.attributes.IV[1],16),s.attributes.IV[2]=parseInt(s.attributes.IV[2],16),s.attributes.IV[3]=parseInt(s.attributes.IV[3],16),s.attributes.IV=new Uint32Array(s.attributes.IV))),void this.trigger("data",s);if(e=/^#EXT-X-START:(.*)$/.exec(t),e)return s={type:"tag",tagType:"start"},e[1]&&(s.attributes=E(e[1]),s.attributes["TIME-OFFSET"]=parseFloat(s.attributes["TIME-OFFSET"]),s.attributes.PRECISE=/YES/.test(s.attributes.PRECISE)),void this.trigger("data",s);if(e=/^#EXT-X-CUE-OUT-CONT:(.*)?$/.exec(t),e)return s={type:"tag",tagType:"cue-out-cont"},e[1]?s.data=e[1]:s.data="",void this.trigger("data",s);if(e=/^#EXT-X-CUE-OUT:(.*)?$/.exec(t),e)return s={type:"tag",tagType:"cue-out"},e[1]?s.data=e[1]:s.data="",void this.trigger("data",s);if(e=/^#EXT-X-CUE-IN:(.*)?$/.exec(t),e)return s={type:"tag",tagType:"cue-in"},e[1]?s.data=e[1]:s.data="",void this.trigger("data",s);if(e=/^#EXT-X-SKIP:(.*)$/.exec(t),e&&e[1])return s={type:"tag",tagType:"skip"},s.attributes=E(e[1]),s.attributes.hasOwnProperty("SKIPPED-SEGMENTS")&&(s.attributes["SKIPPED-SEGMENTS"]=parseInt(s.attributes["SKIPPED-SEGMENTS"],10)),s.attributes.hasOwnProperty("RECENTLY-REMOVED-DATERANGES")&&(s.attributes["RECENTLY-REMOVED-DATERANGES"]=s.attributes["RECENTLY-REMOVED-DATERANGES"].split(y)),void this.trigger("data",s);if(e=/^#EXT-X-PART:(.*)$/.exec(t),e&&e[1])return s={type:"tag",tagType:"part"},s.attributes=E(e[1]),["DURATION"].forEach((function(t){s.attributes.hasOwnProperty(t)&&(s.attributes[t]=parseFloat(s.attributes[t]))})),["INDEPENDENT","GAP"].forEach((function(t){s.attributes.hasOwnProperty(t)&&(s.attributes[t]=/YES/.test(s.attributes[t]))})),s.attributes.hasOwnProperty("BYTERANGE")&&(s.attributes.byterange=T(s.attributes.BYTERANGE)),void this.trigger("data",s);if(e=/^#EXT-X-SERVER-CONTROL:(.*)$/.exec(t),e&&e[1])return s={type:"tag",tagType:"server-control"},s.attributes=E(e[1]),["CAN-SKIP-UNTIL","PART-HOLD-BACK","HOLD-BACK"].forEach((function(t){s.attributes.hasOwnProperty(t)&&(s.attributes[t]=parseFloat(s.attributes[t]))})),["CAN-SKIP-DATERANGES","CAN-BLOCK-RELOAD"].forEach((function(t){s.attributes.hasOwnProperty(t)&&(s.attributes[t]=/YES/.test(s.attributes[t]))})),void this.trigger("data",s);if(e=/^#EXT-X-PART-INF:(.*)$/.exec(t),e&&e[1])return s={type:"tag",tagType:"part-inf"},s.attributes=E(e[1]),["PART-TARGET"].forEach((function(t){s.attributes.hasOwnProperty(t)&&(s.attributes[t]=parseFloat(s.attributes[t]))})),void this.trigger("data",s);if(e=/^#EXT-X-PRELOAD-HINT:(.*)$/.exec(t),e&&e[1])return s={type:"tag",tagType:"preload-hint"},s.attributes=E(e[1]),["BYTERANGE-START","BYTERANGE-LENGTH"].forEach((function(t){if(s.attributes.hasOwnProperty(t)){s.attributes[t]=parseInt(s.attributes[t],10);const e="BYTERANGE-LENGTH"===t?"length":"offset";s.attributes.byterange=s.attributes.byterange||{},s.attributes.byterange[e]=s.attributes[t],delete s.attributes[t]}})),void this.trigger("data",s);if(e=/^#EXT-X-RENDITION-REPORT:(.*)$/.exec(t),e&&e[1])return s={type:"tag",tagType:"rendition-report"},s.attributes=E(e[1]),["LAST-MSN","LAST-PART"].forEach((function(t){s.attributes.hasOwnProperty(t)&&(s.attributes[t]=parseInt(s.attributes[t],10))})),void this.trigger("data",s);this.trigger("data",{type:"tag",data:t.slice(4)})}}}else this.trigger("data",{type:"comment",text:t.slice(1)})}))}addParser({expression:t,customType:e,dataParser:s,segment:i}){"function"!=typeof s&&(s=t=>t),this.customParsers.push((r=>{if(t.exec(r))return this.trigger("data",{type:"custom",data:s(r),customType:e,segment:i}),!0}))}addTagMapper({expression:t,map:e}){this.tagMappers.push((s=>t.test(s)?e(s):s))}}const S=function(t){const e={};return Object.keys(t).forEach((function(s){var i;e[(i=s,i.toLowerCase().replace(/-(\\w)/g,(t=>t[1].toUpperCase())))]=t[s]})),e},A=function(t){const{serverControl:e,targetDuration:s,partTargetDuration:i}=t;if(!e)return;const r="#EXT-X-SERVER-CONTROL",a="holdBack",n="partHoldBack",o=s&&3*s,u=i&&2*i;s&&!e.hasOwnProperty(a)&&(e[a]=o,this.trigger("info",{message:`${r} defaulting HOLD-BACK to targetDuration * 3 (${o}).`})),o&&e[a]<o&&(this.trigger("warn",{message:`${r} clamping HOLD-BACK (${e[a]}) to targetDuration * 3 (${o})`}),e[a]=o),i&&!e.hasOwnProperty(n)&&(e[n]=3*i,this.trigger("info",{message:`${r} defaulting PART-HOLD-BACK to partTargetDuration * 3 (${e[n]}).`})),i&&e[n]<u&&(this.trigger("warn",{message:`${r} clamping PART-HOLD-BACK (${e[n]}) to partTargetDuration * 2 (${u}).`}),e[n]=u)};class I extends c{constructor(){super(),this.lineStream=new m,this.parseStream=new b,this.lineStream.pipe(this.parseStream);const t=this,e=[];let s,i,r={},a=!1;const n=function(){},o={AUDIO:{},VIDEO:{},"CLOSED-CAPTIONS":{},SUBTITLES:{}};let u=0;this.manifest={allowCache:!0,discontinuityStarts:[],segments:[]};let g=0,l=0;this.on("end",(()=>{r.uri||!r.parts&&!r.preloadHints||(!r.map&&s&&(r.map=s),!r.key&&i&&(r.key=i),r.timeline||"number"!=typeof u||(r.timeline=u),this.manifest.preloadSegment=r)})),this.parseStream.on("data",(function(c){let p,d;({tag(){({version(){c.version&&(this.manifest.version=c.version)},"allow-cache"(){this.manifest.allowCache=c.allowed,"allowed"in c||(this.trigger("info",{message:"defaulting allowCache to YES"}),this.manifest.allowCache=!0)},byterange(){const t={};"length"in c&&(r.byterange=t,t.length=c.length,"offset"in c||(c.offset=g)),"offset"in c&&(r.byterange=t,t.offset=c.offset),g=t.offset+t.length},endlist(){this.manifest.endList=!0},inf(){"mediaSequence"in this.manifest||(this.manifest.mediaSequence=0,this.trigger("info",{message:"defaulting media sequence to zero"})),"discontinuitySequence"in this.manifest||(this.manifest.discontinuitySequence=0,this.trigger("info",{message:"defaulting discontinuity sequence to zero"})),c.duration>0&&(r.duration=c.duration),0===c.duration&&(r.duration=.01,this.trigger("info",{message:"updating zero segment duration to a small value"})),this.manifest.segments=e},key(){if(c.attributes)if("NONE"!==c.attributes.METHOD)if(c.attributes.URI){if("com.apple.streamingkeydelivery"===c.attributes.KEYFORMAT)return this.manifest.contentProtection=this.manifest.contentProtection||{},void(this.manifest.contentProtection["com.apple.fps.1_0"]={attributes:c.attributes});if("com.microsoft.playready"===c.attributes.KEYFORMAT)return this.manifest.contentProtection=this.manifest.contentProtection||{},void(this.manifest.contentProtection["com.microsoft.playready"]={uri:c.attributes.URI});if("urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"===c.attributes.KEYFORMAT){return-1===["SAMPLE-AES","SAMPLE-AES-CTR","SAMPLE-AES-CENC"].indexOf(c.attributes.METHOD)?void this.trigger("warn",{message:"invalid key method provided for Widevine"}):("SAMPLE-AES-CENC"===c.attributes.METHOD&&this.trigger("warn",{message:"SAMPLE-AES-CENC is deprecated, please use SAMPLE-AES-CTR instead"}),"data:text/plain;base64,"!==c.attributes.URI.substring(0,23)?void this.trigger("warn",{message:"invalid key URI provided for Widevine"}):c.attributes.KEYID&&"0x"===c.attributes.KEYID.substring(0,2)?(this.manifest.contentProtection=this.manifest.contentProtection||{},void(this.manifest.contentProtection["com.widevine.alpha"]={attributes:{schemeIdUri:c.attributes.KEYFORMAT,keyId:c.attributes.KEYID.substring(2)},pssh:f(c.attributes.URI.split(",")[1])})):void this.trigger("warn",{message:"invalid key ID provided for Widevine"}))}c.attributes.METHOD||this.trigger("warn",{message:"defaulting key method to AES-128"}),i={method:c.attributes.METHOD||"AES-128",uri:c.attributes.URI},void 0!==c.attributes.IV&&(i.iv=c.attributes.IV)}else this.trigger("warn",{message:"ignoring key declaration without URI"});else i=null;else this.trigger("warn",{message:"ignoring key declaration without attribute list"})},"media-sequence"(){isFinite(c.number)?this.manifest.mediaSequence=c.number:this.trigger("warn",{message:"ignoring invalid media sequence: "+c.number})},"discontinuity-sequence"(){isFinite(c.number)?(this.manifest.discontinuitySequence=c.number,u=c.number):this.trigger("warn",{message:"ignoring invalid discontinuity sequence: "+c.number})},"playlist-type"(){/VOD|EVENT/.test(c.playlistType)?this.manifest.playlistType=c.playlistType:this.trigger("warn",{message:"ignoring unknown playlist type: "+c.playlist})},map(){s={},c.uri&&(s.uri=c.uri),c.byterange&&(s.byterange=c.byterange),i&&(s.key=i)},"stream-inf"(){this.manifest.playlists=e,this.manifest.mediaGroups=this.manifest.mediaGroups||o,c.attributes?(r.attributes||(r.attributes={}),h(r.attributes,c.attributes)):this.trigger("warn",{message:"ignoring empty stream-inf attributes"})},media(){if(this.manifest.mediaGroups=this.manifest.mediaGroups||o,!(c.attributes&&c.attributes.TYPE&&c.attributes["GROUP-ID"]&&c.attributes.NAME))return void this.trigger("warn",{message:"ignoring incomplete or missing media group"});const t=this.manifest.mediaGroups[c.attributes.TYPE];t[c.attributes["GROUP-ID"]]=t[c.attributes["GROUP-ID"]]||{},p=t[c.attributes["GROUP-ID"]],d={default:/yes/i.test(c.attributes.DEFAULT)},d.default?d.autoselect=!0:d.autoselect=/yes/i.test(c.attributes.AUTOSELECT),c.attributes.LANGUAGE&&(d.language=c.attributes.LANGUAGE),c.attributes.URI&&(d.uri=c.attributes.URI),c.attributes["INSTREAM-ID"]&&(d.instreamId=c.attributes["INSTREAM-ID"]),c.attributes.CHARACTERISTICS&&(d.characteristics=c.attributes.CHARACTERISTICS),c.attributes.FORCED&&(d.forced=/yes/i.test(c.attributes.FORCED)),p[c.attributes.NAME]=d},discontinuity(){u+=1,r.discontinuity=!0,this.manifest.discontinuityStarts.push(e.length)},"program-date-time"(){void 0===this.manifest.dateTimeString&&(this.manifest.dateTimeString=c.dateTimeString,this.manifest.dateTimeObject=c.dateTimeObject),r.dateTimeString=c.dateTimeString,r.dateTimeObject=c.dateTimeObject},targetduration(){!isFinite(c.duration)||c.duration<0?this.trigger("warn",{message:"ignoring invalid target duration: "+c.duration}):(this.manifest.targetDuration=c.duration,A.call(this,this.manifest))},start(){c.attributes&&!isNaN(c.attributes["TIME-OFFSET"])?this.manifest.start={timeOffset:c.attributes["TIME-OFFSET"],precise:c.attributes.PRECISE}:this.trigger("warn",{message:"ignoring start declaration without appropriate attribute list"})},"cue-out"(){r.cueOut=c.data},"cue-out-cont"(){r.cueOutCont=c.data},"cue-in"(){r.cueIn=c.data},skip(){this.manifest.skip=S(c.attributes),this.warnOnMissingAttributes_("#EXT-X-SKIP",c.attributes,["SKIPPED-SEGMENTS"])},part(){a=!0;const t=this.manifest.segments.length,e=S(c.attributes);r.parts=r.parts||[],r.parts.push(e),e.byterange&&(e.byterange.hasOwnProperty("offset")||(e.byterange.offset=l),l=e.byterange.offset+e.byterange.length);const s=r.parts.length-1;this.warnOnMissingAttributes_(`#EXT-X-PART #${s} for segment #${t}`,c.attributes,["URI","DURATION"]),this.manifest.renditionReports&&this.manifest.renditionReports.forEach(((t,e)=>{t.hasOwnProperty("lastPart")||this.trigger("warn",{message:`#EXT-X-RENDITION-REPORT #${e} lacks required attribute(s): LAST-PART`})}))},"server-control"(){const t=this.manifest.serverControl=S(c.attributes);t.hasOwnProperty("canBlockReload")||(t.canBlockReload=!1,this.trigger("info",{message:"#EXT-X-SERVER-CONTROL defaulting CAN-BLOCK-RELOAD to false"})),A.call(this,this.manifest),t.canSkipDateranges&&!t.hasOwnProperty("canSkipUntil")&&this.trigger("warn",{message:"#EXT-X-SERVER-CONTROL lacks required attribute CAN-SKIP-UNTIL which is required when CAN-SKIP-DATERANGES is set"})},"preload-hint"(){const t=this.manifest.segments.length,e=S(c.attributes),s=e.type&&"PART"===e.type;r.preloadHints=r.preloadHints||[],r.preloadHints.push(e),e.byterange&&(e.byterange.hasOwnProperty("offset")||(e.byterange.offset=s?l:0,s&&(l=e.byterange.offset+e.byterange.length)));const i=r.preloadHints.length-1;if(this.warnOnMissingAttributes_(`#EXT-X-PRELOAD-HINT #${i} for segment #${t}`,c.attributes,["TYPE","URI"]),e.type)for(let a=0;a<r.preloadHints.length-1;a++){const s=r.preloadHints[a];s.type&&(s.type===e.type&&this.trigger("warn",{message:`#EXT-X-PRELOAD-HINT #${i} for segment #${t} has the same TYPE ${e.type} as preload hint #${a}`}))}},"rendition-report"(){const t=S(c.attributes);this.manifest.renditionReports=this.manifest.renditionReports||[],this.manifest.renditionReports.push(t);const e=this.manifest.renditionReports.length-1,s=["LAST-MSN","URI"];a&&s.push("LAST-PART"),this.warnOnMissingAttributes_(`#EXT-X-RENDITION-REPORT #${e}`,c.attributes,s)},"part-inf"(){this.manifest.partInf=S(c.attributes),this.warnOnMissingAttributes_("#EXT-X-PART-INF",c.attributes,["PART-TARGET"]),this.manifest.partInf.partTarget&&(this.manifest.partTargetDuration=this.manifest.partInf.partTarget),A.call(this,this.manifest)}}[c.tagType]||n).call(t)},uri(){r.uri=c.uri,e.push(r),this.manifest.targetDuration&&!("duration"in r)&&(this.trigger("warn",{message:"defaulting segment duration to the target duration"}),r.duration=this.manifest.targetDuration),i&&(r.key=i),r.timeline=u,s&&(r.map=s),l=0,r={}},comment(){},custom(){c.segment?(r.custom=r.custom||{},r.custom[c.customType]=c.data):(this.manifest.custom=this.manifest.custom||{},this.manifest.custom[c.customType]=c.data)}})[c.type].call(t)}))}warnOnMissingAttributes_(t,e,s){const i=[];s.forEach((function(t){e.hasOwnProperty(t)||i.push(t)})),i.length&&this.trigger("warn",{message:`${t} lacks required attribute(s): ${i.join(", ")}`})}push(t){this.lineStream.push(t)}end(){this.lineStream.push("\\n"),this.trigger("end")}addParser(t){this.parseStream.addParser(t)}addTagMapper(t){this.parseStream.addTagMapper(t)}}class v{constructor(){e(this,"integrityToken",""),e(this,"streamList",[]),e(this,"actualChannel",""),e(this,"playingAds",!1),e(this,"setting"),e(this,"quality",""),e(this,"freeStream",!1),e(this,"getQuality",(()=>self.postMessage({type:"getQuality"}))),e(this,"getSettings",(()=>self.postMessage({type:"getSettings"}))),e(this,"pause",(()=>self.postMessage({type:"pause"}))),e(this,"play",(()=>self.postMessage({type:"play"}))),e(this,"setSettings",(t=>{this.setting=t,logger("Settings loaded")})),e(this,"setIntegrityToken",(t=>this.integrityToken=t)),e(this,"pauseAndPlay",(async()=>{this.pause(),await new Promise((t=>setTimeout(t,1500))),this.play()})),e(this,"onStartAds",(()=>{console.log("ads started"),this.pauseAndPlay()})),e(this,"onEndAds",(()=>{console.log("ads ended"),this.pauseAndPlay()})),e(this,"isAds",((t,e=!1)=>{const s=this.hasAds(t);return e?(0==this.playingAds&&this.playingAds!=s&&this.onStartAds(),1==this.playingAds&&this.playingAds!=s&&this.onEndAds(),this.playingAds=s,this.playingAds):s})),e(this,"hasAds",(t=>(null==t?void 0:t.toString().includes("stitched"))||(null==t?void 0:t.toString().includes("Amazon"))||(null==t?void 0:t.toString().includes("DCM,")))),e(this,"currentStream",((t=this.actualChannel)=>{var e;return null==(e=this.streamList)?void 0:e.find((e=>e.channelName===t))}))}freeStreamChanged(t){this.freeStream!=t&&this.pauseAndPlay(),this.freeStream=t}isWhitelist(){var t,e;return(null==(e=null==(t=this.setting)?void 0:t.whitelist)?void 0:e.includes(this.actualChannel))||!1}async onFetch(t){if(this.isWhitelist())return t;if(!this.isAds(t,!0))return this.freeStream=!1,this.mergeM3u8Contents([t]);const e=[],s=await this.fetchm3u8ByStreamType(r.FRONTPAGE);if(s.data||this.currentStream().createStreamAccess(r.FRONTPAGE,this.integrityToken),s.dump&&e.push(...s.dump),s.data)return s.data;const i=await this.fetchm3u8ByStreamType(r.PICTURE);return i.data||this.currentStream().createStreamAccess(r.PICTURE,this.integrityToken),i.dump&&e.push(...i.dump),i.data?i.data:((null==e?void 0:e.length)?this.freeStreamChanged(!0):this.freeStreamChanged(!1),this.printViewAds([t,...e]),0!=e.length?this.mergeM3u8Contents([JSON.parse(JSON.stringify(t)),...e]):JSON.parse(JSON.stringify(t)))}printViewAds(t){const e=t.map((t=>{const e=new I;e.push(t),e.end();const s=e.manifest;return s.segments&&s.segments.forEach((e=>{const s=new RegExp(`#EXTINF:([0-9.]*)?,?(.*)(?:\\n|\\r\\n)${e.uri}`),i=t.match(s);i&&(e.title=i[2]?i[2].trim():"")})),s}));let s=[];for(const i of e)i.segments&&i.segments.forEach((t=>{s.push(""+(this.hasAds(t.title)?"X":"V"))}));console.log(s.join("-"))}generateM3u8(t){let e="#EXTM3U\\n";return t.targetDuration&&(e+=`#EXT-X-TARGETDURATION:${t.targetDuration}\\n`),t.mediaSequence&&(e+=`#EXT-X-MEDIA-SEQUENCE:${t.mediaSequence}\\n`),t.segments&&t.segments.forEach((t=>{t.duration&&(e+=`#EXTINF:${t.duration}`,e+="\\n"),e+=`${t.uri}\\n`})),e}mergeM3u8Contents(t){var e,s;const i=t.map((t=>{const e=new I;e.push(t),e.end();const s=e.manifest;return s.segments&&s.segments.forEach((e=>{const s=new RegExp(`#EXTINF:([0-9.]*)?,?(.*)(?:\\n|\\r\\n)${e.uri}`),i=t.match(s);i&&(e.title=i[2]?i[2].trim():"")})),s})),r=i[0],a=i.slice(1);console.log("Segmentos encontrados no manifesto principal:",null==(e=null==r?void 0:r.segments)?void 0:e.length),console.log("Manifestos de suporte encontrados:",a.length);let n=0;if(!(null==(s=r.segments)?void 0:s.length))return this.generateM3u8(r);for(let o=0;o<r.segments.length;o++){const t=r.segments[o];let e=!1;this.hasAds(t.title)&&(a.forEach((s=>{var i,a;const n=null==(i=null==s?void 0:s.segments)?void 0:i.find((e=>{if(this.hasAds(e.title))return!1;const s=new Date(t.dateTimeString),i=new Date(e.dateTimeString);return s.setMilliseconds(0),i.setMilliseconds(0),s.getTime()===i.getTime()}));n&&(null==(a=r.segments)?void 0:a[o])&&(r.segments[o]=n,e=!0)})),e&&n++)}console.log("Segmento com ads removidos:",0),console.log("Segmento com ads substituídos:",n);return this.generateM3u8(r)}async fetchm3u8ByStreamType(t){let e=[],s="",i=this.currentStream().getStreamByStreamType(t);for(const r of i){const i=r.findByQuality(this.quality)||r.bestQuality(),a=await(await self.request(null==i?void 0:i.url)).text();if(e.push(a),!this.isAds(a)){s=a,logger("Stream Type: "+t+" - Free Stream");break}logger("Stream Type: "+t+" - Ads found"),this.currentStream().removeServer(r)}return{data:s,dump:e}}setChannel(t){logger("Loading channel",t),this.actualChannel=t;let s=this.streamList.find((e=>e.channelName===t));s||(s=new class{constructor(t){e(this,"serverList",[]),e(this,"channelName"),e(this,"twitchService"),this.channelName=t,this.twitchService=new g("")}removeServer(t){const e=this.serverList.indexOf(t);e>-1&&this.serverList.splice(e,1)}setStreamAccess(t,e="local",s=!0){const i=[];let r;const a=/NAME="((?:\\S+\\s+\\S+|\\S+))",AUTO(?:^|\\S+\\s+)(?:^|\\S+\\s+)(https:\\/\\/video(\\S+).m3u8)/g;for(;null!==(r=a.exec(t));)i.push({quality:r[1],url:r[2]});const n=new l({type:e,urlList:i,sig:s});this.serverList.push(n)}async createStreamAccess(t,e){try{const s=await this.twitchService.playbackAccessToken(this.channelName,t,e);console.log("New Connection: ",t,s.token.includes(\'"hide_ads":true\'));const i=await this.twitchService.getM3U8(this.channelName,s);this.setStreamAccess(i,t)}catch(s){logger(s)}}getStreamByStreamType(t){return this.serverList.filter((e=>e.type==t))||[]}}(t),this.streamList.push(s))}}self.request=self.fetch,self.fetch=async(t,e)=>{if("string"==typeof t)for(var s=0,i=routerList.length;s<i;s++)if(t.includes(routerList[s].match)&&!t.includes(routerList[s].ignore))return self.appController[routerList[s].propertyKey](t,e);return self.request.apply(void 0,[t,e])},self.logger=t=>console.log("[Purple]: ",t),self.appController=new u(new v),self.logger("Script running");\n//# sourceMappingURL=app.worker.js.map\n';let o=!1;(function(){let e;window.Worker=class extends Worker{constructor(t){console.log("[Purple]: init "+t.toString());const s=new XMLHttpRequest;s.open("GET",t.toString(),!1),s.send();const i=s.responseText;if(typeof i!="string"){super(t);return}const r=`${u}
      ${i}`,a=URL.createObjectURL(new Blob([r],{type:"text/javascript"}));super(a),o||(e=this,e.declareEventWorker(),e.declareEventWindow(),e.integrity(),o=!0)}async integrity(){self.request=fetch,self.fetch=async(t,s)=>{const i=await self.request(t,s),r=await i.text();return t=="https://gql.twitch.tv/integrity"&&e.postMessage({funcName:"setIntegrity",value:r}),new Response(r,i)}}declareEventWorker(){this.addEventListener("message",t=>{var s,i,r,a,n;switch((s=t==null?void 0:t.data)==null?void 0:s.type){case"getSettings":{window.postMessage({type:"getSettings",value:null});break}case"PlayerQualityChanged":{e.postMessage({funcName:"setQuality",value:t.data.arg.name});break}case"pause":{e.postMessage({funcName:"pause",args:void 0,id:1});break}case"play":{e.postMessage({funcName:"play",args:void 0,id:1});break}}switch((r=(i=t==null?void 0:t.data)==null?void 0:i.arg)==null?void 0:r.key){case"quality":{if(!t.data.arg.value.name)break;console.log("Changed quality by player: "+t.data.arg.value.name),e.postMessage({funcName:"setQuality",value:t.data.arg.value.name});break}case"state":e.postMessage({funcName:t.data.arg.value})}switch((n=(a=t==null?void 0:t.data)==null?void 0:a.arg)==null?void 0:n.name){}})}declareEventWindow(){window.addEventListener("message",t=>{switch(t.data.type){case"setSettings":e.postMessage({funcName:"setSettings",value:t.data.value})}})}}})();
