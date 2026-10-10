// Boots the worker code on a fake worker scope, the way it runs inside the Twitch player worker:
// `fetch` is FakeTwitch, `postMessage` records worker -> page messages, `send` delivers page -> worker messages.
import { bootstrapWorker } from "../../src/bootstrap";
import type { AppController } from "../../src/app.controller";
import type { Player } from "../../src/modules/player/player";
import { FakeTwitch } from "./fake-twitch";

// productDefaults: false (the default) runs the worker with the settings most tests were written for, unless a test's
// settings set them: prewarmAtLoad off (on by default since T-812: every usher request asks backup tokens, and most
// tests count the token requests of one break), alignBackupSequence off (on by default since T-817: the fixtures'
// backups number the stream from other bases) and pausePlayOnBreaks on (off by default since T-809: the break tests
// check E6's pause and play). Tests of the defaults pass productDefaults: true.
export const TEST_SETTINGS = { prewarmAtLoad: false, alignBackupSequence: false, pausePlayOnBreaks: true };

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
    player.setSettings = (setting) => setSettings({ ...TEST_SETTINGS, ...setting });
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
