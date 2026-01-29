from .field_detector import detect_fields, normalize_fields
from .info_intent import classify_field, determine_required, map_risk_for_intent
from .companion_steps import explain_step

def infer_overview(text: str) -> str:
    if any(k in text.lower() for k in ["application", "form", "apply"]):
        return "Application Form"
    if any(k in text.lower() for k in ["registration", "register"]):
        return "Registration Form"
    if any(k in text.lower() for k in ["declaration", "undertaking", "affidavit"]):
        return "Declaration Form"
    return "Document Analysis"

def suggest_answer_for_field(field: str) -> str:
    lower = field.lower()
    if any(k in lower for k in ["reason", "purpose", "declaration", "undertaking", "statement"]):
        return generate_draft_for_field(field)
    if "father" in lower and "name" in lower:
        return "Enter your father’s full name as per official records."
    if "mother" in lower and "name" in lower:
        return "Enter your mother’s full name as per official records."
    if "full name" in lower or ("name" in lower and "father" not in lower and "mother" not in lower):
        return "Enter your full legal name exactly as on your ID/passport."
    if "date of birth" in lower or "dob" in lower:
        return "Use YYYY-MM-DD (example: 1998-04-21) as shown on your birth certificate/ID."
    if "date" in lower:
        return "Use YYYY-MM-DD (example: 2026-01-29) unless the form shows a different format."
    if "email" in lower:
        return "Use a working email (example: name@example.com) you check regularly."
    if "mobile" in lower or "phone" in lower:
        return "Include country code (example: +91 9876543210) and use digits only."
    if "address" in lower:
        return "Write: House/Flat, Street, Area, City, State, Postal Code, Country."
    if "passport" in lower:
        return "Enter your passport number without spaces (example: A1234567)."
    if "pan" in lower:
        return "Enter your PAN in ABCDE1234F format (10 characters)."
    if "aadhaar" in lower:
        return "Enter your 12-digit Aadhaar number (example: 123456789012)."
    if "ifsc" in lower:
        return "Enter your bank’s IFSC (11 characters, example: HDFC0000123)."
    if "account" in lower and "number" in lower:
        return "Enter your bank account number exactly as shown in your passbook."
    if "income" in lower or "salary" in lower:
        return "Enter the amount in numbers only (example: 350000)."
    if "year" in lower:
        return "Enter the 4-digit year (example: 2026)."
    if "percentage" in lower or "percent" in lower:
        return "Enter the percentage as a number (example: 78.5)."
    if "nominee" in lower and "name" in lower:
        return "Enter the full name of the person you wish to nominate."
    if "nominee" in lower:
        return "Enter the nominee’s details as requested on the form."
    if "guardian" in lower and "name" in lower:
        return "Enter your guardian’s full name as per official records."
    if "spouse" in lower and "name" in lower:
        return "Enter your spouse’s full name as per official records."
    if "relation" in lower:
        return "Specify the relationship (example: Father, Mother, Spouse, Guardian)."
    if "occupation" in lower:
        return "Enter your occupation (example: Engineer, Teacher, Business)."
    if "employer" in lower and "name" in lower:
        return "Enter your employer’s full name as per official records."
    if "branch" in lower:
        return "Enter your bank branch name (example: MG Road, Bengaluru)."
    if "bank" in lower and "name" in lower:
        return "Enter your bank’s full name (example: State Bank of India)."
    if "city" in lower:
        return "Enter the city name (example: Bengaluru)."
    if "state" in lower:
        return "Enter the state name (example: Karnataka)."
    if "country" in lower:
        return "Enter the country name (example: India)."
    if "pin" in lower or "postal" in lower or "zip" in lower:
        return "Enter the postal/ZIP code (example: 560001)."
    if "nationality" in lower:
        return "Enter your nationality (example: Indian)."
    if "gender" in lower:
        return "Select your gender as per your official ID (Male/Female/Other)."
    if "marital" in lower:
        return "Select your marital status (Single/Married/Divorced/Widowed)."
    return "Fill as requested on the form."

def generate_draft_for_field(field: str) -> str:
    lower = field.lower()
    if "reason" in lower or "purpose" in lower:
        return "I am applying because [concise reason: 1-2 sentences]."
    if "declaration" in lower or "undertaking" in lower:
        return "I hereby declare that the information provided is true to the best of my knowledge."
    if "statement" in lower:
        return "I confirm the statements above are accurate and complete."
    return "Draft text — please review and edit before submitting."

def extract_action_steps(text: str, context_questions: dict | None = None) -> dict:
    overview = infer_overview(text)
    fields = detect_fields(text)
    grouped = {}
    for f in fields:
        intent = classify_field(f)
        grouped.setdefault(intent, []).append(f)
    steps = []
    step_id = 1
    for intent, intent_fields in grouped.items():
        required = determine_required(intent, context_questions)
        risk, risk_reason, remediation_tip = map_risk_for_intent(intent)
        what_to_do = f"Fill: {', '.join(intent_fields)}"
        def field_tip(field):
            lower = field.lower()
            if "date of birth" in lower or "dob" in lower:
                return "Use the same date format the form shows (example: 1998-04-21)."
            if "date" in lower:
                return "Follow the form’s date format (avoid ambiguous 01/02/03)."
            if "email" in lower:
                return "Use a working email and check for typos."
            if "mobile" in lower or "phone" in lower:
                return "Include country code if the form asks (example: +91 9876543210)."
            if "address" in lower:
                return "Include house/flat, street, city, state, and postal code."
            if "pan" in lower:
                return "PAN format is ABCDE1234F (10 characters)."
            if "aadhaar" in lower:
                return "Enter 12 digits; don’t add spaces unless the form shows them."
            if "passport" in lower:
                return "Enter passport number without spaces (example: A1234567)."
            if "ifsc" in lower:
                return "IFSC is 11 characters (example: HDFC0000123)."
            if "account" in lower and "number" in lower:
                return "Enter digits exactly; do not mask any digits."
            if "income" in lower or "salary" in lower:
                return "Use numbers only (no '/-', no words)."
            if "marks" in lower or "percentage" in lower:
                return "Enter the exact number requested (percent vs CGPA)."
            if "document" in lower:
                return "Upload a clear file; ensure it meets size/type rules."
            return "Fill as requested on the form."
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

def get_reason(intent: str) -> str:
    reasons = {
        "Identity Information": "To identify who is applying for this form.",
        "Contact Information": "To communicate important updates and notifications.",
        "Address Information": "To verify the applicant’s place of residence.",
        "Academic / Professional Information": "To assess eligibility or background.",
        "Verification Documents": "To verify authenticity of submitted details.",
        "Preferences / Choices": "To process your selections correctly.",
        "Declarations": "To confirm that provided information is correct."
    }
    return reasons.get(intent, "This information is required to complete the application.")
