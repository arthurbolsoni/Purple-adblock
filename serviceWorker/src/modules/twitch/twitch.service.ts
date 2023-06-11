export class TwitchService {
    constructor(private readonly integrityToken: string) { }

    async playbackAccessToken(channelName: string, playerType: string, integrityToken: string): Promise<{ token: string; signature: string }> {
        const body = {
            operationName: 'PlaybackAccessToken',
            variables: {
                isLive: true,
                login: channelName,
                isVod: false,
                vodID: '',
                playerType: playerType
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: '0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712'
                }
            }
        }

        const gql = await global.request("https://gql.twitch.tv/gql#origin=twilight", {
            method: "POST",
            headers: { "Host": "gql.twitch.tv", "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko", "Client-Integrity": integrityToken },
            body: JSON.stringify(body),
        });

        const streamDataAccess = await gql.json();
        return { token: streamDataAccess.data.streamPlaybackAccessToken.value, signature: streamDataAccess.data.streamPlaybackAccessToken.signature };
    }

    async playbackAccessToken_Template(channelName: string, playerType: string): Promise<{ token: string; signature: string }> {
        const query =
            'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) { streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) { value signature __typename } videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) { value signature __typename }}';
        const body = {
            operationName: "PlaybackAccessToken_Template",
            query: query,
            variables: {
                isLive: true,
                isVod: false,
                vodID: "",
                login: channelName,
                playerType: playerType,
            },
        };

        const gql = await global.request("https://gql.twitch.tv/gql", {
            method: "POST",
            headers: { "Host": "gql.twitch.tv", "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
            body: JSON.stringify(body),
        });
        const streamDataAccess = await gql.json();

        return { token: streamDataAccess.data.streamPlaybackAccessToken.value, signature: streamDataAccess.data.streamPlaybackAccessToken.signature };
    }

    async getM3U8(channelName: string, playbackAccessToken: { token: string; signature: string }): Promise<string> {
        const params =
            "allow_source=true&fast_bread=true&p=" +
            Math.floor(Math.random() * 1e7) +
            "&player_backend=mediaplayer&playlist_include_framerate=true&reassignments_supported=false&sig=" +
            playbackAccessToken.signature +
            "&supported_codecs=avc1&token=" +
            playbackAccessToken.token;

        return (await global.request("https://usher.ttvnw.net/api/channel/hls/" + channelName + ".m3u8?" + params)).text();
    }
}