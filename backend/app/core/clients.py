from supabase import create_client, Client
from openai import AzureOpenAI
from app.core.config import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_azure_client() -> AzureOpenAI:
    return AzureOpenAI(
        azure_endpoint=settings.AZURE_ENDPOINT,
        api_key=settings.AZURE_API_KEY,
        api_version=settings.AZURE_API_VERSION
    )

# Shared singleton client instances
supabase: Client = get_supabase_client()
azure_openai: AzureOpenAI = get_azure_client()
