"""Break edges per pause/play wait from L3-12 reports (T-604).

Usage: python docs/findings/probes/pause_edges_probe.py <report.json>...

The reports come from `PURPLE_PAUSE_DELAY_MS=<ms> python e2e/run.py L3-12 --report FILE`. Per run: the wait, the
channel, whether a break was recorded in the main stream, and each edge (the worker's pause, the <video> pause and
playing). Then, per wait: edges while the video played (a <video> pause after the worker's), the time from that pause
to playing (median and range), and runs that failed. An edge with no <video> pause came before playback started (a
break at load) and is listed apart.
"""
import json
import statistics
import sys
from collections import defaultdict

per_delay = defaultdict(lambda: {'runs': 0, 'failed': 0, 'breaks': 0, 'stopped': [], 'noPlaying': 0, 'restarted': 0, 'atLoad': 0})
for path in sys.argv[1:]:
    for run in json.load(open(path, encoding='utf-8')):
        detail = next((c.get('detail') for c in run['checks'] if isinstance(c.get('detail'), dict) and 'pausePlayDelayMs' in c['detail']), None)
        if detail is None:
            continue
        delay = detail['pausePlayDelayMs']
        main = run['server'][0]['server']['main'] if run.get('server') else {}
        row = per_delay[delay]
        row['runs'] += 1
        row['failed'] += 0 if run['ok'] else 1
        row['breaks'] += 1 if main.get('pollsWithAds') else 0
        print(f"{delay:>5} ms {detail['channel']:<22} {'ok  ' if run['ok'] else 'FAIL'} main {main.get('pollsWithAds')}/{main.get('polls')} polls with ads {main.get('rollTypes')}")
        for edge in detail['edges']:
            print(f"        edge: <video> pause +{edge['videoPauseAfterMs']} ms, playing {edge['stoppedMs']} ms after it, "
                  f"currentTime {edge['currentTimeAtPause']} -> {edge['currentTimeAtPlaying']}, waiting {edge['waiting']}")
            if edge['videoPauseAfterMs'] is None:
                row['atLoad'] += 1
            elif edge['stoppedMs'] is None:
                row['noPlaying'] += 1
            else:
                row['stopped'].append(edge['stoppedMs'])
            if edge['videoPauseAfterMs'] is not None and edge['currentTimeAtPlaying'] is not None and edge['currentTimeAtPlaying'] < 1:
                row['restarted'] += 1

print()
for delay, row in sorted(per_delay.items()):
    stopped = row['stopped']
    summary = f"median {statistics.median(stopped):.0f} ms, {min(stopped)} to {max(stopped)} ms" if stopped else 'no edge'
    print(f"{delay:>5} ms: {row['runs']} runs ({row['failed']} failed), {row['breaks']} with a break; {len(stopped) + row['noPlaying']} edges while "
          f"playing: {summary}; {row['noPlaying']} without playing after; timeline back near 0 after {row['restarted']}; {row['atLoad']} edges at load")
