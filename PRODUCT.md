# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Viewers of Twitch live streams who installed Purple from Firefox Add-ons or the Chrome Web Store (Chrome, Edge, Brave, Opera). They open the toolbar popup for a few seconds while a channel plays, to see whether Purple is on for that channel, turn it off or on for that channel, or switch the ad badge.

A smaller group opens it after a problem (a stall, an ad that got through) to export the channel's log and attach it to a GitHub issue.

Userscript users have no popup and use the default settings.

## Product Purpose

Purple blocks the ads Twitch puts in live streams before the player loads them. Success is a stream that plays through ad breaks without an ad, without a still picture, and in the quality the player was on.

## Positioning

Purple runs inside the Twitch player's worker and edits the HLS playlists the player receives. Requests go only to Twitch: no proxy, no other server, no data collected. Open source under the Apache License 2.0.

## Operating Context

- The popup opens from the browser toolbar over a playing Twitch tab, on Chromium (MV3) and Firefox (MV2).
- It acts on the channel of the active tab (`www.twitch.tv/<channel>`, `m.twitch.tv/<channel>`, `www.twitch.tv/popout/<channel>/...`).
- Opened on a tab outside twitch.tv, the popup is a single page with one action, "Go to Twitch", and nothing else.
- On a twitch.tv page that is not a channel (home, directory, settings), the popup has everything but the channel's switch: the badge switch, "Rate Purple" and "Report a bug".
- Bug reports go through the GitHub issue forms in `.github/ISSUE_TEMPLATE/`; an ad that got through goes to the pinned issue #111.

## Capabilities and Constraints

- Per-channel allow list (`whitelist`): Purple off for the channels in it.
- Toolbar badge `AD` on a tab while Purple blocks an ad there (F-30, setting `adBadge`, on by default).
- Planned: a per-channel diagnostic log kept 7 days, recorded locally at all times (stalls of audio or video, ad breaks, ads blocked and not blocked, player version, video decode). It never leaves the machine on its own. It leaves through the popup's "Report a bug": a warning of what the file holds, the choice of a channel, then a `.txt` download and the bug-report form, which asks for that file. There is no separate export entry (the maintainer, 2026-11-21).
- Planned: a button that opens the store page of the current browser (Firefox Add-ons or Chrome Web Store) to rate Purple.
- Popup text in English, and in Brazilian Portuguese when the browser is in Portuguese.
- The popup loads nothing from the network: no web fonts, images or scripts from other hosts (the "requests go only to Twitch" claim). MV3 content security policy: no inline scripts.
- The store listings say "No data collected"; Firefox's manifest declares `data_collection_permissions: none`.

## Brand Commitments

- Name: Purple Adblock (repository), Purple Ads Blocker (store listings).
- Logo: `platform/src/images/logov2-128.png`.
- The popup carries no donation link and no motto; its foot has "Rate Purple" and "Report a bug". "Report a bug" goes through the warning and the channel choice, then saves the channel's log and opens the bug-report form with the channel, version and browser filled in; "Report without a log" opens the form alone (the maintainer, 2026-11-21).
- Voice: plain and factual, as in `docs/store-listing.md`; states what Purple does and stops.
- The popup follows the ad-blocker popup standard, executed straight: it sits alongside uBlock Origin and the extensions the same viewers run on Twitch (7TV, BetterTTV), whose craft level is the bar. It must not look like part of Twitch's own site, nor like a settings form without a main state (the maintainer, 2026-11-21).

## Evidence on Hand

- Store pages and README badges carry live user counts. No testimonials, ratings or quotes are on hand; none are to be written into the popup.

## Product Principles

1. Playback comes first: nothing the popup shows or the log records may slow or break the player.
2. Nothing leaves the machine except Purple's requests to Twitch; a log leaves only as a file the viewer downloads.
3. The popup answers "is Purple on for this channel?" at a glance; everything else is secondary.
4. The log records what went wrong as well as what worked, including ads that got through.
