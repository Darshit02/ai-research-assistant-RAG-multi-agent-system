import uuid

from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime
from ..db import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String)
    filepath = Column(String)
    user_id = Column(String(36), index=True)
    status = Column(String, default="processing")
    summary = Column(Text, nullable=True)
    title = Column(String, nullable=True)
    key_points = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)