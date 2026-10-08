"""What Twitch's server did during one page load, from the recorder's "server" and "delivered" digests.

Every level 3 run keeps this summary in its report; new or confirmed behaviors go to docs/server/.
"""
import json
from collections import Counter


def _union(entries, key):
    return sorted({value for entry in entries for value in (entry.get(key) or [])})


def media_summary(digests):
    """Polls of media playlists: how many had ad segments, and the markers, tags and hosts they carried."""
    with_ads = [d for d in digests if d.get('adSegments')]
    return {
        'polls': len(digests),
        'pollsWithAds': len(with_ads),
        'maxAdSegments': max((d['adSegments'] for d in digests), default=0),
        'segmentsPerPoll': sorted({d['segments'] for d in digests}),
        'titles': _union(digests, 'titles'),
        'dateranges': _union(digests, 'dateranges'),
        'rollTypes': _union(digests, 'rollTypes'),
        'adAttributes': _union(digests, 'adAttributes'),
        'daterangeAttributes': {cls: sorted({a for d in digests for a in (d.get('daterangeAttributes') or {}).get(cls, [])})
                                for cls in _union(digests, 'dateranges')},
        'tags': _union(digests, 'tags'),
        'durations': _union(digests, 'durations'),
        'targetDurations': sorted({d['targetDuration'] for d in digests if d.get('targetDuration') is not None}),
        'maxDiscontinuities': max((d.get('discontinuities', 0) for d in digests), default=0),
        'maxPrefetch': max((d.get('prefetch', 0) for d in digests), default=0),
        'segmentHosts': _union(digests, 'segmentHosts'),
        'adSegmentHosts': _union(digests, 'adSegmentHosts'),
    }


def summarize(state):
    server = state.get('server') or []
    # media playlists the player got through Purple's hook (the master it gets is not counted)
    delivered = [d for d in state.get('delivered') or [] if (d.get('playlist') or {}).get('type') == 'media']
    player_urls = {d['url'] for d in delivered}
    media = [s for s in server if (s.get('playlist') or {}).get('type') == 'media']
    masters = [s for s in server if (s.get('playlist') or {}).get('type') == 'master']
    gql = [answer for s in server for answer in (s.get('gql') or [])]
    return {
        'masters': [
            {
                'path': s['url'].split('usher.ttvnw.net', 1)[-1].rsplit('/', 1)[0] + '/<channel>.m3u8' if 'usher.ttvnw.net' in s['url'] else s['url'],
                'status': s['status'],
                'playerType': (s.get('tokenFlags') or {}).get('player_type'),
                'tokenFlags': s.get('tokenFlags'),
                'queryKeys': len(s.get('queryKeys') or []),
                'variants': s['playlist']['variants'],
                'names': s['playlist']['names'],
                'variantHosts': s['playlist']['variantHosts'],
                'tags': s['playlist']['tags'],
            }
            for s in masters
        ],
        'mastersFailed': [{'url': s['url'], 'status': s['status']} for s in server if s['url'].startswith('usher.ttvnw.net') and not s.get('playlist')],
        # media playlists the player requested (the main stream) and the others (Purple's backups)
        'main': media_summary([s['playlist'] for s in media if s['url'] in player_urls]),
        'backups': media_summary([s['playlist'] for s in media if s['url'] not in player_urls]),
        'delivered': media_summary([d['playlist'] for d in delivered]),
        # distinct token answers: playerType, errors and token flags, with how many times each came back
        'tokens': [{**json.loads(key), 'count': n} for key, n in Counter(
            json.dumps({'playerType': a.get('playerType'), 'errors': a['errors'], 'tokenFlags': a.get('tokenFlags')}, sort_keys=True) for a in gql
        ).items()],
        'tokenRequests': dict(Counter(a.get('playerType') or a.get('operation') or '?' for a in gql)),
        'csai': state.get('csai') or [],
    }


def break_recorded(summary):
    """The main stream carried ad segments in at least one poll."""
    return summary['main']['pollsWithAds'] > 0


def one_line(summary):
    masters = ', '.join(f"{'v2' if '/api/v2/' in m['path'] else 'v1'}:{m['playerType']}({m['variants']})" for m in summary['masters'])
    main, backups, delivered = summary['main'], summary['backups'], summary['delivered']
    return (
        f"masters [{masters}] | main {main['pollsWithAds']}/{main['polls']} polls with ads {main['rollTypes'] or ''} | "
        f"backups {backups['pollsWithAds']}/{backups['polls']} | to player {delivered['pollsWithAds']}/{delivered['polls']} | "
        f"tokens {summary['tokenRequests']} | csai {len(summary['csai'])}"
    )
