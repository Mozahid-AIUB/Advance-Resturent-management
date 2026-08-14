from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.routes_auth import router as auth_router
from app.api.routes_branches import router as branches_router
from app.api.routes_uploads import router as uploads_router
from app.api.routes_forecasts import router as forecasts_router
from app.api.routes_inventory import router as inventory_router
from app.api.routes_staffing import router as staffing_router
from app.api.routes_insights import router as insights_router
from app.api.routes_dashboard import router as dashboard_router
from app.db.base import SessionLocal
from app.db.models import User
from app.services.auth_service import hash_password

settings = get_settings()

app = FastAPI(title="Restaurant Analytics API")
allowed_origins = [
    settings.frontend_origin,
    "http://localhost:3000",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3003",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def seed_demo_user():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "demo@example.com").first()
        if existing is None:
            db.add(User(email="demo@example.com", hashed_password=hash_password("demopass123")))
            db.commit()
    finally:
        db.close()


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


app.include_router(auth_router)
app.include_router(branches_router)
app.include_router(uploads_router)
app.include_router(forecasts_router)
app.include_router(inventory_router)
app.include_router(staffing_router)
app.include_router(insights_router)
app.include_router(dashboard_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {
        "name": "Restaurant Analytics API",
        "docs": "/docs",
        "health": "/health",
    }
