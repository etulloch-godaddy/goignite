"""One-off script: move a single user from users.json into the SQLite database.

Usage (from the backend/ directory):
    python -m scripts.migrate_user_to_db <user_id>
"""

import sys

from app.services.db import SessionLocal, UserDB, init_db
from app.services.user_store import _load_json_users, _save_json_users, _user_to_row_fields


def migrate_user_to_db(user_id: str) -> None:
    users = _load_json_users()
    if user_id not in users:
        raise SystemExit(f"user_id {user_id!r} not found in users.json")

    user = users.pop(user_id)

    init_db()
    with SessionLocal() as session:
        if session.get(UserDB, user_id) is not None:
            raise SystemExit(f"user_id {user_id!r} already exists in the database")
        session.add(UserDB(**_user_to_row_fields(user)))
        session.commit()

    _save_json_users(users)
    print(f"Migrated user {user_id} to the database.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: python -m scripts.migrate_user_to_db <user_id>")
    migrate_user_to_db(sys.argv[1])
