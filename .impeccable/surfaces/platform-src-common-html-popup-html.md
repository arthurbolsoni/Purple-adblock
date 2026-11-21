---
version: 1
slug: "platform-src-common-html-popup-html"
primary_target: "platform/src/common/html/popup.html"
related_targets: ["platform/src/common/html/export.html"]
---

# Surface: extension popup

Scope: `platform/src/common/html/popup.html` (+ `popup.js`, `css/`) and the export page it opens (`common/html/export.html`). Mode: Operate.

Audience and job: a Twitch viewer opens the toolbar popup for a few seconds over a playing stream to see whether Purple is on for this channel and switch it; after a problem, the same viewer exports that channel's log for a bug report.

States: channel on / channel off; twitch.tv page without a channel (no switch, the rest stays); outside twitch.tv (one page, "Go to Twitch"); export view (warning, then channel, then the download button); today's summary empty / with entries / with an ad that got through.

Constraints: no network in the popup (no web fonts, no remote images); MV3 CSP (no inline scripts); text from `_locales` (en, pt_BR) with the English text in the markup as the fallback; nothing the popup does may touch playback.

Memorable moment: the power button and, under it, today's line for this channel, read in one glance.

Unresolved: none.

## Direction contract

THESIS: The ad-blocker popup standard, executed straight at the level of uBlock Origin, 7TV and BetterTTV: one large per-channel power button, today's numbers for that channel under it, one short switch list, the store and bug-report actions at the foot. It refuses a settings form with no main state and it refuses Twitch's own look.

OWN-WORLD: Dark neutral ground with a slight violet cast, the logo's violet (#6441A5) as the only brand colour, filling the power button when Purple is on and turning to a quiet grey ring when off; red only for an ad that got through, amber only for stalls. System UI sans, tabular figures, authored stroke icons at one weight, hairline separators, 8 px radius family.

STORY: The viewer sees at once that Purple is on for this channel and what it did today; one press turns it off or on; rating Purple and reporting a bug are there without asking; reporting a bug carries the channel's log.

FIRST VIEWPORT: 320 px wide. Top bar: logo, "Purple", version. Centre: an 88 px round power button, the channel name under it, one status line. Below: a four-figure row (breaks, blocked, passed, stalls) for today. Then the badge switch row. Foot: Rate and Report a bug as two equal buttons, and nothing under them. No motto, no donation link and no separate export entry: the log leaves through Report a bug (the maintainer, 2026-11-21).

FORM: the category standard (the standing exit, taken by the maintainer); seed:cc3b6c545f64885f. Signature interaction: the power button's state change, the ring filling with the violet in one 180 ms ease-out, the status line and numbers following.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
