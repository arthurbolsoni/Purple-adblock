var whiteList = [];

function onBeforeRequest(details) {
    
    const match = /hls\/(\w+)\.m3u8/gim.exec(details.url);
    if (match !== null && match.length > 1) {
      if(whiteList.includes(match[1])){
        return { redirectUrl: details.url };
      }
      
      var req = new XMLHttpRequest();
      req.open("GET", `https://much.ga/on`, false);
      req.send();
      
      if (req.status != 200) {
        return { redirectUrl: details.url };
      } else {
        console.log("blocked");
        return { redirectUrl: `https://much.ga/channel/${match[1]}` };
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

chrome.webRequest.onBeforeRequest.addListener(
  onBeforeRequest,
  { urls: ["https://usher.ttvnw.net/api/channel/hls/*"] },
  ["blocking", "extraHeaders"]
);