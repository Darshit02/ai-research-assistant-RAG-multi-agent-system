from app.services.embedding_service import create_embeddings
from app.vector_store.vector_store import store_embeddings

chunks = [
    "Artificial intelligence is transforming research.",
    "Machine learning models analyze data efficiently."
]

embeddings = create_embeddings(chunks)

store_embeddings(chunks, embeddings, document_id=1)