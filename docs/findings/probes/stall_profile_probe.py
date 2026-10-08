"""Probe, 2026-10-08 (T-806): what in the dedicated level 3 profile lets the player start on playlists rewritten without
ads by a build before T-101, when fresh profiles stall.

    PURPLE_EXTENSION_BUILD=<old build> python docs/findings/probes/stall_profile_probe.py <storage types | none> [loads]

Copies ~/nodriver/profile-edge-purple to a temporary folder (Edge closed), starts Edge with the extension build from
PURPLE_EXTENSION_BUILD on the copy, clears the given storage types of https://www.twitch.tv and https://twitch.tv
(CDP Storage.clearDataForOrigin: comma-separated, for instance `local_storage`, `indexeddb`, `cache_storage`,
`cookies`, or `all`), then opens [loads] live channels from the directory by direct load and prints, for each, whether
the <video> played (readyState 3 or more and currentTime moving after 25 s) and how many media playlists the player got.
"""
import asyncio
import os
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import lib  # noqa: E402
import nodriver as uc  # noqa: E402
from scenarios import common  # noqa: E402

ORIGINS = ('https://www.twitch.tv', 'https://twitch.tv')


async def main(types, loads):
    copy = os.path.join(tempfile.mkdtemp(prefix='purple-stall-'), 'profile')
    shutil.copytree(lib.PROFILE, copy, ignore=shutil.ignore_patterns('Singleton*', 'lockfile', '*.lock'))
    session = await lib.launch('extension', profile=copy)
    try:
        if types != 'none':
            for origin in ORIGINS:
                await session.tab.send(uc.cdp.storage.clear_data_for_origin(origin=origin, storage_types=types))
        channels = await common.directory_channels(session)
        for channel in channels[:loads]:
            await session.navigate(f'https://www.twitch.tv{channel}')
            await session.tab.sleep(25)
            first = await lib.read(session.tab, "(() => { const v = document.querySelector('video'); return v && { readyState: v.readyState, t: v.currentTime } })()") or {}
            await session.tab.sleep(3)
            second = await lib.read(session.tab, "(() => { const v = document.querySelector('video'); return v && { readyState: v.readyState, t: v.currentTime } })()") or {}
            state = await lib.page_state(session.tab)
            media = [s for s in state.get('server') or [] if (s.get('playlist') or {}).get('type') == 'media']
            ads = sum(1 for s in media if (s['playlist'].get('adSegments') or 0) > 0)
            played = (second.get('readyState') or 0) >= 3 and (second.get('t') or 0) > (first.get('t') or 0)
            print(f'clear={types} {channel}: played={played} readyState={second.get("readyState")} media polls={len(media)} with ads={ads}', flush=True)
    finally:
        await session.close()
        shutil.rmtree(os.path.dirname(copy), ignore_errors=True)


asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else 'none', int(sys.argv[2]) if len(sys.argv) > 2 else 2))
