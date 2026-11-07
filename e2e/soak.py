"""Long watch of one live channel on twitch.tv, to catch midroll breaks (TR-002) and record what Twitch's server
does during them (docs/server/) and what Purple delivers to the player.

    python e2e/soak.py <session> --mode extension|userscript|record [--debug] [--until HH:MM | --minutes N]
                       [--channel /name] [--avoid /a,/b] [--rotate MINUTES] [--out DIR] [--visible]
                       [--setting KEY=JSON ...] [--stop-after-breaks N] [--leave-after-breaks N] [--hop SECONDS]
                       [--all-playlists] [--browser chromium|firefox] [--moz-log MODULES]

One browser (Edge, or PURPLE_BROWSER) on a fresh temporary profile (deleted at the end). Every DRAIN seconds the recorder's arrays in the page
(window.__e2e, and window.__purple.events with --debug) are emptied into JSONL files under
<out>/<session>/ (default ~/purple-recordings/<date>-soak/), never inside the repo. Breaks are logged as they
happen. The channel changes when it goes offline (also when the page plays a recorded video instead: no live media
playlist for NO_LIVE_AFTER seconds; that channel is not reopened), the player fails for good, after --rotate minutes
without a break, or after --leave-after-breaks N stitched breaks on it. With --stop-after-breaks N the session ends
once N stitched breaks (ad segments or stitched-ad markers) have ended; --until or --minutes stays the limit. With
--hop SECONDS the session goes from channel to channel, the directory's cards in random order: it leaves a channel
SECONDS after opening it, or SECONDS after its last break ended (prerolls come at loads, T-818). Several sessions run in
parallel as separate processes; each avoids the channels the others are on.

Besides the recorder's arrays: the Media Source appends of e2e/mse-hook.js (mse.jsonl), and the browser's media log
(CDP Media domain: the player's messages, errors, events and properties, mediaLog.jsonl). The texts of the media
playlists the player got are kept when they carry ad markers, or all of them with --all-playlists (T-825: the date-time
of each segment the player fetched).

With --browser firefox (T-829) the session runs Firefox through e2e/firefox.py (PURPLE_FIREFOX, WebDriver BiDi) in
extension or record mode, with the same page scripts; settings and --debug reach the page through its settings
preload. Firefox has no CDP Media domain: with --moz-log MODULES (e.g. MediaFormatReader:4,MediaSource:4) its own
media log goes to mozlog*.txt in the session directory (MOZ_LOG, MOZ_LOG_FILE), and mediaLog.jsonl stays empty. The
page's console warnings and errors and its uncaught errors (BiDi log.entryAdded) go to console.jsonl. --audio leaves
the sound on. --fake-breaks EVERY:LENGTH makes breaks on any live channel: the player's own media playlists reach
Purple with their segments titled as ads for LENGTH s every EVERY s (FAKE_BREAKS_JS, e2e/worker-logger.js), so Purple
switches to a backup and back; --pauses also clicks the player's pause and play button inside them (PAUSES). Each
window and click is a note (fake.jsonl).

Errors go to the session log as notes as they come (T-829): the page player's error events (playerEvents.jsonl also
keeps its warnings, rebuffering and seeks), the <video>'s `error` event with its code and message, a SourceBuffer
`error` event, an append or removal that throws and endOfStream with an error (mse.jsonl), and uncaught errors in the
workers.
"""
import argparse
import asyncio
import datetime
import glob
import json
import os
import random
import shutil
import sys
import tempfile
import time
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nodriver as uc

import firefox
import lib
import twitch_selectors as sel
from scenarios import common

DRAIN = 30           # seconds between drains
FAILED_AFTER = 180   # seconds of player error, no video or no progress before the channel is given up
NO_LIVE_AFTER = 180  # seconds without a live media playlist poll (offline channel playing a recorded video) before leaving
DIRECTORY_CARDS = 30
RECORDINGS = os.path.expanduser('~/purple-recordings')
# DATERANGE classes of playlists without ads (twitch-assignment: X-TV-TWITCH-CLUSTER, -NODE, -SERVING-ID)
LIVE_CLASSES = ('timestamp', 'twitch-session', 'twitch-stream-source', 'twitch-trigger', 'twitch-assignment')

# Installed in the page after each load: transitions of the ad overlay, the player error, video progress
# (currentTime of the first <video> advancing within the last second), the number of <video> elements and of
# playing ones (a client-side ad plays in its own element), each <video>'s sound (`videoSound`: playing or not, muted,
# volume below 1; T-829, a second element playing the stream with sound), and page elements whose data-a-target or
# data-test-selector names an ad or picture-by-picture, with wall-clock times. Every second also the page player's own
# buffer, latency, low-latency mode and playback rate (T-814) and the frame counters (T-819): the
# `props.mediaPlayerInstance` of the React component with `setPlayerActive`, found by a fiber walk written here
# (docs/findings/probes/page_player_probe.py), and the <video>'s getVideoPlaybackQuality(). Drained with the rest.
MONITOR = """(() => {
  if (window.__soak) return true;
  const S = %s;
  const AD_UI = /(^|[-_])ads?([-_]|$)|pbyp|picture-by-picture|commercial|stitched/i;
  const soak = (window.__soak = { transitions: [], player: [], playerEvents: [] });
  let instance = null;
  // T-829: the page player's errors and warnings (event names of the IVS player; one that does not exist never fires)
  const PLAYER_EVENTS = ['PlayerError', 'PlayerRecoverableError', 'PlayerWarning', 'PlayerRebuffering', 'PlayerSeekCompleted'];
  const hooked = new WeakSet();
  const listen = (player) => {
    if (!player || hooked.has(player) || typeof player.addEventListener !== 'function') return;
    hooked.add(player);
    for (const type of PLAYER_EVENTS) player.addEventListener(type, (e) => {
      let detail = null;
      try { detail = e === undefined ? null : JSON.stringify(e).slice(0, 400); } catch (err) { detail = String(e).slice(0, 400); }
      if (soak.playerEvents.length < 2000) soak.playerEvents.push({ wall: Date.now(), type, detail });
    });
  };
  const findPlayer = () => {
    const root = document.querySelector('#root');
    const key = root && Object.keys(root).find((k) => k.startsWith('__reactContainer') || k.startsWith('__reactFiber'));
    const stack = key ? [root[key]] : [];
    for (let n = 0; stack.length && n < 200000; n++) {
      const fiber = stack.pop();
      if (!fiber) continue;
      const node = fiber.stateNode;
      if (node && node.setPlayerActive && node.props && node.props.mediaPlayerInstance) {
        const m = node.props.mediaPlayerInstance;
        return m.playerInstance || m;
      }
      if (fiber.sibling) stack.push(fiber.sibling);
      if (fiber.child) stack.push(fiber.child);
    }
    return null;
  };
  const round = (x) => (typeof x === 'number' ? Math.round(x * 1000) / 1000 : null);
  const playerSample = (t) => {
    try {
      if (!instance || typeof instance.getBufferDuration !== 'function' || instance.getHTMLVideoElement?.() !== document.querySelector('video')) instance = findPlayer();
      if (!instance) return;
      listen(instance);
      // T-819: frames, cumulative: the player's dropped and decoded ones, the <video>'s dropped, total and corrupted
      // ones (getVideoPlaybackQuality), and its picture size
      const v = document.querySelector('video');
      const q = v && v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality() : null;
      soak.player.push({ wall: Date.now(), currentTime: t === null ? null : Math.round(t * 10) / 10, buffer: round(instance.getBufferDuration()),
        latency: round(instance.getLiveLatency()), lowLatency: instance.isLiveLowLatency(), rate: instance.getPlaybackRate(),
        dropped: instance.getDroppedFrames(), decoded: instance.getDecodedFrames(),
        videoDropped: q ? q.droppedVideoFrames : null, videoTotal: q ? q.totalVideoFrames : null, videoCorrupted: q ? q.corruptedVideoFrames : null,
        size: v ? v.videoWidth + 'x' + v.videoHeight : null });
    } catch (e) {
      instance = null;
    }
  };
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
      videoSound: videos.map((el, i) => `${i}:${!el.paused && el.readyState >= 3 ? 'playing' : 'stopped'}${el.muted ? ' muted' : ''}`
        + (el.volume < 1 ? ` volume ${Math.round(el.volume * 100) / 100}` : '')).join(', '),
      adUi: adUi(),
    };
    lastTime = t;
    playerSample(t);
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
    mse: take('mse'),
    workerLog: take('workerLog'),
    csai: take('csai'),
    csaiAnswers: take('csaiAnswers'),
    media: take('media'),
    events: window.__purple && Array.isArray(window.__purple.events) ? window.__purple.events.splice(0) : [],
    transitions: window.__soak ? window.__soak.transitions.splice(0) : [],
    player: window.__soak ? window.__soak.player.splice(0) : [],
    playerEvents: window.__soak ? window.__soak.playerEvents.splice(0) : [],
    fake: window.__e2eFake ? window.__e2eFake.events.splice(0) : [],
    workers: (e2e.workers || []).map((w) => ({ at: w.at, viaInjector: w.viaInjector, purpleCode: w.purpleCode, purpleBoot: w.purpleBoot, errors: w.errors,
      messages: (w.messages || []).slice(-20) })),
    video: v ? { readyState: v.readyState, currentTime: Math.round(v.currentTime * 10) / 10, paused: v.paused, muted: v.muted, error: v.error && v.error.code } : null,
    // T-829: every <video>, to compare a second element's position and sound with the first's
    videos: [...document.querySelectorAll('video')].map((el) => ({ currentTime: Math.round(el.currentTime * 10) / 10, paused: el.paused,
      readyState: el.readyState, muted: el.muted, volume: el.volume, size: el.videoWidth + 'x' + el.videoHeight,
      hasAudio: typeof el.mozHasAudio === 'boolean' ? el.mozHasAudio : null, blob: el.src.startsWith('blob:') })),
    adOverlay: !!document.querySelector(S.AD_OVERLAY),
    playerError: text(S.PLAYER_ERROR),
    contentGate: !!document.querySelector(S.CONTENT_GATE),
  };
})()"""

AD_TEXT_MARKERS = ('stitched', 'maf-ad', 'X-TV-TWITCH-AD', 'Amazon|', 'DCM,')

# Fake breaks (T-829 test, --fake-breaks EVERY:LENGTH, Firefox): runs before any page script of every page. Sets the
# schedule the page's workers get (window.__e2eFakeBreaks: the first window WARM_UP s after the page opens, then one
# every EVERY s for LENGTH s; e2e/worker-logger.js titles the player's own playlists as ads inside them) and, with
# --pauses, clicks the player's play/pause button inside windows, cycling through PAUSES: [seconds after the window
# starts, seconds paused] or null. Its events are drained with the rest (`fake`).
FAKE_WARM_UP = 30
PAUSES = [[8, 3], [0.5, 3], ['end', 3], None]  # the middle; the change to the backup; across the change back; none
FAKE_BREAKS_JS = """() => {
  const config = __CONFIG__;
  const start = Date.now() + config.warmUp * 1000;
  window.__e2eFakeBreaks = { start, every: config.every, length: config.length };
  const fake = (window.__e2eFake = { events: [] });
  const push = (type, extra) => fake.events.length < 2000 && fake.events.push(Object.assign({ wall: Date.now(), type }, extra));
  const done = new Set();
  let on = false;
  const click = (want, index) => {
    const v = document.querySelector('video');
    const button = document.querySelector('[data-a-target="player-play-pause-button"]');
    if (!v || !button) return push('no player button', { index });
    if ((want === 'pause') === v.paused) return push('already ' + (v.paused ? 'paused' : 'playing'), { index });
    button.click();
    push(want === 'pause' ? 'test pause' : 'test play', { index, currentTime: Math.round(v.currentTime * 10) / 10 });
  };
  setInterval(() => {
    const now = Date.now();
    if (now < start) return;
    const index = Math.floor((now - start) / (config.every * 1000));
    const offset = ((now - start) % (config.every * 1000)) / 1000;
    if ((offset < config.length) !== on) {
      on = offset < config.length;
      push(on ? 'fake break start' : 'fake break end', { index });
    }
    const plan = config.pauses.length ? config.pauses[index % config.pauses.length] : null;
    if (!plan) return;
    const at = plan[0] === 'end' ? config.length - 1 : plan[0];
    if (!done.has(index + 'pause') && offset >= at) { done.add(index + 'pause'); click('pause', index); }
    if (done.has(index + 'pause') && !done.has(index + 'play') && offset >= at + plan[1]) { done.add(index + 'play'); click('play', index); }
  }, 200);
}"""


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
        self.last_live = time.time()  # last main media playlist poll seen
        self.stitched_ended = 0  # stitched breaks that started and ended on this channel (--stop-after-breaks)
        self.in_stitched = False
        self.last_break_end = None  # time of the last break end (--hop)


class MediaLog:
    """The browser's media log for the session's tab (CDP Media domain, what chrome://media-internals shows), kept
    until the next drain."""

    def __init__(self):
        self.entries = []

    async def attach(self, tab):
        for event, kind in ((uc.cdp.media.PlayerMessagesLogged, 'messages'), (uc.cdp.media.PlayerErrorsRaised, 'errors'),
                            (uc.cdp.media.PlayerEventsAdded, 'events'), (uc.cdp.media.PlayerPropertiesChanged, 'properties')):
            tab.add_handler(event, lambda e, kind=kind: self.add(kind, e))
        await tab.send(uc.cdp.media.enable())

    def add(self, kind, event):
        items = {'messages': lambda: [{'level': m.level, 'message': m.message[:500]} for m in event.messages],
                 'errors': lambda: [{'type': x.error_type, 'code': x.code, 'data': x.data} for x in event.errors],
                 'events': lambda: [{'timestamp': x.timestamp, 'value': x.value[:500]} for x in event.events],
                 'properties': lambda: [{'name': x.name, 'value': x.value[:300]} for x in event.properties]}[kind]()
        for item in items:
            self.entries.append({'wall': int(time.time() * 1000), 'player': str(event.player_id), 'kind': kind, **item})

    def take(self):
        entries, self.entries = self.entries, []
        return entries


async def drain(session, recorder, watch, mode, final=False, media_log=None, all_playlists=False):
    data = await lib.read(session.tab, DRAIN_JS % json.dumps(sel.as_dict()))
    wall = stamp()
    base = {'drain': wall, 'channel': watch.channel, 'load': watch.load}
    data['mediaLog'] = media_log.take() if media_log else []
    data['console'] = session.take_console() if hasattr(session, 'take_console') else []  # Firefox: the page's console
    watch.player_urls.update(d['url'] for d in data['delivered'] if (d.get('playlist') or {}).get('type') == 'media')
    for name in ('server', 'delivered', 'serverTexts', 'workerLog', 'csai', 'csaiAnswers', 'media', 'events', 'transitions', 'player', 'playerEvents', 'mse', 'mediaLog', 'console'):
        for entry in data[name]:
            recorder.write(name, {**base, **entry})
    for entry in data['playlists']:
        if all_playlists or any(m in entry.get('text', '') for m in AD_TEXT_MARKERS):
            recorder.write('playlists', {**base, **entry})
    sample = {k: data[k] for k in ('url', 'video', 'videos', 'adOverlay', 'playerError', 'contentGate', 'workers', 'timeOrigin')}
    sample['counts'] = {k: len(data[k]) for k in ('server', 'delivered', 'serverTexts', 'workerLog', 'csai', 'csaiAnswers', 'events', 'transitions')}
    recorder.write('samples', {**base, **sample})
    # T-829: errors of the player, the <video> and its Media Source, and uncaught ones, as notes in the session log
    for entry in data['playerEvents']:
        if 'Error' in entry['type']:
            recorder.note('player error', type=entry['type'], detail=entry['detail'], at=stamp(entry['wall']))
    for entry in data['media']:
        if entry.get('event') == 'error':
            recorder.note('video error', error=entry.get('error'), currentTime=entry.get('currentTime'))
    for entry in data['mse']:
        if entry.get('op') in ('error', 'appendBuffer threw', 'remove threw', 'endOfStream'):
            recorder.note('media source error', op=entry['op'], sb=entry.get('sb'), error=entry.get('error'), at=stamp(entry['wall']))
    for entry in data['fake']:
        recorder.write('fake', {**base, **entry})
        recorder.note(entry['type'], **{k: v for k, v in entry.items() if k not in ('type', 'wall')}, at=stamp(entry['wall']))
    for entry in data['workerLog']:
        if entry.get('kind') in ('error', 'rejection'):
            recorder.note('worker uncaught', kind=entry['kind'], text=str(entry.get('text'))[:300], at=stamp(entry['wall']))

    # breaks: without Purple every media playlist is the player's; with Purple, the ones it delivered
    for entry in data['server']:
        marks = ad_marks(entry.get('playlist'))
        main = mode == 'record' or entry['url'] in watch.player_urls
        if marks:
            role = 'main' if main else 'backup'
            if main:
                watch.last_live = time.time()
            if main and not watch.in_break:
                watch.in_break, watch.breaks = True, watch.breaks + 1
                watch.stitched += marks['kind'] in ('SSAI', 'MARKED_LIVE')
                watch.in_stitched = marks['kind'] in ('SSAI', 'MARKED_LIVE')
                recorder.note('break start', channel=watch.channel, at=stamp(entry.get('wall')), **marks)
            elif main and marks['kind'] in ('SSAI', 'MARKED_LIVE') and not watch.in_stitched:
                # a stitched midroll that starts inside a twitch-maf-ad slot: the same break, now a stitched one
                watch.stitched += 1
                watch.in_stitched = True
                recorder.note('stitched break start', channel=watch.channel, at=stamp(entry.get('wall')), **marks)
            recorder.write('marks', {**base, 'wall': stamp(entry.get('wall')), 'role': role, 'url': entry['url'], **marks})
        elif main and (entry.get('playlist') or {}).get('type') == 'media':
            watch.last_live = time.time()
        if not marks and main and watch.in_break and (entry.get('playlist') or {}).get('type') == 'media':
            watch.in_break = False
            watch.stitched_ended += watch.in_stitched
            watch.in_stitched = False
            watch.last_break_end = time.time()
            recorder.note('break end', channel=watch.channel, at=stamp(entry.get('wall')))
    for entry in data['csai']:
        recorder.note('edge.ads request', path=entry.get('path'), bp=entry.get('bp'), status=entry.get('status'), at=stamp(entry.get('wall')))
    for entry in data['csaiAnswers']:
        recorder.note('edge.ads answer', path=entry.get('path'), bp=entry.get('bp'), status=entry.get('status'), body=entry.get('body'))
    for entry in data['events']:
        if entry.get('type') not in ('backupUsed',):
            recorder.note('purple event', **{k: entry.get(k) for k in ('type', 'playerType', 'quality', 'count')})

    # failure clock: error overlay, no video, or currentTime not advancing between drains
    video = data['video'] or {}
    first = watch.last_time is None
    progressing = not video.get('paused') and (video.get('currentTime') or 0) > (watch.last_time or 0)
    watch.last_time = video.get('currentTime')
    healthy = not data['playerError'] and not data['contentGate'] and bool(video) and (progressing or first)
    # a twitch-maf-ad slot does not stop the video: only a stitched break holds the failure clock (a channel stuck after
    # a preroll stayed 18 minutes in soak k, its clock reset by a slot every 4 minutes)
    if healthy or watch.in_stitched or final:
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


async def open_next(session, recorder, tried, slot, load, fixed=None, shuffle=False):
    """Opens the first directory channel not tried yet, not gated and not watched by another session (with `shuffle`,
    the directory's cards in random order)."""
    cards = [fixed] if fixed else await directory(session)
    if shuffle and not fixed:
        ordered = random.sample(cards, len(cards))
    else:
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
    stitched_before, offline = 0, set()  # stitched breaks ended on earlier channels; channels left as offline
    try:
        settings = dict(args.setting or [])
        if args.browser == 'firefox':
            forced = {**settings, **({'debug': True} if args.debug else {})}
            env = {'MOZ_LOG': args.moz_log, 'MOZ_LOG_FILE': os.path.join(recorder.directory, 'mozlog.txt')} if args.moz_log else None
            preloads = []
            if args.fake_breaks:
                every, length = (float(x) for x in args.fake_breaks.split(':'))
                config = {'warmUp': FAKE_WARM_UP, 'every': every, 'length': length, 'pauses': PAUSES if args.pauses else []}
                preloads.append(FAKE_BREAKS_JS.replace("__CONFIG__", json.dumps(config)))
            session = await firefox.Firefox.launch(None if args.mode == 'record' else firefox.BUILD, visible=args.visible,
                                                   settings=forced or None, env=env, audio=args.audio, preloads=preloads)
            media_log = None
        else:
            session = await lib.launch(args.mode, profile=profile, visible=args.visible, debug=args.debug)
            media_log = MediaLog()
            await media_log.attach(session.tab)
            if settings:
                await lib.set_storage(session, **settings)
        recorder.note('launched', mode=args.mode, debug=args.debug, settings=settings, until=end.isoformat(timespec='minutes'))
        watch, ended = None, 'end of run'
        while datetime.datetime.now() < end:
            if watch is None:
                load += 1
                # --channel: the first load; with --rotate 0 every load (the channel is reopened after a failure)
                fixed = args.channel if (load == 1 or not args.rotate) and args.channel not in offline else None
                watch = await open_next(session, recorder, tried, args.slot, load, fixed, shuffle=bool(args.hop))
                if watch is None:
                    tried = set(args.avoid.split(',')) if args.avoid else set()
                    await asyncio.sleep(60)
                    continue
            await asyncio.sleep(DRAIN)
            try:
                data = await drain(session, recorder, watch, args.mode, media_log=media_log, all_playlists=args.all_playlists)
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
            elif data['contentGate']:
                # the gate can come up after the player started (logged out, mature-rated channel): not a playing load
                reason = 'content classification gate'
                tried.add(watch.channel)
            elif watch.failing_since and time.time() - watch.failing_since > FAILED_AFTER:
                reason = 'player failed or channel offline'
            elif not watch.failing_since and time.time() - watch.last_live > NO_LIVE_AFTER:
                reason = f'no live media playlist for {NO_LIVE_AFTER} s (offline, or a recorded video)'
                offline.add(watch.channel)
                tried.add(watch.channel)
            elif args.hop and not watch.in_break and time.time() - max(watch.started, watch.last_break_end or 0) > args.hop:
                reason = f'{args.hop} s after the load or the last break end (--hop)'
                tried.add(watch.channel)
            elif args.rotate and minutes > args.rotate and not watch.stitched and not watch.in_break:
                reason = f'{args.rotate} minutes without a stitched break'
            elif args.leave_after_breaks and watch.stitched_ended >= args.leave_after_breaks and not watch.in_break:
                reason = f'{args.leave_after_breaks} stitched breaks on the channel'
                tried.add(watch.channel)
            if args.stop_after_breaks and stitched_before + watch.stitched_ended >= args.stop_after_breaks and not watch.in_break:
                recorder.note('goal reached', stitched_breaks=stitched_before + watch.stitched_ended, minutes=round(minutes, 1))
                ended = f'{args.stop_after_breaks} stitched breaks'
                break
            if reason:
                recorder.note('leaving channel', channel=watch.channel, reason=reason, minutes=round(minutes, 1), breaks=watch.breaks)
                recorder.write('watches', {'channel': watch.channel, 'load': watch.load, 'start': stamp(watch.started * 1000),
                                           'end': stamp(), 'minutes': round(minutes, 1), 'breaks': watch.breaks, 'reason': reason})
                stitched_before += watch.stitched_ended
                watch = None
        if watch:
            await drain(session, recorder, watch, args.mode, final=True, media_log=media_log, all_playlists=args.all_playlists)
            minutes = (time.time() - watch.started) / 60
            recorder.write('watches', {'channel': watch.channel, 'load': watch.load, 'start': stamp(watch.started * 1000),
                                       'end': stamp(), 'minutes': round(minutes, 1), 'breaks': watch.breaks, 'reason': ended})
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


def setting(text):
    key, _, value = text.partition('=')
    if not key or not value:
        raise argparse.ArgumentTypeError('expected KEY=JSON')
    try:
        return key, json.loads(value)
    except json.JSONDecodeError as error:
        raise argparse.ArgumentTypeError(f'{key}: {error}')


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
    ap.add_argument('--stop-after-breaks', type=int, default=0, metavar='N',
                    help='end the session once N stitched breaks have ended (the time limit still applies)')
    ap.add_argument('--leave-after-breaks', type=int, default=0, metavar='N',
                    help='move to another channel once N stitched breaks have ended on this one')
    ap.add_argument('--hop', type=float, default=0, metavar='SECONDS',
                    help='leave each channel SECONDS after the load or the last break end, the directory in random order')
    ap.add_argument('--out', default=os.path.join(RECORDINGS, f'{datetime.date.today().isoformat()}-soak'))
    ap.add_argument('--visible', action='store_true')
    ap.add_argument('--setting', action='append', type=setting, metavar='KEY=JSON',
                    help='extension mode: a stored setting before the first channel, e.g. pausePlayDelayMs=0 (repeatable)')
    ap.add_argument('--all-playlists', action='store_true', help='keep the text of every media playlist the player got (T-825)')
    ap.add_argument('--browser', choices=('chromium', 'firefox'), default='chromium',
                    help='chromium: Edge or PURPLE_BROWSER through nodriver; firefox: e2e/firefox.py (extension or record mode)')
    ap.add_argument('--moz-log', metavar='MODULES', help='Firefox: MOZ_LOG modules, written to mozlog*.txt in the session directory')
    ap.add_argument('--fake-breaks', metavar='EVERY:LENGTH',
                    help='Firefox: the player\'s own playlists titled as ads for LENGTH s every EVERY s (Purple switches to a backup)')
    ap.add_argument('--pauses', action='store_true', help='with --fake-breaks: click pause and play inside the windows (PAUSES)')
    ap.add_argument('--audio', action='store_true', help='Firefox: sound on (the runs are muted otherwise)')
    args = ap.parse_args()
    if args.browser == 'firefox' and args.mode not in ('extension', 'record'):
        ap.error('--browser firefox runs in extension or record mode')
    if (args.fake_breaks or args.audio) and args.browser != 'firefox':
        ap.error('--fake-breaks and --audio run on --browser firefox')
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
