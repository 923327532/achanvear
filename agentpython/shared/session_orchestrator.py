"""
🧠 Achanvear Session Orchestrator
Maneja el estado de cada sesión de entrevista de principio a fin.
Soporta Redis (producción) y memoria (desarrollo).
"""
import json
import os
import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

import redis.asyncio as aioredis


class InterviewStage(str, Enum):
    SCREENING = "screening"
    THEORY = "theory"
    TECHNICAL = "technical"
    COMPLETED = "completed"
    FAILED = "failed"


class SessionState:
    def __init__(
        self,
        session_id: str,
        candidate_id: str,
        job_id: str,
        career: str,
        job_title: str = "",
        phone: Optional[str] = None,
        email: Optional[str] = None,
    ):
        self.session_id = session_id
        self.candidate_id = candidate_id
        self.job_id = job_id
        self.career = career
        self.job_title = job_title
        self.phone = phone
        self.email = email

        # Flujo
        self.stage = InterviewStage.SCREENING
        self.profile_id: str = "carlos_mendoza"

        # Teoría
        self.questions: List[Any] = []
        self.answers: List[str] = []
        self.scores: List[float] = []
        self.current_q: int = 0
        self.theory_score: float = 0.0

        # Técnica
        self.challenge: Optional[Any] = None
        self.tech_score: float = 0.0
        self.violations: int = 0

        # Screening
        self.screening_result: Optional[Dict] = None

        # Metadata
        self.started_at = datetime.utcnow()
        self.completed_at: Optional[datetime] = None

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "candidate_id": self.candidate_id,
            "job_id": self.job_id,
            "career": self.career,
            "job_title": self.job_title,
            "phone": self.phone,
            "email": self.email,
            "stage": self.stage.value,
            "profile_id": self.profile_id,
            "questions": self.questions,
            "answers": self.answers,
            "scores": self.scores,
            "current_q": self.current_q,
            "theory_score": self.theory_score,
            "challenge": self.challenge,
            "tech_score": self.tech_score,
            "violations": self.violations,
            "screening_result": self.screening_result,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "SessionState":
        state = cls(
            session_id=data["session_id"],
            candidate_id=data["candidate_id"],
            job_id=data["job_id"],
            career=data["career"],
            job_title=data.get("job_title", ""),
            phone=data.get("phone"),
            email=data.get("email"),
        )
        state.stage = InterviewStage(data.get("stage", "screening"))
        state.profile_id = data.get("profile_id", "carlos_mendoza")
        state.questions = data.get("questions", [])
        state.answers = data.get("answers", [])
        state.scores = data.get("scores", [])
        state.current_q = data.get("current_q", 0)
        state.theory_score = data.get("theory_score", 0.0)
        state.challenge = data.get("challenge")
        state.tech_score = data.get("tech_score", 0.0)
        state.violations = data.get("violations", 0)
        state.screening_result = data.get("screening_result")
        if data.get("started_at"):
            state.started_at = datetime.fromisoformat(data["started_at"])
        if data.get("completed_at"):
            state.completed_at = datetime.fromisoformat(data["completed_at"])
        return state


# ─── Redis / Memoria ───────────────────────────────────────────────

_REDIS_URL = os.getenv("REDIS_URL", "")
_USE_REDIS = _REDIS_URL.startswith("redis://")

_redis: Optional[aioredis.Redis] = None
_sessions: Dict[str, SessionState] = {}


def _get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None and _USE_REDIS:
        _redis = aioredis.from_url(_REDIS_URL, decode_responses=True)
    return _redis


async def _redis_set(session_id: str, state: SessionState):
    r = _get_redis()
    if r:
        await r.set(f"session:{session_id}", json.dumps(state.to_dict(), default=str), ex=86400)


async def _redis_get(session_id: str) -> Optional[SessionState]:
    r = _get_redis()
    if r:
        data = await r.get(f"session:{session_id}")
        if data:
            return SessionState.from_dict(json.loads(data))
    return None


async def _redis_delete(session_id: str):
    r = _get_redis()
    if r:
        await r.delete(f"session:{session_id}")


async def _redis_list_all() -> List[SessionState]:
    r = _get_redis()
    if r:
        keys = await r.keys("session:*")
        sessions = []
        for key in keys:
            data = await r.get(key)
            if data:
                sessions.append(SessionState.from_dict(json.loads(data)))
        return sessions
    return []


# ─── API Pública ───────────────────────────────────────────────────


async def create_session(
    candidate_id: str,
    job_id: str,
    career: str,
    job_title: str = "",
    phone: Optional[str] = None,
    email: Optional[str] = None,
) -> SessionState:
    """Crea una nueva sesión de entrevista."""
    sid = str(uuid.uuid4())
    state = SessionState(
        session_id=sid,
        candidate_id=candidate_id,
        job_id=job_id,
        career=career,
        job_title=job_title,
        phone=phone,
        email=email,
    )
    if _USE_REDIS:
        await _redis_set(sid, state)
    else:
        _sessions[sid] = state
    return state


async def get_session(session_id: str) -> Optional[SessionState]:
    """Obtiene una sesión por ID."""
    if _USE_REDIS:
        return await _redis_get(session_id)
    return _sessions.get(session_id)


async def update_session(state: SessionState):
    """Guarda/actualiza una sesión."""
    if _USE_REDIS:
        await _redis_set(state.session_id, state)
    else:
        _sessions[state.session_id] = state


async def delete_session(session_id: str):
    """Elimina una sesión."""
    if _USE_REDIS:
        await _redis_delete(session_id)
    else:
        _sessions.pop(session_id, None)


async def list_sessions() -> List[SessionState]:
    """Lista todas las sesiones activas."""
    if _USE_REDIS:
        return await _redis_list_all()
    return list(_sessions.values())


async def advance_stage(state: SessionState) -> InterviewStage:
    """
    Avanza al siguiente stage del pipeline:
    screening -> theory -> technical -> completed
    """
    stage_order = [
        InterviewStage.SCREENING,
        InterviewStage.THEORY,
        InterviewStage.TECHNICAL,
        InterviewStage.COMPLETED,
    ]
    try:
        idx = stage_order.index(state.stage)
        if idx < len(stage_order) - 1:
            state.stage = stage_order[idx + 1]
        else:
            state.stage = InterviewStage.COMPLETED
            state.completed_at = datetime.utcnow()
    except ValueError:
        state.stage = InterviewStage.COMPLETED
        state.completed_at = datetime.utcnow()

    await update_session(state)
    return state.stage
