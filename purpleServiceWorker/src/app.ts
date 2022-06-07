import { inflateFetch } from "./fetch/fetch.inflate";
import { HLS } from "./HLS";
import { onStart } from "./channel/on.channel";
import { on } from "./fetch/on.fetch";
import { current } from "./channel/current.channel";
import { picture } from "./fetch/picture.fetch";
import { external } from "./fetch/external.fetch";

export function app(scope: any) {
  scope.LogPrint = (x: any) => {
    console.log("[Purple]: ", x);
  };

  scope.isAds = (x: string) => {
    return x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad") || x.toString().includes("twitch-ad-quartile");
  };

  scope.realFetch = fetch;
  scope.isProxyAuth = false;
  scope.quality = "";
  scope.whitelist = [];

  //receive message from window
  scope.addEventListener("message", function (e) {
    switch (e.data.funcName) {
      case "setQuality": {
        scope.quality = e.data.args[0].name;
        break;
      }
      default: {
        break;
      }
    }

    switch (e.data.type) {
      case "setSetting": {
        if (e.data.value) {
          scope.whitelist = e.data.value.whiteList;
          scope.isProxyAuth = e.data.value.toggleProxy;
        }
        break;
      }
      case "setQuality": {
        scope.quality = e.data.value.name;
        break;
      }
      default: {
        break;
      }
    }
  });

  scope.postMessage({
    type: "init",
    value: null,
  });

  scope.comingAds = false;
  scope.channel = [];
  scope.actualChannel = "";
  scope.currentChannel = current;

  scope.newPicture = picture;
  scope.newExternal = external;
  scope.tunnel = ["eu1.jupter.ga"]  

  scope.onFetch = on;
  scope.onStartChannel = onStart;

  scope.HLS = HLS;

  inflateFetch(scope);
}
app(self);
