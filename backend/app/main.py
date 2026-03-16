import asyncio
from fastapi import Depends, FastAPI
from fastapi.staticfiles import StaticFiles
from sentence_transformers import CrossEncoder
from slowapi.middleware import SlowAPIMiddleware
from starlette.responses import JSONResponse

from app.api import auth, document_api
from app.core.dependencies import get_current_user

from app.database.db import engine, ensure_document_columns, ensure_user_columns, ensure_uuid_schema
from app.database.models.chat_messages import ChatMessage
from app.database.models.chat_session import ChatSession
from app.database.models.model import Base, User
from app.core.limiter import limiter
from app.api import system_api
from app.api.admin import admin_api


app = FastAPI(title="Research Assistant")
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

app.mount("/pdf", StaticFiles(directory="uploads"), name="pdf")
ensure_uuid_schema()
Base.metadata.create_all(bind=engine)
ensure_user_columns()
ensure_document_columns()
app.include_router(auth.router)
app.include_router(system_api.router)
app.include_router(admin_api.router)
app.include_router(
    document_api.router,
    prefix="/documents",
    tags=["Documents"]
)


@app.get("/")
def root_route():
    return {
        "message": "Hello world"
    }


@app.get("/user/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Unexpected server error"}
    )
    
@app.on_event("startup")
def load_models():
    global reranker
    reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

@app.middleware("http")
async def timeout_middleware(request, call_next):

    try:
        return await asyncio.wait_for(
            call_next(request),
            timeout=30
        )

    except asyncio.TimeoutError:

        return JSONResponse(
            {"error": "Request timeout"},
            status_code=504
        )
