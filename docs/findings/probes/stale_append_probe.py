"""Media left in a SourceBuffer by appends made with the old timestampOffset at a restart of the player's timeline
(T-835, 2026-11-21).

Usage: python docs/findings/probes/stale_append_probe.py <session folder>...

Needs a soak's Media Source log (mse.jsonl, e2e/mse-hook.js). When the player starts its timeline over (a pause and
play: the viewer's, or Purple's restarts F-24, F-28, E6) it calls abort() and moves timestampOffset so the new timeline
starts at 0. For each such change this prints what the SourceBuffer had buffered at the abort (media appended with the
old offset after the buffer was emptied: it stays, on the new timeline, where the old one was), how many bytes those
appends had, and how long after the change the new timeline's buffered end reached it (the moment Firefox can read the
old media ahead of the new, firefox_audio_islands_probe.py), or that a later restart came first.
"""
import datetime
import json
import sys


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:-3]


def main(folder):
    rows = [json.loads(line) for line in open(f'{folder}/mse.jsonl', encoding='utf-8')]
    changes = [i for i, r in enumerate(rows) if r.get('op') == 'offset']
    left = reached = 0
    print(f'{folder}: {len(changes)} changes of timestampOffset')
    for n, i in enumerate(changes):
        change = rows[i]
        key = (change.get('load'), change.get('scope'), change.get('sb'))
        same = lambda r: (r.get('load'), r.get('scope'), r.get('sb')) == key
        # back to the last moment the buffer was empty: the appends since then were made with the old offset
        stale_bytes, appends, ranges = 0, 0, []
        for r in reversed(rows[:i]):
            if not same(r):
                continue
            if r.get('op') == 'abort':
                ranges = r.get('ranges') or ranges
                continue
            if r.get('op') != 'append' or not (r.get('ranges') or []):
                break
            if change['wall'] - r['wall'] > 3000:
                break
            stale_bytes += r.get('bytes') or 0
            appends += 1
            ranges = ranges or r.get('ranges')
        end = rows[changes[n + 1]]['wall'] if n + 1 < len(changes) else None
        if not ranges or not appends:
            print(f"  {clock(change['wall'])} offset {change.get('from')} -> {change.get('offset')}: nothing buffered at the abort")
            continue
        left += 1
        start = ranges[0][0]
        when = None
        for r in rows[i + 1:]:
            if end is not None and r['wall'] >= end:
                break
            if same(r) and r.get('op') == 'append' and r.get('ranges') and r['ranges'][0][1] >= start - 0.5 and r['ranges'][0][0] < start:
                when = r['wall']
                break
        reached += when is not None
        after = f"the new timeline reached it {(when - change['wall']) / 1000:.1f} s later" if when else 'a later restart or the end of the session came first'
        print(f"  {clock(change['wall'])} offset {change.get('from')} -> {change.get('offset')}: {appends} appends ({stale_bytes} bytes) with the old offset left "
              f"{', '.join(f'{a:.3f}-{b:.3f}' for a, b in ranges)}; {after}")
    print(f'  {left} of {len(changes)} restarts left old media, {reached} reached by the new timeline')


if __name__ == '__main__':
    for folder in sys.argv[1:]:
        main(folder)
