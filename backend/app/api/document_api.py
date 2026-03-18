from fastapi import APIRouter, BackgroundTasks, Depends, File, Request, UploadFile, Query
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
from app.database.models.usage import Usage


router = APIRouter()

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 20 * 1024 * 1024


@router.get("/")
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
            "document_id": "",
            "status": d.status,
            "uploaded_at": d.uploaded_at
        }
        for d in docs
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

@router.get("/usage")
def get_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(Usage).filter(
        Usage.user_id == current_user.id
    ).all()

    total_tokens = sum(r.tokens for r in records)

    return {
        "requests": len(records),
        "tokens_used": total_tokens
    }

@router.post("/upload")
def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")

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

@router.get("/highlight")
def highlight_text(
    document_id: str,
    page: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "file_url": f"/pdf/{document.filename}",
        "page": page
    }

@router.put("/settings")
def update_settings(
    model: str,
    api_key: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.preferred_model = model
    
    if api_key.strip() == "":
        current_user.api_key = None
    else:
        current_user.api_key = api_key

    db.commit()

    return {"message": "Settings updated"}

@router.post("/sessions")
def create_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = ChatSession(
        user_id=current_user.id,
        language="English"
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "language": session.language,
        "model_name": session.model_name,
        "title": session.title
    }


@router.get("/get-all-sessions")
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
            "created_at": s.created_at,
            "title": s.title,
            "language": s.language,
            "model_name": s.model_name
        }
        for s in sessions
    ]


@router.put("/sessions/{session_id}/settings")
def update_session_settings(
    session_id: str,
    settings: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if "language" in settings:
        session.language = settings["language"]
    if "model_name" in settings:
        session.model_name = settings["model_name"]

    db.commit()
    return {"message": "Session settings updated"}

@router.put("/sessions/{session_id}/language")
def change_language(
    session_id: str,
    language: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.language = language

    db.commit()

    return {"message": "Language updated"}

@router.put("/sessions/{session_id}/title")
def update_title(
    session_id: str,
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.title = title

    db.commit()

    return {"message": "Title updated"}


def auto_generate_title(session_id: str, question: str, user_id: str, db: Session):
    try:
        import google.generativeai as genai
        user = db.query(User).filter(User.id == user_id).first()
        api_key = user.api_key or os.getenv("GEMINI_API_KEY")
        if not api_key: return
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"Analyze this user question and generate a very short, concise title (max 5 words) for a chat session. Question: {question}. Only return the title text, nothing else."
        
        response = model.generate_content(prompt)
        title = response.text.strip().replace('"', '').replace("'", "")
        
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if session:
            session.title = title
            db.commit()
    except Exception as e:
        print(f"Error auto-generating title: {e}")

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()

    return {"message": "Session deleted"}

@router.get("/messages/{session_id}")
def get_messages(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()

    import json
    return [
        {
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at,
            "citations": json.loads(m.citations) if m.citations else []
        }
        for m in messages
    ]

@router.post("/ask")
@limiter.limit("10/minute")
def ask_question(
    request: Request,
    question: str,
    session_id: str,
    background_tasks: BackgroundTasks,
    document_ids: list[str] = Query(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = generate_answer(
        question,
        current_user.id,
        session_id,
        db,
        document_ids,
    )
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session and (session.title == "New Chat" or not session.title):
        background_tasks.add_task(auto_generate_title, session_id, question, current_user.id, db)

    return result


@router.post("/ask-stream")
def ask_stream(
    question: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    generator = stream_answer(question, current_user.id, db)

    return StreamingResponse(generator, media_type="text/plain")

@router.get("/{document_id}")
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": document.id,
        "filename": document.filename,
        "filepath": document.filepath,
        "status": document.status,
        "uploaded_at": document.uploaded_at
    }


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
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
