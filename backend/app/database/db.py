from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread" : False})
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally :
        db.close()


def ensure_user_columns():
    """Add missing columns to users table if they were added to the model later."""
    with engine.connect() as conn:
        for column_sql in [
            "ALTER TABLE users ADD COLUMN preferred_model VARCHAR DEFAULT 'gemini-2.5-flash'",
            "ALTER TABLE users ADD COLUMN api_key VARCHAR",
        ]:
            try:
                conn.execute(text(column_sql))
                conn.commit()
            except Exception:
                conn.rollback()
                pass