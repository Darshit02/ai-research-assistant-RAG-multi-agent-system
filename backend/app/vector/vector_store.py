import chromadb

client = chromadb.PersistentClient(path="vector_store")
collection = client.get_or_create_collection(name="research_documents")


def store_embeddings(chunks, embeddings, document_id):
    ids = [f"{document_id}_{i}" for i in range(len(chunks))]
    documents = [chunk["text"] for chunk in chunks]
    metadatas = [
        {
            "document_id": document_id,
            "page": chunk["page"]
        }
        for chunk in chunks
    ]
    collection.add(
        ids=ids,
        embeddings=embeddings.tolist(),
        documents=documents,
        metadatas=metadatas
    )

    print(f"Successfully stored {len(chunks)} chunks in vector store.")


def search_similar_chunks(query_embedding, document_ids, n_results=5):

    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=n_results,
        where={"document_id": {"$in": document_ids}}
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    chunks = []

    for doc, meta in zip(documents, metadatas):

        chunks.append({
            "text": doc,
            "page": meta["page"],
            "document_name": meta["document_name"],
            "document_id": meta["document_id"]
        })

    return chunks
