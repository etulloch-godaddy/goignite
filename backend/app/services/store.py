from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.achievement import Achievement

ACHIEVEMENTS_STORE: dict[str, list["Achievement"]] = {}
