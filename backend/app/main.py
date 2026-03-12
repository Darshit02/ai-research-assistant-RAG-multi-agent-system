from fastapi import Depends, FastAPI 
from app.database.db import engine
from app.database.models.model import Base, User
from app.api import auth ,document_api
from app.core.dependencies import get_current_user


app = FastAPI(title="Research Assistant")
Base.metadata.create_all(bind=engine)

if Base.metadata.create_all(bind=engine) :
    print("table created successfully")

app.include_router(auth.router)
app.include_router(
    document_api.router,
    prefix="/documents",
    tags=["Documents"]
)

@app.get("/")
def root_route():
    return {
        "message" : "Hello world"
    }

@app.get("/user/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at
    }