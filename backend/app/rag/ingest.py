from app.services.pdf_loader import extract_text_from_pdf, extract_text_with_pages
from app.services.text_splitter import split_pages, split_text
from app.services.embedding_service import create_embeddings
from app.vector.vector_store import store_embeddings

def ingest_document(file_path: str, document_id: int):
    pages = extract_text_with_pages(file_path)
    chunks = split_pages(pages)
    texts = [chunk["text"] for chunk in chunks]
    embeddings = create_embeddings(texts)
    filename = file_path.split("/")[-1]
    store_embeddings(chunks, embeddings, document_id, filename)
    print(f"Document {document_id} processed with {len(chunks)} chunks.")
    return {
        "chunks": len(chunks),
        "status": "ingested"
    }