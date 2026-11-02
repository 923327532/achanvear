"""Complete a practical session without coupling evaluation to HTTP or WebSocket transport."""
from collections.abc import Awaitable, Callable
from datetime import datetime
from typing import Any

from practical_voice.schemas import PracticalFinishRequest, PracticalFinishResponse
from shared.session_orchestrator import InterviewStage, SessionState

Evaluator = Callable[..., Awaitable[dict[str, Any]]]
SessionWriter = Callable[[SessionState], Awaitable[None]]


async def complete_practical_session(
    req: PracticalFinishRequest,
    state: SessionState | None,
    runtime: dict[str, Any],
    *,
    evaluate: Evaluator,
    persist: SessionWriter,
) -> PracticalFinishResponse:
    if state and state.completed_at is not None and state.practical_evaluation:
        return _finish_response(req.session_id, state.practical_evaluation, float(state.theory_score))
    transcript = req.transcript or runtime.get("transcript", [])
    workspace_state = req.workspace_state or runtime.get("workspace_state", {})
    challenge = runtime.get("challenge") or (state.challenge if state else {}) or {}
    violations = max(req.violations, state.violations if state else 0, runtime.get("violations", 0))

    evaluation = await evaluate(
        transcript=transcript,
        workspace_state=workspace_state,
        challenge=challenge,
        violations=violations,
    )
    theory_score = float(state.theory_score) if state else 0.0
    # This session evaluates the practical stage. Theory belongs to another persisted interview.
    final_score = evaluation["score"]
    evaluation["transcript"] = transcript
    evaluation["workspace_state"] = workspace_state
    evaluation["challenge"] = challenge
    evaluation["violations"] = violations
    evaluation["methodology"] = "Rubrica practica sobre 100; umbral 75. Comunicacion se informa por separado. Revision humana requerida."
    evaluation["theory_score"] = theory_score
    evaluation["final_score"] = final_score

    if state:
        state.tech_score = evaluation["score"]
        state.practical_evaluation = evaluation
        state.completed_at = datetime.utcnow()
        state.violations = violations
        state.stage = InterviewStage.COMPLETED if evaluation["passed"] else InterviewStage.FAILED
        await persist(state)

    return _finish_response(req.session_id, evaluation, theory_score)


def _finish_response(session_id: str, evaluation: dict, theory_score: float) -> PracticalFinishResponse:
    return PracticalFinishResponse(
        session_id=session_id,
        score=evaluation["score"],
        theory_score=theory_score,
        final_score=evaluation["final_score"],
        communication_score=evaluation.get("communication_score", 0),
        passed=evaluation["passed"],
        summary=evaluation.get("summary", ""),
        communication_summary=evaluation.get("communication_summary", ""),
        strengths=evaluation.get("strengths", []),
        risks=evaluation.get("risks", []),
        recommendation=evaluation.get("recommendation", ""),
        next_action=evaluation.get("next_action", "manual_review"),
        raw_evaluation=evaluation,
    )


