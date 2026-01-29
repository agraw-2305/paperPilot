INTENT_MAP = {
    "Identity Information": [
        "name", "father", "mother", "gender", "dob", "date of birth"
    ],
    "Contact Information": [
        "mobile", "phone", "email"
    ],
    "Address Information": [
        "address", "pin", "district", "state", "country"
    ],
    "Academic / Professional Information": [
        "class", "school", "college", "roll", "jee",
        "exam", "board", "percentage", "year"
    ],
    "Verification Documents": [
        "aadhaar", "pan", "passport", "id", "certificate"
    ],
    "Preferences / Choices": [
        "course", "branch", "category", "quota", "center"
    ],
    "Declarations": [
        "declaration", "signature", "undertaking"
    ]
}


def classify_field(field: str) -> str:
    lower = field.lower()
    for intent, keywords in INTENT_MAP.items():
        if any(k in lower for k in keywords):
            return intent
    return "Other Information"

def determine_required(intent: str, context_questions: dict | None = None) -> bool:
    # Default logic: identity and declarations are usually required
    if intent in ["Identity Information", "Declarations"]:
        return True
    # Contact and address are usually required
    if intent in ["Contact Information", "Address Information"]:
        return True
    return False

def map_risk_for_intent(intent: str) -> tuple[str, str, str]:
    risk_map = {
        "Identity Information": ("high", "Incorrect identity can lead to rejection.", "Double-check spelling and match with official documents."),
        "Contact Information": ("medium", "Communication issues if wrong.", "Use a working email/phone you check regularly."),
        "Address Information": ("medium", "Verification failures if mismatched.", "Enter the exact address as per ID/utility bills."),
        "Academic / Professional Information": ("medium", "Eligibility depends on accuracy.", "Refer to official mark sheets/certificates."),
        "Verification Documents": ("high", "Invalid documents cause rejection.", "Upload clear, valid, and unexpired documents."),
        "Preferences / Choices": ("low", "Affects allocation/branching.", "Select carefully; changes may be limited later."),
        "Declarations": ("high", "False declarations can have legal consequences.", "Read and understand before agreeing."),
    }
    return risk_map.get(intent, ("low", "Fill carefully.", "Review before submission."))
