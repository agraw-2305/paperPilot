from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

from backend.app.services.pdf_parser import extract_text_from_pdf

router = APIRouter()

UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf"}


def validate_pdf(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if Path(file.filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )


@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    validate_pdf(file)

    file_path = UPLOAD_DIR / file.filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save PDF")

    return {
        "filename": file.filename,
        "message": "PDF uploaded successfully"
    }


@router.post("/analyze")
async def analyze_pdf(file: UploadFile = File(...)):
    validate_pdf(file)

    file_path = UPLOAD_DIR / file.filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = extract_text_from_pdf(file_path)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze PDF: {str(e)}"
        )

    return {
        "filename": file.filename,
        "text_preview": extracted_text[:1000],  # preview only
        "total_characters": len(extracted_text)
    }
