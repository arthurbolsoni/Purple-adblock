# Tokens

## Request

`POST https://gql.twitch.tv/gql`, operation `PlaybackAccessToken`.

| Field | Purple 2.6.7 | Brave script (Reported) |
| --- | --- | --- |
| `sha256Hash` | `0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712` | `ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9` (B-014) |
| `variables` | `isLive`, `login`, `isVod`, `vodID`, `playerType` | same plus `platform` (`web`, or `android` for `autoplay`) |
| Full query fallback | `PlaybackAccessToken_Template` (present, unused) | not used |

Observed on 2026-10-07 ([finding](../findings/2026-10-07-l3-server-observations.md#token-requests-per-player-type)): both hashes and the full query return a token for every F-09 player type; only the current hash and the full query honor `platform` (B-030). Purple sends the current hash with `platform` since T-403, and the full query (with `$platform`) when the persisted query fails or returns no token.

## Headers

| Header | Purple 2.6.7 | Brave script (Reported) |
| --- | --- | --- |
| `Client-ID` | `kimne78kx3ncx6brgo4mv6wki5h1ko` | same |
| `Client-Integrity` | from `/integrity` | from page GQL requests |
| `X-Device-Id` / `Device-ID` | not sent | from page GQL requests |
| `Authorization` | not sent | from page GQL requests |
| `Client-Version` | not sent | from page GQL requests |
| `Client-Session-Id` | not sent | from page GQL requests |

Which headers each `playerType` requires, and the error returned without them: unknown (Q-009).

## Responses

| Shape | When | Evidence |
| --- | --- | --- |
| `{ data: { streamPlaybackAccessToken: { value, signature } } }` | most player types | Purple code, Brave script |
| `{ streamPlaybackAccessToken: { value, signature } }` | seen for `embed` | Reported (B-015) |
| GQL "server error" | `embed` requested from the twitch.tv origin | Reported (B-015) |
| `PersistedQueryNotFound` | hash unknown to the server | expected GQL behavior, not observed |

`value` is a JSON string. Purple 2.6.7 logs whether it contains `"hide_ads":true`.

### Token flags

Read from the `token` parameter of the page's usher request (2026-10-07, logged out, 7 loads on 3 channels, no preroll in them; B-020, [finding](../findings/2026-10-07-l3-server-observations.md)). The recorder keeps the boolean flags and `player_type`, `platform`, `version`; ids, ip and channel are not recorded.

| Flag | Value |
| --- | --- |
| `player_type`, `platform`, `version` | `site`, `web`, `3` |
| `server_ads`, `show_ads` | `true` |
| `hide_ads`, `adblock`, `turbo`, `subscriber`, `partner`, `privileged`, `mature`, `blackout_enabled`, `ci_gb`, `extended_history_allowed` | `false` |
| `https_required` | `true` |
