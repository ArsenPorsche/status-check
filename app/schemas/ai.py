# Запит до AI Copilot

from pydantic import BaseModel, Field


class AICreateRequest(BaseModel):
    """POST /commitments/ai-create — вільний текст."""

    raw_text: str = Field(..., min_length=3)
