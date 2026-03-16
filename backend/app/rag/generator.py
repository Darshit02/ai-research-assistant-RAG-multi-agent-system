import json
import os

import google.generativeai as genai
from collections import defaultdict
from app.services.query_planner import plan_queries
from app.database.models.chat import ChatHistory
from app.database.models.chat_messages import ChatMessage
from app.database.models.document import Document
from app.database.models.model import User
from app.rag.retrieval import retrieve_context
from app.services.embedding_service import create_embeddings
from app.services.similarity import cosine_similarity
from app.services.retrieval_memory import get_cached_chunks, store_retrieval_memory
from app.services.response_parser import parse_structured_answer

DEFAULT_MODEL = "models/gemini-2.5-flash"


def _get_model(db, user_id: int):
    """Configure genai and return a GenerativeModel for the given user (API key + preferred model)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    api_key = user.api_key or os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(user.preferred_model or DEFAULT_MODEL)


def generate_answer(question: str, user_id: int, session_id: int, db ,document_ids: list[int],):
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

    if not docs:
        return {
            "summary": "",
            "key_findings": "",
            "evidence": "",
            "comparison": "",
            "conclusion": "",
            "citations": [],
            "message": (
                "I could not find any uploaded documents for your account, "
                "so I wasn't able to answer this question. "
                "Please upload one or more PDFs and try again."
            ),
        }

    

    model = _get_model(db, user_id)
    cached_chunks = get_cached_chunks(
        session_id,
        question_embedding,
        db
    )

    if cached_chunks:
        context_chunks = cached_chunks
    else:
        sub_questions = plan_queries(question, model)

        all_chunks = []

        for q in sub_questions:
            chunks = retrieve_context(q, document_ids)
            all_chunks.extend(chunks)

        if not all_chunks:
            return {
                "summary": "",
                "key_findings": "",
                "evidence": "",
                "comparison": "",
                "conclusion": "",
                "citations": [],
                "message": (
                    "I could not find any relevant content in your documents "
                    "to answer this question. "
                    "Try rephrasing your question or uploading more detailed documents."
                ),
            }

        seen = set()
        context_chunks = []

        for c in all_chunks:
            key = (c["text"], c["page"], c["document_id"])
            if key not in seen:
                seen.add(key)
                context_chunks.append(c)
        store_retrieval_memory(
            session_id,
            question_embedding,
            context_chunks,
            db
        )
    grouped_chunks = defaultdict(list)
    for chunk in context_chunks:
        grouped_chunks[chunk["document_id"]].append(chunk)
    document_analyses = []
    for doc_id, chunks in grouped_chunks.items():
        doc_context = "\n\n".join(
            f"{c['text']} [Page {c['page']}]"
            for c in chunks
        )
        doc_prompt = f"""
You are analyzing a research document.

Document Context:
{doc_context}

Question:
{question}

Explain how this document answers the question.
"""

        doc_response = model.generate_content(doc_prompt)
        summary = doc_response.candidates[0].content.parts[0].text
        document_analyses.append(summary)
    combined_analysis = "\n\n".join(document_analyses)

    final_prompt = f"""
You are an AI research assistant.

Conversation history:
{history}

Multiple documents were analyzed.

Document analyses:
{combined_analysis}

User question:
{question}

Return the response in the following structured format:

Summary:
<short overview>

Key Findings:
- finding 1
- finding 2

Evidence:
- important supporting facts from documents

Comparison:
<compare documents if relevant>

Conclusion:
<final insight>
"""

    response = model.generate_content(final_prompt)

    answer = response.candidates[0].content.parts[0].text
    structured = parse_structured_answer(answer)
    top_evidence = context_chunks[:3]

    citations = [
        {
            "document_id": c["document_id"],
            "page": c["page"],
            "text": c["text"]
        }
        for c in top_evidence
    ]

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
        "summary": structured["summary"].strip(),
        "key_findings": structured["key_findings"].strip(),
        "evidence": structured["evidence"].strip(),
        "comparison": structured["comparison"].strip(),
        "conclusion": structured["conclusion"].strip(),
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
