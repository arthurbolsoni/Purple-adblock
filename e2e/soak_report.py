"""Breaks and watch time from the recordings of e2e/soak.py.

    python e2e/soak_report.py <recordings dir> [--json FILE]

<recordings dir> holds one directory per session (ext-a, rec-c, ...). Per session: watch time per channel, every
break on the main stream (the playlists the player got: all media playlists without Purple, the ones Purple
delivered with it), and per break the server's playlists poll by poll (from the full texts the recorder keeps for
playlists with ad markers), edge.ads.twitch.tv requests, Purple's backups, what reached the player, the ad overlay
and video progress. Values that identify a viewer, a stream or an ad (ids, tokens, URLs) are never printed.
"""
import argparse
import datetime
import glob
import json
import os
import re
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from soak import DRAIN, LIVE_CLASSES, ad_marks

BREAK_GAP = 12     # seconds between two marked polls of one break
AROUND = 180       # seconds before and after a break searched for edge.ads requests
# attribute values safe to print (counts, roll type, durations, quartile); every other value is left out
SAFE_ATTRIBUTES = ('X-TV-TWITCH-AD-ROLL-TYPE', 'X-TV-TWITCH-AD-POD-LENGTH', 'X-TV-TWITCH-AD-POD-POSITION', 'DURATION',
                   'X-TV-TWITCH-AD-QUARTILE', 'X-TV-TWITCH-AD-AF-ICR-MEDIA-DURATION', 'X-TV-TWITCH-AD-AD-FORMAT',
                   'PLANNED-DURATION', 'X-TTV-MAF-AD-DECISION', 'X-TTV-MAF-AD-FALLBACK-FORMATS', 'X-TTV-MAF-AD-PRIMARY-POD',
                   'X-TTV-MAF-AD-SDA-SEQUENCE-LENGTH')


def load(directory, name):
    path = os.path.join(directory, name + '.jsonl')
    if not os.path.exists(path):
        return []
    with open(path, encoding='utf-8') as f:
        return [json.loads(line) for line in f if line.strip()]


def wall(record):
    """Seconds since the epoch: the worker's or page's wall time, else the drain time."""
    if isinstance(record.get('wall'), (int, float)):
        return record['wall'] / 1000
    return datetime.datetime.fromisoformat(record['drain']).timestamp()


def clock(seconds):
    return datetime.datetime.fromtimestamp(seconds).strftime('%H:%M:%S')


def attribute(line, name):
    m = re.search(r'(?:^|[,:])' + re.escape(name) + r'=("([^"]*)"|[^,]*)', line)
    return None if not m else (m.group(2) if m.group(2) is not None else m.group(1))


def parse(text):
    """One media playlist: media sequence, segments (title, duration, after a discontinuity, with a map),
    DATERANGE classes with their safe attribute values, prefetch lines."""
    lines = [l.strip() for l in text.split('\n')]
    segments, dateranges, pending = [], [], {'discontinuity': False}
    for line in lines:
        if line == '#EXT-X-DISCONTINUITY':
            pending['discontinuity'] = True
        elif line.startswith('#EXT-X-MAP:'):
            pending['map'] = True
        elif line.startswith('#EXTINF:'):
            duration, _, title = line[8:].partition(',')
            pending.update(duration=duration, title=title)
        elif line.startswith('#EXT-X-DATERANGE:'):
            cls = attribute(line, 'CLASS') or '-'
            dateranges.append({'class': cls, **{k: attribute(line, k) for k in SAFE_ATTRIBUTES if attribute(line, k) is not None}})
        elif line and not line.startswith('#') and 'title' in pending:
            segments.append({'title': pending['title'], 'duration': pending['duration'],
                             'discontinuity': pending['discontinuity'], 'map': pending.get('map', False)})
            pending = {'discontinuity': False}
    seq = next((int(l.split(':')[1]) for l in lines if l.startswith('#EXT-X-MEDIA-SEQUENCE:')), None)
    ads = [s for s in segments if s['title'] and s['title'] != 'live']
    return {
        'seq': seq,
        'segments': len(segments),
        'ads': len(ads),
        'adTitles': sorted({re.sub(r'\|.*', '|', s['title']) for s in ads}),
        'adDurations': sorted({s['duration'] for s in ads}),
        'liveDurations': sorted({s['duration'] for s in segments if s['title'] == 'live'}),
        'order': ''.join('L' if s['title'] in ('', 'live') else 'A' for s in segments),
        'discontinuities': sum(s['discontinuity'] for s in segments),
        'maps': sum(s['map'] for s in segments),
        'prefetch': sum(l.startswith('#EXT-X-TWITCH-PREFETCH:') for l in lines),
        'dateranges': [d for d in dateranges if d['class'] not in LIVE_CLASSES],
    }


def intervals(transitions, key):
    """[start, end] wall seconds where `key` was true, from the monitor's transitions of one load."""
    spans, start = [], None
    for t in sorted((t for t in transitions if t['key'] == key), key=wall):
        if t['value'] and start is None:
            start = wall(t)
        elif not t['value'] and start is not None:
            spans.append((start, wall(t)))
            start = None
    if start is not None:
        spans.append((start, None))
    return spans


def value_at(transitions, key, moment):
    """Value of a monitor key at a wall time (the last transition before it)."""
    before = [t for t in transitions if t['key'] == key and wall(t) <= moment]
    return max(before, key=wall)['value'] if before else None


def overlap(spans, start, end, last):
    total = 0.0
    for a, b in spans:
        b = b if b is not None else last
        total += max(0.0, min(b, end) - max(a, start))
    return round(total, 1)


def session_report(directory):
    name = os.path.basename(directory)
    data = {n: load(directory, n) for n in ('server', 'delivered', 'serverTexts', 'csai', 'events', 'transitions',
                                            'samples', 'workerLog', 'log', 'watches')}
    mode = next((r.get('mode') for r in data['log'] if r.get('note') == 'launched'), None)
    loads = sorted({r['load'] for r in data['samples']})
    report = {'session': name, 'mode': mode, 'watch': [], 'breaks': [], 'mafs': [], 'csai': [], 'notes': [], 'assignment': [], 'laterMasters': []}

    for r in data['log']:
        if r.get('note') in ('watching', 'leaving channel', 'no channel to open', 'stopped by an error', 'drain failed'):
            report['notes'].append({k: v for k, v in r.items() if k not in ('error',)} | ({'error': r['error'][-200:]} if r.get('error') else {}))

    for n in loads:
        samples = [s for s in data['samples'] if s['load'] == n]
        channel = samples[0]['channel']
        first, last = wall(samples[0]) - DRAIN, wall(samples[-1])
        transitions = [t for t in data['transitions'] if t['load'] == n]
        overlay = intervals(transitions, 'adOverlay')
        progressing = intervals(transitions, 'progressing')
        report['watch'].append({'channel': channel, 'load': n, 'start': clock(first), 'end': clock(last),
                                'minutes': round((last - first) / 60, 1),
                                'adOverlaySeconds': overlap(overlay, first, last, last),
                                'progressingSeconds': overlap(progressing, first, last, last)})

        delivered = [d for d in data['delivered'] if d['load'] == n and (d.get('playlist') or {}).get('type') == 'media']
        main_urls = {d['url'] for d in delivered}
        media = sorted((s for s in data['server'] if s['load'] == n and (s.get('playlist') or {}).get('type') == 'media'), key=wall)
        if mode == 'record':
            # without Purple: the media playlists of the load's first master; a later master (the page's own
            # picture-by-picture request) owns the playlists first polled after it
            masters = sorted((s for s in data['server'] if s['load'] == n and (s.get('playlist') or {}).get('type') == 'master'), key=wall)
            owner = {}
            for s in media:
                if s['url'] not in owner:
                    before = [m for m in masters if wall(m) <= wall(s)]
                    owner[s['url']] = before[-1] if before else None
            first_master = masters[0] if masters else None
            main_urls = {url for url, m in owner.items() if m is first_master or m is None}
        is_main = lambda s: s['url'] in main_urls
        texts = [t for t in data['serverTexts'] if t['load'] == n]

        def text_of(poll):
            return next((t['text'] for t in texts if t['url'] == poll['url'] and abs(t['wall'] - poll['wall']) <= 20), None)

        main = [s for s in media if is_main(s)]
        report['assignment'].append(sum('twitch-assignment' in (s['playlist'].get('dateranges') or []) for s in main))
        # masters after the load's first one, with their player type (record mode: requested by the page itself)
        later = sorted((s for s in data['server'] if s['load'] == n and (s.get('playlist') or {}).get('type') == 'master'), key=wall)[1:]
        report['laterMasters'] += [{'at': clock(wall(m)), 'channel': channel, 'playerType': (m.get('tokenFlags') or {}).get('player_type')} for m in later]
        marked = [s for s in main if ad_marks(s['playlist'])]
        groups = []
        for s in marked:
            # one break: marked polls close in time (a twitch-maf-ad slot can overlap a stitched break)
            if groups and wall(s) - wall(groups[-1][-1]) <= BREAK_GAP:
                groups[-1].append(s)
            else:
                groups.append([s])
        csai = [c for c in data['csai'] if c['load'] == n]
        # twitch-maf-ad slots on their own: from the first main poll with the class to the first one without it
        has_maf = lambda s: 'twitch-maf-ad' in (s['playlist'].get('dateranges') or [])
        for i, s in enumerate(main):
            if has_maf(s) and (i == 0 or not has_maf(main[i - 1])):
                after = next((x for x in main[i:] if not has_maf(x)), None)
                stop = wall(after) if after else wall(main[-1])
                report['mafs'].append({'channel': channel, 'load': n, 'start': clock(wall(s)), 'offsetMinutes': round((wall(s) - first) / 60, 2),
                                       'seconds': round(stop - wall(s), 1),
                                       'csai': [{'t': round(wall(c) - wall(s), 1), 'status': c.get('status')} for c in csai if 0 <= wall(c) - wall(s) <= 60]})
        for c in csai:
            report['csai'].append({'at': clock(wall(c)), 'channel': channel, 'path': c.get('path'), 'bp': c.get('bp'), 'status': c.get('status')})

        for group in groups:
            start = wall(group[0])
            after = [s for s in main if wall(s) > wall(group[-1])]
            end = wall(after[0]) if after else wall(group[-1])
            polls = []
            for s in [p for p in main if start - 5 <= wall(p) <= end + 5]:
                marks = ad_marks(s['playlist'])
                text = text_of(s)
                parsed = parse(text) if text else None
                polls.append({'t': round(wall(s) - start, 1), 'seq': s['playlist'].get('mediaSequence'),
                              'segments': s['playlist']['segments'], 'kind': marks['kind'] if marks else 'NONE',
                              'roll': s['playlist'].get('rollTypes'),
                              'classes': [c for c in s['playlist'].get('dateranges') or [] if c not in LIVE_CLASSES],
                              'discontinuities': s['playlist'].get('discontinuities'), 'prefetch': s['playlist'].get('prefetch'),
                              'text': {k: parsed[k] for k in ('ads', 'adTitles', 'order', 'maps', 'adDurations')} if parsed else None,
                              'stitched': [d for d in (parsed or {}).get('dateranges', []) if d['class'] == 'twitch-stitched-ad'],
                              'maf': [d for d in (parsed or {}).get('dateranges', []) if d['class'] == 'twitch-maf-ad']})
            backups = [s for s in media if not is_main(s) and start - 10 <= wall(s) <= end + 10]
            to_player = [d for d in delivered if start - 5 <= wall(d) <= end + 5]
            # ad segments listed to the player: requested by it, and fetched from the network or answered by Purple (T-502)
            fetches = [e for e in data['workerLog'] if e['load'] == n and e.get('kind') == 'fetch' and start - 10 <= wall(e) <= end + 60]
            listed = {p for d in to_player for p in (d['playlist'].get('adSegmentPaths') or [])}
            requested = listed & {e['url'] for e in fetches if e.get('level') == 'player'}
            from_network = requested & {e['url'] for e in fetches if e.get('level') == 'network'}
            console = Counter(e['text'][:120] for e in data['workerLog']
                              if e['load'] == n and e.get('kind') == 'console' and start - 10 <= wall(e) <= end + 30)
            events = Counter(json.dumps({k: e.get(k) for k in ('type', 'playerType', 'count')}) for e in data['events']
                             if e['load'] == n and start - DRAIN <= wall(e) <= end + 2 * DRAIN)
            tokens = Counter(a.get('playerType') or a.get('operation') for s in data['server']
                             if s['load'] == n and s.get('gql') and start - 10 <= wall(s) <= end + 10 for a in s['gql'])
            kinds = Counter(p['kind'] for p in polls)
            report['breaks'].append({
                'channel': channel, 'load': n, 'start': clock(start), 'end': clock(end), 'seconds': round(end - start, 1),
                'startOffsetMinutes': round((start - first) / 60, 1),
                'roll': sorted({r for p in polls for r in p['roll'] or []}),
                'kind': next((k for k in ('SSAI', 'MARKED_LIVE', 'MAF') if kinds.get(k)), 'OTHER'),  # MAF: twitch-maf-ad polls only
                'pollKinds': dict(kinds),
                'maxAdSegments': max((p['text']['ads'] for p in polls if p['text']), default=None),
                'adTitles': sorted({t for p in polls if p['text'] for t in p['text']['adTitles']}),
                'mafAttributes': sorted({json.dumps({k: v for k, v in d.items() if k != 'class'}, sort_keys=True) for p in polls for d in p['maf']}),
                'stitchedAttributes': sorted({json.dumps({k: v for k, v in d.items() if k != 'class'}, sort_keys=True) for p in polls for d in p['stitched']}),
                'seqs': [p['seq'] for p in polls],
                'polls': polls,
                'csai': [{'t': round(wall(c) - start, 1), 'path': c.get('path'), 'bp': c.get('bp'), 'status': c.get('status')} for c in csai
                         if start - AROUND <= wall(c) <= end + AROUND],
                'backups': {'polls': len(backups), 'withAdSegments': sum(1 for s in backups if (ad_marks(s['playlist']) or {}).get('kind') == 'SSAI'),
                            'markedLive': sum(1 for s in backups if (ad_marks(s['playlist']) or {}).get('kind') == 'MARKED_LIVE'),
                            'clean': sum(1 for s in backups if not ad_marks(s['playlist']))},
                'tokens': dict(tokens),
                'toPlayer': {'polls': len(to_player), 'kinds': dict(Counter((ad_marks(d['playlist']) or {}).get('kind', 'NONE') for d in to_player)),
                             'adMedia': {'listed': len(listed), 'requested': len(requested), 'fromNetwork': len(from_network),
                                         'answeredByPurple': len(requested - from_network)},
                             # consecutive playlists to the player whose MEDIA-SEQUENCE went down
                             'sequenceBack': sum(1 for x, y in zip(to_player, to_player[1:])
                                                 if (x['playlist'].get('mediaSequence') or 0) > (y['playlist'].get('mediaSequence') or 0))}
                if mode != 'record' else None,
                'purpleConsole': dict(console), 'purpleEvents': dict(events),
                'adOverlaySeconds': overlap(overlay, start - 10, end + 60, last),
                # the first sample 60 s or more after the break: video paused, ad overlay
                'after': next(({'at': clock(wall(x)), 'paused': (x.get('video') or {}).get('paused'), 'adOverlay': x.get('adOverlay')}
                               for x in samples if wall(x) >= end + 60), None),
                'notProgressingSeconds': round((min(end + 60, last) - (start - 10)) - overlap(progressing, start - 10, end + 60, last), 1),
                # page monitor values in the window: <video> elements, playing ones, ad or picture-by-picture elements
                'page': {key: sorted({str(t['value']) for t in transitions if t['key'] == key and start - 10 <= wall(t) <= end + 60}
                                     | {str(value_at(transitions, key, start - 10))})
                         for key in ('videos', 'playingVideos', 'adUi')},
            })
    return report


def print_report(r):
    print(f"== {r['session']} ({r['mode']})")
    by_channel = Counter()
    for w in r['watch']:
        by_channel[w['channel']] += w['minutes']
        print(f"  watch {w['channel']} load {w['load']} {w['start']}-{w['end']} {w['minutes']} min, overlay {w['adOverlaySeconds']} s, "
              f"progressing {w['progressingSeconds']} s")
    print(f"  total {round(sum(by_channel.values()) / 60, 2)} h: " + ', '.join(f'{c} {round(m)} min' for c, m in by_channel.items()))
    for b in r['breaks']:
        print(f"  BREAK {b['channel']} {b['start']}-{b['end']} ({b['seconds']} s, {b['startOffsetMinutes']} min into the load) {b['kind']} "
              f"roll {b['roll']} polls {b['pollKinds']} max ads {b['maxAdSegments']} titles {b['adTitles']}")
        print(f"    seq {b['seqs']}")
        print(f"    csai {b['csai']}")
        print(f"    backups {b['backups']} tokens {b['tokens']} to player {b['toPlayer']}")
        print(f"    after the break: {b['after']}")
        print(f"    overlay {b['adOverlaySeconds']} s, not progressing {b['notProgressingSeconds']} s, events {b['purpleEvents']}, page {b['page']}")
        for p in b['polls']:
            text = p['text'] or {}
            print(f"     t={p['t']:>6} seq {p['seq']} segs {p['segments']} {p['kind']:<11} ads {text.get('ads')} {text.get('order', '')} "
                  f"disc {p['discontinuities']} prefetch {p['prefetch']} maps {text.get('maps')} {p['classes']} "
                  f"{[{k: v for k, v in d.items() if k != 'class'} for d in p['stitched']][:3]}")
        for line, n in b['purpleConsole'].items():
            print(f"    purple x{n}: {line}")
    for c in r['csai']:
        print(f"  edge.ads {c['at']} {c['channel']} {c['path']} bp={c['bp']}")


def totals(reports):
    """Watch time per session and channel, breaks per kind, twitch-maf-ad timing, edge.ads answers."""
    print('== totals')
    hours = Counter()
    for r in reports:
        for w in r['watch']:
            hours[(r['mode'], w['channel'])] += w['minutes'] / 60
    for (mode, channel), h in sorted(hours.items()):
        print(f'  watched {mode:<9} {channel:<22} {h:.2f} h')
    print(f"  watched in total {sum(hours.values()):.2f} h ({', '.join(f'{m} {sum(h for (mm, _), h in hours.items() if mm == m):.2f} h' for m in sorted({m for m, _ in hours}))})")
    kinds = Counter((r['mode'], b['kind'], tuple(b['roll'])) for r in reports for b in r['breaks'])
    for (mode, kind, roll), n in sorted(kinds.items()):
        print(f'  breaks {mode:<9} {kind:<11} {list(roll)} {n}')
    for r in reports:
        by_load = {}
        for m in r['mafs']:
            by_load.setdefault(m['load'], []).append(m)
        for load, items in by_load.items():
            gaps = [round((datetime.datetime.strptime(b['start'], '%H:%M:%S') - datetime.datetime.strptime(a['start'], '%H:%M:%S')).seconds / 60, 1)
                    for a, b in zip(items, items[1:])]
            print(f"  maf {r['session']} load {load} {items[0]['channel']}: {len(items)} slots, first at {items[0]['offsetMinutes']} min, "
                  f"gaps {gaps} min, seconds {[round(m['seconds']) for m in items]}, "
                  f"edge.ads {[[c['t'] for c in m['csai']] for m in items] if r['mode'] == 'record' else '-'}")
    loads = Counter(r['mode'] for r in reports for w in r['watch'])
    prerolls = Counter(r['mode'] for r in reports for b in r['breaks'] if 'PREROLL' in b['roll'] and b['startOffsetMinutes'] < 0.5)
    print(f'  loads {dict(loads)}, with a break in the main playlist within 30 s of the load (PREROLL) {dict(prerolls)}')
    print(f"  twitch-assignment: {sum(sum(r['assignment']) for r in reports)} main polls in {sum(1 for r in reports for a in r['assignment'] if a)} loads")
    for r in reports:
        for m in r['laterMasters']:
            if r['mode'] == 'record':
                print(f"  later master {r['session']} {m['at']} {m['channel']} {m['playerType']}")
    answers = Counter()
    for r in reports:
        for c in r['csai']:
            answers[(r['mode'], c['path'], c['bp'], c.get('status'))] += 1
    for key, n in sorted(answers.items(), key=str):
        print(f'  edge.ads {key} {n}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('directory')
    ap.add_argument('--json')
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    reports = [session_report(d) for d in sorted(glob.glob(os.path.join(args.directory, '*'))) if os.path.isdir(d)]
    for r in reports:
        print_report(r)
    totals(reports)
    if args.json:
        with open(args.json, 'w', encoding='utf-8', newline='') as f:
            json.dump(reports, f, indent=1)


if __name__ == '__main__':
    main()
