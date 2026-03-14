from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank_chunks(question, chunks, top_k=3):

    pairs = [(question, chunk["text"]) for chunk in chunks]

    scores = reranker.predict(pairs)

    ranked = sorted(
        zip(chunks, scores),
        key=lambda x: x[1],
        reverse=True
    )

    best_chunks = [r[0] for r in ranked[:top_k]]

    return best_chunks