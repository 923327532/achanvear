import json
from typing import Any, Dict, List

from langchain_core.messages import HumanMessage, SystemMessage
from shared.llm_client.llm_client import llm


SYSTEM_PROMPT = """
Eres el entrevistador practico autonomo de Achanvear.
Tu estilo es profesional, claro, conversacional y exigente.
Debes guiar la prueba por voz, permitir interrupciones, hacer preguntas de seguimiento,
evaluar razonamiento, detectar inconsistencias y pedir que el candidato explique sus decisiones.
No des la solucion completa. Da pistas breves si el candidato se bloquea.
Cuando haya workspace, usa el estado visible como evidencia: codigo, documentos, notas y alertas.
Responde en espanol latinoamericano, en frases cortas aptas para voz.
"""


def build_turn_prompt(
    transcript: List[Dict[str, str]],
    candidate_text: str,
    workspace_state: Dict[str, Any],
    challenge: Dict[str, Any],
    violations: int,
) -> str:
    recent = transcript[-8:]
    return (
        f"Reto actual:\n{json.dumps(challenge, ensure_ascii=False)[:4000]}\n\n"
        f"Estado del workspace:\n{json.dumps(workspace_state, ensure_ascii=False)[:5000]}\n\n"
        f"Violaciones antifraude acumuladas: {violations}\n\n"
        f"Conversacion reciente:\n{json.dumps(recent, ensure_ascii=False)}\n\n"
        f"El candidato acaba de decir:\n{candidate_text}\n\n"
        "Responde como entrevistador practico. Maximo 90 palabras. "
        "Termina con una pregunta o instruccion concreta."
    )


async def generate_interviewer_reply(
    transcript: List[Dict[str, str]],
    candidate_text: str,
    workspace_state: Dict[str, Any],
    challenge: Dict[str, Any],
    violations: int,
) -> str:
    prompt = build_turn_prompt(transcript, candidate_text, workspace_state, challenge, violations)
    response = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])
    return response.content.strip()


async def evaluate_practical_interview(
    transcript: List[Dict[str, str]],
    workspace_state: Dict[str, Any],
    challenge: Dict[str, Any],
    violations: int,
) -> Dict[str, Any]:
    prompt = (
        "Evalua esta entrevista practica para seleccion laboral. Devuelve SOLO JSON valido con: "
        "score entero 0-100 para la practica, communication_score entero 0-100, "
        "passed boolean, summary string, communication_summary string, strengths array, risks array, "
        "recommendation string, next_action string ('reject'|'schedule_human_meeting'|'manual_review').\n\n"
        f"Reto: {json.dumps(challenge, ensure_ascii=False)}\n"
        f"Workspace: {json.dumps(workspace_state, ensure_ascii=False)[:7000]}\n"
        f"Violaciones: {violations}\n"
        f"Transcripcion: {json.dumps(transcript, ensure_ascii=False)[:10000]}"
    )
    response = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ])
    raw = response.content.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw.removeprefix("json").strip()
    try:
        data = json.loads(raw)
    except Exception:
        data = {
            "score": 0,
            "passed": False,
            "summary": raw[:1000],
            "strengths": [],
            "risks": ["No se pudo parsear la evaluacion JSON del agente."],
            "recommendation": "Revision manual requerida.",
            "next_action": "manual_review",
        }
    score = int(data.get("score", 0))
    data["score"] = max(0, min(100, score - min(violations * 8, 40)))
    data["communication_score"] = max(0, min(100, int(data.get("communication_score", data["score"]))))
    data["communication_summary"] = data.get("communication_summary", "")
    data["passed"] = bool(data.get("passed", data["score"] >= 75)) and data["score"] >= 75
    if data["passed"] and data.get("next_action") not in {"schedule_human_meeting", "manual_review"}:
        data["next_action"] = "schedule_human_meeting"
    return data
