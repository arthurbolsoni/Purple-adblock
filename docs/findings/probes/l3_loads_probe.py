"""Probe for docs/findings/2026-10-08-l3-server-observations.md: one line per page load of the level 3 run reports
(`python e2e/run.py ... --report FILE`) under the given folders: report, scenario, mode, profile, channel, main polls
with ad segments, roll types, token requests. The reports stay in ~/purple-recordings (outside the repo); this prints
no ids.

    python docs/findings/probes/l3_loads_probe.py ~/purple-recordings/2026-10-08-t203 [more folders...]
"""
import glob
import json
import os
import sys

for folder in sys.argv[1:]:
    for path in sorted(glob.glob(os.path.join(os.path.expanduser(folder), '*.json'))):
        stamp = os.path.getmtime(path)
        for run in json.load(open(path, encoding='utf-8')):
            for obs in run.get('server') or []:
                main = (obs.get('server') or {}).get('main') or {}
                tokens = sum(((obs.get('server') or {}).get('tokenRequests') or {}).values())
                print('\t'.join(str(x) for x in (
                    os.path.basename(folder.rstrip('/')), os.path.basename(path), run['scenario'], run['mode'], run['attempt'],
                    'fresh' if run.get('freshProfile') else 'dedicated', obs['load'], obs['channel'],
                    f"{main.get('pollsWithAds')}/{main.get('polls')}", ','.join(main.get('rollTypes') or []) or '-',
                    tokens, run['ok'])))
