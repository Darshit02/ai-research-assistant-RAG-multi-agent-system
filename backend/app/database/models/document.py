from sqlalchemy import Column, ForeignKey, Integer, String, DateTime ,Text
from datetime import datetime
from ..db import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True)
    filename = Column(String)
    filepath = Column(String)
    user_id = Column(Integer)
    status = Column(String, default="processing")
    summary = Column(Text, nullable=True)
    title = Column(String, nullable=True)
    key_points = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)