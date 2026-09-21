from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from theory_interview.schemas import TheoryRequest, TheoryResponse
from theory_interview.question_generator import generate_questions
from theory_interview.answer_evaluator import evaluate_answer
from shared.session_orchestrator import (
    get_session, update_session, InterviewStage
)
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/theory-interview", tags=["theory-interview"])


class StartRequest(BaseModel):
    session_id: str
    career: str
    job_title: str


class AnswerRequest(BaseModel):
    session_id: str
    answer: str


@router.post("/start")
async def start_theory_interview(req: StartRequest):
    state = await get_session(req.session_id)
    if not state:
        raise HTTPException(404, f"Session {req.session_id} not found")

    questions = await generate_questions(req.career, req.job_title)
    state.questions = questions
    state.current_q = 0
    state.stage = InterviewStage.THEORY
    await update_session(state)

    first_q = state.questions[0]
    return {
        "session_id": state.session_id,
        "total_questions": len(questions),
        "current_question": {
            "index": 1,
            "total": len(questions),
            "text": first_q.get("text", first_q) if isinstance(first_q, dict) else str(first_q),
        }
    }


@router.post("/answer")
async def submit_answer(req: AnswerRequest):
    state = await get_session(req.session_id)
    if not state:
        raise HTTPException(404, f"Session {req.session_id} not found")

    if state.current_q >= len(state.questions):
        raise HTTPException(400, "La entrevista ya ha terminado. Usa /result/{session_id} para obtener el resultado.")

    current_q = state.questions[state.current_q]
    q_text = current_q.get("text", str(current_q)) if isinstance(current_q, dict) else str(current_q)
    concepts = current_q.get("expected_concepts", []) if isinstance(current_q, dict) else []

    evaluation = await evaluate_answer(q_text, req.answer, concepts)
    state.answers.append(req.answer)
    state.scores.append(evaluation["score"])
    state.current_q += 1
    await update_session(state)

    if state.current_q < len(state.questions):
        next_q = state.questions[state.current_q]
        return {
            "evaluation": evaluation,
            "interview_status": "in_progress",
            "next_question": {
                "index": state.current_q + 1,
                "total": len(state.questions),
                "text": next_q.get("text", str(next_q)) if isinstance(next_q, dict) else str(next_q),
            }
        }
    else:
        avg_score = sum(state.scores) / len(state.scores) if state.scores else 0
        state.theory_score = avg_score
        await update_session(state)

        return {
            "evaluation": evaluation,
            "interview_status": "theory_completed",
            "theory_result": {
                "score": round(avg_score, 2),
                "total_questions": len(state.questions),
            }
        }


@router.post("/result/{session_id}")
async def get_theory_result(session_id: str):
    """Java llama a este endpoint para obtener el resultado final de la entrevista teorica.
    Python solo devuelve los scores. Java decide si paso o no."""
    state = await get_session(session_id)
    if not state:
        raise HTTPException(404, f"Session {session_id} not found")

    avg_score = sum(state.scores) / len(state.scores) if state.scores else 0
    state.theory_score = avg_score
    await update_session(state)

    return {
        "session_id": session_id,
        "theory_score": round(avg_score, 2),
        "scores_detail": state.scores,
    }


@router.get("/session/{session_id}")
async def get_session_status(session_id: str):
    state = await get_session(session_id)
    if not state:
        raise HTTPException(404, f"Session {session_id} not found")
    return {
        "session_id": state.session_id,
        "stage": state.stage,
        "current_q": state.current_q,
        "total_q": len(state.questions),
        "theory_score": state.theory_score,
        "violations": state.violations,
    }


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        state = await get_session(session_id)
        if not state:
            await websocket.close(code=4001)
            return

        question_idx = 0
        questions_list = state.questions

        while question_idx < len(questions_list):
            await websocket.send_json({
                "type": "question",
                "question": questions_list[question_idx],
                "idx": question_idx + 1,
                "total": len(questions_list)
            })

            data = await websocket.receive_json()

            if data.get("type") == "answer":
                eval_result = await evaluate_answer(
                    questions_list[question_idx],
                    data["text"],
                    ["conceptos_generales"]
                )

                state.answers.append(data["text"])
                state.scores.append(eval_result["score"])
                await update_session(state)

                await websocket.send_json({
                    "type": "feedback",
                    "score": eval_result["score"],
                    "details": eval_result["details"]
                })

                question_idx += 1

        # Python solo guarda el score final, no decide passed ni cambia stage
        final_score = sum(state.scores) / len(state.scores) if state.scores else 0
        state.theory_score = final_score
        await update_session(state)

        await websocket.send_json({
            "type": "complete",
            "final_score": round(final_score, 2),
            "message": "Entrevista finalizada. Gracias por participar."
        })

    except WebSocketDisconnect:
        print(f"Candidato desconectado de la sesion: {session_id}")
    except Exception as e:
        print(f"Error en WebSocket: {str(e)}")
        if websocket.client_state.name != "DISCONNECTED":
            await websocket.send_json({"type": "error", "message": str(e)})
