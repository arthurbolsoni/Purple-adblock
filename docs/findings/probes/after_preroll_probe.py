"""Whether the video plays after each preroll of soak sessions (T-818, 2026-10-09).

Usage: python docs/findings/probes/after_preroll_probe.py <soak folder>

For each stitched break with a PREROLL roll type (e2e/soak_report.py) in each session: Purple's sequenceRestart
events in it (F-24), and from the page player's samples (player.jsonl, one a second) in the 60 s after the break end:
how many seconds were sampled, how far currentTime went, and the longest run of samples without currentTime moving.
"""
import datetime
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import soak_report  # noqa: E402


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


folder = sys.argv[1]
for name in sorted(os.listdir(folder)):
    path = os.path.join(folder, name)
    if not os.path.isdir(path) or not os.path.exists(os.path.join(path, 'log.jsonl')):
        continue
    report = soak_report.session_report(path)
    player = rows(os.path.join(path, 'player.jsonl'))
    day = report['watch'][0]['start'] if report['watch'] else None
    date = os.path.basename(folder.rstrip('/'))[:10]
    print('==', name)
    for b in report['breaks']:
        if 'PREROLL' not in b['roll']:
            continue
        end = datetime.datetime.fromisoformat(f"{date}T{b['end']}").timestamp() * 1000
        after = [p for p in player if p['load'] == b['load'] and end <= p['wall'] <= end + 60000 and p.get('currentTime') is not None]
        times = [p['currentTime'] for p in after]
        longest = run = 0
        for x, y in zip(times, times[1:]):
            run = run + 1 if y - x < 0.5 and y >= x else 0
            longest = max(longest, run)
        restarts = sum(count for key, count in b['purpleEvents'].items() if json.loads(key)['type'] == 'sequenceRestart')
        moved = round(max(times) - min(times), 1) if times else None
        print(f"  {b['channel']} preroll {b['start']}-{b['end']}: restarts {restarts}; 60 s after: {len(times)} samples, "
              f"currentTime moved {moved} s, longest still {longest} s")
