def generate_document_insights(text, model):

    prompt = f"""
Analyze this research document.

Text:
{text[:4000]}

Return:

Title:
Summary:
Key Points:
"""

    response = model.generate_content(prompt)

    return response.candidates[0].content.parts[0].text
