import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..models.schema import UploadResponse
from ..utils.helpers import save_upload_file

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))

@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    await save_upload_file(file, file_path)
    return UploadResponse(filename=file.filename, detail="Uploaded successfully")
