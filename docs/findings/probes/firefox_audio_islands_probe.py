"""Old audio left in a muxed SourceBuffer when the player starts its timeline again, in Firefox (T-829, 2026-11-07).

Usage: python docs/findings/probes/firefox_audio_islands_probe.py <session folder> [--after S]

Needs a Firefox soak with --moz-log "timestamp,MediaFormatReader:4,MediaSource:4" (mozlog*.moz_log) and the Media
Source log of e2e/mse-hook.js (mse.jsonl). On an fMP4 channel IVS appends both tracks to one SourceBuffer and frees
the buffer behind the playhead with short removals (`remove(2, 2.518)` every 2 s): the video goes up to its next key
frame, the audio only over the range asked, so audio stays behind with no video ("islands"). When the player starts
again (a pause and play, F-28's restart), IVS aborts, moves timestampOffset so the new timeline starts at 0 again, and
appends there, over those islands.

For each change of timestampOffset in the page (mse.jsonl `offset`) this prints:

- the audio buffered ranges of the SourceBuffer that holds audio (TrackBuffersManager `buffered-range` or
  `bufferedRange` lines) just before the first frame appended after the change: their number and their seconds from
  0 on (old audio on the new timeline);
- in the next --after seconds (default 90): the main reader's audio stream id changes (MediaFormatReader: decoding
  audio of another init segment, here the old data's), audio gaps over 5 ms, and Firefox's "Next sample to be played
  got overwritten" for audio (a sample it had read ahead replaced by a new append).
"""
import collections
import datetime
import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import firefox_media_log_probe as medialog  # noqa: E402

TBM = re.compile(r'TrackBuffersManager\[(0x[0-9a-f]+)\]')
AUDIO_RANGES = re.compile(r'audio/\S+ (?:frame:\[\([\d.]+, [\d.]+\)\], buffered-range:|data sz=\d+, .*?bufferedRange=)\[(.*?)\]')
INSERTED_AUDIO = re.compile(r'Inserted audio/\S+ frame')
OVERWRITTEN = re.compile(r'Next sample to be played got overwritten')
RANGE = re.compile(r'\(([\d.]+), ([\d.]+)\)')
LINE = re.compile(r'^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d+) UTC - ')


def ranges(text):
    return [(float(a), float(b)) for a, b in RANGE.findall(text)]


def read_buffers(folder):
    """Per TrackBuffersManager: (wall ms, audio ranges) after each change, the walls of audio inserts and overwrites."""
    states = collections.defaultdict(list)
    inserts = collections.defaultdict(list)
    overwritten = collections.defaultdict(list)
    last_audio = {}
    for path in sorted(glob.glob(f'{folder}/mozlog*.moz_log')):
        for line in open(path, encoding='utf-8', errors='replace'):
            if 'TrackBuffersManager' not in line:
                continue
            m, t = LINE.match(line), TBM.search(line)
            if not m or not t:
                continue
            at, key = medialog.wall(m.group(1)), t.group(1)
            found = AUDIO_RANGES.search(line)
            if found:
                states[key].append((at, ranges(found.group(1))))
                if INSERTED_AUDIO.search(line):
                    inserts[key].append(at)
                last_audio[key] = at
            elif OVERWRITTEN.search(line) and last_audio.get(key) and at - last_audio[key] < 50:
                overwritten[key].append(at)  # right after an audio insert: an audio sample read ahead
    return states, inserts, overwritten


def main(folder, after_s=90.0):
    states, inserts, overwritten = read_buffers(folder)
    if not states:
        print('no TrackBuffersManager audio lines (MediaSource:4 missing?)')
        return
    if not inserts:
        print('no audio frames inserted in the log')
        return
    key = max(inserts, key=lambda k: len(inserts[k]))  # the SourceBuffer that holds the stream's audio
    readers = medialog.read_log(folder, 5000)
    main_reader = max(readers, key=lambda k: readers[k]['outputs'])
    events = sorted(readers[main_reader]['events'])
    changes = [r for r in medialog.rows(f'{folder}/mse.jsonl') if r.get('op') == 'offset' and r.get('scope') == 'page']
    print(f'audio in TrackBuffersManager {key}; {len(changes)} changes of timestampOffset in the page')
    for change in changes:
        at = change['wall']
        first = next((t for t in inserts[key] if t > at), None)
        if first is None:
            continue
        before = [s for s in states[key] if s[0] < first]
        audio = before[-1][1] if before else []
        old = [(a, b) for a, b in audio if b > 0]
        seconds = sum(b - max(a, 0) for a, b in old)
        window = [e for e in events if at <= e[0] <= at + after_s * 1000]
        flips = len([e for e in window if e[1] == 'audio stream id'])
        gaps = [e[2] for e in window if e[1] == 'audio gap']
        over = len([t for t in overwritten[key] if at <= t <= at + after_s * 1000])
        print(f"{medialog.clock(at)} offset {change.get('from')} -> {change.get('offset')}: old audio on the new timeline "
              f"{len(old)} ranges, {seconds:.1f} s (up to {max((b for _, b in old), default=0):.1f} s); next {after_s:.0f} s: "
              f"audio stream id changes {flips}, audio gaps {len(gaps)} ({sum(gaps):.0f} ms), audio read ahead and overwritten {over}")


if __name__ == '__main__':
    args = sys.argv[1:]
    main(args[0], float(args[args.index('--after') + 1]) if '--after' in args else 90.0)
