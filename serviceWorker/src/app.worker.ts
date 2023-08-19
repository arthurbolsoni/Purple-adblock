import { AppController } from "./app.controller";
import { Player } from "./modules/player/player";

declare global {
  var request: any;
  var logPrint: any;
  var routerList: { propertyKey: string; match: string; ignore: string | null }[];
  var appController: any;
}

export default function app() {
  global.logPrint = (x: any) => console.log("[Purple]: ", x);
  global.appController = new AppController(new Player());

  global.logPrint("Script running");
}

global.request = global.fetch;
global.fetch = async (url: any, options: any) => {
  if (typeof url === "string") {
    for (var i = 0, len = routerList.length; i < len; i++) {
      if (url.includes(routerList[i].match) && !url.includes(routerList[i].ignore!)) {
        return global.appController[routerList[i].propertyKey](url, options);
      }
    }
  }
  return global.request.apply(this, [url, options]);
};

app();
