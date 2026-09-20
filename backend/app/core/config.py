import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel

# Load .env from backend directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseModel):
    PROJECT_NAME: str = "ConsultAI"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # Supabase Credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Azure OpenAI Credentials
    AZURE_ENDPOINT: str = os.getenv("AZURE_ENDPOINT", "")
    AZURE_API_KEY: str = os.getenv("AZURE_API_KEY", "")
    AZURE_API_VERSION: str = os.getenv("AZURE_API_VERSION", "2024-12-01-preview")
    CHAT_MODEL: str = os.getenv("CHAT_MODEL", "gpt-4.1-mini")
    EMBED_MODEL: str = os.getenv("EMBED_MODEL", "text-embedding-3-small")

settings = Settings()

