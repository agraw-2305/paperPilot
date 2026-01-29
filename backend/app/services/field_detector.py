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

    def is_probably_value_line(line: str) -> bool:
        lower = line.lower()
        # OCR often merges label + value; if this looks like a value-heavy line, skip keyword detection.
        if re.search(r"\b\d{3,}\b", line) and "_" not in line and not line.endswith(":"):
            return True
        if re.search(r"\b(rs|inr|usd|eur|gbp)\b", lower) and re.search(r"\d", line):
            return True
        # Too many digits relative to letters → likely a value/ID line, not a label
        digits = sum(ch.isdigit() for ch in line)
        letters = sum(ch.isalpha() for ch in line)
        if digits >= 4 and letters > 0 and digits > letters:
            return True
        return False

    def clean_label_candidate(s: str) -> str:
        # Take only the label portion (before values) and normalize
        s = s.strip()
        if ":" in s:
            s = s.split(":", 1)[0]
        # Remove trailing numbers / amount fragments
        s = re.sub(r"\b\d.*$", "", s).strip()
        s = re.sub(r"[^A-Za-z0-9 /]", "", s).strip()
        s = re.sub(r"\s{2,}", " ", s).strip()
        return s

    for line in lines:
        lower = line.lower()

        if any(p in lower for p in IGNORE_PHRASES):
            continue

        # Label-like lines
        if line.endswith(":") and len(line) < 60:
            candidate = clean_label_candidate(line.rstrip(":"))
            if 2 <= len(candidate) <= 60:
                fields.add(candidate)

        # Common form layout: labels followed by underline blanks (____)
        if "_" in line and len(line) < 140:
            for m in re.finditer(r"([A-Za-z][A-Za-z0-9 ,/()'\-]{1,50})\s*_+", line):
                candidate = m.group(1).strip().strip(",")
                candidate = clean_label_candidate(candidate)
                if 2 <= len(candidate) <= 60:
                    fields.add(candidate)

        # Keyword-based detection
        if not is_probably_value_line(line):
            for kw in KEYWORDS:
                if kw in lower and len(line) < 120:
                    candidate = clean_label_candidate(line)
                    if 2 <= len(candidate) <= 60:
                        fields.add(candidate)

    return normalize_fields(list(fields))


def normalize_fields(fields: list[str]) -> list[str]:
    final = []
    for field in sorted(fields, key=len, reverse=True):
        if not any(field.lower() in f.lower() for f in final):
            final.append(field)
    return sorted(final)
