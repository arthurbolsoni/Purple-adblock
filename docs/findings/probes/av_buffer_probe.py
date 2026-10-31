"""Audio against video in the player's Media Source buffers, and the browser's media log (T-825, 2026-10-31).

Usage: python docs/findings/probes/av_buffer_probe.py <session folder> [--every MINUTES]

Reads mse.jsonl (e2e/mse-hook.js), player.jsonl and mediaLog.jsonl (CDP Media domain) of a soak. Each load has one
MediaSource; its SourceBuffers are told apart by MIME type (`mp4a`: audio, `avc1`/`hvc1`/`hev1`/`av01`: video, both: one
buffer for the two tracks). With an audio and a video buffer, after each append the end of the newest buffered range
of each is taken, and `lag` is the audio's end minus the video's. The audio and the video of the newest segment end
together, so a lag below 0 means the video holds that many seconds of the stream more than the audio: the same moment
sits that much later on the video's timeline than on the audio's. Printed:

- each change of the lag: the median over 5 s against the median over the 5 s before, when they differ by over 0.5 s;
- every --every minutes (default 5), the playhead (`currentTime` from player.jsonl) against the two ends;
- loads with one buffer for both tracks, which the lag cannot be read from;
- media log errors and warnings, and the count of the other messages by text (numbers blanked).
"""
import bisect
import collections
import datetime
import json
import re
import statistics
import sys

AUDIO = ('mp4a', 'opus', 'ac-3', 'ec-3')
VIDEO = ('avc1', 'avc3', 'hvc1', 'hev1', 'av01', 'vp09')


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%H:%M:%S.%f')[:12]


def track(mime):
    mime = (mime or '').lower()
    audio, video = any(c in mime for c in AUDIO), any(c in mime for c in VIDEO)
    return 'both' if audio and video else 'audio' if audio else 'video' if video else mime


def main(folder, every=5.0):
    kinds = {}  # (load, sb) -> audio / video / both
    ends = {}  # load -> {track: newest end}
    series = {}  # load -> [(wall, audio end, video end)]
    channels = {}
    for r in rows(f'{folder}/mse.jsonl'):
        load = r.get('load')
        if r['op'] == 'add':
            kinds[(load, r['sb'])] = track(r.get('type'))
            channels[load] = r.get('channel')
            print(f"{clock(r['wall'])} load {load} {r.get('channel')}: SourceBuffer {r['sb']} {r.get('type')}")
            continue
        kind, ranges = kinds.get((load, r['sb'])), r.get('ranges')
        if r['op'] != 'append' or kind not in ('audio', 'video') or not ranges:
            continue
        state = ends.setdefault(load, {})
        state[kind] = ranges[-1][1]
        if len(state) == 2:
            series.setdefault(load, []).append((r['wall'], state['audio'], state['video']))
    for (load, _), kind in kinds.items():
        if kind == 'both':
            print(f'load {load} {channels.get(load)}: one SourceBuffer for audio and video, no lag to read')

    samples = {}
    for p in rows(f'{folder}/player.jsonl'):
        samples.setdefault(p.get('load'), []).append(p)
    for load, points in series.items():
        print(f'== load {load} {channels.get(load)}: lag changes')
        buckets = collections.defaultdict(list)
        for wall, audio, video in points:
            buckets[int(wall // 5000)].append(audio - video)
        before = None
        for key in sorted(buckets):
            lag = statistics.median(buckets[key])
            if before is not None and abs(lag - before) > 0.5:
                print(f'  {clock(key * 5000)} lag {before:+.2f} -> {lag:+.2f} s ({lag - before:+.2f})')
            before = lag
        print(f'  lag at the end {before:+.2f} s')
        print(f'== load {load}: playhead against the buffer ends, every {every:g} min')
        walls = [w for w, _, _ in points]
        last = None
        for p in samples.get(load, []):
            if last is not None and p['wall'] - last < every * 60000:
                continue
            i = bisect.bisect(walls, p['wall']) - 1
            if i < 0:
                continue
            last = p['wall']
            _, audio, video = points[i]
            print(f"  {clock(p['wall'])} currentTime {p['currentTime']:9.1f}  audio end {audio - p['currentTime']:+6.2f} s"
                  f"  video end {video - p['currentTime']:+6.2f} s  latency {p.get('latency')}")

    print('-- media log')
    other = collections.Counter()
    for r in rows(f'{folder}/mediaLog.jsonl'):
        if r['kind'] == 'errors':
            print(f"{clock(r['wall'])} load {r.get('load')} error {r.get('type')} {r.get('code')} {json.dumps(r.get('data'))[:200]}")
        elif r['kind'] == 'messages' and r.get('level') in ('warning', 'error'):
            print(f"{clock(r['wall'])} load {r.get('load')} player {str(r.get('player'))[-6:]} {r.get('level')}: {r.get('message', '')[:200]}")
        elif r['kind'] == 'messages':
            other[re.sub(r'\d+(\.\d+)?', '#', r.get('message', ''))[:120]] += 1
    for text, n in other.most_common(12):
        print(f'{n:5} {text}')


if __name__ == '__main__':
    args = sys.argv[1:]
    main(args[0], float(args[args.index('--every') + 1]) if '--every' in args else 5.0)
