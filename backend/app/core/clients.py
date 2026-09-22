from supabase import create_client, Client
from openai import OpenAI
from app.core.config import settings


def get_supabase_client() -> Client:
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY
    )


def get_azure_client() -> OpenAI:
    return OpenAI(
        api_key=settings.AZURE_API_KEY,
        base_url=settings.AZURE_ENDPOINT.rstrip("/") + "/"
    )


# Shared singleton client instances
supabase: Client = get_supabase_client()
azure_openai: OpenAI = get_azure_client()