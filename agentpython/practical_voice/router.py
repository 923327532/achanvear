from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from practical_voice.audio_pipeline import SpeechToText, TextToSpeech
from practical_voice.autonomous_agent import evaluate_practical_interview, generate_interviewer_reply
from practical_voice.schemas import (
    PracticalFinishRequest,
    PracticalFinishResponse,
    PracticalSessionStartRequest,
    PracticalSessionStartResponse,
    PracticalViolationRequest,
)
from practical_voice.workspace import build_workspace_challenge, infer_workspace_type
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
            build_company_report_html(req.session_id, evaluation, transcript, violations),
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
) -> str:
    next_action = evaluation.get("next_action", "manual_review")
    action_label = {
        "schedule_human_meeting": "Agendar reunion con la empresa",
        "manual_review": "Revision manual",
        "reject": "No avanzar",
    }.get(next_action, next_action)
    return f"""
    <h2>Reporte de entrevista practica</h2>
    <p><strong>Sesion:</strong> {session_id}</p>
    <p><strong>Teoria:</strong> {evaluation.get("theory_score", 0)}/100</p>
    <p><strong>Practica:</strong> {evaluation.get("score", 0)}/100</p>
    <p><strong>Comunicacion:</strong> {evaluation.get("communication_score", 0)}/100</p>
    <p><strong>Score final ponderado:</strong> {evaluation.get("final_score", 0)}/100</p>
    <p><strong>Resultado:</strong> {"Aprobado" if evaluation.get("passed") else "No aprobado"}</p>
    <p><strong>Accion sugerida:</strong> {action_label}</p>
    <p><strong>Alertas antifraude:</strong> {violations}</p>
    <h3>Resumen</h3>
    <p>{evaluation.get("summary", "")}</p>
    <h3>Comunicacion</h3>
    <p>{evaluation.get("communication_summary", "")}</p>
    <h3>Recomendacion</h3>
    <p>{evaluation.get("recommendation", "")}</p>
    <h3>Ultimos turnos</h3>
    <pre>{transcript[-8:]}</pre>
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
    greeting = (
        "Hola, soy tu entrevistador practico de Achanvear. "
        "Te explicare el caso, escuchare tu razonamiento y hare preguntas de seguimiento. "
        "Puedes interrumpirme cuando necesites aclarar algo. Empecemos: cuentame como abordarias el reto visible."
    )
    runtime.setdefault("transcript", []).append({"role": "agent", "content": greeting})
    await websocket.send_json({"type": "agent_text", "text": greeting})
    greeting_audio = await tts.synthesize_base64(greeting)
    if greeting_audio:
        await websocket.send_json({"type": "agent_audio", "format": "mp3", "audio_base64": greeting_audio})

    try:
        while True:
            message = await websocket.receive()

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

    reply = await generate_interviewer_reply(
        transcript=transcript,
        candidate_text=candidate_text,
        workspace_state=runtime.get("workspace_state", {}),
        challenge=runtime.get("challenge", {}),
        violations=runtime.get("violations", 0),
    )

    transcript.append({"role": "agent", "content": reply})
    await websocket.send_json({"type": "agent_text", "text": reply})

    audio_base64 = await tts.synthesize_base64(reply)
    if audio_base64:
        await websocket.send_json({"type": "agent_audio", "format": "mp3", "audio_base64": audio_base64})
    else:
        await websocket.send_json({"type": "tts_unavailable"})


def websocket_json(raw: str) -> Dict[str, Any]:
    import json

    try:
        return json.loads(raw)
    except Exception:
        return {"type": "candidate_text", "text": raw}
