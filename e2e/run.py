"""Runs level 2 and 3 scenarios (docs/tests.md).

    python e2e/run.py <scenario|all> [--mode extension|userscript|record] [--repeat N] [--build] [--visible] [--report FILE]

Build first (`bun run e2e:build`, or --build). Exit code 0 when every check passed.
"""
import argparse
import asyncio
import json
import os
import shutil
import sys
import tempfile
import time
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
import server
from scenarios import Check, registry


async def run_one(scenario, mode, profile, args):
    session = await lib.launch(mode, profile=profile, visible=args.visible, debug=getattr(scenario, 'DEBUG', False))
    try:
        checks = await scenario.run(session)
    except Exception:
        checks = [Check('scenario ran to the end', False, traceback.format_exc())]
    finally:
        await session.close()
    return checks, session.observations


def main():
    scenarios = registry()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('scenario', choices=[*scenarios, 'all'])
    ap.add_argument('--mode', choices=lib.MODES, help="default: every mode the scenario lists")
    ap.add_argument('--repeat', type=int, default=1)
    ap.add_argument('--build', action='store_true', help='build the extension and the userscript first')
    ap.add_argument('--visible', action='store_true', help="show Edge on the user's desktop (debugging)")
    ap.add_argument('--profile', help=f"default: {lib.PROFILE}, or a new profile per run for scenarios with FRESH_PROFILE")
    ap.add_argument('--report', help='write every check with its details as JSON')
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')

    if args.build:
        lib.build()
    selected = list(scenarios.values()) if args.scenario == 'all' else [scenarios[args.scenario]]
    results = []
    for scenario in selected:
        for mode in [args.mode] if args.mode else scenario.MODES:
            for attempt in range(1, args.repeat + 1):
                started = time.time()
                fresh = getattr(scenario, 'FRESH_PROFILE', False) and not args.profile
                profile = tempfile.mkdtemp(prefix='purple-e2e-fresh-') if fresh else (args.profile or lib.PROFILE)
                try:
                    checks, observations = asyncio.run(run_one(scenario, mode, profile, args))
                finally:
                    if fresh:
                        shutil.rmtree(profile, ignore_errors=True)
                run = {'scenario': scenario.ID, 'mode': mode, 'attempt': attempt, 'seconds': round(time.time() - started),
                       'freshProfile': fresh, 'ok': all(c.ok for c in checks), 'checks': [vars(c) for c in checks],
                       'server': observations}
                results.append(run)
                print(f"{'PASS' if run['ok'] else 'FAIL'} {scenario.ID} [{mode}] #{attempt} ({run['seconds']} s) {scenario.TITLE}")
                for c in checks:
                    print(f"  {'skip' if c.skipped else 'ok  ' if c.ok else 'FAIL'} {c.name}")
                    if not c.ok:
                        print('       ' + json.dumps(c.detail, default=str)[:2000])
                for o in observations:
                    print(f"  server ({o['load']}): {server.one_line(o['server'])}")

    if args.report:
        with open(args.report, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=1, default=str)
    passed = sum(r['ok'] for r in results)
    print(f'{passed}/{len(results)} runs passed')
    return 0 if passed == len(results) else 1


if __name__ == '__main__':
    sys.exit(main())
