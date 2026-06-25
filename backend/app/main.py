from fastapi import FastAPI

from app.api.routes_auth import router as auth_router
from app.api.routes_branches import router as branches_router
from app.api.routes_uploads import router as uploads_router

app = FastAPI(title="Restaurant Analytics API")
app.include_router(auth_router)
app.include_router(branches_router)
app.include_router(uploads_router)


@app.get("/health")
def health():
    return {"status": "ok"}
