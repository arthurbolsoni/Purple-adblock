"""What the isolated player gets around a break's switch to a backup, at level 2 (T-815, 2026-10-09).

Usage: python docs/findings/probes/l2_switch_probe.py <sim scenario> [settings JSON] [output.json]

Starts Edge in sim mode on a new fresh profile, runs `level2.watch` on the scenario for 65 s (Purple's settings from the
second argument, as L2_SETTINGS), and prints in order of `sim/`'s clock (ms since the scenario was loaded, about the
time since the page opened):
- every usher, media playlist and segment request `sim/` answered: the token session and playerType, the variant and
  the segment's global number (`live/<g>`) or ad position;
- each second's <video> currentTime and the SDK player's buffer;
- the playlists the player got from Purple's hook (last 60): MEDIA-SEQUENCE, the session and number of the last
  segment and of each prefetch URI;
- Purple's events (backupUsed, adDetected, blankInserted).
The raw data goes to output.json when given.
"""
import asyncio
import json
import os
import re
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import lib  # noqa: E402
from scenarios import level2  # noqa: E402

SEGMENT = re.compile(r'/v1/segment/(\d+)/([^/]+)/(live|ad)/([^/.]+)')


def seg(uri):
    m = SEGMENT.search(uri or '')
    return f's{m.group(1)}:{m.group(4)}' if m else '?'


def digest(text):
    lines = text.splitlines()
    sequence = next((l.split(':')[1] for l in lines if l.startswith('#EXT-X-MEDIA-SEQUENCE:')), '?')
    uris = [lines[i + 1] for i, l in enumerate(lines) if l.startswith('#EXTINF') and i + 1 < len(lines)]
    prefetch = [l.split(':', 1)[1] for l in lines if l.startswith('#EXT-X-TWITCH-PREFETCH:')]
    return f"seq={sequence} segments={len(uris)} last={seg(uris[-1]) if uris else '-'} prefetch={[seg(p) for p in prefetch]}"


async def main(scenario, settings, output):
    if settings:
        os.environ['L2_SETTINGS'] = settings
    profile = tempfile.mkdtemp(prefix='purple-e2e-fresh-')
    session = await lib.launch('sim', profile=profile)
    try:
        w = await level2.watch(session, scenario, 65)
    finally:
        await session.close()
        shutil.rmtree(profile, ignore_errors=True)

    rows = []
    for e in w.log['log']:
        path = e['path']
        if e['host'] == 'usher.ttvnw.net':
            rows.append((e['at'], 'USHER', f"session {e.get('session')} playerType {e.get('player_type')}"))
        elif path.endswith('.m3u8'):
            rows.append((e['at'], 'PLAYLIST', f"session {e.get('session')} {path[-30:]}"))
        elif '/v1/segment/' in path:
            rows.append((e['at'], 'SEGMENT', f"{seg(path)} {path.split('/')[4]}{' AD' if e.get('ad') else ''}"))
    for i, s in enumerate(w.samples):
        rows.append(((i + 1) * 1000, 'VIDEO', f"t={s.get('currentTime')} buffer={s.get('buffer')}"))
    for p in w.state.get('playlists') or []:
        rows.append((p.get('at'), 'DELIVERED', digest(p.get('text') or '')))
    for e in w.state.get('events') or []:
        rows.append((e.get('at'), 'EVENT', json.dumps({k: v for k, v in e.items() if k != 'at'})))
    # page times (performance.now) and sim/ times (since the scenario was loaded) differ by the time it took to open
    # the page; both are printed as they are, page ones marked
    for at, kind, text in sorted(rows, key=lambda r: (r[0] or 0)):
        mark = 'page' if kind in ('DELIVERED', 'EVENT') else 'sim '
        print(f"{(at or 0) / 1000:7.2f} {mark} {kind.ljust(9)} {text}")
    if output:
        with open(output, 'w', encoding='utf-8') as f:
            json.dump({'log': w.log, 'samples': w.samples, 'state': w.state}, f, default=str)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else '', sys.argv[3] if len(sys.argv) > 3 else ''))
