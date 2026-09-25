from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from screening.schemas import JobRequirements, CandidateProfile
from screening.screening_agent import DEFAULT_SCORE_THRESHOLD, run_screening
from typing import List

router = APIRouter(prefix="/screening", tags=["screening"])


class ScreeningRequest(BaseModel):
    job: JobRequirements
    candidates: List[CandidateProfile]
    required_score_threshold: float = DEFAULT_SCORE_THRESHOLD


@router.post("/evaluate")
async def evaluate_candidates(request: ScreeningRequest):
    if len(request.candidates) > 50:
        raise HTTPException(400, "Max 50 candidatos por screening")

    # 1. Evaluar con LLM y reglas duras (async)
    result = await run_screening(
        request.job,
        request.candidates,
        threshold=request.required_score_threshold,
    )

    # 2. Devolver resultado - Java orquesta, Python solo evalua
    return {
        "selected_candidates": [
            {
                "user_id": c.get("user_id", c.get("name")),
                "name": c.get("name"),
                "score": c.get("score"),
                "match_percentage": c.get("match_percentage", c.get("score", 0)),
                "reason": c.get("reason", ""),
            }
            for c in result["selected_candidates"]
        ],
        "rejected_candidates": [
            {
                "user_id": c.get("user_id", c.get("name")),
                "name": c.get("name"),
                "score": c.get("score", 0),
                "match_percentage": c.get("match_percentage", c.get("score", 0)),
                "reason": c.get("reason", "No cumple con los requisitos minimos"),
                "recommended": False,
            }
            for c in result["rejected_candidates"]
        ],
        "total_evaluated": result["total_evaluated"],
        "total_selected": len(result["selected_candidates"]),
    }

