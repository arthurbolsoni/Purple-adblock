"""The badge on the extension's icon while an ad is blocked, read from the extension itself (F-30, T-605, 2026-11-21).

Usage: PURPLE_BROWSER=<chromium browser> python docs/findings/probes/ad_badge_probe.py /channel [/channel ...] [--seconds N] [--off]

Level 3: a Chromium browser with the unpacked build on a new temporary profile, logged out (a channel load gets a
preroll most of the time, TR-001). For each channel the session's tab opens it, and the build's popup page, opened in a
tab of its own (an extension page), asks every second for N seconds (default 75):

- `chrome.action.getBadgeText({ tabId })` for the channel's tab;
- the page's side, from the channel's tab: whether the playlist the player got last had ad segments or the page's
  ad overlay was up (e2e/recorder.js, the monitor of the scenarios).

Prints each change of the badge with the seconds since the load, and the totals. With --off the stored setting
`adBadge` is false first: no badge is expected.
"""
import asyncio
import json
import os
import sys
import tempfile
import time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'e2e'))
import lib  # noqa: E402

BADGE = """new Promise((resolve) => chrome.tabs.query({ url: "https://www.twitch.tv/*" }, (tabs) => {
  const tab = (tabs || [])[0];
  if (!tab) return resolve({ tab: null });
  Promise.resolve(chrome.action.getBadgeText({ tabId: tab.id })).then((text) => resolve({ tab: tab.id, text }));
}))"""
PAGE = """(() => {
  const e = window.__e2e || {};
  const last = (e.playlists || []).filter((p) => (p.url || '').includes('/v1/playlist/')).slice(-1)[0];
  const v = document.querySelector('video');
  return { ads: !!last && /stitched-ad|Amazon\\|/.test((e.serverTexts || []).slice(-1)[0]?.text || ''), t: v ? Math.round(v.currentTime) : null,
           overlay: !!document.querySelector('[data-a-target="video-ad-label"], [data-test-selector="ad-banner-default-text"]') };
})()"""


async def main(channels, seconds, off):
    session = await lib.launch('extension', profile=tempfile.mkdtemp(prefix='purple-badge-'), debug=True)
    try:
        await session.navigate(lib.EXTENSIONS_PAGE)
        extension = await lib.wait_for(session.tab, lib.EXTENSION_ID, timeout=lib.EXTENSION_WAIT)
        if not extension:
            raise RuntimeError('the unpacked Purple build is not enabled')
        popup = await session.browser.get(f'chrome-extension://{extension}/common/html/popup.html', new_tab=True)
        await asyncio.sleep(1)
        if off:
            await lib.read(popup, 'new Promise((resolve) => chrome.storage.local.set({ adBadge: false }, () => resolve(true)))')
        for channel in channels:
            await session.navigate('https://www.twitch.tv' + channel)
            start, shown, seen_ads, last = time.time(), 0, 0, None
            print(f'{channel}{" (adBadge off)" if off else ""}')
            while time.time() - start < seconds:
                await asyncio.sleep(1)
                try:
                    badge = await lib.read(popup, BADGE)
                    page = await lib.read(session.tab, PAGE)
                except Exception as err:  # a page between two documents
                    badge, page = {'text': None, 'error': str(err)[:80]}, {}
                text = badge.get('text')
                shown += text == 'AD'
                seen_ads += bool(page.get('ads'))
                if text != last:
                    print(f'  {time.time() - start:5.1f} s badge {json.dumps(text)} (the server\'s last playlist with ad markers: {page.get("ads")}, video {page.get("t")} s)')
                    last = text
            print(f'  badge shown {shown} s of {seconds:.0f}; the server\'s last text had ad markers in {seen_ads} samples')
    finally:
        await session.close()


if __name__ == '__main__':
    args = sys.argv[1:]
    seconds = float(args[args.index('--seconds') + 1]) if '--seconds' in args else 75
    channels = [a for a in args if a.startswith('/')]
    asyncio.run(main(channels, seconds, '--off' in args))
