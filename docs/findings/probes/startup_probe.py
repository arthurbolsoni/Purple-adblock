"""Time from a load's usher master to the first second the video moves, loads with a preroll against loads without
(2026-10-10).

Usage: python docs/findings/probes/startup_probe.py <soak session folder> [...]

Per load (e2e/soak.py, extension mode with debug): the first master playlist delivered to the player, the first
transition to progressing, and whether a stitched preroll (e2e/soak_report.py's breaks) started from 1 s before to
15 s after the master. Loads behind the content classification gate are left out. Prints each load and the median per
group.
"""
import datetime
import json
import os
import statistics
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import soak_report  # noqa: E402


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S')


groups = {'preroll': [], 'none': []}
for folder in sys.argv[1:]:
    day = None
    masters, first_play, channels = {}, {}, {}
    for d in rows(os.path.join(folder, 'delivered.jsonl')):
        if (d.get('playlist') or {}).get('type') == 'master' and d['load'] not in masters:
            masters[d['load']] = d['wall']
            channels[d['load']] = d['channel']
            day = day or datetime.datetime.fromtimestamp(d['wall'] / 1000).date().isoformat()
    gated = {s['load'] for s in rows(os.path.join(folder, 'samples.jsonl')) if s.get('contentGate')}
    for t in rows(os.path.join(folder, 'transitions.jsonl')):
        if t['key'] == 'progressing' and t['value'] is True and t['load'] not in first_play:
            first_play[t['load']] = t['wall']
    prerolls = []
    for b in soak_report.session_report(folder)['breaks']:
        if b['kind'] in ('SSAI', 'MARKED_LIVE') and 'PREROLL' in b['roll']:
            prerolls.append((b['channel'], datetime.datetime.fromisoformat(f"{day}T{b['start']}").timestamp() * 1000))
    print(f'== {folder}')
    for load, master in sorted(masters.items()):
        if load in gated:
            continue
        # the break's start is in whole seconds: up to 1 s before the master
        preroll = any(c == channels[load] and -1000 <= at - master < 15000 for c, at in prerolls)
        play = first_play.get(load)
        if play is None:
            print(f'  load {load} {channels[load]} {clock(master)}: never moved')
            continue
        seconds = (play - master) / 1000
        groups['preroll' if preroll else 'none'].append(seconds)
        print(f"  load {load} {channels[load]} {clock(master)}: {seconds:.1f} s{' (preroll)' if preroll else ''}")
for name, values in groups.items():
    if values:
        print(f'{name}: {len(values)} loads, median {statistics.median(values):.1f} s, min {min(values):.1f} s, max {max(values):.1f} s')
