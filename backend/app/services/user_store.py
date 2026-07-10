import json
from pathlib import Path

from fastapi import HTTPException

from app.models.user import User

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
USERS_FILE = DATA_DIR / "users.json"


def load_users() -> dict[str, User]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not USERS_FILE.exists():
        USERS_FILE.write_text("{}", encoding="utf-8")
        return {}

    raw_data = USERS_FILE.read_text(encoding="utf-8").strip()
    if not raw_data:
        return {}

    try:
        parsed = json.loads(raw_data)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500, detail="User storage is corrupted"
        ) from exc

    if not isinstance(parsed, dict):
        raise HTTPException(status_code=500, detail="User storage format is invalid")

    return {
        user_id: User.model_validate(user_data) for user_id, user_data in parsed.items()
    }


def save_users(users: dict[str, User]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    serializable = {
        user_id: user.model_dump(mode="json") for user_id, user in users.items()
    }
    USERS_FILE.write_text(
        json.dumps(serializable, indent=2, ensure_ascii=False), encoding="utf-8"
    )
