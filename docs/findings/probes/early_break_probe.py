"""What the player does in a break that starts in the first seconds after the page opened (T-810).

Usage: python docs/findings/probes/early_break_probe.py <soak folder>...

Per extension session (debug on) and channel load: when the page opened (samples.jsonl `timeOrigin`); breaks
(adDetected or blankInserted events, events.jsonl) that start less than EARLY ms after it. For each: the page's
pause and play messages to the player worker in the break's first 20 s (samples.jsonl, workers[].messages), the
<video> events (media.jsonl: pause, play, playing), the stretch the video did not progress (transitions.jsonl), and
whether a Purple pause/play message came less than 1 s before the <video> played again.
"""
import datetime
import json
import sys
from pathlib import Path

EARLY = 15_000


def rows(path):
    return [json.loads(line) for line in path.open(encoding='utf-8')] if path.exists() else []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:12]


for folder in sys.argv[1:]:
    for d in sorted(Path(folder).iterdir()):
        samples = rows(d / 'samples.jsonl')
        origins, messages = {}, {}
        for r in samples:
            key = ((r.get('channel') or '').lstrip('/'), r.get('load'))
            origin = r.get('timeOrigin')
            if not origin:
                continue
            origins.setdefault(key, origin)
            for w in r.get('workers') or []:
                for m in w.get('messages') or []:
                    if m.get('to') == 'worker' and m.get('funcName') in ('pause', 'play'):
                        messages.setdefault(key, set()).add((origin + m['at'], m['funcName'], m.get('id')))
        events = sorted(rows(d / 'events.jsonl'), key=lambda e: e['at'])
        media = rows(d / 'media.jsonl')
        flips = rows(d / 'transitions.jsonl')
        seen = set()
        for e in events:
            if e['type'] not in ('adDetected', 'blankInserted'):
                continue
            key = ((e.get('channel') or '').lstrip('/'), e.get('load'))
            origin = origins.get(key)
            if key in seen or not origin:
                continue
            seen.add(key)
            if e['at'] - origin > EARLY:
                continue
            start = e['at']
            print(f'== {Path(folder).name} {d.name} {key[0]}: page opened {clock(origin)}, break at {clock(start)} ({(start - origin) / 1000:.1f} s)')
            sent = sorted(m for m in messages.get(key, ()) if start - 1000 <= m[0] <= start + 20_000)
            for at, name, pid in sent:
                print(f'  {clock(at)} Purple {name} id {pid}')
            video = sorted((origin + m['at'], m.get('event') or m.get('play'), m.get('currentTime')) for m in media
                           if (m.get('channel') or '').lstrip('/') == key[0] and m.get('load') == key[1] and 'at' in m
                           and start - 1000 <= origin + m['at'] <= start + 20_000 and (m.get('event') in ('pause', 'play', 'playing', 'waiting')))
            for at, name, t in video:
                print(f'  {clock(at)} <video> {name} at {t}')
            still = [(t['wall'], t['value']) for t in flips if t.get('key') == 'progressing' and (t.get('channel') or '').lstrip('/') == key[0]
                     and t.get('load') == key[1] and start - 1000 <= t['wall'] <= start + 30_000]
            print('  progressing:', ', '.join(f'{clock(w)} {v}' for w, v in still))
            plays = [at for at, name, _ in video if name == 'play' and at > start + 1000]
            if plays:
                before = [m for m in sent if 0 <= plays[0] - m[0] <= 1000]
                print(f"  video played again at {clock(plays[0])}: {'after a Purple ' + before[-1][1] if before else 'no Purple message in the second before'}")
