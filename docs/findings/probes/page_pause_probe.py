"""Pauses the page sent a player on its own, per soak session (T-828, 2026-10-31).

Usage: python docs/findings/probes/page_pause_probe.py <recordings folder> [<recordings folder> ...]

Reads each session under the folders (<folder>/<session>/samples.jsonl and log.jsonl of e2e/soak.py): the messages
between the page and each player worker that e2e/recorder.js logs (create, delete, pause, play, and the pause/play
requests Purple's worker posts). Lists every `pause` the page sent a player that did not answer a `pause` request from
Purple's worker (within 50 ms) and did not come within 3 s of the page creating that player (the page pauses a player
it has just created and plays it once it loads). For each: wall time, the session's mode, channel, worker, player id,
the seconds until the page's next `play` to that player (none: no play before the soak left the channel), and the
break starts and ends of that channel within 4 minutes.
"""
import datetime
import glob
import json
import os
import sys

FROM_PURPLE_MS = 50
AFTER_CREATE_MS = 3000
BREAKS_WITHIN_MS = 240000


def rows(path):
    try:
        return [json.loads(line) for line in open(path, encoding='utf-8')]
    except FileNotFoundError:
        return []


def clock(ms):
    return datetime.datetime.fromtimestamp(ms / 1000).strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]


def session_pauses(folder):
    log = rows(os.path.join(folder, 'log.jsonl'))
    mode = next((r.get('mode') for r in log if r.get('note') == 'launched'), '?')
    breaks = [r for r in log if r.get('note') in ('break start', 'stitched break start', 'break end') and r.get('at')]
    loads = {}
    for r in rows(os.path.join(folder, 'samples.jsonl')):
        if r.get('workers') is not None:
            # the recorder's worker list grows during a load: its last sample has every message
            loads[(r.get('channel'), r.get('load'))] = (r.get('timeOrigin'), r['workers'])
    for (channel, load), (origin, workers) in loads.items():
        for index, worker in enumerate(workers):
            messages = worker.get('messages') or []
            for i, m in enumerate(messages):
                if m.get('to') != 'worker' or m.get('funcName') != 'pause':
                    continue
                if any(x.get('from') == 'worker' and x.get('type') == 'pause' and abs(x['at'] - m['at']) < FROM_PURPLE_MS for x in messages):
                    continue
                created = [x['at'] for x in messages if x.get('funcName') == 'create' and x.get('id') == m.get('id') and x['at'] <= m['at']]
                if created and m['at'] - max(created) < AFTER_CREATE_MS:
                    continue
                play = next((x for x in messages[i + 1:] if x.get('to') == 'worker' and x.get('funcName') == 'play' and x.get('id') == m.get('id')), None)
                wall = origin + m['at']
                near = [f"{b['note']} {b.get('kind') or ''} {b['at'][11:19]}".replace('  ', ' ') for b in breaks if b.get('channel') == channel
                        and abs(datetime.datetime.fromisoformat(b['at']).timestamp() * 1000 - wall) < BREAKS_WITHIN_MS]
                yield (wall, mode, channel, load, index, m.get('id'), round((play['at'] - m['at']) / 1000, 1) if play else None, near)


def main(folders):
    for top in folders:
        for folder in sorted(glob.glob(os.path.join(os.path.expanduser(top), '*', ''))):
            name = os.path.basename(os.path.dirname(folder))
            found = list(session_pauses(folder))
            print(f'== {name}: {len(found)} page pauses')
            for wall, mode, channel, load, index, player, play, near in found:
                print(f"  {clock(wall)} {mode} {channel} load {load} worker {index} player {player} "
                      f"play after {play if play is not None else 'none'} s; breaks: {'; '.join(near) or 'none'}")


if __name__ == '__main__':
    main(sys.argv[1:])
