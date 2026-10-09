"""Every switch of the playlist source Purple gives the player, the sequence gap at it, and the still video after it
(T-816, 2026-10-09).

Usage: python docs/findings/probes/switch_gap_probe.py <session folder>...

Source of each media playlist the player got (delivered.jsonl, main worker): the last Purple console line of that worker
before it, within 200 ms (workerLog.jsonl): `Stream Type: <type> - Free Stream` is that backup type, anything else
(`Stream is free`, or no line: a poll that only announces a break) the main playlist. Its newest number is
MEDIA-SEQUENCE + segments + prefetch URIs - 1, the last segment the player can fetch from it (it fetches prefetch URIs
as soon as they are listed).

At each change of source: `gap` = the new playlist's newest number minus the newest number of the playlist before it.
With a gap of 0 or less the new playlist lists nothing past what the player could already have; `wait` is then the time
until a playlist from the new source lists a number past it. `still` is the longest stretch the <video> stood still
(transitions.jsonl `progressing`) starting from 2 s before to 15 s after the switch. `restart`: the <video> played
from currentTime 0 (E6's pause and play) from 1 s before to 3 s after the switch. The summary counts the switches
without a restart by gap.
"""
import datetime
import json
import re
import sys

TYPE = re.compile(r'\[Purple\]: Stream Type: (\S+) - Free Stream')


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S')


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def main_worker(delivered):
    counts = {}
    for d in delivered:
        if (d.get('playlist') or {}).get('type') == 'media':
            counts[d['worker']] = counts.get(d['worker'], 0) + 1
    return max(counts, key=counts.get) if counts else None


summary = {}
for folder in sys.argv[1:]:
    delivered = rows(f'{folder}/delivered.jsonl')
    worker = main_worker(delivered)
    if worker is None:
        continue
    logs = [r for r in rows(f'{folder}/workerLog.jsonl') if r['kind'] == 'console' and r['worker'] == worker and '[Purple]' in r.get('text', '')]
    origin = next((r['timeOrigin'] for r in rows(f'{folder}/samples.jsonl')), 0)
    restarts = [origin + m['at'] for m in rows(f'{folder}/media.jsonl') if m.get('event') == 'play' and m.get('currentTime') == 0]
    stills, since = [], None
    for r in rows(f'{folder}/transitions.jsonl'):
        if r['key'] == 'progressing':
            if r['value'] is False:
                since = r['wall']
            elif since is not None:
                stills.append((since, r['wall'] - since))
                since = None
    polls, li = [], 0
    for d in sorted((d for d in delivered if d['worker'] == worker and (d.get('playlist') or {}).get('type') == 'media'), key=lambda d: d['wall']):
        while li < len(logs) and logs[li]['wall'] <= d['wall']:
            li += 1
        last = logs[li - 1] if li else None
        m = TYPE.search(last['text']) if last and d['wall'] - last['wall'] <= 200 else None
        p = d['playlist']
        if p.get('mediaSequence') is None:
            continue
        newest = p['mediaSequence'] + (p.get('segments') or 0) + (p.get('prefetch') or 0) - 1
        polls.append({'wall': d['wall'], 'load': d.get('load'), 'source': m.group(1) if m else 'main', 'newest': newest})
    print('==', folder)
    for i in range(1, len(polls)):
        a, b = polls[i - 1], polls[i]
        if a['source'] == b['source'] or a['load'] != b['load'] or b['wall'] - a['wall'] > 10000:
            continue
        gap = b['newest'] - a['newest']
        wait = None
        if gap <= 0:
            later = next((p for p in polls[i:] if p['newest'] > a['newest'] and p['wall'] - b['wall'] < 30000), None)
            wait = round((later['wall'] - b['wall']) / 1000, 1) if later else None
        near = [s for s in stills if b['wall'] - 2000 <= s[0] <= b['wall'] + 15000]
        still = round(max(s[1] for s in near) / 1000) if near else 0
        restart = any(b['wall'] - 1000 <= r <= b['wall'] + 3000 for r in restarts)
        print(f"  {clock(b['wall'])} {a['source']:>18} -> {b['source']:<18} gap {gap:+d}{'' if wait is None else f', next number after {wait} s'}  still {still} s{'  restart' if restart else ''}")
        if not restart:
            key = 'gap <= 0' if gap <= 0 else 'gap > 0'
            summary.setdefault(key, []).append((still, wait))
print()
for key, items in sorted(summary.items()):
    stalled = [i for i in items if i[0] >= 2]
    print(f"without a restart, {key}: {len(items)} switches, {len(stalled)} with 2 s or more still; (still, wait) of those with a wait: {sorted(i for i in items if i[1] is not None)}")
