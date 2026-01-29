# PaperPilot

PaperPilot is a **local-first paperwork assistant** that turns complex forms (PDF / image / DOCX) into **clear, actionable steps** with guidance, risk flags, and safe draft suggestions.

It is designed for **clarity, accuracy, and privacy**:
- **Not** a PDF summarizer
- **Not** a chatbot
- **Yes**: a decision & action guide that helps you complete a form correctly

---

## Key Features

- **Upload and analyze documents**
  - Supported: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.docx`
  - Extraction methods: PDF text layer, OCR (EasyOCR), or AcroForm fillable field detection

- **Action-step checklist**
  - Steps are grouped by intent (identity, address, verification, declarations, etc.)
  - Each step includes:
    - Risk level (`low` / `medium` / `high`)
    - Risk reason + remediation tip
    - Companion explanation

- **Fillable vs informational separation (after upload)**
  - Fillable inputs are shown in the main “Fill these fields” column
  - “Theory” content (terms/conditions/declarations/instructions) is shown in a separate “Info & Guidance” column

- **Guide Draft suggestions (safe templates)**
  - Professional templates (DOB format, address structure, income numeric guidance, etc.)
  - Avoids fake personal data
  - Choice fields (e.g., Gender) use controlled options

- **Progress + completion indicators**
  - Mark steps as done / skipped
  - Review mode to see all steps

- **Download filled PDF (AcroForm PDFs)**
  - If your PDF contains fillable form fields (AcroForm widgets), PaperPilot can fill them and export a downloadable PDF.
  - Optional signature image placement on a detected signature field.

---

## Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS** + Radix UI components

### Backend
- **FastAPI**
- **Uvicorn**
- **PyMuPDF** (`pymupdf`) for PDF parsing + filling
- **EasyOCR** for OCR fallback
- **python-docx** for DOCX extraction
- **Pillow** + **NumPy** for image handling

---

## Architecture Overview

### High-level flow
1. You upload a document in the UI.
2. The frontend sends it to the backend: `POST /upload/analyze`.
3. The backend extracts text or detects PDF form fields.
4. The backend converts the extracted content into a structured set of steps.
5. The frontend renders steps in the **FormProcessor** (after-upload) UI.
6. Optionally, you can export a filled PDF via `POST /upload/fill`.

### Where the main logic lives

**Backend**
- `backend/app/routes/upload.py`
  - `/upload/analyze`: analyze document and return structured steps
  - `/upload/fill`: fill AcroForm PDFs with user-entered values and return a filled PDF
- `backend/app/services/pdf_parser.py`
  - Extract text from PDFs/images/DOCX
  - Detect AcroForm fields when available
- `backend/app/services/field_detector.py`
  - Detects field labels from extracted text
  - Includes heuristics to reduce OCR artifacts (e.g., value-heavy lines)
- `backend/app/utils/text_cleaner.py`
  - Cleans extracted OCR/text layer output (reduces common OCR artifacts)

**Frontend**
- `frontend/app/page.tsx`
  - Landing + upload flow and routing into the after-upload experience
- `frontend/components/form-processor.tsx`
  - Main after-upload UI: steps, guidance, indicators, and fill/export actions

---

## Getting Started (Local Development)

### Prerequisites

- **Node.js** (recommended: Node 18+)
- **Python** (recommended: Python 3.10+)

> Note: EasyOCR can be heavier to install the first time depending on your environment.

---

## Backend Setup (FastAPI)

From the project root:

1) Install dependencies

```bash
pip install -r backend/requirements.txt
```

2) Start the backend

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

3) Verify health

Open:

```text
http://127.0.0.1:8000/
```

---

## Frontend Setup (Next.js)

From the `frontend` folder:

1) Install dependencies

```bash
npm install
```

2) Start the dev server

```bash
npm run dev
```

3) Open the app

```text
http://localhost:3000
```

---

## Environment Variables

### Frontend

You can configure the backend base URL via:

```bash
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

If not set, the frontend defaults to `http://127.0.0.1:8000`.

---

## Usage

1) Open the frontend.
2) Upload a document (PDF/image/DOCX).
3) On the after-upload page:
   - Follow steps and fill fields in the main column
   - Review “Info & Guidance” for terms/conditions/declarations
   - Use **Guide Draft** to generate safe template suggestions
   - Mark steps done / skipped
4) On the final step (for fillable PDFs), click **Download filled PDF**.

---

## Backend API

### `POST /upload/analyze`

Analyzes an uploaded document and returns structured steps.

- **Request**: `multipart/form-data` with `file`
- **Response** (shape used by the frontend):

```json
{
  "filename": "example.pdf",
  "saved_as": "...",
  "extraction_method": "text-layer | ocr-pdf | ocr-image | docx-text | acroform",
  "action_overview": "...",
  "total_steps": 3,
  "mandatory": 1,
  "optional": 2,
  "steps": [
    {
      "id": 1,
      "title": "Identity Information",
      "required": true,
      "risk": "high",
      "risk_reason": "...",
      "remediation_tip": "...",
      "what_to_do": "...",
      "fields": [
        { "label": "Full Name", "tip": "...", "suggested_answer": "[Your full legal name]" }
      ],
      "companion": "..."
    }
  ]
}
```

### `POST /upload/fill`

Fills an AcroForm PDF with user-entered values.

- **Request**: `multipart/form-data`
  - `file`: original PDF
  - `data`: JSON string of `{ field_name: value }`
  - `signature`: optional signature image

- **Response**: a downloadable PDF (`FileResponse`)

---

## Limitations / Notes

- **PDF filling works best for AcroForm PDFs** (true fillable fields).
- If the document is an image-only scan without form widgets, PaperPilot can still generate steps and guidance, but exporting a “filled PDF” would require a coordinate-based overlay system (not implemented).
- OCR quality depends on scan clarity (resolution, skew, noise).

---

## Troubleshooting

### Backend import/module errors
- Start uvicorn from the project root:
  - `python -m uvicorn backend.main:app --reload`

### OCR is slow
- OCR can be CPU heavy. Try:
  - Clearer scans
  - Smaller files

### Download filled PDF is disabled
- The “Download filled PDF” button is enabled only when:
  - The PDF contains **fillable fields** (AcroForm)
  - You are on the last step

---

## Project Structure

```text
paperPilot/
  README.md
  backend/
    main.py
    requirements.txt
    app/
      routes/
        upload.py
      services/
        ai_engine.py
        field_detector.py
        pdf_parser.py
      utils/
        text_cleaner.py
  frontend/
    package.json
    app/
      page.tsx
      api/
        analyze/route.ts
    components/
      form-processor.tsx
      upload-card.tsx
```

---

## License

This project is currently provided without an explicit license. Add a license file if you plan to distribute.

---

Built for clarity, privacy, and real-world help.
