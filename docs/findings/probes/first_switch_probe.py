"""Time from the first playlist with ads of a break to the first backup Purple gives the player (2026-10-10).

Usage: python docs/findings/probes/first_switch_probe.py <soak session folder> [...]

From each session's events.jsonl (e2e/soak.py, extension mode with debug): a break starts at an adDetected with none
in the same load in the 20 s before. For each: seconds to the next backupUsed and its type and quality, the number of
backupBehind before it, and whether it came in the first 15 s of the load (a preroll, or a midroll at the load).
Prints the median per group.
"""
import collections
import datetime
import json
import os
import statistics
import sys


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S')


groups = collections.defaultdict(list)
types = collections.defaultdict(collections.Counter)
for folder in sys.argv[1:]:
    by_load = collections.defaultdict(list)
    for e in rows(os.path.join(folder, 'events.jsonl')):
        by_load[(e['channel'], e['load'])].append(e)
    print(f'== {folder}')
    for (channel, load), events in sorted(by_load.items(), key=lambda kv: kv[1][0]['at']):
        events.sort(key=lambda e: e['at'])
        first = events[0]['at']
        last_ad = -1e18
        for i, e in enumerate(events):
            if e['type'] != 'adDetected':
                continue
            starts = e['at'] - last_ad > 20000
            last_ad = e['at']
            if not starts:
                continue
            at_load = e['at'] - first < 15000
            behind, used = 0, None
            for f in events[i + 1:]:
                if f['type'] == 'backupBehind':
                    behind += 1
                elif f['type'] == 'backupUsed':
                    used = f
                    break
                elif f['at'] - e['at'] > 30000:
                    break
            group = 'at load' if at_load else 'later'
            if used is None:
                print(f'  {clock(e["at"])} /{channel} {group}: no backup in 30 s')
                continue
            seconds = (used['at'] - e['at']) / 1000
            groups[group].append(seconds)
            types[group][f"{used.get('playerType')} {used.get('quality')}"] += 1
            print(f"  {clock(e['at'])} /{channel} {group}: {seconds:.2f} s to {used.get('playerType')} {used.get('quality')}, behind {behind}")
for group, values in groups.items():
    print(f'{group}: {len(values)} breaks, median {statistics.median(values):.2f} s, max {max(values):.2f} s; first backup {dict(types[group])}')
