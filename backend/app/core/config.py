from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    GEMINI_API_KEY: str = ""
    NEBULA_API_BASE: str = "https://api.utdnebula.com"
    NEBULA_API_KEY: str = ""
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
