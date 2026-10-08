// The page fetch hook (E9, T-106). Only target URLs are looked at, and only through a clone of the response: the
// page always gets the original Response object, unread (CLAUDE.md rule 4). Browsers reject a body on a 204 or 304
// response, so rebuilding responses would break those requests.

import { urlOf } from "../url";
import { isEdgeAds } from "./xhr-hook";

const INTEGRITY = { host: "gql.twitch.tv", pathname: "/integrity" };
const GQL = { host: "gql.twitch.tv", pathname: "/gql" };

// T-401 (F-05): headers of the page's GQL requests that the worker's backup token requests reuse, by the name they are
// sent under; the device id also comes as Device-ID
export const GQL_HEADERS = ["Client-Integrity", "X-Device-Id", "Authorization", "Client-Version", "Client-Session-Id"];
const ALIASES: Record<string, string[]> = { "X-Device-Id": ["Device-ID"] };

export type FetchHookHandlers = {
  // body of the page's https://gql.twitch.tv/integrity response
  onIntegrity: (body: string) => void;
  // T-401: the GQL_HEADERS known so far, each time a page GQL request changes one of them
  onGqlHeaders?: (headers: Record<string, string>) => void;
  // T-301 (F-04): requests to edge.ads.twitch.tv get an empty 200 in the page while this returns true
  blockCsai?: () => boolean;
  onCsaiBlocked?: (url: string) => void;
};

export { urlOf };

const isTarget = (input: RequestInfo | URL, target: { host: string; pathname: string }) => {
  try {
    const url = new URL(urlOf(input));
    return url.host === target.host && url.pathname === target.pathname;
  } catch {
    return false;
  }
};
const isIntegrity = (input: RequestInfo | URL) => isTarget(input, INTEGRITY);

// GQL_HEADERS of a request: the Request's own headers, then the init's (init wins, as in fetch)
function gqlHeaders(input: RequestInfo | URL, init?: RequestInit): Record<string, string> {
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
  const found: Record<string, string> = {};
  for (const name of GQL_HEADERS) {
    const value = [name, ...(ALIASES[name] ?? [])].map((alias) => headers.get(alias)).find((v) => v);
    if (value) found[name] = value;
  }
  return found;
}

export function createFetchHook(original: typeof fetch, handlers: FetchHookHandlers) {
  let known: Record<string, string> = {};
  return async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      if (handlers.onGqlHeaders && isTarget(input, GQL)) {
        const merged = { ...known, ...gqlHeaders(input, init) };
        if (GQL_HEADERS.some((name) => merged[name] !== known[name])) {
          known = merged;
          handlers.onGqlHeaders({ ...merged });
        }
      }
    } catch {
      // a failure here must not reach the page
    }

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
