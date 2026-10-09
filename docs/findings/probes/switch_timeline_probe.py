"""Timeline of one soak session between two clock times (T-809, 2026-10-09).

Usage: python docs/findings/probes/switch_timeline_probe.py <session folder> HH:MM:SS HH:MM:SS [YYYY-MM-DD]

From a soak.py session folder (debug on): pause/play/create/delete messages between the page and the workers (samples),
<video> events (media), page monitor transitions, Purple's console lines and the playlists the player got (workerLog,
delivered), Twitch's answers (server), and every segment the player fetched with the PROGRAM-DATE-TIME and title it has
in the recorded playlist texts (serverTexts, playlists), or `prefetch@<time>` for a prefetch URI.
"""
import datetime
import json
import sys

folder, start, end = sys.argv[1], sys.argv[2], sys.argv[3]
day = sys.argv[4] if len(sys.argv) > 4 else '2026-10-08'


def ms(text):
    return datetime.datetime.fromisoformat(f'{day}T{text}').timestamp() * 1000


def clock(m):
    return datetime.datetime.fromtimestamp(m / 1000).strftime('%H:%M:%S.%f')[:-3]


def key(url):
    return url.split('?')[0].split('://')[-1]


def rows_of(name):
    return [json.loads(line) for line in open(f'{folder}/{name}.jsonl', encoding='utf-8')]


lo, hi = ms(start), ms(end)
rows = []

when = {}
for name in ('serverTexts', 'playlists'):
    for r in rows_of(name):
        if not lo - 120000 <= r['wall'] <= hi + 60000:
            continue
        lines, pdt = r['text'].splitlines(), None
        for i, line in enumerate(lines):
            if line.startswith('#EXT-X-PROGRAM-DATE-TIME:'):
                pdt = line.split(':', 1)[1][11:23]
            elif line.startswith('#EXTINF:') and i + 1 < len(lines):
                when.setdefault(key(lines[i + 1]), f"{pdt} {line[8:].split(',', 1)[1][:10]}")
            elif line.startswith('#EXT-X-TWITCH-PREFETCH:'):
                when.setdefault(key(line.split(':', 1)[1]), 'prefetch@' + clock(r['wall']))

origins, messages = {}, {}
for s in rows_of('samples'):
    origins[s['load']] = s['timeOrigin']
    for wi, w in enumerate(s['workers']):
        for m in w['messages']:
            if m.get('funcName') in ('pause', 'play', 'create', 'delete') or m.get('type') in ('pause', 'play'):
                messages[(s['load'], wi, m['at'], m.get('funcName') or m.get('type'))] = (s['timeOrigin'] + m['at'], f'worker#{wi} {json.dumps(m)}')
rows += [(w, 'MSG', text) for w, text in messages.values()]
for r in rows_of('media'):
    rows.append((origins[r['load']] + r['at'], 'VIDEO', f"{r.get('event') or r.get('play')} t={r['currentTime']} readyState={r['readyState']} paused={r['paused']}"))
for r in rows_of('transitions'):
    rows.append((r['wall'], 'TRANS', f"{r['key']}={r['value']} t={r.get('currentTime')}"))
for r in rows_of('delivered'):
    p = r['playlist']
    if p.get('type') == 'media':
        rows.append((r['wall'], 'DELIV', f"{r['worker']} seq={p.get('mediaSequence')} segments={p.get('segments')} ads={p.get('adSegments')} prefetch={p.get('prefetch')} roll={p.get('rollTypes')} url=...{key(r['url'])[-24:]}"))
for r in rows_of('server'):
    p = r.get('playlist') or {}
    if p.get('type') == 'media' or (r.get('tokenFlags') or {}).get('player_type'):
        rows.append((r['wall'], 'SERVER', f"{r.get('worker')} {p.get('type')} seq={p.get('mediaSequence')} segments={p.get('segments')} ads={p.get('adSegments')} playerType={(r.get('tokenFlags') or {}).get('player_type')} url=...{key(r['url'])[-24:]}"))
seen = set()
for r in rows_of('workerLog'):
    if r['kind'] == 'console':
        rows.append((r['wall'], 'LOG', f"{r['worker']} {r['text'][:200]}"))
    elif '.ts' in r['url'] or '.mp4' in r['url']:
        k = (r['wall'], r['url'])
        if k not in seen:
            seen.add(k)
            rows.append((r['wall'], 'SEGMENT', f"{r['worker']} {r.get('status')} ...{key(r['url'])[-16:]} -> {when.get(key(r['url']), '?')}"))
for w, kind, text in sorted(rows):
    if lo <= w <= hi:
        print(clock(w), kind.ljust(7), text)
