"""Whether the test browser decodes HEVC in Media Source, and why a channel's master leaves HEVC out (T-824, 2026-10-31).

Usage:
  python docs/findings/probes/hevc_support_probe.py codecs [--vaapi]
  python docs/findings/probes/hevc_support_probe.py masters <session folder>

`codecs` starts the test browser (`PURPLE_BROWSER`, e2e/lib.py, record mode) on a new temporary profile, opens
example.com and prints `MediaSource.isTypeSupported` and `canPlayType` for HEVC (hvc1/hev1 Main and Main 10), AV1 and
AVC, and `mediaCapabilities.decodingInfo` for HEVC 1080p60. `--vaapi` adds Chromium's VA-API decoding flags (run with
`LIBVA_DRIVER_NAME` set for the machine's driver).

`masters` reads a soak's playlists.jsonl and prints, per channel and master path (v1 Purple, v2 the page), the variants
in `com.amazon.ivs.unavailable-media` (name, codec family, filter and authorization reasons) and whether an HEVC variant
is listed.
"""
import asyncio
import base64
import collections
import json
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))

TYPES = {
    'hevc main hvc1': 'video/mp4; codecs="hvc1.1.6.L93.B0"',
    'hevc main hev1': 'video/mp4; codecs="hev1.1.6.L150.90"',
    'hevc main 10': 'video/mp4; codecs="hvc1.2.4.L153.B0"',
    'av1': 'video/mp4; codecs="av01.0.08M.08"',
    'avc': 'video/mp4; codecs="avc1.4D401F"',
}
VAAPI = ['--enable-features=VaapiVideoDecoder,VaapiVideoDecodeLinuxGL,VaapiIgnoreDriverChecks,AcceleratedVideoDecodeLinuxGL,PlatformHEVCDecoderSupport',
         '--ignore-gpu-blocklist', '--enable-gpu', '--use-gl=angle', '--use-angle=gl']


async def codecs(vaapi):
    import lib
    if vaapi:
        base = lib.browser_args
        lib.browser_args = lambda *a, **k: base(*a, **k) + VAAPI
    session = await lib.launch('record', profile=tempfile.mkdtemp(prefix='purple-hevc-'))
    try:
        await session.navigate('https://example.com/')
        support = await lib.read(session.tab, '(() => { const v = document.createElement("video"); return Object.fromEntries(Object.entries(%s).map(([k, t]) => [k, { mse: MediaSource.isTypeSupported(t), video: v.canPlayType(t) }])); })()' % json.dumps(TYPES))
        for name, value in support.items():
            print(f"{name:16} MediaSource {value['mse']!s:5}  canPlayType {value['video'] or '-'}")
        info = await lib.read(session.tab, "navigator.mediaCapabilities.decodingInfo({type: 'media-source', video: {contentType: %s, width: 1920, height: 1080, bitrate: 6000000, framerate: 60}}).then(r => ({supported: r.supported, smooth: r.smooth}))" % json.dumps(TYPES['hevc main hvc1']))
        print('decodingInfo hevc 1080p60', info)
    finally:
        await session.close()


def masters(folder):
    seen = collections.Counter()
    for line in open(os.path.join(folder, 'playlists.jsonl'), encoding='utf-8'):
        p = json.loads(line)
        m = re.search(r'DATA-ID="com.amazon.ivs.unavailable-media",VALUE="([^"]+)"', p.get('text') or '')
        if not m:
            continue
        left = tuple((v.get('IVS_NAME'), (v.get('CODECS') or '').split('.')[0], tuple(v.get('FILTER_REASONS') or []), tuple(v.get('AUTHORIZATION_REASONS') or []))
                     for v in json.loads(base64.b64decode(m.group(1))))
        listed = bool(re.search(r'CODECS="(hvc1|hev1)', p['text']))
        seen[(p.get('channel'), 'v2' if '/api/v2/' in p.get('url', '') else 'v1', left, listed)] += 1
    for (channel, path, left, listed), n in seen.items():
        print(f'{channel} {path} x{n}: HEVC listed {listed}')
        for name, family, filters, authorization in left:
            print(f'  left out {name} {family} {list(filters)} {list(authorization)}')


if __name__ == '__main__':
    if sys.argv[1] == 'codecs':
        asyncio.run(codecs('--vaapi' in sys.argv[2:]))
    else:
        masters(sys.argv[2])
