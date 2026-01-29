from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import FileResponse
from typing import Dict, Any
import tempfile
import os
from pathlib import Path
import time
from uuid import uuid4
import logging

from ..services.pdf_parser import extract_from_pdf, extract_from_docx, extract_from_image
from ..services.ai_engine import extract_action_steps
from ..utils.text_cleaner import clean_text

router = APIRouter()

UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".docx"}

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB

# Endpoint to fill a PDF with user data and signature, and return the filled PDF
@router.post("/fill")
async def fill_pdf(
    file: UploadFile = File(...),
    data: str = Body(...),  # JSON stringified dict of field values
    signature: UploadFile = File(None)
):
    """
    file: the original PDF
    data: JSON string of { field_name: value, ... }
    signature: optional signature image file
    """
    import json
    import fitz
    from PIL import Image
    import io

    # Save uploaded PDF
    suffix = Path(file.filename).suffix.lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        pdf_path = Path(tmp.name)

    # Parse data
    try:
        field_data: Dict[str, Any] = json.loads(data)
    except Exception as e:
        os.unlink(pdf_path)
        raise HTTPException(status_code=400, detail=f"Invalid data: {e}")

    # Prepare output path
    filled_path = pdf_path.parent / (pdf_path.stem + "_filled.pdf")

    # Open PDF and fill fields
    doc = fitz.open(pdf_path)
    for page in doc:
        widgets = page.widgets()
        if widgets:
            for w in widgets:
                if w.field_name and w.field_name in field_data:
                    w.field_value = str(field_data[w.field_name])
                    w.update()

    # If signature provided, try to place it on a field named 'signature' (case-insensitive)
    if signature is not None:
        sig_img_bytes = await signature.read()
        sig_img = Image.open(io.BytesIO(sig_img_bytes)).convert("RGBA")
        for page in doc:
            widgets = page.widgets() or []
            for w in widgets:
                if not w.field_name:
                    continue
                if 'signature' not in w.field_name.lower():
                    continue

                rect = w.rect
                # Convert signature to PNG bytes and insert it directly into the widget rectangle.
                buf = io.BytesIO()
                sig_img.save(buf, format="PNG")
                page.insert_image(rect, stream=buf.getvalue(), keep_proportion=False)
                break

    doc.save(str(filled_path))
    doc.close()
    os.unlink(pdf_path)

    # Return the filled PDF for download
    return FileResponse(str(filled_path), filename="filled_" + file.filename)


def validate_upload(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    if Path(file.filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, PNG/JPG images, or DOCX files are allowed")


@router.post("/analyze")
async def analyze_pdf(file: UploadFile = File(...)):
    validate_upload(file)

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

        suffix = Path(file.filename).suffix.lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = Path(tmp.name)

        # Now tmp is closed, safe to open and process
        try:
            if suffix in [".pdf"]:
                extracted = extract_from_pdf(tmp_path)
            elif suffix in [".jpg", ".jpeg", ".png"]:
                extracted = extract_from_image(tmp_path)
            elif suffix in [".docx"]:
                extracted = extract_from_docx(tmp_path)
            else:
                os.unlink(tmp_path)
                raise HTTPException(status_code=400, detail="Unsupported file type")
        finally:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass

        # Build a stable response schema used by the frontend
        if "text" in extracted and extracted.get("text"):
            cleaned = clean_text(extracted.get("text", ""))
            result = extract_action_steps(cleaned)
            return {
                "filename": file.filename,
                "saved_as": safe_name,
                "extraction_method": extracted.get("method"),
                "action_overview": result.get("overview", "Document Analysis"),
                "total_steps": result.get("total_steps", len(result.get("steps", []))),
                "mandatory": result.get("mandatory", 0),
                "optional": result.get("optional", 0),
                "steps": result.get("steps", []),
            }

        if "fields" in extracted and extracted.get("fields"):
            # Convert fillable field metadata into a single “fillable fields” step.
            fields = []
            for f in extracted.get("fields", []):
                label = f.get("label") or f.get("name") or "Field"
                fields.append({
                    "name": f.get("name"),
                    "label": label,
                    "tip": "Fill exactly as requested on the form.",
                    "suggested_answer": "",
                })

            steps = [
                {
                    "id": 1,
                    "title": "Fillable Fields",
                    "required": True,
                    "risk": "medium",
                    "risk_reason": "These fields were detected from the PDF’s fillable form controls.",
                    "remediation_tip": "Review each field carefully before downloading the filled PDF.",
                    "what_to_do": "Fill the fields below.",
                    "fields": fields,
                    "companion": "Fill each field carefully. Use the guidance for format and common mistakes.",
                }
            ]

            return {
                "filename": file.filename,
                "saved_as": safe_name,
                "extraction_method": extracted.get("method"),
                "action_overview": "Fillable fields detected",
                "total_steps": 1,
                "mandatory": 1,
                "optional": 0,
                "steps": steps,
            }

        return {
            "filename": file.filename,
            "saved_as": safe_name,
            "extraction_method": extracted.get("method"),
            "action_overview": "No fields detected",
            "total_steps": 0,
            "mandatory": 0,
            "optional": 0,
            "steps": [],
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Error processing upload")
        raise HTTPException(status_code=500, detail=str(e))



