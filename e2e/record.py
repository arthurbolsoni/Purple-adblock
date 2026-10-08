"""Level 3 recorder (T-005, L3-10): one live channel on twitch.tv with CDP Fetch on the player's requests.

    python e2e/record.py <channel|-> --seconds N [--with-purple] [--technique TR-xxx] [--fresh-profile]
                         [--segment-bodies] [--out DIR] [--visible]

Edge in record mode (Purple off), or extension mode with --with-purple, on the dedicated profile or, with
--fresh-profile (TR-001, TR-005), a temporary one. `-` as the channel takes the first directory card that plays
without the content gate. Fetch pauses at the response stage: usher, media playlists (`*.m3u8`), segments
(`/v1/segment/`), `gql.twitch.tv/gql` and `edge.ads.twitch.tv`. Every paused request is continued, also when
reading it fails, so the player keeps going (docs/findings/2026-10-03-twitch-live-traffic.md).

Everything goes to ~/purple-recordings/<date>-<channel>[-n]/ and never into the repo: manifest.json, page.json
(the page state at the end) and bodies/. Bodies are kept for masters, media playlists, PlaybackAccessToken GQL calls
and edge.ads responses; segments keep URL, status, type and size, and their bodies only with --segment-bodies. The
manifest has every entry's offset from the start of the session, the full usher URLs, and marks each segment whose
URI a recorded media playlist listed as an ad (the worker logger's rule: an ad title, or with a stitched-ad marker any
title other than "live"). Its `summary` gives the usher query with token, signature and session ids left out.
"""
import argparse
import asyncio
import base64
import datetime
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import time
from urllib.parse import parse_qsl, urlsplit

import lib
from scenarios import common

cdp = lib.uc.cdp
RECORDINGS = os.path.join(os.path.expanduser('~'), 'purple-recordings')
STAGE = cdp.fetch.RequestStage.RESPONSE
PATTERNS = ['*usher.ttvnw.net*', '*.m3u8*', '*/v1/segment/*', '*gql.twitch.tv/gql*', '*edge.ads.twitch.tv*']
# usher query values left out of the summary: credentials and per-session ids
PRIVATE_QUERY = {'token', 'sig', 'play_session_id', 'p', 'player_version_id'}
STITCHED = re.compile(r'CLASS="twitch-stitched|ID="stitched-ad')


def kind_of(url, method='GET'):
    host, path = urlsplit(url).netloc, urlsplit(url).path
    if host == 'usher.ttvnw.net':
        return 'usher'
    if host == 'gql.twitch.tv':
        return 'gql'
    if host == 'edge.ads.twitch.tv':
        return 'csai'
    if '/v1/segment/' in path:
        # the player also POSTs to <id>.rufio.hls.live-video.net/v1/segment/<token>, answered 204 (not media)
        return 'segment' if method == 'GET' else 'segmentPost'
    if path.endswith('.m3u8'):
        return 'media'
    return 'other'


def is_ad_title(title):
    # the 2.6.7 title markers, as e2e/worker-logger.js
    return 'Amazon' in title or 'stitched' in title or 'DCM,' in title


def ad_uris(text):
    """URIs (without query) a media playlist lists as ads, and every URI it lists: segment lines, `EXT-X-MAP` and
    `EXT-X-TWITCH-PREFETCH` (with prefetch lines, the player fetches the prefetch URI and never the URI the same
    segment gets later as a segment line, B-046). A map goes with the next segment; prefetch lines are ads after an
    ad segment or after a stitched-ad marker past the last segment (a break announced, B-034)."""
    lines = [line.strip() for line in text.splitlines()]
    stitched = any(line.startswith('#EXT-X-DATERANGE:') and STITCHED.search(line) for line in lines)
    ads, every, title, maps, prefetch = set(), set(), '', [], []
    last_ad, marker_after_last = False, False
    for line in lines:
        if line.startswith('#EXTINF:'):
            title = line.split(',', 1)[1] if ',' in line else ''
        elif line.startswith('#EXT-X-MAP:'):
            match = re.search(r'URI="([^"]+)"', line)
            if match:
                maps.append(match.group(1).split('?')[0])
        elif line.startswith('#EXT-X-TWITCH-PREFETCH:'):
            prefetch.append((line.split(':', 1)[1].split('?')[0], marker_after_last))
        elif line.startswith('#EXT-X-DATERANGE:') and STITCHED.search(line):
            marker_after_last = True
        elif line and not line.startswith('#'):
            uri = line.split('?')[0]
            last_ad = is_ad_title(title) or (stitched and bool(title) and title != 'live')
            for item in [*maps, uri]:
                every.add(item)
                if last_ad:
                    ads.add(item)
            maps, title, marker_after_last = [], '', False
    for item, announced in [*((m, marker_after_last) for m in maps), *prefetch]:
        every.add(item)
        if last_ad or announced:
            ads.add(item)
    return ads, every


def public_query(url):
    return {k: ('<left out>' if k in PRIVATE_QUERY else v) for k, v in parse_qsl(urlsplit(url).query, keep_blank_values=True)}


class Recording:
    def __init__(self, folder, segment_bodies):
        self.folder, self.segment_bodies = folder, segment_bodies
        self.bodies = os.path.join(folder, 'bodies')
        os.makedirs(self.bodies)
        self.start = time.monotonic()
        self.entries = []
        self.errors = []

    def offset(self):
        return round((time.monotonic() - self.start) * 1000)

    def save(self, index, kind, data, ext):
        name = f'{index:05d}-{kind}{ext}'
        with open(os.path.join(self.bodies, name), 'wb') as f:
            f.write(data)
        return name

    async def on_paused(self, tab, event):
        entry = {'offset': self.offset(), 'kind': kind_of(event.request.url, event.request.method), 'method': event.request.method,
                 'url': event.request.url, 'resourceType': str(event.resource_type.value), 'status': event.response_status_code}
        if event.request.method == 'POST':
            entry['postDataLength'] = len(event.request.post_data or '') if event.request.post_data else None
        try:
            headers = {h.name.lower(): h.value for h in event.response_headers or []}
            entry['contentType'] = headers.get('content-type')
            if entry['kind'] == 'gql':
                operations = gql_operations(event.request.post_data)
                entry['operations'] = [op.get('operationName') for op in operations]
                if any((name or '').startswith('PlaybackAccessToken') for name in entry['operations']):
                    entry['request'] = operations
                else:
                    return
            if entry['status'] is None or 300 <= entry['status'] < 400:
                return
            if entry['kind'] == 'segmentPost':
                return
            if entry['kind'] == 'segment' and not self.segment_bodies:
                # reading every segment body over CDP would slow the player down: the header is enough
                entry['size'] = int(headers['content-length']) if headers.get('content-length', '').isdigit() else None
                return
            keep = entry['kind'] in ('usher', 'media', 'gql', 'csai', 'segment')
            if keep:
                body, encoded = await tab.send(cdp.fetch.get_response_body(event.request_id))
                data = base64.b64decode(body) if encoded else body.encode('utf-8')
                entry['size'] = len(data)
                entry['sha256'] = hashlib.sha256(data).hexdigest()[:16]
                if keep:
                    ext = '.ts' if entry['kind'] == 'segment' else '.m3u8' if entry['kind'] in ('usher', 'media') else '.txt'
                    entry['body'] = self.save(len(self.entries), entry['kind'], data, ext)
        except Exception as error:
            entry['error'] = str(error)[:200]
            self.errors.append(entry['error'])
        finally:
            self.entries.append(entry)
            try:
                await tab.send(cdp.fetch.continue_request(event.request_id))
            except Exception as error:
                self.errors.append('continue: ' + str(error)[:200])

    def mark_ads(self):
        ads, listed = set(), set()
        for entry in self.entries:
            if entry['kind'] == 'media' and entry.get('body'):
                with open(os.path.join(self.bodies, entry['body']), encoding='utf-8', errors='replace') as f:
                    text = f.read()
                if '#EXT-X-STREAM-INF' in text:
                    entry['kind'] = 'master'
                    continue
                playlist_ads, every = ad_uris(text)
                entry['segments'], entry['adSegments'] = len(every), len(playlist_ads)
                ads |= playlist_ads
                listed |= every
        for entry in self.entries:
            if entry['kind'] == 'segment':
                uri = entry['url'].split('?')[0]
                entry['ad'] = True if uri in ads else False if uri in listed else None

    def summary(self):
        kinds = {}
        for entry in self.entries:
            kinds.setdefault(entry['kind'], {'count': 0, 'statuses': {}})
            kinds[entry['kind']]['count'] += 1
            status = str(entry.get('status'))
            kinds[entry['kind']]['statuses'][status] = kinds[entry['kind']]['statuses'].get(status, 0) + 1
        segments = [e for e in self.entries if e['kind'] == 'segment']
        ushers = [e for e in self.entries if e['kind'] == 'usher']
        return {
            'kinds': kinds,
            'segments': {'requested': len(segments), 'ad': sum(1 for e in segments if e.get('ad') is True),
                         'live': sum(1 for e in segments if e.get('ad') is False), 'notListed': sum(1 for e in segments if e.get('ad') is None)},
            'mediaPlaylistsWithAds': sum(1 for e in self.entries if e.get('adSegments')),
            'usher': [{'offset': e['offset'], 'path': urlsplit(e['url']).path, 'status': e.get('status'), 'query': public_query(e['url'])} for e in ushers],
            'tokens': [op.get('variables', {}).get('playerType') for e in self.entries for op in e.get('request') or []],
            'errors': self.errors[:20],
        }


def gql_operations(post_data):
    try:
        body = json.loads(post_data or 'null')
    except ValueError:
        return []
    return [op for op in (body if isinstance(body, list) else [body]) if isinstance(op, dict)]


def folder_for(out, channel):
    base = os.path.join(out, f"{datetime.date.today().isoformat()}-{channel.strip('/') or 'directory'}")
    folder, n = base, 1
    while os.path.exists(folder):
        n += 1
        folder = f'{base}-{n}'
    return folder


async def record(args):
    mode = 'extension' if args.with_purple else 'record'
    profile = tempfile.mkdtemp(prefix='purple-e2e-record-') if args.fresh_profile else lib.PROFILE
    session = None
    try:
        session = await lib.launch(mode, profile=profile, visible=args.visible, debug=args.with_purple)
        tab = session.tab
        channel = args.channel
        # twitch.tv loads once before Fetch is enabled: from about:blank straight to a channel with Fetch on, Page.navigate
        # never returned (2026-10-08, the dedicated profile and the paused requests continued)
        channels = await common.directory_channels(session)
        if channel == '-':
            channel, _, _ = await common.open_channel(session, channels)
            if not channel:
                raise RuntimeError('no directory channel played without the content gate')
        channel = '/' + channel.strip('/')
        await session.navigate('about:blank')
        recording = Recording(folder_for(args.out, channel), args.segment_bodies)
        version = await tab.send(cdp.browser.get_version())
        # each paused request in a task of its own: a handler awaiting CDP replies inside nodriver's listener would wait
        # for a reply the listener cannot read while it waits for the handler
        tasks = set()

        def on_paused(event):
            task = asyncio.ensure_future(recording.on_paused(tab, event))
            tasks.add(task)
            task.add_done_callback(tasks.discard)

        tab.add_handler(cdp.fetch.RequestPaused, on_paused)
        await tab.send(cdp.fetch.enable(patterns=[cdp.fetch.RequestPattern(url_pattern=p, request_stage=STAGE) for p in PATTERNS]))
        started = datetime.datetime.now().isoformat(timespec='seconds')
        await session.navigate(common.TWITCH + channel)
        print(f'recording {channel} for {args.seconds} s into {recording.folder}', flush=True)
        await tab.sleep(args.seconds)
        state = await lib.page_state(tab)
        await tab.send(cdp.fetch.disable())
        await tab.sleep(1)
        recording.mark_ads()
        manifest = {'channel': channel, 'started': started, 'seconds': args.seconds, 'mode': mode, 'technique': args.technique,
                    'profile': 'fresh' if args.fresh_profile else 'dedicated', 'edge': version[1] if isinstance(version, tuple) else str(version),
                    'patterns': PATTERNS, 'summary': recording.summary(), 'entries': recording.entries}
        with open(os.path.join(recording.folder, 'manifest.json'), 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=1)
        with open(os.path.join(recording.folder, 'page.json'), 'w', encoding='utf-8') as f:
            json.dump({k: state.get(k) for k in ('url', 'video', 'adOverlay', 'playerError', 'contentGate', 'events', 'media')}, f, indent=1)
        print(json.dumps({'video': state.get('video'), 'adOverlay': state.get('adOverlay'), 'playerError': state.get('playerError'),
                          **{k: v for k, v in manifest['summary'].items() if k != 'usher'}}, indent=1))
        return 0 if not recording.errors and (state.get('video') or {}).get('readyState', 0) >= 3 else 1
    finally:
        if session:
            await session.close()
        if args.fresh_profile:
            shutil.rmtree(profile, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('channel', help="channel (/name or name), or - for the first directory card that plays")
    ap.add_argument('--seconds', type=int, required=True)
    ap.add_argument('--with-purple', action='store_true', help='extension mode with debug; record mode (Purple off) without it')
    ap.add_argument('--technique', help='TR-xxx from docs/server/techniques.md, kept in the manifest')
    ap.add_argument('--fresh-profile', action='store_true', help='a temporary profile, deleted at the end (TR-001, TR-005)')
    ap.add_argument('--segment-bodies', action='store_true', help='keep segment bodies too')
    ap.add_argument('--out', default=RECORDINGS)
    ap.add_argument('--visible', action='store_true')
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    return asyncio.run(record(args))


if __name__ == '__main__':
    sys.exit(main())
