import type { WorkerContext } from "../../scope";

// Hash and platform variable as used by Brave's scriptlet (https://github.com/brave/adblock-resources/blob/master/resources/vaft-ublock-origin.js);
// behavior reimplemented, no code copied (docs/research.md). The query is Purple 2.6.7's template with $platform.
const PLAYBACK_ACCESS_TOKEN_HASH = "ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9";
const PLAYBACK_ACCESS_TOKEN_QUERY =
    'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!, $platform: String!) { streamPlaybackAccessToken(channelName: $login, params: {platform: $platform, playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) { value signature __typename } videoPlaybackAccessToken(id: $vodID, params: {platform: $platform, playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) { value signature __typename }}';

export class TwitchService {
    constructor(private readonly scope: WorkerContext) { }

    // PlaybackAccessToken (F-07): the persisted query first; PersistedQueryNotFound or no token in the answer
    // retries once with the full query. `platform` is "android" for autoplay (F-09).
    async playbackAccessToken(channelName: string, playerType: string, integrityToken: string, platform = "web"): Promise<{ token: string; signature: string }> {
        const variables = { isLive: true, login: channelName, isVod: false, vodID: "", playerType, platform };
        const persisted = await this.gql({
            operationName: "PlaybackAccessToken",
            variables,
            extensions: { persistedQuery: { version: 1, sha256Hash: PLAYBACK_ACCESS_TOKEN_HASH } },
        }, integrityToken);
        if (persisted) return persisted;

        const full = await this.gql({ operationName: "PlaybackAccessToken_Template", query: PLAYBACK_ACCESS_TOKEN_QUERY, variables }, integrityToken);
        if (full) return full;
        throw new Error(`PlaybackAccessToken: no token for ${playerType}`);
    }

    // the token from either answer shape: { data: { streamPlaybackAccessToken } } or { streamPlaybackAccessToken } (embed)
    private async gql(body: object, integrityToken: string): Promise<{ token: string; signature: string } | null> {
        const response = await this.scope.request("https://gql.twitch.tv/gql#origin=twilight", {
            method: "POST",
            headers: { "Host": "gql.twitch.tv", "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko", "Client-Integrity": integrityToken },
            body: JSON.stringify(body),
        });
        const answer = await response.json();
        const access = answer?.data?.streamPlaybackAccessToken ?? answer?.streamPlaybackAccessToken;
        return access?.value && access?.signature ? { token: access.value, signature: access.signature } : null;
    }

    async getM3U8(channelName: string, playbackAccessToken: { token: string; signature: string }): Promise<string> {
        const params =
            "allow_source=true&fast_bread=true&p=" +
            Math.floor(Math.random() * 1e7) +
            "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
            playbackAccessToken.signature +
            "&supported_codecs=avc1&token=" +
            playbackAccessToken.token;

        return (await this.scope.request("https://usher.ttvnw.net/api/channel/hls/" + channelName + ".m3u8?" + params)).text();
    }
}