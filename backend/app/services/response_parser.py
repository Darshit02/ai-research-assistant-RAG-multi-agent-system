def parse_structured_answer(text):
    sections = {
        "summary": "",
        "key_findings": "",
        "evidence": "",
        "comparison": "",
        "conclusion": ""
    }
    current = None
    for line in text.split("\n"):
        line_lower = line.lower()
        if "summary:" in line_lower:
            current = "summary"
            continue
        elif "key findings:" in line_lower:
            current = "key_findings"
            continue
        elif "evidence:" in line_lower:
            current = "evidence"
            continue
        elif "comparison:" in line_lower:
            current = "comparison"
            continue
        elif "conclusion:" in line_lower:
            current = "conclusion"
            continue
        if current:
            sections[current] += line + "\n"
    return sections