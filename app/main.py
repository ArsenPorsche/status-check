# Точка входу: тут створюється веб-застосунок FastAPI

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import check_db_connection, get_db, init_db
from app.models.commitment import Commitment
from app.models.user import User
from app.routers import auth

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

app.include_router(auth.router)


@app.get("/health")
def health(db: Session = Depends(get_db)):
    """
    Перевірка сервера + бази.
    db: Session — FastAPI сам викличе get_db() і передасть сесію сюди.
    """
    db.execute(text("SELECT 1"))

    # Скільки користувачів у таблиці (0 — нормально, поки немає реєстрації)
    user_count = db.query(User).count()
    commitment_count = db.query(Commitment).count()

    return {
        "status": "ok",
        "app": settings.app_name,
        "debug": settings.debug,
        "database": "ok" if check_db_connection() else "error",
        "users_table": user_count,
        "commitments_table": commitment_count,
    }
