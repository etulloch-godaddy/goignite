from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.achievement import Achievement

USERS: dict[str, "User"] = {}
ACHIEVEMENTS_STORE: dict[str, list["Achievement"]] = {}
