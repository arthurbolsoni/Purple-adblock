"""L3-08: client-side ads (F-04). The directory page requests edge.ads.twitch.tv right after it loads (B-025).

extension, userscript: no request to edge.ads.twitch.tv leaves the page; with `debug` on (extension), Purple's
csaiBlocked events show it answered them. record (Purple off): the control, the requests do leave the page.
"""
import json

import lib
import twitch_selectors as sel
from scenarios import Check
from scenarios import common

ID = 'L3-08'
TITLE = 'client-side ads: edge.ads.twitch.tv from the directory page'
MODES = ('extension', 'userscript')
DEBUG = True
WAIT = 8  # seconds after the directory cards show up


async def run(session):
    tab = session.tab
    await session.navigate(common.TWITCH + common.DIRECTORY)
    cards = await lib.wait_for(tab, f'!!document.querySelector({json.dumps(sel.DIRECTORY_CARD)})')
    await tab.sleep(WAIT)
    state = await lib.page_state(tab)
    summary = common.observe_server(session, 'directory', common.DIRECTORY, state)
    requests = summary['csai']
    blocked = [e for e in state['events'] or [] if e.get('type') == 'csaiBlocked']

    checks = [Check('the directory page shows channel cards', bool(cards))]
    if session.mode == 'record':
        return checks + [Check('control: without Purple the page requests edge.ads.twitch.tv', bool(requests), requests)]
    checks.append(Check('no request to edge.ads.twitch.tv left the page', not requests, requests))
    if state['events'] is None:
        checks.append(Check('csaiBlocked events (needs debug)', True, 'debug off in this mode', skipped=True))
    else:
        checks.append(Check('Purple answered the edge.ads.twitch.tv requests (csaiBlocked events)', bool(blocked), blocked))
    return checks
