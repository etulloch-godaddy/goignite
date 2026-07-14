"""Local dev runner — registers social router standalone. Never commit this."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.social_media import router as social_router

app = FastAPI(title="Social Media Dev")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(social_router, prefix="/api/social", tags=["social"])

@app.get("/health")
def health():
    return {"status": "ok", "module": "social-media"}
