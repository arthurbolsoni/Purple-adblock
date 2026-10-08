"""Highest <video> readyState per channel load in soak recordings (T-805, Q-014).

Usage: python docs/findings/probes/readystate_probe.py <recordings dir>

Reads every <recordings dir>/*soak*/<session>/samples.jsonl (one sample per drain, with the page's `video` state) and
prints, per mode (sessions named rec-* are record mode, the others extension or userscript), how many loads reached
each highest readyState. Loads whose page never left `/` (no channel opened) are skipped.
"""
import collections
import glob
import json
import os
import sys

root = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/purple-recordings')
loads = {}
for path in sorted(glob.glob(os.path.join(root, '*soak*', '*', 'samples.jsonl'))):
    soak, session = path.replace(os.sep, '/').split('/')[-3:-1]
    mode = 'record' if session.startswith('rec') else 'purple'
    for line in open(path, encoding='utf-8'):
        sample = json.loads(line)
        if sample.get('url') == '/':
            continue
        video = sample.get('video') or {}
        if isinstance(video, list):
            video = video[0] if video else {}
        key = (soak, session, sample.get('channel'), sample.get('load'))
        entry = loads.setdefault(key, {'mode': mode, 'max': -1})
        entry['max'] = max(entry['max'], video.get('readyState', -1) if isinstance(video, dict) else -1)
counts = collections.Counter((entry['mode'], entry['max']) for entry in loads.values())
print(f'{len(loads)} loads')
for (mode, state), n in sorted(counts.items()):
    print(f'  {mode}: highest readyState {state}: {n}')
for key, entry in loads.items():
    if entry['max'] <= 0:
        print('  never above 0:', key)
