from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.upload import router as upload_router


app = FastAPI(
    title="paperPilot API",
    description="Local-first AI paperwork assistant",
    version="0.1.0"
)

# CORS: allow local frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    upload_router,
    prefix="/upload",
    tags=["PDF Upload"]
)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "paperPilot backend running"}
