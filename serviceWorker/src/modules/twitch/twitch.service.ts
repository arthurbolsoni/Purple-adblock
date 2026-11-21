import type { WorkerContext } from "../../scope";
import { GQL_URL } from "./page-gql";

// Hash and platform variable as used by Brave's scriptlet (https://github.com/brave/adblock-resources/blob/master/resources/vaft-ublock-origin.js);
// behavior reimplemented, no code copied (docs/research.md). The query is Purple 2.6.7's template with $platform.
const PLAYBACK_ACCESS_TOKEN_HASH = "ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9";
const PLAYBACK_ACCESS_TOKEN_QUERY =
    'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!, $platform: String!) { streamPlaybackAccessToken(channelName: $login, params: {platform: $platform, playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) { value signature __typename } videoPlaybackAccessToken(id: $vodID, params: {platform: $platform, playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) { value signature __typename }}';

type Access = { token: string; signature: string };

// F-08 (T-404): the usher URL of a backup. With the page's own usher request: its path (v1 or v2) and its parameters,
// in their order and as written, with token, sig and p replaced (added when missing); token and sig go through
// encodeURIComponent. Without it, Purple's parameters on the v1 path. Behavior described by Brave's scriptlet, no code
// copied (docs/research.md).
export function usherUrl(channelName: string, access: Access, original?: string): string {
  const replaced: Record<string, string> = {
    token: encodeURIComponent(access.token),
    sig: encodeURIComponent(access.signature),
    p: String(Math.floor(Math.random() * 1e7)),
  };
  if (original) {
    try {
      const url = new URL(original);
      const path = url.pathname.startsWith("/api/v2/") ? "/api/v2/channel/hls/" : "/api/channel/hls/";
      const seen = new Set<string>();
      const params = url.search
        .slice(1)
        .split("&")
        .filter(Boolean)
        .map((pair) => {
          const name = decodeURIComponent(pair.split("=")[0]);
          if (!(name in replaced)) return pair;
          seen.add(name);
          return `${name}=${replaced[name]}`;
        });
      for (const name of Object.keys(replaced)) if (!seen.has(name)) params.push(`${name}=${replaced[name]}`);
      return `https://usher.ttvnw.net${path}${encodeURIComponent(channelName)}.m3u8?${params.join("&")}`;
    } catch {
      // not a URL: Purple's parameters below
    }
  }
  return (
    "https://usher.ttvnw.net/api/channel/hls/" + channelName + ".m3u8?" +
    "allow_source=true&fast_bread=true&p=" + replaced.p +
    "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" + replaced.sig +
    "&supported_codecs=avc1&token=" + replaced.token
  );
}

export class TwitchService {
    constructor(private readonly scope: WorkerContext) { }

    // PlaybackAccessToken (F-07): the persisted query first; PersistedQueryNotFound or no token in the answer
    // retries once with the full query. `platform` is "android" for autoplay (F-09).
    // F-31 (T-606): a request without an integrity token, and one that gives no token (with the HTTP status of the last
    // answer, 0 when none came), are told to the page's diagnostic log
    async playbackAccessToken(channelName: string, playerType: string, integrityToken: string, platform = "web"): Promise<{ token: string; signature: string }> {
        if (!(integrityToken || this.scope.gqlHeaders?.["Client-Integrity"])) this.failed(channelName, "integrity", 0, playerType);
        const variables = { isLive: true, login: channelName, isVod: false, vodID: "", playerType, platform };
        const seen = { status: 0 };
        try {
            const persisted = await this.gql({
                operationName: "PlaybackAccessToken",
                variables,
                extensions: { persistedQuery: { version: 1, sha256Hash: PLAYBACK_ACCESS_TOKEN_HASH } },
            }, integrityToken, seen);
            if (persisted) return persisted;

            const full = await this.gql({ operationName: "PlaybackAccessToken_Template", query: PLAYBACK_ACCESS_TOKEN_QUERY, variables }, integrityToken, seen);
            if (full) return full;
        } catch (e) {
            this.failed(channelName, "token", seen.status, playerType);
            throw e;
        }
        this.failed(channelName, "token", seen.status, playerType);
        throw new Error(`PlaybackAccessToken: no token for ${playerType}`);
    }

    // the token from either answer shape: { data: { streamPlaybackAccessToken } } or { streamPlaybackAccessToken } (embed).
    // T-401 (F-05): with the headers of the page's GQL requests (device id, Authorization, client version and session)
    // `seen.status`: the answer's HTTP status (F-31)
    private async gql(body: object, integrityToken: string, seen = { status: 0 }): Promise<{ token: string; signature: string } | null> {
        // T-402 (F-06): executed by the page when it offers its bridge, else by the worker
        const page = this.scope.gqlHeaders ?? {};
        const headers = { ...page, "Host": "gql.twitch.tv", "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko", "Client-Integrity": integrityToken || page["Client-Integrity"] || "" };
        seen.status = 0;
        const response = this.scope.pageGql
            ? await this.scope.pageGql.request(JSON.stringify(body), headers)
            : await this.scope.request(GQL_URL, { method: "POST", headers, body: JSON.stringify(body) });
        seen.status = typeof response?.status === "number" ? response.status : 0;
        const answer = await response.json();
        const access = answer?.data?.streamPlaybackAccessToken ?? answer?.streamPlaybackAccessToken;
        return access?.value && access?.signature ? { token: access.value, signature: access.signature } : null;
    }

    // `original`: the page's usher request for the channel (F-08). F-31: a failed one (its HTTP status, 0 for a network
    // error) is told to the page's diagnostic log, with the backup type it was for
    async getM3U8(channelName: string, playbackAccessToken: Access, original?: string, playerType?: string): Promise<string> {
        let response: Response;
        try {
            response = await this.scope.request(usherUrl(channelName, playbackAccessToken, original));
        } catch (e) {
            this.failed(channelName, "usher", 0, playerType);
            throw e;
        }
        if (!response.ok) this.failed(channelName, "usher", response.status, playerType);
        return response.text();
    }

    private failed(channel: string, what: "token" | "usher" | "integrity", status: number, playerType?: string) {
        try {
            this.scope.emit?.({ type: "requestFailed", channel, what, status, ...(playerType ? { playerType } : {}) });
        } catch {
            // the diagnostic log is not worth a backup
        }
    }
}