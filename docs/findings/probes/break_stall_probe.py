"""Longest stretch the video stood still inside each break, from soak recordings (T-804).

Usage: python docs/findings/probes/break_stall_probe.py <soak folder>...

Per extension session (debug on): breaks are adDetected, blankInserted and backupUsed events less than 60 s apart on
one channel load (events.jsonl). The page monitor logs when the main <video> stops and starts progressing
(transitions.jsonl, key `progressing`, sampled every second). For each break, from its start to 5 s after its last
event: the longest time `progressing` stayed false, when that stretch began, and the backup used just before it.
"""
import datetime
import json
import sys
from pathlib import Path


def rows(path):
    return [json.loads(line) for line in path.open(encoding='utf-8')] if path.exists() else []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S')


for folder in sys.argv[1:]:
    for d in sorted(Path(folder).iterdir()):
        events = sorted(rows(d / 'events.jsonl'), key=lambda e: e['at'])
        if not events:
            continue
        breaks, current = [], None
        for e in events:
            if e['type'] not in ('adDetected', 'blankInserted', 'backupUsed'):
                continue
            load = ((e.get('channel') or '').lstrip('/'), e.get('load'))
            if current is None or e['at'] - current['last'] > 60_000 or load != current['load']:
                current = {'load': load, 'start': e['at'], 'last': e['at']}
                breaks.append(current)
            current['last'] = e['at']
        flips = sorted(((t['wall'], t['value'], ((t.get('channel') or '').lstrip('/'), t.get('load')))
                        for t in rows(d / 'transitions.jsonl') if t.get('key') == 'progressing'), key=lambda f: f[0])
        print(f'== {Path(folder).name} {d.name}: {len(breaks)} breaks')
        for b in breaks:
            end = b['last'] + 5_000
            mine = [(w, v) for w, v, load in flips if load == b['load']]
            state = next((v for w, v in reversed(mine) if w <= b['start']), True)
            longest, since, worst = 0, None if state else b['start'], None
            for w, v in [(w, v) for w, v in mine if b['start'] < w <= end] + [(end, True)]:
                if not v and since is None:
                    since = w
                elif v and since is not None:
                    if w - since > longest:
                        longest, worst = w - since, since
                    since = None
            used = [e for e in events if e['type'] == 'backupUsed' and worst and e['at'] <= worst and e['at'] >= b['start']]
            before = f"{used[-1].get('playerType')} {used[-1].get('quality')}" if used else '-'
            print(f"  {b['load'][0]} break at {clock(b['start'])}, {(b['last'] - b['start']) / 1000:.0f} s: longest still {longest / 1000:.0f} s"
                  + (f' from {clock(worst)} (backup before it: {before})' if worst else ''))
