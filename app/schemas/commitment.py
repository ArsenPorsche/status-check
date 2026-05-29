# Pydantic-схеми для зобов'язань (commitments)

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class CommitmentStatusSchema(str, Enum):
    """
    Статуси в API — ті самі рядки, що в CommitmentStatus у models/.
    Окремий enum у schemas, щоб API не залежав напряму від SQLAlchemy.
    """

    TO_CHECK = "to check"
    EXPIRED = "expired"
    DONE = "done"
    NOT_ACTUAL = "not actual"
    IDEAS_BACKLOG = "ideas backlog"


class CommitmentBase(BaseModel):
    """Поля, які клієнт надсилає при створенні або бачить у відповіді."""

    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    project: str = Field(..., min_length=1, max_length=255)
    assignee: str = Field(..., min_length=1, max_length=255)
    reviewer: str = Field(..., min_length=1, max_length=255)
    deadline: datetime
    status: CommitmentStatusSchema = CommitmentStatusSchema.TO_CHECK


class CommitmentCreate(CommitmentBase):
    """
    POST /commitments — що надсилає клієнт.
    Без id, author_id, created_at (їх задає сервер).
    """


class CommitmentUpdate(BaseModel):
    """PATCH /commitments/{id} — усі поля опційні (часткове оновлення)."""

    title: str | None = None
    description: str | None = None
    project: str | None = None
    assignee: str | None = None
    reviewer: str | None = None
    deadline: datetime | None = None
    status: CommitmentStatusSchema | None = None


class CommitmentRead(CommitmentBase):
    """
    Відповідь API після GET/POST.
    Містить id, author_id, created_at з бази.
    """

    id: int
    author_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
