from fastapi import APIRouter, HTTPException
from screening.schemas import JobRequirements, CandidateProfile, ScreeningResult
from screening.screening_agent import run_screening
from shared.session_orchestrator import create_session
from shared.n8n_client import notify_whatsapp, notify_email
from typing import List

router = APIRouter(prefix="/screening", tags=["screening"])


@router.post("/evaluate")
async def evaluate_candidates(
    job: JobRequirements,
    candidates: List[CandidateProfile]
):
    if len(candidates) > 50:
        raise HTTPException(400, "Max 50 candidatos por screening")

    # 1. Evaluar con LLM
    result = run_screening(job, candidates)

    # 2. Crear sesion y notificar a cada seleccionado
    selected_with_sessions = []
    for c in result["selected_candidates"]:
        # Crear sesion en session_orchestrator
        state = create_session(
            candidate_id=c.get("user_id", c.get("name", "unknown")),
            job_id=job.title,
            career=job.career,
            job_title=job.title,
            phone=c.get("phone"),
            email=c.get("email"),
        )

        # Notificar por WhatsApp
        if c.get("phone"):
            try:
                notify_whatsapp(
                    c["phone"],
                    f"Felicitaciones {c.get('name', 'candidato')}! Has sido preseleccionado para {job.title}. "
                    f"Tu sesion de entrevista ha sido creada. ID: {state.session_id[:8]}..."
                )
            except Exception as e:
                print(f"Error WhatsApp a {c.get('name')}: {e}")

        # Notificar por email
        if c.get("email"):
            try:
                notify_email(
                    c["email"],
                    f"Preseleccionado - {job.title}",
                    f"<h2>Felicitaciones {c.get('name', 'candidato')}!</h2>"
                    f"<p>Has sido preseleccionado para el puesto de <b>{job.title}</b>.</p>"
                    f"<p>Tu ID de sesion: {state.session_id}</p>"
                    f"<p>Recibiras una llamada para continuar con el proceso.</p>"
                )
            except Exception as e:
                print(f"Error email a {c.get('name')}: {e}")

        selected_with_sessions.append({
            "user_id": c.get("user_id", c.get("name")),
            "name": c.get("name"),
            "score": c.get("score"),
            "session_id": state.session_id,
            "notified_whatsapp": bool(c.get("phone")),
            "notified_email": bool(c.get("email")),
        })

    return {
        "selected_candidates": selected_with_sessions,
        "rejected_candidates": result["rejected_candidates"],
        "total_evaluated": result["total_evaluated"],
        "total_selected": len(selected_with_sessions),
    }
