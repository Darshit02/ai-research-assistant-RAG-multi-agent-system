from app.services.embedding_service import create_embeddings

chunks = [
    "Artificial intelligence helps researchers analyze data.",
    "Machine learning models improve predictions."
]

vectors = create_embeddings(chunks)

print(len(vectors))
print(vectors[0])