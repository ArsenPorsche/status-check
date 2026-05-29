# Модель User — таблиця users у базі даних

from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    """
    Один рядок у таблиці users = один користувач системи.
    Пізніше author_id у Commitment буде посилатися на User.id.
    """

    __tablename__ = "users"

    # Первинний ключ: унікальний номер користувача (1, 2, 3, ...)
    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Логін для входу — не може повторюватися
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    # Email — теж унікальний
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Хеш пароля (ніколи не зберігаємо пароль відкритим текстом)
    hashed_password: Mapped[str] = mapped_column(String(255))

    # Ім'я для відображення в інтерфейсі
    full_name: Mapped[str] = mapped_column(String(255))

    # Коли запис створили (UTC)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
