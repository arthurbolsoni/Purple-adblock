---
name: Purple Adblock
description: The toolbar popup and log export page of a Twitch live-stream ad blocker. Dark, compact, one violet.
colors:
  night-ground: "#17161c"
  raised-slate: "#201e27"
  raised-slate-hover: "#2a2832"
  hairline: "#2e2c37"
  hairline-strong: "#45424f"
  idle-ring: "#6a6776"
  moon-text: "#ecebf1"
  dusk-muted: "#a7a4b3"
  purple-violet: "#6441a5"
  purple-violet-hover: "#7351b5"
  lavender-text: "#bba5ec"
  passed-coral: "#f27878"
  stall-amber: "#e7b450"
  on-violet-white: "#ffffff"
typography:
  page-title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.45
  title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.45
  title-small:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.45
  figure:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.2
    fontFeature: "tnum"
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.45
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tnum"
rounded:
  logo: "4px"
  base: "8px"
  track: "10px"
  round: "50%"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "10px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button:
    backgroundColor: "{colors.raised-slate}"
    textColor: "{colors.moon-text}"
    rounded: "{rounded.base}"
    padding: "0 14px"
    height: "36px"
  button-hover:
    backgroundColor: "{colors.raised-slate-hover}"
  button-primary:
    backgroundColor: "{colors.purple-violet}"
    textColor: "{colors.on-violet-white}"
    rounded: "{rounded.base}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.purple-violet-hover}"
  link-button:
    textColor: "{colors.dusk-muted}"
    typography: "{typography.label}"
    padding: "4px 0"
  power-on:
    backgroundColor: "{colors.purple-violet}"
    textColor: "{colors.on-violet-white}"
    rounded: "{rounded.round}"
    size: "88px"
  power-off:
    textColor: "{colors.dusk-muted}"
    rounded: "{rounded.round}"
    size: "88px"
  switch-off:
    backgroundColor: "{colors.idle-ring}"
    rounded: "{rounded.track}"
    width: "36px"
    height: "20px"
  switch-on:
    backgroundColor: "{colors.purple-violet}"
    rounded: "{rounded.track}"
    width: "36px"
    height: "20px"
  select:
    backgroundColor: "{colors.raised-slate}"
    textColor: "{colors.moon-text}"
    rounded: "{rounded.base}"
    padding: "0 10px"
    height: "36px"
  back-button:
    textColor: "{colors.moon-text}"
    rounded: "{rounded.base}"
    size: "32px"
  log-sheet:
    backgroundColor: "{colors.raised-slate}"
    textColor: "{colors.moon-text}"
    typography: "{typography.mono}"
    rounded: "{rounded.base}"
    padding: "14px 16px"
---

# Design System: Purple Adblock

## Overview

**Creative North Star: "The Night Switch"**

Purple's surfaces are a small dark instrument opened over a playing stream, mostly at night. The popup answers one question, whether Purple is on for this channel, with one large round power button, and puts today's figures for that channel directly under it. Everything else (one switch row, the rate and report actions) sits below in quieter type. The system follows the ad-blocker popup standard set by uBlock Origin and by 7TV and BetterTTV, executed straight, at their level of craft.

The ground is a near-black with a slight violet cast. The logo's violet is the only brand colour and carries state: it fills the power button when Purple is on, and leaves a grey ring when off. Coral and amber appear only as signals inside the figures row. Type is the platform's own UI sans, because the popup loads nothing from the network; figures are tabular. Sections are divided by hairlines rather than boxed into cards. The export page reuses the same tokens at tab width, with a monospace log sheet.

The surfaces reject two looks, both confirmed by the maintainer: Twitch's own site chrome, and a settings form with no main state.

**Key Characteristics:**
- Dark only, a 320 px fixed-width popup; the export page caps content at 960 px.
- One violet, used for state and the primary action, never for decoration.
- One main control (the 88 px power button), one figures row, short switch list, actions at the foot.
- System UI sans at 13 px body; tabular numerals for every number.
- Hairline separators, an 8 px radius family, authored 2 px stroke icons.
- One shared easing curve; state changes in 180 ms, hover in 160 ms; no motion under reduced-motion.

## Colors

A violet-cast dark neutral scale, one brand violet with a hover step and a light text tint, and two signal colours that appear only when a count is above zero.

### Primary
- **Purple Violet** (`purple-violet`): the logo's violet. Fills the power button when Purple is on for the channel, fills the primary button (Go to Twitch, Download .txt, Download again), the checked switch track, the text selection, and the native control accent colour.
- **Purple Violet Hover** (`purple-violet-hover`): the one-step lighter violet for hover on the power button and primary buttons. Never a resting colour.
- **Lavender Text** (`lavender-text`): violet as text on the dark ground. The "Blocking ads on this channel" status line, the "Purple is on for Twitch" line and its status dot, and the focus outline on every control.
- **On-violet White** (`on-violet-white`): text and glyph colour on violet fills.

### Tertiary
- **Passed Coral** (`passed-coral`): only the "got through" figure, and only when it is above zero.
- **Stall Amber** (`stall-amber`): only the "stalls" figure, and only when it is above zero.

### Neutral
- **Night Ground** (`night-ground`): page and popup background.
- **Raised Slate** (`raised-slate`): fill of buttons, the select, the consent box, the log sheet, and the back button on hover.
- **Raised Slate Hover** (`raised-slate-hover`): hover fill of secondary buttons.
- **Hairline** (`hairline`): 1 px separators between popup sections, under the top bar, and the log sheet border.
- **Hairline Strong** (`hairline-strong`): 1 px border of buttons, the select and the consent box; log sheet scrollbar thumb.
- **Idle Ring** (`idle-ring`): the power button's ring when off, and the switch track when off.
- **Moon Text** (`moon-text`): primary text and the switch thumb.
- **Dusk Muted** (`dusk-muted`): secondary text: version, hints, figure labels, the section title, the off status line, and figures while Purple is off on the channel.

### Named Rules
**The One Violet Rule.** Violet means "Purple is acting" or "the main action". It is the only hue besides the two signals; no gradients, no second accent, no violet borders or backgrounds for decoration.

**The Signals Only Above Zero Rule.** Coral and amber colour a figure only when that figure is above zero. A zero stays in the neutral text colour; the signal colours never appear on labels, borders or backgrounds.

**The Dark Only Rule.** There is no light theme. The surfaces declare `color-scheme: dark` and open over Twitch at night.

## Typography

**Body Font:** system-ui (with -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif)
**Mono Font:** ui-monospace (with SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace), for the log text only

**Character:** One sans family at regular, medium (500) and semibold (600), set small and dense like the browser's own chrome. Hierarchy comes from weight and the muted colour more than from size.

### Hierarchy
- **Page title** (600, 20px): the export page heading only.
- **Title** (600, 16px): the channel name under the power button; single line, ellipsis on overflow.
- **Title small** (600, 15px): the export view heading inside the popup, and the top bar name "Purple".
- **Figure** (600, 18px, line-height 1.2, tabular): the four numbers of today's row.
- **Body** (400, 13px, line-height 1.45): status lines, setting names, export text, button labels (buttons set 500).
- **Label** (400 or 500, 12px): muted secondary text: version, setting hints, the section title (500), the select label, "Report without a log".
- **Caption** (400, 11px): figure labels under each number, no wrap.
- **Mono** (400, 12px, line-height 1.6, tabular): the log sheet on the export page, `white-space: pre`.

### Named Rules
**The Local Type Rule.** Only the platform's system stacks. The popup loads nothing from the network, so no web fonts, bundled or remote, are added to these surfaces.

**The Tabular Figures Rule.** Every number (version, today's figures, the log) uses tabular numerals so values do not shift as they change.

**The Sentence Case Rule.** Titles, labels and buttons are sentence case at normal tracking. No uppercase labels and no letter-spaced small caps.

## Layout

The popup is a single 320 px column (body width fixed) of full-width bands stacked top to bottom: a 44 px top bar (logo 20 px, name, version pushed right), the centred channel block, today's figures as a four-column equal grid, the switch rows, and the foot with two equal buttons in a two-column grid (`minmax(0, 1fr)` columns, labels cut with an ellipsis rather than widening a column). Horizontal inset is 16px throughout; the centred blocks (away page, no-channel state) use 24px.

Vertical rhythm is tight and slightly asymmetric: blocks sit on 10–12px top padding against 12–18px bottom, gaps inside groups are 8px, and the centred channel block is the loosest (24px over, 18px under). Spacing steps in use are 4, 8, 10, 12, 16 and 24px; 14px appears for button side padding and the power button's bottom margin.

The export page is the same bar stretched across the window, its content inset to align with a 960 px centred sheet (28px top, 48px bottom padding); the note text caps at 70ch, and actions wrap in a row with 8px gaps. There are no breakpoints: the popup has one width, and the page relies on `max-width` and wrapping.

## Elevation & Depth

Flat. Depth comes from the tonal step between the ground and the raised slate fill, and from 1px hairlines. The single exception is the power button, which lifts slightly when on.

### Shadow Vocabulary
- **Power lift** (`box-shadow: inset 0 0 0 44px <violet>, 0 4px 12px -4px rgba(0, 0, 0, 0.55)`): the inset spread is the violet fill itself (it animates to 0 when off, so the violet drains to the ring); the soft outer shadow lifts the button only while on.

### Named Rules
**The One Lifted Object Rule.** Only the power button casts a shadow. Buttons, inputs, the consent box and the log sheet stay flat.

## Shapes

An 8px radius family (`base`) on everything rectangular: buttons, the select, the consent box, the back button, the log sheet. The logo takes a 4px corner. The switch track is a 10px pill with a round thumb; the power button and the status dot are full circles. Borders are 1px, except the power button's 2px ring. Icons are authored inline SVG on a 24-unit grid, drawn with a 2px stroke, round caps and joins, no fill, at 16px (14px in the small export link); the power glyph is 36px at a 2.4 stroke.

## Components

### Buttons
Quiet, solid and compact.
- **Shape:** gently rounded (8px), 36px tall, 14px side padding, label weight 500, optional 16px leading or trailing icon with an 8px gap.
- **Secondary:** raised slate fill with a strong hairline border; hover moves to the hover slate. Used for Rate Purple, Report a bug (the export view in its report form), and the export page's bug-report link.
- **Primary:** violet fill and border with white text; hover moves to the hover violet. One per view.
- **Wide:** the primary button spans the export column (Download .txt).
- **Transition:** background and border colour, 160ms on the shared easing.
- **Focus:** 2px lavender outline at 2px offset (global for every focusable element).

### Link button
A text-only action: muted 12px label, optional 14px icon, 4px vertical padding, no border. Hover turns it to the main text colour with an underline at 3px offset. Used for "Report without a log", centred under the download button of the report view.

### Power button (signature component)
- 88px circle, 2px ring, 36px power glyph centred.
- **On:** the violet fills the disc from the ring inward, white glyph, soft lift shadow. Hover moves ring and fill to the hover violet.
- **Off** (`aria-pressed="false"`): the fill drains to nothing, the ring turns idle grey, the glyph turns muted; hover brightens ring to muted and glyph to text.
- **Press:** scales to 0.96 in 120ms.
- **Motion:** fill, ring and glyph colour change in 180ms on the shared easing; the status line under it follows 40ms later and today's figures 80ms later, the figures dimming to muted while off (signal colours stay).
- **Focus:** the outline sits 4px out to clear the ring.

### Switch
A 36 × 20px track with a 16px round thumb inset 2px. Off: idle grey track. On: violet track, thumb moves 16px. 180ms on the shared easing. The whole row (name, muted hint, switch) is the label and is clickable, padded 12px 16px.

### Figures row
Today's figures as a four-column grid under a muted 12px section title: each cell is an 18px semibold tabular number over an 11px muted label. Coral and amber apply per the Signals Only Above Zero Rule.

### Inputs / Fields
- **Select:** 36px tall, raised slate fill, strong hairline border, 8px radius, 10px side padding, full column width; the muted 12px label sits 4px above. Disabled drops to 55% opacity.
- **Consent box:** a bordered raised slate panel (8px radius, 10px 12px padding) holding a native 16px checkbox (violet through `accent-color`) and its sentence; the whole box is the label.

### Top bar and back navigation
The top bar is the only navigation: logo, product name, version. The export view inside the popup replaces the home view and opens with a 32px square back button (transparent, slate fill on hover, 8px radius) beside its title.

### Log sheet
The export page's log: a raised slate panel with a 1px hairline border and 8px radius, 14px 16px padding, mono 12px text without wrapping, capped at 60vh and scrolling both ways with a strong-hairline scrollbar thumb.

## Do's and Don'ts

### Do:
- **Do** keep one main state per view and make it the largest object: the 88px power button on a channel, the single primary button elsewhere.
- **Do** take colours only from the tokens; violet for state and the primary action, coral and amber only for a non-zero "got through" or "stalls" figure.
- **Do** separate popup sections with 1px hairlines and full-width bands, insetting content 16px.
- **Do** set every number in tabular figures and every label in sentence case.
- **Do** draw new icons as inline SVG on the 24-unit grid with a 2px round stroke, 16px by default.
- **Do** use the shared easing `cubic-bezier(0.16, 1, 0.3, 1)` with 160ms for hover and 180ms for state, and drop transitions under `prefers-reduced-motion`.
- **Do** keep the 2px lavender focus outline on every focusable element.

### Don't:
- **Don't** borrow Twitch's site chrome or make the popup read as part of twitch.tv.
- **Don't** build a view as a settings form without a main state at the top.
- **Don't** add a second accent hue, gradients, or violet used as decoration.
- **Don't** load web fonts or remote images; the surfaces stay network-free.
- **Don't** add shadows to anything but the power button, or box popup sections into cards.
- **Don't** add uppercase or letter-spaced labels above titles.
