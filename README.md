# PaperPilot

## What is PaperPilot?
A local AI that converts complex forms into clear steps and guidance so users know exactly what to do next.

- ❌ Not a PDF summarizer
- ❌ Not a chatbot
- ✅ A decision & action guide

## How it works
- Upload a PDF form
- Instantly get a structured checklist:
  - Each step is clear, short, and actionable
  - Steps are marked as required, conditional, or not applicable (based on 3 simple questions)
  - Each step shows risk level and practical tips
  - Click any step for a short explanation and a safe draft (if allowed)

## Local-first privacy

🔒 **Runs locally. Your documents never leave your device.**

No cloud sync, no login, no chat history, no data leaves your computer.

## MVP Checklist
- [x] PDF → structured action steps
- [x] Mandatory vs optional steps
- [x] "Does this apply to me?" filter
- [x] Companion explanation per step
- [x] Risk flags
- [x] Smart drafting (for allowed fields only)
- [x] Local-first badge
- [ ] Minimal, clever UI
- [ ] Tests & docs

## Why this is innovative
- Converts legalese into clear, executable steps
- Removes confusion, not just summarizes
- Protects users from mistakes and rejections
- Judges see intelligence, not just text generation

## What not to do
- ❌ No login/auth
- ❌ No cloud sync
- ❌ No multi-doc workflow
- ❌ No chatbot/"Ask anything"

## Example output
```json
{
  "overview": "This form is for XYZ application",
  "total_steps": 5,
  "steps": [
    {
      "id": 1,
      "title": "Fill Personal Details",
      "required": true,
      "risk": "low",
      "why": "Used to verify your identity",
      "what_to_do": "Enter details exactly as in ID proof"
    },
    {
      "id": 2,
      "title": "Attach ID Proof",
      "required": true,
      "risk": "high",
      "why": "Application is rejected without this",
      "what_to_do": "Upload Aadhaar/Passport PDF under 2MB"
    }
  ]
}
```

## Fast start
1. Run the backend (see requirements.txt)
2. Open the UI (coming soon)
3. Upload a form and see the difference

---

Built for clarity, privacy, and real-world help.
