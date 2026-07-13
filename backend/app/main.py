from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import users, chat
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import achievements, domains, funding, missions, users

app = FastAPI(
    title="CreatorLevel API",
    description="Gamified business-building backend for creator onboarding.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(chat.router, prefix="/api")
app.include_router(domains.router)
app.include_router(missions.router)
app.include_router(achievements.router)
app.include_router(funding.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
