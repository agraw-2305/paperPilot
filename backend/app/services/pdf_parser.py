from pathlib import Path
import fitz  # PyMuPDF
import io
import numpy as np
from PIL import Image
from docx import Document

_ocr_reader = None

def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        # Import here to avoid importing torch/easyocr at process start
        import easyocr  # type: ignore
        _ocr_reader = easyocr.Reader(["en"], gpu=False)
    return _ocr_reader


def extract_text_from_document(file_path: Path) -> dict:
    ext = file_path.suffix.lower()

    if ext == ".pdf":
        return extract_from_pdf(file_path)

    if ext in {".png", ".jpg", ".jpeg"}:
        return extract_from_image(file_path)

    if ext == ".docx":
        return extract_from_docx(file_path)

    raise ValueError("Unsupported file format")


# ---------- PDF ----------

def extract_from_pdf(pdf_path: Path) -> dict:
    text_blocks = []

    with fitz.open(pdf_path) as doc:
        for page in doc:
            text = page.get_text().strip()
            if text:
                text_blocks.append(text)

    if text_blocks:
        return {
            "text": "\n".join(text_blocks),
            "method": "text-layer"
        }

    # OCR fallback
    ocr_text = []

    with fitz.open(pdf_path) as doc:
        for page in doc:
            # Slightly lower DPI is usually enough for forms and improves latency
            pix = page.get_pixmap(dpi=160)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            img_np = np.array(img)

            result = get_ocr_reader().readtext(img_np)
            for (_, text, conf) in result:
                if conf > 0.5 or len(text) < 40:
                    ocr_text.append(text.strip())

    return {
        "text": "\n".join(ocr_text),
        "method": "ocr-pdf"
    }


# ---------- IMAGE ----------

def extract_from_image(image_path: Path) -> dict:
    img = Image.open(image_path).convert("RGB")
    img_np = np.array(img)

    result = get_ocr_reader().readtext(img_np)
    text_blocks = []

    for (_, text, conf) in result:
        if conf > 0.5 or len(text) < 40:
            text_blocks.append(text.strip())

    return {
        "text": "\n".join(text_blocks),
        "method": "ocr-image"
    }


# ---------- WORD (.docx) ----------

def extract_from_docx(docx_path: Path) -> dict:
    document = Document(docx_path)
    text_blocks = []

    for para in document.paragraphs:
        text = para.text.strip()
        if text:
            text_blocks.append(text)

    return {
        "text": "\n".join(text_blocks),
        "method": "docx-text"
    }
