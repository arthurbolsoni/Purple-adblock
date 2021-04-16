import requests
import json
import re
import argparse
import random
import m3u8
import string

USHER_API = 'http://usher.twitch.tv/api/channel/hls/{channel}.m3u8?player=twitchweb' +\
    '&token={token}&sig={sig}&$allow_audio_only=true&allow_source=true' + \
    '&type=any&p={random}'
TOKEN_API = 'http://api.twitch.tv/api/channels/{channel}/access_token'

def get_token_and_signature(channel,proxy,proxyhttps):
    url = TOKEN_API.format(channel=channel)
    
    request = '{"operationName":"PlaybackAccessToken","extensions":{"persistedQuery":{"version":1,"sha256Hash":"0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"}},"variables":{"isLive":true,"login":"' + channel + '","isVod":false,"vodID":"","playerType":"site"}}'    
    r = requests.post("https://gql.twitch.tv/gql", data = request, headers={"Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko", "Device-ID": ''.join(random.SystemRandom().choice(string.ascii_lowercase + string.ascii_uppercase + string.digits) for _ in range(32))}, proxies={"http": proxy, "https": proxyhttps})
    data = json.loads(r.content)
    print(data)

    sig = data['data']['streamPlaybackAccessToken']['signature']
    token = data['data']['streamPlaybackAccessToken']['value']
    return token, sig

def get_live_stream(channel,proxy,proxyhttps):
    token, sig = get_token_and_signature(channel,proxy,proxyhttps)
    r = random.randint(0,1E7)
    url = USHER_API.format(channel=channel, sig=sig, token=token, random=r)
    return url
    r = requests.get(url, proxies={"http": proxy, "https": proxyhttps})
    m3u8_obj = m3u8.loads(r.text)
    return m3u8_obj

def print_video_urls(m3u8_obj):
    print("Video URLs (sorted by quality):") 
    for p in m3u8_obj.playlists:
        si = p.stream_info
        bandwidth = si.bandwidth/(1024)
        quality = p.media[0].name
        resolution = si.resolution if si.resolution else "?"
        uri = p.uri
        #print(p.stream_info, p.media, p.uri[1])
        txt = "\n{} kbit/s ({}), resolution={}".format(bandwidth, quality, resolution)
        print(txt)
        print(len(txt)*"-")
        print(uri)

if __name__=="__main__":
    parser = argparse.ArgumentParser('get video url of twitch channel')
    parser.add_argument('channel_name')
    args = parser.parse_args()
    m3u8_obj = get_live_stream(args.channel_name)
    print_video_urls(m3u8_obj)

