from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketDisconnected

from practical_voice.audio_pipeline import SpeechToText, TextToSpeech
from practical_voice.autonomous_agent import evaluate_practical_interview, generate_interviewer_reply
from practical_voice.schemas import (
    PracticalFinishRequest,
    PracticalFinishResponse,
    PracticalSessionStartRequest,
    PracticalSessionStartResponse,
    PracticalViolationRequest,
)
from practical_voice.workspace import build_workspace_challenge, infer_workspace_type, interviewer_profile
from shared.n8n_client import notify_email
from shared.session_orchestrator import InterviewStage, get_session, update_session
import os

router = APIRouter(prefix="/practical-interview", tags=["Practical Voice Interview"])

stt = SpeechToText()
tts = TextToSpeech()

_runtime_sessions: Dict[str, Dict[str, Any]] = {}


@router.post("/start", response_model=PracticalSessionStartResponse)
async def start_practical_interview(req: PracticalSessionStartRequest):
    state = await get_session(req.session_id)
    workspace_type = req.workspace_type or infer_workspace_type(req.career, req.job_title)
    challenge = build_workspace_challenge(workspace_type, req.career, req.job_title)

    if state:
        state.stage = InterviewStage.TECHNICAL
        state.challenge = challenge
        await update_session(state)

    _runtime_sessions[req.session_id] = {
        "session_id": req.session_id,
        "workspace_type": workspace_type.value,
        "challenge": challenge,
        "transcript": [],
        "workspace_state": {},
        "violations": state.violations if state else 0,
        "candidate_name": req.candidate_name or "",
        "career": req.career,
        "job_title": req.job_title,
        "interviewer_profile": challenge.get("interviewer_profile") or interviewer_profile(workspace_type, req.career, req.job_title),
    }

    return PracticalSessionStartResponse(
        session_id=req.session_id,
        workspace_type=workspace_type,
        challenge=challenge,
        websocket_url=f"/practical-interview/ws/{req.session_id}",
    )


@router.post("/violation")
async def report_practical_violation(req: PracticalViolationRequest):
    state = await get_session(req.session_id)
    violations = 1
    if state:
        state.violations += 1
        violations = state.violations
        await update_session(state)

    runtime = _runtime_sessions.setdefault(req.session_id, {"transcript": [], "workspace_state": {}})
    runtime["violations"] = max(runtime.get("violations", 0) + 1, violations)
    runtime.setdefault("events", []).append(req.model_dump())

    return {
        "session_id": req.session_id,
        "violations": runtime["violations"],
        "action": "warning" if runtime["violations"] < 3 else "review_or_suspend",
    }


@router.post("/finish", response_model=PracticalFinishResponse)
async def finish_practical_interview(req: PracticalFinishRequest):
    state = await get_session(req.session_id)
    runtime = _runtime_sessions.get(req.session_id, {})
    transcript = req.transcript or runtime.get("transcript", [])
    workspace_state = req.workspace_state or runtime.get("workspace_state", {})
    challenge = runtime.get("challenge") or (state.challenge if state else {}) or {}
    violations = max(req.violations, state.violations if state else 0, runtime.get("violations", 0))

    evaluation = await evaluate_practical_interview(
        transcript=transcript,
        workspace_state=workspace_state,
        challenge=challenge,
        violations=violations,
    )
    theory_score = float(state.theory_score) if state else 0.0
    final_score = round(theory_score * 0.35 + evaluation["score"] * 0.45 + evaluation.get("communication_score", 0) * 0.20, 2)
    evaluation["theory_score"] = theory_score
    evaluation["final_score"] = final_score

    if state:
        state.tech_score = evaluation["score"]
        state.violations = violations
        state.stage = InterviewStage.COMPLETED if evaluation["passed"] else InterviewStage.FAILED
        await update_session(state)

    company_report_email = os.getenv("COMPANY_REPORT_EMAIL", "")
    if company_report_email:
        notify_email(
            company_report_email,
            f"Reporte entrevista practica - {req.session_id}",
            build_company_report_html(
                session_id=req.session_id,
                evaluation=evaluation,
                transcript=transcript,
                violations=violations,
                candidate_name=runtime.get("candidate_name", "Profesional evaluado"),
                job_title=runtime.get("job_title", "Puesto evaluado"),
                career=runtime.get("career", "Area profesional"),
                interviewer=runtime.get("interviewer_profile", {}),
            ),
        )

    return PracticalFinishResponse(
        session_id=req.session_id,
        score=evaluation["score"],
        theory_score=theory_score,
        final_score=final_score,
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


def build_company_report_html(
    session_id: str,
    evaluation: Dict[str, Any],
    transcript: List[Dict[str, str]],
    violations: int,
    candidate_name: str = "Profesional evaluado",
    job_title: str = "Puesto evaluado",
    career: str = "Area profesional",
    interviewer: Dict[str, Any] | None = None,
) -> str:
    next_action = evaluation.get("next_action", "manual_review")
    action_label = {
        "schedule_human_meeting": "Agendar reunion con la empresa",
        "manual_review": "Revision manual",
        "reject": "No avanzar",
    }.get(next_action, next_action)
    final_score = float(evaluation.get("final_score", 0) or 0)
    ranking = (
        "Puesto 1 entre candidatos aprobados" if final_score >= 92 else
        "Puesto 2 entre candidatos aprobados" if final_score >= 86 else
        "Puesto 3 entre candidatos aprobados" if final_score >= 80 else
        "Aprobado, ranking sujeto al total de candidatos" if final_score >= 75 else
        "No ingresa al ranking de aprobados"
    )
    interviewer = interviewer or {}
    strengths = "".join(f"<li>{item}</li>" for item in evaluation.get("strengths", []))
    risks = "".join(f"<li>{item}</li>" for item in evaluation.get("risks", []))
    recent_turns = "".join(
        f"<p style='margin:8px 0;padding:10px 12px;background:#f8fafc;border-radius:10px;'><strong>{'IA' if turn.get('role') == 'agent' else 'Profesional'}:</strong> {turn.get('content', '')}</p>"
        for turn in transcript[-10:]
    )
    return f"""
    <div style="font-family:Inter,Arial,sans-serif;background:#f4f7fb;padding:28px;color:#0f172a;">
      <div style="max-width:900px;margin:auto;background:#fff;border:1px solid #e2e8f0;border-radius:22px;overflow:hidden;">
        <div style="background:#102a43;color:#fff;padding:26px 30px;display:flex;justify-content:space-between;gap:18px;">
          <div>
            <div style="font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#67e8f9;">Achanvear</div>
            <h1 style="margin:8px 0 4px;">Informe ejecutivo de entrevista practica</h1>
            <p style="margin:0;color:#cbd5e1;">Sesion {session_id}</p>
          </div>
          <div style="text-align:right;">
            <span style="display:inline-block;border-radius:999px;padding:8px 12px;background:{'#dcfce7' if evaluation.get('passed') else '#fee2e2'};color:{'#166534' if evaluation.get('passed') else '#991b1b'};font-weight:900;font-size:12px;">{"APROBADO" if evaluation.get("passed") else "NO APROBADO"}</span>
            <p style="margin:10px 0 0;color:#cbd5e1;">{action_label}</p>
          </div>
        </div>
        <div style="padding:28px 30px;">
          <h2 style="margin:0 0 6px;">{candidate_name}</h2>
          <p style="margin:0;color:#64748b;">Puesto: {job_title} · Area: {career}</p>
          <p style="margin:6px 0 0;color:#64748b;">Entrevistador IA: {interviewer.get("name", "Agente IA")} · {interviewer.get("role", "Evaluacion practica")}</p>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:22px;">
            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;"><p style="margin:0;color:#64748b;font-size:12px;font-weight:800;">FINAL</p><p style="font-size:30px;font-weight:900;margin:8px 0 0;">{evaluation.get("final_score", 0)}/100</p></div>
            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;"><p style="margin:0;color:#64748b;font-size:12px;font-weight:800;">TECNICO</p><p style="font-size:30px;font-weight:900;margin:8px 0 0;">{evaluation.get("score", 0)}/100</p></div>
            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;"><p style="margin:0;color:#64748b;font-size:12px;font-weight:800;">EXPERIENCIA</p><p style="font-size:30px;font-weight:900;margin:8px 0 0;">{evaluation.get("theory_score", 0)}/100</p></div>
            <div style="border:1px solid #e2e8f0;border-radius:16px;padding:16px;"><p style="margin:0;color:#64748b;font-size:12px;font-weight:800;">PSICOLOGICO</p><p style="font-size:30px;font-weight:900;margin:8px 0 0;">{evaluation.get("communication_score", 0)}/100</p></div>
          </div>
          <h3 style="margin-top:28px;">Ranking</h3>
          <p>{ranking}. El puesto final se recalcula con todos los candidatos aprobados de la vacante.</p>
          <h3>Resumen ejecutivo</h3>
          <p>{evaluation.get("summary", "")}</p>
          <p>{evaluation.get("communication_summary", "")}</p>
          <h3>Fortalezas</h3>
          <ul>{strengths or "<li>Sin fortalezas registradas.</li>"}</ul>
          <h3>Riesgos</h3>
          <ul>{risks or "<li>Sin riesgos registrados.</li>"}</ul>
          <h3>Recomendacion</h3>
          <p>{evaluation.get("recommendation", "")}</p>
          <h3>Alertas antifraude</h3>
          <p>{violations}</p>
          <h3>Evidencia reciente</h3>
          {recent_turns or "<p>Sin turnos registrados.</p>"}
        </div>
      </div>
    </div>
    """


@router.websocket("/ws/{session_id}")
async def practical_voice_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    runtime = _runtime_sessions.setdefault(
        session_id,
        {"session_id": session_id, "challenge": {}, "transcript": [], "workspace_state": {}, "violations": 0},
    )

    await websocket.send_json({
        "type": "ready",
        "session_id": session_id,
        "message": "Canal de entrevista practica listo.",
    })
    candidate_name = runtime.get("candidate_name") or "candidato"
    profile = runtime.get("interviewer_profile") or {}
    interviewer_name = profile.get("name", "tu entrevistador")
    interviewer_role = profile.get("role", "entrevistador practico")
    greeting = (
        f"Hola {candidate_name}, soy {interviewer_name}, {interviewer_role} de Achanvear. "
        "Un gusto acompañarte en esta entrevista. Antes de comenzar, estas son las reglas: "
        "piensa en voz alta, no uses ayuda externa, no cambies de ventana sin avisar, "
        "y puedes interrumpirme cuando necesites aclarar o corregir algo. "
        "Primero conversaremos brevemente y luego resolveras el caso practico. "
        "Puedes abrirlo cuando quieras con el boton Caso; ahi veras el enunciado, el lenguaje esperado y los criterios. "
        "Cuando empecemos el reto tendras 20 minutos. "
        "Para confirmar, dime como prefieres que te llame y cuentame en un minuto tu experiencia relacionada con este puesto."
    )
    runtime.setdefault("transcript", []).append({"role": "agent", "content": greeting})
    await websocket.send_json({"type": "agent_text", "text": greeting})
    greeting_audio = await safe_tts(greeting, profile.get("voice"))
    if greeting_audio:
        await websocket.send_json({"type": "agent_audio", "format": "mp3", "audio_base64": greeting_audio})
    else:
        await websocket.send_json({"type": "tts_unavailable"})

    try:
        while True:
            try:
                message = await websocket.receive()
            except WebSocketDisconnected:
                return

            if "text" in message and message["text"] is not None:
                data = websocket_json(message["text"])
                msg_type = data.get("type")

                if msg_type == "workspace_state":
                    runtime["workspace_state"] = data.get("payload", {})
                    continue

                if msg_type == "barge_in":
                    await websocket.send_json({"type": "barge_in_ack"})
                    continue

                if msg_type == "candidate_text":
                    candidate_text = data.get("text", "").strip()
                    await handle_candidate_turn(websocket, runtime, candidate_text)
                    continue

                if msg_type == "ping":
                    await websocket.send_json({"type": "pong"})
                    continue

            if "bytes" in message and message["bytes"] is not None:
                audio_bytes = message["bytes"]
                await websocket.send_json({"type": "stt_started"})
                try:
                    candidate_text = await stt.transcribe_webm(audio_bytes)
                except Exception as exc:
                    await websocket.send_json({
                        "type": "stt_error",
                        "message": (
                            "STT local no disponible. Instala faster-whisper y ffmpeg, "
                            "o envia candidate_text para pruebas."
                        ),
                        "detail": str(exc),
                    })
                    continue
                await handle_candidate_turn(websocket, runtime, candidate_text)

    except WebSocketDisconnect:
        return


async def handle_candidate_turn(websocket: WebSocket, runtime: Dict[str, Any], candidate_text: str):
    if not candidate_text:
        await websocket.send_json({"type": "empty_transcript"})
        return

    transcript: List[Dict[str, str]] = runtime.setdefault("transcript", [])
    transcript.append({"role": "candidate", "content": candidate_text})
    await websocket.send_json({"type": "transcript", "role": "candidate", "text": candidate_text})

    if is_finish_intent(candidate_text):
        reply = (
            "Perfecto, dame un momento. Comenzare a evaluar tus respuestas, el trabajo del workspace "
            "y la evidencia de la entrevista. Si encuentro algo que necesite aclaracion, te lo indicare."
        )
        transcript.append({"role": "agent", "content": reply})
        await websocket.send_json({"type": "agent_text", "text": reply})
        profile = runtime.get("interviewer_profile") or {}
        audio_base64 = await safe_tts(reply, profile.get("voice"))
        if audio_base64:
            await websocket.send_json({"type": "agent_audio", "format": "mp3", "audio_base64": audio_base64})
        await websocket.send_json({"type": "finish_requested"})
        return

    reply = await generate_interviewer_reply(
        transcript=transcript,
        candidate_text=candidate_text,
        workspace_state=runtime.get("workspace_state", {}),
        challenge=runtime.get("challenge", {}),
        violations=runtime.get("violations", 0),
    )

    transcript.append({"role": "agent", "content": reply})
    await websocket.send_json({"type": "agent_text", "text": reply})

    profile = runtime.get("interviewer_profile") or {}
    audio_base64 = await safe_tts(reply, profile.get("voice"))
    if audio_base64:
        await websocket.send_json({"type": "agent_audio", "format": "mp3", "audio_base64": audio_base64})
    else:
        await websocket.send_json({"type": "tts_unavailable"})


def is_finish_intent(text: str) -> bool:
    normalized = text.lower().strip()
    finish_phrases = (
        "ya termine",
        "ya terminé",
        "termine mi entrevista",
        "terminé mi entrevista",
        "termine la entrevista",
        "terminé la entrevista",
        "finalice",
        "finalicé",
        "he terminado",
        "quiero terminar",
        "puedes evaluar",
        "evalua mis respuestas",
        "evalúa mis respuestas",
        "estoy listo para finalizar",
        "listo para finalizar",
    )
    return any(phrase in normalized for phrase in finish_phrases)


async def safe_tts(text: str, voice: str | None = None) -> str | None:
    try:
        return await tts.synthesize_base64(text, voice)
    except Exception as exc:
        print(f"TTS failed without closing websocket: {type(exc).__name__}: {exc}")
        return None


def websocket_json(raw: str) -> Dict[str, Any]:
    import json

    try:
        return json.loads(raw)
    except Exception:
        return {"type": "candidate_text", "text": raw}
