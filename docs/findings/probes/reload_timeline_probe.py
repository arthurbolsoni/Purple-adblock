"""Main playlist polls and video samples around each player reload in an L3-11 report (T-601).

Usage: python docs/findings/probes/reload_timeline_probe.py <report.json>

The report comes from `python e2e/run.py L3-11 --report FILE`. For each run with a `reloadRequested` event: the
channel, the reload time from the load start, the main polls 10 s before and after it (MEDIA-SEQUENCE, segments,
ad segments, roll type), and the video samples the scenario kept around it.
"""
import json
import sys

report = json.load(open(sys.argv[1], encoding='utf-8'))
for attempt, run in enumerate(report, 1):
    checks = {c['name']: c for c in run.get('checks', [])}
    detail = next((c.get('detail') for name, c in checks.items() if name.startswith('break end: the worker')
                   or name.startswith('a break handled')), None) or {}
    if not detail.get('reloadRequested'):
        print(f'run {attempt}: {detail.get("channel")}, adDetected {detail.get("adDetected")}, no reload')
        continue
    server = run['server'][0]['server']
    timeline = server['mainTimeline']
    # poll times are ms from the load start; the first adDetected event is about the first poll with ads
    first_ad_poll = next((p['at'] for p in timeline if p.get('ads')), None)
    reload_at = detail['reloadRequested'][0] - detail['firstAd'] + (first_ad_poll or 0)
    print(f'run {attempt}: {detail["channel"]}, reload {reload_at / 1000:.1f} s after the load (approx.), result {detail["playerReloaded"]}')
    for p in timeline:
        if reload_at - 10000 <= p['at'] <= reload_at + 10000:
            mark = '<- reload' if p['at'] >= reload_at and not any(q['at'] >= reload_at for q in timeline if q['at'] < p['at']) else ''
            print(f"   poll {p['at'] / 1000:6.1f} s seq {p['seq']:>6} segments {p['segments']:>3} ads {p['ads']:>3} roll {p['roll']} {mark}")
    for s in detail.get('samplesAroundReload') or []:
        print(f"   video {(s['at'] - detail['reloadRequested'][0]) / 1000:+5.1f} s readyState {s['readyState']} currentTime {s['currentTime']} paused {s['paused']}")
