
# PaperPilot

PaperPilot is a **local-first paperwork assistant** that transforms complex forms (PDF, image, DOCX) into clear, actionable steps. It guides users through form completion with risk flags, professional suggestions, and safe draft templates—without ever sending your data to the cloud.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [License](#license)

- [Motivation & Use Cases](#motivation--use-cases)
- [Security & Privacy](#security--privacy)
- [Extensibility](#extensibility)
- [Contributing](#contributing)

---

## Overview

PaperPilot is designed for users who need to fill out official forms accurately and efficiently, with a focus on privacy and clarity. Unlike generic PDF tools or chatbots, PaperPilot provides a step-by-step guide tailored to each document, highlighting risks and offering professional, context-aware suggestions.

---

## Motivation & Use Cases

Filling out paperwork is often stressful, error-prone, and time-consuming—especially for:
- Government, legal, or financial forms
- Healthcare and insurance paperwork
- School, university, or job application forms
- Any process where mistakes can cause delays or rejections

**PaperPilot** was created to:
- Help users avoid common mistakes and omissions
- Provide clear explanations for each field and requirement
- Offer safe, professional draft answers (never fake data)
- Make paperwork accessible for non-experts and those with accessibility needs

**Example Use Cases:**
- Preparing a visa or immigration application
- Completing tax or benefits forms
- Filling out medical intake or consent forms
- Onboarding for a new job or service

**What PaperPilot is NOT:**
- Not a generic PDF summarizer
- Not a chatbot or conversational agent

**What PaperPilot IS:**
- A decision and action guide for completing forms correctly, with privacy and accuracy as top priorities

---

## Security & Privacy

- **Local-first:** All document processing happens on your machine. No files or data are sent to external servers or third parties.
- **No cloud storage:** Uploaded documents and extracted data are never uploaded or stored remotely.
- **Safe suggestions:** Draft answers are generated using templates and never use or leak real personal data.
- **Open source:** You can audit, modify, or self-host the code for maximum trust.

---

## Extensibility

PaperPilot is designed to be modular and extensible:
- **Backend:** Add new extraction methods, field heuristics, or document types by extending the FastAPI services.
- **Frontend:** Easily customize the UI, add new step types, or integrate with other tools.
- **Integrations:** The API can be extended to support e-signature, cloud storage, or workflow automation if needed.

---

## Contributing

Contributions are welcome! To get started:
1. Fork the repository and clone it locally.
2. Set up your development environment (see Getting Started).
3. Create a new branch for your feature or bugfix.
4. Submit a pull request with a clear description of your changes.

**Ideas for contribution:**
- Add support for new document types (e.g., XLSX, HTML forms)
- Improve OCR accuracy or add language support
- Enhance accessibility or UI/UX
- Add more professional draft templates
- Write tests or improve documentation

---

## Key Features

- **Document Upload & Analysis**
  - Supports `.pdf`, `.png`, `.jpg`, `.jpeg`, `.docx`
  - Extracts text using PDF text layers, OCR (EasyOCR), or AcroForm field detection

- **Actionable Step Checklist**
  - Breaks down forms into grouped steps (identity, address, verification, etc.)
  - Each step includes:
    - Risk level (`low`, `medium`, `high`)
    - Risk reason and remediation tips
    - Companion explanations for context

- **Separation of Fillable vs Informational Content**
  - Fillable fields are clearly separated from informational content (terms, instructions, etc.)

- **Guide Draft Suggestions**
  - Provides safe, professional templates for common fields (e.g., date of birth, address)
  - Avoids generating fake personal data
  - Controlled options for choice fields

- **Progress Tracking**
  - Mark steps as done or skipped
  - Review mode to see all steps at a glance

- **PDF Export**
  - For AcroForm PDFs, fills fields and allows download of the completed document
  - Optional signature image placement

---

## How It Works

1. **Upload** a document via the web UI.
2. The **frontend** sends the file to the backend (`/upload/analyze`).
3. The **backend** extracts text and detects form fields.
4. Extracted content is converted into a structured checklist of steps.
5. The **frontend** displays these steps, guiding the user through completion.
6. For fillable PDFs, users can export a filled version via `/upload/fill`.

---

## Tech Stack

**Frontend:**
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Radix UI components

**Backend:**
- FastAPI (Python)
- Uvicorn (ASGI server)
- PyMuPDF (`pymupdf`) for PDF parsing and filling
- EasyOCR for OCR extraction
- python-docx for DOCX parsing
- Pillow & NumPy for image processing

---

## Project Structure

Below is the up-to-date file structure for the project, showing the main directories and key files:

```text
paperPilot/
│
├── README.md
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schema.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── upload.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai_engine.py
│   │   │   ├── answer_validator.py
│   │   │   ├── companion_steps.py
│   │   │   ├── eligibility.py
│   │   │   ├── field_detector.py
│   │   │   ├── info_intent.py
│   │   │   ├── pdf_parser.py
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── helpers.py
│   │   │   └── text_cleaner.py
│   │   └── ...
│   └── uploads/
├── frontend/
│   ├── package.json
│   ├── next-env.d.ts
│   ├── next.config.mjs
│   ├── pnpm-lock.yaml
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts
│   ├── components/
│   │   ├── form-processor.tsx
│   │   ├── header.tsx
│   │   ├── pdf-preview.tsx
│   │   ├── professional-pdf-viewer.tsx
│   │   ├── theme-provider.tsx
│   │   ├── upload-card.tsx
│   │   └── ui/
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── ...
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts
│   └── public/
└── ...
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python (v3.10+ recommended)
- (Optional) Virtual environment for Python

### Backend Setup

From the project root:

1. **Install dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Start the backend server:**
   ```bash
   python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
   ```

3. **Verify the backend is running:**
   Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/) in your browser.

### Frontend Setup

From the `frontend` directory:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

### Environment Variables

**Frontend:**
- Set the backend URL (if not using the default):
  ```bash
  NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
  ```
  If not set, defaults to `http://127.0.0.1:8000`.

---

## API Reference

### `POST /upload/analyze`

- **Purpose:** Analyze an uploaded document and return structured steps.
- **Request:** `multipart/form-data` with a `file` field.
- **Response:** JSON with filename, extraction method, action overview, and a list of steps.

**Example Response:**
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

- **Purpose:** Fill an AcroForm PDF with user-entered values.
- **Request:** `multipart/form-data` with:
  - `file`: original PDF
  - `data`: JSON string mapping field names to values
  - `signature`: (optional) signature image
- **Response:** Downloadable filled PDF

---

## Troubleshooting

- **Backend import/module errors:**  
  Always start Uvicorn from the project root:
  ```
  python -m uvicorn backend.main:app --reload
  ```

- **OCR is slow:**  
  - Use clearer scans or smaller files for better performance.

- **Download filled PDF is disabled:**  
  - Only enabled for AcroForm PDFs and on the last step.

---

## Limitations

- PDF filling is only supported for AcroForm PDFs (with true fillable fields).
- For image-only scans, PaperPilot generates steps and guidance, but cannot export a filled PDF (coordinate-based overlay not implemented).
- OCR quality depends on scan clarity (resolution, skew, noise).

---

## License

This project is currently provided without an explicit license. If you plan to distribute or use it publicly, please add a license file.

---

**Built for clarity, privacy, and real-world help.**
