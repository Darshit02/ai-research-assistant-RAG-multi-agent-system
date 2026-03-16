import json
from app.services.similarity import cosine_similarity
from app.database.models.retrieval_memory import RetrievalMemory


def get_cached_chunks(session_id, question_embedding, db):
    records = db.query(RetrievalMemory).filter(
        RetrievalMemory.session_id == session_id
    ).all()

    for r in records:
        old_embedding = json.loads(r.embedding)
        similarity = cosine_similarity(
            question_embedding,
            old_embedding
        )
        if similarity > 0.88:
            return json.loads(r.chunks)

    return None


def store_retrieval_memory(session_id, question_embedding, chunks, db):

    record = RetrievalMemory(
        session_id=session_id,
        embedding=json.dumps(question_embedding.tolist()),
        chunks=json.dumps(chunks)
    )

    db.add(record)
    db.commit()
