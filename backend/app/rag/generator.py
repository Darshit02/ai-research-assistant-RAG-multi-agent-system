import os

import google.generativeai as genai

from app.database.models.chat_messages import ChatMessage
from app.database.models.document import Document
from app.rag.retrieval import retrieve_context


genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-flash")


def generate_answer(question: str, user_id: int, session_id: int, db):
    # Get previous conversation
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    history = "\n".join(f"{m.role}: {m.content}" for m in messages)

    docs = db.query(Document).filter(Document.user_id == user_id).all()
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
    response = model.generate_content(prompt)
    answer = response.candidates[0].content.parts[0].text

    # Save user message
    db.add(
        ChatMessage(
            session_id=session_id,
            role="user",
            content=question,
        )
    )
    # Save assistant message
    db.add(
        ChatMessage(
            session_id=session_id,
            role="assistant",
            content=answer,
        )
    )
    db.commit()

    return {"answer": answer, "citations": citations}

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

    response = model.generate_content(
        prompt,
        stream=True
    )

    for chunk in response:
        if chunk.text:
            yield chunk.text