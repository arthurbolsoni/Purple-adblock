//this line gonna import the content from compile worker as string
//@ts-expect-error
import txt from "../dist/app.worker.js?raw";
import { createFetchHook } from "./page/fetch-hook";
import { installXhrHook } from "./page/xhr-hook";
import { WorkerRegistry } from "./page/worker-registry";

declare global {
  var request: any;
  // F-17: the worker's debug events, created only with `debug` on
  var __purple: { events: any[] } | undefined;
}

const EVENT_LIMIT = 500;
// the `debug` setting, from the content script's setSettings (the userscript has no settings: off)
let debug = false;
const logger = (...args: any[]) => debug && console.log("[Purple]:", ...args);
// F-04: answer edge.ads.twitch.tv in the page (default on, so the userscript blocks too)
let blockCsai = true;
// F-12: the page's PlaybackAccessToken asks for popout (default on, so the userscript does it too)
let forcePopoutToken = true;
const csaiBlocked: Record<string, number> = {};

(function () {
  // every worker created through the injector; on a direct channel load the player creates two
  const registry = new WorkerRegistry();

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

  class WorkerInjector extends Worker {
    private injected = false;
    private started = false;
    // what the registry sends to: Purple's messages to its code in this worker
    readonly purple = { postMessage: (message: any) => this.sendFromPurple(message) };

    constructor(url: string | URL, options?: WorkerOptions) {
      logger("init " + url.toString());

      const script = readScript(url.toString());
      if (script === null) {
        super(url, options);
        return;
      }

      const newBlobStr = `${txt}
      ${script}`;

      const newBlob = URL.createObjectURL(new Blob([newBlobStr], { type: "text/javascript" }));
      super(newBlob, options);
      this.injected = true;

      this.addEventListener("message", (event) => onWorkerMessage(this, event));
    }

    // The page's own messages (the player's RPC). The first one is the player's init: nothing from Purple may reach
    // the worker before it (a setIntegrity sent first killed the player worker on twitch.tv), so the worker joins
    // the registry, and gets the current settings, integrity and quality, only then.
    postMessage(message: any, ...rest: any[]) {
      super.postMessage(message, ...(rest as [any]));
      if (this.injected && !this.started) {
        this.started = true;
        registry.add(this.purple);
      }
    }

    // Purple's messages; dropped until the player has sent its first one
    sendFromPurple(message: any) {
      if (this.started) super.postMessage(message);
    }

    terminate() {
      registry.remove(this.purple);
      super.terminate();
    }
  }
  window.Worker = WorkerInjector;

  function integrity() {
    global.request = fetch;
    global.fetch = createFetchHook(global.request, {
      onIntegrity: (body) => registry.broadcast({ funcName: "setIntegrity", value: body }),
      onGqlHeaders: (headers) => registry.broadcast({ funcName: "setGqlHeaders", value: headers }),
      forcePopoutToken: () => forcePopoutToken,
      blockCsai: () => blockCsai,
      onCsaiBlocked,
    });
    installXhrHook(XMLHttpRequest, () => blockCsai, onCsaiBlocked);
  }

  // T-301: blocked requests counted per break type (`bp`: preroll, midroll)
  function onCsaiBlocked(url: string) {
    let bp = "other";
    try {
      bp = new URL(url).searchParams.get("bp") || "other";
    } catch {}
    csaiBlocked[bp] = (csaiBlocked[bp] ?? 0) + 1;
    logger("CSAI request blocked:", bp, csaiBlocked);
    recordEvent({ type: "csaiBlocked", bp, count: csaiBlocked[bp], at: Date.now() });
  }

  // Requests from one worker are answered to that worker; settings and quality go to every worker.
  function onWorkerMessage(worker: WorkerInjector, event: MessageEvent) {
    switch (event?.data?.type) {
      case "purpleEvent": {
        recordEvent(event.data.event);
        break;
      }
      case "getSettings": {
        window.postMessage({ type: "getSettings", value: null });
        break;
      }
      case "PlayerQualityChanged": {
        registry.broadcast({ funcName: "setQuality", value: event.data.arg.name });
        break;
      }
      case "pause": {
        worker.sendFromPurple({ funcName: "pause", args: undefined, id: 1 });
        break;
      }
      case "play": {
        worker.sendFromPurple({ funcName: "play", args: undefined, id: 1 });
        break;
      }
    }

    switch (event?.data?.arg?.key) {
      case "quality": {
        if (!event.data.arg.value.name) break;
        logger("Changed quality by player: " + event.data.arg.value.name);
        registry.broadcast({ funcName: "setQuality", value: event.data.arg.value.name });
        break;
      }
      case "state": {
        worker.sendFromPurple({ funcName: event.data.arg.value });
        break;
      }
    }
  }

  function recordEvent(purpleEvent: any) {
    if (!debug || !window.__purple) return;
    const events = window.__purple.events;
    events.push(purpleEvent);
    if (events.length > EVENT_LIMIT) events.splice(0, events.length - EVENT_LIMIT);
  }

  // installed when the bundle loads: settings and an /integrity response that come before the first worker are
  // kept by the registry and sent to the workers when they are created
  declareEventWindow();
  integrity();

  function declareEventWindow() {
    //Event listener from window and extension.
    window.addEventListener("message", (event) => {
      if (event.data?.type === "setSettings") {
        debug = event.data.value?.debug === true;
        blockCsai = event.data.value?.blockCsai !== false;
        forcePopoutToken = event.data.value?.forcePopoutToken !== false;
        if (debug && !window.__purple) window.__purple = { events: [] };
        //send settings to every worker
        registry.broadcast({ funcName: "setSettings", value: event.data.value });
      }
    });
  }
})();
