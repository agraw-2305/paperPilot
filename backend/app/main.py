from fastapi import FastAPI
from backend.app.routes.upload import router as upload_router


app = FastAPI(
    title="paperPilot API",
    description="Local-first AI paperwork assistant",
    version="0.1.0"
)

app.include_router(
    upload_router,
    prefix="/upload",
    tags=["PDF Upload"]
)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "paperPilot backend running"}
