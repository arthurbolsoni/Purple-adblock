// Boots the worker code on a fake worker scope, the way it runs inside the Twitch player worker:
// `fetch` is FakeTwitch, `postMessage` records worker -> page messages, `send` delivers page -> worker messages.
import { bootstrapWorker } from "../../src/bootstrap";
import type { AppController } from "../../src/app.controller";
import type { Player } from "../../src/modules/player/player";
import { FakeTwitch } from "./fake-twitch";

// productDefaults: false (the default) keeps prewarmAtLoad off unless a test's settings set it. With it on by default
// (F-22, T-812) every usher request asks backup tokens, and most tests count the token requests of one break.
export function createWorkerScope(twitch = new FakeTwitch(), { productDefaults = false } = {}) {
  const target = new EventTarget();
  const posted: any[] = [];
  const scope: any = Object.assign(target, {
    fetch: twitch.fetch,
    postMessage: (message: any) => posted.push(message),
  });

  const { controller, router } = bootstrapWorker(scope);
  const player = (controller as any).appService as Player;
  if (!productDefaults) {
    const setSettings = player.setSettings;
    player.setSettings = (setting) => setSettings({ prewarmAtLoad: false, ...setting });
    player.setSettings({ whitelist: [], toggleProxy: false, proxyUrl: "" });
  }

  return {
    scope,
    twitch,
    router,
    posted,
    controller: controller as AppController,
    player,
    // page -> worker message, as index.ts sends it
    send: (funcName: string, value?: any) => target.dispatchEvent(new MessageEvent("message", { data: { funcName, value } })),
    // the hooked fetch, as the player calls it
    fetch: (url: any, init?: any): Promise<Response> => scope.fetch(url, init),
    // fetch + body text
    text: async (url: any, init?: any) => (await scope.fetch(url, init)).text(),
  };
}

export type WorkerHarness = ReturnType<typeof createWorkerScope>;
