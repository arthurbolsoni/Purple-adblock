// Boots the worker code on a fake worker scope, the way it runs inside the Twitch player worker:
// `fetch` is FakeTwitch, `postMessage` records worker -> page messages, `send` delivers page -> worker messages.
import { bootstrapWorker } from "../../src/bootstrap";
import type { AppController } from "../../src/app.controller";
import type { Player } from "../../src/modules/player/player";
import { FakeTwitch } from "./fake-twitch";

export function createWorkerScope(twitch = new FakeTwitch()) {
  const target = new EventTarget();
  const posted: any[] = [];
  const scope: any = Object.assign(target, {
    fetch: twitch.fetch,
    postMessage: (message: any) => posted.push(message),
  });

  const { controller, router } = bootstrapWorker(scope);

  return {
    scope,
    twitch,
    router,
    posted,
    controller: controller as AppController,
    player: (controller as any).appService as Player,
    // page -> worker message, as index.ts sends it
    send: (funcName: string, value?: any) => target.dispatchEvent(new MessageEvent("message", { data: { funcName, value } })),
    // the hooked fetch, as the player calls it
    fetch: (url: any, init?: any): Promise<Response> => scope.fetch(url, init),
    // fetch + body text
    text: async (url: any, init?: any) => (await scope.fetch(url, init)).text(),
  };
}

export type WorkerHarness = ReturnType<typeof createWorkerScope>;
