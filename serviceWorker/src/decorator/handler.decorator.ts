import type { WorkerScope } from "../scope";

// A route matches a URL containing `match`, or, for a function, a URL it accepts (called on the controller).
export type FetchMatch = string | ((this: any, url: string) => boolean);
export type FetchRoute = { propertyKey: string; match: FetchMatch; ignore: string | null };
export type MessageRoute = { propertyKey: string; match: string };
export type FetchHandler = (url: string, options: any) => Promise<Response>;

const FETCH_ROUTES = Symbol("purple:fetch-routes");
const MESSAGE_ROUTES = Symbol("purple:message-routes");

// Metadata lives on the class, so every instance gets its own router and listeners.
function ownList<T>(target: any, key: symbol): T[] {
  const ctor = target.constructor;
  if (!Object.prototype.hasOwnProperty.call(ctor, key)) {
    Object.defineProperty(ctor, key, { value: [...(ctor[key] ?? [])], enumerable: false });
  }
  return ctor[key];
}

export const Fetch = (match: FetchMatch, ignore: string | null = null): MethodDecorator => {
  return (target, propertyKey) => {
    ownList<FetchRoute>(target, FETCH_ROUTES).push({ propertyKey: propertyKey as string, match: match, ignore: ignore });
  };
};

export const Message = (match: string): MethodDecorator => {
  return (target, propertyKey) => {
    ownList<MessageRoute>(target, MESSAGE_ROUTES).push({ propertyKey: propertyKey as string, match: match });
  };
};

export const getFetchRoutes = (controller: object): FetchRoute[] => [...((controller.constructor as any)[FETCH_ROUTES] ?? [])];

export const getMessageRoutes = (controller: object): MessageRoute[] => [...((controller.constructor as any)[MESSAGE_ROUTES] ?? [])];

export type Router = {
  routes: FetchRoute[];
  routeFor: (url: string) => FetchRoute | undefined;
  resolve: (url: string) => FetchHandler | undefined;
};

// Routes are checked in declaration order; the first match wins.
export function createRouter(controller: any): Router {
  const routes = getFetchRoutes(controller);
  const matches = (route: FetchRoute, url: string) => (typeof route.match === "function" ? route.match.call(controller, url) : url.includes(route.match));
  // Known bug kept as in 2.6.7: a null `ignore` is tested as the text "null" (fixed by T-102).
  const routeFor = (url: string) => routes.find((route) => matches(route, url) && !url.includes(route.ignore!));
  return {
    routes,
    routeFor,
    resolve(url: string) {
      const route = routeFor(url);
      return route && ((url: string, options: any) => controller[route.propertyKey](url, options));
    },
  };
}

// One listener on the scope dispatches page -> worker messages by `funcName`.
export function bindMessages(scope: Pick<WorkerScope, "addEventListener">, controller: any): void {
  const routes = getMessageRoutes(controller);
  scope.addEventListener("message", (e: any) => {
    for (const route of routes) {
      if (e?.data?.funcName == route.match) {
        controller[route.propertyKey](e.data);
      }
    }
  });
}
