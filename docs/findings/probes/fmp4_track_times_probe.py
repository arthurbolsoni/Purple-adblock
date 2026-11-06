"""Audio and video timestamps of the same live segment across renditions and tokens of an fMP4 channel (T-829,
2026-11-06).

Usage: python docs/findings/probes/fmp4_track_times_probe.py <channel login> [--types site,popout,autoplay] [--rounds N]
       python docs/findings/probes/fmp4_track_times_probe.py --recorded <soak session folder> --from HH:MM:SS --to HH:MM:SS

For each player type a logged-out PlaybackAccessToken (`autoplay` on the android platform, as Purple asks for it) and
the usher master; from each master the 720p60 (or the first 720p) and the 360p30 variant. Each round reads every one
of those media playlists, takes the newest live number they all list (EXT-X-TWITCH-LIVE-SEQUENCE + index), downloads
that segment from each and the EXT-X-MAP init segment it uses, and parses the ISO BMFF boxes:

- init: each track's id, handler (`vide`/`soun`), timescale (`mdhd`) and default sample duration (`trex`);
- segment: per track, the first `tfdt` baseMediaDecodeTime and the sum of the sample durations of every `trun`
  (`trun` per-sample durations, else the `tfhd` default, else the `trex` default).

Printed per round: for each type and rendition, the audio and the video start and end in seconds (decode time), and
the start of each against the first row's. A segment that starts its audio or video at another time on another
rendition or token is placed there by IVS, which appends fMP4 fragments at their own times after one
timestampOffset per load (docs/findings/2026-10-31-fmp4-stills.md). Prints no token, signature or URL.

With --recorded, the texts a soak recorded with --all-playlists (playlists.jsonl: the page's own playlists and the
backups Purple delivered) between --from and --to (local wall time): every segment URI listed under the same live
number is downloaded again and the audio and video starts of the copies compared. Run it soon after the run: on
2026-11-06 the segment URIs answered 20 minutes later and failed (HTTP error) 35 minutes later. Prints, per live number, the copies and whether they agree, and the copies that do not.
"""
import argparse
import json
import struct
import sys
import time
import urllib.parse
import urllib.request

CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'
QUERY = ('query PlaybackAccessToken_Template($login: String!, $playerType: String!, $platform: String!) {'
         ' streamPlaybackAccessToken(channelName: $login, params: {platform: $platform, playerBackend: "mediaplayer",'
         ' playerType: $playerType}) { value signature } }')


def get(url, data=None, headers=None):
    request = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(request, timeout=15) as response:
        return response.read()


def token(login, player_type):
    platform = 'android' if player_type == 'autoplay' else 'web'
    body = json.dumps({'operationName': 'PlaybackAccessToken_Template', 'query': QUERY,
                       'variables': {'login': login, 'playerType': player_type, 'platform': platform}}).encode()
    answer = json.loads(get('https://gql.twitch.tv/gql', body, {'Client-ID': CLIENT_ID, 'Content-Type': 'application/json'}))
    return answer['data']['streamPlaybackAccessToken']


def master(login, access):
    query = urllib.parse.urlencode({'sig': access['signature'], 'token': access['value'], 'allow_source': 'true',
                                    'supported_codecs': 'h264', 'player_backend': 'mediaplayer', 'p': '1234',
                                    'playlist_include_framerate': 'true', 'fast_bread': 'true'})
    return get(f'https://usher.ttvnw.net/api/channel/hls/{login}.m3u8?{query}').decode()


def variants(text):
    """{name: url} from a master: the VIDEO group name of each STREAM-INF (720p60, 360p30, chunked, ...)."""
    out, lines = {}, text.splitlines()
    for i, line in enumerate(lines):
        if line.startswith('#EXT-X-STREAM-INF:') and i + 1 < len(lines):
            group = line.split('VIDEO="')[1].split('"')[0] if 'VIDEO="' in line else line
            out[group] = lines[i + 1].strip()
    return out


def segments(text):
    """{live number: (segment url, map url)} for the live segments of a media playlist."""
    lines = text.splitlines()
    live = next((int(l.split(':', 1)[1]) for l in lines if l.startswith('#EXT-X-TWITCH-LIVE-SEQUENCE:')), None)
    if live is None:
        return {}
    out, index, current_map, title = {}, 0, None, None
    for line in lines:
        if line.startswith('#EXT-X-MAP:'):
            current_map = line.split('URI="')[1].split('"')[0]
        elif line.startswith('#EXTINF:'):
            title = line.split(',', 1)[1] if ',' in line else ''
        elif line and not line.startswith('#'):
            if title == 'live':
                out[live + index] = (line.strip(), current_map)
            index += 1
            title = None
    return out


def boxes(data, start=0, end=None):
    end = len(data) if end is None else end
    while start + 8 <= end:
        size, kind = struct.unpack('>I4s', data[start:start + 8])
        header = 8
        if size == 1:
            size = struct.unpack('>Q', data[start + 8:start + 16])[0]
            header = 16
        elif size == 0:
            size = end - start
        if size < header:
            return
        yield kind.decode('latin-1'), start + header, start + size
        start += size


def child(data, start, end, kind):
    return next(((s, e) for k, s, e in boxes(data, start, end) if k == kind), None)


def init_tracks(data):
    """{track id: {'handler', 'timescale', 'default'}} from an init segment."""
    tracks, defaults = {}, {}
    moov = child(data, 0, len(data), 'moov')
    if not moov:
        return tracks
    for kind, s, e in boxes(data, *moov):
        if kind == 'trak':
            tkhd = child(data, s, e, 'tkhd')
            version = data[tkhd[0]]
            track_id = struct.unpack('>I', data[tkhd[0] + (20 if version == 1 else 12):][:4])[0]
            mdia = child(data, s, e, 'mdia')
            mdhd = child(data, *mdia, 'mdhd')
            mv = data[mdhd[0]]
            timescale = struct.unpack('>I', data[mdhd[0] + (20 if mv == 1 else 12):][:4])[0]
            hdlr = child(data, *mdia, 'hdlr')
            handler = data[hdlr[0] + 8:hdlr[0] + 12].decode('latin-1')
            tracks[track_id] = {'handler': handler, 'timescale': timescale, 'default': None}
        elif kind == 'mvex':
            for k2, s2, e2 in boxes(data, s, e):
                if k2 == 'trex':
                    track_id, _, duration = struct.unpack('>III', data[s2 + 4:s2 + 16])
                    defaults[track_id] = duration
    for track_id, duration in defaults.items():
        if track_id in tracks:
            tracks[track_id]['default'] = duration
    return tracks


def fragment_times(data, tracks):
    """{track id: (first tfdt, summed duration)} in timescale units."""
    out = {}
    for kind, s, e in boxes(data):
        if kind != 'moof':
            continue
        for k2, s2, e2 in boxes(data, s, e):
            if k2 != 'traf':
                continue
            tfhd = child(data, s2, e2, 'tfhd')
            flags = int.from_bytes(data[tfhd[0] + 1:tfhd[0] + 4], 'big')
            track_id = struct.unpack('>I', data[tfhd[0] + 4:tfhd[0] + 8])[0]
            at = tfhd[0] + 8
            at += 8 if flags & 0x1 else 0
            at += 4 if flags & 0x2 else 0
            default = struct.unpack('>I', data[at:at + 4])[0] if flags & 0x8 else (tracks.get(track_id) or {}).get('default')
            tfdt = child(data, s2, e2, 'tfdt')
            base = None
            if tfdt:
                version = data[tfdt[0]]
                base = struct.unpack('>Q' if version == 1 else '>I', data[tfdt[0] + 4:tfdt[0] + (12 if version == 1 else 8)])[0]
            duration = 0
            for k3, s3, e3 in boxes(data, s2, e2):
                if k3 != 'trun':
                    continue
                tflags = int.from_bytes(data[s3 + 1:s3 + 4], 'big')
                count = struct.unpack('>I', data[s3 + 4:s3 + 8])[0]
                at = s3 + 8 + (4 if tflags & 0x1 else 0) + (4 if tflags & 0x4 else 0)
                per = sum(4 for bit in (0x100, 0x200, 0x400, 0x800) if tflags & bit)
                for _ in range(count):
                    duration += struct.unpack('>I', data[at:at + 4])[0] if tflags & 0x100 else (default or 0)
                    at += per
            first, total = out.get(track_id, (base, 0))
            out[track_id] = (first if first is not None else base, total + duration)
    return out


def track_starts(segment_url, map_url, init_cache):
    """{handler: start in seconds} of a segment, its init segment parsed once per URL."""
    if map_url not in init_cache:
        init_cache[map_url] = init_tracks(get(map_url))
    tracks = init_cache[map_url]
    return {tracks[k]['handler']: v[0] / tracks[k]['timescale'] for k, v in fragment_times(get(segment_url), tracks).items() if k in tracks}


def recorded(folder, start, end):
    import datetime
    copies = {}  # live number -> {segment url: map url}
    for line in open(f'{folder}/playlists.jsonl', encoding='utf-8'):
        row = json.loads(line)
        wall = datetime.datetime.fromtimestamp(row['wall'] / 1000).strftime('%H:%M:%S')
        if start <= wall <= end and '#EXTINF' in row.get('text', ''):
            for number, (url, map_url) in segments(row['text']).items():
                copies.setdefault(number, {}).setdefault(url, map_url)
    init_cache, agree, differ, expired = {}, 0, 0, 0
    for number in sorted(copies):
        if len(copies[number]) < 2:
            continue
        starts = []
        for url, map_url in copies[number].items():
            try:
                starts.append(track_starts(url, map_url, init_cache))
            except Exception:  # an expired URI
                expired += 1
        if len(starts) < 2:
            continue
        distinct = {tuple(sorted((k, round(v, 6)) for k, v in s.items())) for s in starts}
        if len(distinct) == 1:
            agree += 1
        else:
            differ += 1
            print(f'  {number}: {len(starts)} copies, starts differ: {sorted(distinct)}')
    print(f'{agree} live numbers whose copies agree on the audio and video starts, {differ} that do not;'
          f' {expired} copies not downloaded (expired)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('login', nargs='?')
    ap.add_argument('--types', default='site,popout,autoplay')
    ap.add_argument('--rounds', type=int, default=3)
    ap.add_argument('--recorded', metavar='FOLDER')
    ap.add_argument('--from', dest='start', default='00:00:00')
    ap.add_argument('--to', dest='end', default='23:59:59')
    args = ap.parse_args()
    if args.recorded:
        return recorded(args.recorded, args.start, args.end)

    playlists = []  # (type, rendition, media playlist url)
    for player_type in args.types.split(','):
        found = variants(master(args.login, token(args.login, player_type)))
        names = sorted(found)
        high = '720p60' if '720p60' in found else next((n for n in names if n.startswith('720p')), None)
        low = '360p30' if '360p30' in found else next((n for n in names if n.startswith('360p')), None)
        for name in (high, low):
            if name:
                playlists.append((player_type, name, found[name]))
    print('playlists:', ', '.join(f'{t} {n}' for t, n, _ in playlists))

    init_cache = {}
    for round_ in range(args.rounds):
        listed = [(t, n, segments(get(url).decode())) for t, n, url in playlists]
        common = set.intersection(*(set(s) for _, _, s in listed if s)) if listed else set()
        if not common:
            print('no live number listed by every playlist')
            time.sleep(2)
            continue
        number = max(common)
        print(f'\nround {round_ + 1}, live number {number}')
        reference = None
        for player_type, name, listed_segments in listed:
            segment_url, map_url = listed_segments[number]
            if map_url not in init_cache:
                init_cache[map_url] = init_tracks(get(map_url))
            tracks = init_cache[map_url]
            times = fragment_times(get(segment_url), tracks)
            row = {}
            for track_id, (base, duration) in times.items():
                info = tracks.get(track_id, {})
                scale = info.get('timescale') or 1
                row[info.get('handler', str(track_id))] = (base / scale, (base + duration) / scale, scale)
            if reference is None:
                reference = row
            cells = []
            for handler in ('soun', 'vide'):
                if handler not in row:
                    cells.append(f'{handler} -')
                    continue
                start, end, scale = row[handler]
                shift = start - reference[handler][0] if handler in reference else float('nan')
                cells.append(f'{handler} {start:.4f} to {end:.4f} (scale {scale}, start {shift * 1000:+.1f} ms)')
            av = (row['soun'][0] - row['vide'][0]) * 1000 if 'soun' in row and 'vide' in row else float('nan')
            print(f'  {player_type:10} {name:7} ' + '  '.join(cells) + f'  audio-video start {av:+.1f} ms')
        time.sleep(2)


if __name__ == '__main__':
    sys.exit(main())
