from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database.db import Base


class Usage(Base):

    __tablename__ = "usage"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    model = Column(String)
    tokens = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)