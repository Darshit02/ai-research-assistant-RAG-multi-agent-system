from app.services.pdf_loader import extract_text_from_pdf, extract_text_with_pages
from app.services.text_splitter import split_pages, split_text
from app.services.embedding_service import create_embeddings
from app.vector.vector_store import store_embeddings
from app.database.models.document import Document
from app.database.db import SessionLocal
from app.services.document_intelligence import generate_document_insights
from app.rag.generator import _get_model


def ingest_document(file_path: str, document_id: int):
    db_session = SessionLocal()
    try:
        doc = db_session.query(Document).filter(
            Document.id == document_id).first()
        if not doc:
            return {"chunks": 0, "status": "not_found"}

        pages = extract_text_with_pages(file_path)
        chunks = split_pages(pages)
        texts = [chunk["text"] for chunk in chunks]

        filename = file_path.split("/")[-1]
        for chunk in chunks:
            chunk["document_name"] = filename

        if texts:
            full_text = "\n\n".join(texts)
            model = _get_model(db_session, doc.user_id)
            doc.summary = generate_document_insights(full_text, model)

        embeddings = create_embeddings(texts) if texts else []
        if texts:
            store_embeddings(chunks, embeddings, document_id)

        doc.status = "ready"
        db_session.commit()
    finally:
        db_session.close()

    print(f"Document {document_id} processed with {len(chunks)} chunks.")
    return {
        "chunks": len(chunks),
        "status": "ingested"
    }
