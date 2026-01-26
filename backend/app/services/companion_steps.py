from backend.app.services.info_intent import classify_field


def generate_companion_steps(fields: list[str]) -> list[dict]:
    grouped = {}

    # Group fields by intent
    for field in fields:
        intent = classify_field(field)
        grouped.setdefault(intent, []).append(field)

    steps = []
    step_no = 1

    for intent, intent_fields in grouped.items():
        steps.append({
            "step": step_no,
            "title": intent,
            "why_this_step": get_reason(intent),
            "completion_tip": "Fill all fields carefully before moving to the next step.",
            "fields": [build_field_guide(f) for f in intent_fields],
            "next_step_hint": "After completing this section, continue to the next one."
        })
        step_no += 1

    return steps


# ---------------- HELPERS ---------------- #

def build_field_guide(field: str) -> dict:
    return {
        "label": field,
        "what_it_is": explain_what(field),
        "how_to_fill": explain_how(field),
        "where_to_find": explain_where(field),
        "common_mistakes": explain_mistakes(field),
        "example_answer": generate_example(field)
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


def explain_what(field: str) -> str:
    return f"This field asks for your {field.lower()}."


def explain_how(field: str) -> str:
    return f"Fill '{field}' exactly as mentioned in your official documents."


def explain_where(field: str) -> str:
    lower = field.lower()

    if any(k in lower for k in ["aadhaar", "pan", "passport", "id"]):
        return "Refer to your government-issued identity document."
    if any(k in lower for k in ["percentage", "marks", "roll", "exam"]):
        return "Refer to your marksheet, admit card, or academic records."
    if "address" in lower:
        return "Use your address exactly as mentioned in official records."
    if "mobile" in lower or "phone" in lower:
        return "Use an active phone number that you check regularly."

    return "Use the relevant official record or document."


def explain_mistakes(field: str) -> str:
    return "Spelling errors, incorrect format, or mismatch with official documents."


def generate_example(field: str) -> str:
    lower = field.lower()

    if "date" in lower:
        return "DD/MM/YYYY"
    if "mobile" in lower or "phone" in lower:
        return "9876543210"
    if "percentage" in lower:
        return "92.4"
    if "aadhaar" in lower:
        return "1234 5678 9012"
    if "pan" in lower:
        return "ABCDE1234F"

    return "Example value"


def explain_step(step: dict) -> dict:
    """
    Return concise companion guidance for a given step.

    Output fields:
    - why: short reason
    - if_skipped: what happens if skipped
    - what_good_looks_like: short example of a correct answer
    - drafts: optional dict of field->draft for allowed fields
    """
    title = step.get("title", "Section")
    why = step.get("why_this_step") or step.get("why") or get_reason(title)

    if_skipped = "Skipping this may delay or jeopardize your application."
    if "verification" in title.lower() or "declaration" in title.lower():
        if_skipped = "Skipping this may cause rejection or requests for resubmission."
    if "identity" in title.lower():
        if_skipped = "Incorrect identity details often lead to outright rejection."

    what_good = "Provide complete, accurate details matching your official documents."
    fields = step.get("fields", [])

    drafts = {}
    for f in fields:
        lf = f.lower()
        if any(k in lf for k in ["reason", "declaration", "statement", "purpose"]):
            # simple template draft
            drafts[f] = generate_draft_for_field(f)

    out = {
        "why": why,
        "if_skipped": if_skipped,
        "what_good_looks_like": what_good,
    }
    if drafts:
        out["drafts"] = drafts

    return out


def generate_draft_for_field(field: str) -> str:
    lower = field.lower()
    if "reason" in lower or "purpose" in lower:
        return "I am applying because [concise reason: 1-2 sentences]."
    if "declaration" in lower or "undertaking" in lower:
        return "I hereby declare that the information provided is true to the best of my knowledge."
    if "statement" in lower:
        return "I confirm the statements above are accurate and complete."
    return "Draft text — please review and edit before submitting."
