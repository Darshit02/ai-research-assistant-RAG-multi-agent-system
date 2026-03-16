import uuid

from sqlalchemy import Column, DateTime, String, Text
from datetime import datetime
from app.database.db import Base


class RetrievalMemory(Base):
    __tablename__ = "retrieval_memory"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), index=True)
    question = Column(Text)
    embedding = Column(Text)
    chunks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)