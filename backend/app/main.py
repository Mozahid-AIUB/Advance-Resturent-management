from fastapi import FastAPI

from app.api.routes_auth import router as auth_router

app = FastAPI(title="Restaurant Analytics API")
app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}
