import json
from pathlib import Path

from fastapi import HTTPException

from app.models.user import User
from app.services.db import SessionLocal, UserDB

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
USERS_FILE = DATA_DIR / "users.json"


def _load_json_users() -> dict[str, User]:
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


def _save_json_users(users: dict[str, User]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    serializable = {
        user_id: user.model_dump(mode="json") for user_id, user in users.items()
    }
    USERS_FILE.write_text(
        json.dumps(serializable, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def _user_to_row_fields(user: User) -> dict:
    dumped = user.model_dump(mode="json")
    return {
        "user_id": dumped["user_id"],
        "creator_type": dumped["creator_type"],
        "stage": dumped["stage"],
        "xp_total": dumped["xp_total"],
        "completed_missions": dumped["completed_missions"],
        "business_profile": dumped["business_profile"],
        "onboarding_data": dumped["onboarding_data"],
        "godaddy_domain": dumped["godaddy_domain"],
        "created_at": user.created_at,
    }


def _row_to_user(row: UserDB) -> User:
    return User.model_validate(
        {
            "user_id": row.user_id,
            "creator_type": row.creator_type,
            "stage": row.stage,
            "xp_total": row.xp_total,
            "completed_missions": row.completed_missions,
            "business_profile": row.business_profile,
            "onboarding_data": row.onboarding_data,
            "godaddy_domain": row.godaddy_domain,
            "created_at": row.created_at,
        }
    )


def _load_db_users() -> dict[str, User]:
    with SessionLocal() as session:
        rows = session.query(UserDB).all()
        return {row.user_id: _row_to_user(row) for row in rows}


def load_users() -> dict[str, User]:
    # DB is the primary store. JSON users are legacy — merge them in so they
    # still work, but any save() will migrate them to SQLite automatically.
    json_users = _load_json_users()
    db_users = _load_db_users()
    return {**json_users, **db_users}


def save_users(users: dict[str, User]) -> None:
    with SessionLocal() as session:
        for user_id, user in users.items():
            row = session.get(UserDB, user_id)
            if row is not None:
                for key, value in _user_to_row_fields(user).items():
                    setattr(row, key, value)
            else:
                session.add(UserDB(**_user_to_row_fields(user)))
        session.commit()
