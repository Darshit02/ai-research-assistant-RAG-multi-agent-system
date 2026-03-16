from fastapi import Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.models.model import User


def get_admin_user(current_user: User = Depends(get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user