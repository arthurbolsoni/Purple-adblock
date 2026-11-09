"""Media playlist requests of the player that are in flight together in one worker (T-831, 2026-11-08).

Usage: python docs/findings/probes/poll_overlap_probe.py <session folder>

Needs a soak recorded in extension mode (workerLog.jsonl, from e2e/worker-logger.js): each request the player makes
for a .m3u8 posts `fetchStart` and, when it ends, `fetch` with the same `call`. Only media playlists are read (their
path has `/v1/playlist/`; the usher's masters do not). Per worker it prints how many were made, how long they took
(median, p95, max, in ms) and every pair that overlapped: the start of the second, how far into the first it came, and
what each took. Purple's poll waits for its backups inside the request, so a long request is a poll with ads.
"""
import collections
import json
import os
import statistics
import sys


def load(directory):
    path = os.path.join(directory, 'workerLog.jsonl')
    with open(path, encoding='utf-8') as handle:
        for line in handle:
            try:
                yield json.loads(line)
            except ValueError:
                pass


def main(directory):
    starts = {}
    spans = collections.defaultdict(list)  # worker -> [(start, end, url, status)]
    for entry in load(directory):
        if entry.get('level') != 'player' or '/v1/playlist/' not in (entry.get('url') or ''):
            continue
        key = (entry['worker'], entry.get('call'))
        if entry.get('kind') == 'fetchStart':
            starts[key] = entry
        elif entry.get('kind') == 'fetch' and key in starts:
            begin = starts.pop(key)
            spans[entry['worker']].append((begin['wall'], entry['wall'], entry['url'], entry.get('status') or entry.get('error')))
    if not spans:
        print('no media playlist request with a start in', directory)
        return
    total = 0
    for worker, items in sorted(spans.items()):
        items.sort()
        durations = sorted(end - begin for begin, end, _, _ in items)
        p95 = durations[int(len(durations) * 0.95) - 1] if durations else 0
        print(f'worker {worker}: {len(items)} media playlist requests, median {statistics.median(durations):.0f} ms, p95 {p95} ms, max {durations[-1]} ms')
        overlaps = 0
        for i, (begin, end, url, status) in enumerate(items):
            for later in items[i + 1:]:
                if later[0] >= end:
                    break
                overlaps += 1
                print(f'  overlap: second starts {later[0] - begin} ms into a request of {end - begin} ms (second took {later[1] - later[0]} ms); status {status} / {later[3]}; {url.split("/")[-1][:40]} / {later[2].split("/")[-1][:40]}')
        total += overlaps
        print(f'  pairs in flight together: {overlaps}')
    print(f'pairs in flight together, all workers: {total}')


if __name__ == '__main__':
    main(sys.argv[1])
