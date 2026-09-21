# technical_interview/fix_technical_router.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from shared.session_orchestrator import get_session, update_session, InterviewStage
from technical_interview.challenge_generator import generate_challenge
from technical_interview.challenge_evaluator import evaluate_technical_challenge
from technical_interview.anti_cheat_monitor import AntiCheatMonitor

router = APIRouter(prefix="/technical-interview", tags=["Technical Interview"])

_cheat_monitors: dict[str, AntiCheatMonitor] = {}


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
    state = get_session(req.session_id)
    if not state:
        raise HTTPException(404, f"Session {req.session_id} not found")

    if state.stage != InterviewStage.TECHNICAL:
        raise HTTPException(400, f"Session not in TECHNICAL stage. Current: {state.stage}")

    challenge = generate_challenge(req.career, req.job_title, req.country)
    state.challenge = challenge
    update_session(state)

    _cheat_monitors[req.session_id] = AntiCheatMonitor(req.session_id)

    return {
        "session_id": req.session_id,
        "challenge": challenge,
        "time_limit_minutes": 30,
        "anti_cheat": True,
    }


@router.post("/submit/{session_id}")
async def submit_challenge(session_id: str, req: SubmitChallengeRequest):
    state = get_session(session_id)
    if not state:
        raise HTTPException(404, f"Session {session_id} not found")

    monitor = _cheat_monitors.get(session_id)
    if monitor:
        cheat_report = monitor.get_report()
        if cheat_report.get("aborted"):
            state.stage = InterviewStage.FAILED
            update_session(state)
            raise HTTPException(403, "Session blocked by anti-cheat system (max violations reached)")

    challenge = state.challenge
    challenge_description = challenge.get("description", "") if isinstance(challenge, dict) else str(challenge)

    evaluation = evaluate_technical_challenge(
        career=state.career,
        job_title=state.job_title or "Senior",
        question=challenge_description,
        answer=req.solution,
        country="Peru"
    )

    violations_count = state.violations
    penalty = violations_count * 10
    raw_score = evaluation.get("score", 0)
    final_score = max(0, raw_score - penalty)

    state.tech_score = final_score
    passed = final_score >= 70
    state.stage = InterviewStage.COMPLETED if passed else InterviewStage.FAILED
    update_session(state)

    return {
        "session_id": session_id,
        "tech_score": final_score,
        "passed": passed,
        "evaluation": evaluation,
        "next_stage": "report_generation" if passed else "rejected",
    }


@router.post("/violation")
async def report_violation(req: ViolationRequest):
    state = get_session(req.session_id)
    if not state:
        raise HTTPException(404, f"Session {req.session_id} not found")

    state.violations += 1
    update_session(state)

    monitor = _cheat_monitors.get(req.session_id)
    blocked = False
    if monitor:
        result = monitor.report_violation(req.type, {})
        blocked = result.get("aborted", False)
        if blocked:
            state.stage = InterviewStage.FAILED
            update_session(state)

    return {
        "session_id": req.session_id,
        "violations": state.violations,
        "blocked": blocked,
        "warning": f"Violacion #{state.violations} registrada. Maximo 3 permitidas."
    }
