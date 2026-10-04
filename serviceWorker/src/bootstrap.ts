import { AppController } from "./app.controller";
import { bindMessages, createRouter } from "./decorator/handler.decorator";
import { Player } from "./modules/player/player";
import type { WorkerContext, WorkerScope } from "./scope";

// Installs Purple on a worker scope: keeps the original fetch as `request`, creates the controller,
// binds page messages and hooks `fetch`. Has no side effects until called.
export function bootstrapWorker(scope: WorkerScope) {
  scope.request = scope.fetch;
  scope.logger = (x: any) => console.log("[Purple]: ", x);

  const context = scope as WorkerScope & WorkerContext;
  const controller = new AppController(new Player(context), context);
  const router = createRouter(controller);
  bindMessages(scope, controller);

  scope.fetch = async (url: any, options: any) => {
    if (typeof url === "string") {
      const handler = router.resolve(url);
      if (handler) return handler(url, options);
    }
    return context.request.apply(scope, [url, options]);
  };

  scope.appController = controller;
  scope.logger("Script running");

  return { controller, router };
}
