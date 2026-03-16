from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import chromadb
import google.generativeai as genai

from app.database.db import get_db

router = APIRouter(prefix="/system", tags=["system"])


def check_database(db: Session):
    try:
        db.execute("SELECT 1")
        return "ok"
    except:
        return "error"


def check_vector_store():

    try:
        client = chromadb.Client()
        client.list_collections()
        return "ok"
    except:
        return "error"


def check_llm():
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content("hello")

        if response:
            return "ok"
    except:
        return "error"


@router.get("/status")
def system_status(db: Session = Depends(get_db)):

    return {
        "database": check_database(db),
        "vector_store": check_vector_store(),
        "llm": check_llm(),
        "status": "running"
    }