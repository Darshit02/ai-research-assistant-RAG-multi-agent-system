def plan_queries(question: str, model):

    planner_prompt = f"""
You are an AI research planner.

Break the user question into smaller research questions.

User question:
{question}

Return a list of 2-4 sub-questions.
"""

    response = model.generate_content(planner_prompt)

    text = response.candidates[0].content.parts[0].text

    queries = [
        q.strip("- ").strip()
        for q in text.split("\n")
        if q.strip()
    ]

    return queries[:4]