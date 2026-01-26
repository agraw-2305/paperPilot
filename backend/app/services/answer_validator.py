import re


def validate_answer(field: str, answer: str) -> dict:
    """
    Generic answer validator.
    Returns:
    {
        "valid": bool,
        "message": str
    }
    """

    field_lower = field.lower()
    answer = answer.strip()

    if not answer:
        return {
            "valid": False,
            "message": "This field cannot be left empty."
        }

    # ---------- CONTACT ----------

    if "mobile" in field_lower or "phone" in field_lower:
        if not re.fullmatch(r"\d{10}", answer):
            return {
                "valid": False,
                "message": "Enter a valid 10-digit mobile number."
            }

    if "email" in field_lower:
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", answer):
            return {
                "valid": False,
                "message": "Enter a valid email address."
            }

    # ---------- DATES ----------

    if "date" in field_lower or "dob" in field_lower:
        if not re.fullmatch(r"\d{2}/\d{2}/\d{4}", answer):
            return {
                "valid": False,
                "message": "Use date format DD/MM/YYYY."
            }

    # ---------- NUMERIC ----------

    if "percentage" in field_lower or "percent" in field_lower:
        try:
            value = float(answer)
            if not (0 <= value <= 100):
                raise ValueError
        except ValueError:
            return {
                "valid": False,
                "message": "Enter a valid percentage between 0 and 100."
            }

    if "year" in field_lower:
        if not re.fullmatch(r"\d{4}", answer):
            return {
                "valid": False,
                "message": "Enter a valid 4-digit year."
            }

    # ---------- IDENTIFIERS ----------

    if "aadhaar" in field_lower:
        if not re.fullmatch(r"\d{12}", answer.replace(" ", "")):
            return {
                "valid": False,
                "message": "Aadhaar number must be 12 digits."
            }

    if "pan" in field_lower:
        if not re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", answer.upper()):
            return {
                "valid": False,
                "message": "PAN must be in format ABCDE1234F."
            }

    if "passport" in field_lower:
        if not re.fullmatch(r"[A-Z][0-9]{7}", answer.upper()):
            return {
                "valid": False,
                "message": "Enter a valid passport number."
            }

    # ---------- FALLBACK ----------

    if len(answer) < 2:
        return {
            "valid": False,
            "message": "Input seems too short."
        }

    return {
        "valid": True,
        "message": "Looks good."
    }
