from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from pathlib import Path
import time
from uuid import uuid4
import logging

from backend.app.services.pdf_parser import extract_text_from_document
from backend.app.services.ai_engine import extract_action_steps
from backend.app.services.eligibility import assess_applicability, get_questions
from backend.app.services.companion_steps import explain_step
from backend.app.utils.text_cleaner import clean_text
from backend.app.config import OFFLINE_MODE, LOCAL_FIRST_BADGE

router = APIRouter()

UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".docx"}

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_pdf(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    if Path(file.filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, PNG/JPG images, or DOCX files are allowed")


@router.post("/analyze")
async def analyze_pdf(file: UploadFile = File(...)):
    validate_pdf(file)

    original_suffix = Path(file.filename).suffix.lower()
    safe_name = f"{int(time.time())}-{uuid4().hex}{original_suffix}"
    file_path = UPLOAD_DIR / safe_name

    try:
        # Read content asynchronously and enforce size limits
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        if len(content) > MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

        with open(file_path, "wb") as f:
            f.write(content)
        await file.close()

        extraction = extract_text_from_document(file_path)
        cleaned_text = clean_text(extraction.get("text", ""))
        # Core innovation: convert document text into structured action steps
        action_result = extract_action_steps(cleaned_text)
        steps = action_result.get("steps", [])

    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Error processing upload")
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "filename": file.filename,
        "saved_as": safe_name,
        "offline_mode": OFFLINE_MODE,
        "local_first_badge": LOCAL_FIRST_BADGE,
        "extraction_method": extraction.get("method"),
        "action_overview": action_result.get("overview"),
        "total_steps": action_result.get("total_steps"),
        "mandatory": action_result.get("mandatory"),
        "optional": action_result.get("optional"),
        "steps": steps
    }

