import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from datetime import datetime

from app.database.db import Base



class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), index=True)
    question = Column(Text)
    embedding = Column(Text)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)