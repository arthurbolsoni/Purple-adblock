"""Level 2 and 3 scenarios. Each module has ID, TITLE, MODES and `async def run(session) -> list[Check]`."""
from dataclasses import dataclass
from typing import Any


@dataclass
class Check:
    name: str
    ok: bool
    detail: Any = None


def registry():
    from scenarios import l3_01
    return {m.ID: m for m in (l3_01,)}
