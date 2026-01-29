import re

def clean_text(text: str) -> str:
    # Normalize whitespace
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\u00a0", " ", text)

    # Common OCR artifacts around amounts/currency
    text = re.sub(r"(\d)\s*[pP]\b", r"\1", text)
    text = re.sub(r"(\d)\s*[/\\-]\s*\b", r"\1 ", text)

    # Clean up awkward spacing around punctuation
    text = re.sub(r"\s+([,:;])", r"\1", text)
    text = re.sub(r"([(/])\s+", r"\1", text)
    text = re.sub(r"\s+([)/])", r"\1", text)

    # Normalize newlines
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()
