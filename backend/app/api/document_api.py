from fastapi import APIRouter, BackgroundTasks, Depends, File, Request, UploadFile
from fastapi.exceptions import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

import shutil
import os

from app.database.db import get_db
from app.core.dependencies import get_current_user
from app.database.models.document import Document
from app.rag.ingest import ingest_document
from app.rag.generator import generate_answer, stream_answer
from app.database.models.model import User
from app.database.models.chat_session import ChatSession
from app.vector.vector_store import delete_document_embeddings
from app.core.limiter import limiter
from app.database.models.chat_messages import ChatMessage


router = APIRouter()

UPLOAD_DIR = "uploads"


@router.post("/upload")
def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    expires_at = datetime.utcnow() + timedelta(days=7)
    document = Document(
        filename=file.filename,
        filepath=file_path,
        user_id=current_user.id,
        expires_at=expires_at
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # Run ingestion in background
    background_tasks.add_task(
        ingest_document,
        file_path,
        document.id
    )

    return {
        "message": "PDF uploaded successfully. Processing started.",
        "filename": file.filename,
        "expires_at": expires_at
    }


@router.post("/ask")
@limiter.limit("10/minute")
def ask_question(
    request: Request,
    question: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    result = generate_answer(question, current_user.id, db)

    return result


@router.post("/chat/start")
def start_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    session = ChatSession(user_id=current_user.id)

    db.add(session)
    db.commit()
    db.refresh(session)

    return {"session_id": session.id}


@router.post("/ask-stream")
def ask_stream(
    question: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    generator = stream_answer(question, current_user.id, db)

    return StreamingResponse(generator, media_type="text/plain")


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(document.filepath):
        os.remove(document.filepath)
    delete_document_embeddings(document.id)

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}


@router.get("/search")
def search_documents(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    documents = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.filename.ilike(f"%{query}%")
    ).all()

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "status": doc.status,
            "uploaded_at": doc.uploaded_at
        }
        for doc in documents
    ]


@router.get("/search/chat")
def search_chat(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    messages = db.query(ChatMessage).join(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatMessage.content.ilike(f"%{query}%")
    ).all()

    return [
        {
            "session_id": msg.session_id,
            "role": msg.role,
            "message": msg.content,
            "created_at": msg.created_at
        }
        for msg in messages
    ]


@router.get("/analytics")
def dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    total_documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).count()

    total_chats = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).count()

    total_messages = db.query(ChatMessage).join(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).count()

    return {
        "documents": total_documents,
        "chat_sessions": total_chats,
        "messages": total_messages
    }


@router.get("/chats")
def chat_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).all()

    return [
        {
            "session_id": s.id,
            "created_at": s.created_at
        }
        for s in sessions
    ]


@router.get("/documents")
def document_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    docs = db.query(Document).filter(
        Document.user_id == current_user.id
    ).all()

    return [
        {
            "id": d.id,
            "filename": d.filename,
            "status": d.status,
            "uploaded_at": d.uploaded_at
        }
        for d in docs
    ]


@router.put("/settings")
def update_settings(
    model: str,
    api_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    current_user.preferred_model = model
    current_user.api_key = api_key

    db.commit()

    return {"message": "Settings updated"}
