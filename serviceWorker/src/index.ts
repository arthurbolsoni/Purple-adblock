//this line gonna import the content from compile worker as string
//@ts-expect-error
import txt from "../dist/app.worker.js?raw";
import { WorkerRegistry } from "./page/worker-registry";

declare global {
  var request: any;
}

const logger = (...args: any[]) => console.log("[Purple]:", ...args);

(function () {
  // every worker created through the injector; on a direct channel load the player creates two
  const registry = new WorkerRegistry();
  let pageHooked = false;

  // the original worker script, or null when it cannot be downloaded
  const readScript = (url: string): string | null => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.send();
      return xhr.status >= 200 && xhr.status < 300 && typeof xhr.responseText === "string" ? xhr.responseText : null;
    } catch {
      return null;
    }
  };

  window.Worker = class WorkerInjector extends Worker {
    constructor(url: string | URL, options?: WorkerOptions) {
      console.log("[Purple]: init " + url.toString());

      const script = readScript(url.toString());
      if (script === null) {
        super(url, options);
        return;
      }

      const newBlobStr = `${txt}
      ${script}`;

      const newBlob = URL.createObjectURL(new Blob([newBlobStr], { type: "text/javascript" }));
      super(newBlob, options);

      this.addEventListener("message", (event) => onWorkerMessage(this, event));
      registry.add(this);

      if (!pageHooked) {
        declareEventWindow();
        integrity();
        pageHooked = true;
      }
    }

    terminate() {
      registry.remove(this);
      super.terminate();
    }
  };

  function integrity() {
    global.request = fetch;
    global.fetch = async (url: any, options: any) => {
      const response = await global.request(url, options);
      const body = await response.text();

      if (url == "https://gql.twitch.tv/integrity") {
        registry.broadcast({ funcName: "setIntegrity", value: body });
      }

      return new Response(body, response);
    };
  }

  // Requests from one worker are answered to that worker; settings and quality go to every worker.
  function onWorkerMessage(worker: Worker, event: MessageEvent) {
    switch (event?.data?.type) {
      case "getSettings": {
        window.postMessage({ type: "getSettings", value: null });
        break;
      }
      case "PlayerQualityChanged": {
        registry.broadcast({ funcName: "setQuality", value: event.data.arg.name });
        break;
      }
      case "pause": {
        worker.postMessage({ funcName: "pause", args: undefined, id: 1 });
        break;
      }
      case "play": {
        worker.postMessage({ funcName: "play", args: undefined, id: 1 });
        break;
      }
    }

    switch (event?.data?.arg?.key) {
      case "quality": {
        if (!event.data.arg.value.name) break;
        console.log("Changed quality by player: " + event.data.arg.value.name);
        registry.broadcast({ funcName: "setQuality", value: event.data.arg.value.name });
        break;
      }
      case "state": {
        worker.postMessage({ funcName: event.data.arg.value });
        break;
      }
    }
  }

  function declareEventWindow() {
    //Event listener from window and extension.
    window.addEventListener("message", (event) => {
      if (event.data?.type === "setSettings") {
        //send settings to every worker
        registry.broadcast({ funcName: "setSettings", value: event.data.value });
      }
    });
  }
})();
