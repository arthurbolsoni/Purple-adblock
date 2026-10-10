"""The page's playlist against backup tokens' playlists of the same channel around a stall (B-055, T-821, 2026-10-09).

Usage: python docs/findings/probes/stall_vs_backups_probe.py <soak session folder> <backups.jsonl> HH:MM:SS HH:MM:SS [YYYY-MM-DD]

In the window: every media playlist the page's player got (delivered.jsonl: MEDIA-SEQUENCE and segment count) and
every poll of backup_advance_probe.py (type, MEDIA-SEQUENCE, segments, newest PROGRAM-DATE-TIME, error), in time
order, with the player's error line and <video> events.
"""
import datetime
import json
import sys

folder, backups, start, end = sys.argv[1:5]
day = sys.argv[5] if len(sys.argv) > 5 else '2026-10-09'


def ms(text):
    return datetime.datetime.fromisoformat(f'{day}T{text}').timestamp() * 1000


def clock(m):
    return datetime.datetime.fromtimestamp(m / 1000).strftime('%H:%M:%S.%f')[:-3]


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


lo, hi = ms(start), ms(end)
out = []
for d in rows(f'{folder}/delivered.jsonl'):
    p = d.get('playlist') or {}
    if lo <= d['wall'] <= hi and p.get('type') == 'media':
        out.append((d['wall'], f"page    seq {p.get('mediaSequence')} segments {p.get('segments')} ads {p.get('adSegments')}"))
for e in rows(f'{folder}/workerLog.jsonl'):
    if lo <= e['wall'] <= hi and e.get('kind') == 'console' and 'Player stopping' in e.get('text', ''):
        out.append((e['wall'], 'player  ' + e['text'][:120]))
for b in rows(backups):
    if lo <= b['wall'] <= hi:
        detail = b.get('error') or f"seq {b.get('seq')} segments {b.get('segments')} newest {str(b.get('newestDate'))[11:23]} ads {b.get('ads')}"
        out.append((b['wall'], f"{b['type']:<7} {detail}"))
for w, text in sorted(out):
    print(clock(w), text)
