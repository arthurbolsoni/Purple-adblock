"""Shared steps of the level 2 scenarios (docs/tests.md, "Level 2"): sim/ with a scenario loaded, the Fetch bridge on
the session's tab, the isolated page, a watch with one video sample per second, and what each side recorded.
"""
import os
import urllib.parse
from dataclasses import dataclass, field

import lib
import sim
from scenarios import Check


@dataclass
class Watch:
    state: dict
    page: dict  # window.__l2: steps, tokenPlayerType, states, errors
    log: dict  # sim/'s /_sim/log: sessions and requests
    samples: list = field(default_factory=list)
    bridge_errors: list = field(default_factory=list)
    bridged: int = 0

    def requests(self, host=None, path=None):
        return [e for e in self.log['log'] if (host is None or e['host'] == host) and (path is None or e['path'].startswith(path))]

    def ad_segments_requested(self):
        return [e['url'] for e in self.requests(path='/v1/segment/') if e.get('ad')]

    def token_requests(self):
        """GQL PlaybackAccessToken calls sim/ answered, as (playerType, persisted hash or full query)."""
        import json
        calls = []
        for e in self.requests(host='gql.twitch.tv', path='/gql'):
            body = e.get('body')
            if body is None:
                continue
            ops = body if isinstance(body, list) else [body]
            for op in ops:
                if str(op.get('operationName', '')).startswith('PlaybackAccessToken'):
                    calls.append((op.get('variables', {}).get('playerType'), 'hash' if 'query' not in op else 'query'))
        return calls

    def events(self, kind=None):
        return [e for e in self.state['events'] or [] if kind is None or e.get('type') == kind]

    def worker_pauses(self):
        """`pause` messages the workers posted (E6, the break edges)."""
        return [m for w in self.state['workers'] or [] for m in w.get('messages') or [] if m.get('from') == 'worker' and m.get('type') == 'pause']


async def watch(session, scenario, seconds, purple=True, extra=''):
    # L2_SETTINGS: JSON added to the settings the isolated page sends Purple, for instance {"pausePlayOnBreaks": false}
    if os.environ.get('L2_SETTINGS'):
        extra += '&settings=' + urllib.parse.quote(os.environ['L2_SETTINGS'])
    async with sim.running(scenario) as s:
        await s.bridge(session.tab)
        await session.navigate(s.page(purple=purple, extra=extra))
        samples = []
        for _ in range(seconds):
            await session.tab.sleep(1)
            # buffer and latency: the IVS player's own readings (window.__player on the isolated page)
            video = await lib.read(session.tab, "(() => { const v = document.querySelector('video'), p = window.__player; return v && { readyState: v.readyState, currentTime: Math.round(v.currentTime * 10) / 10, paused: v.paused, buffer: p ? Math.round(p.getBufferDuration() * 10) / 10 : null, latency: p ? Math.round(p.getLiveLatency() * 10) / 10 : null, lowLatency: p ? p.isLiveLowLatency() : null } })()")
            samples.append(video or {})
        state = await lib.page_state(session.tab)
        page = await lib.read(session.tab, 'window.__l2 || null') or {}
        return Watch(state=state, page=page, log=s.log(), samples=samples, bridge_errors=s.errors, bridged=len(s.bridged))


def base_checks(w, purple=True):
    last, before = (w.samples[-1] if w.samples else {}), (w.samples[-4] if len(w.samples) >= 4 else {})
    checks = [
        Check('page: integrity, token and player load ran, no page error', w.page.get('steps') == ['integrity', 'token', 'load'] and not w.page.get('errors'),
              {'steps': w.page.get('steps'), 'errors': w.page.get('errors')}),
        Check('every Twitch request answered by sim/ through the bridge', w.bridged > 0 and not w.bridge_errors, {'bridged': w.bridged, 'errors': w.bridge_errors[:5]}),
        Check('video playing at the end', (last.get('readyState') or 0) >= 3 and not last.get('paused', True) and (last.get('currentTime') or 0) > (before.get('currentTime') or 0),
              {'last': last, 'samples': w.samples[-6:]}),
    ]
    if purple:
        checks.append(worker_check(w.state))
    return checks


def worker_check(state):
    """The SDK's worker is the page's only worker; unlike Twitch's, its script does not end with its own URL, so
    common.worker_check's filter does not apply here."""
    workers = state['workers'] or []
    summary = [{k: x.get(k) for k in ('at', 'viaInjector', 'purpleCode', 'purpleBoot', 'size', 'errors')} for x in workers]
    return Check('isolated page: the SDK worker through the injector, running Purple, boot message seen',
                 bool(workers) and all(x['viaInjector'] and x['purpleCode'] is True and x['purpleBoot'] for x in workers),
                 {'workers': summary, 'hookAt': state['hookAt']})
