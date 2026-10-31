"""An MPRIS Pause sent to the browser of a level 2 run, the way a desktop's media keys reach it (T-828, 2026-10-31).

Usage: PURPLE_BROWSER=/opt/brave-bin/brave python docs/findings/probes/mpris_pause_probe.py [--media-keys]
       [--no-purple] [--play-after S]

Linux only (D-Bus session bus, busctl and dbus-send). Starts the browser like the level 2 runs (lib.launch in `sim`
mode, headless, --mute-audio, a new temporary profile), loads the isolated page with sim/'s clean live scenario
(l2-01-live) and unmutes the IVS player: the isolated page starts it muted, Chromium puts only players with sound on
MPRIS, and Twitch's page played unmuted in the soaks. After 15 s of playback it sends org.mpris.MediaPlayer2.Player.Pause
to the MPRIS name the browser registered (the name that was not on the bus before the launch); with --play-after S,
Play S seconds later. Prints, one line per second, the <video>'s paused state and currentTime and the IVS player's
buffer, then the pause/play/create/delete messages between the page and each player worker, with their time from the
Pause.

lib.browser_args disables HardwareMediaKeyHandling since T-828, and the browser registers no MPRIS name; --media-keys
takes it out of the flags, as before T-828.
"""
import asyncio
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'e2e'))
import lib  # noqa: E402
import sim  # noqa: E402

BEFORE, AFTER = 15, 20


def mpris_names():
    out = subprocess.run(['busctl', '--user', 'list', '--no-legend'], capture_output=True, text=True).stdout
    return {line.split()[0] for line in out.splitlines() if line.startswith('org.mpris.MediaPlayer2.')}


def send(name, method):
    subprocess.run(['dbus-send', '--session', '--type=method_call', f'--dest={name}', '/org/mpris/MediaPlayer2',
                    f'org.mpris.MediaPlayer2.Player.{method}'], check=True)


VIDEO = ("(() => { const v = document.querySelector('video'), p = window.__player; return v && { paused: v.paused, "
         "currentTime: Math.round(v.currentTime * 10) / 10, buffer: p ? Math.round(p.getBufferDuration() * 10) / 10 : null } })()")


async def main(purple=True, play_after=None):
    before = mpris_names()
    profile = tempfile.mkdtemp(prefix='purple-mpris-')
    session = await lib.launch('sim', profile=profile)
    try:
        async with sim.running('l2-01-live') as s:
            await s.bridge(session.tab)
            await session.navigate(s.page(purple=purple))
            await lib.wait_for(session.tab, '!!window.__player')
            await lib.read(session.tab, '(window.__player.setMuted(false), true)')
            for second in range(BEFORE):
                await session.tab.sleep(1)
                print(f'{second - BEFORE:+4d} s', json.dumps(await lib.read(session.tab, VIDEO)))
            names = sorted(mpris_names() - before)
            print('MPRIS names the browser registered:', names)
            if not names:
                return
            origin = await lib.read(session.tab, 'performance.now()')
            send(names[0], 'Pause')
            print('  0 s  Pause sent')
            for second in range(1, AFTER + 1):
                if play_after is not None and second == play_after:
                    send(names[0], 'Play')
                    print(f'{second:+4d} s  Play sent')
                await session.tab.sleep(1)
                print(f'{second:+4d} s', json.dumps(await lib.read(session.tab, VIDEO)))
            state = await lib.page_state(session.tab)
            for index, worker in enumerate(state.get('workers') or []):
                for m in worker.get('messages') or []:
                    if m.get('funcName') in ('pause', 'play', 'create', 'delete') or m.get('type') in ('pause', 'play'):
                        side = f"page -> worker {m['funcName']} id {m.get('id')}" if m.get('to') else f"worker -> page {m['type']}"
                        print(f"worker {index} {(m['at'] - origin) / 1000:+7.2f} s  {side}")
    finally:
        await session.close()
        shutil.rmtree(profile, ignore_errors=True)


if __name__ == '__main__':
    args = sys.argv[1:]
    if '--media-keys' in args:
        flags = lib.browser_args
        lib.browser_args = lambda mode, *rest: [a.replace(',HardwareMediaKeyHandling', '') for a in flags(mode, *rest)]
    asyncio.run(main(purple='--no-purple' not in args,
                     play_after=int(args[args.index('--play-after') + 1]) if '--play-after' in args else None))
