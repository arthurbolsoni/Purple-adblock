"""The first seconds of one load, in time order (2026-10-10).

Usage: python docs/findings/probes/load_timeline_probe.py <soak session folder> <load> [seconds]

From the master playlist on, for [seconds] (default 15): what the workers fetched from the network (server.jsonl:
host and path start, status), the playlists delivered to the player (type, MEDIA-SEQUENCE, segments, ad segments),
Purple's events, the player sample each second (currentTime, buffer, picture size) and the progressing transitions.
Times are seconds from the first record of the load.
"""
import json
import os
import sys

folder, load = sys.argv[1], int(sys.argv[2])
span = float(sys.argv[3]) if len(sys.argv) > 3 else 15


def rows(name):
    try:
        return [json.loads(line) for line in open(os.path.join(folder, f'{name}.jsonl'), encoding='utf-8')]
    except FileNotFoundError:
        return []


def short(url):
    host, _, path = url.partition('/')
    return f"{host.split('.')[0]}/{path.split('/')[0]}/{path.split('/')[1] if '/' in path else ''}"[:40]


out = []
for s in rows('server'):
    if s['load'] == load:
        out.append((s['wall'], f"net       {s.get('worker', 'page')} {s.get('status')} {short(s['url'])}"))
for d in rows('delivered'):
    if d['load'] == load:
        p = d.get('playlist') or {}
        out.append((d['wall'], f"delivered {d.get('worker', 'page')} {p.get('type')} seq {p.get('mediaSequence')} segments {p.get('segments')} ads {p.get('adSegments')}"))
for e in rows('events'):
    if e['load'] == load:
        detail = {k: v for k, v in e.items() if k not in ('drain', 'channel', 'load', 'at')}
        out.append((e['at'], f"event     {json.dumps(detail)[:150]}"))
for p in rows('player'):
    if p['load'] == load:
        out.append((p['wall'], f"player    currentTime {p.get('currentTime')} buffer {p.get('buffer')} size {p.get('size')}"))
for t in rows('transitions'):
    if t['load'] == load and t['key'] == 'progressing':
        out.append((t['wall'], f"progress  {t['value']} currentTime {t['currentTime']}"))
out.sort(key=lambda r: r[0])
start = out[0][0] if out else 0
for wall, text in out:
    if wall - start > span * 1000:
        break
    print(f'{(wall - start) / 1000:6.2f} {text}')
