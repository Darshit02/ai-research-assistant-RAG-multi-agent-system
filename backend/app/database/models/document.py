from sqlalchemy import Column, ForeignKey,Integer,String ,DateTime
from datetime import datetime 
from ..db import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer , primary_key=True , index=True)
    filename = Column(String , nullable=False)
    filepath  = Column(String , nullable=False)
    user_id = Column(Integer , ForeignKey("users.id"))
    status = Column(String, default="processing")
    uploaded_id = Column(DateTime,default=datetime.utcnow)
    expires_at = Column(DateTime)