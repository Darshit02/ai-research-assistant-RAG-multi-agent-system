import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from datetime import datetime
from app.database.db import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))

    session_id = Column(String(36), ForeignKey("chat_sessions.id"), index=True)

    role = Column(String)  # user / assistant

    content = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)