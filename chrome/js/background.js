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
  
  function onCompleted(details) {
    console.log("url: " + details.url + "   " + details.statusCode);
    if(details.url.includes("much.ga/channel")){

      if(details.statusCode == 200){
        console.log("blocking success: " + details.statusCode);
        log.push("blocking success: " + details.statusCode);
        return;
      }
      //if the return not 200, see if exist the proxystatus. if not exist the proxystatus the server has offline.
      if(details.responseHeaders.find(x => x.name == "proxystatus").value == 200){
        console.log("Stream Offline: " + details.statusCode);
        log.push("Stream offline: " + details.statusCode);
        return;
      }

      if(details.statusCode == 404){
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
  { urls: ["https://usher.ttvnw.net/api/channel/hls/*"] },
  ["blocking", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(onCompleted, {urls: [ "https://much.ga/*","https://usher.ttvnw.net/api/channel/*"] },["responseHeaders"]);