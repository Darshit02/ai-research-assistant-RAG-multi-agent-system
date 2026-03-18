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
            sections[current] += line.split(":", 1)[1].strip() + "\n"
        elif "key findings:" in line_lower:
            current = "key_findings"
            sections[current] += line.split(":", 1)[1].strip() + "\n"
        elif "evidence:" in line_lower:
            current = "evidence"
            sections[current] += line.split(":", 1)[1].strip() + "\n"
        elif "comparison:" in line_lower:
            current = "comparison"
            sections[current] += line.split(":", 1)[1].strip() + "\n"
        elif "conclusion:" in line_lower:
            current = "conclusion"
            sections[current] += line.split(":", 1)[1].strip() + "\n"
        elif current:
            sections[current] += line + "\n"
    return sections