"""Everything in a soak that could be a problem, per session (2026-10-09).

Usage: python docs/findings/probes/soak_health_probe.py <soak folder>

For each session folder (e2e/soak.py, extension mode with debug): the channels watched; the session's notes (channel
left, drain failures, errors); each stitched break as e2e/soak_report.py reads it (ad overlay seconds, ad segments
listed to the player and fetched from the network, seconds not progressing from 10 s before to 60 s after it, page
ad UI, MEDIA-SEQUENCE going down) with Purple's events in it; every still stretch of 2 s or more with the nearest
stitched break; the player error overlay; uncaught errors, rejections and console errors from inside the workers
(the picture-by-picture player's "not a valid M3U8", E10, counted apart); the page's edge.ads.twitch.tv requests.
"""
import collections
import datetime
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import soak_report  # noqa: E402

KNOWN = 'Response body is not a valid M3U8'  # the picture-by-picture player's master is answered empty (E10)


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S')


def seconds_of(text):
    h, m, s = map(int, text.split(':'))
    return h * 3600 + m * 60 + s


folder = sys.argv[1]
for name in sorted(os.listdir(folder)):
    path = os.path.join(folder, name)
    if not os.path.isdir(path) or not os.path.exists(os.path.join(path, 'log.jsonl')):
        continue
    report = soak_report.session_report(path)
    print(f"== {name}")
    for w in report['watch']:
        print(f"  watched {w['channel']} load {w['load']} {w['start']}-{w['end']} {w['minutes']} min, overlay {w['adOverlaySeconds']} s")
    for n in report['notes']:
        if n.get('note') != 'watching':
            print(f"  note {n.get('note')} {json.dumps({k: v for k, v in n.items() if k not in ('note', 'drain')})[:200]}")

    stitched = [b for b in report['breaks'] if b['kind'] in ('SSAI', 'MARKED_LIVE')]
    for b in stitched:
        events = collections.Counter()
        for key, count in b['purpleEvents'].items():
            e = json.loads(key)
            events[e['type'] + (f":{e['count']}" if e['type'] == 'sequenceShifted' else '')] += count
        to_player = b['toPlayer'] or {}
        print(f"  break {b['channel']} {b['start']} {b['kind']} {b['roll']} {b['seconds']} s: overlay {b['adOverlaySeconds']} s, "
              f"ad media {to_player.get('adMedia')}, not progressing {b['notProgressingSeconds']} s, adUi {b['page']['adUi']}, "
              f"sequence back {to_player.get('sequenceBack')}, events {dict(events)}")

    breaks = [(seconds_of(b['start']), b['channel']) for b in stitched]
    since = None
    for t in rows(os.path.join(path, 'transitions.jsonl')):
        if t['key'] == 'progressing':
            if t['value'] is False:
                since = t['wall']
            elif since is not None:
                length = (t['wall'] - since) / 1000
                if length >= 2:
                    at = seconds_of(clock(since))
                    near = min(breaks, key=lambda b: abs(b[0] - at)) if breaks else None
                    where = f'{at - near[0]:+d} s from the break at {near[1]}' if near and abs(at - near[0]) < 180 else 'no stitched break near'
                    print(f"  still {clock(since)} {length:.0f} s, {where}, {t['channel']}")
                since = None
        elif t['key'] == 'playerError' and t['value']:
            print(f"  player error overlay {clock(t['wall'])} {t['channel']}")

    errors = collections.Counter()
    known = 0
    for e in rows(os.path.join(path, 'workerLog.jsonl')):
        if e.get('kind') in ('error', 'rejection'):
            errors[f"{e['kind']}: {e.get('text', '')[:140]}"] += 1
        elif e.get('kind') == 'console' and e.get('level') == 'error':
            if KNOWN in e.get('text', ''):
                known += 1
            else:
                errors[f"console error: {e.get('text', '')[:140]}"] += 1
    for text, count in errors.most_common(12):
        print(f"  worker x{count} {text}")
    print(f"  picture-by-picture 'not a valid M3U8' (E10): {known}")
    csai = rows(os.path.join(path, 'csai.jsonl'))
    print(f"  edge.ads.twitch.tv requests from the page: {len(csai)} {collections.Counter((c.get('bp'), c.get('status')) for c in csai).most_common(4)}")
