"""Player ids per worker and where E6 pause/play went, from soak recordings (C-13).

Usage: python docs/findings/probes/player_ids_probe.py <soak folder>...

Per session and channel load: every `create` and `delete` the page sent to each player worker (samples.jsonl,
workers[].messages, recorded by e2e/recorder.js), every pause/play sent to a worker with its player id, and the
picture-by-picture masters the worker stored (workerLog.jsonl). A picture-by-picture request less than 20 s after a
pause/play to a player that is not the first one created in that worker is flagged.
"""
import datetime
import json
import sys
from pathlib import Path


def rows(path):
    return [json.loads(line) for line in path.open(encoding='utf-8')] if path.exists() else []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:12]


for folder in sys.argv[1:]:
    for d in sorted(Path(folder).iterdir()):
        if not d.is_dir():
            continue
        seen = {}
        for r in rows(d / 'samples.jsonl'):
            origin = r.get('timeOrigin')
            for index, worker in enumerate(r.get('workers') or []):
                for m in worker.get('messages') or []:
                    name = m.get('funcName')
                    if m.get('to') == 'worker' and name in ('create', 'delete', 'pause', 'play') and origin:
                        seen[(r.get('channel'), r.get('load'), index, m['at'], name, m.get('id'))] = origin + m['at']
        pictures = {}
        for e in rows(d / 'workerLog.jsonl'):
            if 'picture-by-picture master stored' in json.dumps(e):
                pictures.setdefault((e.get('channel'), e.get('load')), []).append(e['wall'])
        loads = sorted({(k[0], k[1]) for k in seen}, key=lambda k: k[1] or 0)
        print(f'== {Path(folder).name} {d.name}: {len(loads)} loads')
        for channel, load in loads:
            print(f'  {channel} load {load}')
            first = {}
            commands = []
            for (c, l, index, at, name, pid), wall in sorted(seen.items(), key=lambda kv: kv[1]):
                if (c, l) != (channel, load):
                    continue
                if name == 'create' and index not in first:
                    first[index] = pid
                if name == 'delete' and first.get(index) == pid:
                    first.pop(index)
                if name in ('pause', 'play'):
                    commands.append((wall, index, pid, first.get(index)))
                print(f'    {clock(wall)} worker {index} {name} id {pid}')
            for at in pictures.get((channel, load), []):
                after = [cmd for cmd in commands if 0 <= at - cmd[0] <= 20_000 and cmd[3] is not None and cmd[2] != cmd[3]]
                flag = f' <- {round((at - after[-1][0]) / 1000, 1)} s after pause/play to id {after[-1][2]} (first player {after[-1][3]})' if after else ''
                print(f'    {clock(at)} picture-by-picture master stored{flag}')
