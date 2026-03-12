from sqlalchemy import Column,Integer,String ,DateTime
from datetime import datetime 
from ..db import Base

class User(Base) :
    __tablename__ = "users"

    id = Column(Integer , primary_key=True , index=True)
    email = Column(String , unique=True , index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    otp_code = Column(String)
    expires_at = Column(DateTime)