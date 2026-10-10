"""Level 2 and 3 scenarios. Each module has ID, TITLE, MODES and `async def run(session) -> list[Check]`;
FRESH_PROFILE = True makes run.py use a new profile for every run; DEBUG = True turns the build's `debug` setting on
(extension mode), so Purple logs and keeps its events in window.__purple.events."""
from dataclasses import dataclass
from typing import Any


@dataclass
class Check:
    name: str
    ok: bool
    detail: Any = None
    # a check that does not apply to this run (an ad check without a recorded break); it does not fail the run
    skipped: bool = False


def registry():
    from scenarios import l2_01, l2_02, l2_03, l2_04, l2_05, l2_06, l2_07, l2_08, l2_09, l2_10, l2_11, l2_12, l3_01, l3_02, l3_03, l3_07, l3_08, l3_11, l3_12, l3_13
    return {m.ID: m for m in (l2_01, l2_02, l2_03, l2_04, l2_05, l2_06, l2_07, l2_08, l2_09, l2_10, l2_11, l2_12, l3_01, l3_02, l3_03, l3_07, l3_08, l3_11, l3_12, l3_13)}
