# Бізнес-логіка зобов'язань (без HTTP)

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.commitment import Commitment, CommitmentStatus
from app.schemas.commitment import (
    CommitmentCreate,
    CommitmentRead,
    CommitmentStatusSchema,
    CommitmentUpdate,
)


def _utc_now() -> datetime:
    """Поточний час у UTC."""
    return datetime.now(timezone.utc)


def _as_utc(dt: datetime) -> datetime:
    """Якщо deadline без timezone — вважаємо UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def effective_status(row: Commitment) -> CommitmentStatus:
    """
    Auto-expiry: якщо дедлайн минув і статус не done → повертаємо expired.
    У базі статус може лишатися 'to check'.
    """
    if row.status == CommitmentStatus.DONE:
        return row.status

    if _as_utc(row.deadline) < _utc_now():
        return CommitmentStatus.EXPIRED

    return row.status


def to_read_schema(row: Commitment) -> CommitmentRead:
    """ORM → Pydantic для відповіді API (з урахуванням auto-expiry)."""
    status = effective_status(row)
    return CommitmentRead(
        id=row.id,
        author_id=row.author_id,
        title=row.title,
        description=row.description,
        created_at=row.created_at,
        project=row.project,
        assignee=row.assignee,
        reviewer=row.reviewer,
        deadline=row.deadline,
        status=CommitmentStatusSchema(status.value),
    )


def list_commitments(
    db: Session,
    project: str | None = None,
    reviewer: str | None = None,
) -> list[CommitmentRead]:
    """Список усіх зобов'язань з фільтрами ?project= & ?reviewer=."""
    query = db.query(Commitment)

    if project is not None:
        query = query.filter(Commitment.project == project)

    if reviewer is not None:
        query = query.filter(Commitment.reviewer == reviewer)

    rows = query.order_by(Commitment.deadline.asc()).all()
    return [to_read_schema(row) for row in rows]


def get_commitment(db: Session, commitment_id: int) -> CommitmentRead | None:
    """Одне зобов'язання за id або None."""
    row = db.query(Commitment).filter(Commitment.id == commitment_id).first()
    if row is None:
        return None
    return to_read_schema(row)


def create_commitment(
    db: Session,
    author_id: int,
    data: CommitmentCreate,
) -> CommitmentRead:
    """Створення запису в БД."""
    row = Commitment(
        author_id=author_id,
        title=data.title,
        description=data.description,
        project=data.project,
        assignee=data.assignee,
        reviewer=data.reviewer,
        deadline=data.deadline,
        status=CommitmentStatus(data.status.value),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return to_read_schema(row)


def update_commitment(
    db: Session,
    commitment_id: int,
    author_id: int,
    data: CommitmentUpdate,
) -> tuple[CommitmentRead | None, bool]:
    """
    Часткове оновлення.
    Повертає (результат, forbidden): forbidden=True, якщо запис є, але не ваш.
    """
    row = db.query(Commitment).filter(Commitment.id == commitment_id).first()
    if row is None:
        return None, False
    if row.author_id != author_id:
        return None, True

    fields = data.model_dump(exclude_unset=True)

    if "status" in fields and fields["status"] is not None:
        fields["status"] = CommitmentStatus(fields["status"].value)

    for name, value in fields.items():
        setattr(row, name, value)

    db.commit()
    db.refresh(row)
    return to_read_schema(row), False


def delete_commitment(db: Session, commitment_id: int, author_id: int) -> str:
    """
    Видалення запису.
    Повертає: "deleted" | "not_found" | "forbidden".
    """
    row = db.query(Commitment).filter(Commitment.id == commitment_id).first()
    if row is None:
        return "not_found"
    if row.author_id != author_id:
        return "forbidden"

    db.delete(row)
    db.commit()
    return "deleted"
