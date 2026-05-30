# Логіка автентифікації: хеш пароля та JWT

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.user import User
from app.schemas.user import UserCreate

settings = get_settings()


def hash_password(password: str) -> str:
    """
    Хешує пароль через bcrypt.
    bcrypt приймає максимум 72 байти — довші паролі відсікаємо в UserCreate (max_length=72).
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """True, якщо пароль збігається з хешем у базі."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def get_user_by_username(db: Session, username: str) -> User | None:
    """Шукає користувача за логіном."""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    """Шукає користувача за email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Шукає користувача за id (для перевірки JWT)."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, data: UserCreate) -> User:
    """Створює користувача в таблиці users."""
    user = User(
        username=data.username,
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_access_token(user_id: int) -> str:
    """
    Створює JWT.
    У payload кладемо sub = id користувача (рядком) та час закінчення exp.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def get_user_id_from_token(token: str) -> int | None:
    """
    Декодує JWT і повертає user id або None, якщо токен недійсний/прострочений.
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except (JWTError, ValueError):
        return None
