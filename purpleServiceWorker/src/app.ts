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
    scope.realFetch = fetch;
    scope.quality = "";
    scope.addEventListener("message", function (e) {
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
  
    scope.channel = [];
    scope.actualChannel = "";
    scope.whitelist = whitelist;

    scope.onFetch = on;
    scope.newPicture = picture;

    scope.onStartChannel = onStart;
    scope.currentChannel = current;
    
    scope.HLS = HLS;

    inflateFetch(scope);
  }

  app(self, ["jukes"]);