from fastapi import APIRouter, HTTPException
from screening.schemas import JobRequirements, CandidateProfile
from screening.screening_agent import run_screening
from typing import List

router = APIRouter(prefix="/screening", tags=["screening"])


@router.post("/evaluate")
async def evaluate_candidates(
    job: JobRequirements,
    candidates: List[CandidateProfile]
):
    if len(candidates) > 50:
        raise HTTPException(400, "Max 50 candidatos por screening")

    # 1. Evaluar con LLM (async)
    result = await run_screening(job, candidates)

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
