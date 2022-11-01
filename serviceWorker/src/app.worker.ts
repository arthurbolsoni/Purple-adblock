import { appController } from "./app.controller";
import { Player } from "./player/player";

declare global {
  var realFetch: any;
  var LogPrint: any;
  var onEventMessage: any;
  var routerList: { propertyKey: string; match: string; ignore: string | null}[];
  var messageList: { propertyKey: string; match: string }[];
  var appController: any;
}

export default function app() {
  global.LogPrint = (x: any) => console.log("[Purple]: ", x);
  global.appController = new appController(new Player());

  global.LogPrint("Script running");
}

global.realFetch = global.fetch;
global.fetch = async (url: any, options: any) => {
  if (typeof url === "string") {
    routerList.forEach((x) => {
      if (url.includes(x.match) && !url.includes(x.ignore!)) {
        return new Promise(async (resolve, reject) => resolve(await global.appController[x.propertyKey](url, options)));
      }
    });
  }
  return global.realFetch.apply(this, [url, options]);
};

global.addEventListener("message", (e: any) => {
  global.messageList.forEach((x) => {
    if (e.data.funcName == x.match) global.appController[x.propertyKey](e.data);
  });
});

app();
