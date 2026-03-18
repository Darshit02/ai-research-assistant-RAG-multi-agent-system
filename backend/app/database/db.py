from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker , declarative_base
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL,pool_size=10,
    max_overflow=20, connect_args={"check_same_thread" : False})
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def ensure_uuid_schema():
    """
    Best-effort dev safeguard: if an existing SQLite DB was created with
    Integer primary keys, inserts will fail after switching models to UUIDs.
    In that case, we reset the schema (DROP + CREATE).
    """
    try:
        inspector = inspect(engine)
        if not inspector.has_table("users"):
            return
        cols = inspector.get_columns("users")
        id_col = next((c for c in cols if c.get("name") == "id"), None)
        if not id_col:
            return
        id_type = str(id_col.get("type", "")).lower()
        if "int" in id_type:
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
    except Exception:
        pass

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
            "ALTER TABLE users ADD COLUMN preferred_model VARCHAR DEFAULT 'gemini-1.5-flash'",
            "ALTER TABLE users ADD COLUMN api_key VARCHAR",
            "ALTER TABLE users ADD COLUMN gemini_api_key VARCHAR",
            "ALTER TABLE users ADD COLUMN openai_api_key VARCHAR",
            "ALTER TABLE users ADD COLUMN anthropic_api_key VARCHAR",
        ]:
            try:
                conn.execute(text(column_sql))
                conn.commit()
            except Exception:
                conn.rollback()
                pass


def ensure_document_columns():
    """Add missing columns to documents table if they were added to the model later."""
    with engine.connect() as conn:
        for column_sql in [
            "ALTER TABLE documents ADD COLUMN status VARCHAR DEFAULT 'processing'",
            "ALTER TABLE documents ADD COLUMN uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE documents ADD COLUMN expires_at DATETIME",
        ]:
            try:
                conn.execute(text(column_sql))
                conn.commit()
            except Exception:
                conn.rollback()
                pass

def ensure_session_columns():
    with engine.connect() as conn:
        for column_sql in [
            "ALTER TABLE chat_sessions ADD COLUMN title VARCHAR DEFAULT 'New Chat'",
            "ALTER TABLE chat_sessions ADD COLUMN language VARCHAR DEFAULT 'English'",
            "ALTER TABLE chat_sessions ADD COLUMN model_name VARCHAR",
            "ALTER TABLE chat_messages ADD COLUMN citations TEXT",
        ]:
            try:
                conn.execute(text(column_sql))
                conn.commit()
            except Exception:
                conn.rollback()
                pass