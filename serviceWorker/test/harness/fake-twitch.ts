// In-memory Twitch for level 1 tests, exposed as a `fetch(input, init)` function.
// Nothing here touches the network: an unknown URL gets a 404 and is recorded.

export type CallKind = "usher" | "media" | "gql" | "integrity" | "ads" | "unknown";

export type Call = {
  kind: CallKind;
  url: string;
  method: string;
  headers: Record<string, string>; // lower-case names
  body?: string;
  channel?: string;
  playerType?: string; // usher: from the token FakeTwitch issued; gql: from the request body
};

type TokenReply = { status: number; body: unknown };

const USHER = /^https:\/\/usher\.ttvnw\.net\/api\/(?:v2\/)?channel\/hls\/([^/?#]+)\.m3u8/;
const DEFAULT_PLAYER_TYPE = "site";

// Token values FakeTwitch issues, so the usher request tells which playerType it came from.
export const tokenFor = (playerType: string) => `TOKEN-${playerType}`;
export const sigFor = (playerType: string) => `SIG-${playerType}`;

export class FakeTwitch {
  calls: Call[] = [];
  private masters = new Map<string, string>();
  private media = new Map<string, string[]>();
  private tokens = new Map<string, TokenReply>();

  // Master returned by usher for a channel; `playerType` matches the token issued by `gql` (default `site`).
  master(channel: string, text: string, playerType = DEFAULT_PLAYER_TYPE): this {
    this.masters.set(`${channel}|${playerType}`, text);
    return this;
  }

  // Responses for a media playlist URL (query ignored), one per poll; the last one repeats.
  mediaPlaylist(url: string, ...responses: string[]): this {
    this.media.set(stripQuery(url), [...responses]);
    return this;
  }

  // GQL reply for a playerType. Without one, `PlaybackAccessToken` gets `tokenFor(playerType)` / `sigFor(playerType)`.
  token(playerType: string, body: unknown, status = 200): this {
    this.tokens.set(playerType, { status, body });
    return this;
  }

  callsOf(kind: CallKind): Call[] {
    return this.calls.filter((call) => call.kind === kind);
  }

  fetch = async (input: any, init?: any): Promise<Response> => {
    const request = await readRequest(input, init);
    const { url } = request;

    const usher = USHER.exec(url);
    if (usher) {
      const channel = decodeURIComponent(usher[1]);
      const token = new URL(url).searchParams.get("token") ?? "";
      const playerType = token.startsWith("TOKEN-") ? token.slice("TOKEN-".length) : DEFAULT_PLAYER_TYPE;
      this.record("usher", request, { channel, playerType });
      const text = this.masters.get(`${channel}|${playerType}`);
      return text === undefined ? new Response("", { status: 404 }) : new Response(text);
    }

    if (url.startsWith("https://gql.twitch.tv/integrity")) {
      this.record("integrity", request);
      return Response.json({ token: "INTEGRITY", expiration: 0, request_id: "REQUEST_ID" });
    }

    if (url.startsWith("https://gql.twitch.tv/gql")) {
      return this.gql(request);
    }

    if (/^https:\/\/edge\.ads\.twitch\.tv\//.test(url)) {
      this.record("ads", request);
      return new Response("");
    }

    const queue = this.media.get(stripQuery(url));
    if (queue) {
      this.record("media", request);
      const text = queue.length > 1 ? queue.shift()! : queue[0];
      return new Response(text);
    }

    this.record("unknown", request);
    return new Response("", { status: 404 });
  };

  private gql(request: Omit<Call, "kind">): Response {
    const body = JSON.parse(request.body || "null");
    const operations: any[] = Array.isArray(body) ? body : [body];
    const playerType = operations.find((op) => op?.operationName?.startsWith("PlaybackAccessToken"))?.variables?.playerType;
    this.record("gql", request, { playerType });

    let status = 200;
    const replies = operations.map((op) => {
      if (!op?.operationName?.startsWith("PlaybackAccessToken")) return { data: {} };
      const type = op.variables?.playerType ?? DEFAULT_PLAYER_TYPE;
      const configured = this.tokens.get(type);
      if (configured) {
        status = configured.status;
        return configured.body;
      }
      return { data: { streamPlaybackAccessToken: { value: tokenFor(type), signature: sigFor(type), __typename: "PlaybackAccessToken" } } };
    });

    return Response.json(Array.isArray(body) ? replies : replies[0], { status });
  }

  private record(kind: CallKind, request: Omit<Call, "kind">, extra: Partial<Call> = {}) {
    this.calls.push({ kind, ...request, ...extra });
  }
}

const stripQuery = (url: string) => url.split(/[?#]/)[0];

async function readRequest(input: any, init?: any): Promise<Omit<Call, "kind">> {
  if (input instanceof Request) {
    return {
      url: input.url,
      method: input.method,
      headers: Object.fromEntries(input.headers),
      body: input.method === "GET" ? undefined : await input.text(),
    };
  }
  return {
    url: String(input),
    method: (init?.method ?? "GET").toUpperCase(),
    headers: Object.fromEntries(new Headers(init?.headers ?? {})),
    body: init?.body === undefined ? undefined : String(init.body),
  };
}
