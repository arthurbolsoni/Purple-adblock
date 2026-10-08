const storage = () => (typeof browser === "undefined" ? chrome.storage.local : browser.storage.local);
const tabs = () => (typeof browser === "undefined" ? chrome.tabs : browser.tabs);

let whitelist = [];
var channel = "";

document.getElementById("adblockbutton").onclick = buttonStatusChange;
document.getElementById("inputApply").onclick = inputProxyUrl;
// document.getElementById("buttonSettings").onclick = buttonSettings;
document.getElementById("toggleProxy").onclick = inputChangetoggleProxy;

// T-603: the channel of www.twitch.tv/<channel>, m.twitch.tv/<channel> and www.twitch.tv/popout/<channel>/..., in lower
// case as the worker reads it from the usher path; "" for any other URL
function channelFromUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "";
  }
  if (parsed.protocol !== "https:" || !["www.twitch.tv", "m.twitch.tv", "twitch.tv"].includes(parsed.hostname)) return "";
  const parts = parsed.pathname.split("/").filter(Boolean);
  return ((parts[0] === "popout" ? parts[1] : parts[0]) || "").toLowerCase();
}

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
    document.getElementById("watching").textContent = "Activated on : " + channel;
  }
}

tabs().query({ active: true, lastFocusedWindow: true }, function (tabs) {
  if (!tabs.length) return;

  storage().get(["whitelist", "toggleProxy", "proxyUrl"], (items) => {
    if (items.proxyUrl) document.getElementById("inputUrl").value = items.proxyUrl;

    const proxyToggle = document.getElementById("toggleProxy");
    proxyToggle.checked = items.toggleProxy == undefined ? true : items.toggleProxy;

    document.getElementById("adblocktext").classList.add("disable");
    document.getElementById("watching").textContent = "Waiting for channel";

    channel = channelFromUrl(tabs[0].url);
    if (!channel) {
      document.getElementById("adblockbutton").onclick = null;
      return;
    }

    whitelist = items.whitelist !== undefined ? items.whitelist : [];

    if (!whitelist.includes(channel)) {
      document.getElementById("adblocktext").classList.remove("disable");
      document.getElementById("watching").textContent = "Activated on : " + channel;
      return;
    } else {
      document.getElementById("adblocktext").classList.add("disable");
      document.getElementById("watching").textContent = "Disabled on : " + channel;
      return;
    }
  });
});
