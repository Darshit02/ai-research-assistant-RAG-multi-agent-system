from google.api_core import exceptions

def analyze_query(question: str, model):
    prompt = f"""
You are an AI research assistant. Analyze the user's question and perform the following tasks:

1. Translate the question to English if it is not already in English.
2. Break the question into 2-4 specific research sub-questions/search queries.

User Question:
{question}

Return your response in STRICT JSON format:
{{
  "translated_question": "...",
  "sub_queries": ["...", "..."]
}}
"""

    try:
        response = model.generate_content(prompt)
        text = response.candidates[0].content.parts[0].text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        data = json.loads(text)
        return data.get("translated_question", question), data.get("sub_queries", [question])
    except exceptions.ResourceExhausted:
        raise
    except Exception as e:
        print(f"Error analyzing query: {e}")
        return question, [question]
