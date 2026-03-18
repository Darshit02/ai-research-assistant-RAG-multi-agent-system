def generate_document_insights(text, model):
    prompt = f"""
Analyze this research document.

Text:
{text[:4000]}

Return exactly in this format:
Title: [A concise title]
Summary: [A 2-3 sentence summary]
Key Points: [3-5 bullet points]
"""

    try:
        provider = "google"
        if hasattr(model, "chat"): 
             provider = "openai"
        elif hasattr(model, "messages"): 
             provider = "anthropic"
        
        import google.generativeai as genai
        from openai import OpenAI
        from anthropic import Anthropic

        if isinstance(model, genai.GenerativeModel):
            response = model.generate_content(prompt)
            return response.text
        elif isinstance(model, OpenAI):
            response = model.chat.completions.create(
                model="gpt-4o-mini", # Fallback or use model.model if stored
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
        elif isinstance(model, Anthropic):
            response = model.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        else:
            if hasattr(model, "generate_content"):
                return model.generate_content(prompt).text
            return "Could not generate insights: Unknown model provider"
            
    except Exception as e:
        return f"Error generating insights: {str(e)}"
