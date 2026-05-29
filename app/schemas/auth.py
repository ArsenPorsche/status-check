# Pydantic-схеми для автентифікації

from pydantic import BaseModel, Field


class Token(BaseModel):
    """Відповідь після успішного логіну."""

    access_token: str
    token_type: str = "bearer"
