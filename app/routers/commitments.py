# CRUD для зобов'язань (потрібен Bearer token)

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.commitment import CommitmentCreate, CommitmentRead, CommitmentUpdate
from app.services import commitment_service

router = APIRouter(prefix="/commitments", tags=["commitments"])


@router.get("", response_model=list[CommitmentRead])
def list_commitments(
    project: str | None = Query(None, description="Filter by project name"),
    reviewer: str | None = Query(None, description="Filter by reviewer name"),
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """
    GET /commitments
    Приклад: /commitments?project=Backend&reviewer=Anna
    """
    return commitment_service.list_commitments(db, project=project, reviewer=reviewer)


@router.get("/{commitment_id}", response_model=CommitmentRead)
def get_one(
    commitment_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """GET /commitments/{id}"""
    result = commitment_service.get_commitment(db, commitment_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commitment not found")
    return result


@router.post("", response_model=CommitmentRead, status_code=status.HTTP_201_CREATED)
def create_one(
    data: CommitmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /commitments
    author_id береться з JWT (поточний користувач).
    """
    return commitment_service.create_commitment(db, author_id=current_user.id, data=data)


@router.patch("/{commitment_id}", response_model=CommitmentRead)
def update_one(
    commitment_id: int,
    data: CommitmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """PATCH /commitments/{id} — лише автор може змінювати."""
    result, forbidden = commitment_service.update_commitment(
        db, commitment_id, current_user.id, data
    )
    if forbidden:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own commitments",
        )
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commitment not found")
    return result


@router.delete("/{commitment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_one(
    commitment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """DELETE /commitments/{id} — лише автор може видаляти."""
    outcome = commitment_service.delete_commitment(db, commitment_id, current_user.id)
    if outcome == "forbidden":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own commitments",
        )
    if outcome == "not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Commitment not found")
    return None
