import re

KEYWORDS = [
    "name", "date of birth", "dob", "pan", "aadhaar",
    "income", "occupation", "address", "branch",
    "signature", "account", "phone", "email"
]

IGNORE_PHRASES = [
    "account opening form",
    "photograph",
    "as per census",
    "facility from any other bank"
]


def detect_fields(text: str) -> list[str]:
    fields = set()
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    for line in lines:
        lower = line.lower()

        # Ignore known non-fields
        if any(p in lower for p in IGNORE_PHRASES):
            continue

        # Rule 1: label-like lines
        if line.endswith(":") and len(line) < 60:
            fields.add(line.rstrip(":"))

        # Rule 2: keyword match
        for kw in KEYWORDS:
            if kw in lower and len(line) < 80:
                cleaned = re.sub(r"[^A-Za-z0-9 /]", "", line)
                fields.add(cleaned.strip())

    return normalize_fields(list(fields))


def normalize_fields(fields: list[str]) -> list[str]:
    """
    Remove duplicates and keep the most descriptive labels.
    """
    final = []
    for field in sorted(fields, key=len, reverse=True):
        if not any(field.lower() in f.lower() for f in final):
            final.append(field)
    return sorted(final)
