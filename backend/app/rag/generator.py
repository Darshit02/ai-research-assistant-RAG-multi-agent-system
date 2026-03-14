import json
import os

import google.generativeai as genai

from app.database.models.chat import ChatHistory
from app.database.models.chat_messages import ChatMessage
from app.database.models.document import Document
from app.database.models.model import User
from app.rag.retrieval import retrieve_context
from app.services.embedding_service import create_embeddings
from app.services.similarity import cosine_similarity

DEFAULT_MODEL = "models/gemini-2.5-flash"

def _get_model(db, user_id: int):
    """Configure genai and return a GenerativeModel for the given user (API key + preferred model)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    api_key = user.api_key or os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(user.preferred_model or DEFAULT_MODEL)


def generate_answer(question: str, user_id: int, session_id: int, db):
    question_embedding = create_embeddings([question])[0]
    history_cache = db.query(ChatHistory).filter(
        ChatHistory.user_id == user_id
    ).all()

    for record in history_cache:

        old_embedding = json.loads(record.embedding)

        similarity = cosine_similarity(
            question_embedding,
            old_embedding
        )

        if similarity > 0.90:
            print("Returning cached answer")

            return {
                "answer": record.answer,
                "citations": []
            }
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )

    history = "\n".join(f"{m.role}: {m.content}" for m in messages)
    docs = db.query(Document).filter(
        Document.user_id == user_id
    ).all()

    document_ids = [doc.id for doc in docs]

    context_chunks = retrieve_context(question, document_ids)

    context = "\n\n".join(
        f"{c['text']} [Page {c['page']}]" for c in context_chunks
    )

    citations = [
        {"document_id": c["document_id"], "page": c["page"]}
        for c in context_chunks
    ]
    prompt = f"""
You are an AI research assistant.

Conversation history:
{history}

Context from documents:
{context}

User question:
{question}

Answer clearly.
"""
    model = _get_model(db, user_id)
    response = model.generate_content(prompt)

    answer = response.candidates[0].content.parts[0].text

    db.add(
        ChatMessage(
            session_id=session_id,
            role="user",
            content=question
        )
    )

    db.add(
        ChatMessage(
            session_id=session_id,
            role="assistant",
            content=answer
        )
    )

    cache = ChatHistory(
        user_id=user_id,
        question=question,
        answer=answer,
        embedding=json.dumps(question_embedding.tolist())
    )

    db.add(cache)

    db.commit()

    return {
        "answer": answer,
        "citations": citations
    }


def stream_answer(question: str, user_id: int, db):

    docs = db.query(Document).filter(Document.user_id == user_id).all()
    document_ids = [doc.id for doc in docs]

    context_chunks = retrieve_context(question, document_ids)

    context = "\n\n".join(
        [
            f"Document: {c['document_name']} (Page {c['page']})\n{c['text']}"
            for c in context_chunks
        ]
    )

    prompt = f"""
You are an AI research assistant.

Context:
{context}

Question:
{question}

Answer clearly.
"""
    model = _get_model(db, user_id)
    response = model.generate_content(
        prompt,
        stream=True
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text
