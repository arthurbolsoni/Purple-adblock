"""L3-03: soak, one live channel from the directory for 20 minutes (TR-002), recorded like e2e/soak.py.

Recordings go to ~/purple-recordings/<date>-l3-03/<time>/ and are read back with e2e/soak_report.py. Checks: the
player kept progressing (no error or stall that lasted until the end); every break recorded on the main stream
reached the player without ad segments (a backup, a merge or blank segments took their place). Without a break the
ad check is skipped. Longer runs, several sessions and Purple off: e2e/soak.py.
"""
import asyncio
import datetime
import os
import time

import soak
import soak_report
from scenarios import Check

ID = 'L3-03'
TITLE = 'soak: one channel for 20 minutes'
MODES = ('extension',)
FRESH_PROFILE = True
DEBUG = True

MINUTES = 20


async def run(session):
    now = datetime.datetime.now()
    directory = os.path.join(soak.RECORDINGS, f'{now.date().isoformat()}-l3-03', now.strftime('%H%M%S'))
    recorder = soak.Recorder(directory)
    try:
        recorder.note('launched', mode=session.mode, debug=DEBUG)
        watch = await soak.open_next(session, recorder, set(), 0, 1)
        if not watch:
            return [Check('a directory channel plays without the content gate', False)]
        end = time.time() + MINUTES * 60
        while time.time() < end:
            await asyncio.sleep(soak.DRAIN)
            await soak.drain(session, recorder, watch, session.mode)
        failing = watch.failing_since is not None
    finally:
        recorder.close()

    report = soak_report.session_report(directory)
    watched = report['watch'][0]
    checks = [Check('player progressing at the end (no error or stall left)', not failing,
                    {'channel': watch.channel, 'watch': watched, 'recordings': directory})]
    if not report['breaks']:
        return checks + [Check('breaks reached the player without ad segments', True, 'no break recorded', skipped=True)]
    for b in report['breaks']:
        to_player = (b['toPlayer'] or {}).get('kinds', {})
        ad_media = (b['toPlayer'] or {}).get('adMedia') or {}
        # ad segments Purple answers with the blank segment (T-502) stay listed but never reach the network
        checks.append(Check(f"break at {b['start']} ({b['kind']}, {b['roll']}) reached the player without ad media",
                            not to_player.get('SSAI') or ad_media.get('fromNetwork') == 0,
                            {k: b[k] for k in ('seconds', 'pollKinds', 'maxAdSegments', 'backups', 'toPlayer', 'adOverlaySeconds',
                                               'notProgressingSeconds', 'purpleEvents')}))
    return checks
