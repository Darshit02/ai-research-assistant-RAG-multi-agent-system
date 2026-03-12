from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import shutil
import os

from app.database.db import get_db
from app.core.dependencies import get_current_user
from app.database.models.document import Document



router = APIRouter()

UPLOAD_DIR = "uploads"


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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

    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "expires_at": expires_at
    }