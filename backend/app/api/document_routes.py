from fastapi import APIRouter, UploadFile, File, Depends
from app.api.auth import get_current_user
import shutil
import os
from datetime import datetime, timedelta
from app.schemas import document
from app.database import db

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    expires_at = datetime.utcnow() + timedelta(days=7)

    # save to database
    doc = document(
        filename=file.filename,
        filepath=file_path,
        uploaded_at=datetime.utcnow(),
        expires_at=expires_at
    )

    db.add(doc)
    db.commit()

    return {"message": "File uploaded", "expires_at": expires_at}