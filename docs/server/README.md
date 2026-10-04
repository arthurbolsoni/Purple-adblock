# Twitch server reverse engineering

What Twitch's servers send to the player, written down so the level 2 server (`sim/`, Rust) can reproduce it. Each behavior has an ID (B-xxx), its evidence and whether the server reproduces it yet.

## Files

| File | Content |
| --- | --- |
| [behaviors.md](behaviors.md) | catalog of behaviors B-xxx: statement, evidence, source, reproduced by `sim/` |
| [endpoints.md](endpoints.md) | hosts, paths, parameters, headers, response codes |
| [playlists.md](playlists.md) | master and media playlist format: tags, attributes, segment URIs |
| [ads.md](ads.md) | ad breaks: SSAI, CSAI, markers, backup player types |
| [tokens.md](tokens.md) | GQL `PlaybackAccessToken`: request, headers, response shapes, errors |
| [techniques.md](techniques.md) | ways to make twitch.tv show a behavior (TR-xxx), with every attempt and its outcome |
| [open-questions.md](open-questions.md) | what is not known yet (Q-xxx) and how to find out |

## Evidence levels

| Level | Meaning |
| --- | --- |
| Observed | seen by us in a level 3 session; links to a file in `docs/findings/` |
| Reported | stated by an external source we use (Brave's scriptlet, its upstream changelog); not yet seen by us |
| Inferred | follows from observed data but was not checked directly |

A Reported or Inferred behavior moves to Observed once a level 3 session shows it. A behavior that stops matching what Twitch does gets a dated note, not a deletion.

## Method

1. Level 3 session on twitch.tv (nodriver + Edge, dedicated profile) with the recorder, using one or more techniques from `techniques.md`.
2. Dated finding in `docs/findings/` with counts and the probe used.
3. New or updated entry in `behaviors.md` and the topic file.
4. Scenario in `sim/scenarios/` that reproduces it; the entry's "sim" column gets the scenario ID.
5. Level 2 test (isolated page + real player + `sim/`) and, where the logic allows, a level 1 fixture.

Recordings stay in `~/purple-recordings/`. Only sanitized excerpts (no tokens, ids or media) enter this folder.
