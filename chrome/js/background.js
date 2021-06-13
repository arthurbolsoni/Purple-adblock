var whiteList = [];
var log = [];
var servererror = false;

function onBeforeRequest(details) {
  
  const match = /hls\/(\w+)\.m3u8/gim.exec(details.url);
  if(servererror == true){return;}
  
  if (match !== null && match.length > 1) {
    
    if(whiteList.includes(match[1])){
      return { redirectUrl: details.url };
    }

    console.log("Opening: " + match[1]);
    log.push("Opening: " + match[1]);

    new Promise(resolve => {                    
      fetch(
          'https://much.ga/on',
          {
            method: 'GET',
          }).then(r =>{
              if (r.status == 200) {
                
                }else{
                  servererror = true;
                  console.log("server off");
                  log.push("server off");
              }
          }).catch((error) => {
              servererror = true;
              console.log("server off");
              log.push("server off");
          });
        });
    
    return { redirectUrl: `https://much.ga/channel/${match[1]}` };
      
    }
  }
  
  var servertwitch = "";
  
  function onCompleted(details) {
    if(details.url.includes("abs.hls.ttvnw.net/")){return;}
    if(details.url.includes("much.ga/on")){return;}

    if(details.url.includes("hls.ttvnw.net/")){
      var regex = /(?:^https?:\/\/([^\/]+)(?:[\/,]|$)|^(.*)$)/
      const match = regex.exec(details.url)[1];

      if(!servertwitch.includes(match)){
        console.log("twitch server: " + match);
        log.push("twitch server: " + match);
        servertwitch = match;
      }
      return;
    }
    console.log("url: " + details.url + "   " + details.statusCode);
    if(details.url.includes("much.ga/channel")){

      if(details.statusCode == 200){
        console.log("blocking success: " + details.statusCode);
        log.push("blocking success: " + details.statusCode);
        return;
      }
      //if the return of the twitch is 404 the stream is offline or not found
      if(details.statusCode == 404){
        console.log("Stream Offline: " + details.statusCode);
        log.push("Stream offline: " + details.statusCode);
        return;
      }
      //if the proxystatus if 404, the server proxy is offline so the extension turn off
      if(details.responseHeaders.find(x => x.name == "proxystatus").value == 404){
        console.log("blocking error: " + details.statusCode);
        log.push("blocking error: " + details.statusCode);
        log.push("url: " + details.url);
        servererror = true;
      }

    }else if(details.url.includes("usher.ttvnw.net/api/channel/")){
      const match = /hls\/(\w+)\.m3u8/gim.exec(details.url);

      if (match !== null && match.length > 1) {
        if(whiteList.includes(match[1])){
          console.log("blocking desabled: running native");
          log.push("blocking desabled: running native");
        }else{
          console.log("blocking error: running native" + "url: " + details.url);
          log.push("blocking error: running native" + "url: " + details.url);
        }
      }
    }
    
    log.push("ads blocked" + details.url);
    return {
      cancel: true
    };

  }

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if(newValue !== undefined){
        whiteList = newValue;
        console.log(whiteList);
      }
    }
  });

chrome.storage.local.get(/* String or Array */["whiteList"], function(items){  
  if(items.whiteList !== undefined){
    whiteList = items.whiteList;
    console.log(whiteList);
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      sendResponse(log);
  }
);

chrome.webRequest.onBeforeRequest.addListener(
  onBeforeRequest,
  { urls: ["https://*.amazon-adsystem.com/*","https://cdn.krxd.net/*","https://script.ioam.de/iam.js","https://edge.quantserve.com/quant.js","https://ddacn6pr5v0tl.cloudfront.net/*","https://d2v02itv0y9u9t.cloudfront.net/dist/1.0.5/v6s.js","https://*.imrworldwide.com/*","https://countess.twitch.tv/*","https://*.scorecardresearch.com/*","https://www.googletagservices.com/tag/js/gpt.js","*://*.branch.io/*","*://comscore.com/*","https://usher.ttvnw.net/api/channel/hls/*"] },
  ["blocking", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(onCompleted, {urls: [ "https://much.ga/*","https://*.hls.ttvnw.net/*","https://usher.ttvnw.net/api/channel/*"] },["responseHeaders"]);