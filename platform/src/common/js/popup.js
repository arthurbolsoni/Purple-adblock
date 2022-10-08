const storage = () => (typeof browser === "undefined" ? chrome.storage.local : browser.storage.local);
const tabs = () => (typeof browser === "undefined" ? chrome.tabs : browser.tabs);

let whitelist = [];
var channel = "";

document.getElementById("adblockbutton").onclick = buttonStatusChange;
document.getElementById("inputApply").onclick = inputProxyUrl;
document.getElementById("buttonSettings").onclick = buttonSettings;
document.getElementById("toggleProxy").onclick = inputChangetoggleProxy;

function inputChangetoggleProxy() {
  console.log(document.getElementById("toggleProxy").checked);
  storage().set({ ["toggleProxy"]: document.getElementById("toggleProxy").checked });
}

function buttonSettings() {
  let x = document.getElementsByClassName("settings")[0];
  x.style.display === "none" ? (x.style.display = "block") : (x.style.display = "none");
}

function inputProxyUrl() {
  console.log(document.getElementById("inputUrl").value);
  if (document.getElementById("inputUrl").value.includes("{channelname}")) {
    storage().set({ ["proxyUrl"]: document.getElementById("inputUrl").value });
  }
  if (document.getElementById("inputUrl").value == "") {
    storage().set({ ["proxyUrl"]: "" });
  }
}

function buttonStatusChange() {
  whitelist.includes(channel) ? whitelist.splice(whitelist.indexOf(channel), 1) : whitelist.push(channel);
  storage().set({ ["whitelist"]: whitelist });

  if (whitelist.includes(channel)) {
    document.getElementById("adblocktext").classList.add("disable");
    document.getElementById("watching").textContent = "Disabled on : " + channel;
  } else {
    document.getElementById("adblocktext").classList.remove("disable");
    document.getElementById("watching").textContent = "Actived on : " + channel;
  }
}

tabs().query({ active: true, lastFocusedWindow: true }, function (tabs) {
  if (!tabs.length) return;

  storage().get(["whitelist", "toggleProxy", "proxyUrl"], (items) => {
    if (items.proxyUrl) document.getElementById("inputUrl").value = items.proxyUrl;

    const proxyToggle = document.getElementById("toggleProxy");
    proxyToggle.checked = items.toggleProxy == undefined ? true : items.toggleProxy;

    document.getElementById("adblocktext").classList.add("disable");
    document.getElementById("watching").textContent = "Waiting channel";

    if (!tabs[0].url.includes("https://www.twitch.tv/")) {
      document.getElementById("adblockbutton").onclick = null;
      return;
    }

    channel = tabs[0].url.replace("https://www.twitch.tv/", "").split("/")[0].split("?")[0];

    whitelist = items.whitelist !== undefined ? items.whitelist : []

    if (!whitelist.includes(channel)) {
      document.getElementById("adblocktext").classList.remove("disable");
      document.getElementById("watching").textContent = "Actived on : " + channel;
      return;
    } else {
      document.getElementById("adblocktext").classList.add("disable");
      document.getElementById("watching").textContent = "Disabled on : " + channel;
      return;
    }
  });
});
