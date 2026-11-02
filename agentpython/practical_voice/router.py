from typing import Any, Dict, List
import asyncio

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Request
from shared.agent_access import session_grant
from starlette.websockets import WebSocketDisconnected

from practical_voice.audio_pipeline import SpeechToText, TextToSpeech
from practical_voice.completion import complete_practical_session
from practical_voice.autonomous_agent import evaluate_practical_interview, generate_interviewer_reply
from practical_voice.onboarding import opening_message, advance_onboarding, confirmed
from practical_voice.schemas import (
    PracticalFinishRequest,
    PracticalFinishResponse,
    PracticalSessionStartRequest,
    PracticalSessionStartResponse,
    PracticalViolationRequest,
)
from practical_voice.workspace import build_workspace_challenge, infer_workspace_type, interviewer_profile
from shared.session_orchestrator import InterviewStage, SessionState, get_session, update_session

router = APIRouter(prefix="/practical-interview", tags=["Practical Voice Interview"])

stt = SpeechToText()
tts = TextToSpeech()

_runtime_sessions: Dict[str, Dict[str, Any]] = {}
_active_connections: Dict[str, WebSocket] = {}


@router.post("/start", response_model=PracticalSessionStartResponse)
async def start_practical_interview(req: PracticalSessionStartRequest, request: Request = None):
    state = await get_session(req.session_id)
    if state is None:
        state = SessionState(req.session_id, "", "", req.career, req.job_title)
    if state.completed_at is not None:
        raise HTTPException(status_code=409, detail="Interview already completed")
    workspace_type = req.workspace_type or infer_workspace_type(req.career, req.job_title)
    challenge = build_workspace_challenge(workspace_type, req.career, req.job_title)
    presentation = getattr(request.state, "grant", {}).get("presentation", {}) if request else {}
    challenge["workspace_type"] = workspace_type.value
    if presentation.get("case_code") == "java_calculator":
        workspace_type = type(workspace_type).CODING
        challenge = {
            "title": "Calculadora básica en Java · sesión de exposición",
            "workspace_tool": "code_project", "workspace_type": "coding", "language": "java", "entry_file": "Main.java",
            "prompt": "Implementa una calculadora de consola en Java que sume, reste, multiplique y divida dos números. Controla división entre cero. Puedes leer dos números y el operador desde la entrada estándar, o demostrar las operaciones con ejemplos en main. Ejecuta al menos una prueba y explica la solución.",
            "files": [{"path": "Main.java", "language": "java", "content": "public class Main { public static void main(String[] args) {\n    // Implementa y demuestra tu calculadora.\n} }"}],
            "expected_output": ["Operaciones correctas", "División entre cero controlada", "Prueba ejecutada", "Explicación clara"],
        }
    challenge["job_description"] = req.job_description
    challenge["job_requirements"] = req.job_requirements
    if req.job_description or req.job_requirements:
        challenge["prompt"] = challenge.get("prompt", "") + (
            f"\nContexto de la vacante: {req.job_description[:1000]}\nRequisitos publicados: {req.job_requirements[:1000]}")
    if req.interviewer_code:
        female = req.interviewer_code in ("PROFILE_2", "PROFILE_4")
        challenge["interviewer_profile"] = {
            "id": req.interviewer_code,
            "name": req.interviewer_name or "Entrevistador",
            "style": req.interviewer_style or "Profesional",
            "role": f"Evaluacion practica para {req.job_title}",
            "voice": "es-PE-CamilaNeural" if female else "es-PE-AlexNeural",
            "gender": "female" if female else "male",
        }

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
        "job_description": req.job_description,
        "job_requirements": req.job_requirements,
        "interviewer_profile": challenge.get("interviewer_profile") or interviewer_profile(workspace_type, req.career, req.job_title),
    }

    return PracticalSessionStartResponse(
        session_id=req.session_id,
        workspace_type=workspace_type,
        challenge=challenge,
        websocket_url=f"/practical-interview/ws/{req.session_id}",
        time_limit_minutes=presentation.get("time_limit_minutes", 20),
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


@router.get("/result/{session_id}")
async def practical_result(session_id: str):
    state = await get_session(session_id)
    if not state or state.completed_at is None or state.stage not in (InterviewStage.COMPLETED, InterviewStage.FAILED):
        raise HTTPException(status_code=409, detail="Practical evaluation not completed")
    return {"session_id": session_id, **(state.practical_evaluation or {}), "score": state.tech_score}


@router.post("/finish", response_model=PracticalFinishResponse)
async def finish_practical_interview(req: PracticalFinishRequest):
    state = await get_session(req.session_id)
    return await complete_practical_session(
        req,
        state,
        _runtime_sessions.get(req.session_id, {}),
        evaluate=evaluate_practical_interview,
        persist=update_session,
    )


@router.websocket("/ws/{session_id}")
async def practical_voice_ws(websocket: WebSocket, session_id: str):
    try:
        session_grant(websocket.query_params.get("access_token", ""), session_id)
    except HTTPException:
        await websocket.close(code=4401)
        return
    await websocket.accept()
    previous = _active_connections.get(session_id)
    _active_connections[session_id] = websocket
    if previous is not None and previous is not websocket:
        try:
            await previous.close(code=4001, reason="La entrevista se abrio en una nueva sala")
        except (RuntimeError, WebSocketDisconnect):
            pass
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
    greeting = opening_message(runtime)
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
            if message.get("type") == "websocket.disconnect":
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
                    message_id = data.get("message_id")
                    if isinstance(message_id, str) and message_id:
                        seen = runtime.setdefault("seen_turn_ids", [])
                        if message_id in seen:
                            await websocket.send_json({"type": "duplicate_turn_ignored", "message_id": message_id})
                            continue
                        seen.append(message_id)
                        del seen[:-256]
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
                    candidate_text = await stt.transcribe_webm(audio_bytes,
                        f"Puesto: {runtime.get('job_title', '')}. Requisitos: {runtime.get('job_requirements', '')}")
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
    finally:
        if _active_connections.get(session_id) is websocket:
            _active_connections.pop(session_id, None)


async def handle_candidate_turn(websocket: WebSocket, runtime: Dict[str, Any], candidate_text: str):
    if not candidate_text:
        await websocket.send_json({"type": "empty_transcript"})
        return

    transcript: List[Dict[str, str]] = runtime.setdefault("transcript", [])
    transcript.append({"role": "candidate", "content": candidate_text})
    await websocket.send_json({"type": "transcript", "role": "candidate", "text": candidate_text})

    if runtime.get("conversation_phase") == "case_ready" and not confirmed(candidate_text):
        try:
            preparation = {**runtime.get("challenge", {}), "preparation_instruction":
                "Responde solo aclaraciones del enunciado. No resuelvas el caso ni inicies el tiempo. El candidato aun no confirma el inicio."}
            opening_reply = await generate_interviewer_reply(transcript, candidate_text, {}, preparation, runtime.get("violations", 0))
            opening_reply += " El tiempo aun no ha empezado. Cuando estes listo, confirma que deseas iniciar."
        except Exception:
            opening_reply = advance_onboarding(runtime, candidate_text)
    else:
        opening_reply = advance_onboarding(runtime, candidate_text)
    if opening_reply is not None:
        transcript.append({"role": "agent", "content": opening_reply})
        await websocket.send_json({"type": "agent_text", "text": opening_reply})
        await websocket.send_json({"type": "conversation_phase", "phase": runtime.get("conversation_phase")})
        audio = await safe_tts(opening_reply, (runtime.get("interviewer_profile") or {}).get("voice"))
        await websocket.send_json({"type": "agent_audio", "format": "mp3", "audio_base64": audio} if audio else {"type": "tts_unavailable"})
        return

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
        return await asyncio.wait_for(tts.synthesize_base64(text, voice), timeout=8)
    except Exception as exc:
        print(f"TTS failed without closing websocket: {type(exc).__name__}: {exc}")
        return None


def websocket_json(raw: str) -> Dict[str, Any]:
    import json

    try:
        return json.loads(raw)
    except Exception:
        return {"type": "candidate_text", "text": raw}
