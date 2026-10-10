"""Details of a soak recording that e2e/soak_report.py does not print.

Usage: python docs/findings/probes/soak_details_probe.py <soak folder> [<soak folder> ...]

Per extension session: event totals (backups used by type and quality, merges), the usher masters' variant
order, page GQL requests and usher query keys, `twitch-assignment` / `twitch-maf-ad` media playlists,
picture-by-picture master requests and the stitched breaks after them, pause/play at the break edges and whether the player requested the
prefetch URIs of an announced break. Produced the soak c part of 2026-10-08-midroll-soak.md.
"""
import json
import sys
from collections import Counter
from pathlib import Path


def rows(path):
    if not path.exists():
        return []
    return [json.loads(line) for line in path.open(encoding='utf-8')]


def no_query(url):
    return url.split('://', 1)[-1].split('?')[0]


def events(d):
    types = Counter()
    used = Counter()
    replaced = 0
    for e in rows(d / 'events.jsonl'):
        types[e.get('type')] += 1
        if e.get('type') == 'backupUsed':
            used[f"{e.get('playerType')} {e.get('quality')}"] += 1
        if e.get('type') == 'segmentsReplaced':
            replaced += e.get('count') or 0
    print('  events', dict(types))
    print('  backupUsed', dict(used.most_common()))
    print('  segments replaced by merges', replaced)


def masters(d):
    orders = Counter()
    small = Counter()
    for e in rows(d / 'server.jsonl'):
        if 'usher.ttvnw.net' not in e.get('url', ''):
            continue
        names = tuple((e.get('playlist') or {}).get('names') or [])
        (orders if len(names) == 5 else small)[names] += 1
    print('  five-variant masters', sum(orders.values()), 'orders', len(orders),
          'first variant', dict(Counter(o[0] for o in orders.elements())))
    print('  other masters', {' '.join(k): v for k, v in small.items()})


def gql(d):
    records = [e for e in rows(d / 'server.jsonl') if e.get('gql')]
    print('  gql records', len(records), 'through the page', sum(1 for e in records if e.get('bridged')),
          'status 200', sum(1 for e in records if e.get('status') == 200),
          'with errors', sum(1 for e in records for a in e['gql'] if a.get('errors')))
    print('  gql header names', dict(Counter(' '.join(e.get('headerNames') or []) for e in records)))
    print('  token types', dict(Counter(a.get('playerType') for e in records for a in e['gql'])))
    usher = Counter()
    for e in rows(d / 'server.jsonl'):
        if 'usher.ttvnw.net' in e.get('url', ''):
            keys = e.get('queryKeys') or []
            usher[f"{(e.get('tokenFlags') or {}).get('player_type')} keys={len(keys)} parent_domains={'parent_domains' in keys}"] += 1
    print('  usher requests', dict(usher))


def media_playlists(d):
    polls = assign = maf = 0
    for e in rows(d / 'server.jsonl'):
        url = e.get('url', '')
        if '/v1/playlist/' not in url:
            continue
        pl = json.dumps((e.get('playlist') or {}).get('dateranges') or '')
        polls += 1
        assign += 'twitch-assignment' in pl
        maf += 'twitch-maf-ad' in pl
    print('  media playlist responses', polls, 'twitch-assignment', assign, 'twitch-maf-ad', maf)


def picture(d):
    log = rows(d / 'workerLog.jsonl')
    stored = [e['wall'] / 1000 for e in log if e.get('text') == '[Purple]: picture-by-picture master stored']
    errors = sum(1 for e in log if 'Response body is not a valid M3U8' in (e.get('text') or ''))
    gaps = [round((b - a) / 60, 1) for a, b in zip(stored, stored[1:])]
    print('  picture-by-picture masters stored', len(stored), 'minutes apart', sorted(set(gaps)), 'player errors', errors)


def before_breaks(d):
    # the page's picture-by-picture usher requests (17 query keys; Purple's backups send the page's 22 or, before T-404, 9)
    # against the first poll of each stitched break on the main playlist (the URL with the most polls)
    server = rows(d / 'server.jsonl')
    page = [e['at'] for e in server if 'usher.ttvnw.net' in e.get('url', '')
            and (e.get('tokenFlags') or {}).get('player_type') == 'picture-by-picture' and len(e.get('queryKeys') or []) == 17]
    polls = Counter(no_query(e['url']) for e in server if '/v1/playlist/' in e.get('url', ''))
    main = {url for url, n in polls.items() if n > 200}
    first = min((e['at'] for e in server if no_query(e.get('url', '')) in main), default=0)
    marked = [e['at'] for e in server if no_query(e.get('url', '')) in main
              and ((e.get('playlist') or {}).get('adSegments') or 'twitch-stitched-ad' in json.dumps((e.get('playlist') or {}).get('dateranges') or ''))]
    # a break starts after 60 s without a marked poll; a preroll in the first 30 s of the load is left out
    starts = [t for i, t in enumerate(marked) if (i == 0 or t - marked[i - 1] > 60000) and t - first > 30000]
    gaps = [round(min(s - t for t in page if 0 <= s - t < 120000) / 1000, 1) if any(0 <= s - t < 120000 for t in page) else None for s in starts]
    followed = sum(1 for t in page if any(0 <= s - t < 30000 for s in starts))
    print('  page picture-by-picture requests', len(page), 'followed by a stitched break', followed,
          'seconds from the request to each break', gaps)


def edges(d):
    # pause/play the worker posted (E6), from the samples, and the <video> events after each one
    posted = set()
    for e in rows(d / 'samples.jsonl'):
        for w in e.get('workers') or []:
            for m in w.get('messages') or []:
                if m.get('from') == 'worker' and m.get('type') in ('pause', 'play'):
                    posted.add((m['at'], m['type']))
    media = [m for m in rows(d / 'media.jsonl') if m.get('event') in ('pause', 'playing')]
    for at, kind in sorted(posted):
        if kind != 'pause':
            continue
        pause = next((m for m in media if m['event'] == 'pause' and 0 <= m['at'] - at < 1000), None)
        playing = next((m for m in media if m['event'] == 'playing' and m['at'] > at), None)
        if pause and playing:
            print(f"  worker pause at {at} ms: <video> pause +{pause['at'] - at} ms at currentTime {pause['currentTime']},"
                  f" playing {(playing['at'] - pause['at']) / 1000:.2f} s later at currentTime {playing['currentTime']}")
    others = [m for m in media if m['event'] == 'pause' and not any(0 <= m['at'] - at < 1000 for at, _ in posted)]
    print('  <video> pauses without a worker pause', [(m['at'], m['currentTime']) for m in others])


def prefetch(d):
    # prefetch URIs after a twitch-stitched-ad range with no segment after it: a break announced past the last segment (B-034)
    announced = set()
    for e in rows(d / 'serverTexts.jsonl'):
        lines = (e.get('text') or '').splitlines()
        marker = next((i for i, line in enumerate(lines) if 'twitch-stitched-ad' in line), None)
        if marker is None or any(line.startswith('#EXTINF') for line in lines[marker + 1:]):
            continue
        announced |= {no_query(line.split(':', 1)[1]) for line in lines[marker + 1:] if line.startswith('#EXT-X-TWITCH-PREFETCH:')}
    fetched = Counter(e.get('level') for e in rows(d / 'workerLog.jsonl')
                      if e.get('kind') == 'fetch' and no_query(e.get('url') or '') in announced)
    print('  announced prefetch URIs', len(announced), 'fetches of them', dict(fetched))


for folder in sys.argv[1:]:
    for d in sorted(Path(folder).iterdir()):
        if not d.is_dir():
            continue
        print(f'== {Path(folder).name} {d.name}')
        if not (d / 'events.jsonl').exists():
            masters(d)
            media_playlists(d)
            before_breaks(d)
            continue
        for part in (events, masters, gql, media_playlists, picture, before_breaks, edges, prefetch):
            part(d)
