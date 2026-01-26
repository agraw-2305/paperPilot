from typing import List, Dict


QUESTIONS = [
    {"key": "applicant_type", "question": "Are you a student / working professional / self-employed / other?", "type": "string"},
    {"key": "first_time", "question": "Is this your first time applying? (yes/no)", "type": "bool"},
    {"key": "country", "question": "Country of application?", "type": "string"},
]


def assess_applicability(steps: List[Dict], answers: Dict) -> List[Dict]:
    """
    Tag each step with an `applicability` value: 'required', 'conditional', or 'not_applicable'.

    Simple rules (keeps logic short and clean):
    - Identity Information, Verification Documents, Declarations -> required
    - Academic / Professional Information -> required for students, conditional otherwise
    - Contact / Address -> required
    - Preferences / Choices, Other Information -> conditional
    """

    applicant = (answers or {}).get("applicant_type", "").lower()
    first_time = (answers or {}).get("first_time")

    def decide(title: str, required_flag: bool) -> str:
        t = title.lower()
        if required_flag:
            return "required"
        if "academic" in t or "professional" in t:
            return "required" if applicant == "student" else "conditional"
        if "preferences" in t or "choices" in t or "other" in t:
            return "conditional"
        return "conditional"

    out = []
    for s in steps:
        title = s.get("title", "")
        # honor previously-determined required flag
        prev_required = bool(s.get("required"))
        applicability = decide(title, prev_required)

        # Example extra rule: if not first time, some verification may be relaxed
        if first_time is False and "verification" in title.lower():
            applicability = "conditional"

        new = dict(s)
        new["applicability"] = applicability
        out.append(new)

    return out


def get_questions() -> List[Dict]:
    return QUESTIONS
