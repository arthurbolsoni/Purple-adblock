"""The moment of the stream under each segment the player fetched, in order (T-825, 2026-10-31).

Usage: python docs/findings/probes/time_order_probe.py <session folder> [--all]

Needs a soak recorded with --all-playlists in extension mode (the text of every media playlist the player got,
playlists.jsonl). Each segment URI of those texts gets its PROGRAM-DATE-TIME, its duration, its sequence number
(MEDIA-SEQUENCE + index) and its live number (EXT-X-TWITCH-LIVE-SEQUENCE + index, which numbers the stream alike on
every token, B-054); each EXT-X-TWITCH-PREFETCH URI the time and numbers after the segment or prefetch before it. The
player's segment fetches (workerLog.jsonl, `fetch` at level `player`) are then read in order per worker:

- `step`: a segment's start minus the end of the segment fetched before it, by date-time;
- `live`: its live number minus the one before: +1 when the stream goes on, 0 when the player gets the same segment
  again (`again`), below 0 when it goes further back (`back`), above 1 when segments are skipped (`skip`).

A fetch whose URI no delivered text listed is `unknown` (the blank segment of F-14, or a text the recorder dropped)
and is passed over. The source of each playlist is the last Purple console line of its worker within 200 ms before it
(`Stream Type: <type> - Free Stream`: that backup type; else the page's own).

Prints every fetch where the source changes or the live step is not +1 (every fetch with --all), then the count of
live steps per kind of switch (page to backup, backup to page, backup to backup, same source).
"""
import collections
import datetime
import json
import re
import sys

TYPE = re.compile(r'\[Purple\]: Stream Type: (\S+) - Free Stream')
SEGMENT = re.compile(r'\.(ts|mp4|m4s)$')


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:12]


def short(uri):
    """host + path, as the worker logger records fetches."""
    uri = uri.split('?')[0].split('#')[0]
    return uri.split('://', 1)[-1]


def pdt(value):
    """ms since the epoch; None for a value that is not a date-time (2026-11-06: a recorded video's playlist, played
    by the page after the channel went offline, had `2026-11-06T15:43:07.`)."""
    try:
        return datetime.datetime.fromisoformat(value.strip().replace('Z', '+00:00')).timestamp() * 1000
    except ValueError:
        return None


def segments(text):
    """(uri, time ms, duration s, number, live number or None) of every segment and prefetch URI of a media playlist."""
    out, time, duration, number, live = [], None, None, None, None
    last_end = None
    for raw in text.split('\n'):
        line = raw.strip()
        if line.startswith('#EXT-X-MEDIA-SEQUENCE:'):
            number = int(line.split(':', 1)[1])
        elif line.startswith('#EXT-X-TWITCH-LIVE-SEQUENCE:'):
            live = int(line.split(':', 1)[1])
        elif line.startswith('#EXT-X-PROGRAM-DATE-TIME:'):
            time = pdt(line.split(':', 1)[1])
        elif line.startswith('#EXTINF:'):
            duration = float(line[8:].split(',')[0])
        elif line.startswith('#EXT-X-TWITCH-PREFETCH:'):
            if last_end is not None and number is not None:
                out.append((short(line.split(':', 1)[1]), last_end[0], last_end[1], number, live))
                last_end = (last_end[0] + last_end[1] * 1000, last_end[1])
            if number is not None:
                number += 1
            if live is not None:
                live += 1
        elif line and not line.startswith('#') and number is not None:
            start = time if time is not None else (last_end[0] if last_end else None)
            if start is not None and duration:
                out.append((short(line), start, duration, number, live))
                last_end = (start + duration * 1000, duration)
            number += 1
            if live is not None:
                live += 1
            time = None
    return out


def kind_of(live_step):
    return 'on' if live_step == 1 else 'again' if live_step == 0 else 'back' if live_step < 0 else 'skip'


def main(folder, show_all=False):
    logs = rows(f'{folder}/workerLog.jsonl')
    purple = {}
    for r in logs:
        if r.get('kind') == 'console' and '[Purple]' in r.get('text', ''):
            purple.setdefault(r['worker'], []).append(r)
    where = {}  # uri -> (time, duration, number, live, source)
    for p in sorted(rows(f'{folder}/playlists.jsonl'), key=lambda p: p['wall']):
        text = p.get('text') or ''
        if '#EXTINF' not in text:
            continue
        before = [r for r in purple.get(p['worker'], []) if r['wall'] <= p['wall']]
        m = TYPE.search(before[-1]['text']) if before and p['wall'] - before[-1]['wall'] <= 200 else None
        source = m.group(1) if m else 'page'
        for uri, time, duration, number, live in segments(text):
            where.setdefault(uri, (time, duration, number, live, source))

    fetches = {}
    for r in logs:
        if r.get('kind') == 'fetch' and r.get('level') == 'player' and SEGMENT.search(r.get('url', '')):
            fetches.setdefault((r.get('load'), r['worker']), []).append(r)
    counts = collections.Counter()
    unknown = 0
    for (load, worker), items in fetches.items():
        print(f'== load {load}, worker {worker}: {len(items)} segment fetches')
        previous = None
        for r in sorted(items, key=lambda r: r['wall']):
            info = where.get(r['url'])
            if not info:
                unknown += 1
                if show_all:
                    print(f"  {clock(r['wall'])} unknown {r['url'][-40:]}")
                continue
            time, duration, number, live, source = info
            if previous:
                step = (time - previous[0] - previous[1] * 1000) / 1000
                live_step = live - previous[3] if live is not None and previous[3] is not None else None
                kind = kind_of(live_step) if live_step is not None else '?'
                switch = ('same source' if source == previous[4] else 'page to backup' if previous[4] == 'page'
                          else 'backup to page' if source == 'page' else 'backup to backup')
                counts[(switch, kind)] += 1
                if show_all or source != previous[4] or kind != 'on':
                    live_text = f'{live_step:+d}' if live_step is not None else '?'
                    print(f"  {clock(r['wall'])} {kind:5} live {live_text:>3}  step {step:+6.2f} s  #{previous[2]} {previous[4]:>18} -> #{number} {source:<18}"
                          f" stream {clock(time)}")
            previous = (time, duration, number, live, source)
    print(f'{unknown} unknown fetches')
    for (switch, kind), n in sorted(counts.items()):
        print(f'{switch:>16} {kind:5} {n}')


if __name__ == '__main__':
    main(sys.argv[1], '--all' in sys.argv[2:])
