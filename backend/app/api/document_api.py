from fastapi import APIRouter, BackgroundTasks, UploadFile, File, Depends 
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
def ask_question(
    question: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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