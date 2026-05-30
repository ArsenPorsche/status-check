# POST /commitments/ai-create — зобов'язання з тексту

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.ai import AICreateRequest
from app.schemas.commitment import CommitmentRead
from app.services import ai_service, commitment_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/commitments", tags=["ai"])


@router.post("/ai-create", response_model=CommitmentRead, status_code=status.HTTP_201_CREATED)
def ai_create(
    body: AICreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    JSON: { "raw_text": "..." }
    → AI парсить → зберігає в БД → CommitmentRead (як POST /commitments).
    """
    try:
        data = ai_service.parse_text_to_commitment(body.raw_text)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception:
        logger.exception("AI parsing failed for user_id=%s", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI parsing failed",
        )

    return commitment_service.create_commitment(
        db,
        author_id=current_user.id,
        data=data,
    )
