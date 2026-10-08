"""L3-13: which player reload at the end of a break brings a new preroll (T-808, B-045, Q-018), fresh profile, logged out.

extension, `debug` on, Purple's own reload off (`reloadAfterAd` false). When a break Purple handled ends (no
`adDetected` for END_QUIET ms), the scenario itself reloads Twitch's player from the page, the way F-15 finds it
(serviceWorker/src/page/player-reload.ts), with the kind from the environment variable PURPLE_RELOAD_KIND:

- `soft`: `setSrc({isNewMediaPlayerInstance: false, refreshAccessToken: false})` right away (F-15's reload);
- `soft-late`: the same, LATE_MS after the break ended;
- `token`: `setSrc({isNewMediaPlayerInstance: false, refreshAccessToken: true})`, a new access token;
- `instance`: `setSrc({isNewMediaPlayerInstance: true, refreshAccessToken: true})`, a new player and token.

After the reload it watches AFTER seconds and records whether the main playlist had ad segments again (a new break)
and the roll type. Checks: Purple in every player worker, the video playing at the end, no player error. A load
without a break, or whose break did not end in time, skips the reload.
"""
import json
import os

import lib
from scenarios import Check
from scenarios import common

ID = 'L3-13'
TITLE = 'player reload kinds at the end of a break and new prerolls (PURPLE_RELOAD_KIND), fresh profile'
MODES = ('extension',)
FRESH_PROFILE = True
DEBUG = True
WAIT_BREAK = 90   # seconds to wait for a break to start and end
END_QUIET = 4000  # ms without adDetected for the break to count as over
LATE_MS = 15000
AFTER = 40        # seconds watched after the reload

KINDS = {
    'soft': ({'isNewMediaPlayerInstance': False, 'refreshAccessToken': False}, 0),
    'soft-late': ({'isNewMediaPlayerInstance': False, 'refreshAccessToken': False}, LATE_MS),
    'token': ({'isNewMediaPlayerInstance': False, 'refreshAccessToken': True}, 0),
    'instance': ({'isNewMediaPlayerInstance': True, 'refreshAccessToken': True}, 0),
}

# the lookup of serviceWorker/src/page/player-reload.ts (from Brave's scriptlet, see the license notice there)
RELOAD = """(() => {
  const find = (root, constraint) => {
    if (root.stateNode && constraint(root.stateNode)) return root.stateNode;
    for (let node = root.child; node; node = node.sibling) { const found = find(node, constraint); if (found) return found; }
    return null;
  };
  const el = document.querySelector('#root');
  let root = el && el._reactRootContainer && el._reactRootContainer._internalRoot && el._reactRootContainer._internalRoot.current;
  if (!root && el) { const key = Object.keys(el).find((x) => x.startsWith('__reactContainer') || x.startsWith('__reactFiber')); if (key) root = el[key]; }
  if (!root) return { ok: false, why: 'no root' };
  const state = find(root, (n) => n.setSrc && n.setInitialPlaybackSettings);
  if (!state) return { ok: false, why: 'no player state' };
  const holder = find(root, (n) => n.setPlayerActive && n.props && n.props.mediaPlayerInstance);
  const instance = holder && holder.props && holder.props.mediaPlayerInstance;
  const player = (instance && instance.playerInstance) || instance;
  const group = player && player.core && player.core.state && player.core.state.quality && player.core.state.quality.group;
  if (group) localStorage.setItem('video-quality', JSON.stringify({ default: group }));
  state.setSrc(%s);
  try { player && player.play && player.play().catch(() => {}); } catch (e) {}
  return { ok: true, at: Date.now() };
})()"""


def main_ads_after(state, at):
    """Main media playlists polled after `at`: how many had ad segments, and their roll types."""
    delivered = {d['url'] for d in state.get('delivered') or [] if (d.get('playlist') or {}).get('type') == 'media'}
    main = [s for s in state.get('server') or [] if s['url'] in delivered and (s.get('playlist') or {}).get('type') == 'media' and (s.get('wall') or 0) > at]
    with_ads = [s for s in main if (s['playlist'].get('adSegments') or 0) > 0]
    return {'polls': len(main), 'pollsWithAds': len(with_ads), 'firstAdAt': with_ads[0]['wall'] if with_ads else None,
            'rollTypes': sorted({r for s in with_ads for r in s['playlist'].get('rollTypes') or []})}


async def run(session):
    tab = session.tab
    kind = os.environ.get('PURPLE_RELOAD_KIND', 'soft')
    options, delay = KINDS[kind]
    await lib.set_storage(session, reloadAfterAd=False)
    channels = await common.directory_channels(session)
    channel, outcome, gated = await common.open_channel(session, channels, shuffle=True)
    if not channel:
        return [Check('a directory channel plays without the content gate', False, {'gated': gated})]

    ended = None
    for _ in range(WAIT_BREAK):
        events = await lib.read(tab, '(window.__purple && window.__purple.events || []).filter((e) => e.type === "adDetected").map((e) => e.at)')
        now = await lib.read(tab, 'Date.now()')
        if events and now - events[-1] >= END_QUIET:
            ended = events[-1]
            break
        await tab.sleep(1)
    detail = {'channel': channel, 'outcome': outcome, 'kind': kind, 'breakEnded': ended}
    if ended is None:
        state = await lib.page_state(tab)
        common.observe_server(session, 'direct load', channel, state)
        return [common.worker_check('direct load', state),
                Check('a break handled by Purple ended within the wait', True, detail, skipped=True)]

    if delay:
        await tab.sleep(delay / 1000)
    reload = await lib.read(tab, RELOAD % json.dumps(options))
    detail['reload'] = reload
    samples = []
    for _ in range(AFTER):
        state = await lib.page_state(tab)
        video = state['video'] or {}
        samples.append({'readyState': video.get('readyState'), 'currentTime': video.get('currentTime'), 'paused': video.get('paused'),
                        'playerError': state['playerError'], 'adOverlay': state['adOverlay']})
        await tab.sleep(1)
    state = await lib.page_state(tab)
    common.observe_server(session, 'direct load', channel, state)
    at = (reload or {}).get('at') or 0
    detail['afterReload'] = main_ads_after(state, at)
    detail['adDetectedAfterReload'] = sum(1 for e in state['events'] or [] if e['type'] == 'adDetected' and e['at'] > at)
    detail['adOverlayAfterReload'] = sum(1 for s in samples if s['adOverlay'])
    last = samples[-1]
    return [
        common.worker_check('direct load', state),
        Check('the page found the player and reloaded it', bool(reload and reload.get('ok')), detail),
        Check('video playing at the end', (last['readyState'] or 0) >= 3 and not last['paused'] and (last['currentTime'] or 0) > (samples[-4]['currentTime'] or 0), detail),
        Check('no player error after the reload', not any(s['playerError'] for s in samples), [s['playerError'] for s in samples if s['playerError']][:3]),
        Check('new break after the reload (observation)', True, detail),
    ]
