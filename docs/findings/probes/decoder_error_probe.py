"""When the player's decoder logs "AVC finishFrame called without active frame", against the switches of the playlist
source and the video (2026-10-09).

Usage: python docs/findings/probes/decoder_error_probe.py <session folder>...

For each such console line from inside the workers (workerLog.jsonl): the nearest change of the source of the
player's playlist before it (the same attribution as switch_gap_probe.py: Purple's `Stream Type: <type> - Free
Stream` line before each delivered playlist, else the main playlist), the seconds since it, and whether the <video>
stood still around it (transitions.jsonl `progressing`, from 2 s before to 5 s after).
"""
import datetime
import json
import re
import sys

TYPE = re.compile(r'\[Purple\]: Stream Type: (\S+) - Free Stream')
TEXT = 'AVC finishFrame called without active frame'


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:-3]


for folder in sys.argv[1:]:
    log = rows(f'{folder}/workerLog.jsonl')
    delivered = [d for d in rows(f'{folder}/delivered.jsonl') if (d.get('playlist') or {}).get('type') == 'media']
    workers = {}
    for d in delivered:
        workers[d['worker']] = workers.get(d['worker'], 0) + 1
    main = max(workers, key=workers.get) if workers else None
    purple = [e for e in log if e['kind'] == 'console' and e['worker'] == main and '[Purple]' in e.get('text', '')]
    sources, li, previous = [], 0, None
    for d in sorted((d for d in delivered if d['worker'] == main), key=lambda d: d['wall']):
        while li < len(purple) and purple[li]['wall'] <= d['wall']:
            li += 1
        last = purple[li - 1] if li else None
        m = TYPE.search(last['text']) if last and d['wall'] - last['wall'] <= 200 else None
        source = m.group(1) if m else 'main'
        if source != previous:
            sources.append((d['wall'], previous, source))
            previous = source
    still, since = [], None
    for t in rows(f'{folder}/transitions.jsonl'):
        if t['key'] == 'progressing':
            if t['value'] is False:
                since = t['wall']
            elif since is not None:
                still.append((since, t['wall']))
                since = None
    print('==', folder)
    for e in log:
        if e['kind'] == 'console' and TEXT in e.get('text', ''):
            before = [s for s in sources if s[0] <= e['wall']]
            switch = before[-1] if before else None
            stood = any(a - 2000 <= e['wall'] <= b + 5000 for a, b in still)
            where = f'{(e["wall"] - switch[0]) / 1000:.1f} s after {switch[1]} -> {switch[2]}' if switch else 'no switch before'
            print(f"  {clock(e['wall'])} worker {e['worker']}{' (main)' if e['worker'] == main else ''}: {where}; still around it: {stood}")
