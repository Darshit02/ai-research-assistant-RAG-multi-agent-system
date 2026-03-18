import json
import os
from collections import defaultdict

import google.generativeai as genai
from openai import OpenAI
from anthropic import Anthropic
from google.api_core import exceptions

from app.database.models.chat import ChatHistory
from app.database.models.chat_messages import ChatMessage
from app.database.models.document import Document
from app.database.models.model import User
from app.database.models.usage import Usage
from app.database.models.chat_session import ChatSession

from app.rag.retrieval import retrieve_context
from app.services.embedding_service import create_embeddings
from app.services.similarity import cosine_similarity
from app.services.retrieval_memory import get_cached_chunks, store_retrieval_memory
from app.services.response_parser import parse_structured_answer
from app.services.query_planner import plan_queries
from app.services.token_counter import estimate_tokens
from app.services.query_translation import translate_query
from app.services.query_analyzer import analyze_query

DEFAULT_MODEL = "gemini-2.5-flash"

def _get_api_key(user, provider: str):
    if provider == "google":
        return user.gemini_api_key or user.api_key or os.getenv("GEMINI_API_KEY")
    return None

def _get_provider(model_name: str):
    return "google"

def get_model(db, user_id):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    preferred_model = user.preferred_model or DEFAULT_MODEL
    provider = _get_provider(preferred_model)
    api_key = _get_api_key(user, provider)
    
    if not api_key:
        return None

    if provider == "google":
        genai.configure(api_key=api_key)
        return genai.GenerativeModel(preferred_model)
    elif provider == "openai":
        return OpenAI(api_key=api_key)
    elif provider == "anthropic":
        return Anthropic(api_key=api_key)
    return None
_get_model = get_model

def generate_answer(question: str, user_id: str, session_id: str, db, document_ids: list[str]):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    
    preferred_model = (session.model_name if session and session.model_name else user.preferred_model) or DEFAULT_MODEL
    language = (session.language if session and session.language else "English")
    
    provider = _get_provider(preferred_model)
    api_key = _get_api_key(user, provider)

    if not api_key:
        return {"error": f"API Key for {provider} not found. Please check your settings."}

    question_embedding = create_embeddings([question])[0]
    history_cache = db.query(ChatHistory).filter(ChatHistory.user_id == user_id).all()
    for record in history_cache:
        old_embedding = json.loads(record.embedding)
        if cosine_similarity(question_embedding, old_embedding) > 0.95:
            structured = parse_structured_answer(record.answer)
            formatted = ""
            if structured.get("summary", "").strip(): formatted += f"### Summary\n{structured['summary'].strip()}\n\n"
            if structured.get("key_findings", "").strip(): formatted += f"### Key Findings\n{structured['key_findings'].strip()}\n\n"
            if structured.get("evidence", "").strip(): formatted += f"### Evidence\n{structured['evidence'].strip()}\n\n"
            if structured.get("conclusion", "").strip(): formatted += f"### Conclusion\n{structured['conclusion'].strip()}"
            
            if not formatted.strip(): formatted = record.answer # Fallback
            
            return {**structured, "answer": formatted, "citations": [], "cached": True}

    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    language = session.language or "English"

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    history = "\n".join(f"{m.role}: {m.content}" for m in messages)
    context_chunks = get_cached_chunks(session_id, question_embedding, db)
    if not context_chunks:
        model_instance = genai.GenerativeModel(preferred_model)
        english_question, sub_queries = analyze_query(question, model_instance)
        
        all_chunks = []
        for q in set(sub_queries):
            all_chunks.extend(retrieve_context(q, document_ids))
        
        if not all_chunks:
            return {
                "summary": "No relevant context found in the selected documents.",
                "key_findings": "",
                "evidence": "",
                "conclusion": "",
                "citations": []
            }

        seen = set()
        context_chunks = []
        for c in all_chunks:
            key = (c["text"], c["page"], c["document_id"])
            if key not in seen:
                seen.add(key)
                context_chunks.append(c)
        store_retrieval_memory(session_id, question_embedding, context_chunks, db)

    context_text = "\n\n".join([f"[Doc: {c['document_id']}, Page: {c['page']}] {c['text']}" for c in context_chunks])

    prompt = f"""
    You are an AI research assistant. Your goal is to answer the user question accurately based ONLY on the provided context.
    
    Context:
    {context_text}
    
    Question:
    {question}
    
    Instructions:
    1. Respond in {language}.
    2. Use the following structured format:
       Summary: <brief overview>
       Key Findings: - <point 1>
       Evidence: - <fact with [Page X] citation>
       Conclusion: <final insight>
    3. You MUST include page numbers like [Page X] in your answer when referencing facts.
    4. If the context doesn't contain the answer, state that you don't know based on the provided documents.
    """

    answer = ""
    try:
        if provider == "openai":
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=preferred_model,
                messages=[{"role": "user", "content": prompt}]
            )
            answer = response.choices[0].message.content
        elif provider == "anthropic":
            client = Anthropic(api_key=api_key)
            response = client.messages.create(
                model=preferred_model,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            answer = response.content[0].text
        else:
            genai.configure(api_key=api_key)
            gemini_model = genai.GenerativeModel(preferred_model)
            response = gemini_model.generate_content(prompt)
            answer = response.text
    except exceptions.ResourceExhausted:
        error_message = "API key reached limit. Please check your plan or try again later."
        db.add(ChatMessage(session_id=session_id, role="user", content=question))
        db.add(ChatMessage(
            session_id=session_id, 
            role="error", 
            content=error_message
        ))
        db.commit()
        return {"error": error_message, "role": "error"}
    except Exception as e:
        return {"error": f"Model error ({provider}): {str(e)}"}
    
    structured = parse_structured_answer(answer)
    formatted_markdown = ""
    if structured.get("summary", "").strip(): formatted_markdown += f"### Summary\n{structured['summary'].strip()}\n\n"
    if structured.get("key_findings", "").strip(): formatted_markdown += f"### Key Findings\n{structured['key_findings'].strip()}\n\n"
    if structured.get("evidence", "").strip(): formatted_markdown += f"### Evidence\n{structured['evidence'].strip()}\n\n"
    if structured.get("conclusion", "").strip(): formatted_markdown += f"### Conclusion\n{structured['conclusion'].strip()}"
    
    if not formatted_markdown.strip():
        formatted_markdown = answer

    citations = [{"document_id": c["document_id"], "page": c["page"], "text": c["text"]} for c in context_chunks[:5]]
    db.add(ChatMessage(session_id=session_id, role="user", content=question))
    db.add(ChatMessage(
        session_id=session_id, 
        role="assistant", 
        content=formatted_markdown,
        citations=json.dumps(citations)
    ))
    db.add(ChatHistory(user_id=user_id, question=question, answer=formatted_markdown, embedding=json.dumps(question_embedding.tolist())))
    db.commit()

    return {**structured, "answer": formatted_markdown, "citations": citations}

def stream_answer(question: str, user_id: str, db):
    user = db.query(User).filter(User.id == user_id).first()
    preferred_model = user.preferred_model or DEFAULT_MODEL
    provider = _get_provider(preferred_model)
    api_key = _get_api_key(user, provider)
    
    if provider == "google":
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(preferred_model)
        response = model.generate_content(question, stream=True)
        for chunk in response:
            yield chunk.text
    else:
        yield "Streaming not yet fully implemented for OpenAI/Anthropic. Using standard response instead."
        res = generate_answer(question, user_id, "active_session", db, [])
        yield res.get("answer", str(res))

