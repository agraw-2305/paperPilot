from fastapi import FastAPI

app = FastAPI(title="paperPilot API")

@app.get("/")
def root():
    return {"message": "paperPilot backend running"}
