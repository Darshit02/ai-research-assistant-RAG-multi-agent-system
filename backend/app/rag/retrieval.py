import json
from app.services.embedding_service import create_embeddings
from app.vector.vector_store import search_similar_chunks
from app.services.hybrid_search import keyword_search
from app.services.similarity import cosine_similarity
from app.database.models.chat import ChatHistory


def retrieve_context(question: str, document_ids):
    embedding = create_embeddings([question])[0]
    vector_chunks = search_similar_chunks(embedding, document_ids)
    keyword_chunks = keyword_search(question, vector_chunks)
    combined = vector_chunks + keyword_chunks
    seen = set()
    results = []

    for c in combined:
        key = (c["text"], c["page"])
        if key not in seen:
            seen.add(key)
            results.append(c)

    return results[:5]

def find_cached_answer(question_embedding, user_id, db):

    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == user_id
    ).all()

    for record in history:

        old_embedding = json.loads(record.embedding)

        similarity = cosine_similarity(
            question_embedding,
            old_embedding
        )

        if similarity > 0.9:
            return record.answer

    return None