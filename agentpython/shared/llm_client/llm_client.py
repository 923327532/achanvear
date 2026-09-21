"""
Achanvear LLM - 100% dinamico desde .env
Cambia LLM_PROVIDER en .env y funciona sin tocar codigo.

Soportados:
  deepseek  -> https://api.deepseek.com (OpenAI-compatible)
  gemini    -> Google Generative AI
  openai    -> OpenAI API
  groq      -> https://api.groq.com (OpenAI-compatible)
"""
from pydantic_settings import BaseSettings
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    env: str = os.getenv("ENV", "dev")
    llm_provider: str = os.getenv("LLM_PROVIDER", "deepseek")
    deepseek_model: str = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


settings = Settings()


def get_llm():
    mock_mode = os.getenv("MOCK_LLM", "false").lower() == "true"
    provider = settings.llm_provider.lower()

    if mock_mode:
        print(f"[MOCK] LLM: MOCK MODE activado (no se conecta a {provider})")
        from langchain_core.language_models import FakeListChatModel
        return FakeListChatModel(
            responses=[
                '["Describe tu experiencia más significativa en un proyecto de software.", "Explica el concepto de SOLID con un ejemplo práctico.", "¿Cómo manejarías una migración de base de datos en producción?", "Describe tu experiencia con microservicios y sus desafíos.", "¿Cómo aseguras la calidad del código en tu equipo?", "Explica cómo diseñarías una API REST escalable.", "¿Cómo manejas la deuda técnica en proyectos legacy?", "Describe un conflicto técnico que hayas resuelto en tu equipo."]'
            ]
        )

    if provider == "deepseek":
        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        if not api_key:
            raise ValueError("DEEPSEEK_API_KEY no esta configurada en .env")
        print(f"LLM: DeepSeek ({settings.deepseek_model})")
        return ChatOpenAI(
            model=settings.deepseek_model,
            api_key=api_key,
            base_url="https://api.deepseek.com",
            temperature=0.1,
            timeout=30,
            max_retries=1,
        )

    elif provider == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY no esta configurada en .env")
        print(f"LLM: Gemini ({settings.gemini_model})")
        return ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=api_key,
            temperature=0.1,
        )

    elif provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            raise ValueError("OPENAI_API_KEY no esta configurada en .env")
        print(f"LLM: OpenAI ({settings.openai_model})")
        return ChatOpenAI(
            model=settings.openai_model,
            api_key=api_key,
            temperature=0.1,
        )

    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise ValueError("GROQ_API_KEY no esta configurada en .env")
        print(f"LLM: Groq ({settings.groq_model})")
        return ChatOpenAI(
            model=settings.groq_model,
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
            temperature=0.1,
        )

    else:
        raise ValueError(
            f"LLM_PROVIDER='{provider}' no soportado. "
            f"Usa: deepseek, gemini, openai, groq"
        )


llm = get_llm()
