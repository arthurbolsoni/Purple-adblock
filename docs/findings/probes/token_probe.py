# Probe, 2026-10-07. Asks gql.twitch.tv for a PlaybackAccessToken per backup player type (F-09), from a twitch.tv page,
# with the persisted query hash Purple sends since T-403 (ed230aa1...), the hash of Purple 2.6.7 (0828119d...) and the full
# query. Records status, GraphQL errors, the answer shape and the token's boolean flags; no token value, signature or id.
# Finding: docs/findings/2026-10-07-l3-server-observations.md
# Runs through e2e/lib.py (record mode: no Purple; dedicated profile, logged out, hidden desktop).
# Run: python -u docs/findings/probes/token_probe.py [<channel>]
import json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import nodriver as uc
import lib
import twitch_selectors as sel

CHANNEL = sys.argv[1] if len(sys.argv) > 1 else None
TYPES = [('site', 'web'), ('popout', 'web'), ('frontpage', 'web'), ('picture-by-picture', 'web'), ('mobile_web', 'web'), ('embed', 'web'), ('autoplay', 'android')]

PROBE = """(async () => {
  const CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
  const QUERY = 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!, $platform: String!) { streamPlaybackAccessToken(channelName: $login, params: {platform: $platform, playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) { value signature __typename } videoPlaybackAccessToken(id: $vodID, params: {platform: $platform, playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) { value signature __typename }}';
  const HASHES = { current: "ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9", old: "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712" };
  const flags = (value) => { try { const t = JSON.parse(value); return Object.fromEntries(Object.entries(t).filter(([k, v]) => typeof v === "boolean" || k === "player_type" || k === "platform")); } catch (e) { return null; } };
  const ask = async (body) => {
    const response = await fetch("https://gql.twitch.tv/gql", { method: "POST", headers: { "Client-ID": CLIENT_ID }, body: JSON.stringify(body) });
    let answer = null;
    try { answer = await response.json(); } catch (e) {}
    const access = answer && ((answer.data && answer.data.streamPlaybackAccessToken) || answer.streamPlaybackAccessToken);
    return {
      status: response.status,
      shape: answer && answer.data ? "data" : answer && answer.streamPlaybackAccessToken ? "flat" : "none",
      errors: ((answer && answer.errors) || []).map((e) => String(e.message).slice(0, 100)),
      token: !!(access && access.value),
      flags: access && access.value ? flags(access.value) : null,
    };
  };
  const out = [];
  for (const [playerType, platform] of TYPES) {
    const variables = { isLive: true, login: CHANNEL, isVod: false, vodID: "", playerType, platform };
    for (const [name, hash] of Object.entries(HASHES)) {
      out.push({ playerType, platform, request: "persisted " + name, ...(await ask({ operationName: "PlaybackAccessToken", variables, extensions: { persistedQuery: { version: 1, sha256Hash: hash } } })) });
    }
    out.push({ playerType, platform, request: "full query", ...(await ask({ operationName: "PlaybackAccessToken_Template", query: QUERY, variables })) });
  }
  return out;
})()"""


async def main():
    session = await lib.launch('record')
    try:
        tab = session.tab
        channel = CHANNEL
        if not channel:
            await session.navigate('https://www.twitch.tv/directory/all')
            channel = await lib.wait_for(tab, f"document.querySelector({json.dumps(sel.DIRECTORY_CARD)})?.getAttribute('href')")
        channel = channel.strip('/')
        await session.navigate('https://www.twitch.tv/' + channel)
        await tab.sleep(3)
        probe = PROBE.replace('TYPES', json.dumps(TYPES)).replace('CHANNEL', json.dumps(channel))
        for row in await lib.read(tab, probe):
            print(json.dumps(row, sort_keys=True))
    finally:
        await session.close()


uc.loop().run_until_complete(main())
