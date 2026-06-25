from fastapi import FastAPI

app = FastAPI(title="Restaurant Analytics API")


@app.get("/health")
def health():
    return {"status": "ok"}
