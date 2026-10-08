"""Long watch of one live channel on twitch.tv, to catch midroll breaks (TR-002) and record what Twitch's server
does during them (docs/server/) and what Purple delivers to the player.

    python e2e/soak.py <session> --mode extension|userscript|record [--debug] [--until HH:MM | --minutes N]
                       [--channel /name] [--avoid /a,/b] [--rotate MINUTES] [--out DIR] [--visible]

One Edge on a fresh temporary profile (deleted at the end). Every DRAIN seconds the recorder's arrays in the page
(window.__e2e, and window.__purple.events with --debug) are emptied into JSONL files under
<out>/<session>/ (default ~/purple-recordings/<date>-soak/), never inside the repo. Breaks are logged as they
happen. The channel changes when it goes offline, the player fails for good, or after --rotate minutes without a
break. Several sessions run in parallel as separate processes; each avoids the channels the others are on.
"""
import argparse
import asyncio
import datetime
import glob
import json
import os
import shutil
import sys
import tempfile
import time
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
import twitch_selectors as sel
from scenarios import common

DRAIN = 30           # seconds between drains
FAILED_AFTER = 180   # seconds of player error, no video or no progress before the channel is given up
DIRECTORY_CARDS = 30
RECORDINGS = os.path.expanduser('~/purple-recordings')
# DATERANGE classes of playlists without ads (twitch-assignment: X-TV-TWITCH-CLUSTER, -NODE, -SERVING-ID)
LIVE_CLASSES = ('timestamp', 'twitch-session', 'twitch-stream-source', 'twitch-trigger', 'twitch-assignment')

# Installed in the page after each load: transitions of the ad overlay, the player error, video progress
# (currentTime of the first <video> advancing within the last second), the number of <video> elements and of
# playing ones (a client-side ad plays in its own element), and page elements whose data-a-target or
# data-test-selector names an ad or picture-by-picture, with wall-clock times. Drained with the rest.
MONITOR = """(() => {
  if (window.__soak) return true;
  const S = %s;
  const AD_UI = /(^|[-_])ads?([-_]|$)|pbyp|picture-by-picture|commercial|stitched/i;
  const soak = (window.__soak = { transitions: [] });
  let last = {};
  let lastTime = null;
  const adUi = () => [...new Set([...document.querySelectorAll('[data-a-target],[data-test-selector]')]
    .flatMap((el) => [el.getAttribute('data-a-target'), el.getAttribute('data-test-selector')])
    .filter((value) => value && AD_UI.test(value)))].sort().join(' ')
    + ([...document.querySelectorAll('[class*="pbyp" i],[class*="picture-by-picture" i]')].length ? ' class:pbyp' : '');
  setInterval(() => {
    const videos = [...document.querySelectorAll('video')];
    const v = videos[0];
    const t = v ? v.currentTime : null;
    const now = {
      adOverlay: !!document.querySelector(S.AD_OVERLAY),
      playerError: !!document.querySelector(S.PLAYER_ERROR),
      progressing: t !== null && lastTime !== null && t > lastTime,
      videos: videos.length,
      playingVideos: videos.filter((el) => !el.paused && el.readyState >= 3).length,
      adUi: adUi(),
    };
    lastTime = t;
    for (const [key, value] of Object.entries(now)) {
      if (last[key] !== value) soak.transitions.push({ wall: Date.now(), key, value, currentTime: t === null ? null : Math.round(t * 10) / 10 });
    }
    last = now;
  }, 1000);
  return true;
})()"""

# Empties the recorder's arrays and returns them with a sample of the page state.
DRAIN_JS = """(() => {
  const S = %s;
  const e2e = window.__e2e || {};
  const take = (name) => (Array.isArray(e2e[name]) ? e2e[name].splice(0) : []);
  const v = document.querySelector('video');
  const text = (q) => { const el = document.querySelector(q); return el ? el.innerText.trim().slice(0, 200) : null; };
  return {
    timeOrigin: Math.round(performance.timeOrigin),
    url: location.pathname,
    server: take('server'),
    delivered: take('delivered'),
    serverTexts: take('serverTexts'),
    playlists: take('playlists'),
    workerLog: take('workerLog'),
    csai: take('csai'),
    csaiAnswers: take('csaiAnswers'),
    media: take('media'),
    events: window.__purple && Array.isArray(window.__purple.events) ? window.__purple.events.splice(0) : [],
    transitions: window.__soak ? window.__soak.transitions.splice(0) : [],
    workers: (e2e.workers || []).map((w) => ({ at: w.at, viaInjector: w.viaInjector, purpleCode: w.purpleCode, purpleBoot: w.purpleBoot, errors: w.errors,
      messages: (w.messages || []).slice(-20) })),
    video: v ? { readyState: v.readyState, currentTime: Math.round(v.currentTime * 10) / 10, paused: v.paused, muted: v.muted, error: v.error && v.error.code } : null,
    adOverlay: !!document.querySelector(S.AD_OVERLAY),
    playerError: text(S.PLAYER_ERROR),
    contentGate: !!document.querySelector(S.CONTENT_GATE),
  };
})()"""

AD_TEXT_MARKERS = ('stitched', 'maf-ad', 'X-TV-TWITCH-AD', 'Amazon|', 'DCM,')


def stamp(wall_ms=None):
    t = datetime.datetime.fromtimestamp(wall_ms / 1000) if wall_ms else datetime.datetime.now()
    return t.isoformat(timespec='milliseconds')


def ad_marks(playlist):
    """Ad markers of one media playlist digest: ad segments, roll types, and DATERANGE classes that are not on
    every live playlist. SSAI = ad segments; MARKED_LIVE = a stitched-ad DATERANGE over live segments only."""
    if not playlist or playlist.get('type') != 'media':
        return None
    classes = [c for c in playlist.get('dateranges') or [] if c not in LIVE_CLASSES]
    # ad segments: titles Purple 2.6.7 knows (Amazon|, DCM,), or any title other than "live" (FT|… seen 2026-10-07)
    other_titles = [t for t in playlist.get('titles') or [] if t and t != 'live']
    if not playlist.get('adSegments') and not playlist.get('rollTypes') and not classes and not other_titles:
        return None
    ssai = playlist.get('adSegments') or other_titles
    kind = ('SSAI' if ssai else 'MARKED_LIVE' if 'twitch-stitched-ad' in classes else 'MAF' if 'twitch-maf-ad' in classes else 'OTHER')
    return {'kind': kind, 'ads': playlist.get('adSegments'), 'segments': playlist.get('segments'),
            'seq': playlist.get('mediaSequence'), 'roll': playlist.get('rollTypes'), 'classes': classes, 'titles': other_titles}


class Recorder:
    """JSONL files of one session; every record gets the wall time of its drain, the channel and the load number."""

    def __init__(self, directory):
        self.directory = directory
        os.makedirs(directory, exist_ok=True)
        self.files = {}

    def write(self, name, record):
        f = self.files.get(name)
        if f is None:
            f = self.files[name] = open(os.path.join(self.directory, name + '.jsonl'), 'a', encoding='utf-8', newline='')
        f.write(json.dumps(record, default=str) + '\n')
        f.flush()

    def note(self, text, **fields):
        record = {'wall': stamp(), 'note': text, **fields}
        self.write('log', record)
        print(f"[{record['wall'][11:19]}] {os.path.basename(self.directory)}: {text} {json.dumps(fields, default=str) if fields else ''}", flush=True)

    def claim(self, channel):
        with open(os.path.join(self.directory, 'current.txt'), 'w', encoding='utf-8', newline='') as f:
            f.write(channel or '')

    def close(self):
        self.claim(None)
        for f in self.files.values():
            f.close()


def channels_in_use(recorder):
    """Channels claimed by the other sessions under the recordings root (soak runs and L3-03 runs)."""
    taken = set()
    root = os.path.dirname(os.path.dirname(recorder.directory))
    for path in glob.glob(os.path.join(root, '*', '*', 'current.txt')):
        if os.path.normcase(os.path.dirname(path)) != os.path.normcase(recorder.directory):
            with open(path, encoding='utf-8') as f:
                taken.add(f.read().strip())
    return taken


class Watch:
    """State of the channel being watched: when it started, breaks in progress and seen, failure clock."""

    def __init__(self, channel, load):
        self.channel, self.load = channel, load
        self.started = time.time()
        self.breaks = 0
        self.stitched = 0  # breaks with ad segments or stitched-ad markers (not twitch-maf-ad alone); they stop the rotation
        self.player_urls = set()  # media playlists Purple delivered to the player (the main stream)
        self.in_break = False
        self.failing_since = None
        self.last_time = None


async def drain(session, recorder, watch, mode, final=False):
    data = await lib.read(session.tab, DRAIN_JS % json.dumps(sel.as_dict()))
    wall = stamp()
    base = {'drain': wall, 'channel': watch.channel, 'load': watch.load}
    watch.player_urls.update(d['url'] for d in data['delivered'] if (d.get('playlist') or {}).get('type') == 'media')
    for name in ('server', 'delivered', 'serverTexts', 'workerLog', 'csai', 'csaiAnswers', 'media', 'events', 'transitions'):
        for entry in data[name]:
            recorder.write(name, {**base, **entry})
    for entry in data['playlists']:
        if any(m in entry.get('text', '') for m in AD_TEXT_MARKERS):
            recorder.write('playlists', {**base, **entry})
    sample = {k: data[k] for k in ('url', 'video', 'adOverlay', 'playerError', 'contentGate', 'workers', 'timeOrigin')}
    sample['counts'] = {k: len(data[k]) for k in ('server', 'delivered', 'serverTexts', 'workerLog', 'csai', 'csaiAnswers', 'events', 'transitions')}
    recorder.write('samples', {**base, **sample})

    # breaks: without Purple every media playlist is the player's; with Purple, the ones it delivered
    for entry in data['server']:
        marks = ad_marks(entry.get('playlist'))
        main = mode == 'record' or entry['url'] in watch.player_urls
        if marks:
            role = 'main' if main else 'backup'
            if main and not watch.in_break:
                watch.in_break, watch.breaks = True, watch.breaks + 1
                watch.stitched += marks['kind'] in ('SSAI', 'MARKED_LIVE')
                recorder.note('break start', channel=watch.channel, at=stamp(entry.get('wall')), **marks)
            recorder.write('marks', {**base, 'wall': stamp(entry.get('wall')), 'role': role, 'url': entry['url'], **marks})
        elif main and watch.in_break and entry.get('playlist', {}).get('type') == 'media':
            watch.in_break = False
            recorder.note('break end', channel=watch.channel, at=stamp(entry.get('wall')))
    for entry in data['csai']:
        recorder.note('edge.ads request', path=entry.get('path'), bp=entry.get('bp'), status=entry.get('status'), at=stamp(entry.get('wall')))
    for entry in data['csaiAnswers']:
        recorder.note('edge.ads answer', path=entry.get('path'), bp=entry.get('bp'), status=entry.get('status'), body=entry.get('body'))
    for entry in data['events']:
        if entry.get('type') not in ('backupUsed',):
            recorder.note('purple event', **{k: entry.get(k) for k in ('type', 'playerType', 'count')})

    # failure clock: error overlay, no video, or currentTime not advancing between drains
    video = data['video'] or {}
    first = watch.last_time is None
    progressing = not video.get('paused') and (video.get('currentTime') or 0) > (watch.last_time or 0)
    watch.last_time = video.get('currentTime')
    healthy = not data['playerError'] and not data['contentGate'] and bool(video) and (progressing or first)
    if healthy or watch.in_break or final:
        watch.failing_since = None
    elif watch.failing_since is None:
        watch.failing_since = time.time()
        recorder.note('player not progressing', video=video, error=data['playerError'], url=data['url'])
    return data


async def directory(session):
    await session.navigate(common.TWITCH + common.DIRECTORY)
    await lib.wait_for(session.tab, f'!!document.querySelector({json.dumps(sel.DIRECTORY_CARD)})')
    await session.tab.sleep(3)
    return list(dict.fromkeys(await lib.read(session.tab, common.CARDS)))[:DIRECTORY_CARDS]


async def open_next(session, recorder, tried, slot, load, fixed=None):
    """Opens the first directory channel not tried yet, not gated and not watched by another session."""
    cards = [fixed] if fixed else await directory(session)
    ordered = cards[slot::3] + [c for i, c in enumerate(cards) if i % 3 != slot] if not fixed else cards
    taken = channels_in_use(recorder)
    # a channel given with --channel is opened even when another session watches it (same break, two modes)
    candidates = [c for c in ordered if fixed or (c not in tried and c not in taken)][:common.CANDIDATES]
    channel, outcome, gated = await common.open_channel(session, candidates)
    tried.update(gated)
    if not channel:
        recorder.note('no channel to open', gated=gated, taken=sorted(taken))
        return None
    tried.add(channel)
    recorder.claim(channel)
    await lib.read(session.tab, MONITOR % json.dumps(sel.as_dict()))
    recorder.note('watching', channel=channel, outcome=outcome, gated=gated, load=load)
    return Watch(channel, load)


async def soak(args, recorder, end):
    profile = tempfile.mkdtemp(prefix='purple-e2e-soak-')
    session = None
    tried, load, failures = set(args.avoid.split(',')) if args.avoid else set(), 0, 0
    try:
        session = await lib.launch(args.mode, profile=profile, visible=args.visible, debug=args.debug)
        recorder.note('launched', mode=args.mode, debug=args.debug, until=end.isoformat(timespec='minutes'))
        watch = None
        while datetime.datetime.now() < end:
            if watch is None:
                load += 1
                # --channel: the first load; with --rotate 0 every load (the channel is reopened after a failure)
                fixed = args.channel if load == 1 or not args.rotate else None
                watch = await open_next(session, recorder, tried, args.slot, load, fixed)
                if watch is None:
                    tried = set(args.avoid.split(',')) if args.avoid else set()
                    await asyncio.sleep(60)
                    continue
            await asyncio.sleep(DRAIN)
            try:
                data = await drain(session, recorder, watch, args.mode)
                failures = 0
            except Exception as err:
                failures += 1
                recorder.note('drain failed', error=str(err)[:300], failures=failures)
                if failures >= 5:
                    raise
                continue
            minutes = (time.time() - watch.started) / 60
            reason = None
            if not data['url'].rstrip('/').lower().endswith(watch.channel.lower()):
                reason = f"page moved to {data['url']} (raid or redirect)"
            elif watch.failing_since and time.time() - watch.failing_since > FAILED_AFTER:
                reason = 'player failed or channel offline'
            elif args.rotate and minutes > args.rotate and not watch.stitched and not watch.in_break:
                reason = f'{args.rotate} minutes without a stitched break'
            if reason:
                recorder.note('leaving channel', channel=watch.channel, reason=reason, minutes=round(minutes, 1), breaks=watch.breaks)
                recorder.write('watches', {'channel': watch.channel, 'load': watch.load, 'start': stamp(watch.started * 1000),
                                           'end': stamp(), 'minutes': round(minutes, 1), 'breaks': watch.breaks, 'reason': reason})
                watch = None
        if watch:
            await drain(session, recorder, watch, args.mode, final=True)
            minutes = (time.time() - watch.started) / 60
            recorder.write('watches', {'channel': watch.channel, 'load': watch.load, 'start': stamp(watch.started * 1000),
                                       'end': stamp(), 'minutes': round(minutes, 1), 'breaks': watch.breaks, 'reason': 'end of run'})
        recorder.note('done')
    finally:
        if session:
            await session.close()
        shutil.rmtree(profile, ignore_errors=True)


def end_time(args):
    if args.minutes:
        return datetime.datetime.now() + datetime.timedelta(minutes=args.minutes)
    hour, minute = map(int, args.until.split(':'))
    end = datetime.datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
    return end if end > datetime.datetime.now() else end + datetime.timedelta(days=1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('session', help='name of the session directory')
    ap.add_argument('--mode', choices=lib.MODES, required=True)
    ap.add_argument('--debug', action='store_true', help="extension mode: Purple's debug events in window.__purple.events")
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument('--until', help='local time HH:MM to stop at')
    group.add_argument('--minutes', type=float)
    ap.add_argument('--channel', help='first channel to watch (/name); later ones come from the directory')
    ap.add_argument('--avoid', help='comma-separated channels (/name) not to open')
    ap.add_argument('--slot', type=int, default=0, help='0, 1 or 2: which directory cards this session tries first')
    ap.add_argument('--rotate', type=float, default=50, help='minutes on a channel without a stitched break before moving on (0: never)')
    ap.add_argument('--out', default=os.path.join(RECORDINGS, f'{datetime.date.today().isoformat()}-soak'))
    ap.add_argument('--visible', action='store_true')
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    recorder = Recorder(os.path.join(args.out, args.session))
    try:
        asyncio.run(soak(args, recorder, end_time(args)))
    except Exception:
        recorder.note('stopped by an error', error=traceback.format_exc()[-1500:])
        return 1
    finally:
        recorder.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
