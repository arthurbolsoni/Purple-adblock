//this line gonna import the content from compile worker as string
//@ts-expect-error
import txt from "../dist/app.worker.js";

(function () {
  let mainWorker: any;

  window.Worker = class WorkerInjector extends Worker {
    constructor(twitchBlobUrl: any) {
      console.log("new worker intance " + twitchBlobUrl);

      if (twitchBlobUrl == "") super(twitchBlobUrl);
      console.log("[Purple]: init " + twitchBlobUrl);

      const newBlobStr = `${txt}
      importScripts('${twitchBlobUrl}');`;

      super(URL.createObjectURL(new Blob([newBlobStr], { type: "text/javascript" })));
      mainWorker = this;
      mainWorker.declareEventWorker();
      mainWorker.declareEventWindow();
    }

    declareEventWorker() {
      this.addEventListener("message", (event) => {
        // if (typeof (event.data.type) !== "string") console.log(event.data.arg);
        // if (typeof (event.data.type) !== "string") console.log(event.data);

        switch (event?.data?.type) {
          case "getSettings": {
            window.postMessage({ type: "getSettings", value: null });
            break;
          }
          case "PlayerQualityChanged": {
            mainWorker.postMessage({ funcName: "setQuality", value: event.data.arg.name });
            break;
          }
          case "pause": {
            mainWorker.postMessage({ funcName: "pause", args: undefined, id: 1 });
            break;
          }
          case "play": {
            mainWorker.postMessage({ funcName: "play", args: undefined, id: 1 });
            break;
          }
          default: {
            break;
          }
        }

        switch (event?.data?.arg?.key) {
          case "quality": {
            if (!event.data.arg.value.name) break;
            console.log("Changed quality by player: " + event.data.arg.value.name);
            mainWorker.postMessage({ funcName: "setQuality", value: event.data.arg.value.name });
            break;
          }
          case "state": {
            mainWorker.postMessage({ funcName: event.data.arg.value });
          }
          default: {
            break;
          }
        }

        switch (event?.data?.arg?.name) {
          case "pause": {
            break;
          }
          case "play": {
            break;
          }
          default: {
            break;
          }
        }
      });
    }

    declareEventWindow() {
      //Event listener from window and extension.
      window.addEventListener("message", (event) => {
        switch (event.data.type) {
          case "setSettings": {
            //send settings to worker
            mainWorker.postMessage({ funcName: "setSettings", value: event.data.value });
          }
        }
      });
    }
  };
})();
