// The page fetch hook (E9, T-106). Only target URLs are looked at, and only through a clone of the response: the
// page always gets the original Response object, unread (CLAUDE.md rule 4). Browsers reject a body on a 204 or 304
// response, so rebuilding responses would break those requests.

import { urlOf } from "../url";
import { isEdgeAds } from "./xhr-hook";

const INTEGRITY = { host: "gql.twitch.tv", pathname: "/integrity" };

export type FetchHookHandlers = {
  // body of the page's https://gql.twitch.tv/integrity response
  onIntegrity: (body: string) => void;
  // T-301 (F-04): requests to edge.ads.twitch.tv get an empty 200 in the page while this returns true
  blockCsai?: () => boolean;
  onCsaiBlocked?: (url: string) => void;
};

export { urlOf };

const isIntegrity = (input: RequestInfo | URL) => {
  try {
    const url = new URL(urlOf(input));
    return url.host === INTEGRITY.host && url.pathname === INTEGRITY.pathname;
  } catch {
    return false;
  }
};

export function createFetchHook(original: typeof fetch, handlers: FetchHookHandlers) {
  return async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let blocked = false;
    try {
      blocked = isEdgeAds(urlOf(input)) && (handlers.blockCsai?.() ?? false);
    } catch {
      blocked = false;
    }
    if (blocked) {
      handlers.onCsaiBlocked?.(urlOf(input));
      return new Response("", { status: 200 });
    }

    const response = await original(input, init);
    try {
      if (isIntegrity(input)) {
        response
          .clone()
          .text()
          .then(handlers.onIntegrity)
          .catch(() => {});
      }
    } catch {
      // a failure here must not reach the page
    }
    return response;
  };
}
