"""Firefox's own media log against a soak's breaks and Purple's changes of source (T-829, 2026-11-06).

Usage: python docs/findings/probes/firefox_media_log_probe.py <session folder> [--events] [--min-ms N]

Needs a soak run with --browser firefox --moz-log "timestamp,MediaFormatReader:4" (mozlog*.moz_log in the session
folder: MOZ_LOG lines with a UTC time). Each MediaFormatReader (one per MediaSource the page's player builds) is read
on its own:

- its events: a track's stream id changing (a new init segment was appended; `recyclable=false` means Firefox drains
  that track's decoder and builds a new one), decoder inits, Reset(Audio/Video), seeks, video skips to the next key
  frame, changes of picture size;
- the decoded output of each track in order (`ReturnOutput: Resolved data promise for Audio [start, end]`, in
  microseconds of the media timeline): `gap` when an output starts more than --min-ms (default 5) after the end of the
  one before it; `back` when an audio output starts more than --min-ms before that end, or a video frame before the
  start of the frame before it (video frames can come with longer durations than their spacing: 100 ms every 33 ms
  on a TS channel's break, 2026-11-07). A seek or reset in between is shown with them;
- `media error`: a line of any module (also MediaSource:4, TrackBuffersManager's appends) naming an NS_ERROR other
  than waiting for data, end of stream or canceled (2026-11-07).

The main stream's reader is the one with the most decoded outputs; the others (the page's picture-by-picture player,
players of page-side ads) are counted apart. Then per break of the soak (log.jsonl: break start to break end, 10 s on
each side) and for the whole session, on the main reader: the counts of stream id changes, decoder inits, resets,
seeks, `back` and `gap` and their sum in ms, the changes of source Purple made (events.jsonl `backupUsed`, a debug
run), and each change of the page's `<video>` elements' sound (transitions.jsonl `videoSound`: playing or stopped,
muted, volume below 1; 2026-11-07), with `(N with sound)` when more than one element played unmuted, and the soak's
error notes (log.jsonl: `player error`, `video error`, `media source error`, `worker uncaught`) and the page
console's errors and warnings (console.jsonl) in the window, each with its time and text.
--events prints the main reader's events and every back or gap with its local time (--all: every reader's).
"""
import collections
import datetime
import glob
import json
import re
import sys

LINE = re.compile(r'^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d+) UTC - .*?: [VDIWE]/(\w+) (.*)$')
ERROR = re.compile(r'NS_ERROR_\w+')
BENIGN = {'NS_ERROR_DOM_MEDIA_WAITING_FOR_DATA', 'NS_ERROR_DOM_MEDIA_END_OF_STREAM', 'NS_ERROR_DOM_MEDIA_CANCELED'}
NOTES = ('player error', 'video error', 'media source error', 'worker uncaught')
READER = re.compile(r'MediaFormatReader\[(0x[0-9a-f]+)\]')
OUTPUT = re.compile(r'Resolved data promise for (Audio|Video) \[(-?\d+), (-?\d+)\]')
STREAM_ID = re.compile(r'(Audio|Video) stream id has changed from:(\d+) to:(\d+), recyclable=(\w+)')
INIT = re.compile(r'Decoder init finished for (audio|video) codec')
RESET = re.compile(r'Reset\((Audio|Video)\) BEGIN')
SEEK = re.compile(r'::Seek: aTarget=\((-?\d+)\)')
SKIP = re.compile(r'SkipVideoDemuxToNextKeyFrame: Skipping up to (-?\d+)')
SIZE = re.compile(r'change of video display size \((\S+)\)')


def wall(text):
    t = datetime.datetime.strptime(text[:26], '%Y-%m-%d %H:%M:%S.%f').replace(tzinfo=datetime.timezone.utc)
    return t.timestamp() * 1000


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:12]


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def read_log(folder, min_us):
    readers = collections.defaultdict(lambda: {'events': [], 'last': {}, 'outputs': 0, 'first': None, 'end': None})
    current = '?'  # lines without a reader (decoder inits) go to the last one seen
    for path in sorted(glob.glob(f'{folder}/mozlog*.moz_log')):
        for line in open(path, encoding='utf-8', errors='replace'):
            m = LINE.match(line)
            if not m:
                continue
            at, text = wall(m.group(1)), m.group(3)
            found = READER.search(text)
            current = found.group(1) if found else current
            r = readers[current]
            r['first'] = r['first'] or at
            r['end'] = at
            o = OUTPUT.search(text)
            if o:
                r['outputs'] += 1
                track, start, end = o.group(1), int(o.group(2)), int(o.group(3))
                previous = r['last'].get(track)
                if previous is not None:
                    limit = previous[0] if track == 'Video' else previous[1] - min_us
                    if start < limit:
                        r['events'].append((at, f'{track.lower()} back', (limit + (0 if track == 'Video' else min_us) - start) / 1000))
                    elif start > previous[1] + min_us:
                        r['events'].append((at, f'{track.lower()} gap', (start - previous[1]) / 1000))
                r['last'][track] = (start, end)
                continue
            errors = [name for name in ERROR.findall(text) if name not in BENIGN]
            if errors:
                r['events'].append((at, 'media error', f'{m.group(2)}: {text[:200]}'))
                continue
            s = STREAM_ID.search(text)
            if s:
                r['events'].append((at, f'{s.group(1).lower()} stream id', f'{s.group(2)}->{s.group(3)} recyclable={s.group(4)}'))
                continue
            for pattern, name in ((INIT, 'decoder init'), (RESET, 'reset'), (SEEK, 'seek'), (SKIP, 'video skip'), (SIZE, 'size')):
                e = pattern.search(text)
                if e:
                    label = f'{e.group(1).lower()} {name}' if name in ('decoder init', 'reset') else name
                    r['events'].append((at, label, e.group(1)))
                    if name == 'seek':
                        r['last'] = {}  # outputs restart from the seek target
                    break
    return readers


def breaks(folder):
    out, start = [], None
    for r in rows(f'{folder}/log.jsonl'):
        note = r.get('note')
        at = r.get('at')
        if not at:
            continue
        ms = datetime.datetime.fromisoformat(at).timestamp() * 1000
        if note == 'break start' and start is None:
            start = (ms, r.get('kind'), r.get('channel'))
        elif note == 'stitched break start' and start is not None:
            start = (start[0], 'stitched', start[2])
        elif note == 'break end' and start is not None:
            out.append((start[0], ms, start[1], start[2]))
            start = None
    return out


def main(folder, show=False, min_ms=5.0):
    readers = read_log(folder, min_ms * 1000)
    used = [(r['at'], r.get('playerType')) for r in rows(f'{folder}/events.jsonl') if r.get('type') == 'backupUsed']
    sound = [(r['wall'], r['value']) for r in rows(f'{folder}/transitions.jsonl') if r.get('key') == 'videoSound']
    notes = [(datetime.datetime.fromisoformat(r.get('at') or r['wall']).timestamp() * 1000, r['note'],
              {k: v for k, v in r.items() if k not in ('wall', 'note', 'at')}) for r in rows(f'{folder}/log.jsonl') if r.get('note') in NOTES]
    console = [(r['wall'], r['level'], r.get('text', '')) for r in rows(f'{folder}/console.jsonl') if r.get('wall')]
    spans = breaks(folder)
    # the main stream's reader decodes the most; the others are the page's picture-by-picture player and ad players
    main_reader = max(readers, key=lambda k: readers[k]['outputs']) if readers else None
    for reader, data in sorted(readers.items(), key=lambda item: item[1]['first'] or 0):
        role = 'main' if reader == main_reader else 'other'
        print(f"== reader {reader} ({role}): {clock(data['first'])} to {clock(data['end'])}, {data['outputs']} outputs, {len(data['events'])} events")
        if show and (role == 'main' or '--all' in sys.argv):
            for at, kind, value in sorted(data['events']):
                print(f'  {clock(at)} {kind:18} {value}')
    every = sorted(readers[main_reader]['events']) if main_reader else []
    others = sorted(e for k, data in readers.items() if k != main_reader for e in data['events'])

    def summary(label, lo, hi):
        inside = [e for e in every if lo <= e[0] <= hi]
        other = len([e for e in others if lo <= e[0] <= hi])
        count = collections.Counter(kind for _, kind, _ in inside)
        ms = collections.defaultdict(float)
        for _, kind, value in inside:
            if kind.endswith(('back', 'gap')):
                ms[kind] += value
        switches = len([1 for at, _ in used if lo <= at <= hi])
        parts = [f'{kind} {count[kind]}' + (f' ({ms[kind]:.0f} ms)' if kind in ms else '') for kind in sorted(count)]
        print(f'  {label}: backupUsed {switches}; ' + ('; '.join(parts) or 'no events') + (f'; other readers {other} events' if other else ''))
        for at, value in sound:
            if lo <= at <= hi:
                audible = len([1 for v in value.split(', ') if 'playing' in v and 'muted' not in v])
                print(f'    {clock(at)} videos {value}' + (f'  ({audible} with sound)' if audible > 1 else ''))
        for at, note, fields in notes:
            if lo <= at <= hi:
                print(f'    {clock(at)} {note} {json.dumps(fields)[:300]}')
        for at, kind, value in inside:
            if kind == 'media error':
                print(f'    {clock(at)} media error {value}')
        for at, level, text in console:
            if lo <= at <= hi:
                print(f'    {clock(at)} console {level} {text[:200]}')

    print('== per break (10 s on each side)')
    for start, end, kind, channel in spans:
        summary(f'{clock(start)} to {clock(end)} {kind} {channel}', start - 10000, end + 10000)
    if every:
        print('== whole session')
        summary('all', every[0][0], every[-1][0])


if __name__ == '__main__':
    args = sys.argv[1:]
    min_ms = float(args[args.index('--min-ms') + 1]) if '--min-ms' in args else 5.0
    main(args[0], '--events' in args, min_ms)
