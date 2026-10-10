"""Steps shared by the level 3 scenarios."""
import json
import random

import lib
import server
import twitch_selectors as sel
from scenarios import Check

TWITCH = 'https://www.twitch.tv'
DIRECTORY = '/directory/all'
CANDIDATES = 8  # channels tried until one plays without the content classification gate
SETTLE = 25     # seconds for the player to start, fail or show the gate

# a Twitch player worker runs importScripts('https://assets.twitch.tv/assets/amazon-ivs-wasmworker.min-<hash>.js')
PLAYER_WORKER = 'amazon-ivs-wasmworker'

SETTLED = f"""(() => {{
  const v = document.querySelector('video');
  if (document.querySelector({json.dumps(sel.CONTENT_GATE)})) return 'gate';
  if (document.querySelector({json.dumps(sel.PLAYER_ERROR)})) return 'error';
  if (v && v.readyState >= 3 && !v.paused) return 'playing';
  return null;
}})()"""

CARDS = f"[...document.querySelectorAll({json.dumps(sel.DIRECTORY_CARD)})].map(a => a.getAttribute('href'))"


async def directory_channels(session):
    await session.navigate(TWITCH + DIRECTORY)
    await lib.wait_for(session.tab, f'!!document.querySelector({json.dumps(sel.DIRECTORY_CARD)})')
    return list(dict.fromkeys(await lib.read(session.tab, CARDS)))[:CANDIDATES]


async def open_channel(session, channels, shuffle=False):
    """Direct load of the first channel without the content gate (logged out, mature-rated channels are gated);
    `shuffle` tries the directory cards in random order. Returns (channel, outcome, gated)."""
    gated = []
    if shuffle:
        channels = random.sample(channels, len(channels))
    for channel in channels:
        await session.navigate(TWITCH + channel)
        outcome = await lib.wait_for(session.tab, SETTLED, timeout=SETTLE)
        if outcome != 'gate':
            return channel, outcome, gated
        gated.append(channel)
    return None, None, gated


def player_workers(state):
    return [w for w in state['workers'] if PLAYER_WORKER in (w.get('tail') or '')]


def worker_check(way, state):
    workers = player_workers(state)
    summary = [{k: w.get(k) for k in ('at', 'viaInjector', 'purpleCode', 'purpleBoot', 'size', 'errors')} for w in workers]
    return Check(
        f'{way}: every player worker through the injector, running Purple, boot message seen',
        bool(workers) and all(w['viaInjector'] and w['purpleCode'] is True and w['purpleBoot'] for w in workers),
        {'workers': summary, 'hookAt': state['hookAt'], 'pageHook': state['pageHook']},
    )


def observe_server(session, way, channel, state):
    """Keeps what Twitch's server did during this load in the run report (docs/server/)."""
    summary = server.summarize(state)
    session.observations.append({'load': way, 'channel': channel, 'server': summary})
    return summary
