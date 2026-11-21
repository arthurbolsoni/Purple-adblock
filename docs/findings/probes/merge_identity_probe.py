"""Which live segment each replaced ad segment of a merged playlist really is (T-836, 2026-11-21).

Usage: python docs/findings/probes/merge_identity_probe.py <session folder>... [--all]

Needs a soak in extension mode with --all-playlists: the text of every media playlist the player got (playlists.jsonl)
and of every playlist Twitch served with ad markers (serverTexts.jsonl: the page's own during a break, and the backups
that carried ads, the ones Purple merges from, E5).

A playlist the player got is a merged one when Purple sent `segmentsReplaced` with it (events.jsonl of a --debug run;
without that file, when only ad segments of the page's own text of that poll differ: a whole backup given in the
page's place differs in the live ones too). In a merged playlist every replaced URI is looked up in the backup texts of
the seconds before: its index there gives its live number (EXT-X-TWITCH-LIVE-SEQUENCE +
index, when the backup has no ad segment before it) and its PROGRAM-DATE-TIME. Against the page's position it replaced:

- `late`: the replacement's live number minus the position's (the page's tag + index, when the page's ad segments are
  the end of its playlist); 0 is the live segment of that position, -1 the one before;
- `twice`: the replacement is a live segment the same playlist already lists (the page's own, or another replacement);
- `dates`: the page's PROGRAM-DATE-TIME of the position minus the backup's of the segment with the same live number
  (B-057), in ms.

A break whose ad segments come first in the page's playlist (a preroll's, B-060) has no live number per position: only
the date-time of each replacement against its position's is given (`by date`).

Prints one line per merged playlist with a `late` other than 0 or a `twice` (every merged playlist with --all), then
the counts per session.
"""
import bisect
import collections
import datetime
import json
import re
import statistics
import sys


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:-3]


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


SEGMENT = re.compile(r'(?:#EXT-X-PROGRAM-DATE-TIME:(\S+)\n)?#EXTINF:([\d.]+),(.*)\n(\S+)')


def parse(text):
    """(live sequence or None, segments [(uri, date ms or None, title)], indexes of ad segments by title)"""
    live = re.search(r'#EXT-X-TWITCH-LIVE-SEQUENCE:(\d+)', text)
    segments = []
    for date, _, title, uri in SEGMENT.findall(text):
        try:
            ms = datetime.datetime.fromisoformat(date.replace('Z', '+00:00')).timestamp() * 1000 if date else None
        except ValueError:
            ms = None
        segments.append((uri, ms, title.strip()))
    ads = [i for i, s in enumerate(segments) if s[2] != 'live']
    return (int(live.group(1)) if live else None), segments, ads


def base(live, count, ads):
    """the live number of the first segment when the tag + index numbers the segments (m3u8.ts liveBase)"""
    if live is None:
        return None
    return live if not ads or min(ads) + len(ads) == count else None


def main(folder, show_all):
    delivered = [r for r in rows(f'{folder}/playlists.jsonl') if '/v1/playlist/' in r.get('url', '')]
    served = sorted((r for r in rows(f'{folder}/serverTexts.jsonl') if '/v1/playlist/' in r.get('url', '')), key=lambda r: r['wall'])
    by_url = collections.defaultdict(list)
    for r in served:
        by_url[r['url']].append(r)
    events = rows(f'{folder}/events.jsonl')
    merges = sorted(e['at'] for e in events if e.get('type') == 'segmentsReplaced')
    merged = late_lists = twice_lists = replaced_total = unknown = 0
    lates = collections.Counter()
    date_offsets = []
    for d in delivered:
        own = [r for r in by_url.get(d['url'], []) if d['wall'] - 3000 <= r['wall'] <= d['wall'] + 100]
        if not own:
            continue
        page_live, page, page_ads = parse(own[-1]['text'])
        _, got, _ = parse(d['text'])
        if len(got) != len(page):
            continue
        changed = [i for i in range(len(page)) if got[i][0] != page[i][0]]
        if not changed:
            continue
        if events:
            at = bisect.bisect_left(merges, d['wall'] - 250)
            if at >= len(merges) or merges[at] > d['wall'] + 50:
                continue
        elif not set(changed) <= set(page_ads):
            continue
        merged += 1
        page_base = base(page_live, len(page), page_ads)
        backups = [parse(r['text']) for r in served if r['url'] != d['url'] and d['wall'] - 6000 <= r['wall'] <= d['wall'] + 100]
        own_live = {page_base + i for i in range(len(page)) if page_base is not None and i not in page_ads}
        notes, seen = [], set()
        for i in changed:
            replaced_total += 1
            found = None
            for live, segments, ads in backups:
                index = next((k for k, s in enumerate(segments) if s[0] == got[i][0]), None)
                if index is not None:
                    found = (base(live, len(segments), ads), index, segments, live)
                    break
            if not found:
                unknown += 1
                continue
            backup_base, index, segments, _ = found
            true_live = backup_base + index if backup_base is not None else None
            if page_base is not None and true_live is not None:
                late = true_live - (page_base + i)
                lates[late] += 1
                twice = true_live in own_live or true_live in seen
                seen.add(true_live)
                same = (page_base + i) - backup_base
                if 0 <= same < len(segments) and page[i][1] is not None and segments[same][1] is not None:
                    date_offsets.append(page[i][1] - segments[same][1])
                if late or twice:
                    notes.append(f'#{i} live {true_live} late {late:+d}' + (' TWICE' if twice else ''))
            elif page[i][1] is not None and segments[index][1] is not None:
                notes.append(f'#{i} by date {segments[index][1] - page[i][1]:+.0f} ms')
        late_lists += any('late' in n and 'late +0' not in n for n in notes)
        twice_lists += any('TWICE' in n for n in notes)
        if show_all or any('TWICE' in n or ('late' in n and 'late +0' not in n) for n in notes):
            print(f"  {clock(d['wall'])} {d.get('channel')} load {d.get('load')}: {len(changed)} replaced of {len(page)} (ads {len(page_ads)}, "
                  f"{'at the end' if page_base is not None else 'not at the end or no tag'}): {'; '.join(notes) or 'each the live segment of its position'}")
    dates = f'{min(date_offsets):+.0f} to {max(date_offsets):+.0f} ms, median {statistics.median(date_offsets):+.0f}' if date_offsets else 'none measured'
    print(f'{folder}: {len(delivered)} playlists given, {merged} merged ({replaced_total} segments replaced, {unknown} not found in a backup text); '
          f'{twice_lists} list a live segment twice, {late_lists} with a replacement off its position; late {dict(sorted(lates.items()))}; '
          f'page dates minus backup dates: {dates}')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if a != '--all']
    for folder in args:
        main(folder, '--all' in sys.argv)
