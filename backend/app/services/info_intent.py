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
