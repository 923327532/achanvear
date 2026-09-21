# technical_interview/router.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from shared.session_orchestrator import get_session, update_session, InterviewStage
from technical_interview.challenge_generator import generate_challenge
from technical_interview.challenge_evaluator import evaluate_technical_challenge

router = APIRouter(prefix="/technical-interview", tags=["Technical Interview"])


class StartTechnicalRequest(BaseModel):
    session_id: str
    career: str
    job_title: str = "Senior"
    country: str = "Peru"


class SubmitChallengeRequest(BaseModel):
    session_id: str
    solution: str


class ViolationRequest(BaseModel):
    session_id: str
    type: str


@router.post("/start")
async def start_technical_interview(req: StartTechnicalRequest):
    state = await get_session(req.session_id)
    if not state:
        raise HTTPException(404, f"Session {req.session_id} not found")

    if state.stage != InterviewStage.TECHNICAL:
        raise HTTPException(400, f"Session not in TECHNICAL stage. Current: {state.stage}")

    challenge = await generate_challenge(req.career, req.job_title, req.country)
    state.challenge = challenge
    await update_session(state)

    return {
        "session_id": req.session_id,
        "challenge": challenge,
        "time_limit_minutes": 35,
    }


@router.post("/submit/{session_id}")
async def submit_challenge(session_id: str, req: SubmitChallengeRequest):
    state = await get_session(session_id)
    if not state:
        raise HTTPException(404, f"Session {session_id} not found")

    challenge = state.challenge
    challenge_description = challenge.get("description", "") if isinstance(challenge, dict) else str(challenge)

    evaluation = await evaluate_technical_challenge(
        career=state.career,
        job_title=state.job_title or "Senior",
        question=challenge_description,
        answer=req.solution,
        country="Peru"
    )

    # Python solo evalua y devuelve el resultado. Java decide si paso o no.
    state.tech_score = evaluation.get("score", 0)
    await update_session(state)

    return {
        "session_id": session_id,
        "tech_score": evaluation.get("score", 0),
        "evaluation": evaluation,
    }


@router.post("/violation")
async def report_violation(req: ViolationRequest):
    """Python solo registra la violacion. Java decide si descalifica."""
    state = await get_session(req.session_id)
    if not state:
        raise HTTPException(404, f"Session {req.session_id} not found")

    state.violations += 1
    await update_session(state)

    return {
        "session_id": req.session_id,
        "violations": state.violations,
        "warning": f"Violacion #{state.violations} registrada."
    }
