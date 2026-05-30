# Точка входу: тут створюється веб-застосунок FastAPI

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import check_db_connection, init_db
from app.routers import ai, auth, commitments

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Код при старті сервера: створюємо/перевіряємо базу.
    yield — далі сервер приймає запити.
    """
    init_db()
    yield

app = FastAPI(
    title=settings.app_name,
    description="Calendar tracker for PMs to monitor team commitments and deadlines",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
)

# CORS: дозволяємо браузеру на localhost:5173 викликати API на :8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(commitments.router)
app.include_router(ai.router)


@app.get("/health")
def health():
    """Публічна перевірка: сервер живий і база відповідає."""
    if not check_db_connection():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )
    return {"status": "ok"}
