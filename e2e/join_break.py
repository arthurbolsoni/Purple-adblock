"""Opens a channel while its stitched midroll runs, so the player gets the break's first polls before any backup is
ready (T-811: the page's ad UI on breaks whose ad segments reached the player).

    python e2e/join_break.py <session> --channel /name [--joins N] [--minutes M] [--variants JSON] [--out DIR]

Two Edge sessions on fresh temporary profiles, logged out:
- a watcher in record mode (no Purple) plays the channel; every few seconds it reads the media playlists Twitch
  served it (window.__e2e.server) and finds a running midroll (ad segments with ROLL-TYPE MIDROLL);
- a joiner with Purple (`debug` on) waits on the directory. When a break starts, it opens the channel and watches
  JOIN_WATCH seconds: the ad overlay every second, then the media playlists the player got from Purple with ad
  segments or ad markers, the ad media it requested, and Purple's events. Then it goes back to the directory and waits
  for the watcher's break to end before the next one (two sessions on one channel get the same midrolls, B-049).

The joins cycle through --variants, a JSON list of settings stored before the channel opens (default: stripAdMarkers
on, then off). Results go to <out>/<session>.jsonl (default ~/purple-recordings/<date>-join/), outside the repo.
"""
import argparse
import asyncio
import datetime
import json
import os
import shutil
import sys
import tempfile
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
import server
from soak import ad_marks

POLL = 3           # seconds between the watcher's reads
JOIN_WATCH = 60    # seconds the joiner watches after opening the channel
QUIET = 12         # seconds without ad markers on the watcher for its break to count as over
DIRECTORY = 'https://www.twitch.tv/directory/all'
STITCHED = ('SSAI', 'MARKED_LIVE')


def stamp(ms=None):
    return datetime.datetime.fromtimestamp((ms or time.time() * 1000) / 1000).isoformat(timespec='milliseconds')


async def watcher_marks(tab):
    """Kinds of ad markers in the media playlists the watcher got since the last read (and empties the list); a
    stitched break counts only as a MIDROLL: the watcher's own preroll at its load is not the channel's (B-052)."""
    entries = await lib.read(tab, '(window.__e2e && window.__e2e.server ? window.__e2e.server.splice(0) : [])') or []
    marks = [m for m in (ad_marks(e.get('playlist')) for e in entries) if m]
    return [m['kind'] if 'MIDROLL' in (m.get('roll') or []) or m['kind'] not in STITCHED else m['kind'] + '/PREROLL' for m in marks]


async def join(joiner, channel, settings):
    # every variant names the same keys, so one variant's values do not stay for the next (missing keys: the defaults)
    await lib.set_storage(joiner, **settings)
    await joiner.navigate(f'https://www.twitch.tv{channel}')
    opened = time.time() * 1000
    overlay, times = [], []
    for _ in range(JOIN_WATCH):
        await joiner.tab.sleep(1)
        state = await lib.page_state(joiner.tab)
        overlay.append(bool(state.get('adOverlay')))
        times.append((state.get('video') or {}).get('currentTime'))
    # T-810: the longest run of seconds the video did not move forward, after it first played
    still = longest = 0
    started = False
    for a, b in zip(times, times[1:]):
        started = started or (a or 0) > 0
        if started and a is not None and b is not None and 0 <= b - a < 0.5:
            still += 1
            longest = max(longest, still)
        else:
            still = 0
    state = await lib.page_state(joiner.tab)
    summary = server.summarize(state)
    delivered = [d for d in state.get('delivered') or [] if (d.get('playlist') or {}).get('type') == 'media']
    to_player = [m['kind'] for m in (ad_marks(d.get('playlist')) for d in delivered) if m]
    with_ad_dateranges = sum(1 for d in delivered if {'twitch-stitched-ad', 'twitch-ad-quartile'} & set((d.get('playlist') or {}).get('dateranges') or []))
    events = state.get('events') or []
    await joiner.navigate(DIRECTORY)
    return {
        'settings': settings, 'opened': stamp(opened),
        'stillLongest': longest, 'overlaySeconds': sum(overlay), 'overlayFirst': overlay.index(True) if True in overlay else None, 'overlayLast': overlay[-1],
        'toPlayer': {k: to_player.count(k) for k in set(to_player)}, 'toPlayerWithAdDateranges': with_ad_dateranges,
        'mainPollsWithAds': summary['main']['pollsWithAds'], 'adMedia': summary['adMedia'],
        'events': {t: sum(1 for e in events if e['type'] == t) for t in {e['type'] for e in events}},
        'playerError': state.get('playerError'),
    }


async def main(args):
    out = os.path.join(args.out, f'{args.session}.jsonl')
    os.makedirs(args.out, exist_ok=True)
    profiles = [tempfile.mkdtemp(prefix='purple-e2e-join-') for _ in range(2)]
    watcher = joiner = None
    end = time.time() + args.minutes * 60
    try:
        watcher = await lib.launch('record', profile=profiles[0])
        for attempt in range(3):  # a fresh profile sometimes enables the unpacked build too late (lib.EXTENSION_WAIT)
            try:
                joiner = await lib.launch('extension', profile=profiles[1], debug=True)
                break
            except RuntimeError as error:
                print(f'[{stamp()}] joiner launch {attempt + 1} failed: {error}', flush=True)
                shutil.rmtree(profiles[1], ignore_errors=True)
                profiles[1] = tempfile.mkdtemp(prefix='purple-e2e-join-')
        else:
            raise RuntimeError('the joiner did not start')
        await joiner.navigate(DIRECTORY)
        await watcher.navigate(f'https://www.twitch.tv{args.channel}')
        print(f'[{stamp()}] watching {args.channel}', flush=True)
        joins = 0
        while joins < args.joins and time.time() < end:
            await asyncio.sleep(POLL)
            kinds = await watcher_marks(watcher.tab)
            # a running break: ad segments in a MIDROLL (joining at its announcement got the joiner nothing)
            if 'SSAI' not in kinds:
                continue
            settings = args.variants[joins % len(args.variants)]
            print(f'[{stamp()}] watcher: break start {kinds}; joining with {settings}', flush=True)
            result = {'channel': args.channel, 'join': joins + 1, **await join(joiner, args.channel, settings)}
            with open(out, 'a', encoding='utf-8') as f:
                f.write(json.dumps(result) + '\n')
            print(f'[{stamp()}] join {joins + 1}: {json.dumps(result)[:400]}', flush=True)
            joins += 1
            quiet = 0
            while quiet < QUIET and time.time() < end:  # the watcher's break ends before the next join
                await asyncio.sleep(POLL)
                quiet = 0 if await watcher_marks(watcher.tab) else quiet + POLL
        print(f'[{stamp()}] done: {joins} joins', flush=True)
    finally:
        for session in (watcher, joiner):
            if session:
                await session.close()
        for profile in profiles:
            shutil.rmtree(profile, ignore_errors=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('session')
    ap.add_argument('--channel', required=True)
    ap.add_argument('--joins', type=int, default=6)
    ap.add_argument('--minutes', type=float, default=90)
    ap.add_argument('--variants', type=json.loads, default=[{'stripAdMarkers': True}, {'stripAdMarkers': False}],
                    help='JSON list of settings objects, one per join in turn')
    ap.add_argument('--out', default=os.path.join(os.path.expanduser('~/purple-recordings'), f'{datetime.date.today().isoformat()}-join'))
    asyncio.run(main(ap.parse_args()))
