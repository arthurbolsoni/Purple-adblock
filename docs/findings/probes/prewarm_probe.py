"""Break starts with and without prewarmed backup tokens (T-409, F-19), from soak recordings.

Usage: python docs/findings/probes/prewarm_probe.py <soak folder>...

Per extension session (debug on):
- every picture-by-picture master the page asked for (worker log "picture-by-picture master stored") and the seconds
  to the next break start, when one starts within 15 s;
- per break (adDetected or blankInserted events less than 60 s apart; the first poll with ads can insert a blank
  segment before any adDetected): the channel and load, whether it is the load's first break and whether a
  picture-by-picture request came in the 15 s before it (a midroll, not a break already running at the load), what
  the player got in its first 1.5 s (a backup, blank segments, or both), the first
  backup used (type and quality) and the seconds to it, the backup types used in the first 20 s, the backupsPrewarmed
  event before it, the PlaybackAccessToken requests in the 30 s before the break and during it, and the backup
  playlists with ad marks during the break (marks.jsonl, role backup: a break of their own announced, B-034) and how
  many of them had ad segments.
"""
import datetime
import json
import sys
from pathlib import Path


def rows(path):
    return [json.loads(line) for line in path.open(encoding='utf-8')] if path.exists() else []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S')


def wall(text):
    return datetime.datetime.fromisoformat(text).timestamp() * 1000


for folder in sys.argv[1:]:
    for d in sorted(Path(folder).iterdir()):
        events = sorted(rows(d / 'events.jsonl'), key=lambda e: e['at'])
        if not events:
            continue
        server = rows(d / 'server.jsonl')
        tokens = sorted(wall(s['drain']) if 'wall' not in s else (s['wall'] if isinstance(s['wall'], (int, float)) else wall(s['wall']))
                        for s in server if s.get('gql') for op in s['gql'] if str(op.get('operation') or '').startswith('PlaybackAccessToken'))
        backup_marks = sorted((wall(m['wall']), (m.get('ads') or 0) > 0) for m in rows(d / 'marks.jsonl') if m.get('role') == 'backup' and m.get('wall'))
        pictures = [e['wall'] for e in rows(d / 'workerLog.jsonl') if 'picture-by-picture master stored' in json.dumps(e.get('args', e))]
        starts = [e['at'] for e in events if e['type'] in ('adDetected', 'blankInserted')]
        breaks, start, last = [], None, None
        for at in starts:
            if start is None or at - last > 60_000:
                if start is not None:
                    breaks.append((start, last))
                start = at
            last = at
        if start is not None:
            breaks.append((start, last))
        prewarms = [e['at'] for e in events if e['type'] == 'backupsPrewarmed']
        print(f'== {Path(folder).name} {d.name}: {len(breaks)} breaks, {len(prewarms)} prewarms, {len(pictures)} picture-by-picture masters')
        for at in pictures:
            following = next((b for b, _ in breaks if 0 <= b - at <= 15_000), None)
            print(f"  picture-by-picture at {clock(at)}: break {f'{(following - at) / 1000:.1f} s later' if following else 'none within 15 s'}")
        seen_loads = set()
        for begin, end in breaks:
            opener = next(e for e in events if e['at'] == begin)
            load = (opener.get('channel'), opener.get('load'))
            order = 'later' if load in seen_loads else 'first'
            seen_loads.add(load)
            requested = any(0 <= begin - at <= 15_000 for at in pictures)
            first = [e['type'] for e in events if begin <= e['at'] <= begin + 1500 and e['type'] in ('backupUsed', 'blankInserted')]
            used_event = next((e for e in events if e['type'] == 'backupUsed' and e['at'] >= begin), None)
            used = used_event['at'] if used_event else None
            kind = f"{used_event.get('playerType')} {used_event.get('quality')}" if used_event else '-'
            types = []
            for e in events:
                if e['type'] == 'backupUsed' and begin <= e['at'] <= begin + 20_000 and e.get('playerType') not in types:
                    types.append(e.get('playerType'))
            blanks = sum(e.get('count') or 0 for e in events if e['type'] == 'blankInserted' and begin <= e['at'] <= end)
            prewarm = max((at for at in prewarms if at <= begin), default=None)
            before = sum(1 for t in tokens if begin - 30_000 <= t < begin)
            during = sum(1 for t in tokens if begin <= t <= end + 2_000)
            marked = [ads for t, ads in backup_marks if begin - 5_000 <= t <= end + 2_000]
            print(f"  break at {clock(begin)}, {(end - begin) / 1000:3.0f} s, {load[0]} load {load[1]}, {order} of the load, "
                  f"{'after a picture-by-picture request' if requested else 'no request before'}: first 1.5 s -> {sorted(set(first)) or 'nothing'}; blank segments {blanks}; "
                  f"first backup {kind} after {(used - begin) / 1000 if used else '-'} s; types in the first 20 s {types}; "
                  f"prewarm {f'{(begin - prewarm) / 1000:.1f} s before' if prewarm else '-'}; tokens 30 s before {before}, during {during}; "
                  f"backup playlists with ad marks {len(marked)}, with ad segments {sum(marked)}")
