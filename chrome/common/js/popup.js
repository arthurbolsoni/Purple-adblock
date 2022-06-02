var whiteList = [];
document.getElementById('adblockbutton').onclick = inputChange;

document.getElementsByClassName('buttonlog')[0].onclick = function(e) {
var x = document.getElementsByClassName("log")[0];
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
};


document.getElementById('toggleV1').onclick = inputChangetoggleV1;
document.getElementById('toggleV2').onclick = inputChangetoggleV2;

function inputChangetoggleV1(){
    document.getElementById("toggleV2").checked = !document.getElementById("toggleV2").checked;
    chrome.storage.local.set({["settings"]: [document.getElementById("toggleV1").checked,document.getElementById("toggleV2").checked]});
}

function inputChangetoggleV2(){
    document.getElementById("toggleV1").checked = !document.getElementById("toggleV1").checked;
    chrome.storage.local.set({["settings"]: [document.getElementById("toggleV1").checked,document.getElementById("toggleV2").checked]});
}

var isActive = true;
var channel = "";
function inputChange(e) {
    if(isActive){
        document.getElementById("adblocktext").classList.add("disable");
        document.getElementById("watching").textContent = "Disabled on : " + channel;
        
        if(!whiteList.includes(channel)){
            whiteList.push(channel);
        }
        
        chrome.storage.local.set({["whiteList"]: whiteList});
        isActive = false;

    }else{
        document.getElementById("adblocktext").classList.remove("disable");
        document.getElementById("watching").textContent = "Enabled on : " + channel;
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
    chrome.storage.local.get(/* String or Array */["whiteList","settings"], function(items){
        
        if(items.settings !== undefined){
            settings = items.settings;
            console.log(settings);
            if(settings[0]){
                document.getElementById("toggleV1").checked = settings[0];
                document.getElementById("toggleV2").checked = false;
            }else{
                document.getElementById("toggleV1").checked = false;
                document.getElementById("toggleV2").checked =  settings[1];

            }
        
        }else{
            document.getElementById("toggleV2").checked = true;
        }

    if(url.includes("https://www.twitch.tv/")){
        channel = url.replace("https://www.twitch.tv/","").split('/')[0].split('?')[0];

            if(items.whiteList !== undefined){
                whiteList = items.whiteList;
                
                console.log(channel);
                console.log(whiteList);
            
                if(whiteList.includes(channel)){
                    isActive = false;
                    }
                if(isActive){
                    document.getElementById("adblocktext").classList.remove("disable");
                    document.getElementById("watching").textContent = "Enabled on : " + channel;
                    return;
                }else{
                    document.getElementById("adblocktext").classList.add("disable");
                    document.getElementById("watching").textContent = "Disabled on : " + channel;
                    return;
                }
            }
            document.getElementById("watching").textContent = "Enabled on : " + channel;
        }else{
            document.getElementById('adblockbutton').onclick = null;
            document.getElementById("adblocktext").classList.add("disable");
            document.getElementById("watching").textContent = "Awaiting channel";
        }
    });
});


chrome.runtime.sendMessage(
    "log",
    function (response) {
        text = (""+ response);
        document.getElementsByClassName("textarea")[0].value = response.join("\n");
    }
  );