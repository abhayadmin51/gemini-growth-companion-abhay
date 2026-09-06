from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    google_cloud_project: str = "gemini-growth-companion-abhay"
    firebase_project_id: str = "gemini-growth-companion-abhay"
    gemini_secret_id: str = "gemini-api-key"
    gemini_model: str = "gemini-3.6-flash"
    environment: str = "development"

    allowed_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )

    max_message_length: int = 5000
    maximum_history_messages: int = 20

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()