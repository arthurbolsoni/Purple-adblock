"""Probe, 2026-10-08: why the level 3 profile keeps the isolated page's usher request away from CDP Fetch.

    python docs/findings/probes/profile_block_probe.py <profile folder | fresh | strict>

`strict` is a fresh profile whose Preferences hold only enhanced_tracking_prevention.user_pref = 3 (Edge's Strict
tracking prevention). Runs the level 2 page (sim/ scenario l2-01-live, Purple on, e2e/sim.py bridge) on the given profile with Edge's net log
on (--log-net-log), then prints the profile's tracking prevention level (enhanced_tracking_prevention.user_pref in
Preferences), whether the Fetch bridge got the usher request, the video state, and every net log event about
usher.ttvnw.net with its net error.
"""
import asyncio
import json
import os
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import lib  # noqa: E402
import sim  # noqa: E402

NET_ERRORS = {-20: 'ERR_BLOCKED_BY_CLIENT', -105: 'ERR_NAME_NOT_RESOLVED', -2: 'ERR_FAILED', -3: 'ERR_ABORTED', -27: 'ERR_BLOCKED_BY_RESPONSE'}


def tracking_level(profile):
    try:
        prefs = json.load(open(os.path.join(profile, 'Default', 'Preferences'), encoding='utf-8'))
    except OSError:
        return None
    return (prefs.get('enhanced_tracking_prevention') or {}).get('user_pref')


async def main(target):
    fresh = target in ('fresh', 'strict')
    profile = tempfile.mkdtemp(prefix='purple-netlog-') if fresh else os.path.expanduser(target)
    if target == 'strict':
        os.makedirs(os.path.join(profile, 'Default'))
        with open(os.path.join(profile, 'Default', 'Preferences'), 'w', encoding='utf-8') as f:
            json.dump({'enhanced_tracking_prevention': {'user_pref': 3}}, f)
    netlog = os.path.join(tempfile.gettempdir(), f'purple-netlog-{os.getpid()}.json')
    original = lib.browser_args
    lib.browser_args = lambda mode, *a, **k: original(mode, *a, **k) + [f'--log-net-log={netlog}', '--net-log-capture-mode=Default']
    print('profile', profile, 'tracking prevention', tracking_level(profile))
    session = await lib.launch('sim', profile=profile, warm_up=False)
    try:
        async with sim.running('l2-01-live') as s:
            await s.bridge(session.tab)
            await session.navigate(s.page())
            await session.tab.sleep(15)
            video = await lib.read(session.tab, "(() => { const v = document.querySelector('video'); return v && { readyState: v.readyState, currentTime: v.currentTime } })()")
            print('bridged usher', any('usher.ttvnw.net' in u for _, u, _ in s.bridged), 'video', video)
    finally:
        await session.close()
        lib.browser_args = original
        if fresh:
            shutil.rmtree(profile, ignore_errors=True)
    with open(netlog, encoding='utf-8') as f:
        text = f.read()
    log = json.loads(text if text.rstrip().endswith('}') else text.rstrip().rstrip(',') + ']}')
    types = {v: k for k, v in log['constants']['logEventTypes'].items()}
    sources = {}
    for event in log['events']:
        params = event.get('params') or {}
        url = params.get('url', '')
        if 'usher.ttvnw.net' in url:
            sources[event['source']['id']] = url
    seen = set()
    for event in log['events']:
        source = event['source']['id']
        if source not in sources:
            continue
        params = event.get('params') or {}
        error = params.get('net_error')
        line = (types.get(event['type'], event['type']), NET_ERRORS.get(error, error), params.get('blocked_reason'))
        if line not in seen:
            seen.add(line)
            print('  usher event', line)
    print('usher sources in the net log:', len(sources))
    os.remove(netlog)


asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else 'fresh'))
