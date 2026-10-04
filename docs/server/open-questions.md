# Open questions

Each question names the level 3 session or probe that answers it. Answers go to a dated file in `docs/findings/` and to the matching behavior in `behaviors.md`.

| ID | Question | How to find out |
| --- | --- | --- |
| Q-001 | How often does a logged-out or logged-in viewer get a preroll when opening a channel? | Recorder over N channel opens per profile state; count breaks |
| Q-002 | Poll interval per variant and segment duration | Recorder with timestamps per media playlist request; `EXTINF` durations |
| Q-003 | When does `EXT-X-TWITCH-PREFETCH` (or `EXT-X-PART`) appear: logged in, low-latency setting, channel type? | Sessions varying login and the player's low-latency option |
| Q-004 | During a break, which backup `playerType`s return ads, and how soon after the main stream? | With Purple on, record every backup token and playlist; mark ad/live per poll |
| Q-005 | Exact usher query sent by the Twitch page, and v1 or v2 path | Log the full usher URL (sanitized) in the recorder |
| Q-006 | What changes in the usher response with and without `parent_domains`? | Two usher requests with the same token, with and without the parameter |
| Q-007 | Do HEVC/AV1 channels use fMP4 with `EXT-X-MAP`, and how are codecs listed in the master? | Session on a channel with enhanced broadcasting |
| Q-008 | CSAI: when does `edge.ads.twitch.tv` get called, with which parameters, and what does the playlist look like at that moment? | Recorder with `edge.ads.twitch.tv` in the patterns during long sessions |
| Q-009 | Headers each `playerType` needs for `PlaybackAccessToken`, and the errors without them | Token requests from the recorder with header subsets |
| Q-010 | Does the server change behavior by region or IP? | Out of reach from one machine; note anything that hints at it |
| Q-011 | Keys of the 23 `EXT-X-SESSION-DATA` lines | Save the sanitized master in the recorder |
| Q-012 | Do the observed preroll segment URIs match `/adsquared/`, `/_404/` or `/processing`? | Save sanitized ad segment paths in the recorder |
