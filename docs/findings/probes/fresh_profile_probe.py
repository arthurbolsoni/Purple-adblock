# Probe, 2026-10-07. What a fresh Edge profile does with the unpacked Purple build, launch after launch:
# the extension's state on edge://extensions and whether Purple's page hook is installed on twitch.tv.
# Finding: docs/findings/2026-10-07-e2e-harness.md
# Runs through e2e/lib.py (hidden desktop) on a new profile under %TEMP%, deleted at the end.
# Run: python -u docs/findings/probes/fresh_profile_probe.py [launches] [--wait-seconds N] [--dev-mode]
#   --dev-mode: turn on developer mode on edge://extensions during the first launch
import json, os, shutil, sys, tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'e2e'))
import nodriver as uc
import lib

ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
LAUNCHES = int(ARGS[0]) if ARGS else 3
WAIT = int(sys.argv[sys.argv.index('--wait-seconds') + 1]) if '--wait-seconds' in sys.argv else 5
DEV_MODE = '--dev-mode' in sys.argv

EXTENSIONS = """new Promise(r => chrome.developerPrivate.getExtensionsInfo({includeDisabled: true}, l =>
  r(JSON.stringify(l.map(e => ({ name: e.name, location: e.location, state: e.state, reasons: e.disableReasons }))))))"""


async def main():
    profile = tempfile.mkdtemp(prefix='purple-e2e-fresh-')
    try:
        for launch in range(1, LAUNCHES + 1):
            session = await lib.launch('extension', profile=profile, warm_up=False)
            try:
                tab = session.tab
                await session.navigate('edge://extensions')
                await tab.sleep(WAIT)
                if DEV_MODE and launch == 1:
                    print(launch, 'developer mode:', await tab.evaluate(
                        "new Promise(r => chrome.developerPrivate.updateProfileConfiguration({inDeveloperMode: true}, () => r('on')))",
                        await_promise=True, return_by_value=True))
                print(launch, 'extensions:', await tab.evaluate(EXTENSIONS, await_promise=True, return_by_value=True))
                await session.navigate('https://www.twitch.tv/directory/all')
                await tab.sleep(6)
                print(launch, 'twitch:', json.dumps({k: v for k, v in (await lib.page_state(tab)).items() if k in ('url', 'pageHook', 'hookAt')}))
            finally:
                await session.close()
    finally:
        shutil.rmtree(profile, ignore_errors=True)


uc.loop().run_until_complete(main())
