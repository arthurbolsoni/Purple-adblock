"""Backup playlists with ad segments in prerolls and midrolls, from level 3 run reports (T-807).

Usage: python docs/findings/probes/report_backups_probe.py <report.json>...

Reads the `server` summaries the scenarios keep per load (`common.observe_server`, e2e/server.py `summarize`) and prints
every load whose main playlist had ad segments and whose backups were polled: the channel, the main polls with ads,
the roll type, and the backup polls with ad segments. Then the totals by roll type.
"""
import collections
import json
import sys
from pathlib import Path


def observations(node):
    if isinstance(node, dict):
        if isinstance(node.get('server'), dict) and 'backups' in node['server']:
            yield node
        for value in node.values():
            yield from observations(value)
    elif isinstance(node, list):
        for value in node:
            yield from observations(value)


totals = collections.defaultdict(lambda: [0, 0, 0, 0])  # loads, loads with backup ads, backup polls with ads, backup polls
for path in sys.argv[1:]:
    try:
        report = json.loads(Path(path).read_text(encoding='utf-8'))
    except (OSError, ValueError):
        continue
    for o in observations(report):
        main, backups = o['server']['main'], o['server']['backups']
        if not main['pollsWithAds'] or not backups['polls']:
            continue
        roll = '/'.join(main['rollTypes']) or '?'
        print(f"{path}: {o.get('channel')} main {main['pollsWithAds']}/{main['polls']} {roll}, backups with ad segments {backups['pollsWithAds']}/{backups['polls']}")
        t = totals[roll]
        t[0] += 1
        t[1] += backups['pollsWithAds'] > 0
        t[2] += backups['pollsWithAds']
        t[3] += backups['polls']
for roll, (loads, with_ads, polls_ads, polls) in sorted(totals.items()):
    print(f'{roll}: {loads} loads, {with_ads} with backup ad segments, {polls_ads} of {polls} backup polls')
