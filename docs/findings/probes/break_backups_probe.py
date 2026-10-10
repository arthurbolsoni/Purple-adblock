"""Backups played through each break, and how one break's last backup carries into the next (T-802, T-803).

Usage: python docs/findings/probes/break_backups_probe.py <soak folder>...

Per extension session (debug on), from events.jsonl: breaks are adDetected, blankInserted and backupUsed events less
than 60 s apart on one channel load. For each break: its start, the seconds since the page's navigation start
(`timeOrigin` in samples.jsonl), and every change of the backup used (type and quality) with its time. Then,
for consecutive breaks on one load: the type the first one ended on and the type the next one started on.
"""
import datetime
import json
import sys
from pathlib import Path


def rows(path):
    return [json.loads(line) for line in path.open(encoding='utf-8')] if path.exists() else []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:12]


pairs = carried = on_picture = 0
for folder in sys.argv[1:]:
    for d in sorted(Path(folder).iterdir()):
        events = sorted(rows(d / 'events.jsonl'), key=lambda e: e['at'])
        if not events:
            continue
        opened = {}
        for r in rows(d / 'samples.jsonl'):
            if r.get('timeOrigin'):
                opened.setdefault(((r.get('channel') or '').lstrip('/'), r.get('load')), r['timeOrigin'])
        breaks, current = [], None
        for e in events:
            if e['type'] not in ('adDetected', 'blankInserted', 'backupUsed'):
                continue
            load = (e.get('channel'), e.get('load'))
            if current is None or e['at'] - current['last'] > 60_000 or load != current['load']:
                current = {'load': load, 'start': e['at'], 'last': e['at'], 'used': []}
                breaks.append(current)
            current['last'] = e['at']
            if e['type'] == 'backupUsed':
                current['used'].append((e['at'], e.get('playerType'), e.get('quality')))
        print(f'== {Path(folder).name} {d.name}: {len(breaks)} breaks')
        for b in breaks:
            origin = opened.get(((b['load'][0] or '').lstrip('/'), b['load'][1]))
            since = f'{(b["start"] - origin) / 1000:.0f} s after the page opened' if origin else 'page open time unknown'
            print(f"  {b['load'][0]} load {b['load'][1]}, break at {clock(b['start'])}, {since}")
            previous = None
            for at, kind, quality in b['used']:
                if (kind, quality) != previous:
                    print(f'    {clock(at)} {kind} {quality}')
                previous = (kind, quality)
        for a, b in zip(breaks, breaks[1:]):
            if a['load'] != b['load'] or not a['used'] or not b['used']:
                continue
            pairs += 1
            ended, started = a['used'][-1][1:], b['used'][0][1:]
            carried += ended[0] == started[0]
            on_picture += ended[0] == 'picture-by-picture'
            print(f"  pair: ended on {ended} at {clock(a['last'])} -> next started on {started} at {clock(b['start'])}")
print(f'pairs on one load: {pairs}; next break started on the type the previous one ended on: {carried}; ended on picture-by-picture: {on_picture}')
