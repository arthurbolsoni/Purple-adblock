"""L3-07: whitelist changed in the extension's storage while a channel plays (E7, T-602).

extension, `debug` on: a channel from the directory plays with no `whitelisted` event. Its name goes into
chrome.storage.local from the popup page in another tab; the worker then emits `whitelisted` for it on every poll,
with no reload and no ad handling (`adDetected`, `backupUsed`, `segmentsReplaced`). Taking it out of the list stops
the `whitelisted` events.
"""
import lib
from scenarios import Check
from scenarios import common

ID = 'L3-07'
TITLE = 'whitelist changed while a channel plays, without a reload'
MODES = ('extension',)
DEBUG = True
WAIT = 12  # seconds after each storage change; the player polls its media playlist every 2 s
AD_EVENTS = ('adDetected', 'backupUsed', 'segmentsReplaced')


async def run(session):
    tab = session.tab
    channels = await common.directory_channels(session)
    if not channels:
        return [Check('directory lists live channels', False, 'no channel card')]
    channel, outcome, gated = await common.open_channel(session, channels)
    if not channel:
        return [Check('a directory channel plays without the content gate', False, {'gated': gated})]
    name = channel.strip('/').lower()
    await tab.sleep(WAIT)

    added_at = await lib.read(tab, 'Date.now()')
    await lib.set_storage(session, whitelist=[name])
    await tab.sleep(WAIT)
    removed_at = await lib.read(tab, 'Date.now()')
    await lib.set_storage(session, whitelist=[])
    await tab.sleep(WAIT)
    state = await lib.page_state(tab)
    common.observe_server(session, 'whitelist', channel, state)

    events = [e for e in state['events'] or [] if e.get('channel') == name]
    whitelisted = [e['at'] for e in events if e['type'] == 'whitelisted']
    before = [t for t in whitelisted if t < added_at]
    during = [t for t in whitelisted if added_at <= t < removed_at]
    # one poll in flight when the list changes back may still see the old value
    after = [t for t in whitelisted if t >= removed_at + 3000]
    ads_during = [e for e in events if e['type'] in AD_EVENTS and added_at + 3000 <= e['at'] < removed_at]
    video = state['video'] or {}
    detail = {'channel': name, 'outcome': outcome, 'addedAt': added_at, 'removedAt': removed_at, 'whitelisted': whitelisted,
              'events': [{k: e.get(k) for k in ('type', 'at', 'playerType', 'count')} for e in events][-40:]}

    return [
        Check('debug events recorded (window.__purple.events)', state['events'] is not None, detail),
        Check('no whitelisted event before the channel is added', not before, detail),
        Check('whitelisted events after it is added, without a reload', len(during) >= 2 and state['url'].rstrip('/').endswith(channel), detail),
        Check('no ad handling while it is whitelisted', not ads_during, ads_during),
        Check('no whitelisted event once it is removed', not after, detail),
        Check('video playing at the end', video.get('readyState', 0) >= 3 and not video.get('paused', True), {'video': video, 'playerError': state['playerError']}),
    ]
