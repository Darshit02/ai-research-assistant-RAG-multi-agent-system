from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String
from datetime import datetime
from app.database.db import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("chat_sessions.id"))

    role = Column(String)  # user / assistant

    content = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)