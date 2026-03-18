from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.core.dependencies import get_current_user
from app.database.models.model import User
from app.schemas.user_schema import UserRegister, UserLogin
from app.core.security import hash_password, verify_password, create_access_token
from app.core.limiter import limiter


router = APIRouter(prefix="/auth", tags=["auth"])


def _authenticate_and_token(email: str, password: str, db: Session):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/register")
def register(user:UserRegister ,db:Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user.email,
        password_hash=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2-compatible login. Send form-urlencoded body with `username` (email) and `password`."""
    return _authenticate_and_token(form_data.username, form_data.password, db)


@router.post("/login/json", response_model=dict)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with JSON body: `{"email": "...", "password": "..."}`. Use this from Swagger or JSON clients."""
    return _authenticate_and_token(credentials.email, credentials.password, db)

@router.get("/user/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "id": current_user.id,
        "preferred_model": current_user.preferred_model,
        "gemini_api_key": "***" if current_user.gemini_api_key else None,
        "openai_api_key": "***" if current_user.openai_api_key else None,
        "anthropic_api_key": "***" if current_user.anthropic_api_key else None
    }

@router.put("/user/settings")
def update_user_settings(
    settings: dict, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if "preferred_model" in settings:
        current_user.preferred_model = settings["preferred_model"]
    if "api_key" in settings:
        current_user.api_key = settings["api_key"]
    if "gemini_api_key" in settings:
        current_user.gemini_api_key = settings["gemini_api_key"]
    if "openai_api_key" in settings:
        current_user.openai_api_key = settings["openai_api_key"]
    if "anthropic_api_key" in settings:
        current_user.anthropic_api_key = settings["anthropic_api_key"]
    
    db.commit()
    return {
        "message": "Settings updated", 
        "preferred_model": current_user.preferred_model,
        "gemini_api_key": "***" if current_user.gemini_api_key else None,
        "openai_api_key": "***" if current_user.openai_api_key else None,
        "anthropic_api_key": "***" if current_user.anthropic_api_key else None
    }

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
