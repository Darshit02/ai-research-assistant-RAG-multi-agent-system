from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import psutil
import time

from app.database.db import get_db
from app.database.models.model import User
from app.database.models.document import Document
from app.core.admin_dependency import get_admin_user
from app.database.models.chat_messages import ChatMessage
from app.database.models.chat_session import ChatSession
from app.database.models.usage import Usage

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_admin_user)]
)


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]


@router.get("/documents")
def all_documents(
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    docs = db.query(Document).all()

    return [
        {
            "id": d.id,
            "filename": d.filename,
            "user_id": d.user_id
        }
        for d in docs
    ]

@router.get("/system")
def system_info(admin = Depends(get_admin_user)):

    return {
        "status": "running",
        "version": "v2"
    }

@router.get("/analytics")
def admin_analytics(
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    total_users = db.query(User).count()
    total_documents = db.query(Document).count()
    total_sessions = db.query(ChatSession).count()
    total_messages = db.query(ChatMessage).count()

    total_tokens = db.query(Usage).with_entities(
        Usage.tokens
    ).all()

    tokens_sum = sum(t[0] for t in total_tokens)

    return {
        "users": total_users,
        "documents": total_documents,
        "sessions": total_sessions,
        "messages": total_messages,
        "tokens_used": tokens_sum
    }

@router.get("/analytics/daily")
def daily_usage(
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    last_7_days = datetime.utcnow() - timedelta(days=7)

    usage = db.query(Usage).filter(
        Usage.created_at >= last_7_days
    ).all()

    daily_data = {}

    for record in usage:

        day = record.created_at.date().isoformat()

        if day not in daily_data:
            daily_data[day] = 0

        daily_data[day] += record.tokens

    return daily_data

@router.get("/analytics/active-users")
def active_users(
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    last_24h = datetime.utcnow() - timedelta(hours=24)

    active = db.query(ChatSession).filter(
        ChatSession.created_at >= last_24h
    ).count()

    return {
        "active_users_24h": active
    }

@router.get("/analytics/top-documents")
def top_documents(
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    docs = db.query(Document).limit(10).all()

    return [
        {
            "id": d.id,
            "filename": d.filename,
            "user_id": d.user_id
        }
        for d in docs
    ]

@router.get("/system/performance")
def system_performance(admin = Depends(get_admin_user)):
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "cpu_usage_percent": cpu,
        "memory_usage_percent": memory.percent,
        "memory_used_mb": round(memory.used / 1024 / 1024, 2),
        "memory_total_mb": round(memory.total / 1024 / 1024, 2),
        "disk_usage_percent": disk.percent
    }

@router.get("/system/performance")
def system_performance(admin = Depends(get_admin_user)):

    cpu = psutil.cpu_percent(interval=1)

    memory = psutil.virtual_memory()

    disk = psutil.disk_usage("/")

    return {
        "cpu_usage_percent": cpu,
        "memory_usage_percent": memory.percent,
        "memory_used_mb": round(memory.used / 1024 / 1024, 2),
        "memory_total_mb": round(memory.total / 1024 / 1024, 2),
        "disk_usage_percent": disk.percent
    }

@router.get("/system/performance")
def system_performance(admin = Depends(get_admin_user)):

    cpu = psutil.cpu_percent(interval=1)

    memory = psutil.virtual_memory()

    disk = psutil.disk_usage("/")

    return {
        "cpu_usage_percent": cpu,
        "memory_usage_percent": memory.percent,
        "memory_used_mb": round(memory.used / 1024 / 1024, 2),
        "memory_total_mb": round(memory.total / 1024 / 1024, 2),
        "disk_usage_percent": disk.percent
    }