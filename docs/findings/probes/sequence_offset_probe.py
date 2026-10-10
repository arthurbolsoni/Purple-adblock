"""How each media playlist numbers its segments against their PROGRAM-DATE-TIME (T-816, 2026-10-09).

Usage: python docs/findings/probes/sequence_offset_probe.py <session folder> HH:MM:SS HH:MM:SS [YYYY-MM-DD]

For every recorded playlist text in the window (serverTexts: Twitch's playlists with ad markers; playlists: what the
player got, with ad markers): the playlist URL's tail, MEDIA-SEQUENCE, and for its newest live segment the sequence
number and the date-time. `base` is that date-time minus number x duration: two playlists that number the same moment
of the stream alike have the same base, and a base 3 s later means the same number is 3 s later in the stream.
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


lo, hi = ms(start), ms(end)
for name in ('serverTexts', 'playlists'):
    for line in open(f'{folder}/{name}.jsonl', encoding='utf-8'):
        r = json.loads(line)
        if not lo <= r['wall'] <= hi:
            continue
        lines = r['text'].splitlines()
        sequence = next((int(l.split(':')[1]) for l in lines if l.startswith('#EXT-X-MEDIA-SEQUENCE:')), None)
        n, pdt, newest = -1, None, None
        for i, l in enumerate(lines):
            if l.startswith('#EXT-X-PROGRAM-DATE-TIME:'):
                pdt = datetime.datetime.fromisoformat(l.split(':', 1)[1].replace('Z', '+00:00')).timestamp()
            elif l.startswith('#EXTINF:'):
                n += 1
                duration = float(l[8:].split(',')[0])
                title = l.split(',', 1)[1] if ',' in l else ''
                if title == 'live' and pdt is not None:
                    newest = (sequence + n, pdt, duration)
                pdt = None
        prefetch = sum(1 for l in lines if l.startswith('#EXT-X-TWITCH-PREFETCH:'))
        if newest is None:
            continue
        number, date, duration = newest
        base = date - number * duration
        print(f"{clock(r['wall'])} {'server ' if name == 'serverTexts' else 'player '} ...{r['url'].split('?')[0][-14:]} "
              f"seq {sequence} newest live {number} at {datetime.datetime.utcfromtimestamp(date).strftime('%H:%M:%S.%f')[:-3]} "
              f"prefetch {prefetch} base {base % 1000:.3f}")
