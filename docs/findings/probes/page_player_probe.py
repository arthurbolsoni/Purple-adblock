"""What Twitch's page player exposes about its buffer and latency (T-814, 2026-10-09).

Usage: python docs/findings/probes/page_player_probe.py [channel path] [seconds]

Starts Edge in extension mode on the dedicated profile, opens the channel (default: the first live one in the
directory), and every second for [seconds] (default 20) reads, from the React tree under #root, the
`props.mediaPlayerInstance` of the component that has `setPlayerActive` (the instance F-15 reloads): the names of its
methods once, then getBufferDuration(), getLiveLatency(), isLiveLowLatency() and getPlaybackRate() when it has them,
with the <video>'s currentTime.
"""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import lib  # noqa: E402
from scenarios import common  # noqa: E402

# React fiber walk written for this probe: the first fiber whose stateNode has props.mediaPlayerInstance
READ = """(() => {
  const root = document.querySelector('#root');
  const key = root && Object.keys(root).find((k) => k.startsWith('__reactContainer') || k.startsWith('__reactFiber'));
  const stack = key ? [root[key]] : [];
  let instance = null;
  for (let n = 0; stack.length && n < 200000 && !instance; n++) {
    const fiber = stack.pop();
    if (!fiber) continue;
    const props = fiber.stateNode && fiber.stateNode.props;
    if (props && props.mediaPlayerInstance && fiber.stateNode.setPlayerActive) instance = props.mediaPlayerInstance;
    if (fiber.sibling) stack.push(fiber.sibling);
    if (fiber.child) stack.push(fiber.child);
  }
  const p = instance && (instance.playerInstance || instance);
  const call = (name) => { try { return p && typeof p[name] === 'function' ? p[name]() : undefined; } catch (e) { return 'error: ' + e; } };
  const methods = [];
  for (let o = p; o && o !== Object.prototype && methods.length < 400; o = Object.getPrototypeOf(o))
    for (const name of Object.getOwnPropertyNames(o)) if (typeof p[name] === 'function' && /^(get|is)/.test(name)) methods.push(name);
  const v = document.querySelector('video');
  return { found: !!p, methods: [...new Set(methods)].sort(), currentTime: v && Math.round(v.currentTime * 10) / 10,
    buffer: call('getBufferDuration'), latency: call('getLiveLatency'), lowLatency: call('isLiveLowLatency'), rate: call('getPlaybackRate') };
})()"""


async def main(channel, seconds):
    session = await lib.launch('extension')
    try:
        if not channel:
            channel = (await common.directory_channels(session))[0]
        await session.navigate(f'https://www.twitch.tv{channel}')
        print('channel', channel)
        await session.tab.sleep(8)
        for i in range(seconds):
            r = await lib.read(session.tab, READ) or {}
            if i == 0:
                print('methods', json.dumps(r.get('methods')))
            print(json.dumps({k: v for k, v in r.items() if k != 'methods'}))
            await session.tab.sleep(1)
    finally:
        await session.close()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else '', int(sys.argv[2]) if len(sys.argv) > 2 else 20))
