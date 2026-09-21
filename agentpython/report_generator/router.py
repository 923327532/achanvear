# report_generator/router.py
from fastapi import APIRouter, HTTPException
from shared.session_orchestrator import get_session, delete_session, InterviewStage
from report_generator.report_builder import build_executive_report
from report_generator.schemas import ReportRequest, CandidateSummary
from shared.n8n_client import notify_whatsapp, notify_email

router = APIRouter(prefix="/reports", tags=["Report Generator"])


@router.post("/generate/{session_id}")
async def generate_final_report(session_id: str):
    state = await get_session(session_id)
    if not state:
        raise HTTPException(404, f"Session {session_id} not found")

    final_score = round((state.theory_score * 0.6 + state.tech_score * 0.4), 2)

    report_data = {
        "candidate_id": state.candidate_id,
        "job_id": state.job_id,
        "career": state.career,
        "job_title": state.job_title,
        "theory_score": state.theory_score,
        "tech_score": state.tech_score,
        "final_score": final_score,
        "questions": state.questions,
        "answers": state.answers,
        "scores": state.scores,
        "violations": state.violations,
        "passed": state.stage == InterviewStage.COMPLETED,
        "profile_used": state.profile_id,
    }

    candidate_summary = CandidateSummary(
        candidate_id=state.candidate_id,
        name=state.candidate_id,
        screening_score=0.0,
        theory_score=state.theory_score,
        technical_score=state.tech_score,
        final_score=final_score,
        profile_used=state.profile_id or "unknown",
        s3_video="",
        violations=state.violations,
    )

    report_request = ReportRequest(
        job_title=state.job_title or "No especificado",
        company_name="Empresa",
        candidates=[candidate_summary]
    )

    report = await build_executive_report(report_request)

    if state.phone:
        try:
            notify_whatsapp(
                state.phone,
                f"Tu proceso de seleccion ha finalizado.\n"
                f"Score final: {final_score}/100\n"
                f"{'APROBADO - La empresa recibira tu reporte.' if report_data['passed'] else 'No has pasado a la siguiente etapa.'}"
            )
        except Exception as e:
            print(f"Error notificando WhatsApp: {e}")

    return {
        "session_id": session_id,
        "report": report,
        "summary": {
            "theory_score": state.theory_score,
            "tech_score": state.tech_score,
            "final_score": final_score,
            "passed": report_data["passed"],
            "violations": state.violations,
        }
    }


@router.get("/session/{session_id}/summary")
async def get_session_summary(session_id: str):
    state = await get_session(session_id)
    if not state:
        raise HTTPException(404, f"Session {session_id} not found")
    return {
        "session_id": session_id,
        "stage": state.stage,
        "theory_score": state.theory_score,
        "tech_score": state.tech_score,
        "final_score": round((state.theory_score * 0.6 + state.tech_score * 0.4), 2),
        "passed": state.stage == InterviewStage.COMPLETED,
        "violations": state.violations,
    }
