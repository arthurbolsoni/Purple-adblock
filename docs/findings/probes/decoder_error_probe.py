"""When the player's decoder logs "AVC finishFrame called without active frame", against the switches of the playlist
source and the video (2026-10-09).

Usage: python docs/findings/probes/decoder_error_probe.py <session folder>...

For each such console line from inside the workers (workerLog.jsonl): the nearest change of the source of the
player's playlist before it (the same attribution as switch_gap_probe.py: Purple's `Stream Type: <type> - Free
Stream` line before each delivered playlist, else the main playlist), the seconds since it, and whether the <video>
stood still around it (transitions.jsonl `progressing`, from 2 s before to 5 s after). With player.jsonl frame counters
(soak.py from soak l on: the page player's getDroppedFrames() and the <video>'s getVideoPlaybackQuality()): the frames
dropped and corrupted from 2 s before to 3 s after each line, the picture size before and after, and the same counts
over every 5 s of the session for comparison.
"""
import datetime
import json
import re
import sys

TYPE = re.compile(r'\[Purple\]: Stream Type: (\S+) - Free Stream')
TEXT = 'AVC finishFrame called without active frame'


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:-3]


for folder in sys.argv[1:]:
    log = rows(f'{folder}/workerLog.jsonl')
    delivered = [d for d in rows(f'{folder}/delivered.jsonl') if (d.get('playlist') or {}).get('type') == 'media']
    counts = {}
    for d in delivered:
        counts[(d.get('load'), d['worker'])] = counts.get((d.get('load'), d['worker']), 0) + 1
    best = {}
    for (load, worker), n in counts.items():
        if n > counts.get((load, best.get(load)), 0):
            best[load] = worker
    mains = set(best.values())  # the main player's worker of each channel load
    purple = {}
    for e in log:
        if e['kind'] == 'console' and e['worker'] in mains and '[Purple]' in e.get('text', ''):
            purple.setdefault(e['worker'], []).append(e)
    sources = []  # (wall, worker, from, to)
    for worker in mains:
        previous = None
        for d in sorted((d for d in delivered if d['worker'] == worker), key=lambda d: d['wall']):
            own = [e for e in purple.get(worker, []) if e['wall'] <= d['wall']]
            last = own[-1] if own else None
            m = TYPE.search(last['text']) if last and d['wall'] - last['wall'] <= 200 else None
            source = m.group(1) if m else 'main'
            if source != previous:
                sources.append((d['wall'], worker, previous, source))
                previous = source
    sources.sort()
    frames = sorted(rows(f'{folder}/player.jsonl'), key=lambda r: r['wall'])

    def counter_at(moment, key):
        before = [r for r in frames if r['wall'] <= moment and r.get(key) is not None]
        return before[-1][key] if before else None

    def delta(lo, hi, key):
        a, b = counter_at(lo, key), counter_at(hi, key)
        return None if a is None or b is None or b < a else b - a

    still, since = [], None
    for t in rows(f'{folder}/transitions.jsonl'):
        if t['key'] == 'progressing':
            if t['value'] is False:
                since = t['wall']
            elif since is not None:
                still.append((since, t['wall']))
                since = None
    print('==', folder)
    for e in log:
        if e['kind'] == 'console' and TEXT in e.get('text', ''):
            before = [x for x in sources if x[0] <= e['wall'] and x[1] == e['worker']]
            switch = (before[-1][0], before[-1][2], before[-1][3]) if before else None
            stood = any(a - 2000 <= e['wall'] <= b + 5000 for a, b in still)
            where = f'{(e["wall"] - switch[0]) / 1000:.1f} s after {switch[1]} -> {switch[2]}' if switch else 'no switch before'
            extra = ''
            if frames:
                lo, hi = e['wall'] - 2000, e['wall'] + 3000
                extra = (f"; dropped {delta(lo, hi, 'dropped')}, video dropped {delta(lo, hi, 'videoDropped')}, corrupted {delta(lo, hi, 'videoCorrupted')}, "
                         f"size {counter_at(lo, 'size')} -> {counter_at(hi, 'size')}")
            print(f"  {clock(e['wall'])} worker {e['worker']}{' (main)' if e['worker'] in mains else ''}: {where}; still around it: {stood}{extra}")
    if frames:
        windows = []
        for start in range(int(frames[0]['wall']), int(frames[-1]['wall']) - 5000, 5000):
            d = delta(start, start + 5000, 'videoDropped')
            if d is not None:
                windows.append(d)
        nonzero = [d for d in windows if d]
        print(f"  every 5 s of the session: {len(windows)} windows, {len(nonzero)} with dropped frames, {sum(windows)} dropped in all")
