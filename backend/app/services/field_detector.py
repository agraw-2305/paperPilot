import re

KEYWORDS = [
    "name", "first name", "last name", "middle name", "initial",
    "date of birth", "dob", "age", "sex", "gender", "citizenship",
    "nationality", "country", "state", "city", "zip", "pin", "postal",
    "income", "occupation", "employer", "designation",
    "address", "signature", "date", "place",
    "account", "branch", "ifsc", "routing", "swift",
    "phone", "mobile", "telephone", "fax", "email",
    "passport", "pan", "aadhaar", "id", "license",
    "specialty", "certification", "references",
    "card number", "expiry", "expiration", "authorized signature",
    "application fee", "check enclosed",
    "roll", "class", "exam", "percentage", "course", "category", "certificate"
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

        # Common form layout: labels followed by underline blanks (____)
        if "_" in line and len(line) < 140:
            for m in re.finditer(r"([A-Za-z][A-Za-z0-9 ,/()'\-]{1,50})\s*_+", line):
                candidate = m.group(1).strip().strip(",")
                if 2 <= len(candidate) <= 60:
                    fields.add(candidate)

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
