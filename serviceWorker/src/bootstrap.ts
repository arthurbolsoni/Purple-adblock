import { AppController } from "./app.controller";
import { bindMessages, createRouter } from "./decorator/handler.decorator";
import { Player } from "./modules/player/player";
import type { WorkerContext, WorkerScope } from "./scope";
import { urlOf } from "./url";

// Installs Purple on a worker scope: keeps the original fetch as `request`, creates the controller,
// binds page messages and hooks `fetch`. Has no side effects until called.
export function bootstrapWorker(scope: WorkerScope) {
  scope.request = scope.fetch;
  scope.logger = (x: any) => console.log("[Purple]: ", x);

  const context = scope as WorkerScope & WorkerContext;
  const controller = new AppController(new Player(context), context);
  const router = createRouter(controller);
  bindMessages(scope, controller);

  // routed by the input's URL (string, URL or Request); anything else reaches the original fetch with every argument
  scope.fetch = async (...args: any[]) => {
    const [input, options] = args;
    let handler;
    try {
      handler = input != null && router.resolve(urlOf(input));
    } catch {
      handler = undefined;
    }
    if (handler) return handler(input, options);
    return context.request.apply(scope, args as [any, any]);
  };

  scope.appController = controller;
  scope.logger("Script running");

  return { controller, router };
}
