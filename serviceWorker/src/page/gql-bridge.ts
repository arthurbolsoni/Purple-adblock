// F-06 (T-402): the page side of the worker's GQL requests (modules/twitch/page-gql.ts). The request runs with the
// page's original fetch, so Purple's own page hook (the popout rewrite, F-12) does not touch it.
export type GqlRequest = { id: number; body: string; headers: Record<string, string> };

export async function runGqlRequest(fetch: typeof globalThis.fetch, request: GqlRequest) {
  try {
    const response = await fetch("https://gql.twitch.tv/gql#origin=twilight", { method: "POST", headers: request.headers, body: request.body });
    return { id: request.id, status: response.status, body: await response.text() };
  } catch (e) {
    return { id: request.id, status: 0, error: String(e) };
  }
}
