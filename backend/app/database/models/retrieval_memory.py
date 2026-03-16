from sqlalchemy import Column, Integer, Text, DateTime
from datetime import datetime
from app.database.db import Base


class RetrievalMemory(Base):
    __tablename__ = "retrieval_memory"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer)
    question = Column(Text)
    embedding = Column(Text)
    chunks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)