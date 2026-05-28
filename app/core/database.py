# Підключення до SQLite через SQLAlchemy

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# engine = "двигун" який знає, де лежить файл бази (DATABASE_URL з .env)
# check_same_thread=False потрібен лише для SQLite + FastAPI
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)

# Фабрика сесій: кожен запит отримає свій об'єкт Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """
    Базовий клас для майбутніх моделей (таблиць).
    На кроці 4–5 додамо User, Commitment — вони успадкують Base.
    """

    pass


def get_db() -> Generator[Session, None, None]:
    """
    Залежність FastAPI: відкриває сесію на час одного HTTP-запиту.
    yield — після відповіді сесія закривається (finally).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Створює таблиці в SQLite, якщо їх ще немає.
    Поки моделей немає — файл .db створиться, таблиці з'являться на кроці 4–5.
    """
    Base.metadata.create_all(bind=engine)


def check_db_connection() -> bool:
    """
    Перевірка: чи можемо виконати простий запит до бази.
    Повертає True / False (без викидання помилки назовні).
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
