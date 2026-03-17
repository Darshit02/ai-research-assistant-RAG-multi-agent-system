import chromadb

client = chromadb.PersistentClient(path="vector_store")
collection = client.get_or_create_collection(name="research_documents")


def store_embeddings(chunks, embeddings, document_id):
    ids = [f"{document_id}_{i}" for i in range(len(chunks))]
    documents = [chunk["text"] for chunk in chunks]
    metadatas = [
        {
            "document_id": document_id,
            "page": chunk["page"],
            "document_name": chunk.get("document_name"),
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
    if document_ids:
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
            where={"document_id": {"$in": document_ids}}
        )
    else:
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
        )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    chunks = []

    for doc, meta in zip(documents, metadatas):

        chunks.append({
            "text": doc,
            "page": meta["page"],
            "document_name": meta.get("document_name"),
            "document_id": meta["document_id"]
        })

    return chunks

def delete_document_embeddings(document_id: str):

    ids = collection.get(
        where={"document_id": document_id}
    )["ids"]

    if ids:
        collection.delete(ids=ids)

    print(f"Deleted embeddings for document {document_id}")