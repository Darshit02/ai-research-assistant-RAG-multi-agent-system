import uuid

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database.db import Base


class Usage(Base):

    __tablename__ = "usage"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True)
    model = Column(String)
    tokens = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)