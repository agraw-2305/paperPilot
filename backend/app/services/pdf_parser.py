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
    import fitz
    text_blocks = []
    fillable_fields = []
    doc = fitz.open(pdf_path)
    try:
        # Try to extract AcroForm fields (fillable fields)
        for page in doc:
            widgets = page.widgets()
            if widgets:
                for w in widgets:
                    if w.field_name:
                        fillable_fields.append({
                            "name": w.field_name,
                            "type": w.field_type,
                            "label": w.field_label or w.field_name,
                            "rect": list(w.rect),
                        })
        # If no widgets, fallback to text extraction
        if not fillable_fields:
            for page in doc:
                text = page.get_text().strip()
                if text:
                    text_blocks.append(text)
    finally:
        doc.close()

    if fillable_fields:
        return {
            "fields": fillable_fields,
            "method": "acroform"
        }
    elif text_blocks:
        return {
            "text": "\n".join(text_blocks),
            "method": "text-layer"
        }

    # OCR fallback
    ocr_text = []
    doc = fitz.open(pdf_path)
    try:
        max_pages = min(len(doc), 2 if len(doc) > 5 else 3)
        for page_index in range(max_pages):
            page = doc[page_index]
            pix = page.get_pixmap(dpi=120)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            try:
                img_np = np.array(img)
                result = get_ocr_reader().readtext(img_np)
                for (_, text, conf) in result:
                    if conf > 0.5 or len(text) < 40:
                        ocr_text.append(text.strip())
                if len(" ".join(ocr_text)) > 1500:
                    break
            finally:
                img.close()
    finally:
        doc.close()
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
