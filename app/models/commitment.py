# Модель Commitment — головна сутність Status Check (зобов'язання / дедлайн)

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CommitmentStatus(str, enum.Enum):
    """
    Допустимі статуси в базі.
    EXPIRED також може обчислюватися при читанні API (пізніший крок).
    """

    TO_CHECK = "to check"
    EXPIRED = "expired"
    DONE = "done"
    NOT_ACTUAL = "not actual"
    IDEAS_BACKLOG = "ideas backlog"


class Commitment(Base):
    """
    Один рядок = одне зобов'язання, яке PM відстежує.
    assignee / reviewer — текст (ім'я), для простоти MVP.
    """

    __tablename__ = "commitments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Хто створив запис (зв'язок з таблицею users)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Для фільтра GET ?project=...
    project: Mapped[str] = mapped_column(String(255), index=True)

    # Виконавець (хто обіцяв зробити)
    assignee: Mapped[str] = mapped_column(String(255))

    # Контролер (PM, хто стежить)
    reviewer: Mapped[str] = mapped_column(String(255), index=True)

    deadline: Mapped[datetime] = mapped_column(DateTime, index=True)

    status: Mapped[CommitmentStatus] = mapped_column(
        Enum(CommitmentStatus),
        default=CommitmentStatus.TO_CHECK,
    )
