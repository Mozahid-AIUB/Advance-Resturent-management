from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_auth import router as auth_router
from app.api.routes_branches import router as branches_router
from app.api.routes_uploads import router as uploads_router
from app.api.routes_forecasts import router as forecasts_router
from app.api.routes_inventory import router as inventory_router
from app.api.routes_staffing import router as staffing_router
from app.api.routes_insights import router as insights_router
from app.api.routes_dashboard import router as dashboard_router

app = FastAPI(title="Restaurant Analytics API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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
