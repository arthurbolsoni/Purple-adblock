var whiteList = [];
document.getElementById("adblockbutton").onclick = inputChange;
document.getElementById("inputApply").onclick = inputProxyUrl;

document.getElementsByClassName("buttonlog")[0].onclick = function (e) {
  var x = document.getElementsByClassName("log")[0];
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
};

//document.getElementById("toggleV1").onclick = inputChangetoggleV1;
document.getElementById("toggleProxy").onclick = inputChangetoggleProxy;

function inputChangetoggleV1() {
  document.getElementById("toggleProxy").checked = !document.getElementById("toggleProxy").checked;
  chrome.storage.local.set({ ["settings"]: [document.getElementById("toggleV1").checked, document.getElementById("toggleProxy").checked] });
}

function inputChangetoggleProxy() {
  console.log(document.getElementById("toggleProxy").checked);
  chrome.storage.local.set({ ["toggleProxy"]: document.getElementById("toggleProxy").checked });
}

function inputProxyUrl() {
  console.log(document.getElementById("inputUrl").value);
  if (document.getElementById("inputUrl").value.includes("{channelname}")) {
    chrome.storage.local.set({ ["proxyUrl"]: document.getElementById("inputUrl").value });
  }
  if (document.getElementById("inputUrl").value == "") {
    chrome.storage.local.set({ ["proxyUrl"]: ""});
  }
}

var isActive = true;
var channel = "";
function inputChange(e) {
  if (isActive) {
    document.getElementById("adblocktext").classList.add("disable");
    document.getElementById("watching").textContent = "Disabled on : " + channel;

    if (!whiteList.includes(channel)) {
      whiteList.push(channel);
    }

    chrome.storage.local.set({ ["whiteList"]: whiteList });
    isActive = false;
  } else {
    document.getElementById("adblocktext").classList.remove("disable");
    document.getElementById("watching").textContent = "Actived on : " + channel;
    for (var i = 0; i < whiteList.length; i++) {
      if (whiteList[i] === channel) {
        whiteList.splice(i, 1);
        i--;
      }
    }

    chrome.storage.local.set({ ["whiteList"]: whiteList });
    isActive = true;
  }
}

chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
  var url = tabs[0].url;
  chrome.storage.local.get(/* String or Array */["whiteList", "toggleProxy", "proxyUrl"], function (items) {
    if (items.proxyUrl) document.getElementById("inputUrl").value = items.proxyUrl;

    document.getElementById("toggleProxy").checked = false;

    if (items.toggleProxy !== undefined) {
      toggleProxy = items.toggleProxy;

      console.log(toggleProxy);
      document.getElementById("toggleProxy").checked = items.toggleProxy;
    }

    if (url.includes("https://www.twitch.tv/")) {
      channel = url.replace("https://www.twitch.tv/", "").split("/")[0].split("?")[0];

      if (items.whiteList !== undefined) {
        whiteList = items.whiteList;

        console.log(channel);
        console.log(whiteList);

        if (whiteList.includes(channel)) {
          isActive = false;
        }
        if (isActive) {
          document.getElementById("adblocktext").classList.remove("disable");
          document.getElementById("watching").textContent = "Actived on : " + channel;
          return;
        } else {
          document.getElementById("adblocktext").classList.add("disable");
          document.getElementById("watching").textContent = "Disabled on : " + channel;
          return;
        }
      }
      document.getElementById("watching").textContent = "Actived on : " + channel;
    } else {
      document.getElementById("adblockbutton").onclick = null;
      document.getElementById("adblocktext").classList.add("disable");
      document.getElementById("watching").textContent = "Waiting channel";
    }
  });
});

chrome.runtime.sendMessage("log", function (response) {
  // document.getElementsByClassName("textarea")[0].value = response.join("\n");
});
