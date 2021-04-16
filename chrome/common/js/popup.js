var whiteList = [];
document.getElementById('adblockbutton').onclick = inputChange;
var isActive = true;
var channel = "";
function inputChange(e) {
    if(isActive){
        document.getElementById("adblocktext").classList.add("disable");
        document.getElementById("watching").textContent = "Disactived on : " + channel;
        
        if(!whiteList.includes(channel)){
            whiteList.push(channel);
        }
        
        chrome.storage.local.set({["whiteList"]: whiteList});
        isActive = false;

    }else{
        document.getElementById("adblocktext").classList.remove("disable");
        document.getElementById("watching").textContent = "Actived on : " + channel;
        for( var i = 0; i < whiteList.length; i++){
            if ( whiteList[i] === channel) { 
                whiteList.splice(i, 1); 
                i--; 
            }
        }

        chrome.storage.local.set({["whiteList"]: whiteList});
        isActive = true;
    }
}

chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function 
(tabs) {
    var url = tabs[0].url;
    if(url.includes("https://www.twitch.tv/")){
        channel = url.replace("https://www.twitch.tv/","").split('/')[0].split('?')[0];
        
        chrome.storage.local.get(/* String or Array */["whiteList"], function(items){
            if(items.whiteList !== undefined){
              whiteList = items.whiteList;
              console.log(channel);
              console.log(whiteList);
        
              if(whiteList.includes(channel)){
                  isActive = false;
                }
              if(isActive){
                  document.getElementById("adblocktext").classList.remove("disable");
                  document.getElementById("watching").textContent = "Actived on : " + channel;
              }else{
                  document.getElementById("adblocktext").classList.add("disable");
                  document.getElementById("watching").textContent = "Disactived on : " + channel;
              }
            }
        });
    }
});