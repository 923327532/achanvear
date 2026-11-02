"""Internal code execution service. It receives no application/LLM/storage credentials."""
from fastapi import FastAPI
from code_runner.router import router
from contextlib import asynccontextmanager
from pathlib import Path
import asyncio
import shutil


@asynccontextmanager
async def lifespan(app):
    if Path("/opt/go-cache").exists() and not Path("/tmp/go-cache").exists():
        await asyncio.to_thread(shutil.copytree, "/opt/go-cache", "/tmp/go-cache")
    yield


app = FastAPI(title="Achanvear isolated code runner", docs_url=None, redoc_url=None, lifespan=lifespan)
app.include_router(router)


@app.get("/health")
def health():
    return {"status": "healthy"}
