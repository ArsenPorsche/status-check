# Читаємо налаштування з файлу .env у змінну settings

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Клас Settings — описує, які змінні ми очікуємо в .env.
    Pydantic сам перетворює рядки з файлу в типи Python (str, bool, ...).
    """

    # Назва застосунку (для логів, заголовка API тощо)
    app_name: str = "Status Check"

    # Режим розробки: true — більше підказок при помилках
    debug: bool = True

    # Шлях до SQLite (файл status_check.db у корені проєкту)
    database_url: str = "sqlite:///./status_check.db"

    # Секретний ключ для підпису JWT
    secret_key: str = "change-me"

    # Алгоритм підпису токена
    algorithm: str = "HS256"

    # Скільки хвилин живе access token
    access_token_expire_minutes: int = 60

    # OpenAI для POST /commitments/ai-create
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Звідки читати .env (файл у корені проєкту)
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """
    Повертає один об'єкт Settings на весь час роботи сервера.
    lru_cache = не читаємо .env з диска при кожному запиті.
    """
    return Settings()
