"""How long a backup's media playlist takes to come, from the backup loop of a preroll's first poll (2026-10-10).

Usage: python docs/findings/probes/backup_playlist_time_probe.py <soak session folder> [...]

In the first 15 s of each load (e2e/soak.py, extension mode with debug), from the first adDetected to the next
backupUsed, the backup loop asks one media playlist after the other's answer. The worker's records of the media
playlists it got (server.jsonl, *.playlist.ttvnw.net, in the worker that emitted adDetected) between those two events:
the time between one answer and the next is one request's round trip, plus the loop's own work. Prints each break's
times and the overall median and range.
"""
import collections
import json
import os
import statistics
import sys


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


every = []
for folder in sys.argv[1:]:
    events = collections.defaultdict(list)
    for e in rows(os.path.join(folder, 'events.jsonl')):
        events[e['load']].append(e)
    answers = collections.defaultdict(list)
    for s in rows(os.path.join(folder, 'server.jsonl')):
        if s.get('worker') and '.playlist.ttvnw.net/' in s['url']:
            answers[s['load']].append(s['wall'])
    print(f'== {folder}')
    for load, evs in sorted(events.items()):
        evs.sort(key=lambda e: e['at'])
        start = evs[0]['at']
        detected = next((e['at'] for e in evs if e['type'] == 'adDetected' and e['at'] - start < 15000), None)
        if detected is None:
            continue
        used = next((e['at'] for e in evs if e['type'] == 'backupUsed' and e['at'] >= detected), None)
        if used is None or used - detected < 1500:
            continue  # a first backup within one or two requests: no chain to time
        walls = sorted(w for w in answers[load] if detected <= w <= used + 50)
        gaps = [(b - a) / 1000 for a, b in zip(walls, walls[1:])]
        every += gaps
        print(f"  load {load} /{evs[0]['channel']}: {len(walls)} playlists in {(used - detected) / 1000:.2f} s, gaps {[round(g, 2) for g in gaps]}")
if every:
    print(f'{len(every)} gaps: median {statistics.median(every):.2f} s, from {min(every):.2f} to {max(every):.2f} s')
