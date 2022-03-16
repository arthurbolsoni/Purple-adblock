import { inflateFetch } from "./fetch/fetch.inflate";
import { HLS } from "./HLS";
import { onStart } from "./channel/on.channel";
import { on } from "./fetch/on.fetch";
import { current } from "./channel/current.channel";
import { picture } from "./fetch/picture.fetch";

export function app(scope: any, whitelist: any[]) {
  scope.LogPrint = (x: any) => {
    console.log("[Purple]: ", x);
  };

  scope.isAds = (x: string) => {
    return x.toString().includes("stitched-ad") || x.toString().includes("twitch-client-ad");
  };

  scope.realFetch = fetch;
  scope.quality = "";
  scope.whitelist = [];

  scope.addEventListener("message", function (e) {
    if (e.data.type == "setWhitelist") {
      scope.whitelist = e.data.value;
    }
  });

  scope.addEventListener("message", function (e) {
    console.log(e.data.funcName);
    switch (e.data.funcName) {
      case "setQuality": {
        scope.quality = e.data.args[0].name;
        console.log(scope.quality);
        break;
      }
      default: {
        break;
      }
    }
  });

  scope.postMessage({
    type: "getWhitelist",
    value: null
  });

  scope.channel = [];
  scope.actualChannel = "";

  scope.onFetch = on;
  scope.newPicture = picture;

  scope.onStartChannel = onStart;
  scope.currentChannel = current;

  scope.HLS = HLS;

  inflateFetch(scope);
}
app(self, ['test']);