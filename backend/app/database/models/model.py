import uuid

from sqlalchemy import Column, DateTime, String
from datetime import datetime 
from ..db import Base

class User(Base) :
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String , unique=True , index=True)
    password_hash = Column(String)
    preferred_model = Column(String, default="gemini-2.5-flash")
    role = Column(String, default="user")
    api_key = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True)
    otp_code = Column(String)
    expires_at = Column(DateTime)