import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String
from datetime import datetime

from app.database.db import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), index=True)
    language = Column(String, default="English")
    created_at = Column(DateTime, default=datetime.utcnow)

