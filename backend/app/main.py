from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import domains, users

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
app.include_router(domains.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
