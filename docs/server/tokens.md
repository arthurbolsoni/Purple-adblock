# Tokens

## Request

`POST https://gql.twitch.tv/gql`, operation `PlaybackAccessToken`.

| Field | Purple 2.6.7 | Brave script (Reported) |
| --- | --- | --- |
| `sha256Hash` | `0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712` | `ed230aa1e33e07eebb8928504583da78a5173989fadfb1ac94be06a04f3cdbe9` (B-014) |
| `variables` | `isLive`, `login`, `isVod`, `vodID`, `playerType` | same plus `platform` (`web`, or `android` for `autoplay`) |
| Full query fallback | `PlaybackAccessToken_Template` (present, unused) | not used |

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
