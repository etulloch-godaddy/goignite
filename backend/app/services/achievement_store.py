from app.models.achievement import Achievement
from app.services.db import AchievementDB, SessionLocal


def save_achievements(achievements: list[Achievement]) -> None:
    with SessionLocal() as session:
        for a in achievements:
            session.add(AchievementDB(
                achievement_id=a.achievement_id,
                user_id=a.user_id,
                title=a.title,
                date=a.date,
                impact=a.impact,
                category=a.category.value,
            ))
        session.commit()


def load_achievements(user_id: str) -> list[Achievement]:
    with SessionLocal() as session:
        rows = session.query(AchievementDB).filter(AchievementDB.user_id == user_id).all()
        return [
            Achievement(
                achievement_id=row.achievement_id,
                user_id=row.user_id,
                title=row.title,
                date=row.date,
                impact=row.impact,
                category=row.category,
            )
            for row in rows
        ]
