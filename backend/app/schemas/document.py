from datetime import datetime, timedelta
from pydantic import BaseModel

class DocumentCreate(BaseModel):
    filename: str
    filepath: str
    uploaded_at: datetime
    expires_at: datetime