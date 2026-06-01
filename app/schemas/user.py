# Pydantic-схеми для користувача (не плутати з SQLAlchemy User у models/)

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    """Тіло POST /auth/register."""

    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=6, max_length=72)


class UserRead(BaseModel):
    """
    Користувач у JSON-відповіді API.
    email — str (без повторної перевірки EmailStr для даних уже в БД).
    """

    id: int
    username: str
    email: str
    full_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
