"""What an e2e/record.py recording says about the server (T-005, L3-10).

Usage: python docs/findings/probes/record_manifest_probe.py <recording folder>

Prints: the usher path and query (token, signature and session ids left out), the master's variants and session-data
keys, the media playlist URLs with their poll intervals, segment durations and tags, the prefetch URIs against the URIs
the same positions get later as segment lines (B-046), what the player fetched, the token requests and the
edge.ads calls.
"""
import json
import os
import re
import statistics
import sys
from collections import Counter, defaultdict
from urllib.parse import urlsplit

folder = sys.argv[1]
manifest = json.load(open(os.path.join(folder, 'manifest.json'), encoding='utf-8'))
entries = manifest['entries']
body = lambda e: open(os.path.join(folder, 'bodies', e['body']), encoding='utf-8', errors='replace').read()
print(f"{manifest['channel']} {manifest['started']} {manifest['seconds']} s, {manifest['mode']}, {manifest['profile']} profile, {manifest['technique']}, {manifest['edge']}")

for usher in manifest['summary']['usher']:
    print(f"usher {usher['path']} {usher['status']} at {usher['offset']} ms: {json.dumps(usher['query'])}")
for e in entries:
    if e['kind'] == 'usher' and e.get('body'):
        lines = body(e).splitlines()
        names = [re.search(r'NAME="([^"]+)"', l).group(1) for l in lines if l.startswith('#EXT-X-MEDIA:') and 'NAME=' in l]
        keys = [re.search(r'DATA-ID="([^"]+)"', l).group(1) for l in lines if l.startswith('#EXT-X-SESSION-DATA:')]
        tags = Counter(l.split(':')[0] for l in lines if l.startswith('#'))
        print(f"  master: variants {names}; tags {dict(tags)}; session data keys ({len(keys)}): {keys}")

polls = defaultdict(list)
for e in entries:
    if e['kind'] == 'media' and e.get('body'):
        polls[e['url'].split('?')[0]].append(e)
for url, group in polls.items():
    gaps = [b['offset'] - a['offset'] for a, b in zip(group, group[1:])]
    texts = [body(e) for e in group]
    durations = Counter(l[8:].split(',')[0] for t in texts for l in t.splitlines() if l.startswith('#EXTINF:'))
    tags = sorted({l.split(':')[0] for t in texts for l in t.splitlines() if l.startswith('#EXT')})
    print(f"media {urlsplit(url).netloc} …{url[-24:]}: {len(group)} polls, gaps median {statistics.median(gaps) if gaps else '-'} ms "
          f"({min(gaps) if gaps else '-'} to {max(gaps) if gaps else '-'}); EXTINF {dict(durations)}; tags {tags}")
    seq_uri, prefetch = defaultdict(set), defaultdict(set)
    for t in texts:
        lines = t.splitlines()
        seq = int(next(l for l in lines if l.startswith('#EXT-X-MEDIA-SEQUENCE:')).split(':')[1])
        segs = [l.split('?')[0] for l in lines if l and not l.startswith('#')]
        for i, u in enumerate(segs):
            seq_uri[seq + i].add(u)
        for i, l in enumerate(l for l in lines if l.startswith('#EXT-X-TWITCH-PREFETCH:')):
            prefetch[seq + len(segs) + i].add(l.split(':', 1)[1].split('?')[0])
    both = sorted(set(seq_uri) & set(prefetch))
    print(f"  positions listed first as prefetch, later as segment line: {len(both)}, with the same URI: {sum(1 for s in both if seq_uri[s] & prefetch[s])}")
    listed_prefetch = {u for us in prefetch.values() for u in us}
    listed_segment = {u for us in seq_uri.values() for u in us}
    fetched = [e['url'].split('?')[0] for e in entries if e['kind'] == 'segment' and e['method'] == 'GET']
    print(f"  segments fetched: {len(fetched)}; from prefetch lines {sum(1 for u in fetched if u in listed_prefetch)}, "
          f"from segment lines {sum(1 for u in fetched if u in listed_segment)}")

segments = [e for e in entries if e['kind'] == 'segment' and e['method'] == 'GET']
print('segment hosts, types:', dict(Counter((urlsplit(e['url']).netloc.split('.', 1)[-1], e.get('contentType')) for e in segments)))
posts = [e for e in entries if e['kind'] == 'segmentPost' or (e['kind'] == 'segment' and e['method'] == 'POST')]
print('segment POSTs:', len(posts), dict(Counter((urlsplit(e['url']).netloc.split('.', 1)[-1], e.get('status')) for e in posts)), 'at', [e['offset'] for e in posts])
for e in entries:
    if e.get('request'):
        for op in e['request']:
            text = body(e) if e.get('body') else ''
            token = json.loads(text) if text.startswith(('{', '[')) else {}
            items = token if isinstance(token, list) else [token]
            value = next((i.get('data', {}).get('streamPlaybackAccessToken', {}).get('value') for i in items if isinstance(i, dict)), None)
            flags = {k: v for k, v in json.loads(value).items() if isinstance(v, bool)} if value else {}
            print(f"token {op.get('operationName')} playerType {op.get('variables', {}).get('playerType')} platform {op.get('variables', {}).get('platform')} "
                  f"status {e['status']} at {e['offset']} ms; flags {flags}")
print('edge.ads:', [(e['offset'], e['status'], urlsplit(e['url']).path) for e in entries if e['kind'] == 'csai'])
print('summary:', json.dumps({k: v for k, v in manifest['summary'].items() if k != 'usher'}))
