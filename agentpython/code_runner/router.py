from code_runner.service import run_code
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Any, List


router = APIRouter(prefix="/code-runner", tags=["Code Runner"])


class CodeRunRequest(BaseModel):
    language: str
    code: str
    files: List[dict[str, Any]] = Field(default_factory=list)
    entry_file: str | None = None
    function_name: str | None = None
    test_cases: List[Any] = Field(default_factory=list)
    timeout_seconds: int = 8


@router.post("/run")
async def run_code_endpoint(req: CodeRunRequest):
    return run_code(
        language=req.language,
        code=req.code,
        files=req.files,
        entry_file=req.entry_file,
        function_name=req.function_name,
        test_cases=req.test_cases,
        timeout_seconds=req.timeout_seconds,
    )
