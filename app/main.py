# Точка входу: тут створюється веб-застосунок FastAPI

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.database import check_db_connection, init_db
from app.routers import ai, auth, commitments

settings = get_settings()

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

_DEFAULT_CORS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def _cors_origins() -> list[str]:
    if settings.cors_origins.strip():
        return [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    return list(_DEFAULT_CORS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Код при старті сервера: створюємо/перевіряємо базу.
    yield — далі сервер приймає запити.
    """
    init_db()
    from scripts.seed_db import fix_legacy_user_emails

    fix_legacy_user_emails()
    if settings.seed_on_startup:
        from scripts.seed_db import seed_database

        seed_database()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Календарний трекер для PM: зобов'язання команди та дедлайни",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
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


def _mount_frontend() -> None:
    if not settings.serve_frontend or not FRONTEND_DIST.is_dir():
        return

    assets = FRONTEND_DIST / "assets"
    if assets.is_dir():
        app.mount("/assets", StaticFiles(directory=assets), name="frontend-assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        """React SPA: статичні файли або index.html для клієнтських маршрутів."""
        candidate = FRONTEND_DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")


_mount_frontend()
