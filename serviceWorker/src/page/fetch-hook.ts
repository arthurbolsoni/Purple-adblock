// The page fetch hook (E9, T-106). Only target URLs are looked at, and only through a clone of the response: the
// page always gets the original Response object, unread (CLAUDE.md rule 4). Browsers reject a body on a 204 or 304
// response, so rebuilding responses would break those requests.

const INTEGRITY = { host: "gql.twitch.tv", pathname: "/integrity" };

export type FetchHookHandlers = {
  // body of the page's https://gql.twitch.tv/integrity response
  onIntegrity: (body: string) => void;
};

export const urlOf = (input: RequestInfo | URL): string => (typeof input === "string" ? input : input instanceof URL ? input.href : input.url);

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
