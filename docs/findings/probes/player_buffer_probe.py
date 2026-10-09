"""The page player's buffer and latency around each stitched break of soak sessions (T-814, 2026-10-09).

Usage: python docs/findings/probes/player_buffer_probe.py <session folder>...

Reads player.jsonl (soak.py's page monitor: the page player's getBufferDuration(), getLiveLatency() and
getPlaybackRate() every second), log.jsonl (break start and end) and media.jsonl (E6 restarts: `play` at currentTime
0). For each stitched break: median buffer and latency over the 60 s before it, the lowest buffer and highest latency
inside it, and median and lowest buffer, median latency and the seconds at a rate other than 1 in the windows 0-30 s,
30-90 s and 90-180 s after its end; then the same over the whole session.
"""
import datetime
import json
import statistics
import sys


def epoch(iso):
    return datetime.datetime.fromisoformat(iso).timestamp()


def clock(s):
    return datetime.datetime.fromtimestamp(s).strftime('%H:%M:%S')


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def window(samples, lo, hi):
    return [s for s in samples if lo <= s['t'] < hi]


def describe(part):
    buffers = [s['buffer'] for s in part if s['buffer'] is not None]
    latencies = [s['latency'] for s in part if s['latency'] is not None]
    if not buffers:
        return 'no samples'
    fast = sum(1 for s in part if s['rate'] not in (1, None))
    return (f"buffer median {statistics.median(buffers):.2f} min {min(buffers):.2f}, latency median "
            f"{statistics.median(latencies):.2f} max {max(latencies):.2f}, rate != 1: {fast} s, {len(part)} samples")


for folder in sys.argv[1:]:
    print('==', folder)
    samples = [{'t': r['wall'] / 1000, 'buffer': r.get('buffer'), 'latency': r.get('latency'), 'rate': r.get('rate')} for r in rows(f'{folder}/player.jsonl')]
    log = rows(f'{folder}/log.jsonl')
    origin = next((r['timeOrigin'] for r in rows(f'{folder}/samples.jsonl')), 0)
    restarts = [(origin + m['at']) / 1000 for m in rows(f'{folder}/media.jsonl') if m.get('event') == 'play' and m.get('currentTime') == 0]
    breaks, start = [], None
    for r in log:
        if r.get('note') in ('break start', 'stitched break start') and r.get('kind') != 'MAF' and start is None:
            start = epoch(r['at'])
        elif r.get('note') == 'break end' and start is not None:
            breaks.append((start, epoch(r['at'])))
            start = None
    for b0, b1 in breaks:
        edge_restarts = [clock(r) for r in restarts if b0 - 5 <= r <= b1 + 5]
        print(f'  break {clock(b0)} to {clock(b1)}, restarts {edge_restarts}')
        print(f'    60 s before: {describe(window(samples, b0 - 60, b0))}')
        print(f'    inside:      {describe(window(samples, b0, b1))}')
        for lo, hi in ((0, 30), (30, 90), (90, 180)):
            print(f'    {lo}-{hi} s after: {describe(window(samples, b1 + lo, b1 + hi))}')
    print(f'  session: {describe(samples)}')
