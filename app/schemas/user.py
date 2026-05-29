# Pydantic-схеми для користувача (не плутати з SQLAlchemy User у models/)

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Спільні поля, які є і при створенні, і у відповіді."""

    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    """
    Тіло POST /auth/register (буде на наступному кроці).
    Пароль лише на вхід — у відповіді ніколи не повертаємо.
    """

    password: str = Field(..., min_length=6)


class UserRead(UserBase):
    """
    Користувач у JSON-відповіді API.
    from_attributes=True — можна створити з ORM-об'єкта User (model_validate).
    """

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
