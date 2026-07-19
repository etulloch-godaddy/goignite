from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import JSON, Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DB_FILE = DATA_DIR / "goignite.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)

engine = create_engine(f"sqlite:///{DB_FILE}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


class UserDB(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True)
    creator_type = Column(String, nullable=True)
    stage = Column(String, nullable=False)
    xp_total = Column(Integer, nullable=False, default=0)
    completed_missions = Column(JSON, nullable=False, default=list)
    business_profile = Column(JSON, nullable=False, default=dict)
    onboarding_data = Column(JSON, nullable=False, default=dict)
    godaddy_domain = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


init_db()
