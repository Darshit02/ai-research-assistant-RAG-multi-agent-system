import os
from datetime import datetime
from app.database import SessionLocal
from app.schemas import document


db = SessionLocal()

docs = db.query(document).all()

for doc in docs:
    if doc.expires_at < datetime.utcnow():

        if os.path.exists(doc.filepath):
            os.remove(doc.filepath)

        db.delete(doc)

db.commit()

print("Expired documents deleted")
