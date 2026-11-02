from code_runner.service import run_code
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Any, List
import asyncio
import os
import httpx
import shutil


router = APIRouter(prefix="/code-runner", tags=["Code Runner"])


@router.get("/capabilities")
async def capabilities():
    remote = os.getenv("CODE_RUNNER_URL", "")
    if remote:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(remote + "/code-runner/capabilities")
            response.raise_for_status()
            return response.json()
    commands = {"python": ["python"], "javascript": ["node"], "typescript": ["tsc", "node"],
                "java": ["javac", "java"], "csharp": ["mcs", "mono"], "go": ["go"], "php": ["php"], "ruby": ["ruby"],
                "postgresql": ["psql"], "mongodb": ["mongosh"]}
    return {"languages": [{"language": language, "available": all(shutil.which(cmd) for cmd in cmds)
             and (bool(os.getenv("PRACTICAL_POSTGRES_DSN")) if language == "postgresql" else bool(os.getenv("PRACTICAL_MONGODB_URI")) if language == "mongodb" else True)}
            for language, cmds in commands.items()]}


class CodeRunRequest(BaseModel):
    language: str
    code: str
    files: List[dict[str, Any]] = Field(default_factory=list)
    entry_file: str | None = None
    function_name: str | None = None
    test_cases: List[Any] = Field(default_factory=list)
    timeout_seconds: int = 8
    stdin: str = Field(default="", max_length=16000)


@router.post("/run")
async def run_code_endpoint(req: CodeRunRequest):
    remote = os.getenv("CODE_RUNNER_URL", "")
    if remote:
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(remote + "/code-runner/run", json=req.model_dump())
            response.raise_for_status()
            return response.json()
    return await asyncio.to_thread(run_code,
        language=req.language,
        code=req.code,
        files=req.files,
        entry_file=req.entry_file,
        function_name=req.function_name,
        test_cases=req.test_cases,
        timeout_seconds=req.timeout_seconds,
        stdin=req.stdin,
    )
