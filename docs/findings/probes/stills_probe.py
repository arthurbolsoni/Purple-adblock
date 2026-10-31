"""Still video per load, with the Media Source buffer under the playhead at each still (T-827, 2026-10-31).

Usage: python docs/findings/probes/stills_probe.py <session folder> [--min SECONDS]

Reads player.jsonl (the page player's currentTime, buffer and latency each second) and mse.jsonl (e2e/mse-hook.js) of
a soak. A still is a run of samples, --min (default 2) or more, where currentTime moved less than 0.3 s from one second
to the next. For each still: its start, length, the time since the previous still, the player's buffer and latency at
its first sample, and how far the newest buffered range of each SourceBuffer ended past the playhead (the last append
or removal before the still). Then per load: stills, their median interval, and the SourceBuffers it had.
"""
import bisect
import datetime
import json
import statistics
import sys


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S')


def main(folder, least=2):
    samples, buffers, kinds = {}, {}, {}
    # a load is (channel, load number): a session name used again in the same folder numbers its loads from 1 again
    for p in rows(f'{folder}/player.jsonl'):
        samples.setdefault((p.get('channel'), p.get('load')), []).append(p)
    for r in rows(f'{folder}/mse.jsonl'):
        load = (r.get('channel'), r.get('load'))
        if r['op'] == 'add':
            kinds.setdefault(load, {})[r['sb']] = r.get('type')
        elif r.get('ranges'):
            buffers.setdefault((load, r['sb']), []).append((r['wall'], r['ranges'][-1][1]))
    for load, points in samples.items():
        channel = load[0]
        stills, run = [], []
        for a, b in zip(points, points[1:]):
            if 0 <= b['currentTime'] - a['currentTime'] < 0.3:
                run = run or [a]
                run.append(b)
            else:
                if len(run) - 1 >= least:
                    stills.append(run)
                run = []
        print(f'== load {load[1]} {channel}: {len(points)} s sampled, {len(stills)} stills of {least} s or more; SourceBuffers {kinds.get(load)}')
        previous = None
        for run in stills:
            first = run[0]
            ahead = []
            for sb in sorted(kinds.get(load, {})):
                series = buffers.get((load, sb), [])
                i = bisect.bisect([w for w, _ in series], first['wall']) - 1
                if i >= 0:
                    ahead.append(f'sb{sb} {series[i][1] - first["currentTime"]:+.2f}')
            since = f'{(first["wall"] - previous) / 1000:5.0f} s after the last' if previous else ''
            print(f"  {clock(first['wall'])} {len(run) - 1} s  {since:22} buffer {first.get('buffer')}  latency {first.get('latency')}  ends past the playhead: {', '.join(ahead)}")
            previous = first['wall']
        if len(stills) > 1:
            gaps = [(b[0]['wall'] - a[0]['wall']) / 1000 for a, b in zip(stills, stills[1:])]
            print(f'  median interval {statistics.median(gaps):.0f} s')


if __name__ == '__main__':
    args = sys.argv[1:]
    main(args[0], int(args[args.index('--min') + 1]) if '--min' in args else 2)
