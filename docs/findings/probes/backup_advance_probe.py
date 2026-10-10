"""Whether backup tokens' playlists move while the page's playlist of the same channel stands still (B-055, T-821,
2026-10-09).

Usage: python docs/findings/probes/backup_advance_probe.py <channel> <minutes> <output.jsonl> [player types]

Outside any browser: asks a PlaybackAccessToken for each player type (default site, popout, embed) through GQL with
the web client's public Client-ID, loads usher's master and the 720p (or the best) variant, then polls each variant's
media playlist every 2 s for <minutes>, writing per poll: wall time, type, status, MEDIA-SEQUENCE, segment count and the
newest segment's PROGRAM-DATE-TIME. A token that stops working is asked again. No token, signature or URL is written.
Compare with a soak session on the same channel (its delivered.jsonl and player error) for the times its page
playlist stood still.
"""
import json
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'  # twitch.tv's public web client
QUERY = ('query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!, '
         '$platform: String!) { streamPlaybackAccessToken(channelName: $login, params: {platform: $platform, playerBackend: "mediaplayer", '
         'playerType: $playerType}) @include(if: $isLive) { value signature __typename } videoPlaybackAccessToken(id: $vodID, params: '
         '{platform: $platform, playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) { value signature __typename }}')


def fetch(url, data=None, headers=None):
    request = urllib.request.Request(url, data=data, headers=headers or {}, method='POST' if data else 'GET')
    with urllib.request.urlopen(request, timeout=10) as response:
        return response.status, response.read().decode('utf-8', 'replace')


def variant_url(channel, player_type):
    body = json.dumps({'operationName': 'PlaybackAccessToken_Template', 'query': QUERY,
                       'variables': {'isLive': True, 'login': channel, 'isVod': False, 'vodID': '', 'playerType': player_type, 'platform': 'web'}})
    _, text = fetch('https://gql.twitch.tv/gql', body.encode(), {'Client-ID': CLIENT_ID, 'Content-Type': 'text/plain;charset=UTF-8'})
    token = json.loads(text)['data']['streamPlaybackAccessToken']
    query = urllib.parse.urlencode({'token': token['value'], 'sig': token['signature'], 'allow_source': 'true', 'fast_bread': 'true',
                                    'player_backend': 'mediaplayer', 'playlist_include_framerate': 'true', 'p': random.randint(0, 9999999)})
    _, master = fetch(f'https://usher.ttvnw.net/api/v2/channel/hls/{channel}.m3u8?{query}')
    lines = master.splitlines()
    variants = []
    for i, line in enumerate(lines):
        if line.startswith('#EXT-X-STREAM-INF:') and i + 1 < len(lines):
            resolution = re.search(r'RESOLUTION=(\d+x\d+)', line)
            variants.append((resolution.group(1) if resolution else '?', lines[i + 1].strip()))
    for name, url in variants:
        if name == '1280x720':
            return name, url
    return variants[0] if variants else (None, None)


def main(channel, minutes, output, types):
    channel = channel.strip('/').lower()
    urls = {}
    end = time.time() + minutes * 60
    with open(output, 'a', encoding='utf-8') as out:
        while time.time() < end:
            for player_type in types:
                record = {'wall': round(time.time() * 1000), 'type': player_type}
                try:
                    if player_type not in urls:
                        urls[player_type] = variant_url(channel, player_type)
                    name, url = urls[player_type]
                    record['variant'] = name
                    status, text = fetch(url)
                    record['status'] = status
                    sequence = re.search(r'#EXT-X-MEDIA-SEQUENCE:(\d+)', text)
                    dates = re.findall(r'#EXT-X-PROGRAM-DATE-TIME:(\S+)', text)
                    record.update({'seq': int(sequence.group(1)) if sequence else None, 'segments': text.count('#EXTINF'),
                                   'newestDate': dates[-1] if dates else None, 'ads': text.count('stitched-ad')})
                except (urllib.error.URLError, KeyError, TypeError, ValueError, json.JSONDecodeError) as err:
                    record['error'] = str(err)[:120]
                    urls.pop(player_type, None)
                out.write(json.dumps(record) + '\n')
                out.flush()
            time.sleep(2)


if __name__ == '__main__':
    main(sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4].split(',') if len(sys.argv) > 4 else ['site', 'popout', 'embed'])
