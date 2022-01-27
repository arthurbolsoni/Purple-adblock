import { inflateFetch } from "./fetch.inflate";
import { HLS } from "./HLS";
import { onStart } from "./on.channel";
import { on } from "./on.fetch";

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

    scope.onStartChannel = onStart;
    
    console.log("HLS")
    scope.HLS = HLS;

    console.log("INFLATE FETCH")
    inflateFetch(scope);
  }

  app(self, ["jukes"]);