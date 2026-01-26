import re

KEYWORDS = [
    "name", "date of birth", "dob", "pan", "aadhaar",
    "income", "occupation", "address", "branch",
    "signature", "account", "phone", "mobile",
    "email", "roll", "class", "exam", "percentage",
    "course", "category", "passport", "certificate"
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

        if any(p in lower for p in IGNORE_PHRASES):
            continue

        # Label-like lines
        if line.endswith(":") and len(line) < 60:
            fields.add(line.rstrip(":"))

        # Keyword-based detection
        for kw in KEYWORDS:
            if kw in lower and len(line) < 80:
                cleaned = re.sub(r"[^A-Za-z0-9 /]", "", line)
                fields.add(cleaned.strip())

    return normalize_fields(list(fields))


def normalize_fields(fields: list[str]) -> list[str]:
    final = []
    for field in sorted(fields, key=len, reverse=True):
        if not any(field.lower() in f.lower() for f in final):
            final.append(field)
    return sorted(final)
