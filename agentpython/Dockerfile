# ================================
# Achanvear AI Agent - Python
# ================================
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero para cachear
COPY requirements.txt .

# Timeout y reintentos ampliados para evitar fallos transitorios de red
# al descargar wheels grandes (p. ej. google_api_python_client ~16 MB)
ENV PIP_DEFAULT_TIMEOUT=180 \
    PIP_RETRIES=10 \
    PIP_NO_CACHE_DIR=1
RUN pip install --default-timeout 180 --retries 10 -r requirements.txt

# Copiar código fuente
COPY . .

# Puerto del agente
EXPOSE 8001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Ejecutar con uvicorn (sin reload en producción)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
