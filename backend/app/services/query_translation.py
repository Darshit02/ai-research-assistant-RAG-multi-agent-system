def translate_query(question, model):
    prompt = f"""
Translate this question to English.
Question:
{question}
Only return the translated sentence.
"""
    response = model.generate_content(prompt)
    return response.candidates[0].content.parts[0].text.strip()