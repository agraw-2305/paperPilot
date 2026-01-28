from typing import List, Dict, Optional

from backend.app.services.field_detector import detect_fields
from backend.app.services.info_intent import classify_field
from backend.app.services.companion_steps import get_reason, explain_step, generate_draft_for_field


def infer_overview(text: str) -> str:
    # Try to infer a concise overview from headings or first lines
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if not lines:
        return "Form analysis"

    first = lines[0]
    lower = first.lower()
    if "application" in lower or "form" in lower:
        return first

    # Fallback: scan for common phrases
    for l in lines[:10]:
        if any(k in l.lower() for k in ["application", "registration", "enrollment", "form"]):
            return l

    return "Form extracted from uploaded document"



def map_risk_for_intent(intent: str) -> (str, str, str):
    """
    Returns (risk_level, risk_reason, remediation_tip)
    """
    low = ["Contact Information", "Preferences / Choices", "Other Information"]
    high = ["Verification Documents", "Declarations", "Identity Information"]
    medium = ["Address Information", "Academic / Professional Information"]

    if intent in high:
        if intent == "Verification Documents":
            return (
                "high",
                "Missing or invalid documents are the #1 rejection reason.",
                "Double-check document type, clarity, and size limits."
            )
        if intent == "Declarations":
            return (
                "high",
                "Missing or unsigned declarations often cause rejection.",
                "Sign and review declaration text before submitting."
            )
        if intent == "Identity Information":
            return (
                "high",
                "Incorrect identity details lead to instant rejection.",
                "Match details exactly to your government ID."
            )
        return ("high", "Critical for application approval.", "Check all details carefully.")
    if intent in medium:
        if intent == "Address Information":
            return (
                "medium",
                "Address mismatches can delay approval.",
                "Use address as per official records."
            )
        if intent == "Academic / Professional Information":
            return (
                "medium",
                "Incorrect marks or roll numbers may cause verification delays.",
                "Copy from marksheet/admit card."
            )
        return ("medium", "Important for eligibility.", "Double-check entries.")
    return (
        "low",
        "Usually not a rejection cause, but errors may slow processing.",
        "Fill accurately and review before submitting."
    )


def determine_required(intent: str, context: Optional[Dict] = None) -> bool:
    # Default required intents
    always_required = {"Identity Information", "Verification Documents", "Declarations"}
    if intent in always_required:
        return True

    # Context-driven rules (simple): students need academic info
    if context:
        applicant = context.get("applicant_type")
        if applicant == "student" and intent == "Academic / Professional Information":
            return True

    # Otherwise mark non-critical sections as conditional
    return False


def suggest_answer_for_field(field: str) -> str:
    lower = field.lower()
    if any(k in lower for k in ["reason", "purpose", "declaration", "undertaking", "statement"]):
        return generate_draft_for_field(field)
    if "full name" in lower or ("name" in lower and "father" not in lower and "mother" not in lower):
        return "John A. Doe"
    if "father" in lower and "name" in lower:
        return "Robert Doe"
    if "mother" in lower and "name" in lower:
        return "Mary Doe"
    if "date" in lower or "dob" in lower:
        return "DD/MM/YYYY"
    if "email" in lower:
        return "name@example.com"
    if "mobile" in lower or "phone" in lower:
        return "9876543210"
    if "address" in lower:
        return "House/Flat, Street, Area, City, State, PIN"
    if "passport" in lower:
        return "A1234567"
    if "pan" in lower:
        return "ABCDE1234F"
    if "aadhaar" in lower:
        return "123456789012"
    if "year" in lower:
        return "YYYY"
    if "percentage" in lower or "percent" in lower:
        return "0-100"
    return f"Suggested: Enter {field} exactly as per your official documents."


def extract_action_steps(text: str, context_questions: Optional[Dict] = None) -> Dict:
    """
    Convert extracted form text into structured action steps.

    Returns a dict matching the core innovation schema:
    {
      "overview": "...",
      "total_steps": n,
      "steps": [ {id, title, required, risk, why, what_to_do}, ... ]
    }
    """
    overview = infer_overview(text)

    fields = detect_fields(text)

    # Group fields by classified intent
    grouped = {}
    for f in fields:
        intent = classify_field(f)
        grouped.setdefault(intent, []).append(f)

    steps: List[Dict] = []
    step_id = 1

    for intent, intent_fields in grouped.items():
        required = determine_required(intent, context_questions)
        risk, risk_reason, remediation_tip = map_risk_for_intent(intent)

        # Short, direct guidance only
        what_to_do = f"Fill: {', '.join(intent_fields)}"

        def field_tip(field):
            lower = field.lower()
            if "name" in lower:
                return "Friendly tip: Use your name exactly as on your ID."
            if "date" in lower:
                return "Just a heads up: Use DD/MM/YYYY format."
            if "aadhaar" in lower:
                return "Quick check: Enter your 12-digit Aadhaar number."
            if "pan" in lower:
                return "Type your 10-character PAN (no spaces)."
            if "address" in lower:
                return "Use the address from your official records—this helps avoid delays."
            if "mobile" in lower or "phone" in lower:
                return "Share a phone number you actually use."
            if "email" in lower:
                return "Double-check your email for typos."
            if "marks" in lower or "percentage" in lower:
                return "Copy marks/percentage from your marksheet."
            if "passport" in lower:
                return "Upload a clear PDF of your passport (max 2MB)."
            if "document" in lower:
                return "Upload a clear PDF, max 2MB."
            return "Fill this as shown in your official documents."

        fields_with_tips = [
            {"label": f, "tip": field_tip(f), "suggested_answer": suggest_answer_for_field(f)}
            for f in intent_fields
        ]

        companion = explain_step({"title": intent, "fields": intent_fields})
        companion_text = (
            f"{companion.get('why', get_reason(intent))} "
            f"{companion.get('what_good_looks_like', '')} "
            f"{companion.get('if_skipped', '')}"
        ).strip()

        steps.append({
            "id": step_id,
            "title": intent,
            "required": required,
            "risk": risk,
            "risk_reason": risk_reason,
            "remediation_tip": remediation_tip,
            "what_to_do": what_to_do,
            "fields": fields_with_tips,
            "companion": companion_text
        })
        step_id += 1

    return {
        "overview": overview,
        "total_steps": len(steps),
        "mandatory": sum(1 for s in steps if s["required"]),
        "optional": sum(1 for s in steps if not s["required"]),
        "steps": steps,
    }


def analyze_form_text(text: str) -> dict:
    """Backward-compatible wrapper."""
    return extract_action_steps(text)
