import os
import tempfile
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List

load_dotenv()

_data_dir = os.environ.get("DATA_DIR") or tempfile.gettempdir()
try:
    os.makedirs(_data_dir, exist_ok=True)
except Exception:
    _data_dir = tempfile.gettempdir()
    os.makedirs(_data_dir, exist_ok=True)
_default_db_url = f"sqlite:///{os.path.join(_data_dir, 'careeros.db')}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerOS Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "careeros-super-secret-jwt-key-for-development-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db_url)
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # Legacy setting (deprecated)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # FRONTEND_URL can be set to your deployed Vercel URL in production
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "")

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://careeros.embarko.app",
            "https://careeros-web.embarko.app",
            "https://careeros-app.embarko.app",
            "*"
        ]
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL)
            origins.append(self.FRONTEND_URL.rstrip("/"))
        return origins

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
