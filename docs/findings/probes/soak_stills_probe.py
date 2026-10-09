"""Every stretch the main <video> stood still in soak sessions, and how far it played behind the wall clock (T-809,
2026-10-09).

Usage: python docs/findings/probes/soak_stills_probe.py <session folder>...

Still stretches: the page monitor's `progressing` transitions (1 s samples), each with the nearest stitched break edge
(log.jsonl `break start` of a non-MAF break, and the next `break end`), whether or not it fell inside the break.

Offset: wall clock minus `currentTime` at each 30 s sample. While the video plays at rate 1 it stays constant; a still
stretch adds to it, a skip forward or a faster rate takes from it, so its change across a break is how much further
behind the stream the video plays after it. A restart (`play` with currentTime 0, E6's pause and play) resets
currentTime: offsets are only compared between two restarts.
"""
import datetime
import json
import sys


def clock(s):
    return datetime.datetime.fromtimestamp(s).strftime('%H:%M:%S')


def epoch(iso):
    return datetime.datetime.fromisoformat(iso).timestamp()


for folder in sys.argv[1:]:
    print('==', folder)
    log = [json.loads(line) for line in open(f'{folder}/log.jsonl', encoding='utf-8')]
    starts = [epoch(r['at']) for r in log if r.get('note') == 'break start' and r.get('kind') != 'MAF']
    edges = [(s, 'start') for s in starts]
    for r in log:
        if r.get('note') == 'break end' and any(0 < epoch(r['at']) - s < 180 for s in starts):
            edges.append((epoch(r['at']), 'end'))

    total, since = 0, None
    for line in open(f'{folder}/transitions.jsonl', encoding='utf-8'):
        r = json.loads(line)
        if r['key'] != 'progressing':
            continue
        w = r['wall'] / 1000
        if r['value'] is False:
            since = w
        elif since is not None:
            near = min(edges, key=lambda e: abs(e[0] - since)) if edges else None
            where = f'{since - near[0]:+.0f} s from midroll {near[1]} {clock(near[0])}' if near and abs(since - near[0]) < 180 else 'no midroll near'
            print(f'  still {clock(since)} {w - since:.0f} s, {where}')
            total += w - since
            since = None
    print(f'  still in all: {total:.0f} s')

    origin = json.loads(open(f'{folder}/samples.jsonl', encoding='utf-8').readline())['timeOrigin']
    restarts = []
    media = [json.loads(line) for line in open(f'{folder}/media.jsonl', encoding='utf-8')]
    for m in media:
        if m.get('event') == 'play' and m['currentTime'] == 0:
            restarts.append((origin + m['at']) / 1000)
    previous = None
    for line in open(f'{folder}/samples.jsonl', encoding='utf-8'):
        s = json.loads(line)
        w, t = epoch(s['drain']), s['video']['currentTime']
        offset = w - t
        span = sum(1 for r in restarts if r <= w)
        if previous and previous[1] == span and abs(offset - previous[0]) >= 0.5:
            print(f'  offset {clock(w)} {offset - previous[0]:+.1f} s since the sample before')
        elif previous and previous[1] != span:
            print(f'  offset {clock(w)} restart before this sample')
        previous = (offset, span)
