from sqlalchemy import Column, Integer, DateTime, ForeignKey ,String
from datetime import datetime

from app.database.db import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    language = Column(String, default="English")
    created_at = Column(DateTime, default=datetime.utcnow)

