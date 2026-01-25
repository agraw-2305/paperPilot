from pathlib import Path
import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_path: Path) -> str:
    """
    Extract all readable text from a PDF file.
    """
    if not pdf_path.exists():
        raise FileNotFoundError("PDF file not found")

    text_blocks: list[str] = []

    with fitz.open(pdf_path) as doc:
        for page_number, page in enumerate(doc, start=1):
            page_text = page.get_text().strip()
            if page_text:
                text_blocks.append(page_text)

    return "\n".join(text_blocks)
