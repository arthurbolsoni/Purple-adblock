"""Per session, how far apart the page's playlist and the backup playlists number the same moment of the stream
(T-816, 2026-10-09).

Usage: python docs/findings/probes/sequence_base_probe.py <session folder>...

For every recorded playlist text (serverTexts.jsonl: Twitch's playlists with ad markers), the `base` of its newest live
segment: its PROGRAM-DATE-TIME minus its sequence number x its duration (sequence_offset_probe.py). The playlists of
the player's main URL (delivered.jsonl) are the page's token; the others are backups. Per channel load: the page's
bases and the backups' bases (rounded to 0.1 s, with counts), and the difference in segments.
"""
import collections
import datetime
import json
import sys


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def base_of(text):
    lines = text.splitlines()
    sequence = next((int(l.split(':')[1]) for l in lines if l.startswith('#EXT-X-MEDIA-SEQUENCE:')), None)
    n, pdt, newest = -1, None, None
    for l in lines:
        if l.startswith('#EXT-X-PROGRAM-DATE-TIME:'):
            pdt = datetime.datetime.fromisoformat(l.split(':', 1)[1].replace('Z', '+00:00')).timestamp()
        elif l.startswith('#EXTINF:'):
            n += 1
            if l.split(',', 1)[-1] == 'live' and pdt is not None and sequence is not None:
                newest = pdt - (sequence + n) * float(l[8:].split(',')[0])
            pdt = None
    return newest


for folder in sys.argv[1:]:
    main_urls = {d['url'] for d in rows(f'{folder}/delivered.jsonl') if (d.get('playlist') or {}).get('type') == 'media'}
    loads = collections.defaultdict(lambda: {'page': collections.Counter(), 'backup': collections.Counter()})
    for r in rows(f'{folder}/serverTexts.jsonl'):
        b = base_of(r['text'])
        if b is None:
            continue
        role = 'page' if r['url'] in main_urls else 'backup'
        loads[(r['channel'], r['load'])][role][round(b % 1000, 1)] += 1
    print('==', folder)
    for (channel, load), roles in loads.items():
        page = roles['page'].most_common(3)
        backup = roles['backup'].most_common(3)
        diff = f"{(backup[0][0] - page[0][0]) / 2:+.2f} segments" if page and backup else '-'
        print(f'  {channel} load {load}: page {page}  backups {backup}  backup - page: {diff}')
